/**
 * Split a class profession `reason` into race/spec blocks and a shared tail.
 * The sentences stay as written. This only decides where each one sits.
 */
import type { Role } from "../data/schema";

const RACES = ["Skyborne", "Undead", "Tauren", "Troll", "Orc"] as const;

/** Trailing advice that belongs with every race, not with the spec it was glued onto. */
const SHARED_START = /^(Do not\b|Don't\b|Buy\b|Take\b|Train\b|Skip\b|First Aid\b|Potions\b)/i;

const ROLE_SPECS: Record<Role, readonly string[]> = {
  healer: ["restoration", "holy", "discipline", "healer"],
  tank: ["tank", "protection"],
  dps: [
    "dps",
    "enhancement",
    "elemental",
    "shadow",
    "frost",
    "fire",
    "arcane",
    "affliction",
    "demonology",
    "combat",
    "arms",
    "fury",
    "balance",
    "beast",
    "marksmanship",
    "survival",
    "assassination",
    "subtlety",
    "retribution",
    "feral",
  ],
};

export interface ProfessionSentence {
  text: string;
  /** Questie ids, race bits, and class-number proofs. Hidden under "Source note". */
  sourceNote: boolean;
}

export interface RaceBlock {
  race: string;
  /** Words after the race, e.g. "enhancement" or "holy/discipline". */
  spec: string;
  skipped: boolean;
  sentences: ProfessionSentence[];
}

export interface ProfessionNotes {
  blocks: RaceBlock[];
  tail: ProfessionSentence[];
}

export interface RaceGroup {
  race: string;
  /** Specs to show open: the player's role, plus any spec we cannot classify. */
  shown: RaceBlock[];
  /** Specs for a different role. Empty when no role is set. */
  other: RaceBlock[];
}

export interface ArrangedProfessionNotes {
  /** Player's race, or every race when the profile has none. */
  open: RaceGroup[];
  /** Other races. Empty when the profile has no race. */
  others: RaceGroup[];
  tail: ProfessionSentence[];
  focused: boolean;
}

function norm(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase().replace(/\.+$/, "");
}

function splitSentences(text: string): string[] {
  return text
    .trim()
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isSourceNote(text: string): boolean {
  return /Questie|race bit|\bclass\s+\d+\b/i.test(text);
}

function toSentence(text: string, skipped: boolean): ProfessionSentence {
  return { text, sourceNote: !skipped && isSourceNote(text) };
}

function coveredBySecondary(sentence: string, reasons: readonly string[]): boolean {
  const n = norm(sentence);
  if (n.length < 12) return false;
  return reasons.some((reason) => {
    const r = norm(reason);
    return r.length > 0 && (r.includes(n) || n.includes(r));
  });
}

interface Hit {
  index: number;
  race: string;
  spec: string;
  skipped: boolean;
  contentStart: number;
}

function findHits(text: string): Hit[] {
  const re = new RegExp(`(?:^|(?<=\\.\\s))(${RACES.join("|")})\\s+`, "g");
  const hits: Hit[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const race = match[1];
    const after = text.slice(match.index + match[0].length);
    if (/^is skipped\b/i.test(after)) {
      const rest = after.slice("is skipped".length).replace(/^\.?\s*/, "");
      hits.push({
        index: match.index,
        race,
        spec: "skipped",
        skipped: true,
        contentStart: text.length - rest.length,
      });
      continue;
    }
    const colon = after.indexOf(":");
    const period = after.indexOf(".");
    const spec = colon === -1 ? "" : after.slice(0, colon).trim();
    if (colon === -1 || (period !== -1 && period < colon) || spec.length === 0 || spec.length > 48) {
      re.lastIndex = match.index + 1;
      continue;
    }
    let contentStart = match.index + match[0].length + colon + 1;
    if (text[contentStart] === " ") contentStart += 1;
    hits.push({
      index: match.index,
      race,
      spec,
      skipped: /^skipped$/i.test(spec),
      contentStart,
    });
  }
  return hits;
}

/** Move a trailing run of shared rules off a race block. */
function peelShared(sentences: string[], secondary: readonly string[], race: string, skipped: boolean): { keep: string[]; tail: string[] } {
  const raceRe = new RegExp(`\\b${race}\\b`, "i");
  let cut = sentences.length;
  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i];
    const shared = coveredBySecondary(sentence, secondary) || SHARED_START.test(sentence);
    if (shared && !raceRe.test(sentence)) cut = i;
    else break;
  }
  if (cut === 0 && sentences.length > 0 && !skipped) cut = 1;
  return { keep: sentences.slice(0, cut), tail: sentences.slice(cut) };
}

