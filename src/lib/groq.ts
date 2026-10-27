/**
 * Minimal client for Groq's OpenAI-compatible chat completions API.
 * Groq has a free tier, which is plenty for an edition every few hours.
 * Only used server-side during page regeneration, so the key never reaches the browser.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
/** Llama 3.3 70B handles tagging and short summaries well and supports JSON mode. Override with GROQ_MODEL. */
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function groqKey(): string | undefined {
  return process.env.GROQ_API_KEY || undefined;
}

export function hasGroq(): boolean {
  return Boolean(groqKey());
}

export function groqModel(): string {
  return process.env.GROQ_MODEL || DEFAULT_MODEL;
}

export async function groqJson<T>(system: string, user: string, timeoutMs = 25000): Promise<T> {
  const key = groqKey();
  if (!key) throw new Error("No Groq key set (GROQ_API_KEY)");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: groqModel(),
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    // Tolerate a model that wraps its JSON in a code fence.
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    return JSON.parse(json) as T;
  } finally {
    clearTimeout(timer);
  }
}
