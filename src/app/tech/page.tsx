import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Masthead } from "@/components/Masthead";
import { TechPulse } from "@/components/TechPulse";
import { getEdition } from "@/lib/edition";

export const revalidate = 10800;

export const metadata: Metadata = {
  title: "Tech Pulse",
  description: "Today's technology headlines from Hacker News and the Indian tech press, with a short brief for SIT students.",
};

export default async function TechPage() {
  const edition = await getEdition();
  return (
    <>
      <Masthead generatedAt={edition.generatedAt} compact />
      <main id="main">
        <TechPulse brief={edition.brief} items={edition.tech} full />
      </main>
      <Footer edition={edition} />
    </>
  );
}
