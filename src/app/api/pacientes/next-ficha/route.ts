import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { allocateNextChartNumber } from "@/lib/patient-chart-number";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const chartNumber = await allocateNextChartNumber(session.clinicId);
    return NextResponse.json({ chartNumber });
  } catch (err) {
    console.error("[GET /api/pacientes/next-ficha]", err);
    return jsonError("Não foi possível gerar o número da ficha.", 500);
  }
}
