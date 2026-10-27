import { CATEGORIES, categorize } from "./categorize";
import { groqJson, hasGroq } from "./groq";
import type { PlacementDesk } from "./sources/sitPlacements";
import type { Category, PlacementBrief, Story, TechBrief, TechItem } from "./types";

const SLUGS = CATEGORIES.map((c) => c.slug);

const ENRICH_SYSTEM = `You are the copy desk of a student-run news site for Symbiosis Institute of Technology (SIT), Lavale, Pune, India.
You receive news items as JSON. For each item return:
- "id": unchanged
- "keep": false if the item is an admission-portal listicle, a ranking roundup that only lists SIT among many colleges, an ad, or not about Symbiosis at all; otherwise true
- "category": one of ${SLUGS.filter((s) => s !== "notices").join(", ")}
- "relevance": 0 to 1, how specifically it is about SIT Pune (another Symbiosis campus or the university in general scores lower)
- "dek": one plain sentence, at most 28 words, telling a student why it matters. Use ONLY facts present in the title and snippet. Never invent numbers, names, dates or quotes. If there is nothing to add, restate the headline's news plainly.
Reply with JSON: {"items": [...]}`;

interface EnrichOut {
  items: { id: string; keep: boolean; category: string; relevance: number; dek: string }[];
}

/** Keyword-only pass, used without a key and as the base the Groq pass refines. */
export function basicEnrich(stories: Story[]): Story[] {
  return stories.map((s) =>
    s.kind === "official" ? s : { ...s, category: categorize(s.title, s.dek) },
  );
}

export async function groqEnrich(stories: Story[]): Promise<{ stories: Story[]; usedAI: boolean }> {
  const base = basicEnrich(stories);
  if (!hasGroq() || !base.length) return { stories: base, usedAI: false };

  try {
    const payload = base.slice(0, 40).map((s) => ({
      id: s.id,
      title: s.title,
      outlet: s.outlet,
      snippet: s.dek.slice(0, 300),
    }));
    const out = await groqJson<EnrichOut>(ENRICH_SYSTEM, JSON.stringify(payload));
    const byId = new Map(out.items.map((i) => [i.id, i]));

    const enriched = base.flatMap((s) => {
      const e = byId.get(s.id);
      if (!e) return [s];
      if (e.keep === false) return [];
      return [
        {
          ...s,
          category: SLUGS.includes(e.category as Category) ? (e.category as Category) : s.category,
          relevance: clamp(Number(e.relevance), s.relevance),
          dek: typeof e.dek === "string" && e.dek.trim() ? e.dek.trim() : s.dek,
        },
      ];
    });
    return { stories: enriched, usedAI: true };
  } catch (err) {
    console.error("[enrich] Groq pass failed, using keyword categories:", err);
    return { stories: base, usedAI: false };
  }
}

const BRIEF_SYSTEM = `You write "Tech Pulse", a short weekly-feeling brief for engineering students at SIT Pune.
You get today's top technology headlines as JSON (id, title, outlet). Write:
- "headline": a plain, specific headline for the brief (max 10 words, no clickbait, no colon)
- "paragraphs": 3 short paragraphs (each under 70 words) grouping related headlines into themes and saying, in plain language, why a CS/IT/ENTC student might care
- "sourceIds": the ids you drew on
Rules: describe only what the headlines themselves say. Do not invent figures, quotes, release dates or details that are not in a headline. Say "reportedly" where a headline is a claim. No hype words.
Reply with JSON only.`;

export async function groqTechBrief(items: TechItem[]): Promise<TechBrief | null> {
  if (!hasGroq() || items.length < 4) return null;
  try {
    const out = await groqJson<Omit<TechBrief, "writtenBy">>(
      BRIEF_SYSTEM,
      JSON.stringify(items.slice(0, 18).map(({ id, title, outlet }) => ({ id, title, outlet }))),
    );
    const known = new Set(items.map((i) => i.id));
    if (!out.headline || !Array.isArray(out.paragraphs) || !out.paragraphs.length) return null;
    return {
      headline: String(out.headline),
      paragraphs: out.paragraphs.map(String).slice(0, 4),
      sourceIds: (out.sourceIds ?? []).filter((id) => known.has(id)),
      writtenBy: "groq",
    };
  } catch (err) {
    console.error("[brief] Groq tech brief failed:", err);
    return null;
  }
}

const PLACEMENT_SYSTEM = `You write the placements column of a student news site for Symbiosis Institute of Technology (SIT), Pune.
You get SIT's own published placement figures and its season write-up as JSON. Write:
- "headline": plain and specific, max 12 words, no colon, no hype
- "paragraphs": 2 short paragraphs (each under 80 words) telling a current student what the numbers and recruiter mix say
Rules: use ONLY the figures and company names given. Copy numbers exactly. If a year is marked ongoing, say its figures are not final. Do not compare SIT to other colleges or rank it. Do not invent salaries, counts or companies.
Reply with JSON only.`;

export async function groqPlacementBrief(desk: PlacementDesk | null): Promise<PlacementBrief | null> {
  if (!hasGroq() || !desk || (!desk.years.length && !desk.season.length)) return null;
  try {
    const out = await groqJson<PlacementBrief>(
      PLACEMENT_SYSTEM,
      JSON.stringify({ years: desk.years, seasonReport: desk.season.join(" ").slice(0, 3500) }),
    );
    if (!out.headline || !Array.isArray(out.paragraphs) || !out.paragraphs.length) return null;
    return { headline: String(out.headline), paragraphs: out.paragraphs.map(String).slice(0, 3) };
  } catch (err) {
    console.error("[placements] Groq brief failed:", err);
    return null;
  }
}

function clamp(n: number, fallback: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
}
