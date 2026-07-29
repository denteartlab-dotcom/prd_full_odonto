import type { PrescriptionItem, PrescriptionKind } from "./prescription-types";

const KIND_LABELS: Record<PrescriptionKind, string> = {
  receituario_simples: "Receituário",
  controle_especial: "Receituário de Controle Especial",
  atestado: "Atestado Odontológico",
  solicitacao_exame: "Solicitação de Exame",
};

export function buildPrescriptionHtml(input: {
  clinicName: string;
  clinicHeaderLines?: string[];
  clinicLogoUrl?: string | null;
  dentistName: string;
  dentistCro: string;
  patientName: string;
  patientCpf?: string;
  patientBirthDate?: string;
  kind: PrescriptionKind;
  medications: PrescriptionItem[];
  issuedAt: string;
  validUntil?: string;
}) {
  const medRows = input.medications
    .map(
      (m, i) => `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;vertical-align:top;">${i + 1}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;">
          <strong>${escapeHtml(m.medicationName)}</strong><br/>
          <span style="color:#475569;font-size:12px;">
            ${escapeHtml(m.dose)} · ${escapeHtml(m.frequency)} · ${escapeHtml(m.duration)}
            ${m.instructions ? `<br/>${escapeHtml(m.instructions)}` : ""}
          </span>
        </td>
      </tr>`
    )
    .join("");

  const logo = (input.clinicLogoUrl || "").trim();
  const headerLines = (input.clinicHeaderLines || [])
    .map((l) => l.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<div class="muted" style="line-height:1.45;">${escapeHtml(line)}</div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Receita — ${escapeHtml(input.patientName)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; background: #fff; }
    .sheet { max-width: 780px; margin: 0 auto; padding: 28px 32px; }
    .muted { color: #64748b; font-size: 12px; }
    .actions { position: sticky; top: 0; background: #0f172a; color: #fff; padding: 10px 16px; display: flex; gap: 8px; justify-content: flex-end; }
    .actions button, .actions a { background: #fff; color: #0f172a; border: 0; border-radius: 8px; padding: 8px 12px; font-weight: 600; text-decoration: none; cursor: pointer; font-size: 13px; }
    .header { display: flex; gap: 14px; align-items: flex-start; border-bottom: 2px solid #1d4ed8; padding-bottom: 14px; margin-bottom: 18px; }
    .header img { width: 96px; height: 96px; object-fit: contain; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; }
    @media print { .actions { display: none !important; } .sheet { padding: 0; } }
  </style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  <div class="sheet">
    <header class="header">
      ${
        logo
          ? `<img src="${escapeHtml(logo)}" alt="Logo ${escapeHtml(input.clinicName)}" />`
          : ""
      }
      <div>
        <h1 style="margin:0 0 8px;font-size:22px;">${escapeHtml(input.clinicName)}</h1>
        ${headerLines}
      </div>
    </header>

    <h2 style="margin:0 0 12px;font-size:16px;">${KIND_LABELS[input.kind]}</h2>

    <section style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:18px;">
      <div style="font-size:12px;color:#64748b;text-transform:uppercase;font-weight:700;">Paciente</div>
      <div style="font-size:15px;font-weight:700;margin-top:4px;">${escapeHtml(input.patientName)}</div>
      <div class="muted" style="margin-top:4px;">
        ${input.patientCpf ? `CPF: ${escapeHtml(input.patientCpf)}` : ""}
        ${input.patientBirthDate ? ` · Nascimento: ${escapeHtml(input.patientBirthDate)}` : ""}
      </div>
    </section>

    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
      <thead>
        <tr style="text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;">
          <th style="padding:6px;width:36px;">#</th>
          <th style="padding:6px;">Medicamento / Posologia</th>
        </tr>
      </thead>
      <tbody>${medRows || `<tr><td colspan="2" style="padding:12px;color:#64748b;">Sem itens.</td></tr>`}</tbody>
    </table>

    <div class="muted" style="margin-bottom:40px;">
      Emitida em ${escapeHtml(input.issuedAt)}
      ${input.validUntil ? ` · Validade até ${escapeHtml(input.validUntil)}` : ""}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px;">
      <div style="text-align:center;">
        <div style="border-top:1px solid #94a3b8;padding-top:8px;font-size:12px;">
          <strong>${escapeHtml(input.dentistName)}</strong><br/>
          Cirurgião(ã)-Dentista · CRO ${escapeHtml(input.dentistCro || "—")}
        </div>
      </div>
      <div style="text-align:center;">
        <div style="border-top:1px solid #94a3b8;padding-top:8px;font-size:12px;">
          Paciente / Responsável<br/>
          ${escapeHtml(input.patientName)}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
