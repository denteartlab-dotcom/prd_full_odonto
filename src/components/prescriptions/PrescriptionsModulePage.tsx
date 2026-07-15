"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Pill, RefreshCw } from "lucide-react";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui";

export function PrescriptionsModulePage() {
  const [items, setItems] = useState<PrescriptionRecord[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/memed/prescriptions");
    const data = await res.json();
    setConfigured(data.configured !== false);
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Receitas médicas"
        description="Prescrições eletrônicas via Memed — medicamentos, posologia e receita digital."
        action={
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        }
      />

      {!configured ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Configure as credenciais Memed nas variáveis de ambiente para habilitar o receituário digital.
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-400">Carregando prescrições...</p>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">Nenhuma prescrição registrada</p>
            <p className="mt-1 text-sm text-slate-500">
              Abra o perfil de um paciente → aba <strong>Receitas</strong> → Prescrever.
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
                    <td className="px-4 py-3 text-slate-700">{item.content}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {item.pdfUrl ? (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            PDF
                          </a>
                        ) : null}
                        {item.digitalLink ? (
                          <a
                            href={item.digitalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Digital
                          </a>
                        ) : null}
                      </div>
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
