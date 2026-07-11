"use client";

import { Plus, Trash2 } from "lucide-react";
import type { AnamnesisMedication, DentalAnamnesis } from "@/lib/anamnesis-types";
import { AnamnesisSectionCard, FieldGrid, FormField, FormInput, FormTextarea, TriStateQuestionRow } from "./shared";

export function MedicationCard({
  data,
  onChange,
}: {
  data: DentalAnamnesis["medications"];
  onChange: (patch: Partial<DentalAnamnesis["medications"]>) => void;
}) {
  const addMedication = () => {
    const med: AnamnesisMedication = {
      id: `med-${Date.now()}`,
      name: "",
      dose: "",
      frequency: "",
      notes: "",
    };
    onChange({ list: [...data.list, med] });
  };

  const updateMed = (id: string, patch: Partial<AnamnesisMedication>) => {
    onChange({
      list: data.list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };

  const removeMed = (id: string) => {
    onChange({ list: data.list.filter((m) => m.id !== id) });
  };

  return (
    <AnamnesisSectionCard id="medicamentos" title="Medicamentos" number={6}>
      <TriStateQuestionRow
        label="Utiliza medicamentos atualmente?"
        value={data.utiliza}
        onChange={(v) => onChange({ utiliza: v })}
      />

      {data.utiliza === "sim" && (
        <div className="space-y-4">
          {data.list.map((med, index) => (
            <div key={med.id} className="rounded-xl border border-slate-200 bg-slate-50/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Medicamento {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeMed(med.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Remover medicamento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <FieldGrid cols={2}>
                <FormField label="Nome">
                  <FormInput value={med.name} onChange={(v) => updateMed(med.id, { name: v })} />
                </FormField>
                <FormField label="Dose">
                  <FormInput value={med.dose} onChange={(v) => updateMed(med.id, { dose: v })} />
                </FormField>
                <FormField label="Frequência">
                  <FormInput value={med.frequency} onChange={(v) => updateMed(med.id, { frequency: v })} />
                </FormField>
                <FormField label="Observações">
                  <FormInput value={med.notes} onChange={(v) => updateMed(med.id, { notes: v })} />
                </FormField>
              </FieldGrid>
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" />
            Adicionar medicamento
          </button>
        </div>
      )}
    </AnamnesisSectionCard>
  );
}

export function SystemsReviewSection({
  data,
  onChange,
}: {
  data: DentalAnamnesis["systemsReview"];
  onChange: (patch: Partial<DentalAnamnesis["systemsReview"]>) => void;
}) {
  const systems = [
    { key: "cardiovascular" as const, label: "Cardiovascular" },
    { key: "respiratorio" as const, label: "Respiratório" },
    { key: "digestivo" as const, label: "Digestivo" },
    { key: "neurologico" as const, label: "Neurológico" },
    { key: "endocrino" as const, label: "Endócrino" },
    { key: "hematologico" as const, label: "Hematológico" },
  ];

  return (
    <AnamnesisSectionCard id="revisao-sistemas" title="Revisão de Sistemas" number={7}>
      <div className="space-y-4">
        {systems.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-slate-800">{label}</span>
              <div className="flex gap-2">
                <StatusButton
                  active={data[key].status === "normal"}
                  label="Normal"
                  variant="normal"
                  onClick={() => onChange({ [key]: { ...data[key], status: "normal" } })}
                />
                <StatusButton
                  active={data[key].status === "alterado"}
                  label="Alterado"
                  variant="altered"
                  onClick={() => onChange({ [key]: { ...data[key], status: "alterado" } })}
                />
              </div>
            </div>
            {data[key].status === "alterado" && (
              <FormTextarea
                value={data[key].notes}
                onChange={(v) => onChange({ [key]: { ...data[key], notes: v } })}
                placeholder="Descreva as alterações..."
                rows={2}
              />
            )}
          </div>
        ))}
      </div>
    </AnamnesisSectionCard>
  );
}

function StatusButton({
  active,
  label,
  variant,
  onClick,
}: {
  active: boolean;
  label: string;
  variant: "normal" | "altered";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? variant === "normal"
            ? "rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800"
            : "rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800"
          : "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white"
      }
    >
      {label}
    </button>
  );
}
