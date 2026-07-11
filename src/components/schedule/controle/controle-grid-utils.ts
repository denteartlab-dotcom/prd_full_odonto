import {
  CONTROLE_END_HOUR,
  CONTROLE_START_HOUR,
  minutesToTime,
  timeToMinutes,
} from "@/lib/schedule-mock";

export const HOUR_HEIGHT = 72;
export const SLOT_MINUTES = 30;
export const SLOT_HEIGHT = HOUR_HEIGHT / 2;

export function apptStyle(start: string, end: string) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const top = ((startMin - CONTROLE_START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 4, 52);
  return { top, height };
}

export function durationMinutes(start: string, end: string) {
  return Math.max(SLOT_MINUTES, timeToMinutes(end) - timeToMinutes(start));
}

export function slotFromClientY(columnEl: HTMLElement, clientY: number) {
  const rect = columnEl.getBoundingClientRect();
  const y = clientY - rect.top;
  const maxSlots = ((CONTROLE_END_HOUR - CONTROLE_START_HOUR) * 60) / SLOT_MINUTES;
  const index = Math.max(0, Math.min(Math.floor(y / SLOT_HEIGHT), maxSlots - 1));
  const startMin = CONTROLE_START_HOUR * 60 + index * SLOT_MINUTES;
  return minutesToTime(startMin);
}

export function gridHeight() {
  return ((CONTROLE_END_HOUR - CONTROLE_START_HOUR) * 60) / SLOT_MINUTES * SLOT_HEIGHT;
}
