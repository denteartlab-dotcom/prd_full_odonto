"use client";

import { cn } from "@/lib/utils";
import type { DocumentCategory, DocumentStatus } from "@/lib/document-types";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_STATUS_LABELS,
} from "@/lib/document-types";

export function documentStatusBadge(status: DocumentStatus) {
  const map: Record<DocumentStatus, string> = {
    processado: "bg-emerald-100 text-emerald-700",
    enviando: "bg-blue-100 text-blue-700",
    erro: "bg-red-100 text-red-700",
    arquivado: "bg-slate-100 text-slate-600",
  };
  return map[status];
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        documentStatusBadge(status)
      )}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function DocumentCategoryBadge({ category }: { category: DocumentCategory }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
      {DOCUMENT_CATEGORY_LABELS[category]}
    </span>
  );
}

export function DocumentSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
