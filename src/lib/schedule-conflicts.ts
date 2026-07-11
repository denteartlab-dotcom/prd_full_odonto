import { timeToMinutes, type ScheduleAppointment } from "./schedule-mock";

export type ScheduleSlot = {
  professionalId: string;
  date: string;
  start: string;
  end: string;
  excludeId?: string;
};

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && endA > startB;
}

export function findScheduleConflicts(
  appointments: ScheduleAppointment[],
  slot: ScheduleSlot
): ScheduleAppointment[] {
  const start = timeToMinutes(slot.start);
  const end = timeToMinutes(slot.end);

  return appointments.filter((a) => {
    if (slot.excludeId && a.id === slot.excludeId) return false;
    if (a.professionalId !== slot.professionalId || a.date !== slot.date) return false;
    if (a.status === "cancelado") return false;
    const aStart = timeToMinutes(a.start);
    const aEnd = timeToMinutes(a.end);
    return overlaps(start, end, aStart, aEnd);
  });
}

export function hasScheduleConflict(
  appointments: ScheduleAppointment[],
  slot: ScheduleSlot
): boolean {
  return findScheduleConflicts(appointments, slot).length > 0;
}

export function conflictMessage(conflicts: ScheduleAppointment[]): string {
  if (conflicts.length === 0) return "";
  const first = conflicts[0];
  const others =
    conflicts.length > 1 ? ` (+${conflicts.length - 1} outro${conflicts.length > 2 ? "s" : ""})` : "";
  return `Horário ocupado por ${first.patient}${others}. Reagende o paciente existente antes.`;
}
