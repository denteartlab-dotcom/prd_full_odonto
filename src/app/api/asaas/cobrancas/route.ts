import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  asaasConfigurado,
  billingTypeFromMethod,
  getAsaasConfigFromEnv,
} from "@/lib/asaas-config";
import { emitirCobrancaParaReceivable } from "@/lib/asaas-receivables";

/** Status da integração Asaas para a clínica. */
export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const cfg = getAsaasConfigFromEnv();
  return NextResponse.json({
    configured: asaasConfigurado(cfg),
    ambiente: cfg.ambiente,
    webhookTokenConfigured: Boolean(cfg.webhookToken),
  });
}

/**
 * POST { receivableId, billingType?: "PIX" | "BOLETO" }
 * Emite cobrança Asaas para o título a receber.
 */
export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json().catch(() => ({}))) as {
    receivableId?: string;
    billingType?: "PIX" | "BOLETO";
    method?: string;
  };

  if (!body.receivableId) {
    return jsonError("receivableId é obrigatório.");
  }

  const billingType =
    body.billingType ||
    billingTypeFromMethod(body.method) ||
    "PIX";

  try {
    const charge = await emitirCobrancaParaReceivable({
      receivableId: body.receivableId,
      clinicId: session.clinicId,
      billingType,
    });
    return NextResponse.json({ charge });
  } catch (err) {
    console.error("[POST /api/asaas/cobrancas]", err);
    return jsonError(
      err instanceof Error ? err.message : "Falha ao emitir cobrança Asaas.",
      400
    );
  }
}
