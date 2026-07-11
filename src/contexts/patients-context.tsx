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
import type { PatientFormState } from "@/components/patients/patient-form-types";
import {
  createPatientProfilesMock,
  enrichPatientProfile,
  formToProfile,
} from "@/lib/patient-profile-mock";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { profileToList } from "@/lib/patient-profile-types";
import type { ListPatient } from "@/lib/patients-list-mock";

const STORAGE_KEY = "odonto-patients-v1";

function loadStored(): PatientProfile[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { patients?: PatientProfile[] };
    return Array.isArray(parsed.patients) ? parsed.patients : null;
  } catch {
    return null;
  }
}

function persist(patients: PatientProfile[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ patients, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

type PatientsContextValue = {
  patients: PatientProfile[];
  listPatients: ListPatient[];
  hydrated: boolean;
  getPatientById: (id: string) => PatientProfile | undefined;
  updatePatient: (id: string, patch: Partial<PatientProfile>) => void;
  addPatientFromForm: (form: PatientFormState) => string;
  deletePatient: (id: string) => void;
};

const PatientsContext = createContext<PatientsContextValue | null>(null);

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<PatientProfile[]>(() => createPatientProfilesMock(48));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored?.length) setPatients(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(patients);
  }, [patients, hydrated]);

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients]
  );

  const updatePatient = useCallback((id: string, patch: Partial<PatientProfile>) => {
    setPatients((list) =>
      list.map((p) => (p.id === id ? enrichPatientProfile({ ...p, ...patch }) : p))
    );
  }, []);

  const addPatientFromForm = useCallback((form: PatientFormState) => {
    const id = `pat-${Date.now()}`;
    const profile = formToProfile(form, id);
    setPatients((list) => [profile, ...list]);
    return id;
  }, []);

  const deletePatient = useCallback((id: string) => {
    setPatients((list) => list.filter((p) => p.id !== id));
  }, []);

  const listPatients = useMemo(() => patients.map(profileToList), [patients]);

  const value = useMemo(
    () => ({
      patients,
      listPatients,
      hydrated,
      getPatientById,
      updatePatient,
      addPatientFromForm,
      deletePatient,
    }),
    [patients, listPatients, hydrated, getPatientById, updatePatient, addPatientFromForm, deletePatient]
  );

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
}

export function usePatients() {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error("usePatients must be used within PatientsProvider");
  return ctx;
}

export function usePatientsOptional() {
  return useContext(PatientsContext);
}
