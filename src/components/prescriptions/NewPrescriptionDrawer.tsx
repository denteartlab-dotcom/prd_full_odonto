"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui";
import {
  DENTAL_MEDICATIONS,
  MEDICATION_CATEGORY_LABELS,
  searchDentalMedications,
} from "@/lib/dental-medications";
import type { PrescriptionKind } from "@/lib/prescription-types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

type DraftItem = {
  key: string;
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type ProfessionalOption = { id: string; name: string; cro?: string | null };

export function NewPrescriptionDrawer({
  open,
  patientId,
  patientName,
  professionals,
  onClose,
  onSaved,
}: {
  open: boolean;
  patientId: string;
  patientName: string;
  professionals: ProfessionalOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState<PrescriptionKind>("receituario_simples");
  const [professionalId, setProfessionalId] = useState("");
  const [observations, setObservations] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setKind("receituario_simples");
    setObservations("");
    setValidUntil("");
    setQuery("");
    setItems([]);
    setError("");
    setProfessionalId(professionals[0]?.id || "");
  }, [open, professionals]);

  const catalog = useMemo(() => searchDentalMedications(query), [query]);

  function addFromCatalog(id: string) {
    const med = DENTAL_MEDICATIONS.find((m) => m.id === id);
    if (!med) return;
    setItems((list) => [
      ...list,
      {
        key: `${med.id}-${Date.now()}`,
        medicationName: med.name,
        dose: med.defaultDose,
        frequency: med.defaultFrequency,
        duration: med.defaultDuration,
        instructions: med.notes || "",
      },
    ]);
  }

  function addBlank() {
    setItems((list) => [
      ...list,
      {
        key: `custom-${Date.now()}`,
        medicationName: "",
        dose: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  }

  async function save() {
    if (!items.length) {
      setError("Inclua ao menos um medicamento.");
      return;
    }
    if (items.some((i) => !i.medicationName.trim())) {
      setError("Preencha o nome de todos os medicamentos.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/prescricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          professionalId: professionalId || null,
          kind,
          observations,
          validUntil: validUntil || undefined,
          medications: items.map((i) => ({
            medicationName: i.medicationName,
            dose: i.dose,
            frequency: i.frequency,
            duration: i.duration,
            instructions: i.instructions,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar.");
      onSaved();
      onClose();
      if (data.item?.pdfUrl) {
        window.open(data.item.pdfUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar receita.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Nova receita odontológica</h2>
            <p className="text-xs text-slate-500">Gratuita · Paciente: {patientName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Tipo</span>
              <select
                className={inputClass}
                value={kind}
                onChange={(e) => setKind(e.target.value as PrescriptionKind)}
              >
                <option value="receituario_simples">Receituário simples</option>
                <option value="controle_especial">Controle especial</option>
                <option value="atestado">Atestado</option>
                <option value="solicitacao_exame">Solicitação de exame</option>
              </select>
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Cirurgião-dentista</span>
              <select
                className={inputClass}
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
              >
                {professionals.length === 0 ? <option value="">Sem profissionais</option> : null}
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.cro ? ` · CRO ${p.cro}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Validade</span>
              <input
                type="date"
                className={inputClass}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Catálogo odontológico
              </p>
              <button
                type="button"
                onClick={addBlank}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Item manual
              </button>
            </div>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={cn(inputClass, "pl-9")}
                placeholder="Buscar medicamento..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {catalog.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => addFromCatalog(med.id)}
                  className="flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-brand-50"
                >
                  <span>
                    <span className="block text-sm font-medium text-slate-800">{med.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {MEDICATION_CATEGORY_LABELS[med.category]} · {med.defaultDose}
                    </span>
                  </span>
                  <Plus className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Itens da receita ({items.length})
            </p>
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
                Adicione medicamentos do catálogo ou um item manual.
              </p>
            ) : (
              items.map((item, index) => (
                <div key={item.key} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Item {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setItems((list) => list.filter((x) => x.key !== item.key))}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <input
                      className={inputClass}
                      placeholder="Medicamento"
                      value={item.medicationName}
                      onChange={(e) =>
                        setItems((list) =>
                          list.map((x) =>
                            x.key === item.key ? { ...x, medicationName: e.target.value } : x
                          )
                        )
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        className={inputClass}
                        placeholder="Dose"
                        value={item.dose}
                        onChange={(e) =>
                          setItems((list) =>
                            list.map((x) =>
                              x.key === item.key ? { ...x, dose: e.target.value } : x
                            )
                          )
                        }
                      />
                      <input
                        className={inputClass}
                        placeholder="Frequência"
                        value={item.frequency}
                        onChange={(e) =>
                          setItems((list) =>
                            list.map((x) =>
                              x.key === item.key ? { ...x, frequency: e.target.value } : x
                            )
                          )
                        }
                      />
                      <input
                        className={inputClass}
                        placeholder="Duração"
                        value={item.duration}
                        onChange={(e) =>
                          setItems((list) =>
                            list.map((x) =>
                              x.key === item.key ? { ...x, duration: e.target.value } : x
                            )
                          )
                        }
                      />
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Instruções (opcional)"
                      value={item.instructions}
                      onChange={(e) =>
                        setItems((list) =>
                          list.map((x) =>
                            x.key === item.key ? { ...x, instructions: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-600">Observações</span>
            <textarea
              className={cn(inputClass, "min-h-[80px] resize-y")}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
            Módulo gratuito para cirurgião-dentista (CRO). Para assinatura digital ICP-Brasil com
            validade nacional, use também o portal oficial do CFO:{" "}
            <a
              href="https://prescricao.cfo.org.br"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-700 hover:underline"
            >
              prescricao.cfo.org.br
            </a>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Salvando..." : "Salvar e imprimir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
