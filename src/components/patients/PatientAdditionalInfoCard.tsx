"use client";

import { MessageCircle } from "lucide-react";
import { FormInput, FormSectionCard, FormSelect, FormTextarea } from "./FormField";
import { maskPhone } from "@/lib/masks";
import type { PatientFormState } from "./patient-form-types";

export function PatientAdditionalInfoCard({
  values,
  onChange,
}: {
  values: PatientFormState;
  onChange: (patch: Partial<PatientFormState>) => void;
}) {
  return (
    <FormSectionCard title="Informações adicionais">
      <div className="grid gap-4 md:grid-cols-3">
        <FormSelect
          label="Convênio"
          name="convenio"
          value={values.convenio}
          onChange={(e) => onChange({ convenio: e.target.value })}
        >
          <option value="">Particular</option>
          <option value="unimed">Unimed</option>
          <option value="bradesco">Bradesco Dental</option>
          <option value="sulamerica">SulAmérica</option>
          <option value="amil">Amil</option>
        </FormSelect>
        <FormSelect
          label="Plano"
          name="plano"
          value={values.plano}
          onChange={(e) => onChange({ plano: e.target.value })}
        >
          <option value="">Selecione</option>
          <option value="basico">Básico</option>
          <option value="essencial">Essencial</option>
          <option value="premium">Premium</option>
        </FormSelect>
        <FormInput
          label="Nº carteirinha"
          name="carteirinha"
          value={values.carteirinha}
          onChange={(e) => onChange({ carteirinha: e.target.value })}
        />
        <FormInput
          label="Profissão"
          name="profissao"
          value={values.profissao}
          onChange={(e) => onChange({ profissao: e.target.value })}
        />
        <FormSelect
          label="Responsável financeiro"
          name="responsavelFinanceiro"
          value={values.responsavelFinanceiro}
          onChange={(e) => onChange({ responsavelFinanceiro: e.target.value })}
        >
          <option value="proprio">Próprio paciente</option>
          <option value="pai">Pai</option>
          <option value="mae">Mãe</option>
          <option value="conjuge">Cônjuge</option>
          <option value="outro">Outro</option>
        </FormSelect>
        <FormInput
          label="Telefone responsável"
          name="telefoneResponsavel"
          value={values.telefoneResponsavel}
          onChange={(e) => onChange({ telefoneResponsavel: maskPhone(e.target.value) })}
          placeholder="(00) 00000-0000"
          inputMode="tel"
          trailing={<MessageCircle className="h-4 w-4 text-emerald-500" />}
        />
        <div className="md:col-span-3">
          <FormSelect
            label="Como conheceu a clínica?"
            name="comoConheceu"
            value={values.comoConheceu}
            onChange={(e) => onChange({ comoConheceu: e.target.value })}
          >
            <option value="">Selecione</option>
            <option value="indicacao">Indicação</option>
            <option value="instagram">Instagram</option>
            <option value="google">Google</option>
            <option value="fachada">Fachada</option>
            <option value="outro">Outro</option>
          </FormSelect>
        </div>
        <div className="md:col-span-3">
          <FormTextarea
            label="Observações"
            name="observacoes"
            value={values.observacoes}
            onChange={(e) => onChange({ observacoes: e.target.value })}
            placeholder="Alergias, preferências, observações gerais..."
          />
        </div>
      </div>
    </FormSectionCard>
  );
}
