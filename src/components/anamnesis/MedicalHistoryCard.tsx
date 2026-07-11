"use client";

import type { DentalAnamnesis, TriState } from "@/lib/anamnesis-types";
import { MEDICAL_HISTORY_QUESTIONS } from "@/lib/anamnesis-types";
import {
  AnamnesisSectionCard,
  FieldGrid,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  TriStateQuestionGrid,
  TriStateQuestionRow,
} from "./shared";

export function IdentificationSection({
  data,
  onChange,
}: {
  data: DentalAnamnesis["identification"];
  onChange: (patch: Partial<DentalAnamnesis["identification"]>) => void;
}) {
  return (
    <AnamnesisSectionCard id="identificacao" title="Identificação" number={1}>
      <FieldGrid cols={3}>
        <FormField label="Nome" required>
          <FormInput value={data.nome} onChange={(v) => onChange({ nome: v })} />
        </FormField>
        <FormField label="CPF" required>
          <FormInput value={data.cpf} onChange={(v) => onChange({ cpf: v })} />
        </FormField>
        <FormField label="RG">
          <FormInput value={data.rg} onChange={(v) => onChange({ rg: v })} />
        </FormField>
        <FormField label="Sexo">
          <FormSelect
            value={data.sexo}
            onChange={(v) => onChange({ sexo: v })}
            placeholder="Selecione"
            options={[
              { value: "Masculino", label: "Masculino" },
              { value: "Feminino", label: "Feminino" },
              { value: "Outro", label: "Outro" },
            ]}
          />
        </FormField>
        <FormField label="Nascimento">
          <FormInput type="date" value={data.nascimento} onChange={(v) => onChange({ nascimento: v })} />
        </FormField>
        <FormField label="Idade">
          <FormInput value={data.idade} onChange={(v) => onChange({ idade: v })} />
        </FormField>
        <FormField label="Estado Civil">
          <FormSelect
            value={data.estadoCivil}
            onChange={(v) => onChange({ estadoCivil: v })}
            placeholder="Selecione"
            options={[
              { value: "Solteiro(a)", label: "Solteiro(a)" },
              { value: "Casado(a)", label: "Casado(a)" },
              { value: "Divorciado(a)", label: "Divorciado(a)" },
              { value: "Viúvo(a)", label: "Viúvo(a)" },
            ]}
          />
        </FormField>
        <FormField label="Profissão">
          <FormInput value={data.profissao} onChange={(v) => onChange({ profissao: v })} />
        </FormField>
        <FormField label="Telefone">
          <FormInput value={data.telefone} onChange={(v) => onChange({ telefone: v })} />
        </FormField>
        <FormField label="WhatsApp">
          <FormInput value={data.whatsapp} onChange={(v) => onChange({ whatsapp: v })} />
        </FormField>
        <FormField label="E-mail">
          <FormInput type="email" value={data.email} onChange={(v) => onChange({ email: v })} />
        </FormField>
        <FormField label="Responsável Financeiro">
          <FormInput value={data.responsavelFinanceiro} onChange={(v) => onChange({ responsavelFinanceiro: v })} />
        </FormField>
        <FormField label="Convênio">
          <FormInput value={data.convenio} onChange={(v) => onChange({ convenio: v })} />
        </FormField>
        <FormField label="Plano">
          <FormInput value={data.plano} onChange={(v) => onChange({ plano: v })} />
        </FormField>
        <FormField label="Carteirinha">
          <FormInput value={data.carteirinha} onChange={(v) => onChange({ carteirinha: v })} />
        </FormField>
      </FieldGrid>
    </AnamnesisSectionCard>
  );
}

export function ChiefComplaintSection({
  data,
  onChange,
}: {
  data: DentalAnamnesis["chiefComplaint"];
  onChange: (patch: Partial<DentalAnamnesis["chiefComplaint"]>) => void;
}) {
  return (
    <AnamnesisSectionCard id="queixa" title="Queixa Principal" number={2}>
      <FieldGrid cols={2}>
        <FormField label="Qual a principal queixa?">
          <FormInput value={data.queixa} onChange={(v) => onChange({ queixa: v })} />
        </FormField>
        <FormField label="Quando começou?">
          <FormInput value={data.quandoComecou} onChange={(v) => onChange({ quandoComecou: v })} />
        </FormField>
        <FormField label="Há quanto tempo?">
          <FormSelect
            value={data.haQuantoTempo}
            onChange={(v) => onChange({ haQuantoTempo: v })}
            placeholder="Selecione"
            options={[
              { value: "Hoje", label: "Hoje" },
              { value: "1-3 dias", label: "1-3 dias" },
              { value: "1 semana", label: "1 semana" },
              { value: "1 mês", label: "1 mês" },
              { value: "Mais de 1 mês", label: "Mais de 1 mês" },
            ]}
          />
        </FormField>
      <div className="mt-4">
        <TriStateQuestionRow
          label="A dor está presente?"
          value={data.dorPresente}
          onChange={(v) => onChange({ dorPresente: v })}
        />
      </div>
      </FieldGrid>
      <div className="mt-4">
        <FormField label="Escala da dor (0 a 10)">
          <input
            type="range"
            min={0}
            max={10}
            value={data.escalaDor}
            onChange={(e) => onChange({ escalaDor: Number(e.target.value) })}
            className="h-2 w-full accent-indigo-600"
          />
          <p className="mt-1 text-center text-sm font-bold text-indigo-600">{data.escalaDor}</p>
        </FormField>
      </div>
      <FieldGrid cols={2}>
        <FormField label="A dor piora em alguma situação?">
          <FormInput value={data.pioraEm} onChange={(v) => onChange({ pioraEm: v })} />
        </FormField>
        <FormField label="A dor melhora em alguma situação?">
          <FormInput value={data.melhoraEm} onChange={(v) => onChange({ melhoraEm: v })} />
        </FormField>
      </FieldGrid>
      <div className="mt-4">
        <FormField label="Descrição detalhada">
          <FormTextarea value={data.descricao} onChange={(v) => onChange({ descricao: v })} rows={5} />
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}

export function MedicalHistoryCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["medicalHistory"];
  onChange: (patch: Partial<DentalAnamnesis["medicalHistory"]>) => void;
}) {
  const setQuestion = (id: string, value: TriState) => {
    onChange({ questions: { ...data.questions, [id]: value } });
  };

  return (
    <AnamnesisSectionCard id="historia-medica" title="História Médica" number={3}>
      <TriStateQuestionGrid
        questions={MEDICAL_HISTORY_QUESTIONS}
        values={data.questions}
        onChange={setQuestion}
      />
      <div className="mt-4">
        <FormField label="Outras doenças">
          <FormTextarea value={data.outrasDoencas} onChange={(v) => onChange({ outrasDoencas: v })} />
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}
