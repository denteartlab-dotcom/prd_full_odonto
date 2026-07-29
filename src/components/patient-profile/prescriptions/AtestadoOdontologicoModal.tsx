"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  FileBadge2,
  FileText,
  Italic,
  List,
  Loader2,
  Mail,
  MessageCircle,
  Moon,
  Printer,
  Save,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { maskCpf } from "@/lib/masks";
import type { PatientProfile } from "@/lib/patient-profile-types";
import { computeAge } from "@/lib/patient-profile-types";
import { formatDisplayDate } from "@/lib/patients-list-mock";
import { PROCEDURE_CATALOG } from "@/lib/budget-mock";
import {
  DEFAULT_CERTIFICATE_TEXTS,
  type CertificateType,
  type DentalCid,
} from "@/lib/certificate-types";
import { certificatePdfViewerUrl } from "@/lib/certificate-pdf";
import { buildClinicHeaderLines } from "@/lib/prescription-pdf-load";
import {
  AtestadoPreview,
  type AtestadoPreviewModel,
} from "./AtestadoPreview";

type DentistInfo = {
  id: string | null;
  name: string;
  cro?: string | null;
  specialty?: string | null;
};

type ClinicInfo = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  cnpj?: string | null;
  logoUrl?: string | null;
};

type TemplateItem = {
  id: string;
  name: string;
  type: string;
  content: string;
};

