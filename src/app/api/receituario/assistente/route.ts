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
      "Monte a sugestão de receita odontológica em JSON, com posologias usuais no Brasil.",
  });
}

async function callGemini(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<AssistenteResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                buildAssistenteSystemPrompt() +
                "\n\n" +
                userPayload(input),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    console.warn("[assistente IA] Gemini falhou", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) return null;
  return parseOpenAiAssistentePayload(parsedJson, input.prompt, "gemini");
}

async function callPerplexity(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<AssistenteResult | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) return null;

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
    console.warn("[assistente IA] Perplexity falhou", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };
  const content = data.choices?.[0]?.message?.content || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) return null;
  return parseOpenAiAssistentePayload(
    parsedJson,
    input.prompt,
    "perplexity",
    data.citations || []
  );
}

async function callOpenAi(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): Promise<AssistenteResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

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
    console.warn("[assistente IA] OpenAI falhou", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content || "";
  const parsedJson = extractJsonObject(content);
  if (!parsedJson) return null;
  return parseOpenAiAssistentePayload(parsedJson, input.prompt, "openai");
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

  try {
    // Ordem: Gemini (tier gratuito) → Perplexity → OpenAI → local (sempre gratuito)
    const fromGemini = await callGemini(input);
    if (fromGemini) {
      return NextResponse.json({
        ...fromGemini,
        alerts: [
          ...fromGemini.alerts,
          "Sugestão via Google Gemini (gratuito). O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const fromPerplexity = await callPerplexity(input);
    if (fromPerplexity) {
      return NextResponse.json({
        ...fromPerplexity,
        alerts: [
          ...fromPerplexity.alerts,
          "Sugestão baseada em pesquisa na internet. O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const fromOpenAi = await callOpenAi(input);
    if (fromOpenAi) {
      return NextResponse.json({
        ...fromOpenAi,
        alerts: [
          ...fromOpenAi.alerts,
          "Sugestão via OpenAI. O dentista deve validar posologia e interações antes de emitir.",
        ],
      });
    }

    const local = buildLocalAssistenteSuggestion(input);
    return NextResponse.json({
      ...local,
      alerts: [
        ...local.alerts,
        "Modo gratuito local (protocolos odontológicos do sistema). Sem chave de IA externa.",
      ],
    });
  } catch (err) {
    console.error("[assistente IA]", err);
    const local = buildLocalAssistenteSuggestion(input);
    return NextResponse.json({
      ...local,
      summary:
        "Falha na IA externa. Sugestão local provisória — revise com cuidado.",
      alerts: [
        ...local.alerts,
        "Fallback local ativo após erro na IA externa.",
      ],
    });
  }
}
