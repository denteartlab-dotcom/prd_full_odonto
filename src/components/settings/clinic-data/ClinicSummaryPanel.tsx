"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui";
import { LogoPreview } from "./clinic-data-ui";
import type { ClinicDataForm } from "@/lib/clinic-data-types";
import { CheckCircle2, HardDrive } from "lucide-react";

export function ClinicSummaryPanel({
  data,
  logoUrl,
  onLogoChange,
}: {
  data: ClinicDataForm;
  logoUrl?: string | null;
  onLogoChange?: (logoUrl: string | null) => void;
}) {
  const router = useRouter();
  const [savingLogo, setSavingLogo] = useState(false);
  const usedPct = Math.min(
    100,
    Math.round((data.resumo.espacoUsadoGb / data.resumo.espacoTotalGb) * 100)
  );

  async function saveLogo(next: string | null) {
    setSavingLogo(true);
    try {
      const res = await fetch("/api/clinic-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: next }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Falha ao salvar logo.");
      onLogoChange?.(next);
      router.refresh();
    } finally {
      setSavingLogo(false);
    }
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <LogoPreview
        name={data.gerais.nomeFantasia || data.gerais.nomeClinica}
        logoUrl={logoUrl || data.identidade.logoPrincipal || null}
        saving={savingLogo}
        onChange={(dataUrl) => void saveLogo(dataUrl)}
        onRemove={() => void saveLogo(null)}
      />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
        <h3 className="text-sm font-semibold text-slate-900">Resumo da Clínica</h3>
        <p className="mt-1 text-xs text-slate-500">{data.gerais.nomeClinica}</p>

        <dl className="mt-4 space-y-3 text-sm">
          <Row label="CNPJ" value={data.gerais.cnpj || "—"} />
          <Row
            label="CRO Responsável"
            value={
              data.responsavel.cro
                ? `CRO-${data.responsavel.ufCro} ${data.responsavel.cro}`
                : "—"
            }
          />
          <Row label="Plano" value={data.resumo.plano} strong />
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <Badge tone={data.resumo.status === "ativa" ? "green" : "amber"}>
                {data.resumo.status === "ativa" ? "Ativa" : data.resumo.status}
              </Badge>
            </dd>
          </div>
          <Row label="Validade da licença" value={data.resumo.validadeLicenca} />
        </dl>

        <div className="mt-5 rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <HardDrive className="h-3.5 w-3.5 text-brand-600" />
              Espaço utilizado
            </span>
            <span className="text-slate-500">
              {data.resumo.espacoUsadoGb} GB / {data.resumo.espacoTotalGb} GB
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>

        <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
          <Row label="Pacientes cadastrados" value={String(data.resumo.pacientes)} strong />
          <Row label="Profissionais" value={String(data.resumo.profissionais)} strong />
          <Row label="Consultas" value={String(data.resumo.consultas)} strong />
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Último backup</dt>
            <dd className="inline-flex items-center gap-1.5 text-right text-xs font-medium text-slate-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {data.resumo.ultimoBackup}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={
          strong
            ? "text-right font-semibold text-slate-900"
            : "text-right font-medium text-slate-800"
        }
      >
        {value}
      </dd>
    </div>
  );
}
