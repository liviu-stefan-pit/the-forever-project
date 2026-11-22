import type { ClassKey, RaceKey } from "../data/schema";

/** A profession or secondary skill from the addon. */
export interface GameProfession {
  name: string;
  rank: number;
  max: number;
  kind: "primary" | "secondary";
}

export interface GameGearItem {
  /** Inventory slot id (1 head ... 19 tabard). */
  slot: number;
  slotName?: string;
  itemId: number;
  name?: string;
}

export interface GameQuestObjective {
  text?: string;
  done?: number;
  total?: number;
  numFulfilled?: number;
  numRequired?: number;
  finished: boolean;
}

export interface GameQuestLogEntry {
  id: number;
  title?: string;
  level?: number;
  /** Ready to turn in. */
  complete: boolean;
  failed?: boolean;
  objectives: GameQuestObjective[];
}

/** Any skill line the addon exported (professions, weapons, languages, ...). */
export interface GameSkill {
  name: string;
  rank: number;
  max: number;
  kind: "primary" | "secondary" | "riding" | "weapon" | "other";
  skillID?: number;
  modifier?: number;
  temp?: number;
  categoryID?: number;
  header?: string;
}

/** GetProfessionInfo row (cross-check for the skill list). */
export interface GameProfessionInfo {
  skillLine: number;
  name?: string;
  rank: number;
  max: number;
  modifier?: number;
  specIndex?: number;
}

export interface GameTaxiNode {
  id: number;
  name: string;
  mapId?: number;
}

/** Character snapshot extracted from `GuideWebExportDB` (no Lua execution). */
export interface GameExportCharacter {
  key: string;
  /** Full display name ("First Surname" on Forever). Legacy exports store the first name only. */
  name?: string;
  firstName?: string;
  surname?: string;
  guid?: string;
  race?: RaceKey;
  cls?: ClassKey;
  level?: number;
  /** Character snapshot time, unix seconds, when the export recorded one. */
  exportedAt?: number;
  completedQuests: number[];
  // ---- schema 2 (all optional: old exports have none of these) ----
  /** Character snapshot schema; undefined for the original (v1) export. */
  schemaVersion?: number;
  realm?: string;
  faction?: string;
  xp?: number;
  xpMax?: number;
  xpRested?: number;
  /** Copper. */
  money?: number;
  skills?: GameSkill[];
  /** GetProfessionInfo rows, when the addon sent them. */
  professions?: GameProfessionInfo[];
  gear?: GameGearItem[];
  questLog?: GameQuestLogEntry[];
  /** v4 area flags. Missing means unknown, not empty. */
  questLogOk?: boolean;
  skillsOk?: boolean;
  taxiOk?: boolean;
  bindOk?: boolean;
  bagsOk?: boolean;
  reputationOk?: boolean;
  spellsOk?: boolean;
  durabilityOk?: boolean;
  positionOk?: boolean;
  petOk?: boolean;
  taxi?: GameTaxiNode[];
  bind?: string;
  bags?: Record<number, number>;
  xpPercent?: number;
  restState?: number;
  position?: { mapId?: number; zone?: string; subzone?: string; x?: number; y?: number };
  reputation?: { factionID: number; name: string; reaction?: number; current?: number; min?: number; max?: number; isHeader?: boolean; atWar?: boolean }[];
  spells?: { riding?: number; mount?: boolean; known?: number[] };
  durability?: { pct?: number; lowestSlot?: number };
  pet?: { family?: string; level?: number; name?: string };
  deadOrGhost?: boolean;
}

export interface GameExport {
  lastCharacter?: string;
  /** DB snapshot time, unix seconds. */
  exportedAt?: number;
  /** DB-level character schema version (2+), when present. */
  schemaVersion?: number;
  characters: GameExportCharacter[];
}

const CLASS_TOKEN: Record<string, ClassKey> = {
  WARRIOR: "Warrior",
  HUNTER: "Hunter",
  ROGUE: "Rogue",
  PRIEST: "Priest",
  SHAMAN: "Shaman",
  MAGE: "Mage",
  WARLOCK: "Warlock",
  DRUID: "Druid",
  PALADIN: "Paladin",
};

