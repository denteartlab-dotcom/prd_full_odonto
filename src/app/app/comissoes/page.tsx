import { ModulePlaceholder, money, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ComissoesPage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.commission.findMany({
    where: { clinicId: session.clinicId },
    include: { professional: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ModulePlaceholder
      title="Comissões"
      moduleId="commissions"
      description="Comissões de profissionais por procedimento"
      columns={["Profissional", "Descrição", "%", "Valor", "Status"]}
      rows={items.map((i) => [
        i.professional.name,
        i.description,
        `${i.percent}%`,
        money(i.amount),
        <Badge key={i.id} tone={i.status === "pago" ? "green" : "amber"}>
          {i.status}
        </Badge>,
      ])}
    />
  );
}
