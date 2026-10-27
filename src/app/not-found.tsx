import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="wrap" style={{ paddingBlock: "18vh", maxWidth: 720 }}>
      <h1 style={{ fontSize: "clamp(2.6rem, 8vw, 5rem)", letterSpacing: "-0.03em" }}>Nothing pinned here</h1>
      <p style={{ marginTop: 16, fontSize: "1.2rem" }}>
        This page doesn&apos;t exist, or the story moved. <Link href="/">Go to the front page</Link>.
      </p>
    </main>
  );
}
