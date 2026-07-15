import type { DentalAnamnesis } from "./anamnesis-types";
import type { DentalBudget } from "./budget-types";
import type { PatientFinancialData } from "./financial-types";
import type { PatientConsultation } from "./consultation-types";
import type { PatientDocument } from "./document-types";
import type { ListPatient, PatientStatus } from "./patients-list-mock";

export type PatientProfileTab =
  | "resumo"
  | "anamnese"
  | "odontograma"
  | "orcamentos"
  | "financeiro"
  | "consultas"
  | "documentos"
  | "receitas"
  | "historico"
  | "imagens"
  | "comunicacoes";

export type ToothStatus = "higido" | "cariado" | "restaurado" | "extraido" | "tratamento";

export type PatientAnamnesis = {
  updatedAt: string;
  answers: { question: string; answer: boolean; note?: string }[];
  allergies: string;
  medications: string;
  diseases: string;
  observations: string;
};

export type PatientAppointment = {
  id: string;
  date: string;
  time: string;
  procedure: string;
  professional: string;
  status: "confirmado" | "aguardando" | "realizado" | "cancelado";
};

export type { PatientDocument } from "./document-types";

export type PatientBudget = {
  id: string;
  number: string;
  procedure: string;
  status: "rascunho" | "enviado" | "aprovado" | "recusado";
  value: number;
  date: string;
};

export type PatientReceivable = {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pago" | "pendente" | "atrasado";
  method?: string;
};

export type PatientHistoryEvent = {
  id: string;
  date: string;
  title: string;
  description?: string;
};

export type PatientImage = {
  id: string;
  title: string;
  category: "clinica" | "antes_depois" | "radiografia";
  date: string;
};

export type PatientCommunication = {
  id: string;
  channel: "whatsapp" | "email" | "sms";
  date: string;
  message: string;
  status: "enviado" | "lido" | "falhou";
};

export type OdontogramTooth = {
  number: number;
  status: ToothStatus;
};

export type PatientProfile = ListPatient & {
  nomeSocial?: string;
  rg?: string;
  orgaoExpedidor?: string;
  sexo?: string;
  estadoCivil?: string;
  telefoneSecundario?: string;
  plano?: string;
  carteirinha?: string;
  telefoneResponsavel?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  comoConheceu?: string;
  observacoesInternas?: string;
  anamnesis: PatientAnamnesis;
  dentalAnamnesis?: DentalAnamnesis;
  lastAppointment?: PatientAppointment;
  upcomingAppointments: PatientAppointment[];
  appointmentHistory: PatientAppointment[];
  odontogram: OdontogramTooth[];
  documents: PatientDocument[];
  budgets: PatientBudget[];
  dentalBudgets?: DentalBudget[];
  financial?: PatientFinancialData;
  consultations?: PatientConsultation[];
  receivables: PatientReceivable[];
  payments: PatientReceivable[];
  history: PatientHistoryEvent[];
  images: PatientImage[];
  communications: PatientCommunication[];
};

export function profileToList(p: PatientProfile): ListPatient {
  return {
    id: p.id,
    name: p.name,
    cpf: p.cpf,
    phone: p.phone,
    email: p.email,
    city: p.city,
    state: p.state,
    lastVisit: p.lastVisit,
    status: p.status,
    insurance: p.insurance,
    financialResponsible: p.financialResponsible,
    birthDate: p.birthDate,
    createdAt: p.createdAt,
    initials: p.initials,
    avatarColor: p.avatarColor,
    profession: p.profession,
    notes: p.notes ?? p.observacoesInternas,
  };
}

export function computeAge(birthDate: string) {
  const birth = new Date(birthDate + "T12:00:00");
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
