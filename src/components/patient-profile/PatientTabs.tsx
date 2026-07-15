"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PatientProfileTab } from "@/lib/patient-profile-types";

const TABS: { id: PatientProfileTab; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "anamnese", label: "Anamnese" },
  { id: "odontograma", label: "Odontograma" },
  { id: "orcamentos", label: "Orçamentos" },
  { id: "financeiro", label: "Financeiro" },
  { id: "consultas", label: "Consultas" },
  { id: "documentos", label: "Documentos" },
  { id: "receitas", label: "Receitas" },
  { id: "historico", label: "Histórico" },
  { id: "imagens", label: "Imagens" },
  { id: "comunicacoes", label: "Comunicações" },
];

export function PatientTabs({
  active,
  onChange,
}: {
  active: PatientProfileTab;
  onChange: (tab: PatientProfileTab) => void;
}) {
  return (
    <nav className="mb-5 overflow-x-auto border-b border-slate-200">
      <div className="flex min-w-max gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function usePatientProfileTab(initial: PatientProfileTab = "resumo") {
  return useState<PatientProfileTab>(initial);
}
