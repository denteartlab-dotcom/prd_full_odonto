import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { createCommissionFromCompletedTreatment } from "@/lib/commission-from-production";

function serialize(t: {
  id: string;
  patientId: string;
  professionalId: string | null;
  name: string;
  tooth: string | null;
  status: string;
  price: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  patient?: { name: string } | null;
  professional?: { name: string } | null;
}) {
  return {
    id: t.id,
    patientId: t.patientId,
    professionalId: t.professionalId,
    name: t.name,
    tooth: t.tooth,
    status: t.status,
    price: t.price,
    startedAt: t.startedAt?.toISOString() ?? null,
    finishedAt: t.finishedAt?.toISOString() ?? null,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
    patientName: t.patient?.name ?? null,
    professionalName: t.professional?.name ?? null,
  };
}

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId") || undefined;
  const status = url.searchParams.get("status") || undefined;

  const treatments = await prisma.treatment.findMany({
    where: {
      clinicId: session.clinicId,
      ...(patientId ? { patientId } : {}),
      ...(status ? { status } : {}),
    },
    include: { patient: true, professional: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ treatments: treatments.map(serialize) });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    patientId?: string;
    professionalId?: string | null;
    name?: string;
    tooth?: string | null;
    status?: string;
    price?: number;
    notes?: string | null;
  };

  const patientId = (body.patientId || "").trim();
  const name = (body.name || "").trim();
  if (!patientId) return jsonError("Paciente é obrigatório.");
  if (!name) return jsonError("Nome do procedimento é obrigatório.");

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.clinicId },
  });
  if (!patient) return jsonError("Paciente não encontrado.", 404);

  if (body.professionalId) {
    const pro = await prisma.professional.findFirst({
      where: { id: body.professionalId, clinicId: session.clinicId },
    });
    if (!pro) return jsonError("Profissional não encontrado.", 404);
  }

  const status = (body.status || "planejado").trim();
  const now = new Date();
  const finished = status === "concluido" || status === "finalizado";

  const treatment = await prisma.treatment.create({
    data: {
      clinicId: session.clinicId,
      patientId,
      professionalId: body.professionalId || null,
      name,
      tooth: body.tooth || null,
      status,
      price: Math.max(0, Number(body.price) || 0),
      notes: body.notes || null,
      startedAt: status === "em_andamento" || finished ? now : null,
      finishedAt: finished ? now : null,
    },
    include: { patient: true, professional: true },
  });

  if (finished && treatment.professionalId) {
    await createCommissionFromCompletedTreatment({
      clinicId: session.clinicId,
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      treatmentPrice: treatment.price,
      patientName: treatment.patient.name,
      professionalId: treatment.professionalId,
    });
  }

  return NextResponse.json({ treatment: serialize(treatment) }, { status: 201 });
}
