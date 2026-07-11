"use client";

import { ChevronRight } from "lucide-react";

export function WaitingPatientsBar({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-l-full rounded-r-md bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#254a75]"
    >
      Pacientes Te Aguardando
      {count > 0 ? (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold">
          {count}
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