export function parseProfessionReason(reason: string, secondaryReasons: readonly string[] = []): ProfessionNotes {
  const hits = findHits(reason);
  if (hits.length === 0) {
    const tail = splitSentences(reason).filter((s) => !coveredBySecondary(s, secondaryReasons));
    return { blocks: [], tail: tail.map((text) => toSentence(text, false)) };
  }

  const blocks: RaceBlock[] = [];
  const tail: string[] = [];
  hits.forEach((hit, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].index : reason.length;
    const sentences = splitSentences(reason.slice(hit.contentStart, end));
    const peeled = peelShared(sentences, secondaryReasons, hit.race, hit.skipped);
    blocks.push({
      race: hit.race,
      spec: hit.spec,
      skipped: hit.skipped,
      sentences: peeled.keep.map((text) => toSentence(text, hit.skipped)),
    });
    tail.push(...peeled.tail);
  });

  const seen = new Set<string>();
  const shared: ProfessionSentence[] = [];
  for (const sentence of tail) {
    if (coveredBySecondary(sentence, secondaryReasons)) continue;
    const key = norm(sentence);
    if (seen.has(key)) continue;
    seen.add(key);
    shared.push(toSentence(sentence, false));
  }
  return { blocks, tail: shared };
}

function specRelation(spec: string, role: Role): "match" | "other" | "open" {
  const label = spec.toLowerCase();
  if (label === "skipped") return "open";
  const known = Object.values(ROLE_SPECS).flat();
  if (!known.some((key) => label.includes(key))) return "open";
  return ROLE_SPECS[role].some((key) => label.includes(key)) ? "match" : "other";
}

function groupRace(blocks: RaceBlock[], role?: Role): RaceGroup[] {
  const order: string[] = [];
  const map = new Map<string, RaceBlock[]>();
  for (const block of blocks) {
    if (!map.has(block.race)) {
      map.set(block.race, []);
      order.push(block.race);
    }
    map.get(block.race)!.push(block);
  }
  return order.map((race) => {
    const specs = map.get(race)!;
    if (!role) return { race, shown: specs, other: [] };
    const shown: RaceBlock[] = [];
    const other: RaceBlock[] = [];
    for (const block of specs) {
      if (block.skipped || specRelation(block.spec, role) !== "other") shown.push(block);
      else other.push(block);
    }
    const rank = (block: RaceBlock) => (block.skipped ? 2 : specRelation(block.spec, role) === "match" ? 0 : 1);
    shown.sort((a, b) => rank(a) - rank(b));
    return { race, shown, other };
  });
}

export function arrangeProfessionNotes(notes: ProfessionNotes, race?: string, role?: Role): ArrangedProfessionNotes {
  if (!race) {
    return { open: groupRace(notes.blocks, role), others: [], tail: notes.tail, focused: false };
  }
  const mine = notes.blocks.filter((block) => block.race.toLowerCase() === race.toLowerCase());
  const rest = notes.blocks.filter((block) => block.race.toLowerCase() !== race.toLowerCase());
  return { open: groupRace(mine, role), others: groupRace(rest, role), tail: notes.tail, focused: true };
}

/** A capital S/A/B/C/D/F used as a list score, not the word "A" starting a sentence. */
export function hasLetterScore(sentences: readonly string[]): boolean {
  return sentences.some((sentence) => {
    const rest = sentence.replace(/^\s*\S+\s*/, "");
    return /\b[SABCDF]\b/.test(rest);
  });
}

export function specTitle(spec: string): string {
  if (spec.toLowerCase() === "dps") return "DPS";
  return spec.replace(/[A-Za-z]+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
