"use client";

import { useEffect, useMemo, useState } from "react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import {
  computeHistoryStats,
  computeProfessionalStats,
  computeQuickIndicators,
  filterHistoryEvents,
  groupHistoryEvents,
  uniqueProfessionals,
} from "@/lib/patient-history";
import {
  buildHistoryExtrasFromProfile,
  mergeHistoryEvents,
} from "@/lib/patient-history-profile";
import {
  DEFAULT_HISTORY_FILTERS,
  type HistoryFilterState,
  type PatientHistoryEventFull,
} from "@/lib/patient-history-types";
import { HistoryDetailDrawer } from "./HistoryDetailDrawer";
import { HistoryEmptyState, HistorySkeleton } from "./HistoryEmptyState";
import { HistoryFiltersBar } from "./HistoryFiltersBar";
import { HistoryPagination } from "./HistoryPagination";
import { HistoryQuickCards } from "./HistoryQuickCards";
import { HistorySidebar } from "./HistorySidebar";
import { HistoryTimeline } from "./HistoryTimeline";

const PAGE_SIZE = 8;

export function PatientHistoryTab({ patient }: { patient: PatientProfile }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<PatientHistoryEventFull[]>([]);
  const [filters, setFilters] = useState<HistoryFilterState>(DEFAULT_HISTORY_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PatientHistoryEventFull | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/pacientes/${patient.id}/history`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Falha ao carregar histórico do paciente.");
        }
        const data = (await res.json()) as { events?: PatientHistoryEventFull[] };
        const fromDb = Array.isArray(data.events) ? data.events : [];
        const fromProfile = buildHistoryExtrasFromProfile(patient);
        if (!cancelled) {
          setEvents(mergeHistoryEvents(fromDb, fromProfile));
        }
      } catch (err) {
        if (!cancelled) {
          setEvents(buildHistoryExtrasFromProfile(patient));
          setLoadError(
            err instanceof Error ? err.message : "Não foi possível sincronizar o histórico."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [patient]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filtered = useMemo(
    () => filterHistoryEvents(events, filters),
    [events, filters]
  );

  const pageEvents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const groups = useMemo(() => groupHistoryEvents(pageEvents), [pageEvents]);
  const stats = useMemo(() => computeHistoryStats(filtered), [filtered]);
  const professionals = useMemo(
    () => computeProfessionalStats(filtered),
    [filtered]
  );
  const quick = useMemo(() => computeQuickIndicators(events), [events]);
  const professionalOptions = useMemo(() => uniqueProfessionals(events), [events]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function openEvent(event: PatientHistoryEventFull) {
    setSelected(event);
    setDrawerOpen(true);
  }

  function handleExport() {
    showToast(`Exportação PDF preparada (${filtered.length} eventos).`);
  }

  if (loading) return <HistorySkeleton />;

  if (events.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <div className="relative space-y-1">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Histórico do paciente</h2>
        <p className="text-sm text-slate-500">
          Centro de atividades — sincronizado com consultas, financeiro, orçamentos,
          documentos, receitas e demais módulos.
        </p>
        {loadError ? (
          <p className="mt-1 text-xs text-amber-600">{loadError}</p>
        ) : null}
      </div>

      <HistoryQuickCards
        items={quick}
        onDetails={(id) => {
          if (id === "next-consult") {
            const next = events.find(
              (e) => e.type === "consulta" && e.status === "agendada"
            );
            if (next) openEvent(next);
            return;
          }
          if (id === "last-consult") {
            const last = events.find(
              (e) => e.type === "consulta" && e.status === "concluida"
            );
            if (last) openEvent(last);
            return;
          }
          const map: Record<string, string> = {
            "last-payment": "financeiro",
            "active-budget": "orcamento",
            treatment: "procedimento",
            "last-doc": "documento",
          };
          const type = map[id];
          const found = type ? events.find((e) => e.type === type) : events[0];
          if (found) openEvent(found);
        }}
      />

      <HistoryFiltersBar
        filters={filters}
        professionals={professionalOptions}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onClear={() => setFilters(DEFAULT_HISTORY_FILTERS)}
        onExport={handleExport}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-h-[480px] rounded-2xl border border-slate-200/80 bg-[#fbfcfe] p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Linha do tempo</h3>
              <p className="text-xs text-slate-500">
                {filtered.length} evento{filtered.length === 1 ? "" : "s"} encontrado
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="max-h-[720px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Nenhum evento corresponde aos filtros.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_HISTORY_FILTERS)}
                  className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <HistoryTimeline
                groups={groups}
                onView={openEvent}
                onEdit={(e) => {
                  openEvent(e);
                  showToast("Abra o módulo correspondente para editar.");
                }}
                onPrint={(e) => {
                  openEvent(e);
                  showToast("Use o módulo de origem para imprimir.");
                }}
                onDuplicate={() =>
                  showToast("Histórico é somente leitura — edite no módulo de origem.")
                }
              />
            )}
          </div>

          <HistoryPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        </section>

        <HistorySidebar
          stats={stats}
          professionals={professionals}
          recent={filtered}
          onSelect={openEvent}
          onExport={handleExport}
        />
      </div>

      <HistoryDetailDrawer
        open={drawerOpen}
        event={selected}
        onClose={() => setDrawerOpen(false)}
        onEdit={() => showToast("Edite este evento no módulo de origem.")}
        onPrint={() => showToast("Use o módulo de origem para imprimir.")}
        onDelete={() =>
          showToast("Eventos do histórico não podem ser excluídos por aqui.")
        }
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[90] rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
