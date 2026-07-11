import { ModulePlaceholder } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AnamnesePage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.anamnesis.findMany({
    include: { patient: true },
    where: { patient: { clinicId: session.clinicId } },
  });

  return (
    <ModulePlaceholder
      title="Anamnese"
      moduleId="anamnesis"
      description="Histórico de saúde e questionário clínico"
      columns={["Paciente", "Alergias", "Medicamentos", "Doenças", "Hábitos"]}
      rows={items.map((a) => [
        a.patient.name,
        a.allergies || "—",
        a.medications || "—",
        a.chronicDiseases || "—",
        a.habits || "—",
      ])}
    />
  );
}
