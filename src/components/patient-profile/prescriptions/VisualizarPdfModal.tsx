"use client";

import { useState } from "react";
import { Eye, FileText, Loader2, MessageCircle, X } from "lucide-react";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";

function downloadBase64Pdf(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return blob;
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
  const [success, setSuccess] = useState("");

  if (!open) return null;

  function viewPdf(item: PrescriptionRecord) {
    window.open(`/api/prescricoes/${item.id}/pdf`, "_blank");
  }

  async function sendWhatsApp(item: PrescriptionRecord) {
    setError("");
    setSuccess("");
    const phone = (patientPhone || "").replace(/\D/g, "");
    if (phone.length < 10) {
      setError("Paciente sem telefone válido cadastrado para WhatsApp.");
      return;
    }

    setBusyId(item.id);
    try {
      const res = await fetch(`/api/prescricoes/${item.id}/whatsapp`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar PDF no WhatsApp.");

      if (data.mode === "sent") {
        setSuccess(data.message || "PDF enviado no WhatsApp do paciente.");
        return;
      }

      // Fallback sem Cloud API: baixa PDF e abre conversa
      if (data.pdfBase64 && data.filename) {
        const blob = downloadBase64Pdf(data.pdfBase64, data.filename);
        const file = new File([blob], data.filename, { type: "application/pdf" });

        if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Receita odontológica",
            text: `Receita de ${patientName}`,
          });
          setSuccess("PDF compartilhado. Se o WhatsApp abriu, confirme o envio.");
          return;
        }

        if (data.waUrl) {
          window.open(data.waUrl, "_blank", "noopener,noreferrer");
        }
        setSuccess(
          "PDF gerado e baixado. Anexe o arquivo no WhatsApp que foi aberto (o app não permite anexo automático sem API oficial)."
        );
        return;
      }

      setSuccess(data.message || "Operação concluída.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o PDF.");
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
                Visualize o PDF ou envie o arquivo direto no WhatsApp
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
          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {success}
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
                        Enviar PDF
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
