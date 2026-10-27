import type { Story } from "@/lib/types";
import styles from "./NoticeBoard.module.css";

/** Notices from sitpune.edu.in, pinned up like slips of paper. */
export function NoticeBoard({ notices }: { notices: Story[] }) {
  return (
    <section className={styles.board} aria-labelledby="notices-h">
      <h2 id="notices-h" className={styles.heading}>
        On the notice board
      </h2>
      <p className={styles.sub}>
        Posted by the institute on <a href="https://www.sitpune.edu.in/">sitpune.edu.in</a>
      </p>

      {notices.length ? (
        <ul className={styles.slips}>
          {notices.slice(0, 6).map((n, i) => (
            <li key={n.id} style={{ ["--tilt" as string]: `${[-1.4, 0.9, -0.6, 1.3, -1, 0.5][i % 6]}deg` }}>
              <a href={n.url} target="_blank" rel="noopener noreferrer" className={styles.slip}>
                <span className="hl">{n.title}</span>
                {/\.pdf($|\?)/i.test(n.url) && <span className={styles.kind}>PDF</span>}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          The institute&apos;s site didn&apos;t answer this time. Its notices will be back in the next edition, or
          read them at <a href="https://www.sitpune.edu.in/">sitpune.edu.in</a>.
        </p>
      )}
    </section>
  );
}
