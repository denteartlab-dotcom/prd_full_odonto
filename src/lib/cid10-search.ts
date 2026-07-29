import { prisma } from "@/lib/db";
import { searchDentalCids, type DentalCid } from "@/lib/certificate-types";
import { normalizeCidDescription } from "@/lib/portuguese-text";

const NIH_API =
  "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&df=code,name";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toCidItem(code: string, description: string): DentalCid {
  return {
    code: code.toUpperCase(),
    description: normalizeCidDescription(description),
  };
}

/** Busca na API gratuita do NIH Clinical Tables (sem chave). */
export async function searchCidFromNih(
  query: string,
  limit = 12
): Promise<DentalCid[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `${NIH_API}&terms=${encodeURIComponent(q)}&maxList=${limit}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data) || data.length < 4) return [];
  const rows = data[3] as Array<[string, string]> | undefined;
  if (!Array.isArray(rows)) return [];
  return rows
    .map(([code, name]) => toCidItem(String(code || ""), String(name || "")))
    .filter((r) => r.code && r.description);
}

/** Cacheia resultados externos no banco local (não sobrescreve existentes). */
export async function cacheCidResults(items: DentalCid[], source: string) {
  if (!items.length) return;
  await prisma.cid10.createMany({
    data: items.map((item) => ({
      code: item.code.toUpperCase(),
      description: normalizeCidDescription(item.description),
      source,
    })),
    skipDuplicates: true,
  });
}

export async function searchCidInDatabase(
  query: string,
  limit = 12
): Promise<DentalCid[]> {
  const q = query.trim();
  if (!q) {
    const rows = await prisma.cid10.findMany({
      where: { code: { startsWith: "K" } },
      take: limit,
      orderBy: { code: "asc" },
    });
    return rows.map((r) => toCidItem(r.code, r.description));
  }

  const compact = q.replace(/\s+/g, "").toUpperCase();
  const rows = await prisma.cid10.findMany({
    where: {
      OR: [
        { code: { contains: compact, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit * 3,
    orderBy: { code: "asc" },
  });

  const nq = normalize(q);
  const ranked = rows
    .map((r) => {
      const item = toCidItem(r.code, r.description);
      const code = item.code;
      const desc = normalize(item.description);
      let score = 0;
      if (code === compact) score += 100;
      else if (code.startsWith(compact)) score += 80;
      else if (code.includes(compact)) score += 50;
      if (desc.startsWith(nq)) score += 40;
      else if (desc.includes(nq)) score += 20;
      if (r.source === "odonto") score += 10;
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))
    .slice(0, limit)
    .map(({ code, description }) => ({ code, description }));

  return ranked;
}

/**
 * Busca CID: banco local (DATASUS) → catálogo odonto → API gratuita NIH.
 * Resultados externos são salvos no banco para próximas buscas.
 */
export async function searchCidCodes(
  query: string,
  limit = 12
): Promise<{ items: DentalCid[]; source: string }> {
  const local = await searchCidInDatabase(query, limit);
  if (local.length >= Math.min(5, limit)) {
    return { items: local, source: "database" };
  }

  const dental = searchDentalCids(query, limit).map((item) =>
    toCidItem(item.code, item.description)
  );
  const merged = new Map<string, DentalCid>();
  for (const item of [...local, ...dental]) {
    merged.set(item.code.toUpperCase(), item);
  }

  if (merged.size < Math.min(5, limit)) {
    try {
      const remote = await searchCidFromNih(query, limit);
      for (const item of remote) {
        if (!merged.has(item.code.toUpperCase())) {
          merged.set(item.code.toUpperCase(), item);
        }
      }
      void cacheCidResults(remote, "nih");
      const items = Array.from(merged.values()).slice(0, limit);
      return {
        items,
        source: local.length || dental.length ? "mixed" : "nih",
      };
    } catch {
      /* keep local */
    }
  }

  return {
    items: Array.from(merged.values()).slice(0, limit),
    source: local.length ? "database" : "local",
  };
}

export async function countCidInDatabase() {
  return prisma.cid10.count();
}
