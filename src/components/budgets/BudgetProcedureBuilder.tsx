"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetProcedure, ProcedureCatalogItem } from "@/lib/budget-types";
import { catalogToProcedure, calcProcedureFinal } from "@/lib/budget-mock";
import {
  formatToothNumbers,
  hasProcedureFace,
  isSameUngroupedProcedure,
  parseToothNumbers,
} from "@/lib/budget-tooth-utils";
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

const FACE_IDS = new Set(FACE_OPTIONS.map((f) => f.id));

function normalizeFaceChars(face?: string | null) {
  return [...new Set((face || "").toUpperCase().split(""))]
    .filter((c) => FACE_IDS.has(c as (typeof FACE_OPTIONS)[number]["id"]))
    .sort(
      (a, b) =>
        FACE_OPTIONS.findIndex((f) => f.id === a) -
        FACE_OPTIONS.findIndex((f) => f.id === b)
    );
}

export function BudgetProcedureBuilder({
  onAdd,
  onUpdate,
  onRemove,
  existingProcedures = [],
  className,
}: {
  onAdd: (procedure: BudgetProcedure) => void;
  onUpdate: (id: string, patch: Partial<BudgetProcedure>) => void;
  onRemove?: (id: string) => void;
  existingProcedures?: BudgetProcedure[];
  className?: string;
}) {
  const [pending, setPending] = useState<ProcedureCatalogItem | null>(null);
  const [faces, setFaces] = useState<string[]>([]);
  const [editingTooth, setEditingTooth] = useState<number | null>(null);

  const procedureRows = useMemo(() => {
    if (!pending) return [];
    return existingProcedures.filter(
      (p) => p.code === pending.code && p.name === pending.name
    );
  }, [existingProcedures, pending]);

  const selectedTeeth = useMemo(() => {
    return [
      ...new Set(procedureRows.flatMap((p) => parseToothNumbers(p.tooth))),
    ].sort((a, b) => a - b);
  }, [procedureRows]);

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
    setFaces([]);
    setEditingTooth(null);
  }

  function findGroupLine() {
    if (!pending) return undefined;
    return existingProcedures.find((p) =>
      isSameUngroupedProcedure(p, pending.code, pending.name)
    );
  }

  function rowsForTooth(tooth: number) {
    return procedureRows.filter((p) =>
      parseToothNumbers(p.tooth).includes(tooth)
    );
  }

  function removeToothFromGroup(group: BudgetProcedure, tooth: number) {
    const nextTeeth = parseToothNumbers(group.tooth).filter((n) => n !== tooth);
    if (nextTeeth.length === 0) {
      onRemove?.(group.id);
      return;
    }
    const quantity = nextTeeth.length;
    onUpdate(group.id, {
      tooth: formatToothNumbers(nextTeeth),
      quantity,
      finalValue: calcProcedureFinal({
        unitPrice: group.unitPrice,
        quantity,
        discount: group.discount,
      }),
    });
  }

  function removeToothFromProcedure(tooth: number) {
    if (!pending) return;
    for (const row of rowsForTooth(tooth)) {
      const teeth = parseToothNumbers(row.tooth);
      if (hasProcedureFace(row.face) || teeth.length <= 1) {
        onRemove?.(row.id);
      } else {
        removeToothFromGroup(row, tooth);
      }
    }
    if (editingTooth === tooth) {
      setEditingTooth(null);
      setFaces([]);
    }
  }

  function syncToothFaces(tooth: number, nextFaces: string[]) {
    if (!pending) return;
    const faceStr = nextFaces.join("");
    const rows = rowsForTooth(tooth);
    const group = findGroupLine();
    const facedRows = rows.filter((r) => hasProcedureFace(r.face));
    const inGroup =
      Boolean(group) && parseToothNumbers(group!.tooth).includes(tooth);

    if (!faceStr) {
      for (const row of facedRows) onRemove?.(row.id);
      if (!inGroup) {
        const liveGroup = findGroupLine();
        if (liveGroup && !parseToothNumbers(liveGroup.tooth).includes(tooth)) {
          const nextTeeth = [...parseToothNumbers(liveGroup.tooth), tooth];
          const quantity = nextTeeth.length;
          onUpdate(liveGroup.id, {
            tooth: formatToothNumbers(nextTeeth),
            quantity,
            finalValue: calcProcedureFinal({
              unitPrice: liveGroup.unitPrice,
              quantity,
              discount: liveGroup.discount,
            }),
          });
        } else if (!liveGroup) {
          const row = catalogToProcedure(pending);
          row.tooth = String(tooth);
          row.quantity = 1;
          row.face = undefined;
          row.finalValue = calcProcedureFinal(row);
          onAdd(row);
        }
      }
      return;
    }

    if (inGroup && group) {
      removeToothFromGroup(group, tooth);
    }

    if (facedRows.length === 0) {
      const row = catalogToProcedure(pending);
      row.tooth = String(tooth);
      row.face = faceStr;
      row.quantity = 1;
      row.finalValue = calcProcedureFinal(row);
      onAdd(row);
      return;
    }

    onUpdate(facedRows[0].id, {
      tooth: String(tooth),
      face: faceStr,
      quantity: 1,
      finalValue: calcProcedureFinal({
        unitPrice: facedRows[0].unitPrice,
        quantity: 1,
        discount: facedRows[0].discount,
      }),
    });
    for (const row of facedRows.slice(1)) onRemove?.(row.id);
  }

  function toggleFace(face: string) {
    const next = faces.includes(face)
      ? faces.filter((f) => f !== face)
      : [...faces, face];
    const ordered = normalizeFaceChars(next.join(""));
    setFaces(ordered);
    if (editingTooth != null) {
      syncToothFaces(editingTooth, ordered);
    }
  }

  function addWithTooth(tooth: number) {
    if (!pending) return;
    const faceStr = faces.length ? faces.join("") : "";

    if (faceStr) {
      const group = findGroupLine();
      if (group && parseToothNumbers(group.tooth).includes(tooth)) {
        removeToothFromGroup(group, tooth);
      }

      const alreadyFaced = existingProcedures.find(
        (p) =>
          p.code === pending.code &&
          p.name === pending.name &&
          parseToothNumbers(p.tooth).includes(tooth) &&
          (p.face || "") === faceStr
      );
      if (alreadyFaced) {
        setFaces([]);
        setEditingTooth(null);
        return;
      }

      const row = catalogToProcedure(pending);
      row.tooth = String(tooth);
      row.face = faceStr;
      row.quantity = 1;
      row.finalValue = calcProcedureFinal(row);
      onAdd(row);
      setFaces([]);
      setEditingTooth(null);
      return;
    }

    const group = findGroupLine();
    if (group) {
      const teeth = parseToothNumbers(group.tooth);
      if (teeth.includes(tooth)) {
        setFaces([]);
        setEditingTooth(null);
        return;
      }
      const nextTeeth = [...teeth, tooth];
      const quantity = nextTeeth.length;
      onUpdate(group.id, {
        tooth: formatToothNumbers(nextTeeth),
        quantity,
        finalValue: calcProcedureFinal({
          unitPrice: group.unitPrice,
          quantity,
          discount: group.discount,
        }),
      });
      setFaces([]);
      setEditingTooth(null);
      return;
    }

    const row = catalogToProcedure(pending);
    row.tooth = String(tooth);
    row.quantity = 1;
    row.face = undefined;
    row.finalValue = calcProcedureFinal(row);
    onAdd(row);
    setFaces([]);
    setEditingTooth(null);
  }

  function handleToothClick(
    tooth: number,
    modifiers?: { ctrlKey: boolean; metaKey: boolean }
  ) {
    if (!pending) return;

    if (modifiers?.ctrlKey || modifiers?.metaKey) {
      removeToothFromProcedure(tooth);
      return;
    }

    const rows = rowsForTooth(tooth);
    if (rows.length > 0) {
      const faceChars = normalizeFaceChars(
        rows.map((r) => r.face || "").join("")
      );
      setFaces(faceChars);
      setEditingTooth(tooth);
      return;
    }

    addWithTooth(tooth);
  }

  function addWithoutTooth() {
    if (!pending) return;
    const faceStr = faces.length ? faces.join("") : "";
    const row = catalogToProcedure(pending);
    row.face = faceStr || undefined;
    row.quantity = 1;
    row.finalValue = calcProcedureFinal(row);
    onAdd(row);
    setFaces([]);
    setEditingTooth(null);
  }

  function clearPending() {
    setPending(null);
    setFaces([]);
    setEditingTooth(null);
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
              Clique no dente selecionado para editar faces · Ctrl+clique para
              remover
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
                {editingTooth != null
                  ? ` · Editando dente ${editingTooth}`
                  : ""}
                {faces.length ? ` · Faces ${faces.join("")}` : ""}
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
            {editingTooth != null
              ? ` — editando dente ${editingTooth}`
              : " — limpam ao escolher o próximo dente"}
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
          onToggleTooth={handleToothClick}
          interactive={Boolean(pending)}
          showLegend={false}
          showSelectedLabel={false}
          toothActionHint=" · clique p/ editar faces · Ctrl+clique p/ remover"
          compact
        />
      </div>
    </div>
  );
}
