import { Activity, CalendarDays, Receipt, UserPlus, Smile } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

const typeIcon = {
  orcamento: Receipt,
  agenda: CalendarDays,
  financeiro: Receipt,
  paciente: UserPlus,
  clinico: Smile,
};

export function RecentActivity({
  items,
}: {
  items: { id: string; text: string; time: string; type: string }[];
}) {
  return (
    <DashboardCard title="Atividades recentes">
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = typeIcon[item.type as keyof typeof typeIcon] || Activity;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{item.text}</p>
                <p className="text-[11px] text-slate-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
