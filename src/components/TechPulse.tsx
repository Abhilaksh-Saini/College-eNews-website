import Link from "next/link";
import { ago } from "@/lib/format";
import type { TechBrief, TechItem } from "@/lib/types";
import styles from "./TechPulse.module.css";

/**
 * The tech section. With a Grok key it's a short written brief plus its sources;
 * without one it falls back to the raw headline list, so there's never an empty band.
 */
export function TechPulse({
  brief,
  items,
  full = false,
}: {
  brief: TechBrief | null;
  items: TechItem[];
  full?: boolean;
}) {
  const sources = full
    ? items
    : brief?.sourceIds.length
      ? items.filter((i) => brief.sourceIds.includes(i.id))
      : items.slice(0, 8);

  return (
    <section className={styles.band} aria-labelledby="tech-h">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.lede}>
          <h2 id="tech-h" className={styles.kicker}>
            Tech Pulse
          </h2>
          {brief ? (
            <>
              <p className={styles.headline}>{brief.headline}</p>
              <div className={styles.body}>
                {brief.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className={styles.credit}>
                Written by Grok from the headlines listed here. Open the sources before you quote anything.
              </p>
            </>
          ) : (
            <p className={styles.headline}>What the tech world is reading today</p>
          )}
          {!full && (
            <Link href="/tech" className={styles.more}>
              All tech headlines
            </Link>
          )}
        </div>

        <ol className={styles.sources}>
          {sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                <span className={`hl ${styles.srcTitle}`}>{s.title}</span>
                <span className="meta">
                  {s.outlet}
                  {s.points ? `, ${s.points} points on Hacker News` : ""}, {ago(s.publishedAt)}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
