"use client";

import Link from "next/link";
import {
  Calendar,
  Download,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PatientProfile, PatientProfileTab } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { PatientOdontogramPanel } from "./PatientOdontogramPanel";
import { PatientBudgetsTab } from "./budgets";
import { PatientFinancialTab } from "./financial";
import { PatientConsultationsTab } from "./consultations";
import { PatientDocumentsTab } from "./documents";
import { PatientPrescriptionsTab } from "./prescriptions";
import { ProfileCard, ProfileField, ProfileLinkButton } from "./ProfileCard";

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmado: "bg-emerald-100 text-emerald-700",
    aprovado: "bg-emerald-100 text-emerald-700",
    pago: "bg-emerald-100 text-emerald-700",
    pendente: "bg-amber-100 text-amber-800",
    atrasado: "bg-red-100 text-red-700",
    rascunho: "bg-slate-100 text-slate-600",
    enviado: "bg-blue-100 text-blue-700",
    recusado: "bg-red-100 text-red-700",
    realizado: "bg-slate-100 text-slate-600",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

export function PatientSummaryTab({ patient }: { patient: PatientProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <ProfileCard title="Informações pessoais" action={<ProfileLinkButton>Ver todos os dados</ProfileLinkButton>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileField label="Nome completo" value={patient.name} />
          <ProfileField label="Nome social" value={patient.nomeSocial} />
          <ProfileField label="CPF" value={patient.cpf} />
          <ProfileField label="RG" value={patient.rg} />
          <ProfileField label="Órgão expedidor" value={patient.orgaoExpedidor} />
          <ProfileField label="Data de nascimento" value={formatDisplayDate(patient.birthDate)} />
          <ProfileField label="Estado civil" value={patient.estadoCivil} />
          <ProfileField label="Profissão" value={patient.profession} />
          <ProfileField label="E-mail" value={patient.email} />
          <ProfileField label="Telefone principal" value={patient.phone} />
          <ProfileField label="Telefone secundário" value={patient.telefoneSecundario} />
        </div>
      </ProfileCard>

      <ProfileCard title="Última consulta" action={<ProfileLinkButton>Ver todas as consultas</ProfileLinkButton>}>
        {patient.lastAppointment ? (
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500">Data:</span> {formatDisplayDate(patient.lastAppointment.date)}</p>
            <p><span className="text-slate-500">Horário:</span> {patient.lastAppointment.time}</p>
            <p><span className="text-slate-500">Procedimento:</span> {patient.lastAppointment.procedure}</p>
            <p><span className="text-slate-500">Profissional:</span> {patient.lastAppointment.professional}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Sem consultas anteriores.</p>
        )}
      </ProfileCard>

      <ProfileCard title="Próximas consultas" action={<ProfileLinkButton>Agendar</ProfileLinkButton>}>
        <ul className="space-y-3">
          {patient.upcomingAppointments.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">{formatDisplayDate(a.date)} · {a.time}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusBadge(a.status))}>
                  {a.status}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{a.procedure}</p>
              <p className="text-xs text-slate-400">{a.professional}</p>
            </li>
          ))}
        </ul>
      </ProfileCard>

      <ProfileCard title="Odontograma" action={<ProfileLinkButton>Ver odontograma completo</ProfileLinkButton>}>
        <PatientOdontogramPanel
          patient={patient}
          interactive={false}
          title=""
          showLegend={false}
          compact
          className="border-0 p-0 shadow-none"
        />
      </ProfileCard>

      <ProfileCard
        title="Documentos"
        action={
          <ProfileLinkButton href={`/app/pacientes/${patient.id}/documentos`}>
            Ver todos os documentos
          </ProfileLinkButton>
        }
      >
        <ul className="space-y-2">
          {patient.documents.map((d) => (
            <li key={d.id} className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="flex-1 font-medium text-slate-800">{d.name}</span>
              <span className="text-xs text-slate-400">{formatDisplayDate(d.uploadedAt)}</span>
            </li>
          ))}
        </ul>
      </ProfileCard>

      <ProfileCard title="Orçamentos" action={<ProfileLinkButton>Ver todos os orçamentos</ProfileLinkButton>}>
        <ul className="space-y-2">
          {patient.budgets.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-semibold text-slate-800">{b.number} · {b.procedure}</p>
                <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusBadge(b.status))}>
                  {b.status}
                </span>
              </div>
              <p className="font-bold text-slate-900">{money(b.value)}</p>
            </li>
          ))}
        </ul>
      </ProfileCard>

      <ProfileCard title="Observações" action={<ProfileLinkButton>Editar observações</ProfileLinkButton>} className="lg:col-span-2 xl:col-span-1">
        <p className="text-sm leading-relaxed text-slate-600">
          {patient.observacoesInternas || "Nenhuma observação registrada."}
        </p>
      </ProfileCard>
    </div>
  );
}

