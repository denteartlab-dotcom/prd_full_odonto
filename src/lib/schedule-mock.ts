export type AppointmentStatus =
  | "confirmado"
  | "em_andamento"
  | "aguardando"
  | "cancelado"
  | "finalizado";

export type Professional = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  color: string;
};

export type ScheduleAppointment = {
  id: string;
  professionalId: string;
  patient: string;
  initials: string;
  procedure: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:mm
  end: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  /** ISO timestamp — preenchido ao iniciar a consulta */
  consultationStartedAt?: string;
  /** Duração real em segundos — preenchido ao encerrar */
  consultationDurationSeconds?: number;
};

export function getConsultationElapsedSeconds(startedAt: string, now = Date.now()) {
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now - start) / 1000));
}

export function formatConsultationDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function isActiveConsultation(appointment: ScheduleAppointment) {
  return appointment.status === "em_andamento" && Boolean(appointment.consultationStartedAt);
}

export function canStartConsultation(appointment: ScheduleAppointment) {
  return (
    appointment.status === "confirmado" ||
    appointment.status === "aguardando"
  );
}

export const SCHEDULE_START_HOUR = 7;
export const SCHEDULE_END_HOUR = 19;
export const SLOT_MINUTES = 30;

export const professionalsMock: Professional[] = [
  {
    id: "p1",
    name: "Dra. Ana Silva",
    initials: "AS",
    specialty: "Clínico geral",
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: "p2",
    name: "Dr. Carlos Mendes",
    initials: "CM",
    specialty: "Ortodontista",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "p3",
    name: "Dra. Juliana Costa",
    initials: "JC",
    specialty: "Endodontista",
    color: "from-sky-500 to-cyan-600",
  },
  {
    id: "p4",
    name: "Dr. Rafael Lima",
    initials: "RL",
    specialty: "Implantodontista",
    color: "from-emerald-500 to-teal-600",
  },
];

export const statusMeta: Record<
  AppointmentStatus,
  { label: string; card: string; badge: string; dot: string }
