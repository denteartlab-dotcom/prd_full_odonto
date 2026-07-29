import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { loadCertificatePdfPayload } from "@/lib/certificate-pdf-load";
import { buildCertificateValidationUrl } from "@/lib/certificate-share";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
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

  const email = loaded.patientEmail?.trim();
  if (!email) {
    return jsonError("Paciente sem e-mail cadastrado.");
  }

  const validationUrl = buildCertificateValidationUrl(
    loaded.row.validationHash,
    req
  );

  // Integração SMTP ainda não configurada: retorna mailto com link do PDF autenticado
  const subject = encodeURIComponent(
    `Atestado odontológico ${loaded.row.documentNumber}`
  );
  const body = encodeURIComponent(
    `Olá ${loaded.patientName.split(" ")[0] || ""},\n\nSegue o atestado odontológico emitido pela clínica.\nDocumento: ${loaded.row.documentNumber}\nValidação: ${validationUrl}\n\nAtenciosamente.`
  );

  return NextResponse.json({
    ok: true,
    mode: "mailto",
    mailto: `mailto:${email}?subject=${subject}&body=${body}`,
    email,
    validationUrl,
    message: "Abrindo o cliente de e-mail com o atestado.",
  });
}
