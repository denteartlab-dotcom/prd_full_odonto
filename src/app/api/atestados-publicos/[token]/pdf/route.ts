import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { resolveCertificateByPublicToken } from "@/lib/certificate-share";
import { loadCertificatePdfPayload } from "@/lib/certificate-pdf-load";

type Params = { params: Promise<{ token: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const row = await resolveCertificateByPublicToken(token);
    const loaded = await loadCertificatePdfPayload({
      certificateId: row.id,
      clinicId: row.clinicId,
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
  } catch (err) {
    console.error("[atestados-publicos/pdf]", err);
    return jsonError("Link inválido ou expirado.", 400);
  }
}
