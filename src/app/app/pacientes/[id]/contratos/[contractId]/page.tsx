import { ContractPrintPage } from "@/components/patient-profile/contracts/ContractPrintPage";

export default async function PacienteContratoPrintRoute({
  params,
}: {
  params: Promise<{ id: string; contractId: string }>;
}) {
  const { id, contractId } = await params;
  return <ContractPrintPage patientId={id} contractId={contractId} />;
}
