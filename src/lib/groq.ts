/**
 * Minimal client for Groq's OpenAI-compatible chat completions API.
 * Groq has a free tier, which is plenty for an edition every few hours.
 * Only used server-side during page regeneration, so the key never reaches the browser.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Models are tried in order. Qwen 3.8 (August 2026) is Groq's newest general model; gpt-oss-120b is
 * the long-standing production model Groq recommends as the replacement for retired ones.
 * If Groq retires the first, the site falls through to the next instead of losing its summaries.
 * Set GROQ_MODEL to put a different model first.
 */
const MODELS: { id: string; extra: Record<string, unknown> }[] = [
  { id: "qwen/qwen3.8-27b", extra: { reasoning_format: "hidden" } },
  { id: "openai/gpt-oss-120b", extra: { reasoning_effort: "low" } },
];

export function groqKey(): string | undefined {
  return process.env.GROQ_API_KEY || undefined;
}

export function hasGroq(): boolean {
  return Boolean(groqKey());
}

function modelChain() {
  const custom = process.env.GROQ_MODEL?.trim();
  if (!custom) return MODELS;
  return [{ id: custom, extra: {} }, ...MODELS.filter((m) => m.id !== custom)];
}

/** Errors that mean "this model is gone or not allowed", so the next model is worth trying. */
const MODEL_GONE = /model_decommissioned|model_not_found|does not exist|decommissioned|not supported|model_permission/i;

async function call(
  key: string,
  model: { id: string; extra: Record<string, unknown> },
  system: string,
  user: string,
  timeoutMs: number,
) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: model.id,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...model.extra,
      }),
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function groqJson<T>(system: string, user: string, timeoutMs = 25000): Promise<T> {
  const key = groqKey();
  if (!key) throw new Error("No Groq key set (GROQ_API_KEY)");

  let lastError: unknown;
  for (const model of modelChain()) {
    const res = await call(key, model, system, user, timeoutMs);
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      lastError = new Error(`Groq ${res.status} (${model.id}): ${body}`);
      if ((res.status === 400 || res.status === 404 || res.status === 403) && MODEL_GONE.test(body)) {
        console.warn(`[groq] ${model.id} unavailable, trying the next model`);
        continue;
      }
      throw lastError;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = (data.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "");
    // Tolerate a model that wraps its JSON in a code fence.
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    return JSON.parse(json) as T;
  }
  throw lastError ?? new Error("No Groq model available");
}

/** Asks Qwen 3.8 (vision) a question about up to 3 images at once (Groq's limit) and parses a JSON reply. */
export async function groqVision<T>(question: string, imageUrls: string[], timeoutMs = 30000): Promise<T> {
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
        model: process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b",
        reasoning_format: "hidden",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: question },
              ...imageUrls.slice(0, 3).map((url) => ({ type: "image_url", image_url: { url } })),
            ],
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq vision ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as T;
  } finally {
    clearTimeout(timer);
  }
}
