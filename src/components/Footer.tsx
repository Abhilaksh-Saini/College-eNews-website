import Link from "next/link";
import { ago } from "@/lib/format";
import type { Edition } from "@/lib/types";
import styles from "./Footer.module.css";

export function Footer({ edition }: { edition: Edition }) {
  return (
    <footer className={styles.foot}>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <p className={styles.name}>The Foothill</p>
          <p className={styles.note}>
            A student project, not an official publication of Symbiosis Institute of Technology. Every story links to
            its original source; headlines and summaries belong to the outlets that published them.
          </p>
          <p className={styles.note}>
            <Link href="/about">How this site works</Link> ·{" "}
            <a href="https://github.com/mardromus/college-enews-website">Source code</a>
          </p>
        </div>

        <div>
          <p className={styles.label}>This edition</p>
          <p className={styles.note}>
            Built {ago(edition.generatedAt)}
            {edition.enrichedByAI ? ", sorted and summarised with Groq" : ", keyword sorting"}.
          </p>
          <ul className={styles.health}>
            {edition.health.map((h) => (
              <li key={h.source}>
                <span className={h.ok ? styles.ok : styles.down} aria-hidden="true" />
                {h.source}
                <span className={styles.count}>{h.ok ? `${h.count} ${h.count === 1 ? "item" : "items"}` : "didn't answer"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
