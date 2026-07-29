import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  formStateToPrismaCreate,
  prismaPatientToProfile,
  profileToPrismaData,
} from "@/lib/patient-persistence";
import { allocateNextChartNumber } from "@/lib/patient-chart-number";
import type { PatientFormState } from "@/components/patients/patient-form-types";
import type { PatientProfile } from "@/lib/patient-profile-types";

function isUniqueChartError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return /Unique constraint|chartNumber/i.test(message);
}

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

    let chartNumber =
      (typeof data.chartNumber === "string" && data.chartNumber.trim()) ||
      (await allocateNextChartNumber(clinic.id));

    let row = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      profile = { ...profile, chartNumber };
      data = profileToPrismaData(profile);

      try {
        row = await prisma.patient.create({
          data: {
            clinicId: clinic.id,
            ...data,
          },
        });
        break;
      } catch (err) {
        if (!isUniqueChartError(err) || attempt === 4) throw err;
        chartNumber = await allocateNextChartNumber(clinic.id);
      }
    }

    if (!row) {
      return jsonError("Não foi possível gerar o número da ficha.", 500);
    }

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
    if (isUniqueChartError(err)) {
      return jsonError("Número de ficha já utilizado. Tente novamente.", 409);
    }
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Não foi possível salvar o paciente.";
    return jsonError(message, 500);
  }
}
