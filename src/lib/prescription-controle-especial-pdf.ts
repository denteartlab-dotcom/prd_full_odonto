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

const HDR_FILL: [number, number, number] = [196, 196, 196];
const FIELD_FILL: [number, number, number] = [238, 238, 238];
const LINE = 0.35;

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
  if (!raw) return { inscricao: "", uf: "" };
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

function drawHeaderBar(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  w: number,
  h = 6.4
) {
  doc.setFillColor(...HDR_FILL);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(LINE);
  doc.rect(x, y, w, h, "FD");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(title, x + w / 2, y + h * 0.68, { align: "center" });
  return y + h;
}

/** Título da seção emitente — caixa com borda, fundo branco (como no modelo). */
function drawEmitenteTitle(doc: jsPDF, x: number, y: number, w: number) {
  const h = 7.2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.45);
  doc.rect(x, y, w, h, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("IDENTIFICAÇÃO DO EMITENTE", x + w / 2, y + 4.9, {
    align: "center",
  });
  return y + h;
}

/**
 * Campo no estilo oficial: rótulo + faixa cinza com valor na mesma linha.
 * Retorna a altura usada.
 */
function grayValueField(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  totalW: number,
  labelW: number,
  rowH = 5.6
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y + rowH * 0.72);

  const boxX = x + labelW;
  const boxW = Math.max(4, totalW - labelW);
  doc.setFillColor(...FIELD_FILL);
  doc.setDrawColor(...FIELD_FILL);
  doc.rect(boxX, y, boxW, rowH, "F");

  if (value?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, boxW - 2) as string[];
    doc.text(lines[0] || "", boxX + 1.2, y + rowH * 0.72);
  }
  return rowH;
}

/** Faixa cinza sem rótulo (continuação de endereço). */
function grayBarOnly(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
  w: number,
  rowH = 5.6
) {
  doc.setFillColor(...FIELD_FILL);
  doc.rect(x, y, w, rowH, "F");
  if (value?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, w - 2) as string[];
    doc.text(lines[0] || "", x + 1.2, y + rowH * 0.72);
  }
  return rowH;
}

/** Rótulo + linha de preenchimento (comprador / fornecedor). */
function labelLine(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  totalW: number,
  labelW: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y);
  const vx = x + labelW;
  const vw = Math.max(8, totalW - labelW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(value || " ", vw) as string[];
  doc.text(lines[0] || "", vx, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.line(vx, y + 1.15, x + totalW, y + 1.15);
  return 5.8;
}

/** Rótulo acima + faixa cinza (página 2 farmácia). */
function shadedInput(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  h = 6.8
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y);
  const boxY = y + 1.1;
  doc.setFillColor(...FIELD_FILL);
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.2);
  doc.rect(x, boxY, w, h, "FD");
  if (value?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, w - 2.5) as string[];
    doc.text(lines[0] || "", x + 1.4, boxY + 4.6);
  }
  return boxY + h + 2.4;
}

function emptyLineField(
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  w: number,
  labelW: number
) {
  return labelLine(doc, label, "", x, y, w, labelW);
}

function drawLogoPlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // ícone genérico de imagem
  const ix = x + w / 2;
  const iy = y + h / 2 - 4;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.35);
  doc.roundedRect(ix - 6, iy - 4.5, 12, 9, 0.8, 0.8, "S");
  doc.circle(ix - 2.5, iy - 1.5, 1.1, "S");
  doc.setLineWidth(0.3);
  doc.line(ix - 5, iy + 3, ix - 1, iy + 0.5);
  doc.line(ix - 1, iy + 0.5, ix + 1.5, iy + 2);
  doc.line(ix + 1.5, iy + 2, ix + 5, iy - 0.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(90, 90, 90);
  doc.text("Logo do local de", ix, y + h / 2 + 6, { align: "center" });
  doc.text("atendimento (imagem)", ix, y + h / 2 + 9, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

/**
 * Receituário de Controle Especial Odontológico — 2 páginas A4
 * (layout oficial: emitente / paciente / comprador / fornecedor + verso farmácia).
 */
export function buildControleEspecialPdfBytes(
  input: ControleEspecialPdfInput
): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const m = 10;
  const contentW = pageW - m * 2;
  const cro = parseCro(input.dentistCro);
  const croUf = input.dentistCroUf || cro.uf || input.clinicState || "";
  const dateOnly =
    input.issuedDateOnly ||
    (input.issuedAt.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? "");

  // ========== PÁGINA 1 ==========
  let y = 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.2);
  doc.setTextColor(0, 0, 0);
  doc.text("RECEITUÁRIO DE CONTROLE ESPECIAL", pageW / 2, y + 9.5, {
    align: "center",
  });

  const viaW = 46;
  const viaX = pageW - m - viaW;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.45);
  doc.rect(viaX, y + 1, viaW, 15, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("VIA DIGITAL", viaX + viaW / 2, y + 5.2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  const viaUrl =
    input.digitalValidationUrl || "https://assinaturadigital.iti.gov.br";
  const viaLines = doc.splitTextToSize(viaUrl, viaW - 3) as string[];
  doc.text(viaLines.slice(0, 3), viaX + viaW / 2, y + 8.8, {
    align: "center",
  });

  const frameTop = 26;
  const frameBottom = pageH - 8;
  const frameH = frameBottom - frameTop;
  doc.setLineWidth(0.55);
  doc.rect(m, frameTop, contentW, frameH, "S");

  // —— IDENTIFICAÇÃO DO EMITENTE (idêntico ao modelo) ——
  y = drawEmitenteTitle(doc, m, frameTop, contentW);

  const emitTop = y;
  const leftColW = contentW * 0.66;
  const rightColW = contentW - leftColW;
  const pad = 2.5;
  const lx = m + pad;
  const lw = leftColW - pad * 2;
  const rowH = 5.8;
  const gap = 1.6;
  let ly = y + 3.2;

  // NOME COMPLETO
  ly +=
    grayValueField(
      doc,
      "NOME COMPLETO:",
      input.dentistName,
      lx,
      ly,
      lw,
      32,
      rowH
    ) + gap;

  // INSCRIÇÃO + UF (mesma linha)
  {
    const half = lw * 0.62;
    grayValueField(
      doc,
      "INSCRIÇÃO:",
      cro.inscricao || "",
      lx,
      ly,
      half,
      22,
      rowH
    );
    grayValueField(
      doc,
      "UF:",
      croUf || "",
      lx + half + 2,
      ly,
      lw - half - 2,
      8,
      rowH
    );
    ly += rowH + gap;
  }

  // ENDEREÇO COMPLETO (2 faixas cinza)
  {
    const addr = (input.clinicAddress || "").trim();
    const addrLines = doc.splitTextToSize(addr || " ", lw - 40) as string[];
    const line1 = addrLines[0] || "";
    const line2 = addrLines.slice(1).join(" ").trim();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.text("ENDEREÇO COMPLETO:", lx, ly + rowH * 0.72);
    grayBarOnly(doc, line1, lx + 40, ly, lw - 40, rowH);
    ly += rowH + 0.8;
    grayBarOnly(doc, line2, lx + 40, ly, lw - 40, rowH);
    ly += rowH + gap;
  }

  // CIDADE + UF
  {
    const half = lw * 0.7;
    grayValueField(
      doc,
      "CIDADE:",
      input.clinicCity || "",
      lx,
      ly,
      half,
      16,
      rowH
    );
    grayValueField(
      doc,
      "UF:",
      input.clinicState || "",
      lx + half + 2,
      ly,
      lw - half - 2,
      8,
      rowH
    );
    ly += rowH + gap;
  }

  // TELEFONE + DATA
  {
    const half = lw * 0.62;
    grayValueField(
      doc,
      "TELEFONE:",
      input.clinicPhone || "",
      lx,
      ly,
      half,
      22,
      rowH
    );
    grayValueField(
      doc,
      "DATA:",
      dateOnly || "",
      lx + half + 2,
      ly,
      lw - half - 2,
      12,
      rowH
    );
    ly += rowH + 3;
  }

  // Coluna direita: logo + assinatura
  const rx = m + leftColW + 2;
  const rw = rightColW - 4;
  const logoY = emitTop + 3.5;
  const logoH = 32;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(rx, logoY, rw, logoH, "S");

  const logoUrl = (input.clinicLogoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  let logoDrawn = false;
  if (logoFormat && logoUrl) {
    try {
      doc.addImage(
        logoUrl,
        logoFormat,
        rx + 2.5,
        logoY + 2,
        rw - 5,
        logoH - 4
      );
      logoDrawn = true;
    } catch {
      logoDrawn = false;
    }
  }
  if (!logoDrawn) {
    drawLogoPlaceholder(doc, rx, logoY, rw, logoH);
  }

  const emitBottom = Math.max(ly + 2, logoY + logoH + 28);
  doc.setLineWidth(0.4);
  doc.line(m + leftColW, emitTop, m + leftColW, emitBottom);
  doc.line(m, emitBottom, m + contentW, emitBottom);

  // Assinatura (metade inferior da coluna direita)
  const sigAreaTop = logoY + logoH;
  const sigAreaH = emitBottom - sigAreaTop;
  const sigCy = sigAreaTop + sigAreaH * 0.42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  const nameLines = doc.splitTextToSize(
    input.dentistName.toUpperCase(),
    rw - 4
  ) as string[];
  doc.text(nameLines.slice(0, 2), rx + rw / 2, sigCy, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.6);
  doc.text(
    "ASSINATURA DA(O) CIRURGIÃ(O) DENTISTA",
    rx + rw / 2,
    emitBottom - 3.2,
    { align: "center" }
  );

  // —— Paciente (fora da caixa do emitente, com faixas cinza) ——
  y = emitBottom + 4.5;
  const patientLabelW = 34;
  y +=
    grayValueField(
      doc,
      "NOME PACIENTE:",
      input.patientName,
      m + 3,
      y,
      contentW - 6,
      patientLabelW,
      6.2
    ) + 2.2;
  y +=
    grayValueField(
      doc,
      "ENDEREÇO COMPLETO:",
      input.patientAddress || "",
      m + 3,
      y,
      contentW - 6,
      40,
      6.2
    ) + 3.5;

  // Prescrição
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text("PRESCRIÇÃO:", m + 3, y);
  y += 2;
  const prescTop = y;
  const buyerH = 82;
  const prescH = Math.max(50, frameBottom - buyerH - prescTop);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(LINE);
  doc.rect(m + 2.5, prescTop, contentW - 5, prescH, "S");

  let py = prescTop + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  for (const med of input.medications) {
    const qtyPart = [med.dose, med.frequency, med.duration]
      .filter(Boolean)
      .join(" — ");
    const parts = [
      med.medicationName,
      qtyPart,
      med.instructions?.trim() || "",
    ].filter(Boolean);
    const block = parts.join(". ");
    const rows = doc.splitTextToSize(block, contentW - 14) as string[];
    if (py + rows.length * 4.5 > prescTop + prescH - 5) break;
    doc.text(rows, m + 6, py);
    py += rows.length * 4.5 + 3.5;
  }

  y = prescTop + prescH;

  // Comprador | Fornecedor
  const half = contentW / 2;
  doc.setLineWidth(0.45);
  doc.line(m, y, m + contentW, y);
  doc.line(m + half, y, m + half, frameBottom);

  // —— Comprador ——
  let by = drawHeaderBar(doc, "IDENTIFICAÇÃO DO COMPRADOR", m, y, half);
  by += 5;
  const bx = m + 3;
  const bw = half - 6;
  by += emptyLineField(doc, "NOME COMPLETO:", bx, by, bw, 32);
  by += 2.4;
  by += emptyLineField(doc, "RG:", bx, by, bw, 10);
  by += 2.4;
  by += emptyLineField(doc, "ÓRGÃO EMISSOR:", bx, by, bw, 32);
  by += 2.4;
  by += emptyLineField(doc, "ENDEREÇO COMPLETO:", bx, by, bw, 38);
  by += 2.4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("CIDADE:", bx, by);
  doc.setLineWidth(0.25);
  doc.line(bx + 16, by + 1.15, bx + bw * 0.62, by + 1.15);
  doc.setFont("helvetica", "bold");
  doc.text("UF:", bx + bw * 0.68, by);
  doc.line(bx + bw * 0.68 + 8, by + 1.15, bx + bw, by + 1.15);
  by += 7.5;

  by += emptyLineField(doc, "TELEFONE:", bx, by, bw, 22);

  // —— Fornecedor ——
  let fy = drawHeaderBar(
    doc,
    "IDENTIFICAÇÃO DO FORNECEDOR",
    m + half,
    y,
    half
  );
  fy += 5;
  const fx = m + half + 3;
  const fw = half - 6;

  fy += emptyLineField(doc, "NOME FARMACÊUTICO(A):", fx, fy, fw, 42);
  fy += 2.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("CRF:", fx, fy);
  doc.setLineWidth(0.25);
  doc.line(fx + 12, fy + 1.15, fx + fw * 0.45, fy + 1.15);
  doc.setFont("helvetica", "bold");
  doc.text("UF:", fx + fw * 0.5, fy);
  doc.line(fx + fw * 0.5 + 8, fy + 1.15, fx + fw, fy + 1.15);
  fy += 7.5;

  fy += emptyLineField(doc, "NOME FARMÁCIA:", fx, fy, fw, 32);
  fy += 2.2;
  fy += emptyLineField(doc, "ENDEREÇO:", fx, fy, fw, 22);
  fy += 2.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("CIDADE:", fx, fy);
  doc.setLineWidth(0.25);
  doc.line(fx + 16, fy + 1.15, fx + fw * 0.62, fy + 1.15);
  doc.setFont("helvetica", "bold");
  doc.text("UF:", fx + fw * 0.68, fy);
  doc.line(fx + fw * 0.68 + 8, fy + 1.15, fx + fw, fy + 1.15);
  fy += 7.5;

  fy += emptyLineField(doc, "CNPJ:", fx, fy, fw, 14);
  fy += 2.2;
  fy += emptyLineField(doc, "TELEFONE:", fx, fy, fw, 22);

  fy = Math.max(fy + 4, frameBottom - 10);
  doc.setLineWidth(0.3);
  doc.line(fx + 4, fy, fx + fw - 2, fy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.text("ASSINATURA FARMACÊUTICO(A)", fx + fw / 2, fy + 3.5, {
    align: "center",
  });

  // ========== PÁGINA 2 ==========
  doc.addPage();
  const p2Top = 10;
  const p2Bottom = pageH - 8;
  doc.setLineWidth(0.55);
  doc.rect(m, p2Top, contentW, p2Bottom - p2Top, "S");

  y = drawHeaderBar(
    doc,
    "DADOS DO(S) PRODUTO(S) DISPENSADOS",
    m,
    p2Top,
    contentW
  );
  y += 3.5;

  for (let i = 0; i < 3; i++) {
    const boxH = 40;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(m + 3, y, contentW - 6, boxH, "S");

    let iy = y + 3;
    const ix = m + 5;
    const iw = contentW - 12;
    iy = shadedInput(doc, "NOME DO MEDICAMENTO", "", ix, iy, iw, 6);
    iy = shadedInput(doc, "LABORATÓRIO", "", ix, iy, iw, 6);
    const rowY = iy;
    iy = shadedInput(doc, "NÚMERO DO LOTE", "", ix, rowY, iw * 0.52, 6);
    shadedInput(
      doc,
      "QUANTIDADE",
      "",
      ix + iw * 0.56,
      rowY,
      iw * 0.44,
      6
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "NÚMERO DE REGISTRO DA RECEITA NO LIVRO DE RECEITUÁRIO: (QUANDO MEDICAMENTO MANIPULADO)",
      ix,
      iy
    );
    doc.setFillColor(...FIELD_FILL);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.2);
    doc.rect(ix, iy + 1.1, iw, 5.2, "FD");
    y += boxH + 2.8;
  }

  y = drawHeaderBar(
    doc,
    "INFORMAÇÕES SOBRE INTERCAMBIALIDADE",
    m,
    y,
    contentW
  );
  y += 3;

  for (let i = 0; i < 3; i++) {
    const boxH = 17.5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(m + 3, y, contentW - 6, boxH, "S");

    const ix = m + 5;
    let iy = y + 5.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text("O MEDICAMENTO", ix, iy);
    doc.setFillColor(...FIELD_FILL);
    doc.setDrawColor(120, 120, 120);
    doc.rect(ix + 30, iy - 3.4, contentW - 46, 5.2, "FD");

    iy += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("FOI SUBSTITUÍDO PELO GENÉRICO", ix, iy);
    doc.setFillColor(...FIELD_FILL);
    doc.rect(ix + 58, iy - 3.4, 48, 5.2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("DE ACORDO COM A LEI 9787/99.", ix + 109, iy);

    y += boxH + 2.5;
  }

  y = drawHeaderBar(doc, "PARA DISPENSAÇÃO MANUAL", m, y, contentW);
  y += 11;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.text("DATA:", m + 5, y);
  doc.line(m + 18, y + 0.4, m + 72, y + 0.4);
  y += 13;
  doc.text("ASSINATURA DO COMPRADOR:", m + 5, y);
  doc.line(m + 58, y + 0.4, m + contentW - 8, y + 0.4);
  y += 13;
  doc.text("ASSINATURA DO FARMACÊUTICO:", m + 5, y);
  doc.line(m + 64, y + 0.4, m + contentW - 8, y + 0.4);

  doc.setDisplayMode(75);
  const ab = doc.output("arraybuffer");
  return new Uint8Array(ab as ArrayBuffer);
}
