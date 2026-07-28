import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import type { Medication } from "@/types/medication";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const rows = await prisma.favoriteMedication.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const items = rows
    .map((row) => {
      try {
        return JSON.parse(row.medicationJson) as Medication;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as { medication?: Medication };
  if (!body.medication?.id || !body.medication?.name) {
    return jsonError("Medicamento inválido.");
  }

  await prisma.favoriteMedication.upsert({
    where: {
      userId_medicationId: {
        userId: session.userId,
        medicationId: body.medication.id,
      },
    },
    create: {
      userId: session.userId,
      medicationId: body.medication.id,
      medicationJson: JSON.stringify(body.medication),
    },
    update: {
      medicationJson: JSON.stringify(body.medication),
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
