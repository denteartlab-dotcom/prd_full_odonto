import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  listarWebhookTokensAsaas,
  validarWebhookTokenAsaas,
} from "@/lib/asaas-client";
import { asaasConfigurado, getAsaasConfigFromEnv } from "@/lib/asaas-config";
import { sincronizarPagamentoAsaas } from "@/lib/asaas-receivables";
import { isSession, requireApiSession } from "@/lib/api-helpers";

const WEBHOOK_PATH = "/api/asaas/webhook";

const EVENTOS_PAGAMENTO = [
  "PAYMENT_RECEIVED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED_IN_CASH",
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
];

function appUrl(req: Request) {
  const env = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

/** Health / instruções (detalhes com sessão). */
export async function GET(req: Request) {
  const session = await requireApiSession();
  const tokens = listarWebhookTokensAsaas();
  const cfg = getAsaasConfigFromEnv();

  if (!isSession(session)) {
    return NextResponse.json({
      ok: true,
      provedor: "asaas",
      metodoAsaas: "POST",
    });
  }

  return NextResponse.json({
    ok: true,
    provedor: "asaas",
    webhookUrl: `${appUrl(req)}${WEBHOOK_PATH}`,
    metodoAsaas: "POST",
    asaasConfigurado: asaasConfigurado(cfg),
    tokenConfigurado: tokens.length > 0,
    ambiente: cfg.ambiente,
    instrucoes:
      "Cadastre a URL no Asaas (Integrações → Webhooks) e use o header asaas-access-token igual a ASAAS_WEBHOOK_TOKEN. Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED_IN_CASH.",
  });
}

/**
 * Webhook anônimo autenticado por token.
 * Baixa automaticamente o título a receber e lança entrada no caixa.
 */
export async function POST(req: Request) {
  const tokenRecebido =
    req.headers.get("asaas-access-token") ||
    req.headers.get("x-asaas-access-token") ||
    "";

  if (!validarWebhookTokenAsaas(tokenRecebido)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      event?: string;
      payment?: { id?: string; status?: string };
    };

    const evento = body.event || "";
    const paymentId = body.payment?.id;
    const status = body.payment?.status;

    if (!paymentId || !EVENTOS_PAGAMENTO.includes(evento)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const eventKey = `asaas:${evento}:${paymentId}`;
    const existing = await prisma.asaasWebhookEvent.findUnique({
      where: { eventKey },
    });
    if (existing?.processed) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await prisma.asaasWebhookEvent.upsert({
      where: { eventKey },
      create: {
        eventKey,
        event: evento,
        paymentId,
        payload: JSON.stringify(body),
        processed: false,
      },
      update: {
        payload: JSON.stringify(body),
      },
    });

    const result = await sincronizarPagamentoAsaas({ paymentId, status });

    await prisma.asaasWebhookEvent.update({
      where: { eventKey },
      data: { processed: true },
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[POST /api/asaas/webhook]", err);
    return NextResponse.json(
      { error: "Falha ao processar webhook." },
      { status: 500 }
    );
  }
}
