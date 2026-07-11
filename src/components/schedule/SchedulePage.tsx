"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  formatDayColumnHeader,
  formatWeekdayLong,
  getDateStrip,
  getWorkWeekDates,
  CONTROLE_END_HOUR,
  CONTROLE_START_HOUR,
  isActiveConsultation,
  professionalsMock,
  timeToMinutes,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";
import { useSchedule } from "@/contexts/schedule-context";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { AgendaFilterDrawer } from "./controle/AgendaFilterDrawer";
import { AgendaTabs, type AgendaTab } from "./controle/AgendaTabs";
import { AgendaTopBar } from "./controle/AgendaTopBar";
import { CalendarPopover } from "./controle/CalendarPopover";
import { ControleDailyGrid } from "./controle/ControleDailyGrid";
import { ControleWeeklyGrid } from "./controle/ControleWeeklyGrid";
import { DateStrip } from "./controle/DateStrip";
import {
  ProfessionalScheduleHeader,
  type AgendaViewMode,
} from "./controle/ProfessionalScheduleHeader";
import { ProfessionalSidebar } from "./controle/ProfessionalSidebar";
import { AgendaFloatingDock } from "./AgendaFloatingDock";
import { WaitingQueuePanel } from "./controle/WaitingQueuePanel";
import {
  RescheduleConfirmModal,
  type ReschedulePrompt,
} from "./RescheduleConfirmModal";
import {
  conflictMessage,
  findScheduleConflicts,
  hasScheduleConflict,
} from "@/lib/schedule-conflicts";

