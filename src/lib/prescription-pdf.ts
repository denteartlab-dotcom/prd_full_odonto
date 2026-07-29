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

function wrap(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  size: number,
  bold = false
) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  return doc.splitTextToSize(text || "", maxWidth) as string[];
}

export function buildPrescriptionPdfBytes(input: PrescriptionPdfInput): Uint8Array {
  // A4: 210 × 297 mm
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  const drawText = (
    rows: string[],
    x: number,
    startY: number,
    opts: {
      size: number;
      bold?: boolean;
      color?: [number, number, number];
      align?: "left" | "center";
      lineH?: number;
    }
  ) => {
    const lineH = opts.lineH ?? opts.size * 0.42;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size);
    doc.setTextColor(...(opts.color || ([15, 23, 42] as [number, number, number])));
    if (opts.align === "center") {
      doc.text(rows, x, startY, { align: "center" });
    } else {
      doc.text(rows, x, startY);
    }
    return rows.length * lineH;
  };

  // ——— Cabeçalho ———
  // ~50px a mais que o tamanho anterior (~16mm): ~28–30mm ≈ 106–113px em tela 96dpi
  const logoUrl = (input.clinicLogoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  const logoSize = 28;
  const hasLogo = Boolean(logoFormat && logoUrl);
  const textX = hasLogo ? margin + logoSize + 5 : margin;
  const textW = hasLogo ? contentW - logoSize - 5 : contentW;
  const headerY = y;

  if (hasLogo && logoFormat) {
    try {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, headerY, logoSize, logoSize, 2, 2, "S");
      doc.addImage(
        logoUrl,
        logoFormat,
        margin + 0.8,
        headerY + 0.8,
        logoSize - 1.6,
        logoSize - 1.6
      );
    } catch {
      // logo inválida
    }
  }

  const nameRows = wrap(doc, input.clinicName || "Clínica", textW, 15, true);
  let textCursor = headerY + 5;
  textCursor += drawText(nameRows, textX, textCursor, {
    size: 15,
    bold: true,
    lineH: 6,
  });

  const contact = [
    input.clinicAddress?.trim(),
    input.clinicPhone?.trim(),
    input.clinicCnpj ? `CNPJ ${input.clinicCnpj}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  if (contact) {
    textCursor += 1.5;
    const contactRows = wrap(doc, contact, textW, 8.5);
    textCursor += drawText(contactRows, textX, textCursor, {
      size: 8.5,
      color: [100, 116, 139],
      lineH: 3.8,
    });
  }

  y = Math.max(headerY + (hasLogo ? logoSize : 0), textCursor) + 5;
  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(0.65);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ——— Título ———
  y += drawText([KIND_LABELS[input.kind] || "Receituário"], margin, y, {
    size: 13,
    bold: true,
    lineH: 5.5,
  });
  y += 5;

  // ——— Caixa do paciente (altura calculada pelo conteúdo real) ———
  const boxPadX = 6;
  const boxPadY = 5;
  const innerW = contentW - boxPadX * 2;
  const labelRows = wrap(doc, "PACIENTE", innerW, 8, true);
  const patientNameRows = wrap(doc, input.patientName, innerW, 11.5, true);
  const metaParts = [
    input.patientCpf ? `CPF: ${input.patientCpf}` : "",
    input.patientBirthDate ? `Nascimento: ${input.patientBirthDate}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const metaRows = metaParts ? wrap(doc, metaParts, innerW, 8.5) : [];

  const boxInnerH =
    labelRows.length * 3.4 +
    2 +
    patientNameRows.length * 5 +
    (metaRows.length ? 2 + metaRows.length * 3.6 : 0);
  const boxH = boxInnerH + boxPadY * 2;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentW, boxH, 2.5, 2.5, "FD");

  let boxY = y + boxPadY + 3;
  boxY += drawText(labelRows, margin + boxPadX, boxY, {
    size: 8,
    bold: true,
    color: [100, 116, 139],
    lineH: 3.4,
  });
  boxY += 2;
  boxY += drawText(patientNameRows, margin + boxPadX, boxY, {
    size: 11.5,
    bold: true,
    lineH: 5,
  });
  if (metaRows.length) {
    boxY += 2;
    drawText(metaRows, margin + boxPadX, boxY, {
      size: 8.5,
      color: [100, 116, 139],
      lineH: 3.6,
    });
  }
  y += boxH + 8;

  // ——— Tabela medicamentos ———
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("#", margin, y);
  doc.text("MEDICAMENTO / POSOLOGIA", margin + 10, y);
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const medW = contentW - 10;
  input.medications.forEach((m, i) => {
    if (y > pageH - 55) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(i + 1), margin, y);

    const nameRows = wrap(doc, m.medicationName, medW, 10.5, true);
    y += drawText(nameRows, margin + 10, y, {
      size: 10.5,
      bold: true,
      lineH: 4.6,
    });

    const detail = [m.dose, m.frequency, m.duration].filter(Boolean).join(" · ");
    if (detail) {
      const detailRows = wrap(doc, detail, medW, 9.5);
      y += drawText(detailRows, margin + 10, y, {
        size: 9.5,
        color: [71, 85, 105],
        lineH: 4.1,
      });
    }

    if (m.instructions?.trim()) {
      const instRows = wrap(doc, m.instructions.trim(), medW, 8.5);
      y += drawText(instRows, margin + 10, y, {
        size: 8.5,
        color: [100, 116, 139],
        lineH: 3.8,
      });
    }

    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 5.5;
  });

  if (!input.medications.length) {
    y += drawText(["Sem itens."], margin, y, {
      size: 10,
      color: [100, 116, 139],
      lineH: 4.5,
    });
    y += 4;
  }

  // ——— Data ———
  const issued =
    `Emitida em ${input.issuedAt}` +
    (input.validUntil ? ` · Validade até ${input.validUntil}` : "");
  y += 2;
  y += drawText([issued], margin, y, {
    size: 9,
    color: [100, 116, 139],
    lineH: 4,
  });

  // ——— Assinaturas fixas na parte inferior da página A4 ———
  const sigBlockTop = Math.min(Math.max(y + 18, pageH - 48), pageH - 42);
  const colGap = 14;
  const colW = (contentW - colGap) / 2;
  const leftX = margin;
  const rightX = margin + colW + colGap;
  const lineY = sigBlockTop;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.35);
  doc.line(leftX, lineY, leftX + colW, lineY);
  doc.line(rightX, lineY, rightX + colW, lineY);

  let leftY = lineY + 5;
  const dentistNameRows = wrap(doc, input.dentistName, colW, 9.5, true);
  leftY += drawText(dentistNameRows, leftX + colW / 2, leftY, {
    size: 9.5,
    bold: true,
    align: "center",
    lineH: 4.2,
  });
  drawText(
    [`Cirurgião(ã)-Dentista · CRO ${input.dentistCro || "—"}`],
    leftX + colW / 2,
    leftY + 1,
    {
      size: 8,
      color: [71, 85, 105],
      align: "center",
      lineH: 3.6,
    }
  );

  let rightY = lineY + 5;
  rightY += drawText(["Paciente / Responsável"], rightX + colW / 2, rightY, {
    size: 8,
    color: [71, 85, 105],
    align: "center",
    lineH: 3.6,
  });
  drawText(wrap(doc, input.patientName, colW, 9.5, true), rightX + colW / 2, rightY + 1, {
    size: 9.5,
    bold: true,
    align: "center",
    lineH: 4.2,
  });

  // Preferência de abertura no visualizador (Chrome/Edge respeitam em geral)
  doc.setDisplayMode(75);

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

/** Fragmento de URL para abrir o PDF no navegador com zoom 75%. */
export const PRESCRIPTION_PDF_ZOOM = "zoom=75";

export function prescriptionPdfViewerUrl(prescriptionId: string) {
  return `/api/prescricoes/${prescriptionId}/pdf#${PRESCRIPTION_PDF_ZOOM}`;
}