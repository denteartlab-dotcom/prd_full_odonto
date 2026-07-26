"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Printer, X } from "lucide-react";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import {
  buildFilledContractPatient,
  getContractById,
} from "@/lib/patient-contracts";
import { ContractPrintDocument } from "./ContractPrintDocument";

export function ContractPrintPage({
  patientId,
  contractId,
}: {
  patientId: string;
  contractId: string;
}) {
  const mounted = useMounted();
  const { getPatientById, hydrated } = usePatients();
  const contract = getContractById(contractId);

  const patient = useMemo(
    () => (mounted && hydrated ? getPatientById(patientId) : undefined),
    [mounted, hydrated, getPatientById, patientId]
  );

  useEffect(() => {
    if (!patient || !contract) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [patient, contract]);

  if (!mounted || !hydrated) {
    return <p className="p-8 text-sm text-slate-500">Carregando contrato...</p>;
  }

  if (!contract) {
    return (
      <div className="p-8">
        <p className="text-sm text-rose-600">Contrato não encontrado.</p>
        <Link href={`/app/pacientes/${patientId}`} className="mt-2 inline-block text-sm text-indigo-600">
          Voltar ao paciente
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <p className="text-sm text-rose-600">Paciente não encontrado.</p>
      </div>
    );
  }

  const filled = buildFilledContractPatient(patient);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">{contract.shortLabel}</p>
          <p className="text-xs text-slate-500">{patient.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </button>
          <Link
            href={`/app/pacientes/${patientId}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <X className="h-4 w-4" />
            Fechar
          </Link>
        </div>
      </div>

      <div className="py-6">
        <ContractPrintDocument
          contract={contract}
          patient={filled}
          clinicName="Clínica Sorriso Premium"
        />
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .contract-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
