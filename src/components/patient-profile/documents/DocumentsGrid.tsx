"use client";

import { formatDisplayDate } from "@/lib/patients-list-mock";
import type { PatientDocument } from "@/lib/document-types";
import { formatFileSize } from "@/lib/document-mock";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import { DocumentFileIcon } from "./DocumentFileIcon";
import { DocumentCategoryBadge, DocumentStatusBadge } from "./shared";

export function DocumentsGrid({
  documents,
  onView,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  documents: PatientDocument[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onRename: (id: string) => void;
  onMove: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (documents.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Nenhum documento encontrado para este paciente.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc) => (
        <article
          key={doc.id}
          className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onView(doc.id)}
              className="flex min-w-0 flex-1 items-start gap-3 text-left"
            >
              <DocumentFileIcon fileType={doc.fileType} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800 group-hover:text-indigo-600">
                  {doc.name}
                </p>
                {doc.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {doc.description}
                  </p>
                )}
              </div>
            </button>
            <DocumentActionsMenu
              onView={() => onView(doc.id)}
              onDownload={() => onDownload(doc.id)}
              onRename={() => onRename(doc.id)}
              onMove={() => onMove(doc.id)}
              onDelete={() => onDelete(doc.id)}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DocumentCategoryBadge category={doc.category} />
            <DocumentStatusBadge status={doc.status} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{formatFileSize(doc.sizeBytes)}</span>
            <span>{formatDisplayDate(doc.uploadedAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
