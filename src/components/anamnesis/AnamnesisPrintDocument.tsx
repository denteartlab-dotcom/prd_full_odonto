import type { DentalAnamnesis } from "@/lib/anamnesis-types";
import { MEDICAL_HISTORY_QUESTIONS } from "@/lib/anamnesis-types";
import {
  formatPrintDate,
  painTypeLabel,
  riskLabel,
  triStateLabel,
} from "@/lib/anamnesis-print";

const CONSENT_PRINT = `Declaro que as informações prestadas nesta ficha são verdadeiras e autorizo o uso dos dados para diagnóstico, planejamento de tratamento e registro clínico, conforme a LGPD (Lei nº 13.709/2018).`;

function Field({ label, value }: { label: string; value?: string | null }) {
  const v = value?.trim();
  return (
    <div className="print-field">
      <span className="print-label">{label}</span>
      <span className="print-value">{v || "—"}</span>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="print-section">
      <h2 className="print-section-title">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function Block({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="print-block">
      <span className="print-label">{label}</span>
      <p className="print-text">{value}</p>
    </div>
  );
}

export function AnamnesisPrintDocument({
  data,
  clinicName = "Clínica Odontológica",
}: {
  data: DentalAnamnesis;
  clinicName?: string;
}) {
  const id = data.identification;

  return (
    <article className="anamnesis-print-doc">
      <header className="print-header">
        <div>
          <p className="print-clinic">{clinicName}</p>
          <h1 className="print-title">Anamnese Odontológica</h1>
        </div>
        <div className="print-meta">
          <p>Atualizado: {formatPrintDate(data.updatedAt)}</p>
          <p>Profissional: {data.updatedBy}</p>
        </div>
      </header>

      <div className="print-patient-bar">
        <Field label="Paciente" value={id.nome} />
        <Field label="CPF" value={id.cpf} />
        <Field label="Idade" value={id.idade ? `${id.idade} anos` : ""} />
        <Field label="Convênio" value={id.convenio} />
      </div>

      <Section n={1} title="Identificação">
        <div className="print-grid-3">
          <Field label="Nome" value={id.nome} />
          <Field label="CPF" value={id.cpf} />
          <Field label="RG" value={id.rg} />
          <Field label="Sexo" value={id.sexo} />
          <Field label="Nascimento" value={formatPrintDate(id.nascimento)} />
          <Field label="Estado civil" value={id.estadoCivil} />
          <Field label="Profissão" value={id.profissao} />
          <Field label="Telefone" value={id.telefone} />
          <Field label="E-mail" value={id.email} />
          <Field label="Resp. financeiro" value={id.responsavelFinanceiro} />
          <Field label="Plano" value={id.plano} />
          <Field label="Carteirinha" value={id.carteirinha} />
        </div>
      </Section>

      <Section n={2} title="Queixa Principal">
        <div className="print-grid-2">
          <Field label="Queixa" value={data.chiefComplaint.queixa} />
          <Field label="Início" value={data.chiefComplaint.quandoComecou} />
          <Field label="Há quanto tempo" value={data.chiefComplaint.haQuantoTempo} />
          <Field label="Dor presente" value={triStateLabel(data.chiefComplaint.dorPresente)} />
          <Field label="Escala da dor" value={String(data.chiefComplaint.escalaDor)} />
          <Field label="Piora em" value={data.chiefComplaint.pioraEm} />
        </div>
        <Block label="Descrição" value={data.chiefComplaint.descricao} />
      </Section>

      <Section n={3} title="História Médica">
        <table className="print-tristate-table">
          <thead>
            <tr>
              <th>Pergunta</th>
              <th>SIM</th>
              <th>NÃO</th>
              <th>NÃO SEI</th>
            </tr>
          </thead>
          <tbody>
            {MEDICAL_HISTORY_QUESTIONS.map((q) => {
              const v = data.medicalHistory.questions[q.id] ?? "";
              return (
                <tr key={q.id}>
                  <td>{q.label}</td>
                  <td className="print-check">{v === "sim" ? "■" : "□"}</td>
                  <td className="print-check">{v === "nao" ? "■" : "□"}</td>
                  <td className="print-check">{v === "nao_sei" ? "■" : "□"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Block label="Outras doenças" value={data.medicalHistory.outrasDoencas} />
      </Section>

      <Section n={4} title="Hábitos">
        <div className="print-grid-3">
          <Field label="Fuma" value={triStateLabel(data.habits.fuma)} />
          <Field label="Cigarros/dia" value={data.habits.cigarrosPorDia} />
          <Field label="Bebe álcool" value={triStateLabel(data.habits.bebeAlcool)} />
          <Field label="Frequência álcool" value={data.habits.frequenciaAlcool} />
          <Field label="Drogas" value={triStateLabel(data.habits.usaDrogas)} />
          <Field label="Bruxismo" value={triStateLabel(data.habits.bruxismo)} />
          <Field label="Respira boca" value={triStateLabel(data.habits.respiraBoca)} />
          <Field label="Ronca" value={triStateLabel(data.habits.ronca)} />
          <Field label="Esportes" value={triStateLabel(data.habits.praticaEsportes)} />
          <Field label="Qualidade sono" value={data.habits.qualidadeSono} />
        </div>
      </Section>

      <Section n={5} title="Alergias">
        <div className="print-grid-2">
          <Field label="Possui alergia" value={triStateLabel(data.allergies.possui)} />
          <Field label="Medicamentos" value={data.allergies.medicamentos.join(", ")} />
          <Field label="Látex" value={data.allergies.latex ? "Sim" : "Não"} />
          <Field label="Anestésicos" value={data.allergies.anestesicos ? "Sim" : "Não"} />
          <Field label="Alimentos" value={data.allergies.alimentos.join(", ")} />
        </div>
        <Block label="Observações" value={data.allergies.observacoes} />
      </Section>

      <Section n={6} title="Medicamentos">
        <Field label="Utiliza medicamentos" value={triStateLabel(data.medications.utiliza)} />
        {data.medications.list.length > 0 && (
          <table className="print-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Dose</th>
                <th>Frequência</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {data.medications.list.map((m) => (
                <tr key={m.id}>
                  <td>{m.name || "—"}</td>
                  <td>{m.dose || "—"}</td>
                  <td>{m.frequency || "—"}</td>
                  <td>{m.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section n={7} title="Revisão de Sistemas">
        <div className="print-grid-3">
          {(
            [
              ["cardiovascular", "Cardiovascular"],
              ["respiratorio", "Respiratório"],
              ["digestivo", "Digestivo"],
              ["neurologico", "Neurológico"],
              ["endocrino", "Endócrino"],
              ["hematologico", "Hematológico"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={`${data.systemsReview[key].status === "alterado" ? "Alterado" : "Normal"}${data.systemsReview[key].notes ? ` — ${data.systemsReview[key].notes}` : ""}`}
            />
          ))}
        </div>
      </Section>

      <Section n={8} title="História Odontológica">
        <div className="print-grid-3">
          <Field label="Última consulta" value={formatPrintDate(data.dentalHistory.ultimaConsulta)} />
          <Field label="Última RX" value={formatPrintDate(data.dentalHistory.ultimaRadiografia)} />
          <Field label="Canal" value={triStateLabel(data.dentalHistory.fezCanal)} />
          <Field label="Implante" value={triStateLabel(data.dentalHistory.fezImplante)} />
          <Field label="Aparelho" value={triStateLabel(data.dentalHistory.usouAparelho)} />
          <Field label="Sensibilidade" value={triStateLabel(data.dentalHistory.sensibilidade)} />
          <Field label="Sangramento" value={triStateLabel(data.dentalHistory.sangramentoGengival)} />
          <Field label="Escovações/dia" value={data.dentalHistory.escovacoesDia} />
          <Field label="Fio dental" value={triStateLabel(data.dentalHistory.usaFioDental)} />
        </div>
        <Block label="Observações" value={data.dentalHistory.observacoes} />
      </Section>

      <Section n={9} title="Exame Clínico">
        <div className="print-grid-4">
          <Field label="PA" value={data.clinicalExam.pressaoArterial} />
          <Field label="Temp." value={data.clinicalExam.temperatura} />
          <Field label="FC" value={data.clinicalExam.frequenciaCardiaca} />
          <Field label="IMC" value={data.clinicalExam.imc} />
        </div>
        <Block label="Extraoral" value={data.clinicalExam.exameExtraoral} />
        <Block label="Intraoral" value={data.clinicalExam.exameIntraoral} />
      </Section>

      <Section n={10} title="Avaliação da Dor">
        <div className="print-grid-3">
          <Field label="Escala" value={String(data.painAssessment.escala)} />
          <Field label="Local" value={data.painAssessment.local} />
          <Field label="Tipo" value={painTypeLabel(data.painAssessment.tipo)} />
        </div>
      </Section>

      <Section n={11} title="Riscos">
        <Field label="Classificação" value={riskLabel(data.risk.level)} />
        <Block label="Observações" value={data.risk.notes} />
      </Section>

      <Section n={12} title="Observações">
        <Block label="Observações gerais" value={data.observations} />
      </Section>

      <Section n={13} title="Termo de Consentimento">
        <p className="print-consent">{CONSENT_PRINT}</p>
        <div className="print-signature-block">
          <div className="print-signature-line">
            <span>{data.consent.signature || ""}</span>
            <div className="print-line" />
            <p>Assinatura do cliente</p>
          </div>
          <div className="print-signature-line print-signature-date">
            <span>{formatPrintDate(data.consent.date)}</span>
            <div className="print-line" />
            <p>Data</p>
          </div>
        </div>
      </Section>
    </article>
  );
}
