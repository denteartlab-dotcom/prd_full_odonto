"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Stethoscope,
  Clock3,
  Landmark,
  Wallet,
  FileSpreadsheet,
  HeartHandshake,
  Palette,
  FileText,
  Shield,
  Settings2,
  History,
  Download,
  Upload,
  ChevronDown,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import { CLINIC_DATA_MOCK } from "@/lib/clinic-data-mock";
import type { ClinicDataForm, ClinicDataTabId } from "@/lib/clinic-data-types";
import { onlyDigits } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { ClinicDataSkeleton } from "./clinic-data-ui";
import { ClinicDataTabContent } from "./ClinicDataTabContent";
import { ClinicSummaryPanel } from "./ClinicSummaryPanel";
import { ClinicUsersTab } from "./ClinicUsersTab";

const PRIMARY_TABS: {
  id: ClinicDataTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "gerais", label: "Informações Gerais", icon: Building2 },
  { id: "endereco", label: "Endereço", icon: MapPin },
  { id: "contatos", label: "Contatos", icon: Phone },
  { id: "responsavel", label: "Responsável Técnico", icon: Stethoscope },
  { id: "horario", label: "Horário de Funcionamento", icon: Clock3 },
];

const MORE_TABS: typeof PRIMARY_TABS = [
  { id: "usuarios", label: "Usuários e Permissões", icon: Users },
  { id: "bancarios", label: "Dados Bancários", icon: Landmark },
  { id: "financeiros", label: "Dados Financeiros", icon: Wallet },
  { id: "fiscais", label: "Dados Fiscais", icon: FileSpreadsheet },
  { id: "convenios", label: "Convênios", icon: HeartHandshake },
  { id: "identidade", label: "Identidade Visual", icon: Palette },
  { id: "documentos", label: "Contratos e Documentos", icon: FileText },
  { id: "lgpd", label: "LGPD", icon: Shield },
  { id: "configuracoes", label: "Configurações", icon: Settings2 },
];

const ALL_TABS = [...PRIMARY_TABS, ...MORE_TABS];

function mergeApiIntoForm(
  base: ClinicDataForm,
  clinic: {
    name?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    cnpj?: string | null;
    responsibleDentist?: string | null;
    cro?: string | null;
  },
  settings?: {
    timezone?: string;
    currency?: string;
    workStart?: string;
    workEnd?: string;
  }
): ClinicDataForm {
  const address = clinic.address || "";
  return {
    ...base,
    gerais: {
      ...base.gerais,
      nomeClinica: clinic.name || base.gerais.nomeClinica,
      nomeFantasia: clinic.name || base.gerais.nomeFantasia,
      razaoSocial: clinic.name || base.gerais.razaoSocial,
      cnpj: clinic.cnpj || base.gerais.cnpj,
    },
    endereco: {
      ...base.endereco,
      rua: address || base.endereco.rua,
      cidade: clinic.city || base.endereco.cidade,
      estado: clinic.state || base.endereco.estado,
    },
    contatos: {
      ...base.contatos,
      telefonePrincipal: clinic.phone || base.contatos.telefonePrincipal,
      email: clinic.email || base.contatos.email,
    },
    responsavel: {
      ...base.responsavel,
      nome: clinic.responsibleDentist || base.responsavel.nome,
      cro: clinic.cro?.replace(/^CRO-[A-Z]{2}\s*/i, "") || base.responsavel.cro,
      ufCro:
        clinic.cro?.match(/CRO-([A-Z]{2})/i)?.[1]?.toUpperCase() ||
        base.responsavel.ufCro,
    },
    financeiros: {
      ...base.financeiros,
      moeda: settings?.currency || base.financeiros.moeda,
    },
    configuracoes: {
      ...base.configuracoes,
      fusoHorario: settings?.timezone || base.configuracoes.fusoHorario,
    },
    horario: base.horario.map((day) => {
      if (day.status === "fechado") return day;
      return {
        ...day,
        open: settings?.workStart || day.open,
        close: settings?.workEnd || day.close,
      };
    }),
  };
}

