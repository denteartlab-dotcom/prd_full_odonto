import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  mergeProfilePatch,
  prismaPatientToProfile,
  profileToPrismaData,
} from "@/lib/patient-persistence";
import { allocateNextChartNumber } from "@/lib/patient-chart-number";
import type { PatientProfile } from "@/lib/patient-profile-types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  let row = await prisma.patient.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!row) return jsonError("Paciente não encontrado.", 404);

  // Pacientes antigos: atribui ficha na primeira visualização
  if (!row.chartNumber) {
    const chartNumber = await allocateNextChartNumber(session.clinicId);
    const profile = {
      ...prismaPatientToProfile(row),
      chartNumber,
    };
    row = await prisma.patient.update({
      where: { id },
      data: profileToPrismaData(profile),
    });
  }

  return NextResponse.json({ patient: prismaPatientToProfile(row) });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const row = await prisma.patient.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!row) return jsonError("Paciente não encontrado.", 404);

  const body = (await req.json()) as { patch?: Partial<PatientProfile>; profile?: PatientProfile };
  const current = prismaPatientToProfile(row);
  const next = body.profile
    ? { ...body.profile, id }
    : mergeProfilePatch(current, body.patch || {});

  if (!next.name?.trim()) return jsonError("Nome obrigatório.");

  const updated = await prisma.patient.update({
    where: { id },
    data: profileToPrismaData(next),
  });

  return NextResponse.json({ patient: prismaPatientToProfile(updated) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const result = await prisma.patient.deleteMany({
    where: { id, clinicId: session.clinicId },
  });
  if (!result.count) return jsonError("Paciente não encontrado.", 404);

  return NextResponse.json({ ok: true });
}
