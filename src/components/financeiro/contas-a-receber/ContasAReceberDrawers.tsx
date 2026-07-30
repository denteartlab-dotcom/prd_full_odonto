"use client";

import { useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { NewReceiptForm, RegisterReceiptForm } from "@/lib/contas-a-receber-types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export function NewReceiptDrawer({
  open,
  form,
  setForm,
  onClose,
  onSave,
}: {
  open: boolean;
  form: NewReceiptForm;
  setForm: React.Dispatch<React.SetStateAction<NewReceiptForm>>;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) return null;
  function set<K extends keyof NewReceiptForm>(key: K, value: NewReceiptForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  const amount = Number(form.amount.replace(",", ".")) || 0;
  const discount = Number(form.discount.replace(",", ".")) || 0;
  const interest = Number(form.interest.replace(",", ".")) || 0;
  const fine = Number(form.fine.replace(",", ".")) || 0;
  const finalValue = Math.max(0, amount - discount + interest + fine);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Novo Recebimento</h2>
            <p className="text-xs text-slate-500">Lançamento manual de receita</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["patient", "Paciente"],
                ["budgetNumber", "Orçamento"],
                ["procedure", "Procedimento"],
                ["professional", "Profissional"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} className={key === "patient" ? "sm:col-span-2" : ""}>
                <input className={inputClass} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              </Field>
            ))}
            <Field label="Forma de Pagamento">
              <select
                className={inputClass}
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
              >
                {["PIX", "PIX Asaas", "Boleto Asaas", "Cartão", "Dinheiro", "Transferência", "Boleto", "Cheque"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Conta Bancária">
              <input
                className={inputClass}
                value={form.bankAccount}
                onChange={(e) => set("bankAccount", e.target.value)}
              />
            </Field>
            <Field label="Valor">
              <input className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </Field>
            <Field label="Desconto">
              <input className={inputClass} value={form.discount} onChange={(e) => set("discount", e.target.value)} />
            </Field>
            <Field label="Juros">
              <input className={inputClass} value={form.interest} onChange={(e) => set("interest", e.target.value)} />
            </Field>
            <Field label="Multa">
              <input className={inputClass} value={form.fine} onChange={(e) => set("fine", e.target.value)} />
            </Field>
            <Field label="Valor Final" className="sm:col-span-2">
              <input
                className={inputClass}
                readOnly
                value={finalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              />
            </Field>
            <Field label="Data do Recebimento">
              <input
                type="date"
                className={inputClass}
                value={form.receiptDate}
                onChange={(e) => set("receiptDate", e.target.value)}
              />
            </Field>
            <Field label="Competência">
              <input
                type="month"
                className={inputClass}
                value={form.competence}
                onChange={(e) => set("competence", e.target.value)}
              />
            </Field>
            <Field label="Observações" className="sm:col-span-2">
              <textarea
                className={cn(inputClass, "min-h-[80px]")}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </div>
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center hover:border-brand-400">
            <Upload className="mb-2 h-5 w-5 text-brand-600" />
            <span className="text-sm font-medium text-slate-800">Anexar comprovante</span>
            <input type="file" className="hidden" accept="image/*,.pdf" />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Asaas ativo: escolha <strong>PIX Asaas</strong> ou <strong>Boleto Asaas</strong>. O
            pagamento confirma automaticamente pelo webhook.
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-xl" onClick={onSave}>
            Salvar recebimento
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RegisterReceiptModal({
  open,
  form,
  setForm,
  onClose,
  onConfirm,
  title,
}: {
  open: boolean;
  form: RegisterReceiptForm;
  setForm: React.Dispatch<React.SetStateAction<RegisterReceiptForm>>;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!open) return null;
  function set<K extends keyof RegisterReceiptForm>(key: K, value: RegisterReceiptForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registrar Recebimento</h2>
            <p className="text-xs text-slate-500">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
          <Field label="Data do recebimento">
            <input
              type="date"
              className={inputClass}
              value={form.receiptDate}
              onChange={(e) => set("receiptDate", e.target.value)}
            />
          </Field>
          <Field label="Valor recebido">
            <input className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          </Field>
          <Field label="Forma de pagamento">
            <select
              className={inputClass}
              value={form.paymentMethod}
              onChange={(e) => set("paymentMethod", e.target.value)}
            >
              {["PIX", "Cartão Crédito", "Cartão Débito", "Dinheiro", "Transferência", "Boleto"].map(
                (m) => (
                  <option key={m}>{m}</option>
                )
              )}
            </select>
          </Field>
          <Field label="Conta bancária">
            <input
              className={inputClass}
              value={form.bankAccount}
              onChange={(e) => set("bankAccount", e.target.value)}
            />
          </Field>
          <Field label="Desconto">
            <input className={inputClass} value={form.discount} onChange={(e) => set("discount", e.target.value)} />
          </Field>
          <Field label="Juros">
            <input className={inputClass} value={form.interest} onChange={(e) => set("interest", e.target.value)} />
          </Field>
          <Field label="Multa">
            <input className={inputClass} value={form.fine} onChange={(e) => set("fine", e.target.value)} />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <textarea
              className={cn(inputClass, "min-h-[70px]")}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
          <label className="sm:col-span-2 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-600 hover:border-brand-400">
            <Upload className="mb-1 h-4 w-4 text-brand-600" />
            Anexar comprovante
            <input type="file" className="hidden" accept="image/*,.pdf" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-xl" onClick={onConfirm}>
            Confirmar Recebimento
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReceivableMoreActions({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (label: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;
  const items = [
    "Novo Orçamento",
    "Gerar Cobrança",
    "Enviar Link de Pagamento",
    "Emitir Recibo",
    "Exportar Excel",
    "Exportar PDF",
    "Conciliação Bancária",
    "Relatórios",
    "Configurações Financeiras",
  ];
  return (
    <div
      ref={ref}
      className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl"
    >
      {items.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => {
            onAction(label);
            onClose();
          }}
          className="flex w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
