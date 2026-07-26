import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import type { DentalBudget } from "@/lib/budget-types";

type Params = { params: Promise<{ id: string }> };

function parseExtras(notes: string | null) {
  if (!notes) return null;
  try {
    return JSON.parse(notes) as { dental?: DentalBudget; text?: string };
  } catch {
    return { text: notes };
  }
}

function serializeBudget(row: {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string | null;
  status: string;
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string };
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
}) {
  const extras = parseExtras(row.notes);
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    patientName: row.patient.name,
    professionalId: row.professionalId,
    status: row.status,
    total: row.total,
    notes: extras?.text || "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    dental: extras?.dental ?? null,
  };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const existing = await prisma.budget.findFirst({
    where: { id, clinicId: session.clinicId },
    include: { items: true },
  });
  if (!existing) return jsonError("Orçamento não encontrado.", 404);

  const body = (await req.json()) as {
    status?: string;
    notes?: string;
    dental?: DentalBudget;
    items?: { description: string; quantity?: number; unitPrice?: number }[];
    professionalId?: string | null;
  };

  const items =
    body.dental?.procedures?.map((p) => ({
      description: p.name + (p.tooth ? ` (dente ${p.tooth})` : ""),
      quantity: p.quantity || 1,
      unitPrice: p.finalValue / Math.max(p.quantity || 1, 1),
    })) || body.items;

  const total =
    body.dental?.total ??
    (items
      ? items.reduce((s, i) => s + (i.quantity || 1) * (i.unitPrice || 0), 0)
      : existing.total);

  const prevExtras = parseExtras(existing.notes);
  const notesPayload = JSON.stringify({
    text: body.notes ?? prevExtras?.text ?? "",
    dental: body.dental ?? prevExtras?.dental,
  });

  if (items) {
    await prisma.budgetItem.deleteMany({ where: { budgetId: id } });
  }

  const row = await prisma.budget.update({
    where: { id },
    data: {
      status: body.dental?.status || body.status || existing.status,
      total,
      notes: notesPayload,
      professionalId:
        body.professionalId !== undefined
          ? body.professionalId
          : existing.professionalId,
      ...(items
        ? {
            items: {
              create: items.map((i) => ({
                description: i.description,
                quantity: i.quantity || 1,
                unitPrice: i.unitPrice || 0,
              })),
            },
          }
        : {}),
    },
    include: { patient: true, items: true },
  });

  return NextResponse.json({ budget: serializeBudget(row) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const result = await prisma.budget.deleteMany({
    where: { id, clinicId: session.clinicId },
  });
  if (!result.count) return jsonError("Orçamento não encontrado.", 404);

  return NextResponse.json({ ok: true });
}
