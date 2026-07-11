"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WaitingPatientsButton({
  count,
  open,
  onClick,
  docked = false,
}: {
  count: number;
  open: boolean;
  onClick: () => void;
  docked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label="Pacientes te aguardando"
      className={cn(
        "flex shrink-0 items-center gap-2.5",
        "rounded-xl bg-[#1a3352] px-5 py-3 text-sm font-semibold text-white",
        "shadow-[0_8px_30px_rgba(26,51,82,0.35)] transition-all duration-200",
        "hover:bg-[#234468] hover:shadow-[0_12px_40px_rgba(26,51,82,0.45)]",
        "active:scale-[0.98]",
        open && "ring-2 ring-blue-400/60 ring-offset-2",
        !docked && "fixed bottom-6 right-6 z-[60]"
      )}
    >
      <span className="whitespace-nowrap">Pacientes Te Aguardando</span>
      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold shadow-sm">
        {count}
      </span>
      <ChevronRight
        className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
      />
    </button>
  );
}
