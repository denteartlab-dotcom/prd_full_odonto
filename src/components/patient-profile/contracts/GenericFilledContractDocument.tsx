"use client";

import type { PatientContractDefinition } from "@/lib/patient-contracts";
import type { FilledContractParties } from "@/lib/contract-fill";
import { Filled } from "./FilledValue";

/**
 * Modelo padrão preenchido para qualquer contrato do catálogo.
 * Novos PDFs usam esta estrutura com dados da clínica + paciente.
 */
export function GenericFilledContractDocument({
  contract,
  data,
}: {
  contract: PatientContractDefinition;
  data: FilledContractParties;
}) {
  const { clinic, patient } = data;

  return (
    <div className="contract-pdf-pages mx-auto w-full max-w-[820px] space-y-4 bg-[#525659] p-4 print:max-w-none print:space-y-0 print:bg-white print:p-0">
      <section className="min-h-[1050px] rounded-sm bg-white px-10 py-10 text-slate-900 shadow-lg print:min-h-0 print:rounded-none print:px-8 print:py-8 print:shadow-none">
        <h1 className="text-center text-[15px] font-bold uppercase tracking-wide">
          {contract.title}
        </h1>
        <p className="mt-2 text-center text-[12px] text-slate-600">{contract.description}</p>

        <p className="mt-6 text-justify text-[12.5px] leading-relaxed text-slate-800">
          Pelo presente instrumento, de um lado, como CONTRATADA,{" "}
          <Filled>{clinic.name}</Filled>, pessoa jurídica de direito privado, inscrita no
          CNPJ sob o nº <Filled>{clinic.cnpj}</Filled>, estabelecida à{" "}
          <Filled>{clinic.address}</Filled>, neste ato representada por seu(sua)
          Cirurgião(ã)-Dentista <Filled>{clinic.responsibleDentist}</Filled>, inscrito(a)
          no CRO sob o nº <Filled>{clinic.cro}</Filled>, doravante denominada CONTRATADA.
        </p>

        <p className="mt-3 text-justify text-[12.5px] leading-relaxed text-slate-800">
          E, de outro lado, como CONTRATANTE, Eu, <Filled>{patient.name}</Filled>,
          nacionalidade <Filled>{patient.nationality}</Filled>, estado civil{" "}
          <Filled>{patient.estadoCivil}</Filled>, profissão{" "}
          <Filled>{patient.profession}</Filled>, CPF <Filled>{patient.cpf}</Filled>, RG{" "}
          <Filled>{patient.rg}</Filled> expedido por{" "}
          <Filled>{patient.orgaoExpedidor}</Filled>, residente à{" "}
          <Filled>{patient.address}</Filled>, nº <Filled>{patient.numero}</Filled>,
          complemento <Filled>{patient.complemento}</Filled>, bairro{" "}
          <Filled>{patient.bairro}</Filled>, cidade <Filled>{patient.city}</Filled>/
          <Filled>{patient.state}</Filled>, CEP <Filled>{patient.cep}</Filled>, telefone{" "}
          <Filled>{patient.phone}</Filled>, e-mail <Filled>{patient.email}</Filled>,
          doravante denominado(a) CONTRATANTE.
        </p>

        <p className="mt-4 text-justify text-[12.5px] leading-relaxed text-slate-800">
          As partes celebram o presente contrato referente a{" "}
          <Filled>{contract.shortLabel.toLowerCase()}</Filled>, obrigando-se ao
          cumprimento das condições clínicas, financeiras e legais aplicáveis, bem como
          às normas do Conselho Federal de Odontologia e da legislação vigente.
        </p>

        <p className="mt-8 text-[12.5px] text-slate-800">
          Cidade: <Filled>{clinic.city}</Filled>
          {"  "}Data: <Filled>{data.generatedDateShort}</Filled>
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-700">
              Contratante (Paciente)
            </p>
            <div className="mt-10 border-t border-slate-400 pt-2 text-[12px] text-slate-800">
              <p>
                Nome: <Filled>{patient.name}</Filled>
              </p>
              <p className="mt-1">
                CPF: <Filled>{patient.cpf}</Filled>
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-700">Contratada</p>
            <div className="mt-10 border-t border-slate-400 pt-2 text-[12px] text-slate-800">
              <p>
                Cirurgião(ã)-Dentista: <Filled>{clinic.responsibleDentist}</Filled>
              </p>
              <p className="mt-1">
                CRO: <Filled>{clinic.cro}</Filled>
              </p>
              <p className="mt-1">
                Clínica: <Filled>{clinic.name}</Filled>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
