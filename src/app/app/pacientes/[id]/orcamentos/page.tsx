import { getSession } from "@/lib/auth";
import { BudgetsPage } from "@/components/budgets";

export default async function PacienteOrcamentosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  return (
    <BudgetsPage
      patientId={id}
      userName={session.name}
      role={session.role}
    />
  );
}
