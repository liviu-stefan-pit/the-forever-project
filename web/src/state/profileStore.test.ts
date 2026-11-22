import { describe, expect, it } from "vitest";
import type { Guide, GuideIndex, Profile, Step } from "../data/schema";
import type { GameExport } from "./luaExport";
import {
  PRESERVED_KEY,
  STORAGE_KEY,
  createMemoryStorage,
  createProfileEngine,
  exportProfile,
  importProfileJson,
  migrate,
  reconcileProfile,
} from "./profileStore";

function memoryEngine(opts?: { storage?: ReturnType<typeof createMemoryStorage>; id?: () => string }) {
  let n = 0;
  return createProfileEngine({
    storage: opts?.storage ?? createMemoryStorage(),
    now: () => 1000,
    id: opts?.id ?? (() => `id-${++n}`),
  });
}

const sample = (): Profile => ({
  id: "keep-me",
  name: "Thrall",
  race: "Orc",
  cls: "Warrior",
  level: 12,
  routeStyle: "speedrun",
  options: { showOptional: false, hideDone: true },
  steps: { "g:a": { done: true, at: 9 }, "g:b": { skipped: true, at: 8 } },
  quests: { 788: "done", 4641: "accepted" },
  addedQuests: [97279],
  current: { guide: "1-6-durotar", step: "g:a" },
  createdAt: 1,
  updatedAt: 2,
  schema: 1,
});

describe("migration", () => {
  it("upgrades legacy routeStyle 'lean' to 'speedrun' (profiles, guest, import)", () => {
    const legacy = { ...sample(), routeStyle: "lean" };
    const loaded = migrate({ schema: 1, activeId: "keep-me", profiles: [legacy], guestRouteStyle: "lean" });
    expect(loaded.loadError).toBeNull();
    expect(loaded.state.profiles[0]!.routeStyle).toBe("speedrun");
    expect(loaded.state.guestRouteStyle).toBe("speedrun");
    const imported = importProfileJson(JSON.stringify(legacy), { id: "x", now: 1 });
    expect(imported.routeStyle).toBe("speedrun");
    expect(imported.options.dungeons).toBe(false);
  });

  it("stores xp bonuses and still loads a profile that omits them", () => {
    const storage = createMemoryStorage();
    const a = memoryEngine({ storage, id: () => "p1" });
    const created = a.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    expect(created.options.xpMods).toBeUndefined();
    a.setOptions({ xpMods: { wellFed: true, restedPolicy: "perSession", legacyWellRestedRank: 2, sleepingBag: false } });
    a.flush();
    const b = memoryEngine({ storage });
    expect(b.active()?.options.xpMods).toEqual({ wellFed: true, restedPolicy: "perSession", legacyWellRestedRank: 2 });
    a.setOptions({ xpMods: { restedPolicy: "none" } });
    expect(a.active()?.options.xpMods).toBeUndefined();
    const old = importProfileJson(JSON.stringify(sample()), { id: "x", now: 1 });
    expect(old.options.xpMods).toBeUndefined();
    const kept = importProfileJson(JSON.stringify({ ...sample(), options: { ...sample().options, xpMods: { sleepingBag: true } } }), { id: "y", now: 1 });
    expect(kept.options.xpMods).toEqual({ sleepingBag: true });
  });

  it("selectProfileUiKey changes when xp bonuses or synced rested xp change", () => {
    const e = memoryEngine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    const before = e.selectProfileUiKey();
    e.setOptions({ xpMods: { wellFed: true } });
    expect(e.selectProfileUiKey()).not.toBe(before);
    e.setOptions({ xpMods: { restedPolicy: "fromGame" } });
    const fromGame = e.selectProfileUiKey();
    e.syncFromGame({
      characters: [
        {
          key: "Thrall-Forever",
          name: "Thrall",
          race: "Orc",
          cls: "Warrior",
          level: 1,
          schemaVersion: 2,
          completedQuests: [],
          xpRested: 1500,
        },
      ],
    });
    expect(e.active()?.xpRested).toBe(1500);
    expect(e.selectProfileUiKey()).not.toBe(fromGame);
  });

  it("import keeps role, professions and the dungeon toggle", () => {
    const p = { ...sample(), role: "tank", professions: ["Mining", "Blacksmithing"], options: { showOptional: true, hideDone: false, dungeons: true } };
    const back = importProfileJson(JSON.stringify(p), { id: "x", now: 1 });
    expect(back.role).toBe("tank");
    expect(back.professions).toEqual(["Mining", "Blacksmithing"]);
    expect(back.options.dungeons).toBe(true);
  });

  it("round-trips schema 1", () => {
    const raw = {
      schema: 1,
      activeId: "keep-me",
      profiles: [sample()],
    };
    const loaded = migrate(raw);
    expect(loaded.loadError).toBeNull();
    expect(loaded.state.schema).toBe(1);
    expect(loaded.state.profiles).toEqual([sample()]);
    expect(loaded.state.activeId).toBe("keep-me");
    const again = migrate(JSON.parse(JSON.stringify(loaded.state)));
    expect(again.state.profiles).toEqual(loaded.state.profiles);
    expect(again.state.activeId).toBe(loaded.state.activeId);
  });

  it("does not throw away the raw backup for an unknown future schema", () => {
    const future = { schema: 2, extra: "keep", profiles: [{ id: "x" }] };
    const loaded = migrate(future);
    expect(loaded.state.profiles).toEqual([]);
    expect(loaded.backups.some((b) => b.raw === future || JSON.stringify(b.raw) === JSON.stringify(future))).toBe(true);
    expect(loaded.loadError).toBeTruthy();
  });

  it("falls back to an empty list on corrupt JSON without throwing", () => {
    const loaded = migrate("NOT JSON {");
    expect(loaded.state.profiles).toEqual([]);
    expect(loaded.state.activeId).toBeNull();
    expect(loaded.loadError).toBeTruthy();
  });

  it("sets loadError and keeps valid profiles when some entries fail the profile check", () => {
    const raw = {
      schema: 1,
      activeId: "keep-me",
      profiles: [sample(), { id: "nope", name: 1 }],
    };
    const loaded = migrate(raw);
    expect(loaded.state.profiles).toEqual([sample()]);
    expect(loaded.state.activeId).toBe("keep-me");
    expect(loaded.loadError).toBeTruthy();
    expect(loaded.preserve).toBe(true);
  });
});

