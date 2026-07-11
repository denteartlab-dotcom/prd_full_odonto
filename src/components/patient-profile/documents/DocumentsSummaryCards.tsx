"use client";

import { FileCheck, FileText, FolderOpen, ScanLine } from "lucide-react";

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function DocumentsSummaryCards({
  total,
  personal,
  exams,
  contracts,
}: {
  total: number;
  personal: number;
  exams: number;
  contracts: number;
}) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total de documentos"
        value={total}
        icon={FolderOpen}
        accent="bg-indigo-50 text-indigo-600"
      />
      <SummaryCard
        label="Documentos pessoais"
        value={personal}
        icon={FileText}
        accent="bg-blue-50 text-blue-600"
      />
      <SummaryCard
        label="Exames / radiografias"
        value={exams}
        icon={ScanLine}
        accent="bg-violet-50 text-violet-600"
      />
      <SummaryCard
        label="Contratos / termos"
        value={contracts}
        icon={FileCheck}
        accent="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
}
