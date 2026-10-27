import { CATEGORIES } from "@/lib/categorize";
import { ago } from "@/lib/format";
import type { Story } from "@/lib/types";
import { Cover, INKS } from "./Cover";
import styles from "./StoryCard.module.css";

const NAMES = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]));

function Picture({ story }: { story: Story }) {
  if (story.image) {
    const [a] = INKS[story.category];
    return (
      <div className={styles.photo} style={{ ["--duo" as string]: a }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnails, no optimisation needed */}
        <img src={story.image} alt="" loading="lazy" decoding="async" />
        {story.kind === "video" && <span className={styles.play} aria-hidden="true" />}
      </div>
    );
  }
  return <Cover seed={story.id} category={story.category} />;
}

export function StoryCard({
  story,
  size = "md",
  showPicture = true,
}: {
  story: Story;
  size?: "lg" | "md" | "sm";
  showPicture?: boolean;
}) {
  return (
    <article className={`${styles.card} ${styles[size]}`}>
      <a href={story.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {showPicture && <Picture story={story} />}
        <div className={styles.text}>
          <h3 className={styles.title}>
            <span className="hl">{story.title}</span>
            {story.kind === "video" && <span className="visually-hidden"> (video)</span>}
          </h3>
          {story.dek && size !== "sm" && <p className={styles.dek}>{story.dek}</p>}
          <p className="meta">
            <span className={styles.section}>
              <span className={styles.dot} style={{ background: INKS[story.category][0] }} aria-hidden="true" />
              {NAMES[story.category]}
            </span>
            {", "}
            {story.outlet}
            {story.campus ? `, ${story.campus} campus` : ""}
            {", "}
            <time dateTime={story.publishedAt}>{ago(story.publishedAt)}</time>
          </p>
        </div>
      </a>
    </article>
  );
}
