import type {
  HistoryEventStatus,
  HistoryEventType,
  PatientHistoryEventFull,
} from "@/lib/patient-history-types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function splitDateTime(d: Date): { date: string; time: string } {
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mapAppointmentStatus(status: string): HistoryEventStatus {
  const s = status.toLowerCase();
  if (s.includes("cancel")) return "cancelado";
  if (s.includes("final") || s.includes("realiz") || s.includes("conclu")) {
    return "concluida";
  }
  if (s.includes("agend") || s.includes("confirm") || s.includes("aguard") || s.includes("andamento")) {
    return "agendada";
  }
  return "pendente";
}

function mapBudgetStatus(status: string): HistoryEventStatus {
  const s = status.toLowerCase();
  if (s === "aprovado" || s === "ativo") return "ativo";
  if (s === "enviado") return "enviado";
  if (s === "recusado" || s === "cancelado" || s === "expirado") return "cancelado";
  if (s === "rascunho") return "rascunho";
  return "pendente";
}

function mapReceivableStatus(status: string, paidAt: Date | null): HistoryEventStatus {
  if (paidAt || status === "pago") return "pago";
  if (status === "cancelado") return "cancelado";
  return "pendente";
}

export type HistoryDbSources = {
  patientCreatedAt: Date;
  appointments: {
    id: string;
    startsAt: Date;
    status: string;
    type: string | null;
    notes: string | null;
    professionalName: string | null;
    professionalSpecialty: string | null;
  }[];
  treatments: {
    id: string;
    name: string;
    tooth: string | null;
    status: string;
    price: number;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
    professionalName: string | null;
  }[];
  budgets: {
    id: string;
    status: string;
    total: number;
    createdAt: Date;
    itemDescriptions: string[];
    professionalName: string | null;
  }[];
  receivables: {
    id: string;
    description: string;
    amount: number;
    dueDate: Date;
    paidAt: Date | null;
    status: string;
    method: string | null;
    createdAt: Date;
  }[];
  documents: {
    id: string;
    title: string;
    type: string;
    createdAt: Date;
  }[];
  prescriptions: {
    id: string;
    content: string;
    status: string;
    createdAt: Date;
    professionalName: string | null;
  }[];
  medicalNotes: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
  }[];
  medicalCertificates: {
    id: string;
    documentNumber: string;
    certificateType: string;
    certificateText: string;
    createdAt: Date;
    professionalName: string | null;
  }[];
  anamnesis: {
    updatedAt: Date;
    allergies: string | null;
    medications: string | null;
    chronicDiseases: string | null;
  } | null;
  odontogramCount: number;
  odontogramUpdatedAt: Date | null;
};

