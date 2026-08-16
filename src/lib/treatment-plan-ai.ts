import type { ProcedureCatalogItem } from "./budget-types";
import { extractJsonObject } from "./receituario-assistente";

export type TreatmentPlanSuggestion = ProcedureCatalogItem & {
  order: number;
  reason: string;
  priority: "urgente" | "alta" | "media" | "baixa";
};

export type TreatmentPlanAiResult = {
  summary: string;
  diagnosisHint: string;
  suggestions: TreatmentPlanSuggestion[];
  notes: string;
  alerts: string[];
  provider: string | null;
  detail?: string;
};

type AiAttempt = { provider: string; ok: boolean; detail?: string };

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugId(name: string) {
  return `tp-ai-${normalize(name).replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
}

function systemPrompt() {
  return `Você é um assistente clínico odontológico brasileiro especializado em plano de tratamento.
Com base na queixa do paciente, sugira um plano de tratamento ordenado (etapas clínicas) com procedimentos típicos de clínica particular no Brasil.
Responda APENAS JSON válido no formato:
{
  "summary": "resumo clínico curto da queixa e abordagem",
  "diagnosisHint": "hipótese diagnóstica inicial (não substitui exame clínico)",
  "notes": "orientações gerais ao profissional",
  "alerts": ["alertas clínicos relevantes"],
  "procedures": [
    {
      "order": 1,
      "code": "código TUSS se souber, senão PRxxxxxx",
      "name": "nome do procedimento em português",
      "category": "categoria (Endodontia, Periodontia, Cirurgia, etc.)",
      "price": número em R$ (média particular Brasil),
      "estimatedMinutes": número inteiro de minutos,
      "priority": "urgente|alta|media|baixa",
      "reason": "por que incluir nesta etapa"
    }
  ]
}
Retorne de 2 a 8 procedimentos em ordem lógica de tratamento (urgência → definitivo → reabilitação/controle).
Não invente procedimentos absurdos. Seja conservador e clínico.
Deixe claro que é sugestão de apoio — o dentista valida após exame.`;
}

function parsePriority(value: unknown): TreatmentPlanSuggestion["priority"] {
  const v = String(value || "")
    .toLowerCase()
    .trim();
  if (v === "urgente" || v === "alta" || v === "media" || v === "baixa") return v;
  if (v === "média" || v === "medio" || v === "médio") return "media";
  return "media";
}

function parsePayload(raw: unknown): Omit<TreatmentPlanAiResult, "provider" | "detail"> | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as {
    summary?: string;
    diagnosisHint?: string;
    notes?: string;
    alerts?: unknown;
    procedures?: Array<{
      order?: number;
      code?: string;
      name?: string;
      category?: string;
      price?: number;
      estimatedMinutes?: number;
      priority?: string;
      reason?: string;
    }>;
  };

  const rows = Array.isArray(data.procedures) ? data.procedures : [];
  const suggestions: TreatmentPlanSuggestion[] = [];

  for (const row of rows) {
    const name = String(row.name || "").trim();
    if (!name) continue;
    const price = Number(row.price);
    const minutes = Number(row.estimatedMinutes);
    const order = Number(row.order);
    suggestions.push({
      id: slugId(name),
      code: String(row.code || `PR${String(suggestions.length + 1).padStart(6, "0")}`).trim(),
      name,
      category: String(row.category || "Odontologia").trim() || "Odontologia",
      price: Number.isFinite(price) && price > 0 ? Math.round(price) : 350,
      estimatedMinutes:
        Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 45,
      source: "ai",
      order: Number.isFinite(order) && order > 0 ? Math.round(order) : suggestions.length + 1,
      reason: String(row.reason || "Sugestão clínica baseada na queixa.").trim(),
      priority: parsePriority(row.priority),
    });
  }

  if (!suggestions.length) return null;

  suggestions.sort((a, b) => a.order - b.order);
  suggestions.forEach((s, i) => {
    s.order = i + 1;
  });

  return {
    summary: String(data.summary || "Plano sugerido a partir da queixa.").trim(),
    diagnosisHint: String(data.diagnosisHint || "").trim(),
    notes: String(data.notes || "").trim(),
    alerts: Array.isArray(data.alerts) ? data.alerts.map(String) : [],
    suggestions,
  };
}

async function callChatJson(opts: {
  provider: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  pickContent: (data: unknown) => string;
}): Promise<{ result: Omit<TreatmentPlanAiResult, "provider" | "detail"> | null; detail?: string }> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: opts.headers,
    body: JSON.stringify(opts.body),
  });
  const rawText = await res.text();
  if (!res.ok) {
    return {
      result: null,
      detail: `${opts.provider} falhou (${res.status}): ${rawText.slice(0, 160)}`,
    };
  }
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    return { result: null, detail: `${opts.provider}: resposta inválida.` };
  }
  const content = opts.pickContent(data);
  const parsed = extractJsonObject(content);
  const result = parsePayload(parsed);
  if (!result) {
    return { result: null, detail: `${opts.provider}: JSON sem procedimentos.` };
  }
  return { result };
}

function userMessage(complaint: string, context?: { age?: string; allergies?: string; notes?: string }) {
  return JSON.stringify({
    queixa: complaint,
    idade: context?.age || "",
    alergias: context?.allergies || "",
    observacoes: context?.notes || "",
    instrucao:
      "Monte um plano de tratamento odontológico ordenado em JSON, priorizando urgência e lógica clínica.",
  });
}

async function withGroq(
  complaint: string,
  context?: { age?: string; allergies?: string; notes?: string }
): Promise<{ result: Omit<TreatmentPlanAiResult, "provider" | "detail"> | null; attempt: AiAttempt }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return {
      result: null,
      attempt: { provider: "groq", ok: false, detail: "GROQ_API_KEY ausente." },
    };
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
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userMessage(complaint, context) },
      ],
    },
    pickContent: (data) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  });
  return {
    result: once.result,
    attempt: {
      provider: "groq",
      ok: Boolean(once.result),
      detail: once.result ? model : once.detail,
    },
  };
}

async function withGemini(
  complaint: string,
  context?: { age?: string; allergies?: string; notes?: string }
): Promise<{ result: Omit<TreatmentPlanAiResult, "provider" | "detail"> | null; attempt: AiAttempt }> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    return {
      result: null,
      attempt: { provider: "gemini", ok: false, detail: "GEMINI_API_KEY ausente." },
    };
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
                text: `${systemPrompt()}\n\n${userMessage(complaint, context)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json",
        },
      },
      pickContent: (data) => {
        const d = data as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        return (
          d.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || ""
        );
      },
    });
    if (once.result) {
      return {
        result: once.result,
        attempt: { provider: "gemini", ok: true, detail: model },
      };
    }
    lastDetail = once.detail || lastDetail;
  }
  return {
    result: null,
    attempt: { provider: "gemini", ok: false, detail: lastDetail },
  };
}

