"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { filterEvolucoes } from "@/lib/prontuario-mock";
import {
  buildProntuarioPdfBytes,
  prontuarioPdfFilename,
} from "@/lib/prontuario-pdf";
import type {
  EvolucaoClinica,
  NovaEvolucaoForm,
  ProntuarioFilter,
  ProntuarioSort,
} from "@/lib/prontuario-types";
import { formToEvolucao, NovaEvolucaoDrawer } from "./NovaEvolucaoDrawer";
import { ProntuarioDetail } from "./ProntuarioDetail";
import { ProntuarioPdfViewerModal } from "./ProntuarioPdfViewerModal";
import { ProntuarioSidebar } from "./ProntuarioSidebar";
import { ProntuarioTimeline } from "./ProntuarioTimeline";

function clinicHeaderLines(clinic: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  cnpj?: string | null;
}) {
  const lines: string[] = [];
  if (clinic.address?.trim()) lines.push(clinic.address.trim());
  const cityState = [clinic.city?.trim(), clinic.state?.trim()]
    .filter(Boolean)
    .join(" — ");
  if (cityState) lines.push(cityState);
  if (clinic.phone?.trim()) lines.push(`Tel.: ${clinic.phone.trim()}`);
  if (clinic.email?.trim()) lines.push(clinic.email.trim());
  if (clinic.cnpj?.trim()) lines.push(`CNPJ ${clinic.cnpj.trim()}`);
  return lines;
}

const STORAGE_PREFIX = "odonto-prontuario:";
const CLEARED_FLAG = "odonto-prontuario-cleared-v1";

function clearAllProntuarioStorage() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(CLEARED_FLAG) === "1") return;
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.setItem(CLEARED_FLAG, "1");
  } catch {
    /* ignore */
  }
}

function loadEvolucoes(patientId: string): EvolucaoClinica[] {
  if (typeof window === "undefined") return [];
  clearAllProntuarioStorage();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${patientId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as EvolucaoClinica[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
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
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("prontuario.pdf");
  const pdfUrlRef = useRef("");

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

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

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

  async function handlePrint() {
    if (!selected) {
      setToast("Selecione uma evolução para imprimir.");
      return;
    }

    setPdfOpen(true);
    setPdfLoading(true);
    setPdfError("");
    setToast("");

    try {
      const res = await fetch("/api/clinic-settings", { cache: "no-store" });
      const data = (await res.json()) as {
        clinic?: {
          name?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          email?: string | null;
          cnpj?: string | null;
          logoUrl?: string | null;
        };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Falha ao carregar dados da clínica.");

      const clinic = data.clinic || { name: "Clínica Odontológica" };
      const bytes = buildProntuarioPdfBytes({
        clinic: {
          name: clinic.name || "Clínica Odontológica",
          headerLines: clinicHeaderLines(clinic),
          logoUrl: clinic.logoUrl,
        },
        patient: {
          name: patient.name,
          cpf: patient.cpf,
          phone: patient.phone,
          email: patient.email,
          birthDate: patient.birthDate,
          chartNumber: patient.chartNumber,
        },
        evolucao: selected,
      });

      const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const previous = pdfUrlRef.current;
      pdfUrlRef.current = url;
      setPdfUrl(url);
      setPdfName(prontuarioPdfFilename(patient.name, selected.date));
      if (previous) URL.revokeObjectURL(previous);
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Não foi possível gerar o PDF do prontuário."
      );
    } finally {
      setPdfLoading(false);
    }
  }

  function closePdf() {
    setPdfOpen(false);
    setPdfError("");
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = "";
    }
    setPdfUrl("");
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
          onPrint={() => void handlePrint()}
        />
        <ProntuarioSidebar
          patient={patient}
          onNovaEvolucao={() => setDrawerOpen(true)}
          onPrint={() => void handlePrint()}
        />
      </div>

      <NovaEvolucaoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profissionalDefault={userName || "Dr(a). Responsável"}
        onSave={handleSaveNova}
      />

      <ProntuarioPdfViewerModal
        open={pdfOpen}
        onClose={closePdf}
        pdfUrl={pdfUrl}
        fileName={pdfName}
        loading={pdfLoading}
        error={pdfError}
      />
    </div>
  );
}
