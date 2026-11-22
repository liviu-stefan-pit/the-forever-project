/**
 * Action → chip description (pure). `ActionChips.tsx` renders these.
 * Every `ActionType` maps to a chip, except `goto`, which is summarised separately
 * (visible waypoints get a `/way` copy chip, hidden path waypoints are only counted).
 */
import type { Action, MapPoint, Step } from "../data/schema";
import type { IconName } from "../components/ui/Icon";

export type ChipTone = "quest" | "turnin" | "complete" | "loot" | "travel" | "teal" | "gold" | "enemy" | "friendly" | "muted";

export interface ChipSpec {
  key: string;
  icon: IconName;
  verb: string;
  text?: string;
  tone: ChipTone;
  /** Internal route (e.g. `/quest/788`). */
  to?: string;
  /** External URL (new tab). */
  href?: string;
  /** Secondary chips (targets, mobs, item use) render smaller. */
  secondary?: boolean;
  title?: string;
  filter?: Action["filter"];
  /** Objective progress from a known quest log, e.g. "3/10". */
  count?: string;
  /** Soft warning (level). Does not hide the chip. */
  warn?: string;
  /** Struck quest the character can no longer take. Display only. */
  unavailable?: "Breadcrumb" | "Unavailable";
  /** Compact suffix, e.g. "+840 XP" on a turn-in chip. */
  badge?: string;
}

export type QuestNameLookup = (questId: number) => string | undefined;

const stripVerb = (label: string, verbs: RegExp) => label.replace(verbs, "").trim() || label;

export function actionChip(a: Action, i: number, questName: QuestNameLookup = () => undefined): ChipSpec | null {
  const key = `${a.type}-${i}`;
  const base = { key, filter: a.filter };
  switch (a.type) {
    case "goto":
      return null;
    case "accept":
      return { ...base, icon: "exclaim", verb: "Accept", text: questName(a.questId) ?? stripVerb(a.label, /^accept\s+/i), tone: "quest", to: `/quest/${a.questId}` };
    case "turnin":
      return { ...base, icon: "question", verb: "Turn in", text: questName(a.questId) ?? stripVerb(a.label, /^turn\s*in\s+/i), tone: "turnin", to: `/quest/${a.questId}` };
    case "complete": {
      const q = questName(a.questId);
      return { ...base, icon: "sword", verb: "Complete", text: a.label, tone: "complete", to: `/quest/${a.questId}`, title: q ? `${q} — objective ${a.objective}` : `Quest ${a.questId}` };
    }
    case "collect":
      return {
        ...base,
        icon: "bag",
        verb: "Collect",
        text: a.label,
        tone: "loot",
        ...(a.questId ? { to: `/quest/${a.questId}`, title: questName(a.questId) ?? `Quest ${a.questId}` } : {}),
      };
    case "train":
      return { ...base, icon: "book", verb: "Train", text: stripVerb(a.label, /^train\s+/i), tone: "teal" };
    case "fly":
      return { ...base, icon: "feather", verb: "Fly", text: a.place ?? stripVerb(a.label, /^fly\s+to\s+/i), tone: "travel", title: a.label };
    case "fp":
      return { ...base, icon: "flag", verb: "Flight path", text: a.place ?? a.label, tone: "travel", title: a.label };
    case "home":
      return { ...base, icon: "home", verb: "Bind hearth", text: a.place ?? a.label, tone: "gold", title: a.label };
    case "hs":
      return { ...base, icon: "home", verb: "Hearth", text: a.place ?? a.label, tone: "gold", title: a.label };
    case "zone":
    case "subzone":
      return { ...base, icon: "arrowRight", verb: "Travel", text: a.place ?? a.label, tone: "muted", title: a.label };
    case "deathskip":
      return { ...base, icon: "skull", verb: "Death skip", text: a.place, tone: "muted", title: a.label };
    case "vendor":
      return { ...base, icon: "coins", verb: "Vendor", text: a.place ?? a.label, tone: "gold", title: a.label };
    case "trainer":
      return { ...base, icon: "book", verb: "Trainer", text: a.place ?? a.label, tone: "teal", title: a.label };
    case "xp":
      return { ...base, icon: "star", verb: "XP", text: a.extra ? `Level ${a.level} + ${a.extra}` : `Level ${a.level}`, tone: "gold", title: a.label };
    case "mob":
      return { ...base, icon: "sword", verb: "Kill", text: a.name, tone: "enemy", secondary: true };
    case "target":
      return { ...base, icon: "user", verb: "Target", text: a.name, tone: "friendly", secondary: true };
    case "unitscan":
      return { ...base, icon: "crosshair", verb: "Scan", text: a.name, tone: "enemy", secondary: true };
    case "use":
      return { ...base, icon: "zap", verb: "Use", text: a.label ?? `item ${a.itemId}`, tone: "muted", secondary: true };
    case "equip":
      return { ...base, icon: "shield", verb: "Equip", text: a.label ?? `item ${a.itemId}`, tone: "muted", secondary: true };
    case "destroy":
      return { ...base, icon: "trash", verb: "Destroy", text: a.label ?? `item ${a.itemId}`, tone: "muted", secondary: true };
    case "link":
      return { ...base, icon: "link", verb: "Link", text: a.label, tone: "teal", href: a.url, secondary: true };
    case "other":
      return { ...base, icon: "terminal", verb: `.${a.cmd}`, text: a.args, tone: "muted", secondary: true };
  }
}

/** `/way <zone> x y` (TomTom). `undefined` for placeholder (0,0) coordinates. */
export function wayCommand(p: MapPoint): string | undefined {
  if (p.x === 0 && p.y === 0) return undefined;
  return `/way ${p.zone} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

export interface GotoSummary {
  /** Visible waypoints (with real coordinates). */
  points: { key: string; at: MapPoint; filter?: Action["filter"]; way: string }[];
  /** Hidden path waypoints (radius -1 / trailing ,0). */
  hiddenCount: number;
}

export function gotoSummary(actions: readonly Action[]): GotoSummary {
  const points: GotoSummary["points"] = [];
  let hiddenCount = 0;
  actions.forEach((a, i) => {
    if (a.type !== "goto") return;
    if (a.hidden) {
      hiddenCount++;
      return;
    }
    const way = wayCommand(a.at);
    if (way) points.push({ key: `goto-${i}`, at: a.at, filter: a.filter, way });
  });
  return { points, hiddenCount };
}

/** Quest ids a step touches (actions, conditions, bonus), first-seen order. */
export function stepQuestIds(step: Step): number[] {
  const ids: number[] = [];
  const add = (id: number | undefined) => {
    if (id !== undefined && !ids.includes(id)) ids.push(id);
  };
  for (const a of step.actions) {
    if (a.type === "accept" || a.type === "turnin" || a.type === "complete") add(a.questId);
    else if (a.type === "collect") add(a.questId);
  }
  step.bonus?.questIds.forEach(add);
  return ids;
}
