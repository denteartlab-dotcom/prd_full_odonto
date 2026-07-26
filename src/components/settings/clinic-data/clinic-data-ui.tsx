"use client";

import { useRef, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Upload, Trash2 } from "lucide-react";

export function SectionCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-[13px] font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </span>
      {children}
      {hint && !error ? <span className="block text-[11px] text-slate-400">{hint}</span> : null}
      {error ? <span className="block text-[11px] text-rose-600">{error}</span> : null}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        className
      )}
      {...props}
    />
  );
}

export function TextSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        className
      )}
      {...props}
    />
  );
}

export function DropZone({
  label,
  hint = "Arraste o arquivo ou clique para enviar",
  accept,
  onFile,
}: {
  label: string;
  hint?: string;
  accept?: string;
  onFile?: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
      <Upload className="mb-2 h-5 w-5 text-brand-600" />
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <span className="mt-1 text-xs text-slate-500">{hint}</span>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile?.(file);
        }}
      />
    </label>
  );
}

export function LogoPreview({
  name,
  logoUrl,
  onChange,
  onRemove,
  saving,
}: {
  name: string;
  logoUrl?: string | null;
  onChange?: (dataUrl: string) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  saving?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setError("");
    setBusy(true);
    try {
      const { fileToClinicLogoDataUrl } = await import("@/lib/clinic-logo");
      const dataUrl = await fileToClinicLogoDataUrl(file, 256);
      await onChange?.(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Logo da clínica
      </p>

      <div className="flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-slate-100">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`Logo ${name}`}
            className="h-20 w-20 rounded-2xl object-cover shadow-md ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-lg shadow-brand-900/20">
            {name.slice(0, 1).toUpperCase() || "C"}
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3">
        <p className="text-[11px] font-medium text-slate-600">Prévia no menu lateral</p>
        <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-[#0b1b34] px-2.5 py-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-[60px] w-[60px] rounded-xl object-cover ring-1 ring-white/20"
            />
          ) : (
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 text-base font-bold text-white">
              {name.slice(0, 1).toUpperCase() || "C"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Odonto Enterprise</p>
            <p className="truncate text-[10px] text-slate-400">{name || "Clínica"}</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Tamanho recomendado: imagem quadrada (ex.: 512×512). Será ajustada automaticamente.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={busy || saving}
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy || saving ? "Enviando..." : "Alterar logo"}
        </button>
        <button
          type="button"
          disabled={busy || saving || !logoUrl}
          onClick={() => void onRemove?.()}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
          title="Remover logo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function ClinicDataSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-72 rounded-xl bg-slate-200" />
      <div className="h-4 w-96 rounded bg-slate-100" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[420px] rounded-2xl bg-slate-100" />
        <div className="h-[420px] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
