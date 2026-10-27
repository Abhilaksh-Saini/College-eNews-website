import { XMLParser } from "fast-xml-parser";
import { fetchJson, fetchText, hashId, stripHtml } from "../fetcher";
import type { TechItem } from "../types";

interface HnItem {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  time?: number;
  type?: string;
  dead?: boolean;
}

/** Top Hacker News stories through the official, free Firebase API. */
async function fetchHackerNews(limit = 14): Promise<TechItem[]> {
  const ids = await fetchJson<number[]>("https://hacker-news.firebaseio.com/v0/topstories.json");
  const items = await Promise.allSettled(
    ids.slice(0, limit + 6).map((id) =>
      fetchJson<HnItem>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, 5000),
    ),
  );
  return items
    .flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
    .filter((it) => it.type === "story" && !it.dead && it.title)
    .slice(0, limit)
    .map((it) => ({
      id: "hn" + it.id,
      title: it.title!,
      url: it.url ?? `https://news.ycombinator.com/item?id=${it.id}`,
      outlet: it.url ? new URL(it.url).hostname.replace(/^www\./, "") : "news.ycombinator.com",
      points: it.score,
      publishedAt: new Date((it.time ?? Date.now() / 1000) * 1000).toISOString(),
    }));
}

/** Google News' Technology section for India, so the brief isn't only Silicon Valley. */
async function fetchIndiaTech(limit = 10): Promise<TechItem[]> {
  const xml = await fetchText(
    "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en",
  );
  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(xml);
  const raw = doc?.rss?.channel?.item ?? [];
  const list = (Array.isArray(raw) ? raw : [raw]) as {
    title: string;
    link: string;
    pubDate?: string;
    source?: string | { "#text"?: string };
  }[];
  return list.slice(0, limit).map((it) => {
    const outlet = typeof it.source === "string" ? it.source : it.source?.["#text"] ?? "News";
    return {
      id: "gt" + hashId(it.link),
      title: stripHtml(it.title).replace(/\s+-\s+[^-]+$/, ""),
      url: it.link,
      outlet,
      publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
    };
  });
}

export async function fetchTech(): Promise<TechItem[]> {
  const [hn, india] = await Promise.allSettled([fetchHackerNews(), fetchIndiaTech()]);
  const a = hn.status === "fulfilled" ? hn.value : [];
  const b = india.status === "fulfilled" ? india.value : [];
  if (!a.length && !b.length) throw new Error("No tech sources answered");
  // Interleave so both sources show up near the top.
  const out: TechItem[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}
