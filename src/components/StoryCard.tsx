import { CATEGORIES } from "@/lib/categorize";
import { ago } from "@/lib/format";
import type { Story } from "@/lib/types";
import { Cover, INKS } from "./Cover";
import styles from "./StoryCard.module.css";

const NAMES = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]));

function Picture({ story, size }: { story: Story; size: "lg" | "md" | "sm" }) {
  if (story.image) {
    const [a] = INKS[story.category];
    const extra = (story.images ?? []).slice(1);
    // Real photos from a post are shown as they are; video thumbnails keep the duotone print.
    const duotone = story.kind === "video";
    return (
      <div className={styles.media}>
        <div className={`${styles.photo} ${duotone ? styles.duotone : styles.natural}`} style={{ ["--duo" as string]: a }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote post images, served by their own CDN */}
          <img src={story.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          {story.kind === "video" && <span className={styles.play} aria-hidden="true" />}
          {extra.length > 0 && size !== "lg" && (
            <span className={styles.count}>+{extra.length} {extra.length === 1 ? "photo" : "photos"}</span>
          )}
        </div>
        {extra.length > 0 && size === "lg" && (
          <div className={styles.strip}>
            {extra.slice(0, 3).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            ))}
          </div>
        )}
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
        {showPicture && <Picture story={story} size={size} />}
        <div className={styles.text}>
          <h3 className={styles.title}>
            <span className="hl">{story.title}</span>
            {story.kind === "video" && <span className="visually-hidden"> (video)</span>}
          </h3>
          {story.dek && (size !== "sm" || story.via) && <p className={styles.dek}>{story.dek}</p>}
          <p className="meta">
            <span className={styles.section}>
              <span className={styles.dot} style={{ background: INKS[story.category][0] }} aria-hidden="true" />
              {NAMES[story.category]}
            </span>
            {", "}
            {story.via ? `Source: ${story.via} by ${story.outlet}` : story.outlet}
            {story.campus ? `, ${story.campus} campus` : ""}
            {", "}
            <time dateTime={story.publishedAt}>{ago(story.publishedAt)}</time>
          </p>
        </div>
      </a>
    </article>
  );
}
