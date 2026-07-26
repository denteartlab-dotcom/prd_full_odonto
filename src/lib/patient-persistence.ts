import type { Patient } from "@prisma/client";
import type { PatientFormState } from "@/components/patients/patient-form-types";
import { formToProfile } from "@/lib/patient-profile-mock";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { ListPatient, PatientStatus } from "@/lib/patients-list-mock";

type StoredNotes = {
  v: 1;
  profile: PatientProfile;
};

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "PA"
  );
}

function parseStoredNotes(raw: string | null | undefined): StoredNotes | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as StoredNotes;
    if (parsed?.v === 1 && parsed.profile && typeof parsed.profile === "object") {
      return parsed;
    }
  } catch {
    /* plain text notes */
  }
  return null;
}

function emptyClinical(base: ListPatient): PatientProfile {
  return {
    ...base,
    anamnesis: {
      updatedAt: new Date().toISOString(),
      answers: [],
      allergies: "",
      medications: "",
      diseases: "",
      observations: "",
    },
    upcomingAppointments: [],
    appointmentHistory: [],
    odontogram: [],
    documents: [],
    budgets: [],
    dentalBudgets: [],
    financial: {
      charges: [],
      payments: [],
      timeline: [],
    },
    consultations: [],
    receivables: [],
    payments: [],
    history: [
      {
        id: `h-create-${base.id}`,
        date: base.createdAt,
        title: "Paciente cadastrado",
        description: "Cadastro realizado na clínica",
      },
    ],
    images: [],
    communications: [],
  };
}

export function profileToPrismaData(profile: PatientProfile) {
  const addressParts = [
    profile.endereco,
    profile.numero,
    profile.complemento,
    profile.bairro,
    profile.city && profile.state ? `${profile.city}/${profile.state}` : profile.city || profile.state,
  ].filter(Boolean);

  return {
    name: profile.name.trim(),
    cpf: profile.cpf?.trim() || null,
    birthDate: profile.birthDate
      ? new Date(`${profile.birthDate.slice(0, 10)}T12:00:00`)
      : null,
    phone: profile.phone?.trim() || null,
    email: profile.email?.trim() || null,
    address: addressParts.length ? addressParts.join(", ") : null,
    notes: JSON.stringify({ v: 1, profile } satisfies StoredNotes),
  };
}

export function prismaPatientToProfile(row: Patient): PatientProfile {
  const stored = parseStoredNotes(row.notes);
  const createdAt = row.createdAt.toISOString().slice(0, 10);
  const birthDate = row.birthDate
    ? row.birthDate.toISOString().slice(0, 10)
    : createdAt;

  if (stored?.profile) {
    return {
      ...stored.profile,
      id: row.id,
      name: row.name,
      cpf: row.cpf || stored.profile.cpf || "",
      phone: row.phone || stored.profile.phone || "",
      email: row.email || stored.profile.email || "",
      birthDate: birthDate || stored.profile.birthDate,
      createdAt: stored.profile.createdAt || createdAt,
      notes: stored.profile.observacoesInternas || stored.profile.notes,
    };
  }

  const colorIndex =
    Math.abs(
      row.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    ) % AVATAR_COLORS.length;

  const base: ListPatient = {
    id: row.id,
    name: row.name,
    cpf: row.cpf || "",
    phone: row.phone || "",
    email: row.email || "",
    city: "",
    state: "",
    lastVisit: null,
    status: "ativo" as PatientStatus,
    insurance: "Particular",
    financialResponsible: "Próprio paciente",
    birthDate,
    createdAt,
    initials: initialsFromName(row.name),
    avatarColor: AVATAR_COLORS[colorIndex],
    notes: row.notes || undefined,
  };

  const profile = emptyClinical(base);
  if (row.address) {
    profile.endereco = row.address;
    profile.observacoesInternas = row.notes || undefined;
  }
  return profile;
}

export function formStateToPrismaCreate(form: PatientFormState) {
  const tempId = "temp";
  const profile = formToProfile(form, tempId);
  // Avoid mock clinical defaults for brand-new patients
  const clean: PatientProfile = {
    ...profile,
    anamnesis: {
      updatedAt: new Date().toISOString(),
      answers: [],
      allergies: "",
      medications: "",
      diseases: "",
      observations: form.observacoes || "",
    },
    upcomingAppointments: [],
    appointmentHistory: [],
    odontogram: [],
    documents: [],
    budgets: [],
    dentalBudgets: [],
    financial: {
      charges: [],
      payments: [],
      timeline: [],
    },
    consultations: [],
    receivables: [],
    payments: [],
    history: [
      {
        id: `h-create-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        title: "Paciente cadastrado",
        description: "Cadastro realizado na clínica",
      },
    ],
    images: [],
    communications: [],
  };
  return { profile: clean, data: profileToPrismaData(clean) };
}

export function mergeProfilePatch(
  current: PatientProfile,
  patch: Partial<PatientProfile>
): PatientProfile {
  return { ...current, ...patch, id: current.id };
}
