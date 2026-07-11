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
  createAppointmentsMock,
  formatConsultationDuration,
  getConsultationElapsedSeconds,
  isActiveConsultation,
  professionalsMock,
  toIsoDate,
  type ScheduleAppointment,
} from "@/lib/schedule-mock";

const STORAGE_KEY = "odonto-schedule-v1";
const MINIMIZED_STORAGE_KEY = "odonto-consultation-widget-minimized";

type ScheduleContextValue = {
  appointments: ScheduleAppointment[];
  activeConsultations: ScheduleAppointment[];
  consultationMinimized: boolean;
  toast: string;
  showToast: (message: string) => void;
  setAppointments: React.Dispatch<React.SetStateAction<ScheduleAppointment[]>>;
  updateAppointment: (id: string, patch: Partial<ScheduleAppointment>) => void;
  cancelAppointment: (id: string) => void;
  completeAppointment: (id: string) => void;
  startConsultation: (id: string) => boolean;
  finishConsultation: (id: string) => boolean;
  setConsultationMinimized: (value: boolean) => void;
  toggleConsultationMinimized: () => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

function loadStoredAppointments(): ScheduleAppointment[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { appointments?: ScheduleAppointment[] };
    return Array.isArray(parsed.appointments) ? parsed.appointments : null;
  } catch {
    return null;
  }
}

function persistAppointments(appointments: ScheduleAppointment[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ appointments, updatedAt: Date.now() })
    );
  } catch {
    /* ignore quota errors in mock */
  }
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>(() =>
    createAppointmentsMock(toIsoDate(new Date()))
  );
  const [toast, setToast] = useState("");
  const [consultationMinimized, setConsultationMinimizedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [uiReady, setUiReady] = useState(false);

  useEffect(() => {
    const stored = loadStoredAppointments();
    if (stored) setAppointments(stored);
    setHydrated(true);
  }, []);

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

  useEffect(() => {
    if (!hydrated) return;
    persistAppointments(appointments);
  }, [appointments, hydrated]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const updateAppointment = useCallback((id: string, patch: Partial<ScheduleAppointment>) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const cancelAppointment = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "cancelado" });
      showToast("Agendamento cancelado (mock).");
    },
    [updateAppointment, showToast]
  );

  const completeAppointment = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "finalizado" });
      showToast("Agendamento concluído (mock).");
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

      const pro = professionalsMock.find((p) => p.id === current.professionalId);
      const startedAt = new Date().toISOString();

      setAppointments((list) =>
        list.map((a) =>
          a.id === id
            ? { ...a, status: "em_andamento", consultationStartedAt: startedAt }
            : a
        )
      );
      showToast(
        `Consulta iniciada — ${pro?.name || "Dentista"} foi avisado que ${current.patient} chegou.`
      );
      return true;
    },
    [appointments, showToast]
  );

  const finishConsultation = useCallback(
    (id: string) => {
      const current = appointments.find((a) => a.id === id);
      if (!current?.consultationStartedAt) {
        showToast("Nenhuma consulta em andamento.");
        return false;
      }

      const duration = getConsultationElapsedSeconds(current.consultationStartedAt);

      setAppointments((list) =>
        list.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "finalizado",
                consultationDurationSeconds: duration,
              }
            : a
        )
      );
      showToast(`Consulta encerrada — duração: ${formatConsultationDuration(duration)}.`);
      return true;
    },
    [appointments, showToast]
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
      activeConsultations,
      consultationMinimized,
      toast,
      showToast,
      setAppointments,
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
      activeConsultations,
      consultationMinimized,
      toast,
      showToast,
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
