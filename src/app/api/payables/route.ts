import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  encodePayableDescription,
  payableToAccount,
} from "@/lib/build-financeiro";

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

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const rows = await prisma.payable.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ payables: rows.map(serialize) });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    supplier?: string;
    description?: string;
    amount?: number;
    dueDate?: string;
    status?: string;
    category?: string;
    costCenter?: string;
    bankAccount?: string;
    paymentMethod?: string;
    document?: string;
    invoiceNumber?: string;
    responsible?: string;
    notes?: string;
  };

  if (!body.description?.trim() && !body.supplier?.trim()) {
    return jsonError("Descrição ou fornecedor obrigatório.");
  }
  if (!body.amount || body.amount <= 0) return jsonError("Valor inválido.");
  if (!body.dueDate) return jsonError("Vencimento obrigatório.");

  const description = encodePayableDescription({
    description: body.description?.trim() || body.supplier?.trim() || "Despesa",
    category: body.category,
    costCenter: body.costCenter,
    bankAccount: body.bankAccount,
    paymentMethod: body.paymentMethod,
    document: body.document,
    invoiceNumber: body.invoiceNumber,
    responsible: body.responsible,
    notes: body.notes,
  });

  const row = await prisma.payable.create({
    data: {
      clinicId: session.clinicId,
      supplier: body.supplier?.trim() || null,
      description,
      amount: body.amount,
      dueDate: new Date(`${body.dueDate}T12:00:00`),
      status: body.status || "aberto",
    },
  });

  return NextResponse.json({ payable: serialize(row) }, { status: 201 });
}
