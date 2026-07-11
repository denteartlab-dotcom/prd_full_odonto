"use client";

import { X } from "lucide-react";
import { money } from "@/lib/utils";
import type { FinancialCharge } from "@/lib/financial-types";
import { PAYMENT_METHOD_LABELS } from "@/lib/financial-mock";

export type FinancialModalType =
  | "receive"
  | "pix"
  | "boleto"
  | "new_charge"
  | "cancel"
  | "edit"
  | null;

export function FinancialModals({
  type,
  charge,
  onClose,
  onConfirm,
}: {
  type: FinancialModalType;
  charge: FinancialCharge | null;
  onClose: () => void;
  onConfirm: (note?: string) => void;
}) {
  if (!type) return null;

  const titles: Record<NonNullable<FinancialModalType>, string> = {
    receive: "Receber pagamento",
    pix: "Emitir PIX",
    boleto: "Emitir boleto",
    new_charge: "Nova cobrança",
    cancel: "Cancelar cobrança",
    edit: "Editar cobrança",
  };

  const descriptions: Record<NonNullable<FinancialModalType>, string> = {
    receive: charge
      ? `Confirmar recebimento de ${money(charge.amount)} referente a "${charge.title}"?`
      : "Selecione um título para receber.",
    pix: charge
      ? `Gerar cobrança PIX de ${money(charge.amount)} para ${charge.title}?`
      : "Selecione um título.",
    boleto: charge
      ? `Gerar boleto de ${money(charge.amount)} para ${charge.title}?`
      : "Selecione um título.",
    new_charge: "Gerar cobranças automaticamente a partir dos orçamentos aprovados deste paciente?",
    cancel: charge
      ? `Cancelar a cobrança "${charge.title}"? Esta ação não pode ser desfeita.`
      : "Selecione um título.",
    edit: "Edição disponível em breve. Use o drawer de detalhes.",
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[130] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-bold text-slate-900">{titles[type]}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600">{descriptions[type]}</p>

        {charge && type !== "new_charge" && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <p>
              <span className="text-slate-500">Orçamento:</span> {charge.budgetNumber}
            </p>
            <p>
              <span className="text-slate-500">Forma:</span>{" "}
              {PAYMENT_METHOD_LABELS[charge.paymentMethod]}
            </p>
            <p>
              <span className="text-slate-500">Valor:</span>{" "}
              <strong>{money(charge.amount)}</strong>
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
          {type !== "edit" && (
            <button
              type="button"
              onClick={() => onConfirm()}
              className={
                type === "cancel"
                  ? "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  : "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              }
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
