/**
 * Pure maths for the landing page background (FusionBackground.tsx), kept apart so it can be tested.
 *
 * The screen is split by a slanted, gently waving seam: Horde (warm) on the left / top,
 * Alliance (cool) on the right / bottom. Embers rise on the Horde side, frost motes drift on the
 * Alliance side, and anything that reaches the seam turns into a gold spark that runs along it.
 */

export type Focus = "horde" | "alliance" | null;

export interface Seam {
  /** Seam x at the vertical centre of the screen, in px. */
  cx: number;
  cy: number;
  /** dx/dy: how far the seam leans. Negative = top leans right. */
  slope: number;
  /** Wave amplitude in px and the time phase. */
  amp: number;
  t: number;
}

/** Where the seam sits for a screen size and the hovered card (0..1 of the width). */
export function seamTarget(w: number, focus: Focus): number {
  if (focus === "horde") return 0.6;
  if (focus === "alliance") return w < 768 ? 0.46 : 0.45;
  return 0.5;
}

/**
 * How much the seam leans. Wide screens: a gentle slant between side-by-side cards.
 * Tall screens (stacked cards): a steep diagonal, so the top card sits on the Horde side
 * and the bottom card on the Alliance side.
 */
export function seamSlope(w: number, h: number): number {
  if (w >= 768) return -0.22;
  return -(0.8 * w) / Math.max(h, 1);
}

export function seamX(s: Seam, y: number): number {
  return s.cx + (y - s.cy) * s.slope + Math.sin(y * 0.006 + s.t * 0.35) * s.amp + Math.sin(y * 0.017 - s.t * 0.6) * s.amp * 0.35;
}

/** Signed distance (px, horizontal) from the seam: negative = Horde side, positive = Alliance side. */
export function seamSide(s: Seam, x: number, y: number): number {
  return x - seamX(s, y);
}

/** Particle budget per side for a viewport, so phones and 4K screens both stay smooth. */
export function particleBudget(w: number, h: number): number {
  return Math.round(Math.min(150, Math.max(40, (w * h) / 11000)));
}

/** Ease `cur` towards `target` with a time-constant `tau` seconds (frame-rate independent). */
export function approach(cur: number, target: number, dt: number, tau: number): number {
  return target + (cur - target) * Math.exp(-dt / tau);
}