export function SchedulePage({
  userName,
  initialDate,
}: {
  userName: string;
  role: string;
  initialDate: string;
  clinicName?: string;
}) {
  const {
    appointments,
    setAppointments,
    showToast,
    cancelAppointment,
    completeAppointment,
    startConsultation: startConsultationGlobal,
    finishConsultation,
  } = useSchedule();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [stripStart, setStripStart] = useState(() => addDays(initialDate, -3));
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [activeTab, setActiveTab] = useState<AgendaTab>("profissional");
  const [viewMode, setViewMode] = useState<AgendaViewMode>("dia");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleAppointment | null>(null);
  const [slotDraft, setSlotDraft] = useState<{ date: string; start: string; end: string } | null>(
    null
  );
  const [reschedulePrompt, setReschedulePrompt] = useState<ReschedulePrompt | null>(null);

  const stripDates = useMemo(() => getDateStrip(stripStart, 9), [stripStart]);
  const workWeek = useMemo(() => getWorkWeekDates(selectedDate), [selectedDate]);

  const selectedProfessional = useMemo(
    () => professionalsMock.find((p) => p.id === selectedProfessionalId) || null,
    [selectedProfessionalId]
  );

  const scheduleLabel = useMemo(() => {
    if (viewMode === "semana") {
      return `Semana · ${formatDayColumnHeader(workWeek[0])} – ${formatDayColumnHeader(workWeek[4])}`;
    }
    return `${formatWeekdayLong(selectedDate)} · ${formatDayColumnHeader(selectedDate)}`;
  }, [viewMode, workWeek, selectedDate]);

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const weekSet = new Set(workWeek);
    return appointments
      .filter((a) => (viewMode === "semana" ? weekSet.has(a.date) : a.date === selectedDate))
      .filter((a) => !selectedProfessionalId || a.professionalId === selectedProfessionalId)
      .filter((a) => !statusFilter || a.status === statusFilter)
      .filter((a) => !q || a.patient.toLowerCase().includes(q));
  }, [appointments, selectedDate, workWeek, viewMode, selectedProfessionalId, statusFilter, search]);

  const activeConsultations = useMemo(
    () => appointments.filter(isActiveConsultation),
    [appointments]
  );

  const activeProfessionalIds = useMemo(
    () => [...new Set(activeConsultations.map((a) => a.professionalId))],
    [activeConsultations]
  );

  const headerActiveConsultation = useMemo(() => {
    if (!selectedProfessionalId) {
      return activeConsultations[0] || null;
    }
    return (
      activeConsultations.find((a) => a.professionalId === selectedProfessionalId) || null
    );
  }, [activeConsultations, selectedProfessionalId]);

  const consultationNotifications = useMemo(
    () =>
      activeConsultations.map((a) => {
        const pro = professionalsMock.find((p) => p.id === a.professionalId);
        return {
          id: a.id,
          professionalId: a.professionalId,
          patient: a.patient,
          professionalName: pro?.name || "Profissional",
          procedure: a.procedure,
          startedAt: a.consultationStartedAt!,
        };
      }),
    [activeConsultations]
  );

  function handleStartConsultation(id: string) {
    const current = appointments.find((a) => a.id === id);
    if (startConsultationGlobal(id) && current) {
      setSelectedProfessionalId(current.professionalId);
    }
  }

  function openNew(slot?: { date: string; start: string; end: string }) {
    if (slot) {
      const proId = selectedProfessionalId || professionalsMock[0]?.id || "";
      const conflicts = findScheduleConflicts(appointments, {
        professionalId: proId,
        date: slot.date,
        start: slot.start,
        end: slot.end,
      });
      if (conflicts.length > 0) {
        showToast(conflictMessage(conflicts));
        return;
      }
    }
    setEditing(null);
    setSlotDraft(slot || null);
    setModalOpen(true);
  }

  function openEdit(id: string) {
    setEditing(appointments.find((a) => a.id === id) || null);
    setSlotDraft(null);
    setModalOpen(true);
  }

  function handleTabChange(tab: AgendaTab) {
    if (tab === "filtrar") {
      setFilterOpen(true);
      return;
    }
    setActiveTab(tab);
  }

  function saveAppointment(data: {
    id?: string;
    patient: string;
    professionalId: string;
    procedure: string;
    date: string;
    start: string;
    end: string;
    status: ScheduleAppointment["status"];
    notes: string;
  }) {
    const initials = data.patient
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

    const conflicts = findScheduleConflicts(appointments, {
      professionalId: data.professionalId,
      date: data.date,
      start: data.start,
      end: data.end,
      excludeId: data.id,
    });
    if (conflicts.length > 0) {
      showToast(conflictMessage(conflicts));
      return;
    }

    if (data.id) {
      setAppointments((list) =>
        list.map((a) =>
          a.id === data.id ? { ...a, ...data, initials: initials || a.initials } : a
        )
      );
      showToast("Agendamento atualizado (mock).");
    } else {
      setAppointments((list) => [
        ...list,
        {
          id: `a-${Date.now()}`,
          professionalId: data.professionalId,
          patient: data.patient,
          initials: initials || "PA",
          procedure: data.procedure,
          date: data.date,
          start: data.start,
          end: data.end,
          status: data.status,
          notes: data.notes,
        },
      ]);
      showToast("Agendamento criado (mock).");
    }
    setModalOpen(false);
    setEditing(null);
    setSlotDraft(null);
    if (data.date) setSelectedDate(data.date);
  }

  function applyMove(
    id: string,
    payload: { date: string; start: string; end: string }
  ) {
    setAppointments((list) =>
      list.map((a) =>
        a.id === id
          ? { ...a, date: payload.date, start: payload.start, end: payload.end }
          : a
      )
    );
    setSelectedDate(payload.date);
    showToast(`Reagendado para ${payload.start}–${payload.end}`);
  }

  function requestMoveAppointment(
    id: string,
    payload: { date: string; start: string; end: string }
  ) {
    const current = appointments.find((a) => a.id === id);
    if (!current || current.status === "cancelado") return;

    const startMin = timeToMinutes(payload.start);
    const endMin = timeToMinutes(payload.end);

    if (endMin <= startMin) {
      showToast("Horário inválido.");
      return;
    }
    if (startMin < CONTROLE_START_HOUR * 60 || endMin > CONTROLE_END_HOUR * 60) {
      showToast("Fora do horário de funcionamento (08:00–18:00).");
      return;
    }

    const samePlace =
      current.date === payload.date &&
      current.start === payload.start &&
      current.end === payload.end;
    if (samePlace) return;

    const conflicts = findScheduleConflicts(appointments, {
      professionalId: current.professionalId,
      date: payload.date,
      start: payload.start,
      end: payload.end,
      excludeId: id,
    });

    if (conflicts.length > 0) {
      setReschedulePrompt({
        type: "blocked",
        appointment: current,
        payload,
        conflictWith: conflicts[0],
      });
      return;
    }

    setReschedulePrompt({
      type: "confirm",
      appointment: current,
      payload,
    });
  }

  function confirmReschedule() {
    if (!reschedulePrompt || reschedulePrompt.type !== "confirm") return;
    applyMove(reschedulePrompt.appointment.id, reschedulePrompt.payload);
    setReschedulePrompt(null);
  }

  function wouldMoveConflict(
    id: string,
    payload: { date: string; start: string; end: string }
  ) {
    const current = appointments.find((a) => a.id === id);
    if (!current) return false;
    return hasScheduleConflict(appointments, {
      professionalId: current.professionalId,
      date: payload.date,
      start: payload.start,
      end: payload.end,
      excludeId: id,
    });
  }

  return (
    <div className="-m-4 flex min-h-[calc(100vh-2rem)] flex-col bg-[#f4f6fb] sm:-m-6 lg:-m-8">
      <AgendaTopBar
        search={search}
        onSearchChange={setSearch}
        userName={userName}
        consultationNotifications={consultationNotifications}
        onSelectProfessional={(professionalId) => setSelectedProfessionalId(professionalId)}
      />

      <div className="relative">
        <DateStrip
          dates={stripDates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onPrev={() => setStripStart((s) => addDays(s, -7))}
          onNext={() => setStripStart((s) => addDays(s, 7))}
          onOpenCalendar={() => setCalendarOpen((v) => !v)}
        />
        <CalendarPopover
          open={calendarOpen}
          selectedDate={selectedDate}
          onSelect={(iso) => {
            setSelectedDate(iso);
            setStripStart(addDays(iso, -3));
          }}
          onClose={() => setCalendarOpen(false)}
        />
      </div>

      <AgendaTabs active={activeTab} onChange={handleTabChange} />

      <div className="flex min-h-0 flex-1">
        {activeTab === "profissional" || activeTab === "filtrar" ? (
          <>
            <ProfessionalSidebar
              professionals={professionalsMock}
              selectedId={selectedProfessionalId}
              activeProfessionalIds={activeProfessionalIds}
              onSelect={setSelectedProfessionalId}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <ProfessionalScheduleHeader
                professional={selectedProfessional}
                subtitle={scheduleLabel}
                viewMode={viewMode}
                activeConsultation={headerActiveConsultation}
                onViewModeChange={setViewMode}
                onFilter={() => setFilterOpen(true)}
                onRefresh={() => showToast("Agenda atualizada (mock).")}
                onFinishConsultation={finishConsultation}
              />
              {viewMode === "semana" ? (
                <ControleWeeklyGrid
                  weekDates={workWeek}
                  selectedDate={selectedDate}
                  appointments={filteredAppointments}
                  onSlotClick={(date, hour) => {
                    const [h] = hour.split(":").map(Number);
                    const end = `${String(Math.min(h + 1, 18)).padStart(2, "0")}:00`;
                    openNew({ date, start: hour, end });
                  }}
                  onEdit={openEdit}
                  onReschedule={openEdit}
                  onCancel={cancelAppointment}
                  onComplete={completeAppointment}
                  onMove={requestMoveAppointment}
                  wouldMoveConflict={wouldMoveConflict}
                  onStartConsultation={handleStartConsultation}
                  onFinishConsultation={finishConsultation}
                />
              ) : (
                <ControleDailyGrid
                  date={selectedDate}
                  appointments={filteredAppointments}
                  onSlotClick={(date, hour) => {
                    const [h] = hour.split(":").map(Number);
                    const end = `${String(Math.min(h + 1, 18)).padStart(2, "0")}:00`;
                    openNew({ date, start: hour, end });
                  }}
                  onEdit={openEdit}
                  onReschedule={openEdit}
                  onCancel={cancelAppointment}
                  onComplete={completeAppointment}
                  onMove={requestMoveAppointment}
                  wouldMoveConflict={wouldMoveConflict}
                  onStartConsultation={handleStartConsultation}
                  onFinishConsultation={finishConsultation}
                />
              )}
            </div>
          </>
        ) : activeTab === "fila" ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <WaitingQueuePanel />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-white p-8 text-sm text-slate-500">
            Visualização por consultório em breve.
          </div>
        )}

      </div>

      <AgendaFloatingDock
        onViewFullQueue={() => setActiveTab("fila")}
        onStartAttendance={(patient) => {
          if (patient.appointmentId) {
            handleStartConsultation(patient.appointmentId);
          } else {
            showToast(`Atendimento iniciado — ${patient.patient}`);
          }
        }}
        onCallPatient={(patient) => {
          showToast(`Chamando ${patient.patient} na recepção...`);
        }}
      />

      <AgendaFilterDrawer
        open={filterOpen}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClose={() => setFilterOpen(false)}
        onClear={() => {
          setStatusFilter("");
          setFilterOpen(false);
        }}
      />

      <NewAppointmentModal
        open={modalOpen}
        appointments={appointments}
        initial={
          editing
            ? {
                id: editing.id,
                patient: editing.patient,
                professionalId: editing.professionalId,
                procedure: editing.procedure,
                date: editing.date,
                start: editing.start,
                end: editing.end,
                status: editing.status,
                notes: editing.notes || "",
              }
            : {
                date: slotDraft?.date || selectedDate,
                start: slotDraft?.start,
                end: slotDraft?.end,
                professionalId: selectedProfessionalId || professionalsMock[0]?.id,
              }
        }
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setSlotDraft(null);
        }}
        onSave={saveAppointment}
      />

      <RescheduleConfirmModal
        prompt={reschedulePrompt}
        onConfirm={confirmReschedule}
        onCancel={() => setReschedulePrompt(null)}
      />
    </div>
  );
}
