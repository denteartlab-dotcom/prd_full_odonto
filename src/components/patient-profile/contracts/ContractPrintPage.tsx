"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Printer, X } from "lucide-react";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import {
  buildFilledContractParties,
  type ClinicContractParty,
} from "@/lib/contract-fill";
import { getContractById } from "@/lib/patient-contracts";
import { ExtracoesDentariasFilledDocument } from "./ExtracoesDentariasFilledDocument";
import { GenericFilledContractDocument } from "./GenericFilledContractDocument";

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
  const [clinic, setClinic] = useState<ClinicContractParty | null>(null);

  const patient = useMemo(
    () => (mounted && hydrated ? getPatientById(patientId) : undefined),
    [mounted, hydrated, getPatientById, patientId]
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/clinic-settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          clinic?: {
            name?: string;
            cnpj?: string | null;
            address?: string | null;
            city?: string | null;
            state?: string | null;
            responsibleDentist?: string | null;
            cro?: string | null;
          };
        };
        if (!data.clinic) return;
        setClinic({
          name: data.clinic.name || "",
          cnpj: data.clinic.cnpj || "",
          address: data.clinic.address || "",
          city: data.clinic.city || "",
          state: data.clinic.state || "",
          responsibleDentist: data.clinic.responsibleDentist || "",
          cro: data.clinic.cro || "",
        });
      } catch {
        /* keep empty clinic fallbacks */
      }
    })();
  }, []);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#323639] text-sm text-white/70">
        Carregando contrato...
      </div>
    );
  }

  if (!contract || !patient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#323639] text-white">
        <p className="text-sm text-rose-300">
          {!contract ? "Contrato não encontrado." : "Paciente não encontrado."}
        </p>
        <Link href={`/app/pacientes/${patientId}`} className="text-sm text-indigo-300 underline">
          Voltar
        </Link>
      </div>
    );
  }

  const filledData = buildFilledContractParties(patient, clinic);

  return (
    <div className="min-h-screen bg-[#323639] text-white">
      <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-black/40 bg-[#323639] px-3 py-2">
        <p className="truncate text-xs text-white/80">
          {contract.pdfFileName || `${contract.shortLabel}.pdf`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            title="Imprimir / Salvar PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </button>
          <Link
            href={`/app/pacientes/${patientId}`}
            className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            title="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="py-4 print:py-0">
        {contract.id === "extracoes-dentarias" ? (
          <ExtracoesDentariasFilledDocument data={filledData} />
        ) : (
          <GenericFilledContractDocument contract={contract} data={filledData} />
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; }
          .contract-pdf-pages { background: white !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
