"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard } from "./shared";

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; className: string; description: string }
> = {
  baixo: {
    label: "Risco baixo — ASA I",
    className: "border-emerald-200 bg-emerald-50",
    description: "Paciente sem comorbidades significativas para procedimentos odontológicos.",
  },
  medio: {
    label: "Risco médio — ASA II",
    className: "border-amber-200 bg-amber-50",
    description: "Requer atenção especial e monitoramento durante o atendimento.",
  },
  alto: {
    label: "Risco alto — ASA III+",
    className: "border-red-200 bg-red-50",
    description: "Avaliação médica prévia recomendada antes de procedimentos invasivos.",
  },
};

export function RiskClassificationCard({
  level,
  notes,
  onChangeLevel,
  onChangeNotes,
}: {
  level: RiskLevel;
  notes: string;
  onChangeLevel: (l: RiskLevel) => void;
  onChangeNotes: (n: string) => void;
}) {
  const risk = RISK_CONFIG[level];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["baixo", "medio", "alto"] as RiskLevel[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChangeLevel(l)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold capitalize transition",
              level === l
                ? l === "baixo"
                  ? "bg-emerald-600 text-white"
                  : l === "medio"
                    ? "bg-amber-500 text-white"
                    : "bg-red-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {l === "baixo" ? "Baixo" : l === "medio" ? "Médio" : "Alto"}
          </button>
        ))}
      </div>
      <div className={cn("rounded-xl border p-4", risk.className)}>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600" />
          <p className="font-semibold text-slate-900">{risk.label}</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">{notes || risk.description}</p>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        placeholder="Observações sobre a classificação de risco..."
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
      />
    </div>
  );
}

export function RiskSection({
  data,
  onChange,
}: {
  data: { level: RiskLevel; notes: string };
  onChange: (patch: { level?: RiskLevel; notes?: string }) => void;
}) {
  return (
    <AnamnesisSectionCard id="riscos" title="Riscos" number={11}>
      <RiskClassificationCard
        level={data.level}
        notes={data.notes}
        onChangeLevel={(level) => onChange({ level })}
        onChangeNotes={(notes) => onChange({ notes })}
      />
    </AnamnesisSectionCard>
  );
}

export { RISK_CONFIG };
