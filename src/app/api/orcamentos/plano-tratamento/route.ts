import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { suggestTreatmentPlanWithAi } from "@/lib/treatment-plan-ai";

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = (await req.json().catch(() => ({}))) as {
    complaint?: string;
    age?: string;
    allergies?: string;
    notes?: string;
  };

  const complaint = (body.complaint || "").trim();
  if (complaint.length < 8) {
    return jsonError("Descreva a queixa do paciente com mais detalhes (mín. 8 caracteres).");
  }

  try {
    const result = await suggestTreatmentPlanWithAi(complaint, {
      age: body.age,
      allergies: body.allergies,
      notes: body.notes,
    });

    if (!result.suggestions.length) {
      return jsonError(
        result.summary || "Não foi possível gerar sugestões para esta queixa."
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[plano-tratamento IA]", err);
    return jsonError("Falha ao gerar sugestões de plano de tratamento.", 500);
  }
}
