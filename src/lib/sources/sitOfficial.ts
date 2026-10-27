import { fetchText, hashId, stripHtml } from "../fetcher";
import type { Story } from "../types";

const HOME = "https://www.sitpune.edu.in/";

/** Words that mark a live announcement rather than a standing policy document. */
const ANNOUNCE =
  /declared|open|hiring|advertis|registration|merit list|schedule|induction|convocation|result|admission|invites|workshop|webinar|conference|hackathon|deadline|last date|walk-in|recruit|notice/i;
const STANDING =
  /policy|handbook|code of conduct|disclosure|manual|rules|mechanism|approvals|brochure|magazine|newsletter|posters|advisory|grievance|service book|ragging|equipment|tender/i;

/**
 * Reads the notices the institute itself publishes on sitpune.edu.in:
 * the scrolling ticker plus announcement links on the home page.
 * The site has no feed, so this is a light, polite scrape of one page per edition.
 */
export async function fetchSitNotices(): Promise<Story[]> {
  const html = (await fetchText(HOME, 10000)).replace(/<!--[\s\S]*?-->/g, "");
  const seen = new Set<string>();
  const notices: Story[] = [];
  const now = new Date().toISOString();

  const anchor = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(anchor)) {
    const text = stripHtml(m[2]).replace(/^click here to\s+/i, "").replace(/^\w/, (c) => c.toUpperCase());
    const href = m[1].trim();
    // Short link texts are navigation ("First Year Admission"), not announcements.
    if (text.length < 28 || text.length > 180 || text.includes("*")) continue;
    if (!ANNOUNCE.test(text) || STANDING.test(text)) continue;
    if (/^(#|javascript:|mailto:)/i.test(href)) continue;

    const url = new URL(href, HOME).toString();
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    notices.push({
      id: hashId("sit:" + key),
      title: text,
      dek: "",
      url,
      outlet: "sitpune.edu.in",
      kind: "official",
      category: "notices",
      publishedAt: now,
      relevance: 1,
    });
  }
  return notices.slice(0, 12);
}
