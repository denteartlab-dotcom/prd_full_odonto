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

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function createProntuarioMock(patientId: string): EvolucaoClinica[] {
  const base: Omit<EvolucaoClinica, "id" | "titulo" | "resumo" | "tipo" | "date" | "time" | "procedimento">[] = [];

  const items: EvolucaoClinica[] = [
    {
      id: `ev-${patientId}-1`,
      patientId,
      tipo: "endodontia",
      titulo: "Evolução de Atendimento — Endodontia",
      resumo: "Instrumentação do canal do elemento 26 e medicação intracanal.",
      date: daysAgo(2),
      time: "14:30",
      profissional: "Dr. Carlos Mendes",
      especialidade: "Endodontia",
      status: "finalizado",
      procedimento: "Tratamento de canal — dente 26",
      queixaPrincipal: "Dor espontânea no quadrante superior esquerdo há 3 dias.",
      historiaClinica:
        "Paciente relata sensibilidade crescente ao frio e mastigação. Negou trauma recente.",
      diagnostico: "Pulpite irreversível no elemento 26.",
      procedimentoExecutado:
        "Anestesia, isolamento absoluto, acesso coronário, instrumentação e irrigação com hipoclorito.",
      evolucaoClinica:
        "Condutos instrumentados até comprimento de trabalho. Medicação intracanal com hidróxido de cálcio. Selamento provisório.",
      planoTratamento: "Obturação na próxima sessão e restauração definitiva.",
      conduta: "Analgésico se necessário. Evitar mastigar no lado afetado.",
      recomendacoes: "Retornar em caso de edema ou dor intensa. Manter higiene oral.",
      observacoes: "Paciente colaborativo. Sem intercorrências.",
      retorno: daysAgo(-7),
      prescricoes: [
        {
          id: "rx-1",
          title: "Ibuprofeno 600mg — 3 dias",
          date: daysAgo(2),
          status: "emitida",
        },
      ],
      exames: [
        {
          id: "ex-1",
          title: "Radiografia periapical 26",
          date: daysAgo(2),
          status: "realizado",
        },
      ],
      orcamentos: [
        {
          id: "orc-1",
          number: "ORC-1042",
          title: "Endodontia + restauração 26",
          value: 1450,
          status: "aprovado",
        },
      ],
      fotos: [
        {
          id: "ft-1",
          name: "rx-26.jpg",
          kind: "radiografia",
          mime: "image/jpeg",
          sizeLabel: "420 KB",
        },
      ],
      arquivos: [],
      assinatura: {
        profissional: "Dr. Carlos Mendes",
        cro: "CRO-SP 12345",
        signedAt: `${daysAgo(2)}T14:55:00`,
        signed: true,
      },
      auditLog: [
        {
          id: "log-1",
          user: "Dr. Carlos Mendes",
          at: `${daysAgo(2)}T14:55:00`,
          field: "status",
          previous: "em_atendimento",
          next: "finalizado",
          ip: "187.22.10.4",
        },
      ],
      active: true,
      createdAt: `${daysAgo(2)}T14:30:00`,
      updatedAt: `${daysAgo(2)}T14:55:00`,
    },
    {
      id: `ev-${patientId}-2`,
      patientId,
      tipo: "avaliacao",
      titulo: "Avaliação Inicial",
      resumo: "Exame clínico completo e plano de tratamento preliminar.",
      date: daysAgo(18),
      time: "09:15",
      profissional: "Dra. Ana Silva",
      especialidade: "Clínica Geral",
      status: "finalizado",
      procedimento: "Avaliação clínica",
      queixaPrincipal: "Deseja avaliação geral e orçamento de reabilitação.",
      historiaClinica: "Primeira consulta na clínica. Sem queixas agudas no momento.",
      diagnostico: "Necessidade de tratamento periodontal básico e restaurações.",
      procedimentoExecutado: "Exame clínico e levantamento de necessidades.",
      evolucaoClinica:
        "Identificados focos de biofilme e restaurações deficientes nos posteriores.",
      planoTratamento: "Profilaxia → restaurações → reavaliação estética.",
      conduta: "Solicitar radiografia panorâmica e retorno para discussão do plano.",
      recomendacoes: "Escovação 3x/dia e fio dental diário.",
      observacoes: "Paciente motivada.",
      prescricoes: [],
      exames: [
        {
          id: "ex-2",
          title: "Panorâmica",
          date: daysAgo(18),
          status: "solicitado",
        },
      ],
      orcamentos: [
        {
          id: "orc-2",
          number: "ORC-1008",
          title: "Plano inicial — profilaxia + restaurações",
          value: 980,
          status: "enviado",
        },
      ],
      fotos: [],
      arquivos: [],
      assinatura: {
        profissional: "Dra. Ana Silva",
        cro: "CRO-SP 23456",
        signedAt: `${daysAgo(18)}T09:40:00`,
        signed: true,
      },
      auditLog: [],
      active: true,
      createdAt: `${daysAgo(18)}T09:15:00`,
      updatedAt: `${daysAgo(18)}T09:40:00`,
    },
    {
      id: `ev-${patientId}-3`,
      patientId,
      tipo: "limpeza",
      titulo: "Consulta de Rotina — Profilaxia",
      resumo: "Limpeza e aplicação tópica de flúor.",
      date: daysAgo(40),
      time: "11:00",
      profissional: "Dra. Ana Silva",
      especialidade: "Clínica Geral",
      status: "finalizado",
      procedimento: "Profilaxia",
      queixaPrincipal: "Manutenção periódica.",
      historiaClinica: "Sem alterações desde última visita.",
      diagnostico: "Gengivite leve.",
      procedimentoExecutado: "Raspagem supra-gengival e polimento.",
      evolucaoClinica: "Tecidos gengivais melhorados após remoção de cálculo.",
      planoTratamento: "Manutenção a cada 6 meses.",
      conduta: "Retorno em 6 meses.",
      recomendacoes: "Manter higiene e reduzir consumo de açúcar.",
      observacoes: "",
      prescricoes: [],
      exames: [],
      orcamentos: [],
      fotos: [],
      arquivos: [],
      assinatura: {
        profissional: "Dra. Ana Silva",
        cro: "CRO-SP 23456",
        signedAt: `${daysAgo(40)}T11:25:00`,
        signed: true,
      },
      auditLog: [],
      active: true,
      createdAt: `${daysAgo(40)}T11:00:00`,
      updatedAt: `${daysAgo(40)}T11:25:00`,
    },
    {
      id: `ev-${patientId}-4`,
      patientId,
      tipo: "urgencia",
      titulo: "Urgência — Dor aguda",
      resumo: "Atendimento emergencial com alívio da dor.",
      date: daysAgo(55),
      time: "16:40",
      profissional: "Dr. Carlos Mendes",
      especialidade: "Clínica Geral",
      status: "finalizado",
      procedimento: "Atendimento de urgência",
      queixaPrincipal: "Dor intensa noturna.",
      historiaClinica: "Dor latejante há 24h, piora ao deitar.",
      diagnostico: "Quadro inflamatório agudo — suspeita endodôntica.",
      procedimentoExecutado: "Abertura coronária de urgência e medicação.",
      evolucaoClinica: "Paciente referiu alívio parcial ao final do atendimento.",
      planoTratamento: "Iniciar tratamento endodôntico definitivo.",
      conduta: "Prescrição analgésica e retorno em 48h.",
      recomendacoes: "Compressa fria se houver edema. Evitar analgésico em excesso.",
      observacoes: "Encaminhado para endodontia.",
      prescricoes: [
        {
          id: "rx-2",
          title: "Dipirona 500mg se dor",
          date: daysAgo(55),
          status: "emitida",
        },
      ],
      exames: [],
      orcamentos: [],
      fotos: [],
      arquivos: [],
      assinatura: {
        profissional: "Dr. Carlos Mendes",
        cro: "CRO-SP 12345",
        signedAt: `${daysAgo(55)}T17:05:00`,
        signed: true,
      },
      auditLog: [],
      active: true,
      createdAt: `${daysAgo(55)}T16:40:00`,
      updatedAt: `${daysAgo(55)}T17:05:00`,
    },
  ];

  void base;
  return items;
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
