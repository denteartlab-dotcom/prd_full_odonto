import { DashboardCard } from "./DashboardCard";

export function BarChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Sem faturamento registrado nos últimos 6 meses.
      </div>
    );
  }

  return (
    <div className="flex h-48 items-end justify-between gap-2 px-1 pt-4">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-36 w-full items-end justify-center">
            <div
              className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-400 shadow-sm"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
              title={`${d.month}: ${d.value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}`}
            />
          </div>
          <span className="text-[11px] font-medium text-slate-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  items,
  total,
}: {
  items: { name: string; percent: number; color: string }[];
  total: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!items.length || total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Sem procedimentos registrados ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {items.map((item) => {
            const length = (item.percent / 100) * circumference;
            const dash = `${length} ${circumference - length}`;
            const el = (
              <circle
                key={item.name}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += length;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">{total}</span>
          <span className="text-[10px] font-medium uppercase text-slate-400">total</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold text-slate-800">{item.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DashboardCard title={title} className={className}>
      {children}
    </DashboardCard>
  );
}
