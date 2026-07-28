import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { providerListByCategory } from "@/lib/medication-provider";

export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const category = (req.nextUrl.searchParams.get("category") || "").trim();
  if (!category) {
    return jsonError("Informe a categoria (?category=...).");
  }

  try {
    const items = await providerListByCategory(category);
    return NextResponse.json({
      items,
      source: "fallback",
      query: category,
    });
  } catch (err) {
    console.error("[GET /api/medications/by-category]", err);
    return jsonError("Não foi possível listar a categoria.", 502);
  }
}
