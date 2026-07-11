"use client";

import { cn } from "@/lib/utils";

export type WaitingPatientsTab = "espera" | "historico";

export function WaitingPatientsTabs({
  active,
  waitingCount,
  historyCount,
  onChange,
}: {
  active: WaitingPatientsTab;
  waitingCount: number;
  historyCount: number;
  onChange: (tab: WaitingPatientsTab) => void;
}) {
  const tabs: { id: WaitingPatientsTab; label: string; count: number }[] = [
    { id: "espera", label: "Em espera", count: waitingCount },
    { id: "historico", label: "Histórico", count: historyCount },
  ];

  return (
    <div className="flex shrink-0 gap-1 border-b border-slate-200 bg-slate-50 px-4 py-2">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            )}
          >
            {tab.label}
            {tab.count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
