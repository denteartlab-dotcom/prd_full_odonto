import { statusMeta, type ScheduleAppointment } from "@/lib/schedule-mock";

export function UpcomingAppointments({
  items,
}: {
  items: ScheduleAppointment[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(15_23_42/0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Próximos agendamentos</h3>
        <button type="button" className="text-xs font-semibold text-indigo-600">
          Ver todos
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum agendamento restante hoje.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
            >
              <div className="w-12 shrink-0 text-xs font-semibold text-slate-700">
                {item.start}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-[10px] font-bold text-white">
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{item.patient}</p>
                <p className="truncate text-[11px] text-slate-500">{item.procedure}</p>
              </div>
              <span className={`h-2 w-2 shrink-0 rounded-full ${statusMeta[item.status].dot}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
