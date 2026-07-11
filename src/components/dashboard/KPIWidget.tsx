import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./DashboardCard";

const tones = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    line: "#3b82f6",
    fill: "rgba(59,130,246,0.12)",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    line: "#10b981",
    fill: "rgba(16,185,129,0.12)",
  },
  purple: {
    icon: "bg-violet-50 text-violet-600",
    line: "#8b5cf6",
    fill: "rgba(139,92,246,0.12)",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    line: "#f97316",
    fill: "rgba(249,115,22,0.12)",
  },
};

function Sparkline({
  values,
  line,
  fill,
}: {
  values: number[];
  line: string;
  fill: string;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-28" aria-hidden>
      <polygon points={area} fill={fill} />
      <polyline
        points={points}
        fill="none"
        stroke={line}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KPIWidget({
  label,
  value,
  growth,
  tone,
  sparkline,
  icon: Icon,
}: {
  label: string;
  value: string;
  growth: number;
  tone: keyof typeof tones;
  sparkline: number[];
  icon: LucideIcon;
}) {
  const t = tones[tone];

  return (
    <DashboardCard bodyClassName="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", t.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <Sparkline values={sparkline} line={t.line} fill={t.fill} />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <TrendingUp className="h-3 w-3" />
        +{growth.toFixed(1).replace(".", ",")}% vs mês anterior
      </div>
    </DashboardCard>
  );
}
