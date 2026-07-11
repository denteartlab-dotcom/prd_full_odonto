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
  initialWaitingHistoryMock,
  initialWaitingPatientsMock,
  type WaitingPatient,
  type WaitingPatientHistory,
} from "@/lib/waiting-patients-mock";

const STORAGE_KEY = "odonto-waiting-patients-v1";

type StoredWaitingState = {
  waiting: WaitingPatient[];
  history: WaitingPatientHistory[];
};

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function loadStored(): StoredWaitingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredWaitingState;
    if (!Array.isArray(parsed.waiting) || !Array.isArray(parsed.history)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: StoredWaitingState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

type WaitingPatientsContextValue = {
  waiting: WaitingPatient[];
  history: WaitingPatientHistory[];
  startAttendance: (id: string) => WaitingPatient | null;
  callPatient: (id: string) => WaitingPatient | null;
  syncWithActiveConsultations: (
    consultations: { id: string; patient: string }[]
  ) => void;
};

const WaitingPatientsContext = createContext<WaitingPatientsContextValue | null>(null);

export function WaitingPatientsProvider({ children }: { children: ReactNode }) {
  const [waiting, setWaiting] = useState<WaitingPatient[]>(initialWaitingPatientsMock);
  const [history, setHistory] = useState<WaitingPatientHistory[]>(initialWaitingHistoryMock);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setWaiting(stored.waiting);
      setHistory(stored.history);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist({ waiting, history });
  }, [waiting, history, hydrated]);

  const moveToHistory = useCallback(
    (patient: WaitingPatient, action: "atendimento" | "chamada") => {
      const entry: WaitingPatientHistory = {
        ...patient,
        status: "completed",
        completedAt: nowTime(),
        action,
      };
      setWaiting((list) => list.filter((p) => p.id !== patient.id));
      setHistory((list) => {
        if (list.some((h) => h.id === patient.id && h.action === action)) return list;
        return [entry, ...list];
      });
    },
    []
  );

  const startAttendance = useCallback(
    (id: string) => {
      const patient = waiting.find((p) => p.id === id);
      if (!patient) return null;
      moveToHistory(patient, "atendimento");
      return patient;
    },
    [waiting, moveToHistory]
  );

  const callPatient = useCallback(
    (id: string) => {
      const patient = waiting.find((p) => p.id === id);
      if (!patient) return null;
      setWaiting((list) =>
        list.map((p) => (p.id === id ? { ...p, status: "called" as const } : p))
      );
      return patient;
    },
    [waiting]
  );

  const syncWithActiveConsultations = useCallback(
    (consultations: { id: string; patient: string }[]) => {
      if (consultations.length === 0) return;

      setWaiting((prevWaiting) => {
        const toMove: WaitingPatient[] = [];
        const remaining = prevWaiting.filter((p) => {
          const matched = consultations.some(
            (c) => c.id === p.appointmentId || c.patient === p.patient
          );
          if (matched) {
            toMove.push(p);
            return false;
          }
          return true;
        });

        if (toMove.length === 0) return prevWaiting;

        setHistory((prevHistory) => {
          const known = new Set(prevHistory.map((h) => h.id));
          const entries = toMove
            .filter((p) => !known.has(p.id))
            .map(
              (p): WaitingPatientHistory => ({
                ...p,
                status: "completed",
                completedAt: nowTime(),
                action: "atendimento",
              })
            );
          return entries.length > 0 ? [...entries, ...prevHistory] : prevHistory;
        });

        return remaining;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      waiting,
      history,
      startAttendance,
      callPatient,
      syncWithActiveConsultations,
    }),
    [waiting, history, startAttendance, callPatient, syncWithActiveConsultations]
  );

  return (
    <WaitingPatientsContext.Provider value={value}>{children}</WaitingPatientsContext.Provider>
  );
}

export function useWaitingPatients() {
  const ctx = useContext(WaitingPatientsContext);
  if (!ctx) {
    throw new Error("useWaitingPatients must be used within WaitingPatientsProvider");
  }
  return ctx;
}

export function useWaitingPatientsOptional() {
  return useContext(WaitingPatientsContext);
}
