/** Modelos Groq atuais (llama-3.3 foi desativado em 16/08/2026). */
export const GROQ_DEFAULT_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
] as const;

export function resolveGroqModels(): string[] {
  const preferred = process.env.GROQ_MODEL?.trim();
  const models = [
    preferred,
    ...GROQ_DEFAULT_MODELS,
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);
  return models;
}

/** Alertas técnicos de provedor que não devem aparecer para o profissional. */
export function isTechnicalAiAlert(alert: string) {
  return (
    /falhou \(\d+\)/i.test(alert) ||
    /model_not_found|invalid_request_error|does not exist/i.test(alert) ||
    /GROQ_API_KEY|GEMINI_API_KEY|OPENAI_API_KEY|ausente/i.test(alert) ||
    /JSON sem|resposta inválida|{"error"/i.test(alert) ||
    /via\s+(groq|gemini|openai|perplexity)|pesquisa na internet|gratuito\)/i.test(
      alert
    )
  );
}
