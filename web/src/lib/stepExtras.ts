/**
 * What a step card shows from route schema v2 (DESIGN.md §3): the best tip for the character,
 * elite tactics, profession hooks, the dungeon badge and route membership. Filtering uses the
 * engine's own `tipApplies` / `hookApplies` / `stepRoutes`, never a second rule set.
 */
import type { ClassKey, EliteTactic, GuidePlaytest, ProfessionHook, ProfessionKey, Profile, Role, RouteStyle, Step, Tip } from "../data/schema";
import type { QuestLookup } from "../state/questAvailability";
import { stepRoutes } from "../state/visibility";
import { hookApplies, tipApplies } from "./resolveRoute";

export interface TipContext {
  route: RouteStyle;
  dungeons: boolean;
  cls?: ClassKey;
  role?: Role;
  professions?: ProfessionKey[];
  /** Synced skill ranks. Omitted or missing a profession keeps the hook text unchanged. */
  skills?: Partial<Record<ProfessionKey, { cur: number; max: number }>>;
  /** Active profile, for live chip notes. */
  profile?: Profile | null;
  quests?: QuestLookup;
  /** Current guide contains at least one speedrun (or unrestricted) step. */
  guideHasSpeedrun?: boolean;
  /** Set when the current guide is play-tested: steps the run did not cover get an "Unconfirmed" label. */
  playtested?: GuidePlaytest;
}

/** Specificity: class + role beats class beats role beats everyone. */
function score(t: Tip): number {
  return (t.classes?.length ? 2 : 0) + (t.roles?.length ? 1 : 0);
}

export interface CardTips {
  /** One general/speed tip, the best match for the character. */
  tip?: Tip;
  /** Elite-kind tips plus tips from `elite[]` tactics, with the tactic name. */
  elite: { name?: string; groupSize?: number; level?: number; tip?: Tip }[];
  /** Profession hooks for the character's professions (all when none are set). */
  hooks: ProfessionHook[];
  /** Best role advice for the chosen role (only when a role is picked). */
  advice?: Tip;
  /** Profession-kind tips (free text). */
  professionTips: Tip[];
}

function tipCacheKey(step: Step, ctx: TipContext): string {
  return `${step.id}\0${ctx.route}\0${ctx.dungeons ? "1" : "0"}\0${ctx.cls ?? ""}\0${ctx.role ?? ""}\0${(ctx.professions ?? []).join(",")}\0${ctx.guideHasSpeedrun ? "1" : "0"}`;
}

const cardTipsCache = new Map<string, CardTips>();

export function cardTips(step: Step, ctx: TipContext): CardTips {
  const key = tipCacheKey(step, ctx);
  const hit = cardTipsCache.get(key);
  if (hit) return hit;
  const applies = (t: Tip) => tipApplies(t, ctx);
  const tips = (step.tips ?? []).filter(applies);
  const main = tips
    .filter((t) => t.kind === "general" || t.kind === "speed")
    .sort((a, b) => score(b) - score(a) || (a.kind === "speed" && ctx.route === "speedrun" ? -1 : 0))[0];
  const elite: CardTips["elite"] = tips.filter((t) => t.kind === "elite").map((tip) => ({ tip }));
  for (const e of step.elite ?? ([] as EliteTactic[])) {
    const best = e.tips.filter(applies).sort((a, b) => score(b) - score(a))[0];
    elite.push({ name: e.name, groupSize: e.groupSize, level: e.level, tip: best });
  }
  const hooks = (step.professionHooks ?? []).filter((h) => hookApplies(h, ctx.professions));
  const advice = ctx.role
    ? tips.filter((t) => t.kind === "advice" && t.roles?.includes(ctx.role!)).sort((a, b) => score(b) - score(a))[0]
    : undefined;
  const result: CardTips = { tip: main, advice, elite, hooks, professionTips: tips.filter((t) => t.kind === "profession") };
  cardTipsCache.set(key, result);
  return result;
}

/**
 * Profession notes for step cards. Only for professions the character has (picked on the Profile page,
 * or synced from the game). With none known they stay in the Professions panel, not on every card.
 */
export function cardHooks(step: Step, ctx: TipContext): ProfessionHook[] {
  const known = ctx.professions?.length ? ctx.professions : (Object.keys(ctx.skills ?? {}) as ProfessionKey[]);
  if (!known.length) return [];
  return (step.professionHooks ?? []).filter((h) => known.includes(h.profession));
}

export type SkillRanks = Partial<Record<ProfessionKey, { cur: number; max: number }>>;

function skillRank(h: ProfessionHook, skills?: SkillRanks): { cur: number; max: number } | undefined {
  if (!skills || h.skillTarget == null) return undefined;
  return skills[h.profession];
}

/** True when a synced rank has reached this hook's skill target. Missing skills are not done. */
export function hookReached(h: ProfessionHook, skills?: SkillRanks): boolean {
  const s = skillRank(h, skills);
  return !!s && h.skillTarget != null && s.cur >= h.skillTarget;
}

/** Shortfall warning. Absent when the profession was not synced or the target is already met. */
export function hookSkillWarning(h: ProfessionHook, skills?: SkillRanks): string | undefined {
  const s = skillRank(h, skills);
  if (!s || h.skillTarget == null || h.skillTarget <= s.cur) return undefined;
  return `needs ${h.profession} ${h.skillTarget} (you have ${s.cur})`;
}

/** One-line profession hint text: note, plus item/qty, skill target, and synced rank when present. */
export function hookText(h: ProfessionHook, skills?: SkillRanks): string {
  const bits = [h.note];
  if (h.itemName && !h.note.includes(h.itemName)) bits.push(`${h.qty ? `${h.qty}× ` : ""}${h.itemName}`);
  if (h.skillTarget) bits.push(`to ${h.skillTarget}`);
  const s = skillRank(h, skills);
  if (s && h.skillTarget != null) bits.push(`you are ${s.cur}/${h.skillTarget}`);
  return bits.filter(Boolean).join(" · ");
}

export type RouteMembership = "both" | "balanced" | "speedrun";

export function routeMembership(step: Step): RouteMembership {
  const r = stepRoutes(step);
  const b = r.includes("balanced");
  const s = r.includes("speedrun");
  return b && s ? "both" : b ? "balanced" : "speedrun";
}

/** True when this guide has any step that appears on the speedrun route (explicit or unrestricted). */
export function guideOffersSpeedrun(steps: readonly Step[]): boolean {
  return steps.some((s) => routeMembership(s) !== "balanced");
}

/** Step needs a check: explicitly unverified, or authored with sources but not verified. */
export function isUnverified(step: Step): boolean {
  return step.verified === false || (step.sources !== undefined && step.verified !== true);
}
