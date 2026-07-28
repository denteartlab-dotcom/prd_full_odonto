"use client";

import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Plus, Search, Star } from "lucide-react";
import {
  useMedicationCategories,
  useMedicationFavorites,
  useMedicationRecent,
  useMedicationSearch,
} from "@/hooks/useMedicationSearch";
import { medicationService } from "@/services/medication.service";
import type { Medication } from "@/types/medication";
import { cn } from "@/lib/utils";

function MedicationSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-slate-100 bg-slate-50/80 p-3"
        >
          <div className="mb-2 h-3.5 w-[66%] rounded bg-slate-200" />
          <div className="mb-1.5 h-3 w-[80%] rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

function ResultItem({
  m,
  onPick,
  active,
}: {
  m: Medication;
  onPick: (m: Medication) => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(m)}
      className={cn(
        "w-full rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-indigo-300 bg-indigo-50/70 ring-2 ring-indigo-500/15"
          : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{m.name}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {m.activeIngredient || m.genericName}
            {m.concentration ? ` · ${m.concentration}` : ""}
            {m.dosageForm ? ` · ${m.dosageForm}` : ""}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {[m.category, m.manufacturer].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white">
          <Plus className="h-3 w-3" />
          Adicionar
        </span>
      </div>
    </button>
  );
}

export function ReceituarioSearchPanel({
  onAdd,
}: {
  onAdd: (medicine: Medication) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const search = useMedicationSearch(query, open || query.trim().length > 0);
  const favorites = useMedicationFavorites();
  const categories = useMedicationCategories();
  const recent = useMedicationRecent();

  const filteredItems = useMemo(() => {
    if (!activeCategory) return search.items;
    const needle = activeCategory.toLowerCase();
    return search.items.filter(
      (m) =>
        m.category.toLowerCase().includes(needle) ||
        m.name.toLowerCase().includes(needle)
    );
  }, [search.items, activeCategory]);

  const showDropdown = open && query.trim().length >= 2;

  async function handleAdd(m: Medication) {
    medicationService.trackRecent(m);
    recent.refresh();
    onAdd(m);
    try {
      await medicationService.addFavorite(m);
      await queryClient.invalidateQueries({ queryKey: ["medications", "favorites"] });
    } catch {
      /* favorito é best-effort */
    }
    setQuery("");
    setOpen(false);
    setHighlight(0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || !filteredItems.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[highlight];
      if (item) void handleAdd(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <section className="flex min-h-[640px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Medicamentos</h3>
        <div className="relative">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveCategory("");
                setOpen(true);
                setHighlight(0);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 160);
              }}
              onKeyDown={onKeyDown}
              placeholder="Nome, genérico, princípio ativo, fabricante, ANVISA..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
              autoComplete="off"
            />
            {search.isLoading && query.trim() ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            ) : null}
          </label>

          {showDropdown ? (
            <div className="absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
              {search.isLoading ? <MedicationSkeleton /> : null}

              {!search.isLoading && search.isError ? (
                <div className="space-y-3 p-3 text-center">
                  <p className="text-sm text-slate-600">
                    Não foi possível consultar os medicamentos.
                  </p>
                  <button
                    type="button"
                    onClick={() => void search.refetch()}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : null}

              {!search.isLoading && !search.isError && search.isEmpty ? (
                <p className="p-3 text-xs text-slate-400">Nenhum medicamento encontrado.</p>
              ) : null}

              {!search.isLoading && !search.isError
                ? filteredItems.map((m, i) => (
                    <div key={m.id} className="mb-1.5 last:mb-0">
                      <ResultItem
                        m={m}
                        active={i === highlight}
                        onPick={(med) => void handleAdd(med)}
                      />
                    </div>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <Star className="h-3 w-3" /> Favoritos
          </p>
          {favorites.isLoading ? <MedicationSkeleton /> : null}
          <ul className="space-y-1.5">
            {(favorites.data || []).map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => void handleAdd(m)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <span className="truncate font-medium text-slate-800">{m.name}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                </button>
              </li>
            ))}
            {!favorites.isLoading && !(favorites.data || []).length ? (
              <p className="text-xs text-slate-400">
                Favoritos são salvos automaticamente ao adicionar.
              </p>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <Clock className="h-3 w-3" /> Últimos pesquisados
          </p>
          <ul className="space-y-1.5">
            {recent.items.map((m) => (
              <li key={`recent-${m.id}`}>
                <button
                  type="button"
                  onClick={() => void handleAdd(m)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="truncate text-slate-700">{m.name}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              </li>
            ))}
            {!recent.items.length ? (
              <p className="text-xs text-slate-400">Nenhuma pesquisa recente.</p>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Categorias
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(categories.data || []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  const next = activeCategory === c.label ? "" : c.label;
                  setActiveCategory(next);
                  setQuery(next);
                  setOpen(Boolean(next));
                  inputRef.current?.focus();
                }}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  activeCategory === c.label
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
