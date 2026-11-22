/**
 * Horde Guide Web — data contracts (plan.md §3).
 *
 * Single source of truth for every JSON file the web app reads
 * (`web/public/data/**`) and for browser storage. The Python pipeline writes
 * JSON that must conform to these types; `contracts/fixtures/` holds small
 * hand-made samples.
 *
 * Route schema v2 (routes, dungeons, roles, tips, professions, provenance): docs/ROUTE_SCHEMA.md.
 *
 * Dependency-free on purpose: imported by the web app (`web/src/data/schema.ts`)
 * and by validation scripts. Changes need a note in plan.md §7.
 */

// ---------- site data (web/public/data/) ----------

/** Only Horde is in scope (plan D1). */
export type Faction = "Horde";

/** Playable race. Kept open (`string`) for Forever-specific races. */
export type RaceKey = "Orc" | "Troll" | "Tauren" | "Undead" | string;

/** Playable class (vanilla set). */
export type ClassKey =
  | "Warrior"
  | "Hunter"
  | "Rogue"
  | "Priest"
  | "Shaman"
  | "Mage"
  | "Warlock"
  | "Druid"
  | "Paladin";

/**
 * Race/class filter parsed from `<< Orc Warrior/!Tauren`.
 * `any` is an OR of AND-groups: `/` separates groups, space joins terms inside a group,
 * `!` sets `not` on a term. Each term names a race, a class, or both.
 */
export interface Filter {
  any: { race?: RaceKey; cls?: ClassKey; not?: boolean }[][];
}

/** A point on a zone map. `x`,`y` are zone % (0..100); `exact` = false when from a fitted transform. */
export interface MapPoint {
  mapId: number;
  x: number;
  y: number;
  zone: string;
  exact: boolean;
}

/**
 * Step-id prefixes for one guide in `guide_index.json`.
 * Each list includes that guide's slug and every distinct prefix (text before the first `:`) of its step ids.
 * Example: `{ "horde-20-40-04-needles": ["horde-20-40-04-needles", "horde-20-40"] }`.
 * A prefix such as `horde-20-40` or `h4060` is listed on every sub-pack in that band.
 * Prefix → guide is NOT unique — do not assign every tick with a shared prefix to one guide.
 */
export type GuideIdPrefixes = Record<string, string[]>;

/** One indexed guide in `guide_index.json`, with the step ids that guide publishes. */
export interface GuideIndexEntry {
  slug: string;
  /** Reader-facing guide title (the guide's `displayName`), so lists need not load every guide. */
  title?: string;
  /** Step ids in route order. Does not include ids absorbed into another card. */
  stepIds: string[];
  stepCount: number;
  /** Guide level range (so lists and the start picker need not load every guide). */
  minLevel?: number;
  maxLevel?: number;
  /** Expected solo play minutes on each route (dungeon steps left out). */
  minutes?: Partial<Record<RouteStyle, number>>;
  /** Some steps had no authored minutes; their time is the route-wide average per step. */
  minutesEstimated?: boolean;
  /** XP-sim level at the guide's first simulated step, per route. */
  startLevel?: Partial<Record<RouteStyle, number>>;
}

/** `guide_index.json`: brackets in play order plus the race starts. */
export interface GuideIndex {
  /** ISO 8601 timestamp of the pipeline run. */
  generatedAt: string;
  /**
   * "1-12", "12-22", "20-40" … with guide slugs in play order.
   * `label` is the pack `bracket` when set, otherwise `minLevel-maxLevel`.
   */
  brackets: { label: string; guides: string[]; idPrefixes?: GuideIdPrefixes }[];
  /** Durotar / Mulgore / Tirisfal; all merge into the Barrens. */
  starts: { race: RaceKey[]; label: string; firstGuide: string }[];
  /** One entry per slug listed in `brackets`, in the same order. */
  entries?: GuideIndexEntry[];
}

