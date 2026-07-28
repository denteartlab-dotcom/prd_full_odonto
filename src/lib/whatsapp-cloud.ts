function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return digits;
}

export function isWhatsAppCloudConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN?.trim() &&
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
}

/** Envia PDF como documento via WhatsApp Cloud API (Meta). */
export async function sendWhatsAppDocument(input: {
  toPhone: string;
  pdfBytes: Uint8Array;
  filename: string;
  caption: string;
  publicPdfUrl?: string;
}) {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";

  if (!token || !phoneNumberId) {
    throw new Error(
      "WhatsApp Cloud API não configurada. Defina WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID."
    );
  }

  const to = normalizePhone(input.toPhone);
  if (to.length < 12) {
    throw new Error("Telefone do paciente inválido para WhatsApp.");
  }

  // Preferência: link público HTTPS (mais simples e estável)
  if (input.publicPdfUrl?.startsWith("https://")) {
    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "document",
          document: {
            link: input.publicPdfUrl,
            filename: input.filename,
            caption: input.caption,
          },
        }),
      }
    );
    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      messages?: unknown[];
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `Falha ao enviar WhatsApp (${res.status}).`);
    }
    return { ok: true as const, mode: "cloud_link" as const, to };
  }

  // Fallback: upload multipart + envio por media id
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  const pdfBlob = new Blob([Buffer.from(input.pdfBytes)], {
    type: "application/pdf",
  });
  form.append("file", pdfBlob, input.filename);

  const uploadRes = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/media`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  const uploadData = (await uploadRes.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string };
  };
  if (!uploadRes.ok || !uploadData.id) {
    throw new Error(
      uploadData.error?.message || `Falha no upload do PDF (${uploadRes.status}).`
    );
  }

  const sendRes = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "document",
        document: {
          id: uploadData.id,
          filename: input.filename,
          caption: input.caption,
        },
      }),
    }
  );
  const sendData = (await sendRes.json().catch(() => ({}))) as {
    error?: { message?: string };
  };
  if (!sendRes.ok) {
    throw new Error(sendData.error?.message || `Falha ao enviar WhatsApp (${sendRes.status}).`);
  }

  return { ok: true as const, mode: "cloud_upload" as const, to };
}
