"use client";

import { useEffect, useRef } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Banknote,
  FileSpreadsheet,
  FileText,
  Settings2,
  Wallet,
  Download,
  Tags,
  Landmark,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Financeiro",
    items: [
      { icon: ArrowDownCircle, label: "Novo Recebimento" },
      { icon: ArrowUpCircle, label: "Nova Despesa" },
      { icon: ArrowLeftRight, label: "Transferência" },
      { icon: Wallet, label: "Sangria" },
      { icon: Banknote, label: "Suprimento" },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { icon: FileText, label: "Fluxo de Caixa" },
      { icon: FileSpreadsheet, label: "DRE" },
      { icon: ArrowDownCircle, label: "Contas a Receber" },
      { icon: ArrowUpCircle, label: "Contas a Pagar" },
      { icon: FileText, label: "Inadimplência" },
    ],
  },
  {
    title: "Exportações",
    items: [
      { icon: Download, label: "PDF" },
      { icon: Download, label: "Excel" },
      { icon: Download, label: "CSV" },
    ],
  },
  {
    title: "Configurações",
    items: [
      { icon: Tags, label: "Categorias" },
      { icon: Settings2, label: "Centros de Custo" },
      { icon: Landmark, label: "Contas Bancárias" },
      { icon: CreditCard, label: "Formas de Pagamento" },
    ],
  },
] as const;

export function MoreActionsFlyout({
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

  return (
    <div
      ref={ref}
      className="absolute right-0 z-30 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <div className="max-h-[70vh] overflow-y-auto p-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onAction(item.label);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
