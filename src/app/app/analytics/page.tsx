import { Card, PageHeader, StatCard } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) return null;
  const clinicId = session.clinicId;

  const [patients, openAppts, treatments] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.appointment.count({ where: { clinicId, status: "agendado" } }),
    prisma.treatment.count({ where: { clinicId, status: "em_andamento" } }),
  ]);

  return (
    <div>
      <PageHeader title="Analytics" description="Métricas em tempo real (modules/analytics)." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Base de pacientes" value={String(patients)} />
        <StatCard label="Agenda aberta" value={String(openAppts)} />
        <StatCard label="Tratamentos ativos" value={String(treatments)} />
      </div>
      <Card title="Insights">
        <p className="text-sm text-slate-600">
          Painel analítico para taxa de ocupação da agenda, ticket médio e retenção de pacientes.
        </p>
      </Card>
    </div>
  );
}
