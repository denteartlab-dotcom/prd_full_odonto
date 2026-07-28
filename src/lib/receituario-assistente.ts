import { DENTAL_MEDICATIONS, type DentalMedication } from "@/lib/dental-medications";
import { medicineToLine, type ReceituarioLine } from "@/lib/receituario-types";
import type { Medication } from "@/types/medication";

export type AssistenteSuggestion = {
  line: ReceituarioLine;
  reason: string;
};

export type AssistenteResult = {
  summary: string;
  procedureLabel: string;
  suggestions: AssistenteSuggestion[];
  notes: string;
  alerts: string[];
  source: "local" | "groq" | "gemini" | "openai" | "perplexity";
  citations?: string[];
  attempts?: Array<{ provider: string; ok: boolean; detail?: string }>;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function dentalToMedication(row: DentalMedication): Medication {
  const controlled = row.category === "antibiotico" || row.category === "corticoide";
  return {
    id: row.id,
    name: row.name,
    genericName: row.name.replace(/\s+\d+.*$/, "").trim(),
    activeIngredient: row.name.replace(/\s+\d+.*$/, "").trim(),
    concentration: row.name.match(/(\d+[\d.,]*\s*(?:mg|g|ml|%))/i)?.[1] || "—",
    presentation: row.name,
    dosageForm: /gel|soluç|bochecho|%/i.test(row.name) ? "Solução/Gel" : "Comprimido",
    manufacturer: "Referência odontológica",
    category: row.category,
    route: row.category === "antisseptico" || row.category === "anestesico" ? "Bucal" : "Oral",
    prescriptionType: controlled ? "controle_especial" : "simples",
    controlled,
    anvisaCode: "",
    leafletUrl: "",
  };
}

function pick(id: string) {
  return DENTAL_MEDICATIONS.find((m) => m.id === id);
}

function detectProcedure(text: string) {
  if (/candidi|candidas|sapinho|moniliase|monil[ií]ase/.test(text)) return "candidiase";
  if (/implante|enxerto/.test(text)) return "implante";
  if (/extrac|exodon|siso|terceiro molar|dente do siso/.test(text)) return "extracao";
  if (/canal|endodon|pulpite/.test(text)) return "canal";
  if (/periodont|raspagem|gengiv/.test(text)) return "periodontia";
  if (/protese|pr[oó]tese/.test(text)) return "protese";
  if (/clareament/.test(text)) return "clareamento";
  if (
    /abscess|infecc|celulite|fistula|drenagem|secrec|pus|exsud|supurac|purulen/.test(
      text
    )
  ) {
    return "infeccao";
  }
  if (/urgencia|dor intensa|dor forte|emergencia/.test(text)) return "urgencia";
  if (/cirurg|pos[- ]?operator/.test(text)) return "pos-operatorio";
  return "geral";
}

const PROCEDURE_LABELS: Record<string, string> = {
  candidiase: "Candidíase oral",
  implante: "Implante / enxerto",
  extracao: "Extração dentária",
  canal: "Tratamento de canal",
  periodontia: "Periodontia",
  protese: "Prótese",
  clareamento: "Clareamento",
  infeccao: "Infecção odontológica",
  urgencia: "Urgência / dor",
  "pos-operatorio": "Pós-operatório",
  geral: "Procedimento odontológico",
};

function buildProtocol(procedure: string, ctx: string) {
  const alergiaPenicilina = /alerg.*penicil|penicilina|amoxicilina/.test(ctx);
  const gestante = /gestante|gravida|gr[aá]vida|lactante/.test(ctx);
  const dorForte = /dor (forte|intensa|severa)|edema importante|inflamacao importante/.test(ctx);
  const gastrite = /gastrite|ulcera|estomago sensivel/.test(ctx);

  const ids: string[] = [];
  const reasons: Record<string, string> = {};
  const alerts: string[] = [];
  let notes = "";

  const add = (id: string, reason: string) => {
    if (!ids.includes(id)) {
      ids.push(id);
      reasons[id] = reason;
    }
  };

  switch (procedure) {
    case "candidiase":
      add("nistatina-susp", "Antifúngico de primeira linha na candidíase oral");
      add("miconazol-gel", "Alternativa tópica em gel oral");
      notes =
        "Higiene oral rigorosa; se uso de prótese, higienizar e deixar fora à noite. Avaliar imunossupressão/antibiótico recente.";
      alerts.push(
        "Candidíase oral — não usar analgésico/AINE como tratamento principal; priorizar antifúngico."
      );
      break;
    case "extracao":
      add("ibuprofeno-600", "Anti-inflamatório pós-exodontia");
      add("dipirona-500", "Analgesia de resgate");
      if (dorForte) add("dexametasona-4", "Edema / inflamação importante");
      notes = "Compressa fria nas primeiras 24h. Dieta pastosa e fria.";
      break;
    case "implante":
      add(alergiaPenicilina ? "clindamicina-300" : "amox-clav", "Cobertura antibiótica cirúrgica");
      add("ibuprofeno-600", "Controle inflamatório");
      add("dexametasona-4", "Redução de edema pós-implante");
      notes = "Manter higiene rigorosa na área operada.";
      break;
    case "canal":
      add("ibuprofeno-600", "Analgesia anti-inflamatória endodôntica");
      add("dipirona-500", "Analgesia complementar");
      break;
    case "periodontia":
      add("clorexidina-012", "Antissepsia periodontal");
      add(gestante ? "paracetamol-750" : "nimesulida-100", "Controle da dor/inflamação");
      break;
    case "protese":
      add("clorexidina-012", "Higiene sob prótese");
      add("dipirona-500", "Conforto / dor leve");
      break;
    case "clareamento":
      add("dipirona-500", "Sensibilidade pós-clareamento");
      add("lidocaina-topic", "Alívio tópico da sensibilidade");
      notes = "Evitar alimentos pigmentados por 48h.";
      break;
    case "infeccao":
      add(alergiaPenicilina ? "azitromicina-500" : "amoxicilina-500", "Tratamento infeccioso");
      add("ibuprofeno-600", "Anti-inflamatório associado");
      break;
    case "urgencia":
      add(gestante ? "paracetamol-750" : "ibuprofeno-600", "Alívio rápido da dor");
      add("dipirona-500", "Analgesia complementar");
      break;
    case "pos-operatorio":
      add(alergiaPenicilina ? "clindamicina-300" : "amoxicilina-500", "Profilaxia / cobertura");
      add("ibuprofeno-600", "Anti-inflamatório pós-operatório");
      add("clorexidina-012", "Antissepsia local");
      notes = "Compressa fria nas primeiras 24h. Dieta pastosa e fria.";
      break;
    default:
      add(gestante ? "paracetamol-750" : "ibuprofeno-600", "Analgesia padrão");
      add("dipirona-500", "Analgesia de resgate");
      break;
  }

  if (gastrite && ids.includes("ibuprofeno-600")) {
    add("omeprazol-20", "Proteção gástrica com uso de AINE");
    alerts.push("Paciente com histórico gástrico — considere proteção com omeprazol.");
  }

  if (alergiaPenicilina) {
    alerts.push("Possível alergia a penicilina — evitado amoxicilina/clavulanato.");
  }
  if (gestante) {
    alerts.push("Gestante/lactante — preferir esquemas mais seguros (ex.: paracetamol). Validar cada item.");
  }

  return { ids, reasons, alerts, notes };
}

export function buildLocalAssistenteSuggestion(input: {
  prompt: string;
  allergies?: string;
  diseases?: string;
  medicationsInUse?: string;
}): AssistenteResult {
  const prompt = input.prompt.trim();
  const ctx = normalize(
    [prompt, input.allergies, input.diseases, input.medicationsInUse].filter(Boolean).join(" ")
  );
  const procedure = detectProcedure(ctx);
  const { ids, reasons, alerts, notes } = buildProtocol(procedure, ctx);

  const suggestions: AssistenteSuggestion[] = [];
  for (const id of ids) {
    const dental = pick(id);
    if (!dental) continue;
    const line = medicineToLine(dentalToMedication(dental));
    suggestions.push({
      line,
      reason: reasons[id] || "Sugestão clínica odontológica",
    });
  }

  const label = PROCEDURE_LABELS[procedure] || PROCEDURE_LABELS.geral;

  return {
    summary: `Com base em “${label}”, montei uma sugestão inicial de receita. Revise doses e interações antes de emitir.`,
    procedureLabel: label,
    suggestions,
    notes,
    alerts,
    source: "local",
  };
}

export function parseOpenAiAssistentePayload(
  raw: unknown,
  fallbackPrompt: string,
  source: AssistenteResult["source"] = "openai",
  citations: string[] = []
): AssistenteResult | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as {
    summary?: string;
    procedureLabel?: string;
    notes?: string;
    alerts?: string[];
    medications?: Array<{
      medicineId?: string;
      name?: string;
      reason?: string;
      quantity?: string;
      posology?: string;
      duration?: string;
      notes?: string;
      route?: string;
    }>;
  };

  const suggestions: AssistenteSuggestion[] = [];
  for (const item of data.medications || []) {
    const dental =
      (item.medicineId && pick(item.medicineId)) ||
      DENTAL_MEDICATIONS.find((m) =>
        normalize(m.name).includes(normalize(item.name || ""))
      );

    if (dental) {
      const line = medicineToLine(dentalToMedication(dental));
      if (item.quantity) line.quantity = item.quantity;
      if (item.posology) line.posology = item.posology;
      if (item.duration) line.duration = item.duration;
      if (item.notes) line.notes = item.notes;
      if (item.route) line.route = item.route;
      suggestions.push({
        line,
        reason: item.reason || "Sugestão da IA",
      });
      continue;
    }

    if (!item.name) continue;
    suggestions.push({
      line: {
        id: `line-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        medicineId: item.medicineId || `ai-${normalize(item.name).slice(0, 24)}`,
        name: item.name,
        concentration: "—",
        quantity: item.quantity || "1 unidade",
        pharmaceuticalForm: "—",
        route: item.route || "Oral",
        posology: item.posology || "conforme orientação",
        duration: item.duration || "conforme orientação",
        notes: item.notes || "",
      },
      reason: item.reason || "Sugestão da IA",
    });
  }

  if (!suggestions.length) return null;

  return {
    summary:
      data.summary ||
      `Sugestão gerada para: ${fallbackPrompt.slice(0, 80)}${fallbackPrompt.length > 80 ? "…" : ""}`,
    procedureLabel: data.procedureLabel || "Sugestão IA",
    suggestions,
    notes: data.notes || "",
    alerts: Array.isArray(data.alerts) ? data.alerts.map(String) : [],
    source,
    citations: citations.filter(Boolean).slice(0, 8),
  };
}

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export function buildAssistenteSystemPrompt() {
  return `Você é um assistente clínico odontológico brasileiro.
Pesquise fontes atualizadas (protocolos odontológicos, bulas, literatura) e sugira uma receita inicial.
Priorize medicamentos disponíveis no Brasil e posologias usualmente usadas em odontologia.
Se houver catálogo local, use medicineId quando houver correspondência; caso contrário, informe o nome comercial/genérico correto.
Responda APENAS JSON válido no formato:
{
  "summary": string,
  "procedureLabel": string,
  "notes": string,
  "alerts": string[],
  "medications": [
    {
      "medicineId": string,
      "name": string,
      "reason": string,
      "quantity": string,
      "posology": string,
      "duration": string,
      "notes": string,
      "route": string
    }
  ]
}
Não invente doses perigosas. Sempre indique que o dentista deve validar antes de emitir.
Inclua alertas para alergias, gestação e interações quando relevantes.`;
}
