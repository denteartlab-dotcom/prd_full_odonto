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
  const firstName = loaded.patientName.split(" ")[0] || "paciente";
  const caption = `Olá ${firstName}! Segue o link da sua receita odontológica em PDF:\n${publicPdfUrl}`;

  if (isWhatsAppCloudConfigured()) {
    try {
      const sent = await sendWhatsAppDocument({
        toPhone: phone,
        pdfBytes: loaded.bytes,
        filename: loaded.filename,
        caption: `Olá ${firstName}! Segue sua receita odontológica em PDF.`,
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
      // Se a Cloud API falhar, abre WhatsApp Web com o link público
    }
  }

  const waUrl = buildWhatsAppWebUrl(phone, caption);

  return NextResponse.json({
    ok: true,
    mode: "whatsapp_web_link",
    waUrl,
    publicPdfUrl,
    message: "Abrindo WhatsApp Web com o link do PDF.",
  });
}
