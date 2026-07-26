"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  canStartConsultation,
  formatConsultationDuration,
  getConsultationElapsedSeconds,
  isActiveConsultation,
  professionalsMock,
  toIsoDate,
  type Professional,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";

const MINIMIZED_STORAGE_KEY = "odonto-consultation-widget-minimized";

type ScheduleContextValue = {
  appointments: ScheduleAppointment[];
  professionals: Professional[];
  activeConsultations: ScheduleAppointment[];
  consultationMinimized: boolean;
  hydrated: boolean;
  toast: string;
  showToast: (message: string) => void;
  setAppointments: React.Dispatch<React.SetStateAction<ScheduleAppointment[]>>;
  refreshSchedule: () => Promise<void>;
  createAppointment: (
    data: Omit<ScheduleAppointment, "id"> & { id?: string; patientId?: string }
  ) => Promise<ScheduleAppointment | null>;
  updateAppointment: (id: string, patch: Partial<ScheduleAppointment>) => void;
  cancelAppointment: (id: string) => void;
  completeAppointment: (id: string) => void;
  startConsultation: (id: string) => boolean;
  finishConsultation: (id: string) => boolean;
  setConsultationMinimized: (value: boolean) => void;
  toggleConsultationMinimized: () => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

async function patchAppointmentApi(id: string, patch: Partial<ScheduleAppointment>) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { appointment: ScheduleAppointment };
  return data.appointment;
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>(professionalsMock);
  const [toast, setToast] = useState("");
  const [consultationMinimized, setConsultationMinimizedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [uiReady, setUiReady] = useState(false);

  const refreshSchedule = useCallback(async () => {
    try {
      const from = toIsoDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30));
      const to = toIsoDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 60));
      const res = await fetch(`/api/appointments?from=${from}&to=${to}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Falha ao carregar agenda");
      const data = (await res.json()) as {
        appointments: ScheduleAppointment[];
        professionals: Professional[];
      };
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      if (Array.isArray(data.professionals) && data.professionals.length) {
        setProfessionals(data.professionals);
      }
    } catch {
      /* keep current state */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refreshSchedule();
  }, [refreshSchedule]);

  useEffect(() => {
    try {
      setConsultationMinimizedState(sessionStorage.getItem(MINIMIZED_STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setUiReady(true);
  }, []);

  useEffect(() => {
    if (!uiReady) return;
    try {
      sessionStorage.setItem(MINIMIZED_STORAGE_KEY, consultationMinimized ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [consultationMinimized, uiReady]);

  const setConsultationMinimized = useCallback((value: boolean) => {
    setConsultationMinimizedState(value);
  }, []);

  const toggleConsultationMinimized = useCallback(() => {
    setConsultationMinimizedState((v) => !v);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const createAppointment = useCallback(
    async (
      data: Omit<ScheduleAppointment, "id"> & { id?: string; patientId?: string }
    ) => {
      if (data.id) {
        const updated = await patchAppointmentApi(data.id, data);
        if (updated) {
          setAppointments((list) => list.map((a) => (a.id === data.id ? updated : a)));
          return updated;
        }
        return null;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { appointment: ScheduleAppointment };
      setAppointments((list) => [...list, json.appointment]);
      return json.appointment;
    },
    []
  );

  const updateAppointment = useCallback((id: string, patch: Partial<ScheduleAppointment>) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    void patchAppointmentApi(id, patch).then((updated) => {
      if (!updated) return;
      setAppointments((list) => list.map((a) => (a.id === id ? updated : a)));
    });
  }, []);

  const cancelAppointment = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "cancelado" });
      showToast("Agendamento cancelado.");
    },
    [updateAppointment, showToast]
  );

  const completeAppointment = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "finalizado" });
      showToast("Agendamento concluído.");
    },
    [updateAppointment, showToast]
  );

  const startConsultation = useCallback(
    (id: string) => {
      const current = appointments.find((a) => a.id === id);
      if (!current || !canStartConsultation(current)) {
        showToast("Este agendamento não pode iniciar consulta.");
        return false;
      }

      const alreadyActive = appointments.some(
        (a) => a.professionalId === current.professionalId && isActiveConsultation(a)
      );
      if (alreadyActive) {
        showToast("Este dentista já possui uma consulta em andamento.");
        return false;
      }

      const pro = professionals.find((p) => p.id === current.professionalId);
      const startedAt = new Date().toISOString();

      updateAppointment(id, {
        status: "em_andamento",
        consultationStartedAt: startedAt,
      });
      showToast(
        `Consulta iniciada — ${pro?.name || "Dentista"} foi avisado que ${current.patient} chegou.`
      );
      return true;
    },
    [appointments, professionals, showToast, updateAppointment]
  );

  const finishConsultation = useCallback(
    (id: string) => {
      const current = appointments.find((a) => a.id === id);
      if (!current?.consultationStartedAt) {
        showToast("Nenhuma consulta em andamento.");
        return false;
      }

      const duration = getConsultationElapsedSeconds(current.consultationStartedAt);
      updateAppointment(id, {
        status: "finalizado",
        consultationDurationSeconds: duration,
      });
      showToast(`Consulta encerrada — duração: ${formatConsultationDuration(duration)}.`);
      return true;
    },
    [appointments, showToast, updateAppointment]
  );

  const activeConsultations = useMemo(
    () => appointments.filter(isActiveConsultation),
    [appointments]
  );

  useEffect(() => {
    if (activeConsultations.length === 0 && consultationMinimized) {
      setConsultationMinimizedState(false);
    }
  }, [activeConsultations.length, consultationMinimized]);

  const value = useMemo(
    () => ({
      appointments,
      professionals,
      activeConsultations,
      consultationMinimized,
      hydrated,
      toast,
      showToast,
      setAppointments,
      refreshSchedule,
      createAppointment,
      updateAppointment,
      cancelAppointment,
      completeAppointment,
      startConsultation,
      finishConsultation,
      setConsultationMinimized,
      toggleConsultationMinimized,
    }),
    [
      appointments,
      professionals,
      activeConsultations,
      consultationMinimized,
      hydrated,
      toast,
      showToast,
      refreshSchedule,
      createAppointment,
      updateAppointment,
      cancelAppointment,
      completeAppointment,
      startConsultation,
      finishConsultation,
      setConsultationMinimized,
      toggleConsultationMinimized,
    ]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error("useSchedule must be used within ScheduleProvider");
  }
  return ctx;
}

export function useScheduleOptional() {
  return useContext(ScheduleContext);
}