async function withOpenAi(
  complaint: string,
  context?: { age?: string; allergies?: string; notes?: string }
): Promise<{ result: Omit<TreatmentPlanAiResult, "provider" | "detail"> | null; attempt: AiAttempt }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      result: null,
      attempt: { provider: "openai", ok: false, detail: "OPENAI_API_KEY ausente." },
    };
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
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userMessage(complaint, context) },
      ],
    },
    pickContent: (data) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  });
  return {
    result: once.result,
    attempt: {
      provider: "openai",
      ok: Boolean(once.result),
      detail: once.result ? model : once.detail,
    },
  };
}

/** Fallback local quando não há keys de IA. */
export function buildLocalTreatmentPlan(complaint: string): TreatmentPlanAiResult {
  const q = normalize(complaint);
  const suggestions: TreatmentPlanSuggestion[] = [];

  const push = (
    item: Omit<TreatmentPlanSuggestion, "id" | "source" | "order"> & { order?: number }
  ) => {
    suggestions.push({
      ...item,
      id: slugId(item.name),
      source: "ai",
      order: item.order ?? suggestions.length + 1,
    });
  };

  if (/dor|urgente|abscess|inchac|edema|pus|fistula/.test(q)) {
    push({
      code: "81000065",
      name: "Consulta de urgência odontológica",
      category: "Clínica geral",
      price: 180,
      estimatedMinutes: 30,
      priority: "urgente",
      reason: "Avaliar e aliviar a queixa aguda antes do tratamento definitivo.",
    });
  }

  if (/canal|endodon|pulpite|dor espontanea|dor a frio|dor a quente/.test(q)) {
    push({
      code: "85100194",
      name: "Tratamento endodôntico (canal)",
      category: "Endodontia",
      price: 900,
      estimatedMinutes: 90,
      priority: "alta",
      reason: "Queixa compatível com comprometimento pulpar/endodôntico.",
    });
    push({
      code: "85100240",
      name: "Restauração / reabilitação coronária pós-endodontia",
      category: "Dentística",
      price: 450,
      estimatedMinutes: 60,
      priority: "media",
      reason: "Selamento e proteção do dente tratado.",
    });
  } else if (/cárie|carie|buraco|sensibilidade|restaura/.test(q)) {
    push({
      code: "85100020",
      name: "Restauração em resina composta",
      category: "Dentística",
      price: 280,
      estimatedMinutes: 45,
      priority: "alta",
      reason: "Tratar lesão cariosa e restaurar forma/função.",
    });
  }

  if (/gengiv|sangramento|mau halito|periodont|tartaro|tártaro/.test(q)) {
    push({
      code: "85200015",
      name: "Raspagem, alisamento e polimento coronário",
      category: "Periodontia",
      price: 220,
      estimatedMinutes: 50,
      priority: "alta",
      reason: "Controle de biofilme e inflamação gengival/periodontal.",
    });
    push({
      code: "81000430",
      name: "Aplicação tópica de flúor / orientação de higiene",
      category: "Prevenção",
      price: 80,
      estimatedMinutes: 20,
      priority: "media",
      reason: "Manutenção e educação em saúde bucal.",
    });
  }

  if (/extrac|exodon|siso|terceiro molar|dente mole/.test(q)) {
    push({
      code: "85300045",
      name: "Exodontia (extração dentária)",
      category: "Cirurgia",
      price: 350,
      estimatedMinutes: 40,
      priority: "alta",
      reason: "Remoção do elemento indicado pela queixa clínica.",
    });
  }

  if (/implante|perda dentaria|falta dente|protese|prótese|estetica|estética|faceta/.test(q)) {
    push({
      code: "85400010",
      name: "Avaliação para reabilitação (implante/prótese)",
      category: "Prótese / Implantodontia",
      price: 200,
      estimatedMinutes: 40,
      priority: "media",
      reason: "Planejar reabilitação após controle da queixa principal.",
    });
  }

  if (!suggestions.length) {
    push({
      code: "81000014",
      name: "Consulta odontológica inicial com exame clínico",
      category: "Clínica geral",
      price: 150,
      estimatedMinutes: 40,
      priority: "alta",
      reason: "Avaliação completa para definir o plano definitivo.",
    });
    push({
      code: "81000340",
      name: "Radiografia periapical / interproximal",
      category: "Diagnóstico",
      price: 60,
      estimatedMinutes: 15,
      priority: "alta",
      reason: "Complementar o diagnóstico da queixa descrita.",
    });
    push({
      code: "85100020",
      name: "Tratamento conservador / restauração conforme necessidade",
      category: "Dentística",
      price: 280,
      estimatedMinutes: 45,
      priority: "media",
      reason: "Abordagem inicial frequente após exame e imagem.",
    });
  }

  suggestions.forEach((s, i) => {
    s.order = i + 1;
  });

  return {
    summary:
      "Sugestão local baseada em palavras-chave da queixa (sem IA externa). Revise após exame clínico.",
    diagnosisHint: "Hipótese provisória — confirmar com exame e exames de imagem.",
    notes:
      "Plano gerado por heurística local. Configure GROQ_API_KEY (gratuita) para sugestões mais contextualizadas.",
    alerts: [
      "Sugestão de apoio — não substitui anamnese, exame clínico nem exames complementares.",
    ],
    suggestions,
    provider: "heuristic",
    detail: "Fallback local de plano de tratamento",
  };
}

