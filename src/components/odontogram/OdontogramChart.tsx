"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TOOTH_STATUS_META, UPPER_TEETH, LOWER_TEETH } from "@/lib/patient-profile-mock";
import type { ToothStatus } from "@/lib/patient-profile-types";
import {
  LOWER_DECIDUOUS,
  LOWER_PERMANENT,
  toothImagePath,
  toothSizeClass,
  UPPER_DECIDUOUS,
  UPPER_PERMANENT,
  type OdontogramDentition,
} from "@/lib/odontogram-constants";

type OdontogramChartProps = {
  statusByTooth: Map<number, ToothStatus>;
  selected?: number[];
  onToggleTooth?: (number: number) => void;
  onStatusChange?: (numbers: number[], status: ToothStatus) => void;
  title?: string;
  interactive?: boolean;
  showLegend?: boolean;
  compact?: boolean;
  className?: string;
};

export function OdontogramChart({
  statusByTooth,
  selected = [],
  onToggleTooth,
  onStatusChange,
  title = "Selecione os dentes do trabalho",
  interactive = true,
  showLegend = true,
  compact = false,
  className,
}: OdontogramChartProps) {
  const [dentition, setDentition] = useState<OdontogramDentition>("permanente");
  const [statusBrush, setStatusBrush] = useState<ToothStatus | null>(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const upperTeeth = dentition === "permanente" ? UPPER_PERMANENT : UPPER_DECIDUOUS;
  const lowerTeeth = dentition === "permanente" ? LOWER_PERMANENT : LOWER_DECIDUOUS;

  function applyStatus(numbers: number[], status: ToothStatus) {
    setStatusBrush(status);
    onStatusChange?.(numbers, status);
  }

  function handleToothClick(e: React.MouseEvent, number: number) {
    if (!interactive) return;
    if (e.ctrlKey && statusBrush && onStatusChange) {
      e.preventDefault();
      applyStatus([number], statusBrush);
      return;
    }
    onToggleTooth?.(number);
  }

  const selectedLabel =
    selected.length === 0
      ? "Nenhum dente selecionado"
      : selected.sort((a, b) => a - b).join(", ");

  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-sm", compact ? "p-2" : "p-4 sm:p-6", className)}>
      <div className={cn("text-center", compact ? "mb-2" : "mb-5")}>
        {title && <h3 className={cn("font-semibold text-slate-800", compact ? "text-xs" : "text-sm")}>{title}</h3>}
        <div className={cn("inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5", compact ? "mt-1.5" : "mt-3")}>
          <button
            type="button"
            onClick={() => setDentition("permanente")}
            className={cn(
              "rounded-lg font-semibold transition",
              compact ? "px-2.5 py-1 text-[10px]" : "px-4 py-1.5 text-xs",
              dentition === "permanente" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
            )}
          >
            Permanente
          </button>
          <button
            type="button"
            onClick={() => setDentition("decidua")}
            className={cn(
              "rounded-lg font-semibold transition",
              compact ? "px-2.5 py-1 text-[10px]" : "px-4 py-1.5 text-xs",
              dentition === "decidua" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
            )}
          >
            Decíduos
          </button>
        </div>
      </div>

      <div className={cn("flex", compact ? "gap-1" : "gap-2")}>
        <div className="flex shrink-0 flex-col justify-around py-1">
          <ArchBadge label="SUP" compact={compact} />
          <div className={compact ? "h-4" : "h-6"} />
          <ArchBadge label="INF" compact={compact} />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <OdontogramArch
            teeth={upperTeeth}
            arch="upper"
            statusByTooth={statusByTooth}
            selectedSet={selectedSet}
            interactive={interactive}
            compact={compact}
            onToothClick={handleToothClick}
          />
          <div className={cn("border-t border-dashed border-slate-300", compact ? "my-1.5" : "my-2")} />
          <OdontogramArch
            teeth={lowerTeeth}
            arch="lower"
            statusByTooth={statusByTooth}
            selectedSet={selectedSet}
            interactive={interactive}
            compact={compact}
            onToothClick={handleToothClick}
          />
        </div>
      </div>

      {interactive && (
        <p className={cn("text-center text-slate-500", compact ? "mt-2 text-[10px]" : "mt-3 text-xs")}>
          Dentes selecionados: <span className="font-medium text-slate-700">{selectedLabel}</span>
        </p>
      )}

      {interactive && statusBrush && (
        <p className={cn("text-center text-indigo-600", compact ? "mt-1 text-[10px]" : "mt-1.5 text-xs")}>
          <kbd className="rounded border border-indigo-200 bg-indigo-50 px-1 font-sans">Ctrl</kbd>
          {" + clique "}
          para copiar{" "}
          <strong>{TOOTH_STATUS_META[statusBrush].label}</strong> em outro dente
        </p>
      )}

      {interactive && selected.length > 0 && onStatusChange && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <p className="mb-2 text-xs font-semibold text-indigo-800">
            Alterar status — dente(s) {selected.join(", ")}
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOOTH_STATUS_META) as ToothStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => applyStatus(selected, status)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90",
                  TOOTH_STATUS_META[status].bg,
                  statusBrush === status && "ring-2 ring-indigo-400 ring-offset-1"
                )}
              >
                {TOOTH_STATUS_META[status].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showLegend && (
        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
          {(Object.entries(TOOTH_STATUS_META) as [ToothStatus, (typeof TOOTH_STATUS_META)[ToothStatus]][]).map(
            ([key, meta]) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className={cn("h-2.5 w-2.5 rounded-full", meta.bg)} />
                {meta.label}
              </span>
            )
          )}
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-200 ring-2 ring-emerald-400" />
            Selecionado
          </span>
        </div>
      )}
    </div>
  );
}