/** `guides/<slug>.json`: one guide with its sections and steps. */
export interface Guide {
  slug: string;
  name: string;
  displayName: string;
  subgroup: string;
  minLevel: number;
  maxLevel: number;
  /** Slug of the next guide (`#next`). Default / balanced successor. */
  next?: string;
  /** Successor per route style when the two lines diverge. `next` stays the balanced default. */
  nextByRoute?: Partial<Record<RouteStyle, string>>;
  zones: string[];
  /** Guide-level `<< …` filter (other than the faction line). */
  filter?: Filter;
  source: "import" | "builtin";
  /** Split at zone changes (P4). */
  sections: Section[];
  /** Guide steps + bonus steps from P5, in route order. */
  steps: Step[];
}

/** A contiguous zone section of a guide, drawn as one map (plan D7, P8). */
export interface Section {
  id: string;
  mapId: number;
  zone: string;
  firstStep: string;
  lastStep: string;
  stops: Stop[];
  /** Smoothed polyline in zone %, including hidden waypoints. */
  route: { x: number; y: number }[];
}

/** A numbered map stop: clustered `.goto` points sharing quest/FP/hearth/vendor/trainer actions. */
export interface Stop {
  n: number;
  x: number;
  y: number;
  label: string;
  kinds: ("quest" | "fp" | "hearth" | "vendor" | "trainer" | "bonus")[];
  /** Step ids at this stop. */
  steps: string[];
}

/**
 * Per-route XP simulation on a built guide step. Attached by the route simulator;
 * omitted in authored packs and older builds. UI reads `step.sim[activeRoute]`.
 */
export interface StepSim {
  /** Fractional player level AFTER this step, e.g. 13.42 */
  level: number;
  /** XP this step actually awards on this route (turn-ins + objective kills + grind). 0 when none. */
  gained: number;
  /** Set to the level just reached when this step crosses into it. */
  levelUp?: number;
  /** XP awarded at this step's turn-ins (after outlevel penalty); `fullXp` is the unpenalized reward. */
  questXp?: { questId: number; xp: number; fullXp: number }[];
  /**
   * Base mob XP (before food / bag / rested) a `.xp` grind still needs.
   * Set by a live recompute. Omitted on the build-time worst case.
   */
  grindKillXp?: number;
  /** Live recompute: the character is already at the grind checkpoint. */
  grindSkip?: boolean;
  next?: {
    /** The upcoming level. */
    level: number;
    /** Turn-ins still to come before that level-up. */
    quests: number;
    /** XP still needed after those quests. */
    xpGap: number;
    /** Min..max extra kills to close the gap. */
    mobs: [number, number];
    mobLevel: number;
    mobName?: string;
    mobId?: number;
  };
}

