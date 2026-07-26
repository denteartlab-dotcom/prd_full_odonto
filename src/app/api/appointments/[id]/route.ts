import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  prismaAppointmentToSchedule,
  scheduleToPrismaWrite,
} from "@/lib/appointment-persistence";
import type { AppointmentStatus } from "@/lib/schedule-mock";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: session.clinicId },
    include: { patient: true, professional: true },
  });
  if (!existing) return jsonError("Agendamento não encontrado.", 404);

  const body = (await req.json()) as Partial<{
    patientId: string;
    professionalId: string | null;
    procedure: string;
    date: string;
    start: string;
    end: string;
    status: AppointmentStatus;
    notes: string;
    initials: string;
    consultationStartedAt: string;
    consultationDurationSeconds: number;
  }>;

  const current = prismaAppointmentToSchedule(existing);
  const patientId = body.patientId || current.patientId || existing.patientId;
  const date = body.date || current.date;
  const start = body.start || current.start;
  const end = body.end || current.end;

  const updated = await prisma.appointment.update({
    where: { id },
    data: scheduleToPrismaWrite({
      clinicId: session.clinicId,
      patientId,
      professionalId:
        body.professionalId !== undefined
          ? body.professionalId
          : current.professionalId,
      procedure: body.procedure ?? current.procedure,
      date,
      start,
      end,
      status: body.status ?? current.status,
      notes: body.notes ?? current.notes,
      initials: body.initials ?? current.initials,
      consultationStartedAt:
        body.consultationStartedAt ?? current.consultationStartedAt,
      consultationDurationSeconds:
        body.consultationDurationSeconds ?? current.consultationDurationSeconds,
    }),
    include: { patient: true, professional: true },
  });

  return NextResponse.json({ appointment: prismaAppointmentToSchedule(updated) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const result = await prisma.appointment.deleteMany({
    where: { id, clinicId: session.clinicId },
  });
  if (!result.count) return jsonError("Agendamento não encontrado.", 404);

  return NextResponse.json({ ok: true });
}
