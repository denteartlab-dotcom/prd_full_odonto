import {
  getMemedApiBase,
  getMemedCredentials,
  getMemedEnvironment,
  type MemedEnvironment,
} from "./config";

type MemedPrescriberResponse = {
  data?: {
    attributes?: {
      token?: string;
      nome?: string;
      sobrenome?: string;
      cpf?: string;
      email?: string;
    };
  };
  errors?: { detail?: string }[];
};

type MemedPrescriptionListResponse = {
  data?: Array<{
    id: string;
    attributes?: Record<string, unknown>;
  }>;
};

function authQuery() {
  const { apiKey, secretKey } = getMemedCredentials();
  return new URLSearchParams({ "api-key": apiKey, "secret-key": secretKey });
}

async function memedFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getMemedApiBase();
  const query = authQuery();
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${base}${path}${separator}${query}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as T & {
    errors?: { detail?: string }[];
  };

  if (!res.ok) {
    const detail = json.errors?.[0]?.detail || `Erro Memed (${res.status})`;
    throw new Error(detail);
  }

  return json;
}

export async function getPrescriberToken(externalId: string) {
  const json = await memedFetch<MemedPrescriberResponse>(
    `/sinapse-prescricao/usuarios/${encodeURIComponent(externalId)}`
  );
  const token = json.data?.attributes?.token;
  if (!token) throw new Error("Token do prescritor Memed não retornado.");
  return token;
}

export async function listMemedPrescriptions(
  prescriberExternalId: string,
  options?: { initialDate?: string; finalDate?: string; limit?: number }
) {
  const token = await getPrescriberToken(prescriberExternalId);
  const base = getMemedApiBase();
  const query = authQuery();
  if (options?.initialDate) query.set("initialDate", options.initialDate);
  if (options?.finalDate) query.set("finalDate", options.finalDate);
  if (options?.limit) query.set("limit", String(options.limit));

  const res = await fetch(`${base}/prescricoes?${query}`, {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as MemedPrescriptionListResponse;
  if (!res.ok) {
    throw new Error("Não foi possível listar prescrições na Memed.");
  }
  return json.data ?? [];
}

export async function getMemedPrescriptionPdfUrl(
  prescriberExternalId: string,
  prescriptionId: string
) {
  const token = await getPrescriberToken(prescriberExternalId);
  const base = getMemedApiBase();
  const query = authQuery();
  const res = await fetch(
    `${base}/prescricoes/${encodeURIComponent(prescriptionId)}/url-documento?${query}`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  const json = (await res.json().catch(() => ({}))) as {
    data?: { attributes?: { url?: string } };
  };
  if (!res.ok) throw new Error("PDF da prescrição não disponível.");
  return json.data?.attributes?.url ?? null;
}

export async function getMemedDigitalLink(
  prescriberExternalId: string,
  prescriptionId: string
) {
  const token = await getPrescriberToken(prescriberExternalId);
  const base = getMemedApiBase();
  const query = authQuery();
  const res = await fetch(
    `${base}/prescricoes/${encodeURIComponent(prescriptionId)}/get-digital-prescription-link?${query}`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  const json = (await res.json().catch(() => ({}))) as {
    data?: { attributes?: { link?: string } };
  };
  if (!res.ok) return null;
  return json.data?.attributes?.link ?? null;
}

export function getPublicMemedConfig() {
  return {
    configured: Boolean(process.env.MEMED_API_KEY && process.env.MEMED_SECRET_KEY),
    environment: getMemedEnvironment() as MemedEnvironment,
    scriptUrl: getMemedApiBase().includes("integrations")
      ? "https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js"
      : "https://memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js",
  };
}
