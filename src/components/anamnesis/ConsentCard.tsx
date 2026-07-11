"use client";

import type { DentalAnamnesis } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FormField, FormInput } from "./shared";

const CONSENT_TEXT = `Declaro que todas as informações prestadas nesta ficha de anamnese são verdadeiras e completas, 
estando ciente de que omissões ou informações incorretas podem comprometer meu tratamento odontológico.

Autorizo o profissional responsável e a clínica a utilizar os dados aqui registrados para fins de 
diagnóstico, planejamento de tratamento, registro clínico e comunicação relacionada ao meu atendimento, 
em conformidade com a legislação vigente sobre proteção de dados pessoais (LGPD).

Estou ciente de que posso solicitar acesso, correção ou exclusão dos meus dados pessoais a qualquer momento, 
conforme previsto na Lei nº 13.709/2018.`;

export function ConsentCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["consent"];
  onChange: (patch: Partial<DentalAnamnesis["consent"]>) => void;
}) {
  return (
    <AnamnesisSectionCard id="consentimento" title="Termo de Consentimento" number={13}>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700">
        {CONSENT_TEXT.split("\n").map((line, i) => (
          <p key={i} className={line.trim() ? "mb-3" : ""}>
            {line.trim()}
          </p>
        ))}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="checkbox"
          checked={data.agreed}
          onChange={(e) => onChange({ agreed: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-slate-700">
          Li e concordo com os termos acima descritos.
          <span className="text-red-500"> *</span>
        </span>
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="Assinatura digital">
          <FormInput
            value={data.signature}
            onChange={(v) => onChange({ signature: v })}
            placeholder="Nome completo do paciente ou responsável"
          />
        </FormField>
        <FormField label="Data">
          <FormInput type="date" value={data.date} onChange={(v) => onChange({ date: v })} />
        </FormField>
      </div>
    </AnamnesisSectionCard>
  );
}
