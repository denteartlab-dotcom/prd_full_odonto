export type MemedPatientInput = {
  id: string;
  name: string;
  cpf?: string | null;
  birthDate?: string | Date | null;
  phone?: string | null;
  email?: string | null;
  sexo?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    nome: parts[0] ?? fullName,
    sobrenome: parts.slice(1).join(" ") || ".",
  };
}

function formatBirthDate(value?: string | Date | null) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function buildMemedPatientPayload(patient: MemedPatientInput) {
  const { nome, sobrenome } = splitName(patient.name);
  const street = [patient.endereco, patient.numero].filter(Boolean).join(", ");

  return {
    idExterno: patient.id,
    nome,
    sobrenome,
    cpf: patient.cpf?.replace(/\D/g, "") || undefined,
    data_nascimento: formatBirthDate(patient.birthDate),
    telefone: patient.phone?.replace(/\D/g, "") || undefined,
    email: patient.email || undefined,
    sexo: patient.sexo === "F" ? "F" : patient.sexo === "M" ? "M" : undefined,
    endereco: street || undefined,
    bairro: patient.bairro || undefined,
    cidade: patient.cidade || undefined,
    uf: patient.estado || undefined,
    cep: patient.cep?.replace(/\D/g, "") || undefined,
  };
}
