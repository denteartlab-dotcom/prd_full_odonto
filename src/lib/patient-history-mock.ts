import type {
  HistoryEventType,
  HistoryFilterState,
  HistoryProfessionalStat,
  HistoryQuickIndicator,
  HistoryStats,
  HistoryTimeGroup,
  PatientHistoryEventFull,
} from "./patient-history-types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function createPatientHistoryMock(seed = 1): PatientHistoryEventFull[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const events: PatientHistoryEventFull[] = [
    {
      id: `h-${seed}-1`,
      type: "consulta",
      title: "Consulta realizada",
      description: "Limpeza dental + Profilaxia",
      detail: "Procedimento concluído sem intercorrências. Higiene oral boa.",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(today),
      time: "14:30",
      status: "concluida",
      observations: "Paciente colaborativa. Retorno em 6 meses.",
      relatedTab: "consultas",
    },
    {
      id: `h-${seed}-2`,
      type: "financeiro",
      title: "Pagamento recebido",
      description: "PIX · R$ 580,00",
      detail: "Recebido automaticamente via integração",
      amount: 580,
      professional: "Sistema",
      specialty: "Financeiro",
      date: toIso(today),
      time: "14:45",
      status: "pago",
      relatedTab: "financeiro",
    },
    {
      id: `h-${seed}-3`,
      type: "comunicacao",
      title: "Mensagem enviada",
      description: "WhatsApp · Lembrete de retorno",
      professional: "Recepção",
      specialty: "Atendimento",
      date: toIso(addDays(today, -1)),
      time: "09:12",
      status: "enviado",
      relatedTab: "comunicacoes",
    },
    {
      id: `h-${seed}-4`,
      type: "documento",
      title: "Documento enviado",
      description: "Contrato de tratamento",
      detail: "Assinado digitalmente pelo paciente",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -2)),
      time: "11:20",
      status: "assinado",
      attachments: [
        { id: "att-1", name: "contrato-tratamento.pdf", kind: "pdf" },
      ],
      relatedTab: "documentos",
    },
    {
      id: `h-${seed}-5`,
      type: "imagem",
      title: "Radiografia adicionada",
      description: "Periapical — dente 16",
      detail: "Anexada ao prontuário",
      professional: "Dr. Carlos Mendes",
      specialty: "Clínico Geral",
      date: toIso(addDays(today, -3)),
      time: "16:05",
      status: "concluida",
      attachments: [{ id: "att-2", name: "rx-periapical-16.jpg", kind: "image" }],
      relatedTab: "imagens",
    },
    {
      id: `h-${seed}-6`,
      type: "orcamento",
      title: "Orçamento aprovado",
      description: "Implante unitário + Coroa",
      detail: "Valor total R$ 3.500,00 · 6 parcelas",
      amount: 3500,
      professional: "Dr. Rafael Lima",
      specialty: "Implantodontista",
      date: toIso(addDays(today, -5)),
      time: "10:40",
      status: "ativo",
      relatedTab: "orcamentos",
    },
    {
      id: `h-${seed}-7`,
      type: "procedimento",
      title: "Procedimento realizado",
      description: "Restauração em resina — dente 26",
      professional: "Dra. Juliana Costa",
      specialty: "Endodontista",
      date: toIso(addDays(today, -8)),
      time: "15:10",
      status: "concluida",
      relatedTab: "odontograma",
    },
    {
      id: `h-${seed}-8`,
      type: "receita",
      title: "Receita prescrita",
      description: "Amoxicilina 500mg + Ibuprofeno",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -8)),
      time: "15:40",
      status: "enviado",
      relatedTab: "receitas",
    },
    {
      id: `h-${seed}-9`,
      type: "atestado",
      title: "Atestado emitido",
      description: "Afastamento de 1 dia",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -8)),
      time: "15:45",
      status: "enviado",
      attachments: [{ id: "att-3", name: "atestado.pdf", kind: "pdf" }],
      relatedTab: "documentos",
    },
    {
      id: `h-${seed}-10`,
      type: "anamnese",
      title: "Anamnese atualizada",
      description: "Questionário de saúde preenchido",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -12)),
      time: "09:00",
      status: "concluida",
      relatedTab: "anamnese",
    },
    {
      id: `h-${seed}-11`,
      type: "odontograma",
      title: "Odontograma atualizado",
      description: "Marcado tratamento no dente 16",
      professional: "Dr. Carlos Mendes",
      specialty: "Clínico Geral",
      date: toIso(addDays(today, -12)),
      time: "09:25",
      status: "concluida",
      relatedTab: "odontograma",
    },
    {
      id: `h-${seed}-12`,
      type: "consulta",
      title: "Consulta agendada",
      description: "Avaliação de implante",
      professional: "Dr. Rafael Lima",
      specialty: "Implantodontista",
      date: toIso(addDays(today, 7)),
      time: "10:00",
      status: "agendada",
      relatedTab: "consultas",
    },
    {
      id: `h-${seed}-13`,
      type: "financeiro",
      title: "Cobrança gerada",
      description: "Parcela 1/6 — Implante",
      amount: 583.33,
      professional: "Sistema",
      specialty: "Financeiro",
      date: toIso(addDays(today, -20)),
      time: "08:00",
      status: "pago",
      relatedTab: "financeiro",
    },
    {
      id: `h-${seed}-14`,
      type: "sistema",
      title: "Paciente cadastrado",
      description: "Cadastro realizado na clínica",
      professional: "Sistema",
      specialty: "Sistema",
      date: toIso(addDays(today, -90)),
      time: "11:05",
      status: "concluida",
    },
    {
      id: `h-${seed}-15`,
      type: "consulta",
      title: "Consulta realizada",
      description: "Avaliação inicial",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -89)),
      time: "14:00",
      status: "concluida",
      relatedTab: "consultas",
    },
    {
      id: `h-${seed}-16`,
      type: "orcamento",
      title: "Orçamento enviado",
      description: "Plano de clareamento",
      amount: 1200,
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -60)),
      time: "16:30",
      status: "enviado",
      relatedTab: "orcamentos",
    },
    {
      id: `h-${seed}-17`,
      type: "imagem",
      title: "Foto clínica adicionada",
      description: "Antes do clareamento",
      professional: "Dra. Ana Silva",
      specialty: "Clínico geral",
      date: toIso(addDays(today, -45)),
      time: "13:15",
      status: "concluida",
      relatedTab: "imagens",
    },
    {
      id: `h-${seed}-18`,
      type: "comunicacao",
      title: "E-mail enviado",
      description: "Orçamento enviado por e-mail",
      professional: "Recepção",
      specialty: "Atendimento",
      date: toIso(addDays(today, -59)),
      time: "17:00",
      status: "enviado",
      relatedTab: "comunicacoes",
    },
  ];

  return events.sort((a, b) => {
    const da = `${a.date}T${a.time}`;
    const db = `${b.date}T${b.time}`;
    return db.localeCompare(da);
  });
}

