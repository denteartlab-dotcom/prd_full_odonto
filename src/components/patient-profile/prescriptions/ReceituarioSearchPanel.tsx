"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Search, Star, Clock } from "lucide-react";
import { MedicationService, type Medicine, type MedicineCategory } from "@/lib/medication-service";
import { cn } from "@/lib/utils";

export function ReceituarioSearchPanel({
  onAdd,
}: {
  onAdd: (medicine: Medicine) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [favorites, setFavorites] = useState<Medicine[]>([]);
  const [recent, setRecent] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void Promise.all([
      MedicationService.getFavorites(),
      MedicationService.getRecentMedicines(),
      MedicationService.getCategories(),
    ]).then(([fav, rec, cats]) => {
      setFavorites(fav);
      setRecent(rec);
      setCategories(cats);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      setLoading(true);
      void (async () => {
        const rows = activeCategory
          ? await MedicationService.getByCategory(
              activeCategory as MedicineCategory["id"]
            )
          : await MedicationService.searchMedicines(query);
        if (!cancelled) {
          setResults(rows);
          setLoading(false);
        }
      })();
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, activeCategory]);

  function handleAdd(m: Medicine) {
    MedicationService.trackRecent(m.id);
    onAdd(m);
    void MedicationService.getRecentMedicines().then(setRecent);
  }

  return (
    <section className="flex min-h-[640px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Medicamentos</h3>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveCategory("");
            }}
            placeholder="Pesquisar medicamento..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
          />
        </label>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {(query.trim() || activeCategory) && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Resultados
              </p>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : null}
            </div>
            <ul className="space-y-2">
              {results.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{m.commercialName}</p>
                      <p className="text-[11px] text-slate-500">
                        {m.genericName} · {m.concentration} · {m.pharmaceuticalForm}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {m.categoryLabel} · {m.manufacturer}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(m)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </button>
                  </div>
                </li>
              ))}
              {!loading && !results.length ? (
                <p className="text-xs text-slate-400">Nenhum medicamento encontrado.</p>
              ) : null}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <Star className="h-3 w-3" /> Favoritos
          </p>
          <ul className="space-y-1.5">
            {favorites.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => handleAdd(m)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <span className="truncate font-medium text-slate-800">{m.commercialName}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <Clock className="h-3 w-3" /> Últimos utilizados
          </p>
          <ul className="space-y-1.5">
            {recent.map((m) => (
              <li key={`recent-${m.id}`}>
                <button
                  type="button"
                  onClick={() => handleAdd(m)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="truncate text-slate-700">{m.commercialName}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Categorias
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveCategory((cur) => (cur === c.id ? "" : c.id));
                  setQuery("");
                }}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  activeCategory === c.id
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
