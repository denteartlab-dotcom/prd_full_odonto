import type {
  HistoryEventType,
  HistoryFilterState,
  HistoryProfessionalStat,
  HistoryQuickIndicator,
  HistoryStats,
  HistoryTimeGroup,
  PatientHistoryEventFull,
} from "./patient-history-types";

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
    if (e.professional === "Sistema" || e.professional === "Financeiro") continue;
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
  const activeBudget = events.find(
    (e) => e.type === "orcamento" && (e.status === "ativo" || e.status === "enviado")
  );
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
      hint: pastConsultas[0] ? fmt(pastConsultas[0]) : undefined,
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
      hint: lastPayment ? fmt(lastPayment) : undefined,
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
      hint: lastDoc ? fmt(lastDoc) : undefined,
      icon: "documento",
    },
  ];
}

export function uniqueProfessionals(events: PatientHistoryEventFull[]) {
  return [...new Set(events.map((e) => e.professional))].sort();
}
