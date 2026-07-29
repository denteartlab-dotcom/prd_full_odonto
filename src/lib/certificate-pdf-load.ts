import { prisma } from "@/lib/db";
import { buildClinicHeaderLines } from "@/lib/prescription-pdf-load";
import {
  buildCertificatePdfBytes,
  certificatePdfFilename,
  fetchQrDataUrl,
  type CertificatePdfInput,
} from "@/lib/certificate-pdf";
import type { CertificateType } from "@/lib/certificate-types";
import { formatBrasiliaDate, formatBrasiliaDateTime } from "@/lib/date-range";
import {
  absoluteAppUrl,
  certificateValidationPath,
  createCertificateShareToken,
} from "@/lib/certificate-share";

export async function loadCertificatePdfPayload(input: {
  certificateId: string;
  clinicId: string;
  req?: Request;
  fallbackDentistName?: string;
}) {
  const row = await prisma.medicalCertificate.findFirst({
    where: { id: input.certificateId, clinicId: input.clinicId },
    include: {
      patient: true,
      professional: true,
      clinic: true,
    },
  });
  if (!row) return null;

  const token = await createCertificateShareToken({
    certificateId: row.id,
    clinicId: row.clinicId,
  });
  const validationUrl = absoluteAppUrl(
    certificateValidationPath(token),
    input.req
  );
  const qrDataUrl = await fetchQrDataUrl(validationUrl);

  const payload: CertificatePdfInput = {
    clinicName: row.clinic.name,
    clinicHeaderLines: buildClinicHeaderLines(row.clinic),
    clinicLogoUrl: row.clinic.logoUrl,
    clinicCity: row.clinic.city,
    clinicState: row.clinic.state,
    patientName: row.patient.name,
    patientCpf: row.patient.cpf,
    patientBirthDate: row.patient.birthDate
      ? formatBrasiliaDate(row.patient.birthDate)
      : null,
    patientChartNumber: row.patient.chartNumber,
    dentistName:
      row.professional?.name ||
      row.issuedByName ||
      input.fallbackDentistName ||
      row.clinic.responsibleDentist ||
      "Cirurgião-Dentista",
    dentistCro: row.professional?.cro || row.clinic.cro,
    dentistSpecialty: row.professional?.specialty,
    certificateType: row.certificateType as CertificateType,
    certificateText: row.certificateText,
    procedureName: row.procedureName,
    attendanceDate: row.attendanceDate
      ? formatBrasiliaDate(row.attendanceDate)
      : null,
    startTime: row.startTime,
    endTime: row.endTime,
    days: row.days,
    hours: row.hours,
    companionName: row.companionName,
    companionCpf: row.companionCpf,
    cid: row.cid,
    cidDescription: row.cidDescription,
    observations: row.observations,
    documentNumber: row.documentNumber,
    validationUrl,
    qrDataUrl,
    issuedAtLabel: formatBrasiliaDateTime(row.createdAt),
  };

  const bytes = await buildCertificatePdfBytes(payload);
  return {
    row,
    payload,
    bytes: new Uint8Array(bytes),
    filename: certificatePdfFilename(row.documentNumber, row.patient.name),
    patientPhone: row.patient.phone,
    patientEmail: row.patient.email,
    patientName: row.patient.name,
    validationUrl,
  };
}
