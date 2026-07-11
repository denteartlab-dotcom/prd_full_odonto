"use client";

import type { DentalAnamnesis } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FormField, FormInput, PainScaleSlider } from "./shared";
import { cn } from "@/lib/utils";
import type { PainType } from "@/lib/anamnesis-types";

const PAIN_TYPES: { value: PainType; label: string }[] = [
  { value: "latejante", label: "Latejante" },
  { value: "pulsatil", label: "Pulsátil" },
  { value: "continua", label: "Contínua" },
  { value: "aguda", label: "Aguda" },
  { value: "cronica", label: "Crônica" },
];

export function PainAssessmentCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["painAssessment"];
  onChange: (patch: Partial<DentalAnamnesis["painAssessment"]>) => void;
}) {
  return (
    <AnamnesisSectionCard id="avaliacao-dor" title="Avaliação da Dor" number={10}>
      <PainScaleSlider
        label="Escala de dor (0 a 10)"
        value={data.escala}
        onChange={(escala) => onChange({ escala })}
      />
      <div className="mt-4">
        <FormField label="Local da dor">
          <FormInput value={data.local} onChange={(v) => onChange({ local: v })} placeholder="Ex: Dente 46, região mandibular..." />
        </FormField>
      </div>
      <div className="mt-4">
        <FormField label="Tipo de dor">
          <div className="flex flex-wrap gap-2">
            {PAIN_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ tipo: t.value })}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  data.tipo === t.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}

export function ObservationsSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <AnamnesisSectionCard id="observacoes" title="Observações" number={12}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Observações adicionais sobre o paciente, condutas, alertas clínicos..."
        rows={8}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
      />
    </AnamnesisSectionCard>
  );
}
