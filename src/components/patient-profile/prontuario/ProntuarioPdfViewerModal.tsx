"use client";

import { useEffect, useRef } from "react";
import { Download, Printer, X } from "lucide-react";

export function ProntuarioPdfViewerModal({
  open,
  onClose,
  pdfUrl,
  fileName,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
  loading?: boolean;
  error?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function printPdf() {
    const iframe = iframeRef.current;
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch {
      if (pdfUrl) window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#323639]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">PDF do prontuário</p>
          <p className="truncate text-xs text-white/60">{fileName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pdfUrl ? (
            <>
              <a
                href={pdfUrl}
                download={fileName}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar
              </a>
              <button
                type="button"
                onClick={printPdf}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-white/70">
            Gerando PDF do prontuário...
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-indigo-300 underline"
            >
              Fechar
            </button>
          </div>
        ) : pdfUrl ? (
          <iframe
            ref={iframeRef}
            title={fileName}
            src={`${pdfUrl}#zoom=75`}
            className="h-full w-full border-0 bg-[#525659]"
          />
        ) : null}
      </div>
    </div>
  );
}
