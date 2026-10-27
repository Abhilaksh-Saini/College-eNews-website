import { Footer } from "@/components/Footer";
import { Masthead } from "@/components/Masthead";
import { NoticeBoard } from "@/components/NoticeBoard";
import { PlacementDesk } from "@/components/PlacementDesk";
import { SocialShelf } from "@/components/SocialShelf";
import { StoryCard } from "@/components/StoryCard";
import { TechPulse } from "@/components/TechPulse";
import { getEdition, pickLead } from "@/lib/edition";
import styles from "./page.module.css";

/** Rebuilt in the background at most every three hours (and by the daily cron). */
export const revalidate = 10800;

export default async function Home() {
  const edition = await getEdition();
  const lead = pickLead(edition.stories);
  const rest = edition.stories.filter((s) => s.id !== lead?.id && s.kind !== "video");
  const featured = rest.slice(0, 6);
  const briefs = rest.slice(6, 18);
  const videos = edition.stories.filter((s) => s.kind === "video").slice(0, 6);

  return (
    <>
      <Masthead generatedAt={edition.generatedAt} />

      <main id="main">
        <div className={`wrap ${styles.front}`}>
          <div className={styles.lead}>
            {lead ? (
              <StoryCard story={lead} size="lg" />
            ) : (
              <div className={styles.empty}>
                <h2>No press stories in this edition</h2>
                <p>
                  None of the news sources answered when this edition was built. The site tries again every few
                  hours; meanwhile the notice board and videos still come straight from SIT.
                </p>
              </div>
            )}
          </div>
          <aside className={styles.side}>
            <NoticeBoard notices={edition.notices} />
          </aside>
        </div>

        {featured.length > 0 && (
          <section className={`wrap ${styles.section}`} aria-labelledby="latest-h">
            <h2 id="latest-h" className={styles.h2}>
              Latest from the foothill
            </h2>
            <div className={styles.grid}>
              {featured.map((s) => (
                <StoryCard key={s.id} story={s} size="md" />
              ))}
            </div>
          </section>
        )}

        <PlacementDesk desk={edition.placements} brief={edition.placementBrief} />

        {videos.length > 0 && (
          <section className={`wrap ${styles.section}`} aria-labelledby="watch-h">
            <h2 id="watch-h" className={styles.h2}>
              Watch
            </h2>
            <div className={styles.strip}>
              {videos.map((v) => (
                <StoryCard key={v.id} story={v} size="sm" />
              ))}
            </div>
          </section>
        )}

        <TechPulse brief={edition.brief} items={edition.tech} />

        {briefs.length > 0 && (
          <section className={`wrap ${styles.section}`} aria-labelledby="also-h">
            <h2 id="also-h" className={styles.h2}>
              Also in the news
            </h2>
            <div className={styles.list}>
              {briefs.map((s) => (
                <StoryCard key={s.id} story={s} size="sm" showPicture={false} />
              ))}
            </div>
          </section>
        )}

        <SocialShelf posts={edition.social} />
      </main>

      <Footer edition={edition} />
    </>
  );
}
