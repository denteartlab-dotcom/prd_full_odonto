import { DashboardCard } from "./DashboardCard";

export function FinancialCard({
  receitas,
  despesas,
  lucroLiquido,
  margem,
}: {
  receitas: string;
  despesas: string;
  lucroLiquido: string;
  margem: string;
}) {
  const cells = [
    { label: "Receitas", value: receitas, className: "bg-emerald-50 text-emerald-800" },
    { label: "Despesas", value: despesas, className: "bg-red-50 text-red-800" },
    { label: "Lucro líquido", value: lucroLiquido, className: "bg-blue-50 text-blue-800" },
    { label: "Margem de lucro", value: margem, className: "bg-indigo-50 text-indigo-800" },
  ];

  return (
    <DashboardCard title="Resumo financeiro">
      <div className="grid grid-cols-2 gap-3">
        {cells.map((cell) => (
          <div key={cell.label} className={`rounded-xl p-4 ${cell.className}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{cell.label}</p>
            <p className="mt-2 text-lg font-semibold tracking-tight">{cell.value}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
