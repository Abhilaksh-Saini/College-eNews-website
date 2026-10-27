import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Masthead } from "@/components/Masthead";
import { getEdition } from "@/lib/edition";
import styles from "./about.module.css";

export const revalidate = 10800;

export const metadata: Metadata = {
  title: "How this works",
  description: "Where The Hilltop's stories come from, how often it updates, and what Grok does and doesn't write.",
};

export default async function AboutPage() {
  const edition = await getEdition();
  return (
    <>
      <Masthead generatedAt={edition.generatedAt} compact />
      <main id="main" className={`wrap ${styles.page}`}>
        <h1>How this works</h1>

        <div className={styles.body}>
          <p className={styles.lede}>
            The Hilltop is a student-built news site for Symbiosis Institute of Technology, Pune. Nobody types the
            stories in. Every few hours the site goes out, reads what&apos;s been published about SIT, and lays out a
            new edition.
          </p>

          <h2>Where stories come from</h2>
          <ul>
            <li>
              <strong>The press.</strong> Google News searches for SIT Pune and Symbiosis across Indian outlets.
              Headlines link to the original article.
            </li>
            <li>
              <strong>The institute.</strong> Notices and announcements posted on sitpune.edu.in.
            </li>
            <li>
              <strong>SIT&apos;s YouTube channel.</strong> The latest uploads, with their own thumbnails.
            </li>
            <li>
              <strong>Instagram and LinkedIn.</strong> These networks don&apos;t let other sites read posts
              automatically, so standout posts are picked by hand and linked back to the original.
            </li>
            <li>
              <strong>Tech Pulse.</strong> Top stories from Hacker News and the Indian tech press.
            </li>
          </ul>

          <h2>What Grok does</h2>
          <p>
            Grok, xAI&apos;s language model, sorts stories into sections, drops admission-portal listicles that only
            mention SIT in passing, and writes the one-line summary under each headline using only what the headline
            and the outlet&apos;s own snippet say. It also writes the short Tech Pulse brief from that day&apos;s
            headlines. It doesn&apos;t write news about SIT. If something reads wrong, the original source is one
            click away.
          </p>

          <h2>How often it updates</h2>
          <p>
            A new edition is built at most every three hours when people are reading, and once every morning
            regardless. The footer shows when this edition was built and which sources answered.
          </p>

          <h2>Corrections</h2>
          <p>
            This isn&apos;t an official SIT publication. To correct or remove something, open an issue on{" "}
            <a href="https://github.com/mardromus/college-enews-website/issues">the project&apos;s GitHub</a>.
          </p>
        </div>
      </main>
      <Footer edition={edition} />
    </>
  );
}
