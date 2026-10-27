# The Foothill

A news site for **Symbiosis Institute of Technology, Pune** that fills itself. Every few hours it reads what's been published about SIT, sorts it into sections, and lays out a fresh edition — no one has to type stories in.

It's version 2 of our college e-news project. The original React + Express site is kept in [`legacy/`](legacy/).

## What's on the page

| Section | Where it comes from | Cost |
| --- | --- | --- |
| Lead story and *Latest from the foothill* | Google News RSS searches for SIT Pune and Symbiosis | Free, no key |
| *On the notice board* | Announcements on [sitpune.edu.in](https://www.sitpune.edu.in/) | Free |
| *Watch* | SIT Pune's YouTube channel feed | Free, no key |
| *Tech Pulse* | Hacker News API and Google News' India technology section, with a short brief written by Llama 3.3 on Groq | Free; Groq is optional |
| News from social posts | Public LinkedIn and Instagram posts found through Tavily search, rewritten as news with the post as source | Free (1,000 searches/month) |
| *Placements desk* | SIT's own placement records, season report and recruiter list | Free |

Every story links to its original source. The footer of each edition shows when it was built and which sources answered.

### What the AI does (optional, free)

With a free [Groq](https://console.groq.com) API key set, the site uses Meta's Llama 3.3 70B to:

- sort each story into a section (Campus, Wins, Placements, Research, Events, Admissions),
- drop admission-portal listicles and stories that only mention SIT in passing,
- write the one-line summary under each headline, using only what the headline and snippet say,
- write the *Tech Pulse* brief from that day's tech headlines.

Without a key, the site still works: it sorts with keyword rules and shows the tech headlines as a plain list.

An edition makes two small calls and is rebuilt at most every three hours, which sits well inside Groq's free tier, so the whole pipeline costs nothing. Set `GROQ_MODEL` to try another Groq model, such as `openai/gpt-oss-120b`.

### Instagram and LinkedIn posts, found automatically

The site finds public LinkedIn and Instagram posts about SIT Pune by itself. Neither network lets other sites read posts directly, and scraping them breaks their terms, so it searches what search engines have already indexed, using [Tavily](https://tavily.com)'s search API:

- Three searches run at most every 6 hours (about 360 a month), inside Tavily's free 1,000 a month. No card needed.
- Only individual posts that mention SIT are kept. Profiles, company pages, job ads and unrelated posts are dropped.
- Every link comes from the search index, never from the AI, so a post can't be invented.
- Groq rewrites each post as a plain news headline and summary using only the post's words, skips posts with no news in them, and the story credits the post as its source ("Source: LinkedIn post by SIT Pune").

Nothing needs entering by hand. If search ever misses a post you want, you can force-include it in [`content/social.json`](content/social.json).

## How updates happen

```
visitor or daily cron ──► Vercel serves the cached page
                              │ (older than 3 h?)
                              ▼
                  rebuild in the background:
     Google News · sitpune.edu.in · YouTube · Hacker News
                              │
                     dedupe ► Groq (optional)
                              │
                      new edition cached
```

- Pages use Next.js incremental static regeneration, so readers always get an instant static page.
- An edition is cached for 3 hours and shared by every page, so sources and Groq are hit once per rebuild.
- A Vercel Cron job calls `/api/refresh` every morning at 6:00 IST, so the site stays current even on quiet days.
- If a source is down, that section shows a short note and the rest of the edition carries on.

## Deploy on Vercel (free Hobby plan)

1. Go to [vercel.com/new](https://vercel.com/new) and import `mardromus/college-enews-website`.
2. Leave the framework as **Next.js** and the root directory as the repo root.
3. Under **Environment Variables**, add:
   - `GROQ_API_KEY` — a free key from [console.groq.com/keys](https://console.groq.com/keys) (optional)
   - `TAVILY_API_KEY` — a free key from [app.tavily.com](https://app.tavily.com), so the site can find LinkedIn and Instagram posts
   - `CRON_SECRET` — any long random string, so only Vercel can trigger refreshes
   - `NEXT_PUBLIC_SITE_URL` — your site's URL once you know it, e.g. `https://the-foothill.vercel.app`
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
    enrich.ts       Groq sorting, filtering, summaries and the tech brief
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

*The Foothill is a student project and not an official publication of Symbiosis Institute of Technology.*
