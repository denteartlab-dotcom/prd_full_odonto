"use client";

import type { DentalAnamnesis, TriState } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FormField, FormTextarea, TagInput, TriStateQuestionRow } from "./shared";

export function AllergiesCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["allergies"];
  onChange: (patch: Partial<DentalAnamnesis["allergies"]>) => void;
}) {
  return (
    <AnamnesisSectionCard id="alergias" title="Alergias" number={5}>
      <TriStateQuestionRow
        label="Possui alergia?"
        value={data.possui}
        onChange={(v) => onChange({ possui: v })}
      />

      {data.possui === "sim" && (
        <div className="space-y-4">
          <FormField label="Medicamentos">
            <TagInput
              tags={data.medicamentos}
              onChange={(medicamentos) => onChange({ medicamentos })}
              placeholder="Ex: Dipirona, Penicilina..."
            />
          </FormField>
          <div className="flex flex-wrap gap-4">
            <CheckboxField label="Látex" checked={data.latex} onChange={(latex) => onChange({ latex })} />
            <CheckboxField
              label="Anestésicos"
              checked={data.anestesicos}
              onChange={(anestesicos) => onChange({ anestesicos })}
            />
          </div>
          <FormField label="Alimentos">
            <TagInput
              tags={data.alimentos}
              onChange={(alimentos) => onChange({ alimentos })}
              placeholder="Ex: Amendoim, Frutos do mar..."
            />
          </FormField>
          <FormField label="Outras">
            <FormTextarea value={data.outras} onChange={(v) => onChange({ outras: v })} rows={2} />
          </FormField>
        </div>
      )}

      <div className="mt-4">
        <FormField label="Observações">
          <FormTextarea value={data.observacoes} onChange={(v) => onChange({ observacoes: v })} />
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      {label}
    </label>
  );
}
