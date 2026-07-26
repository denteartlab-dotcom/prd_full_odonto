import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, requireApiSession } from "@/lib/api-helpers";
import { buildContasAPagarData } from "@/lib/build-financeiro";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const payables = await prisma.payable.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { dueDate: "asc" },
  });

  const data = buildContasAPagarData({ payables });
  return NextResponse.json({ data });
}
