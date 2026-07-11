import { ModulePlaceholder, money, formatDateTime, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FluxoCaixaPage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.cashMovement.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { date: "desc" },
  });
  const entradas = items.filter((i) => i.type === "entrada").reduce((s, i) => s + i.amount, 0);
  const saidas = items.filter((i) => i.type === "saida").reduce((s, i) => s + i.amount, 0);

  return (
    <ModulePlaceholder
      title="Fluxo de caixa"
      moduleId="cashflow"
      description="Entradas e saídas do caixa da clínica"
      stats={[
        { label: "Entradas", value: money(entradas) },
        { label: "Saídas", value: money(saidas) },
        { label: "Saldo", value: money(entradas - saidas) },
      ]}
      columns={["Tipo", "Descrição", "Valor", "Data"]}
      rows={items.map((i) => [
        <Badge key={i.id} tone={i.type === "entrada" ? "green" : "red"}>
          {i.type}
        </Badge>,
        i.description,
        money(i.amount),
        formatDateTime(i.date),
      ])}
    />
  );
}
