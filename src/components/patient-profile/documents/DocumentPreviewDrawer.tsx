"use client";

import { Download, Pencil, Trash2, X } from "lucide-react";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import type { PatientDocument } from "@/lib/document-types";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_FILE_TYPE_LABELS,
  DOCUMENT_VISIBILITY_LABELS,
  isPreviewable,
} from "@/lib/document-types";
import { formatFileSize } from "@/lib/document-mock";
import { DocumentFileIcon } from "./DocumentFileIcon";
import { DocumentStatusBadge } from "./shared";

export function DocumentPreviewDrawer({
  document,
  open,
  onClose,
  onEdit,
  onDownload,
  onDelete,
}: {
  document: PatientDocument | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  if (!open || !document) return null;

  const canPreview = isPreviewable(document.fileType);

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <DocumentFileIcon fileType={document.fileType} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">
                {document.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {DOCUMENT_FILE_TYPE_LABELS[document.fileType]} ·{" "}
                {formatFileSize(document.sizeBytes)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {canPreview ? (
            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {document.fileType === "image" && document.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={document.previewUrl}
                  alt={document.name}
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-2 p-6 text-center">
                  <DocumentFileIcon fileType="pdf" size="lg" />
                  <p className="text-sm font-medium text-slate-600">
                    Pré-visualização do PDF
                  </p>
                  <p className="text-xs text-slate-400">
                    {document.name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <DocumentFileIcon fileType={document.fileType} size="lg" className="mx-auto" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Pré-visualização não disponível para este formato.
              </p>
              <p className="mt-1 text-xs text-slate-500">Use o botão baixar.</p>
            </div>
          )}

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Categoria
              </dt>
              <dd className="mt-1 text-slate-800">
                {DOCUMENT_CATEGORY_LABELS[document.category]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Data
              </dt>
              <dd className="mt-1 text-slate-800">
                {formatDisplayDate(document.documentDate ?? document.uploadedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enviado por
              </dt>
              <dd className="mt-1 text-slate-800">{document.uploadedBy}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Visibilidade
              </dt>
              <dd className="mt-1 text-slate-800">
                {DOCUMENT_VISIBILITY_LABELS[document.visibility]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </dt>
              <dd className="mt-1">
                <DocumentStatusBadge status={document.status} />
              </dd>
            </div>
            {document.description && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Descrição
                </dt>
                <dd className="mt-1 text-slate-700">{document.description}</dd>
              </div>
            )}
            {document.tags && document.tags.length > 0 && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Tags
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Editar dados
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Baixar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </aside>
    </>
  );
}
