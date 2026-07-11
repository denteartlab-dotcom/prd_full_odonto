export type WaitingPatientStatus = "waiting" | "called" | "in_service" | "completed";

export type WaitingPatient = {
  id: string;
  patient: string;
  initials: string;
  procedure: string;
  /** HH:mm */
  arrivalTime: string;
  /** HH:mm */
  scheduledTime: string;
  waitMinutes: number;
  professionalId?: string;
  professionalName?: string;
  appointmentId?: string;
  status: WaitingPatientStatus;
};

export type WaitingPatientHistory = WaitingPatient & {
  completedAt: string;
  action: "atendimento" | "chamada";
};

export function patientInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const initialWaitingPatientsMock: WaitingPatient[] = [
  {
    id: "wp1",
    patient: "João Pedro Santos",
    initials: "JS",
    procedure: "Limpeza dental",
    arrivalTime: "08:15",
    scheduledTime: "08:15",
    waitMinutes: 25,
    professionalId: "p1",
    professionalName: "Dra. Ana Silva",
    appointmentId: "a1",
    status: "waiting",
  },
  {
    id: "wp2",
    patient: "Maria Silva",
    initials: "MS",
    procedure: "Aparelho fixo",
    arrivalTime: "08:30",
    scheduledTime: "08:30",
    waitMinutes: 10,
    professionalId: "p2",
    professionalName: "Dr. Carlos Mendes",
    status: "waiting",
  },
  {
    id: "wp3",
    patient: "Carlos Alberto",
    initials: "CA",
    procedure: "Avaliação ortodôntica",
    arrivalTime: "08:40",
    scheduledTime: "08:45",
    waitMinutes: 0,
    professionalId: "p2",
    professionalName: "Dr. Carlos Mendes",
    status: "waiting",
  },
];

export const initialWaitingHistoryMock: WaitingPatientHistory[] = [
  {
    id: "wh1",
    patient: "Fernanda Lima",
    initials: "FL",
    procedure: "Clareamento",
    arrivalTime: "07:50",
    scheduledTime: "08:00",
    waitMinutes: 15,
    professionalName: "Dra. Ana Silva",
    status: "completed",
    completedAt: "08:05",
    action: "atendimento",
  },
];

export async function fetchWaitingPatientsMock(): Promise<WaitingPatient[]> {
  await new Promise((r) => setTimeout(r, 500));
  return initialWaitingPatientsMock.map((p) => ({ ...p }));
}

export async function fetchWaitingHistoryMock(): Promise<WaitingPatientHistory[]> {
  await new Promise((r) => setTimeout(r, 300));
  return initialWaitingHistoryMock.map((p) => ({ ...p }));
}
