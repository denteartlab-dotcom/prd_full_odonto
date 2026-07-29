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
  /** CPF do prescritor (só dígitos ou formatado) — carimbo digital. */
  dentistCpf?: string;
  patientName: string;
  patientAddress?: string;
  medications: PrescriptionItem[];
  issuedAt: string;
  issuedDateOnly?: string;
  /** Timestamp ISO ou Date para carimbo ICP-style. */
  signedAt?: Date | string;
  /**
   * Quando true, desenha o carimbo “Assinado de forma digital…” (foto 4).
   * Receita emitida digitalmente no sistema = true.
   */
  digitallySigned?: boolean;
  /** URL pública do PDF no sistema (validação interna). */
  digitalValidationUrl?: string;
};

const HDR_FILL: [number, number, number] = [196, 196, 196];
const FIELD_FILL: [number, number, number] = [238, 238, 238];
const LINE = 0.35;
const ITI_VALIDATE_URL = "https://assinaturadigital.iti.gov.br";

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

function drawEmitenteTitle(doc: jsPDF, x: number, y: number, w: number) {
  const h = 6.8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(x, y, w, h, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text("IDENTIFICAÇÃO DO EMITENTE", x + w / 2, y + 4.6, {
    align: "center",
  });
  return y + h;
}

/** Caixa VIA DIGITAL idêntica ao modelo gov (foto 3). */
function drawViaDigitalBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.rect(x, y, w, h, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("VIA DIGITAL", x + w / 2, y + 5.2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text("VALIDAR EM:", x + w / 2, y + 9.2, { align: "center" });
  doc.setFontSize(5.4);
  doc.text(ITI_VALIDATE_URL, x + w / 2, y + 12.8, { align: "center" });
}

/**
 * Campo: rótulo + faixa cinza (tamanhos do modelo).
 */
function grayValueField(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  totalW: number,
  labelW: number,
  rowH = 5
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y + rowH * 0.72);

  const boxX = x + labelW;
  const boxW = Math.max(4, totalW - labelW);
  doc.setFillColor(...FIELD_FILL);
  doc.rect(boxX, y, boxW, rowH, "F");

  if (value?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, boxW - 1.8) as string[];
    doc.text(lines[0] || "", boxX + 1, y + rowH * 0.72);
  }
  return rowH;
}

