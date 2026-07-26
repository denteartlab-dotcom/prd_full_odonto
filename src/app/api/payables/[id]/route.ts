import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  encodePayableDescription,
  payableToAccount,
} from "@/lib/build-financeiro";

type Params = { params: Promise<{ id: string }> };

function serialize(row: {
  id: string;
  clinicId: string;
  description: string;
  supplier: string | null;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    description: row.description,
    supplier: row.supplier,
    amount: row.amount,
    dueDate: row.dueDate.toISOString().slice(0, 10),
    paidAt: row.paidAt ? row.paidAt.toISOString().slice(0, 10) : null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    account: payableToAccount(row),
  };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const existing = await prisma.payable.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!existing) return jsonError("Conta não encontrada.", 404);

  const body = (await req.json()) as {
    supplier?: string;
    description?: string;
    amount?: number;
    dueDate?: string;
    status?: string;
    markPaid?: boolean;
    category?: string;
    costCenter?: string;
    bankAccount?: string;
    paymentMethod?: string;
    document?: string;
    invoiceNumber?: string;
    responsible?: string;
    notes?: string;
  };

  let status = body.status ?? existing.status;
  let paidAt = existing.paidAt;

  if (body.markPaid || status === "pago") {
    status = "pago";
    paidAt = paidAt || new Date();
  }
  if (status === "aberto" || status === "em_aberto") {
    status = "aberto";
    paidAt = null;
  }

  const description =
    body.description ||
    body.category ||
    body.paymentMethod ||
    body.bankAccount ||
    body.notes
      ? encodePayableDescription({
          description: body.description?.trim() || "Despesa",
          category: body.category,
          costCenter: body.costCenter,
          bankAccount: body.bankAccount,
          paymentMethod: body.paymentMethod,
          document: body.document,
          invoiceNumber: body.invoiceNumber,
          responsible: body.responsible,
          notes: body.notes,
        })
      : existing.description;

  const row = await prisma.payable.update({
    where: { id },
    data: {
      supplier: body.supplier !== undefined ? body.supplier : existing.supplier,
      description,
      amount: body.amount ?? existing.amount,
      dueDate: body.dueDate
        ? new Date(`${body.dueDate}T12:00:00`)
        : existing.dueDate,
      status,
      paidAt,
    },
  });

  if ((body.markPaid || body.status === "pago") && existing.status !== "pago") {
    await prisma.cashMovement.create({
      data: {
        clinicId: session.clinicId,
        type: "saida",
        description: `Pagamento: ${row.supplier || "despesa"}`,
        amount: row.amount,
        date: new Date(),
      },
    });
  }

  return NextResponse.json({ payable: serialize(row) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const result = await prisma.payable.deleteMany({
    where: { id, clinicId: session.clinicId },
  });
  if (!result.count) return jsonError("Conta não encontrada.", 404);

  return NextResponse.json({ ok: true });
}
