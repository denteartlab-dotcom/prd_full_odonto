import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { verifyCertificateShareToken } from "@/lib/certificate-share";
import { loadCertificatePdfPayload } from "@/lib/certificate-pdf-load";

type Params = { params: Promise<{ token: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const decoded = decodeURIComponent(token);
    const { certificateId, clinicId } =
      await verifyCertificateShareToken(decoded);
    const loaded = await loadCertificatePdfPayload({
      certificateId,
      clinicId,
      req,
    });
    if (!loaded) return jsonError("Atestado não encontrado.", 404);

    return new NextResponse(Buffer.from(loaded.bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${loaded.filename}"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return jsonError("Link inválido ou expirado.", 400);
  }
}
