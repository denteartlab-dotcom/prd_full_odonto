import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { loadCertificatePdfPayload } from "@/lib/certificate-pdf-load";
import {
  absoluteAppUrl,
  certificateValidationPath,
  createCertificateShareToken,
} from "@/lib/certificate-share";
import {
  isWhatsAppCloudConfigured,
  sendWhatsAppDocument,
} from "@/lib/whatsapp-cloud";

type Params = { params: Promise<{ id: string }> };

function buildWhatsAppWebUrl(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry =
    digits.length >= 12 && digits.startsWith("55") ? digits : `55${digits}`;
  return `https://web.whatsapp.com/send?phone=${withCountry}&text=${encodeURIComponent(text)}`;
}

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

  const phone = loaded.patientPhone || "";
  if (phone.replace(/\D/g, "").length < 10) {
    return jsonError("Paciente sem telefone válido cadastrado para WhatsApp.");
  }

  const token = await createCertificateShareToken({
    certificateId: loaded.row.id,
    clinicId: loaded.row.clinicId,
  });
  const publicPdfUrl = absoluteAppUrl(
    `/api/atestados-publicos/${encodeURIComponent(token)}/pdf`,
    req
  );
  const firstName = loaded.patientName.split(" ")[0] || "paciente";
  const caption = `Olá ${firstName}! Segue o link do seu atestado odontológico em PDF:\n${publicPdfUrl}\nValidação: ${absoluteAppUrl(certificateValidationPath(token), req)}`;

  if (isWhatsAppCloudConfigured()) {
    try {
      const sent = await sendWhatsAppDocument({
        toPhone: phone,
        pdfBytes: loaded.bytes,
        filename: loaded.filename,
        caption: `Olá ${firstName}! Segue seu atestado odontológico em PDF.`,
        publicPdfUrl: publicPdfUrl.startsWith("https://")
          ? publicPdfUrl
          : undefined,
      });
      return NextResponse.json({
        ok: true,
        mode: "sent",
        provider: sent.mode,
        to: sent.to,
        filename: loaded.filename,
        message: "PDF enviado no WhatsApp do paciente.",
      });
    } catch (err) {
      console.error("[atestado whatsapp]", err);
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "whatsapp_web_link",
    waUrl: buildWhatsAppWebUrl(phone, caption),
    publicPdfUrl,
    message: "Abrindo WhatsApp Web com o link do PDF.",
  });
}
