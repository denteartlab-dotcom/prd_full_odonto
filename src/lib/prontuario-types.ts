export type EvolucaoTipo =
  | "consulta"
  | "avaliacao"
  | "retorno"
  | "procedimento"
  | "cirurgia"
  | "limpeza"
  | "protese"
  | "ortodontia"
  | "implante"
  | "endodontia"
  | "urgencia"
  | "evolucao"
  | "receita"
  | "exame";

export type EvolucaoStatus =
  | "rascunho"
  | "em_atendimento"
  | "finalizado"
  | "cancelado"
  | "inativo";

export type ProntuarioFilter =
  | "todos"
  | "consultas"
  | "procedimentos"
  | "receitas"
  | "exames"
  | "cirurgias";

export type ProntuarioSort = "recentes" | "antigas";

export type EvolucaoAnexo = {
  id: string;
  name: string;
  kind: "foto" | "arquivo" | "exame" | "radiografia" | "stl";
  mime: string;
  sizeLabel: string;
  url?: string;
};

export type EvolucaoPrescricao = {
  id: string;
  title: string;
  date: string;
  status: "emitida" | "rascunho";
};

export type EvolucaoExame = {
  id: string;
  title: string;
  date: string;
  status: "solicitado" | "realizado" | "pendente";
};

export type EvolucaoOrcamento = {
  id: string;
  number: string;
  title: string;
  value: number;
  status: string;
};

export type EvolucaoAssinatura = {
  profissional: string;
  cro: string;
  signedAt: string;
  signed: boolean;
};

export type EvolucaoAuditLog = {
  id: string;
  user: string;
  at: string;
  field: string;
  previous: string;
  next: string;
  ip?: string;
};

export type EvolucaoClinica = {
  id: string;
  patientId: string;
  tipo: EvolucaoTipo;
  titulo: string;
  resumo: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  profissional: string;
  especialidade: string;
  status: EvolucaoStatus;
  procedimento: string;
  queixaPrincipal: string;
  historiaClinica: string;
  diagnostico: string;
  procedimentoExecutado: string;
  evolucaoClinica: string;
  planoTratamento: string;
  conduta: string;
  recomendacoes: string;
  observacoes: string;
  retorno?: string;
  prescricoes: EvolucaoPrescricao[];
  exames: EvolucaoExame[];
  orcamentos: EvolucaoOrcamento[];
  fotos: EvolucaoAnexo[];
  arquivos: EvolucaoAnexo[];
  assinatura?: EvolucaoAssinatura;
  auditLog: EvolucaoAuditLog[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EvolucaoTemplate = {
  id: string;
  name: string;
  tipo: EvolucaoTipo;
  queixaPrincipal: string;
  diagnostico: string;
  procedimento: string;
  evolucaoClinica: string;
  conduta: string;
  planoTratamento: string;
};

export type NovaEvolucaoForm = {
  tipo: EvolucaoTipo;
  date: string;
  time: string;
  profissional: string;
  especialidade: string;
  queixaPrincipal: string;
  diagnostico: string;
  procedimento: string;
  descricaoCompleta: string;
  conduta: string;
  planoTratamento: string;
  retorno: string;
  observacoes: string;
  templateId: string;
};

export const EVOLUCAO_TIPO_LABEL: Record<EvolucaoTipo, string> = {
  consulta: "Consulta",
  avaliacao: "Avaliação",
  retorno: "Retorno",
  procedimento: "Procedimento",
  cirurgia: "Cirurgia",
  limpeza: "Limpeza",
  protese: "Prótese",
  ortodontia: "Ortodontia",
  implante: "Implante",
  endodontia: "Endodontia",
  urgencia: "Urgência",
  evolucao: "Evolução",
  receita: "Receita",
  exame: "Exame",
};

export const EVOLUCAO_STATUS_LABEL: Record<EvolucaoStatus, string> = {
  rascunho: "Rascunho",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  inativo: "Inativo",
};

export function emptyNovaEvolucaoForm(
  profissional = "Dr(a). Responsável"
): NovaEvolucaoForm {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    tipo: "evolucao",
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    profissional,
    especialidade: "Clínica Geral",
    queixaPrincipal: "",
    diagnostico: "",
    procedimento: "",
    descricaoCompleta: "",
    conduta: "",
    planoTratamento: "",
    retorno: "",
    observacoes: "",
    templateId: "",
  };
}
