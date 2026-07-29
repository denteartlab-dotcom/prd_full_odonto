import { prisma } from "@/lib/db";
import type { PrescriptionItem, PrescriptionKind } from "@/lib/prescription-types";
import {
  buildPrescriptionPdfBytes,
  pdfFilename,
  type PrescriptionPdfInput,
} from "@/lib/prescription-pdf";

export function parsePrescriptionEnvelope(raw: string | null) {
  if (!raw) {
    return {
      kind: "receituario_simples" as PrescriptionKind,
      items: [] as PrescriptionItem[],
      observations: "",
      validUntil: null as string | null,
    };
  }
  try {
    const parsed = JSON.parse(raw) as {
      kind?: PrescriptionKind;
      items?: PrescriptionItem[];
      observations?: string;
      validUntil?: string | null;
    };
    if (Array.isArray(parsed)) {
      return {
        kind: "receituario_simples" as PrescriptionKind,
        items: parsed as PrescriptionItem[],
        observations: "",
        validUntil: null,
      };
    }
    return {
      kind: parsed.kind || "receituario_simples",
      items: parsed.items || [],
      observations: parsed.observations || "",
      validUntil: parsed.validUntil || null,
    };
  } catch {
    return {
      kind: "receituario_simples" as PrescriptionKind,
      items: [] as PrescriptionItem[],
      observations: "",
      validUntil: null,
    };
  }
}

/** Monta o cabeçalho a partir dos dados cadastrados da clínica no sistema. */
export function buildClinicHeaderLines(clinic: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  cnpj?: string | null;
}) {
  const lines: string[] = [];
  if (clinic.address?.trim()) lines.push(clinic.address.trim());

  const cityState = [clinic.city?.trim(), clinic.state?.trim()]
    .filter(Boolean)
    .join(" — ");
  if (cityState) lines.push(cityState);

  if (clinic.phone?.trim()) lines.push(`Tel.: ${clinic.phone.trim()}`);
  if (clinic.email?.trim()) lines.push(clinic.email.trim());
  if (clinic.cnpj?.trim()) lines.push(`CNPJ ${clinic.cnpj.trim()}`);

  return lines;
}

export async function loadPrescriptionPdfPayload(input: {
  prescriptionId: string;
  clinicId: string;
  fallbackDentistName?: string;
}) {
  const row = await prisma.prescription.findFirst({
    where: { id: input.prescriptionId, clinicId: input.clinicId },
    include: {
      patient: true,
      professional: true,
      clinic: true,
    },
  });
  if (!row) return null;

  const envelope = parsePrescriptionEnvelope(row.medicationsJson);
  const issuedAt = row.createdAt.toLocaleDateString("pt-BR");
  const birthDate = row.patient.birthDate
    ? row.patient.birthDate.toLocaleDateString("pt-BR")
    : undefined;

  const payload: PrescriptionPdfInput = {
    clinicName: row.clinic.name,
    clinicHeaderLines: buildClinicHeaderLines(row.clinic),
    clinicLogoUrl: row.clinic.logoUrl || null,
    dentistName:
      row.professional?.name ||
      row.clinic.responsibleDentist ||
      input.fallbackDentistName ||
      "Cirurgião-Dentista",
    dentistCro: row.professional?.cro || row.clinic.cro || undefined,
    patientName: row.patient.name,
    patientCpf: row.patient.cpf || undefined,
    patientBirthDate: birthDate,
    kind: envelope.kind,
    medications: envelope.items.length
      ? envelope.items
      : [
          {
            id: "legacy",
            medicationName: row.content,
            dose: "",
            frequency: "",
            duration: "",
          },
        ],
    issuedAt,
    validUntil: envelope.validUntil
      ? new Date(`${envelope.validUntil}T12:00:00`).toLocaleDateString("pt-BR")
      : undefined,
  };

  const bytes = buildPrescriptionPdfBytes(payload);
  const filename = pdfFilename(row.patient.name, issuedAt);
  return {
    row,
    payload,
    bytes,
    filename,
    patientPhone: row.patient.phone || "",
    patientName: row.patient.name,
  };
}
