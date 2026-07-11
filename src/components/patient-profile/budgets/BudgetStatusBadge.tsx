"use client";

import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/budget-types";
import { BUDGET_STATUS_LABELS, budgetStatusBadge } from "@/components/budgets/shared";

export function BudgetStatusBadge({
  status,
  className,
}: {
  status: BudgetStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        budgetStatusBadge(status),
        className
      )}
    >
      {BUDGET_STATUS_LABELS[status]}
    </span>
  );
}
