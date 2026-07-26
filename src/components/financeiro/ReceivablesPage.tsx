"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { usePatients } from "@/contexts/patients-context";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { money } from "@/lib/utils";

type ApiReceivable = {
  id: string;
  patientId: string | null;
  patientName: string | null;
  description: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
  method: string | null;
};

export function ReceivablesPage() {
  const { listPatients, hydrated } = usePatients();
  const [items, setItems] = useState<ApiReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    description: "",
    amount: "",
    dueDate: new Date().toISOString().slice(0, 10),
    method: "PIX",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/receivables", { cache: "no-store" });
      const data = (await res.json()) as { receivables?: ApiReceivable[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Falha ao carregar.");
      setItems(data.receivables || []);
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao carregar.");
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

  const aberto = useMemo(
    () => items.filter((i) => i.status === "aberto").reduce((s, i) => s + i.amount, 0),
    [items]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const amount = Number(form.amount.replace(",", ".")) || 0;
      if (!form.description.trim()) throw new Error("Descrição obrigatória.");
      if (amount <= 0) throw new Error("Valor inválido.");

      const res = await fetch("/api/receivables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId || null,
          description: form.description.trim(),
          amount,
          dueDate: form.dueDate,
          method: form.method,
          status: "aberto",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Não foi possível criar.");

      setForm((f) => ({
        ...f,
        description: "",
        amount: "",
        method: "PIX",
      }));
      setFormOpen(false);
      setMessage("Título lançado.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id: string) {
    const res = await fetch(`/api/receivables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markPaid: true }),
    });
    if (!res.ok) {
      setMessage("Falha ao quitar título.");
      return;
    }
    setMessage("Título marcado como pago.");
    await load();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contas a receber"
        description="Títulos de pacientes e recebimentos"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button type="button" onClick={() => setFormOpen((v) => !v)}>
              <Plus className="h-4 w-4" />
              Novo título
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Em aberto">
          <p className="text-2xl font-semibold text-slate-900">{money(aberto)}</p>
        </Card>
        <Card title="Títulos">
          <p className="text-2xl font-semibold text-slate-900">{items.length}</p>
        </Card>
      </div>

      {formOpen ? (
        <Card title="Lançar título">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
            <Select
              label="Paciente"
              value={form.patientId}
              onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
            >
              <option value="">Sem paciente</option>
              {listPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              label="Método"
              value={form.method}
              onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
            >
              {["PIX", "Cartão", "Boleto", "Dinheiro", "Transferência"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <Input
              label="Descrição"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="md:col-span-2"
            />
            <Input
              label="Valor"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0,00"
            />
            <Input
              label="Vencimento"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Lançar"}
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

      <Card title="Títulos">
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum título cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Descrição</th>
                  <th className="px-2 py-2">Paciente</th>
                  <th className="px-2 py-2">Valor</th>
                  <th className="px-2 py-2">Vencimento</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100">
                    <td className="px-2 py-2 font-medium text-slate-800">{i.description}</td>
                    <td className="px-2 py-2 text-slate-600">{i.patientName || "—"}</td>
                    <td className="px-2 py-2">{money(i.amount)}</td>
                    <td className="px-2 py-2">
                      {new Date(i.dueDate + "T12:00:00").toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={
                          i.status === "pago"
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                        }
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      {i.status !== "pago" ? (
                        <button
                          type="button"
                          onClick={() => void markPaid(i.id)}
                          className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          Marcar pago
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Quitado</span>
                      )}
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
