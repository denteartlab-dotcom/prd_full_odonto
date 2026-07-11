"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatMonthName,
  formatWeekdayShort,
  isWeekend,
  parseIsoDate,
} from "@/lib/schedule-mock";

export function DateStrip({
  dates,
  selectedDate,
  onSelect,
  onPrev,
  onNext,
  onOpenCalendar,
}: {
  dates: string[];
  selectedDate: string;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
}) {
  return (
    <div className="flex w-full items-stretch gap-1 border-b border-slate-200 bg-[#eef1f6] px-2 py-2">
      <button
        type="button"
        onClick={onPrev}
        className="flex w-10 shrink-0 items-center justify-center text-slate-500 hover:text-blue-600"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="flex min-w-0 flex-1 items-stretch gap-1 px-1">
        {dates.map((iso) => {
          const selected = iso === selectedDate;
          const weekend = isWeekend(iso);
          const dayNum = parseIsoDate(iso).getDate();

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center rounded-md px-1 py-2 transition",
                selected
                  ? "bg-blue-600 text-white shadow-md"
                  : weekend
                    ? "bg-white/80 hover:bg-white"
                    : "bg-white hover:bg-blue-50"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide",
                  selected ? "text-white/90" : "text-slate-500"
                )}
              >
                {formatWeekdayShort(iso)}
              </span>
              <span
                className={cn(
                  "text-2xl font-light leading-none",
                  selected
                    ? "text-white"
                    : weekend
                      ? "text-amber-500"
                      : "text-slate-700"
                )}
              >
                {dayNum}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium capitalize",
                  selected ? "text-white/85" : weekend ? "text-amber-600/80" : "text-slate-500"
                )}
              >
                {formatMonthName(iso)}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenCalendar}
        className="flex w-10 shrink-0 items-center justify-center text-slate-500 hover:text-blue-600"
        aria-label="Calendário"
      >
        <Calendar className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex w-10 shrink-0 items-center justify-center text-slate-500 hover:text-blue-600"
        aria-label="Próximo"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
