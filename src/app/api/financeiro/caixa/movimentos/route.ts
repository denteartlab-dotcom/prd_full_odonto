import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const movements = await prisma.cashMovement.findMany({
    where: {
      clinicId: session.clinicId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
    take: 500,
  });

  return NextResponse.json({
    movements: movements.map((m) => ({
      id: m.id,
      type: m.type,
      description: m.description,
      amount: m.amount,
      date: m.date.toISOString(),
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    type?: string;
    description?: string;
    amount?: number;
    date?: string;
  };

  const type = body.type === "saida" ? "saida" : "entrada";
  const description = (body.description || "").trim();
  const amount = Math.max(0, Number(body.amount) || 0);
  if (!description) return jsonError("Descrição é obrigatória.");
  if (amount <= 0) return jsonError("Valor deve ser maior que zero.");

  const movement = await prisma.cashMovement.create({
    data: {
      clinicId: session.clinicId,
      type,
      description,
      amount,
      date: body.date ? new Date(`${body.date}T12:00:00`) : new Date(),
    },
  });

  return NextResponse.json(
    {
      movement: {
        id: movement.id,
        type: movement.type,
        description: movement.description,
        amount: movement.amount,
        date: movement.date.toISOString(),
      },
    },
    { status: 201 }
  );
}