/** One guide step. */
export interface Step {
  /** Stable: `${slug}:${sha1(normalizedRaw).slice(0,10)}:${dupIndex}`. */
  id: string;
  /** 1-based position in the guide. */
  n: number;
  section?: string;
  stop?: number;
  /** Generated by P5 (hidden in Speedrun mode). */
  bonus?: { questIds: number[]; xp: number; why: string };
  /** A `.xp` grind made redundant by bonus quests. */
  mayBeSkipped?: { expectedLevel: number; reason: string };
  /** Route simulator payload keyed by route style. Missing = UI shows nothing extra. */
  sim?: Partial<Record<"balanced" | "speedrun", StepSim>>;
  /**
   * Same shape as `sim`, from a dungeons-on walk. Solo `sim` stays the dungeons-off worst case.
   * The reader uses this when `Profile.options.dungeons` is on.
   */
  simDungeons?: Partial<Record<"balanced" | "speedrun", StepSim>>;
  /** Step-level `step << …` filter. */
  filter?: Filter;
  tags: {
    completeWith?: string;
    optional?: boolean;
    label?: string;
    loop?: boolean;
    sticky?: boolean;
    requires?: string;
    hardcore?: boolean;
    softcore?: boolean;
    /** Where this step sits in a dungeon detour. Does not affect visibility. */
    dungeonPart?: "pickup" | "prep" | "run" | "turnin";
  };
  /** Visible lines (`>>`, `+`, command display text). */
  text: RichText[];
  actions: Action[];
  /** `.isOnQuest` / `.isQuestTurnedIn` / `.xp <` / `.money` / `.itemStat` … shown as badges. */
  conditions: Condition[];
  // ---- route schema v2 (docs/ROUTE_SCHEMA.md). All optional so v1 guides still load. ----
  /** Routes this step belongs to. Default: bonus steps → ["balanced"], others → both. */
  routes?: RouteStyle[];
  /** Dungeon content: shown only when `Profile.options.dungeons` is on. */
  dungeon?: DungeonRef;
  /** Open-world alternative to dungeon content: shown only when dungeons are off. */
  dungeonsOff?: boolean;
  /**
   * When dungeons are ON, hide this step only on these route styles (speedrun drops the
   * overworld quest a dungeon replaces; balanced keeps it). Ignored when dungeons are off.
   */
  dungeonsOffRoutes?: RouteStyle[];
  /** Step ids this step replaces when the dungeon toggle flips (documentation/QA only). */
  alternativeTo?: string[];
  /** Show only for these classes (simple v2 alternative to `filter`; omit = every class). */
  classes?: ClassKey[];
  /** Show only for these roles (omit = every role). */
  roles?: Role[];
  /** Structured tips (replace the old raw source text). Filtered per class/role/route. */
  tips?: Tip[];
  /** Profession hooks ("keep 6 Chunk of Boar Meat; recipe from X raises Cooking"). */
  professionHooks?: ProfessionHook[];
  /** Elite / group quest tactics. */
  elite?: EliteTactic[];
  /** Extra hand-placed pins (NPCs, objects, mob areas). Quest pins are derived from QuestInfo. */
  pins?: Pin[];
  /** Expected minutes for this step (route planning, optional). */
  minutes?: number;
  /** Where the facts in this step come from. Required for authored (v2) steps. */
  sources?: SourceRef[];
  /** False / missing on authored content = "unverified" and flagged in the UI and QA. */
  verified?: boolean;
  /**
   * Step ids absorbed into this card by the build-time compaction pass.
   * Does not include this step's own `id`. A stored check for any of these ids counts as this step done.
   */
  mergedIds?: string[];
}

/** One line of coloured text, split into segments. `filter` = line-level `<< …`. */
export type RichText = {
  segments: {
    t: string;
    kind?: "friendly" | "warn" | "enemy" | "buy" | "loot" | "pick" | "icon" | "link";
    href?: string;
    icon?: string;
  }[];
  filter?: Filter;
};

/** Fields every Action may carry: the line-level `<< …` filter. */
export interface ActionBase {
  filter?: Filter;
}

/** A guide command turned into something the user does. */
export type Action = ActionBase &
  (
    | {
        type: "goto";
        at: MapPoint;
        radius?: number;
        hidden?: boolean;
        /**
         * Unconverted source coordinates. World form (map id, instance, a, b) -> `{a, b, instance}` with
         * `at.mapId` = 1411 (world coords, HBD order); `.goto Zone,a,b` -> `{zone, a, b}` (zone %).
         * P4 converts to `at` and may drop it.
         */
        raw?: { zone?: string; a: number; b: number; instance?: number };
      }
    | { type: "accept" | "turnin"; questId: number; label: string }
    | { type: "complete"; questId: number; objective: number; label: string }
    | { type: "collect"; itemId: number; count: number; questId?: number; objective?: number; label: string }
    | { type: "train"; spellId: number; label: string }
    | {
        type: "fly" | "fp" | "home" | "hs" | "zone" | "subzone" | "deathskip" | "vendor" | "trainer";
        label: string;
        place?: string;
      }
    | { type: "xp"; level: number; extra?: number; label: string; mobId?: number; mobName?: string; mobLevel?: number }
    | { type: "mob" | "target" | "unitscan"; name: string; npcIds?: number[] }
    | { type: "use" | "equip" | "destroy"; itemId: number; label?: string }
    | { type: "link"; url: string; label: string }
    | { type: "other"; cmd: string; args: string }
  );

