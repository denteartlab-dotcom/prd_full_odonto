import { AlertTriangle, Bell, Package, Receipt } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

const toneStyles = {
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-700",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-violet-50 text-violet-700",
};

const icons = [Receipt, AlertTriangle, Package, Bell];

export function AlertsCard({
  items,
}: {
  items: { id: string; text: string; tone: keyof typeof toneStyles }[];
}) {
  return (
    <DashboardCard title="Alertas e tarefas">
      <div className="space-y-2.5">
        {items.map((item, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  toneStyles[item.tone]
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="pt-1 text-sm font-medium text-slate-700">{item.text}</p>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
