"use client";

import { cn } from "@/lib/utils";
import type { DocumentCategory } from "@/lib/document-types";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/document-types";

const CATEGORIES: (DocumentCategory | "todos")[] = [
  "todos",
  "pessoal",
  "exame",
  "radiografia",
  "contrato",
  "receita",
  "orcamento",
  "comprovante",
  "outros",
];

export function DocumentsCategoryTabs({
  active,
  onChange,
  counts,
}: {
  active: DocumentCategory | "todos";
  onChange: (category: DocumentCategory | "todos") => void;
  counts: Record<DocumentCategory | "todos", number>;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
            active === cat
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          )}
        >
          {cat === "todos" ? "Todos" : DOCUMENT_CATEGORY_LABELS[cat]}
          <span
            className={cn(
              "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
              active === cat ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"
            )}
          >
            {counts[cat]}
          </span>
        </button>
      ))}
    </div>
  );
}
