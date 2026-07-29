import { NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { loadCertificatePdfPayload } from "@/lib/certificate-pdf-load";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await params;

  const loaded = await loadCertificatePdfPayload({
    certificateId: id,
    clinicId: session.clinicId,
    req,
    fallbackDentistName: session.name,
  });
  if (!loaded) return jsonError("Atestado não encontrado.", 404);

  return new NextResponse(Buffer.from(loaded.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${loaded.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
