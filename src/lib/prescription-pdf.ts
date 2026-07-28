import { jsPDF } from "jspdf";
import type { PrescriptionItem, PrescriptionKind } from "@/lib/prescription-types";

const KIND_LABELS: Record<PrescriptionKind, string> = {
  receituario_simples: "Receituário Odontológico Simples",
  controle_especial: "Receituário de Controle Especial",
  atestado: "Atestado Odontológico",
  solicitacao_exame: "Solicitação de Exame",
};

export type PrescriptionPdfInput = {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  dentistName: string;
  dentistCro?: string;
  patientName: string;
  patientCpf?: string;
  kind: PrescriptionKind;
  medications: PrescriptionItem[];
  observations?: string;
  issuedAt: string;
  validUntil?: string;
};

export function buildPrescriptionPdfBytes(input: PrescriptionPdfInput): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const margin = 16;
  let y = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  const line = (text: string, opts?: { size?: number; bold?: boolean; color?: [number, number, number] }) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.size || 11);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(15, 23, 42);
    const rows = doc.splitTextToSize(text, maxWidth);
    doc.text(rows, margin, y);
    y += rows.length * ((opts?.size || 11) * 0.45) + 2;
  };

  line(input.clinicName || "Clínica", { size: 16, bold: true });
  if (input.clinicAddress) line(input.clinicAddress, { size: 9, color: [71, 85, 105] });
  if (input.clinicPhone) line(`Tel.: ${input.clinicPhone}`, { size: 9, color: [71, 85, 105] });
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  line(KIND_LABELS[input.kind] || "Receituário", { size: 13, bold: true });
  y += 2;
  line(`Paciente: ${input.patientName}`, { size: 11, bold: true });
  if (input.patientCpf) line(`CPF: ${input.patientCpf}`, { size: 10 });
  line(`Dentista: ${input.dentistName}${input.dentistCro ? ` · CRO ${input.dentistCro}` : ""}`, {
    size: 10,
  });
  line(`Emitida em: ${input.issuedAt}${input.validUntil ? ` · Válida até: ${input.validUntil}` : ""}`, {
    size: 10,
    color: [71, 85, 105],
  });
  y += 4;

  line("Medicamentos", { size: 12, bold: true });
  input.medications.forEach((m, i) => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
    line(`${i + 1}. ${m.medicationName}`, { size: 11, bold: true });
    line(`${m.dose} · ${m.frequency} · ${m.duration}`, { size: 10, color: [51, 65, 85] });
    if (m.instructions) line(m.instructions, { size: 9, color: [71, 85, 105] });
    y += 2;
  });

  if (input.observations?.trim()) {
    y += 2;
    line("Observações", { size: 12, bold: true });
    line(input.observations.trim(), { size: 10 });
  }

  y = Math.max(y + 10, 250);
  doc.setDrawColor(226, 232, 240);
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
