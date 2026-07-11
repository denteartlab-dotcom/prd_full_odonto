"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseIsoDate, toIsoDate } from "@/lib/schedule-mock";
import { useClientToday } from "@/hooks/use-client-today";

export function MiniCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = parseIsoDate(selectedDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const d = parseIsoDate(selectedDate);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [selectedDate]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const clientToday = useClientToday();

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize text-slate-800">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-slate-400">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <span key={`e-${index}`} />;
          const iso = toIsoDate(new Date(year, month, day));
          const isSelected = iso === selectedDate;
          const isToday = clientToday !== null && iso === clientToday;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "flex h-8 items-center justify-center rounded-lg text-xs font-medium transition",
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : isToday
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
