import { ModulePlaceholder, formatDateTime } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProntuariosPage() {
  const session = await getSession();
  if (!session) return null;
  const notes = await prisma.medicalNote.findMany({
    include: { patient: true },
    where: { patient: { clinicId: session.clinicId } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ModulePlaceholder
      title="Prontuários"
      moduleId="medical-records"
      description="Evoluções clínicas e histórico do paciente"
      columns={["Paciente", "Título", "Conteúdo", "Data"]}
      rows={notes.map((n) => [
        n.patient.name,
        n.title,
        n.content,
        formatDateTime(n.createdAt),
      ])}
    />
  );
}
