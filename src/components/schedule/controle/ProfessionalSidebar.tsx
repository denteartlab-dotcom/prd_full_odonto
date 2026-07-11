"use client";

import { cn } from "@/lib/utils";
import type { Professional } from "@/lib/schedule-mock";

export function ProfessionalSidebar({
  professionals,
  selectedId,
  activeProfessionalIds,
  onSelect,
}: {
  professionals: Professional[];
  selectedId: string;
  activeProfessionalIds: string[];
  onSelect: (id: string) => void;
}) {
  const activeSet = new Set(activeProfessionalIds);

  return (
    <aside className="w-[220px] shrink-0 border-r border-slate-200 bg-[#eef1f6]">
      <p className="border-b border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Mapa de Disponibilidades
      </p>
      <div className="py-1">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={cn(
            "w-full border-l-4 px-3 py-2.5 text-left text-xs font-medium transition",
            selectedId === ""
              ? "border-blue-600 bg-white text-blue-800 shadow-sm"
              : "border-transparent text-slate-700 hover:bg-white/70"
          )}
        >
          Todos os Profissionais
        </button>
        {professionals.map((pro) => {
          const active = selectedId === pro.id;
          const inConsultation = activeSet.has(pro.id);
          return (
            <button
              key={pro.id}
              type="button"
              onClick={() => onSelect(pro.id)}
              className={cn(
                "relative w-full border-l-4 px-3 py-2.5 text-left transition",
                active
                  ? "border-blue-600 bg-white shadow-sm"
                  : "border-transparent hover:bg-white/70",
                inConsultation && !active && "bg-blue-50/80"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn("text-xs font-semibold", active ? "text-blue-800" : "text-slate-800")}>
                    {pro.name}
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight text-slate-500">
                    {pro.specialty}
                  </p>
                </div>
                {inConsultation ? (
                  <span className="relative mt-0.5 flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" title="Consulta em andamento" />
                  </span>
                ) : null}
              </div>
              {inConsultation ? (
                <p className="mt-1 text-[9px] font-semibold text-blue-700">Consulta em andamento</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
