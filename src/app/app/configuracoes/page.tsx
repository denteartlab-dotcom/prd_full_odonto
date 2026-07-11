import { Card, PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session) return null;

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    include: { settings: true },
  });

  return (
    <div>
      <PageHeader title="Configurações" description="Dados da clínica (modules/settings)." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Clínica">
          <dl className="space-y-2 text-sm">
            <div><span className="text-slate-500">Nome:</span> {clinic?.name}</div>
            <div><span className="text-slate-500">Slug:</span> {clinic?.slug}</div>
            <div><span className="text-slate-500">Telefone:</span> {clinic?.phone || "—"}</div>
            <div><span className="text-slate-500">E-mail:</span> {clinic?.email || "—"}</div>
            <div><span className="text-slate-500">Endereço:</span> {clinic?.address || "—"}</div>
          </dl>
        </Card>
        <Card title="Agenda">
          <dl className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Duração padrão:</span>{" "}
              {clinic?.settings?.appointmentMins ?? 30} min
            </div>
            <div>
              <span className="text-slate-500">Expediente:</span>{" "}
              {clinic?.settings?.workStart} – {clinic?.settings?.workEnd}
            </div>
            <div>
              <span className="text-slate-500">Fuso:</span> {clinic?.settings?.timezone}
            </div>
            <div>
              <span className="text-slate-500">Moeda:</span> {clinic?.settings?.currency}
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
