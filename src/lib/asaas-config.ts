export type AsaasAmbiente = "sandbox" | "producao";

export type AsaasConfig = {
  apiKey: string;
  ambiente: AsaasAmbiente;
  webhookToken: string;
};

export const ASAAS_CONFIG_PADRAO: AsaasConfig = {
  apiKey: "",
  ambiente: "sandbox",
  webhookToken: "",
};

export function urlBaseAsaas(ambiente: AsaasAmbiente) {
  return ambiente === "producao"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";
}

export function getAsaasConfigFromEnv(): AsaasConfig {
  const apiKey =
    process.env.ASAAS_API_KEY?.trim() ||
    process.env.ASAAS_PLATAFORMA_API_KEY?.trim() ||
    "";
  const ambienteRaw =
    process.env.ASAAS_AMBIENTE?.trim() ||
    process.env.ASAAS_PLATAFORMA_AMBIENTE?.trim() ||
    "sandbox";
  const ambiente: AsaasAmbiente =
    ambienteRaw === "producao" ? "producao" : "sandbox";
  const webhookToken =
    process.env.ASAAS_WEBHOOK_TOKEN?.trim() ||
    process.env.ASAAS_PLATAFORMA_WEBHOOK_TOKEN?.trim() ||
    "";
  return { apiKey, ambiente, webhookToken };
}

export function asaasConfigurado(config = getAsaasConfigFromEnv()) {
  return Boolean(config.apiKey);
}

export const ASAAS_STATUS_PAGO = [
  "RECEIVED",
  "CONFIRMED",
  "RECEIVED_IN_CASH",
] as const;

export function asaasStatusEhPago(status?: string | null) {
  if (!status) return false;
  return (ASAAS_STATUS_PAGO as readonly string[]).includes(status.toUpperCase());
}

export function formaRecebimentoExigeAsaas(method?: string | null) {
  const m = (method || "").toLowerCase();
  return (
    m.includes("asaas") ||
    m === "pix asaas" ||
    m === "boleto asaas" ||
    m === "pix (asaas)" ||
    m === "boleto (asaas)"
  );
}

export function billingTypeFromMethod(
  method?: string | null
): "PIX" | "BOLETO" | null {
  const m = (method || "").toLowerCase();
  if (m.includes("boleto")) return "BOLETO";
  if (m.includes("pix") || m.includes("asaas")) return "PIX";
  return null;
}
