"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePatients } from "@/contexts/patients-context";
import { useMounted } from "@/hooks/use-mounted";
import {
  buildFilledContractParties,
  type ClinicContractParty,
} from "@/lib/contract-fill";
import { getContractById } from "@/lib/patient-contracts";
import { ContractPdfViewer } from "./ContractPdfViewer";
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
  const fileName = contract.pdfFileName || `${contract.shortLabel}.pdf`;
  const sourceKey = [
    contract.id,
    patient.id,
    clinic?.name ?? "",
    clinic?.cnpj ?? "",
    clinic?.responsibleDentist ?? "",
    patient.name,
    patient.cpf,
  ].join("|");

  return (
    <ContractPdfViewer
      fileName={fileName}
      backHref={`/app/pacientes/${patientId}`}
      sourceKey={sourceKey}
    >
      {contract.id === "extracoes-dentarias" ? (
        <ExtracoesDentariasFilledDocument data={filledData} />
      ) : (
        <GenericFilledContractDocument contract={contract} data={filledData} />
      )}
    </ContractPdfViewer>
  );
}
