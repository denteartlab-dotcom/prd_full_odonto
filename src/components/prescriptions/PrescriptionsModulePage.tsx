"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Pill, RefreshCw, Search, X } from "lucide-react";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatBrasiliaDateTime } from "@/lib/date-range";
import {
  filterPrescriptions,
  formatPeriodLabel,
  matchPatients,
  patientsFromPrescriptions,
  periodBounds,
  prescriptionLineCount,
  resultLabel,
  type PatientOption,
  type PrescriptionPeriod,
} from "@/lib/prescription-list-filters";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui";

const PERIODS: { id: PrescriptionPeriod; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "mes", label: "Este mês" },
  { id: "ano", label: "Este ano" },
  { id: "personalizado", label: "Personalizado" },
];

export function PrescriptionsModulePage() {
  const [items, setItems] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<PrescriptionPeriod>("todos");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PatientOption | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prescricoes", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        items?: PrescriptionRecord[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar as receitas.");
      setItems(data.items ?? []);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Não foi possível carregar as receitas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const patients = useMemo(() => patientsFromPrescriptions(items), [items]);
  const suggestions = useMemo(() => matchPatients(patients, query), [patients, query]);
  const selectedPatient = selected
    ? patients.find((patient) => patient.id === selected.id) ?? selected
    : null;
  const bounds = useMemo(
    () => periodBounds(period, { from: customFrom, to: customTo }),
    [period, customFrom, customTo]
  );
  const rangeLabel = formatPeriodLabel(bounds, period);
  const waitingCustom = Boolean(bounds.pendingMessage);

  const visible = useMemo(() => {
    if (waitingCustom) return [];
    return filterPrescriptions(items, {
      patientId: selectedPatient?.id ?? null,
      bounds,
    });
  }, [items, selectedPatient, bounds, waitingCustom]);

  function choosePatient(patient: PatientOption) {
    setSelected(patient);
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  }

  function clearPatient() {
    setSelected(null);
    setQuery("");
    setOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function selectPeriod(next: PrescriptionPeriod) {
    setPeriod(next);
    if (next === "personalizado" && (!customFrom || !customTo)) {
      const month = periodBounds("mes", { from: "", to: "" });
      setCustomFrom(month.from ?? "");
      setCustomTo(month.to ?? "");
    }
  }

  function clearFilters() {
    setPeriod("todos");
    setCustomFrom("");
    setCustomTo("");
    setSelected(null);
    setQuery("");
    setOpen(false);
  }

  const filtersActive = period !== "todos" || Boolean(selected) || Boolean(query.trim());
  const summary = waitingCustom
    ? bounds.pendingMessage
    : resultLabel(visible.length, selectedPatient?.name ?? null, rangeLabel);

  return (
    <div>
      <PageHeader
        title="Receitas odontológicas"
        description="Escolha o período e o paciente. A lista mostra somente as receitas desse filtro."
        action={
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Atualizar
          </button>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div ref={searchRef} className="relative">
          <label htmlFor="receita-paciente" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Paciente
          </label>
          {selectedPatient ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{selectedPatient.name}</p>
                <p className="text-xs text-slate-500">
                  {selectedPatient.count === 1
                    ? "1 receita na clínica"
                    : `${selectedPatient.count} receitas na clínica`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/app/pacientes/${selectedPatient.id}?tab=receitas`}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Abrir ficha
                </Link>
                <button
                  type="button"
                  onClick={clearPatient}
                  aria-label="Remover paciente"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  id="receita-paciente"
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  autoComplete="off"
                  value={query}
                  placeholder="Buscar e selecionar o paciente"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActiveIndex(0);
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                      setActiveIndex((i) => Math.min(i + 1, Math.max(suggestions.length - 1, 0)));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const pick = suggestions[activeIndex] ?? suggestions[0];
                      if (pick) choosePatient(pick);
                    } else if (e.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                />
              </div>
              {open ? (
                <ul
                  id={listId}
                  role="listbox"
                  className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                >
                  {suggestions.length === 0 ? (
                    <li className="px-3 py-2.5 text-sm text-slate-500">
                      {patients.length === 0
                        ? "Nenhum paciente com receita."
                        : "Nenhum paciente com esse nome. Selecione um da lista."}
                    </li>
                  ) : (
                    suggestions.map((patient, index) => (
                      <li key={patient.id} role="option" aria-selected={index === activeIndex}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => choosePatient(patient)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm",
                            index === activeIndex ? "bg-brand-50 text-slate-900" : "text-slate-700"
                          )}
                        >
                          <span className="truncate font-medium">{patient.name}</span>
                          <span className="shrink-0 text-xs text-slate-400">
                            {patient.count === 1 ? "1 receita" : `${patient.count} receitas`}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
              {query.trim() ? (
                <p className="mt-2 text-xs text-slate-500">
                  Selecione o paciente na lista. A busca só filtra depois da escolha.
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Período</span>
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPeriod(item.id)}
              aria-pressed={period === item.id}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition",
                period === item.id
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {period === "personalizado" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">De</span>
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Até</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </label>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {loading ? "Carregando receitas..." : summary}
          </p>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </section>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 text-sm font-semibold text-rose-700 underline"
            >
              Tentar de novo
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyClinic />
        ) : waitingCustom ? (
          <EmptyFiltered message={bounds.pendingMessage || "Defina o intervalo."} />
        ) : visible.length === 0 ? (
          <EmptyFiltered
            message={
              selectedPatient && period !== "todos"
                ? `Nenhuma receita de ${selectedPatient.name} neste período.`
                : selectedPatient
                  ? `Nenhuma receita de ${selectedPatient.name}.`
                  : "Nenhuma receita neste período."
            }
          />
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {visible.map((item) => (
              <PrescriptionRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PrescriptionRow({ item }: { item: PrescriptionRecord }) {
  const [expanded, setExpanded] = useState(false);
  const lines = prescriptionLineCount(item.content);
  const long = lines > 2 || item.content.length > 160;
  const cro = item.professionalCro?.trim() ?? "";
  const croLabel = cro && !/^cro\b/i.test(cro) ? `CRO ${cro}` : cro;
  const dentist = [item.professionalName?.trim(), croLabel].filter(Boolean).join(" · ");

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href={`/app/pacientes/${item.patientId}?tab=receitas`}
              className="font-semibold text-slate-900 hover:text-brand-700"
            >
              {item.patientName}
            </Link>
            <time className="text-xs text-slate-400" dateTime={item.createdAt}>
              {formatBrasiliaDateTime(item.createdAt)}
            </time>
          </div>
          <p
            className={cn(
              "mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600",
              !expanded && long && "line-clamp-2"
            )}
          >
            {item.content}
          </p>
          {long ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-semibold text-brand-700 hover:underline"
            >
              {expanded ? "Recolher" : "Ver receita completa"}
            </button>
          ) : null}
          {dentist ? <p className="mt-1 text-xs text-slate-400">{dentist}</p> : null}
        </div>
        <a
          href={item.pdfUrl || `/api/prescricoes/${item.id}/imprimir`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-700"
        >
          <FileText className="h-3.5 w-3.5" />
          PDF
        </a>
      </div>
    </li>
  );
}

function EmptyClinic() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <Pill className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 font-medium text-slate-700">Nenhuma receita registrada</p>
      <p className="mt-1 text-sm text-slate-500">
        Abra o perfil de um paciente, na aba Receitas, e emita uma nova receita.
      </p>
      <Link
        href="/app/pacientes"
        className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Ir para pacientes
      </Link>
    </div>
  );
}

function EmptyFiltered({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <p className="mt-1 text-sm text-slate-500">Ajuste o período ou escolha outro paciente.</p>
    </div>
  );
}
