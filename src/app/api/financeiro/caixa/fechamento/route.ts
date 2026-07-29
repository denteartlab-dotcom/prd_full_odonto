import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { closeCashAndCreateCommissions } from "@/lib/commission-from-production";

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const url = new URL(req.url);
  const periodType = url.searchParams.get("periodType") || undefined;

  const closings = await prisma.cashClosing.findMany({
    where: {
      clinicId: session.clinicId,
      ...(periodType ? { periodType } : {}),
    },
    orderBy: { closedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    closings: closings.map((c) => ({
      id: c.id,
      periodType: c.periodType,
      periodKey: c.periodKey,
      totalEntradas: c.totalEntradas,
      totalSaidas: c.totalSaidas,
      saldo: c.saldo,
      closedAt: c.closedAt.toISOString(),
      notes: c.notes,
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    periodType?: "diario" | "mensal";
    periodKey?: string;
    notes?: string;
  };

  const periodType = body.periodType === "mensal" ? "mensal" : "diario";
  const periodKey =
    (body.periodKey || "").trim() ||
    (periodType === "mensal" ? monthKey() : todayKey());

  if (periodType === "diario" && !/^\d{4}-\d{2}-\d{2}$/.test(periodKey)) {
    return jsonError("periodKey diário inválido (use YYYY-MM-DD).");
  }
  if (periodType === "mensal" && !/^\d{4}-\d{2}$/.test(periodKey)) {
    return jsonError("periodKey mensal inválido (use YYYY-MM).");
  }

  const result = await closeCashAndCreateCommissions({
    clinicId: session.clinicId,
    periodType,
    periodKey,
    closedByUserId: session.userId,
    notes: body.notes || null,
  });

  return NextResponse.json({
    closing: {
      id: result.closing.id,
      periodType: result.closing.periodType,
      periodKey: result.closing.periodKey,
      totalEntradas: result.closing.totalEntradas,
      totalSaidas: result.closing.totalSaidas,
      saldo: result.closing.saldo,
      closedAt: result.closing.closedAt.toISOString(),
    },
    commissionsCreated: result.commissions.length,
    totalEntradas: result.totalEntradas,
    totalSaidas: result.totalSaidas,
    saldo: result.saldo,
  });
}
