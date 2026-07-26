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
import type { PatientProfile } from "@/lib/patient-profile-types";
import { profileToList } from "@/lib/patient-profile-types";
import type { ListPatient } from "@/lib/patients-list-mock";

type PatientsContextValue = {
  patients: PatientProfile[];
  listPatients: ListPatient[];
  hydrated: boolean;
  loading: boolean;
  error: string;
  refreshPatients: () => Promise<void>;
  getPatientById: (id: string) => PatientProfile | undefined;
  updatePatient: (id: string, patch: Partial<PatientProfile>) => void;
  addPatientFromForm: (form: PatientFormState) => Promise<string>;
  deletePatient: (id: string) => Promise<void>;
};

const PatientsContext = createContext<PatientsContextValue | null>(null);

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pacientes", { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Falha ao carregar pacientes.");
      }
      const data = (await res.json()) as { patients: PatientProfile[] };
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pacientes.");
      setPatients([]);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refreshPatients();
  }, [refreshPatients]);

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients]
  );

  const updatePatient = useCallback((id: string, patch: Partial<PatientProfile>) => {
    setPatients((list) => {
      const current = list.find((p) => p.id === id);
      if (!current) return list;
      const next = { ...current, ...patch, id };
      void fetch(`/api/pacientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: next }),
      }).catch(() => {
        /* keep optimistic UI */
      });
      return list.map((p) => (p.id === id ? next : p));
    });
  }, []);

  const addPatientFromForm = useCallback(async (form: PatientFormState) => {
    const res = await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form }),
    });
    const data = (await res.json()) as { patient?: PatientProfile; error?: string };
    if (!res.ok || !data.patient) {
      throw new Error(data.error || "Não foi possível salvar o paciente.");
    }
    setPatients((list) => [data.patient!, ...list.filter((p) => p.id !== data.patient!.id)]);
    return data.patient.id;
  }, []);

  const deletePatient = useCallback(async (id: string) => {
    const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Não foi possível excluir.");
    }
    setPatients((list) => list.filter((p) => p.id !== id));
  }, []);

  const listPatients = useMemo(() => patients.map(profileToList), [patients]);

  const value = useMemo(
    () => ({
      patients,
      listPatients,
      hydrated,
      loading,
      error,
      refreshPatients,
      getPatientById,
      updatePatient,
      addPatientFromForm,
      deletePatient,
    }),
    [
      patients,
      listPatients,
      hydrated,
      loading,
      error,
      refreshPatients,
      getPatientById,
      updatePatient,
      addPatientFromForm,
      deletePatient,
    ]
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
