"use client";

import { useEffect, useState } from "react";
import { toIsoDate } from "@/lib/schedule-mock";

export function useClientToday() {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(toIsoDate(new Date()));
  }, []);

  return today;
}
