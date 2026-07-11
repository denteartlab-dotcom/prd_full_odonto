import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

const statusMap = {
  confirmado: "bg-emerald-50 text-emerald-700",
  em_andamento: "bg-blue-50 text-blue-700",
  pendente: "bg-orange-50 text-orange-700",
};

const statusLabel = {
  confirmado: "Confirmado",
  em_andamento: "Em andamento",
  pendente: "Pendente",
};

export function ScheduleCard({
  items,
}: {
  items: {
    id: string;
    time: string;
    patient: string;
    initials: string;
    procedure: string;
    status: keyof typeof statusMap;
  }[];
}) {
  return (
    <DashboardCard
      title="Agenda do dia"
      action={<span className="text-xs font-medium text-indigo-600">Ver todas</span>}
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
          >
            <div className="w-12 shrink-0 text-sm font-semibold text-slate-700">{item.time}</div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-[11px] font-bold text-white">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{item.patient}</p>
              <p className="truncate text-xs text-slate-500">{item.procedure}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                statusMap[item.status]
              )}
            >
              {statusLabel[item.status]}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
