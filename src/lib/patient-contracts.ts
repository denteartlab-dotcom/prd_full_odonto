import type { PatientProfile } from "@/lib/patient-profile-types";
import { computeAge } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

export type PatientContractId =
  | "prestacao-servicos"
  | "consentimento-informado"
  | "tratamento-ortodontico"
  | "plano-pagamento"
  | "autorizacao-imagem"
  | "termo-responsabilidade"
  | "extracoes-dentarias";

export type PatientContractDefinition = {
  id: PatientContractId;
  title: string;
  shortLabel: string;
  description: string;
  /** Nome do arquivo PDF estático opcional em /public/contratos/ */
  pdfFileName: string;
};

/** Catálogo do submenu Ações → Contratos */
export const PATIENT_CONTRACTS: PatientContractDefinition[] = [
  {
    id: "extracoes-dentarias",
    title: "Termo de Extrações Dentárias",
    shortLabel: "Extrações dentárias",
    description: "Consentimento e orientações para extração dentária.",
    pdfFileName: "extracoes-dentarias.pdf",
  },
  {
    id: "prestacao-servicos",
    title: "Contrato de Prestação de Serviços Odontológicos",
    shortLabel: "Prestação de serviços",
    description: "Contrato geral de atendimento e responsabilidades.",
    pdfFileName: "prestacao-servicos.pdf",
  },
  {
    id: "consentimento-informado",
    title: "Termo de Consentimento Informado",
    shortLabel: "Consentimento informado",
    description: "Autorização para procedimentos clínicos.",
    pdfFileName: "consentimento-informado.pdf",
  },
  {
    id: "tratamento-ortodontico",
    title: "Contrato de Tratamento Ortodôntico",
    shortLabel: "Tratamento ortodôntico",
    description: "Condições específicas de ortodontia.",
    pdfFileName: "tratamento-ortodontico.pdf",
  },
  {
    id: "plano-pagamento",
    title: "Contrato de Plano de Pagamento",
    shortLabel: "Plano de pagamento",
    description: "Parcelamento e obrigações financeiras.",
    pdfFileName: "plano-pagamento.pdf",
  },
  {
    id: "autorizacao-imagem",
    title: "Autorização de Uso de Imagem",
    shortLabel: "Uso de imagem",
    description: "Autorização para fotos e documentação clínica.",
    pdfFileName: "autorizacao-imagem.pdf",
  },
  {
    id: "termo-responsabilidade",
    title: "Termo de Responsabilidade do Paciente",
    shortLabel: "Termo de responsabilidade",
    description: "Compromissos do paciente com o tratamento.",
    pdfFileName: "termo-responsabilidade.pdf",
  },
];

export function contractStaticPdfUrl(contract: PatientContractDefinition) {
  return `/contratos/${encodeURIComponent(contract.pdfFileName)}`;
}

export type FilledContractPatient = {
  name: string;
  nomeSocial?: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  birthDateDisplay: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  cep?: string;
  insurance: string;
  financialResponsible: string;
  sexo?: string;
  estadoCivil?: string;
};

export function buildFilledContractPatient(patient: PatientProfile): FilledContractPatient {
  const addressParts = [
    patient.endereco,
    patient.numero,
    patient.complemento,
    patient.bairro,
  ].filter(Boolean);

  return {
    name: patient.name,
    nomeSocial: patient.nomeSocial,
    cpf: patient.cpf || "—",
    rg: patient.rg,
    birthDate: patient.birthDate,
    birthDateDisplay: formatDisplayDate(patient.birthDate),
    age: computeAge(patient.birthDate),
    phone: patient.phone || "—",
    email: patient.email || "—",
    address: addressParts.length
      ? addressParts.join(", ")
      : patient.endereco || "—",
    city: patient.city || "—",
    state: patient.state || "—",
    cep: patient.cep,
    insurance: patient.insurance || "Particular",
    financialResponsible: patient.financialResponsible || "Próprio paciente",
    sexo: patient.sexo,
    estadoCivil: patient.estadoCivil,
  };
}

export function getContractById(id: string): PatientContractDefinition | undefined {
  return PATIENT_CONTRACTS.find((c) => c.id === id);
}

export function contractPrintPath(patientId: string, contractId: PatientContractId) {
  return `/app/pacientes/${patientId}/contratos/${contractId}`;
}

export function openContractPrint(patientId: string, contractId: PatientContractId) {
  if (typeof window === "undefined") return;
  window.open(contractPrintPath(patientId, contractId), "_blank", "noopener,noreferrer");
}

export function todayDisplay() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
