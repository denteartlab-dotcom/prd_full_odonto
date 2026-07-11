import { ModulePlaceholder, money, formatDate, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DespesasPage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.payable.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { dueDate: "asc" },
  });

  return (
    <ModulePlaceholder
      title="Contas a pagar"
      moduleId="accounts-payable"
      description="Despesas, fornecedores e obrigações"
      stats={[
        {
          label: "Em aberto",
          value: money(items.filter((i) => i.status === "aberto").reduce((s, i) => s + i.amount, 0)),
        },
      ]}
      columns={["Descrição", "Fornecedor", "Valor", "Vencimento", "Status"]}
      rows={items.map((i) => [
        i.description,
        i.supplier || "—",
        money(i.amount),
        formatDate(i.dueDate),
        <Badge key={i.id} tone={i.status === "pago" ? "green" : "amber"}>
          {i.status}
        </Badge>,
      ])}
    />
  );
}