export function ClinicDataPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<ClinicDataTabId>("gerais");
  const [moreOpen, setMoreOpen] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [data, setData] = useState<ClinicDataForm>(CLINIC_DATA_MOCK);
  const [baseline, setBaseline] = useState<ClinicDataForm>(CLINIC_DATA_MOCK);
  const moreRef = useRef<HTMLDivElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/clinic-settings", { cache: "no-store" });
        const json = (await res.json()) as {
          clinic?: Parameters<typeof mergeApiIntoForm>[1];
          settings?: Parameters<typeof mergeApiIntoForm>[2];
        };
        const merged = mergeApiIntoForm(
          CLINIC_DATA_MOCK,
          json.clinic || {},
          json.settings
        );
        setData(merged);
        setBaseline(structuredClone(merged));
      } catch {
        setData(CLINIC_DATA_MOCK);
        setBaseline(structuredClone(CLINIC_DATA_MOCK));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const activeTabMeta = useMemo(
    () => ALL_TABS.find((t) => t.id === tab) || PRIMARY_TABS[0],
    [tab]
  );

  const dirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(baseline),
    [data, baseline]
  );

  const lookupCep = useCallback(async () => {
    const cep = onlyDigits(data.endereco.cep);
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const json = (await res.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (json.erro) {
        setMessage("CEP não encontrado.");
        return;
      }
      setData((d) => ({
        ...d,
        endereco: {
          ...d.endereco,
          rua: json.logradouro || d.endereco.rua,
          bairro: json.bairro || d.endereco.bairro,
          cidade: json.localidade || d.endereco.cidade,
          estado: json.uf || d.endereco.estado,
        },
      }));
      setMessage("Endereço preenchido pelo CEP.");
    } catch {
      setMessage("Falha ao consultar CEP.");
    } finally {
      setCepLoading(false);
    }
  }, [data.endereco.cep]);

  useEffect(() => {
    if (!data.configuracoes.autoSave || !dirty || loading) return;
    const timer = window.setTimeout(() => {
      void handleSave(false, true);
    }, 2500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, data.configuracoes.autoSave, dirty, loading]);

  async function handleSave(continueNext = false, silent = false) {
    setSaving(true);
    if (!silent) setMessage("");
    try {
      const addressLine = [
        data.endereco.rua,
        data.endereco.numero ? `nº ${data.endereco.numero}` : "",
        data.endereco.complemento,
        data.endereco.bairro,
      ]
        .filter(Boolean)
        .join(", ");

      const res = await fetch("/api/clinic-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: {
            name: data.gerais.nomeClinica,
            phone: data.contatos.telefonePrincipal || null,
            email: data.contatos.email || null,
            address: addressLine || null,
            city: data.endereco.cidade || null,
            state: data.endereco.estado || null,
            cnpj: data.gerais.cnpj || null,
            responsibleDentist: data.responsavel.nome || null,
            cro: data.responsavel.cro
              ? `CRO-${data.responsavel.ufCro || "SP"} ${data.responsavel.cro}`
              : null,
          },
          settings: {
            timezone: data.configuracoes.fusoHorario,
            currency: data.financeiros.moeda,
            appointmentMins: 30,
            workStart:
              data.horario.find((d) => d.status === "aberto")?.open || "08:00",
            workEnd:
              data.horario.find((d) => d.status === "aberto")?.close || "18:00",
          },
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Falha ao salvar.");

      setBaseline(structuredClone(data));
      if (!silent) setMessage("Alterações salvas com sucesso.");
      if (continueNext) {
        const idx = ALL_TABS.findIndex((t) => t.id === tab);
        const next = ALL_TABS[idx + 1];
        if (next) setTab(next.id);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setData(structuredClone(baseline));
    setMessage("Alterações descartadas.");
  }

  function handleRestore() {
    setData(structuredClone(CLINIC_DATA_MOCK));
    setMessage("Dados restaurados para o modelo padrão (mock).");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dados-da-clinica.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ClinicDataForm;
        setData(parsed);
        setMessage("Configurações importadas. Salve para persistir.");
      } catch {
        setMessage("Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  }

  if (loading) return <ClinicDataSkeleton />;

  const moreActive = MORE_TABS.some((t) => t.id === tab);

  return (
    <div className="space-y-5 pb-28">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dados da Clínica
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie todas as informações institucionais da clínica.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" className="rounded-xl">
            <History className="h-4 w-4" />
            Histórico de alterações
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={handleCancel}
            disabled={!dirty || saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => void handleSave(false)}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
        {PRIMARY_TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}

        <div className="relative ml-auto" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition",
              moreActive
                ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
            {moreActive ? activeTabMeta.label : "Mais"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {moreOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
              {MORE_TABS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition",
                      tab === item.id
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
          {message}
          {dirty ? (
            <span className="ml-2 text-amber-600">• Alterações não salvas</span>
          ) : null}
        </p>
      ) : dirty ? (
        <p className="text-xs text-amber-600">Você possui alterações não salvas.</p>
      ) : null}

      <div
        className={cn(
          "grid gap-5",
          tab === "usuarios" ? "" : "xl:grid-cols-[minmax(0,1fr)_320px]"
        )}
      >
        <div className="min-w-0">
          {tab === "usuarios" ? (
            <ClinicUsersTab />
          ) : (
            <ClinicDataTabContent
              data={data}
              setData={setData}
              tab={tab}
              cepLoading={cepLoading}
              onCepBlur={() => void lookupCep()}
            />
          )}
        </div>
        {tab !== "usuarios" ? <ClinicSummaryPanel data={data} /> : null}
      </div>

      {tab !== "usuarios" ? (
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:left-[260px]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-xl"
              disabled={saving}
              onClick={() => void handleSave(false)}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              disabled={saving}
              onClick={() => void handleSave(true)}
            >
              Salvar e continuar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={handleRestore}
            >
              Restaurar dados
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exportar configurações
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={() => fileImportRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Importar configurações
            </Button>
            <input
              ref={fileImportRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
