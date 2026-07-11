import { createPatientsListMock } from "./patients-list-mock";
import type { PatientFormState } from "@/components/patients/patient-form-types";
import { createDefaultDentalBudgets, dentalBudgetsToSimple } from "./budget-mock";
import { createDefaultConsultations, syncLegacyAppointments } from "./consultation-mock";
import { createDefaultDocuments, migrateLegacyDocument } from "./document-mock";
import { syncFinancialFromBudgets } from "./financial-mock";
import type { ListPatient, PatientStatus } from "./patients-list-mock";
import type {
  OdontogramTooth,
  PatientAnamnesis,
  PatientAppointment,
  PatientBudget,
  PatientCommunication,
  PatientDocument,
  PatientHistoryEvent,
  PatientImage,
  PatientProfile,
  PatientReceivable,
  ToothStatus,
} from "./patient-profile-types";

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function defaultOdontogram(seed: number): OdontogramTooth[] {
  const statuses: ToothStatus[] = ["higido", "cariado", "restaurado", "extraido", "tratamento"];
  return [...UPPER_TEETH, ...LOWER_TEETH].map((number, i) => ({
    number,
    status: statuses[(i + seed) % 5],
  }));
}

function defaultAnamnesis(seed: number): PatientAnamnesis {
  return {
    updatedAt: new Date().toISOString(),
    answers: [
      { question: "Está em tratamento médico?", answer: seed % 3 === 0, note: seed % 3 === 0 ? "Hipertensão controlada" : undefined },
      { question: "Já foi anestesiado?", answer: true },
      { question: "Sangramento excessivo?", answer: false },
      { question: "Grávida ou amamentando?", answer: false },
      { question: "Fumante?", answer: seed % 4 === 0 },
    ],
    allergies: seed % 2 === 0 ? "Dipirona" : "Nenhuma conhecida",
    medications: seed % 3 === 0 ? "Losartana 50mg" : "Nenhum",
    diseases: seed % 5 === 0 ? "Diabetes tipo 2" : "Nenhuma",
    observations: "Paciente relata sensibilidade em dentes inferiores.",
  };
}

export function enrichPatientProfile(
  base: ListPatient & Partial<PatientProfile>
): PatientProfile {
  const seed = parseInt(base.id.replace(/\D/g, ""), 10) || 1;
  const name = seed === 1 ? "João Pedro Santos" : base.name;
  const initials = seed === 1 ? "JS" : base.initials;

  const consultations = base.consultations ?? createDefaultConsultations(seed);
  const legacyAppts = syncLegacyAppointments(consultations);

  return {
    ...base,
    name,
    initials,
    nomeSocial: base.nomeSocial ?? (seed === 1 ? "João" : undefined),
    rg: base.rg ?? `${String(12000000 + seed).slice(0, 2)}.${String(1000000 + seed * 13).slice(0, 3)}.${String(1000 + seed).slice(0, 3)}-${seed % 10}`,
    orgaoExpedidor: base.orgaoExpedidor ?? "SSP/SP",
    sexo: base.sexo ?? (seed % 2 === 0 ? "Feminino" : "Masculino"),
    estadoCivil: base.estadoCivil ?? ["Solteiro(a)", "Casado(a)", "Divorciado(a)"][seed % 3],
    telefoneSecundario: base.telefoneSecundario ?? base.phone,
    plano: base.plano ?? (base.insurance === "Particular" ? "—" : "Premium"),
    carteirinha: base.carteirinha ?? `CARD-${String(100000 + seed)}`,
    telefoneResponsavel: base.telefoneResponsavel ?? base.phone,
    cep: base.cep ?? "01310-100",
    endereco: base.endereco ?? "Av. Paulista",
    numero: base.numero ?? String(100 + seed),
    complemento: base.complemento ?? "Sala 12",
    bairro: base.bairro ?? "Bela Vista",
    comoConheceu: base.comoConheceu ?? "Indicação",
    observacoesInternas:
      base.observacoesInternas ??
      base.notes ??
      "Paciente relata sensibilidade em dentes inferiores.",
    anamnesis: base.anamnesis ?? defaultAnamnesis(seed),
    consultations,
    upcomingAppointments: base.upcomingAppointments ?? legacyAppts.upcomingAppointments,
    appointmentHistory: base.appointmentHistory ?? legacyAppts.appointmentHistory,
    lastAppointment: base.lastAppointment ?? legacyAppts.lastAppointment,
    odontogram: base.odontogram ?? defaultOdontogram(seed),
    documents:
      base.documents?.length && base.documents[0]?.fileType
        ? base.documents
        : base.documents?.length
          ? base.documents.map((d, i) => migrateLegacyDocument(d, i))
          : createDefaultDocuments(seed),
    budgets: base.budgets ?? dentalBudgetsToSimple(createDefaultDentalBudgets(seed)),
    dentalBudgets: base.dentalBudgets ?? createDefaultDentalBudgets(seed),
    financial:
      base.financial ??
      syncFinancialFromBudgets(base.dentalBudgets ?? createDefaultDentalBudgets(seed)),
    receivables: base.receivables ?? [
      { id: `rec1-${seed}`, description: "Implante — parcela 2/6", amount: 583.33, dueDate: "2026-07-15", status: "pendente", method: "PIX" },
      { id: `rec2-${seed}`, description: "Limpeza dental", amount: 180, dueDate: "2026-06-01", status: "atrasado", method: "Boleto" },
    ],
    payments: base.payments ?? [
      { id: `pay1-${seed}`, description: "Implante — parcela 1/6", amount: 583.33, dueDate: "2026-06-01", status: "pago", method: "Cartão" },
    ],
    history: base.history ?? [
      { id: `h1-${seed}`, date: base.createdAt, title: "Paciente cadastrado", description: "Cadastro realizado na clínica" },
      { id: `h2-${seed}`, date: "2024-08-14", title: "Consulta realizada", description: "Limpeza dental — Dra. Ana Silva" },
      { id: `h3-${seed}`, date: "2024-06-10", title: "Orçamento aprovado", description: "Implante unitário — R$ 3.500,00" },
      { id: `h4-${seed}`, date: "2026-06-01", title: "Pagamento recebido", description: "Parcela 1/6 do implante" },
    ],
    images: base.images ?? [
      { id: `img1-${seed}`, title: "Radiografia panorâmica", category: "radiografia", date: "2024-01-20" },
      { id: `img2-${seed}`, title: "Antes do clareamento", category: "antes_depois", date: "2024-03-01" },
    ],
    communications: base.communications ?? [
      { id: `com1-${seed}`, channel: "whatsapp", date: "2026-07-03", message: "Lembrete: consulta amanhã às 14h", status: "lido" },
      { id: `com2-${seed}`, channel: "email", date: "2026-06-28", message: "Orçamento enviado por e-mail", status: "enviado" },
    ],
  };
}

