import { jsPDF } from "jspdf";
import type { EvolucaoClinica } from "@/lib/prontuario-types";
import { EVOLUCAO_STATUS_LABEL, EVOLUCAO_TIPO_LABEL } from "@/lib/prontuario-types";

export type ProntuarioPdfClinic = {
  name: string;
  headerLines: string[];
  logoUrl?: string | null;
};

export type ProntuarioPdfPatient = {
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  chartNumber?: string;
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

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDateBr(iso: string) {
  const [y, m, d] = (iso || "").split("-");
  if (!y || !m || !d) return iso || "—";
  return `${d}/${m}/${y}`;
}

function atendimentoText(evolucao: EvolucaoClinica) {
  if (evolucao.evolucaoClinica?.trim()) {
    return stripHtml(evolucao.evolucaoClinica);
  }
  const parts = [
    evolucao.queixaPrincipal,
    evolucao.historiaClinica,
    evolucao.diagnostico,
    evolucao.procedimentoExecutado,
    evolucao.planoTratamento,
    evolucao.conduta,
    evolucao.recomendacoes,
    evolucao.observacoes,
  ]
    .map((p) => stripHtml(p || ""))
    .filter(Boolean);
  return parts.join("\n\n") || "—";
}

export function buildProntuarioPdfBytes(input: {
  clinic: ProntuarioPdfClinic;
  patient: ProntuarioPdfPatient;
  evolucao: EvolucaoClinica;
}): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 16;

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageH - 18) return;
    doc.addPage();
    y = 18;
  };

  const drawText = (
    rows: string[],
    x: number,
    startY: number,
    opts: {
      size: number;
      bold?: boolean;
      color?: [number, number, number];
      lineH?: number;
    }
  ) => {
    const lineH = opts.lineH ?? opts.size * 0.42;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size);
    doc.setTextColor(...(opts.color || ([15, 23, 42] as [number, number, number])));
    doc.text(rows, x, startY);
    return rows.length * lineH;
  };

  // ——— Cabeçalho da clínica ———
  const logoUrl = (input.clinic.logoUrl || "").trim();
  const logoFormat = logoUrl ? detectImageFormat(logoUrl) : null;
  const logoSize = 26;
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
      /* logo inválida */
    }
  }

  const nameRows = wrap(doc, input.clinic.name || "Clínica Odontológica", textW, 14, true);
  let textCursor = headerY + 5;
  textCursor += drawText(nameRows, textX, textCursor, {
    size: 14,
    bold: true,
    lineH: 5.5,
  });

  for (const line of input.clinic.headerLines.map((l) => l.trim()).filter(Boolean)) {
    textCursor += 1;
    const rows = wrap(doc, line, textW, 8.5);
    textCursor += drawText(rows, textX, textCursor, {
      size: 8.5,
      color: [100, 116, 139],
      lineH: 3.7,
    });
  }

  y = Math.max(headerY + (hasLogo ? logoSize : 0), textCursor) + 4;
  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ——— Título ———
  y += drawText(["Prontuário Odontológico"], margin, y, {
    size: 13,
    bold: true,
    lineH: 5.5,
  });
  y += 2;
  y += drawText(["Evolução clínica / atendimento"], margin, y, {
    size: 9,
    color: [100, 116, 139],
    lineH: 4,
  });
  y += 6;

  // ——— Paciente ———
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, "FD");
  let py = y + 6;
  py += drawText([`Paciente: ${input.patient.name}`], margin + 3, py, {
    size: 10,
    bold: true,
    lineH: 4.5,
  });
  const patientMeta = [
    input.patient.chartNumber ? `Ficha: ${input.patient.chartNumber}` : "",
    input.patient.cpf ? `CPF: ${input.patient.cpf}` : "",
    input.patient.birthDate ? `Nascimento: ${formatDateBr(input.patient.birthDate)}` : "",
    input.patient.phone ? `Tel.: ${input.patient.phone}` : "",
    input.patient.email ? `E-mail: ${input.patient.email}` : "",
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (patientMeta) {
    const metaRows = wrap(doc, patientMeta, contentW - 6, 8);
    drawText(metaRows, margin + 3, py + 1, {
      size: 8,
      color: [71, 85, 105],
      lineH: 3.5,
    });
  }
  y += 34;

  // ——— Dados da evolução ———
  const e = input.evolucao;
  ensureSpace(40);
  y += drawText(["Dados do atendimento"], margin, y, {
    size: 11,
    bold: true,
    lineH: 5,
  });
  y += 3;

  const fields: [string, string][] = [
    ["Título", e.titulo || "Atendimento"],
    ["Tipo", EVOLUCAO_TIPO_LABEL[e.tipo] || e.tipo],
    ["Status", EVOLUCAO_STATUS_LABEL[e.status] || e.status],
    ["Data", formatDateBr(e.date)],
    ["Hora", e.time || "—"],
    ["Profissional", e.profissional || "—"],
    ["Especialidade", e.especialidade || "—"],
    ["Retorno", e.retorno ? formatDateBr(e.retorno) : "—"],
  ];

  for (const [label, value] of fields) {
    ensureSpace(8);
    const line = `${label}: ${value}`;
    const rows = wrap(doc, line, contentW, 9.5);
    y += drawText(rows, margin, y, { size: 9.5, lineH: 4.2 });
    y += 1.5;
  }

  y += 4;
  ensureSpace(20);
  y += drawText(["Atendimento"], margin, y, {
    size: 11,
    bold: true,
    lineH: 5,
  });
  y += 3;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  const text = atendimentoText(e);
  const bodyRows = wrap(doc, text, contentW - 4, 10);

  // Paginate long text
  let remaining = bodyRows;
  while (remaining.length) {
    ensureSpace(30);
    const available = pageH - 18 - y - 8;
    const maxLines = Math.max(4, Math.floor(available / 4.4));
    const chunk = remaining.slice(0, maxLines);
    remaining = remaining.slice(maxLines);
    const h = chunk.length * 4.4 + 8;
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentW, h, 2, 2, "S");
    drawText(chunk, margin + 2, y + 5.5, {
      size: 10,
      color: [30, 41, 59],
      lineH: 4.4,
    });
    y += h + 4;
  }

  // ——— Assinatura ———
  ensureSpace(36);
  y += 10;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(margin + 20, y, pageW - margin - 20, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(e.profissional || "Profissional responsável", pageW / 2, y, {
    align: "center",
  });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Assinatura / CRO", pageW / 2, y, { align: "center" });

  // footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${input.clinic.name || "Clínica"} · Prontuário · ${input.patient.name} · pág. ${i}/${pageCount}`,
      pageW / 2,
      pageH - 8,
      { align: "center" }
    );
  }

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}

export function prontuarioPdfFilename(patientName: string, date: string) {
  const safe = (patientName || "paciente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .toLowerCase();
  return `prontuario-${safe}-${date || "evolucao"}.pdf`;
}
