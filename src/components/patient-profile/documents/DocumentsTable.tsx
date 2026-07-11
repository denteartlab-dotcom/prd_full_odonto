"use client";

import { formatDisplayDate } from "@/lib/patients-list-mock";
import type { PatientDocument } from "@/lib/document-types";
import { DOCUMENT_FILE_TYPE_LABELS } from "@/lib/document-types";
import { formatFileSize } from "@/lib/document-mock";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import { DocumentFileIcon } from "./DocumentFileIcon";
import { DocumentCategoryBadge, DocumentStatusBadge } from "./shared";

export function DocumentsTable({
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="pb-3 pr-4">Arquivo</th>
            <th className="pb-3 pr-4">Categoria</th>
            <th className="pb-3 pr-4">Tipo</th>
            <th className="pb-3 pr-4">Tamanho</th>
            <th className="pb-3 pr-4">Data de envio</th>
            <th className="pb-3 pr-4">Enviado por</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="group transition hover:bg-slate-50/80"
            >
              <td className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => onView(doc.id)}
                  className="flex items-center gap-3 text-left"
                >
                  <DocumentFileIcon fileType={doc.fileType} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800 group-hover:text-indigo-600">
                      {doc.name}
                    </p>
                    {doc.description && (
                      <p className="truncate text-xs text-slate-400">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </button>
              </td>
              <td className="py-3 pr-4">
                <DocumentCategoryBadge category={doc.category} />
              </td>
              <td className="py-3 pr-4 text-slate-600">
                {DOCUMENT_FILE_TYPE_LABELS[doc.fileType]}
              </td>
              <td className="py-3 pr-4 text-slate-600">
                {formatFileSize(doc.sizeBytes)}
              </td>
              <td className="py-3 pr-4 text-slate-600">
                {formatDisplayDate(doc.uploadedAt)}
              </td>
              <td className="py-3 pr-4 text-slate-600">{doc.uploadedBy}</td>
              <td className="py-3 pr-4">
                <DocumentStatusBadge status={doc.status} />
              </td>
              <td className="py-3 text-right">
                <DocumentActionsMenu
                  onView={() => onView(doc.id)}
                  onDownload={() => onDownload(doc.id)}
                  onRename={() => onRename(doc.id)}
                  onMove={() => onMove(doc.id)}
                  onDelete={() => onDelete(doc.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
