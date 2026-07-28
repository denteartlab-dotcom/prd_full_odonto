"use client";

import { useState } from "react";
import { Eye, FileText, Loader2, MessageCircle, X } from "lucide-react";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry =
    digits.length >= 12 && digits.startsWith("55")
      ? digits
      : digits.length >= 10
        ? `55${digits}`
        : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function VisualizarPdfModal({
  open,
  onClose,
  items,
  patientName,
  patientPhone,
}: {
  open: boolean;
  onClose: () => void;
  items: PrescriptionRecord[];
  patientName: string;
  patientPhone?: string;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!open) return null;

  function viewPdf(item: PrescriptionRecord) {
    window.open(item.pdfUrl || `/api/prescricoes/${item.id}/imprimir`, "_blank");
  }

  async function sendWhatsApp(item: PrescriptionRecord) {
    setError("");
    const phone = (patientPhone || "").replace(/\D/g, "");
    if (phone.length < 10) {
      setError("Paciente sem telefone válido cadastrado para WhatsApp.");
      return;
    }

    setBusyId(item.id);
    try {
      const res = await fetch(`/api/prescricoes/${item.id}/share`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar link da receita.");

      const dateLabel = formatDisplayDate(item.createdAt.slice(0, 10));
      const message =
        `Olá ${patientName.split(" ")[0]}! Segue o link da sua receita odontológica (${dateLabel}):\n\n` +
        `${data.url}\n\n` +
        `Abra o link e use “Imprimir / Salvar como PDF” no navegador.`;

      window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir o WhatsApp.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Receitas do paciente</h3>
              <p className="text-xs text-slate-500">
                Escolha uma receita para visualizar o PDF ou enviar no WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

          {!items.length ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Nenhuma receita emitida para este paciente.
            </p>
          ) : (
            items.map((item) => {
              const meds =
                (item.medications || []).map((m) => m.medicationName).join(", ") ||
                item.content.slice(0, 80);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 hover:border-indigo-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDisplayDate(item.createdAt.slice(0, 10))}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.professionalName || "Dentista"}
                        {item.professionalCro ? ` · ${item.professionalCro}` : ""}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">{meds}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => viewPdf(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Visualizar PDF
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => void sendWhatsApp(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {busyId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5" />
                        )}
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
