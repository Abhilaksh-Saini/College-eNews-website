/**
 * Minimal client for xAI's Grok (OpenAI-compatible chat completions).
 * Only used server-side during page regeneration, so the key never reaches the browser.
 */

const ENDPOINT = "https://api.x.ai/v1/chat/completions";
/** A cheap, fast model is plenty for tagging and short summaries. Override with GROK_MODEL. */
const DEFAULT_MODEL = "grok-4-1-fast-non-reasoning";

export function grokKey(): string | undefined {
  return process.env.XAI_API_KEY || process.env.GROK_API_KEY || undefined;
}

export function hasGrok(): boolean {
  return Boolean(grokKey());
}

export async function grokJson<T>(system: string, user: string, timeoutMs = 25000): Promise<T> {
  const key = grokKey();
  if (!key) throw new Error("No Grok key set (XAI_API_KEY)");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || DEFAULT_MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Grok ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    // Tolerate a model that wraps its JSON in a code fence.
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    return JSON.parse(json) as T;
  } finally {
    clearTimeout(timer);
  }
}
