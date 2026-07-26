"use client";

import { cn, money } from "@/lib/utils";
import type { CashflowPoint, FinanceStatus, PaymentMethodShare } from "@/lib/financeiro-geral-types";

export function SoftCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title ? (
              <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatusPill({ status }: { status: FinanceStatus }) {
  const map: Record<FinanceStatus, { label: string; className: string }> = {
    pago: { label: "Pago", className: "bg-emerald-50 text-emerald-700" },
    pendente: { label: "Pendente", className: "bg-amber-50 text-amber-700" },
    a_vencer: { label: "A vencer", className: "bg-sky-50 text-sky-700" },
    em_atraso: { label: "Em atraso", className: "bg-rose-50 text-rose-700" },
    cancelado: { label: "Cancelado", className: "bg-slate-100 text-slate-600" },
  };
  const item = map[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}

export function Sparkline({
  values,
  color = "#10b981",
  fill = "rgba(16,185,129,0.12)",
}: {
  values: number[];
  color?: string;
  fill?: string;
}) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-28" aria-hidden>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={fill} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LineCashflowChart({
  data,
}: {
  data: CashflowPoint[];
}) {
  const w = 640;
  const h = 220;
  const pad = 28;
  const max = Math.max(
    ...data.flatMap((d) => [d.receitas, d.despesas, d.lucro]),
    1
  );

  function path(key: keyof Pick<CashflowPoint, "receitas" | "despesas" | "lucro">) {
    return data
      .map((d, i) => {
        const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - (d[key] / max) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full min-w-[480px]">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = h - pad - t * (h - pad * 2);
          return (
            <line
              key={t}
              x1={pad}
              x2={w - pad}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={path("receitas")} fill="none" stroke="#10b981" strokeWidth="2.5" />
        <path d={path("despesas")} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
        <path d={path("lucro")} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        {data.map((d, i) => {
          const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
          return (
            <text
              key={d.label}
              x={x}
              y={h - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
        <LegendDot color="#10b981" label="Receitas" />
        <LegendDot color="#f43f5e" label="Despesas" />
        <LegendDot color="#2563eb" label="Lucro" />
      </div>
    </div>
  );
}

export function GroupedBarChart({
  data,
}: {
  data: { label: string; receitas: number; despesas: number }[];
}) {
  const max = Math.max(...data.flatMap((d) => [d.receitas, d.despesas]), 1);
  return (
    <div className="space-y-3">
      <div className="flex h-52 items-end gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-1">
              <div
                className="w-[42%] max-w-[22px] rounded-t-md bg-emerald-500"
                style={{ height: `${(d.receitas / max) * 100}%` }}
                title={`Receitas: ${money(d.receitas)}`}
              />
              <div
                className="w-[42%] max-w-[22px] rounded-t-md bg-rose-400"
                style={{ height: `${(d.despesas / max) * 100}%` }}
                title={`Despesas: ${money(d.despesas)}`}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-slate-600">
        <LegendDot color="#10b981" label="Receitas" />
        <LegendDot color="#fb7185" label="Despesas" />
      </div>
    </div>
  );
}

export function PaymentDonut({ items }: { items: PaymentMethodShare[] }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {items.map((item) => {
            const length = (item.percent / 100) * circumference;
            const el = (
              <circle
                key={item.name}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-slate-900">100%</span>
          <span className="text-[10px] uppercase text-slate-400">mix</span>
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function FinanceSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-80 rounded-xl bg-slate-200" />
      <div className="h-12 rounded-2xl bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="h-[520px] rounded-2xl bg-slate-100" />
        <div className="h-[520px] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
