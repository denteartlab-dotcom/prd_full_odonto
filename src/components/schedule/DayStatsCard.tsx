export function DayStatsCard({
  stats,
  title = "Estatísticas do dia",
}: {
  title?: string;
  stats: {
    total: number;
    confirmados: number;
    emAndamento: number;
    cancelados: number;
    aguardando: number;
    ocupacao: number;
  };
}) {
  const cards = [
    { label: "Agendamentos", value: String(stats.total) },
    { label: "Confirmados", value: String(stats.confirmados) },
    { label: "Em andamento", value: String(stats.emAndamento) },
    { label: "Cancelados", value: String(stats.cancelados) },
    { label: "Aguardando", value: String(stats.aguardando) },
    { label: "Taxa ocupação", value: `${stats.ocupacao}%` },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-slate-900">{card.value}</p>
            <p className="text-[10px] font-medium text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
