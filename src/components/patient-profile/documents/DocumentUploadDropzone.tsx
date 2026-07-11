"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_FORMATS_LABEL,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/document-types";
import {
  detectFileType,
  formatFileSize,
  isAcceptedFile,
  type PendingUpload,
} from "@/lib/document-mock";
import { DOCUMENT_FILE_TYPE_LABELS } from "@/lib/document-types";
import { DocumentFileIcon } from "./DocumentFileIcon";

export function DocumentUploadDropzone({
  pending,
  onAdd,
  onRemove,
  onOpenUpload,
}: {
  pending: PendingUpload[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onOpenUpload: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).filter(isAcceptedFile);
      if (list.length) onAdd(list);
    },
    [onAdd]
  );

  const accept = ACCEPTED_EXTENSIONS.join(",");

  return (
    <div className="mb-5">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition",
          dragOver
            ? "border-indigo-400 bg-indigo-50/50"
            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <CloudUpload className="mx-auto h-10 w-10 text-indigo-400" />
        <p className="mt-3 text-sm font-semibold text-slate-800">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="mt-1 text-xs text-slate-500">
          PDF, Word, Excel, imagens, ZIP, TXT e CSV até 20MB
        </p>
        <p className="mt-2 text-[11px] text-slate-400">{ACCEPTED_FORMATS_LABEL}</p>
      </div>

      {pending.length > 0 && (
        <ul className="mt-3 space-y-2">
          {pending.map((item) => {
            const fileType = detectFileType(item.file.name, item.file.type);
            const tooLarge = item.file.size > MAX_FILE_SIZE_BYTES;
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <DocumentFileIcon fileType={fileType} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(item.file.size)} · {DOCUMENT_FILE_TYPE_LABELS[fileType]}
                    {tooLarge && (
                      <span className="ml-2 font-semibold text-red-600">
                        Excede 20MB
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        tooLarge ? "bg-red-400" : "bg-indigo-500"
                      )}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                  aria-label="Remover arquivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pending.length > 0 && (
        <button
          type="button"
          onClick={onOpenUpload}
          className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
        >
          Continuar upload →
        </button>
      )}
    </div>
  );
}
