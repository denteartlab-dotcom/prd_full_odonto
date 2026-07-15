"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pill } from "lucide-react";
import { buildMemedPatientPayload, type MemedPatientInput } from "@/lib/memed/patient-payload";

const SCRIPT_ID = "memed-sinapse-script";

type MemedTokenResponse = {
  configured?: boolean;
  token?: string;
  scriptUrl?: string;
  error?: string;
  message?: string;
};

async function loadMemedScript(scriptUrl: string, token: string) {
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    existing.dataset.token = token;
    existing.src = scriptUrl;
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "text/javascript";
    script.src = scriptUrl;
    script.dataset.token = token;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar módulo Memed."));
    document.body.appendChild(script);
  });
}

async function waitForMemedReady(timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (window.MdHub && window.MdSinapsePrescricao) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Módulo Memed não inicializou a tempo.");
}

function waitForPrescriptionModule() {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Módulo de prescrição indisponível.")), 15000);
    const handler = (data?: unknown) => {
      const module = data as { name?: string };
      if (module?.name === "plataforma.prescricao") {
        window.clearTimeout(timeout);
        resolve();
      }
    };
    window.MdSinapsePrescricao?.event.add("core:moduleInit", handler);
  });
}

export function MemedPrescriptionLauncher({
  patient,
  onSaved,
  className,
  label = "Nova prescrição Memed",
}: {
  patient: MemedPatientInput;
  onSaved?: (payload: { memedId?: string; content?: string }) => void;
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncHandlerRef = useRef<((data?: unknown) => void) | null>(null);

  const persistPrescription = useCallback(
    async (memedId?: string, content?: string) => {
      await fetch("/api/memed/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          memedId,
          content: content || "Prescrição digital Memed",
        }),
      });
      onSaved?.({ memedId, content });
    },
    [onSaved, patient.id]
  );

  useEffect(() => {
    return () => {
      if (syncHandlerRef.current) {
        window.MdSinapsePrescricao?.event.remove("prescricao:criada", syncHandlerRef.current);
      }
    };
  }, []);

  async function openPrescription() {
    setLoading(true);
    setError(null);

    try {
      const tokenRes = await fetch("/api/memed/token");
      const tokenData = (await tokenRes.json()) as MemedTokenResponse;

      if (!tokenRes.ok || !tokenData.configured) {
        throw new Error(tokenData.message || tokenData.error || "Memed não configurada.");
      }
      if (!tokenData.token || !tokenData.scriptUrl) {
        throw new Error(tokenData.error || "Token Memed indisponível.");
      }

      await loadMemedScript(tokenData.scriptUrl, tokenData.token);
      await waitForMemedReady();
      await waitForPrescriptionModule();

      const payload = buildMemedPatientPayload(patient);
      await window.MdHub?.command.send("plataforma.prescricao", "setPaciente", payload);
      await window.MdHub?.module.show("plataforma.prescricao");

      const syncHandler = async (data?: unknown) => {
        const record = data as { id?: string | number; prescricao?: { id?: string | number } };
        const memedId = String(record?.id ?? record?.prescricao?.id ?? "");
        if (!memedId) return;
        await persistPrescription(memedId);
      };

      syncHandlerRef.current = syncHandler;
      window.MdSinapsePrescricao?.event.add("prescricao:criada", syncHandler);

      await window.MdHub?.command.send("plataforma.prescricao", "newPrescription");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao abrir prescrição Memed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openPrescription}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pill className="h-4 w-4" />}
        {loading ? "Abrindo Memed..." : label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
