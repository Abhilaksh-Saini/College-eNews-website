import { unstable_cache } from "next/cache";
import { dedupe } from "./categorize";
import { grokEnrich, grokTechBrief } from "./enrich";
import { fetchGoogleNews } from "./sources/googleNews";
import { fetchSitNotices } from "./sources/sitOfficial";
import { getCuratedSocial } from "./sources/social";
import { fetchTech } from "./sources/tech";
import { fetchYouTube } from "./sources/youtube";
import type { Edition, Story, TechItem } from "./types";

/** How often a fresh edition is built, in seconds. Three hours keeps Grok usage to ~8 calls a day. */
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

async function buildEdition(): Promise<Edition> {
  const health: Edition["health"] = [];

  const [press, notices, videos, tech] = await Promise.all([
    settle<Story>("Google News", fetchGoogleNews, health),
    settle<Story>("sitpune.edu.in", fetchSitNotices, health),
    settle<Story>("YouTube", fetchYouTube, health),
    settle<TechItem>("Tech headlines", fetchTech, health),
  ]);
  const social = getCuratedSocial();
  health.push({ source: "Curated social", ok: true, count: social.length });

  const [{ stories: enriched, usedGrok }, brief] = await Promise.all([
    grokEnrich(dedupe(press)),
    grokTechBrief(tech),
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
    enrichedByGrok: usedGrok,
  };
}

/**
 * One cached edition shared by every page, so a regeneration fetches each source and calls
 * Grok once, no matter how many routes are being rebuilt.
 */
const cachedEdition = unstable_cache(buildEdition, ["edition-v1"], {
  revalidate: EDITION_TTL,
  tags: [EDITION_TAG],
});

/**
 * Pages regenerate in parallel, and each would miss the cache at the same moment and build
 * its own edition. Sharing the in-flight promise means one build (and one set of Grok calls).
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
  const pool = recent.length ? recent : stories.filter((s) => s.kind === "press");
  return [...pool].sort((a, b) => b.relevance - a.relevance || b.publishedAt.localeCompare(a.publishedAt))[0];
}
