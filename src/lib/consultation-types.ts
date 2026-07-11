export type ConsultationStatus =
  | "agendada"
  | "confirmada"
  | "realizada"
  | "cancelada"
  | "faltou";

export type PatientConsultation = {
  id: string;
  date: string;
  time: string;
  procedure: string;
  professional: string;
  status: ConsultationStatus;
  notes?: string;
  value?: number;
  documents?: { id: string; name: string }[];
};

export const CONSULTATION_STATUS_LABELS: Record<ConsultationStatus, string> = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  faltou: "Faltou",
};

export function isUpcoming(status: ConsultationStatus) {
  return status === "agendada" || status === "confirmada";
}

export function isPast(status: ConsultationStatus) {
  return status === "realizada" || status === "cancelada" || status === "faltou";
}
