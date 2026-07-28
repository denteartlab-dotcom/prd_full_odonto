export type PrescriptionItem = {
  id: string;
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

export type PrescriptionKind =
  | "receituario_simples"
  | "controle_especial"
  | "atestado"
  | "solicitacao_exame";

export type PrescriptionRecord = {
  id: string;
  patientId: string;
  patientName: string;
  content: string;
  status: string;
  memedId?: string | null;
  pdfUrl?: string | null;
  digitalLink?: string | null;
  professionalName?: string | null;
  professionalCro?: string | null;
  kind?: PrescriptionKind | null;
  medications?: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
};

export type NewPrescriptionPayload = {
  patientId: string;
  professionalId?: string | null;
  kind?: PrescriptionKind;
  medications: Omit<PrescriptionItem, "id">[];
  observations?: string;
  validUntil?: string;
};

export function formatPrescriptionContent(
  medications: Array<{
    medicationName: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>,
  observations?: string
) {
  const lines = medications.map((m, i) => {
    const base = `${i + 1}. ${m.medicationName} — ${m.dose}, ${m.frequency}, por ${m.duration}`;
    return m.instructions?.trim() ? `${base} (${m.instructions.trim()})` : base;
  });
  if (observations?.trim()) {
    lines.push(`Obs.: ${observations.trim()}`);
  }
  return lines.join("\n");
}