describe("export / import", () => {
  it("round-trips a profile with steps, quests and addedQuests", () => {
    const p = sample();
    const json = exportProfile(p);
    const back = importProfileJson(json, { id: "new-id", now: 50 });
    expect(back.steps).toEqual(p.steps);
    expect(back.quests).toEqual(p.quests);
    expect(back.addedQuests).toEqual(p.addedQuests);
    expect(back.name).toBe(p.name);
    expect(back.race).toBe(p.race);
    expect(back.cls).toBe(p.cls);
    expect(back.schema).toBe(1);
    expect(back.id).toBe("new-id");
  });

  it("round-trips character.guid", () => {
    const p = { ...sample(), character: { name: "Thrall", realm: "Forever", guid: "Player-2-ABC" } };
    const back = importProfileJson(exportProfile(p), { id: "new-id", now: 50 });
    expect(back.character).toEqual({ name: "Thrall", realm: "Forever", guid: "Player-2-ABC" });
  });
});

describe("createProfileEngine", () => {
  it("persists ticks, cursor and profile across reload", () => {
    const storage = createMemoryStorage();
    const a = memoryEngine({ storage, id: () => "p1" });
    a.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    a.toggle("g:a");
    a.setCurrent({ guide: "1-6-durotar", step: "g:a" });
    a.setRouteStyle("speedrun");
    expect(a.isDone("g:a")).toBe(true);
    a.flush();
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy();

    const b = memoryEngine({ storage, id: () => "p2" });
    expect(b.active()?.id).toBe("p1");
    expect(b.isDone("g:a")).toBe(true);
    expect(b.current).toEqual({ guide: "1-6-durotar", step: "g:a" });
    expect(b.routeStyle).toBe("speedrun");
  });

  it("isolates ticks between two profiles", () => {
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.toggle("g:a");
    e.create({ name: "B", race: "Troll", cls: "Mage" });
    expect(e.isDone("g:a")).toBe(false);
    e.switchTo(e.profiles()[0]!.id);
    expect(e.isDone("g:a")).toBe(true);
  });

  it("copies guest ticks onto the first profile only", () => {
    const storage = createMemoryStorage();
    const e = memoryEngine({ storage });
    expect(e.active()).toBeNull();
    e.toggle("g:step");
    e.setCurrent({ guide: "1-6-durotar", step: "g:step" });
    e.setRouteStyle("speedrun");
    expect(e.isDone("g:step")).toBe(true);

    const first = e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    expect(first.steps["g:step"]).toEqual({ done: true, at: 1000 });
    expect(e.isDone("g:step")).toBe(true);
    expect(e.current).toEqual({ guide: "1-6-durotar", step: "g:step" });
    expect(e.routeStyle).toBe("speedrun");

    e.create({ name: "Other", race: "Troll", cls: "Mage" });
    expect(e.isDone("g:step")).toBe(false);
    expect(e.current).toBeUndefined();
    expect(e.routeStyle).toBe("balanced");
  });

  it("a second profile starts empty after the first has synced quests", () => {
    const e = memoryEngine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    e.toggle("g:a");
    const result = e.syncFromGame({
      lastCharacter: "Thrall-Forever",
      characters: [
        { key: "Thrall-Forever", name: "Thrall", race: "Orc", cls: "Warrior", level: 6, completedQuests: [788] },
      ],
    });
    expect(result.ok).toBe(true);
    expect(e.active()?.quests[788]).toBe("done");
    expect(e.active()?.steps["g:a"]).toEqual({ done: true, at: 1000 });

    const second = e.create({ name: "ReproB", race: "Troll", cls: "Mage" });
    expect(second.steps).toEqual({});
    expect(second.quests).toEqual({});
    expect(second.current).toBeUndefined();
    expect(e.isDone("g:a")).toBe(false);
  });

  it("implies already-loaded guide steps from a turnin without a quest catalog", () => {
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    const turnin: Step = {
      id: "g:turnin",
      n: 1,
      tags: {},
      text: [],
      actions: [{ type: "turnin", questId: 788, label: "Turn in" }],
      conditions: [],
    };
    const accept: Step = {
      id: "g:accept",
      n: 2,
      tags: {},
      text: [],
      actions: [{ type: "accept", questId: 788, label: "Accept" }],
      conditions: [],
    };
    e.setKnownSteps([turnin, accept]);
    e.toggle(turnin.id, turnin);
    expect(e.isDone(turnin.id)).toBe(true);
    expect(e.isDone(accept.id)).toBe(true);
    expect(e.active()?.steps[accept.id]).toBeUndefined();
  });

  it("does not persist guest ticks across reload", () => {
    const storage = createMemoryStorage();
    const a = memoryEngine({ storage });
    a.toggle("g:step");
    a.setCurrent({ guide: "1-6-durotar", step: "g:step" });
    a.setRouteStyle("speedrun");
    expect(a.isDone("g:step")).toBe(true);

    const b = memoryEngine({ storage });
    expect(b.active()).toBeNull();
    expect(b.isDone("g:step")).toBe(false);
    expect(b.current).toBeUndefined();
    expect(b.routeStyle).toBe("balanced");
  });

  it("does not write a backup on toggle or setCurrent", () => {
    const storage = createMemoryStorage();
    const a = memoryEngine({ storage, id: () => "p1" });
    a.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    a.toggle("g:a");
    a.setCurrent({ guide: "1-6-durotar", step: "g:a" });
    a.flush();
    expect(a.backups()).toEqual([]);
    const b = memoryEngine({ storage });
    expect(b.backups()).toEqual([]);
  });

  it("writes a rolling backup when options or profile fields change", () => {
    const storage = createMemoryStorage();
    const a = memoryEngine({ storage, id: () => "p1" });
    a.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    a.setOptions({ hideDone: true });
    a.flush();
    expect(a.backups().length).toBeGreaterThan(0);
    expect(a.backups()[0]).toBeDefined();
    const b = memoryEngine({ storage });
    expect(b.backups().length).toBeGreaterThan(0);
    expect(b.backups()[0]).toBeDefined();
  });

  it("defers storage writes until flush while keeping in-memory state current", () => {
    const storage = createMemoryStorage();
    const e = memoryEngine({ storage, id: () => "p1" });
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    const afterCreate = storage.getItem(STORAGE_KEY);
    e.toggle("g:a");
    expect(e.isDone("g:a")).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBe(afterCreate);
    e.flush();
    expect(storage.getItem(STORAGE_KEY)).not.toBe(afterCreate);
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY)!) as { profiles: Profile[] };
    expect(parsed.profiles[0]!.steps["g:a"]).toEqual({ done: true, at: 1000 });
  });

  it("preserves the raw envelope when some profiles are invalid and later saves do not overwrite it", () => {
    const storage = createMemoryStorage();
    const envelope = { schema: 1, activeId: "keep-me", profiles: [sample(), { id: "bad" }] };
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    const e = memoryEngine({ storage });
    expect(e.profiles()).toEqual([sample()]);
    expect(e.loadError()).toBeTruthy();
    expect(JSON.parse(storage.getItem(PRESERVED_KEY)!)).toEqual(envelope);
    e.rename("keep-me", "New");
    expect(JSON.parse(storage.getItem(PRESERVED_KEY)!)).toEqual(envelope);
  });

  it("keeps a preserved future schema after 6 later saves", () => {
    const storage = createMemoryStorage();
    const future = { schema: 2, extra: "keep-me", profiles: [{ id: "x" }] };
    storage.setItem(STORAGE_KEY, JSON.stringify(future));
    let n = 0;
    const e = memoryEngine({ storage, id: () => `id-${++n}` });
    expect(e.loadError()).toBeTruthy();
    expect(JSON.parse(storage.getItem(PRESERVED_KEY)!)).toEqual(future);
    for (let i = 0; i < 6; i++) {
      e.create({ name: `P${i}`, race: "Orc", cls: "Warrior" });
    }
    expect(e.profiles()).toHaveLength(6);
    expect(JSON.parse(storage.getItem(PRESERVED_KEY)!)).toEqual(future);
    expect(e.backups().length).toBeLessThanOrEqual(5);
  });

  it("countDone / isDone need loaded step objects; quest-steps alone no longer implies done", () => {
    const accept: Step = {
      id: "1-6-durotar:accept",
      n: 1,
      tags: {},
      text: [],
      actions: [{ type: "accept", questId: 788, label: "Accept" }],
      conditions: [],
    };
    const turnin: Step = {
      id: "1-6-durotar:turnin",
      n: 2,
      tags: {},
      text: [],
      actions: [{ type: "turnin", questId: 788, label: "Turn in" }],
      conditions: [],
    };
    const e = createProfileEngine({
      storage: createMemoryStorage(),
      now: () => 1000,
      id: () => "p1",
      stepsForQuest: (qid) => (qid === 788 ? [accept.id, turnin.id] : []),
    });
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.markQuestsDone([788]);
    expect(e.active()?.steps).toEqual({});
    // Without known steps, quest-done does not mark guide steps done.
    expect(e.countDone("1-6-durotar")).toBe(0);
    expect(e.isDone(accept.id)).toBe(false);
    e.setKnownSteps([accept, turnin]);
    expect(e.isDone(accept.id)).toBe(true);
    expect(e.isDone(turnin.id)).toBe(true);
    expect(e.countDone("1-6-durotar")).toBe(2);
    expect(e.isDone("1-6-durotar:other")).toBe(false);
  });

  it("countDone for a sub-pack ignores a shared-prefix tick that belongs to another sub-pack", () => {
    const a = miniStep("horde-20-40:a", [{ type: "xp", level: 22, label: "a" }]);
    const b = miniStep("horde-20-40:b", [{ type: "xp", level: 24, label: "b" }]);
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.noteGuides([
      miniGuide("horde-20-40-01-barrens-a", [a]),
      miniGuide("horde-20-40-04-needles", [b]),
    ]);
    e.setKnownSteps([a, b]);
    e.toggle(a.id);
    e.toggle(b.id);
    expect(e.countDone("horde-20-40-01-barrens-a")).toBe(1);
    expect(e.countDone("horde-20-40-04-needles")).toBe(1);
  });

  it("syncFromGame adds completed quests, updates level, and leaves race, class, and absent progress alone", () => {
    const e = memoryEngine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior", level: 5 });
    e.markQuestsDone([788, 999]);
    e.toggle("note-step");
    const before = e.active()!;
    expect(before.steps["note-step"]).toEqual({ done: true, at: 1000 });

    const exp: GameExport = {
      exportedAt: 50,
      lastCharacter: "Grom-Realm",
      characters: [
        {
          key: "Thrall-Forever",
          name: " thrall ",
          race: "Troll",
          cls: "Mage",
          level: 18,
          completedQuests: [4641, 788],
        },
        {
          key: "Grom-Realm",
          name: "Grom",
          race: "Orc",
          cls: "Warrior",
          level: 60,
          completedQuests: [1],
        },
      ],
    };
    const result = e.syncFromGame(exp);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.newlyMarked).toBe(1);
    const after = e.active()!;
    expect(after.quests[788]).toBe("done");
    expect(after.quests[999]).toBe("done");
    expect(after.quests[4641]).toBe("done");
    expect(after.steps["note-step"]).toEqual({ done: true, at: 1000 });
    expect(e.isDone("note-step")).toBe(true);
    expect(after.level).toBe(18);
    expect(after.race).toBe("Orc");
    expect(after.cls).toBe("Warrior");
  });

  it("linkGameCharacter stores guid and syncFromGame fills a missing guid for the same name and realm", () => {
    const e = memoryEngine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    e.linkGameCharacter({ name: "Thrall", realm: "Forever", guid: "Player-2-ABC" });
    expect(e.active()?.character).toEqual({ name: "Thrall", realm: "Forever", guid: "Player-2-ABC" });

    const unlinked = memoryEngine();
    unlinked.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    unlinked.linkGameCharacter({ name: "Thrall", realm: "Forever" });
    expect(unlinked.active()?.character).toEqual({ name: "Thrall", realm: "Forever" });
    unlinked.syncFromGame({
      characters: [
        {
          key: "Thrall-Forever",
          name: "Thrall",
          realm: "Forever",
          guid: "Player-2-FILL",
          race: "Orc",
          cls: "Warrior",
          level: 6,
          completedQuests: [788],
        },
      ],
    });
    expect(unlinked.active()?.character).toEqual({ name: "Thrall", realm: "Forever", guid: "Player-2-FILL" });

    unlinked.linkGameCharacter({ name: "Thrall", realm: "Renamed" });
    expect(unlinked.active()?.character).toEqual({ name: "Thrall", realm: "Renamed", guid: "Player-2-FILL" });
  });

  it("syncFromGame drops xpRested when a later export omits it", () => {
    const e = memoryEngine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior", level: 5 });
    const base = {
      key: "Thrall-Forever",
      name: "Thrall",
      race: "Orc" as const,
      cls: "Warrior" as const,
      level: 6,
      schemaVersion: 2,
      completedQuests: [] as number[],
    };
    e.syncFromGame({ characters: [{ ...base, xpRested: 4200 }] });
    expect(e.active()?.xpRested).toBe(4200);
    e.syncFromGame({ characters: [{ ...base, xpRested: 100 }] });
    expect(e.active()?.xpRested).toBe(100);
    e.syncFromGame({ characters: [base] });
    expect(e.active()?.xpRested).toBeUndefined();
  });

  it("syncFromGame does not change the profile on a name mismatch", () => {
    const e = memoryEngine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior", level: 5 });
    e.markQuestsDone([788]);
    const before = structuredClone(e.active());
    const result = e.syncFromGame({
      lastCharacter: "Grom-Realm",
      characters: [
        { key: "Grom-Realm", name: "Grom", race: "Orc", cls: "Hunter", level: 40, completedQuests: [1] },
      ],
    });
    expect(result).toMatchObject({ ok: false, reason: "name-mismatch", exportName: "Grom", profileName: "Thrall" });
    expect(e.active()).toEqual(before);
  });
});

