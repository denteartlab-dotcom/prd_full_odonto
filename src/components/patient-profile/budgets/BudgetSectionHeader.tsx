"use client";

import Link from "next/link";
import {
  ChevronDown,
  Copy,
  ExternalLink,
  FileDown,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BudgetSectionHeader({
  patientId,
  onNew,
  onDuplicate,
  onPrint,
  onExportPdf,
  duplicateDisabled,
}: {
  patientId: string;
  onNew: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  duplicateDisabled?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Orçamentos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie planos de tratamento e propostas comerciais deste paciente.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <MoreHorizontal className="h-4 w-4" />
            Mais ações
            <ChevronDown className={cn("h-3.5 w-3.5 transition", menuOpen && "rotate-180")} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <Link
                  href={`/app/pacientes/${patientId}/orcamentos`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                  Módulo completo
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false);
                    window.open(`https://wa.me/55`, "_blank");
                  }}
                >
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  Enviar WhatsApp
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Mail className="h-4 w-4 text-slate-400" />
                  Enviar e-mail
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir selecionado
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
