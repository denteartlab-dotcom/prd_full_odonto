"use client";

import { CalendarDays, MessageCircle } from "lucide-react";
import { FormInput, FormSectionCard, FormSelect } from "./FormField";
import { maskCpf, maskDateBr, maskPhone, maskRg } from "@/lib/masks";
import type { PatientFormState } from "./patient-form-types";

export function PatientPersonalDataCard({
  values,
  onChange,
}: {
  values: PatientFormState;
  onChange: (patch: Partial<PatientFormState>) => void;
}) {
  return (
    <FormSectionCard title="Dados pessoais">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormInput
            label="Nome completo"
            name="nomeCompleto"
            required
            value={values.nomeCompleto}
            onChange={(e) => onChange({ nomeCompleto: e.target.value })}
            placeholder="Nome completo do paciente"
          />
        </div>
        <FormInput
          label="Nome social"
          name="nomeSocial"
          value={values.nomeSocial}
          onChange={(e) => onChange({ nomeSocial: e.target.value })}
          placeholder="Opcional"
        />
        <FormInput
          label="CPF"
          name="cpf"
          required
          value={values.cpf}
          onChange={(e) => onChange({ cpf: maskCpf(e.target.value) })}
          placeholder="000.000.000-00"
          inputMode="numeric"
        />
        <FormInput
          label="RG"
          name="rg"
          value={values.rg}
          onChange={(e) => onChange({ rg: maskRg(e.target.value) })}
          placeholder="00.000.000-0"
          inputMode="numeric"
        />
        <FormInput
          label="Órgão expedidor"
          name="orgaoExpedidor"
          value={values.orgaoExpedidor}
          onChange={(e) => onChange({ orgaoExpedidor: e.target.value })}
          placeholder="SSP"
        />
        <FormInput
          label="Data de nascimento"
          name="dataNascimento"
          required
          value={values.dataNascimento}
          onChange={(e) => onChange({ dataNascimento: maskDateBr(e.target.value) })}
          placeholder="dd/mm/aaaa"
          inputMode="numeric"
          trailing={<CalendarDays className="h-4 w-4" />}
        />
        <FormSelect
          label="Sexo"
          name="sexo"
          required
          value={values.sexo}
          onChange={(e) => onChange({ sexo: e.target.value })}
        >
          <option value="">Selecione</option>
          <option value="feminino">Feminino</option>
          <option value="masculino">Masculino</option>
          <option value="outro">Outro</option>
          <option value="nao_informar">Prefiro não informar</option>
        </FormSelect>
        <FormSelect
          label="Estado civil"
          name="estadoCivil"
          value={values.estadoCivil}
          onChange={(e) => onChange({ estadoCivil: e.target.value })}
        >
          <option value="">Selecione</option>
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
          <option value="uniao_estavel">União estável</option>
        </FormSelect>
        <FormInput
          label="Telefone principal"
          name="telefonePrincipal"
          required
          value={values.telefonePrincipal}
          onChange={(e) => onChange({ telefonePrincipal: maskPhone(e.target.value) })}
          placeholder="(00) 00000-0000"
          inputMode="tel"
          trailing={<MessageCircle className="h-4 w-4 text-emerald-500" />}
        />
        <FormInput
          label="Telefone secundário"
          name="telefoneSecundario"
          value={values.telefoneSecundario}
          onChange={(e) => onChange({ telefoneSecundario: maskPhone(e.target.value) })}
          placeholder="(00) 00000-0000"
          inputMode="tel"
        />
        <div className="md:col-span-2">
          <FormInput
            label="E-mail"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>
    </FormSectionCard>
  );
}
