"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { EmergencyContactsCard } from "@/components/patients/EmergencyContactsCard";
import { InternalNotesCard } from "@/components/patients/InternalNotesCard";
import { PatientAdditionalInfoCard } from "@/components/patients/PatientAdditionalInfoCard";
import { PatientAddressCard } from "@/components/patients/PatientAddressCard";
import { PatientPersonalDataCard } from "@/components/patients/PatientPersonalDataCard";
import { PatientPhotoUploadCard } from "@/components/patients/PatientPhotoUploadCard";
import {
  applyPatientFormToProfile,
  emptyPatientForm,
  profileToPatientForm,
  type PatientFormState,
} from "@/components/patients/patient-form-types";
import type { PatientProfile } from "@/lib/patient-profile-types";

function requiredOk(values: PatientFormState) {
  return Boolean(
    values.nomeCompleto.trim() &&
      values.cpf.trim().length >= 14 &&
      values.dataNascimento.trim().length === 10 &&
      values.sexo &&
      values.telefonePrincipal.trim().length >= 14
  );
}

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
  const [values, setValues] = useState<PatientFormState>(emptyPatientForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setValues(profileToPatientForm(patient));
    setPhotoPreview(null);
    setMessage("");
    setSaving(false);
  }, [open, patient]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function patch(next: Partial<PatientFormState>) {
    setValues((atual) => ({ ...atual, ...next }));
  }

  function onSelectPhoto(file: File | null) {
    setPhotoPreview((atual) => {
      if (atual?.startsWith("blob:")) URL.revokeObjectURL(atual);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function handleSave() {
    if (!requiredOk(values)) {
      setMessage("Preencha os campos obrigatórios marcados com *.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const next = applyPatientFormToProfile(patient, values);
      onSave(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar paciente.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-slate-900/55 p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-patient-title"
        className="relative z-[85] flex h-[100dvh] w-full max-w-[1400px] flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(92vh,960px)] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Pacientes <span className="mx-1.5">›</span> Editar paciente
            </p>
            <h2
              id="edit-patient-title"
              className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            >
              Editar dados do paciente
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {message ? (
            <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {message}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <PatientPersonalDataCard values={values} onChange={patch} />
              <PatientAddressCard values={values} onChange={patch} />
              <PatientAdditionalInfoCard values={values} onChange={patch} />
            </div>

            <div className="space-y-5 xl:sticky xl:top-0 xl:self-start">
              <PatientPhotoUploadCard
                previewUrl={photoPreview}
                onSelect={onSelectPhoto}
              />
              <EmergencyContactsCard
                contacts={values.contatosEmergencia}
                onChange={(contatosEmergencia) => patch({ contatosEmergencia })}
              />
              <InternalNotesCard
                value={values.observacoesInternas}
                onChange={(observacoesInternas) =>
                  patch({ observacoesInternas })
                }
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
