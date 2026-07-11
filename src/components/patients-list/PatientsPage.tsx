"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePatients } from "@/contexts/patients-context";
import {
  computePatientKpis,
  type ListPatient,
  type PatientSortKey,
} from "@/lib/patients-list-mock";
import { onlyDigits } from "@/lib/masks";
import { PatientsFilters, emptyPatientFilters } from "./PatientsFilters";
import { PatientsHeader } from "./PatientsHeader";
import { PatientsKPICards } from "./PatientsKPICards";
import { PatientProfileDrawer } from "./PatientProfileDrawer";
import { DeletePatientModal } from "./DeletePatientModal";
import { PatientsTable } from "./PatientsTable";

function sortPatients(
  list: ListPatient[],
  key: PatientSortKey,
  dir: "asc" | "desc"
) {
  const factor = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const av = key === "city" ? `${a.city} ${a.state}` : a[key] ?? "";
    const bv = key === "city" ? `${b.city} ${b.state}` : b[key] ?? "";
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}

function isBirthdayThisMonth(patient: ListPatient) {
  const now = new Date();
  const birth = new Date(patient.birthDate + "T12:00:00");
  return birth.getMonth() === now.getMonth();
}

export function PatientsPage({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const router = useRouter();
  const { listPatients, deletePatient, hydrated } = usePatients();
  const patients = listPatients;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyPatientFilters);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sortKey, setSortKey] = useState<PatientSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<ListPatient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [birthdayFilter, setBirthdayFilter] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setIsLoading(true);
    setError(false);
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

  const insuranceOptions = useMemo(
    () => [...new Set(patients.map((p) => p.insurance))].sort(),
    [patients]
  );
  const cityOptions = useMemo(
    () => [...new Set(patients.map((p) => p.city))].sort(),
    [patients]
  );
  const responsibleOptions = useMemo(
    () => [...new Set(patients.map((p) => p.financialResponsible))].sort(),
    [patients]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = onlyDigits(search);

    return patients.filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.insurance && p.insurance !== filters.insurance) return false;
      if (filters.city && p.city !== filters.city) return false;
      if (filters.financialResponsible && p.financialResponsible !== filters.financialResponsible)
        return false;
      if (birthdayFilter && !isBirthdayThisMonth(p)) return false;

      if (!q && !qDigits) return true;

      const haystack = [
        p.name,
        p.cpf,
        p.phone,
        p.email,
        p.city,
      ]
        .join(" ")
        .toLowerCase();

      if (q && haystack.includes(q)) return true;
      if (qDigits && onlyDigits(p.cpf + p.phone).includes(qDigits)) return true;
      return false;
    });
  }, [patients, search, filters, birthdayFilter]);

  const sorted = useMemo(
    () => sortPatients(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const kpis = useMemo(() => computePatientKpis(patients), [patients]);

  function handleSort(key: PatientSortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function clearFilters() {
    setSearch("");
    setFilters(emptyPatientFilters);
    setBirthdayFilter(false);
    setPage(1);
  }

  function handleDelete(id: string) {
    deletePatient(id);
    if (selectedPatient?.id === id) setSelectedPatient(null);
    setDeleteTarget(null);
  }

  const handleRetry = useCallback(() => {
    setError(false);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 600);
  }, []);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PatientsHeader
        userName={userName}
        role={role}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <PatientsKPICards
        {...kpis}
        onBirthdaysClick={() => {
          setSearch("");
          setFilters(emptyPatientFilters);
          setBirthdayFilter(true);
          setPage(1);
        }}
      />

      <PatientsFilters
        filters={filters}
        insuranceOptions={insuranceOptions}
        cityOptions={cityOptions}
        responsibleOptions={responsibleOptions}
        showMore={showMoreFilters}
        onToggleMore={() => setShowMoreFilters((v) => !v)}
        onChange={(patch) => {
          setFilters((f) => ({ ...f, ...patch }));
          setPage(1);
        }}
        onClear={clearFilters}
      />

      <PatientsTable
        patients={paginated}
        totalFiltered={filtered.length}
        sortKey={sortKey}
        sortDir={sortDir}
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        isLoading={isLoading}
        error={error}
        onSort={handleSort}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onOpenPatient={(p) => router.push(`/app/pacientes/${p.id}`)}
        onEditPatient={() => router.push("/app/pacientes/novo")}
        onHistoryPatient={(p) => {
          setSelectedPatient(p);
        }}
        onDeletePatient={setDeleteTarget}
        onClearFilters={clearFilters}
        onRetry={handleRetry}
      />

      <PatientProfileDrawer
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />

      <DeletePatientModal
        patient={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}
