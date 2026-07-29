import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  countDentalProcedures,
  searchDentalProcedures,
} from "@/lib/dental-procedures-search";

/**
 * GET /api/procedimentos?q=&limit=
 * Catálogo TUSS local com valor médio de referência (clínica particular).
 * Não há API pública gratuita estável com preços médios de mercado.
 */
export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const q = req.nextUrl.searchParams.get("q") || "";
  const limitRaw = Number(req.nextUrl.searchParams.get("limit") || "12");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 40)
    : 12;

  try {
    const items = searchDentalProcedures(q, limit);
    return NextResponse.json({
      items,
      totalInDatabase: countDentalProcedures(),
      source: "catalogo_local",
      provider:
        "Catálogo TUSS odontológico local com valores médios de referência (clínica particular)",
      priceNote:
        "Valores médios de referência — edite no orçamento conforme a clínica.",
    });
  } catch (err) {
    console.error("[GET /api/procedimentos]", err);
    return jsonError("Não foi possível buscar procedimentos.", 500);
  }
}
