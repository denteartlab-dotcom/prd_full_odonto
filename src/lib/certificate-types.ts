import { createHash, randomBytes } from "crypto";

export type CertificateType =
  | "comparecimento"
  | "repouso"
  | "acompanhante"
  | "personalizado";

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  comparecimento: "Comparecimento",
  repouso: "Repouso",
  acompanhante: "Acompanhante",
  personalizado: "Personalizado",
};

export const DEFAULT_CERTIFICATE_TEXTS: Record<CertificateType, string> = {
  comparecimento:
    "Atesto, para os devidos fins, que o(a) paciente acima identificado(a) compareceu nesta clínica odontológica na presente data para atendimento profissional.",
  repouso:
    "Atesto que o(a) paciente necessita permanecer afastado(a) de suas atividades por ____ dias em razão do tratamento odontológico realizado.",
  acompanhante:
    "Atesto que o(a) Sr.(a) __________________ acompanhou o(a) paciente durante o atendimento odontológico realizado nesta data.",
  personalizado: "",
};

export type DentalCid = {
  code: string;
  description: string;
};

/** Catálogo CID odontológico mais comum. */
export const DENTAL_CID_CATALOG: DentalCid[] = [
  { code: "K00.0", description: "Anodontia" },
  { code: "K01.1", description: "Dentes inclusos" },
  { code: "K02.1", description: "Cárie da dentina" },
  { code: "K04.0", description: "Pulpite" },
  { code: "K04.1", description: "Necrose da polpa" },
  { code: "K05.0", description: "Gengivite aguda" },
  { code: "K05.1", description: "Gengivite crônica" },
  { code: "K05.3", description: "Periodontite crônica" },
  { code: "K08.1", description: "Perda de dentes por acidente, extração ou doença periodontal local" },
  { code: "K08.8", description: "Outros transtornos especificados dos dentes e de suas estruturas de sustentação" },
  { code: "K10.2", description: "Condições inflamatórias dos maxilares" },
  { code: "K12.0", description: "Aftas bucais recidivantes" },
  { code: "S02.5", description: "Fratura de dente" },
  { code: "Z01.2", description: "Exame odontológico" },
  { code: "Z46.3", description: "Colocação e ajustamento de prótese dentária" },
];

export function searchDentalCids(query: string, limit = 12): DentalCid[] {
  const q = query.trim().toLowerCase();
  if (!q) return DENTAL_CID_CATALOG.slice(0, limit);
  return DENTAL_CID_CATALOG.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function buildValidationHash(input: {
  clinicId: string;
  documentNumber: string;
  patientId: string;
}) {
  const salt = randomBytes(8).toString("hex");
  const raw = `${input.clinicId}|${input.documentNumber}|${input.patientId}|${salt}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function formatCertificateDocumentNumber(year: number, seq: number) {
  return `ATD-${year}-${String(seq).padStart(6, "0")}`;
}

export function parseCertificateSequence(documentNumber: string) {
  const m = /^ATD-(\d{4})-(\d+)$/i.exec(documentNumber.trim());
  if (!m) return null;
  return {
    year: Number.parseInt(m[1], 10),
    seq: Number.parseInt(m[2], 10),
  };
}
