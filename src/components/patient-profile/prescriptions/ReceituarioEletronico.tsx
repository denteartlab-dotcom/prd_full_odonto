"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  FilePlus2,
  History,
  Loader2,
  Mail,
  MessageCircle,
  Printer,
  Save,
  Sparkles,
  Star,
  BookTemplate,
  FileText,
  Send,
} from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { MedicationService, PrescriptionPdfService, type Medicine } from "@/lib/medication-service";
import {
  buildReceituarioAlerts,
  medicineToLine,
  type ReceituarioLine,
  type ReceituarioTemplate,
} from "@/lib/receituario-types";
import { AssistenteIAModal } from "./AssistenteIAModal";
import { HistoricoReceitasModal } from "./HistoricoReceitasModal";
import { ModelosReceitaModal } from "./ModelosReceitaModal";
import { ReceituarioEditor } from "./ReceituarioEditor";
import { ReceituarioPatientPanel } from "./ReceituarioPatientPanel";
import { ReceituarioSearchPanel } from "./ReceituarioSearchPanel";

type ProfessionalOption = { id: string; name: string; cro?: string | null };

const DRAFT_KEY = (patientId: string) => `odonto-receituario-draft:${patientId}`;

export function ReceituarioEletronico({
  patient,
  userName,
}: {
  patient: PatientProfile;
  userName?: string;
}) {
  const [lines, setLines] = useState<ReceituarioLine[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [professionalId, setProfessionalId] = useState("");
  const [history, setHistory] = useState<PrescriptionRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [autosaveHint, setAutosaveHint] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/prescricoes?patientId=${patient.id}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setHistory(data.items ?? []);
      if (Array.isArray(data.professionals)) {
        setProfessionals(data.professionals);
        if (!professionalId && data.professionals[0]?.id) {
          setProfessionalId(data.professionals[0].id);
        }
      }
    }
  }, [patient.id, professionalId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY(patient.id));
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        lines?: ReceituarioLine[];
        generalNotes?: string;
        professionalId?: string;
      };
      if (draft.lines?.length) setLines(draft.lines);
      if (draft.generalNotes) setGeneralNotes(draft.generalNotes);
      if (draft.professionalId) setProfessionalId(draft.professionalId);
    } catch {
      /* ignore */
    }
  }, [patient.id]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY(patient.id),
          JSON.stringify({ lines, generalNotes, professionalId })
        );
        setAutosaveHint(`Rascunho salvo · ${new Date().toLocaleTimeString("pt-BR")}`);
      } catch {
        /* ignore */
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [lines, generalNotes, professionalId, patient.id]);

  const alerts = useMemo(
    () =>
      buildReceituarioAlerts({
        lines,
        allergies: patient.anamnesis.allergies,
        diseases: patient.anamnesis.diseases,
        medicationsInUse: patient.anamnesis.medications,
      }),
    [lines, patient.anamnesis]
  );

  const dentist = professionals.find((p) => p.id === professionalId) || {
    name: userName || "Dr(a). Responsável",
    cro: null,
  };

  function addMedicine(m: Medicine) {
    setLines((cur) => {
      if (cur.some((l) => l.medicineId === m.id)) return cur;
      return [...cur, medicineToLine(m)];
    });
    setMessage(`${m.commercialName} adicionado à receita.`);
  }

  function clearDraft() {
    setLines([]);
    setGeneralNotes("");
    window.localStorage.removeItem(DRAFT_KEY(patient.id));
    setMessage("Nova receita iniciada.");
  }

  async function applyTemplate(tpl: ReceituarioTemplate) {
    const meds: ReceituarioLine[] = [];
    for (const id of tpl.medicineIds) {
      const m = await MedicationService.getMedicine(id);
      if (m) meds.push(medicineToLine(m));
    }
    setLines(meds);
    if (tpl.generalNotes) setGeneralNotes(tpl.generalNotes);
    setMessage(`Modelo “${tpl.name}” aplicado.`);
  }

  function duplicateFromHistory(item: PrescriptionRecord) {
    const next: ReceituarioLine[] = (item.medications || []).map((m, i) => ({
      id: `line-hist-${Date.now()}-${i}`,
      medicineId: `hist-${i}`,
      name: m.medicationName,
      concentration: "—",
      quantity: m.dose,
      pharmaceuticalForm: "—",
      route: "Oral",
      posology: m.frequency,
      duration: m.duration,
      notes: m.instructions || "",
    }));
    setLines(next);
    setHistoryOpen(false);
    setMessage("Receita duplicada no editor.");
  }

  async function emitPrescription() {
    if (!lines.length) {
      setMessage("Adicione ao menos um medicamento.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/prescricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          professionalId: professionalId || null,
          kind: "receituario_simples",
          observations: generalNotes,
          medications: lines.map((l) => ({
            medicationName: l.name,
            dose: l.quantity,
            frequency: l.posology,
            duration: l.duration,
            instructions: [l.route, l.notes].filter(Boolean).join(" · ") || undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao emitir receita.");
      await PrescriptionPdfService.prepare({
        clinicName: "Clínica",
        patientName: patient.name,
        patientDocument: patient.cpf,
        dentistName: dentist.name,
        dentistCro: dentist.cro || undefined,
        medications: lines.map((l) => ({
          name: l.name,
          concentration: l.concentration,
          quantity: l.quantity,
          posology: l.posology,
          duration: l.duration,
          notes: l.notes,
        })),
        observations: generalNotes,
        issuedAt: new Date().toISOString(),
      });
      clearDraft();
      await loadHistory();
      setMessage("Receita emitida com sucesso.");
      if (data.item?.id) {
        window.open(`/api/prescricoes/${data.item.id}/imprimir`, "_blank");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao emitir.");
    } finally {
      setSaving(false);
    }
  }

  function saveDraftLocal() {
    window.localStorage.setItem(
      DRAFT_KEY(patient.id),
      JSON.stringify({ lines, generalNotes, professionalId })
    );
    setMessage("Rascunho salvo neste dispositivo.");
  }

  const lastId = history[0]?.id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <ToolbarBtn icon={FilePlus2} label="Nova Receita" onClick={clearDraft} />
        <ToolbarBtn icon={Save} label="Salvar Rascunho" onClick={saveDraftLocal} />
        <ToolbarBtn
          icon={saving ? Loader2 : Send}
          label="Emitir Receita"
          primary
          spinning={saving}
          onClick={() => void emitPrescription()}
        />
        <ToolbarBtn
          icon={FileText}
          label="Visualizar PDF"
          onClick={() => {
            if (lastId) window.open(`/api/prescricoes/${lastId}/imprimir`, "_blank");
            else setMessage("Emita uma receita para visualizar o PDF.");
          }}
        />
        <ToolbarBtn
          icon={Printer}
          label="Imprimir"
          onClick={() => {
            if (lastId) window.open(`/api/prescricoes/${lastId}/imprimir`, "_blank");
            else setMessage("Emita uma receita para imprimir.");
          }}
        />
        <a
          href={`https://wa.me/55${(patient.phone || "").replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
        <a
          href={patient.email ? `mailto:${patient.email}` : "#"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Mail className="h-3.5 w-3.5" /> E-mail
        </a>
        <ToolbarBtn
          icon={Copy}
          label="Duplicar"
          onClick={() => {
            if (history[0]) duplicateFromHistory(history[0]);
            else setMessage("Não há receita anterior para duplicar.");
          }}
        />
        <ToolbarBtn icon={History} label="Histórico" onClick={() => setHistoryOpen(true)} />
        <ToolbarBtn icon={BookTemplate} label="Modelos" onClick={() => setModelsOpen(true)} />
        <ToolbarBtn icon={Star} label="Favoritos" onClick={() => setMessage("Use a coluna esquerda — seção Favoritos.")} />
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Assistente IA
        </button>
      </div>

      {professionals.length ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Prescritor:</span>
          <select
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none"
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.cro ? ` · ${p.cro}` : ""}
              </option>
            ))}
          </select>
          {autosaveHint ? (
            <span className="text-[11px] text-emerald-600">{autosaveHint}</span>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
        <ReceituarioSearchPanel onAdd={addMedicine} />
        <ReceituarioEditor
          lines={lines}
          generalNotes={generalNotes}
          onChangeLines={setLines}
          onChangeNotes={setGeneralNotes}
        />
        <ReceituarioPatientPanel
          patient={patient}
          dentist={{
            name: dentist.name,
            cro: dentist.cro,
            specialty: "Clínica Geral",
            clinic: "Clínica",
            city: patient.city,
          }}
          alerts={alerts}
        />
      </div>

      <AssistenteIAModal open={aiOpen} onClose={() => setAiOpen(false)} />
      <ModelosReceitaModal
        open={modelsOpen}
        onClose={() => setModelsOpen(false)}
        onSelect={(tpl) => void applyTemplate(tpl)}
      />
      <HistoricoReceitasModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={history}
        onDuplicate={duplicateFromHistory}
        onView={(item) =>
          window.open(item.pdfUrl || `/api/prescricoes/${item.id}/imprimir`, "_blank")
        }
      />
    </div>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  primary,
  spinning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
  spinning?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          : "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
      }
    >
      <Icon className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}
