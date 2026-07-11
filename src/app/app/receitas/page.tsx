import { ModulePlaceholder, money, formatDate, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ReceitasPage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.receivable.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true },
    orderBy: { dueDate: "asc" },
  });
  const aberto = items.filter((i) => i.status === "aberto").reduce((s, i) => s + i.amount, 0);

  return (
    <ModulePlaceholder
      title="Contas a receber"
      moduleId="accounts-receivable"
      description="Títulos de pacientes e recebimentos"
      stats={[
        { label: "Em aberto", value: money(aberto) },
        { label: "Títulos", value: String(items.length) },
      ]}
      columns={["Descrição", "Paciente", "Valor", "Vencimento", "Status"]}
      rows={items.map((i) => [
        i.description,
        i.patient?.name || "—",
        money(i.amount),
        formatDate(i.dueDate),
        <Badge key={i.id} tone={i.status === "pago" ? "green" : "amber"}>
          {i.status}
        </Badge>,
      ])}
    />
  );
}
