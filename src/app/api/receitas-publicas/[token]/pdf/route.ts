import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { loadPrescriptionPdfPayload } from "@/lib/prescription-pdf-load";
import { verifyPrescriptionShareToken } from "@/lib/prescription-share";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const decoded = await verifyPrescriptionShareToken(decodeURIComponent(token));
    const loaded = await loadPrescriptionPdfPayload({
      prescriptionId: decoded.prescriptionId,
      clinicId: decoded.clinicId,
    });
    if (!loaded) return jsonError("Receita não encontrada ou link expirado.", 404);

    return new NextResponse(Buffer.from(loaded.bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${loaded.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return jsonError("Link inválido ou expirado.", 401);
  }
}
