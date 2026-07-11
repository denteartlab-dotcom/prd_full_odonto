"use client";

import type { DentalAnamnesis, TriState } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FieldGrid, FormField, FormInput, FormTextarea, TriStateQuestionGrid } from "./shared";

const DENTAL_QUESTIONS: { id: keyof Pick<DentalAnamnesis["dentalHistory"], "fezCanal" | "fezImplante" | "usouAparelho" | "sensibilidade" | "sangramentoGengival" | "usaFioDental" | "medoDentista" | "reacaoAnestesia">; label: string }[] = [
  { id: "fezCanal", label: "Já fez canal?" },
  { id: "fezImplante", label: "Já fez implante?" },
  { id: "usouAparelho", label: "Já usou aparelho?" },
  { id: "sensibilidade", label: "Tem sensibilidade?" },
  { id: "sangramentoGengival", label: "Sangramento gengival?" },
  { id: "usaFioDental", label: "Usa fio dental?" },
  { id: "medoDentista", label: "Tem medo de dentista?" },
  { id: "reacaoAnestesia", label: "Já teve reação à anestesia?" },
];

export function DentalHistoryCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["dentalHistory"];
  onChange: (patch: Partial<DentalAnamnesis["dentalHistory"]>) => void;
}) {
  const setAnswer = (id: string, value: TriState) => {
    onChange({ [id]: value } as Partial<DentalAnamnesis["dentalHistory"]>);
  };

  const questionValues = Object.fromEntries(DENTAL_QUESTIONS.map((q) => [q.id, data[q.id]]));

  return (
    <AnamnesisSectionCard id="historia-odontologica" title="História Odontológica" number={8}>
      <FieldGrid cols={2}>
        <FormField label="Última consulta">
          <FormInput type="date" value={data.ultimaConsulta} onChange={(v) => onChange({ ultimaConsulta: v })} />
        </FormField>
        <FormField label="Última radiografia">
          <FormInput type="date" value={data.ultimaRadiografia} onChange={(v) => onChange({ ultimaRadiografia: v })} />
        </FormField>
      </FieldGrid>

      <div className="mt-4">
        <TriStateQuestionGrid questions={DENTAL_QUESTIONS} values={questionValues} onChange={setAnswer} />
      </div>

      <div className="mt-4">
        <FormField label="Escova quantas vezes ao dia?">
          <FormInput value={data.escovacoesDia} onChange={(v) => onChange({ escovacoesDia: v })} />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField label="Observações">
          <FormTextarea value={data.observacoes} onChange={(v) => onChange({ observacoes: v })} />
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}
