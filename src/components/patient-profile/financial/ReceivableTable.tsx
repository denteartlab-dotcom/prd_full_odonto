"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  Eye,
  FileDown,
  MoreVertical,
  Pencil,
  QrCode,
  Receipt,
  Wallet,
} from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { FinancialCharge } from "@/lib/financial-types";
import { dueDateLabel, normalizeChargeStatus, PAYMENT_METHOD_LABELS } from "@/lib/financial-mock";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { ChargeStatusBadge } from "./shared";

export function ReceivableTable({
  charges,
  selectedId,
  onSelect,
  onView,
  onEdit,
  onReceive,
  onPix,
  onBoleto,
  onDuplicate,
  onCancel,
}: {
  charges: FinancialCharge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onReceive: (id: string) => void;
  onPix: (id: string) => void;
  onBoleto: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Vencimento</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Orçamento</th>
              <th className="px-4 py-3 font-medium">Procedimento</th>
              <th className="px-4 py-3 font-medium">Parcela</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Pagamento</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {charges.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                  Nenhum título encontrado. Gere cobranças a partir de orçamentos aprovados.
                </td>
              </tr>
            ) : (
              charges.map((c) => {
                const status = normalizeChargeStatus(c);
                const dueLabel = dueDateLabel(c.dueDate, status);
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/80",
                      selectedId === c.id && "bg-indigo-50/60"
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{formatDisplayDate(c.dueDate)}</p>
                      <p
                        className={cn(
                          "text-[11px] font-medium",
                          status === "vencido" ? "text-red-500" : "text-slate-500"
                        )}
                      >
                        {dueLabel}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{c.title}</td>
                    <td className="px-4 py-3.5 font-semibold text-indigo-600">{c.budgetNumber}</td>
                    <td className="px-4 py-3.5 text-slate-600">{c.procedure}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {c.installmentNumber} de {c.installmentTotal}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{money(c.amount)}</td>
                    <td className="px-4 py-3.5">
                      <ChargeStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {PAYMENT_METHOD_LABELS[c.paymentMethod]}
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-0.5">
                        <IconBtn icon={Eye} label="Visualizar" onClick={() => onView(c.id)} />
                        <IconBtn icon={Pencil} label="Editar" onClick={() => onEdit(c.id)} />
                        {status !== "pago" && status !== "cancelado" && (
                          <IconBtn icon={Wallet} label="Receber" onClick={() => onReceive(c.id)} />
                        )}
                        <IconBtn icon={QrCode} label="PIX" onClick={() => onPix(c.id)} />
                        <IconBtn icon={Receipt} label="Boleto" onClick={() => onBoleto(c.id)} />
                        <ChargeActionsMenu
                          onView={() => onView(c.id)}
                          onEdit={() => onEdit(c.id)}
                          onDuplicate={() => onDuplicate(c.id)}
                          onPdf={() => window.print()}
                          onCancel={() => onCancel(c.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ChargeActionsMenu({
  onView,
  onEdit,
  onDuplicate,
  onPdf,
  onCancel,
}: {
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPdf: () => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.right - 176 });
    function close(e: MouseEvent) {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
            style={{ top: pos.top, left: pos.left }}
          >
            {[
              { label: "Visualizar", onClick: onView },
              { label: "Editar", onClick: onEdit },
              { label: "Duplicar", onClick: onDuplicate },
              { label: "Gerar PDF", onClick: onPdf },
              { label: "Cancelar", onClick: onCancel, danger: true },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm",
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
        aria-label="Mais opções"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu}
    </>
  );
}

export function PaymentHistoryTable({
  payments,
}: {
  payments: import("@/lib/financial-types").FinancialPayment[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Forma</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Comprovante</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  Nenhum pagamento registrado.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 text-slate-600">{formatDisplayDate(p.date)}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-800">{p.description}</p>
                    {p.budgetNumber && (
                      <p className="text-[11px] text-indigo-600">{p.budgetNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-700">{money(p.amount)}</td>
                  <td className="px-4 py-3.5 text-slate-600">{PAYMENT_METHOD_LABELS[p.method]}</td>
                  <td className="px-4 py-3.5 text-slate-600">{p.user}</td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Recibo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
