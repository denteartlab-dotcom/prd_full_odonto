"use client";

import { useEffect, useMemo, useState } from "react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { createProntuarioMock, filterEvolucoes } from "@/lib/prontuario-mock";
import type {
  EvolucaoClinica,
  NovaEvolucaoForm,
  ProntuarioFilter,
  ProntuarioSort,
} from "@/lib/prontuario-types";
import { formToEvolucao, NovaEvolucaoDrawer } from "./NovaEvolucaoDrawer";
import { ProntuarioDetail } from "./ProntuarioDetail";
import { ProntuarioSidebar } from "./ProntuarioSidebar";
import { ProntuarioTimeline } from "./ProntuarioTimeline";

const STORAGE_PREFIX = "odonto-prontuario:";

function loadEvolucoes(patientId: string): EvolucaoClinica[] {
  if (typeof window === "undefined") return createProntuarioMock(patientId);
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${patientId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as EvolucaoClinica[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return createProntuarioMock(patientId);
}

function persistEvolucoes(patientId: string, items: EvolucaoClinica[]) {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${patientId}`, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function PatientProntuarioTab({
  patient,
  userName,
}: {
  patient: PatientProfile;
  userName?: string;
}) {
  const [items, setItems] = useState<EvolucaoClinica[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProntuarioFilter>("todos");
  const [sort, setSort] = useState<ProntuarioSort>("recentes");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [autosaveHint, setAutosaveHint] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const loaded = loadEvolucoes(patient.id);
    setItems(loaded);
    setSelectedId(loaded[0]?.id || "");
    setHydrated(true);
  }, [patient.id]);

  useEffect(() => {
    if (!hydrated) return;
    persistEvolucoes(patient.id, items);
  }, [hydrated, items, patient.id]);

  const filtered = useMemo(
    () => filterEvolucoes(items, { query, filter, sort }),
    [items, query, filter, sort]
  );

  const selected = items.find((e) => e.id === selectedId) || null;

  useEffect(() => {
    if (selectedId && !filtered.some((e) => e.id === selectedId) && filtered[0]) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  function patchSelected(patch: Partial<EvolucaoClinica>) {
    if (!selectedId) return;
    setItems((list) =>
      list.map((e) => {
        if (e.id !== selectedId) return e;
        const next = {
          ...e,
          ...patch,
          updatedAt: new Date().toISOString(),
          auditLog: [
            {
              id: `log-${Date.now()}`,
              user: userName || e.profissional,
              at: new Date().toISOString(),
              field: Object.keys(patch).join(", "),
              previous: "alterado",
              next: "atualizado",
            },
            ...e.auditLog,
          ],
        };
        return next;
      })
    );
    setAutosaveHint(`Rascunho salvo automaticamente · ${new Date().toLocaleTimeString("pt-BR")}`);
  }

  function handleSaveNova(form: NovaEvolucaoForm, finalize: boolean) {
    const created = formToEvolucao(form, patient.id, finalize);
    setItems((list) => [created, ...list]);
    setSelectedId(created.id);
    setToast(
      finalize
        ? "Evolução salva e atendimento finalizado."
        : "Evolução salva como rascunho."
    );
  }

  function handlePrint() {
    window.print();
    setToast("Modo de impressão aberto. Use Exportar PDF do navegador se necessário.");
  }

  if (!hydrated) {
    return (
      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[420px] animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
        <ProntuarioTimeline
          items={filtered}
          selectedId={selectedId}
          query={query}
          filter={filter}
          sort={sort}
          onQuery={setQuery}
          onFilter={setFilter}
          onSort={setSort}
          onSelect={setSelectedId}
          onNova={() => setDrawerOpen(true)}
        />
        <ProntuarioDetail
          patientId={patient.id}
          evolucao={selected}
          autosaveHint={autosaveHint}
          onPatch={patchSelected}
          onPrint={handlePrint}
        />
        <ProntuarioSidebar
          patient={patient}
          onNovaEvolucao={() => setDrawerOpen(true)}
          onPrint={handlePrint}
        />
      </div>

      <NovaEvolucaoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profissionalDefault={userName || "Dr(a). Responsável"}
        onSave={handleSaveNova}
      />
    </div>
  );
}
