"use client";

import type { FilledExtracaoContract } from "@/lib/contract-fill";
import { Filled } from "./FilledValue";

export function ExtracoesDentariasFilledDocument({
  data,
}: {
  data: FilledExtracaoContract;
}) {
  const { clinic, patient } = data;

  return (
    <div className="contract-pdf-pages mx-auto w-full max-w-[820px] space-y-4 bg-[#525659] p-4 print:max-w-none print:space-y-0 print:bg-white print:p-0">
      <Page>
        <h1 className="text-center text-[15px] font-bold uppercase tracking-wide text-slate-900">
          Contrato de Prestação de Serviços Odontológicos
        </h1>
        <h2 className="mt-1 text-center text-[13px] font-semibold uppercase text-slate-700">
          Procedimento Cirúrgico de Extração Dentária
        </h2>

        <p className="mt-5 text-justify text-[12.5px] leading-relaxed text-slate-800">
          Pelo presente instrumento particular de CONTRATO DE PRESTAÇÃO DE SERVIÇOS
          ODONTOLÓGICOS, de um lado, como CONTRATADA,{" "}
          <Filled>{clinic.name}</Filled>, pessoa jurídica de direito privado,
          inscrita no CNPJ sob o nº <Filled>{clinic.cnpj}</Filled>, estabelecida à{" "}
          <Filled>{clinic.address}</Filled>, neste ato representada por seu(sua)
          Cirurgião(ã)-Dentista <Filled>{clinic.responsibleDentist}</Filled>,
          inscrito(a) no Conselho Regional de Odontologia (CRO/UF) sob o nº{" "}
          <Filled>{clinic.cro}</Filled>, doravante denominada simplesmente CONTRATADA.
        </p>

        <p className="mt-3 text-justify text-[12.5px] leading-relaxed text-slate-800">
          E, de outro lado, como CONTRATANTE, Eu, <Filled>{patient.name}</Filled>,
          nacionalidade <Filled>{patient.nationality}</Filled>, estado civil{" "}
          <Filled>{patient.estadoCivil}</Filled>, profissão{" "}
          <Filled>{patient.profession}</Filled>, inscrito(a) no Cadastro de Pessoas
          Físicas (CPF/MF) sob o nº <Filled>{patient.cpf}</Filled>, portador(a) da
          Cédula de Identidade (RG) nº <Filled>{patient.rg}</Filled>, expedida por{" "}
          <Filled>{patient.orgaoExpedidor}</Filled>, residente e domiciliado(a) à{" "}
          <Filled>{patient.address}</Filled>, nº <Filled>{patient.numero}</Filled>,
          complemento <Filled>{patient.complemento}</Filled>, bairro{" "}
          <Filled>{patient.bairro}</Filled>, cidade <Filled>{patient.city}</Filled>,
          Estado <Filled>{patient.state}</Filled>, CEP <Filled>{patient.cep}</Filled>,
          telefone <Filled>{patient.phone}</Filled>, e-mail{" "}
          <Filled>{patient.email}</Filled>, doravante denominado(a) simplesmente
          PACIENTE ou CONTRATANTE.
        </p>

        <p className="mt-3 text-justify text-[12.5px] leading-relaxed text-slate-800">
          Na hipótese de o paciente ser menor de idade ou relativamente/incapaz,
          comparece neste ato seu(sua) responsável legal,
          __________________________________________________________, inscrito(a) no
          CPF sob o nº ____________________________, portador(a) do RG nº
          ____________________________, residente e domiciliado(a) à
          __________________________________________________________, assumindo
          integral responsabilidade pelas obrigações decorrentes deste contrato.
        </p>

        <p className="mt-3 text-justify text-[12.5px] leading-relaxed text-slate-800">
          As partes acima qualificadas, de forma livre, consciente e de comum acordo,
          resolvem celebrar o presente Contrato de Prestação de Serviços Odontológicos,
          que será regido pelas cláusulas e condições seguintes, pela legislação civil
          vigente, pelo Código de Defesa do Consumidor, pela Lei Geral de Proteção de
          Dados Pessoais (Lei nº 13.709/2018), bem como pelas normas éticas
          estabelecidas pelo Conselho Federal de Odontologia (CFO), obrigando-se por si,
          seus herdeiros e sucessores ao fiel cumprimento de todas as disposições aqui
          estabelecidas.
        </p>

        <Clause title="CLÁUSULA PRIMEIRA – DO OBJETO">
          O presente Contrato tem por objeto a prestação de serviços odontológicos pela
          CONTRATADA ao CONTRATANTE, consistentes na realização de procedimento(s)
          cirúrgico(s) de extração dentária, simples ou complexa, conforme diagnóstico
          clínico, exames complementares, planejamento terapêutico e prontuário
          odontológico elaborados pelo Cirurgião-Dentista responsável.
          <br />
          <br />
          <strong>Parágrafo Primeiro.</strong> O procedimento poderá compreender
          extrações unitárias, múltiplas, dentes inclusos, semi-inclusos, impactados,
          remanescentes radiculares, terceiros molares (dentes do siso) e demais
          procedimentos cirúrgicos correlatos, conforme indicação clínica.
          <br />
          <br />
          <strong>Parágrafo Segundo.</strong> Caso, durante o ato cirúrgico, seja
          constatada a necessidade de adoção de técnicas adicionais ou complementares
          indispensáveis à preservação da saúde do paciente, a CONTRATADA poderá
          realizá-las, desde que tecnicamente justificadas e, sempre que possível,
          previamente comunicadas ao CONTRATANTE.
        </Clause>
      </Page>

      <Page>
        <Clause title="CLÁUSULA SEGUNDA – DO DIAGNÓSTICO E DO PLANO DE TRATAMENTO">
          O CONTRATANTE declara ter sido devidamente examinado pelo Cirurgião-Dentista
          responsável, tendo recebido informações claras, objetivas e suficientes acerca
          de: I – diagnóstico clínico; II – necessidade da extração dentária; III –
          alternativas terapêuticas existentes; IV – prognóstico esperado; V – benefícios
          do procedimento; VI – limitações do tratamento; VII – possíveis riscos e
          complicações.
          <br />
          <br />
          <strong>Parágrafo Único.</strong> O CONTRATANTE declara que todas as dúvidas
          foram esclarecidas antes da assinatura deste instrumento.
        </Clause>

        <Clause title="CLÁUSULA TERCEIRA – DO CONSENTIMENTO INFORMADO">
          O CONTRATANTE declara que recebeu explicações suficientes acerca da natureza do
          procedimento cirúrgico, compreendendo que toda intervenção odontológica envolve
          riscos inerentes à prática profissional, inexistindo garantia absoluta quanto
          aos resultados clínicos, estéticos ou funcionais. Reconhece, ainda, que os
          resultados poderão variar conforme fatores biológicos individuais, colaboração
          durante o tratamento, condições sistêmicas de saúde, hábitos pessoais e
          processo natural de cicatrização.
        </Clause>

        <Clause title="CLÁUSULA QUARTA – DOS RISCOS E POSSÍVEIS COMPLICAÇÕES">
          O CONTRATANTE declara estar plenamente ciente de que poderão ocorrer, dentre
          outras intercorrências: I – dor; II – edema (inchaço); III – sangramento; IV –
          hematomas; V – limitação temporária da abertura bucal; VI – infecção; VII –
          alveolite; VIII – necessidade de suturas; IX – necessidade de utilização de
          medicamentos; X – parestesia temporária ou permanente; XI – fratura dentária ou
          óssea; XII – comunicação buco-sinusal; XIII – necessidade de novos
          procedimentos cirúrgicos; XIV – atraso na cicatrização; XV – reações adversas a
          medicamentos ou anestésicos; XVI – outras complicações inerentes aos
          procedimentos cirúrgicos odontológicos.
          <br />
          <br />
          <strong>Parágrafo Único.</strong> O CONTRATANTE reconhece que a ocorrência
          dessas intercorrências não caracteriza, por si só, erro profissional, desde que
          observadas as normas técnicas, científicas e éticas aplicáveis.
        </Clause>

        <Clause title="CLÁUSULA QUINTA – DAS OBRIGAÇÕES DA CONTRATADA">
          Compete à CONTRATADA: I – executar os procedimentos de acordo com as boas
          práticas odontológicas; II – utilizar materiais adequados e devidamente
          registrados nos órgãos competentes; III – respeitar as normas do Conselho
          Federal de Odontologia; IV – manter prontuário atualizado; V – preservar o
          sigilo das informações do paciente; VI – prestar orientações pré e
          pós-operatórias.
        </Clause>
      </Page>

      <Page>
        <Clause title="CLÁUSULA SEXTA – DAS OBRIGAÇÕES DO CONTRATANTE">
          Constituem obrigações do CONTRATANTE: I – informar corretamente todo seu
          histórico médico e odontológico; II – informar doenças sistêmicas, alergias,
          gravidez, uso de medicamentos, anticoagulantes, diabetes, hipertensão,
          cardiopatias ou qualquer condição que possa interferir no tratamento; III –
          seguir rigorosamente todas as orientações fornecidas pela CONTRATADA; IV –
          comparecer às consultas de retorno; V – utilizar corretamente os medicamentos
          prescritos; VI – comunicar imediatamente qualquer intercorrência após a
          cirurgia.
        </Clause>

        <Clause title="CLÁUSULA SÉTIMA – DOS CUIDADOS PÓS-OPERATÓRIOS">
          O CONTRATANTE declara que recebeu orientações quanto aos cuidados necessários
          após o procedimento, comprometendo-se a: manter repouso conforme orientação
          profissional; evitar esforços físicos; não fumar; não ingerir bebidas
          alcoólicas; evitar alimentos quentes nas primeiras horas; realizar higiene
          conforme orientação; retornar nas datas agendadas. O descumprimento dessas
          recomendações poderá comprometer a recuperação e afastar eventual
          responsabilidade da CONTRATADA pelos prejuízos decorrentes.
        </Clause>

        <Clause title="CLÁUSULA OITAVA – DOS HONORÁRIOS">
          Os honorários profissionais referentes ao tratamento encontram-se descritos no
          orçamento odontológico aprovado pelo CONTRATANTE, que passa a integrar este
          contrato para todos os efeitos legais. Qualquer procedimento adicional somente
          será realizado mediante nova avaliação clínica e aprovação do paciente.
        </Clause>

        <Clause title="CLÁUSULA NONA – DA LGPD">
          O CONTRATANTE autoriza a coleta, armazenamento, tratamento e utilização de seus
          dados pessoais e sensíveis exclusivamente para execução do tratamento
          odontológico, emissão de documentos, cumprimento de obrigações legais, contato
          relacionado ao tratamento e manutenção do prontuário odontológico, nos termos
          da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais).
        </Clause>

        <Clause title="CLÁUSULA DÉCIMA – DAS DISPOSIÇÕES GERAIS">
          O presente contrato obriga as partes, seus herdeiros e sucessores, produzindo
          efeitos até a conclusão do tratamento ou sua rescisão, observadas as
          disposições legais aplicáveis. Fica eleito o foro da Comarca da sede da
          CONTRATADA para dirimir eventuais controvérsias oriundas deste contrato,
          renunciando as partes a qualquer outro, por mais privilegiado que seja.
        </Clause>
      </Page>

      <Page>
        <h3 className="text-[13px] font-bold uppercase">Declaração final</h3>
        <p className="mt-3 text-justify text-[12.5px] leading-relaxed text-slate-800">
          O CONTRATANTE declara que leu integralmente este contrato, compreendeu todas as
          suas cláusulas, recebeu explicações suficientes acerca do procedimento
          cirúrgico de extração dentária, teve oportunidade de formular perguntas, obteve
          respostas satisfatórias e manifesta seu consentimento livre, informado e
          esclarecido para a realização do tratamento odontológico proposto.
        </p>
        <p className="mt-3 text-justify text-[12.5px] leading-relaxed text-slate-800">
          E, por estarem justos e contratados, firmam o presente instrumento em duas vias
          de igual teor e forma, juntamente com duas testemunhas, para que produza todos
          os efeitos legais.
        </p>

        <p className="mt-8 text-[12.5px] text-slate-800">
          Cidade: <Filled>{clinic.city}</Filled>
          {"  "}Data: <Filled>{data.generatedDateShort}</Filled>
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-700">
              Contratante (Paciente)
            </p>
            <div className="mt-10 border-t border-slate-400 pt-2 text-[12px]">
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
            <div className="mt-10 border-t border-slate-400 pt-2 text-[12px]">
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

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <WitnessBlock n={1} />
          <WitnessBlock n={2} />
        </div>
      </Page>
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[1050px] rounded-sm bg-white px-10 py-10 shadow-lg print:min-h-0 print:break-after-page print:rounded-none print:px-8 print:py-8 print:shadow-none">
      {children}
    </section>
  );
}

function Clause({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="text-[12.5px] font-bold uppercase text-slate-900">{title}</h3>
      <p className="mt-2 text-justify text-[12.5px] leading-relaxed text-slate-800">
        {children}
      </p>
    </section>
  );
}

function WitnessBlock({ n }: { n: number }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase text-slate-700">Testemunha 0{n}</p>
      <div className="mt-10 space-y-2 border-t border-slate-400 pt-2 text-[12px] text-slate-700">
        <p>Nome: _________________________________</p>
        <p>CPF: _________________________________</p>
        <p>Assinatura: ___________________________</p>
      </div>
    </div>
  );
}
