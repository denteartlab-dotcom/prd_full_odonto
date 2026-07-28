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
  clinicCnpj?: string;
  clinicLogoUrl?: string | null;
  dentistName: string;
  dentistCro?: string;
  patientName: string;
  patientCpf?: string;
  patientBirthDate?: string;
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
  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const setText = (
    text: string,
    opts: {
      x?: number;
      size?: number;
      bold?: boolean;
      color?: [number, number, number];
      maxWidth?: number;
    } = {}
  ) => {
    const x = opts.x ?? margin;
    const size = opts.size ?? 11;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color || ([15, 23, 42] as [number, number, number])));
    const rows = doc.splitTextToSize(text, opts.maxWidth ?? contentWidth);
    doc.text(rows, x, y);
    return rows.length * (size * 0.38);
  };

  // ——— Cabeçalho (logo + nome + contato) ———
  const logoUrl = (input.clinicLogoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  const logoSize = 18;
  const textX = logoFormat ? margin + logoSize + 4 : margin;
  const textWidth = logoFormat ? contentWidth - logoSize - 4 : contentWidth;
  const headerTop = y;

  if (logoFormat && logoUrl) {
    try {
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, headerTop, logoSize, logoSize, 2, 2, "S");
      doc.addImage(logoUrl, logoFormat, margin + 1, headerTop + 1, logoSize - 2, logoSize - 2);
    } catch {
      // ignora logo inválida
    }
  }

  y = headerTop + 6;
  const nameHeight = setText(input.clinicName || "Clínica", {
    x: textX,
    size: 16,
    bold: true,
    maxWidth: textWidth,
  });
  y = headerTop + 6 + nameHeight + 2;

  const contact = [
    input.clinicAddress?.trim(),
    input.clinicPhone?.trim(),
    input.clinicCnpj ? `CNPJ ${input.clinicCnpj}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  if (contact) {
    const contactHeight = setText(contact, {
      x: textX,
      size: 9,
      color: [100, 116, 139],
      maxWidth: textWidth,
    });
    y += contactHeight + 2;
  }

  y = Math.max(y, headerTop + (logoFormat ? logoSize : 0) + 4) + 3;
  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ——— Título ———
  y += setText(KIND_LABELS[input.kind] || "Receituário", { size: 14, bold: true });
  y += 6;

  // ——— Caixa do paciente ———
  const boxPad = 5;
  const boxX = margin;
  const boxW = contentWidth;
  const boxInnerW = boxW - boxPad * 2;
  const boxStartY = y;

  let boxContentH = 0;
  const measure = (text: string, size: number, bold?: boolean) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    return doc.splitTextToSize(text, boxInnerW).length * (size * 0.38);
  };
  boxContentH += measure("PACIENTE", 9, true) + 2;
  boxContentH += measure(input.patientName, 12, true) + 2;
  const patientMeta = [
    input.patientCpf ? `CPF: ${input.patientCpf}` : "",
    input.patientBirthDate ? `Nascimento: ${input.patientBirthDate}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  if (patientMeta) boxContentH += measure(patientMeta, 9) + 1;

  const boxH = boxContentH + boxPad * 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, boxStartY, boxW, boxH, 3, 3, "FD");

  y = boxStartY + boxPad + 3.5;
  y +=
    setText("PACIENTE", {
      x: boxX + boxPad,
      size: 9,
      bold: true,
      color: [100, 116, 139],
      maxWidth: boxInnerW,
    }) + 2;
  y +=
    setText(input.patientName, {
      x: boxX + boxPad,
      size: 12,
      bold: true,
      maxWidth: boxInnerW,
    }) + 2;
  if (patientMeta) {
    y += setText(patientMeta, {
      x: boxX + boxPad,
      size: 9,
      color: [100, 116, 139],
      maxWidth: boxInnerW,
    });
  }
  y = boxStartY + boxH + 8;

  // ——— Tabela de medicamentos ———
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("#", margin, y);
  doc.text("MEDICAMENTO / POSOLOGIA", margin + 12, y);
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  input.medications.forEach((m, i) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const idx = String(i + 1);
    const detail = [m.dose, m.frequency, m.duration].filter(Boolean).join(" · ");
    const medWidth = contentWidth - 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(idx, margin, y);

    doc.setFont("helvetica", "bold");
    const nameRows = doc.splitTextToSize(m.medicationName, medWidth);
    doc.text(nameRows, margin + 12, y);
    y += nameRows.length * 4.5;

    if (detail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const detailRows = doc.splitTextToSize(detail, medWidth);
      doc.text(detailRows, margin + 12, y);
      y += detailRows.length * 4.2;
    }

    if (m.instructions?.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const instRows = doc.splitTextToSize(m.instructions.trim(), medWidth);
      doc.text(instRows, margin + 12, y);
      y += instRows.length * 4;
    }

    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  });

  if (!input.medications.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Sem itens.", margin, y);
    y += 8;
  }

  // ——— Data ———
  y += 2;
  const issued =
    `Emitida em ${input.issuedAt}` +
    (input.validUntil ? ` · Validade até ${input.validUntil}` : "");
  y += setText(issued, { size: 9, color: [100, 116, 139] }) + 4;

  // ——— Assinaturas (2 colunas) ———
  y = Math.max(y + 16, 235);
  const colW = (contentWidth - 12) / 2;
  const leftX = margin;
  const rightX = margin + colW + 12;
  const sigY = y;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(leftX, sigY, leftX + colW, sigY);
  doc.line(rightX, sigY, rightX + colW, sigY);

  y = sigY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const dentistRows = doc.splitTextToSize(input.dentistName, colW);
  doc.text(dentistRows, leftX + colW / 2, y, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Cirurgião(ã)-Dentista · CRO ${input.dentistCro || "—"}`,
    leftX + colW / 2,
    y + dentistRows.length * 4 + 3,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Paciente / Responsável", rightX + colW / 2, y, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const patientRows = doc.splitTextToSize(input.patientName, colW);
  doc.text(patientRows, rightX + colW / 2, y + 5, { align: "center" });

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
