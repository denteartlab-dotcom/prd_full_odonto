"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, PageHeader } from "@/components/ui";

type ClinicData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  cnpj: string;
  responsibleDentist: string;
  cro: string;
  slug?: string;
};

type SettingsData = {
  timezone: string;
  currency: string;
  appointmentMins: number;
  workStart: string;
  workEnd: string;
};

export function ClinicSettingsPage() {
  const [clinic, setClinic] = useState<ClinicData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    cnpj: "",
    responsibleDentist: "",
    cro: "",
  });
  const [settings, setSettings] = useState<SettingsData>({
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    appointmentMins: 30,
    workStart: "08:00",
    workEnd: "18:00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/clinic-settings", { cache: "no-store" });
        const data = (await res.json()) as {
          clinic?: ClinicData;
          settings?: SettingsData;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Falha ao carregar.");
        if (data.clinic) {
          setClinic({
            name: data.clinic.name || "",
            phone: data.clinic.phone || "",
            email: data.clinic.email || "",
            address: data.clinic.address || "",
            city: data.clinic.city || "",
            state: data.clinic.state || "",
            cnpj: data.clinic.cnpj || "",
            responsibleDentist: data.clinic.responsibleDentist || "",
            cro: data.clinic.cro || "",
            slug: data.clinic.slug,
          });
        }
        if (data.settings) {
          setSettings({
            timezone: data.settings.timezone || "America/Sao_Paulo",
            currency: data.settings.currency || "BRL",
            appointmentMins: data.settings.appointmentMins ?? 30,
            workStart: data.settings.workStart || "08:00",
            workEnd: data.settings.workEnd || "18:00",
          });
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/clinic-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic: {
            name: clinic.name,
            phone: clinic.phone || null,
            email: clinic.email || null,
            address: clinic.address || null,
            city: clinic.city || null,
            state: clinic.state || null,
            cnpj: clinic.cnpj || null,
            responsibleDentist: clinic.responsibleDentist || null,
            cro: clinic.cro || null,
          },
          settings: {
            timezone: settings.timezone,
            currency: settings.currency,
            appointmentMins: Number(settings.appointmentMins) || 30,
            workStart: settings.workStart,
            workEnd: settings.workEnd,
          },
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Falha ao salvar.");
      setMessage("Configurações salvas.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Configurações" description="Dados da clínica" />
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Configurações"
        description="Dados da clínica usados nos contratos e na agenda"
      />

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
        <Card title="Clínica (CONTRATADA)">
          <div className="space-y-3">
            <Input
              label="Nome / Razão social"
              value={clinic.name}
              onChange={(e) => setClinic((c) => ({ ...c, name: e.target.value }))}
              required
            />
            <Input
              label="CNPJ"
              value={clinic.cnpj}
              onChange={(e) => setClinic((c) => ({ ...c, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
            <Input
              label="Endereço"
              value={clinic.address}
              onChange={(e) => setClinic((c) => ({ ...c, address: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cidade"
                value={clinic.city}
                onChange={(e) => setClinic((c) => ({ ...c, city: e.target.value }))}
              />
              <Input
                label="UF"
                value={clinic.state}
                onChange={(e) => setClinic((c) => ({ ...c, state: e.target.value }))}
              />
            </div>
            <Input
              label="Cirurgião-dentista responsável"
              value={clinic.responsibleDentist}
              onChange={(e) =>
                setClinic((c) => ({ ...c, responsibleDentist: e.target.value }))
              }
            />
            <Input
              label="CRO"
              value={clinic.cro}
              onChange={(e) => setClinic((c) => ({ ...c, cro: e.target.value }))}
              placeholder="CRO-SP 00000"
            />
            <Input
              label="Telefone"
              value={clinic.phone}
              onChange={(e) => setClinic((c) => ({ ...c, phone: e.target.value }))}
            />
            <Input
              label="E-mail"
              type="email"
              value={clinic.email}
              onChange={(e) => setClinic((c) => ({ ...c, email: e.target.value }))}
            />
          </div>
        </Card>

        <Card title="Agenda">
          <div className="space-y-3">
            <Input
              label="Duração padrão (min)"
              type="number"
              min={5}
              max={240}
              value={settings.appointmentMins}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  appointmentMins: Number(e.target.value) || 30,
                }))
              }
            />
            <Input
              label="Início do expediente"
              type="time"
              value={settings.workStart}
              onChange={(e) => setSettings((s) => ({ ...s, workStart: e.target.value }))}
            />
            <Input
              label="Fim do expediente"
              type="time"
              value={settings.workEnd}
              onChange={(e) => setSettings((s) => ({ ...s, workEnd: e.target.value }))}
            />
            <Input
              label="Fuso horário"
              value={settings.timezone}
              onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
            />
            <Input
              label="Moeda"
              value={settings.currency}
              onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
            />
          </div>
        </Card>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          {message ? <p className="text-sm text-slate-600">{message}</p> : <span />}
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
