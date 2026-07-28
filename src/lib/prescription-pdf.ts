import { jsPDF } from "jspdf";
import type { PrescriptionItem, PrescriptionKind } from "@/lib/prescription-types";

const KIND_LABELS: Record<PrescriptionKind, string> = {
  receituario_simples: "Receituário",
  controle_especial: "Receituário de Controle Especial",
  atestado: "Atestado Odontológico",
  solicitacao_exame: "Solicitação de Exame",
};

export type PrescriptionPdfInput = {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicLogoUrl?: string | null;
  dentistName: string;
  dentistCro?: string;
  patientName: string;
  patientCpf?: string;
  kind: PrescriptionKind;
  medications: PrescriptionItem[];
  issuedAt: string;
  validUntil?: string;
};

function detectImageFormat(dataUrl: string): "PNG" | "JPEG" | null {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (
    dataUrl.startsWith("data:image/jpeg") ||
    dataUrl.startsWith("data:image/jpg")
  ) {
    return "JPEG";
  }
  return null;
}

export function buildPrescriptionPdfBytes(input: PrescriptionPdfInput): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const margin = 16;
  let y = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  const line = (
    text: string,
    opts?: {
      size?: number;
      bold?: boolean;
      color?: [number, number, number];
      x?: number;
      width?: number;
    }
  ) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.size || 11);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(15, 23, 42);
    const width = opts?.width ?? maxWidth;
    const rows = doc.splitTextToSize(text, width);
    doc.text(rows, opts?.x ?? margin, y);
    y += rows.length * ((opts?.size || 11) * 0.45) + 2;
  };

  const logoUrl = (input.clinicLogoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  const textX = logoFormat ? margin + 22 : margin;
  const textWidth = logoFormat ? maxWidth - 22 : maxWidth;
  const headerStartY = y;

  if (logoFormat && logoUrl) {
    try {
      doc.addImage(logoUrl, logoFormat, margin, y, 18, 18);
    } catch {
      // logo inválida: segue só com texto
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  const nameRows = doc.splitTextToSize(input.clinicName || "Clínica", textWidth);
  doc.text(nameRows, textX, y + 6);
  y = headerStartY + Math.max(logoFormat ? 18 : 0, nameRows.length * 6 + 2) + 2;

  const contactParts = [
    input.clinicAddress?.trim(),
    input.clinicPhone ? `Tel.: ${input.clinicPhone.trim()}` : "",
  ].filter(Boolean);
  if (contactParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const contactRows = doc.splitTextToSize(contactParts.join(" · "), maxWidth);
    doc.text(contactRows, margin, y);
    y += contactRows.length * 4 + 2;
  }

  y += 2;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  line(KIND_LABELS[input.kind] || "Receituário", { size: 13, bold: true });
  y += 2;
  line(`Paciente: ${input.patientName}`, { size: 11, bold: true });
  if (input.patientCpf) line(`CPF: ${input.patientCpf}`, { size: 10 });
  line(
    `Dentista: ${input.dentistName}${input.dentistCro ? ` · CRO ${input.dentistCro}` : ""}`,
    { size: 10 }
  );
  line(
    `Emitida em: ${input.issuedAt}${input.validUntil ? ` · Válida até: ${input.validUntil}` : ""}`,
    { size: 10, color: [71, 85, 105] }
  );
  y += 4;

  line("Medicamentos", { size: 12, bold: true });
  input.medications.forEach((m, i) => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
    line(`${i + 1}. ${m.medicationName}`, { size: 11, bold: true });
    line(`${m.dose} · ${m.frequency} · ${m.duration}`, {
      size: 10,
      color: [51, 65, 85],
    });
    if (m.instructions) line(m.instructions, { size: 9, color: [71, 85, 105] });
    y += 2;
  });

  y = Math.max(y + 10, 250);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  line("________________________________", { size: 10 });
  line(input.dentistName, { size: 10, bold: true });
  line(`CRO ${input.dentistCro || "—"}`, { size: 9, color: [71, 85, 105] });

  const ab = doc.output("arraybuffer");
  return new Uint8Array(ab as ArrayBuffer);
}

export function pdfFilename(patientName: string, issuedAt: string) {
  const safe = patientName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const day = issuedAt.replace(/\//g, "-");
  return `receita-${safe || "paciente"}-${day}.pdf`;
}
