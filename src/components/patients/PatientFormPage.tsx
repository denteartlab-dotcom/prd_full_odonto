"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, Search } from "lucide-react";
import { EmergencyContactsCard } from "./EmergencyContactsCard";
import { FormFooterActions } from "./FormFooterActions";
import { InternalNotesCard } from "./InternalNotesCard";
import { PatientAdditionalInfoCard } from "./PatientAdditionalInfoCard";
import { PatientAddressCard } from "./PatientAddressCard";
import { PatientPersonalDataCard } from "./PatientPersonalDataCard";
import { PatientPhotoUploadCard } from "./PatientPhotoUploadCard";
import { usePatients } from "@/contexts/patients-context";
import { emptyPatientForm, type PatientFormState } from "./patient-form-types";

function requiredOk(values: PatientFormState) {
  return Boolean(
    values.nomeCompleto.trim() &&
      values.cpf.trim().length >= 14 &&
      values.dataNascimento.trim().length === 10 &&
      values.sexo &&
      values.telefonePrincipal.trim().length >= 14
  );
}

export function PatientFormPage({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const router = useRouter();
  const { addPatientFromForm } = usePatients();
  const [values, setValues] = useState<PatientFormState>(emptyPatientForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const initials = useMemo(
    () =>
      userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join(""),
    [userName]
  );

  const roleLabel =
    role === "admin" || role === "proprietario" ? "Administradora" : role;

  function patch(next: Partial<PatientFormState>) {
    setValues((atual) => ({ ...atual, ...next }));
  }

  function onSelectPhoto(file: File | null) {
    setPhotoPreview((atual) => {
      if (atual?.startsWith("blob:")) URL.revokeObjectURL(atual);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSave(mode: "save" | "save_new") {
    if (!requiredOk(values)) {
      setMessage("Preencha os campos obrigatórios marcados com *.");
      return;
    }

    setSaving(true);
    setMessage("");

    // Frontend only — simula persistência local
    await new Promise((r) => setTimeout(r, 450));
    const newId = addPatientFromForm(values);

    setSaving(false);

    if (mode === "save_new") {
      setValues(emptyPatientForm());
      onSelectPhoto(null);
      setMessage("Paciente salvo. Formulário pronto para um novo cadastro.");
      return;
    }

    router.push(`/app/pacientes/${newId}`);
  }

  return (
    <div className="mx-auto max-w-[1400px] pb-4">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            <Link href="/app/pacientes" className="hover:text-indigo-600">
              Pacientes
            </Link>
            <span className="mx-1.5">›</span>
            <span>Novo paciente</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Cadastrar paciente
          </h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:max-w-2xl xl:justify-end">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar paciente, consulta, orçamento..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-14 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              ⌘ K
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm"
              aria-label="Ajuda"
            >
              <CircleHelp className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">
                {initials || "U"}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
                <p className="text-[11px] capitalize text-slate-500">{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {message ? (
        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <PatientPersonalDataCard values={values} onChange={patch} />
          <PatientAddressCard values={values} onChange={patch} />
          <PatientAdditionalInfoCard values={values} onChange={patch} />
        </div>

        <div className="space-y-5 xl:sticky xl:top-4 xl:self-start">
          <PatientPhotoUploadCard previewUrl={photoPreview} onSelect={onSelectPhoto} />
          <EmergencyContactsCard
            contacts={values.contatosEmergencia}
            onChange={(contatosEmergencia) => patch({ contatosEmergencia })}
          />
          <InternalNotesCard
            value={values.observacoesInternas}
            onChange={(observacoesInternas) => patch({ observacoesInternas })}
          />
        </div>
      </div>

      <FormFooterActions
        saving={saving}
        onSave={() => void handleSave("save")}
        onSaveAndNew={() => void handleSave("save_new")}
      />
    </div>
  );
}
