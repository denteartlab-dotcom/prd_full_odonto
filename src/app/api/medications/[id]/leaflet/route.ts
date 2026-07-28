import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { providerGetMedicineLeaflet } from "@/lib/medication-provider";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const { id } = await params;
    const url = await providerGetMedicineLeaflet(id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[GET /api/medications/:id/leaflet]", err);
    return jsonError("Bula não encontrada.", 404);
  }
}
