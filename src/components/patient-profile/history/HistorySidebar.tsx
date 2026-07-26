"use client";

import { Download } from "lucide-react";
import type {
  HistoryProfessionalStat,
  HistoryStats,
  PatientHistoryEventFull,
} from "@/lib/patient-history-types";
import { formatHistoryDate, HISTORY_TYPE_META } from "./shared";

export function HistorySidebar({
  stats,
  professionals,
  recent,
  onSelect,
  onExport,
}: {
  stats: HistoryStats;
  professionals: HistoryProfessionalStat[];
  recent: PatientHistoryEventFull[];
  onSelect: (event: PatientHistoryEventFull) => void;
  onExport: () => void;
}) {
  const rows: { label: string; value: number }[] = [
    { label: "Total de eventos", value: stats.total },
    { label: "Consultas", value: stats.consulta },
    { label: "Procedimentos", value: stats.procedimento },
    { label: "Pagamentos", value: stats.financeiro },
    { label: "Documentos", value: stats.documento },
    { label: "Radiografias", value: stats.imagem },
    { label: "Orçamentos", value: stats.orcamento },
    { label: "Receitas", value: stats.receita },
    { label: "Atestados", value: stats.atestado },
    { label: "Mensagens", value: stats.comunicacao },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Resumo do período</h3>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {row.label}
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">{row.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Profissionais envolvidos</h3>
        {professionals.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum profissional no período.</p>
        ) : (
          <ul className="space-y-3">
            {professionals.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${p.color}`}
                >
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{p.specialty}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {p.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Atividades recentes</h3>
        <ul className="space-y-3">
          {recent.slice(0, 5).map((e) => {
            const meta = HISTORY_TYPE_META[e.type];
            const Icon = meta.Icon;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e)}
                  className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50"
                >
                  <span className={`mt-0.5 rounded-lg p-1.5 ${meta.iconWrap}`}>
                    <Icon className={`h-3.5 w-3.5 ${meta.iconColor}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {e.title}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {formatHistoryDate(e.date)} · {e.time}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
