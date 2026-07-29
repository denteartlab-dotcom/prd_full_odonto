import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, isSession, jsonError } from "@/lib/api-helpers";
import { buildPrescriptionHtml } from "@/lib/prescription-html";
import { buildClinicHeaderLines } from "@/lib/prescription-pdf-load";
import { formatBrasiliaDate, formatBrasiliaDateTime } from "@/lib/date-range";
import type { PrescriptionItem, PrescriptionKind } from "@/lib/prescription-types";

type Params = { params: Promise<{ id: string }> };

function parseEnvelope(raw: string | null) {
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

export async function GET(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const row = await prisma.prescription.findFirst({
    where: { id, clinicId: session.clinicId },
    include: {
      patient: true,
      professional: true,
      clinic: true,
    },
  });
  if (!row) return jsonError("Prescrição não encontrada.", 404);

  const envelope = parseEnvelope(row.medicationsJson);
  const issuedAt = formatBrasiliaDateTime(row.createdAt);
  const birthDate = row.patient.birthDate
    ? formatBrasiliaDate(row.patient.birthDate)
    : undefined;

  const html = buildPrescriptionHtml({
    clinicName: row.clinic.name,
    clinicHeaderLines: buildClinicHeaderLines(row.clinic),
    clinicLogoUrl: row.clinic.logoUrl || null,
    dentistName:
      row.professional?.name ||
      row.clinic.responsibleDentist ||
      session.name ||
      "Cirurgião-Dentista",
    dentistCro: row.professional?.cro || row.clinic.cro || "—",
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
      ? formatBrasiliaDate(new Date(`${envelope.validUntil}T12:00:00`))
      : undefined,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
