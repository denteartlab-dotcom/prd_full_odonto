/**
 * Cliente server-side da Bulapi (https://bulapi.com.br).
 * Gratuita, sem autenticação — dados ANVISA/CMED.
 */
const DEFAULT_BASE = "https://bulapi.com.br";

export function getBulapiBaseUrl() {
  return (process.env.MEDICATION_API_URL || DEFAULT_BASE).replace(/\/$/, "");
}

export function isBulapiEnabled() {
  // Bulapi é free/sem key: fica ativa por padrão.
  // MEDICATION_API_DISABLED=1 desliga a consulta externa.
  return process.env.MEDICATION_API_DISABLED !== "1";
}

export async function bulapiFetch<T = unknown>(
  path: string,
  searchParams?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = new URL(
    `${getBulapiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
  );

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Bulapi indisponível (${res.status})${text ? `: ${text.slice(0, 160)}` : ""}`
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error("Bulapi retornou resposta não-JSON.");
  }

  return (await res.json()) as T;
}

/** Tenta rotas comuns da Bulapi até achar uma que responda JSON. */
export async function bulapiSearchRaw(query: string): Promise<unknown> {
  const q = query.trim();
  const attempts: Array<{ path: string; params: Record<string, string | number> }> = [
    { path: "/api/produtos", params: { q, limit: 30 } },
    { path: "/api/produtos", params: { nome: q, limit: 30 } },
    { path: "/api/produtos", params: { search: q, limit: 30 } },
    { path: "/api/v1/produtos", params: { q, limit: 30 } },
    { path: "/produtos", params: { q, limit: 30 } },
    { path: "/api/substancias", params: { q, limit: 30 } },
    { path: "/api/apresentacoes", params: { q, limit: 30 } },
  ];

  let lastError: Error | null = null;
  for (const attempt of attempts) {
    try {
      return await bulapiFetch(attempt.path, attempt.params);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Bulapi: nenhum endpoint de busca respondeu.");
}

export async function bulapiGetByIdRaw(id: string): Promise<unknown> {
  const attempts = [
    `/api/produtos/${encodeURIComponent(id)}`,
    `/api/v1/produtos/${encodeURIComponent(id)}`,
    `/produtos/${encodeURIComponent(id)}`,
    `/api/apresentacoes/${encodeURIComponent(id)}`,
  ];

  let lastError: Error | null = null;
  for (const path of attempts) {
    try {
      return await bulapiFetch(path);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Bulapi: produto não encontrado.");
}
