import { fetchText, stripHtml } from "../fetcher";

const BASE = "https://www.sitpune.edu.in/";

export interface PlacementYear {
  year: string;
  /** Share of students placed, 0–100. Null when the page leaves it blank. */
  placedPct: number | null;
  /** Highest national / international offers in lakh per annum. */
  highestNationalLpa: number | null;
  highestInternationalLpa: number | null;
  /** The page marks the current year with "*" while placements are still running. */
  ongoing: boolean;
}

export interface PlacementDesk {
  years: PlacementYear[];
  /** The season write-up on sitpune.edu.in/placements, as paragraphs. */
  season: string[];
  /** Recruiters named on the official pages, de-duplicated. */
  recruiters: string[];
  pages: { label: string; url: string }[];
}

/**
 * Injected SEO spam has shown up in the institute site's footer (APK download links).
 * Nothing matching this ever reaches the page.
 */
const SPAM = /\bapk\b|casino|betting|satta|free fire|mini militia|mod menu|slot game/i;

function clean(html: string) {
  return html.replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
}

function cells(row: string): string[] {
  return [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((m) => stripHtml(m[1]));
}

function lpa(s: string): number | null {
  const m = s.match(/(\d+(?:\.\d+)?)\s*(?:LPA|lakh)/i);
  return m ? Number(m[1]) : null;
}

/** The "% Placements / Highest Package" table on /placement-record. */
export function parseRecord(html: string): PlacementYear[] {
  const years: PlacementYear[] = [];
  for (const table of clean(html).match(/<table[\s\S]*?<\/table>/gi) ?? []) {
    if (!/highest package/i.test(table)) continue;
    for (const row of table.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
      const c = cells(row);
      if (c.length < 3 || !/^\d{4}\s*-\s*\d{2}/.test(c[0])) continue;
      const pct = c[1].match(/(\d+(?:\.\d+)?)/);
      years.push({
        year: c[0].replace(/\*/g, "").replace(/\s+/g, ""),
        placedPct: pct ? Number(pct[1]) : null,
        highestNationalLpa: lpa(c[2] ?? ""),
        highestInternationalLpa: lpa(c[3] ?? ""),
        ongoing: c[0].includes("*") || c[1].includes("*"),
      });
    }
    if (years.length) break;
  }
  return years.sort((a, b) => a.year.localeCompare(b.year));
}

/** The season write-up on /placements: from "The campus recruitment season…" to the cell's own description. */
export function parseSeason(html: string): string[] {
  const text = stripHtml(clean(html));
  const start = text.search(/The campus recruitment season/i);
  if (start < 0) return [];
  const rest = text.slice(start);
  const end = rest.search(/Department of Training and Placements/i);
  const body = (end > 0 ? rest.slice(0, end) : rest.slice(0, 2500)).trim();
  // Split into readable paragraphs of a few sentences each.
  const sentences = body.split(/(?<=\.)\s+(?=[A-Z])/);
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) paras.push(sentences.slice(i, i + 2).join(" "));
  return paras.filter((p) => !SPAM.test(p));
}

/** Recruiter names from the most recent recruiter tables. */
export function parseRecruiters(html: string, limit = 60): string[] {
  const seen = new Map<string, string>();
  for (const table of clean(html).match(/<table[\s\S]*?<\/table>/gi) ?? []) {
    if (/highest package|registration link/i.test(table)) continue;
    for (const row of table.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
      for (const name of cells(row)) {
        const n = name.replace(/\s+/g, " ").trim();
        if (n.length < 3 || n.length > 60 || SPAM.test(n) || /company name|academic programme|^companies\b|^our recruiters/i.test(n)) continue;
        const key = n.toLowerCase().replace(/\b(pvt|private|ltd|limited|llp|inc|india|\(.*?\))\b\.?/g, "").replace(/[^a-z0-9]/g, "");
        if (key && !seen.has(key)) seen.set(key, n);
      }
    }
    if (seen.size >= limit) break;
  }
  return [...seen.values()].slice(0, limit);
}

export async function fetchPlacementDesk(): Promise<PlacementDesk> {
  const pages = {
    record: BASE + "placement-record",
    overview: BASE + "placements",
    recruiters: BASE + "placement-list-recruiters",
  };
  const [record, overview, recruiters] = await Promise.allSettled([
    fetchText(pages.record, 12000),
    fetchText(pages.overview, 12000),
    fetchText(pages.recruiters, 12000),
  ]);
  const ok = (r: PromiseSettledResult<string>) => (r.status === "fulfilled" ? r.value : "");

  const desk: PlacementDesk = {
    years: parseRecord(ok(record)),
    season: parseSeason(ok(overview)),
    // The record page lists the current year's recruiters first; the internship page is older.
    recruiters: parseRecruiters(ok(record) || ok(recruiters)),
    pages: [
      { label: "Placement records", url: pages.record },
      { label: "Placements overview", url: pages.overview },
      { label: "List of recruiters", url: pages.recruiters },
    ],
  };
  if (!desk.years.length && !desk.season.length && !desk.recruiters.length) {
    throw new Error("No placement data found on sitpune.edu.in");
  }
  return desk;
}
