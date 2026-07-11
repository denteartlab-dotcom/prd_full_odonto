import { getSession } from "@/lib/auth";
import { BudgetPrintPage } from "@/components/budgets/BudgetPrintPage";

export default async function PacienteOrcamentoImprimirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  return <BudgetPrintPage patientId={id} />;
}