/** Every `Action["type"]` value. */
export type ActionType = Action["type"];

/** A guard command (`.isOnQuest`, `.money`, `.xp <6,1` …) shown as a badge. */
export type Condition = { cmd: string; args: string; questIds?: number[]; label: string };

/** `quests.json` entry (or shards by zone if larger than ~3 MB gz). */
export interface QuestInfo {
  id: number;
  name: string;
  level: number;
  reqLevel: number;
  zone?: string;
  mapId?: number;
  races: number;
  classes: number;
  /** Forever-only quest: no Wowhead link. */
  custom: boolean;
  start: Giver[];
  end: Giver[];
  objectivesText: string[];
  objectives: {
    kind: "kill" | "item" | "object" | "rep" | "killcredit" | "spell" | "trigger" | "extra";
    id?: number;
    name: string;
    count?: number;
    at: MapPoint[];
    drops?: { npcId: number; name: string; rate?: number }[];
  }[];
  pre: { group: number[]; single: number[] };
  next?: number;
  breadcrumbFor?: number;
  exclusiveTo: number[];
  xp?: number;
  /** QuestXP Difficulty_1..7 at `level` that equals `xp`. Unset when XP does not match the table. */
  xpTier?: number;
  repeatable: boolean;
  /**
   * Step ids that reference this quest. Omitted from published quest files;
   * the site reads `quest-steps.json` instead.
   */
  inGuides?: string[];
}

/** Giver identity without map coordinates (`quests-min.json`). */
export interface QuestGiverName {
  kind: "npc" | "object" | "item";
  id: number;
  name: string;
}

/** `quests-min.json`: identity, requirements, and giver names. No coordinates. */
export interface QuestMin {
  id: number;
  name: string;
  level: number;
  reqLevel: number;
  zone?: string;
  races: number;
  classes: number;
  custom: boolean;
  pre: { group: number[]; single: number[] };
  exclusiveTo: number[];
  breadcrumbFor?: number;
  xp?: number;
  start: QuestGiverName[];
  end: QuestGiverName[];
}

/** `quests-geo.json`: coordinates and the objective identity pins need. */
export interface QuestGeo {
  id: number;
  start: { at: MapPoint[] }[];
  end: { at: MapPoint[] }[];
  objectives: {
    kind: QuestInfo["objectives"][number]["kind"];
    id?: number;
    name: string;
    at: MapPoint[];
  }[];
}

/** `quests-detail.json`: quest-page copy that pins and the slim catalog do not need. */
export interface QuestDetail {
  id: number;
  objectivesText: string[];
  next?: number;
  repeatable: boolean;
  mapId?: number;
  xpTier?: number;
  /** Drops aligned with `QuestGeo.objectives` (empty list when that objective has none). */
  drops: ({ npcId: number; name: string; rate?: number }[] | null)[];
}

/** A quest starter or ender. */
export interface Giver {
  kind: "npc" | "object" | "item";
  id: number;
  name: string;
  at: MapPoint[];
}

/** `insights.json` (P5). Bonus steps themselves are merged into `Guide.steps`. */
export interface Insights {
  /** Per guide slug: bonus quests added to the route. */
  added: Record<
    string,
    { questIds: number[]; xp: number; minutes: number; detour: "near" | "medium"; why: string }[]
  >;
  /** Per guide slug: candidates that just missed the cut; the user can add them. */
  nearMisses: Record<
    string,
    { questId: number; xp: number; minutes: number; why: string; insertAfterStep: string }[]
  >;
  issues: {
    severity: "info" | "warn";
    guide?: string;
    step?: string;
    questId?: number;
    /** Quest name for notes about a quest the site's quest list does not carry (left out of the route). */
    questName?: string;
    msg: string;
  }[];
}

