"use client";

import { Copy, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { ReceituarioLine } from "@/lib/receituario-types";

export function ReceituarioEditor({
  lines,
  generalNotes,
  onChangeLines,
  onChangeNotes,
}: {
  lines: ReceituarioLine[];
  generalNotes: string;
  onChangeLines: (lines: ReceituarioLine[]) => void;
  onChangeNotes: (notes: string) => void;
}) {
  function updateLine(id: string, patch: Partial<ReceituarioLine>) {
    onChangeLines(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLine(id: string) {
    onChangeLines(lines.filter((l) => l.id !== id));
  }

  function duplicateLine(id: string) {
    const src = lines.find((l) => l.id === id);
    if (!src) return;
    const copy: ReceituarioLine = {
      ...src,
      id: `line-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const idx = lines.findIndex((l) => l.id === id);
    const next = [...lines];
    next.splice(idx + 1, 0, copy);
    onChangeLines(next);
  }

  function onDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return;
    const next = [...lines];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChangeLines(next);
  }

  return (
    <section className="flex min-h-[640px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Montagem da Receita</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Edite posologia, quantidade e observações. Arraste para reordenar.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {!lines.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-16 text-center">
            <Pencil className="mx-auto mb-2 h-6 w-6 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Nenhum medicamento na receita</p>
            <p className="mt-1 text-xs text-slate-400">
              Pesquise à esquerda ou escolha um modelo na barra superior.
            </p>
          </div>
        ) : (
          lines.map((line, index) => (
            <article
              key={line.id}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, index)}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    className="mt-0.5 cursor-grab text-slate-300 hover:text-slate-500"
                    title="Arrastar"
                    aria-label="Reordenar"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{line.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {line.concentration} · {line.pharmaceuticalForm}
                      {line.controlled ? " · Controlado" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Duplicar"
                    onClick={() => duplicateLine(line.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remover"
                    onClick={() => removeLine(line.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Field
                  label="Quantidade"
                  value={line.quantity}
                  onChange={(quantity) => updateLine(line.id, { quantity })}
                />
                <Field
                  label="Via"
                  value={line.route}
                  onChange={(route) => updateLine(line.id, { route })}
                />
                <Field
                  label="Posologia"
                  value={line.posology}
                  onChange={(posology) => updateLine(line.id, { posology })}
                />
                <Field
                  label="Duração"
                  value={line.duration}
                  onChange={(duration) => updateLine(line.id, { duration })}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Observações"
                    value={line.notes}
                    onChange={(notes) => updateLine(line.id, { notes })}
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 p-5">
        <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
          Observações Gerais da Receita
        </label>
        <textarea
          value={generalNotes}
          onChange={(e) => onChangeNotes(e.target.value)}
          rows={3}
          placeholder="Orientações gerais ao paciente..."
          className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300"
      />
    </label>
  );
}
