/**
 * Provedor server-side de medicamentos.
 * Preferência: medicamentos.api.br (Free, X-API-Key).
 * Fallback: catálogo odontológico interno (com posologia).
 */
import {
  DENTAL_MEDICATIONS,
  MEDICATION_CATEGORY_LABELS,
  type DentalMedication,
} from "@/lib/dental-medications";
import {
  isMedicamentosApiConfigured,
  medicamentosApiGetByEan,
  medicamentosApiGetByRegistro,
  medicamentosApiSearch,
  type MedicamentosApiItem,
} from "@/lib/medicamentos-api-br";
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
  if (n.includes("xarope")) return "Xarope";
  if (n.includes("comprimido")) return "Comprimido";
  return "Comprimido";
}

function humanizeSlug(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

const API_CATEGORIES: MedicationCategory[] = [
  { id: "analgesico", label: "Analgésicos" },
  { id: "antibiotico", label: "Antibióticos" },
  { id: "anti-inflamatorio", label: "Anti-inflamatórios" },
  { id: "corticoide", label: "Corticoides" },
  { id: "antisseptico", label: "Antissépticos" },
  { id: "antifungico", label: "Antifúngicos" },
  { id: "anestesico", label: "Anestésicos" },
  { id: "vitamina", label: "Vitaminas" },
];

const API_MANUFACTURERS = [
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

function mapClassLabel(classe?: string) {
  if (!classe) return "Medicamento";
  const known = API_CATEGORIES.find(
    (c) => c.id === classe.toLowerCase() || c.label.toLowerCase() === classe.toLowerCase()
  );
  return known?.label || humanizeSlug(classe);
}

export function fromMedicamentosApiItem(item: MedicamentosApiItem): Medication {
  const name = item.nome || "Medicamento";
  const active = item.principioAtivo
    ? humanizeSlug(item.principioAtivo)
    : name;
  const dosageForm = item.tipo ? humanizeSlug(item.tipo) : inferForm(name);
  const concentration = parseConcentration(name);
  const manufacturer = item.fabricante
    ? humanizeSlug(item.fabricante)
    : "—";
  const anvisaCode = item.registro || "";
  const category = mapClassLabel(item.classe) || humanizeSlug(item.categoria || "");
  const controlled = /antibiot|corticoid|controlad/i.test(
    `${item.classe || ""} ${item.categoria || ""} ${name}`
  );

  return {
    id: anvisaCode || item.slug || name,
    name,
    genericName: humanizeSlug(item.categoria || "") || active,
    activeIngredient: active,
    concentration,
    presentation: `${dosageForm}${concentration !== "—" ? ` — ${concentration}` : ""}`,
    dosageForm,
    manufacturer,
    category: category || "Medicamento",
    route: /bucal|topico|t[oó]pico|gel|enxagu/i.test(dosageForm) ? "Bucal" : "Oral",
    prescriptionType: controlled ? "controle_especial" : "simples",
    controlled,
    anvisaCode,
    leafletUrl: item.slug
      ? `https://medicamentos.api.br/medicamento/${item.slug}/`
      : anvisaCode
        ? `https://consultas.anvisa.gov.br/#/bulario/?q=${encodeURIComponent(name)}`
        : "",
  };
}

function isEan(query: string) {
  return /^\d{13}$/.test(query.trim());
}

function isRegistro(query: string) {
  return /^\d{8,15}$/.test(query.trim());
}

async function searchMedicamentosApi(query: string): Promise<Medication[]> {
  const q = query.trim();
  const byId = new Map<string, Medication>();

  const addAll = (items?: MedicamentosApiItem[]) => {
    for (const item of items || []) {
      const med = fromMedicamentosApiItem(item);
      byId.set(med.id, med);
    }
  };

  if (isEan(q)) {
    const data = await medicamentosApiGetByEan(q);
    addAll(data.resultados);
    return [...byId.values()];
  }

  if (isRegistro(q)) {
    const data = await medicamentosApiGetByRegistro(q);
    addAll(data.resultados);
    if (byId.size) return [...byId.values()];
  }

  const data = await medicamentosApiSearch(q, 1);
  addAll(data.resultados);
  return [...byId.values()];
}

export async function providerSearchMedicines(query: string) {
  const q = query.trim();

  if (isMedicamentosApiConfigured() && q.length >= 2) {
    try {
      const items = await searchMedicamentosApi(q);
      return { items, source: "external" as const, query: q };
    } catch (err) {
      console.error("[medicamentos.api.br search]", err);
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
  if (isMedicamentosApiConfigured() && /^\d+$/.test(id)) {
    try {
      const data = await medicamentosApiGetByRegistro(id);
      const first = data.resultados?.[0];
      if (first) return fromMedicamentosApiItem(first);
    } catch (err) {
      console.error("[medicamentos.api.br getById]", err);
      throw err;
    }
  }

  const found = FALLBACK_CATALOG.find((m) => m.id === id);
  if (!found) throw new Error("Medicamento não encontrado.");
  return found;
}

export async function providerGetMedicineLeaflet(id: string): Promise<string | null> {
  try {
    const med = await providerGetMedicineById(id);
    return med.leafletUrl || null;
  } catch {
    return null;
  }
}

export async function providerGetCategories() {
  if (isMedicamentosApiConfigured()) return API_CATEGORIES;
  return FALLBACK_CATEGORIES;
}

export async function providerGetManufacturers() {
  if (isMedicamentosApiConfigured()) return API_MANUFACTURERS;
  return [...new Set(FALLBACK_CATALOG.map((m) => m.manufacturer))];
}
