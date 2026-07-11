"use client";

import { cn } from "@/lib/utils";
import type { TriState } from "@/lib/anamnesis-types";

export function AnamnesisSectionCard({
  id,
  title,
  number,
  children,
  className,
}: {
  id: string;
  title: string;
  number: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {number}
        </span>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/15",
        className
      )}
    />
  );
}

export function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/15",
        className
      )}
    />
  );
}

export function FormSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TriStateToggle({
  value,
  onChange,
  compact,
}: {
  value: TriState;
  onChange: (v: TriState) => void;
  compact?: boolean;
}) {
  const options: { value: TriState; label: string }[] = [
    { value: "sim", label: "Sim" },
    { value: "nao", label: "Não" },
    { value: "nao_sei", label: "Não sei" },
  ];

  return (
    <div className={cn("inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5", compact && "text-xs")}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            compact && "px-2 py-1",
            value === opt.value
              ? opt.value === "sim"
                ? "bg-amber-100 text-amber-800 shadow-sm"
                : opt.value === "nao"
                  ? "bg-emerald-100 text-emerald-800 shadow-sm"
                  : "bg-slate-200 text-slate-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const TRI_STATE_COLUMNS: { value: TriState; label: string }[] = [
  { value: "sim", label: "SIM" },
  { value: "nao", label: "NÃO" },
  { value: "nao_sei", label: "NÃO SEI" },
];

export function TriStateCheckboxCell({
  checked,
  onSelect,
  label,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={checked}
      className={cn(
        "mx-auto flex h-5 w-5 items-center justify-center rounded border-2 bg-white transition",
        checked
          ? "border-indigo-600 bg-indigo-50 shadow-sm"
          : "border-slate-400 hover:border-indigo-400 hover:bg-slate-50"
      )}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />}
    </button>
  );
}

export function TriStateQuestionGrid({
  questions,
  values,
  onChange,
}: {
  questions: { id: string; label: string }[];
  values: Record<string, TriState> | Record<string, TriState | undefined>;
  onChange: (id: string, value: TriState) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_52px_52px_64px] border-b border-slate-200 bg-slate-100/80">
        <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pergunta
        </div>
        {TRI_STATE_COLUMNS.map((col) => (
          <div
            key={col.value}
            className="border-l border-slate-200 px-1 py-2.5 text-center text-[11px] font-bold tracking-wide text-slate-700"
          >
            {col.label}
          </div>
        ))}
      </div>
      {questions.map((q, index) => {
        const current = (values[q.id] ?? "") as TriState;
        return (
          <div
            key={q.id}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_52px_52px_64px] border-b border-slate-100 last:border-b-0",
              index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
            )}
          >
            <div className="flex items-center px-4 py-2.5 text-sm text-slate-700">{q.label}</div>
            {TRI_STATE_COLUMNS.map((col) => (
              <div
                key={col.value}
                className="flex items-center justify-center border-l border-slate-100 py-2.5"
              >
                <TriStateCheckboxCell
                  checked={current === col.value}
                  onSelect={() => onChange(q.id, col.value)}
                  label={`${q.label} — ${col.label}`}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Linha única com cabeçalho SIM / NÃO / NÃO SEI (ex.: alergias, medicamentos) */
export function TriStateQuestionRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TriState;
  onChange: (v: TriState) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_52px_52px_64px] border-b border-slate-200 bg-slate-100/80">
        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pergunta
        </div>
        {TRI_STATE_COLUMNS.map((col) => (
          <div
            key={col.value}
            className="border-l border-slate-200 px-1 py-2 text-center text-[11px] font-bold text-slate-700"
          >
            {col.label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_52px_52px_64px]">
        <div className="flex items-center px-4 py-2.5 text-sm text-slate-700">{label}</div>
        {TRI_STATE_COLUMNS.map((col) => (
          <div key={col.value} className="flex items-center justify-center border-l border-slate-100 py-2.5">
            <TriStateCheckboxCell
              checked={value === col.value}
              onSelect={() => onChange(col.value)}
              label={`${label} — ${col.label}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const colClass = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return <div className={cn("grid gap-4", colClass)}>{children}</div>;
}

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FormLabel required={required}>{label}</FormLabel>
      {children}
    </div>
  );
}

export function PainScaleSlider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <div>
      {label && <FormLabel>{label}</FormLabel>}
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
        />
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white",
            value <= 3 ? "bg-emerald-500" : value <= 6 ? "bg-amber-500" : "bg-red-500"
          )}
        >
          {value}
        </span>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>Sem dor</span>
        <span>Dor máxima</span>
      </div>
    </div>
  );
}

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/15">
      <div className="mb-1 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-indigo-500 hover:text-indigo-800"
              aria-label={`Remover ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder ?? "Digite e pressione Enter"}
        className="w-full bg-transparent px-1 py-1 text-sm outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
    </div>
  );
}
