"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { ReceituarioLine, ReceituarioTemplate } from "@/lib/receituario-types";
import {
  deleteReceituarioTemplate,
  listReceituarioTemplates,
  saveCustomTemplate,
  type StoredReceituarioTemplate,
} from "@/lib/receituario-templates-store";

export function ModelosReceitaModal({
  open,
  onClose,
  onSelect,
  currentLines,
  currentNotes,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (template: ReceituarioTemplate & { lines?: ReceituarioLine[] }) => void;
  currentLines: ReceituarioLine[];
  currentNotes?: string;
}) {
  const [templates, setTemplates] = useState<StoredReceituarioTemplate[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function refresh() {
    setTemplates(listReceituarioTemplates());
  }

  useEffect(() => {
    if (!open) return;
    refresh();
    setCreating(false);
    setName("");
    setDescription("");
    setError("");
  }, [open]);

  const canCreateFromCurrent = currentLines.length > 0;

  const createHint = useMemo(() => {
    if (!canCreateFromCurrent) {
      return "Adicione medicamentos na receita atual para salvar um modelo personalizado.";
    }
    return `Será criado com ${currentLines.length} medicamento(s) da receita atual.`;
  }, [canCreateFromCurrent, currentLines.length]);

  function handleDelete(e: React.MouseEvent, tpl: StoredReceituarioTemplate) {
    e.stopPropagation();
    const label = tpl.custom ? "este modelo personalizado" : "este modelo padrão";
    if (!window.confirm(`Excluir ${label} “${tpl.name}”?`)) return;
    deleteReceituarioTemplate(tpl.id, Boolean(tpl.custom));
    refresh();
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Informe o nome do modelo.");
      return;
    }
    if (!canCreateFromCurrent) {
      setError("A receita atual está vazia.");
      return;
    }
    saveCustomTemplate({
      name,
      description,
      generalNotes: currentNotes,
      lines: currentLines,
    });
    setCreating(false);
    setName("");
    setDescription("");
    refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Modelos de Receita</h3>
            <p className="text-xs text-slate-500">Carrega medicamentos pré-configurados</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating((v) => !v);
                setError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo modelo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {creating ? (
          <form onSubmit={handleCreate} className="space-y-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <p className="text-xs text-slate-500">{createHint}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-600">
                Nome do modelo
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Pós-extração do Dr. João"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Descrição
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                />
              </label>
            </div>
            {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canCreateFromCurrent}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar modelo
              </button>
            </div>
          </form>
        ) : null}

        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {templates.map((tpl) => {
            const count = tpl.lines?.length || tpl.medicineIds.length;
            return (
              <div
                key={tpl.id}
                className="group relative rounded-xl border border-slate-200 p-4 hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, tpl)}
                  title="Excluir modelo"
                  className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 opacity-80 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(tpl);
                    onClose();
                  }}
                  className="w-full pr-8 text-left"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{tpl.name}</p>
                    {tpl.custom ? (
                      <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        Personalizado
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{tpl.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-indigo-600">
                    {count} medicamento(s)
                  </p>
                </button>
              </div>
            );
          })}
          {!templates.length ? (
            <p className="col-span-full text-sm text-slate-400">
              Nenhum modelo disponível. Crie um a partir da receita atual.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
