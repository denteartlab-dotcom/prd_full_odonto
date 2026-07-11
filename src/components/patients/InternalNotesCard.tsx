"use client";

import { FormSectionCard, FormTextarea } from "./FormField";

export function InternalNotesCard({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormSectionCard title="Observações internas">
      <FormTextarea
        label="Notas da equipe"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Visível apenas para a equipe da clínica..."
        className="min-h-[120px]"
      />
    </FormSectionCard>
  );
}
