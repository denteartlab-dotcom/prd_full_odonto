"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FilePlus2,
  History,
  Loader2,
  MessageCircle,
  Printer,
  Sparkles,
  BookTemplate,
  FileText,
  Send,
  Stethoscope,
} from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { PrescriptionRecord } from "@/lib/prescription-types";
import { PrescriptionPdfService } from "@/lib/medication-service";
import { prescriptionPdfViewerUrl } from "@/lib/prescription-pdf";
import { medicationService } from "@/services/medication.service";
import type { Medication } from "@/types/medication";
import {
  buildReceituarioAlerts,
  medicineToLine,
  type ReceituarioLine,
  type ReceituarioTemplate,
} from "@/lib/receituario-types";
import { AssistenteIAModal } from "./AssistenteIAModal";
import { AtestadoOdontologicoModal } from "./AtestadoOdontologicoModal";
import { HistoricoReceitasModal } from "./HistoricoReceitasModal";
import { ModelosReceitaModal } from "./ModelosReceitaModal";
import { ReceituarioEditor } from "./ReceituarioEditor";
import { ReceituarioPatientPanel } from "./ReceituarioPatientPanel";
import { ReceituarioSearchPanel } from "./ReceituarioSearchPanel";
import { VisualizarPdfModal } from "./VisualizarPdfModal";