/** `zones.json` entry. `bounds` in world coordinates (from the P3 addon or a fit). */
export interface ZoneInfo {
  mapId: number;
  areaId: number;
  name: string;
  continent: 0 | 1;
  bounds?: { left: number; top: number; width: number; height: number };
  /** Path under `web/public/`, e.g. `maps/1411.webp`. */
  image?: string;
  levels?: [number, number];
  /** Optional region outline(s) in zone % (each ring ≥ 3 points), e.g. sub-zones or level areas. */
  outline?: { name?: string; ring: { x: number; y: number }[] }[];
}

// ---------- browser storage (Phase 7) ----------

/**
 * Live XP bonuses. Omitted or all off matches the build-time worst case
 * (no food, no rested, no sleeping bag, Well Rested rank 0).
 */
export interface XpMods {
  /** +5% kill experience while food is kept up. */
  wellFed?: boolean;
  /** `none` is worst case. `fromGame` uses `Profile.xpRested`. `perSession` banks ~5% of a level. */
  restedPolicy?: "none" | "fromGame" | "perSession";
  /** Legacy perk, 0–5. +4% rested rate and cap per rank. */
  legacyWellRestedRank?: number;
  /** +3% to all experience after level 14. */
  sleepingBag?: boolean;
}

/** A local character profile with its progress (localStorage). */
export interface Profile {
  id: string;
  name: string;
  race: RaceKey;
  cls: ClassKey;
  level?: number;
  routeStyle: RouteStyle;
  /** Selected role; drives role tips. Omit = show tips for every role. */
  role?: Role;
  /** Professions the character levels (max two primary + any secondary). */
  professions?: ProfessionKey[];
  options: {
    showOptional: boolean;
    hideDone: boolean;
    /** Dungeon steps on (true) or open-world alternatives (false). Missing = false. */
    dungeons?: boolean;
    /** Missing or all off: reader keeps the baked worst-case sim. */
    xpMods?: XpMods;
  };
  steps: Record<string, { done: true; at: number } | { skipped: true; at: number }>;
  /** Source of truth for quest steps. */
  quests: Record<number, "accepted" | "done" | "skipped">;
  /** Near-misses the user chose to add. */
  addedQuests: number[];
  current?: { guide: string; step: string };
  /** In-game character this profile syncs from (addon Sync). Set by the first sync or by the user. */
  character?: { name: string; realm: string };
  /** Profession skill from the last addon Sync (overwritten on each sync). */
  skills?: Partial<Record<ProfessionKey, { cur: number; max: number }>>;
  /** Gold in copper from the last addon Sync. */
  money?: number;
  /** Equipped gear from the last addon Sync: inventory slot id (1 head ... 19 tabard) -> item id. */
  gear?: Partial<Record<number, number>>;
  /**
   * Active quest log from the last addon Sync (replaced each sync; not a union).
   * `complete`: 1 = ready to turn in, -1 = failed, 0 = in progress / incomplete.
   */
  questLog?: {
    questId: number;
    title?: string;
    /** 1 = ready to turn in, -1 = failed, 0 = in progress. */
    complete?: number;
    objectives?: { text?: string; finished?: boolean; numFulfilled?: number; numRequired?: number }[];
  }[];
  /** ISO timestamp of the last sync that wrote `questLog` from a known log. */
  questLogSyncedAt?: string;
  /** Weapon skills (not professions). */
  weaponSkills?: { name: string; cur: number; max: number }[];
  /** Known flight masters. Union across syncs; a later export that omits taxi does not remove nodes. */
  flightPaths?: { id: number; name: string; mapId?: number }[];
  /** Hearthstone bind location. */
  hearth?: string;
  /** Bag item counts (item id -> count) from the last bags snapshot. */
  bags?: Record<number, number>;
  xp?: number;
  xpMax?: number;
  xpRested?: number;
  position?: { mapId?: number; zone?: string; subzone?: string; x?: number; y?: number };
  reputation?: { factionID: number; name: string; reaction?: number; current?: number; min?: number; max?: number }[];
  spells?: { riding?: number; mount?: boolean; known?: number[] };
  durability?: { pct?: number; lowestSlot?: number };
  pet?: { family?: string; level?: number; name?: string };
  deadOrGhost?: boolean;
  /** Areas a v4 export did not confirm (e.g. "quest log", "professions"). */
  exportWarnings?: string[];
  /** Epoch ms of the last addon Sync that changed this profile. */
  syncedAt?: number;
  createdAt: number;
  updatedAt: number;
  schema: 1;
}

