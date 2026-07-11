"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, X } from "lucide-react";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import { createDefaultAnamnesis } from "@/lib/anamnesis-mock";
import { loadAnamnesisPrint } from "@/lib/anamnesis-print";
import { AnamnesisPrintDocument } from "./AnamnesisPrintDocument";
import "./anamnesis-print.css";

export function AnamnesisPrintPage({ patientId }: { patientId: string }) {
  const mounted = useMounted();
  const { getPatientById, hydrated } = usePatients();
  const [clinicName, setClinicName] = useState("Clínica Odontológica");

  const patient = useMemo(
    () => (mounted && hydrated ? getPatientById(patientId) : undefined),
    [mounted, hydrated, getPatientById, patientId]
  );

  const printData = useMemo(() => {
    if (!mounted) return null;
    const stashed = loadAnamnesisPrint(patientId);
    if (stashed) return stashed;
    if (patient?.dentalAnamnesis) {
      return { data: patient.dentalAnamnesis, clinicName: undefined, savedAt: Date.now() };
    }
    if (patient) {
      return { data: createDefaultAnamnesis(patient), clinicName: undefined, savedAt: Date.now() };
    }
    return null;
  }, [mounted, patientId, patient]);

  useEffect(() => {
    if (printData?.clinicName) setClinicName(printData.clinicName);
  }, [printData]);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Carregando documento...
      </div>
    );
  }

  if (!printData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100 p-6 text-center">
        <p className="text-slate-700">Documento não encontrado.</p>
        <button type="button" onClick={() => window.close()} className="text-sm text-indigo-600 hover:underline">
          Fechar aba
        </button>
      </div>
    );
  }

  return (
    <div className="anamnesis-print-view">
      <div className="print-toolbar no-print">
        <p className="text-sm font-medium text-slate-700">Visualização para impressão / PDF</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Fechar
          </button>
        </div>
      </div>

      <div className="print-page-wrap">
        <AnamnesisPrintDocument data={printData.data} clinicName={clinicName} />
      </div>
    </div>
  );
}
