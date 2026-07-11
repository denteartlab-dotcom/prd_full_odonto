"use client";

import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConsultationTimer } from "@/hooks/use-consultation-timer";

export function ConsultationTimer({
  startedAt,
  className,
  size = "sm",
}: {
  startedAt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { formatted } = useConsultationTimer(startedAt);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-bold tabular-nums",
        size === "sm" && "text-[10px]",
        size === "md" && "text-sm",
        size === "lg" && "text-2xl",
        className
      )}
    >
      <Timer className={cn(size === "lg" ? "h-5 w-5" : size === "md" ? "h-3.5 w-3.5" : "h-3 w-3")} />
      {formatted}
    </span>
  );
}
