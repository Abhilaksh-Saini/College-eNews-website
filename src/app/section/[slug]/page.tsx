import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Masthead } from "@/components/Masthead";
import { NoticeBoard } from "@/components/NoticeBoard";
import { StoryCard } from "@/components/StoryCard";
import { CATEGORIES } from "@/lib/categorize";
import { getEdition } from "@/lib/edition";
import styles from "./section.module.css";

export const revalidate = 10800;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat ? { title: cat.name, description: cat.blurb } : {};
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const edition = await getEdition();
  const stories =
    cat.slug === "notices" ? [] : edition.stories.filter((s) => s.category === cat.slug);

  return (
    <>
      <Masthead generatedAt={edition.generatedAt} compact />
      <main id="main" className="wrap">
        <header className={styles.intro}>
          <h1>{cat.name}</h1>
          <p>{cat.blurb}</p>
        </header>

        {cat.slug === "notices" ? (
          <div className={styles.notices}>
            <NoticeBoard notices={edition.notices} />
          </div>
        ) : stories.length ? (
          <div className={styles.grid}>
            {stories.map((s, i) => (
              <StoryCard key={s.id} story={s} size={i === 0 ? "lg" : "md"} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Nothing filed under {cat.name.toLowerCase()} in this edition. Stories move between sections as new ones
            come in, so check the <Link href="/">front page</Link> for everything.
          </p>
        )}
      </main>
      <Footer edition={edition} />
    </>
  );
}
