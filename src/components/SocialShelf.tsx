import { socialAccounts } from "@/lib/sources/social";
import type { Story } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import styles from "./SocialShelf.module.css";

const NETWORK_INK: Record<string, string> = {
  Instagram: "var(--pink)",
  LinkedIn: "var(--blue)",
  YouTube: "var(--green)",
};

export function SocialShelf({ posts }: { posts: Story[] }) {
  return (
    <section className={`wrap ${styles.shelf}`} aria-labelledby="social-h">
      <div className={styles.head}>
        <h2 id="social-h">Follow SIT where it posts</h2>
        <ul className={styles.accounts}>
          {socialAccounts.map((a) => (
            <li key={a.url}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ ["--net" as string]: NETWORK_INK[a.network] ?? "var(--ink)" }}>
                <span className={styles.network}>{a.network}</span>
                <span className={styles.handle}>{a.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {posts.length > 0 && (
        <div className={styles.posts}>
          {posts.slice(0, 6).map((p) => (
            <StoryCard key={p.id} story={p} size="sm" showPicture={false} />
          ))}
        </div>
      )}
    </section>
  );
}
