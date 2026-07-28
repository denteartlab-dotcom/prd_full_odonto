/**
 * Provedor server-side de medicamentos.
 * Preferência: Bulapi (gratuita, sem autenticação).
 * Fallback: catálogo odontológico interno.
 */
import {
  DENTAL_MEDICATIONS,
  MEDICATION_CATEGORY_LABELS,
  type DentalMedication,
} from "@/lib/dental-medications";
import {
  bulapiGetByIdRaw,
  bulapiSearchRaw,
  isBulapiEnabled,
} from "@/lib/bulapi-client";
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

const BULAPI_CATEGORIES: MedicationCategory[] = [
  { id: "analgesico", label: "Analgésicos" },
  { id: "antibiotico", label: "Antibióticos" },
  { id: "anti-inflamatorio", label: "Anti-inflamatórios" },
  { id: "corticoide", label: "Corticoides" },
  { id: "antisseptico", label: "Antissépticos" },
  { id: "antifungico", label: "Antifúngicos" },
  { id: "anestesico", label: "Anestésicos" },
  { id: "vitamina", label: "Vitaminas" },
];

const BULAPI_MANUFACTURERS = [
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function str(obj: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function bool(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.toLowerCase();
      if (["true", "1", "sim", "yes"].includes(v)) return true;
      if (["false", "0", "nao", "não", "no"].includes(v)) return false;
    }
  }
  return false;
}

function extractList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
  }
  const obj = asRecord(payload);
  if (!obj) return [];

  for (const key of ["items", "data", "results", "resultados", "produtos", "apresentacoes"]) {
    const value = obj[key];
    if (Array.isArray(value)) {
      return value.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
    }
  }

  // Objeto único
  if (obj.id != null || obj.nome || obj.name) return [obj];
  return [];
}

function activeFromRaw(raw: Record<string, unknown>) {
  const direct = str(raw, [
    "principio_ativo",
    "principioAtivo",
    "activeIngredient",
    "substancia",
    "substância",
    "substance",
  ]);
  if (direct) return direct;

  const lista = raw.principios_ativos || raw.substancias || raw.composicao;
  if (Array.isArray(lista)) {
    return lista
      .map((item) => {
        if (typeof item === "string") return item;
        const rec = asRecord(item);
        if (!rec) return "";
        return str(rec, ["nome", "nome_dcb", "substancia", "principio_ativo"]);
      })
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

export function fromBulapiItem(raw: Record<string, unknown>, index = 0): Medication {
  const name =
    str(raw, ["nome", "name", "produto", "nome_comercial", "commercialName"]) ||
    `Medicamento ${index + 1}`;
  const active = activeFromRaw(raw) || name;
  const concentration = str(raw, [
    "concentracao",
    "concentração",
    "concentration",
    "dosagem",
  ]) || parseConcentration(name);
  const dosageForm = str(raw, [
    "forma_farmaceutica",
    "formaFarmaceutica",
    "dosageForm",
    "tipo",
    "forma",
  ]) || inferForm(name);
  const presentation = str(raw, [
    "apresentacao",
    "apresentação",
    "presentation",
    "descricao",
  ]) || `${dosageForm} — ${concentration}`;
  const manufacturer = str(raw, [
    "laboratorio",
    "laboratório",
    "fabricante",
    "manufacturer",
    "empresa",
  ]);
  const category = str(raw, [
    "classe_terapeutica",
    "classeTerapeutica",
    "categoria",
    "category",
    "classificacao",
  ]) || "Medicamento";
  const anvisaCode = str(raw, [
    "registro_anvisa",
    "registroAnvisa",
    "registro",
    "anvisaCode",
    "codigo_anvisa",
  ]);
  const controlled = bool(raw, ["controlado", "controlled"]) ||
    /preta|vermelha|controlad/i.test(str(raw, ["tarja"]));

  return {
    id: str(raw, ["id", "produto_id", "apresentacao_id", "registro_anvisa", "registro"], "") ||
      `bulapi-${index}-${name}`,
    name,
    genericName: str(raw, ["nome_generico", "genericName", "categoria_regulatoria"]) || active,
    activeIngredient: active,
    concentration,
    presentation,
    dosageForm,
    manufacturer: manufacturer || "—",
    category,
    route: str(raw, ["via", "route"], "Oral") || "Oral",
    prescriptionType: controlled ? "controle_especial" : "simples",
    controlled,
    anvisaCode,
    leafletUrl: str(raw, ["bula_url", "leafletUrl", "bula"]) ||
      (name
        ? `https://consultas.anvisa.gov.br/#/bulario/?q=${encodeURIComponent(name)}`
        : ""),
  };
}

async function searchBulapi(query: string): Promise<Medication[]> {
  const payload = await bulapiSearchRaw(query);
  return extractList(payload)
    .map((item, i) => fromBulapiItem(item, i))
    .slice(0, 40);
}

export async function providerSearchMedicines(query: string) {
  const q = query.trim();

  if (isBulapiEnabled() && q.length >= 2) {
    try {
      const items = await searchBulapi(q);
      return { items, source: "external" as const, query: q };
    } catch (err) {
      console.warn("[Bulapi search] fallback odontológico:", err);
      // Soft-fallback: Bulapi costuma ficar intermitente (tunnel Cloudflare).
    }
  }

  const needle = q.toLowerCase();
  const items = !needle
    ? FALLBACK_CATALOG.slice(0, 12)
    : FALLBACK_CATALOG.filter((m) => matchesQuery(m, needle)).slice(0, 30);

  return { items, source: "fallback" as const, query: q };
}

export async function providerGetMedicineById(id: string) {
  if (isBulapiEnabled()) {
    try {
      const payload = await bulapiGetByIdRaw(id);
      const list = extractList(payload);
      if (list[0]) return fromBulapiItem(list[0]);
    } catch (err) {
      console.warn("[Bulapi getById] fallback:", err);
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
  if (isBulapiEnabled()) return BULAPI_CATEGORIES;
  return FALLBACK_CATEGORIES;
}

export async function providerGetManufacturers() {
  if (isBulapiEnabled()) return BULAPI_MANUFACTURERS;
  return [...new Set(FALLBACK_CATALOG.map((m) => m.manufacturer))];
}
