/**
 * Cliente server-side de medicamentos.api.br (plano Free).
 * Docs: https://medicamentos.api.br/api/docs
 * Auth: header X-API-Key (key grátis por e-mail).
 */

const DEFAULT_BASE =
  "https://southamerica-east1-no-api-br.cloudfunctions.net/apiMedicamentos";

export function isMedicamentosApiConfigured() {
  return Boolean(process.env.MEDICATION_API_KEY?.trim());
}

function getBaseUrl() {
  return (process.env.MEDICATION_API_URL || DEFAULT_BASE).replace(/\/$/, "");
}

export type MedicamentosApiItem = {
  registro?: string;
  nome?: string;
  fabricante?: string;
  principioAtivo?: string;
  classe?: string;
  categoria?: string;
  tipo?: string;
  slug?: string;
  precosCMED?: {
    pf?: number | null;
    pmvg?: number | null;
    referencia?: string;
  } | null;
};

export type MedicamentosApiSearchResponse = {
  total?: number;
  pagina?: number;
  totalPaginas?: number;
  porPagina?: number;
  referenciaDados?: string;
  resultados?: MedicamentosApiItem[];
  registro?: string;
  ean?: string;
  erro?: string;
  mensagem?: string;
};

export async function medicamentosApiFetch<T = unknown>(
  path: string,
  searchParams?: Record<string, string | number | undefined>
): Promise<T> {
  const apiKey = process.env.MEDICATION_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "MEDICATION_API_KEY não configurada. Gere grátis em https://medicamentos.api.br/api#free"
    );
  }

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
      "X-API-Key": apiKey,
    },
    cache: "no-store",
  });

  const raw = await res.text();
  let data: T & { erro?: string; mensagem?: string };
  try {
    data = (raw ? JSON.parse(raw) : {}) as T & {
      erro?: string;
      mensagem?: string;
    };
  } catch {
    throw new Error(`medicamentos.api.br retornou resposta inválida (${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(
      data.mensagem ||
        data.erro ||
        `medicamentos.api.br indisponível (${res.status}).`
    );
  }

  return data;
}

export async function medicamentosApiSearch(nome: string, pagina = 1) {
  return medicamentosApiFetch<MedicamentosApiSearchResponse>("/v1/medicamentos", {
    nome,
    pagina,
  });
}

export async function medicamentosApiGetByRegistro(registro: string) {
  return medicamentosApiFetch<MedicamentosApiSearchResponse>(
    `/v1/medicamentos/${encodeURIComponent(registro)}`
  );
}

export async function medicamentosApiGetByEan(ean: string) {
  return medicamentosApiFetch<MedicamentosApiSearchResponse>(
    `/v1/ean/${encodeURIComponent(ean)}`
  );
}
