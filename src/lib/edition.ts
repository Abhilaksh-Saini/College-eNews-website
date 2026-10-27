import { unstable_cache } from "next/cache";
import { dedupe } from "./categorize";
import { groqEnrich, groqPlacementBrief, groqSocialNews, groqTechBrief } from "./enrich";
import { fetchGoogleNews } from "./sources/googleNews";
import { fetchSitNotices } from "./sources/sitOfficial";
import { fetchPlacementDesk, type PlacementDesk } from "./sources/sitPlacements";
import { getCuratedSocial, type SocialPost } from "./sources/social";
import { discoverSocialPosts } from "./sources/socialSearch";
import { fetchTech } from "./sources/tech";
import { fetchYouTube } from "./sources/youtube";
import type { Edition, Story, TechItem } from "./types";

/** How often a fresh edition is built, in seconds. Three hours keeps Groq usage to ~16 calls a day, far inside the free tier. */
export const EDITION_TTL = 60 * 60 * 3;
export const EDITION_TAG = "edition";

async function settle<T>(source: string, run: () => Promise<T[]>, health: Edition["health"]): Promise<T[]> {
  try {
    const items = await run();
    health.push({ source, ok: true, count: items.length });
    return items;
  } catch (err) {
    console.error(`[edition] ${source} failed:`, err);
    health.push({ source, ok: false, count: 0 });
    return [];
  }
}

/**
 * Social search uses Tavily's free 1,000 searches a month, so it runs at most every 6 hours
 * (3 searches each time, about 360 a month) rather than with every edition.
 */
const cachedSocialSearch = unstable_cache(discoverSocialPosts, ["social-search-v1"], {
  revalidate: 60 * 60 * 6,
  tags: ["social"],
});

async function buildEdition(): Promise<Edition> {
  const health: Edition["health"] = [];

  const [press, notices, videos, tech, desks] = await Promise.all([
    settle<Story>("Google News", fetchGoogleNews, health),
    settle<Story>("sitpune.edu.in notices", fetchSitNotices, health),
    settle<Story>("YouTube", fetchYouTube, health),
    settle<TechItem>("Tech headlines", fetchTech, health),
    settle<PlacementDesk>("SIT placement pages", async () => [await fetchPlacementDesk()], health),
  ]);
  const placements = desks[0] ?? null;
  // Posts found automatically through search, plus any picked by hand in content/social.json.
  const [found, picked] = await Promise.all([
    settle<SocialPost>("LinkedIn & Instagram (search)", () => cachedSocialSearch(), health),
    getCuratedSocial().catch(() => [] as SocialPost[]),
  ]);
  const pickedUrls = new Set(picked.map((p) => p.url));
  const posts = [...picked, ...found.filter((p) => !pickedUrls.has(p.url))].slice(0, 24);

  const [{ stories: enriched, usedAI }, brief, placementBrief, social] = await Promise.all([
    groqEnrich(dedupe(press)),
    groqTechBrief(tech),
    groqPlacementBrief(placements),
    groqSocialNews(posts),
  ]);

  // Low-relevance listicles stay out unless there's almost nothing else to show.
  const strong = enriched.filter((s) => s.relevance >= 0.35);
  const pressFinal = strong.length >= 4 ? strong : enriched;

  const stories = [...pressFinal, ...videos, ...social].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  return {
    generatedAt: new Date().toISOString(),
    stories,
    notices,
    social,
    tech,
    brief,
    health,
    enrichedByAI: usedAI,
    placements,
    placementBrief,
  };
}

/**
 * One cached edition shared by every page, so a regeneration fetches each source and calls
 * Groq once, no matter how many routes are being rebuilt.
 */
const cachedEdition = unstable_cache(buildEdition, ["edition-v4"], {
  revalidate: EDITION_TTL,
  tags: [EDITION_TAG],
});

/**
 * Pages regenerate in parallel, and each would miss the cache at the same moment and build
 * its own edition. Sharing the in-flight promise means one build (and one set of Groq calls).
 */
let inFlight: Promise<Edition> | null = null;
export function getEdition(): Promise<Edition> {
  inFlight ??= cachedEdition().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** The lead is the most relevant recent press story; videos and posts fill the rest of the page. */
export function pickLead(stories: Story[]): Story | undefined {
  const twoWeeks = Date.now() - 14 * 864e5;
  const recent = stories.filter((s) => s.kind === "press" && Date.parse(s.publishedAt) > twoWeeks);
  // Press stories and SIT's own social posts (rewritten as news) can both lead.
  const press = stories.filter((s) => s.kind === "press" || s.kind === "social");
  // Prefer a story that's clearly about SIT Pune, even if a slightly older one.
  const onCampus = press.filter((s) => s.relevance >= 0.8 && Date.parse(s.publishedAt) > Date.now() - 60 * 864e5);
  const pool = onCampus.length ? onCampus : recent.length ? recent : press;
  return [...pool].sort((a, b) => b.relevance - a.relevance || b.publishedAt.localeCompare(a.publishedAt))[0];
}
