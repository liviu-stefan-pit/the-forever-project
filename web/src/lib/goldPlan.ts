/**
 * Gold plan (`gold-plan.json`, from `research/gold/gold-plan.json`): the big purchases on the way to 60,
 * a savings pace, and where to earn in each level bracket. Pure helpers; the UI lives in GoldPage and
 * the dashboard's gold goal.
 */
import type { ClassKey, Profile } from "../data/schema";

export interface GoldSource {
  id: string;
  url: string;
  label: string;
}

export interface GoldMilestone {
  id: string;
  level: number;
  label: string;
  /** Full price in gold. */
  gold: number;
  /** Price when Honored with the faction you buy from. */
  honoredGold?: number;
  /** Upper end of the budget when the price is a range. */
  budgetHigh?: number;
  /** Classes that get this for free (class quest). */
  freeFor?: ClassKey[];
  text: string;
  sources: string[];
}

export interface GoldPacePoint {
  level: number;
  gold: number;
  text: string;
  sources: string[];
}

export interface GoldSpot {
  name: string;
  zone: string;
  levels: [number, number];
  text: string;
}

export interface GoldBracket {
  levels: [number, number];
  /** Rough gold per hour, e.g. "8–18". */
  gph: string;
  focus: string;
  tips: string[];
  spots: GoldSpot[];
  sources: string[];
}

export interface GoldPlan {
  asOf: string;
  note: string;
  sources: GoldSource[];
  milestones: GoldMilestone[];
  pace: GoldPacePoint[];
  brackets: GoldBracket[];
  habits: { text: string; sources: string[] }[];
  avoid: { name: string; text: string }[];
  avoidSources: string[];
}

export const COPPER_PER_GOLD = 10_000;

/** Horde capital factions whose Honored standing gives the vendor discount. */
const HOME_FACTIONS = ["Orgrimmar", "Thunder Bluff", "Undercity", "Darkspear Trolls"];
/** Reputation `reaction` for Honored (1 Hated … 8 Exalted). */
const HONORED = 6;

/** Honored or better with any Horde capital faction (from the last addon sync). */
export function isHonoredHome(profile: Partial<Pick<Profile, "reputation">> | null | undefined): boolean {
  return !!profile?.reputation?.some((r) => HOME_FACTIONS.includes(r.name) && (r.reaction ?? 0) >= HONORED);
}

/** Price in gold for this character (Honored discount when known). */
export function milestonePrice(m: GoldMilestone, honored: boolean): number {
  return honored && m.honoredGold !== undefined ? m.honoredGold : m.gold;
}

type GoldProfile = Partial<Pick<Profile, "cls" | "level" | "spells" | "reputation" | "money">> | null | undefined;

/** Whether a milestone is already behind this character (free for the class, or riding already trained). */
export function milestoneDone(m: GoldMilestone, profile: GoldProfile): boolean {
  if (profile?.cls && m.freeFor?.includes(profile.cls)) return true;
  const riding = profile?.spells?.riding ?? 0;
  if (m.id === "riding40") return riding >= 75;
  if (m.id === "riding60") return riding >= 150;
  return false;
}

/**
 * The next purchase to save for. Dual spec only comes up once riding is sorted, so a level 40
 * character without a mount is pointed at the mount first.
 */
export function nextMilestone(plan: GoldPlan, profile: GoldProfile): GoldMilestone | undefined {
  const open = plan.milestones.filter((m) => !milestoneDone(m, profile));
  const level = profile?.level ?? 1;
  const riding40Open = open.some((m) => m.id === "riding40");
  const usable = open.filter((m) => !(m.id === "dualspec" && (riding40Open || level < m.level)));
  return usable.sort((a, b) => a.level - b.level)[0];
}

/**
 * Savings target in gold at a level, interpolated from 0g at level 1 through the pace points.
 * Undefined past the last pace point (after 40 the plan only tracks the next purchase).
 */
export function paceTarget(plan: GoldPlan, level: number): number | undefined {
  const pts = [{ level: 1, gold: 0 }, ...[...plan.pace].sort((a, b) => a.level - b.level)];
  const last = pts[pts.length - 1]!;
  if (level > last.level) return undefined;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    if (level <= b.level) {
      const t = (level - a.level) / (b.level - a.level);
      return Math.round((a.gold + t * (b.gold - a.gold)) * 10) / 10;
    }
  }
  return last.gold;
}

/** The bracket for a level (the later one wins on a shared edge, e.g. 30 → 30–40). */
export function bracketFor(plan: GoldPlan, level: number): GoldBracket | undefined {
  const lv = Math.max(1, Math.floor(level));
  let hit: GoldBracket | undefined;
  for (const b of plan.brackets) if (lv >= b.levels[0] && lv <= b.levels[1]) hit = b;
  return hit;
}

/** Spots in the bracket that fit the level, best fit first; falls back to the whole list. */
export function spotsNear(bracket: GoldBracket, level: number): GoldSpot[] {
  const lv = Math.floor(level);
  const fit = bracket.spots.filter((s) => lv >= s.levels[0] - 2 && lv <= s.levels[1]);
  return fit.length ? fit : bracket.spots;
}

export type PaceVerdict = "ahead" | "on" | "behind";

/** Compare saved gold to the pace target (within 15% counts as on pace). */
export function paceVerdict(haveGold: number, targetGold: number): PaceVerdict {
  if (targetGold <= 0) return "ahead";
  if (haveGold >= targetGold * 1.15) return "ahead";
  if (haveGold >= targetGold * 0.85) return "on";
  return "behind";
}

export function sourcesFor(plan: GoldPlan, ids: readonly string[]): GoldSource[] {
  return ids.map((id) => plan.sources.find((s) => s.id === id)).filter((s): s is GoldSource => !!s);
}

/** "1,080g" / "1,080–1,200g". */
export function fmtGold(g: number, high?: number): string {
  const f = (n: number) => `${n.toLocaleString("en-US")}`;
  return high !== undefined && high !== g ? `${f(g)}–${f(high)}g` : `${f(g)}g`;
}
