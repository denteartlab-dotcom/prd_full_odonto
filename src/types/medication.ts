export type Medication = {
  id: string;
  name: string;
  genericName: string;
  activeIngredient: string;
  concentration: string;
  presentation: string;
  dosageForm: string;
  manufacturer: string;
  category: string;
  route: string;
  prescriptionType: "simples" | "controle_especial" | "antimicrobiano" | "outros";
  controlled: boolean;
  anvisaCode: string;
  leafletUrl: string;
};

export type MedicationCategory = {
  id: string;
  label: string;
};

export type MedicationSearchResult = {
  items: Medication[];
  source: "external" | "fallback";
  query: string;
};
