"use client";

import { useEffect, useState } from "react";
import { formatConsultationDuration, getConsultationElapsedSeconds } from "@/lib/schedule-mock";

export function useConsultationTimer(startedAt: string | undefined) {
  const [elapsed, setElapsed] = useState(() =>
    startedAt ? getConsultationElapsedSeconds(startedAt) : 0
  );

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    setElapsed(getConsultationElapsedSeconds(startedAt));
    const id = window.setInterval(() => {
      setElapsed(getConsultationElapsedSeconds(startedAt));
    }, 1000);

    return () => window.clearInterval(id);
  }, [startedAt]);

  return {
    elapsedSeconds: elapsed,
    formatted: formatConsultationDuration(elapsed),
  };
}
