"use client";

import { FileImage, FileText, Microscope, Upload } from "lucide-react";
import type { BudgetDocument, BudgetDocumentType } from "@/lib/budget-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { SectionCard } from "./shared";

const TYPE_ICONS: Record<BudgetDocumentType, React.ComponentType<{ className?: string }>> = {
  radiografia: Microscope,
  foto: FileImage,
  exame: FileText,
  pdf: FileText,
};

const TYPE_LABELS: Record<BudgetDocumentType, string> = {
  radiografia: "Radiografia",
  foto: "Foto",
  exame: "Exame",
  pdf: "PDF",
};

export function BudgetDocuments({
  documents,
  editable,
  onAdd,
}: {
  documents: BudgetDocument[];
  editable?: boolean;
  onAdd?: () => void;
}) {
  return (
    <SectionCard
      title="Documentos"
      action={
        editable ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" />
            Anexar
          </button>
        ) : null
      }
    >
      {documents.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">
          Nenhum documento anexado.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {documents.map((doc) => {
            const Icon = TYPE_ICONS[doc.type];
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{doc.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {TYPE_LABELS[doc.type]} · {formatDisplayDate(doc.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
