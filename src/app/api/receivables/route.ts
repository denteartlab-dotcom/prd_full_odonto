import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { billingTypeFromMethod, formaRecebimentoExigeAsaas } from "@/lib/asaas-config";
import { emitirCobrancaParaReceivable } from "@/lib/asaas-receivables";

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

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const rows = await prisma.receivable.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ receivables: rows.map(serialize) });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json()) as {
    patientId?: string | null;
    description?: string;
    amount?: number;
    dueDate?: string;
    method?: string;
    status?: string;
    emitAsaas?: boolean;
  };

  if (!body.description?.trim()) return jsonError("Descrição obrigatória.");
  if (!body.amount || body.amount <= 0) return jsonError("Valor inválido.");
  if (!body.dueDate) return jsonError("Vencimento obrigatório.");

  if (body.patientId) {
    const patient = await prisma.patient.findFirst({
      where: { id: body.patientId, clinicId: session.clinicId },
    });
    if (!patient) return jsonError("Paciente não encontrado.", 404);
  }

  const row = await prisma.receivable.create({
    data: {
      clinicId: session.clinicId,
      patientId: body.patientId || null,
      description: body.description.trim(),
      amount: body.amount,
      dueDate: new Date(`${body.dueDate}T12:00:00`),
      method: body.method || null,
      status: body.status || "aberto",
    },
    include: { patient: true },
  });

  let charge = null;
  const shouldEmit =
    body.emitAsaas !== false && formaRecebimentoExigeAsaas(body.method);
  if (shouldEmit) {
    try {
      charge = await emitirCobrancaParaReceivable({
        receivableId: row.id,
        clinicId: session.clinicId,
        billingType: billingTypeFromMethod(body.method) || "PIX",
      });
    } catch (err) {
      console.error("[POST /api/receivables emit Asaas]", err);
      return NextResponse.json(
        {
          receivable: serialize(row),
          asaasError:
            err instanceof Error
              ? err.message
              : "Título criado, mas a cobrança Asaas falhou.",
        },
        { status: 201 }
      );
    }
  }

  const refreshed = await prisma.receivable.findFirst({
    where: { id: row.id },
    include: { patient: true },
  });

  return NextResponse.json(
    {
      receivable: serialize(refreshed || row),
      charge,
    },
    { status: 201 }
  );
}
