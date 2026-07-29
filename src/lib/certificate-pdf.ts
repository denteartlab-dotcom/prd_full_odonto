import { jsPDF } from "jspdf";
import { formatBrasiliaDate, formatBrasiliaDateTime } from "@/lib/date-range";
import type { CertificateType } from "@/lib/certificate-types";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificate-types";

export type CertificatePdfInput = {
  clinicName: string;
  clinicHeaderLines: string[];
  clinicLogoUrl?: string | null;
  clinicCity?: string | null;
  clinicState?: string | null;
  patientName: string;
  patientCpf?: string | null;
  patientBirthDate?: string | null;
  patientChartNumber?: string | null;
  dentistName: string;
  dentistCro?: string | null;
  dentistSpecialty?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  certificateType: CertificateType;
  certificateText: string;
  procedureName?: string | null;
  attendanceDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  days?: number | null;
  hours?: number | null;
  companionName?: string | null;
  companionCpf?: string | null;
  cid?: string | null;
  cidDescription?: string | null;
  observations?: string | null;
  documentNumber: string;
  validationUrl: string;
  qrDataUrl?: string | null;
  issuedAtLabel?: string;
};

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadImageDataUrl(src: string | null | undefined) {
  if (!src?.trim()) return null;
  if (src.startsWith("data:")) return src;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function fetchQrDataUrl(validationUrl: string) {
  const api = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(validationUrl)}`;
  return loadImageDataUrl(api);
}

export async function buildCertificatePdfBytes(input: CertificatePdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 16;

  const logo = await loadImageDataUrl(input.clinicLogoUrl);
  if (logo) {
    try {
      doc.addImage(logo, "JPEG", margin, y, 22, 22);
    } catch {
      try {
        doc.addImage(logo, "PNG", margin, y, 22, 22);
      } catch {
        /* ignore */
      }
    }
  }

  const textX = logo ? margin + 28 : margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(input.clinicName, textX, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  let headerY = y + 11;
  for (const line of input.clinicHeaderLines.slice(0, 4)) {
    doc.text(line, textX, headerY);
    headerY += 4;
  }

  y = Math.max(y + 28, headerY + 4);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("ATESTADO ODONTOLÓGICO", pageW / 2, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text(
    CERTIFICATE_TYPE_LABELS[input.certificateType].toUpperCase(),
    pageW / 2,
    y,
    { align: "center" }
  );
  y += 8;

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Documento: ${input.documentNumber}`, margin, y);
  y += 8;

  // Patient box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("PACIENTE", margin + 4, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(input.patientName, margin + 4, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const meta = [
    input.patientCpf ? `CPF ${input.patientCpf}` : null,
    input.patientBirthDate ? `Nasc. ${input.patientBirthDate}` : null,
    input.patientChartNumber ? `Ficha ${input.patientChartNumber}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (meta) doc.text(meta, margin + 4, y + 17);
  y += 28;

  if (input.procedureName || input.attendanceDate) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    if (input.attendanceDate) {
      const timeRange =
        input.startTime && input.endTime
          ? ` · ${input.startTime} às ${input.endTime}`
          : "";
      doc.text(`Atendimento: ${input.attendanceDate}${timeRange}`, margin, y);
      y += 5;
    }
    if (input.procedureName) {
      doc.text(`Procedimento: ${input.procedureName}`, margin, y);
      y += 5;
    }
    if (input.certificateType === "repouso") {
      const rest = [
        input.days != null ? `${input.days} dia(s)` : null,
        input.hours != null ? `${input.hours} hora(s)` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      if (rest) {
        doc.text(`Afastamento: ${rest}`, margin, y);
        y += 5;
      }
    }
    if (input.companionName) {
      doc.text(
        `Acompanhante: ${input.companionName}${
          input.companionCpf ? ` · CPF ${input.companionCpf}` : ""
        }`,
        margin,
        y
      );
      y += 5;
    }
    y += 3;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  const body = stripHtml(input.certificateText);
  const wrapped = doc.splitTextToSize(body, pageW - margin * 2);
  doc.text(wrapped, margin, y);
  y += wrapped.length * 5.2 + 6;

  if (input.cid) {
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `CID: ${input.cid}${input.cidDescription ? ` — ${input.cidDescription}` : ""}`,
      margin,
      y
    );
    y += 7;
  }

  if (input.observations?.trim()) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Observações:", margin, y);
    y += 5;
    doc.setTextColor(51, 65, 85);
    const obs = doc.splitTextToSize(input.observations.trim(), pageW - margin * 2);
    doc.text(obs, margin, y);
    y += obs.length * 4.5 + 6;
  }

  y = Math.max(y + 8, 210);
  const city =
    [input.clinicCity, input.clinicState].filter(Boolean).join("/") ||
    "Cidade";
  const issued =
    input.issuedAtLabel || formatBrasiliaDateTime(new Date());
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`${city}, ${issued}`, pageW / 2, y, { align: "center" });
  y += 18;

  const sigX = pageW / 2;
  const signature = await loadImageDataUrl(input.signatureUrl);
  if (signature) {
    try {
      doc.addImage(signature, "PNG", sigX - 28, y - 12, 56, 18);
    } catch {
      /* ignore */
    }
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(sigX - 35, y + 8, sigX + 35, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(input.dentistName, sigX, y + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const croLine = [
    input.dentistCro ? `CRO ${input.dentistCro}` : null,
    input.dentistSpecialty || null,
  ]
    .filter(Boolean)
    .join(" · ");
  if (croLine) doc.text(croLine, sigX, y + 19, { align: "center" });

  const stamp = await loadImageDataUrl(input.stampUrl);
  if (stamp) {
    try {
      doc.addImage(stamp, "PNG", pageW - margin - 32, y - 4, 28, 28);
    } catch {
      /* ignore */
    }
  }

  // Footer QR
  const footerY = 272;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 6, pageW - margin, footerY - 6);

  const qr = input.qrDataUrl || (await fetchQrDataUrl(input.validationUrl));
  if (qr) {
    try {
      doc.addImage(qr, "PNG", margin, footerY - 2, 22, 22);
    } catch {
      /* ignore */
    }
  }

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Validação pública do documento", margin + 26, footerY + 4);
  doc.setFontSize(7);
  const urlLines = doc.splitTextToSize(input.validationUrl, pageW - margin * 2 - 30);
  doc.text(urlLines, margin + 26, footerY + 9);
  doc.text(`Hash: ${input.documentNumber}`, margin + 26, footerY + 18);

  return doc.output("arraybuffer");
}

export function certificatePdfFilename(documentNumber: string, patientName: string) {
  const safe = patientName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `Atestado-${documentNumber}-${safe || "paciente"}.pdf`;
}

export function certificatePdfViewerUrl(id: string) {
  return `/api/atestados/${id}/pdf#zoom=75`;
}

export { formatBrasiliaDate };