const RACE_ALIAS: Record<string, RaceKey> = {
  Orc: "Orc",
  Troll: "Troll",
  Tauren: "Tauren",
  Undead: "Undead",
  Scourge: "Undead",
  Skyborne: "Skyborne",
};

function mapRace(race?: unknown, raceName?: unknown): RaceKey | undefined {
  const a = typeof raceName === "string" ? RACE_ALIAS[raceName] : undefined;
  if (a) return a;
  const b = typeof race === "string" ? RACE_ALIAS[race] : undefined;
  if (b) return b;
  return undefined;
}

function mapClass(cls?: unknown, className?: unknown): ClassKey | undefined {
  const titles = Object.values(CLASS_TOKEN);
  if (typeof className === "string" && (titles as string[]).includes(className)) return className as ClassKey;
  if (typeof cls === "string") {
    const tok = CLASS_TOKEN[cls.toUpperCase()];
    if (tok) return tok;
  }
  return undefined;
}

function completedIds(v: unknown): number[] {
  // A list is an array of quest ids. GetQuestsCompleted is {[questId]=true}, so the ids are the keys.
  const list = Array.isArray(v)
    ? v
    : v && typeof v === "object"
      ? Object.keys(v).filter((k) => /^(?:0|[1-9]\d*)$/.test(k))
      : [];
  const ids: number[] = [];
  for (const x of list) {
    const n = typeof x === "number" ? x : Number(x);
    if (Number.isFinite(n) && !ids.includes(n)) ids.push(n);
  }
  return ids;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v !== "" ? v : undefined;
}

/** A Lua list arrives as an array, or as an object for `{}` / sparse tables. */
function list(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") return Object.values(v);
  return [];
}

function skills(v: unknown): GameSkill[] | undefined {
  if (v === undefined) return undefined;
  const out: GameSkill[] = [];
  for (const raw of list(v)) {
    const r = asRecord(raw);
    const name = str(r.name);
    const rank = num(r.rank);
    const max = num(r.max);
    if (!name || rank === undefined || max === undefined) continue;
    const kind =
      r.kind === "primary" || r.kind === "secondary" || r.kind === "riding" || r.kind === "weapon" || r.kind === "other"
        ? r.kind
        : "other";
    const skill: GameSkill = { name, rank, max, kind };
    if (str(r.header)) skill.header = str(r.header);
    if (num(r.skillID) !== undefined) skill.skillID = num(r.skillID);
    if (num(r.modifier) !== undefined) skill.modifier = num(r.modifier);
    if (num(r.temp) !== undefined) skill.temp = num(r.temp);
    if (num(r.categoryID) !== undefined) skill.categoryID = num(r.categoryID);
    out.push(skill);
  }
  return out;
}

function gear(v: unknown): GameGearItem[] | undefined {
  if (v === undefined) return undefined;
  const out: GameGearItem[] = [];
  for (const raw of list(v)) {
    const r = asRecord(raw);
    const slot = num(r.slot);
    const itemId = num(r.itemId);
    if (slot === undefined || itemId === undefined || itemId <= 0) continue;
    const item: GameGearItem = { slot, itemId };
    if (str(r.slotName)) item.slotName = str(r.slotName);
    if (str(r.name)) item.name = str(r.name);
    out.push(item);
  }
  return out.sort((a, b) => a.slot - b.slot);
}

function objective(raw: unknown): GameQuestObjective {
  const r = asRecord(raw);
  const o: GameQuestObjective = { finished: r.finished === true || r.finished === 1 };
  if (str(r.text)) o.text = str(r.text);
  const fulfilled = num(r.numFulfilled) ?? num(r.done);
  const required = num(r.numRequired) ?? num(r.total);
  if (num(r.done) !== undefined) o.done = num(r.done);
  else if (fulfilled !== undefined) o.done = fulfilled;
  if (num(r.total) !== undefined) o.total = num(r.total);
  else if (required !== undefined) o.total = required;
  if (num(r.numFulfilled) !== undefined) o.numFulfilled = num(r.numFulfilled);
  if (num(r.numRequired) !== undefined) o.numRequired = num(r.numRequired);
  return o;
}

function flag(v: unknown): boolean | undefined {
  if (v === true || v === false) return v;
  return undefined;
}

