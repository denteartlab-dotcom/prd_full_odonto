import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  buildAssistenteSystemPrompt,
  buildLocalAssistenteSuggestion,
  extractJsonObject,
  parseOpenAiAssistentePayload,
  type AssistenteResult,
} from "@/lib/receituario-assistente";
import { DENTAL_MEDICATIONS } from "@/lib/dental-medications";

type AiAttempt = { provider: string; ok: boolean; detail?: string };

function catalogPayload() {
  return DENTAL_MEDICATIONS.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    defaultDose: m.defaultDose,
    defaultFrequency: m.defaultFrequency,
    defaultDuration: m.defaultDuration,
  }));
}

function userPayload(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}) {
  return JSON.stringify({
    procedimento: input.prompt,
    alergias: input.allergies || "",
    doencas: input.diseases || "",
    medicamentosEmUso: input.medicationsInUse || "",
    catalogoOdontologicoReferencia: catalogPayload(),
    instrucao:
      "Pesquise protocolos odontológicos atuais e monte a sugestão de receita em JSON, com posologias usuais no Brasil. Para candidíase oral use antifúngicos (nistatina/miconazol/fluconazol), nunca só analgésico.",
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeGeminiError(status: number, body: string) {
  if (status === 429) {
    return "Cota gratuita do Gemini esgotada (429). Aguarde alguns minutos ou gere outra key em aistudio.google.com/apikey e faça Redeploy na Vercel.";
  }
  if (status === 403) {
    return "Gemini recusou a key (403). Confirme GEMINI_API_KEY da AI Studio (geralmente começa com AIza) e permissão do modelo.";
  }
  if (status === 400) {
    return `Gemini rejeitou a requisição (400): ${body.slice(0, 180)}`;
  }
  if (status === 404) {
    return "Modelo Gemini não encontrado (404). Ajuste GEMINI_MODEL.";
  }
  return `Gemini falhou (${status}): ${body.slice(0, 180) || "sem detalhes"}`;
}

async function callGeminiOnce(
  model: string,
  apiKey: string,
  input: {
    prompt: string;
    allergies?: string;
    diseases?: string;
    medicationsInUse?: string;
  },
  withSearch: boolean
): Promise<{ result: AssistenteResult | null; detail?: string; status?: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              buildAssistenteSystemPrompt() +
              "\nUse pesquisa atualizada quando disponível.\n\n" +
              userPayload(input),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      ...(withSearch ? {} : { responseMimeType: "application/json" }),
    },
  };

  if (withSearch) {
    body.tools = [{ google_search: {} }];
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    return { result: null, detail: summarizeGeminiError(res.status, raw), status: res.status };
  }

  let data: {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
      };
    }>;
  };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    return { result: null, detail: "Resposta inválida do Gemini." };
  }

  const candidate = data.candidates?.[0];
  const content = candidate?.content?.parts?.map((p) => p.text || "").join("") || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) {
    return { result: null, detail: `Modelo ${model} respondeu sem JSON utilizável.` };
  }

  const citations =
    candidate?.groundingMetadata?.groundingChunks
      ?.map((c) => c.web?.uri || "")
      .filter(Boolean) || [];

  const result = parseOpenAiAssistentePayload(
    parsedJson,
    input.prompt,
    "gemini",
    citations
  );
  if (!result) {
    return { result: null, detail: `Modelo ${model} retornou JSON sem medicamentos.` };
  }
  return { result, detail: withSearch ? `${model} + Google Search` : model };
}

async function callGemini(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<{ result: AssistenteResult | null; attempt: AiAttempt }> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

  if (!apiKey) {
    return {
      result: null,
      attempt: {
        provider: "gemini",
        ok: false,
        detail: "GEMINI_API_KEY não encontrada no ambiente (Vercel/.env).",
      },
    };
  }

  const preferred = process.env.GEMINI_MODEL?.trim();
  const models = [
    preferred,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-flash-latest",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastDetail = "Falha desconhecida no Gemini.";

  for (const model of models) {
    // 1) com pesquisa Google (IA de pesquisa)
    let once = await callGeminiOnce(model, apiKey, input, true);
    if (once.result) {
      return {
        result: once.result,
        attempt: { provider: "gemini", ok: true, detail: once.detail },
      };
    }
    if (once.status === 429) {
      await sleep(1200);
      once = await callGeminiOnce(model, apiKey, input, true);
      if (once.result) {
        return {
          result: once.result,
          attempt: { provider: "gemini", ok: true, detail: once.detail },
        };
      }
    }

    // 2) sem search (mais compatível / menos cota)
    once = await callGeminiOnce(model, apiKey, input, false);
    if (once.result) {
      return {
        result: once.result,
        attempt: { provider: "gemini", ok: true, detail: once.detail },
      };
    }

    lastDetail = once.detail || lastDetail;
    if (once.status && once.status !== 404 && once.status !== 403) {
      // 429 etc.: não gastar todos os modelos se a cota é global
      if (once.status === 429) break;
    }
  }

  return {
    result: null,
    attempt: { provider: "gemini", ok: false, detail: lastDetail },
  };
}

async function callPerplexity(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<{ result: AssistenteResult | null; attempt: AiAttempt }> {
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) {
    return {
      result: null,
      attempt: { provider: "perplexity", ok: false, detail: "PERPLEXITY_API_KEY ausente." },
    };
  }

  const model = process.env.PERPLEXITY_MODEL || "sonar";
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: buildAssistenteSystemPrompt() },
        { role: "user", content: userPayload(input) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return {
      result: null,
      attempt: {
        provider: "perplexity",
        ok: false,
        detail: `Perplexity falhou (${res.status}): ${body.slice(0, 160)}`,
      },
    };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };
  const content = data.choices?.[0]?.message?.content || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) {
    return {
      result: null,
      attempt: { provider: "perplexity", ok: false, detail: "Resposta sem JSON." },
    };
  }
  const result = parseOpenAiAssistentePayload(
    parsedJson,
    input.prompt,
    "perplexity",
    data.citations || []
  );
  return {
    result,
    attempt: {
      provider: "perplexity",
      ok: Boolean(result),
      detail: result ? model : "JSON sem medicamentos",
    },
  };
}

