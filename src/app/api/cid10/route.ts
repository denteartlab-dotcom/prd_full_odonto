import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import {
  countCidInDatabase,
  searchCidCodes,
} from "@/lib/cid10-search";

export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const q = req.nextUrl.searchParams.get("q") || "";
  const limitRaw = Number(req.nextUrl.searchParams.get("limit") || "12");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 30)
    : 12;

  try {
    const total = await countCidInDatabase();
    const { items, source } = await searchCidCodes(q, limit);
    return NextResponse.json({
      items,
      source,
      totalInDatabase: total,
      provider:
        source === "nih"
          ? "API gratuita NIH Clinical Tables"
          : source === "database"
            ? "Banco local CID-10 (DATASUS)"
            : source === "mixed"
              ? "Banco local e API gratuita"
              : "Catálogo odontológico local",
    });
  } catch (err) {
    console.error("[GET /api/cid10]", err);
    return jsonError("Não foi possível buscar o CID-10.", 500);
  }
}
