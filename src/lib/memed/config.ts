export type MemedEnvironment = "integration" | "production";

const API_BASE: Record<MemedEnvironment, string> = {
  integration: "https://integrations.api.memed.com.br/v1",
  production: "https://api.memed.com.br/v1",
};

const SCRIPT_URL: Record<MemedEnvironment, string> = {
  integration:
    "https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js",
  production:
    "https://memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js",
};

export function getMemedEnvironment(): MemedEnvironment {
  const env = process.env.MEMED_ENVIRONMENT?.toLowerCase();
  return env === "production" ? "production" : "integration";
}

export function isMemedConfigured() {
  return Boolean(process.env.MEMED_API_KEY && process.env.MEMED_SECRET_KEY);
}

export function getMemedApiBase() {
  return API_BASE[getMemedEnvironment()];
}

export function getMemedScriptUrl() {
  return SCRIPT_URL[getMemedEnvironment()];
}

export function getMemedCredentials() {
  const apiKey = process.env.MEMED_API_KEY;
  const secretKey = process.env.MEMED_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("MEMED_API_KEY e MEMED_SECRET_KEY não configuradas.");
  }
  return { apiKey, secretKey };
}

export function resolvePrescriberExternalId(userId: string, memedExternalId?: string | null) {
  return memedExternalId || process.env.MEMED_PRESCRIBER_EXTERNAL_ID || userId;
}