export function createPatientProfilesMock(count = 48): PatientProfile[] {
  return createPatientsListMock(count).map((p) => enrichPatientProfile(p));
}

export function formToProfile(form: PatientFormState, id: string): PatientProfile {
  const parts = form.nomeCompleto.trim().split(" ").filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const now = new Date().toISOString().slice(0, 10);

  let birthDate = now;
  if (form.dataNascimento.includes("/")) {
    const [d, m, y] = form.dataNascimento.split("/");
    birthDate = `${y}-${m}-${d}`;
  }

  const base: ListPatient = {
    id,
    name: form.nomeCompleto.trim(),
    cpf: form.cpf,
    phone: form.telefonePrincipal,
    email: form.email,
    city: form.cidade || "São Paulo",
    state: form.estado || "SP",
    lastVisit: null,
    status: "ativo" as PatientStatus,
    insurance: form.convenio || "Particular",
    financialResponsible: form.responsavelFinanceiro || "Próprio paciente",
    birthDate,
    createdAt: now,
    initials: initials || "PA",
    avatarColor: "from-indigo-500 to-violet-600",
    profession: form.profissao,
    notes: form.observacoesInternas,
  };

  return enrichPatientProfile({
    ...base,
    nomeSocial: form.nomeSocial,
    rg: form.rg,
    orgaoExpedidor: form.orgaoExpedidor,
    sexo: form.sexo,
    estadoCivil: form.estadoCivil,
    telefoneSecundario: form.telefoneSecundario,
    plano: form.plano,
    carteirinha: form.carteirinha,
    telefoneResponsavel: form.telefoneResponsavel,
    cep: form.cep,
    endereco: form.endereco,
    numero: form.numero,
    complemento: form.complemento,
    bairro: form.bairro,
    comoConheceu: form.comoConheceu,
    observacoesInternas: form.observacoesInternas,
  });
}

export { UPPER_TEETH, LOWER_TEETH };

export const TOOTH_STATUS_META: Record<
  ToothStatus,
  { label: string; color: string; bg: string }
> = {
  higido: { label: "Hígido", color: "text-emerald-700", bg: "bg-emerald-400" },
  cariado: { label: "Cariado", color: "text-red-700", bg: "bg-red-500" },
  restaurado: { label: "Restaurado", color: "text-blue-700", bg: "bg-blue-500" },
  extraido: { label: "Extraído", color: "text-slate-600", bg: "bg-slate-400" },
  tratamento: { label: "Tratamento", color: "text-amber-700", bg: "bg-amber-400" },
};