const guideIndex: GuideIndex = {
  generatedAt: "t",
  brackets: [
    { label: "1-12", guides: ["durotar-1-12", "mulgore-1-12", "tirisfal-1-12"] },
    { label: "12-20", guides: ["barrens-12-20"] },
    { label: "20-40", guides: ["horde-20-40"] },
    { label: "Dungeons 13-60", guides: ["horde-dungeons-15-60"] },
  ],
  starts: [
    { race: ["Orc", "Troll"], label: "Durotar", firstGuide: "durotar-1-12" },
    { race: ["Tauren"], label: "Mulgore", firstGuide: "mulgore-1-12" },
  ],
};

function miniStep(id: string, actions: Step["actions"]): Step {
  return { id, n: 1, tags: {}, text: [], actions, conditions: [] };
}

function miniGuide(slug: string, steps: Step[]): Guide {
  return {
    slug,
    name: slug,
    displayName: slug,
    subgroup: "",
    minLevel: 1,
    maxLevel: 12,
    zones: [],
    source: "import",
    sections: [],
    steps,
  };
}

describe("reconcileProfile", () => {
  it("resets a stale slug to the race start pack and remaps quest-complete steps", () => {
    const doneBoth = miniStep("durotar-1-12:both", [
      { type: "accept", questId: 4641, label: "a" },
      { type: "turnin", questId: 788, label: "t" },
    ]);
    const noQuest = miniStep("durotar-1-12:walk", [{ type: "xp", level: 2, label: "grind" }]);
    const partial = miniStep("durotar-1-12:partial", [
      { type: "accept", questId: 4641, label: "a" },
      { type: "turnin", questId: 999, label: "t" },
    ]);
    const guide = miniGuide("durotar-1-12", [doneBoth, noQuest, partial]);
    const profile = sample();
    profile.steps = {
      "1-6-durotar:old": { done: true, at: 1 },
      "horde-20-40:keep": { done: true, at: 2 },
    };
    profile.quests = { 4641: "done", 788: "done", 999: "accepted" };
    const next = reconcileProfile(profile, guideIndex, new Map([[guide.slug, guide]]), 50);
    expect(next.current).toEqual({ guide: "durotar-1-12", step: "durotar-1-12:both" });
    expect(next.steps["1-6-durotar:old"]).toBeUndefined();
    expect(next.steps["horde-20-40:keep"]).toEqual({ done: true, at: 2 });
    expect(next.steps[doneBoth.id]).toEqual({ done: true, at: 50 });
    expect(next.steps[noQuest.id]).toBeUndefined();
    expect(next.steps[partial.id]).toBeUndefined();
  });

  it("clears the step when the replacement guide is not loaded yet", () => {
    const next = reconcileProfile(sample(), guideIndex, new Map(), 50);
    expect(next.current).toEqual({ guide: "durotar-1-12", step: "" });
  });

  it("leaves a current guide that still exists unchanged", () => {
    const profile = sample();
    profile.current = { guide: "barrens-12-20", step: "barrens-12-20:s1" };
    profile.steps = { "barrens-12-20:s1": { done: true, at: 3 }, "gone-guide:x": { done: true, at: 4 } };
    const loaded = miniGuide("barrens-12-20", [
      miniStep("barrens-12-20:s1", [{ type: "accept", questId: 4641, label: "a" }]),
      miniStep("barrens-12-20:other", [{ type: "turnin", questId: 788, label: "t" }]),
    ]);
    const next = reconcileProfile(profile, guideIndex, new Map([[loaded.slug, loaded]]), 50);
    expect(next.current).toEqual({ guide: "barrens-12-20", step: "barrens-12-20:s1" });
    expect(next.steps["barrens-12-20:s1"]).toEqual({ done: true, at: 3 });
    expect(next.steps["barrens-12-20:other"]).toBeUndefined();
    expect(next.steps["gone-guide:x"]).toBeUndefined();
  });

  it("migrates a checked absorbed step id onto the surviving merged card", () => {
    const survivor = { ...miniStep("durotar-1-12:keep", [{ type: "accept", questId: 4641, label: "a" }]), mergedIds: ["durotar-1-12:old"] };
    const guide = miniGuide("durotar-1-12", [survivor]);
    const profile = sample();
    profile.current = { guide: "durotar-1-12", step: "durotar-1-12:old" };
    profile.steps = { "durotar-1-12:old": { done: true, at: 4 }, "horde-20-40:keep": { done: true, at: 2 } };
    const next = reconcileProfile(profile, guideIndex, new Map([[guide.slug, guide]]), 50);
    expect(next.steps["durotar-1-12:keep"]).toEqual({ done: true, at: 4 });
    expect(next.steps["durotar-1-12:old"]).toBeUndefined();
    expect(next.steps["horde-20-40:keep"]).toEqual({ done: true, at: 2 });
    expect(next.current).toEqual({ guide: "durotar-1-12", step: "durotar-1-12:keep" });
  });

  it("keeps horde-20-40 and h4060 ticks when a sub-pack lists that prefix, and drops unknown prefixes", () => {
    const index: GuideIndex = {
      generatedAt: "t",
      brackets: [
        {
          label: "20-40",
          guides: ["horde-20-40-01-barrens-a"],
          idPrefixes: { "horde-20-40-01-barrens-a": ["horde-20-40-01-barrens-a", "horde-20-40"] },
        },
        {
          label: "40-60",
          guides: ["horde-40-60-01-stv"],
          idPrefixes: { "horde-40-60-01-stv": ["horde-40-60-01-stv", "h4060"] },
        },
      ],
      starts: [],
    };
    const profile = sample();
    profile.current = { guide: "horde-20-40-01-barrens-a", step: "horde-20-40:keep" };
    profile.steps = {
      "horde-20-40:keep": { done: true, at: 2 },
      "h4060:keep": { done: true, at: 3 },
      "gone-pack:drop": { done: true, at: 4 },
    };
    const next = reconcileProfile(profile, index, new Map(), 50);
    expect(next.steps["horde-20-40:keep"]).toEqual({ done: true, at: 2 });
    expect(next.steps["h4060:keep"]).toEqual({ done: true, at: 3 });
    expect(next.steps["gone-pack:drop"]).toBeUndefined();
    expect(next.current).toEqual({ guide: "horde-20-40-01-barrens-a", step: "horde-20-40:keep" });
  });

  it("uses the first leveling pack when the race has no start", () => {
    const index: GuideIndex = {
      generatedAt: "t",
      brackets: [
        { label: "Dungeons 13-60", guides: ["horde-dungeons-15-60"] },
        { label: "12-20", guides: ["barrens-12-20"] },
      ],
      starts: [{ race: ["Tauren"], label: "Mulgore", firstGuide: "mulgore-1-12" }],
    };
    const profile = sample();
    const next = reconcileProfile(profile, index, new Map(), 9);
    expect(next.current?.guide).toBe("barrens-12-20");
  });

  it("writes remapped ticks back so a reload keeps them and keeps backups", () => {
    const storage = createMemoryStorage();
    const profile = sample();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schema: 1,
        activeId: profile.id,
        profiles: [profile],
        backups: [{ at: 1, raw: { kept: true } }],
      }),
    );
    const step = miniStep("durotar-1-12:q", [{ type: "turnin", questId: 788, label: "t" }]);
    const e = memoryEngine({ storage });
    e.reconcileGuides(guideIndex, [miniGuide("durotar-1-12", [step])]);
    const again = memoryEngine({ storage });
    expect(again.active()?.current?.guide).toBe("durotar-1-12");
    expect(again.active()?.steps[step.id]).toEqual({ done: true, at: 1000 });
    expect(again.backups().some((b) => JSON.stringify(b.raw).includes("kept"))).toBe(true);
  });
});

