import { ModulePlaceholder, formatDateTime, Badge } from "@/lib/module-pages";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DocumentosPage() {
  const session = await getSession();
  if (!session) return null;
  const items = await prisma.document.findMany({
    where: { clinicId: session.clinicId },
    include: { patient: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ModulePlaceholder
      title="Documentos"
      moduleId="documents"
      description="Termos, atestados e arquivos clínicos"
      columns={["Título", "Tipo", "Paciente", "Data"]}
      rows={items.map((i) => [
        i.title,
        <Badge key={i.id}>{i.type}</Badge>,
        i.patient?.name || "—",
        formatDateTime(i.createdAt),
      ])}
    />
  );
}
