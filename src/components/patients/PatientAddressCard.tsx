"use client";

import { useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { FormInput, FormSectionCard, FormSelect } from "./FormField";
import { maskCep, onlyDigits } from "@/lib/masks";
import { fetchAddressByCep } from "@/lib/viacep";
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
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const lastFetched = useRef("");

  async function lookupCep(cepValue: string, force = false) {
    const cep = onlyDigits(cepValue);
    if (cep.length !== 8) return;
    if (!force && cep === lastFetched.current) return;

    setLoading(true);
    setHint("");
    try {
      const addr = await fetchAddressByCep(cep);
      if (!addr) {
        setHint("CEP não encontrado.");
        return;
      }
      lastFetched.current = cep;
      onChange({
        ...(addr.logradouro ? { endereco: addr.logradouro } : {}),
        ...(addr.bairro ? { bairro: addr.bairro } : {}),
        ...(addr.localidade ? { cidade: addr.localidade } : {}),
        ...(addr.uf ? { estado: addr.uf } : {}),
      });
      setHint("Endereço preenchido automaticamente.");
    } catch {
      setHint("Não foi possível consultar o CEP.");
    } finally {
      setLoading(false);
    }
  }

  function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    onChange({ cep: masked });
    const digits = onlyDigits(masked);
    if (digits.length === 8) {
      void lookupCep(masked);
    } else {
      lastFetched.current = "";
      if (hint) setHint("");
    }
  }

  return (
    <FormSectionCard title="Endereço">
      <div className="grid gap-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <FormInput
            label="CEP"
            name="cep"
            value={values.cep}
            onChange={(e) => handleCepChange(e.target.value)}
            onBlur={() => void lookupCep(values.cep, true)}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
            trailing={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <button
                  type="button"
                  className="rounded-md p-0.5 text-slate-400 transition hover:text-indigo-600"
                  aria-label="Buscar CEP"
                  title="Buscar endereço pelo CEP"
                  onClick={() => void lookupCep(values.cep, true)}
                  disabled={loading || onlyDigits(values.cep).length !== 8}
                >
                  <Search className="h-4 w-4" />
                </button>
              )
            }
          />
          {hint ? (
            <p
              className={`mt-1.5 text-xs ${
                hint.includes("automaticamente")
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              {hint}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              Digite o CEP para preencher o endereço automaticamente.
            </p>
          )}
        </div>
        <div className="md:col-span-4">
          <FormInput
            label="Endereço"
            name="endereco"
            value={values.endereco}
            onChange={(e) => onChange({ endereco: e.target.value })}
            placeholder="Rua, avenida..."
            autoComplete="address-line1"
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
            autoComplete="address-level3"
          />
        </div>
        <div className="md:col-span-4">
          <FormInput
            label="Cidade"
            name="cidade"
            value={values.cidade}
            onChange={(e) => onChange({ cidade: e.target.value })}
            autoComplete="address-level2"
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
