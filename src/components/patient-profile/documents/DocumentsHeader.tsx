"use client";

import { FileText, FolderOpen, ShieldCheck, Upload } from "lucide-react";

export function DocumentsHeader({
  onUpload,
  onNewFolder,
  onExport,
}: {
  onUpload: () => void;
  onNewFolder: () => void;
  onExport: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Documentos do paciente
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Organize documentos, exames, contratos, imagens e arquivos clínicos.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Upload className="h-4 w-4" />
          Upload documento
        </button>
        <button
          type="button"
          onClick={onNewFolder}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FolderOpen className="h-4 w-4" />
          Nova pasta
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FileText className="h-4 w-4" />
          Exportar lista
        </button>
      </div>
    </div>
  );
}

export function DocumentsSecurityNote() {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500">
      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
      Documentos protegidos e vinculados ao prontuário do paciente.
    </div>
  );
}
