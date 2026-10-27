import type { Category, Story } from "./types";

export const CATEGORIES: { slug: Category; name: string; blurb: string }[] = [
  { slug: "campus", name: "Campus", blurb: "Life on the Lavale hill: people, clubs, talks and the everyday." },
  { slug: "achievements", name: "Wins", blurb: "Rankings, accreditations, awards and things SIT people built." },
  { slug: "placements", name: "Placements", blurb: "Recruiters, packages and internships." },
  { slug: "research", name: "Research", blurb: "Labs, papers, funded projects and partnerships." },
  { slug: "events", name: "Events", blurb: "Fests, hackathons, workshops and conferences." },
  { slug: "admissions", name: "Admissions", blurb: "SITEEE, merit lists, deadlines and new programmes." },
  { slug: "notices", name: "Notices", blurb: "Straight from the institute's own notice board." },
];

const RULES: [Category, RegExp][] = [
  ["admissions", /admission|siteee|set 20|merit list|apply|application|cutoff|counsell?ing|seat|intake|entrance/i],
  ["placements", /placement|package|recruit|hired|internship|lpa|job offer|campus drive/i],
  ["research", /research|paper|patent|lab\b|laboratory|grant|funded|mou|collaborat|partnership|journal|centre of excellence/i],
  ["achievements", /award|rank|nirf|naac|nba|accredit|wins?\b|won\b|record|honou?r|felicitat|top \d+|first place|champion/i],
  ["events", /fest|hackathon|workshop|webinar|conference|summit|ceremony|convocation|induction|competition|seminar|symposium|celebrat/i],
];

/** Keyword fallback used when no Grok key is configured. */
export function categorize(title: string, dek = ""): Category {
  const text = `${title} ${dek}`;
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  return "campus";
}

/** Words too common to tell two headlines apart. */
const STOP = new Set(
  "the a an of in at on for to and with by from as is are its into via sit pune symbiosis institute technology students student".split(" "),
);

function tokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/**
 * Several outlets often run the same press release. Two headlines sharing most of their
 * meaningful words are treated as one story; the more relevant / earlier copy wins.
 */
export function dedupe(stories: Story[]): Story[] {
  const sorted = [...stories].sort(
    (a, b) => b.relevance - a.relevance || a.publishedAt.localeCompare(b.publishedAt),
  );
  const kept: { story: Story; words: Set<string> }[] = [];
  for (const story of sorted) {
    const words = tokens(story.title);
    const dup = kept.some(({ words: k }) => {
      if (!words.size || !k.size) return false;
      let shared = 0;
      for (const w of words) if (k.has(w)) shared++;
      return shared / Math.min(words.size, k.size) >= 0.6;
    });
    if (!dup) kept.push({ story, words });
  }
  return kept.map((k) => k.story);
}
