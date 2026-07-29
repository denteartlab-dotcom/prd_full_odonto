"use client";

import { useMemo } from "react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { computeAge } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import {
  CERTIFICATE_TYPE_LABELS,
  type CertificateType,
} from "@/lib/certificate-types";

export type AtestadoPreviewModel = {
  clinicName: string;
  clinicHeaderLines: string[];
  clinicLogoUrl?: string | null;
  clinicCity?: string | null;
  clinicState?: string | null;
  dentistName: string;
  dentistCro?: string | null;
  dentistSpecialty?: string | null;
  certificateType: CertificateType;
  certificateText: string;
  procedureName: string;
  attendanceDate: string;
  startTime: string;
  endTime: string;
  days: string;
  hours: string;
  companionName: string;
  companionCpf: string;
  cid: string;
  cidDescription: string;
  observations: string;
  documentNumber: string;
  validationUrl: string;
};

export function AtestadoPreview({
  patient,
  model,
}: {
  patient: PatientProfile;
  model: AtestadoPreviewModel;
}) {
  const age = useMemo(() => computeAge(patient.birthDate), [patient.birthDate]);
  const cityLine = [model.clinicCity, model.clinicState]
    .filter(Boolean)
    .join("/") || "Cidade";
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3 shadow-inner">
      <div className="mx-auto aspect-[210/297] w-full max-w-[340px] overflow-hidden rounded-sm bg-white shadow-lg shadow-slate-900/10">
        <div className="flex h-full flex-col px-4 py-3 text-[9px] leading-snug text-slate-700">
          <header className="flex gap-2 border-b border-slate-200 pb-2">
            {model.clinicLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.clinicLogoUrl}
                alt=""
                className="h-10 w-10 rounded object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-50 text-[10px] font-bold text-indigo-600">
                LOGO
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold text-slate-900">
                {model.clinicName}
              </p>
              {model.clinicHeaderLines.slice(0, 3).map((line) => (
                <p key={line} className="truncate text-[8px] text-slate-500">
                  {line}
                </p>
              ))}
            </div>
          </header>

          <div className="mt-3 text-center">
            <p className="text-[11px] font-bold tracking-wide text-slate-900">
              ATESTADO ODONTOLÓGICO
            </p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase text-indigo-600">
              {CERTIFICATE_TYPE_LABELS[model.certificateType]}
            </p>
            <p className="mt-1 text-[8px] text-slate-500">
              {model.documentNumber || "ATD-••••-••••••"}
            </p>
          </div>

          <div className="mt-3 rounded-md bg-slate-50 px-2 py-1.5">
            <p className="text-[7px] font-semibold uppercase text-slate-400">
              Paciente
            </p>
            <p className="text-[10px] font-bold text-slate-900">{patient.name}</p>
            <p className="text-[8px] text-slate-500">
              {[
                patient.cpf ? `CPF ${patient.cpf}` : null,
                `Nasc. ${formatDisplayDate(patient.birthDate)} (${age} anos)`,
                patient.chartNumber ? `Ficha ${patient.chartNumber}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          {(model.attendanceDate || model.procedureName) && (
            <div className="mt-2 space-y-0.5 text-[8px] text-slate-600">
              {model.attendanceDate ? (
                <p>
                  Atendimento: {formatDisplayDate(model.attendanceDate)}
                  {model.startTime && model.endTime
                    ? ` · ${model.startTime} às ${model.endTime}`
                    : ""}
                </p>
              ) : null}
              {model.procedureName ? (
                <p>Procedimento: {model.procedureName}</p>
              ) : null}
              {model.certificateType === "repouso" &&
              (model.days || model.hours) ? (
                <p>
                  Afastamento:{" "}
                  {[
                    model.days ? `${model.days} dia(s)` : null,
                    model.hours ? `${model.hours} hora(s)` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {model.companionName ? (
                <p>
                  Acompanhante: {model.companionName}
                  {model.companionCpf ? ` · CPF ${model.companionCpf}` : ""}
                </p>
              ) : null}
            </div>
          )}

          <div
            className="mt-3 flex-1 text-[9.5px] leading-relaxed text-slate-800 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-3"
            dangerouslySetInnerHTML={{
              __html:
                model.certificateText ||
                "<p class='text-slate-400'>O texto do atestado aparecerá aqui.</p>",
            }}
          />

          {model.cid ? (
            <p className="mt-2 text-[8px] text-slate-600">
              CID: <strong>{model.cid}</strong>
              {model.cidDescription ? ` — ${model.cidDescription}` : ""}
            </p>
          ) : null}

          {model.observations ? (
            <p className="mt-1 text-[8px] text-slate-500">
              Obs.: {model.observations}
            </p>
          ) : null}

          <div className="mt-auto pt-4 text-center">
            <p className="text-[9px] text-slate-600">
              {cityLine}, {today}
            </p>
            <div className="mx-auto mt-6 w-36 border-t border-slate-300 pt-1">
              <p className="text-[9px] font-semibold text-slate-900">
                {model.dentistName}
              </p>
              <p className="text-[7.5px] text-slate-500">
                {[
                  model.dentistCro ? `CRO ${model.dentistCro}` : null,
                  model.dentistSpecialty,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-0.5 text-[7px] uppercase tracking-wide text-slate-400">
                Assinatura digital · Carimbo
              </p>
            </div>

            <div className="mt-3 flex items-end gap-2 border-t border-slate-100 pt-2 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=4&data=${encodeURIComponent(model.validationUrl || "https://odonto.local/validar")}`}
                alt="QR Code"
                className="h-10 w-10 rounded border border-slate-100 bg-white"
              />
              <div className="min-w-0">
                <p className="text-[7px] font-semibold text-slate-500">
                  Validação pública
                </p>
                <p className="truncate text-[6.5px] text-slate-400">
                  {model.validationUrl || "URL gerada ao salvar"}
                </p>
                <p className="text-[6.5px] text-slate-400">
                  {model.documentNumber || "Código do documento"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
