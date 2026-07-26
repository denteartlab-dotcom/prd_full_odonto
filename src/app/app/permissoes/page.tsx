"use client";

import { ClinicUsersTab } from "@/components/settings/clinic-data/ClinicUsersTab";

export default function PermissoesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Permissões</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie usuários e módulos liberados. Também disponível em Dados da Clínica → Mais →
          Usuários e Permissões.
        </p>
      </div>
      <ClinicUsersTab />
    </div>
  );
}
