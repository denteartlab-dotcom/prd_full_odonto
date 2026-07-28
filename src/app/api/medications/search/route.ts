import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { providerSearchMedicines } from "@/lib/medication-provider";

export async function GET(req: NextRequest) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const result = await providerSearchMedicines(q);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/medications/search]", err);
    return jsonError(
      err instanceof Error
        ? err.message
        : "Não foi possível consultar os medicamentos.",
      502
    );
  }
}