async function callOpenAi(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<{ result: AssistenteResult | null; attempt: AiAttempt }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      result: null,
      attempt: { provider: "openai", ok: false, detail: "OPENAI_API_KEY ausente." },
    };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            buildAssistenteSystemPrompt() +
            "\nSe não tiver navegação web, use conhecimento clínico atualizado e seja conservador nas doses.",
        },
        { role: "user", content: userPayload(input) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return {
      result: null,
      attempt: {
        provider: "openai",
        ok: false,
        detail: `OpenAI falhou (${res.status}): ${body.slice(0, 160)}`,
      },
    };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) {
    return {
      result: null,
      attempt: { provider: "openai", ok: false, detail: "Resposta sem JSON." },
    };
  }
  const result = parseOpenAiAssistentePayload(parsedJson, input.prompt, "openai");
  return {
    result,
    attempt: {
      provider: "openai",
      ok: Boolean(result),
      detail: result ? "ok" : "JSON sem medicamentos",
    },
  };
}

async function callGroq(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<{ result: AssistenteResult | null; attempt: AiAttempt }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return {
      result: null,
      attempt: { provider: "groq", ok: false, detail: "GROQ_API_KEY ausente." },
    };
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            buildAssistenteSystemPrompt() +
            "\nUse conhecimento clínico odontológico atualizado no Brasil. Seja conservador nas doses. Para dor com secreção/pus, priorize antibiótico adequado + analgesia — não só analgésico.",
        },
        { role: "user", content: userPayload(input) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const detail =
      res.status === 429
        ? "Cota gratuita do Groq esgotada momentaneamente. Aguarde ou tente de novo em alguns minutos."
        : `Groq falhou (${res.status}): ${body.slice(0, 160)}`;
    return { result: null, attempt: { provider: "groq", ok: false, detail } };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) {
    return {
      result: null,
      attempt: { provider: "groq", ok: false, detail: "Resposta sem JSON." },
    };
  }
  const result = parseOpenAiAssistentePayload(parsedJson, input.prompt, "groq");
  return {
    result,
    attempt: {
      provider: "groq",
      ok: Boolean(result),
      detail: result ? model : "JSON sem medicamentos",
    },
  };
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    allergies?: string;
    diseases?: string;
    medicationsInUse?: string;
  };

  const prompt = (body.prompt || "").trim();
  if (prompt.length < 8) {
    return jsonError("Descreva o procedimento com mais detalhes (mín. 8 caracteres).");
  }

  const input = {
    prompt,
    allergies: body.allergies,
    diseases: body.diseases,
    medicationsInUse: body.medicationsInUse,
  };

  const attempts: AiAttempt[] = [];

  try {
    // Groq primeiro: tier gratuito com cota bem mais folgada que Gemini free
    const groq = await callGroq(input);
    attempts.push(groq.attempt);
    if (groq.result) {
      return NextResponse.json({
        ...groq.result,
        attempts,
        alerts: [
          ...groq.result.alerts,
          "Sugestão via Groq (gratuito). O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const gemini = await callGemini(input);
    attempts.push(gemini.attempt);
    if (gemini.result) {
      return NextResponse.json({
        ...gemini.result,
        attempts,
        alerts: [
          ...gemini.result.alerts,
          "Sugestão via Google Gemini com pesquisa. O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const perplexity = await callPerplexity(input);
    attempts.push(perplexity.attempt);
    if (perplexity.result) {
      return NextResponse.json({
        ...perplexity.result,
        attempts,
        alerts: [
          ...perplexity.result.alerts,
          "Sugestão baseada em pesquisa na internet. O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const openai = await callOpenAi(input);
    attempts.push(openai.attempt);
    if (openai.result) {
      return NextResponse.json({
        ...openai.result,
        attempts,
        alerts: [
          ...openai.result.alerts,
          "Sugestão via OpenAI. O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const failed = attempts.filter((a) => !a.ok && a.detail && !a.detail.includes("ausente"));
    const local = buildLocalAssistenteSuggestion(input);
    return NextResponse.json({
      ...local,
      attempts,
      alerts: [
        ...local.alerts,
        failed[0]?.detail ||
          "IA externa indisponível. Usando protocolos locais do sistema — revise com cuidado.",
      ],
    });
  } catch (err) {
    console.error("[assistente IA]", err);
    const local = buildLocalAssistenteSuggestion(input);
    return NextResponse.json({
      ...local,
      attempts,
      summary:
        "Falha na IA externa. Sugestão local provisória — revise com cuidado.",
      alerts: [
        ...local.alerts,
        "Fallback local ativo após erro na IA externa.",
      ],
    });
  }
}
