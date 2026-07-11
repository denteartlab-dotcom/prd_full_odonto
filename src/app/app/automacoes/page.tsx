import { Card, PageHeader, Badge } from "@/components/ui";

const AUTOMATIONS = [
  { name: "Lembrete de consulta (WhatsApp/SMS)", status: "planejado" },
  { name: "Cobrança automática de títulos vencidos", status: "planejado" },
  { name: "Alerta de estoque mínimo", status: "ativo" },
  { name: "Aniversariantes do mês", status: "planejado" },
];

export default function AutomacoesPage() {
  return (
    <div>
      <PageHeader title="Automações" description="Fluxos automáticos (modules/automations)." />
      <Card title="Regras">
        <div className="space-y-2">
          {AUTOMATIONS.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <span>{a.name}</span>
              <Badge tone={a.status === "ativo" ? "green" : "slate"}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
