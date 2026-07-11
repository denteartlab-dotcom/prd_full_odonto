"use client";

import { Search } from "lucide-react";
import { FormInput, FormSectionCard, FormSelect } from "./FormField";
import { maskCep } from "@/lib/masks";
import type { PatientFormState } from "./patient-form-types";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function PatientAddressCard({
  values,
  onChange,
}: {
  values: PatientFormState;
  onChange: (patch: Partial<PatientFormState>) => void;
}) {
  return (
    <FormSectionCard title="Endereço">
      <div className="grid gap-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <FormInput
            label="CEP"
            name="cep"
            value={values.cep}
            onChange={(e) => onChange({ cep: maskCep(e.target.value) })}
            placeholder="00000-000"
            inputMode="numeric"
            trailing={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="md:col-span-4">
          <FormInput
            label="Endereço"
            name="endereco"
            value={values.endereco}
            onChange={(e) => onChange({ endereco: e.target.value })}
            placeholder="Rua, avenida..."
          />
        </div>
        <div className="md:col-span-2">
          <FormInput
            label="Número"
            name="numero"
            value={values.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
            placeholder="Nº"
          />
        </div>
        <div className="md:col-span-2">
          <FormInput
            label="Complemento"
            name="complemento"
            value={values.complemento}
            onChange={(e) => onChange({ complemento: e.target.value })}
            placeholder="Apto, sala..."
          />
        </div>
        <div className="md:col-span-2">
          <FormInput
            label="Bairro"
            name="bairro"
            value={values.bairro}
            onChange={(e) => onChange({ bairro: e.target.value })}
          />
        </div>
        <div className="md:col-span-4">
          <FormInput
            label="Cidade"
            name="cidade"
            value={values.cidade}
            onChange={(e) => onChange({ cidade: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <FormSelect
            label="Estado"
            name="estado"
            value={values.estado}
            onChange={(e) => onChange({ estado: e.target.value })}
          >
            <option value="">UF</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>
    </FormSectionCard>
  );
}
