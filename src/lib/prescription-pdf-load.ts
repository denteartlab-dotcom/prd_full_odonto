import { prisma } from "@/lib/db";
import type { PrescriptionItem, PrescriptionKind } from "@/lib/prescription-types";
import {
  buildPrescriptionPdfBytes,
  pdfFilename,
  type PrescriptionPdfInput,
} from "@/lib/prescription-pdf";
import { formatBrasiliaDate, formatBrasiliaDateTime } from "@/lib/date-range";
import {
  absoluteAppUrl,
  createPrescriptionShareToken,
} from "@/lib/prescription-share";
import type { PatientProfile } from "@/lib/patient-profile-types";

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

function patientAddressFromNotes(
  notes: string | null | undefined,
  fallbackAddress?: string | null
) {
  if (notes?.trim()) {
    try {
      const parsed = JSON.parse(notes) as {
        v?: number;
        profile?: PatientProfile;
      };
      if (parsed?.profile) {
        const p = parsed.profile;
        const parts = [
          p.endereco,
          p.numero ? `nº ${p.numero}` : null,
          p.complemento,
          p.bairro,
          p.city && p.state ? `${p.city}/${p.state}` : p.city || p.state,
          p.cep ? `CEP ${p.cep}` : null,
        ].filter(Boolean);
        if (parts.length) return parts.join(", ");
      }
    } catch {
      /* plain notes */
    }
  }
  return fallbackAddress?.trim() || "";
}

export async function loadPrescriptionPdfPayload(input: {
  prescriptionId: string;
  clinicId: string;
  fallbackDentistName?: string;
  req?: Request;
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
  const issuedAt = formatBrasiliaDateTime(row.createdAt);
  const issuedDateOnly = formatBrasiliaDate(row.createdAt);
  const birthDate = row.patient.birthDate
    ? formatBrasiliaDate(row.patient.birthDate)
    : undefined;

  let digitalValidationUrl: string | undefined;
  try {
    const token = await createPrescriptionShareToken({
      prescriptionId: row.id,
      clinicId: row.clinicId,
    });
    digitalValidationUrl = absoluteAppUrl(
      `/api/receitas-publicas/${encodeURIComponent(token)}/pdf`,
      input.req
    );
  } catch {
    digitalValidationUrl = undefined;
  }

  const payload: PrescriptionPdfInput = {
    clinicName: row.clinic.name,
    clinicHeaderLines: buildClinicHeaderLines(row.clinic),
    clinicLogoUrl: row.clinic.logoUrl || null,
    clinicAddress: row.clinic.address || undefined,
    clinicCity: row.clinic.city || undefined,
    clinicState: row.clinic.state || undefined,
    clinicPhone: row.clinic.phone || undefined,
    dentistName:
      row.professional?.name ||
      row.clinic.responsibleDentist ||
      input.fallbackDentistName ||
      "Cirurgião-Dentista",
    dentistCro: row.professional?.cro || row.clinic.cro || undefined,
    dentistCroUf: row.clinic.state || undefined,
    dentistCpf: row.professional?.cpf || undefined,
    patientName: row.patient.name,
    patientCpf: row.patient.cpf || undefined,
    patientBirthDate: birthDate,
    patientAddress: patientAddressFromNotes(
      row.patient.notes,
      row.patient.address
    ),
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
    issuedDateOnly,
    signedAt: row.createdAt,
    digitallySigned: true,
    validUntil: envelope.validUntil
      ? formatBrasiliaDate(new Date(`${envelope.validUntil}T12:00:00`))
      : undefined,
    digitalValidationUrl,
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
