import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

export function ReceivablesTable({
  items,
}: {
  items: {
    id: string;
    patient: string;
    initials: string;
    date: string;
    amount: string;
    status: "a_vencer" | "atrasado";
  }[];
}) {
  return (
    <DashboardCard
      title="Contas a receber"
      action={<span className="text-xs font-medium text-indigo-600">Ver todas</span>}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-3 font-medium">Paciente</th>
              <th className="pb-3 font-medium">Data</th>
              <th className="pb-3 font-medium">Valor</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-50">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                      {item.initials}
                    </span>
                    <span className="font-medium text-slate-800">{item.patient}</span>
                  </div>
                </td>
                <td className="py-3 text-slate-500">{item.date}</td>
                <td className="py-3 font-semibold text-slate-800">{item.amount}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      item.status === "atrasado"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {item.status === "atrasado" ? "Atrasado" : "A vencer"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
