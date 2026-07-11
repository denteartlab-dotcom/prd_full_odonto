"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormInput, FormSectionCard, FormSelect } from "./FormField";
import { maskPhone } from "@/lib/masks";
import type { EmergencyContact } from "./patient-form-types";

export function EmergencyContactsCard({
  contacts,
  onChange,
}: {
  contacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
}) {
  function update(id: string, patch: Partial<EmergencyContact>) {
    onChange(contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function add() {
    onChange([
      ...contacts,
      { id: crypto.randomUUID(), nome: "", parentesco: "", telefone: "" },
    ]);
  }

  function remove(id: string) {
    if (contacts.length <= 1) {
      onChange([{ id: contacts[0].id, nome: "", parentesco: "", telefone: "" }]);
      return;
    }
    onChange(contacts.filter((c) => c.id !== id));
  }

  return (
    <FormSectionCard
      title="Contatos de emergência"
      action={
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      }
    >
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => remove(contact.id)}
                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                aria-label="Remover contato"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <FormInput
              label="Nome"
              value={contact.nome}
              onChange={(e) => update(contact.id, { nome: e.target.value })}
              placeholder="Nome do contato"
            />
            <FormSelect
              label="Parentesco"
              value={contact.parentesco}
              onChange={(e) => update(contact.id, { parentesco: e.target.value })}
            >
              <option value="">Selecione</option>
              <option value="pai">Pai</option>
              <option value="mae">Mãe</option>
              <option value="conjuge">Cônjuge</option>
              <option value="filho">Filho(a)</option>
              <option value="amigo">Amigo(a)</option>
              <option value="outro">Outro</option>
            </FormSelect>
            <FormInput
              label="Telefone"
              value={contact.telefone}
              onChange={(e) => update(contact.id, { telefone: maskPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </div>
        ))}
      </div>
    </FormSectionCard>
  );
}
