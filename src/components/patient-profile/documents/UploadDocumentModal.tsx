"use client";

import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import type {
  DocumentCategory,
  DocumentVisibility,
  PatientDocument,
} from "@/lib/document-types";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_VISIBILITY_LABELS,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/document-types";
import { categoryToFolder } from "@/lib/document-types";
import { detectFileType, formatFileSize, isAcceptedFile } from "@/lib/document-mock";

export type UploadDocumentForm = {
  file: File | null;
  name: string;
  category: DocumentCategory;
  description: string;
  documentDate: string;
  tags: string;
  visibility: DocumentVisibility;
};

const EMPTY_FORM: UploadDocumentForm = {
  file: null,
  name: "",
  category: "outros",
  description: "",
  documentDate: new Date().toISOString().slice(0, 10),
  tags: "",
  visibility: "interno",
};

export function UploadDocumentModal({
  open,
  onClose,
  onSubmit,
  initialFile,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: UploadDocumentForm) => void;
  initialFile?: File | null;
  editing?: PatientDocument | null;
}) {
  const [form, setForm] = useState<UploadDocumentForm>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        file: null,
        name: editing.name,
        category: editing.category,
        description: editing.description ?? "",
        documentDate: editing.documentDate ?? editing.uploadedAt,
        tags: (editing.tags ?? []).join(", "),
        visibility: editing.visibility,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        file: initialFile ?? null,
        name: initialFile?.name.replace(/\.[^.]+$/, "") ?? "",
        documentDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, initialFile, editing]);

  if (!open) return null;

  const fileError =
    form.file && !isAcceptedFile(form.file)
      ? "Formato não aceito ou arquivo maior que 20MB."
      : form.file && form.file.size > MAX_FILE_SIZE_BYTES
        ? "Arquivo excede 20MB."
        : null;

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? "Editar documento" : "Upload documento"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            className="space-y-4 px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing && !form.file) return;
              if (fileError) return;
              onSubmit(form);
            }}
          >
            {!editing && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Arquivo
                </label>
                <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 p-6 hover:border-indigo-300 hover:bg-slate-50">
                  <Upload className="h-8 w-8 text-indigo-400" />
                  <span className="mt-2 text-sm font-medium text-slate-700">
                    {form.file ? form.file.name : "Selecionar arquivo"}
                  </span>
                  {form.file && (
                    <span className="mt-1 text-xs text-slate-500">
                      {formatFileSize(form.file.size)} ·{" "}
                      {detectFileType(form.file.name, form.file.type)}
                    </span>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setForm((prev) => ({
                        ...prev,
                        file: f,
                        name: f ? f.name.replace(/\.[^.]+$/, "") : prev.name,
                      }));
                    }}
                  />
                </label>
                {fileError && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fileError}</p>
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Nome do documento
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as DocumentCategory,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              >
                {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {DOCUMENT_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Pasta: {categoryToFolder(form.category)}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Descrição
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Data do documento
                </label>
                <input
                  type="date"
                  value={form.documentDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, documentDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Visibilidade
                </label>
                <select
                  value={form.visibility}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      visibility: e.target.value as DocumentVisibility,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                >
                  {(Object.keys(DOCUMENT_VISIBILITY_LABELS) as DocumentVisibility[]).map(
                    (v) => (
                      <option key={v} value={v}>
                        {DOCUMENT_VISIBILITY_LABELS[v]}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Tags
              </label>
              <input
                placeholder="Separadas por vírgula"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!editing && !form.file}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Salvar documento
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export function NewFolderModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-900">Nova pasta</h2>
          <p className="mt-1 text-sm text-slate-500">
            Organize documentos em pastas personalizadas (mock).
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da pasta"
            className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (name.trim()) onSubmit(name.trim());
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Criar pasta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function MoveCategoryModal({
  open,
  documentName,
  currentCategory,
  onClose,
  onSubmit,
}: {
  open: boolean;
  documentName: string;
  currentCategory: DocumentCategory;
  onClose: () => void;
  onSubmit: (category: DocumentCategory) => void;
}) {
  const [category, setCategory] = useState<DocumentCategory>(currentCategory);

  useEffect(() => {
    if (open) setCategory(currentCategory);
  }, [open, currentCategory]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-900">Mover categoria</h2>
          <p className="mt-1 truncate text-sm text-slate-500">{documentName}</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
          >
            {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((c) => (
              <option key={c} value={c}>
                {DOCUMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSubmit(category)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Mover
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function RenameDocumentModal({
  open,
  currentName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-900">Renomear documento</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (name.trim()) onSubmit(name.trim());
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
