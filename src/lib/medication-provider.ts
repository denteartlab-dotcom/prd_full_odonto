/**
 * Provedor server-side de medicamentos.
 * - Se MEDICATION_API_URL estiver configurada, consulta a API externa (com API key no servidor).
 * - Caso contrário, usa catálogo odontológico interno como fallback.
 */
import {
  DENTAL_MEDICATIONS,
  MEDICATION_CATEGORY_LABELS,
  type DentalMedication,
} from "@/lib/dental-medications";
import type { Medication, MedicationCategory } from "@/types/medication";

function parseConcentration(name: string) {
  const m = name.match(/(\d+[\d.,]*\s*(?:mg|g|ml|%)(?:\/\d+[\d.,]*\s*(?:mg|g))?)/i);
  return m?.[1] || "—";
}

function inferForm(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gel")) return "Gel";
  if (n.includes("clorexidina") || n.includes("%") || n.includes("peróxido")) return "Solução";
  if (n.includes("cápsula") || n.includes("capsula")) return "Cápsula";
  return "Comprimido";
}

function fromDental(row: DentalMedication): Medication {
  const base = row.name.replace(/\s+\d+.*$/, "").trim();
  const controlled = row.category === "antibiotico" || row.category === "corticoide";
  return {
    id: row.id,
    name: row.name,
    genericName: base,
    activeIngredient: base,
    concentration: parseConcentration(row.name),
    presentation: `${inferForm(row.name)} — ${parseConcentration(row.name)}`,
    dosageForm: inferForm(row.name),
    manufacturer: "Referência odontológica",
    category: MEDICATION_CATEGORY_LABELS[row.category],
    route: row.category === "antisseptico" ? "Bucal" : "Oral",
    prescriptionType: controlled ? "controle_especial" : "simples",
    controlled,
    anvisaCode: "",
    leafletUrl: "",
  };
}

const FALLBACK_CATALOG: Medication[] = DENTAL_MEDICATIONS.map(fromDental);

const FALLBACK_CATEGORIES: MedicationCategory[] = Object.entries(
  MEDICATION_CATEGORY_LABELS
).map(([id, label]) => ({ id, label }));

function matchesQuery(m: Medication, q: string) {
  const hay = [
    m.name,
    m.genericName,
    m.activeIngredient,
    m.manufacturer,
    m.category,
    m.anvisaCode,
    m.concentration,
    m.dosageForm,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function normalizeExternalItem(raw: Record<string, unknown>, index: number): Medication {
  const str = (k: string, fallback = "") =>
    typeof raw[k] === "string" ? (raw[k] as string) : fallback;
  const bool = (k: string) => Boolean(raw[k]);

  const name = str("name") || str("nome") || str("commercialName") || `Medicamento ${index + 1}`;
  return {
    id: str("id") || str("anvisaCode") || str("codigo") || `ext-${index}-${name}`,
    name,
    genericName: str("genericName") || str("nomeGenerico") || name,
    activeIngredient: str("activeIngredient") || str("principioAtivo") || name,
    concentration: str("concentration") || str("concentracao") || "—",
    presentation: str("presentation") || str("apresentacao") || str("dosageForm") || "—",
    dosageForm: str("dosageForm") || str("formaFarmaceutica") || str("form") || "—",
    manufacturer: str("manufacturer") || str("fabricante") || "—",
    category: str("category") || str("categoria") || "Outros",
    route: str("route") || str("via") || "Oral",
    prescriptionType: (str("prescriptionType") as Medication["prescriptionType"]) || "simples",
    controlled: bool("controlled") || bool("controlado"),
    anvisaCode: str("anvisaCode") || str("codigoAnvisa") || "",
    leafletUrl: str("leafletUrl") || str("bulaUrl") || "",
  };
}

async function fetchExternal(path: string, searchParams?: Record<string, string>) {
  const base = process.env.MEDICATION_API_URL?.replace(/\/$/, "");
  const key = process.env.MEDICATION_API_KEY || "";
  if (!base) return null;

  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      ...(key ? { Authorization: `Bearer ${key}`, "X-API-Key": key } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API externa de medicamentos indisponível (${res.status}).`);
  }

  return (await res.json()) as unknown;
}

export async function providerSearchMedicines(query: string) {
  const q = query.trim();

  try {
    const external = await fetchExternal("/medications/search", { q });
    if (external) {
      const list = Array.isArray(external)
        ? external
        : Array.isArray((external as { items?: unknown[] }).items)
          ? (external as { items: unknown[] }).items
          : Array.isArray((external as { data?: unknown[] }).data)
            ? (external as { data: unknown[] }).data
            : [];
      const items = list
        .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
        .map((item, i) => normalizeExternalItem(item, i));
      return { items, source: "external" as const, query: q };
    }
  } catch (err) {
    if (process.env.MEDICATION_API_URL) throw err;
  }

  const needle = q.toLowerCase();
  const items = !needle
    ? FALLBACK_CATALOG.slice(0, 12)
    : FALLBACK_CATALOG.filter((m) => matchesQuery(m, needle)).slice(0, 30);

  return { items, source: "fallback" as const, query: q };
}

export async function providerGetMedicineById(id: string) {
  try {
    const external = await fetchExternal(`/medications/${encodeURIComponent(id)}`);
    if (external && typeof external === "object") {
      const raw =
        (external as { item?: Record<string, unknown> }).item ||
        (external as { data?: Record<string, unknown> }).data ||
        (external as Record<string, unknown>);
      return normalizeExternalItem(raw, 0);
    }
  } catch (err) {
    if (process.env.MEDICATION_API_URL) throw err;
  }

  const found = FALLBACK_CATALOG.find((m) => m.id === id);
  if (!found) throw new Error("Medicamento não encontrado.");
  return found;
}

export async function providerGetCategories() {
  try {
    const external = await fetchExternal("/medications/categories");
    if (external) {
      const list = Array.isArray(external)
        ? external
        : Array.isArray((external as { items?: unknown[] }).items)
          ? (external as { items: unknown[] }).items
          : [];
      return list
        .map((item, i) => {
          if (typeof item === "string") return { id: item, label: item };
          if (item && typeof item === "object") {
            const o = item as Record<string, unknown>;
            return {
              id: String(o.id || o.slug || i),
              label: String(o.label || o.name || o.nome || o.id || i),
            };
          }
          return null;
        })
        .filter(Boolean) as MedicationCategory[];
    }
  } catch (err) {
    if (process.env.MEDICATION_API_URL) throw err;
  }
  return FALLBACK_CATEGORIES;
}

export async function providerGetManufacturers() {
  try {
    const external = await fetchExternal("/medications/manufacturers");
    if (external) {
      const list = Array.isArray(external)
        ? external
        : Array.isArray((external as { items?: unknown[] }).items)
          ? (external as { items: unknown[] }).items
          : [];
      return list.map(String).filter(Boolean);
    }
  } catch (err) {
    if (process.env.MEDICATION_API_URL) throw err;
  }
  return [...new Set(FALLBACK_CATALOG.map((m) => m.manufacturer))];
}
