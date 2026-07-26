import { getSession } from "@/lib/auth";
import { ClinicBudgetsPage } from "@/components/budgets/ClinicBudgetsPage";

export default async function OrcamentosPage() {
  const session = await getSession();
  if (!session) return null;
  return <ClinicBudgetsPage />;
}
