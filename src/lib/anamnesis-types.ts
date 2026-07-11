export type TriState = "sim" | "nao" | "nao_sei" | "";

export type SystemReviewStatus = "normal" | "alterado" | "";

export type RiskLevel = "baixo" | "medio" | "alto";

export type PainType = "latejante" | "pulsatil" | "continua" | "aguda" | "cronica" | "";

export type AnamnesisMedication = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  notes: string;
};

export type AnamnesisVersion = {
  id: string;
  savedAt: string;
  professionalName: string;
  snapshot: string;
};

export type DentalAnamnesis = {
  updatedAt: string;
  updatedBy: string;
  versions: AnamnesisVersion[];

  identification: {
    nome: string;
    cpf: string;
    rg: string;
    sexo: string;
    nascimento: string;
    idade: string;
    estadoCivil: string;
    profissao: string;
    telefone: string;
    whatsapp: string;
    email: string;
    responsavelFinanceiro: string;
    convenio: string;
    plano: string;
    carteirinha: string;
  };

  chiefComplaint: {
    queixa: string;
    quandoComecou: string;
    haQuantoTempo: string;
    dorPresente: TriState;
    escalaDor: number;
    pioraEm: string;
    melhoraEm: string;
    descricao: string;
  };

  medicalHistory: {
    questions: Record<string, TriState>;
    outrasDoencas: string;
  };

  habits: {
    fuma: TriState;
    cigarrosPorDia: string;
    bebeAlcool: TriState;
    frequenciaAlcool: string;
    usaDrogas: TriState;
    bruxismo: TriState;
    respiraBoca: TriState;
    ronca: TriState;
    apneia: TriState;
    praticaEsportes: TriState;
    qualidadeSono: string;
  };

  allergies: {
    possui: TriState;
    medicamentos: string[];
    latex: boolean;
    anestesicos: boolean;
    alimentos: string[];
    outras: string;
    observacoes: string;
  };

  medications: {
    utiliza: TriState;
    list: AnamnesisMedication[];
  };

  systemsReview: {
    cardiovascular: { status: SystemReviewStatus; notes: string };
    respiratorio: { status: SystemReviewStatus; notes: string };
    digestivo: { status: SystemReviewStatus; notes: string };
    neurologico: { status: SystemReviewStatus; notes: string };
    endocrino: { status: SystemReviewStatus; notes: string };
    hematologico: { status: SystemReviewStatus; notes: string };
  };

  dentalHistory: {
    ultimaConsulta: string;
    ultimaRadiografia: string;
    fezCanal: TriState;
    fezImplante: TriState;
    usouAparelho: TriState;
    sensibilidade: TriState;
    sangramentoGengival: TriState;
    escovacoesDia: string;
    usaFioDental: TriState;
    medoDentista: TriState;
    reacaoAnestesia: TriState;
    observacoes: string;
  };

  clinicalExam: {
    pressaoArterial: string;
    temperatura: string;
    frequenciaCardiaca: string;
    peso: string;
    altura: string;
    imc: string;
    exameExtraoral: string;
    exameIntraoral: string;
    atm: string;
    linfonodos: string;
    mucosa: string;
    lingua: string;
    palato: string;
    labios: string;
  };

  painAssessment: {
    escala: number;
    local: string;
    tipo: PainType;
  };

  risk: {
    level: RiskLevel;
    notes: string;
  };

  observations: string;

  consent: {
    agreed: boolean;
    signature: string;
    date: string;
  };
};

export const MEDICAL_HISTORY_QUESTIONS: { id: string; label: string }[] = [
  { id: "tratamento_medico", label: "Está em tratamento médico?" },
  { id: "cirurgia", label: "Já teve cirurgia?" },
  { id: "internacao", label: "Já foi internado?" },
  { id: "doenca_cardiaca", label: "Possui doença cardíaca?" },
  { id: "hipertensao", label: "Hipertensão?" },
  { id: "diabetes", label: "Diabetes?" },
  { id: "respiratorio", label: "Problemas respiratórios?" },
  { id: "renal", label: "Problemas renais?" },
  { id: "hepatico", label: "Problemas hepáticos?" },
  { id: "tireoide", label: "Problemas na tireoide?" },
  { id: "epilepsia", label: "Epilepsia?" },
  { id: "convulsoes", label: "Convulsões?" },
  { id: "avc", label: "AVC?" },
  { id: "coagulacao", label: "Problemas de coagulação?" },
  { id: "anticoagulantes", label: "Usa anticoagulantes?" },
  { id: "marcapasso", label: "Marcapasso?" },
  { id: "protese_cardiaca", label: "Prótese cardíaca?" },
  { id: "endocardite", label: "Endocardite?" },
  { id: "febre_reumatica", label: "Febre reumática?" },
  { id: "osteoporose", label: "Osteoporose?" },
  { id: "bifosfonatos", label: "Uso de bifosfonatos?" },
  { id: "radioterapia", label: "Radioterapia?" },
  { id: "quimioterapia", label: "Quimioterapia?" },
  { id: "gravidez", label: "Gravidez?" },
  { id: "amamentando", label: "Amamentando?" },
  { id: "imunossuprimido", label: "Paciente imunossuprimido?" },
  { id: "covid", label: "COVID recente?" },
];

export const ANAMNESIS_SECTIONS = [
  { id: "identificacao", label: "Identificação", number: 1 },
  { id: "queixa", label: "Queixa Principal", number: 2 },
  { id: "historia-medica", label: "História Médica", number: 3 },
  { id: "habitos", label: "Hábitos", number: 4 },
  { id: "alergias", label: "Alergias", number: 5 },
  { id: "medicamentos", label: "Medicamentos", number: 6 },
  { id: "revisao-sistemas", label: "Revisão de Sistemas", number: 7 },
  { id: "historia-odontologica", label: "História Odontológica", number: 8 },
  { id: "exame-clinico", label: "Exame Clínico", number: 9 },
  { id: "avaliacao-dor", label: "Avaliação da Dor", number: 10 },
  { id: "riscos", label: "Riscos", number: 11 },
  { id: "observacoes", label: "Observações", number: 12 },
  { id: "consentimento", label: "Termo de Consentimento", number: 13 },
] as const;

export type AnamnesisSectionId = (typeof ANAMNESIS_SECTIONS)[number]["id"];
