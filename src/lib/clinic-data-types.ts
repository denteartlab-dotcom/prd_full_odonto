export type ClinicWeekDay =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado"
  | "domingo";

export type ClinicDaySchedule = {
  day: ClinicWeekDay;
  label: string;
  open: string;
  close: string;
  breakStart: string;
  breakEnd: string;
  status: "aberto" | "fechado";
};

export type ClinicConvenio = {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  paymentTermDays: number;
  status: "ativo" | "inativo";
};

export type ClinicDataForm = {
  gerais: {
    nomeClinica: string;
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual: string;
    inscricaoMunicipal: string;
    cnae: string;
    dataFundacao: string;
    descricao: string;
    especialidades: string;
    exibirDescricaoDocumentos: boolean;
  };
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  };
  contatos: {
    telefonePrincipal: string;
    whatsapp: string;
    telefoneSecundario: string;
    email: string;
    site: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    horarioContato: string;
  };
  responsavel: {
    nome: string;
    cpf: string;
    rg: string;
    cro: string;
    ufCro: string;
    especialidade: string;
    telefone: string;
    email: string;
    fotoUrl: string;
    assinaturaUrl: string;
    carimboUrl: string;
  };
  horario: ClinicDaySchedule[];
  bancarios: {
    banco: string;
    agencia: string;
    conta: string;
    tipo: string;
    pix: string;
    titular: string;
    documento: string;
  };
  financeiros: {
    moeda: string;
    diasVencimento: number;
    juros: string;
    multa: string;
    descontoMaximo: string;
    taxaAdministrativa: string;
    contaPadrao: string;
    centroCustoPadrao: string;
  };
  fiscais: {
    regimeTributario: string;
    cnae: string;
    inscricaoMunicipal: string;
    codigoIbge: string;
    codigoMunicipio: string;
    emissorNf: string;
    serie: string;
    proximoNumero: string;
  };
  convenios: ClinicConvenio[];
  identidade: {
    logoPrincipal: string;
    logoBranca: string;
    logoEscura: string;
    favicon: string;
    marcaDagua: string;
    corPrimaria: string;
    corSecundaria: string;
    corDestaque: string;
    fonte: string;
  };
  documentos: {
    cabecalho: string;
    rodape: string;
    termosUso: string;
    textoOrcamentos: string;
    textoRecibos: string;
    textoReceitas: string;
    textoAtestados: string;
    modeloContratos: string;
  };
  lgpd: {
    politicaPrivacidade: string;
    consentimento: string;
    compartilhamento: string;
    tempoArmazenamento: string;
    dadosSensiveis: string;
    retencaoProntuarios: string;
  };
  configuracoes: {
    fusoHorario: string;
    formatoData: string;
    formatoMoeda: string;
    idioma: string;
    backupAutomatico: boolean;
    tema: string;
    notificacoes: boolean;
    assinaturaEletronica: boolean;
    autoSave: boolean;
  };
  resumo: {
    plano: string;
    status: "ativa" | "inativa" | "trial";
    espacoUsadoGb: number;
    espacoTotalGb: number;
    pacientes: number;
    profissionais: number;
    consultas: number;
    ultimoBackup: string;
    validadeLicenca: string;
  };
};

export type ClinicDataTabId =
  | "gerais"
  | "endereco"
  | "contatos"
  | "responsavel"
  | "horario"
  | "bancarios"
  | "financeiros"
  | "fiscais"
  | "convenios"
  | "identidade"
  | "documentos"
  | "lgpd"
  | "configuracoes";
