import type { PatientProfile } from "@/lib/patient-profile-types";
import type { PatientHistoryEventFull } from "@/lib/patient-history-types";

function channelLabel(channel: string) {
  if (channel === "whatsapp") return "WhatsApp";
  if (channel === "email") return "E-mail";
  if (channel === "sms") return "SMS";
  return channel;
}

/**
 * Complementa o histórico do banco com módulos que só existem no perfil do paciente
 * (comunicações / imagens). Não usa mocks.
 */
export function buildHistoryExtrasFromProfile(
  patient: PatientProfile
): PatientHistoryEventFull[] {
  const events: PatientHistoryEventFull[] = [];

  for (const c of patient.communications || []) {
    if (!c?.id || !c.message?.trim()) continue;
    const [date, timePart] = (c.date || "").split("T");
    const time = timePart?.slice(0, 5) || "00:00";
    if (!date) continue;
    events.push({
      id: `com-${c.id}`,
      type: "comunicacao",
      title: "Mensagem enviada",
      description: `${channelLabel(c.channel)} · ${c.message.slice(0, 100)}`,
      professional: "Recepção",
      specialty: "Atendimento",
      date,
      time,
      status: c.status === "falhou" ? "cancelado" : "enviado",
      relatedTab: "comunicacoes",
    });
  }

  for (const img of patient.images || []) {
    if (!img?.id || !img.title?.trim()) continue;
    const date = img.date?.slice(0, 10);
    if (!date) continue;
    events.push({
      id: `img-${img.id}`,
      type: "imagem",
      title: "Imagem adicionada",
      description: img.title,
      detail: img.category,
      professional: "Clínica",
      date,
      time: "12:00",
      status: "concluida",
      relatedTab: "imagens",
    });
  }

  return events;
}

export function mergeHistoryEvents(
  ...lists: PatientHistoryEventFull[][]
): PatientHistoryEventFull[] {
  const map = new Map<string, PatientHistoryEventFull>();
  for (const list of lists) {
    for (const event of list) {
      map.set(event.id, event);
    }
  }
  return [...map.values()].sort((a, b) =>
    `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
  );
}
