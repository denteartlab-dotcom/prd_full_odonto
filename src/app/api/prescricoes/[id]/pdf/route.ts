import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { loadPrescriptionPdfPayload } from "@/lib/prescription-pdf-load";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await params;
  const loaded = await loadPrescriptionPdfPayload({
    prescriptionId: id,
    clinicId: session.clinicId,
    fallbackDentistName: session.name,
  });
  if (!loaded) return jsonError("Prescrição não encontrada.", 404);

  return new NextResponse(Buffer.from(loaded.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${loaded.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
