import type { PatientProfile } from "./patient-profile-types";
import { computeAge } from "./patient-profile-types";
import type { DentalAnamnesis } from "./anamnesis-types";
import { MEDICAL_HISTORY_QUESTIONS } from "./anamnesis-types";

function emptyMedicalQuestions(): Record<string, import("./anamnesis-types").TriState> {
  return Object.fromEntries(MEDICAL_HISTORY_QUESTIONS.map((q) => [q.id, ""]));
}

export function createDefaultAnamnesis(patient: PatientProfile, professionalName = "Dra. Ana Silva"): DentalAnamnesis {
  const age = computeAge(patient.birthDate);
  const now = new Date().toISOString();

  return {
    updatedAt: now,
    updatedBy: professionalName,
    versions: [],
    identification: {
      nome: patient.name,
      cpf: patient.cpf,
      rg: patient.rg ?? "",
      sexo: patient.sexo ?? "",
      nascimento: patient.birthDate,
      idade: String(age),
      estadoCivil: patient.estadoCivil ?? "",
      profissao: patient.profession ?? "",
      telefone: patient.phone,
      whatsapp: patient.phone,
      email: patient.email,
      responsavelFinanceiro: patient.financialResponsible,
      convenio: patient.insurance,
      plano: patient.plano ?? "",
      carteirinha: patient.carteirinha ?? "",
    },
    chiefComplaint: {
      queixa: "Dor em dente inferior direito",
      quandoComecou: "Há 3 dias",
      haQuantoTempo: "3 dias",
      dorPresente: "sim",
      escalaDor: 6,
      pioraEm: "Ao mastigar e com alimentos frios",
      melhoraEm: "Com analgésico",
      descricao: patient.anamnesis?.observations ?? "Paciente relata sensibilidade intensa.",
    },
    medicalHistory: {
      questions: {
        ...emptyMedicalQuestions(),
        tratamento_medico: "nao",
        hipertensao: "sim",
        diabetes: "nao",
        anticoagulantes: "nao",
      },
      outrasDoencas: patient.anamnesis?.diseases ?? "",
    },
    habits: {
      fuma: "nao",
      cigarrosPorDia: "",
      bebeAlcool: "nao_sei",
      frequenciaAlcool: "Socialmente",
      usaDrogas: "nao",
      bruxismo: "sim",
      respiraBoca: "nao",
      ronca: "nao",
      apneia: "nao",
      praticaEsportes: "sim",
      qualidadeSono: "Boa",
    },
    allergies: {
      possui: patient.anamnesis?.allergies ? "sim" : "nao",
      medicamentos: patient.anamnesis?.allergies?.includes("Dipirona") ? ["Dipirona"] : [],
      latex: false,
      anestesicos: false,
      alimentos: [],
      outras: "",
      observacoes: patient.anamnesis?.allergies ?? "",
    },
    medications: {
      utiliza: "sim",
      list: [
        {
          id: "med-1",
          name: "Losartana",
          dose: "50mg",
          frequency: "1x ao dia",
          notes: "Uso contínuo",
        },
      ],
    },
    systemsReview: {
      cardiovascular: { status: "alterado", notes: "Hipertensão controlada" },
      respiratorio: { status: "normal", notes: "" },
      digestivo: { status: "normal", notes: "" },
      neurologico: { status: "normal", notes: "" },
      endocrino: { status: "normal", notes: "" },
      hematologico: { status: "normal", notes: "" },
    },
    dentalHistory: {
      ultimaConsulta: patient.lastAppointment?.date ?? "",
      ultimaRadiografia: "2024-01-20",
      fezCanal: "sim",
      fezImplante: "nao",
      usouAparelho: "nao",
      sensibilidade: "sim",
      sangramentoGengival: "sim",
      escovacoesDia: "2",
      usaFioDental: "nao_sei",
      medoDentista: "nao",
      reacaoAnestesia: "nao",
      observacoes: "",
    },
    clinicalExam: {
      pressaoArterial: "120/80",
      temperatura: "36.5°C",
      frequenciaCardiaca: "72 bpm",
      peso: "78",
      altura: "175",
      imc: "25.5",
      exameExtraoral: "Sem alterações visíveis",
      exameIntraoral: "Mucosa íntegra, gengiva levemente inflamada em 46",
      atm: "Normal",
      linfonodos: "Não palpáveis",
      mucosa: "Normal",
      lingua: "Normal",
      palato: "Normal",
      labios: "Normal",
    },
    painAssessment: {
      escala: 6,
      local: "Dente 46",
      tipo: "pulsatil",
    },
    risk: {
      level: "baixo",
      notes: "Paciente ASA I — risco baixo para procedimentos odontológicos.",
    },
    observations: patient.observacoesInternas ?? "",
    consent: {
      agreed: false,
      signature: "",
      date: new Date().toISOString().slice(0, 10),
    },
  };
}
