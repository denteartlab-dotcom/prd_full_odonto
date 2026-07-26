import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  prismaAppointmentToSchedule,
  prismaProfessionalToSchedule,
  scheduleToPrismaWrite,
} from "@/lib/appointment-persistence";
import type { AppointmentStatus } from "@/lib/schedule-mock";

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: {
    clinicId: string;
    startsAt?: { gte?: Date; lte?: Date };
  } = { clinicId: session.clinicId };

  if (from || to) {
    where.startsAt = {};
    if (from) where.startsAt.gte = new Date(`${from}T00:00:00`);
    if (to) where.startsAt.lte = new Date(`${to}T23:59:59`);
  }

  const [rows, professionals] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { patient: true, professional: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.professional.findMany({
      where: { clinicId: session.clinicId, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    appointments: rows.map(prismaAppointmentToSchedule),
    professionals: professionals.map((p, i) => prismaProfessionalToSchedule(p, i)),
  });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    patientId?: string;
    patient?: string;
    professionalId?: string;
    procedure?: string;
    date?: string;
    start?: string;
    end?: string;
    status?: AppointmentStatus;
    notes?: string;
    initials?: string;
  };

  let patientId = body.patientId;
  if (!patientId && body.patient?.trim()) {
    const existing = await prisma.patient.findFirst({
      where: {
        clinicId: session.clinicId,
        name: body.patient.trim(),
      },
    });
    if (existing) {
      patientId = existing.id;
    } else {
      const created = await prisma.patient.create({
        data: {
          clinicId: session.clinicId,
          name: body.patient.trim(),
        },
      });
      patientId = created.id;
    }
  }

  if (!patientId || !body.date || !body.start || !body.end) {
    return jsonError("Paciente, data e horário são obrigatórios.");
  }

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

  const row = await prisma.appointment.create({
    data: scheduleToPrismaWrite({
      clinicId: session.clinicId,
      patientId,
      professionalId: body.professionalId,
      procedure: body.procedure || "Consulta",
      date: body.date,
      start: body.start,
      end: body.end,
      status: body.status || "confirmado",
      notes: body.notes,
      initials: body.initials,
    }),
    include: { patient: true, professional: true },
  });

  return NextResponse.json(
    { appointment: prismaAppointmentToSchedule(row) },
    { status: 201 }
  );
}
