"use client";

import { Pencil, Printer, Trash2, X } from "lucide-react";
import type { PatientHistoryEventFull } from "@/lib/patient-history-types";
import {
  formatHistoryDateTime,
  HistoryStatusBadge,
  HistoryTypeBadge,
  HISTORY_TYPE_META,
  moneyHistory,
} from "./shared";

export function HistoryDetailDrawer({
  event,
  open,
  onClose,
  onEdit,
  onPrint,
  onDelete,
}: {
  event: PatientHistoryEventFull | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onDelete: () => void;
}) {
  if (!open || !event) return null;
  const meta = HISTORY_TYPE_META[event.type];
  const Icon = meta.Icon;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-[85] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-xl p-2.5 ${meta.iconWrap}`}>
              <Icon className={`h-5 w-5 ${meta.iconColor}`} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{event.title}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {formatHistoryDateTime(event.date, event.time)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <HistoryTypeBadge type={event.type} />
                <HistoryStatusBadge status={event.status} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Descrição
            </h3>
            <p className="mt-1 text-sm text-slate-800">{event.description}</p>
            {event.detail ? (
              <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
            ) : null}
            {typeof event.amount === "number" ? (
              <p className="mt-2 text-lg font-bold text-slate-900">
                {moneyHistory(event.amount)}
              </p>
            ) : null}
          </section>

          <section className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">Responsável</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{event.professional}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">Especialidade</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {event.specialty || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">Data</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {event.date.split("-").reverse().join("/")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">Hora</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{event.time}</p>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Observações
            </h3>
            <p className="mt-1 text-sm text-slate-700">
              {event.observations || "Nenhuma observação registrada."}
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Arquivos anexados
            </h3>
            {event.attachments?.length ? (
              <ul className="space-y-2">
                {event.attachments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {a.name}
                    <span className="ml-2 text-[10px] uppercase text-slate-400">{a.kind}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Nenhum arquivo anexado.</p>
            )}
          </section>
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            aria-label="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
