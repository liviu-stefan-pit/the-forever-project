/**
 * Build-time how-to lines for generic "Complete {Quest}" / "Collect {Quest}" steps.
 * Appends one sentence per quest objective onto step text. Does not touch tips.
 */
import type { QuestInfo, Step } from "../../contracts/schema.ts";

type Objective = QuestInfo["objectives"][number];

/** One decimal, matching guide pins (`51.52` → `51.5`). */
export function formatCoord(x: number, y: number): string {
  const n = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
  return `${n(x)}, ${n(y)}`;
}

function coordOf(obj: Objective): string | undefined {
  const p = obj.at.find((a) => Number.isFinite(a.x) && Number.isFinite(a.y) && a.x >= 0 && a.y >= 0);
  return p ? formatCoord(p.x, p.y) : undefined;
}

function withCoord(name: string, obj: Objective): string {
  const c = coordOf(obj);
  return c ? `${name} (${c})` : name;
}

function countPrefix(count: number | undefined): string {
  return count != null && count > 1 ? `${count} ` : "";
}

/** One short sentence for a single objective. Empty when the objective has no usable name. */
export function objectiveSentence(obj: Objective): string {
  const name = obj.name?.trim();
  if (!name) return "";
  const n = countPrefix(obj.count);
  if (obj.kind === "kill" || obj.kind === "killcredit") {
    return `Kill ${n}${withCoord(name, obj)}`;
  }
  if (obj.kind === "item") {
    const drops = (obj.drops ?? []).filter((d) => d.name?.trim());
    if (drops.length === 1) {
      const who = drops[0]!.name.trim();
      return `Kill ${withCoord(who, obj)} and loot ${n}${name}`;
    }
    if (drops.length > 1) {
      const who = drops.map((d) => d.name.trim()).join(", ");
      return `Collect ${n}${name} from ${who}`;
    }
    return `Collect ${n}${withCoord(name, obj)}`;
  }
  if (obj.kind === "object") return `Use ${n}${withCoord(name, obj)}`;
  if (obj.kind === "rep") return `Gain reputation with ${name}`;
  if (obj.kind === "spell") return `Cast ${name}`;
  return withCoord(name, obj);
}

/**
 * Joined how-to for a quest. Kill lines already covered by a single-NPC item drop are omitted
 * so "Kill Ivar and loot Ivar's Head" is not repeated as a second kill sentence.
 */
export function howToSentence(objectives: readonly Objective[]): string | undefined {
  const usedKill = new Set<string>();
  for (const obj of objectives) {
    if (obj.kind === "item" && obj.drops?.length === 1 && obj.drops[0]?.name) {
      usedKill.add(obj.drops[0].name.trim().toLowerCase());
    }
  }
  const parts: string[] = [];
  for (const obj of objectives) {
    if ((obj.kind === "kill" || obj.kind === "killcredit") && usedKill.has(obj.name.trim().toLowerCase())) continue;
    const s = objectiveSentence(obj);
    if (s) parts.push(s);
  }
  if (!parts.length) return undefined;
  return parts.join(". ");
}

function plainText(step: Step): string {
  return step.text.map((line) => line.segments.map((s) => s.t).join("")).join("\n").trim();
}

/** True when the step is only "Complete {name}" or "Collect {name}" for this quest. */
export function isGenericQuestStep(step: Step, questName: string): boolean {
  const plain = plainText(step).replace(/\s+/g, " ").trim();
  const m = /^(?:Complete|Collect)\s+(.+?)\s*[.!]?\s*$/i.exec(plain);
  if (!m) return false;
  return m[1]!.replace(/[.!]+$/, "").trim().toLowerCase() === questName.trim().toLowerCase();
}

function questIdOf(action: Step["actions"][number]): number | undefined {
  if ((action.type === "complete" || action.type === "collect") && typeof action.questId === "number") return action.questId;
  return undefined;
}

/**
 * Append a how-to line onto generic complete/collect steps. Mutates `steps` text only.
 * Returns how many steps gained a line.
 */
export function enrichCompleteSteps(steps: Step[], quests: readonly QuestInfo[]): number {
  const byId = new Map(quests.map((q) => [q.id, q]));
  let added = 0;
  for (const step of steps) {
    const seen = new Set<number>();
    const lines: string[] = [];
    for (const action of step.actions) {
      const id = questIdOf(action);
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      const quest = byId.get(id);
      if (!quest || !isGenericQuestStep(step, quest.name)) continue;
      const sentence = howToSentence(quest.objectives);
      if (!sentence) continue;
      if (plainText(step).includes(sentence)) continue;
      lines.push(sentence);
    }
    if (!lines.length) continue;
    const text = lines.join(". ");
    step.text = [...step.text, { segments: [{ t: text }] }];
    added++;
  }
  return added;
}
