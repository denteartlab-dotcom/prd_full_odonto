"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";

export function PatientEditModal({
  open,
  patient,
  onClose,
  onSave,
}: {
  open: boolean;
  patient: PatientProfile;
  onClose: () => void;
  onSave: (patch: Partial<PatientProfile>) => void;
}) {
  const [form, setForm] = useState({
    name: patient.name,
    cpf: patient.cpf,
    phone: patient.phone,
    email: patient.email,
    insurance: patient.insurance,
    financialResponsible: patient.financialResponsible,
    observacoesInternas: patient.observacoesInternas ?? "",
    status: patient.status,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: patient.name,
        cpf: patient.cpf,
        phone: patient.phone,
        email: patient.email,
        insurance: patient.insurance,
        financialResponsible: patient.financialResponsible,
        observacoesInternas: patient.observacoesInternas ?? "",
        status: patient.status,
      });
    }
  }, [open, patient]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-slate-900/40" onClick={onClose} aria-hidden />
      <div className="fixed left-1/2 top-1/2 z-[85] max-h-[90vh] w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Editar dados do paciente</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {(
            [
              ["name", "Nome completo"],
              ["cpf", "CPF"],
              ["phone", "Telefone"],
              ["email", "E-mail"],
              ["insurance", "Convênio"],
              ["financialResponsible", "Responsável financeiro"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as PatientProfile["status"] }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Observações internas</span>
            <textarea
              value={form.observacoesInternas}
              onChange={(e) => setForm((f) => ({ ...f, observacoesInternas: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                ...form,
                notes: form.observacoesInternas,
              })
            }
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </>
  );
}
