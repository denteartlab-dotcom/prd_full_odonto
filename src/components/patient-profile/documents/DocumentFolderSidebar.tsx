"use client";

import { cn } from "@/lib/utils";
import type { DocumentFolder } from "@/lib/document-types";
import { DOCUMENT_FOLDER_LABELS } from "@/lib/document-types";
import { Folder } from "lucide-react";

export function DocumentFolderSidebar({
  folders,
  active,
  onSelect,
}: {
  folders: { folder: DocumentFolder; count: number }[];
  active: DocumentFolder | "todos";
  onSelect: (folder: DocumentFolder | "todos") => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Pastas
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onSelect("todos")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
              active === "todos"
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <span className="flex items-center gap-2">
              <Folder className="h-4 w-4 opacity-60" />
              Todas as pastas
            </span>
          </button>
        </li>
        {folders.map(({ folder, count }) => (
          <li key={folder}>
            <button
              type="button"
              onClick={() => onSelect(folder)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                active === folder
                  ? "bg-indigo-50 font-semibold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <Folder className="h-4 w-4 shrink-0 opacity-60" />
                <span className="truncate">{DOCUMENT_FOLDER_LABELS[folder]}</span>
              </span>
              <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
