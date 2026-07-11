"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Smile } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@odonto.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Falha no login.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Não foi possível conectar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-sky-500 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Smile className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Odonto Enterprise</h1>
          <p className="mt-1 text-sm text-slate-500">SaaS Odontológico — ambiente local</p>
        </div>

        <div className="space-y-3">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <Button type="submit" className="mt-5 w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
          Demo: <strong>admin@odonto.local</strong> / <strong>admin123</strong>
        </p>
      </form>
    </div>
  );
}
