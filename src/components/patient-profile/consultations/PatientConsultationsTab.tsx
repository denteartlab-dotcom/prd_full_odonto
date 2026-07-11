"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, Plus, Printer } from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { PatientConsultation } from "@/lib/consultation-types";
import {
  applyConsultationFilters,
  appointmentToConsultation,
  consultationSummary,
  createDefaultConsultations,
  DEFAULT_CONSULTATION_FILTERS,
  syncLegacyAppointments,
  type ConsultationFilterState,
} from "@/lib/consultation-mock";
import { patientSeedFromId } from "@/lib/budget-mock";
import { ConsultationDetailsDrawer } from "./ConsultationDetailsDrawer";
import { ConsultationFilters } from "./ConsultationFilters";
import { ConsultationHistoryTable } from "./ConsultationHistoryTable";
import { ConsultationSummaryCards } from "./ConsultationSummaryCards";
import { ScheduleConsultationModal, type ScheduleForm } from "./ScheduleConsultationModal";
import { UpcomingConsultationsCard } from "./UpcomingConsultationsCard";

function loadConsultations(patient: PatientProfile): PatientConsultation[] {
  if (patient.consultations?.length) return patient.consultations;
  if (patient.upcomingAppointments.length || patient.appointmentHistory.length) {
    return [
      ...patient.upcomingAppointments.map(appointmentToConsultation),
      ...patient.appointmentHistory.map(appointmentToConsultation),
    ];
  }
  return createDefaultConsultations(patientSeedFromId(patient.id));
}

export function PatientConsultationsTab({
  patient,
  onUpdate,
}: {
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
}) {
  const [consultations, setConsultations] = useState<PatientConsultation[]>([]);
  const [filters, setFilters] = useState<ConsultationFilterState>(DEFAULT_CONSULTATION_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initialized = useRef(false);
  const pendingPersist = useRef(false);
  const patientIdRef = useRef(patient.id);

  useEffect(() => {
    if (patientIdRef.current !== patient.id) {
      patientIdRef.current = patient.id;
      initialized.current = false;
      pendingPersist.current = false;
    }
    if (initialized.current) return;
    const data = loadConsultations(patient);
    setConsultations(data);
    initialized.current = true;
    setLoading(false);
  }, [patient]);

  useEffect(() => {
    if (!pendingPersist.current || loading) return;
    pendingPersist.current = false;
    const legacy = syncLegacyAppointments(consultations);
    onUpdate({ consultations, ...legacy });
  }, [consultations, loading, onUpdate]);

  const persist = useCallback((next: PatientConsultation[]) => {
    setConsultations(next);
    pendingPersist.current = true;
  }, []);

  const filtered = useMemo(
    () => applyConsultationFilters(consultations, filters),
    [consultations, filters]
  );

  const summary = useMemo(() => consultationSummary(consultations), [consultations]);

  const selected = useMemo(
    () => consultations.find((c) => c.id === selectedId) ?? null,
    [consultations, selectedId]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const openDetails = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const handleCancel = (id: string) => {
    if (!confirm("Cancelar esta consulta?")) return;
    persist(
      consultations.map((c) =>
        c.id === id ? { ...c, status: "cancelada" as const } : c
      )
    );
    showToast("Consulta cancelada.");
  };

  const handleReschedule = (id: string) => {
    setSelectedId(id);
    setScheduleOpen(true);
    showToast("Preencha a nova data e horário.");
  };

  const handleSchedule = (form: ScheduleForm) => {
    const newConsultation: PatientConsultation = {
      id: `con-${Date.now()}`,
      date: form.date,
      time: form.time,
      procedure: form.procedure,
      professional: form.professional,
      status: "agendada",
    };

    if (selectedId && scheduleOpen) {
      persist(
        consultations.map((c) =>
          c.id === selectedId
            ? { ...c, date: form.date, time: form.time, procedure: form.procedure, professional: form.professional, status: "agendada" }
            : c
        )
      );
      showToast("Consulta reagendada.");
    } else {
      persist([newConsultation, ...consultations]);
      showToast("Consulta agendada com sucesso.");
    }
    setScheduleOpen(false);
    setSelectedId(null);
  };

  const isEmpty = !loading && consultations.length === 0;

  return (
    <div className="relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Consultas do paciente
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe consultas agendadas, realizadas e canceladas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setScheduleOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Agendar consulta
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Imprimir histórico
          </button>
          <Link
            href="/app/agenda"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Calendar className="h-4 w-4" />
            Abrir agenda
          </Link>
        </div>
      </div>

      {!loading && !isEmpty && (
        <ConsultationSummaryCards
          upcoming={summary.upcoming}
          completed={summary.completed}
          cancelled={summary.cancelled}
        />
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Nenhuma consulta encontrada para este paciente.
          </p>
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Agendar primeira consulta
          </button>
        </div>
      ) : (
        <>
          <ConsultationFilters
            filters={filters}
            onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
          />

          <UpcomingConsultationsCard
            consultations={filtered}
            onView={openDetails}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
          />

          <ConsultationHistoryTable consultations={filtered} onView={openDetails} />
        </>
      )}

      <ConsultationDetailsDrawer
        consultation={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedId) handleReschedule(selectedId);
        }}
        onPrint={() => window.print()}
      />

      <ScheduleConsultationModal
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setSelectedId(null);
        }}
        onSubmit={handleSchedule}
      />
    </div>
  );
}
