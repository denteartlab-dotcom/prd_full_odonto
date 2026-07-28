import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { providerGetManufacturers } from "@/lib/medication-provider";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const items = await providerGetManufacturers();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[GET /api/medications/manufacturers]", err);
    return jsonError("Não foi possível carregar fabricantes.", 502);
  }
}
