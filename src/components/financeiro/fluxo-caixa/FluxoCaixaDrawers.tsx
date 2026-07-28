"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui";
import type {
  NewCashMovementForm,
  ReconciliationItem,
  TransferForm,
} from "@/lib/fluxo-caixa-types";
import { cn, money } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

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
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function NewMovementDrawer({
  open,
  form,
  setForm,
  categories,
  bankAccounts,
  costCenters,
  paymentMethods,
  professionals,
  onClose,
  onSave,
}: {
  open: boolean;
  form: NewCashMovementForm;
  setForm: React.Dispatch<React.SetStateAction<NewCashMovementForm>>;
  categories: string[];
  bankAccounts: string[];
  costCenters: string[];
  paymentMethods: string[];
  professionals: string[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  if (!open) return null;

  function set<K extends keyof NewCashMovementForm>(key: K, value: NewCashMovementForm[K]) {
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
            <h2 className="text-lg font-semibold text-slate-900">Nova Movimentação</h2>
            <p className="text-xs text-slate-500">Entrada, saída ou transferência de caixa</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <Field label="Tipo">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["entrada", "Entrada"],
                  ["saida", "Saída"],
                  ["transferencia", "Transferência"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => set("type", id)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium",
                    form.type === id
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Descrição">
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Categoria">
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Centro de custo">
              <select
                className={inputClass}
                value={form.costCenter}
                onChange={(e) => set("costCenter", e.target.value)}
              >
                {costCenters.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Conta bancária">
              <select
                className={inputClass}
                value={form.bankAccount}
                onChange={(e) => set("bankAccount", e.target.value)}
              >
                {bankAccounts.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Forma de pagamento">
              <select
                className={inputClass}
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
              >
                {paymentMethods.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Paciente (opcional)">
              <input
                className={inputClass}
                value={form.patient}
                onChange={(e) => set("patient", e.target.value)}
              />
            </Field>
            <Field label="Fornecedor (opcional)">
              <input
                className={inputClass}
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
              />
            </Field>
            <Field label="Profissional">
              <select
                className={inputClass}
                value={form.professional}
                onChange={(e) => set("professional", e.target.value)}
              >
                <option value="">—</option>
                {professionals.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Documento">
              <input
                className={inputClass}
                value={form.document}
                onChange={(e) => set("document", e.target.value)}
              />
            </Field>
            <Field label="Valor">
              <input className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </Field>
            <Field label="Desconto">
              <input
                className={inputClass}
                value={form.discount}
                onChange={(e) => set("discount", e.target.value)}
              />
            </Field>
            <Field label="Juros">
              <input
                className={inputClass}
                value={form.interest}
                onChange={(e) => set("interest", e.target.value)}
              />
            </Field>
            <Field label="Multa">
              <input className={inputClass} value={form.fine} onChange={(e) => set("fine", e.target.value)} />
            </Field>
            <Field label="Valor final" className="sm:col-span-2">
              <input
                className={inputClass}
                readOnly
                value={finalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
            <Field label="Data da movimentação">
              <input
                type="date"
                className={inputClass}
                value={form.movementDate}
                onChange={(e) => set("movementDate", e.target.value)}
              />
            </Field>
            <Field label="Data de vencimento">
              <input
                type="date"
                className={inputClass}
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as NewCashMovementForm["status"])
                }
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="agendado">Agendado</option>
                <option value="conciliado">Conciliado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Field>
          </div>

          <Field label="Observações">
            <textarea
              className={cn(inputClass, "min-h-[80px] resize-y")}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-600">Anexos</p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center",
                dragOver
                  ? "border-brand-400 bg-brand-50"
                  : "border-slate-200 bg-slate-50"
              )}
            >
              <Upload className="mb-2 h-5 w-5 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                Arraste PDF, XML, comprovantes ou imagens
              </p>
              <p className="mt-1 text-xs text-slate-500">ou clique para selecionar</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-xl" onClick={onSave}>
            Salvar movimentação
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TransferModal({
  open,
  form,
  setForm,
  bankAccounts,
  onClose,
  onConfirm,
}: {
  open: boolean;
  form: TransferForm;
  setForm: React.Dispatch<React.SetStateAction<TransferForm>>;
  bankAccounts: string[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  function set<K extends keyof TransferForm>(key: K, value: TransferForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transferência entre Contas</h2>
            <p className="text-xs text-slate-500">Redistribui saldo sem alterar o total da clínica</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <Field label="Conta origem">
            <select
              className={inputClass}
              value={form.fromAccount}
              onChange={(e) => set("fromAccount", e.target.value)}
            >
              {bankAccounts.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Conta destino">
            <select
              className={inputClass}
              value={form.toAccount}
              onChange={(e) => set("toAccount", e.target.value)}
            >
              {bankAccounts.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Valor">
              <input
                className={inputClass}
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </Field>
            <Field label="Data">
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Observações">
            <textarea
              className={cn(inputClass, "min-h-[72px] resize-y")}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="rounded-xl" onClick={onConfirm}>
            Confirmar Transferência
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReconciliationModal({
  open,
  systemItems,
  statementItems,
  onClose,
  onReconcile,
}: {
  open: boolean;
  systemItems: ReconciliationItem[];
  statementItems: ReconciliationItem[];
  onClose: () => void;
  onReconcile: () => void;
}) {
  if (!open) return null;
  const unmatched =
    systemItems.filter((i) => !i.matched).length +
    statementItems.filter((i) => !i.matched).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Conciliação Bancária</h2>
            <p className="text-xs text-slate-500">
              {unmatched} diferença(s) entre sistema e extrato
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid flex-1 gap-4 overflow-y-auto p-5 lg:grid-cols-2">
          <ReconcileList title="Movimentações do sistema" items={systemItems} />
          <ReconcileList title="Movimentações do extrato" items={statementItems} />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Fechar
          </Button>
          <Button type="button" className="rounded-xl" onClick={onReconcile}>
            Conciliar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReconcileList({
  title,
  items,
}: {
  title: string;
  items: ReconciliationItem[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <ul className="divide-y divide-slate-50">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-800">{item.description}</p>
              <p className="text-xs text-slate-500">
                {item.date.split("-").reverse().join("/")}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-semibold",
                  item.amount >= 0 ? "text-emerald-700" : "text-rose-600"
                )}
              >
                {money(item.amount)}
              </p>
              <p
                className={cn(
                  "text-[11px] font-medium",
                  item.matched ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {item.matched ? "Conciliado" : "Diferença"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
