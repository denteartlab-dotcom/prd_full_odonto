"use client";

import type { DentalAnamnesis } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FieldGrid, FormField, FormInput, FormTextarea } from "./shared";

function computeImc(peso: string, altura: string) {
  const p = parseFloat(peso.replace(",", "."));
  const a = parseFloat(altura.replace(",", ".")) / 100;
  if (p > 0 && a > 0) return (p / (a * a)).toFixed(1);
  return "";
}

export function ClinicalExamCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["clinicalExam"];
  onChange: (patch: Partial<DentalAnamnesis["clinicalExam"]>) => void;
}) {
  const handlePeso = (peso: string) => onChange({ peso, imc: computeImc(peso, data.altura) });
  const handleAltura = (altura: string) => onChange({ altura, imc: computeImc(data.peso, altura) });

  return (
    <AnamnesisSectionCard id="exame-clinico" title="Exame Clínico" number={9}>
      <FieldGrid cols={3}>
        <FormField label="Pressão arterial">
          <FormInput value={data.pressaoArterial} onChange={(v) => onChange({ pressaoArterial: v })} placeholder="120/80" />
        </FormField>
        <FormField label="Temperatura">
          <FormInput value={data.temperatura} onChange={(v) => onChange({ temperatura: v })} placeholder="36.5°C" />
        </FormField>
        <FormField label="Frequência cardíaca">
          <FormInput value={data.frequenciaCardiaca} onChange={(v) => onChange({ frequenciaCardiaca: v })} placeholder="72 bpm" />
        </FormField>
        <FormField label="Peso (kg)">
          <FormInput value={data.peso} onChange={handlePeso} />
        </FormField>
        <FormField label="Altura (cm)">
          <FormInput value={data.altura} onChange={handleAltura} />
        </FormField>
        <FormField label="IMC">
          <FormInput value={data.imc} onChange={() => {}} readOnly className="bg-slate-100" />
        </FormField>
      </FieldGrid>
      <div className="mt-4 space-y-4">
        <FormField label="Exame extraoral">
          <FormTextarea value={data.exameExtraoral} onChange={(v) => onChange({ exameExtraoral: v })} rows={2} />
        </FormField>
        <FormField label="Exame intraoral">
          <FormTextarea value={data.exameIntraoral} onChange={(v) => onChange({ exameIntraoral: v })} rows={2} />
        </FormField>
        <FieldGrid cols={2}>
          <FormField label="ATM">
            <FormInput value={data.atm} onChange={(v) => onChange({ atm: v })} />
          </FormField>
          <FormField label="Linfonodos">
            <FormInput value={data.linfonodos} onChange={(v) => onChange({ linfonodos: v })} />
          </FormField>
          <FormField label="Mucosa">
            <FormInput value={data.mucosa} onChange={(v) => onChange({ mucosa: v })} />
          </FormField>
          <FormField label="Língua">
            <FormInput value={data.lingua} onChange={(v) => onChange({ lingua: v })} />
          </FormField>
          <FormField label="Palato">
            <FormInput value={data.palato} onChange={(v) => onChange({ palato: v })} />
          </FormField>
          <FormField label="Lábios">
            <FormInput value={data.labios} onChange={(v) => onChange({ labios: v })} />
          </FormField>
        </FieldGrid>
      </div>
    </AnamnesisSectionCard>
  );
}
