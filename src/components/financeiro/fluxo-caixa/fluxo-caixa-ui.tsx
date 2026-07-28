"use client";

import { cn, money } from "@/lib/utils";
import type {
  CashMovementStatus,
  CashMovementType,
  CashflowSeriesPoint,
  CashProjectionPoint,
} from "@/lib/fluxo-caixa-types";

export function CombinedCashflowChart({ data }: { data: CashflowSeriesPoint[] }) {
  const w = 680;
  const h = 240;
  const pad = 32;
  const max = Math.max(...data.flatMap((d) => [d.entradas, d.saidas, Math.abs(d.saldo)]), 1);
  const barGroupWidth = (w - pad * 2) / Math.max(data.length, 1);
  const barWidth = Math.min(18, barGroupWidth * 0.28);

  const saldoPath = data
    .map((d, i) => {
      const x = pad + i * barGroupWidth + barGroupWidth / 2;
      const y = h - pad - (d.saldo / (max * 1.15)) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-60 w-full min-w-[520px]">
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
        {data.map((d, i) => {
          const cx = pad + i * barGroupWidth + barGroupWidth / 2;
          const hIn = (d.entradas / max) * (h - pad * 2);
          const hOut = (d.saidas / max) * (h - pad * 2);
          return (
            <g key={d.label}>
              <rect
                x={cx - barWidth - 2}
                y={h - pad - hIn}
                width={barWidth}
                height={hIn}
                rx={4}
                fill="#10b981"
              />
              <rect
                x={cx + 2}
                y={h - pad - hOut}
                width={barWidth}
                height={hOut}
                rx={4}
                fill="#f43f5e"
              />
              <text
                x={cx}
                y={h - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}
        <path d={saldoPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        {data.map((d, i) => {
          const x = pad + i * barGroupWidth + barGroupWidth / 2;
          const y = h - pad - (d.saldo / (max * 1.15)) * (h - pad * 2);
          return <circle key={`p-${d.label}`} cx={x} cy={y} r={3.5} fill="#2563eb" />;
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
        <LegendDot color="#10b981" label="Entradas" />
        <LegendDot color="#f43f5e" label="Saídas" />
        <LegendDot color="#2563eb" label="Saldo" />
      </div>
    </div>
  );
}

export function ProjectedFlowChart({ data }: { data: CashProjectionPoint[] }) {
  if (!data.length) return null;
  const w = 280;
  const h = 88;
  const pad = 12;
  const values = data.map((d) => d.saldo);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
      const y = h - pad - ((d.saldo - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full">
        <polygon points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`} fill="rgba(37,99,235,0.12)" />
        <polyline
          points={points}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
        <span>{data[0]?.label}</span>
        <span>{money(values[values.length - 1] || 0)}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function CashStatusPill({ status }: { status: CashMovementStatus }) {
  const map: Record<CashMovementStatus, { label: string; className: string }> = {
    confirmado: { label: "Confirmado", className: "bg-emerald-50 text-emerald-700" },
    pendente: { label: "Pendente", className: "bg-amber-50 text-amber-700" },
    cancelado: { label: "Cancelado", className: "bg-slate-100 text-slate-600" },
    agendado: { label: "Agendado", className: "bg-sky-50 text-sky-700" },
    conciliado: { label: "Conciliado", className: "bg-violet-50 text-violet-700" },
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

export function CashTypePill({ type }: { type: CashMovementType }) {
  const map: Record<CashMovementType, { label: string; className: string }> = {
    entrada: { label: "Entrada", className: "bg-emerald-50 text-emerald-700" },
    saida: { label: "Saída", className: "bg-rose-50 text-rose-700" },
    transferencia: { label: "Transferência", className: "bg-sky-50 text-sky-700" },
  };
  const item = map[type];
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
