import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { searchDentalProceduresWithAi } from "@/lib/dental-procedures-ai";
import {
  bestLocalProcedureScore,
  countDentalProcedures,
  searchDentalProcedures,
} from "@/lib/dental-procedures-search";
import type { ProcedureCatalogItem } from "@/lib/budget-types";

/**
 * GET /api/procedimentos?q=&limit=&ai=auto|1|0
 * Catálogo local + fallback IA (Groq/Gemini/OpenAI) para termos como
 * "protocolo cerâmico", "protocolo resinoso", etc.
 */
export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const aiMode = (req.nextUrl.searchParams.get("ai") || "auto").toLowerCase();
  const limitRaw = Number(req.nextUrl.searchParams.get("limit") || "12");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 40)
    : 12;

  try {
    const localItems = searchDentalProcedures(q, limit).map((item) => ({
      ...item,
      source: "local" as const,
    }));

    const localScore = q ? bestLocalProcedureScore(q) : 100;
    const shouldUseAi =
      Boolean(q) &&
      q.length >= 3 &&
      (aiMode === "1" ||
        aiMode === "true" ||
        (aiMode === "auto" && (localItems.length === 0 || localScore < 70)));

    let aiItems: ProcedureCatalogItem[] = [];
    let aiProvider: string | null = null;
    let aiDetail: string | undefined;

    if (shouldUseAi) {
      const ai = await searchDentalProceduresWithAi(q, Math.max(6, limit));
      aiItems = ai.items;
      aiProvider = ai.provider;
      aiDetail = ai.detail;
    }

    const seen = new Set(localItems.map((i) => `${i.code}|${i.name.toLowerCase()}`));
    const merged: ProcedureCatalogItem[] = [...localItems];
    for (const item of aiItems) {
      const key = `${item.code}|${item.name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
      if (merged.length >= limit) break;
    }

    const source =
      localItems.length && aiItems.length
        ? "mixed"
        : aiItems.length
          ? "ai"
          : "catalogo_local";

    return NextResponse.json({
      items: merged.slice(0, limit),
      totalInDatabase: countDentalProcedures(),
      source,
      aiUsed: Boolean(aiItems.length),
      aiProvider,
      aiDetail,
      provider:
        source === "mixed"
          ? "Catálogo local + sugestões de IA"
          : source === "ai"
            ? `Sugestões de IA (${aiProvider || "fallback"})`
            : "Catálogo TUSS odontológico local com valores médios de referência",
      priceNote:
        "Valores médios de referência — edite no orçamento conforme a clínica.",
    });
  } catch (err) {
    console.error("[GET /api/procedimentos]", err);
    return jsonError("Não foi possível buscar procedimentos.", 500);
  }
}
