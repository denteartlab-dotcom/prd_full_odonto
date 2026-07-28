import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  buildLocalAssistenteSuggestion,
  parseOpenAiAssistentePayload,
} from "@/lib/receituario-assistente";
import { DENTAL_MEDICATIONS } from "@/lib/dental-medications";

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

  const local = buildLocalAssistenteSuggestion({
    prompt,
    allergies: body.allergies,
    diseases: body.diseases,
    medicationsInUse: body.medicationsInUse,
  });

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    return NextResponse.json(local);
  }

  try {
    const catalog = DENTAL_MEDICATIONS.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      defaultDose: m.defaultDose,
      defaultFrequency: m.defaultFrequency,
      defaultDuration: m.defaultDuration,
    }));

    const system = `Você é um assistente clínico odontológico brasileiro.
Sugira uma receita inicial com base no procedimento.
Use preferencialmente medicamentos do catálogo (campo medicineId).
Responda APENAS JSON válido no formato:
{
  "summary": string,
  "procedureLabel": string,
  "notes": string,
  "alerts": string[],
  "medications": [
    {
      "medicineId": string,
      "name": string,
      "reason": string,
      "quantity": string,
      "posology": string,
      "duration": string,
      "notes": string,
      "route": string
    }
  ]
}
Não invente posologias perigosas. Sempre lembre que o dentista valida.`;

    const user = JSON.stringify({
      procedimento: prompt,
      alergias: body.allergies || "",
      doencas: body.diseases || "",
      medicamentosEmUso: body.medicationsInUse || "",
      catalogo: catalog,
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      console.warn("[assistente IA] OpenAI falhou, usando local", await res.text());
      return NextResponse.json(local);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || "";
    const parsedJson = JSON.parse(content) as unknown;
    const parsed = parseOpenAiAssistentePayload(parsedJson, prompt);
    if (!parsed) return NextResponse.json(local);
    return NextResponse.json(parsed);
  } catch (err) {
    console.warn("[assistente IA] fallback local", err);
    return NextResponse.json(local);
  }
}
