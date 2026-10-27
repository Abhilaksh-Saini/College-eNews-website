import Link from "next/link";
import type { PlacementDesk as Desk } from "@/lib/sources/sitPlacements";
import type { PlacementBrief } from "@/lib/types";
import styles from "./PlacementDesk.module.css";

function Bar({ value, max, ongoing, label }: { value: number | null; max: number; ongoing: boolean; label: string }) {
  if (value == null) return <span className={styles.na}>not published</span>;
  return (
    <span className={styles.barCell} title={label}>
      <span
        className={`${styles.bar} ${ongoing ? styles.ongoing : ""}`}
        style={{ width: `${Math.max(4, (value / max) * 100)}%` }}
        aria-hidden="true"
      />
      <span className={styles.value}>{label}</span>
    </span>
  );
}

/**
 * Placement figures, the season report and recruiters, read straight from SIT's own pages.
 * National rankings rarely cover SIT, so this is the most useful placement news students get.
 */
export function PlacementDesk({
  desk,
  brief,
  full = false,
}: {
  desk: Desk | null;
  brief: PlacementBrief | null;
  full?: boolean;
}) {
  if (!desk) {
    return (
      <section className={`wrap ${styles.desk}`} aria-labelledby="placements-h">
        <h2 id="placements-h" className={styles.h2}>
          Placements desk
        </h2>
        <p className={styles.note}>
          SIT&apos;s placement pages didn&apos;t answer for this edition. The next one tries again in a few hours, or
          read them at <a href="https://www.sitpune.edu.in/placement-record">sitpune.edu.in</a>.
        </p>
      </section>
    );
  }

  const pctMax = 100;
  const lpaMax = Math.max(1, ...desk.years.flatMap((y) => [y.highestNationalLpa ?? 0, y.highestInternationalLpa ?? 0]));
  const years = [...desk.years].reverse();
  const recruiters = [...desk.recruiters].sort((a, b) => a.localeCompare(b));
  const shown = full ? recruiters : recruiters.slice(0, 28);
  const hasOngoing = years.some((y) => y.ongoing);

  return (
    <section className={`wrap ${styles.desk}`} aria-labelledby="placements-h">
      <div className={styles.head}>
        <h2 id="placements-h" className={styles.h2}>
          Placements desk
        </h2>
        <p className={styles.note}>
          Read straight from SIT&apos;s own placement pages every few hours:{" "}
          {desk.pages.map((p, i) => (
            <span key={p.url}>
              {i > 0 && ", "}
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                {p.label.toLowerCase()}
              </a>
            </span>
          ))}
          .
        </p>
      </div>

      <div className={styles.cols}>
        <div className={styles.story}>
          {brief ? (
            <>
              <p className={styles.headline}>{brief.headline}</p>
              {brief.paragraphs.map((p, i) => (
                <p key={i} className={styles.para}>
                  {p}
                </p>
              ))}
              <p className={styles.credit}>
                Written by an AI model (Llama 3.3, run on Groq) from SIT&apos;s published figures. Check the linked pages
                before quoting.
              </p>
            </>
          ) : (
            desk.season.slice(0, full ? undefined : 1).map((p, i) => (
              <p key={i} className={i === 0 ? styles.lead : styles.para}>
                {p}
              </p>
            ))
          )}
          {!full && (
            <Link href="/placements" className={styles.more}>
              Full placements page
            </Link>
          )}
        </div>

        {years.length > 0 && (
          <div className={styles.figures}>
            <table className={styles.table}>
              <caption className={styles.caption}>Placement record as published by SIT</caption>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Students placed</th>
                  <th scope="col">Highest offer, India</th>
                  <th scope="col">Highest offer, abroad</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.year}>
                    <th scope="row">
                      {y.year}
                      {y.ongoing && <span className={styles.flag}>ongoing</span>}
                    </th>
                    <td>
                      <Bar value={y.placedPct} max={pctMax} ongoing={y.ongoing} label={`${y.placedPct}%`} />
                    </td>
                    <td>
                      <Bar value={y.highestNationalLpa} max={lpaMax} ongoing={y.ongoing} label={`${y.highestNationalLpa} LPA`} />
                    </td>
                    <td>
                      <Bar
                        value={y.highestInternationalLpa}
                        max={lpaMax}
                        ongoing={y.ongoing}
                        label={`${y.highestInternationalLpa} LPA`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasOngoing && (
              <p className={styles.footnote}>Striped bars are for a season still in progress, so those figures aren&apos;t final.</p>
            )}
          </div>
        )}
      </div>

      {shown.length > 0 && (
        <div className={styles.recruiters}>
          <h3 className={styles.h3}>Recruiters on SIT&apos;s placement record</h3>
          <ul>
            {shown.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {!full && recruiters.length > shown.length && (
            <Link href="/placements" className={styles.more}>
              All {recruiters.length} recruiters
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
