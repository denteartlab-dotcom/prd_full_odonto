import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    include: { settings: true },
  });
  if (!clinic) return jsonError("Clínica não encontrada.", 404);

  return NextResponse.json({
    clinic: {
      id: clinic.id,
      name: clinic.name,
      slug: clinic.slug,
      phone: clinic.phone,
      email: clinic.email,
      address: clinic.address,
    },
    settings: clinic.settings || {
      timezone: "America/Sao_Paulo",
      currency: "BRL",
      appointmentMins: 30,
      workStart: "08:00",
      workEnd: "18:00",
    },
  });
}

export async function PATCH(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    clinic?: {
      name?: string;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
    };
    settings?: {
      timezone?: string;
      currency?: string;
      appointmentMins?: number;
      workStart?: string;
      workEnd?: string;
    };
  };

  if (body.clinic) {
    if (body.clinic.name !== undefined && !body.clinic.name.trim()) {
      return jsonError("Nome da clínica obrigatório.");
    }
    await prisma.clinic.update({
      where: { id: session.clinicId },
      data: {
        ...(body.clinic.name !== undefined
          ? { name: body.clinic.name.trim() }
          : {}),
        ...(body.clinic.phone !== undefined ? { phone: body.clinic.phone } : {}),
        ...(body.clinic.email !== undefined ? { email: body.clinic.email } : {}),
        ...(body.clinic.address !== undefined
          ? { address: body.clinic.address }
          : {}),
      },
    });
  }

  if (body.settings) {
    await prisma.clinicSetting.upsert({
      where: { clinicId: session.clinicId },
      create: {
        clinicId: session.clinicId,
        timezone: body.settings.timezone || "America/Sao_Paulo",
        currency: body.settings.currency || "BRL",
        appointmentMins: body.settings.appointmentMins ?? 30,
        workStart: body.settings.workStart || "08:00",
        workEnd: body.settings.workEnd || "18:00",
      },
      update: {
        ...(body.settings.timezone !== undefined
          ? { timezone: body.settings.timezone }
          : {}),
        ...(body.settings.currency !== undefined
          ? { currency: body.settings.currency }
          : {}),
        ...(body.settings.appointmentMins !== undefined
          ? { appointmentMins: body.settings.appointmentMins }
          : {}),
        ...(body.settings.workStart !== undefined
          ? { workStart: body.settings.workStart }
          : {}),
        ...(body.settings.workEnd !== undefined
          ? { workEnd: body.settings.workEnd }
          : {}),
      },
    });
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    include: { settings: true },
  });

  return NextResponse.json({
    clinic: clinic
      ? {
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
          phone: clinic.phone,
          email: clinic.email,
          address: clinic.address,
        }
      : null,
    settings: clinic?.settings,
  });
}