const TYPE_CARDS: {
  id: CertificateType;
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  tone: string;
}[] = [
  {
    id: "comparecimento",
    title: "Comparecimento",
    description: "Paciente compareceu ao atendimento.",
    icon: CheckCircle2,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    id: "repouso",
    title: "Repouso",
    description: "Paciente necessita afastamento temporário.",
    icon: Moon,
    tone: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    id: "acompanhante",
    title: "Acompanhante",
    description: "Comprovante de acompanhamento no atendimento.",
    icon: Users,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    id: "personalizado",
    title: "Personalizado",
    description: "Redija o texto livremente com formatação.",
    icon: FileText,
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Dias de afastamento contados de forma inclusiva (3 dias a partir de 29/07 → 31/07). */
function addInclusiveDays(isoDate: string, daysCount: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const n = Math.max(0, Math.floor(daysCount));
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setDate(d.getDate() + Math.max(0, n - 1));
  return d.toISOString().slice(0, 10);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </span>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AtestadoOdontologicoModal({
  open,
  onClose,
  patient,
  dentist,
}: {
  open: boolean;
  onClose: () => void;
  patient: PatientProfile;
  dentist: DentistInfo;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [certificateType, setCertificateType] =
    useState<CertificateType>("comparecimento");
  const [certificateText, setCertificateText] = useState(
    DEFAULT_CERTIFICATE_TEXTS.comparecimento
  );
  const [attendanceDate, setAttendanceDate] = useState(todayIso);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:40");
  const [procedureName, setProcedureName] = useState("");
  const [procedureQuery, setProcedureQuery] = useState("");
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [days, setDays] = useState("1");
  const [hours, setHours] = useState("");
  const [restStartDate, setRestStartDate] = useState(todayIso);
  const [restEndDate, setRestEndDate] = useState(todayIso);
  const [companionName, setCompanionName] = useState("");
  const [companionCpf, setCompanionCpf] = useState("");
  const [cidEnabled, setCidEnabled] = useState(false);
  const [cidQuery, setCidQuery] = useState("");
  const [cid, setCid] = useState("");
  const [cidDescription, setCidDescription] = useState("");
  const [cids, setCids] = useState<DentalCid[]>([]);
  const [cidLoading, setCidLoading] = useState(false);
  const [cidSource, setCidSource] = useState("");
  const [observations, setObservations] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [modelsOpen, setModelsOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");

  const age = useMemo(() => computeAge(patient.birthDate), [patient.birthDate]);

  const procedures = useMemo(() => {
    const q = procedureQuery.trim().toLowerCase();
    if (!q) return PROCEDURE_CATALOG.slice(0, 8);
    return PROCEDURE_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [procedureQuery]);

  useEffect(() => {
    if (!cidEnabled) return;
    const q = cidQuery.trim();
    // Evita buscar de novo quando o campo já mostra "CÓDIGO — descrição"
    if (cid && q.startsWith(cid)) return;

    const t = window.setTimeout(() => {
      setCidLoading(true);
      void (async () => {
        try {
          const res = await fetch(
            `/api/cid10?q=${encodeURIComponent(q)}&limit=12`,
            { cache: "no-store" }
          );
          const data = (await res.json()) as {
            items?: DentalCid[];
            provider?: string;
            source?: string;
          };
          if (res.ok) {
            setCids(data.items || []);
            setCidSource(data.provider || data.source || "");
          } else {
            setCids([]);
          }
        } catch {
          setCids([]);
        } finally {
          setCidLoading(false);
        }
      })();
    }, 280);

    return () => window.clearTimeout(t);
  }, [cidQuery, cidEnabled, cid]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCertificateType("comparecimento");
    setCertificateText(DEFAULT_CERTIFICATE_TEXTS.comparecimento);
    setAttendanceDate(todayIso());
    setStartTime(nowTime());
    setEndTime(nowTime());
    setProcedureName("");
    setProcedureQuery("");
    setDays("1");
    setHours("");
    setRestStartDate(todayIso());
    setRestEndDate(todayIso());
    setCompanionName("");
    setCompanionCpf("");
    setCidEnabled(false);
    setCid("");
    setCidDescription("");
    setCidQuery("");
    setCids([]);
    setCidSource("");
    setObservations("");
    setMessage("");
    setSavedId(null);
    setDocumentNumber("");
    setSaving(false);

    void (async () => {
      const res = await fetch(`/api/atestados?patientId=${patient.id}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { clinic?: ClinicInfo };
      if (data.clinic) setClinic(data.clinic);
    })();

    void (async () => {
      const res = await fetch("/api/atestados/modelos", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: TemplateItem[] };
      setTemplates(data.items || []);
    })();
  }, [open, patient.id]);

  useEffect(() => {
    if (certificateType !== "repouso") return;
    const n = Number.parseInt(days, 10);
    if (!Number.isFinite(n) || n < 0) return;
    setRestEndDate(addInclusiveDays(restStartDate, n || 0));
  }, [days, restStartDate, certificateType]);

  useEffect(() => {
    if (certificateType === "personalizado") {
      if (editorRef.current && !editorRef.current.innerHTML.trim()) {
        editorRef.current.innerHTML = "";
      }
      return;
    }
    let text = DEFAULT_CERTIFICATE_TEXTS[certificateType];
    if (certificateType === "repouso" && days) {
      text = text.replace("____", days);
    }
    if (certificateType === "acompanhante" && companionName.trim()) {
      text = text.replace("__________________", companionName.trim());
    }
    setCertificateText(text);
    if (editorRef.current) editorRef.current.innerHTML = text;
  }, [certificateType, days, companionName]);

  // Inicializa o editor ao abrir
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML =
          DEFAULT_CERTIFICATE_TEXTS.comparecimento;
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const previewModel: AtestadoPreviewModel = {
    clinicName: clinic?.name || "Clínica Odontológica",
    clinicHeaderLines: clinic
      ? buildClinicHeaderLines(clinic)
      : ["Endereço da clínica", "Telefone"],
    clinicLogoUrl: clinic?.logoUrl,
    clinicCity: clinic?.city,
    clinicState: clinic?.state,
    dentistName: dentist.name,
    dentistCro: dentist.cro,
    dentistSpecialty: dentist.specialty || "Clínica Geral",
    certificateType,
    certificateText,
    procedureName,
    attendanceDate,
    startTime,
    endTime,
    days,
    hours,
    companionName,
    companionCpf,
    cid: cidEnabled ? cid : "",
    cidDescription: cidEnabled ? cidDescription : "",
    observations,
    documentNumber: documentNumber || "ATD-2026-••••••",
    validationUrl: savedId
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/validar-atestado/preview`
      : "URL de validação após salvar",
  };

  function selectType(type: CertificateType) {
    setCertificateType(type);
    setSavedId(null);
  }

  function applyEditorCommand(command: string) {
    document.execCommand(command, false);
    if (editorRef.current) {
      setCertificateText(editorRef.current.innerHTML);
    }
  }

  async function persistCertificate() {
    const res = await fetch("/api/atestados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.id,
        dentistId: dentist.id,
        certificateType,
        certificateText,
        procedureName,
        attendanceDate,
        startTime,
        endTime,
        days: certificateType === "repouso" && days ? Number(days) : null,
        hours: certificateType === "repouso" && hours ? Number(hours) : null,
        restStartDate: certificateType === "repouso" ? restStartDate : null,
        restEndDate: certificateType === "repouso" ? restEndDate : null,
        companionName:
          certificateType === "acompanhante" ? companionName : null,
        companionCpf:
          certificateType === "acompanhante" ? companionCpf : null,
        cid: cidEnabled ? cid : null,
        cidDescription: cidEnabled ? cidDescription : null,
        observations,
      }),
    });
    const data = (await res.json()) as {
      item?: { id: string; documentNumber: string };
      error?: string;
    };
    if (!res.ok || !data.item) {
      throw new Error(data.error || "Falha ao salvar atestado.");
    }
    setSavedId(data.item.id);
    setDocumentNumber(data.item.documentNumber);
    return data.item;
  }

  async function handleSave() {
    if (!certificateText.replace(/<[^>]+>/g, "").trim()) {
      setMessage("Informe o texto do atestado.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const item = await persistCertificate();
      setMessage(`Atestado ${item.documentNumber} salvo com sucesso.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAndOpenPdf() {
    setSaving(true);
    setMessage("");
    try {
      const item = savedId
        ? { id: savedId, documentNumber }
        : await persistCertificate();
      window.open(certificatePdfViewerUrl(item.id), "_blank");
      setMessage("PDF gerado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao gerar PDF.");
    } finally {
      setSaving(false);
    }
  }

  async function sendWhatsApp() {
    try {
      const item = savedId
        ? { id: savedId, documentNumber }
        : await persistCertificate();
      const res = await fetch(`/api/atestados/${item.id}/whatsapp`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        waUrl?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data.error || "Falha no WhatsApp.");
      if (data.waUrl) window.open(data.waUrl, "_blank");
      setMessage(data.message || "WhatsApp preparado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro no WhatsApp.");
    }
  }

  async function sendEmail() {
    try {
      const item = savedId
        ? { id: savedId, documentNumber }
        : await persistCertificate();
      const res = await fetch(`/api/atestados/${item.id}/email`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        mailto?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data.error || "Falha no e-mail.");
      if (data.mailto) window.location.href = data.mailto;
      setMessage(data.message || "E-mail preparado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro no e-mail.");
    }
  }

  async function saveTemplate() {
    const name = newTemplateName.trim();
    if (!name) {
      setMessage("Informe o nome do modelo.");
      return;
    }
    const res = await fetch("/api/atestados/modelos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type: certificateType,
        content: certificateText,
      }),
    });
    const data = (await res.json()) as {
      item?: TemplateItem;
      error?: string;
    };
    if (!res.ok || !data.item) {
      setMessage(data.error || "Não foi possível salvar o modelo.");
      return;
    }
    setTemplates((list) => [...list, data.item!]);
    setNewTemplateName("");
    setMessage(`Modelo “${data.item.name}” salvo.`);
  }

  function duplicateForm() {
    setSavedId(null);
    setDocumentNumber("");
    setMessage("Cópia pronta para emitir um novo atestado.");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-[2px] animate-in fade-in duration-200 sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[96] flex max-h-[94vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-900/20"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                🩺 Emitir Atestado Odontológico
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Documento oficial para justificar comparecimento ou afastamento
                das atividades.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModelsOpen((v) => !v)}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Modelos
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {message ? (
          <div className="shrink-0 border-b border-indigo-100 bg-indigo-50 px-5 py-2.5 text-sm text-indigo-800">
            {message}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:p-5">
            <div className="space-y-4">
              <Card title="Dados do paciente">
                <div className="flex gap-3">
                  {patient.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={patient.photoUrl}
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-sm",
                        patient.avatarColor
                      )}
                    >
                      {patient.initials}
                    </div>
                  )}
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <ReadonlyField label="Nome completo" value={patient.name} />
                    <ReadonlyField
                      label="Nº do prontuário"
                      value={patient.chartNumber || "—"}
                    />
                    <ReadonlyField label="CPF" value={patient.cpf || "—"} />
                    <ReadonlyField
                      label="Data de nascimento"
                      value={`${formatDisplayDate(patient.birthDate)} (${age} anos)`}
                    />
                    <ReadonlyField label="Sexo" value={patient.sexo || "—"} />
                    <ReadonlyField
                      label="Telefone"
                      value={patient.phone || "—"}
                    />
                  </div>
                </div>
              </Card>

              <Card title="Dados do atendimento">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <FieldLabel>Data do atendimento</FieldLabel>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <FieldLabel>Horário inicial</FieldLabel>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Horário final</FieldLabel>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </label>
                  </div>
                  <div className="relative sm:col-span-2">
                    <FieldLabel>Procedimento realizado</FieldLabel>
                    <input
                      value={procedureQuery || procedureName}
                      onChange={(e) => {
                        setProcedureQuery(e.target.value);
                        setProcedureName(e.target.value);
                        setProcedureOpen(true);
                      }}
                      onFocus={() => setProcedureOpen(true)}
                      placeholder="Buscar no cadastro de procedimentos..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                    />
                    {procedureOpen ? (
                      <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                        {procedures.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-indigo-50"
                              onClick={() => {
                                setProcedureName(p.name);
                                setProcedureQuery(p.name);
                                setProcedureOpen(false);
                              }}
                            >
                              <span className="font-medium text-slate-800">
                                {p.name}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-slate-400">
                                {p.code} · {p.category}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Profissional responsável</FieldLabel>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800">
                      {dentist.name}
                      {dentist.cro ? ` · CRO ${dentist.cro}` : ""}
                      {dentist.specialty ? ` · ${dentist.specialty}` : ""}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Tipo de documento">
                <div className="grid gap-2 sm:grid-cols-2">
                  {TYPE_CARDS.map((card) => {
                    const Icon = card.icon;
                    const active = certificateType === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => selectType(card.id)}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition",
                          active
                            ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-xl",
                            card.tone
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {card.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {card.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {certificateType === "repouso" ? (
                  <div className="mt-3 grid gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 sm:grid-cols-2">
                    <label className="block">
                      <FieldLabel>Dias</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Horas</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Data inicial</FieldLabel>
                      <input
                        type="date"
                        value={restStartDate}
                        onChange={(e) => setRestStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Data final</FieldLabel>
                      <input
                        type="date"
                        value={restEndDate}
                        readOnly
                        title="Calculada automaticamente pelos dias de afastamento"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      />
                    </label>
                  </div>
                ) : null}

                {certificateType === "acompanhante" ? (
                  <div className="mt-3 grid gap-3 rounded-xl border border-sky-100 bg-sky-50/50 p-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <FieldLabel>Nome do acompanhante</FieldLabel>
                      <input
                        value={companionName}
                        onChange={(e) => setCompanionName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <FieldLabel>CPF do acompanhante (opcional)</FieldLabel>
                      <input
                        value={companionCpf}
                        onChange={(e) =>
                          setCompanionCpf(maskCpf(e.target.value))
                        }
                        placeholder="000.000.000-00"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                ) : null}
              </Card>

              <Card title="Texto do atestado">
                <div className="mb-2 flex flex-wrap gap-1">
                  <EditorBtn
                    icon={Bold}
                    label="Negrito"
                    onClick={() => applyEditorCommand("bold")}
                  />
                  <EditorBtn
                    icon={Italic}
                    label="Itálico"
                    onClick={() => applyEditorCommand("italic")}
                  />
                  <EditorBtn
                    icon={List}
                    label="Lista"
                    onClick={() => applyEditorCommand("insertUnorderedList")}
                  />
                  <EditorBtn
                    icon={ClipboardCopy}
                    label="Copiar"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        editorRef.current?.innerText || ""
                      );
                      setMessage("Texto copiado.");
                    }}
                  />
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    if (editorRef.current) {
                      setCertificateText(editorRef.current.innerHTML);
                    }
                  }}
                  className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                />
              </Card>

              <Card title="CID">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-slate-700">
                    Adicionar CID
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cidEnabled}
                    onClick={() => setCidEnabled((v) => !v)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition",
                      cidEnabled ? "bg-indigo-600" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                        cidEnabled ? "left-5" : "left-0.5"
                      )}
                    />
                  </button>
                </label>
                {cidEnabled ? (
                  <div className="relative mt-3">
                    <FieldLabel>Pesquisar CID (banco + API gratuita)</FieldLabel>
                    <input
                      value={cidQuery}
                      onChange={(e) => {
                        setCidQuery(e.target.value);
                        if (cid) {
                          setCid("");
                          setCidDescription("");
                        }
                      }}
                      placeholder="Ex.: K08.8, cárie, periodontite..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      {cidLoading
                        ? "Buscando na base CID-10…"
                        : cidSource
                          ? `Fonte: ${cidSource}`
                          : "Digite código ou descrição"}
                    </p>
                    <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1">
                      {!cidLoading && cids.length === 0 ? (
                        <li className="px-3 py-3 text-center text-xs text-slate-400">
                          Nenhum CID encontrado. Tente outro termo.
                        </li>
                      ) : null}
                      {cids.map((item) => (
                        <li key={item.code}>
                          <button
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-indigo-50"
                            onClick={() => {
                              setCid(item.code);
                              setCidDescription(item.description);
                              setCidQuery(
                                `${item.code} — ${item.description}`
                              );
                            }}
                          >
                            <span className="font-semibold text-indigo-700">
                              {item.code}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-slate-500">
                              {item.description}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {cid ? (
                      <p className="mt-2 text-xs text-emerald-700">
                        Selecionado: <strong>{cid}</strong> — {cidDescription}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </Card>

              <Card title="Observações">
                <textarea
                  value={observations}
                  maxLength={500}
                  rows={3}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações adicionais (até 500 caracteres)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
                />
                <p className="mt-1 text-right text-[11px] text-slate-400">
                  {observations.length}/500
                </p>
              </Card>

              <Card title="Dados do dentista">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                    {dentist.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join("")}
                  </div>
                  <div className="grid flex-1 gap-1 sm:grid-cols-2">
                    <ReadonlyField label="Nome" value={dentist.name} />
                    <ReadonlyField
                      label="CRO"
                      value={dentist.cro || "—"}
                    />
                    <ReadonlyField
                      label="Especialidade"
                      value={dentist.specialty || "Clínica Geral"}
                    />
                    <ReadonlyField
                      label="Assinatura / Carimbo"
                      value="Digital (sistema)"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Preview A4
                  </p>
                  <FileBadge2 className="h-4 w-4 text-indigo-500" />
                </div>
                <AtestadoPreview patient={patient} model={previewModel} />
              </div>

              {modelsOpen ? (
                <div className="rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">
                    Modelos de atestado
                  </p>
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                    {templates.length === 0 ? (
                      <li className="text-xs text-slate-400">
                        Nenhum modelo cadastrado.
                      </li>
                    ) : (
                      templates.map((t) => (
                        <li key={t.id}>
                          <button
                            type="button"
                            className="w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-indigo-50"
                            onClick={() => {
                              setCertificateType(
                                (t.type as CertificateType) || "personalizado"
                              );
                              setCertificateText(t.content);
                              if (editorRef.current) {
                                editorRef.current.innerHTML = t.content;
                              }
                              setModelsOpen(false);
                            }}
                          >
                            <span className="font-semibold text-slate-800">
                              {t.name}
                            </span>
                            <span className="ml-1 text-slate-400">
                              · {t.type}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Nome do modelo"
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => void saveTemplate()}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <FooterBtn label="Cancelar" onClick={onClose} />
            <FooterBtn
              label={saving ? "Salvando..." : "Salvar"}
              icon={saving ? Loader2 : Save}
              spinning={saving}
              onClick={() => void handleSave()}
            />
            <FooterBtn
              label="Gerar PDF"
              icon={FileText}
              primary
              onClick={() => void saveAndOpenPdf()}
            />
            <FooterBtn
              label="Imprimir"
              icon={Printer}
              onClick={() => void saveAndOpenPdf()}
            />
            <FooterBtn
              label="WhatsApp"
              icon={MessageCircle}
              onClick={() => void sendWhatsApp()}
            />
            <FooterBtn
              label="E-mail"
              icon={Mail}
              onClick={() => void sendEmail()}
            />
            <FooterBtn
              label="Duplicar"
              icon={Copy}
              onClick={duplicateForm}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function EditorBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function FooterBtn({
  label,
  onClick,
  icon: Icon,
  primary,
  spinning,
}: {
  label: string;
  onClick: () => void;
  icon?: typeof Save;
  primary?: boolean;
  spinning?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
        primary
          ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-blue-700"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {Icon ? (
        <Icon className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
      ) : null}
      {label}
    </button>
  );
}
