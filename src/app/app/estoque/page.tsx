import { ModulePlaceholder, money, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EstoquePage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.inventoryItem.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { name: "asc" },
  });

  return (
    <ModulePlaceholder
      title="Estoque"
      moduleId="inventory"
      description="Materiais, insumos e alertas de estoque mínimo"
      stats={[
        { label: "Itens", value: String(items.length) },
        {
          label: "Abaixo do mínimo",
          value: String(items.filter((i) => i.quantity <= i.minStock).length),
        },
      ]}
      columns={["Produto", "SKU", "Qtd", "Mín.", "Custo", "Status"]}
      rows={items.map((i) => [
        i.name,
        i.sku || "—",
        `${i.quantity} ${i.unit}`,
        String(i.minStock),
        money(i.cost),
        <Badge key={i.id} tone={i.quantity <= i.minStock ? "red" : "green"}>
          {i.quantity <= i.minStock ? "baixo" : "ok"}
        </Badge>,
      ])}
    />
  );
}
