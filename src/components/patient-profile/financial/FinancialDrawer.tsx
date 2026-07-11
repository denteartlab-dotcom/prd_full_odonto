"use client";

import { X } from "lucide-react";
import { money } from "@/lib/utils";
import type { FinancialCharge } from "@/lib/financial-types";
import { dueDateLabel, normalizeChargeStatus, PAYMENT_METHOD_LABELS } from "@/lib/financial-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { ChargeStatusBadge } from "./shared";
import { FinancialTimeline } from "./FinancialTimeline";

export function FinancialDrawer({
  charge,
  patientName,
  open,
  onClose,
  onReceive,
  onEdit,
  onCancel,
  onPix,
  onBoleto,
}: {
  charge: FinancialCharge | null;
  patientName: string;
  open: boolean;
  onClose: () => void;
  onReceive: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onPix: () => void;
  onBoleto: () => void;
}) {
  if (!open || !charge) return null;

  const status = normalizeChargeStatus(charge);

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs text-slate-400">Detalhe da cobrança</p>
            <h2 className="text-lg font-bold text-slate-900">{charge.title}</h2>
            <ChargeStatusBadge status={status} />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Paciente" value={patientName} />
            <Field label="Procedimento" value={charge.procedure} />
            <Field label="Orçamento" value={charge.budgetNumber} />
            <Field label="Dentista" value={charge.dentist} />
            <Field label="Vencimento" value={formatDisplayDate(charge.dueDate)} />
            <Field label="Validade relativa" value={dueDateLabel(charge.dueDate, status)} />
            <Field label="Parcela" value={`${charge.installmentNumber} de ${charge.installmentTotal}`} />
            <Field label="Valor" value={money(charge.amount)} highlight />
            <Field label="Forma de pagamento" value={PAYMENT_METHOD_LABELS[charge.paymentMethod]} />
          </div>

          {charge.notes && (
            <div>
              <p className="text-[11px] font-medium uppercase text-slate-400">Observações</p>
              <p className="mt-1 text-sm text-slate-600">{charge.notes}</p>
            </div>
          )}

          <FinancialTimeline events={charge.history} title="Histórico do título" />
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
          {status !== "pago" && status !== "cancelado" && (
            <button
              type="button"
              onClick={onReceive}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Receber
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onPix}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Gerar PIX
          </button>
          <button
            type="button"
            onClick={onBoleto}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Gerar boleto
          </button>
          {status !== "cancelado" && status !== "pago" && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase text-slate-400">{label}</p>
      <p className={`mt-0.5 text-sm ${highlight ? "font-bold text-slate-900" : "text-slate-700"}`}>
        {value}
      </p>
    </div>
  );
}