export function filterHistoryEvents(
  events: PatientHistoryEventFull[],
  filters: HistoryFilterState
) {
  const q = filters.search.trim().toLowerCase();
  return events.filter((e) => {
    if (filters.type !== "todos" && e.type !== filters.type) return false;
    if (filters.professional !== "todos" && e.professional !== filters.professional) {
      return false;
    }
    if (filters.dateFrom && e.date < filters.dateFrom) return false;
    if (filters.dateTo && e.date > filters.dateTo) return false;
    if (q) {
      const hay = [
        e.title,
        e.description,
        e.detail,
        e.professional,
        e.observations,
        e.specialty,
        ...(e.attachments?.map((a) => a.name) || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function getHistoryTimeGroup(dateIso: string, now = new Date()): HistoryTimeGroup {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateIso + "T12:00:00");
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);

  if (diffDays < 0) {
    // future events still show under this week/month buckets
    if (diffDays >= -7) return "esta_semana";
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      return "este_mes";
    }
    return "mais_antigo";
  }
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return "esta_semana";
  if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
    return "este_mes";
  }
  if (d.getFullYear() === today.getFullYear() - 1) return "ano_anterior";
  return "mais_antigo";
}

export function groupHistoryEvents(events: PatientHistoryEventFull[]) {
  const order: HistoryTimeGroup[] = [
    "hoje",
    "ontem",
    "esta_semana",
    "este_mes",
    "ano_anterior",
    "mais_antigo",
  ];
  const map = new Map<HistoryTimeGroup, PatientHistoryEventFull[]>();
  for (const g of order) map.set(g, []);
  for (const e of events) {
    const g = getHistoryTimeGroup(e.date);
    map.get(g)!.push(e);
  }
  return order
    .map((group) => ({ group, events: map.get(group)! }))
    .filter((g) => g.events.length > 0);
}

export function computeHistoryStats(events: PatientHistoryEventFull[]): HistoryStats {
  const count = (type: HistoryEventType) => events.filter((e) => e.type === type).length;
  return {
    total: events.length,
    consulta: count("consulta"),
    procedimento: count("procedimento"),
    financeiro: count("financeiro"),
    documento: count("documento"),
    imagem: count("imagem"),
    orcamento: count("orcamento"),
    receita: count("receita"),
    atestado: count("atestado"),
    comunicacao: count("comunicacao"),
  };
}

export function computeProfessionalStats(
  events: PatientHistoryEventFull[]
): HistoryProfessionalStat[] {
  const colors = [
    "from-indigo-500 to-violet-600",
    "from-sky-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];
  const map = new Map<string, HistoryProfessionalStat>();
  for (const e of events) {
    if (e.professional === "Sistema") continue;
    const existing = map.get(e.professional);
    if (existing) {
      existing.count += 1;
    } else {
      const initials = e.professional
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
      map.set(e.professional, {
        id: e.professional,
        name: e.professional,
        initials: initials || "DR",
        specialty: e.specialty || "—",
        count: 1,
        color: colors[map.size % colors.length],
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function computeQuickIndicators(
  events: PatientHistoryEventFull[]
): HistoryQuickIndicator[] {
  const pastConsultas = events.filter(
    (e) => e.type === "consulta" && e.status === "concluida"
  );
  const nextConsulta = events
    .filter((e) => e.type === "consulta" && e.status === "agendada")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const lastPayment = events.find((e) => e.type === "financeiro" && e.status === "pago");
  const activeBudget = events.find((e) => e.type === "orcamento" && e.status === "ativo");
  const treatment = events.find(
    (e) => e.type === "procedimento" || (e.type === "orcamento" && e.status === "ativo")
  );
  const lastDoc = events.find((e) => e.type === "documento");

  const fmt = (e?: PatientHistoryEventFull) =>
    e ? `${e.date.split("-").reverse().join("/")} · ${e.time}` : "—";

  return [
    {
      id: "last-consult",
      label: "Última consulta",
      value: pastConsultas[0]?.description || "—",
      hint: fmt(pastConsultas[0]),
      icon: "consulta",
    },
    {
      id: "next-consult",
      label: "Próxima consulta",
      value: nextConsulta?.description || "Sem agendamento",
      hint: nextConsulta ? fmt(nextConsulta) : undefined,
      icon: "proxima_consulta",
    },
    {
      id: "last-payment",
      label: "Último pagamento",
      value: lastPayment?.description || "—",
      hint: fmt(lastPayment),
      icon: "financeiro",
    },
    {
      id: "active-budget",
      label: "Orçamento ativo",
      value: activeBudget?.description || "Nenhum",
      hint: activeBudget?.detail,
      icon: "orcamento",
    },
    {
      id: "treatment",
      label: "Tratamento atual",
      value: treatment?.description || "—",
      hint: treatment?.professional,
      icon: "tratamento",
    },
    {
      id: "last-doc",
      label: "Último documento",
      value: lastDoc?.description || "—",
      hint: fmt(lastDoc),
      icon: "documento",
    },
  ];
}

export function uniqueProfessionals(events: PatientHistoryEventFull[]) {
  return [...new Set(events.map((e) => e.professional))].sort();
}