// ---------- route schema v2: routes, roles, tips, professions, provenance ----------

/** Bumped when the v2 authoring shape changes incompatibly. */
export const ROUTE_SCHEMA_VERSION = 2 as const;

/** Two routes: relaxed `balanced` (with bonus quests) and highly optimized `speedrun`. */
export type RouteStyle = "balanced" | "speedrun";

export type Role = "tank" | "healer" | "dps";

/** Every Horde-relevant class key, in display order. */
export const CLASS_KEYS: readonly ClassKey[] = [
  "Warrior", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid", "Paladin",
] as const;

export const ROLES: readonly Role[] = ["tank", "healer", "dps"] as const;

export type PrimaryProfession =
  | "Alchemy"
  | "Blacksmithing"
  | "Enchanting"
  | "Engineering"
  | "Herbalism"
  | "Leatherworking"
  | "Mining"
  | "Skinning"
  | "Tailoring";
export type SecondaryProfession = "Cooking" | "First Aid" | "Fishing";
export type ProfessionKey = PrimaryProfession | SecondaryProfession;

export const PRIMARY_PROFESSIONS: readonly PrimaryProfession[] = [
  "Alchemy", "Blacksmithing", "Enchanting", "Engineering", "Herbalism", "Leatherworking", "Mining", "Skinning", "Tailoring",
] as const;
export const SECONDARY_PROFESSIONS: readonly SecondaryProfession[] = ["Cooking", "First Aid", "Fishing"] as const;

/** A citation. Every authored data item carries `sources[]`. */
export interface SourceRef {
  url: string;
  label: string;
}

/** Provenance carried by every authored data item. `verified: false` = flagged "unverified". */
export interface Provenance {
  sources: SourceRef[];
  verified: boolean;
}

/** A zone-% coordinate (0..100), the same space as QuestieDB spawns. */
export interface ZoneCoord {
  /** UiMap id (e.g. 1411 Durotar), matches `MapPoint.mapId`. */
  mapId: number;
  zone: string;
  x: number;
  y: number;
}

export interface DungeonRef {
  name: string;
  /** Instance / area id when known. */
  instanceId?: number;
  /** Suggested level range. */
  levels?: [number, number];
}

/** `advice`: our own role advice (tank/healer/dps), shown as a separate card line; no data source needed. */
export type TipKind = "general" | "elite" | "profession" | "speed" | "advice";

/** One structured tip. Omitted filters mean "everyone". */
export interface Tip extends Provenance {
  kind: TipKind;
  text: string;
  roles?: Role[];
  classes?: ClassKey[];
  routes?: RouteStyle[];
  /** true = only with dungeons on, false = only with dungeons off. */
  dungeons?: boolean;
}

/** An NPC reference with a location (vendor, trainer, recipe seller …). */
export interface NpcRef {
  id: number;
  name: string;
  zone: string;
  x: number;
  y: number;
  mapId?: number;
}

/**
 * Profession hook on a step: keep/gather items, buy a recipe, train.
 * Shown only when the profile has `profession` (or when no professions are set).
 */
export interface ProfessionHook extends Provenance {
  profession: ProfessionKey;
  itemId?: number;
  itemName?: string;
  qty?: number;
  /** Skill level this hook helps reach (e.g. 75). */
  skillTarget?: number;
  npc?: NpcRef;
  note: string;
}