function professions(v: unknown): GameProfessionInfo[] | undefined {
  if (v === undefined) return undefined;
  const out: GameProfessionInfo[] = [];
  for (const raw of list(v)) {
    const r = asRecord(raw);
    const skillLine = num(r.skillLine);
    const rank = num(r.rank);
    const max = num(r.max);
    if (skillLine === undefined || rank === undefined || max === undefined) continue;
    const row: GameProfessionInfo = { skillLine, rank, max };
    if (str(r.name)) row.name = str(r.name);
    if (num(r.modifier) !== undefined) row.modifier = num(r.modifier);
    if (num(r.specIndex) !== undefined) row.specIndex = num(r.specIndex);
    out.push(row);
  }
  return out;
}

function taxiNodes(v: unknown): GameTaxiNode[] | undefined {
  if (v === undefined) return undefined;
  if (!v || typeof v !== "object") return [];
  const out: GameTaxiNode[] = [];
  for (const [k, raw] of Object.entries(v as object)) {
    const id = Number(k);
    if (!Number.isFinite(id) || id <= 0) continue;
    const r = asRecord(raw);
    const name = str(r.name);
    if (!name) continue;
    const node: GameTaxiNode = { id, name };
    if (num(r.mapId) !== undefined) node.mapId = num(r.mapId);
    out.push(node);
  }
  return out.sort((a, b) => a.id - b.id);
}

function bags(v: unknown): Record<number, number> | undefined {
  if (v === undefined) return undefined;
  if (!v || typeof v !== "object") return {};
  const out: Record<number, number> = {};
  for (const [k, raw] of Object.entries(v as object)) {
    const id = Number(k);
    const count = num(raw);
    if (!Number.isFinite(id) || id <= 0 || count === undefined) continue;
    out[id] = count;
  }
  return out;
}

function position(v: unknown): GameExportCharacter["position"] | undefined {
  if (v === undefined) return undefined;
  const r = asRecord(v);
  const p: NonNullable<GameExportCharacter["position"]> = {};
  if (num(r.mapId) !== undefined) p.mapId = num(r.mapId);
  if (str(r.zone)) p.zone = str(r.zone);
  if (str(r.subzone)) p.subzone = str(r.subzone);
  if (num(r.x) !== undefined) p.x = num(r.x);
  if (num(r.y) !== undefined) p.y = num(r.y);
  return p;
}

function reputation(v: unknown): GameExportCharacter["reputation"] | undefined {
  if (v === undefined) return undefined;
  const out: NonNullable<GameExportCharacter["reputation"]> = [];
  for (const raw of list(v)) {
    const r = asRecord(raw);
    const factionID = num(r.factionID);
    const name = str(r.name);
    if (factionID === undefined || !name) continue;
    const row: NonNullable<GameExportCharacter["reputation"]>[number] = { factionID, name };
    if (num(r.reaction) !== undefined) row.reaction = num(r.reaction);
    if (num(r.current) !== undefined) row.current = num(r.current);
    if (num(r.min) !== undefined) row.min = num(r.min);
    if (num(r.max) !== undefined) row.max = num(r.max);
    if (r.isHeader === true || r.isHeader === false) row.isHeader = r.isHeader;
    if (r.atWar === true || r.atWar === false) row.atWar = r.atWar;
    out.push(row);
  }
  return out;
}

function spells(v: unknown): GameExportCharacter["spells"] | undefined {
  if (v === undefined) return undefined;
  const r = asRecord(v);
  const known = list(r.known)
    .map((x) => num(x))
    .filter((n): n is number => n !== undefined);
  const out: NonNullable<GameExportCharacter["spells"]> = {};
  if (num(r.riding) !== undefined) out.riding = num(r.riding);
  if (r.mount === true || r.mount === false) out.mount = r.mount;
  if (r.known !== undefined) out.known = known;
  return out;
}

function durability(v: unknown): GameExportCharacter["durability"] | undefined {
  if (v === undefined) return undefined;
  const r = asRecord(v);
  const out: NonNullable<GameExportCharacter["durability"]> = {};
  if (num(r.pct) !== undefined) out.pct = num(r.pct);
  if (num(r.lowestSlot) !== undefined) out.lowestSlot = num(r.lowestSlot);
  return out;
}

