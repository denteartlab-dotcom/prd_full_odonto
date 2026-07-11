"use client";

import { PenLine } from "lucide-react";
import type { BudgetSignature } from "@/lib/budget-types";
import { formatDateTime } from "@/lib/utils";
import { FieldLabel, SectionCard } from "./shared";

export function BudgetSignature({
  signature,
  editable,
  onChange,
}: {
  signature: BudgetSignature;
  editable?: boolean;
  onChange?: (patch: Partial<BudgetSignature>) => void;
}) {
  return (
    <SectionCard title="Assinatura">
      <div className="space-y-4">
        <div className="flex min-h-[100px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          {signature.agreed ? (
            <div className="text-center">
              <PenLine className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 font-serif text-2xl italic text-slate-700">
                {signature.signerName ?? "Paciente"}
              </p>
              {signature.signedAt && (
                <p className="mt-1 text-xs text-slate-400">
                  Assinado em {formatDateTime(signature.signedAt)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aguardando assinatura do paciente</p>
          )}
        </div>

        {editable && onChange && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
            <input
              type="checkbox"
              checked={signature.agreed}
              onChange={(e) =>
                onChange({
                  agreed: e.target.checked,
                  signedAt: e.target.checked ? new Date().toISOString() : undefined,
                  signerName: e.target.checked ? "Paciente" : undefined,
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Paciente aprovou orçamento
            </span>
          </label>
        )}

        {!editable && signature.agreed && (
          <div>
            <FieldLabel>Data da aprovação</FieldLabel>
            <p className="text-sm text-slate-700">
              {signature.signedAt ? formatDateTime(signature.signedAt) : "—"}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
