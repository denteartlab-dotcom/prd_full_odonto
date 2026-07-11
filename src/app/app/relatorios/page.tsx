import { Card, PageHeader, StatCard } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { money } from "@/lib/utils";

export default async function RelatoriosPage() {
  const session = await getSession();
  if (!session) return null;
  const clinicId = session.clinicId;

  const [patients, budgets, received, appointments] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.budget.aggregate({ where: { clinicId }, _sum: { total: true } }),
    prisma.receivable.aggregate({
      where: { clinicId, status: "pago" },
      _sum: { amount: true },
    }),
    prisma.appointment.count({ where: { clinicId } }),
  ]);

  return (
    <div>
      <PageHeader title="Relatórios" description="Indicadores operacionais (modules/reports)." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pacientes" value={String(patients)} />
        <StatCard label="Consultas" value={String(appointments)} />
        <StatCard label="Orçamentos" value={money(budgets._sum.total || 0)} />
        <StatCard label="Recebido" value={money(received._sum.amount || 0)} />
      </div>
      <Card title="Relatórios disponíveis">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Produção clínica por profissional</li>
          <li>Inadimplência e títulos em atraso</li>
          <li>Conversão de orçamentos</li>
          <li>Consumo de estoque</li>
        </ul>
      </Card>
    </div>
  );
}