function ArchBadge({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-indigo-950 font-bold tracking-wide text-white",
        compact ? "h-5 min-w-[1.75rem] px-1 text-[9px]" : "h-6 min-w-[2rem] px-1.5 text-[10px]"
      )}
    >
      {label}
    </span>
  );
}

function OdontogramArch({
  teeth,
  arch,
  statusByTooth,
  selectedSet,
  interactive,
  compact,
  onToothClick,
}: {
  teeth: readonly number[];
  arch: "upper" | "lower";
  statusByTooth: Map<number, ToothStatus>;
  selectedSet: Set<number>;
  interactive: boolean;
  compact?: boolean;
  onToothClick: (e: React.MouseEvent, number: number) => void;
}) {
  const mid = teeth.length / 2;

  return (
    <div className="flex w-full items-end">
      {teeth.map((number, index) => (
        <div key={number} className="flex min-w-0 flex-1 items-end">
          {index === mid && <div className="w-px shrink-0 self-stretch" aria-hidden />}
          <ToothGraphic
            number={number}
            arch={arch}
            status={statusByTooth.get(number) ?? "higido"}
            selected={selectedSet.has(number)}
            interactive={interactive}
            compact={compact}
            onClick={(e) => onToothClick(e, number)}
          />
        </div>
      ))}
    </div>
  );
}

function ToothGraphic({
  number,
  arch,
  status,
  selected,
  interactive,
  compact,
  onClick,
}: {
  number: number;
  arch: "upper" | "lower";
  status: ToothStatus;
  selected: boolean;
  interactive: boolean;
  compact?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const meta = TOOTH_STATUS_META[status];
  const isUpper = arch === "upper";
  const extracted = status === "extraido";

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-center rounded transition",
        compact ? "px-0 py-0.5" : "px-0 py-0.5",
        interactive && "cursor-pointer hover:bg-slate-50",
        selected && "bg-emerald-50 ring-1 ring-emerald-400",
        !interactive && "cursor-default"
      )}
      title={`Dente ${number} — ${meta.label}${interactive ? " · Ctrl+clique para colar status" : ""}`}
    >
      {!isUpper && (
        <span
          className={cn(
            "mb-px font-semibold leading-none",
            compact ? "text-[8px]" : "text-[9px]",
            selected ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
          )}
        >
          {number}
        </span>
      )}

      <div className="relative flex w-full justify-center">
        <Image
          src={toothImagePath(number)}
          alt={`Dente ${number}`}
          width={28}
          height={56}
          className={cn(
            "h-auto w-full object-contain drop-shadow-sm",
            toothSizeClass(number, compact),
            extracted && "opacity-25 grayscale",
            !selected && status === "higido" && "opacity-90"
          )}
          unoptimized
        />
        {status !== "higido" && !extracted && (
          <span
            className={cn(
              "pointer-events-none absolute inset-x-1 rounded-md opacity-35",
              isUpper ? "bottom-0 h-[45%]" : "top-0 h-[45%]",
              meta.bg
            )}
          />
        )}
        {extracted && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-500">
            ×
          </span>
        )}
      </div>

      {isUpper && (
        <span
          className={cn(
            "mt-px font-semibold leading-none",
            compact ? "text-[8px]" : "text-[9px]",
            selected ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
          )}
        >
          {number}
        </span>
      )}
    </button>
  );
}

/** Helper to build status map from patient odontogram array */
export function buildStatusMap(
  teeth: { number: number; status: ToothStatus }[]
): Map<number, ToothStatus> {
  return new Map(teeth.map((t) => [t.number, t.status]));
}

export function upsertOdontogramStatuses(
  teeth: { number: number; status: ToothStatus }[],
  numbers: number[],
  status: ToothStatus
) {
  const map = new Map(teeth.map((t) => [t.number, t]));
  for (const number of numbers) {
    const existing = map.get(number);
    map.set(number, existing ? { ...existing, status } : { number, status });
  }
  return [...map.values()].sort((a, b) => a.number - b.number);
}

export { UPPER_TEETH, LOWER_TEETH };
