"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetProcedure } from "@/lib/budget-types";
import { PROCEDURE_CATALOG, catalogToProcedure } from "@/lib/budget-mock";

export function ProcedureSearch({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: (procedure: BudgetProcedure) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROCEDURE_CATALOG;
    return PROCEDURE_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-4 top-[10%] z-[110] mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome, código ou categoria..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-slate-400">
                  Nenhum procedimento encontrado.
                </li>
              ) : (
                filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(catalogToProcedure(item));
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-indigo-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.code} · {item.category} · {item.estimatedMinutes} min
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-indigo-600">
                        {money(item.price)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

export function ProcedureCatalogList({
  onSelect,
  className,
}: {
  onSelect: (procedure: BudgetProcedure) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROCEDURE_CATALOG.slice(0, 6);
    return PROCEDURE_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar procedimento..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(catalogToProcedure(item))}
            className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
          >
            <p className="text-sm font-semibold text-slate-800">{item.name}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {item.category} · {item.estimatedMinutes} min
            </p>
            <p className="mt-1 text-sm font-bold text-indigo-600">{money(item.price)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
