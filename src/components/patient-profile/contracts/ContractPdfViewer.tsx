"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Printer, X } from "lucide-react";
import { gerarPdfContratoDeElemento } from "@/lib/contract-html-to-pdf";

type Props = {
  fileName: string;
  backHref: string;
  /** Muda quando paciente/clínica/contrato mudam — dispara nova geração do PDF. */
  sourceKey: string;
  children: React.ReactNode;
};

/**
 * Gera PDF real do contrato preenchido e abre no viewer nativo do navegador (iframe).
 */
export function ContractPdfViewer({
  fileName,
  backHref,
  sourceKey,
  children,
}: Props) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const pdfUrlRef = useRef("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const source = sourceRef.current;
      if (!source) return;
      setLoading(true);
      setError("");
      try {
        const blob = await gerarPdfContratoDeElemento(source);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        const previous = pdfUrlRef.current;
        pdfUrlRef.current = url;
        setPdfUrl(url);
        if (previous) URL.revokeObjectURL(previous);
      } catch (err) {
        if (cancelled) return;
        console.error("[ContractPdfViewer]", err);
        setError(
          err instanceof Error ? err.message : "Não foi possível gerar o PDF do contrato."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      void build();
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [sourceKey]);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = "";
      }
    };
  }, []);

  function printPdf() {
    const iframe = document.getElementById(
      "contract-pdf-viewer"
    ) as HTMLIFrameElement | null;
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch {
      /* ignorar */
    }
  }

  function downloadPdf() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    a.click();
  }

  function openInNewTab() {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#525659] text-white">
      <div className="flex items-center justify-between border-b border-black/40 bg-[#3c3c3c] px-3 py-2">
        <p className="truncate text-xs text-white/80">{fileName}</p>
        <div className="flex items-center gap-2">
          {pdfUrl ? (
            <>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                title="Baixar PDF"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar
              </button>
              <button
                type="button"
                onClick={openInNewTab}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                title="Abrir em nova aba"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Nova aba
              </button>
              <button
                type="button"
                onClick={printPdf}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                title="Imprimir"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir
              </button>
            </>
          ) : null}
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            title="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#525659]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-white/70">
            Gerando PDF do contrato...
          </div>
        ) : null}
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <p className="text-xs text-white/60">
              Você ainda pode imprimir o HTML abaixo com Ctrl+P.
            </p>
          </div>
        ) : null}
        {pdfUrl ? (
          <iframe
            id="contract-pdf-viewer"
            title={fileName}
            src={pdfUrl}
            className="absolute inset-0 h-full w-full border-0 bg-[#525659]"
          />
        ) : null}
      </div>

      {/* Fonte HTML fora da tela — usada só para gerar o PDF */}
      <div
        ref={sourceRef}
        aria-hidden
        className="pointer-events-none fixed left-[-12000px] top-0 w-[794px] bg-white text-slate-900"
      >
        {children}
      </div>
    </div>
  );
}
