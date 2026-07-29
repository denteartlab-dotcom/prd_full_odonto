"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { BudgetProcedure, ProcedureCatalogItem } from "@/lib/budget-types";
import { catalogToProcedure } from "@/lib/budget-mock";

async function fetchProcedures(
  query: string,
  limit: number,
  signal?: AbortSignal
): Promise<ProcedureCatalogItem[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });
  const res = await fetch(`/api/procedimentos?${params}`, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: ProcedureCatalogItem[] };
  return Array.isArray(data.items) ? data.items : [];
}

function useProcedureSearch(query: string, limit: number, enabled = true) {
  const [items, setItems] = useState<ProcedureCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const next = await fetchProcedures(query, limit, controller.signal);
        if (!controller.signal.aborted) setItems(next);
      } catch {
        if (!controller.signal.aborted) setItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query.trim() ? 220 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, limit, enabled]);

  return { items, loading };
}

export function ProcedureSearch({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: (procedure: BudgetProcedure) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { items, loading } = useProcedureSearch(query, 30, open);

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
                placeholder="Nome, código TUSS ou categoria..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="border-b border-slate-50 px-4 py-1.5 text-[11px] text-slate-400">
              Valores médios de referência — editáveis no orçamento
            </p>
            <ul className="max-h-80 overflow-y-auto p-2">
              {!loading && items.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-slate-400">
                  Nenhum procedimento encontrado.
                </li>
              ) : (
                items.map((item) => (
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
  const { items, loading } = useProcedureSearch(query, query.trim() ? 8 : 6);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar procedimento..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-indigo-500" />
        )}
      </div>
      <p className="text-[11px] text-slate-400">
        Catálogo TUSS com valor médio de referência · {query.trim() ? "resultados da busca" : "mais usados"}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.length === 0 && !loading ? (
          <p className="col-span-full py-4 text-center text-sm text-slate-400">
            Nenhum procedimento encontrado.
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(catalogToProcedure(item))}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
            >
              <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {item.code} · {item.category} · {item.estimatedMinutes} min
              </p>
              <p className="mt-1 text-sm font-bold text-indigo-600">{money(item.price)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
