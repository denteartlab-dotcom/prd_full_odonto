import type { ProcedureCatalogItem } from "./budget-types";
import { extractJsonObject } from "./receituario-assistente";

export type ProcedureAiSearchResult = {
  items: ProcedureCatalogItem[];
  provider: string | null;
  detail?: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugId(name: string) {
  return `ai-${normalize(name).replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
}

function systemPrompt() {
  return `Você é um assistente odontológico brasileiro especializado em procedimentos clínicos e protéticos.
O usuário busca procedimentos que podem não estar em tabelas TUSS clássicas (ex.: protocolo cerâmico, protocolo resinoso, All-on-4, carga imediata, facetas, etc.).
Responda APENAS JSON válido no formato:
{
  "procedures": [
    {
      "code": "código TUSS se souber, senão PRxxxxxx",
      "name": "nome do procedimento em português",
      "category": "categoria (Implantodontia, Prótese, Estética, etc.)",
      "price": número em R$ (valor médio cobrado em clínica particular no Brasil),
      "estimatedMinutes": número inteiro de minutos
    }
  ]
}
Retorne de 1 a 8 procedimentos relevantes à busca.
Valores devem ser média de mercado particular (não tabela de convênio).
Não invente procedimentos absurdos. Se a busca for ambígua, sugira as variantes mais comuns.`;
}

function parseProceduresPayload(raw: unknown): ProcedureCatalogItem[] {
  if (!raw || typeof raw !== "object") return [];
  const data = raw as {
    procedures?: Array<{
      code?: string;
      name?: string;
      category?: string;
      price?: number;
      estimatedMinutes?: number;
    }>;
  };
  const rows = Array.isArray(data.procedures) ? data.procedures : [];
  const out: ProcedureCatalogItem[] = [];

  for (const row of rows) {
    const name = String(row.name || "").trim();
    if (!name) continue;
    const price = Number(row.price);
    const minutes = Number(row.estimatedMinutes);
    out.push({
      id: slugId(name),
      code: String(row.code || `PR${String(out.length + 1).padStart(6, "0")}`).trim(),
      name,
      category: String(row.category || "Odontologia").trim() || "Odontologia",
      price: Number.isFinite(price) && price > 0 ? Math.round(price) : 500,
      estimatedMinutes:
        Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 60,
      source: "ai",
    });
  }

  return out;
}

async function callChatJson(opts: {
  provider: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  pickContent: (data: unknown) => string;
}): Promise<{ items: ProcedureCatalogItem[]; detail?: string }> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: opts.headers,
    body: JSON.stringify(opts.body),
  });
  const rawText = await res.text();
  if (!res.ok) {
    return {
      items: [],
      detail: `${opts.provider} falhou (${res.status}): ${rawText.slice(0, 160)}`,
    };
  }
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    return { items: [], detail: `${opts.provider}: resposta inválida.` };
  }
  const content = opts.pickContent(data);
  const parsed = extractJsonObject(content);
  const items = parseProceduresPayload(parsed);
  if (!items.length) {
    return { items: [], detail: `${opts.provider}: JSON sem procedimentos.` };
  }
  return { items };
}

async function searchWithGroq(query: string): Promise<ProcedureAiSearchResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return { items: [], provider: null, detail: "GROQ_API_KEY ausente." };
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const once = await callChatJson({
    provider: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: {
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `Busca de procedimento odontológico: "${query}"`,
        },
      ],
    },
    pickContent: (data) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  });
  return {
    items: once.items,
    provider: once.items.length ? "groq" : null,
    detail: once.detail || model,
  };
}

async function searchWithGemini(query: string): Promise<ProcedureAiSearchResult> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    return { items: [], provider: null, detail: "GEMINI_API_KEY ausente." };
  }

  const preferred = process.env.GEMINI_MODEL?.trim();
  const models = [
    preferred,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastDetail = "Gemini indisponível.";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const once = await callChatJson({
      provider: "gemini",
      url,
      headers: { "Content-Type": "application/json" },
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt()}\n\nBusca de procedimento odontológico: "${query}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      },
      pickContent: (data) => {
        const d = data as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        return d.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      },
    });
    if (once.items.length) {
      return { items: once.items, provider: "gemini", detail: model };
    }
    lastDetail = once.detail || lastDetail;
  }
  return { items: [], provider: null, detail: lastDetail };
}

async function searchWithOpenAi(query: string): Promise<ProcedureAiSearchResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { items: [], provider: null, detail: "OPENAI_API_KEY ausente." };
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const once = await callChatJson({
    provider: "openai",
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: {
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `Busca de procedimento odontológico: "${query}"`,
        },
      ],
    },
    pickContent: (data) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  });
  return {
    items: once.items,
    provider: once.items.length ? "openai" : null,
    detail: once.detail || model,
  };
}

/** Heurística local para termos comerciais comuns quando a IA não está configurada. */
export function localAiStyleFallback(query: string): ProcedureCatalogItem[] {
  const q = normalize(query);
  if (!q || q.length < 3) return [];

  const suggestions: ProcedureCatalogItem[] = [];

  const push = (item: Omit<ProcedureCatalogItem, "source" | "id">) => {
    suggestions.push({ ...item, id: slugId(item.name), source: "ai" });
  };

  if (/protocolo/.test(q) && /ceram|zircon|porcel/.test(q)) {
    push({
      code: "85500240",
      name: "Protocolo cerâmico sobre implantes",
      category: "Implantodontia",
      price: 28000,
      estimatedMinutes: 240,
    });
  }
  if (/protocolo/.test(q) && /resin|acril/.test(q)) {
    push({
      code: "85500259",
      name: "Protocolo resinoso sobre implantes",
      category: "Implantodontia",
      price: 18000,
      estimatedMinutes: 210,
    });
  }
  if (/protocolo/.test(q) && !suggestions.length) {
    push({
      code: "85500240",
      name: "Protocolo cerâmico sobre implantes",
      category: "Implantodontia",
      price: 28000,
      estimatedMinutes: 240,
    });
    push({
      code: "85500259",
      name: "Protocolo resinoso sobre implantes",
      category: "Implantodontia",
      price: 18000,
      estimatedMinutes: 210,
    });
    push({
      code: "85500267",
      name: "Protocolo provisório (carga imediata)",
      category: "Implantodontia",
      price: 12000,
      estimatedMinutes: 180,
    });
  }
  if (/all[\s-]?on[\s-]?[46]|allon/.test(q)) {
    push({
      code: "85500275",
      name: "Reabilitação All-on-4 / All-on-6",
      category: "Implantodontia",
      price: 35000,
      estimatedMinutes: 300,
    });
  }

  return suggestions;
}

/**
 * Busca procedimentos via IA (Groq → Gemini → OpenAI),
 * com fallback heurístico local se não houver keys.
 */
export async function searchDentalProceduresWithAi(
  query: string,
  limit = 8
): Promise<ProcedureAiSearchResult> {
  const q = query.trim();
  if (q.length < 3) {
    return { items: [], provider: null, detail: "Busca muito curta para IA." };
  }

  const capped = Math.min(Math.max(limit, 1), 12);

  const groq = await searchWithGroq(q);
  if (groq.items.length) {
    return { ...groq, items: groq.items.slice(0, capped) };
  }

  const gemini = await searchWithGemini(q);
  if (gemini.items.length) {
    return { ...gemini, items: gemini.items.slice(0, capped) };
  }

  const openai = await searchWithOpenAi(q);
  if (openai.items.length) {
    return { ...openai, items: openai.items.slice(0, capped) };
  }

  const local = localAiStyleFallback(q).slice(0, capped);
  return {
    items: local,
    provider: local.length ? "heuristic" : null,
    detail:
      groq.detail ||
      gemini.detail ||
      openai.detail ||
      (local.length ? "Fallback local de protocolos" : "Sem resultados"),
  };
}