function pet(v: unknown): GameExportCharacter["pet"] | undefined {
  if (v === undefined || v === null) return undefined;
  const r = asRecord(v);
  const out: NonNullable<GameExportCharacter["pet"]> = {};
  if (str(r.family)) out.family = str(r.family);
  if (num(r.level) !== undefined) out.level = num(r.level);
  if (str(r.name)) out.name = str(r.name);
  return out;
}

function questLog(v: unknown): GameQuestLogEntry[] | undefined {
  if (v === undefined) return undefined;
  const out: GameQuestLogEntry[] = [];
  for (const raw of list(v)) {
    const r = asRecord(raw);
    const id = num(r.id);
    if (id === undefined || id <= 0) continue;
    // GetQuestLogTitle isComplete: 1 = ready to turn in, -1 = failed.
    const e: GameQuestLogEntry = { id, complete: r.complete === 1 || r.complete === true, objectives: list(r.objectives).map(objective) };
    if (r.complete === -1) e.failed = true;
    if (str(r.title)) e.title = str(r.title);
    if (num(r.level) !== undefined) e.level = num(r.level);
    out.push(e);
  }
  return out;
}

/**
 * Realm from the character record. A present field (including "" or whitespace) is kept as
 * trimmed text and is never replaced from the key. Only a missing field uses "Name-Realm".
 */
function realmOf(key: string, present: boolean, v: unknown): string | undefined {
  if (present) {
    return typeof v === "string" ? v.trim() : "";
  }
  const i = key.indexOf("-");
  const fromKey = i >= 0 ? key.slice(i + 1).trim() : "";
  return fromKey && fromKey !== "?" ? fromKey : undefined;
}

/** Professions (primary + secondary) out of the full skill list. */
export function professionsOf(ch: GameExportCharacter): GameProfession[] {
  return (ch.skills ?? [])
    .filter((s): s is GameSkill & { kind: "primary" | "secondary" } => s.kind === "primary" || s.kind === "secondary")
    .map((s) => ({ name: s.name, rank: s.rank, max: s.max, kind: s.kind }));
}

class LuaParser {
  s: string;
  i = 0;
  constructor(s: string) {
    this.s = s;
  }

  err(what: string): Error {
    const line = this.s.slice(0, this.i).split("\n").length;
    return new Error(`${what} at line ${line}`);
  }

