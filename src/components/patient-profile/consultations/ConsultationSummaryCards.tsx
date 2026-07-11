"use client";

import { Calendar, CalendarCheck, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConsultationSummaryCards({
  upcoming,
  completed,
  cancelled,
}: {
  upcoming: number;
  completed: number;
  cancelled: number;
}) {
  const cards = [
    {
      label: "Próximas consultas",
      value: upcoming,
      icon: Calendar,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Consultas realizadas",
      value: completed,
      icon: CalendarCheck,
      bg: "bg-slate-100",
      text: "text-slate-600",
    },
    {
      label: "Consultas canceladas",
      value: cancelled,
      icon: CalendarX,
      bg: "bg-red-50",
      text: "text-red-600",
    },
  ];

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div className={cn("mb-3 inline-flex rounded-xl p-2", card.bg)}>
              <Icon className={cn("h-4 w-4", card.text)} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
