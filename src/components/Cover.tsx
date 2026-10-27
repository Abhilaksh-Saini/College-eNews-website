import type { Category } from "@/lib/types";
import styles from "./Cover.module.css";

/** Which two riso inks each section prints in. */
export const INKS: Record<Category, [string, string]> = {
  campus: ["var(--green)", "var(--pink)"],
  achievements: ["var(--yellow)", "var(--blue)"],
  placements: ["var(--blue)", "var(--yellow)"],
  research: ["var(--blue)", "var(--pink)"],
  events: ["var(--pink)", "var(--blue)"],
  admissions: ["var(--yellow)", "var(--pink)"],
  notices: ["var(--ink)", "var(--yellow)"],
};

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * A generated two-ink print for stories without a photo. Each story id always produces
 * the same picture: a halftone hill, a sun or moon, and a band of stripes, printed slightly
 * out of register. Hovering the parent link pulls the two plates into register.
 */
export function Cover({ seed, category, label }: { seed: string; category: Category; label?: string }) {
  const r = rng(seed);
  const [a, b] = INKS[category];
  const W = 400;
  const H = 260;

  // Hill silhouette: a few control points across the width.
  const peaks = Array.from({ length: 4 }, (_, i) => ({
    x: (i + 1) * (W / 5) + (r() - 0.5) * 40,
    y: H * (0.38 + r() * 0.28),
  }));
  let hill = `M0 ${H} L0 ${H * 0.7}`;
  for (const p of peaks) hill += ` Q${p.x - 40} ${p.y - 30} ${p.x} ${p.y}`;
  hill += ` L${W} ${H * (0.55 + r() * 0.2)} L${W} ${H} Z`;

  const sun = { cx: 60 + r() * (W - 120), cy: 40 + r() * 70, r: 26 + r() * 34 };
  const stripeAngle = Math.round(r() * 60 - 30);
  const dot = 5 + Math.round(r() * 3);
  const id = `c${seed}`;

  return (
    <div className={styles.cover} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`${id}d`} width={dot} height={dot} patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            <circle cx={dot / 2} cy={dot / 2} r={dot * 0.36} style={{ fill: a }} />
          </pattern>
          <pattern id={`${id}s`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform={`rotate(${stripeAngle})`}>
            <rect width="4" height="9" style={{ fill: b }} />
          </pattern>
        </defs>
        <g className={styles.plateA}>
          <path d={hill} fill={`url(#${id}d)`} />
          <circle cx={sun.cx} cy={sun.cy} r={sun.r} style={{ fill: a }} />
        </g>
        <g className={styles.plateB}>
          <rect x={r() * W * 0.4} y={H * 0.18} width={W * (0.35 + r() * 0.3)} height={H * 0.22} fill={`url(#${id}s)`} />
          <circle cx={sun.cx + 10} cy={sun.cy + 6} r={sun.r * 0.62} fill="none" strokeWidth="5" style={{ stroke: b }} />
        </g>
      </svg>
    </div>
  );
}
