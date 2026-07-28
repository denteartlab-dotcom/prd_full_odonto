import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession, isSession, jsonError } from "@/lib/api-helpers";
import {
  formatPrescriptionContent,
  type NewPrescriptionPayload,
  type PrescriptionItem,
  type PrescriptionKind,
  type PrescriptionRecord,
} from "@/lib/prescription-types";

function parseMedications(raw: string | null): PrescriptionItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PrescriptionItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRow(row: {
  id: string;
  patientId: string;
  content: string;
  status: string;
  memedId: string | null;
  pdfUrl: string | null;
  digitalLink: string | null;
  medicationsJson: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { name: string };
  professional: { name: string; cro: string | null } | null;
}): PrescriptionRecord {
  const medications = parseMedications(row.medicationsJson);
  const kind =
    (medications as Array<PrescriptionItem & { _kind?: PrescriptionKind }>)[0]?._kind ||
    ("receituario_simples" as PrescriptionKind);

  // kind is stored in medicationsJson wrapper when present
  let storedKind: PrescriptionKind = "receituario_simples";
  let items = medications;
  if (row.medicationsJson) {
    try {
      const envelope = JSON.parse(row.medicationsJson) as {
        kind?: PrescriptionKind;
        items?: PrescriptionItem[];
        observations?: string;
      };
      if (envelope?.items) {
        items = envelope.items;
        storedKind = envelope.kind || "receituario_simples";
      }
    } catch {
      /* plain array fallback */
    }
  }

  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patient.name,
    content: row.content,
    status: row.status,
    memedId: row.memedId,
    pdfUrl: row.pdfUrl || `/api/prescricoes/${row.id}/imprimir`,
    digitalLink: row.digitalLink,
    professionalName: row.professional?.name ?? null,
    professionalCro: row.professional?.cro ?? null,
    kind: storedKind || kind,
    medications: items,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const patientId = req.nextUrl.searchParams.get("patientId");

  const items = await prisma.prescription.findMany({
    where: {
      clinicId: session.clinicId,
      ...(patientId ? { patientId } : {}),
    },
    include: {
      patient: { select: { name: true } },
      professional: { select: { name: true, cro: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const professionals = await prisma.professional.findMany({
    where: { clinicId: session.clinicId, active: true },
    select: { id: true, name: true, cro: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    provider: "nativo",
    free: true,
    professionals,
    items: items.map(mapRow),
  });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  let body: NewPrescriptionPayload;
  try {
    body = (await req.json()) as NewPrescriptionPayload;
  } catch {
    return jsonError("JSON inválido.");
  }

  if (!body.patientId) return jsonError("patientId é obrigatório.");
  if (!Array.isArray(body.medications) || body.medications.length === 0) {
    return jsonError("Inclua ao menos um medicamento.");
  }

  const patient = await prisma.patient.findFirst({
    where: { id: body.patientId, clinicId: session.clinicId },
  });
  if (!patient) return jsonError("Paciente não encontrado.", 404);

  let professionalId = body.professionalId || null;
  if (professionalId) {
    const professional = await prisma.professional.findFirst({
      where: { id: professionalId, clinicId: session.clinicId },
    });
    if (!professional) return jsonError("Profissional não encontrado.", 404);
  } else {
    const first = await prisma.professional.findFirst({
      where: { clinicId: session.clinicId, active: true },
      orderBy: { name: "asc" },
    });
    professionalId = first?.id ?? null;
  }

  const items: PrescriptionItem[] = body.medications.map((m, index) => ({
    id: `med-${Date.now()}-${index}`,
    medicationName: String(m.medicationName || "").trim(),
    dose: String(m.dose || "").trim(),
    frequency: String(m.frequency || "").trim(),
    duration: String(m.duration || "").trim(),
    instructions: m.instructions?.trim() || undefined,
  }));

  if (items.some((m) => !m.medicationName)) {
    return jsonError("Todo medicamento precisa de nome.");
  }

  const kind: PrescriptionKind = body.kind || "receituario_simples";
  const content = formatPrescriptionContent(items, body.observations);
  const medicationsJson = JSON.stringify({
    kind,
    items,
    observations: body.observations || "",
    validUntil: body.validUntil || null,
    source: "nativo",
  });

  const saved = await prisma.prescription.create({
    data: {
      clinicId: session.clinicId,
      patientId: patient.id,
      professionalId,
      content,
      status: "ativa",
      memedId: null,
      pdfUrl: null,
      digitalLink: null,
      medicationsJson,
    },
    include: {
      patient: { select: { name: true } },
      professional: { select: { name: true, cro: true } },
    },
  });

  const printPath = `/api/prescricoes/${saved.id}/imprimir`;
  const updated = await prisma.prescription.update({
    where: { id: saved.id },
    data: { pdfUrl: printPath },
    include: {
      patient: { select: { name: true } },
      professional: { select: { name: true, cro: true } },
    },
  });

  return NextResponse.json({ item: mapRow(updated) }, { status: 201 });
}