function grayBarOnly(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
  w: number,
  rowH = 5
) {
  doc.setFillColor(...FIELD_FILL);
  doc.rect(x, y, w, rowH, "F");
  if (value?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, w - 1.8) as string[];
    doc.text(lines[0] || "", x + 1, y + rowH * 0.72);
  }
  return rowH;
}

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
  const ix = x + w / 2;
  const iy = y + h / 2 - 5;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(ix - 7, iy - 5, 14, 10.5, "S");
  doc.circle(ix - 3, iy - 1.8, 1.2, "S");
  doc.line(ix - 6, iy + 3.5, ix - 1.5, iy + 0.2);
  doc.line(ix - 1.5, iy + 0.2, ix + 1.2, iy + 2.2);
  doc.line(ix + 1.2, iy + 2.2, ix + 6, iy - 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(90, 90, 90);
  doc.text("Logo do local de", ix, y + h / 2 + 5.5, { align: "center" });
  doc.text("atendimento (imagem)", ix, y + h / 2 + 8.5, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

/**
 * Espaço abaixo do logo — em branco até assinatura ICP real.
 * Mantém apenas o rótulo oficial no rodapé da coluna.
 */
function drawDigitalSignatureBlock(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.4);
  doc.setTextColor(0, 0, 0);
  doc.text("ASSINATURA DA(O) CIRURGIÃ(O) DENTISTA", x + w / 2, y + h - 2.8, {
    align: "center",
  });
}

/**
 * Receituário de Controle Especial Odontológico — 2 páginas A4.
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
  let y = 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(0, 0, 0);
  doc.text("RECEITUÁRIO DE CONTROLE ESPECIAL", pageW / 2 - 8, y + 9, {
    align: "center",
  });

  // Caixa VIA DIGITAL (foto 3) — validação gov/ITI
  const viaW = 48;
  const viaH = 16;
  const viaX = pageW - m - viaW;
  drawViaDigitalBox(doc, viaX, y, viaW, viaH);

  const frameTop = 26;
  const frameBottom = pageH - 8;
  doc.setLineWidth(0.5);
  doc.rect(m, frameTop, contentW, frameBottom - frameTop, "S");

  y = drawEmitenteTitle(doc, m, frameTop, contentW);

  const emitTop = y;
  const leftColW = contentW * 0.65;
  const rightColW = contentW - leftColW;
  const pad = 2.2;
  const lx = m + pad;
  const lw = leftColW - pad * 2;
  const rowH = 5;
  const gap = 1.35;
  let ly = y + 2.8;

  // NOME COMPLETO
  ly +=
    grayValueField(
      doc,
      "NOME COMPLETO:",
      input.dentistName,
      lx,
      ly,
      lw,
      30,
      rowH
    ) + gap;

  // INSCRIÇÃO + UF (UF alinhado à direita)
  {
    const ufColW = 28;
    const leftW = lw - ufColW - 3;
    grayValueField(doc, "INSCRIÇÃO:", cro.inscricao || "", lx, ly, leftW, 20, rowH);
    grayValueField(
      doc,
      "UF:",
      croUf || "",
      lx + leftW + 3,
      ly,
      ufColW,
      8,
      rowH
    );
    ly += rowH + gap;
  }

  // ENDEREÇO COMPLETO (2 faixas)
  {
    const labelW = 38;
    const addr = (input.clinicAddress || "").trim();
    const addrLines = doc.splitTextToSize(addr || " ", lw - labelW) as string[];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.text("ENDEREÇO COMPLETO:", lx, ly + rowH * 0.72);
    grayBarOnly(doc, addrLines[0] || "", lx + labelW, ly, lw - labelW, rowH);
    ly += rowH + 0.7;
    grayBarOnly(
      doc,
      addrLines.slice(1).join(" ").trim(),
      lx + labelW,
      ly,
      lw - labelW,
      rowH
    );
    ly += rowH + gap;
  }

  // CIDADE + UF
  {
    const ufColW = 28;
    const leftW = lw - ufColW - 3;
    grayValueField(
      doc,
      "CIDADE:",
      input.clinicCity || "",
      lx,
      ly,
      leftW,
      15,
      rowH
    );
    grayValueField(
      doc,
      "UF:",
      input.clinicState || "",
      lx + leftW + 3,
      ly,
      ufColW,
      8,
      rowH
    );
    ly += rowH + gap;
  }

  // TELEFONE + DATA
  {
    const ufColW = 36;
    const leftW = lw - ufColW - 3;
    grayValueField(
      doc,
      "TELEFONE:",
      input.clinicPhone || "",
      lx,
      ly,
      leftW,
      20,
      rowH
    );
    grayValueField(
      doc,
      "DATA:",
      dateOnly || "",
      lx + leftW + 3,
      ly,
      ufColW,
      12,
      rowH
    );
    ly += rowH + 2.5;
  }

  // —— Coluna direita: logo (cima) + assinatura digital (baixo) ——
  const rx = m + leftColW;
  const rw = rightColW;
  const logoPad = 2;
  const logoBoxX = rx + logoPad;
  const logoBoxW = rw - logoPad * 2;
  const logoY = emitTop + 2.5;
  const logoH = 30;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(logoBoxX, logoY, logoBoxW, logoH, "S");

  const logoUrl = (input.clinicLogoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  let logoDrawn = false;
  if (logoFormat && logoUrl) {
    try {
      doc.addImage(
        logoUrl,
        logoFormat,
        logoBoxX + 2,
        logoY + 2,
        logoBoxW - 4,
        logoH - 4
      );
      logoDrawn = true;
    } catch {
      logoDrawn = false;
    }
  }
  if (!logoDrawn) {
    drawLogoPlaceholder(doc, logoBoxX, logoY, logoBoxW, logoH);
  }

  const emitBottom = Math.max(ly + 2, logoY + logoH + 26);
  doc.setLineWidth(0.4);
  doc.line(m + leftColW, emitTop, m + leftColW, emitBottom);
  doc.line(m, emitBottom, m + contentW, emitBottom);

  // Área abaixo do logo: em branco (assinatura ICP futura)
  const sigTop = logoY + logoH + 1;
  const sigH = emitBottom - sigTop - 1;
  drawDigitalSignatureBlock(doc, logoBoxX, sigTop, logoBoxW, Math.max(18, sigH));

  // —— Paciente ——
  y = emitBottom + 4;
  y +=
    grayValueField(
      doc,
      "NOME PACIENTE:",
      input.patientName,
      m + 3,
      y,
      contentW - 6,
      32,
      5.2
    ) + 2;
  y +=
    grayValueField(
      doc,
      "ENDEREÇO COMPLETO:",
      input.patientAddress || "",
      m + 3,
      y,
      contentW - 6,
      38,
      5.2
    ) + 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(0, 0, 0);
  doc.text("PRESCRIÇÃO:", m + 3, y);
  y += 1.8;
  const prescTop = y;
  const buyerH = 82;
  const prescH = Math.max(48, frameBottom - buyerH - prescTop);
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
