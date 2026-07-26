import type { Appointment, Patient, Professional } from "@prisma/client";
import {
  type AppointmentStatus,
  type Professional as ScheduleProfessional,
  type ScheduleAppointment,
  toIsoDate,
} from "@/lib/schedule-mock";

const PRO_COLORS = [
  "from-indigo-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

type AppointmentMeta = {
  initials?: string;
  consultationStartedAt?: string;
  consultationDurationSeconds?: number;
  clinicalNotes?: string;
};

function parseMeta(notes: string | null | undefined): AppointmentMeta {
  if (!notes?.trim()) return {};
  try {
    const parsed = JSON.parse(notes) as AppointmentMeta & { v?: number };
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return { clinicalNotes: notes };
  }
  return { clinicalNotes: notes };
}

function stringifyMeta(meta: AppointmentMeta) {
  return JSON.stringify(meta);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function timeFromDate(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTime(date: string, time: string) {
  const [h, m] = time.split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(y, mo - 1, d, h, m || 0, 0, 0);
}

function mapStatusIn(status: string): AppointmentStatus {
  if (
    status === "confirmado" ||
    status === "em_andamento" ||
    status === "aguardando" ||
    status === "cancelado" ||
    status === "finalizado"
  ) {
    return status;
  }
  if (status === "agendado") return "confirmado";
  return "confirmado";
}

export function prismaProfessionalToSchedule(pro: Professional, index = 0): ScheduleProfessional {
  const initials =
    pro.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "DR";
  return {
    id: pro.id,
    name: pro.name,
    initials,
    specialty: pro.specialty || "Clínico geral",
    color: PRO_COLORS[index % PRO_COLORS.length],
  };
}

export function prismaAppointmentToSchedule(
  row: Appointment & { patient: Patient; professional: Professional | null }
): ScheduleAppointment {
  const meta = parseMeta(row.notes);
  const patientName = row.patient.name;
  const initials =
    meta.initials ||
    patientName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") ||
    "PA";

  return {
    id: row.id,
    professionalId: row.professionalId || "",
    patientId: row.patientId,
    patient: patientName,
    initials,
    procedure: row.type || "Consulta",
    date: toIsoDate(row.startsAt),
    start: timeFromDate(row.startsAt),
    end: timeFromDate(row.endsAt),
    status: mapStatusIn(row.status),
    notes: meta.clinicalNotes || "",
    consultationStartedAt: meta.consultationStartedAt,
    consultationDurationSeconds: meta.consultationDurationSeconds,
  };
}

export function scheduleToPrismaWrite(input: {
  clinicId: string;
  patientId: string;
  professionalId?: string | null;
  procedure: string;
  date: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  notes?: string;
  initials?: string;
  consultationStartedAt?: string;
  consultationDurationSeconds?: number;
}) {
  return {
    clinicId: input.clinicId,
    patientId: input.patientId,
    professionalId: input.professionalId || null,
    startsAt: combineDateTime(input.date, input.start),
    endsAt: combineDateTime(input.date, input.end),
    status: input.status,
    type: input.procedure,
    notes: stringifyMeta({
      clinicalNotes: input.notes || "",
      initials: input.initials,
      consultationStartedAt: input.consultationStartedAt,
      consultationDurationSeconds: input.consultationDurationSeconds,
    }),
  };
}
