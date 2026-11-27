import type { Action, RichText } from "../data/schema";
import { linePlainText } from "./richtext";

export type Goto = Extract<Action, { type: "goto" }>;
export type QuestAction = Extract<Action, { type: "accept" | "turnin" | "complete" | "collect" }>;

/** A quest action whose label the line's own text names; the renderer highlights it in place. */
export interface LineMark {
  label: string;
  action: QuestAction;
}

export interface CardLine {
  line: RichText;
  /** "Rorian the Dayseeker" from "Rorian the Dayseeker: turn in …", shown bold. The line no longer holds it. */
  place?: string;
  /** Waypoints that belong to this line, in route order. */
  ways: Goto[];
  marks: LineMark[];
  /** Objectives done at this line's waypoint that the text doesn't name. Shown only when the log has a count. */
  trailing: QuestAction[];
}

export interface CardModel {
  lines: CardLine[];
  /** Actions the text doesn't cover (trainer, hearth, an accept the text never names): small chips under the lines. */
  extra: Action[];
}

/** Whole-word test on lower-cased text. */
const word = (w: string) => new RegExp(`(?<![a-z])(${w})(?![a-z])`);

/** Non-quest actions the text can already say in words; their chip is dropped when a line does. */
const SAID: Partial<Record<Action["type"], RegExp>> = {
  trainer: word("train[a-z]*"),
  train: word("train[a-z]*"),
  fly: word("fly|flight"),
  fp: word("flight path|flight master|fp"),
  hs: word("hearth[a-z]*"),
  home: word("hearth[a-z]*|bind|inn"),
  vendor: word("buy|sell|vendor|repair"),
};

const PLACE = /^\s*([^:.!?]{2,40}?):\s+(\S.*)$/s;

function isQuestAction(a: Action): a is QuestAction {
  return (a.type === "accept" || a.type === "turnin" || a.type === "complete" || a.type === "collect") && !!a.label;
}

/** Splits the "Place:" prefix off the first segment, unless a quest name starts inside it ("Accept WANTED: Vulgara"). */
function splitPlace(line: RichText, labels: readonly string[]): { place: string; line: RichText } | null {
  const first = line.segments[0];
  if (!first || first.kind === "link" || first.kind === "icon") return null;
  const m = PLACE.exec(first.t);
  if (!m) return null;
  const rest: RichText = { ...line, segments: [{ ...first, t: m[2]! }, ...line.segments.slice(1)] };
  // Every quest the line names must still be there after the prefix ("Aetheen of the Gales: turn in Aetheen of the Gales" is fine).
  const restText = linePlainText(rest).toLowerCase();
  if (labels.some((l) => !restText.includes(l.toLowerCase()))) return null;
  return { place: m[1]!.trim(), line: rest };
}

/**
 * Lays a step out as its own lines. Each waypoint goes on the line that names the most of the quests or
 * objectives done there; a step with one waypoint puts it on its first line; anything left goes on the
 * last line. Quest names the text already says are highlighted in place instead of repeated as chips.
 */
export function stepLines(lines: readonly RichText[], actions: readonly Action[]): CardModel {
  const texts = lines.map((l) => linePlainText(l).toLowerCase());
  const lineOf = (label: string) => texts.findIndex((t) => t.includes(label.toLowerCase()));

  const groups: { goto?: Goto; actions: Action[] }[] = [{ actions: [] }];
  for (const a of actions) {
    if (a.type === "goto") {
      if (!a.hidden) groups.push({ goto: a, actions: [] });
    } else groups[groups.length - 1]!.actions.push(a);
  }
  const gotoCount = groups.length - 1;

  const out: CardLine[] = lines.map((line) => ({ line, ways: [], marks: [], trailing: [] }));
  if (out.length === 0 && gotoCount > 0) out.push({ line: { segments: [] }, ways: [], marks: [], trailing: [] });
  const extra: Action[] = [];

  let cursor = 0;
  for (const g of groups) {
    const quest = g.actions.filter(isQuestAction);
    // The line that names the most of this waypoint's quests; on a tie, the first one at or after the previous waypoint's line.
    let home = -1;
    let best = 0;
    texts.forEach((t, i) => {
      const score = quest.filter((a) => t.includes(a.label.toLowerCase())).length;
      if (score > best || (score === best && score > 0 && home < cursor && i >= cursor)) {
        best = score;
        home = i;
      }
    });
    const unnamed: QuestAction[] = [];
    for (const a of g.actions) {
      if (!isQuestAction(a)) {
        const said = SAID[a.type];
        if (!(said && texts.some((t) => said.test(t)))) extra.push(a);
        continue;
      }
      const i = home >= 0 && texts[home]!.includes(a.label.toLowerCase()) ? home : lineOf(a.label);
      if (i >= 0) out[i]!.marks.push({ label: a.label, action: a });
      else if (a.type === "complete" || a.type === "collect") unnamed.push(a);
      else extra.push(a);
    }
    if (home >= 0) cursor = home;
    if (!g.goto) {
      if (out.length) out[home >= 0 ? home : 0]!.trailing.push(...unnamed);
      continue;
    }
    if (home < 0) home = gotoCount === 1 ? firstMarkedLine(out) : out.length - 1;
    out[home]!.ways.push(g.goto);
    out[home]!.trailing.push(...unnamed);
  }

  for (const l of out) {
    const split = splitPlace(l.line, l.marks.map((m) => m.label));
    if (split) {
      l.place = split.place;
      l.line = split.line;
    }
  }
  return { lines: out, extra };
}

function firstMarkedLine(lines: readonly CardLine[]): number {
  const i = lines.findIndex((l) => l.marks.length > 0);
  return i >= 0 ? i : 0;
}