  ws(): void {
    const s = this.s;
    while (this.i < s.length) {
      const c = s[this.i];
      if (c === " " || c === "\t" || c === "\r" || c === "\n") {
        this.i++;
        continue;
      }
      if (s.startsWith("--", this.i)) {
        const j = this.i + 2;
        if (s[j] === "[") {
          const m = s.slice(j).match(/^\[(=*)\[/);
          if (m) {
            const close = `]${m[1]}]`;
            const k = s.indexOf(close, j + m[0].length);
            this.i = k < 0 ? s.length : k + close.length;
            continue;
          }
        }
        const nl = s.indexOf("\n", j);
        this.i = nl < 0 ? s.length : nl + 1;
        continue;
      }
      break;
    }
  }

  peek(tok: string): boolean {
    this.ws();
    return this.s.startsWith(tok, this.i);
  }

  eat(tok: string): boolean {
    if (this.peek(tok)) {
      this.i += tok.length;
      return true;
    }
    return false;
  }

  expect(tok: string): void {
    if (!this.eat(tok)) throw this.err(`expected ${JSON.stringify(tok)}`);
  }

  value(): unknown {
    this.ws();
    if (this.i >= this.s.length) throw this.err("unexpected end of input");
    const c = this.s[this.i]!;
    if (c === "{") return this.table();
    if (c === '"' || c === "'") return this.qstring(c);
    if (c === "[" && /^\[=*\[/.test(this.s.slice(this.i, this.i + 8))) return this.lstring();
    if (c === "-") {
      this.i++;
      const v = this.value();
      if (typeof v !== "number") throw this.err("unary minus on non-number");
      return -v;
    }
    if (this.eat("true")) return true;
    if (this.eat("false")) return false;
    if (this.eat("nil")) return null;
    const ident = this.s.slice(this.i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (ident && ident[0] !== "inf" && ident[0] !== "nan") {
      throw this.err(`unexpected identifier ${ident[0]}`);
    }
    const num = this.s.slice(this.i).match(/^(0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/);
    if (num) {
      this.i += num[0].length;
      return num[0].startsWith("0x") || num[0].startsWith("0X") ? parseInt(num[0], 16) : Number(num[0]);
    }
    throw this.err("expected a value");
  }

  qstring(q: string): string {
    this.i++;
    let out = "";
    const s = this.s;
    while (this.i < s.length) {
      const c = s[this.i]!;
      if (c === q) {
        this.i++;
        return out;
      }
      if (c === "\\") {
        this.i++;
        const e = s[this.i];
        if (e === undefined) break;
        const map: Record<string, string> = { n: "\n", t: "\t", r: "\r", "\\": "\\", '"': '"', "'": "'" };
        if (e === "x" && /[0-9a-fA-F]{2}/.test(s.slice(this.i + 1, this.i + 3))) {
          out += String.fromCharCode(parseInt(s.slice(this.i + 1, this.i + 3), 16));
          this.i += 3;
          continue;
        }
        if (/\d/.test(e)) {
          const m = s.slice(this.i).match(/^\d{1,3}/)!;
          out += String.fromCharCode(Number(m[0]));
          this.i += m[0].length;
          continue;
        }
        out += map[e] ?? e;
        this.i++;
        continue;
      }
      out += c;
      this.i++;
    }
    throw this.err("unterminated string");
  }

  lstring(): string {
    const m = this.s.slice(this.i).match(/^\[(=*)\[/)!;
    const close = `]${m[1]}]`;
    const start = this.i + m[0].length;
    const k = this.s.indexOf(close, start);
    if (k < 0) throw this.err("unterminated long string");
    const body = this.s.slice(start, k);
    this.i = k + close.length;
    return body.startsWith("\n") ? body.slice(1) : body;
  }

  name(): string | undefined {
    this.ws();
    const m = this.s.slice(this.i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (!m) return undefined;
    this.i += m[0].length;
    return m[0];
  }

  skipValue(): void {
    this.ws();
    if (this.i >= this.s.length) return;
    const c = this.s[this.i]!;
    if (c === "{") {
      this.i++;
      let depth = 1;
      while (this.i < this.s.length && depth > 0) {
        this.ws();
        if (this.i >= this.s.length) break;
        const ch = this.s[this.i]!;
        if (ch === '"' || ch === "'") {
          this.qstring(ch);
          continue;
        }
        if (ch === "[" && /^\[=*\[/.test(this.s.slice(this.i, this.i + 8))) {
          this.lstring();
          continue;
        }
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
        this.i++;
      }
      return;
    }
    if (c === '"' || c === "'") {
      this.qstring(c);
      return;
    }
    if (c === "[" && /^\[=*\[/.test(this.s.slice(this.i, this.i + 8))) {
      this.lstring();
      return;
    }
    if (c === "-") {
      this.i++;
      this.skipValue();
      return;
    }
    if (this.eat("true") || this.eat("false") || this.eat("nil")) return;
    const ident = this.s.slice(this.i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (ident) {
      this.i += ident[0].length;
      return;
    }
    const num = this.s.slice(this.i).match(/^(0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/);
    if (num) {
      this.i += num[0].length;
      return;
    }
    this.i++;
  }

  table(keepKeys?: Set<string>): unknown {
    this.expect("{");
    const obj: Record<string | number, unknown> = {};
    const arr: unknown[] = [];
    let sequential = true;
    let nextIndex = 1;
    while (!this.eat("}")) {
      this.ws();
      if (this.eat("}")) break;
      let key: string | number | undefined;
      if (this.eat("[")) {
        const k = this.value();
        this.expect("]");
        this.expect("=");
        key = k as string | number;
      } else {
        const saved = this.i;
        const n = this.name();
        if (n && this.eat("=")) key = n;
        else this.i = saved;
      }
      const skipHuge =
        key === "maps" ||
        (keepKeys !== undefined && (typeof key !== "string" || !keepKeys.has(key)));
      if (skipHuge) {
        this.skipValue();
        this.eat(",");
        this.eat(";");
        this.ws();
        continue;
      }
      const val = this.value();
      if (val !== null) {
        if (key === undefined) {
          arr.push(val);
          obj[nextIndex] = val;
          nextIndex++;
        } else {
          obj[key] = val;
          if (!(typeof key === "number" && key === nextIndex)) sequential = false;
          else {
            arr.push(val);
            nextIndex++;
          }
        }
      }
      this.eat(",");
      this.eat(";");
      this.ws();
    }
    if (sequential && arr.length > 0 && Object.keys(obj).length === arr.length) return arr;
    // mixed: if keys are exactly 1..n
    const keys = Object.keys(obj);
    const asNums = keys.map(Number);
    if (keys.length && asNums.every((n, i) => n === i + 1)) {
      return asNums.map((n) => obj[n]);
    }
    return obj;
  }

  assignments(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const dbKeep = new Set(["characters", "lastCharacter", "exportedAt", "exportedAtText", "schemaVersion"]);
    while (this.i < this.s.length) {
      this.ws();
      if (this.i >= this.s.length) break;
      const n = this.name();
      if (!n) {
        this.i++;
        continue;
      }
      if (!this.eat("=")) continue;
      this.ws();
      if (n === "GuideWebExportDB" && this.peek("{")) {
        out[n] = this.table(dbKeep);
      } else {
        out[n] = this.value();
      }
      this.eat(";");
    }
    return out;
  }
}

function asRecord(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

export function parseGuideWebExport(text: string): GameExport {
  const parser = new LuaParser(text);
  const assigns = parser.assignments();
  const db = asRecord(assigns.GuideWebExportDB);
  const charsRaw = asRecord(db.characters);
  const characters: GameExportCharacter[] = [];
  for (const [key, raw] of Object.entries(charsRaw)) {
    const c = asRecord(raw);
    const ch: GameExportCharacter = {
      key,
      name: str(c.name),
      race: mapRace(c.race, c.raceName),
      cls: mapClass(c.class, c.className),
      level: typeof c.level === "number" ? c.level : undefined,
      exportedAt: typeof c.exportedAt === "number" ? c.exportedAt : undefined,
      completedQuests: completedIds(c.completed),
    };
    const realm = realmOf(key, "realm" in c, c.realm);
    if (realm !== undefined) ch.realm = realm;
    const extras: Partial<GameExportCharacter> = {
      schemaVersion: num(c.schemaVersion),
      firstName: str(c.firstName),
      surname: str(c.surname),
      guid: str(c.guid),
      faction: str(c.faction),
      xp: num(c.xp),
      xpMax: num(c.xpMax),
      xpRested: num(c.xpRested),
      xpPercent: num(c.xpPercent),
      restState: num(c.restState),
      money: num(c.money),
      skills: skills(c.skills),
      professions: professions(c.professions),
      gear: gear(c.gear),
      questLog: questLog(c.questLog),
      questLogOk: flag(c.questLogOk),
      skillsOk: flag(c.skillsOk),
      taxiOk: flag(c.taxiOk),
      bindOk: flag(c.bindOk),
      bagsOk: flag(c.bagsOk),
      reputationOk: flag(c.reputationOk),
      spellsOk: flag(c.spellsOk),
      durabilityOk: flag(c.durabilityOk),
      positionOk: flag(c.positionOk),
      petOk: flag(c.petOk),
      taxi: taxiNodes(c.taxi),
      bind: str(c.bind),
      bags: bags(c.bags),
      position: position(c.position),
      reputation: reputation(c.reputation),
      spells: spells(c.spells),
      durability: durability(c.durability),
      pet: pet(c.pet),
      deadOrGhost: flag(c.deadOrGhost),
    };
    for (const [k, v] of Object.entries(extras)) {
      if (v !== undefined) (ch as unknown as Record<string, unknown>)[k] = v;
    }
    characters.push(ch);
  }
  const last = typeof db.lastCharacter === "string" ? db.lastCharacter : undefined;
  const exportedAt = typeof db.exportedAt === "number" ? db.exportedAt : undefined;
  if (last) {
    const i = characters.findIndex((c) => c.key === last);
    if (i > 0) {
      const [hit] = characters.splice(i, 1);
      if (hit) characters.unshift(hit);
    }
  }
  const schemaVersion = num(db.schemaVersion);
  return { lastCharacter: last, exportedAt, ...(schemaVersion !== undefined ? { schemaVersion } : {}), characters };
}
