import { categorize, dedupe } from "../categorize";
import { fetchText, hashId, stripHtml } from "../fetcher";
import { groqVision, hasGroq } from "../groq";
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
  // SIT's Training & Placement Cell posts drives, offers and recruiter visits on its own page.
  { query: '"Placement Cell SIT" Lavale Pune placed congratulations', domains: ["linkedin.com"] },
];

/** Only individual posts: not profiles, company pages, job listings or hashtag pages. */
const POST_URL = /linkedin\.com\/(posts\/|feed\/update\/)|instagram\.com\/(p|reel)\//i;
const ABOUT_SIT = /symbiosis institute of technology|sit[\s,-]*pune|sitpune|symbiosis_sit|lavale|placement-cell-sit/i;
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
  "placement-cell-sit": "SIT Placement Cell",
};

function accountFrom(url: string, title: string, raw = ""): string {
  const li = url.match(/linkedin\.com\/posts\/([^_/]+)_/i);
  if (li) return KNOWN[li[1].toLowerCase()] ?? tidyName(li[1]);
  const igUser = url.match(/instagram\.com\/([^/]+)\/(?:p|reel)\//i);
  if (igUser) return KNOWN[igUser[1].toLowerCase()] ?? `@${igUser[1]}`;
  const igPic = `${title} ${raw}`.match(/([\w.]+)'s profile picture/i);
  if (igPic && /instagram/i.test(url)) return KNOWN[igPic[1].toLowerCase()] ?? `@${igPic[1]}`;
  const ig = title.match(/^(.+?) on Instagram/i);
  if (ig) return ig[1].trim();
  const by = title.match(/^(.+?)(?:'s Post| on LinkedIn|\s[|–-]\s)/i);
  return by ? by[1].trim() : /instagram/i.test(url) ? "an SIT Instagram account" : "an SIT LinkedIn page";
}

/** Strips search-engine and network boilerplate down to the post's own words. */
function postText(r: TavilyResult): string {
  const raw = (r.raw_content || r.content || "").replace(/\s+/g, " ");
  return stripHtml(raw)
    // Instagram's login-wall chrome that search engines index around the caption.
    .replace(/\b(Log In|Sign Up|Never miss a post from [^.]*\.?|Photo by [^.]*?\. |Open app|See more posts|More posts from [^.]*)\s*/gi, "")
    .replace(/[\w.]+'s profile picture\s*/gi, "")
    .replace(/By continuing, you agree to Instagram's Terms[^.]*\.(?:[^.]*Cookies Policy\.)?\s*/gi, "")
    .replace(/May be an image of [^.]*\.\s*/gi, "")
    .replace(/^.*?(?:on LinkedIn|on Instagram):?\s*/i, "")
    .replace(/(Like|Comment|Share|Report this post|See more comments|To view or add a comment, sign in).*$/i, "")
    .trim()
    .slice(0, 2000);
}

/**
 * LinkedIn post IDs are snowflake IDs: the top 41 bits are the posting time in milliseconds.
 * That gives an exact date even when the search result has none.
 */
export function linkedInPostedAt(url: string): Date | null {
  const m = url.match(/(?:activity|share|ugcPost)[-:](\d{18,20})/i);
  if (!m) return null;
  const ms = Number(BigInt(m[1]) >> BigInt(22));
  const d = new Date(ms);
  return ms > Date.UTC(2015, 0, 1) && ms < Date.now() + 864e5 ? d : null;
}

/**
 * Instagram shortcodes are base64 media IDs, and media IDs carry their creation time in the top
 * 41 bits (milliseconds since Instagram's epoch, 2011-08-24).
 */
export function instagramPostedAt(url: string): Date | null {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel)\/([A-Za-z0-9_-]{6,14})/);
  if (!m) return null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let id = BigInt(0);
  for (const ch of m[1]) id = id * BigInt(64) + BigInt(alphabet.indexOf(ch));
  const ms = Number(id >> BigInt(23)) + 1314220021721;
  return ms > Date.UTC(2015, 0, 1) && ms < Date.now() + 864e5 ? new Date(ms) : null;
}

/** "amruta yeravdekar ruikar a321322a5" -> "Amruta Yeravdekar Ruikar"; "sit mechanical" -> "SIT Mechanical". */
function tidyName(raw: string): string {
  const words = raw
    .split(/[\s-]+/)
    .filter((w, i, all) => !(i === all.length - 1 && /\d/.test(w) && w.length >= 6));
  return words
    .map((w) => w.replace(/^sitpune$/i, "SIT Pune").replace(/^sit(robotics|mechanical|civil|cse)$/i, (_, d) => `SIT ${d[0].toUpperCase()}${d.slice(1)}`))
    .map((w) => (/^SIT /.test(w) ? w : /^(sit|ai|it|etc|e&tc|ieee|acm)$/i.test(w) ? w.toUpperCase().replace("ETC", "E&TC") : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Older posts aren't news any more. */
const MAX_AGE_DAYS = 120;

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
    const fromId = linkedInPostedAt(r.url) ?? instagramPostedAt(r.url);
    const fromSearch = r.published_date ? new Date(r.published_date) : null;
    const date = fromId ?? (fromSearch && !isNaN(+fromSearch) ? fromSearch : null);
    if (date && Date.now() - +date > MAX_AGE_DAYS * 864e5) continue;
    posts.push({
      id: hashId("social:" + url),
      title: text.split(/(?<=[.!?])\s+/).find((s) => s.length >= 30)?.slice(0, 140) ?? title.slice(0, 140),
      dek: "",
      postText: text,
      url,
      outlet: accountFrom(url, title, r.raw_content || r.content || ""),
      via: `${network} post`,
      kind: "social",
      category: categorize(text),
      publishedAt: (date ?? new Date()).toISOString(),
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

/**
 * The pictures attached to a post, read from its public page the way a link preview is.
 * Only the post's own media is kept: LinkedIn "feedshare" images and video covers, or the
 * page's og:image. Profile photos of the poster and of people who commented are never taken.
 */
export function postImages(html: string): string[] {
  const decode = (u: string) => u.replace(/&amp;/g, "&");
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (u: string) => {
    const key = u.match(/\/image\/(?:v2\/)?([^/]+)\//)?.[1] ?? u.split("?")[0];
    if (seen.has(key)) return;
    seen.add(key);
    out.push(u);
  };
  // LinkedIn: the post's own images, highest resolution first.
  const own = [...html.matchAll(/https:\/\/media\.licdn\.com\/dms\/image\/[^"'\s<>]+/g)]
    .map((m) => decode(m[0]))
    .filter((u) => /\/(feedshare|videocover|article-cover)[^/]*\//.test(u) && !/profile-|displayphoto|background/.test(u))
    .sort((a, b) => Number(/high-res|2048|1280/.test(b)) - Number(/high-res|2048|1280/.test(a)));
  own.forEach(add);
  if (!out.length) {
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
    if (og && !/profile-|displayphoto|static\.licdn\.com|logo|default/i.test(og)) add(decode(og));
  }
  return out.slice(0, 4);
}

async function attachImages(posts: SocialPost[]): Promise<void> {
  // A few at a time, so a burst of previews doesn't look like crawling.
  for (let i = 0; i < posts.length; i += 3) {
    await Promise.all(
      posts.slice(i, i + 3).map(async (p) => {
        try {
          const images = postImages(await fetchText(p.url, 8000));
          if (images.length) {
            p.image = images[0];
            p.images = images;
          }
        } catch {
          // No picture: the story keeps its generated print instead.
        }
      }),
    );
  }
}

/**
 * Sorts each post's pictures so real photographs (people, places, events) come before designed
 * graphics (posters, certificates, text cards), using Qwen 3.8's vision on Groq. Graphics still
 * show when a post has nothing else; photos just get first pick, including for the lead story.
 */
async function rankImages(posts: SocialPost[]): Promise<void> {
  if (!hasGroq()) return;
  const jobs = posts.flatMap((p) => (p.images ?? []).slice(0, 2).map((url) => ({ p, url })));
  const kinds = new Map<string, "photo" | "graphic">();
  for (let i = 0; i < jobs.length; i += 3) {
    // Groq's vision models take at most 3 images per request.
    const batch = jobs.slice(i, i + 3);
    try {
      const out = await groqVision<{ kinds: string[] }>(
        `For each of the ${batch.length} images, in order, say whether it is a real "photo" (a photograph of people, places or an event) or a designed "graphic" (poster, certificate, flyer, text card, logo, slide). Reply JSON {"kinds": ["photo" | "graphic", ...]}.`,
        batch.map((b) => b.url),
      );
      batch.forEach((b, j) => {
        const k = out.kinds?.[j];
        if (k === "photo" || k === "graphic") kinds.set(b.url, k);
      });
    } catch (err) {
      console.error("[social] image check failed, keeping post order:", err);
    }
  }
  for (const p of posts) {
    if (!p.images?.length) continue;
    const photos = p.images.filter((u) => kinds.get(u) === "photo");
    const rest = p.images.filter((u) => kinds.get(u) !== "photo");
    p.images = [...photos, ...rest];
    p.image = p.images[0];
    p.imageKind = kinds.get(p.image) ?? (photos.length ? "photo" : undefined);
  }
}

export async function discoverSocialPosts(): Promise<SocialPost[]> {
  if (!hasTavily()) return [];
  const settled = await Promise.allSettled(QUERIES.map(search));
  const failures = settled.filter((s) => s.status === "rejected");
  if (failures.length === settled.length) throw (failures[0] as PromiseRejectedResult).reason;
  // The same event is often posted by several department pages; keep one copy.
  const posts = dedupe(toPosts(settled.flatMap((s) => (s.status === "fulfilled" ? s.value : [])))) as SocialPost[];
  await attachImages(posts.slice(0, 24));
  await rankImages(posts);
  return posts;
}
