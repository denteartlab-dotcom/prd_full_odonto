"use client";

import {
  Eye,
  Filter,
  Printer,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Professional, ScheduleAppointment } from "@/lib/schedule-mock";
import { ActiveConsultationBanner } from "./ActiveConsultationBanner";

export type AgendaViewMode = "dia" | "semana";

export function ProfessionalScheduleHeader({
  professional,
  subtitle,
  viewMode,
  activeConsultation,
  onViewModeChange,
  onFilter,
  onRefresh,
  onFinishConsultation,
}: {
  professional: Professional | null;
  subtitle?: string;
  viewMode: AgendaViewMode;
  activeConsultation?: ScheduleAppointment | null;
  onViewModeChange: (mode: AgendaViewMode) => void;
  onFilter: () => void;
  onRefresh: () => void;
  onFinishConsultation?: (id: string) => void;
}) {
  return (
    <>
      {activeConsultation && onFinishConsultation ? (
        <ActiveConsultationBanner
          appointment={activeConsultation}
          professional={professional}
          onFinish={() => onFinishConsultation(activeConsultation.id)}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          {professional ? (
            <span
              className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                professional.color
              )}
            >
              {professional.initials}
            </span>
          ) : (
            <UserRound className="h-6 w-6" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-normal text-slate-700">
            {professional?.name || "Todos os Profissionais"}
          </h2>
          {subtitle ? (
            <p className="text-xs font-medium text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-slate-300 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("dia")}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-semibold transition",
              viewMode === "dia"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Dia
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("semana")}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-semibold transition",
              viewMode === "semana"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Semana
          </button>
        </div>
        <button
          type="button"
          onClick={onFilter}
          className="inline-flex items-center gap-1.5 rounded border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtrar
        </button>
        <button
          type="button"
          className="rounded border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Detalhado
        </button>
        <button type="button" className="rounded border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-50" aria-label="Imprimir">
          <Printer className="h-4 w-4" />
        </button>
        <button type="button" className="rounded border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-50" aria-label="Visualizar">
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-50"
          aria-label="Atualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
    </>
  );
}
