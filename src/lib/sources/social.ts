import social from "../../../content/social.json";
import { categorize } from "../categorize";
import { fetchText, hashId, stripHtml } from "../fetcher";
import type { Category, Story } from "../types";

export interface SocialAccount {
  network: string;
  handle: string;
  url: string;
}

interface CuratedPost {
  url: string;
  /** Who posted it, e.g. "SIT Pune" or "@symbiosis_sit". */
  account: string;
  date?: string;
  category?: Category;
  /** The post's text. Optional: if left out, the site reads the post's public link preview. */
  text?: string;
  /** Optional headline override. */
  title?: string;
}

export const socialAccounts: SocialAccount[] = social.accounts;

export function networkOf(url: string): "LinkedIn" | "Instagram" | "Post" {
  if (/linkedin\.com/i.test(url)) return "LinkedIn";
  if (/instagram\.com/i.test(url)) return "Instagram";
  return "Post";
}

function meta(html: string, prop: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m = html.match(re);
  return stripHtml(m?.[1] ?? m?.[2] ?? "");
}

/**
 * Reads a post's public link preview (its Open Graph tags), the same data chat apps use to
 * unfurl a pasted link. One request per hand-picked post, no logins, nothing crawled.
 */
async function readPreview(url: string): Promise<{ text: string; image?: string }> {
  const html = await fetchText(url, 8000);
  let text = meta(html, "og:description") || meta(html, "description");
  // Instagram prefixes captions with "123 likes, 4 comments - account on date: "
  text = text.replace(/^[\d,.\sKkMm]+likes?,[^-]*-\s*[^:]+:\s*/i, "").replace(/^"|"$/g, "");
  // A login wall's generic description is not the post.
  if (/sign in|log in|join linkedin|create an account/i.test(text) && text.length < 200) text = "";
  const image = meta(html, "og:image") || undefined;
  return { text, image };
}

export interface SocialPost extends Story {
  /** The post's own words, which the AI summarises into the headline and dek. */
  postText: string;
}

/** Hand-picked Instagram / LinkedIn posts from content/social.json, with their text filled in. */
export async function getCuratedSocial(): Promise<SocialPost[]> {
  const posts = (social.posts as CuratedPost[]).filter((p) => p.url);
  const out = await Promise.all(
    posts.map(async (p): Promise<SocialPost | null> => {
      let text = (p.text ?? "").trim();
      let image: string | undefined;
      if (!text) {
        try {
          ({ text, image } = await readPreview(p.url));
        } catch (err) {
          console.error(`[social] couldn't read preview for ${p.url}:`, err);
        }
      }
      if (!text && !p.title) return null; // Nothing to report: add "text" for this post in social.json.

      // Without AI: headline from the first sentence with real content, skipping "Proud moment!" and hashtags.
      const plain = text.replace(/#\w+/g, "").replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
      const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
      const lead = sentences.find((x) => x.length >= 30) ?? sentences[0] ?? "";
      const rest = sentences.filter((x) => x !== lead && x.length >= 30).join(" ");
      const network = networkOf(p.url);
      return {
        id: hashId("social:" + p.url),
        title: p.title || lead.replace(/[.!]$/, "").slice(0, 140) || `${network} post by ${p.account}`,
        dek: rest.slice(0, 260),
        postText: text.slice(0, 2000),
        url: p.url,
        outlet: p.account,
        via: `${network} post`,
        kind: "social",
        category: p.category ?? categorize(plain),
        publishedAt: new Date(p.date || Date.now()).toISOString(),
        relevance: 1,
        image,
      };
    }),
  );
  return out.filter((p): p is SocialPost => p !== null).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
