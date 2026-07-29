"use client";

import { useEffect, useRef } from "react";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Settings2,
  Tags,
  Upload,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Lançamentos",
    items: [
      { icon: ArrowDownCircle, label: "Nova Entrada" },
      { icon: ArrowUpCircle, label: "Nova Saída" },
      { icon: ArrowLeftRight, label: "Nova Transferência" },
    ],
  },
  {
    title: "Fechamento e comissões",
    items: [
      { icon: Wallet, label: "Fechar Caixa Diário" },
      { icon: Landmark, label: "Fechar Caixa Mensal" },
    ],
  },
  {
    title: "Importação / Exportação",
    items: [
      { icon: Upload, label: "Importar OFX" },
      { icon: Upload, label: "Importar CSV" },
      { icon: Download, label: "Exportar Excel" },
      { icon: FileText, label: "Exportar PDF" },
    ],
  },
  {
    title: "Módulos",
    items: [
      { icon: Wallet, label: "Conciliação Bancária" },
      { icon: Tags, label: "Categorias" },
      { icon: Settings2, label: "Centro de Custos" },
      { icon: Landmark, label: "Contas Bancárias" },
      { icon: FileSpreadsheet, label: "Relatórios Financeiros" },
      { icon: Settings2, label: "Configurações" },
    ],
  },
] as const;

export function FluxoCaixaMoreActions({
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
