import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMemedDigitalLink,
  getMemedPrescriptionPdfUrl,
} from "@/lib/memed/client";
import { isMemedConfigured, resolvePrescriberExternalId } from "@/lib/memed/config";

function mapPrescription(
  row: {
    id: string;
    patientId: string;
    content: string;
    status: string;
    memedId: string | null;
    pdfUrl: string | null;
    digitalLink: string | null;
    createdAt: Date;
    updatedAt: Date;
    patient: { name: string };
    professional: { name: string } | null;
  }
) {
  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patient.name,
    content: row.content,
    status: row.status,
    memedId: row.memedId,
    pdfUrl: row.pdfUrl,
    digitalLink: row.digitalLink,
    professionalName: row.professional?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const patientId = req.nextUrl.searchParams.get("patientId");

  const items = await prisma.prescription.findMany({
    where: {
      clinicId: session.clinicId,
      ...(patientId ? { patientId } : {}),
    },
    include: {
      patient: { select: { name: true } },
      professional: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    configured: isMemedConfigured(),
    items: items.map(mapPrescription),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const patientId = String(body.patientId ?? "");
  const memedId = body.memedId ? String(body.memedId) : null;
  const content = String(body.content ?? "Prescrição Memed");
  const medicationsJson = body.medicationsJson
    ? JSON.stringify(body.medicationsJson)
    : null;

  if (!patientId) {
    return NextResponse.json({ error: "patientId obrigatório." }, { status: 400 });
  }

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.clinicId },
  });
  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
  }

  let pdfUrl: string | null = body.pdfUrl ? String(body.pdfUrl) : null;
  let digitalLink: string | null = body.digitalLink ? String(body.digitalLink) : null;

  if (isMemedConfigured() && memedId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { memedExternalId: true },
    });
    const externalId = resolvePrescriberExternalId(session.userId, user?.memedExternalId);
    try {
      pdfUrl = pdfUrl || (await getMemedPrescriptionPdfUrl(externalId, memedId));
      digitalLink = digitalLink || (await getMemedDigitalLink(externalId, memedId));
    } catch {
      // Mantém registro local mesmo se links Memed falharem.
    }
  }

  const existing = memedId
    ? await prisma.prescription.findUnique({ where: { memedId } })
    : null;

  const data = {
    clinicId: session.clinicId,
    patientId,
    content,
    memedId,
    status: "ativa",
    pdfUrl,
    digitalLink,
    medicationsJson,
  };

  const saved = existing
    ? await prisma.prescription.update({
        where: { id: existing.id },
        data,
        include: {
          patient: { select: { name: true } },
          professional: { select: { name: true } },
        },
      })
    : await prisma.prescription.create({
        data,
        include: {
          patient: { select: { name: true } },
          professional: { select: { name: true } },
        },
      });

  return NextResponse.json({ item: mapPrescription(saved) });
}