/** Monta eventos reais a partir dos módulos persistidos no banco. */
export function buildHistoryEventsFromDb(sources: HistoryDbSources): PatientHistoryEventFull[] {
  const events: PatientHistoryEventFull[] = [];

  const created = splitDateTime(sources.patientCreatedAt);
  events.push({
    id: `sistema-cadastro`,
    type: "sistema",
    title: "Paciente cadastrado",
    description: "Cadastro realizado na clínica",
    professional: "Sistema",
    specialty: "Administrativo",
    date: created.date,
    time: created.time,
    status: "concluida",
    relatedTab: "resumo",
  });

  for (const a of sources.appointments) {
    const { date, time } = splitDateTime(a.startsAt);
    const status = mapAppointmentStatus(a.status);
    events.push({
      id: `consulta-${a.id}`,
      type: "consulta",
      title:
        status === "concluida"
          ? "Consulta realizada"
          : status === "cancelado"
            ? "Consulta cancelada"
            : "Consulta agendada",
      description: a.type?.trim() || "Consulta odontológica",
      detail: a.notes || undefined,
      professional: a.professionalName || "Não informado",
      specialty: a.professionalSpecialty || undefined,
      date,
      time,
      status,
      observations: a.notes || undefined,
      relatedTab: "consultas",
    });
  }

  for (const t of sources.treatments) {
    const when = t.finishedAt || t.startedAt || t.createdAt;
    const { date, time } = splitDateTime(when);
    const status =
      t.status === "concluido" || t.status === "finalizado"
        ? "concluida"
        : t.status === "cancelado"
          ? "cancelado"
          : "ativo";
    events.push({
      id: `proc-${t.id}`,
      type: "procedimento",
      title: "Procedimento",
      description: t.tooth ? `${t.name} · dente ${t.tooth}` : t.name,
      detail: t.price > 0 ? money(t.price) : undefined,
      amount: t.price > 0 ? t.price : undefined,
      professional: t.professionalName || "Não informado",
      date,
      time,
      status,
      relatedTab: "odontograma",
    });
  }

  for (const b of sources.budgets) {
    const { date, time } = splitDateTime(b.createdAt);
    const desc =
      b.itemDescriptions.filter(Boolean).slice(0, 3).join(" · ") ||
      "Orçamento odontológico";
    events.push({
      id: `orc-${b.id}`,
      type: "orcamento",
      title: "Orçamento",
      description: desc,
      detail: money(b.total),
      amount: b.total,
      professional: b.professionalName || "Não informado",
      date,
      time,
      status: mapBudgetStatus(b.status),
      relatedTab: "orcamentos",
    });
  }

  for (const r of sources.receivables) {
    const when = r.paidAt || r.dueDate || r.createdAt;
    const { date, time } = splitDateTime(when);
    const status = mapReceivableStatus(r.status, r.paidAt);
    const method = r.method ? r.method.toUpperCase() : null;
    events.push({
      id: `fin-${r.id}`,
      type: "financeiro",
      title: status === "pago" ? "Pagamento recebido" : "Cobrança",
      description: method
        ? `${method} · ${money(r.amount)}`
        : `${r.description} · ${money(r.amount)}`,
      detail: r.description,
      amount: r.amount,
      professional: "Financeiro",
      specialty: "Financeiro",
      date,
      time,
      status,
      relatedTab: "financeiro",
    });
  }

  for (const d of sources.documents) {
    if ((d.type || "").toLowerCase() === "atestado") continue;
    const { date, time } = splitDateTime(d.createdAt);
    const isImage = /radio|imagem|foto|rx/i.test(d.type) || /radio|imagem|foto|rx/i.test(d.title);
    const type: HistoryEventType = isImage ? "imagem" : "documento";
    events.push({
      id: `doc-${d.id}`,
      type,
      title: isImage ? "Imagem adicionada" : "Documento",
      description: d.title,
      detail: d.type,
      professional: "Clínica",
      date,
      time,
      status: "concluida",
      attachments: [{ id: d.id, name: d.title, kind: d.type }],
      relatedTab: isImage ? "imagens" : "documentos",
    });
  }

  for (const p of sources.prescriptions) {
    const { date, time } = splitDateTime(p.createdAt);
    events.push({
      id: `rec-${p.id}`,
      type: "receita",
      title: "Receita médica",
      description: p.content.slice(0, 120) || "Prescrição",
      professional: p.professionalName || "Não informado",
      date,
      time,
      status: p.status === "cancelada" ? "cancelado" : "ativo",
      relatedTab: "receitas",
    });
  }

  for (const n of sources.medicalNotes) {
    if (/^Atestado odontológico/i.test(n.title || "")) continue;
    const { date, time } = splitDateTime(n.createdAt);
    events.push({
      id: `nota-${n.id}`,
      type: "sistema",
      title: n.title || "Anotação clínica",
      description: n.content.slice(0, 160),
      professional: "Clínica",
      date,
      time,
      status: "concluida",
      relatedTab: "resumo",
    });
  }

  for (const c of sources.medicalCertificates) {
    const { date, time } = splitDateTime(c.createdAt);
    events.push({
      id: `atestado-${c.id}`,
      type: "atestado",
      title: `Atestado ${c.documentNumber}`,
      description:
        c.certificateText.replace(/<[^>]+>/g, "").slice(0, 140) ||
        c.certificateType,
      professional: c.professionalName || "Não informado",
      date,
      time,
      status: "ativo",
      relatedTab: "receitas",
    });
  }

  if (sources.anamnesis) {
    const hasContent = Boolean(
      sources.anamnesis.allergies ||
        sources.anamnesis.medications ||
        sources.anamnesis.chronicDiseases
    );
    if (hasContent) {
      const { date, time } = splitDateTime(sources.anamnesis.updatedAt);
      events.push({
        id: `anamnese-${date}`,
        type: "anamnese",
        title: "Anamnese atualizada",
        description: "Dados de saúde do paciente atualizados",
        professional: "Clínica",
        date,
        time,
        status: "concluida",
        relatedTab: "anamnese",
      });
    }
  }

  if (sources.odontogramCount > 0 && sources.odontogramUpdatedAt) {
    const { date, time } = splitDateTime(sources.odontogramUpdatedAt);
    events.push({
      id: `odonto-${date}`,
      type: "odontograma",
      title: "Odontograma atualizado",
      description: `${sources.odontogramCount} registro(s) no odontograma`,
      professional: "Clínica",
      date,
      time,
      status: "concluida",
      relatedTab: "odontograma",
    });
  }

  return events.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}
