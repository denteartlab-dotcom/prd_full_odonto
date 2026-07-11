import { ModulePlaceholder, money, formatDate, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function OrcamentosPage() {
  const session = await getSession();
  if (!session) return null;
  const budgets = await prisma.budget.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ModulePlaceholder
      title="Orçamentos"
      moduleId="budgets"
      description="Planos de tratamento e propostas comerciais"
      stats={[
        { label: "Total", value: String(budgets.length) },
        {
          label: "Valor em aberto",
          value: money(
            budgets.filter((b) => b.status !== "pago").reduce((s, b) => s + b.total, 0)
          ),
        },
      ]}
      columns={["Paciente", "Itens", "Total", "Status", "Data"]}
      rows={budgets.map((b) => [
        b.patient.name,
        String(b.items.length),
        money(b.total),
        <Badge key={b.id} tone="blue">
          {b.status}
        </Badge>,
        formatDate(b.createdAt),
      ])}
    />
  );
}
