import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Masthead } from "@/components/Masthead";
import { PlacementDesk } from "@/components/PlacementDesk";
import { StoryCard } from "@/components/StoryCard";
import { getEdition } from "@/lib/edition";
import styles from "../section/[slug]/section.module.css";

export const revalidate = 10800;

export const metadata: Metadata = {
  title: "Placements",
  description: "SIT Pune's placement figures, recruiters and season report from its own pages, plus placement news from the press.",
};

export default async function PlacementsPage() {
  const edition = await getEdition();
  const press = edition.stories.filter((s) => s.category === "placements");

  return (
    <>
      <Masthead generatedAt={edition.generatedAt} compact />
      <main id="main">
        <div className="wrap">
          <header className={styles.intro}>
            <h1>Placements</h1>
            <p>Figures, recruiters and the season so far, straight from SIT, with placement news from the press below.</p>
          </header>
        </div>

        <PlacementDesk desk={edition.placements} brief={edition.placementBrief} full />

        <section className="wrap" style={{ marginTop: "clamp(48px, 7vw, 88px)" }} aria-labelledby="pp-h">
          <h2 id="pp-h" style={{ fontSize: "var(--step-3)", paddingBottom: 14, marginBottom: 26, borderBottom: "2px solid var(--ink)" }}>
            In the press
          </h2>
          {press.length ? (
            <div className={styles.grid}>
              {press.map((s) => (
                <StoryCard key={s.id} story={s} size="md" />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              No placement stories in the press this edition. SIT&apos;s own figures above are the most current source.
            </p>
          )}
        </section>
      </main>
      <Footer edition={edition} />
    </>
  );
}
