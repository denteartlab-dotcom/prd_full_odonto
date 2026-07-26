"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { usePatients } from "@/contexts/patients-context";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { money } from "@/lib/utils";

type ApiBudget = {
  id: string;
  patientId: string;
  patientName: string;
  status: string;
  total: number;
  notes: string;
  createdAt: string;
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
};

const STATUS_OPTIONS = [
  "rascunho",
  "enviado",
  "aprovado",
  "parcial",
  "recusado",
  "expirado",
];

export function ClinicBudgetsPage() {
  const { listPatients, hydrated } = usePatients();
  const [budgets, setBudgets] = useState<ApiBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    description: "",
    quantity: "1",
    unitPrice: "",
    status: "rascunho",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/budgets", { cache: "no-store" });
      const data = (await res.json()) as { budgets?: ApiBudget[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Falha ao carregar orçamentos.");
      setBudgets(data.budgets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (hydrated && listPatients[0] && !form.patientId) {
      setForm((f) => ({ ...f, patientId: listPatients[0].id }));
    }
  }, [hydrated, listPatients, form.patientId]);

  const stats = useMemo(() => {
    const open = budgets.filter((b) => !["pago", "recusado", "expirado"].includes(b.status));
    return {
      total: budgets.length,
      openValue: open.reduce((s, b) => s + b.total, 0),
    };
  }, [budgets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const quantity = Number(form.quantity) || 1;
      const unitPrice = Number(form.unitPrice.replace(",", ".")) || 0;
      if (!form.patientId) throw new Error("Selecione um paciente.");
      if (!form.description.trim()) throw new Error("Informe o procedimento.");
      if (unitPrice <= 0) throw new Error("Informe um valor válido.");

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          status: form.status,
          notes: form.notes,
          items: [
            {
              description: form.description.trim(),
              quantity,
              unitPrice,
            },
          ],
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Não foi possível criar.");

      setForm((f) => ({
        ...f,
        description: "",
        quantity: "1",
        unitPrice: "",
        notes: "",
        status: "rascunho",
      }));
      setFormOpen(false);
      setMessage("Orçamento criado.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/budgets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setMessage("Falha ao atualizar status.");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orçamentos"
        description="Planos de tratamento e propostas comerciais da clínica"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button type="button" onClick={() => setFormOpen((v) => !v)}>
              <Plus className="h-4 w-4" />
              Novo orçamento
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Total de orçamentos">
          <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
        </Card>
        <Card title="Valor em aberto">
          <p className="text-2xl font-semibold text-slate-900">{money(stats.openValue)}</p>
        </Card>
      </div>

      {formOpen ? (
        <Card title="Novo orçamento">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
            <Select
              label="Paciente"
              value={form.patientId}
              onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
            >
              {listPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Input
              label="Procedimento / item"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="md:col-span-2"
            />
            <Input
              label="Quantidade"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
            <Input
              label="Valor unitário"
              value={form.unitPrice}
              onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
              placeholder="0,00"
            />
            <Input
              label="Observações"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="md:col-span-2"
            />
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar orçamento"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <Card title="Lista de orçamentos">
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum orçamento cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Paciente</th>
                  <th className="px-2 py-2">Itens</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Data</th>
                  <th className="px-2 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="px-2 py-2 font-medium text-slate-800">{b.patientName}</td>
                    <td className="px-2 py-2 text-slate-600">
                      {b.items.map((i) => i.description).join(", ") || "—"}
                    </td>
                    <td className="px-2 py-2">{money(b.total)}</td>
                    <td className="px-2 py-2">
                      <select
                        value={b.status}
                        onChange={(e) => void updateStatus(b.id, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-2 py-2">
                      <a
                        href={`/app/pacientes/${b.patientId}/orcamentos`}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Abrir no paciente
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
