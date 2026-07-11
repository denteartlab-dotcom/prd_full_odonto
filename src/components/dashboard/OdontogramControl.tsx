import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

const statusColor = {
  saudavel: "bg-emerald-400",
  concluido: "bg-blue-500",
  andamento: "bg-orange-400",
  indicado: "bg-red-500",
};

function ToothRow({ statuses }: { statuses: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {statuses.map((status, i) => (
        <div
          key={`${status}-${i}`}
          className={cn(
            "h-7 w-4 rounded-sm shadow-sm ring-1 ring-black/5 sm:h-8 sm:w-5",
            statusColor[status as keyof typeof statusColor] || "bg-slate-300"
          )}
          title={`Dente ${i + 1}: ${status}`}
        />
      ))}
    </div>
  );
}

export function OdontogramControl({
  stats,
  upper,
  lower,
}: {
  stats: { label: string; value: number }[];
  upper: string[];
  lower: string[];
}) {
  return (
    <DashboardCard title="Controle Odonto">
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-slate-900">{s.value}</p>
            <p className="text-[10px] font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white px-3 py-5">
        <ToothRow statuses={upper} />
        <div className="my-3 border-t border-dashed border-slate-200" />
        <ToothRow statuses={lower} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Saudável
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Concluído
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" /> Em andamento
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Indicado
        </span>
      </div>
    </DashboardCard>
  );
}