export async function suggestTreatmentPlanWithAi(
  complaint: string,
  context?: { age?: string; allergies?: string; notes?: string }
): Promise<TreatmentPlanAiResult & { attempts: AiAttempt[] }> {
  const q = complaint.trim();
  if (q.length < 8) {
    return {
      ...buildLocalTreatmentPlan(q || "consulta"),
      summary: "Descreva a queixa com mais detalhes (mín. 8 caracteres).",
      suggestions: [],
      provider: null,
      attempts: [],
    };
  }

  const attempts: AiAttempt[] = [];

  const groq = await withGroq(q, context);
  attempts.push(groq.attempt);
  if (groq.result) {
    return {
      ...groq.result,
      provider: "groq",
      detail: groq.attempt.detail,
      attempts,
      alerts: [
        ...groq.result.alerts,
        "Sugestão de apoio — o dentista deve validar após exame clínico.",
      ],
    };
  }

  const gemini = await withGemini(q, context);
  attempts.push(gemini.attempt);
  if (gemini.result) {
    return {
      ...gemini.result,
      provider: "gemini",
      detail: gemini.attempt.detail,
      attempts,
      alerts: [
        ...gemini.result.alerts,
        "Sugestão de apoio — o dentista deve validar após exame clínico.",
      ],
    };
  }

  const openai = await withOpenAi(q, context);
  attempts.push(openai.attempt);
  if (openai.result) {
    return {
      ...openai.result,
      provider: "openai",
      detail: openai.attempt.detail,
      attempts,
      alerts: [
        ...openai.result.alerts,
        "Sugestão de apoio — o dentista deve validar após exame clínico.",
      ],
    };
  }

  const local = buildLocalTreatmentPlan(q);
  const failed = attempts.filter((a) => !a.ok && a.detail && !a.detail.includes("ausente"));
  return {
    ...local,
    attempts,
    alerts: [
      ...local.alerts,
      failed[0]?.detail ||
        "IA externa indisponível. Usando protocolos locais — revise com cuidado.",
    ],
  };
}
