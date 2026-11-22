import type { GuideIndex } from "../data/schema";

export const MAX_LEVEL = 60;

/** "1-12" / "22–30" → [1, 12]. Falls back to [1, 60]. */
export function parseRange(label: string): [number, number] {
  const m = /(\d+)\s*[-–]\s*(\d+)/.exec(label);
  if (!m) return [1, MAX_LEVEL];
  return [Number(m[1]), Number(m[2])];
}

/** "1-6-durotar" → "1–6 Durotar" (used until the guide JSON is loaded). */
export function prettifySlug(slug: string): string {
  // Fallback only (real titles come from the guide index): drop the faction prefix, the pack
  // numbering ("20-40-03-") and a trailing level range ("-12-20"), which readers see elsewhere.
  const base = slug.replace(/^horde-/, "").replace(/^\d+-\d+-\d+-/, "").replace(/(.)-\d+-\d+$/, "$1");
  const m = /^(\d+)-(\d+)-(.*)$/.exec(base);
  const words = (m ? m[3]! : base)
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return m ? `${m[1]}–${m[2]} ${words}` : words;
}

/** Level range encoded in a guide slug, if any. */
export function slugRange(slug: string): [number, number] | undefined {
  const m = /^(\d+)-(\d+)-/.exec(slug);
  return m ? [Number(m[1]), Number(m[2])] : undefined;
}

/** Estimated character level from a guide range and the fraction of it done. */
export function estimateLevel(minLevel: number, maxLevel: number, fraction: number): number {
  const f = Math.min(1, Math.max(0, fraction));
  return minLevel + (maxLevel - minLevel) * f;
}

/** 0..1 position of a level on the 1→60 timeline. */
export function levelToFraction(level: number): number {
  return Math.min(1, Math.max(0, (level - 1) / (MAX_LEVEL - 1)));
}

/** Bracket label that contains a guide slug. */
export function bracketOf(index: GuideIndex, slug: string): string | undefined {
  return index.brackets.find((b) => b.guides.includes(slug))?.label;
}

/** All guide slugs in play order. */
export function allGuideSlugs(index: GuideIndex): string[] {
  return index.brackets.flatMap((b) => b.guides);
}
