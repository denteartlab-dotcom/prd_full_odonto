"use client";

import { MiniCalendar } from "../MiniCalendar";

export function CalendarPopover({
  open,
  selectedDate,
  onSelect,
  onClose,
}: {
  open: boolean;
  selectedDate: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} aria-hidden />
      <div className="absolute right-14 top-full z-[65] mt-1 w-[280px] shadow-xl">
        <MiniCalendar
          selectedDate={selectedDate}
          onSelect={(iso) => {
            onSelect(iso);
            onClose();
          }}
        />
      </div>
    </>
  );
}