> = {
  confirmado: {
    label: "Confirmado",
    card: "border-emerald-200 bg-emerald-50 text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  em_andamento: {
    label: "Em andamento",
    card: "border-blue-200 bg-blue-50 text-blue-900",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  aguardando: {
    label: "Aguardando",
    card: "border-amber-200 bg-amber-50 text-amber-900",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-400",
  },
  cancelado: {
    label: "Cancelado",
    card: "border-rose-200 bg-rose-50 text-rose-900",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  finalizado: {
    label: "Finalizado",
    card: "border-slate-200 bg-slate-100 text-slate-700",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
};

function todayIso() {
  const d = new Date();
  return toIsoDate(d);
}

export function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number) {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** Semana começando no domingo (padrão BR de calendário). */
export function getWeekDates(iso: string): string[] {
  const d = parseIsoDate(iso);
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    return toIsoDate(day);
  });
}

export function formatDayMonth(iso: string) {
  const d = parseIsoDate(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatWeekday(iso: string) {
  const d = parseIsoDate(iso);
  const label = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatWeekRange(iso: string) {
  const week = getWeekDates(iso);
  return `${formatDayMonth(week[0])} – ${formatDayMonth(week[6])}`;
}

export function formatLongDate(iso: string) {
  const d = parseIsoDate(iso);
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const CONTROLE_START_HOUR = 8;
export const CONTROLE_END_HOUR = 18;

const WEEKDAY_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"] as const;
const WEEKDAY_LONG = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export function formatWeekdayShort(iso: string) {
  return WEEKDAY_SHORT[parseIsoDate(iso).getDay()];
}

export function formatWeekdayLong(iso: string) {
  return WEEKDAY_LONG[parseIsoDate(iso).getDay()];
}

export function formatMonthName(iso: string) {
  const name = parseIsoDate(iso).toLocaleDateString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatDayColumnHeader(iso: string) {
  const d = parseIsoDate(iso);
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const year = String(d.getFullYear()).slice(2);
  return `${d.getDate()} ${month}/${year}`;
}

export function getWorkWeekDates(iso: string): string[] {
  const d = parseIsoDate(iso);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return Array.from({ length: 5 }, (_, i) => {
    const wd = new Date(monday);
    wd.setDate(monday.getDate() + i);
    return toIsoDate(wd);
  });
}

export function getDateStrip(startIso: string, count = 9): string[] {
  const start = parseIsoDate(startIso);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toIsoDate(d);
  });
}

export function buildHourlySlots() {
  return Array.from({ length: CONTROLE_END_HOUR - CONTROLE_START_HOUR }, (_, i) =>
    minutesToTime((CONTROLE_START_HOUR + i) * 60)
  );
}

export function isWeekend(iso: string) {
  const day = parseIsoDate(iso).getDay();
  return day === 0 || day === 6;
}

export const waitingQueueMock = [
  { id: "w1", patient: "Maria Souza", procedure: "Avaliação", waitMin: 12, professional: "Dra. Ana Silva" },
  { id: "w2", patient: "Pedro Alves", procedure: "Manutenção aparelho", waitMin: 25, professional: "Dr. Carlos Mendes" },
  { id: "w3", patient: "Ana Costa", procedure: "Limpeza dental", waitMin: 8, professional: "Dra. Ana Silva" },
];

export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildTimeSlots() {
  const slots: string[] = [];
  for (let m = SCHEDULE_START_HOUR * 60; m < SCHEDULE_END_HOUR * 60; m += SLOT_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

export function createAppointmentsMock(anchorDate: string): ScheduleAppointment[] {
  const base = anchorDate;

  return [
  {
    id: "a1",
    professionalId: "p1",
    patient: "João da Silva",
    initials: "JS",
    procedure: "Limpeza dental",
    date: base,
    start: "08:00",
    end: "08:30",
    status: "confirmado",
  },
  {
    id: "a2",
    professionalId: "p1",
    patient: "Maria Souza",
    initials: "MS",
    procedure: "Avaliação",
    date: base,
    start: "09:00",
    end: "09:30",
    status: "em_andamento",
  },
  {
    id: "a3",
    professionalId: "p2",
    patient: "Pedro Alves",
    initials: "PA",
    procedure: "Manutenção aparelho",
    date: base,
    start: "08:30",
    end: "09:00",
    status: "aguardando",
  },
  {
    id: "a4",
    professionalId: "p2",
    patient: "Ana Costa",
    initials: "AC",
    procedure: "Troca de elásticos",
    date: base,
    start: "10:00",
    end: "10:30",
    status: "confirmado",
  },
  {
    id: "a5",
    professionalId: "p3",
    patient: "Carlos Lima",
    initials: "CL",
    procedure: "Tratamento de canal",
    date: base,
    start: "09:00",
    end: "10:00",
    status: "em_andamento",
  },
  {
    id: "a6",
    professionalId: "p3",
    patient: "Fernanda Reis",
    initials: "FR",
    procedure: "Retorno endodontia",
    date: base,
    start: "11:00",
    end: "11:30",
    status: "finalizado",
  },
  {
    id: "a7",
    professionalId: "p4",
    patient: "Lucas Martins",
    initials: "LM",
    procedure: "Avaliação implante",
    date: base,
    start: "08:00",
    end: "08:30",
    status: "cancelado",
  },
  {
    id: "a8",
    professionalId: "p4",
    patient: "Beatriz Nunes",
    initials: "BN",
    procedure: "Cirurgia implante",
    date: base,
    start: "14:00",
    end: "15:00",
    status: "confirmado",
  },
  {
    id: "a9",
    professionalId: "p1",
    patient: "Rafael Dias",
    initials: "RD",
    procedure: "Restauração",
    date: base,
    start: "15:30",
    end: "16:00",
    status: "aguardando",
  },
  {
    id: "a10",
    professionalId: "p2",
    patient: "Sofia Mendes",
    initials: "SM",
    procedure: "Consulta ortodôntica",
    date: addDays(base, 1),
    start: "09:00",
    end: "09:30",
    status: "confirmado",
  },
  {
    id: "a11",
    professionalId: "p1",
    patient: "Paulo Henrique",
    initials: "PH",
    procedure: "Limpeza dental",
    date: addDays(base, 2),
    start: "10:00",
    end: "10:30",
    status: "confirmado",
  },
  {
    id: "a12",
    professionalId: "p3",
    patient: "Camila Rocha",
    initials: "CR",
    procedure: "Canal",
    date: addDays(base, 2),
    start: "14:00",
    end: "15:00",
    status: "aguardando",
  },
  {
    id: "a13",
    professionalId: "p4",
    patient: "Diego Santos",
    initials: "DS",
    procedure: "Avaliação implante",
    date: addDays(base, 3),
    start: "08:30",
    end: "09:00",
    status: "confirmado",
  },
  {
    id: "a14",
    professionalId: "p2",
    patient: "Helena Prado",
    initials: "HP",
    procedure: "Manutenção aparelho",
    date: addDays(base, -1),
    start: "11:00",
    end: "11:30",
    status: "finalizado",
  },
  {
    id: "a15",
    professionalId: "p1",
    patient: "Igor Nascimento",
    initials: "IN",
    procedure: "Restauração",
    date: addDays(base, -2),
    start: "16:00",
    end: "16:30",
    status: "confirmado",
  },
  ];
}

/** @deprecated Use createAppointmentsMock(anchorDate) */
export function appointmentsMockForToday() {
  return createAppointmentsMock(todayIso());
}

export const patientsMock = [
  "João da Silva",
  "Maria Souza",
  "Pedro Alves",
  "Ana Costa",
  "Carlos Lima",
  "Fernanda Reis",
  "Lucas Martins",
  "Beatriz Nunes",
];

export const proceduresMock = [
  "Limpeza dental",
  "Avaliação",
  "Restauração",
  "Clareamento",
  "Canal",
  "Manutenção aparelho",
  "Implante",
  "Extração",
];
