import social from "../../../content/social.json";
import { hashId } from "../fetcher";
import type { Category, Story } from "../types";

export interface SocialAccount {
  network: string;
  handle: string;
  url: string;
}

interface CuratedPost {
  url: string;
  title: string;
  account: string;
  date: string;
  category?: Category;
  note?: string;
}

export const socialAccounts: SocialAccount[] = social.accounts;

/** Hand-picked Instagram / LinkedIn posts from content/social.json. */
export function getCuratedSocial(): Story[] {
  return (social.posts as CuratedPost[])
    .filter((p) => p.url && p.title)
    .map((p) => ({
      id: hashId("social:" + p.url),
      title: p.title,
      dek: p.note ?? "",
      url: p.url,
      outlet: p.account,
      kind: "social" as const,
      category: p.category ?? "campus",
      publishedAt: new Date(p.date || Date.now()).toISOString(),
      relevance: 1,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
