"use client";

import type { PatientHistoryEventFull } from "@/lib/patient-history-types";
import { HISTORY_GROUP_LABELS, type HistoryTimeGroup } from "@/lib/patient-history-types";
import { HistoryEventCard } from "./HistoryEventCard";
import { HISTORY_TYPE_META } from "./shared";

export function HistoryTimeline({
  groups,
  onView,
  onEdit,
  onPrint,
  onDuplicate,
}: {
  groups: { group: HistoryTimeGroup; events: PatientHistoryEventFull[] }[];
  onView: (event: PatientHistoryEventFull) => void;
  onEdit: (event: PatientHistoryEventFull) => void;
  onPrint: (event: PatientHistoryEventFull) => void;
  onDuplicate: (event: PatientHistoryEventFull) => void;
}) {
  return (
    <div className="space-y-8">
      {groups.map(({ group, events }) => (
        <section key={group}>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {HISTORY_GROUP_LABELS[group]}
            </h3>
            <div className="h-px flex-1 bg-slate-100" />
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {events.length}
            </span>
          </div>

          <ol className="relative space-y-4 pl-2 sm:pl-4">
            <span
              aria-hidden
              className="absolute bottom-3 left-[22px] top-3 w-px bg-gradient-to-b from-indigo-300 via-slate-200 to-transparent sm:left-[26px]"
            />
            {events.map((event) => {
              const meta = HISTORY_TYPE_META[event.type];
              return (
                <li key={event.id} className="relative pl-10 sm:pl-12">
                  <span
                    className={`absolute left-[14px] top-5 h-3.5 w-3.5 rounded-full ring-4 ring-white sm:left-[18px] ${meta.line}`}
                  />
                  <HistoryEventCard
                    event={event}
                    onView={() => onView(event)}
                    onEdit={() => onEdit(event)}
                    onPrint={() => onPrint(event)}
                    onDuplicate={() => onDuplicate(event)}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
