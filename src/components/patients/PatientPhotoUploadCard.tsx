"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, UserRound, X } from "lucide-react";
import { FormSectionCard } from "./FormField";

export function PatientPhotoUploadCard({
  previewUrl,
  onSelect,
}: {
  previewUrl: string | null;
  onSelect: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamError, setWebcamError] = useState("");
  const [capturing, setCapturing] = useState(false);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function openWebcam() {
    setWebcamError("");
    setWebcamOpen(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador não suporta webcam.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível acessar a webcam.";
      setWebcamError(
        message.includes("Permission") || message.includes("NotAllowed")
          ? "Permissão da câmera negada. Libere o acesso no navegador."
          : message
      );
    }
  }

  function closeWebcam() {
    stopStream();
    setWebcamOpen(false);
    setWebcamError("");
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    setCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Falha ao capturar imagem.");

      // Espelha horizontalmente (selfie)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Não foi possível gerar a foto.");

      const file = new File([blob], `paciente-webcam-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onSelect(file);
      closeWebcam();
    } catch (err) {
      setWebcamError(err instanceof Error ? err.message : "Erro ao capturar.");
    } finally {
      setCapturing(false);
    }
  }

  useEffect(() => {
    return () => stopStream();
  }, []);

  return (
    <FormSectionCard title="Foto do paciente">
      <div className="space-y-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Prévia da foto"
              className="mb-3 h-28 w-28 rounded-2xl object-cover shadow-sm ring-2 ring-white"
            />
          ) : (
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <UserRound className="h-8 w-8" />
            </div>
          )}
          <p className="text-sm font-medium text-slate-700">
            {previewUrl ? "Foto selecionada" : "Adicione a foto do paciente"}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Arquivo (PNG, JPG, WEBP até 5MB) ou webcam
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ImagePlus className="h-4 w-4 text-indigo-600" />
            Arquivo
          </button>
          <button
            type="button"
            onClick={() => void openWebcam()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <Camera className="h-4 w-4" />
            Webcam
          </button>
        </div>

        {previewUrl ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remover foto
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          if (file && file.size > 5 * 1024 * 1024) {
            window.alert("A imagem deve ter no máximo 5MB.");
            return;
          }
          onSelect(file);
          e.target.value = "";
        }}
      />

      {webcamOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Capturar pela webcam</h3>
                <p className="text-[11px] text-slate-500">Posicione o rosto no centro da imagem</p>
              </div>
              <button
                type="button"
                onClick={closeWebcam}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3">
              {webcamError ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-slate-900 px-4 text-center text-sm text-red-300">
                  {webcamError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full rounded-xl object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeWebcam}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={Boolean(webcamError) || capturing}
                onClick={() => void capturePhoto()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                {capturing ? "Capturando..." : "Tirar foto"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FormSectionCard>
  );
}
