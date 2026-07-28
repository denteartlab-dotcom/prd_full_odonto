"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Pill, RefreshCw } from "lucide-react";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui";

export function PrescriptionsModulePage() {
  const [items, setItems] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prescricoes", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Receitas odontológicas"
        description="Prescrições gratuitas para cirurgião-dentista — catálogo odontológico, PDF e prontuário."
        action={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-400">Carregando prescrições...</p>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">Nenhuma prescrição registrada</p>
            <p className="mt-1 text-sm text-slate-500">
              Abra o perfil de um paciente → aba <strong>Receitas</strong> → Nova receita.
            </p>
            <Link
              href="/app/pacientes"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Ir para pacientes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Conteúdo</th>
                  <th className="px-4 py-3">Dentista</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/pacientes/${item.patientId}?tab=receitas`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        {item.patientName}
                      </Link>
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-slate-700">{item.content}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.professionalName || "—"}
                      {item.professionalCro ? ` · CRO ${item.professionalCro}` : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={item.pdfUrl || `/api/prescricoes/${item.id}/imprimir`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
