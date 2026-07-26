"use client";

import type { FilledContractPatient, PatientContractDefinition } from "@/lib/patient-contracts";
import { contractStaticPdfUrl, todayDisplay } from "@/lib/patient-contracts";

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
  const pdfUrl = contractStaticPdfUrl(contract);

  return (
    <div className="space-y-6">
      <article className="contract-sheet mx-auto max-w-[900px] bg-white px-10 py-12 text-slate-900 shadow-sm">
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
            {patient.nomeSocial ? (
              <Field label="Nome social" value={patient.nomeSocial} />
            ) : null}
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

        {contract.preferStaticPdf ? (
          <section className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-900">
            O PDF do contrato está abaixo, já vinculado a este paciente. Use{" "}
            <strong>Imprimir / Salvar PDF</strong> para gerar a via assinada.
          </section>
        ) : (
          <ContractBody
            contractId={contract.id}
            patientName={patient.name}
            clinicName={clinicName}
          />
        )}

        <footer className="mt-8 space-y-8 text-sm">
          <p className="text-slate-600">
            Local e data: {patient.city || "________________"}, {todayDisplay()}.
          </p>
          <div className="grid gap-10 sm:grid-cols-2">
            <SignatureBlock label="Paciente / Responsável legal" name={patient.name} />
            <SignatureBlock label="Clínica / Responsável técnico" name={clinicName} />
          </div>
        </footer>
      </article>

      {contract.preferStaticPdf ? (
        <section className="contract-sheet mx-auto max-w-[900px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="no-print border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            PDF do contrato — {contract.pdfFileName}
          </div>
          <iframe
            title={contract.title}
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="h-[80vh] w-full bg-slate-50"
          />
          <div className="print-only hidden p-6 text-center text-sm text-slate-600">
            Consulte também o arquivo PDF anexado: {contract.pdfFileName}
          </div>
        </section>
      ) : null}
    </div>
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
      body: "A CLINICA prestará serviços odontológicos ao PACIENTE conforme plano de tratamento indicado, com profissionais habilitados e materiais adequados.",
    },
    {
      title: "Obrigações da clínica",
      body: "Manter prontuário atualizado, informar riscos e alternativas terapêuticas, e observar as normas do CFO e vigilância sanitária.",
    },
    {
      title: "Obrigações do paciente",
      body: "Fornecer informações verdadeiras de saúde, comparecer às consultas agendadas e seguir orientações pós-procedimento.",
    },
    {
      title: "Pagamento",
      body: "Os valores, formas e prazos constarão do orçamento aprovado e/ou contrato financeiro específico.",
    },
  ],
  "consentimento-informado": [
    {
      title: "Informação",
      body: "O PACIENTE declara ter sido informado sobre diagnóstico, tratamento proposto, benefícios, riscos, possíveis complicações e alternativas.",
    },
    {
      title: "Consentimento",
      body: "Autoriza a realização dos procedimentos odontológicos descritos no plano de tratamento, podendo revogar este consentimento a qualquer momento antes do início.",
    },
    {
      title: "Anestesia e exames",
      body: "Autoriza o uso de anestésicos locais e a solicitação de exames complementares quando clinicamente necessários.",
    },
  ],
  "tratamento-ortodontico": [
    {
      title: "Objeto",
      body: "Prestação de tratamento ortodôntico, incluindo aparelhos, consultas de manutenção e contenção, conforme planejamento.",
    },
    {
      title: "Duração e colaboração",
      body: "O prazo estimado depende da colaboração do PACIENTE (higiene, uso de elásticos/contenção e comparecimento).",
    },
    {
      title: "Manutenção e perdas",
      body: "Quebras, perdas de aparelho ou faltas reiteradas poderão gerar custos adicionais e alongar o tratamento.",
    },
  ],
  "plano-pagamento": [
    {
      title: "Valores",
      body: "O PACIENTE reconhece o valor total do tratamento e o plano de parcelamento acordado com a CLINICA.",
    },
    {
      title: "Vencimentos",
      body: "As parcelas deverão ser pagas nas datas estipuladas. Atraso poderá ensejar juros, multa e suspensão de procedimentos eletivos.",
    },
    {
      title: "Inadimplência",
      body: "Em caso de inadimplência, a CLINICA poderá adotar medidas administrativas e legais cabíveis, respeitada a legislação vigente.",
    },
  ],
  "autorizacao-imagem": [
    {
      title: "Autorização",
      body: "O PACIENTE autoriza a CLINICA a utilizar fotografias, radiografias e imagens do tratamento para fins de documentação clínica e, se marcado, divulgação científica/educacional.",
    },
    {
      title: "Privacidade",
      body: "Dados identificáveis serão tratados conforme a LGPD. O PACIENTE pode solicitar restrição de uso publicitário a qualquer tempo.",
    },
  ],
  "termo-responsabilidade": [
    {
      title: "Compromisso",
      body: "O PACIENTE compromete-se a seguir o plano terapêutico, comunicar alterações de saúde e não interromper o tratamento sem orientação profissional.",
    },
    {
      title: "Resultados",
      body: "Resultados clínicos podem variar. A CLINICA não garante resultado estético/funcional absoluto fora das condições clínicas e colaboração do PACIENTE.",
    },
  ],
};
