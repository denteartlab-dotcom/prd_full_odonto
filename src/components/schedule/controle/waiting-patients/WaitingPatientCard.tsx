"use client";

import { AlertCircle, Clock, Loader2, Megaphone, Play, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WaitingPatient, WaitingPatientHistory } from "@/lib/waiting-patients-mock";

export function WaitingPatientCard({
  patient,
  onStart,
  onCall,
  isHistory,
}: {
  patient: WaitingPatient | WaitingPatientHistory;
  onStart?: () => void;
  onCall?: () => void;
  isHistory?: boolean;
}) {
  const history = isHistory ? (patient as WaitingPatientHistory) : null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
          {patient.initials || <UserRound className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{patient.patient}</p>
          <p className="mt-0.5 text-xs text-slate-500">Chegou às {patient.arrivalTime}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{patient.procedure}</p>
          {patient.professionalName ? (
            <p className="mt-0.5 text-xs text-slate-400">{patient.professionalName}</p>
          ) : null}

          {!isHistory ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              Aguardando há {patient.waitMinutes} min
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                {history?.action === "atendimento" ? "Atendimento iniciado" : "Paciente chamado"}
              </span>
              <span className="text-slate-500">às {history?.completedAt}</span>
            </div>
          )}

          <p className="mt-1.5 text-xs text-slate-500">
            Horário agendado: <span className="font-semibold text-slate-700">{patient.scheduledTime}</span>
          </p>
        </div>
      </div>

      {!isHistory && onStart && onCall ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onStart}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg",
              "bg-blue-600 px-3 py-2 text-xs font-semibold text-white",
              "shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            )}
          >
            <Play className="h-3.5 w-3.5" />
            Iniciar atendimento
          </button>
          <button
            type="button"
            onClick={onCall}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg",
              "border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700",
              "transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98]"
            )}
          >
            <Megaphone className="h-3.5 w-3.5" />
            Chamar paciente
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function WaitingPatientsEmpty({ tab }: { tab: "espera" | "historico" }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <UserRound className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">
        {tab === "espera" ? "Nenhum paciente aguardando" : "Nenhum registro no histórico"}
      </p>
      <p className="mt-1 max-w-[240px] text-xs text-slate-500">
        {tab === "espera"
          ? "Quando pacientes chegarem, eles aparecerão aqui."
          : "Pacientes atendidos ou chamados aparecerão nesta aba."}
      </p>
    </div>
  );
}

export function WaitingPatientsLoading() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-3 text-sm font-medium text-slate-600">Carregando fila...</p>
    </div>
  );
}

export function WaitingPatientsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
        <AlertCircle className="h-7 w-7 text-rose-600" />
      </div>
      <p className="text-sm font-semibold text-slate-800">Erro ao carregar</p>
      <p className="mt-1 max-w-[260px] text-xs text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
