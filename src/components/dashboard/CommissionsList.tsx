import { DashboardCard } from "./DashboardCard";

export function CommissionsList({
  items,
}: {
  items: {
    id: string;
    name: string;
    initials: string;
    billed: string;
    commission: string;
    percent: number;
  }[];
}) {
  return (
    <DashboardCard title="Comissão dos dentistas (mês)">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[11px] font-bold text-white">
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-[11px] text-slate-500">Faturado {item.billed}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-indigo-700">{item.commission}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
