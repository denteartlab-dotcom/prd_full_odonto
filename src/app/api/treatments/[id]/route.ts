import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { createCommissionFromCompletedTreatment } from "@/lib/commission-from-production";

type Params = { params: Promise<{ id: string }> };

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

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const existing = await prisma.treatment.findFirst({
    where: { id, clinicId: session.clinicId },
    include: { patient: true },
  });
  if (!existing) return jsonError("Tratamento não encontrado.", 404);

  const body = (await req.json()) as {
    professionalId?: string | null;
    name?: string;
    tooth?: string | null;
    status?: string;
    price?: number;
    notes?: string | null;
  };

  if (body.professionalId) {
    const pro = await prisma.professional.findFirst({
      where: { id: body.professionalId, clinicId: session.clinicId },
    });
    if (!pro) return jsonError("Profissional não encontrado.", 404);
  }

  const prevStatus = existing.status;
  const nextStatus = body.status != null ? body.status.trim() : prevStatus;
  const finished = nextStatus === "concluido" || nextStatus === "finalizado";
  const wasFinished =
    prevStatus === "concluido" || prevStatus === "finalizado";
  const now = new Date();

  const treatment = await prisma.treatment.update({
    where: { id },
    data: {
      ...(body.name != null ? { name: body.name.trim() || existing.name } : {}),
      ...(body.tooth !== undefined ? { tooth: body.tooth } : {}),
      ...(body.professionalId !== undefined
        ? { professionalId: body.professionalId }
        : {}),
      ...(body.price != null
        ? { price: Math.max(0, Number(body.price) || 0) }
        : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.status != null
        ? {
            status: nextStatus,
            startedAt:
              nextStatus === "em_andamento" || finished
                ? existing.startedAt || now
                : existing.startedAt,
            finishedAt: finished
              ? existing.finishedAt || now
              : null,
          }
        : {}),
    },
    include: { patient: true, professional: true },
  });

  if (finished && !wasFinished && treatment.professionalId) {
    await createCommissionFromCompletedTreatment({
      clinicId: session.clinicId,
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      treatmentPrice: treatment.price,
      patientName: treatment.patient.name,
      professionalId: treatment.professionalId,
    });
  }

  return NextResponse.json({ treatment: serialize(treatment) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const result = await prisma.treatment.deleteMany({
    where: { id, clinicId: session.clinicId },
  });
  if (!result.count) return jsonError("Tratamento não encontrado.", 404);
  return NextResponse.json({ ok: true });
}
