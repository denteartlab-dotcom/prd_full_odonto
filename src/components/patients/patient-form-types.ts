import type { PatientProfile } from "@/lib/patient-profile-types";

export type EmergencyContact = {
  id: string;
  nome: string;
  parentesco: string;
  telefone: string;
};

export type PatientFormState = {
  nomeCompleto: string;
  numeroFicha: string;
  nomeSocial: string;
  cpf: string;
  rg: string;
  orgaoExpedidor: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  telefonePrincipal: string;
  telefoneSecundario: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  convenio: string;
  plano: string;
  carteirinha: string;
  profissao: string;
  responsavelFinanceiro: string;
  telefoneResponsavel: string;
  comoConheceu: string;
  observacoes: string;
  observacoesInternas: string;
  contatosEmergencia: EmergencyContact[];
};

export const emptyPatientForm = (): PatientFormState => ({
  nomeCompleto: "",
  numeroFicha: "",
  nomeSocial: "",
  cpf: "",
  rg: "",
  orgaoExpedidor: "",
  dataNascimento: "",
  sexo: "",
  estadoCivil: "",
  telefonePrincipal: "",
  telefoneSecundario: "",
  email: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  convenio: "",
  plano: "",
  carteirinha: "",
  profissao: "",
  responsavelFinanceiro: "proprio",
  telefoneResponsavel: "",
  comoConheceu: "",
  observacoes: "",
  observacoesInternas: "",
  contatosEmergencia: [
    { id: "1", nome: "", parentesco: "", telefone: "" },
  ],
});

/** Mock inicial só para pré-visualização visual (opcional). */
export const mockPatientFormPreview = (): PatientFormState => ({
  ...emptyPatientForm(),
  nomeCompleto: "",
  sexo: "",
});

function isoToBrDate(iso: string | undefined | null) {
  if (!iso) return "";
  if (iso.includes("/")) return iso;
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function brOrIsoToIso(value: string, fallback: string) {
  const trimmed = value.trim();
  if (trimmed.includes("/")) {
    const [d, m, y] = trimmed.split("/");
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return fallback;
}

const RESPONSAVEL_LABEL: Record<string, string> = {
  proprio: "Próprio paciente",
  pai: "Pai",
  mae: "Mãe",
  conjuge: "Cônjuge",
  outro: "Outro",
};

function responsavelToFormValue(value: string | undefined | null) {
  const raw = (value || "").trim().toLowerCase();
  if (!raw || raw === "próprio paciente" || raw === "proprio paciente" || raw === "proprio") {
    return "proprio";
  }
  if (raw === "pai") return "pai";
  if (raw === "mãe" || raw === "mae") return "mae";
  if (raw === "cônjuge" || raw === "conjuge") return "conjuge";
  if (raw === "outro") return "outro";
  return "proprio";
}

function convenioToFormValue(value: string | undefined | null) {
  const raw = (value || "").trim().toLowerCase();
  if (!raw || raw === "particular") return "";
  if (raw.includes("unimed")) return "unimed";
  if (raw.includes("bradesco")) return "bradesco";
  if (raw.includes("sulam") || raw.includes("sulamérica") || raw.includes("sulamerica")) {
    return "sulamerica";
  }
  if (raw.includes("amil")) return "amil";
  return raw;
}

function convenioFromForm(value: string) {
  if (!value) return "Particular";
  const map: Record<string, string> = {
    unimed: "Unimed",
    bradesco: "Bradesco Dental",
    sulamerica: "SulAmérica",
    amil: "Amil",
  };
  return map[value] || value;
}

export function profileToPatientForm(patient: PatientProfile): PatientFormState {
  const storedContacts = patient.contatosEmergencia;

  return {
    ...emptyPatientForm(),
    nomeCompleto: patient.name || "",
    numeroFicha: patient.chartNumber || "",
    nomeSocial: patient.nomeSocial || "",
    cpf: patient.cpf || "",
    rg: patient.rg || "",
    orgaoExpedidor: patient.orgaoExpedidor || "",
    dataNascimento: isoToBrDate(patient.birthDate),
    sexo: patient.sexo || "",
    estadoCivil: patient.estadoCivil || "",
    telefonePrincipal: patient.phone || "",
    telefoneSecundario: patient.telefoneSecundario || "",
    email: patient.email || "",
    cep: patient.cep || "",
    endereco: patient.endereco || "",
    numero: patient.numero || "",
    complemento: patient.complemento || "",
    bairro: patient.bairro || "",
    cidade: patient.city || "",
    estado: patient.state || "",
    convenio: convenioToFormValue(patient.insurance),
    plano: patient.plano || "",
    carteirinha: patient.carteirinha || "",
    profissao: patient.profession || "",
    responsavelFinanceiro: responsavelToFormValue(patient.financialResponsible),
    telefoneResponsavel: patient.telefoneResponsavel || "",
    comoConheceu: patient.comoConheceu || "",
    observacoes: patient.anamnesis?.observations || "",
    observacoesInternas: patient.observacoesInternas || patient.notes || "",
    contatosEmergencia:
      storedContacts && storedContacts.length > 0
        ? storedContacts
        : [{ id: "1", nome: "", parentesco: "", telefone: "" }],
  };
}

export function applyPatientFormToProfile(
  patient: PatientProfile,
  form: PatientFormState
): PatientProfile {
  const name = form.nomeCompleto.trim();
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || patient.initials;

  return {
    ...patient,
    name,
    chartNumber: form.numeroFicha.trim() || patient.chartNumber,
    cpf: form.cpf.trim(),
    phone: form.telefonePrincipal.trim(),
    email: form.email.trim(),
    city: form.cidade.trim(),
    state: form.estado.trim(),
    insurance: convenioFromForm(form.convenio),
    financialResponsible:
      RESPONSAVEL_LABEL[form.responsavelFinanceiro] ||
      form.responsavelFinanceiro ||
      patient.financialResponsible,
    birthDate: brOrIsoToIso(form.dataNascimento, patient.birthDate),
    initials,
    profession: form.profissao.trim() || undefined,
    notes: form.observacoesInternas.trim() || undefined,
    nomeSocial: form.nomeSocial.trim() || undefined,
    rg: form.rg.trim() || undefined,
    orgaoExpedidor: form.orgaoExpedidor.trim() || undefined,
    sexo: form.sexo || undefined,
    estadoCivil: form.estadoCivil || undefined,
    telefoneSecundario: form.telefoneSecundario.trim() || undefined,
    plano: form.plano.trim() || undefined,
    carteirinha: form.carteirinha.trim() || undefined,
    telefoneResponsavel: form.telefoneResponsavel.trim() || undefined,
    cep: form.cep.trim() || undefined,
    endereco: form.endereco.trim() || undefined,
    numero: form.numero.trim() || undefined,
    complemento: form.complemento.trim() || undefined,
    bairro: form.bairro.trim() || undefined,
    comoConheceu: form.comoConheceu.trim() || undefined,
    observacoesInternas: form.observacoesInternas.trim() || undefined,
    anamnesis: {
      ...patient.anamnesis,
      observations: form.observacoes.trim(),
      updatedAt: new Date().toISOString(),
    },
    contatosEmergencia: form.contatosEmergencia,
  };
}