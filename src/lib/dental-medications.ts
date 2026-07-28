export type DentalMedicationCategory =
  | "analgesico"
  | "antibiotico"
  | "anti_inflamatorio"
  | "anestesico"
  | "antisseptico"
  | "corticoide"
  | "outros";

export type DentalMedication = {
  id: string;
  name: string;
  category: DentalMedicationCategory;
  defaultDose: string;
  defaultFrequency: string;
  defaultDuration: string;
  notes?: string;
};

/** Catálogo gratuito de uso odontológico (referência clínica — o dentista valida posologia). */
export const DENTAL_MEDICATIONS: DentalMedication[] = [
  {
    id: "dipirona-500",
    name: "Dipirona 500 mg",
    category: "analgesico",
    defaultDose: "1 comprimido",
    defaultFrequency: "de 6/6 horas",
    defaultDuration: "3 dias",
    notes: "Se dor ou febre",
  },
  {
    id: "paracetamol-750",
    name: "Paracetamol 750 mg",
    category: "analgesico",
    defaultDose: "1 comprimido",
    defaultFrequency: "de 8/8 horas",
    defaultDuration: "3 dias",
  },
  {
    id: "ibuprofeno-600",
    name: "Ibuprofeno 600 mg",
    category: "anti_inflamatorio",
    defaultDose: "1 comprimido",
    defaultFrequency: "de 8/8 horas",
    defaultDuration: "3 a 5 dias",
    notes: "Após as refeições",
  },
  {
    id: "nimesulida-100",
    name: "Nimesulida 100 mg",
    category: "anti_inflamatorio",
    defaultDose: "1 comprimido",
    defaultFrequency: "de 12/12 horas",
    defaultDuration: "5 dias",
  },
  {
    id: "amoxicilina-500",
    name: "Amoxicilina 500 mg",
    category: "antibiotico",
    defaultDose: "1 cápsula",
    defaultFrequency: "de 8/8 horas",
    defaultDuration: "7 dias",
  },
  {
    id: "amox-clav",
    name: "Amoxicilina + Clavulanato 875/125 mg",
    category: "antibiotico",
    defaultDose: "1 comprimido",
    defaultFrequency: "de 12/12 horas",
    defaultDuration: "7 dias",
  },
  {
    id: "azitromicina-500",
    name: "Azitromicina 500 mg",
    category: "antibiotico",
    defaultDose: "1 comprimido",
    defaultFrequency: "1x ao dia",
    defaultDuration: "3 dias",
  },
  {
    id: "clindamicina-300",
    name: "Clindamicina 300 mg",
    category: "antibiotico",
    defaultDose: "1 cápsula",
    defaultFrequency: "de 8/8 horas",
    defaultDuration: "7 dias",
  },
  {
    id: "dexametasona-4",
    name: "Dexametasona 4 mg",
    category: "corticoide",
    defaultDose: "1 comprimido",
    defaultFrequency: "de 8/8 horas",
    defaultDuration: "conforme orientação",
  },
  {
    id: "prednisona-20",
    name: "Prednisona 20 mg",
    category: "corticoide",
    defaultDose: "1 comprimido",
    defaultFrequency: "1x ao dia pela manhã",
    defaultDuration: "conforme orientação",
  },
  {
    id: "clorexidina-012",
    name: "Gluconato de Clorexidina 0,12%",
    category: "antisseptico",
    defaultDose: "15 ml",
    defaultFrequency: "2x ao dia",
    defaultDuration: "7 dias",
    notes: "Bochecho por 1 minuto — não engolir",
  },
  {
    id: "peroxido-hidrogenio",
    name: "Peróxido de hidrogênio 3%",
    category: "antisseptico",
    defaultDose: "diluir conforme orientação",
    defaultFrequency: "2x ao dia",
    defaultDuration: "3 dias",
  },
  {
    id: "lidocaina-topic",
    name: "Lidocaína gel 2%",
    category: "anestesico",
    defaultDose: "aplicar fino",
    defaultFrequency: "até 4x ao dia",
    defaultDuration: "conforme necessidade",
  },
  {
    id: "omeprazol-20",
    name: "Omeprazol 20 mg",
    category: "outros",
    defaultDose: "1 cápsula",
    defaultFrequency: "em jejum",
    defaultDuration: "junto ao uso de AINE",
  },
];

export const MEDICATION_CATEGORY_LABELS: Record<DentalMedicationCategory, string> = {
  analgesico: "Analgésico",
  antibiotico: "Antibiótico",
  anti_inflamatorio: "Anti-inflamatório",
  anestesico: "Anestésico",
  antisseptico: "Antisséptico",
  corticoide: "Corticoide",
  outros: "Outros",
};

export function searchDentalMedications(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return DENTAL_MEDICATIONS;
  return DENTAL_MEDICATIONS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      MEDICATION_CATEGORY_LABELS[m.category].toLowerCase().includes(q)
  );
}
