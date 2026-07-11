import { ModulePlaceholder, formatDateTime } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ReceitasMedicasPage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.prescription.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ModulePlaceholder
      title="Receitas médicas"
      moduleId="prescriptions"
      description="Prescrições e orientações medicamentosas"
      columns={["Paciente", "Conteúdo", "Data"]}
      rows={items.map((i) => [i.patient.name, i.content, formatDateTime(i.createdAt)])}
    />
  );
}
