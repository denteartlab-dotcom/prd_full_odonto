"use client";

import type { FilledContractPatient, PatientContractDefinition } from "@/lib/patient-contracts";
import { todayDisplay } from "@/lib/patient-contracts";

export function ContractPrintDocument({
  contract,
  patient,
  clinicName = "Clínica Sorriso Premium",
}: {
  contract: PatientContractDefinition;
  patient: FilledContractPatient;
  clinicName?: string;
}) {
  const cityLine = [patient.city, patient.state].filter(Boolean).join("/");
  const fullAddress = [patient.address, patient.cep ? `CEP ${patient.cep}` : null, cityLine]
    .filter(Boolean)
    .join(" — ");

  return (
    <article className="contract-sheet mx-auto max-w-[800px] bg-white px-10 py-12 text-slate-900 shadow-sm">
      <header className="mb-8 border-b border-slate-200 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          {clinicName}
        </p>
        <h1 className="mt-2 text-xl font-bold leading-snug text-slate-900">
          {contract.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{contract.description}</p>
      </header>

      <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          Dados do paciente (preenchidos automaticamente)
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Nome completo" value={patient.name} />
          {patient.nomeSocial ? <Field label="Nome social" value={patient.nomeSocial} /> : null}
          <Field label="CPF" value={patient.cpf} />
          <Field label="RG" value={patient.rg || "—"} />
          <Field
            label="Nascimento"
            value={`${patient.birthDateDisplay} (${patient.age} anos)`}
          />
          <Field label="Sexo" value={patient.sexo || "—"} />
          <Field label="Estado civil" value={patient.estadoCivil || "—"} />
          <Field label="Telefone" value={patient.phone} />
          <Field label="E-mail" value={patient.email} />
          <Field label="Convênio" value={patient.insurance} />
          <Field label="Responsável financeiro" value={patient.financialResponsible} />
          <Field label="Endereço" value={fullAddress} className="sm:col-span-2" />
        </dl>
      </section>

      <ContractBody
        contractId={contract.id}
        patientName={patient.name}
        clinicName={clinicName}
      />

      <footer className="mt-10 space-y-10 text-sm">
        <p className="text-slate-600">
          Local e data: {patient.city || "________________"}, {todayDisplay()}.
        </p>
        <div className="grid gap-10 sm:grid-cols-2">
          <SignatureBlock label="Paciente / Responsável legal" name={patient.name} />
          <SignatureBlock label="Clínica / Responsável técnico" name={clinicName} />
        </div>
      </footer>
    </article>
  );
}

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function SignatureBlock({ label, name }: { label: string; name: string }) {
  return (
    <div className="pt-8 text-center">
      <div className="mx-auto mb-2 h-px w-56 bg-slate-400" />
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-500">{name}</p>
    </div>
  );
}

function ContractBody({
  contractId,
  patientName,
  clinicName,
}: {
  contractId: string;
  patientName: string;
  clinicName: string;
}) {
  const clauses = CLAUSES[contractId] || CLAUSES["prestacao-servicos"];
  return (
    <section className="space-y-4 text-sm leading-relaxed text-slate-700">
      <p>
        Pelo presente instrumento, de um lado <strong>{clinicName}</strong>, doravante
        denominada CLINICA, e de outro lado <strong>{patientName}</strong>, doravante
        denominado(a) PACIENTE, têm entre si justo e contratado o que segue:
      </p>
      {clauses.map((clause, index) => (
        <div key={index}>
          <h3 className="mb-1 font-semibold text-slate-900">
            Cláusula {index + 1}ª — {clause.title}
          </h3>
          <p>{clause.body}</p>
        </div>
      ))}
    </section>
  );
}

const CLAUSES: Record<string, { title: string; body: string }[]> = {
  "prestacao-servicos": [
    {
      title: "Objeto",
      body: "A CLINICA prestará serviços odontológicos ao PACIENTE conforme plano de tratamento indicado.",
    },
  ],
  "consentimento-informado": [
    {
      title: "Consentimento",
      body: "O PACIENTE autoriza a realização dos procedimentos odontológicos descritos no plano de tratamento.",
    },
  ],
  "tratamento-ortodontico": [
    {
      title: "Objeto",
      body: "Prestação de tratamento ortodôntico conforme planejamento clínico.",
    },
  ],
  "plano-pagamento": [
    {
      title: "Valores",
      body: "O PACIENTE reconhece o valor total do tratamento e o plano de parcelamento acordado.",
    },
  ],
  "autorizacao-imagem": [
    {
      title: "Autorização",
      body: "O PACIENTE autoriza o uso de imagens clínicas para documentação do tratamento.",
    },
  ],
  "termo-responsabilidade": [
    {
      title: "Compromisso",
      body: "O PACIENTE compromete-se a seguir o plano terapêutico e as orientações profissionais.",
    },
  ],
};
