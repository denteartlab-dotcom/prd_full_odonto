/**
 * Provedor server-side de medicamentos.
 * Preferência: PharmaDB (https://api.pharmadb.com.br) quando MEDICATION_API_KEY estiver setada.
 * Fallback: catálogo odontológico interno.
 */
import {
  DENTAL_MEDICATIONS,
  MEDICATION_CATEGORY_LABELS,
  type DentalMedication,
} from "@/lib/dental-medications";
import {
  isPharmaDbConfigured,
  pharmaDbFetch,
  type PharmaDbBulasResponse,
  type PharmaDbProduto,
  type PharmaDbSearchResponse,
} from "@/lib/pharmadb-client";
import type { Medication, MedicationCategory } from "@/types/medication";

function parseConcentration(name: string) {
  const m = name.match(/(\d+[\d.,]*\s*(?:mg|g|ml|%)(?:\/\d+[\d.,]*\s*(?:mg|g))?)/i);
  return m?.[1] || "—";
}

function inferForm(name: string) {
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

/** Classes usadas como atalho de filtro na PharmaDB (classe_terapeutica). */
const PHARMADB_CATEGORIES: MedicationCategory[] = [
  { id: "analgesico", label: "Analgésicos" },
  { id: "antibiotico", label: "Antibióticos" },
  { id: "anti-inflamatorio", label: "Anti-inflamatórios" },
  { id: "corticoide", label: "Corticoides" },
  { id: "antisseptico", label: "Antissépticos" },
  { id: "antifungico", label: "Antifúngicos" },
  { id: "anestesico", label: "Anestésicos" },
  { id: "vitamina", label: "Vitaminas" },
];

const PHARMADB_MANUFACTURERS = [
  "EMS",
  "Medley",
  "Eurofarma",
  "Aché",
  "Neo Química",
  "Sanofi",
  "Pfizer",
  "Novartis",
  "Cristália",
  "Germed",
];

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

function mapPrescriptionType(
  produto: PharmaDbProduto
): Medication["prescriptionType"] {
  const tarja = (produto.tarja || "").toLowerCase();
  if (produto.controlado || tarja.includes("preta") || tarja.includes("vermelha")) {
    return "controle_especial";
  }
  if (tarja.includes("sem_tarja") || tarja.includes("livre")) {
    return "simples";
  }
  return "simples";
}

function extractDosageForm(produto: PharmaDbProduto) {
  const desc = produto.apresentacoes?.[0]?.descricao || "";
  const beforeDash = desc.split(" - ")[0]?.trim();
  if (beforeDash) return beforeDash;
  return "—";
}

function extractConcentration(produto: PharmaDbProduto) {
  const comps = produto.composicao || [];
  if (comps.length) {
    return comps
      .map((c) => {
        if (c.concentracao) return c.concentracao;
        if (c.concentracao_valor != null) {
          return `${c.concentracao_valor}${c.concentracao_unidade || ""}`.trim();
        }
        return "";
      })
      .filter(Boolean)
      .join(" + ");
  }
  return "—";
}

function extractActiveIngredient(produto: PharmaDbProduto) {
  if (produto.principios_ativos?.length) {
    return produto.principios_ativos.join(", ");
  }
  if (produto.composicao?.length) {
    return produto.composicao
      .map((c) => c.nome_dcb)
      .filter(Boolean)
      .join(", ");
  }
  return produto.nome || "—";
}

export function fromPharmaDbProduto(produto: PharmaDbProduto): Medication {
  const name = produto.nome || "Medicamento";
  const active = extractActiveIngredient(produto);
  const concentration = extractConcentration(produto);
  const dosageForm = extractDosageForm(produto);
  const presentation = produto.apresentacoes?.[0]?.descricao || dosageForm;

  return {
    id: String(produto.id),
    name,
    genericName: produto.categoria_regulatoria || active.split(",")[0]?.trim() || name,
    activeIngredient: active,
    concentration,
    presentation,
    dosageForm,
    manufacturer: produto.laboratorio || "—",
    category:
      produto.classe_terapeutica ||
      produto.categoria_regulatoria ||
      produto.categoria ||
      "Medicamento",
    route: "Oral",
    prescriptionType: mapPrescriptionType(produto),
    controlled: Boolean(produto.controlado),
    anvisaCode: produto.registro_anvisa || "",
    leafletUrl: "",
  };
}

function isEan(query: string) {
  return /^\d{13}$/.test(query.trim());
}

function isAnvisaLike(query: string) {
  return /^\d{8,15}$/.test(query.trim());
}

async function searchPharmaDb(query: string): Promise<Medication[]> {
  const q = query.trim();
  const byId = new Map<string, Medication>();

  const add = (produto: PharmaDbProduto) => {
    const med = fromPharmaDbProduto(produto);
    byId.set(med.id, med);
  };

  // EAN-13 → lookup direto
  if (isEan(q)) {
    const produto = await pharmaDbFetch<PharmaDbProduto>(
      `/v1/produtos/ean/${encodeURIComponent(q)}`
    );
    if (produto?.id != null) add(produto);
    return [...byId.values()];
  }

  // PharmaDB exige q com mínimo 3 caracteres
  if (q.length < 3) return [];

  const params: Record<string, string | number | boolean> = {
    q,
    page: 1,
    per_page: 30,
  };

  // Atalhos inteligentes: fabricante / categoria / ANVISA
  const lower = q.toLowerCase();
  const knownLab = PHARMADB_MANUFACTURERS.find((lab) =>
    lower.includes(lab.toLowerCase())
  );
  if (knownLab && q.split(/\s+/).length >= 2) {
    params.laboratorio = knownLab;
  }

  const knownCat = PHARMADB_CATEGORIES.find(
    (c) => lower === c.label.toLowerCase() || lower === c.id
  );
  if (knownCat) {
    params.classe_terapeutica = knownCat.id;
  }

  const search = await pharmaDbFetch<PharmaDbSearchResponse>("/v1/produtos/busca", params);
  (search.items || []).forEach(add);

  // Registro ANVISA numérico: filtra localmente se a busca trouxe candidatos
  if (isAnvisaLike(q)) {
    const exact = [...byId.values()].filter((m) => m.anvisaCode.includes(q));
    if (exact.length) return exact;
  }

  // Busca complementar por princípio ativo (DCB)
  try {
    const paSearch = await pharmaDbFetch<PharmaDbSearchResponse>(
      "/v1/principios-ativos/busca",
      { q, page: 1, per_page: 10 }
    );
    // Se a API de PAs retornar produtos embutidos, normaliza; senão ignora.
    for (const item of paSearch.items || []) {
      if ((item as PharmaDbProduto).nome || (item as PharmaDbProduto).laboratorio) {
        add(item as PharmaDbProduto);
      }
    }
  } catch {
    /* endpoint de PA é complementar */
  }

  return [...byId.values()].slice(0, 40);
}

export async function providerSearchMedicines(query: string) {
  const q = query.trim();

  if (isPharmaDbConfigured()) {
    try {
      if (!q) {
        return {
          items: FALLBACK_CATALOG.slice(0, 12),
          source: "fallback" as const,
          query: q,
        };
      }

      // Digitação curta: fallback odontológico (PharmaDB exige min. 3 caracteres)
      if (q.length < 3) {
        const needle = q.toLowerCase();
        return {
          items: FALLBACK_CATALOG.filter((m) => matchesQuery(m, needle)).slice(0, 12),
          source: "fallback" as const,
          query: q,
        };
      }

      const items = await searchPharmaDb(q);
      return { items, source: "external" as const, query: q };
    } catch (err) {
      console.error("[PharmaDB search]", err);
      throw err;
    }
  }

  const needle = q.toLowerCase();
  const items = !needle
    ? FALLBACK_CATALOG.slice(0, 12)
    : FALLBACK_CATALOG.filter((m) => matchesQuery(m, needle)).slice(0, 30);

  return { items, source: "fallback" as const, query: q };
}

export async function providerGetMedicineById(id: string) {
  if (isPharmaDbConfigured() && /^\d+$/.test(id)) {
    try {
      const produto = await pharmaDbFetch<PharmaDbProduto>(
        `/v1/produtos/${encodeURIComponent(id)}`
      );
      const med = fromPharmaDbProduto(produto);
      const leaflet = await providerGetMedicineLeaflet(id).catch(() => null);
      return { ...med, leafletUrl: leaflet || "" };
    } catch (err) {
      console.error("[PharmaDB getById]", err);
      throw err;
    }
  }

  const found = FALLBACK_CATALOG.find((m) => m.id === id);
  if (!found) throw new Error("Medicamento não encontrado.");
  return found;
}

export async function providerGetMedicineLeaflet(id: string): Promise<string | null> {
  if (!isPharmaDbConfigured()) return null;

  try {
    const data = await pharmaDbFetch<PharmaDbBulasResponse>(
      `/v1/bulas/produto/${encodeURIComponent(id)}`
    );
    const first = data.items?.[0];
    if (!first) return null;

    // Link público do Bulário ANVISA (a bula completa autenticada fica na PharmaDB)
    const nome = first.produto_nome || "";
    if (nome) {
      return `https://consultas.anvisa.gov.br/#/bulario/?q=${encodeURIComponent(nome)}`;
    }
    return `https://consultas.anvisa.gov.br/#/bulario/`;
  } catch {
    return null;
  }
}

export async function providerGetCategories() {
  if (isPharmaDbConfigured()) return PHARMADB_CATEGORIES;
  return FALLBACK_CATEGORIES;
}

export async function providerGetManufacturers() {
  if (isPharmaDbConfigured()) return PHARMADB_MANUFACTURERS;
  return [...new Set(FALLBACK_CATALOG.map((m) => m.manufacturer))];
}