/** Elite or group-quest tactic. */
export interface EliteTactic extends Provenance {
  name: string;
  npcId?: number;
  level?: number;
  /** Suggested group size (1 = soloable). */
  groupSize?: number;
  /** Tips are filtered by class/role like `Step.tips`. */
  tips: Tip[];
}

/** Map marker kinds the UI draws (docs/DESIGN.md §7). */
export type MarkerKind = "questGiver" | "turnIn" | "mobArea" | "object" | "vendor" | "trainer" | "flightPath" | "innkeeper";

/** What an NPC pin offers (drives the vendor / trainer / flight path marker style). */
export type NpcService = "questGiver" | "turnIn" | "vendor" | "trainer" | "flightPath" | "innkeeper";

/** Hand-placed map pin. Mob areas use a polygon in zone % (≥ 3 points). */
export type Pin = Provenance &
  (
    | { kind: "npc"; npcId: number; name: string; at: ZoneCoord; service?: NpcService }
    | { kind: "object"; objectId: number; name: string; at: ZoneCoord }
    | {
        kind: "mobArea";
        npcIds: number[];
        name: string;
        mapId: number;
        zone: string;
        /** Hull of the camp (≥ 3 points) … */
        polygon?: { x: number; y: number }[];
        /** … or a centre + radius (zone %) when no hull is drawn. */
        center?: { x: number; y: number };
        radius?: number;
      }
  );

/** One ranked primary pair in a class recommendation. */
export interface ProfessionPair {
  rank: number;
  pair: [PrimaryProfession, PrimaryProfession];
  reason: string;
  /** Roles this pair suits best (omit = all). */
  roles?: Role[];
}

/** A levelling milestone, tied to step ids or a level range. */
export interface ProfessionMilestone {
  profession: ProfessionKey;
  skillTarget: number;
  /** Step ids where this milestone happens, or … */
  stepIds?: string[];
  /** … a character level range. */
  levels?: [number, number];
  note: string;
}

/** `class_professions.json`: `Record<ClassKey, ClassProfessions>`. */
export interface ClassProfessions extends Provenance {
  primary: ProfessionPair[];
  secondary: { profession: SecondaryProfession; reason: string }[];
  levelingPlan: ProfessionMilestone[];
}
export type ClassProfessionsFile = Partial<Record<ClassKey, ClassProfessions>>;

/**
 * `tips_matrix.json`: general class/role tips not tied to one step,
 * keyed `class → role → tips` (role key `any` = every role).
 */
export type TipsMatrixFile = Partial<Record<ClassKey, Partial<Record<Role | "any", Tip[]>>>>;

/** Options the route resolver needs (a projection of `Profile`). */
export interface RouteOptions {
  route: RouteStyle;
  dungeons: boolean;
  race?: RaceKey;
  cls?: ClassKey;
  role?: Role;
  /** undefined = show every profession hook; [] = none. */
  professions?: ProfessionKey[];
}

/** Authoring pack validated by `contracts/route-v2.schema.json`. */
export interface RoutePack {
  schema: "project-forever/route";
  version: typeof ROUTE_SCHEMA_VERSION;
  id?: string;
  title?: string;
  levels?: [number, number];
  /** UI grouping key, e.g. "20-40". Omitted on packs that group by `levels`. */
  bracket?: string;
  /** Slug of the following guide. Omitted packs keep the level-band chain. Default / balanced successor. */
  next?: string;
  /** Successor per route style when the two lines diverge. `next` stays the balanced default. */
  nextByRoute?: Partial<Record<RouteStyle, string>>;
  steps: Step[];
  classProfessions?: ClassProfessionsFile;
  tipsMatrix?: TipsMatrixFile;
}

/** Addon sync status shown in the top bar (docs/DESIGN.md §7). */
export interface SyncStatus {
  state: "idle" | "syncing" | "ok" | "no-addon" | "error";
  /** Epoch ms of the last successful sync. */
  at?: number;
  character?: string;
  /** Realm of the synced character. */
  realm?: string;
  level?: number;
  /** Completed quest ids matched on the active profile. */
  completedQuests?: number;
  message?: string;
}