export function PatientTabPanels({
  tab,
  patient,
  onUpdate,
  userName = "Sistema",
}: {
  tab: PatientProfileTab;
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
  userName?: string;
}) {
  if (tab === "resumo") return <PatientSummaryTab patient={patient} />;

  if (tab === "anamnese") {
    return (
      <ProfileCard
        title="Anamnese"
        action={
          <Link
            href={`/app/pacientes/${patient.id}/anamnese`}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Abrir ficha completa
          </Link>
        }
      >
        <p className="mb-4 text-xs text-slate-500">
          Última atualização: {formatDisplayDate(patient.anamnesis.updatedAt.slice(0, 10))}
        </p>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <ProfileField label="Alergias" value={patient.anamnesis.allergies} />
          <ProfileField label="Medicamentos" value={patient.anamnesis.medications} />
          <ProfileField label="Doenças" value={patient.anamnesis.diseases} />
        </div>
        <ul className="space-y-2">
          {patient.anamnesis.answers.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 p-3 text-sm">
              <span className="text-slate-700">{a.question}</span>
              <span className={cn("shrink-0 font-semibold", a.answer ? "text-amber-700" : "text-emerald-700")}>
                {a.answer ? "Sim" : "Não"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">{patient.anamnesis.observations}</p>
        <Link
          href={`/app/pacientes/${patient.id}/anamnese`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
        >
          Ver anamnese odontológica completa →
        </Link>
      </ProfileCard>
    );
  }

  if (tab === "odontograma") {
    return (
      <div className="space-y-4">
        <PatientOdontogramPanel
          patient={patient}
          onUpdate={onUpdate}
          title="Selecione os dentes do trabalho"
        />
        <p className="text-center text-xs text-slate-500">
          Clique nos dentes para selecionar e altere o status clínico abaixo do gráfico.
        </p>
      </div>
    );
  }

  if (tab === "orcamentos") {
    return <PatientBudgetsTab patient={patient} onUpdate={onUpdate} />;
  }

  if (tab === "financeiro") {
    return (
      <PatientFinancialTab
        patient={patient}
        onUpdate={onUpdate}
        userName={userName}
      />
    );
  }

  if (tab === "consultas") {
    return <PatientConsultationsTab patient={patient} onUpdate={onUpdate} />;
  }

  if (tab === "documentos") {
    return (
      <PatientDocumentsTab
        patient={patient}
        onUpdate={onUpdate}
        userName={userName}
      />
    );
  }

  if (tab === "receitas") {
    return <PatientPrescriptionsTab patient={patient} />;
  }

  if (tab === "historico") {
    return (
      <ProfileCard title="Histórico do paciente">
        <ol className="relative space-y-4 border-l-2 border-indigo-100 pl-6">
          {patient.history.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white" />
              <p className="text-xs text-slate-400">{formatDisplayDate(e.date)}</p>
              <p className="font-semibold text-slate-800">{e.title}</p>
              {e.description ? <p className="text-sm text-slate-600">{e.description}</p> : null}
            </li>
          ))}
        </ol>
      </ProfileCard>
    );
  }

  if (tab === "imagens") {
    return (
      <ProfileCard
        title="Imagens"
        action={
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patient.images.map((img) => (
            <div key={img.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-slate-200/80">
                <ImageIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{img.title}</p>
              <p className="text-xs capitalize text-slate-400">{img.category.replace("_", "/")} · {formatDisplayDate(img.date)}</p>
            </div>
          ))}
        </div>
      </ProfileCard>
    );
  }

  return (
    <ProfileCard
      title="Comunicações"
      action={
        <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
          <MessageSquare className="h-3.5 w-3.5" /> Enviar mensagem
        </button>
      }
    >
      <ul className="space-y-2">
        {patient.communications.map((c) => (
          <li key={c.id} className="rounded-lg border border-slate-100 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold capitalize text-slate-800">{c.channel}</span>
              <span className="text-xs text-slate-400">{formatDisplayDate(c.date)}</span>
            </div>
            <p className="mt-1 text-slate-600">{c.message}</p>
            <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusBadge(c.status))}>
              {c.status}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Lembrete de consulta", "Orçamento enviado", "Confirmação"].map((t) => (
          <button key={t} type="button" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
            {t}
          </button>
        ))}
      </div>
    </ProfileCard>
  );
}
