import type {
  EvolucaoClinica,
  EvolucaoTemplate,
  EvolucaoTipo,
  ProntuarioFilter,
  ProntuarioSort,
} from "@/lib/prontuario-types";

export const EVOLUCAO_TEMPLATES: EvolucaoTemplate[] = [
  {
    id: "tpl-consulta-inicial",
    name: "Consulta Inicial",
    tipo: "consulta",
    queixaPrincipal: "Paciente procura avaliação odontológica inicial.",
    diagnostico: "A definir após exame clínico e radiográfico.",
    procedimento: "Avaliação clínica completa",
    evolucaoClinica:
      "Realizada anamnese, exame clínico intra e extraoral. Orientações de higiene oral prestadas.",
    conduta: "Solicitar exames complementares conforme necessidade e elaborar plano de tratamento.",
    planoTratamento: "Plano personalizado após diagnóstico definitivo.",
  },
  {
    id: "tpl-retorno",
    name: "Retorno",
    tipo: "retorno",
    queixaPrincipal: "Retorno para reavaliação do tratamento em andamento.",
    diagnostico: "Evolução favorável / a reavaliar.",
    procedimento: "Reavaliação clínica",
    evolucaoClinica: "Paciente retorna sem intercorrências. Avaliada cicatrização e adaptação.",
    conduta: "Manter protocolo terapêutico e agendar próximo retorno.",
    planoTratamento: "Continuidade do plano já estabelecido.",
  },
  {
    id: "tpl-extracao",
    name: "Extração",
    tipo: "cirurgia",
    queixaPrincipal: "Indicação de exodontia.",
    diagnostico: "Elemento dentário com indicação de remoção.",
    procedimento: "Exodontia",
    evolucaoClinica:
      "Exodontia realizada sob anestesia local. Hemostasia obtida. Orientações pós-operatórias fornecidas.",
    conduta: "Prescrever analgésico/anti-inflamatório se necessário. Retorno em 7 dias.",
    planoTratamento: "Reabilitação protética ou implantar conforme planejamento.",
  },
  {
    id: "tpl-implante",
    name: "Implante",
    tipo: "implante",
    queixaPrincipal: "Reabilitação com implante osseointegrável.",
    diagnostico: "Área edêntula com indicação de implante.",
    procedimento: "Instalação de implante",
    evolucaoClinica:
      "Implante instalado com estabilidade primária adequada. Sutura realizada. Orientações pós-operatórias.",
    conduta: "Controle radiográfico e retorno para reabertura conforme protocolo.",
    planoTratamento: "Provisório e prótese definitiva após osseointegração.",
  },
  {
    id: "tpl-canal",
    name: "Canal",
    tipo: "endodontia",
    queixaPrincipal: "Dor / necessidade de tratamento endodôntico.",
    diagnostico: "Pulpite / necrose pulpar.",
    procedimento: "Tratamento endodôntico",
    evolucaoClinica:
      "Acesso, instrumentação e irrigação realizados. Medicação intracanal quando indicada.",
    conduta: "Continuidade/obturação na próxima sessão. Analgesia se necessário.",
    planoTratamento: "Restauração definitiva após conclusão endodôntica.",
  },
  {
    id: "tpl-limpeza",
    name: "Limpeza",
    tipo: "limpeza",
    queixaPrincipal: "Profilaxia e manutenção periodontal.",
    diagnostico: "Gengivite / biofilme residual.",
    procedimento: "Profilaxia e raspagem supra-gengival",
    evolucaoClinica: "Remoção de cálculo e biofilme. Polimento e aplicação tópica de flúor.",
    conduta: "Reforço de higiene oral. Retorno em 6 meses.",
    planoTratamento: "Manutenção preventiva.",
  },
  {
    id: "tpl-protese",
    name: "Prótese",
    tipo: "protese",
    queixaPrincipal: "Reabilitação protética.",
    diagnostico: "Necessidade de restauração indireta / prótese.",
    procedimento: "Moldagem / prova / cimentação",
    evolucaoClinica: "Etapa protética realizada conforme planejamento.",
    conduta: "Ajustes oclusais e orientações de higiene sob prótese.",
    planoTratamento: "Conclusão da reabilitação e controles periódicos.",
  },
  {
    id: "tpl-orto",
    name: "Ortodontia",
    tipo: "ortodontia",
    queixaPrincipal: "Acompanhamento ortodôntico.",
    diagnostico: "Má oclusão em tratamento.",
    procedimento: "Manutenção ortodôntica / troca de arco",
    evolucaoClinica: "Avaliação de movimento dentário e integridade do aparelho.",
    conduta: "Próxima manutenção conforme protocolo.",
    planoTratamento: "Continuidade do tratamento ortodôntico.",
  },
  {
    id: "tpl-avaliacao",
    name: "Avaliação",
    tipo: "avaliacao",
    queixaPrincipal: "Avaliação clínica solicitada.",
    diagnostico: "Em investigação.",
    procedimento: "Exame clínico",
    evolucaoClinica: "Avaliação detalhada da queixa e exames complementares.",
    conduta: "Definir conduta após exames.",
    planoTratamento: "A elaborar.",
  },
  {
    id: "tpl-urgencia",
    name: "Urgência",
    tipo: "urgencia",
    queixaPrincipal: "Dor aguda / urgência odontológica.",
    diagnostico: "Quadro agudo a esclarecer.",
    procedimento: "Atendimento de urgência",
    evolucaoClinica: "Paciente acolhido em caráter de urgência. Conduta paliativa instituída.",
    conduta: "Analgesia e agendamento para tratamento definitivo.",
    planoTratamento: "Resolver causa base na próxima consulta.",
  },
];

/** Prontuário inicia sem evoluções — dados reais entram via Nova Evolução / API. */
export function createProntuarioMock(_patientId: string): EvolucaoClinica[] {
  return [];
}

const FILTER_TIPOS: Record<ProntuarioFilter, EvolucaoTipo[] | null> = {
  todos: null,
  consultas: ["consulta", "avaliacao", "retorno", "evolucao"],
  procedimentos: ["procedimento", "limpeza", "protese", "ortodontia", "implante", "endodontia"],
  receitas: ["receita"],
  exames: ["exame"],
  cirurgias: ["cirurgia", "urgencia"],
};

export function filterEvolucoes(
  items: EvolucaoClinica[],
  opts: {
    query: string;
    filter: ProntuarioFilter;
    sort: ProntuarioSort;
  }
) {
  const q = opts.query.trim().toLowerCase();
  const tipos = FILTER_TIPOS[opts.filter];
  let rows = items.filter((e) => e.active);
  if (tipos) rows = rows.filter((e) => tipos.includes(e.tipo));
  if (q) {
    rows = rows.filter((e) =>
      [
        e.titulo,
        e.resumo,
        e.profissional,
        e.procedimento,
        e.diagnostico,
        e.tipo,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  rows = [...rows].sort((a, b) => {
    const av = `${a.date}T${a.time}`;
    const bv = `${b.date}T${b.time}`;
    return opts.sort === "recentes" ? bv.localeCompare(av) : av.localeCompare(bv);
  });
  return rows;
}
