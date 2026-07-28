/**
 * Cliente server-side da PharmaDB (https://pharmadb.com.br/documentacao).
 * Autentica com API key → JWT e nunca expõe a key ao frontend.
 */

const DEFAULT_BASE = "https://api.pharmadb.com.br";

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

export function isPharmaDbConfigured() {
  return Boolean(process.env.MEDICATION_API_KEY?.trim());
}

function getBaseUrl() {
  const raw = (process.env.MEDICATION_API_URL || DEFAULT_BASE).replace(/\/$/, "");
  // Aceita URL com ou sem /v1
  return raw.replace(/\/v1$/, "");
}

async function fetchAccessToken(): Promise<string> {
  const apiKey = process.env.MEDICATION_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("MEDICATION_API_KEY não configurada.");
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const res = await fetch(`${getBaseUrl()}/auth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ api_key: apiKey }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Falha ao autenticar na PharmaDB (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`
    );
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new Error("PharmaDB não retornou access_token.");
  }

  const ttlMs = Math.max(60, Number(data.expires_in) || 3600) * 1000;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + ttlMs,
  };

  return data.access_token;
}

export async function pharmaDbFetch<T = unknown>(
  path: string,
  searchParams?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const token = await fetchAccessToken();
  const url = new URL(
    `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
  );

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `PharmaDB indisponível (${res.status})${text ? `: ${text.slice(0, 160)}` : ""}`
    );
  }

  return (await res.json()) as T;
}

export type PharmaDbProduto = {
  id: number | string;
  nome?: string;
  registro_anvisa?: string;
  categoria?: string;
  categoria_regulatoria?: string;
  tarja?: string;
  laboratorio?: string;
  principios_ativos?: string[];
  classe_terapeutica?: string;
  controlado?: boolean;
  comercializado?: boolean;
  composicao?: Array<{
    pa_id?: number;
    nome_dcb?: string;
    concentracao?: string;
    concentracao_valor?: number;
    concentracao_unidade?: string;
  }>;
  apresentacoes?: Array<{
    id?: number;
    descricao?: string;
    ean_1?: string;
  }>;
};

export type PharmaDbSearchResponse = {
  total?: number;
  items?: PharmaDbProduto[];
};

export type PharmaDbBulaResumo = {
  id: number | string;
  produto_id?: number | string;
  produto_nome?: string;
  tipo?: string;
};

export type PharmaDbBulasResponse = {
  items?: PharmaDbBulaResumo[];
};
