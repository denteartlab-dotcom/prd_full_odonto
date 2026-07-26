export type HistoryEventType =
  | "consulta"
  | "anamnese"
  | "odontograma"
  | "procedimento"
  | "orcamento"
  | "financeiro"
  | "documento"
  | "imagem"
  | "comunicacao"
  | "receita"
  | "atestado"
  | "sistema";

export type HistoryEventStatus =
  | "concluida"
  | "pago"
  | "pendente"
  | "enviado"
  | "assinado"
  | "agendada"
  | "cancelado"
  | "ativo"
  | "rascunho";

export type HistoryTimeGroup =
  | "hoje"
  | "ontem"
  | "esta_semana"
  | "este_mes"
  | "ano_anterior"
  | "mais_antigo";

export type PatientHistoryEventFull = {
  id: string;
  type: HistoryEventType;
  title: string;
  description: string;
  detail?: string;
  amount?: number;
  professional: string;
  specialty?: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  status: HistoryEventStatus;
  observations?: string;
  attachments?: { id: string; name: string; kind: string }[];
  relatedTab?: string;
};

export type HistoryProfessionalStat = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  count: number;
  color: string;
};

export type HistoryQuickIndicator = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon: HistoryEventType | "proxima_consulta" | "tratamento";
  actionLabel?: string;
};

export type HistoryFilterState = {
  search: string;
  type: HistoryEventType | "todos";
  professional: string; // "todos" | name
  dateFrom: string;
  dateTo: string;
};

export type HistoryStats = {
  total: number;
  consulta: number;
  procedimento: number;
  financeiro: number;
  documento: number;
  imagem: number;
  orcamento: number;
  receita: number;
  atestado: number;
  comunicacao: number;
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilterState = {
  search: "",
  type: "todos",
  professional: "todos",
  dateFrom: "",
  dateTo: "",
};

export const HISTORY_TYPE_LABELS: Record<HistoryEventType, string> = {
  consulta: "Consulta",
  anamnese: "Anamnese",
  odontograma: "Odontograma",
  procedimento: "Procedimento",
  orcamento: "Orçamento",
  financeiro: "Financeiro",
  documento: "Documento",
  imagem: "Imagem",
  comunicacao: "Comunicação",
  receita: "Receita",
  atestado: "Atestado",
  sistema: "Sistema",
};

export const HISTORY_STATUS_LABELS: Record<HistoryEventStatus, string> = {
  concluida: "Concluída",
  pago: "Pago",
  pendente: "Pendente",
  enviado: "Enviado",
  assinado: "Assinado",
  agendada: "Agendada",
  cancelado: "Cancelado",
  ativo: "Ativo",
  rascunho: "Rascunho",
};

export const HISTORY_GROUP_LABELS: Record<HistoryTimeGroup, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  esta_semana: "Esta semana",
  este_mes: "Este mês",
  ano_anterior: "Ano anterior",
  mais_antigo: "Mais antigo",
};
