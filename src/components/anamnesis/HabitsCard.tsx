"use client";

import type { DentalAnamnesis, TriState } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FieldGrid, FormField, FormInput, FormSelect, TriStateQuestionGrid } from "./shared";

const HABIT_QUESTIONS: { id: keyof Pick<DentalAnamnesis["habits"], "fuma" | "bebeAlcool" | "usaDrogas" | "bruxismo" | "respiraBoca" | "ronca" | "apneia" | "praticaEsportes">; label: string }[] = [
  { id: "fuma", label: "Fuma?" },
  { id: "bebeAlcool", label: "Bebe álcool?" },
  { id: "usaDrogas", label: "Usa drogas?" },
  { id: "bruxismo", label: "Bruxismo?" },
  { id: "respiraBoca", label: "Respira pela boca?" },
  { id: "ronca", label: "Ronca?" },
  { id: "apneia", label: "Apneia?" },
  { id: "praticaEsportes", label: "Pratica esportes?" },
];

export function HabitsCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["habits"];
  onChange: (patch: Partial<DentalAnamnesis["habits"]>) => void;
}) {
  const setHabit = (id: string, value: TriState) => {
    onChange({ [id]: value } as Partial<DentalAnamnesis["habits"]>);
  };

  const habitValues = Object.fromEntries(HABIT_QUESTIONS.map((q) => [q.id, data[q.id]]));

  return (
    <AnamnesisSectionCard id="habitos" title="Hábitos" number={4}>
      <TriStateQuestionGrid questions={HABIT_QUESTIONS} values={habitValues} onChange={setHabit} />

      <div className="mt-4 space-y-4">
        {data.fuma === "sim" && (
          <FormField label="Quantos cigarros por dia?">
            <FormInput value={data.cigarrosPorDia} onChange={(v) => onChange({ cigarrosPorDia: v })} />
          </FormField>
        )}
        {data.bebeAlcool === "sim" && (
          <FormField label="Frequência do álcool">
            <FormInput value={data.frequenciaAlcool} onChange={(v) => onChange({ frequenciaAlcool: v })} />
          </FormField>
        )}
        <FormField label="Qualidade do sono">
          <FormSelect
            value={data.qualidadeSono}
            onChange={(v) => onChange({ qualidadeSono: v })}
            options={[
              { value: "Excelente", label: "Excelente" },
              { value: "Boa", label: "Boa" },
              { value: "Regular", label: "Regular" },
              { value: "Ruim", label: "Ruim" },
            ]}
          />
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}
