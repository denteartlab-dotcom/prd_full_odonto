import { prisma } from "@/lib/db";
import {
  asaasConfigurado,
  asaasStatusEhPago,
  billingTypeFromMethod,
  getAsaasConfigFromEnv,
} from "@/lib/asaas-config";
import {
  criarOuBuscarClienteAsaas,
  emitirCobrancaAsaas,
  obterPagamentoAsaas,
  obterQrCodePixAsaas,
} from "@/lib/asaas-client";

export type EmitirCobrancaResult = {
  receivableId: string;
  asaasPaymentId: string;
  billingType: "PIX" | "BOLETO";
  status: string;
  bankSlipUrl?: string | null;
  invoiceUrl?: string | null;
  pixPayload?: string | null;
  pixQrImage?: string | null;
  linhaDigitavel?: string | null;
};

export async function emitirCobrancaParaReceivable(params: {
  receivableId: string;
  clinicId: string;
  billingType?: "PIX" | "BOLETO";
}): Promise<EmitirCobrancaResult> {
  const config = getAsaasConfigFromEnv();
  if (!asaasConfigurado(config)) {
    throw new Error(
      "Asaas não configurado. Defina ASAAS_API_KEY (e ASAAS_WEBHOOK_TOKEN) no .env."
    );
  }

  const receivable = await prisma.receivable.findFirst({
    where: { id: params.receivableId, clinicId: params.clinicId },
    include: { patient: true },
  });
  if (!receivable) throw new Error("Título a receber não encontrado.");
  if (receivable.status === "pago") {
    throw new Error("Título já está pago.");
  }

  const billingType =
    params.billingType ||
    billingTypeFromMethod(receivable.method) ||
    "PIX";

  if (receivable.asaasPaymentId) {
    // Já existe: atualiza QR se PIX
    let pixPayload = receivable.asaasPixPayload;
    let pixQrImage = receivable.asaasPixQrImage;
    if (billingType === "PIX" && (!pixPayload || !pixQrImage)) {
      const qr = await obterQrCodePixAsaas(config, receivable.asaasPaymentId);
      pixPayload = qr.payload;
      pixQrImage = qr.encodedImage;
      await prisma.receivable.update({
        where: { id: receivable.id },
        data: {
          asaasPixPayload: pixPayload,
          asaasPixQrImage: pixQrImage,
        },
      });
    }
    return {
      receivableId: receivable.id,
      asaasPaymentId: receivable.asaasPaymentId,
      billingType: (receivable.asaasBillingType as "PIX" | "BOLETO") || billingType,
      status: receivable.asaasStatus || "PENDING",
      bankSlipUrl: receivable.asaasBankSlipUrl,
      invoiceUrl: receivable.asaasInvoiceUrl,
      pixPayload,
      pixQrImage,
      linhaDigitavel: receivable.asaasLinhaDigitavel,
    };
  }

  if (!receivable.patient) {
    throw new Error("Vincule um paciente ao título para gerar cobrança Asaas.");
  }
  const patient = receivable.patient;
  if (!patient.cpf?.replace(/\D/g, "")) {
    throw new Error("Paciente precisa de CPF para cobrança no Asaas.");
  }

  const customerId = await criarOuBuscarClienteAsaas({
    config,
    name: patient.name,
    cpfCnpj: patient.cpf,
    email: patient.email,
    phone: patient.phone,
    existingCustomerId: patient.asaasCustomerId,
  });

  if (!patient.asaasCustomerId) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { asaasCustomerId: customerId },
    });
  }

  const payment = await emitirCobrancaAsaas({
    config,
    asaasCustomerId: customerId,
    billingType,
    valor: receivable.amount,
    vencimento: receivable.dueDate,
    descricao: receivable.description,
  });

  let pixPayload: string | null = null;
  let pixQrImage: string | null = null;
  if (billingType === "PIX") {
    const qr = await obterQrCodePixAsaas(config, payment.id);
    pixPayload = qr.payload;
    pixQrImage = qr.encodedImage;
  }

  const updated = await prisma.receivable.update({
    where: { id: receivable.id },
    data: {
      method:
        receivable.method ||
        (billingType === "PIX" ? "PIX Asaas" : "Boleto Asaas"),
      asaasPaymentId: payment.id,
      asaasBillingType: billingType,
      asaasStatus: payment.status || "PENDING",
      asaasBankSlipUrl: payment.bankSlipUrl || null,
      asaasInvoiceUrl: payment.invoiceUrl || null,
      asaasLinhaDigitavel: payment.identificationField || pixPayload,
      asaasPixPayload: pixPayload,
      asaasPixQrImage: pixQrImage,
    },
  });

  return {
    receivableId: updated.id,
    asaasPaymentId: payment.id,
    billingType,
    status: updated.asaasStatus || "PENDING",
    bankSlipUrl: updated.asaasBankSlipUrl,
    invoiceUrl: updated.asaasInvoiceUrl,
    pixPayload: updated.asaasPixPayload,
    pixQrImage: updated.asaasPixQrImage,
    linhaDigitavel: updated.asaasLinhaDigitavel,
  };
}

/** Marca título como pago a partir do status Asaas (webhook ou sync). */
export async function sincronizarPagamentoAsaas(params: {
  paymentId: string;
  status?: string | null;
}) {
  const receivable = await prisma.receivable.findFirst({
    where: { asaasPaymentId: params.paymentId },
  });
  if (!receivable) return { ok: false as const, reason: "not_found" };

  let statusAsaas = params.status || receivable.asaasStatus || "";
  if (!statusAsaas) {
    const config = getAsaasConfigFromEnv();
    if (asaasConfigurado(config)) {
      const payment = await obterPagamentoAsaas(config, params.paymentId);
      statusAsaas = payment.status;
    }
  }

  await prisma.receivable.update({
    where: { id: receivable.id },
    data: { asaasStatus: statusAsaas || receivable.asaasStatus },
  });

  if (!asaasStatusEhPago(statusAsaas)) {
    return { ok: true as const, paid: false, receivableId: receivable.id };
  }

  if (receivable.status === "pago") {
    return { ok: true as const, paid: true, receivableId: receivable.id, already: true };
  }

  await prisma.receivable.update({
    where: { id: receivable.id },
    data: {
      status: "pago",
      paidAt: new Date(),
      method: receivable.method || "Asaas",
      asaasStatus: statusAsaas,
    },
  });

  await prisma.cashMovement.create({
    data: {
      clinicId: receivable.clinicId,
      type: "entrada",
      description: `Recebimento Asaas: ${receivable.description}`,
      amount: receivable.amount,
      date: new Date(),
    },
  });

  return { ok: true as const, paid: true, receivableId: receivable.id };
}
