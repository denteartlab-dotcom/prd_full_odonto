"use client";

import { Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui";
import { money } from "@/lib/utils";

export function AsaasChargeModal({
  open,
  onClose,
  title,
  amount,
  billingType,
  bankSlipUrl,
  invoiceUrl,
  pixPayload,
  pixQrImage,
  status,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  billingType?: string | null;
  bankSlipUrl?: string | null;
  invoiceUrl?: string | null;
  pixPayload?: string | null;
  pixQrImage?: string | null;
  status?: string | null;
}) {
  if (!open) return null;

  async function copyPayload() {
    if (!pixPayload) return;
    await navigator.clipboard.writeText(pixPayload);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Cobrança Asaas</h2>
            <p className="text-xs text-slate-500">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-500">Valor</span>
            <span className="font-bold text-slate-900">{money(amount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{billingType || "—"}</span>
            <span>Status: {status || "PENDING"}</span>
          </div>

          {pixQrImage ? (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${pixQrImage}`}
                alt="QR Code PIX"
                className="h-48 w-48 rounded-xl border border-slate-200 bg-white p-2"
              />
              <p className="text-center text-[11px] text-slate-400">
                Pagamento confirma automaticamente via webhook Asaas.
              </p>
            </div>
          ) : null}

          {pixPayload ? (
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                PIX copia e cola
              </p>
              <textarea
                readOnly
                value={pixPayload}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
              />
              <Button type="button" variant="secondary" onClick={copyPayload} className="w-full">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copiar código PIX
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {bankSlipUrl ? (
              <a
                href={bankSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir boleto
              </a>
            ) : null}
            {invoiceUrl ? (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" />
                Fatura Asaas
              </a>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
