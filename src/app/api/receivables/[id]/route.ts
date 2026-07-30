import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

function serialize(row: {
  id: string;
  clinicId: string;
  patientId: string | null;
  description: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: string;
  method: string | null;
  createdAt: Date;
  asaasPaymentId: string | null;
  asaasBillingType: string | null;
  asaasStatus: string | null;
  asaasBankSlipUrl: string | null;
  asaasInvoiceUrl: string | null;
  asaasPixPayload: string | null;
  asaasPixQrImage: string | null;
  asaasLinhaDigitavel: string | null;
  patient: { id: string; name: string } | null;
}) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    patientName: row.patient?.name || null,
    description: row.description,
    amount: row.amount,
    dueDate: row.dueDate.toISOString().slice(0, 10),
    paidAt: row.paidAt ? row.paidAt.toISOString().slice(0, 10) : null,
    status: row.status,
    method: row.method,
    createdAt: row.createdAt.toISOString(),
    asaasPaymentId: row.asaasPaymentId,
    asaasBillingType: row.asaasBillingType,
    asaasStatus: row.asaasStatus,
    asaasBankSlipUrl: row.asaasBankSlipUrl,
    asaasInvoiceUrl: row.asaasInvoiceUrl,
    asaasPixPayload: row.asaasPixPayload,
    asaasPixQrImage: row.asaasPixQrImage,
    asaasLinhaDigitavel: row.asaasLinhaDigitavel,
  };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const existing = await prisma.receivable.findFirst({
    where: { id, clinicId: session.clinicId },
  });
  if (!existing) return jsonError("Título não encontrado.", 404);

  const body = (await req.json()) as {
    description?: string;
    amount?: number;
    dueDate?: string;
    method?: string | null;
    status?: string;
    markPaid?: boolean;
  };

  let status = body.status ?? existing.status;
  let paidAt = existing.paidAt;
  let method = body.method !== undefined ? body.method : existing.method;

  if (body.markPaid || status === "pago") {
    status = "pago";
    paidAt = paidAt || new Date();
  }
  if (status === "aberto") {
    paidAt = null;
  }

  const row = await prisma.receivable.update({
    where: { id },
    data: {
      description: body.description?.trim() || existing.description,
      amount: body.amount ?? existing.amount,
      dueDate: body.dueDate
        ? new Date(`${body.dueDate}T12:00:00`)
        : existing.dueDate,
      method,
      status,
      paidAt,
    },
    include: { patient: true },
  });

  if ((body.markPaid || body.status === "pago") && existing.status !== "pago") {
    await prisma.cashMovement.create({
      data: {
        clinicId: session.clinicId,
        type: "entrada",
        description: `Recebimento: ${row.description}`,
        amount: row.amount,
        date: new Date(),
      },
    });
  }

  return NextResponse.json({ receivable: serialize(row) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const result = await prisma.receivable.deleteMany({
    where: { id, clinicId: session.clinicId },
  });
  if (!result.count) return jsonError("Título não encontrado.", 404);

  return NextResponse.json({ ok: true });
}
