"use client";

import { cn } from "@/lib/utils";
import type { AnamnesisSectionId } from "@/lib/anamnesis-types";
import { ANAMNESIS_SECTIONS } from "@/lib/anamnesis-types";

export function AnamnesisSidebar({
  activeSection,
  onNavigate,
}: {
  activeSection: AnamnesisSectionId;
  onNavigate: (id: AnamnesisSectionId) => void;
}) {
  return (
    <nav
      aria-label="Seções da anamnese"
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
    >
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Seções
      </p>
      <ul className="space-y-0.5">
        {ANAMNESIS_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onNavigate(section.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition",
                activeSection === section.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                  activeSection === section.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {section.number}
              </span>
              <span className="leading-tight">{section.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
