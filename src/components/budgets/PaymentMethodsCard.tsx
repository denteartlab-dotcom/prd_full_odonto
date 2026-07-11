"use client";

import {
  Banknote,
  CreditCard,
  Landmark,
  QrCode,
  Receipt,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethodType } from "@/lib/budget-types";
import { PAYMENT_METHOD_LABELS } from "@/lib/budget-mock";
import { SectionCard } from "./shared";

const METHODS: { type: PaymentMethodType; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "pix", icon: QrCode },
  { type: "cartao", icon: CreditCard },
  { type: "dinheiro", icon: Banknote },
  { type: "transferencia", icon: Landmark },
  { type: "boleto", icon: Receipt },
  { type: "asaas", icon: Wallet },
];

export function PaymentMethodsCard({
  selected,
  editable,
  onChange,
}: {
  selected: PaymentMethodType;
  editable?: boolean;
  onChange?: (method: PaymentMethodType) => void;
}) {
  return (
    <SectionCard title="Forma de pagamento">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {METHODS.map(({ type, icon: Icon }) => (
          <button
            key={type}
            type="button"
            disabled={!editable}
            onClick={() => onChange?.(type)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
              selected === type
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600",
              editable && selected !== type && "hover:border-slate-300",
              !editable && "cursor-default"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {PAYMENT_METHOD_LABELS[type]}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
