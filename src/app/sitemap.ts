import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categorize";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/placements`, lastModified: now, changeFrequency: "daily" },
    { url: `${base}/tech`, lastModified: now, changeFrequency: "daily" },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly" },
    ...CATEGORIES.map((c) => ({
      url: `${base}/section/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
    })),
  ];
}
