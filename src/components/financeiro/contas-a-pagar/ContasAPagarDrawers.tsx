"use client";

import { useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { NewPayableForm, PaymentForm, PayableStatus } from "@/lib/contas-a-pagar-types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export function NewPayableDrawer({
  open,
  form,
  setForm,
  onClose,
  onSave,
}: {
  open: boolean;
  form: NewPayableForm;
  setForm: React.Dispatch<React.SetStateAction<NewPayableForm>>;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  function set<K extends keyof NewPayableForm>(key: K, value: NewPayableForm[K]) {
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
            <h2 className="text-lg font-semibold text-slate-900">Nova Conta</h2>
            <p className="text-xs text-slate-500">Cadastro de despesa / obrigação</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Fornecedor" className="sm:col-span-2">
              <input className={inputClass} value={form.supplier} onChange={(e) => set("supplier", e.target.value)} />
            </Field>
            <Field label="Descrição" className="sm:col-span-2">
              <input className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Categoria">
              <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} />
            </Field>
            <Field label="Centro de custo">
              <input className={inputClass} value={form.costCenter} onChange={(e) => set("costCenter", e.target.value)} />
            </Field>
            <Field label="Número da Nota Fiscal">
              <input className={inputClass} value={form.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
            </Field>
            <Field label="Número do Documento">
              <input className={inputClass} value={form.document} onChange={(e) => set("document", e.target.value)} />
            </Field>
            <Field label="Banco">
              <input className={inputClass} value={form.bank} onChange={(e) => set("bank", e.target.value)} />
            </Field>
            <Field label="Conta Bancária">
              <input className={inputClass} value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} />
            </Field>
            <Field label="Forma de pagamento" className="sm:col-span-2">
              <select className={inputClass} value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
                {["PIX", "Boleto", "Cartão", "Transferência", "Dinheiro", "Cheque"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
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
              <input className={inputClass} readOnly value={finalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
            </Field>
            <Field label="Competência">
              <input type="month" className={inputClass} value={form.competence} onChange={(e) => set("competence", e.target.value)} />
            </Field>
            <Field label="Data de emissão">
              <input type="date" className={inputClass} value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </Field>
            <Field label="Data de vencimento">
              <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </Field>
            <Field label="Data prevista p/ pagamento">
              <input type="date" className={inputClass} value={form.expectedPayDate} onChange={(e) => set("expectedPayDate", e.target.value)} />
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value as PayableStatus)}
              >
                <option value="em_aberto">Em aberto</option>
                <option value="agendado">Agendado</option>
                <option value="parcial">Parcial</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Field>
            <Field label="Responsável">
              <input className={inputClass} value={form.responsible} onChange={(e) => set("responsible", e.target.value)} />
            </Field>
            <Field label="Observações" className="sm:col-span-2">
              <textarea
                className={cn(inputClass, "min-h-[80px]")}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={form.installment}
                onChange={(e) => set("installment", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Conta Parcelada
            </label>
            {form.installment ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Quantidade de parcelas">
                  <input
                    className={inputClass}
                    value={form.installmentCount}
                    onChange={(e) => set("installmentCount", e.target.value)}
                  />
                </Field>
                <Field label="Periodicidade">
                  <select
                    className={inputClass}
                    value={form.installmentPeriod}
                    onChange={(e) =>
                      set("installmentPeriod", e.target.value as NewPayableForm["installmentPeriod"])
                    }
                  >
                    <option value="mensal">Mensal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </Field>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={(e) => set("recurring", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Despesa recorrente
            </label>
            {form.recurring ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Periodicidade">
                  <select
                    className={inputClass}
                    value={form.recurringPeriod}
                    onChange={(e) =>
                      set("recurringPeriod", e.target.value as NewPayableForm["recurringPeriod"])
                    }
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                    <option value="bimestral">Bimestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </Field>
                <Field label="Data final da recorrência">
                  <input
                    type="date"
                    className={inputClass}
                    value={form.recurringEnd}
                    onChange={(e) => set("recurringEnd", e.target.value)}
                  />
                </Field>
              </div>
            ) : null}
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center hover:border-brand-400 hover:bg-brand-50/40">
            <Upload className="mb-2 h-5 w-5 text-brand-600" />
            <span className="text-sm font-medium text-slate-800">Anexar boletos, PDF, XML, NF ou imagem</span>
            <span className="mt-1 text-xs text-slate-500">Arraste e solte ou clique para enviar</span>
            <input type="file" className="hidden" multiple accept=".pdf,.xml,image/*" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-xl" onClick={onSave}>
            Salvar conta
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PaymentModal({
  open,
  form,
  setForm,
  onClose,
  onConfirm,
  title,
}: {
  open: boolean;
  form: PaymentForm;
  setForm: React.Dispatch<React.SetStateAction<PaymentForm>>;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!open) return null;
  function set<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registrar Pagamento</h2>
            <p className="text-xs text-slate-500">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
          <Field label="Data do pagamento">
            <input type="date" className={inputClass} value={form.payDate} onChange={(e) => set("payDate", e.target.value)} />
          </Field>
          <Field label="Valor pago">
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
          <Field label="Forma de pagamento">
            <select className={inputClass} value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
              {["PIX", "Boleto", "Cartão", "Transferência", "Dinheiro", "Cheque"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Conta bancária" className="sm:col-span-2">
            <input className={inputClass} value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <textarea className={cn(inputClass, "min-h-[70px]")} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
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
            Confirmar Pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PayableMoreActions({
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
    "Novo Fornecedor",
    "Importar XML",
    "Importar Boletos",
    "Exportar Excel",
    "Exportar PDF",
    "Categorias",
    "Centro de Custos",
    "Contas Bancárias",
    "Conciliação Bancária",
    "Relatórios",
    "Configurações",
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
