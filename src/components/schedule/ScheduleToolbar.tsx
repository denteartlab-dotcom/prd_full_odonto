"use client";

import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDayMonth,
  formatWeekday,
  getWeekDates,
  professionalsMock,
  statusMeta,
} from "@/lib/schedule-mock";
import type { AppointmentStatus } from "@/lib/schedule-mock";

export type ScheduleView = "dia" | "semana" | "mes";

export function ScheduleToolbar({
  selectedDate,
  view,
  professionalFilter,
  statusFilter,
  onToday,
  onPrev,
  onNext,
  onViewChange,
  onProfessionalFilter,
  onStatusFilter,
  onNew,
  onSelectDate,
}: {
  selectedDate: string;
  view: ScheduleView;
  professionalFilter: string;
  statusFilter: string;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: ScheduleView) => void;
  onProfessionalFilter: (id: string) => void;
  onStatusFilter: (status: string) => void;
  onNew: () => void;
  onSelectDate: (iso: string) => void;
}) {
  const dayMonth = formatDayMonth(selectedDate);
  const weekday = formatWeekday(selectedDate);
  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgb(15_23_42/0.04)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Hoje
        </button>
        <div className="flex items-center rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={onPrev}
            className="px-2 py-2 text-slate-500 hover:bg-slate-50"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-2 py-2 text-slate-500 hover:bg-slate-50"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {view === "semana" ? (
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {weekDates.map((date, index) => {
              const isSelected = date === selectedDate;
              return (
                <div key={date} className="flex items-center">
                  {index > 0 ? (
                    <span className="mx-1.5 text-sm font-medium text-slate-300">-</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onSelectDate(date)}
                    className={cn(
                      "min-w-[3rem] rounded-lg px-1.5 py-0.5 text-left leading-tight transition",
                      isSelected
                        ? "bg-indigo-50 ring-1 ring-indigo-200"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-base font-semibold tabular-nums",
                        isSelected ? "text-indigo-700" : "text-slate-900"
                      )}
                    >
                      {formatDayMonth(date)}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-medium capitalize",
                        isSelected ? "text-indigo-500" : "text-slate-500"
                      )}
                    >
                      {formatWeekday(date)}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-w-[4.5rem] leading-tight">
            <p className="text-base font-semibold tabular-nums text-slate-900">{dayMonth}</p>
            <p className="text-[11px] font-medium capitalize text-slate-500">{weekday}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["dia", "semana", "mes"] as ScheduleView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition",
                view === v
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />
          <select
            value={professionalFilter}
            onChange={(e) => onProfessionalFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-300"
          >
            <option value="">Todos profissionais</option>
            {professionalsMock.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-300"
          >
            <option value="">Todos status</option>
            {(Object.keys(statusMeta) as AppointmentStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusMeta[s].label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"
        >
          <Plus className="h-4 w-4" />
          Novo agendamento
        </button>
      </div>
    </div>
  );
}
