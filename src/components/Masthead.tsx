import Link from "next/link";
import { CATEGORIES } from "@/lib/categorize";
import { ago, longDate } from "@/lib/format";
import { INKS } from "./Cover";
import styles from "./Masthead.module.css";

export function Masthead({ generatedAt, compact = false }: { generatedAt: string; compact?: boolean }) {
  return (
    <header className={`${styles.head} ${compact ? styles.compact : ""}`}>
      <div className="wrap">
        <div className={styles.topline}>
          <p className="meta">{longDate(generatedAt)}</p>
          <p className="meta">
            Edition built {ago(generatedAt)} · <Link href="/about">How this works</Link>
          </p>
        </div>

        <Link href="/" className={styles.nameLink} aria-label="The Hilltop, home">
          <span className={styles.name} aria-hidden="true">
            <span className={styles.plateBlue}>The Hilltop</span>
            <span className={styles.platePink}>The Hilltop</span>
          </span>
        </Link>

        {!compact && (
          <p className={styles.tagline}>
            News from Symbiosis Institute of Technology, up on the Lavale hill in Pune. Gathered from the
            press, the institute and its channels every few hours, each story linked to where it came from.
          </p>
        )}

        <nav className={styles.nav} aria-label="Sections">
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={c.slug === "placements" ? "/placements" : `/section/${c.slug}`}>
                  <span className={styles.swatch} style={{ background: INKS[c.slug][0] }} aria-hidden="true" />
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tech">
                <span className={styles.swatch} style={{ background: "var(--yellow)" }} aria-hidden="true" />
                Tech Pulse
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
