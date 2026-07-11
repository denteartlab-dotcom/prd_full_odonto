import type { BudgetPrintPatient } from "@/lib/budget-print";
import {
  formatPrintDate,
  formatPrintDateTime,
  formatPrintMoney,
} from "@/lib/budget-print";
import type { DentalBudget } from "@/lib/budget-types";
import { BUDGET_STATUS_LABELS } from "./shared";
import { PAYMENT_METHOD_LABELS } from "@/lib/budget-mock";

function Field({ label, value }: { label: string; value?: string | null }) {
  const v = value?.trim();
  return (
    <div className="print-field">
      <span className="print-label">{label}</span>
      <span className="print-value">{v || "—"}</span>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="print-section">
      <h2 className="print-section-title">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

export function BudgetPrintDocument({
  budget,
  patient,
  clinicName = "Clínica Odontológica",
}: {
  budget: DentalBudget;
  patient: BudgetPrintPatient;
  clinicName?: string;
}) {
  const inst = budget.installment;

  return (
    <article className="budget-print-doc">
      <header className="print-header">
        <div>
          <p className="print-clinic">{clinicName}</p>
          <h1 className="print-title">Orçamento Odontológico</h1>
          <p className="print-subtitle">{budget.number}</p>
        </div>
        <div className="print-meta">
          <p>Emissão: {formatPrintDate(budget.date)}</p>
          <p>Validade: {formatPrintDate(budget.validityDate)}</p>
          <p>Dentista: {budget.dentist}</p>
          <span className="print-status-badge">{BUDGET_STATUS_LABELS[budget.status]}</span>
        </div>
      </header>

      <div className="print-patient-bar">
        <Field label="Paciente" value={patient.name} />
        <Field label="CPF" value={patient.cpf} />
        <Field label="Telefone" value={patient.phone} />
        <Field label="Convênio" value={patient.insurance} />
      </div>

      <Section n={1} title="Dados do paciente">
        <div className="print-grid-3">
          <Field label="Nome completo" value={patient.name} />
          <Field label="CPF" value={patient.cpf} />
          <Field label="E-mail" value={patient.email} />
          <Field label="Telefone" value={patient.phone} />
          <Field label="Convênio" value={patient.insurance} />
          <Field label="Responsável financeiro" value={patient.financialResponsible} />
        </div>
      </Section>

      <Section n={2} title="Procedimentos">
        <table className="print-table">
          <thead>
            <tr>
              <th>Cód.</th>
              <th>Procedimento</th>
              <th>Dente</th>
              <th>Face</th>
              <th>Qtd</th>
              <th className="num">Unit.</th>
              <th className="num">Desc.</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {budget.procedures.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#94a3b8" }}>
                  Nenhum procedimento
                </td>
              </tr>
            ) : (
              budget.procedures.map((p) => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>
                    {p.name}
                    <br />
                    <span style={{ fontSize: "6.5pt", color: "#64748b" }}>{p.category}</span>
                  </td>
                  <td>{p.tooth || "—"}</td>
                  <td>{p.face || "—"}</td>
                  <td>{p.quantity}</td>
                  <td className="num">{formatPrintMoney(p.unitPrice)}</td>
                  <td className="num">{p.discount > 0 ? formatPrintMoney(p.discount) : "—"}</td>
                  <td className="num">{formatPrintMoney(p.finalValue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      <Section n={3} title="Resumo financeiro">
        <div className="print-totals">
          <div className="print-totals-row">
            <span>Subtotal</span>
            <span>{formatPrintMoney(budget.subtotal)}</span>
          </div>
          <div className="print-totals-row">
            <span>Descontos</span>
            <span>− {formatPrintMoney(budget.discounts)}</span>
          </div>
          <div className="print-totals-row">
            <span>Acréscimos</span>
            <span>{formatPrintMoney(budget.additions)}</span>
          </div>
          <div className="print-totals-row highlight">
            <span>Total geral</span>
            <span>{formatPrintMoney(budget.total)}</span>
          </div>
          <div className="print-totals-row">
            <span>Entrada</span>
            <span>{formatPrintMoney(budget.downPayment)}</span>
          </div>
          <div className="print-totals-row">
            <span>Valor pago</span>
            <span>{formatPrintMoney(budget.paidAmount)}</span>
          </div>
          <div className="print-totals-row highlight">
            <span>Saldo em aberto</span>
            <span>{formatPrintMoney(budget.balance)}</span>
          </div>
        </div>

        <div className="print-grid-2" style={{ marginTop: 8 }}>
          <Field label="Forma de pagamento" value={PAYMENT_METHOD_LABELS[budget.paymentMethod]} />
          <Field
            label="Parcelamento"
            value={
              inst.installments === 1
                ? "À vista"
                : `${inst.installments}x de ${formatPrintMoney(inst.installmentValue)}${
                    inst.interestRate > 0 ? ` (${inst.interestRate}% juros)` : " sem juros"
                  }`
            }
          />
        </div>

        {inst.installments > 1 && (
          <div className="print-installment-box">
            <strong>Condição de pagamento:</strong> {inst.installments}x de{" "}
            {formatPrintMoney(inst.installmentValue)} — total{" "}
            {formatPrintMoney(inst.totalWithInterest)}
            {inst.interestRate > 0 && ` (juros de ${inst.interestRate}%)`}
          </div>
        )}
      </Section>

      {budget.treatmentPlan.length > 0 && (
        <Section n={4} title="Plano de tratamento">
          <ol className="print-timeline">
            {[...budget.treatmentPlan]
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <li key={step.id}>
                  <span className="print-timeline-num">{step.order}</span>
                  <div style={{ flex: 1 }}>
                    <strong>{step.title}</strong>
                    {" — "}
                    <span style={{ textTransform: "capitalize" }}>
                      {step.status.replace("_", " ")}
                    </span>
                    {step.plannedDate && (
                      <span style={{ color: "#64748b" }}>
                        {" "}
                        · Previsto: {formatPrintDate(step.plannedDate)}
                      </span>
                    )}
                    <span style={{ color: "#64748b" }}> · {step.professional}</span>
                  </div>
                </li>
              ))}
          </ol>
        </Section>
      )}

      {budget.notes && (
        <Section n={budget.treatmentPlan.length > 0 ? 5 : 4} title="Observações">
          <p className="print-text">{budget.notes}</p>
        </Section>
      )}

      <section className="print-section">
        <h2 className="print-section-title">Termo de aprovação</h2>
        <p className="print-text" style={{ fontSize: "7.5pt", color: "#475569" }}>
          Declaro que recebi e compreendi as informações sobre os procedimentos, valores e condições
          de pagamento descritos neste orçamento, estando de acordo com o plano de tratamento
          proposto.
        </p>

        <div className="print-signature-block">
          <div className="print-signature-line">
            {budget.signature.agreed && budget.signature.signerName ? (
              <span style={{ fontStyle: "italic" }}>{budget.signature.signerName}</span>
            ) : (
              <div className="print-line" />
            )}
            <p>Assinatura do paciente / responsável</p>
          </div>
          <div className="print-signature-line print-signature-date">
            {budget.signature.signedAt ? (
              <span>{formatPrintDate(budget.signature.signedAt)}</span>
            ) : (
              <div className="print-line" />
            )}
            <p>Data</p>
          </div>
        </div>
      </section>

      <footer className="print-footer">
        Documento gerado em {formatPrintDateTime(budget.updatedAt)} · Versão {budget.version} ·{" "}
        {clinicName}
      </footer>
    </article>
  );
}
