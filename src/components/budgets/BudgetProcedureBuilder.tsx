"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetProcedure, ProcedureCatalogItem } from "@/lib/budget-types";
import { catalogToProcedure } from "@/lib/budget-mock";
import { OdontogramChart } from "@/components/odontogram";
import { ProcedureCatalogList } from "./ProcedureSearch";

const FACE_OPTIONS = [
  { id: "M", label: "M", title: "Mesial" },
  { id: "D", label: "D", title: "Distal" },
  { id: "V", label: "V", title: "Vestibular" },
  { id: "L", label: "L", title: "Lingual/Palatina" },
  { id: "O", label: "O", title: "Oclusal" },
  { id: "I", label: "I", title: "Incisal" },
] as const;

export function BudgetProcedureBuilder({
  onAdd,
  existingProcedures = [],
  className,
}: {
  onAdd: (procedure: BudgetProcedure) => void;
  existingProcedures?: BudgetProcedure[];
  className?: string;
}) {
  const [pending, setPending] = useState<ProcedureCatalogItem | null>(null);
  const [faces, setFaces] = useState<string[]>([]);
  const [sessionTeeth, setSessionTeeth] = useState<number[]>([]);

  const selectedTeeth = useMemo(() => {
    const fromBudget = existingProcedures
      .map((p) => Number(p.tooth))
      .filter((n) => Number.isFinite(n) && n > 0);
    return [...new Set([...fromBudget, ...sessionTeeth])];
  }, [existingProcedures, sessionTeeth]);

  const statusByTooth = useMemo(() => new Map(), []);

  function pickProcedure(procedure: BudgetProcedure) {
    setPending({
      id: procedure.code,
      code: procedure.code,
      name: procedure.name,
      category: procedure.category,
      price: procedure.unitPrice,
      estimatedMinutes: procedure.estimatedMinutes ?? 30,
    });
    setSessionTeeth([]);
  }

  function toggleFace(face: string) {
    setFaces((prev) =>
      prev.includes(face) ? prev.filter((f) => f !== face) : [...prev, face]
    );
  }

  function addWithTooth(tooth: number) {
    if (!pending) return;
    const row = catalogToProcedure(pending);
    row.tooth = String(tooth);
    row.face = faces.length ? faces.join("") : undefined;
    onAdd(row);
    setSessionTeeth((prev) => (prev.includes(tooth) ? prev : [...prev, tooth]));
  }

  function addWithoutTooth() {
    if (!pending) return;
    const row = catalogToProcedure(pending);
    row.face = faces.length ? faces.join("") : undefined;
    onAdd(row);
  }

  function clearPending() {
    setPending(null);
    setFaces([]);
    setSessionTeeth([]);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <ProcedureCatalogList
        onSelect={pickProcedure}
        selectedCode={pending?.code}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Odontograma — selecione os dentes
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Escolha o procedimento acima e clique nos dentes para incluir no orçamento.
            </p>
          </div>
          {pending ? (
            <button
              type="button"
              onClick={clearPending}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
              Limpar seleção
            </button>
          ) : null}
        </div>

        {pending ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2">
            <Check className="h-4 w-4 text-indigo-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-indigo-900">
                {pending.name}
              </p>
              <p className="text-[11px] text-indigo-700/80">
                {pending.code} · {money(pending.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={addWithoutTooth}
              className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Adicionar sem dente
            </button>
          </div>
        ) : (
          <div className="mb-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800">
            Selecione um procedimento na lista acima para liberar o odontograma.
          </div>
        )}

        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Faces (opcional)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FACE_OPTIONS.map((face) => {
              const active = faces.includes(face.id);
              return (
                <button
                  key={face.id}
                  type="button"
                  title={face.title}
                  disabled={!pending}
                  onClick={() => toggleFace(face.id)}
                  className={cn(
                    "h-8 min-w-8 rounded-lg border text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40",
                    active
                      ? "border-indigo-500 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                  )}
                >
                  {face.label}
                </button>
              );
            })}
          </div>
        </div>

        <OdontogramChart
          title=""
          statusByTooth={statusByTooth}
          selected={selectedTeeth}
          onToggleTooth={(number) => {
            if (!pending) return;
            addWithTooth(number);
          }}
          interactive={Boolean(pending)}
          showLegend={false}
          compact
        />
      </div>
    </div>
  );
}
