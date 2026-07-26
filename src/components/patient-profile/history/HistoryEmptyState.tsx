"use client";

import { ClipboardPlus, History } from "lucide-react";

export function HistoryEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
        <History className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        Ainda não existe nenhum histórico para este paciente.
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Assim que houver consultas, pagamentos, documentos ou comunicações, tudo
        aparecerá aqui em ordem cronológica.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
      >
        <ClipboardPlus className="h-4 w-4" />
        Registrar primeira atividade
      </button>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      <div className="h-24 rounded-2xl bg-slate-200/70" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/70" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-64 rounded-2xl bg-slate-200/70" />
          <div className="h-40 rounded-2xl bg-slate-200/70" />
        </div>
      </div>
    </div>
  );
}
