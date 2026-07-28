import { NextRequest, NextResponse } from "next/server";
import { isSession, jsonError, requireApiSession } from "@/lib/api-helpers";
import { loadPrescriptionPdfPayload } from "@/lib/prescription-pdf-load";
import {
  absoluteAppUrl,
  createPrescriptionShareToken,
} from "@/lib/prescription-share";
import {
  isWhatsAppCloudConfigured,
  sendWhatsAppDocument,
} from "@/lib/whatsapp-cloud";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await params;
  const loaded = await loadPrescriptionPdfPayload({
    prescriptionId: id,
    clinicId: session.clinicId,
    fallbackDentistName: session.name,
  });
  if (!loaded) return jsonError("Prescrição não encontrada.", 404);

  const phone = loaded.patientPhone || "";
  if (phone.replace(/\D/g, "").length < 10) {
    return jsonError("Paciente sem telefone válido cadastrado para WhatsApp.");
  }

  const token = await createPrescriptionShareToken({
    prescriptionId: loaded.row.id,
    clinicId: loaded.row.clinicId,
  });
  const publicPdfPath = `/api/receitas-publicas/${encodeURIComponent(token)}/pdf`;
  const publicPdfUrl = absoluteAppUrl(publicPdfPath, req);
  const caption = `Olá ${loaded.patientName.split(" ")[0]}! Segue sua receita odontológica em PDF.`;

  if (isWhatsAppCloudConfigured()) {
    try {
      const sent = await sendWhatsAppDocument({
        toPhone: phone,
        pdfBytes: loaded.bytes,
        filename: loaded.filename,
        caption,
        publicPdfUrl: publicPdfUrl.startsWith("https://") ? publicPdfUrl : undefined,
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
      console.error("[whatsapp pdf]", err);
      return jsonError(
        err instanceof Error ? err.message : "Falha ao enviar PDF no WhatsApp.",
        502
      );
    }
  }

  // Sem Cloud API: devolve PDF + wa.me para o cliente baixar e anexar
  const pdfBase64 = Buffer.from(loaded.bytes).toString("base64");
  const digits = phone.replace(/\D/g, "");
  const withCountry =
    digits.length >= 12 && digits.startsWith("55") ? digits : `55${digits}`;
  const waUrl = `https://wa.me/${withCountry}?text=${encodeURIComponent(
    `${caption}\n\nO arquivo PDF "${loaded.filename}" foi baixado — anexe no chat.`
  )}`;

  return NextResponse.json({
    ok: true,
    mode: "download_attach",
    filename: loaded.filename,
    pdfBase64,
    waUrl,
    publicPdfUrl,
    message:
      "WhatsApp Cloud API não configurada. Baixamos o PDF para você anexar no WhatsApp.",
  });
}
