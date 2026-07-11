import { statusMeta, type AppointmentStatus } from "@/lib/schedule-mock";

export function StatusLegend() {
  const items = Object.entries(statusMeta) as [
    AppointmentStatus,
    (typeof statusMeta)[AppointmentStatus],
  ][];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Legenda de status</h3>
      <ul className="space-y-2">
        {items.map(([key, meta]) => (
          <li key={key} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
