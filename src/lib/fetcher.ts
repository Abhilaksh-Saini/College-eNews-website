const UA =
  "Mozilla/5.0 (compatible; TheFoothillBot/2.0; +https://github.com/mardromus/college-enews-website)";

/**
 * fetch with a hard timeout. One slow source must never hold up the whole edition,
 * so every network call in the pipeline goes through here.
 */
export async function fetchText(url: string, timeoutMs = 8000, init: RequestInit = {}): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "user-agent": UA, "accept-language": "en-IN,en;q=0.9", ...(init.headers ?? {}) },
      // The page itself is cached by ISR; individual fetches don't need their own cache.
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * sitpune.edu.in is a small server that answers bursts of requests with 503.
 * Requests to it are queued one at a time, and a 503 gets one retry after a short pause.
 */
let politeQueue: Promise<unknown> = Promise.resolve();
export function fetchPolite(url: string, timeoutMs = 15000): Promise<string> {
  const run = async () => {
    try {
      return await fetchText(url, timeoutMs);
    } catch (err) {
      if (!/\b(503|502|429)\b/.test(String(err))) throw err;
      await new Promise((r) => setTimeout(r, 2000));
      return fetchText(url, timeoutMs);
    }
  };
  const next = politeQueue.then(run, run);
  politeQueue = next.catch(() => undefined);
  return next;
}

export async function fetchJson<T>(url: string, timeoutMs = 8000, init: RequestInit = {}): Promise<T> {
  return JSON.parse(await fetchText(url, timeoutMs, init)) as T;
}

/** Short stable hash so the same link always gets the same id. */
export function hashId(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
