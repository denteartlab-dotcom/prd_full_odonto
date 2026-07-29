import { jsPDF } from "jspdf";
import type { PrescriptionItem } from "@/lib/prescription-types";

export type ControleEspecialPdfInput = {
  clinicName: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicState?: string;
  clinicPhone?: string;
  clinicLogoUrl?: string | null;
  dentistName: string;
  dentistCro?: string;
  dentistCroUf?: string;
  patientName: string;
  patientAddress?: string;
  medications: PrescriptionItem[];
  issuedAt: string;
  issuedDateOnly?: string;
  digitalValidationUrl?: string;
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

function parseCro(cro?: string) {
  const raw = (cro || "").trim();
  if (!raw) return { inscricao: "—", uf: "" };
  const m = raw.match(/(?:CRO[-\s]*)?([A-Z]{2})?[-\s\/]*(\d+)/i);
  if (m) {
    return {
      uf: (m[1] || "").toUpperCase(),
      inscricao: m[2],
    };
  }
  const ufOnly = raw.match(/\b([A-Z]{2})\b/);
  return {
    inscricao: raw.replace(/^CRO[-\s]*/i, ""),
    uf: ufOnly?.[1]?.toUpperCase() || "",
  };
}

function sectionHeader(doc: jsPDF, title: string, x: number, y: number, w: number) {
  doc.setFillColor(200, 200, 200);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(x, y, w, 6.2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(0, 0, 0);
  doc.text(title, x + w / 2, y + 4.2, { align: "center" });
  return y + 6.2;
}

/** Campo com rótulo + caixa cinza clara (como no formulário oficial). */
function grayField(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  h = 7.2
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y);
  const boxY = y + 1.2;
  doc.setFillColor(235, 235, 235);
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.2);
  doc.rect(x, boxY, w, h, "FD");
  if (value?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, w - 3) as string[];
    doc.text(lines.slice(0, Math.max(1, Math.floor(h / 3.5))), x + 1.5, boxY + 4.5);
  }
  return boxY + h + 2.2;
}

function inlineLabeledLine(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  labelW: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y);
  const vx = x + labelW;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(value || " ", Math.max(8, w - labelW)) as string[];
  doc.text(lines[0] || " ", vx, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(vx, y + 1.1, x + w, y + 1.1);
  return 5.5;
}

