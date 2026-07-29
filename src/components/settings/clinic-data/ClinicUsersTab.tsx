"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, UserX, ShieldCheck } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import {
  CLINIC_USER_ROLES,
  ROLE_DEFAULT_PERMISSIONS,
  SYSTEM_MODULES,
  roleLabel,
  type ClinicUserDTO,
  type ClinicUserRole,
} from "@/lib/clinic-user-permissions";
import { cn } from "@/lib/utils";
import { Field, SectionCard, TextInput, TextSelect } from "./clinic-data-ui";

type FormState = {
  name: string;
  email: string;
  password: string;
  role: ClinicUserRole;
  active: boolean;
  permissions: string[];
  commissionEnabled: boolean;
  commissionPercent: string;
};

const emptyForm = (): FormState => ({
  name: "",
  email: "",
  password: "",
  role: "recepcao",
  active: true,
  permissions: [...ROLE_DEFAULT_PERMISSIONS.recepcao],
  commissionEnabled: false,
  commissionPercent: "0",
});

export function ClinicUsersTab() {
  const [users, setUsers] = useState<ClinicUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = (await res.json()) as {
        users?: ClinicUserDTO[];
        canManage?: boolean;
        currentUserId?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Falha ao carregar usuários.");
      setUsers(data.users || []);
      setCanManage(Boolean(data.canManage));
      setCurrentUserId(data.currentUserId || "");
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

  const modulesByGroup = useMemo(() => {
    const map = new Map<string, typeof SYSTEM_MODULES>();
    for (const mod of SYSTEM_MODULES) {
      const list = map.get(mod.group) || [];
      list.push(mod);
      map.set(mod.group, list);
    }
    return Array.from(map.entries());
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEdit(user: ClinicUserDTO) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: (user.role as ClinicUserRole) || "recepcao",
      active: user.active,
      permissions:
        user.permissions.length > 0
          ? user.permissions
          : ROLE_DEFAULT_PERMISSIONS[(user.role as ClinicUserRole) || "recepcao"] ||
            [],
      commissionEnabled: Boolean(user.commissionEnabled),
      commissionPercent: String(user.commissionPercent ?? 0),
    });
    setFormOpen(true);
  }

  function togglePermission(moduleId: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(moduleId)
        ? f.permissions.filter((p) => p !== moduleId)
        : [...f.permissions, moduleId],
    }));
  }

  function applyRoleDefaults(role: ClinicUserRole) {
    setForm((f) => ({
      ...f,
      role,
      permissions: [...(ROLE_DEFAULT_PERMISSIONS[role] || [])],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
        permissions: form.permissions,
        commissionEnabled: form.commissionEnabled,
        commissionPercent: Number(form.commissionPercent) || 0,
        ...(form.password ? { password: form.password } : {}),
      };

      const res = editingId
        ? await fetch(`/api/users/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, password: form.password }),
          });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Falha ao salvar usuário.");

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      setMessage(editingId ? "Usuário atualizado." : "Usuário criado com sucesso.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateUser(user: ClinicUserDTO) {
    if (!canManage || user.id === currentUserId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Falha ao desativar.");
      setMessage("Usuário desativado.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao desativar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Usuários e Permissões"
        description="Crie acessos para a equipe e defina o que cada usuário pode ver no sistema."
        action={
          canManage ? (
            <Button type="button" className="rounded-xl" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo usuário
            </Button>
          ) : null
        }
      >
        {!canManage ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Apenas administradores e proprietários podem criar ou editar usuários.
          </p>
        ) : null}

        {message ? (
          <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
            {message}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Carregando usuários...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-3">Nome</th>
                  <th className="px-2 py-3">E-mail</th>
                  <th className="px-2 py-3">Perfil</th>
                  <th className="px-2 py-3">Comissão</th>
                  <th className="px-2 py-3">Módulos</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50">
                    <td className="px-2 py-3 font-medium text-slate-900">
                      {user.name}
                      {user.id === currentUserId ? (
                        <span className="ml-2 text-[11px] text-brand-600">(você)</span>
                      ) : null}
                    </td>
                    <td className="px-2 py-3 text-slate-600">{user.email}</td>
                    <td className="px-2 py-3 text-slate-700">{roleLabel(user.role)}</td>
                    <td className="px-2 py-3 text-slate-600">
                      {user.commissionEnabled
                        ? `${user.commissionPercent}%`
                        : "—"}
                    </td>
                    <td className="px-2 py-3 text-slate-500">
                      {user.permissions.length || "—"} módulos
                    </td>
                    <td className="px-2 py-3">
                      <Badge tone={user.active ? "green" : "slate"}>
                        {user.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => openEdit(user)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={!canManage || user.id === currentUserId || !user.active}
                          onClick={() => void deactivateUser(user)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                          title="Desativar"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {formOpen ? (
        <SectionCard
          title={editingId ? "Editar usuário" : "Novo usuário"}
          description="Defina o perfil e os módulos liberados para este acesso."
          action={
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              Permissões por módulo
            </span>
          }
        >
          <form className="space-y-5" onSubmit={(e) => void handleSave(e)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome" required>
                <TextInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </Field>
              <Field label="E-mail" required>
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </Field>
              <Field
                label={editingId ? "Nova senha (opcional)" : "Senha"}
                required={!editingId}
                hint={editingId ? "Deixe em branco para manter a senha atual." : "Mínimo 6 caracteres"}
              >
                <TextInput
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required={!editingId}
                  minLength={editingId ? undefined : 6}
                />
              </Field>
              <Field label="Perfil de acesso" required>
                <TextSelect
                  value={form.role}
                  onChange={(e) => applyRoleDefaults(e.target.value as ClinicUserRole)}
                >
                  {CLINIC_USER_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </TextSelect>
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Usuário ativo
            </label>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <label className="flex items-start gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
                  checked={form.commissionEnabled}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      commissionEnabled: e.target.checked,
                      ...(e.target.checked && f.role === "recepcao"
                        ? { role: "dentista" as ClinicUserRole }
                        : {}),
                    }))
                  }
                />
                <span>
                  <span className="font-semibold">Recebe comissão da produção</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Quando um orçamento do dentista for aprovado, a comissão é
                    gerada automaticamente com base no percentual abaixo.
                  </span>
                </span>
              </label>
              {form.commissionEnabled ? (
                <div className="mt-3 max-w-xs">
                  <Field
                    label="Percentual da produção (%)"
                    hint="Ex.: 30 = dentista recebe 30% do valor do orçamento aprovado"
                  >
                    <TextInput
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={form.commissionPercent}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          commissionPercent: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Permissões no sistema</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-brand-700 hover:underline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        permissions: SYSTEM_MODULES.map((m) => m.id),
                      }))
                    }
                  >
                    Marcar todos
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 hover:underline"
                    onClick={() => setForm((f) => ({ ...f, permissions: [] }))}
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {modulesByGroup.map(([group, modules]) => (
                  <div
                    key={group}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {group}
                    </p>
                    <div className="space-y-2">
                      {modules.map((mod) => {
                        const checked = form.permissions.includes(mod.id);
                        return (
                          <label
                            key={mod.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                              checked
                                ? "border-brand-200 bg-white text-slate-900"
                                : "border-transparent bg-transparent text-slate-600 hover:bg-white/80"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-brand-600"
                              checked={checked}
                              onChange={() => togglePermission(mod.id)}
                            />
                            {mod.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar usuário"}
              </Button>
            </div>
          </form>
        </SectionCard>
      ) : null}
    </div>
  );
}
