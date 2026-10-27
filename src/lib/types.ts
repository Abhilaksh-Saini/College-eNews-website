export type Category =
  | "admissions"
  | "achievements"
  | "placements"
  | "research"
  | "campus"
  | "events"
  | "notices";

export type SourceKind = "press" | "official" | "video" | "social" | "tech";

export interface Story {
  /** Stable id derived from the link, used for dedupe and React keys. */
  id: string;
  title: string;
  /** One or two plain sentences. Written by the Groq model when a key is set, else the feed's own snippet. */
  dek: string;
  url: string;
  /** Publication or account name, e.g. "The Indian Express" or "@symbiosis_sit". */
  outlet: string;
  kind: SourceKind;
  category: Category;
  publishedAt: string; // ISO
  /** 0–1, how clearly this is about SIT Pune specifically. */
  relevance: number;
  /** Set when the story is about another Symbiosis campus (Hyderabad, Nagpur…). */
  campus?: string;
  image?: string;
  /** For stories written from a social post: "LinkedIn post", "Instagram post". Shown as the source. */
  via?: string;
}

export interface TechItem {
  id: string;
  title: string;
  url: string;
  outlet: string;
  points?: number;
  publishedAt: string;
}

export interface TechBrief {
  headline: string;
  paragraphs: string[];
  /** Ids of TechItems the brief draws on, so readers can check every claim. */
  sourceIds: string[];
  writtenBy: "groq" | "headlines";
}

export interface PlacementBrief {
  headline: string;
  paragraphs: string[];
}

export interface Edition {
  generatedAt: string;
  stories: Story[];
  notices: Story[];
  social: Story[];
  tech: TechItem[];
  brief: TechBrief | null;
  /** Which sources answered this run, shown in the footer for transparency. */
  health: { source: string; ok: boolean; count: number }[];
  enrichedByAI: boolean;
  /** Straight from SIT's own placement pages; null if they didn't answer. */
  placements: import("./sources/sitPlacements").PlacementDesk | null;
  placementBrief: PlacementBrief | null;
}
