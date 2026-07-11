import { ModulePlaceholder, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function OdontogramaPage() {
  const session = await getSession();
  if (!session) return null;
  const entries = await prisma.odontogramEntry.findMany({
    include: { patient: true },
    where: { patient: { clinicId: session.clinicId } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ModulePlaceholder
      title="Odontograma"
      moduleId="odontogram"
      description="Mapa dentário e status por dente/face"
      columns={["Paciente", "Dente", "Face", "Status", "Obs."]}
      rows={entries.map((e) => [
        e.patient.name,
        e.tooth,
        e.surface || "—",
        <Badge key={e.id} tone={e.status === "cárie" ? "red" : "green"}>
          {e.status}
        </Badge>,
        e.notes || "—",
      ])}
    />
  );
}
