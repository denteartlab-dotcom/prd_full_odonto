"use client";

import { Clock, History, Printer, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

export function AnamnesisHeader({
  patientName,
  status,
  updatedAt,
  updatedBy,
  saveState,
  onPrint,
  onHistory,
  onSave,
}: {
  patientName: string;
  status: string;
  updatedAt: string;
  updatedBy: string;
  saveState: "saved" | "dirty" | "saving";
  onPrint: () => void;
  onHistory: () => void;
  onSave: () => void;
}) {
  const isActive = status === "ativo";

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Anamnese Odontológica</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registro completo do histórico clínico do paciente
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-semibold",
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}
            >
              {isActive ? "Ativo" : "Inativo"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Última atualização: {formatDisplayDate(updatedAt.slice(0, 10))}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Editado por {updatedBy}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AutoSaveIndicator state={saveState} />
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
            onClick={onHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <History className="h-4 w-4" />
            Histórico de versões
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Save className="h-4 w-4" />
            Salvar anamnese
          </button>
        </div>
      </div>
      <p className="sr-only">Paciente: {patientName}</p>
    </div>
  );
}
