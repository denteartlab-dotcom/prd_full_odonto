"use client";

import { Check, Cloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AutoSaveIndicator({ state }: { state: "saved" | "dirty" | "saving" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
        state === "saved" && "bg-emerald-50 text-emerald-700",
        state === "dirty" && "bg-amber-50 text-amber-700",
        state === "saving" && "bg-slate-100 text-slate-600"
      )}
    >
      {state === "saved" && (
        <>
          <Check className="h-3.5 w-3.5" />
          Salvo
        </>
      )}
      {state === "dirty" && (
        <>
          <Cloud className="h-3.5 w-3.5" />
          Alterações não salvas
        </>
      )}
      {state === "saving" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Salvando...
        </>
      )}
    </span>
  );
}
