"use client";

import { X } from "lucide-react";
import { PROFESSIONALS } from "@/lib/consultation-mock";

export type ScheduleForm = {
  date: string;
  time: string;
  procedure: string;
  professional: string;
};

export function ScheduleConsultationModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: ScheduleForm) => void;
}) {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      date: String(fd.get("date") ?? ""),
      time: String(fd.get("time") ?? ""),
      procedure: String(fd.get("procedure") ?? ""),
      professional: String(fd.get("professional") ?? PROFESSIONALS[0]),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[130] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-bold text-slate-900">Agendar consulta</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Procedimento" name="procedure" required placeholder="Ex: Consulta de retorno" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data" name="date" type="date" required />
            <Field label="Horário" name="time" type="time" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Profissional</label>
            <select
              name="professional"
              defaultValue={PROFESSIONALS[0]}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              {PROFESSIONALS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
      />
    </div>
  );
}
