import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  formStateToPrismaCreate,
  prismaPatientToProfile,
  profileToPrismaData,
} from "@/lib/patient-persistence";
import type { PatientFormState } from "@/components/patients/patient-form-types";
import type { PatientProfile } from "@/lib/patient-profile-types";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const rows = await prisma.patient.findMany({
      where: { clinicId: session.clinicId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      patients: rows.map(prismaPatientToProfile),
    });
  } catch (err) {
    console.error("[GET /api/pacientes]", err);
    return jsonError("Falha ao carregar pacientes.", 500);
  }
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    let body: { form?: PatientFormState; profile?: PatientProfile };
    try {
      body = (await req.json()) as {
        form?: PatientFormState;
        profile?: PatientProfile;
      };
    } catch {
      return jsonError("JSON inválido no corpo da requisição.");
    }

    let data;
    let profile: PatientProfile;

    if (body.form) {
      if (!body.form.nomeCompleto?.trim()) {
        return jsonError("Nome completo é obrigatório.");
      }
      const created = formStateToPrismaCreate(body.form);
      data = created.data;
      profile = created.profile;
    } else if (body.profile?.name?.trim()) {
      profile = body.profile;
      data = profileToPrismaData(profile);
    } else {
      return jsonError("Dados do paciente inválidos.");
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: { id: true },
    });
    if (!clinic) {
      return jsonError(
        "Clínica da sessão não encontrada. Faça logout e login novamente.",
        400
      );
    }

    const row = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        ...data,
      },
    });

    const finalProfile: PatientProfile = { ...profile, id: row.id };
    const updated = await prisma.patient.update({
      where: { id: row.id },
      data: profileToPrismaData(finalProfile),
    });

    return NextResponse.json(
      { patient: prismaPatientToProfile(updated) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/pacientes]", err);
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Não foi possível salvar o paciente.";
    return jsonError(message, 500);
  }
}
