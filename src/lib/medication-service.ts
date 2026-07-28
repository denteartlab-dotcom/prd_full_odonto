/**
 * Camada de serviço para medicamentos.
 * A UI NÃO deve importar catálogos mock diretamente — use MedicationService.
 * A fonte atual é interna; depois pode ser trocada por API externa sem mudar a interface.
 */

import {
  DENTAL_MEDICATIONS,
  MEDICATION_CATEGORY_LABELS,
  type DentalMedication,
  type DentalMedicationCategory,
} from "@/lib/dental-medications";

export type MedicineCategoryId =
  | "antibioticos"
  | "analgesicos"
  | "anti_inflamatorios"
  | "corticoides"
  | "antissepticos"
  | "antifungicos"
  | "vitaminas"
  | "enxaguantes"
  | "pomadas"
  | "outros";

export type Medicine = {
  id: string;
  commercialName: string;
  genericName: string;
  activeIngredient: string;
  concentration: string;
  pharmaceuticalForm: string;
  category: MedicineCategoryId;
  categoryLabel: string;
  manufacturer: string;
  defaultQuantity: string;
  defaultRoute: string;
  defaultPosology: string;
  defaultDuration: string;
  notes?: string;
  controlled?: boolean;
};

export type MedicineCategory = {
  id: MedicineCategoryId;
  label: string;
};

const CATEGORY_MAP: Record<DentalMedicationCategory, MedicineCategoryId> = {
  antibiotico: "antibioticos",
  analgesico: "analgesicos",
  anti_inflamatorio: "anti_inflamatorios",
  corticoide: "corticoides",
  antisseptico: "antissepticos",
  anestesico: "pomadas",
  outros: "outros",
};

const CATEGORIES: MedicineCategory[] = [
  { id: "antibioticos", label: "Antibióticos" },
  { id: "analgesicos", label: "Analgésicos" },
  { id: "anti_inflamatorios", label: "Anti-inflamatórios" },
  { id: "corticoides", label: "Corticoides" },
  { id: "antissepticos", label: "Antissépticos" },
  { id: "antifungicos", label: "Antifúngicos" },
  { id: "vitaminas", label: "Vitaminas" },
  { id: "enxaguantes", label: "Enxaguantes" },
  { id: "pomadas", label: "Pomadas" },
  { id: "outros", label: "Outros" },
];

function parseConcentration(name: string) {
  const m = name.match(/(\d+[\d.,]*\s*(?:mg|g|ml|%)(?:\/\d+[\d.,]*\s*(?:mg|g))?)/i);
  return m?.[1] || "—";
}

function inferForm(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gel")) return "Gel";
  if (n.includes("bochecho") || n.includes("clorexidina") || n.includes("%")) return "Solução";
  if (n.includes("cápsula") || n.includes("capsula")) return "Cápsula";
  return "Comprimido";
}

function toMedicine(row: DentalMedication): Medicine {
  const category = CATEGORY_MAP[row.category] || "outros";
  const concentration = parseConcentration(row.name);
  return {
    id: row.id,
    commercialName: row.name,
    genericName: row.name.replace(/\s+\d+.*$/, "").trim(),
    activeIngredient: row.name.replace(/\s+\d+.*$/, "").trim(),
    concentration,
    pharmaceuticalForm: inferForm(row.name),
    category,
    categoryLabel:
      CATEGORIES.find((c) => c.id === category)?.label ||
      MEDICATION_CATEGORY_LABELS[row.category],
    manufacturer: "Referência odontológica",
    defaultQuantity: row.defaultDose,
    defaultRoute: category === "enxaguantes" || category === "antissepticos" ? "Bucal" : "Oral",
    defaultPosology: row.defaultFrequency,
    defaultDuration: row.defaultDuration,
    notes: row.notes,
    controlled: row.category === "antibiotico" || row.category === "corticoide",
  };
}

const CATALOG: Medicine[] = DENTAL_MEDICATIONS.map(toMedicine);

const FAVORITE_IDS = [
  "amoxicilina-500",
  "ibuprofeno-600",
  "dipirona-500",
  "clorexidina-012",
  "dexametasona-4",
];

function delay(ms = 120) {
  return new Promise((r) => setTimeout(r, ms));
}

export const MedicationService = {
  async searchMedicines(query: string): Promise<Medicine[]> {
    await delay();
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG.slice(0, 12);
    return CATALOG.filter((m) =>
      [
        m.commercialName,
        m.genericName,
        m.activeIngredient,
        m.concentration,
        m.categoryLabel,
        m.manufacturer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    ).slice(0, 20);
  },

  async getMedicine(id: string): Promise<Medicine | null> {
    await delay(60);
    return CATALOG.find((m) => m.id === id) || null;
  },

  async getCategories(): Promise<MedicineCategory[]> {
    await delay(40);
    return CATEGORIES;
  },

  async getFavorites(): Promise<Medicine[]> {
    await delay(60);
    return FAVORITE_IDS.map((id) => CATALOG.find((m) => m.id === id)).filter(
      Boolean
    ) as Medicine[];
  },

  async getRecentMedicines(): Promise<Medicine[]> {
    await delay(60);
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("odonto-med-recent");
        const ids = raw ? (JSON.parse(raw) as string[]) : [];
        const fromStore = ids
          .map((id) => CATALOG.find((m) => m.id === id))
          .filter(Boolean) as Medicine[];
        if (fromStore.length) return fromStore;
      } catch {
        /* ignore */
      }
    }
    return CATALOG.slice(0, 5);
  },

  async getByCategory(categoryId: MedicineCategoryId): Promise<Medicine[]> {
    await delay(80);
    return CATALOG.filter((m) => m.category === categoryId);
  },

  trackRecent(medicineId: string) {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("odonto-med-recent");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [medicineId, ...ids.filter((id) => id !== medicineId)].slice(0, 8);
      window.localStorage.setItem("odonto-med-recent", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  },
};

export type PrescriptionPdfPayload = {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  patientName: string;
  patientDocument?: string;
  dentistName: string;
  dentistCro?: string;
  medications: Array<{
    name: string;
    concentration: string;
    quantity: string;
    posology: string;
    duration: string;
    notes?: string;
  }>;
  observations?: string;
  issuedAt: string;
};

/** Preparado para jspdf/html2canvas — hoje abre impressão via rota existente. */
export const PrescriptionPdfService = {
  async prepare(payload: PrescriptionPdfPayload) {
    return {
      ready: true,
      provider: "native-print",
      payload,
      message: "Use a rota /api/prescricoes/:id/imprimir para PDF/impressão.",
    };
  },
};