function drawCfoBadge(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.circle(x + 8, y + 8, 7.8, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CFO", x + 8, y + 6.5, { align: "center" });
  doc.setFontSize(5);
  doc.text("CONSELHO", x + 8, y + 9.2, { align: "center" });
  doc.text("FEDERAL", x + 8, y + 11.2, { align: "center" });
}

function drawBrazilArms(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.circle(x + 8, y + 8, 7.5, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.5);
  doc.text("REPÚBLICA", x + 8, y + 5.8, { align: "center" });
  doc.text("FEDERATIVA", x + 8, y + 8.2, { align: "center" });
  doc.text("DO BRASIL", x + 8, y + 10.6, { align: "center" });
}

function blankBuyerField(doc: jsPDF, label: string, x: number, y: number, w: number) {
  return grayField(doc, label, "", x, y, w, 6.5);
}

/**
 * Receituário de Controle Especial Odontológico — 2 páginas A4,
 * layout oficial (emitente / paciente / comprador / fornecedor + verso farmácia).
 */
export function buildControleEspecialPdfBytes(
  input: ControleEspecialPdfInput
): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const m = 9;
  const contentW = pageW - m * 2;
  const cro = parseCro(input.dentistCro);
  const croUf = input.dentistCroUf || cro.uf || input.clinicState || "";
  const dateOnly =
    input.issuedDateOnly ||
    (input.issuedAt.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? "");

  // ——— Página 1 ———
  let y = 7;

  drawCfoBadge(doc, m, y);
  drawBrazilArms(doc, m + 18, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(0, 0, 0);
  doc.text("RECEITUÁRIO DE CONTROLE ESPECIAL", pageW / 2, y + 9, {
    align: "center",
  });

  const viaX = pageW - m - 44;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(viaX, y + 0.5, 44, 14, "S");
  doc.setFontSize(7.5);
  doc.text("VIA DIGITAL", viaX + 22, y + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.2);
  const viaUrl =
    input.digitalValidationUrl || "https://validar.iti.gov.br";
  const viaLines = doc.splitTextToSize(viaUrl, 41) as string[];
  doc.text(viaLines.slice(0, 3), viaX + 22, y + 8, { align: "center" });

  y = 26;
  const outerTop = y;
  const outerBottom = pageH - 8;
  doc.setLineWidth(0.5);
  doc.rect(m, outerTop, contentW, outerBottom - outerTop, "S");

  y = sectionHeader(doc, "IDENTIFICAÇÃO DO EMITENTE", m, y, contentW);

  const emitTop = y;
  const leftW = contentW * 0.64;
  const rightW = contentW - leftW;
  const leftX = m + 2.5;
  const rightX = m + leftW + 1.5;
  let ly = y + 5;

  ly += inlineLabeledLine(
    doc,
    "NOME COMPLETO:",
    input.dentistName,
    leftX,
    ly,
    leftW - 5,
    32
  );
  ly += 1.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("INSCRIÇÃO:", leftX, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(cro.inscricao, leftX + 22, ly);
  doc.line(leftX + 22, ly + 1.1, leftX + 58, ly + 1.1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("UF:", leftX + 62, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(croUf || "—", leftX + 70, ly);
  doc.line(leftX + 70, ly + 1.1, leftX + leftW - 6, ly + 1.1);
  ly += 6.5;

  ly += inlineLabeledLine(
    doc,
    "ENDEREÇO COMPLETO:",
    input.clinicAddress || "",
    leftX,
    ly,
    leftW - 5,
    40
  );
  ly += 1.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("CIDADE:", leftX, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(input.clinicCity || "", leftX + 16, ly);
  doc.line(leftX + 16, ly + 1.1, leftX + 72, ly + 1.1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("UF:", leftX + 75, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(input.clinicState || "", leftX + 83, ly);
  doc.line(leftX + 83, ly + 1.1, leftX + leftW - 6, ly + 1.1);
  ly += 6.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("TELEFONE:", leftX, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(input.clinicPhone || "", leftX + 20, ly);
  doc.line(leftX + 20, ly + 1.1, leftX + 72, ly + 1.1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("DATA:", leftX + 75, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(dateOnly || "", leftX + 87, ly);
  doc.line(leftX + 87, ly + 1.1, leftX + leftW - 6, ly + 1.1);
  ly += 4;

  // Logo + assinatura (direita)
  const logoBoxY = emitTop + 2.5;
  const logoBoxH = 30;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(rightX, logoBoxY, rightW - 4, logoBoxH, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(90, 90, 90);
  doc.text("Logo do local de", rightX + (rightW - 4) / 2, logoBoxY + 12, {
    align: "center",
  });
  doc.text("atendimento (imagem)", rightX + (rightW - 4) / 2, logoBoxY + 15.5, {
    align: "center",
  });

  const logoUrl = (input.clinicLogoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  if (logoFormat && logoUrl) {
    try {
      doc.addImage(
        logoUrl,
        logoFormat,
        rightX + 3,
        logoBoxY + 2.5,
        rightW - 10,
        logoBoxH - 5
      );
    } catch {
      /* keep placeholder */
    }
  }

  const sigY = logoBoxY + logoBoxH + 12;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(rightX + 2, sigY, rightX + rightW - 6, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text(input.dentistName, rightX + (rightW - 4) / 2, sigY - 2, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.text(
    "ASSINATURA DO(A) CIRURGIÃO(Ã) DENTISTA",
    rightX + (rightW - 4) / 2,
    sigY + 3.8,
    { align: "center" }
  );

  const emitBottom = Math.max(ly + 3, sigY + 9);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(m + leftW, emitTop, m + leftW, emitBottom);
  doc.line(m, emitBottom, m + contentW, emitBottom);
  y = emitBottom + 5;

  y += inlineLabeledLine(
    doc,
    "NOME PACIENTE:",
    input.patientName,
    m + 2.5,
    y,
    contentW - 5,
    32
  );
  y += 2;
  y += inlineLabeledLine(
    doc,
    "ENDEREÇO COMPLETO:",
    input.patientAddress || "",
    m + 2.5,
    y,
    contentW - 5,
    40
  );
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PRESCRIÇÃO:", m + 2.5, y);
  y += 2;
  const prescTop = y;
  const bottomBlockH = 78;
  const prescH = Math.max(48, outerBottom - bottomBlockH - prescTop - 2);
  doc.setLineWidth(0.35);
  doc.rect(m + 2, prescTop, contentW - 4, prescH, "S");

  let py = prescTop + 7;
  for (const med of input.medications) {
    const title = med.medicationName;
    const detail = [
      [med.dose, med.frequency, med.duration].filter(Boolean).join(" — "),
      med.instructions?.trim() || "",
    ]
      .filter(Boolean)
      .join(". ");
    const block = detail ? `${title}. ${detail}` : title;
    const rows = doc.splitTextToSize(block, contentW - 12) as string[];
    if (py + rows.length * 4.4 > prescTop + prescH - 4) break;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);
    doc.text(rows, m + 5, py);
    py += rows.length * 4.4 + 3;
  }
  y = prescTop + prescH;

  // Comprador | Fornecedor
  const half = contentW / 2;
  const bottomH = outerBottom - y;
  doc.setLineWidth(0.4);
  doc.line(m, y, m + contentW, y);
  doc.line(m + half, y, m + half, outerBottom);

  let by = sectionHeader(doc, "IDENTIFICAÇÃO DO COMPRADOR", m, y, half);
  by += 3;
  const buyerPad = 2.5;
  const buyerInnerW = half - buyerPad * 2;
  by = blankBuyerField(doc, "NOME COMPLETO", m + buyerPad, by, buyerInnerW);
  by = blankBuyerField(doc, "RG", m + buyerPad, by, buyerInnerW * 0.55);
  // RG row already advanced; overlay UF-style second field on same visual row is hard —
  // use sequential fields matching the form:
  by = blankBuyerField(
    doc,
    "ÓRGÃO EMISSOR / UF",
    m + buyerPad,
    by,
    buyerInnerW
  );
  by = blankBuyerField(doc, "ENDEREÇO COMPLETO", m + buyerPad, by, buyerInnerW);
  const cityRowY = by;
  by = blankBuyerField(doc, "CIDADE", m + buyerPad, cityRowY, buyerInnerW * 0.62);
  blankBuyerField(
    doc,
    "UF",
    m + buyerPad + buyerInnerW * 0.66,
    cityRowY,
    buyerInnerW * 0.34
  );
  by = blankBuyerField(doc, "TELEFONE", m + buyerPad, by, buyerInnerW);

  let fy = sectionHeader(doc, "IDENTIFICAÇÃO DO FORNECEDOR", m + half, y, half);
  fy += 3;
  const fPad = 2.5;
  const fInnerW = half - fPad * 2;
  fy = blankBuyerField(
    doc,
    "NOME FARMACÊUTICO(A)",
    m + half + fPad,
    fy,
    fInnerW
  );
  const crfY = fy;
  fy = blankBuyerField(
    doc,
    "CRF",
    m + half + fPad,
    crfY,
    fInnerW * 0.55
  );
  blankBuyerField(
    doc,
    "UF",
    m + half + fPad + fInnerW * 0.6,
    crfY,
    fInnerW * 0.4
  );
  fy = blankBuyerField(doc, "NOME FARMÁCIA", m + half + fPad, fy, fInnerW);
  fy = blankBuyerField(doc, "ENDEREÇO", m + half + fPad, fy, fInnerW);
  const fCityY = fy;
  fy = blankBuyerField(
    doc,
    "CIDADE",
    m + half + fPad,
    fCityY,
    fInnerW * 0.62
  );
  blankBuyerField(
    doc,
    "UF",
    m + half + fPad + fInnerW * 0.66,
    fCityY,
    fInnerW * 0.34
  );
  fy = blankBuyerField(doc, "CNPJ", m + half + fPad, fy, fInnerW);
  fy = blankBuyerField(doc, "TELEFONE", m + half + fPad, fy, fInnerW);
  fy += 4;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(m + half + 8, fy, m + contentW - 6, fy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.text("ASSINATURA FARMACÊUTICO(A)", m + half + half / 2, fy + 3.5, {
    align: "center",
  });

  // ——— Página 2 ———
  doc.addPage();
  y = 10;
  doc.setLineWidth(0.5);
  doc.rect(m, y, contentW, pageH - y - 8, "S");

  y = sectionHeader(
    doc,
    "DADOS DO(S) PRODUTO(S) DISPENSADOS",
    m,
    y,
    contentW
  );
  y += 4;

  for (let i = 0; i < 3; i++) {
    const boxTop = y;
    const boxH = 38;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(m + 3, boxTop, contentW - 6, boxH, "S");

    let iy = boxTop + 3;
    const ix = m + 5;
    const iw = contentW - 12;
    iy = grayField(doc, "NOME DO MEDICAMENTO", "", ix, iy, iw, 6.2);
    iy = grayField(doc, "LABORATÓRIO", "", ix, iy, iw, 6.2);
    const loteY = iy;
    iy = grayField(doc, "NÚMERO DO LOTE", "", ix, loteY, iw * 0.55, 6.2);
    grayField(
      doc,
      "QUANTIDADE",
      "",
      ix + iw * 0.58,
      loteY,
      iw * 0.42,
      6.2
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "NÚMERO DE REGISTRO DA RECEITA NO LIVRO DE RECEITUÁRIO: (QUANDO MEDICAMENTO MANIPULADO)",
      ix,
      iy
    );
    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(160, 160, 160);
    doc.rect(ix, iy + 1.2, iw, 5.5, "FD");
    y = boxTop + boxH + 3;
  }

  y = sectionHeader(
    doc,
    "INFORMAÇÕES SOBRE INTERCAMBIALIDADE",
    m,
    y,
    contentW
  );
  y += 3;

  for (let i = 0; i < 3; i++) {
    const boxH = 18;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(m + 3, y, contentW - 6, boxH, "S");

    let ix = m + 5;
    let iy = y + 5.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text("O MEDICAMENTO", ix, iy);
    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(160, 160, 160);
    doc.rect(ix + 30, iy - 3.5, contentW - 48, 5.5, "FD");

    iy += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("FOI SUBSTITUÍDO PELO GENÉRICO", ix, iy);
    doc.setFillColor(235, 235, 235);
    doc.rect(ix + 58, iy - 3.5, 52, 5.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("DE ACORDO COM A LEI 9787/99.", ix + 112, iy);

    y += boxH + 2.5;
  }

  y = sectionHeader(doc, "PARA DISPENSAÇÃO MANUAL", m, y, contentW);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("DATA:", m + 5, y);
  doc.setLineWidth(0.35);
  doc.line(m + 18, y + 0.5, m + 70, y + 0.5);
  y += 12;
  doc.text("ASSINATURA DO COMPRADOR:", m + 5, y);
  doc.line(m + 58, y + 0.5, m + contentW - 8, y + 0.5);
  y += 12;
  doc.text("ASSINATURA DO FARMACÊUTICO:", m + 5, y);
  doc.line(m + 64, y + 0.5, m + contentW - 8, y + 0.5);

  doc.setDisplayMode(75);
  const ab = doc.output("arraybuffer");
  return new Uint8Array(ab as ArrayBuffer);
}