describe("sub-pack step ids", () => {
  const splitIndex: GuideIndex = {
    generatedAt: "t",
    brackets: [
      {
        label: "20-40",
        guides: ["horde-20-40-01-barrens-a", "horde-20-40-04-needles"],
        idPrefixes: {
          "horde-20-40-01-barrens-a": ["horde-20-40-01-barrens-a", "horde-20-40"],
          "horde-20-40-04-needles": ["horde-20-40-04-needles", "horde-20-40"],
        },
      },
    ],
    starts: [{ race: ["Orc", "Troll"], label: "Durotar", firstGuide: "durotar-1-12" }],
  };

  it("keeps a stored sub-pack and advances inside that pack when the step id uses the shared prefix", () => {
    const keep = { ...miniStep("horde-20-40:keep", [{ type: "xp", level: 22, label: "k" }]), n: 1 };
    const next = { ...miniStep("horde-20-40:next", [{ type: "xp", level: 23, label: "n" }]), n: 2 };
    const other = { ...miniStep("horde-20-40:other", [{ type: "xp", level: 30, label: "o" }]), n: 1 };
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.reconcileGuides(splitIndex, [
      miniGuide("horde-20-40-01-barrens-a", [keep, next]),
      miniGuide("horde-20-40-04-needles", [other]),
    ]);
    e.setKnownSteps([keep, next, other]);
    e.toggle(keep.id);
    const before = e.active()!.steps;
    e.setCurrent({ guide: "horde-20-40-01-barrens-a", step: keep.id });
    expect(e.current).toEqual({ guide: "horde-20-40-01-barrens-a", step: next.id });
    expect(e.active()!.steps).toEqual(before);
    expect(() => e.stepStatus(keep)).not.toThrow();
  });

  it("does not assign a legacy shared prefix to one of several sub-packs", () => {
    const other = miniStep("horde-20-40:other", [{ type: "xp", level: 30, label: "o" }]);
    const keep = miniStep("horde-20-40:keep", [{ type: "xp", level: 22, label: "k" }]);
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.reconcileGuides(splitIndex, [
      miniGuide("horde-20-40-01-barrens-a", [other]),
      miniGuide("horde-20-40-04-needles", []),
    ]);
    e.setKnownSteps([other]);
    expect(() => e.setCurrent({ guide: "horde-20-40", step: "horde-20-40:keep" })).not.toThrow();
    expect(e.current?.guide).not.toBe("horde-20-40-01-barrens-a");
    expect(e.current?.guide).not.toBe("horde-20-40-04-needles");
    expect(e.current).toBeUndefined();
    expect(() => e.stepStatus(keep)).not.toThrow();
  });
});

