"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import {
  proceduresMock,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  statusMeta,
  timeToMinutes,
  toIsoDate,
  type AppointmentStatus,
  type Professional,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import {
  conflictMessage,
  findScheduleConflicts,
} from "@/lib/schedule-conflicts";
import { maskCpf, onlyDigits } from "@/lib/masks";
import { cn } from "@/lib/utils";

export type AppointmentPatientOption = {
  id: string;
  name: string;
  chartNumber?: string | null;
  cpf?: string | null;
  phone?: string | null;
};

type FormState = {
  patientId: string;
  patient: string;
  professionalId: string;
  procedure: string;
  date: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  notes: string;
};

type DebtSummary = {
  amount: number;
  count: number;
};

function getConflictMessage(
  appointments: ScheduleAppointment[],
  form: FormState,
  editingId?: string | null
) {
  const conflicts = findScheduleConflicts(appointments, {
    professionalId: form.professionalId,
    date: form.date,
    start: form.start,
    end: form.end,
    excludeId: editingId || undefined,
  });
  return conflictMessage(conflicts);
}

function hasConflict(
  appointments: ScheduleAppointment[],
  form: FormState,
  editingId?: string | null
) {
  return Boolean(getConflictMessage(appointments, form, editingId));
}

function fichaLabel(p: { id: string; chartNumber?: string | null }) {
  if (p.chartNumber?.trim()) return p.chartNumber.trim();
  return "—";
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isOpenReceivable(row: {
  status?: string | null;
  paidAt?: string | null;
}) {
  if (row.paidAt) return false;
  const status = (row.status || "").toLowerCase();
  return status !== "pago" && status !== "cancelado";
}

export function NewAppointmentModal({
  open,
  initial,
  appointments,
  patients,
  professionals,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<FormState> & { id?: string };
  appointments: ScheduleAppointment[];
  patients: AppointmentPatientOption[];
  professionals: Professional[];
  onClose: () => void;
  onSave: (data: FormState & { id?: string }) => void;
}) {
  const defaultPro = professionals[0];
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    patientId: initial?.patientId || "",
    patient: initial?.patient || "",
    professionalId: initial?.professionalId || defaultPro?.id || "",
    procedure: initial?.procedure || proceduresMock[0],
    date: initial?.date || toIsoDate(new Date()),
    start: initial?.start || "09:00",
    end: initial?.end || "09:30",
    status: initial?.status || "confirmado",
    notes: initial?.notes || "",
  });
  const [error, setError] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientOpen, setPatientOpen] = useState(false);
  const [debtByPatient, setDebtByPatient] = useState<Record<string, DebtSummary>>(
    {}
  );
  const [debtLoading, setDebtLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const patient =
      patients.find((p) => p.id === initial?.patientId) ||
      patients.find((p) => p.name === initial?.patient) ||
      null;
    setForm({
      patientId: patient?.id || initial?.patientId || "",
      patient: patient?.name || initial?.patient || "",
      professionalId: initial?.professionalId || professionals[0]?.id || "",
      procedure: initial?.procedure || proceduresMock[0],
      date: initial?.date || toIsoDate(new Date()),
      start: initial?.start || "09:00",
      end: initial?.end || "09:30",
      status: initial?.status || "confirmado",
      notes: initial?.notes || "",
    });
    setPatientQuery(patient?.name || initial?.patient || "");
    setPatientOpen(false);
    setError("");
  }, [open, initial, patients, professionals]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setDebtLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/receivables", { cache: "no-store" });
        const data = (await res.json()) as {
          receivables?: Array<{
            patientId?: string | null;
            amount?: number;
            status?: string | null;
            paidAt?: string | null;
          }>;
        };
        if (!res.ok || cancelled) return;
        const map: Record<string, DebtSummary> = {};
        for (const row of data.receivables || []) {
          if (!row.patientId || !isOpenReceivable(row)) continue;
          const cur = map[row.patientId] || { amount: 0, count: 0 };
          cur.amount += Number(row.amount) || 0;
          cur.count += 1;
          map[row.patientId] = cur;
        }
        if (!cancelled) setDebtByPatient(map);
      } catch {
        if (!cancelled) setDebtByPatient({});
      } finally {
        if (!cancelled) setDebtLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!patientOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setPatientOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [patientOpen]);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    const digits = onlyDigits(patientQuery);
    const list = !q
      ? patients.slice(0, 12)
      : patients.filter((p) => {
          const name = p.name.toLowerCase();
          const cpf = onlyDigits(p.cpf || "");
          const ficha = (p.chartNumber || "").toUpperCase();
          return (
            name.includes(q) ||
            (digits.length >= 3 && cpf.includes(digits)) ||
            (ficha && ficha.includes(q.toUpperCase()))
          );
        });
    return list.slice(0, 20);
  }, [patientQuery, patients]);

  const selectedPatient =
    patients.find((p) => p.id === form.patientId) ||
    patients.find((p) => p.name === form.patient) ||
    null;

  const selectedDebt = selectedPatient
    ? debtByPatient[selectedPatient.id]
    : undefined;
  const hasDebt = Boolean(selectedDebt && selectedDebt.count > 0);

  if (!open) return null;

  function patch(next: Partial<FormState>) {
    setForm((atual) => ({ ...atual, ...next }));
    setError("");
  }

  function selectPatient(p: AppointmentPatientOption) {
    patch({ patientId: p.id, patient: p.name });
    setPatientQuery(p.name);
    setPatientOpen(false);
  }

  function clearPatient() {
    patch({ patientId: "", patient: "" });
    setPatientQuery("");
    setPatientOpen(true);
  }

  function validate() {
    const start = timeToMinutes(form.start);
    const end = timeToMinutes(form.end);
    const openMin = SCHEDULE_START_HOUR * 60;
    const closeMin = SCHEDULE_END_HOUR * 60;

    if (!form.patientId || !form.patient.trim()) {
      return "Selecione um paciente cadastrado.";
    }
    if (!form.professionalId) {
      return "Selecione um profissional.";
    }
    if (end <= start) {
      return "O horário final deve ser maior que o horário inicial.";
    }
    if (start < openMin || end > closeMin) {
      return `Horário fora do funcionamento (${String(SCHEDULE_START_HOUR).padStart(2, "0")}:00 às ${SCHEDULE_END_HOUR}:00).`;
    }
    if (hasConflict(appointments, form, initial?.id)) {
      return getConflictMessage(appointments, form, initial?.id);
    }
    return "";
  }

  function submit() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    onSave({ ...form, id: initial?.id });
  }

  const conflictMsg = getConflictMessage(appointments, form, initial?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {initial?.id ? "Editar agendamento" : "Novo agendamento"}
            </h3>
            <p className="text-xs text-slate-500">Preencha os dados da consulta</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2" ref={searchWrapRef}>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Paciente</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={patientQuery}
                  onChange={(e) => {
                    setPatientQuery(e.target.value);
                    setPatientOpen(true);
                    if (form.patientId) {
                      patch({ patientId: "", patient: "" });
                    }
                  }}
                  onFocus={() => setPatientOpen(true)}
                  placeholder="Digite o nome ou CPF do paciente..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                  autoComplete="off"
                />
                {patientQuery ? (
                  <button
                    type="button"
                    onClick={clearPatient}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Limpar paciente"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {patientOpen ? (
                  <div className="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                    {patients.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-slate-500">
                        Nenhum paciente cadastrado no sistema.
                      </p>
                    ) : null}
                    {patients.length > 0 && filteredPatients.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-slate-500">
                        Nenhum paciente encontrado para “{patientQuery}”.
                      </p>
                    ) : null}
                    {filteredPatients.map((p) => {
                      const debt = debtByPatient[p.id];
                      const owing = Boolean(debt && debt.count > 0);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPatient(p)}
                          className={cn(
                            "mb-1 w-full rounded-xl px-3 py-2.5 text-left last:mb-0 hover:bg-indigo-50/70",
                            form.patientId === p.id && "bg-indigo-50"
                          )}
                        >
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {p.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Ficha {fichaLabel(p)}
                            {p.cpf ? ` · CPF ${maskCpf(p.cpf)}` : ""}
                            {owing
                              ? ` · Débito ${formatMoney(debt!.amount)}`
                              : " · Em dia"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </label>

            {selectedPatient ? (
              <div
                className={cn(
                  "mt-2 rounded-xl border px-3 py-2.5 text-xs",
                  hasDebt
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                )}
              >
                <p className="font-semibold">{selectedPatient.name}</p>
                <p className="mt-1 opacity-90">
                  Ficha {fichaLabel(selectedPatient)}
                  {selectedPatient.cpf
                    ? ` · CPF ${maskCpf(selectedPatient.cpf)}`
                    : " · CPF não informado"}
                </p>
                <p className="mt-1 font-medium">
                  {debtLoading
                    ? "Consultando financeiro..."
                    : hasDebt
                      ? `Em débito · ${selectedDebt!.count} título(s) em aberto · ${formatMoney(selectedDebt!.amount)}`
                      : "Financeiro em dia"}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">
                Digite para buscar no cadastro e selecione o paciente.
              </p>
            )}
          </div>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Profissional</span>
            <select
              value={form.professionalId}
              onChange={(e) => patch({ professionalId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.specialty}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Procedimento</span>
            <select
              value={form.procedure}
              onChange={(e) => patch({ procedure: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {proceduresMock.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Data</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => patch({ date: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(e) => patch({ status: e.target.value as AppointmentStatus })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            >
              {(Object.keys(statusMeta) as AppointmentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s].label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Hora inicial</span>
            <input
              type="time"
              step={1800}
              value={form.start}
              onChange={(e) => patch({ start: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Hora final</span>
            <input
              type="time"
              step={1800}
              value={form.end}
              onChange={(e) => patch({ end: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Observações</span>
            <textarea
              value={form.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
              placeholder="Observações da consulta..."
            />
          </label>
        </div>

        {(error || conflictMsg) && (
          <div className="mx-5 mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error || conflictMsg}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            Salvar agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
