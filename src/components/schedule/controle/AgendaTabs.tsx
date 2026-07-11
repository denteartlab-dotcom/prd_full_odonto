"use client";

import { cn } from "@/lib/utils";

export type AgendaTab = "profissional" | "consultorio" | "fila" | "filtrar";

const tabs: { id: AgendaTab; label: string }[] = [
  { id: "profissional", label: "Por Profissional" },
  { id: "consultorio", label: "Por Consultório" },
  { id: "fila", label: "Fila de Espera" },
  { id: "filtrar", label: "Filtrar" },
];

export function AgendaTabs({
  active,
  onChange,
}: {
  active: AgendaTab;
  onChange: (tab: AgendaTab) => void;
}) {
  return (
    <div className="flex border-b border-slate-200 bg-[#eef1f6]">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-5 py-2.5 text-xs font-semibold transition",
              isActive
                ? "bg-white text-blue-700"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-800"
            )}
          >
            {isActive ? (
              <span className="absolute inset-x-0 top-0 h-0.5 bg-blue-600" />
            ) : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
