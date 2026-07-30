import { timingSafeEqual } from "crypto";
import {
  getAsaasConfigFromEnv,
  urlBaseAsaas,
  type AsaasConfig,
} from "@/lib/asaas-config";

export type AsaasCustomer = {
  id: string;
  name: string;
  cpfCnpj?: string;
};

export type AsaasPayment = {
  id: string;
  status: string;
  bankSlipUrl?: string | null;
  invoiceUrl?: string | null;
  identificationField?: string | null;
  dueDate?: string;
};

export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate?: string;
};

function tokenIgual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function listarWebhookTokensAsaas(): string[] {
  const tokens = new Set<string>();
  const cfg = getAsaasConfigFromEnv();
  if (cfg.webhookToken) tokens.add(cfg.webhookToken);
  const extras = [
    process.env.ASAAS_WEBHOOK_TOKEN,
    process.env.ASAAS_PLATAFORMA_WEBHOOK_TOKEN,
    process.env.ASAAS_CONTA_MAE_WEBHOOK_TOKEN,
  ];
  for (const t of extras) {
    const v = t?.trim();
    if (v) tokens.add(v);
  }
  return [...tokens];
}

export function validarWebhookTokenAsaas(tokenRecebido: string): boolean {
  const configurados = listarWebhookTokensAsaas();
  if (configurados.length === 0) {
    // Dev only: permite sem token fora de produção se liberado
    return (
      process.env.NODE_ENV !== "production" &&
      process.env.WEBHOOK_ALLOW_INSECURE === "true"
    );
  }
  if (!tokenRecebido) return false;
  return configurados.some((t) => tokenIgual(t, tokenRecebido));
}

export async function asaasFetch<T>(
  config: AsaasConfig,
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!config.apiKey) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }
  const url = `${urlBaseAsaas(config.ambiente)}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: config.apiKey,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = data as { errors?: Array<{ description?: string }>; message?: string };
    const msg =
      err?.errors?.[0]?.description ||
      err?.message ||
      `Asaas falhou (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export async function criarOuBuscarClienteAsaas(params: {
  config: AsaasConfig;
  name: string;
  cpfCnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  existingCustomerId?: string | null;
}): Promise<string> {
  if (params.existingCustomerId) return params.existingCustomerId;

  const cpfCnpj = (params.cpfCnpj || "").replace(/\D/g, "");
  if (cpfCnpj) {
    const found = await asaasFetch<{ data?: AsaasCustomer[] }>(
      params.config,
      `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`
    );
    const id = found.data?.[0]?.id;
    if (id) return id;
  }

  const created = await asaasFetch<AsaasCustomer>(params.config, "/customers", {
    method: "POST",
    body: JSON.stringify({
      name: params.name.slice(0, 100),
      cpfCnpj: cpfCnpj || undefined,
      email: params.email || undefined,
      mobilePhone: (params.phone || "").replace(/\D/g, "") || undefined,
      notificationDisabled: true,
    }),
  });
  return created.id;
}

export async function emitirCobrancaAsaas(params: {
  config: AsaasConfig;
  asaasCustomerId: string;
  billingType: "PIX" | "BOLETO";
  valor: number;
  vencimento: Date;
  descricao: string;
}): Promise<AsaasPayment> {
  const dueDate = params.vencimento.toISOString().slice(0, 10);
  return asaasFetch<AsaasPayment>(params.config, "/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: params.asaasCustomerId,
      billingType: params.billingType,
      value: Number(params.valor.toFixed(2)),
      dueDate,
      description: params.descricao.slice(0, 500),
    }),
  });
}

export async function obterQrCodePixAsaas(
  config: AsaasConfig,
  paymentId: string
): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(
    config,
    `/payments/${paymentId}/pixQrCode`
  );
}

export async function obterPagamentoAsaas(
  config: AsaasConfig,
  paymentId: string
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(config, `/payments/${paymentId}`);
}