type ProfessionalOption = {
  id: string | null;
  name: string;
  cro?: string | null;
  specialty?: string | null;
  phone?: string | null;
  email?: string | null;
};

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
  const [prescriber, setPrescriber] = useState<ProfessionalOption>({
    id: null,
    name: userName || "Dr(a). Responsável",
    cro: null,
  });
  const [history, setHistory] = useState<PrescriptionRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [autosaveHint, setAutosaveHint] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [atestadoOpen, setAtestadoOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/prescricoes?patientId=${patient.id}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setHistory(data.items ?? []);
      if (data.prescriber?.name) {
        setPrescriber({
          id: data.prescriber.id ?? null,
          name: data.prescriber.name,
          cro: data.prescriber.cro ?? null,
          specialty: data.prescriber.specialty ?? null,
          phone: data.prescriber.phone ?? null,
          email: data.prescriber.email ?? null,
        });
      } else if (userName) {
        setPrescriber((cur) => ({ ...cur, name: userName }));
      }
    }
  }, [patient.id, userName]);

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
      };
      if (draft.lines?.length) setLines(draft.lines);
      if (draft.generalNotes) setGeneralNotes(draft.generalNotes);
    } catch {
      /* ignore */
    }
  }, [patient.id]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY(patient.id),
          JSON.stringify({ lines, generalNotes })
        );
        setAutosaveHint(`Rascunho salvo · ${new Date().toLocaleTimeString("pt-BR")}`);
      } catch {
        /* ignore */
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [lines, generalNotes, patient.id]);

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

  const dentist = {
    id: prescriber.id,
    name: prescriber.name || userName || "Dr(a). Responsável",
    cro: prescriber.cro,
    specialty: prescriber.specialty || "Clínica Geral",
    phone: prescriber.phone,
  };

  function addMedicine(m: Medication) {
    setLines((cur) => {
      if (cur.some((l) => l.medicineId === m.id)) return cur;
      return [...cur, medicineToLine(m)];
    });
    setMessage(`${m.name} adicionado à receita.`);
  }

  function clearDraft() {
    setLines([]);
    setGeneralNotes("");
    window.localStorage.removeItem(DRAFT_KEY(patient.id));
    setMessage("Nova receita iniciada.");
  }

  async function applyTemplate(tpl: ReceituarioTemplate & { lines?: ReceituarioLine[] }) {
    if (tpl.lines?.length) {
      setLines(
        tpl.lines.map((l, i) => ({
          ...l,
          id: `line-tpl-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        }))
      );
      if (tpl.generalNotes) setGeneralNotes(tpl.generalNotes);
      setMessage(`Modelo “${tpl.name}” aplicado.`);
      return;
    }

    const meds: ReceituarioLine[] = [];
    for (const id of tpl.medicineIds) {
      try {
        const m = await medicationService.getMedicineById(id);
        meds.push(medicineToLine(m));
      } catch {
        /* ignore missing ids */
      }
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
      const hasControlled = lines.some((l) => l.controlled);
      const res = await fetch("/api/prescricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          professionalId: prescriber.id || null,
          kind: hasControlled ? "controle_especial" : "receituario_simples",
          observations: generalNotes,
          medications: lines.map((l) => ({
            medicationName: l.name,
            dose: l.quantity,
            frequency: l.posology,
            duration: l.duration,
            instructions:
              [l.route, l.notes].filter(Boolean).join(" · ") || undefined,
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
      setMessage(
        hasControlled
          ? "Receituário de Controle Especial emitido com sucesso."
          : "Receita emitida com sucesso."
      );
      if (data.item?.id) {
        window.open(prescriptionPdfViewerUrl(data.item.id), "_blank");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao emitir.");
    } finally {
      setSaving(false);
    }
  }

  const lastId = history[0]?.id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <ToolbarBtn icon={FilePlus2} label="Nova Receita" onClick={clearDraft} />
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
            if (!history.length) {
              setMessage("Emita uma receita para visualizar o PDF.");
              return;
            }
            setPdfOpen(true);
          }}
        />
        <ToolbarBtn
          icon={Printer}
          label="Imprimir"
          onClick={() => {
            if (lastId) window.open(prescriptionPdfViewerUrl(lastId), "_blank");
            else setMessage("Emita uma receita para imprimir.");
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!history.length) {
              setMessage("Emita uma receita para enviar no WhatsApp.");
              return;
            }
            setPdfOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </button>
        <ToolbarBtn icon={History} label="Histórico" onClick={() => setHistoryOpen(true)} />
        <ToolbarBtn icon={BookTemplate} label="Modelos" onClick={() => setModelsOpen(true)} />
        <ToolbarBtn
          icon={Stethoscope}
          label="Atestado"
          onClick={() => setAtestadoOpen(true)}
        />
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Assistente IA
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">Prescritor:</span>
        <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-800">
          {dentist.name}
          {dentist.cro ? ` · ${dentist.cro}` : ""}
        </span>
        <span className="text-[11px] text-slate-400">(usuário logado)</span>
        {lines.some((l) => l.controlled) ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
            Controle especial — PDF oficial ao emitir
          </span>
        ) : null}
        {autosaveHint ? (
          <span className="text-[11px] text-emerald-600">{autosaveHint}</span>
        ) : null}
      </div>

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
            specialty: dentist.specialty || "Clínica Geral",
            clinic: "Clínica",
            phone: dentist.phone || undefined,
            city: patient.city,
          }}
          alerts={alerts}
        />
      </div>

      <AssistenteIAModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        patientContext={{
          allergies: patient.anamnesis.allergies,
          diseases: patient.anamnesis.diseases,
          medicationsInUse: patient.anamnesis.medications,
        }}
        onApply={({ lines: nextLines, notes, summary }) => {
          setLines(nextLines);
          if (notes) setGeneralNotes(notes);
          setMessage(summary || "Sugestão da IA aplicada na receita.");
        }}
      />
      <ModelosReceitaModal
        open={modelsOpen}
        onClose={() => setModelsOpen(false)}
        onSelect={(tpl) => void applyTemplate(tpl)}
        currentLines={lines}
        currentNotes={generalNotes}
      />
      <HistoricoReceitasModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={history}
        onDuplicate={duplicateFromHistory}
        onView={(item) =>
          window.open(item.pdfUrl || prescriptionPdfViewerUrl(item.id), "_blank")
        }
      />
      <VisualizarPdfModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        items={history}
        patientName={patient.name}
        patientPhone={patient.phone}
      />
      <AtestadoOdontologicoModal
        open={atestadoOpen}
        onClose={() => setAtestadoOpen(false)}
        patient={patient}
        dentist={{
          id: dentist.id,
          name: dentist.name,
          cro: dentist.cro,
          specialty: dentist.specialty,
        }}
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
