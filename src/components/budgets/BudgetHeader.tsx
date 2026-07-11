"use client";

import {
  Copy,
  FileDown,
  Mail,
  MessageCircle,
  Plus,
  Printer,
} from "lucide-react";
import { AutoSaveIndicator } from "@/components/anamnesis/AutoSaveIndicator";

export function BudgetHeader({
  saveState,
  onNew,
  onDuplicate,
  onPrint,
  onExportPdf,
  onSendWhatsApp,
  onSendEmail,
  duplicateDisabled,
}: {
  saveState: "saved" | "dirty" | "saving";
  onNew: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onSendWhatsApp: () => void;
  onSendEmail: () => void;
  duplicateDisabled?: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orçamentos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie planos de tratamento e propostas comerciais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AutoSaveIndicator state={saveState} />
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Novo orçamento
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            disabled={duplicateDisabled}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={onSendWhatsApp}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={onSendEmail}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Mail className="h-4 w-4" />
            E-mail
          </button>
        </div>
      </div>
    </div>
  );
}
