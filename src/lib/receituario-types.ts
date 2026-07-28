import type { Medicine, MedicineCategoryId } from "@/lib/medication-service";

export type ReceituarioLine = {
  id: string;
  medicineId: string;
  name: string;
  concentration: string;
  quantity: string;
  pharmaceuticalForm: string;
  route: string;
  posology: string;
  duration: string;
  notes: string;
  controlled?: boolean;
};

export type ReceituarioAlert = {
  id: string;
  severity: "info" | "warning" | "danger";
  title: string;
  detail: string;
};

export type ReceituarioTemplate = {
  id: string;
  name: string;
  description: string;
  medicineIds: string[];
  generalNotes?: string;
};

export type ReceituarioDraft = {
  lines: ReceituarioLine[];
  generalNotes: string;
  professionalId: string;
  status: "rascunho" | "emitida";
};

export function medicineToLine(m: Medicine): ReceituarioLine {
  return {
    id: `line-${m.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    medicineId: m.id,
    name: m.commercialName,
    concentration: m.concentration,
    quantity: m.defaultQuantity,
    pharmaceuticalForm: m.pharmaceuticalForm,
    route: m.defaultRoute,
    posology: m.defaultPosology,
    duration: m.defaultDuration,
    notes: m.notes || "",
    controlled: m.controlled,
  };
}

export const RECEITUARIO_TEMPLATES: ReceituarioTemplate[] = [
  {
    id: "extracao",
    name: "Extração",
    description: "Analgesia e anti-inflamatório pós-exodontia",
    medicineIds: ["ibuprofeno-600", "dipirona-500"],
    generalNotes: "Retornar em caso de sangramento persistente ou edema importante.",
  },
  {
    id: "implante",
    name: "Implante",
    description: "Protocolo antibiótico e anti-inflamatório",
    medicineIds: ["amox-clav", "ibuprofeno-600", "dexametasona-4"],
    generalNotes: "Manter higiene rigorosa na área operada.",
  },
  {
    id: "canal",
    name: "Canal",
    description: "Analgesia endodôntica",
    medicineIds: ["ibuprofeno-600", "dipirona-500"],
  },
  {
    id: "protese",
    name: "Prótese",
    description: "Conforto e higiene sob prótese",
    medicineIds: ["clorexidina-012", "dipirona-500"],
  },
  {
    id: "periodontia",
    name: "Periodontia",
    description: "Antisséptico e analgesia",
    medicineIds: ["clorexidina-012", "nimesulida-100"],
  },
  {
    id: "clareamento",
    name: "Clareamento",
    description: "Sensibilidade pós-clareamento",
    medicineIds: ["dipirona-500"],
    generalNotes: "Evitar alimentos pigmentados por 48h.",
  },
  {
    id: "urgencia",
    name: "Urgência",
    description: "Alívio rápido de dor",
    medicineIds: ["dipirona-500", "ibuprofeno-600"],
  },
  {
    id: "infeccao",
    name: "Infecção",
    description: "Antibiótico + anti-inflamatório",
    medicineIds: ["amoxicilina-500", "ibuprofeno-600"],
  },
  {
    id: "pos-operatorio",
    name: "Pós-operatório",
    description: "Padrão pós-cirúrgico odontológico",
    medicineIds: ["amoxicilina-500", "ibuprofeno-600", "clorexidina-012"],
    generalNotes: "Compressa fria nas primeiras 24h. Dieta pastosa e fria.",
  },
];

export function buildReceituarioAlerts(input: {
  lines: ReceituarioLine[];
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): ReceituarioAlert[] {
  const alerts: ReceituarioAlert[] = [];
  const allergies = (input.allergies || "").toLowerCase();
  const diseases = (input.diseases || "").toLowerCase();

  if (allergies && !/nenhuma|não|nao/.test(allergies)) {
    alerts.push({
      id: "alergia",
      severity: "danger",
      title: "Paciente alérgico",
      detail: input.allergies || "",
    });
  }

  if (input.lines.some((l) => l.controlled)) {
    alerts.push({
      id: "controlado",
      severity: "warning",
      title: "Medicamento controlado",
      detail: "Há itens que podem exigir receituário especial. Valide a legislação local.",
    });
  }

  if (/gestante|grávida|gravida/.test(diseases + " " + (input.medicationsInUse || ""))) {
    alerts.push({
      id: "gestante",
      severity: "warning",
      title: "Uso em gestantes",
      detail: "Revise a segurança de cada medicamento na gestação.",
    });
  }

  if (/diabet/.test(diseases)) {
    alerts.push({
      id: "diabetes",
      severity: "info",
      title: "Paciente diabético",
      detail: "Atenção a interações e cicatrização.",
    });
  }

  if (/hipertens/.test(diseases)) {
    alerts.push({
      id: "hipertensao",
      severity: "info",
      title: "Paciente hipertenso",
      detail: "Evite vasoconstritores em excesso e monitore a PA.",
    });
  }

  if (/anticoag|warfar|aas|aspirina/.test((input.medicationsInUse || "").toLowerCase())) {
    alerts.push({
      id: "anticoag",
      severity: "danger",
      title: "Anticoagulantes",
      detail: "Risco hemorrágico aumentado — avalie conduta cirúrgica.",
    });
  }

  // Estrutura pronta para: interação medicamentosa, dose acima, pediátrico, idosos
  return alerts;
}

export type { MedicineCategoryId };
