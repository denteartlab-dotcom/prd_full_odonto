import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  formStateToPrismaCreate,
  prismaPatientToProfile,
  profileToPrismaData,
  mergeProfilePatch,
} from "@/lib/patient-persistence";
import type { PatientFormState } from "@/components/patients/patient-form-types";
import type { PatientProfile } from "@/lib/patient-profile-types";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const rows = await prisma.patient.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    patients: rows.map(prismaPatientToProfile),
  });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    form?: PatientFormState;
    profile?: PatientProfile;
  };

  let data;
  let profile: PatientProfile;

  if (body.form) {
    const created = formStateToPrismaCreate(body.form);
    data = created.data;
    profile = created.profile;
  } else if (body.profile?.name?.trim()) {
    profile = body.profile;
    data = profileToPrismaData(profile);
  } else {
    return jsonError("Dados do paciente inválidos.");
  }

  const row = await prisma.patient.create({
    data: {
      clinicId: session.clinicId,
      ...data,
    },
  });

  const saved = prismaPatientToProfile({
    ...row,
    notes: JSON.stringify({
      v: 1,
      profile: { ...profile, id: row.id },
    }),
  });

  // Re-save with correct id inside notes
  await prisma.patient.update({
    where: { id: row.id },
    data: profileToPrismaData({ ...profile, id: row.id }),
  });

  return NextResponse.json({ patient: { ...saved, id: row.id } }, { status: 201 });
}
