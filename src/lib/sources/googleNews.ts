import { XMLParser } from "fast-xml-parser";
import { fetchText, hashId, stripHtml } from "../fetcher";
import type { Story } from "../types";

/**
 * Google News RSS is free, keyless and covers the Indian press well.
 * Each query is a separate feed; results are merged and deduped later.
 */
export const NEWS_QUERIES = [
  '"Symbiosis Institute of Technology"',
  '"SIT Pune"',
  'Symbiosis Pune engineering students',
  '"Symbiosis International" university',
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  source?: string | { "#text"?: string; url?: string };
}

/** Admission-portal listicles rank well in search but rarely carry campus news. */
const AGGREGATORS = /shiksha|careers360|collegedunia|collegedekho|getmyuni|adda247|jagran josh|zollege|collegesearch|admissionbuddy|leverage edu/i;
const MENTIONS_SIT = /symbiosis|\bSIT\b|SITEEE|lavale/i;

const OTHER_CAMPUSES = ["Hyderabad", "Nagpur", "Noida", "Nashik", "Bengaluru", "Bangalore"];

export function detectCampus(text: string): string | undefined {
  if (/\bpune\b|lavale/i.test(text)) return undefined;
  return OTHER_CAMPUSES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(text));
}

function feedUrl(q: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:120d")}&hl=en-IN&gl=IN&ceid=IN:en`;
}

export async function fetchGoogleNews(): Promise<Story[]> {
  const results = await Promise.allSettled(NEWS_QUERIES.map((q) => fetchText(feedUrl(q))));
  const stories: Story[] = [];

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const doc = parser.parse(r.value);
    const raw = doc?.rss?.channel?.item;
    const items: RssItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

    for (const it of items) {
      if (!it.title || !it.link) continue;
      const outlet =
        typeof it.source === "string" ? it.source : it.source?.["#text"] ?? "News";
      if (!MENTIONS_SIT.test(String(it.title))) continue;
      // Google appends " - Outlet" to every title; drop it, the outlet is shown separately.
      const title = stripHtml(String(it.title)).replace(new RegExp(`\\s+-\\s+${escapeRe(outlet)}$`), "");
      const snippet = stripHtml(String(it.description ?? ""));
      const dek = snippet && !snippet.startsWith(title) ? snippet : "";

      stories.push({
        id: hashId(title.toLowerCase()),
        title,
        dek,
        url: String(it.link),
        outlet,
        kind: "press",
        category: "campus",
        publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
        relevance: AGGREGATORS.test(outlet)
          ? 0.15
          : /symbiosis institute of technology|sit pune|sitpune|siteee/i.test(title)
            ? 0.9
            : 0.5,
        campus: detectCampus(title),
      });
    }
  }
  return stories;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
