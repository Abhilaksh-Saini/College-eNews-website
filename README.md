# The Hilltop

A news site for **Symbiosis Institute of Technology, Pune** that fills itself. Every few hours it reads what's been published about SIT, sorts it into sections, and lays out a fresh edition — no one has to type stories in.

It's version 2 of our college e-news project. The original React + Express site is kept in [`legacy/`](legacy/).

## What's on the page

| Section | Where it comes from | Cost |
| --- | --- | --- |
| Lead story and *Latest from the hill* | Google News RSS searches for SIT Pune and Symbiosis | Free, no key |
| *On the notice board* | Announcements on [sitpune.edu.in](https://www.sitpune.edu.in/) | Free |
| *Watch* | SIT Pune's YouTube channel feed | Free, no key |
| *Tech Pulse* | Hacker News API and Google News' India technology section, with a short brief written by Grok | Free sources; Grok is optional |
| *Follow SIT where it posts* | SIT's Instagram, LinkedIn and YouTube accounts, plus posts you pick by hand | Free |

Every story links to its original source. The footer of each edition shows when it was built and which sources answered.

### What Grok does (optional)

With an xAI key set, Grok:

- sorts each story into a section (Campus, Wins, Placements, Research, Events, Admissions),
- drops admission-portal listicles and stories that only mention SIT in passing,
- writes the one-line summary under each headline, using only what the headline and snippet say,
- writes the *Tech Pulse* brief from that day's tech headlines.

Without a key, the site still works: it sorts with keyword rules and shows the tech headlines as a plain list.

The default model is `grok-4-1-fast-non-reasoning`, xAI's cheapest. An edition makes two small Grok calls and is rebuilt at most every three hours, so usage stays to a few cents a month.

### Why Instagram and LinkedIn are hand-picked

Neither network offers a free, permitted way for another site to read a college's posts, and scraping them breaks their terms and gets blocked. So the site links to SIT's accounts, and you can feature specific posts by adding them to [`content/social.json`](content/social.json):

```json
{
  "url": "https://www.instagram.com/p/XXXXXXXX/",
  "title": "SIT team wins the Smart India Hackathon finals",
  "account": "@symbiosis_sit",
  "date": "2026-10-20",
  "category": "achievements"
}
```

Commit the file and Vercel republishes the site within a minute.

## How updates happen

```
visitor or daily cron ──► Vercel serves the cached page
                              │ (older than 3 h?)
                              ▼
                  rebuild in the background:
     Google News · sitpune.edu.in · YouTube · Hacker News
                              │
                     dedupe ► Grok (optional)
                              │
                      new edition cached
```

- Pages use Next.js incremental static regeneration, so readers always get an instant static page.
- An edition is cached for 3 hours and shared by every page, so sources and Grok are hit once per rebuild.
- A Vercel Cron job calls `/api/refresh` every morning at 6:00 IST, so the site stays current even on quiet days.
- If a source is down, that section shows a short note and the rest of the edition carries on.

## Deploy on Vercel (free Hobby plan)

1. Go to [vercel.com/new](https://vercel.com/new) and import `mardromus/college-enews-website`.
2. Leave the framework as **Next.js** and the root directory as the repo root.
3. Under **Environment Variables**, add:
   - `XAI_API_KEY` — your Grok key from [console.x.ai](https://console.x.ai) (optional)
   - `CRON_SECRET` — any long random string, so only Vercel can trigger refreshes
   - `NEXT_PUBLIC_SITE_URL` — your site's URL once you know it, e.g. `https://the-hilltop.vercel.app`
4. Deploy. Every push to `main` redeploys automatically.

All variables are listed in [`.env.example`](.env.example).

## Run it locally

```bash
npm install
cp .env.example .env.local   # add your key if you have one
npm run dev                  # http://localhost:3000
```

## Project layout

```
src/
  app/              pages: front page, /section/[slug], /tech, /about, /api/refresh
  components/       masthead, story cards, generated covers, notice board, Tech Pulse…
  lib/
    sources/        one file per source (googleNews, sitOfficial, youtube, tech, social)
    edition.ts      builds and caches an edition from all sources
    enrich.ts       Grok sorting, filtering, summaries and the tech brief
    categorize.ts   keyword sections and duplicate detection
content/social.json hand-picked social posts
legacy/             the original v1 site
```

## Design

Two-ink risograph printing on bright paper: fluorescent pink, blue, yellow and green inks, Bricolage Grotesque for headlines and Literata for reading. Stories without photos get a generated halftone print (always the same picture for the same story), photos are printed as duotones in their section's ink, and hovering a story pulls its two ink plates into register. Motion is turned off for anyone who prefers reduced motion.

## Team

The original v1 site was built by:

- Abhay Pandey (23070122010)
- Abhilaksh Saini (23070122011)
- Kushagra (23070122122)
- Yash Pandey (23070122234)

*The Hilltop is a student project and not an official publication of Symbiosis Institute of Technology.*
