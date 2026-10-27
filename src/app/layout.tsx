import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Literata } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["wdth", "opsz"],
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Foothill · SIT Pune news",
    template: "%s · The Foothill",
  },
  description:
    "News from Symbiosis Institute of Technology, Pune, gathered automatically from the press, the institute and its channels, every few hours.",
  openGraph: {
    title: "The Foothill",
    description: "News from SIT Pune, gathered automatically every few hours.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${bricolage.variable} ${literata.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to stories
        </a>
        {children}
      </body>
    </html>
  );
}
