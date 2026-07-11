import type { PatientAppointment } from "./patient-profile-types";
import type { ConsultationStatus, PatientConsultation } from "./consultation-types";
import { isPast, isUpcoming } from "./consultation-types";

export const PROFESSIONALS = [
  "Dra. Ana Silva",
  "Dr. Carlos Mendes",
  "Dra. Fernanda Costa",
];

function legacyStatus(s: PatientAppointment["status"]): ConsultationStatus {
  const map: Record<PatientAppointment["status"], ConsultationStatus> = {
    confirmado: "confirmada",
    aguardando: "agendada",
    realizado: "realizada",
    cancelado: "cancelada",
  };
  return map[s];
}

export function appointmentToConsultation(a: PatientAppointment): PatientConsultation {
  return {
    id: a.id,
    date: a.date,
    time: a.time,
    procedure: a.procedure,
    professional: a.professional,
    status: legacyStatus(a.status),
  };
}

export function createDefaultConsultations(seed: number): PatientConsultation[] {
  const base: PatientConsultation[] = [
    {
      id: `con-u1-${seed}`,
      date: "2026-07-10",
      time: "14:00",
      procedure: "Restauração em resina",
      professional: "Dra. Ana Silva",
      status: "confirmada",
      notes: "Dente 16 — face O. Paciente relata sensibilidade leve.",
      value: 280,
      documents: [{ id: "doc-rx-1", name: "Radiografia periapical" }],
    },
    {
      id: `con-u2-${seed}`,
      date: "2026-07-24",
      time: "10:30",
      procedure: "Avaliação ortodôntica",
      professional: "Dr. Carlos Mendes",
      status: "agendada",
      notes: "Primeira avaliação para aparelho fixo.",
      value: 150,
    },
    {
      id: `con-h1-${seed}`,
      date: "2024-08-14",
      time: "09:30",
      procedure: "Limpeza dental",
      professional: "Dra. Ana Silva",
      status: "realizada",
      notes: "Profilaxia completa. Orientações de higiene reforçadas.",
      value: 220,
      documents: [{ id: "doc-rec-1", name: "Receituário" }],
    },
    {
      id: `con-h2-${seed}`,
      date: "2024-03-02",
      time: "11:00",
      procedure: "Clareamento dental",
      professional: "Dra. Ana Silva",
      status: "realizada",
      notes: "Sessão 1 de 2 concluída sem intercorrências.",
      value: 600,
    },
    {
      id: `con-h3-${seed}`,
      date: "2024-01-20",
      time: "16:00",
      procedure: "Consulta de retorno",
      professional: "Dr. Carlos Mendes",
      status: "cancelada",
      notes: "Cancelada a pedido do paciente.",
    },
    {
      id: `con-h4-${seed}`,
      date: "2023-11-05",
      time: "08:00",
      procedure: "Extração simples",
      professional: "Dra. Fernanda Costa",
      status: "faltou",
      notes: "Paciente não compareceu.",
    },
  ];

  if (seed === 1) return base;
  return base.slice(0, 3 + (seed % 3));
}

export function syncLegacyAppointments(consultations: PatientConsultation[]) {
  const upcoming = consultations.filter((c) => isUpcoming(c.status));
  const history = consultations.filter((c) => isPast(c.status));

  const toLegacy = (c: PatientConsultation): PatientAppointment => ({
    id: c.id,
    date: c.date,
    time: c.time,
    procedure: c.procedure,
    professional: c.professional,
    status:
      c.status === "confirmada"
        ? "confirmado"
        : c.status === "agendada"
          ? "aguardando"
          : c.status === "realizada"
            ? "realizado"
            : "cancelado",
  });

  return {
    upcomingAppointments: upcoming.map(toLegacy),
    appointmentHistory: history.map(toLegacy),
    lastAppointment: history.find((c) => c.status === "realizada")
      ? toLegacy(history.find((c) => c.status === "realizada")!)
      : undefined,
  };
}

export type ConsultationFilterState = {
  search: string;
  status: ConsultationStatus | "todos";
  period: "todos" | "30d" | "90d" | "365d";
  professional: string;
};

export const DEFAULT_CONSULTATION_FILTERS: ConsultationFilterState = {
  search: "",
  status: "todos",
  period: "todos",
  professional: "todos",
};

export function applyConsultationFilters(
  items: PatientConsultation[],
  filters: ConsultationFilterState
) {
  const q = filters.search.trim().toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let cutoff: Date | null = null;
  if (filters.period === "30d") cutoff = new Date(now.getTime() - 30 * 86400000);
  if (filters.period === "90d") cutoff = new Date(now.getTime() - 90 * 86400000);
  if (filters.period === "365d") cutoff = new Date(now.getTime() - 365 * 86400000);

  return items.filter((c) => {
    if (q) {
      const hay = `${c.procedure} ${c.professional}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.status !== "todos" && c.status !== filters.status) return false;
    if (filters.professional !== "todos" && c.professional !== filters.professional) return false;
    if (cutoff) {
      const d = new Date(c.date + "T12:00:00");
      if (d < cutoff) return false;
    }
    return true;
  });
}

export function consultationSummary(consultations: PatientConsultation[]) {
  return {
    upcoming: consultations.filter((c) => isUpcoming(c.status)).length,
    completed: consultations.filter((c) => c.status === "realizada").length,
    cancelled: consultations.filter(
      (c) => c.status === "cancelada" || c.status === "faltou"
    ).length,
  };
}
