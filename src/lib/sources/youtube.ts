import { XMLParser } from "fast-xml-parser";
import { fetchText, hashId, stripHtml } from "../fetcher";
import type { Story } from "../types";

/** SIT Pune's official channel (@symbiosisinstituteoftechno5866). Override with SIT_YOUTUBE_CHANNEL_ID. */
const DEFAULT_CHANNEL = "UCWwiAlv5AJz8xNadY-kDUfg";

interface Entry {
  title: string;
  published: string;
  "yt:videoId": string;
  "media:group"?: { "media:description"?: string };
}

/** YouTube publishes a free Atom feed of each channel's latest 15 uploads. */
export async function fetchYouTube(): Promise<Story[]> {
  const channel = process.env.SIT_YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL;
  const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`);
  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(xml);
  const raw = doc?.feed?.entry ?? [];
  const entries = (Array.isArray(raw) ? raw : [raw]) as Entry[];

  return entries.slice(0, 8).map((e) => {
    const id = e["yt:videoId"];
    const title = stripHtml(String(e.title)).replace(/\s*#\S+/g, "").replace(/\s{2,}/g, " ").trim();
    const desc = stripHtml(String(e["media:group"]?.["media:description"] ?? ""));
    return {
      id: hashId("yt:" + id),
      title,
      dek: desc.split(/(?<=[.!?])\s/).slice(0, 2).join(" ").slice(0, 220),
      url: `https://www.youtube.com/watch?v=${id}`,
      outlet: "SIT Pune on YouTube",
      kind: "video" as const,
      category: "campus" as const,
      publishedAt: new Date(e.published).toISOString(),
      relevance: 0.95,
      image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  });
}
