"use client";

import { Copy, Eye, Pencil, Printer } from "lucide-react";
import type { PatientHistoryEventFull } from "@/lib/patient-history-types";
import {
  formatHistoryDateTime,
  HistoryStatusBadge,
  HistoryTypeBadge,
  HISTORY_TYPE_META,
} from "./shared";

export function HistoryEventCard({
  event,
  onView,
  onEdit,
  onPrint,
  onDuplicate,
}: {
  event: PatientHistoryEventFull;
  onView: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onDuplicate: () => void;
}) {
  const meta = HISTORY_TYPE_META[event.type];
  const Icon = meta.Icon;

  return (
    <article className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconWrap}`}
        >
          <Icon className={`h-5 w-5 ${meta.iconColor}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                <HistoryTypeBadge type={event.type} />
                <HistoryStatusBadge status={event.status} />
              </div>
              <p className="mt-1 text-sm text-slate-700">{event.description}</p>
              {event.detail ? (
                <p className="mt-0.5 text-xs text-slate-500">{event.detail}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-xs font-medium text-slate-400">
              {formatHistoryDateTime(event.date, event.time)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{event.professional}</span>
              {event.specialty ? ` · ${event.specialty}` : ""}
            </p>

            <div className="flex flex-wrap gap-1.5 opacity-100 transition sm:opacity-80 sm:group-hover:opacity-100">
              <ActionButton icon={Eye} label="Visualizar" onClick={onView} />
              <ActionButton icon={Pencil} label="Editar" onClick={onEdit} />
              <ActionButton icon={Printer} label="Imprimir" onClick={onPrint} />
              <ActionButton icon={Copy} label="Duplicar" onClick={onDuplicate} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