describe("progress snapshot", () => {
  it("updates the toggled step and keeps an unrelated guide consistent with a full recompute", () => {
    const alphaStep = miniStep("alpha-route:a", [{ type: "turnin", questId: 100, label: "t" }]);
    const betaStep = miniStep("beta-route:a", [{ type: "turnin", questId: 200, label: "t" }]);
    const alpha = miniGuide("alpha-route", [alphaStep]);
    const beta = miniGuide("beta-route", [betaStep]);
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.noteGuides([alpha, beta]);
    e.setKnownSteps([alphaStep, betaStep]);
    expect(e.stepStatus(alphaStep).status).toBe("open");
    const betaBefore = e.stepStatus(betaStep);
    const betaCompletionBefore = e.guideCompletion("beta-route");

    e.toggle(alphaStep.id, alphaStep);
    expect(e.stepStatus(alphaStep).status).toBe("done");
    expect(e.isDone(alphaStep.id)).toBe(true);
    expect(e.stepStatus(betaStep)).toEqual(betaBefore);
    expect(e.guideCompletion("beta-route")).toEqual(betaCompletionBefore);

    const slow = memoryEngine({ id: () => "slow" });
    slow.create({ name: "A", race: "Orc", cls: "Warrior" });
    slow.noteGuides([alpha, beta]);
    slow.setKnownSteps([alphaStep, betaStep]);
    slow.toggle(alphaStep.id, alphaStep);
    expect(e.stepStatus(alphaStep)).toEqual(slow.stepStatus(alphaStep));
    expect(e.stepStatus(betaStep)).toEqual(slow.stepStatus(betaStep));
    expect(e.guideCompletion("alpha-route")).toEqual(slow.guideCompletion("alpha-route"));
    expect(e.guideCompletion("beta-route")).toEqual(slow.guideCompletion("beta-route"));
    expect(e.countDone("alpha-route")).toBe(slow.countDone("alpha-route"));
    expect(e.countDone("beta-route")).toBe(slow.countDone("beta-route"));
  });

  it("selectGuideCompletion returns the same object when that guide did not change", () => {
    const alphaStep = miniStep("alpha-route:a", [{ type: "turnin", questId: 100, label: "t" }]);
    const betaStep = miniStep("beta-route:a", [{ type: "turnin", questId: 200, label: "t" }]);
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.noteGuides([miniGuide("alpha-route", [alphaStep]), miniGuide("beta-route", [betaStep])]);
    e.setKnownSteps([alphaStep, betaStep]);
    const alpha = e.selectGuideCompletion("alpha-route");
    const beta = e.selectGuideCompletion("beta-route");
    e.toggle(alphaStep.id, alphaStep);
    expect(e.selectGuideCompletion("alpha-route")).not.toBe(alpha);
    expect(e.selectGuideCompletion("beta-route")).toBe(beta);
    expect(e.selectDone(betaStep.id)).toBe(false);
    e.toggle(betaStep.id, betaStep);
    expect(e.selectDone(betaStep.id)).toBe(true);
  });

  it("keeps selectMarkedCompletion total on the index step ids after the guide loads", () => {
    const counted = miniStep("g:counted", [{ type: "xp", level: 2, label: "c" }]);
    const speedOnly = { ...miniStep("g:speed", [{ type: "xp", level: 3, label: "s" }]), routes: ["speedrun" as const] };
    const stepIds = [counted.id, speedOnly.id];
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.noteGuides([miniGuide("g", [counted, speedOnly])]);
    expect(e.selectMarkedCompletion("g", stepIds)?.total).toBe(stepIds.length);
    e.setKnownSteps([counted, speedOnly]);
    expect(e.guideCompletion("g")?.total).toBeLessThan(stepIds.length);
    expect(e.selectMarkedCompletion("g", stepIds)?.total).toBe(stepIds.length);
  });

  it("does not run stale-cursor repair when setCurrent repeats the same step", () => {
    const keep = { ...miniStep("g:keep", [{ type: "xp", level: 1, label: "k" }]), n: 1 };
    const e = memoryEngine();
    e.create({ name: "A", race: "Orc", cls: "Warrior" });
    e.noteGuides([miniGuide("g", [keep])]);
    e.setKnownSteps([keep]);
    e.setCurrent({ guide: "g", step: keep.id });
    const revision = e.revision();
    e.setCurrent({ guide: "g", step: keep.id });
    expect(e.revision()).toBe(revision);
    expect(e.current).toEqual({ guide: "g", step: keep.id });
  });
});
