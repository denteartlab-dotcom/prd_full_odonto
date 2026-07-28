import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  absoluteAppUrl,
  createPrescriptionShareToken,
} from "@/lib/prescription-share";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await params;
  const row = await prisma.prescription.findFirst({
    where: { id, clinicId: session.clinicId },
    select: { id: true, clinicId: true },
  });
  if (!row) return jsonError("Prescrição não encontrada.", 404);

  const token = await createPrescriptionShareToken({
    prescriptionId: row.id,
    clinicId: row.clinicId,
  });
  const path = `/api/receitas-publicas/${encodeURIComponent(token)}`;
  const url = absoluteAppUrl(path, req);

  return NextResponse.json({
    url,
    expiresInDays: 7,
  });
}
