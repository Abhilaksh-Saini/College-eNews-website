import { categorize } from "../categorize";
import { hashId, stripHtml } from "../fetcher";
import type { SocialPost } from "./social";

/**
 * Finds public LinkedIn and Instagram posts about SIT Pune automatically, through Tavily's
 * search API (free: 1,000 searches a month). Search engines index public posts, so this reads
 * what they've indexed instead of scraping the networks themselves. Every link comes from the
 * search index, never from an AI model, so a post can't be made up.
 */

const ENDPOINT = "https://api.tavily.com/search";

const QUERIES = [
  { query: '"Symbiosis Institute of Technology" Pune', domains: ["linkedin.com"] },
  { query: "SIT Pune students placement OR internship OR hackathon OR award", domains: ["linkedin.com"] },
  { query: "symbiosis_sit OR symbiosis_sitpune OR \"SIT Pune\"", domains: ["instagram.com"] },
];

/** Only individual posts: not profiles, company pages, job listings or hashtag pages. */
const POST_URL = /linkedin\.com\/(posts\/|feed\/update\/)|instagram\.com\/(p|reel)\//i;
const ABOUT_SIT = /symbiosis institute of technology|sit[\s,-]*pune|sitpune|symbiosis_sit|lavale/i;
/** Recruitment ads and job posts aren't campus news. */
const NOT_NEWS = /we('| a)re hiring|job opening|apply now|vacancy|walk-in|hiring for/i;

interface TavilyResult {
  url: string;
  title?: string;
  content?: string;
  raw_content?: string | null;
  published_date?: string | null;
}

export function hasTavily(): boolean {
  return Boolean(process.env.TAVILY_API_KEY);
}

const KNOWN: Record<string, string> = {
  sitpune: "SIT Pune",
  "symbiosis-institute-of-technology": "Symbiosis Institute of Technology",
  symbiosis_sit: "@symbiosis_sit",
  symbiosis_sitpune: "@symbiosis_sitpune",
};

function accountFrom(url: string, title: string): string {
  const li = url.match(/linkedin\.com\/posts\/([^_/]+)_/i);
  if (li) return KNOWN[li[1].toLowerCase()] ?? li[1].replace(/-/g, " ");
  const ig = title.match(/^(.+?) on Instagram/i);
  if (ig) return ig[1].trim();
  const by = title.match(/^(.+?)(?:'s Post| on LinkedIn|\s[|–-]\s)/i);
  return by ? by[1].trim() : /instagram/i.test(url) ? "Instagram" : "LinkedIn";
}

/** Strips search-engine and network boilerplate down to the post's own words. */
function postText(r: TavilyResult): string {
  const raw = (r.raw_content || r.content || "").replace(/\s+/g, " ");
  return stripHtml(raw)
    .replace(/^.*?(?:on LinkedIn|on Instagram):?\s*/i, "")
    .replace(/(Like|Comment|Share|Report this post|See more comments|To view or add a comment, sign in).*$/i, "")
    .trim()
    .slice(0, 2000);
}

export function toPosts(results: TavilyResult[]): SocialPost[] {
  const seen = new Set<string>();
  const posts: SocialPost[] = [];
  for (const r of results) {
    const url = r.url.split("?")[0];
    if (!POST_URL.test(url) || seen.has(url)) continue;
    const title = stripHtml(r.title ?? "");
    const text = postText(r);
    if (text.length < 40) continue;
    if (!ABOUT_SIT.test(`${url} ${title} ${text}`) || NOT_NEWS.test(text)) continue;
    seen.add(url);

    const network = /instagram/i.test(url) ? "Instagram" : "LinkedIn";
    const date = r.published_date ? new Date(r.published_date) : null;
    posts.push({
      id: hashId("social:" + url),
      title: text.split(/(?<=[.!?])\s+/).find((s) => s.length >= 30)?.slice(0, 140) ?? title.slice(0, 140),
      dek: "",
      postText: text,
      url,
      outlet: accountFrom(url, title),
      via: `${network} post`,
      kind: "social",
      category: categorize(text),
      publishedAt: (date && !isNaN(+date) ? date : new Date()).toISOString(),
      // Found automatically, so slightly below hand-picked posts.
      relevance: 0.85,
    });
  }
  return posts;
}

async function search(q: (typeof QUERIES)[number]): Promise<TavilyResult[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
      body: JSON.stringify({
        query: q.query,
        include_domains: q.domains,
        search_depth: "basic",
        time_range: "month",
        max_results: 10,
        include_raw_content: "text",
        include_published_date: true,
      }),
    });
    if (!res.ok) throw new Error(`Tavily ${res.status}: ${(await res.text()).slice(0, 160)}`);
    return ((await res.json()) as { results?: TavilyResult[] }).results ?? [];
  } finally {
    clearTimeout(timer);
  }
}

export async function discoverSocialPosts(): Promise<SocialPost[]> {
  if (!hasTavily()) return [];
  const settled = await Promise.allSettled(QUERIES.map(search));
  const failures = settled.filter((s) => s.status === "rejected");
  if (failures.length === settled.length) throw (failures[0] as PromiseRejectedResult).reason;
  return toPosts(settled.flatMap((s) => (s.status === "fulfilled" ? s.value : [])));
}
