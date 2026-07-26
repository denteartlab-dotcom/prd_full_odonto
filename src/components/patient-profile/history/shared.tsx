"use client";

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Camera,
  ClipboardList,
  FileCheck,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Pill,
  Receipt,
  Settings,
  Smile,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  HistoryEventStatus,
  HistoryEventType,
} from "@/lib/patient-history-types";
import { HISTORY_STATUS_LABELS, HISTORY_TYPE_LABELS } from "@/lib/patient-history-types";

export type HistoryTypeMeta = {
  label: string;
  Icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  badge: string;
  line: string;
};

export const HISTORY_TYPE_META: Record<HistoryEventType, HistoryTypeMeta> = {
  consulta: {
    label: HISTORY_TYPE_LABELS.consulta,
    Icon: Smile,
    iconWrap: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    line: "bg-violet-500",
  },
  anamnese: {
    label: HISTORY_TYPE_LABELS.anamnese,
    Icon: ClipboardList,
    iconWrap: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    line: "bg-emerald-500",
  },
  odontograma: {
    label: HISTORY_TYPE_LABELS.odontograma,
    Icon: Smile,
    iconWrap: "bg-teal-100",
    iconColor: "text-teal-600",
    badge: "bg-teal-100 text-teal-700",
    line: "bg-teal-500",
  },
  procedimento: {
    label: HISTORY_TYPE_LABELS.procedimento,
    Icon: Stethoscope,
    iconWrap: "bg-indigo-100",
    iconColor: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700",
    line: "bg-indigo-500",
  },
  orcamento: {
    label: HISTORY_TYPE_LABELS.orcamento,
    Icon: FileText,
    iconWrap: "bg-emerald-100",
    iconColor: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    line: "bg-emerald-500",
  },
  financeiro: {
    label: HISTORY_TYPE_LABELS.financeiro,
    Icon: Wallet,
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "bg-amber-100 text-amber-800",
    line: "bg-amber-400",
  },
  documento: {
    label: HISTORY_TYPE_LABELS.documento,
    Icon: FileCheck,
    iconWrap: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    line: "bg-violet-500",
  },
  imagem: {
    label: HISTORY_TYPE_LABELS.imagem,
    Icon: Camera,
    iconWrap: "bg-orange-100",
    iconColor: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    line: "bg-orange-500",
  },
  comunicacao: {
    label: HISTORY_TYPE_LABELS.comunicacao,
    Icon: MessageSquare,
    iconWrap: "bg-sky-100",
    iconColor: "text-sky-600",
    badge: "bg-sky-100 text-sky-700",
    line: "bg-sky-500",
  },
  receita: {
    label: HISTORY_TYPE_LABELS.receita,
    Icon: Pill,
    iconWrap: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    line: "bg-rose-500",
  },
  atestado: {
    label: HISTORY_TYPE_LABELS.atestado,
    Icon: FileText,
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    line: "bg-blue-500",
  },
  sistema: {
    label: HISTORY_TYPE_LABELS.sistema,
    Icon: Settings,
    iconWrap: "bg-slate-100",
    iconColor: "text-slate-600",
    badge: "bg-slate-100 text-slate-600",
    line: "bg-slate-400",
  },
};

export const HISTORY_QUICK_ICON: Record<string, LucideIcon> = {
  consulta: Smile,
  proxima_consulta: Calendar,
  financeiro: Wallet,
  orcamento: FileText,
  tratamento: Stethoscope,
  documento: FileCheck,
  imagem: ImageIcon,
  receita: Pill,
};

export function HistoryStatusBadge({ status }: { status: HistoryEventStatus }) {
  const map: Record<HistoryEventStatus, string> = {
    concluida: "bg-emerald-100 text-emerald-700",
    pago: "bg-emerald-100 text-emerald-700",
    pendente: "bg-amber-100 text-amber-800",
    enviado: "bg-blue-100 text-blue-700",
    assinado: "bg-violet-100 text-violet-700",
    agendada: "bg-sky-100 text-sky-700",
    cancelado: "bg-rose-100 text-rose-700",
    ativo: "bg-indigo-100 text-indigo-700",
    rascunho: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        map[status]
      )}
    >
      {HISTORY_STATUS_LABELS[status]}
    </span>
  );
}

export function HistoryTypeBadge({ type }: { type: HistoryEventType }) {
  const meta = HISTORY_TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        meta.badge
      )}
    >
      {meta.label}
    </span>
  );
}

export function formatHistoryDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function formatHistoryDateTime(date: string, time: string) {
  return `${formatHistoryDate(date)} às ${time}`;
}

export function moneyHistory(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
