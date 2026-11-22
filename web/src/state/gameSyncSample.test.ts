import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Profile } from "../data/schema";
import { parseGuideWebExport, type GameExport } from "./luaExport";
import { createMemoryStorage, createProfileEngine, migrate, STORAGE_KEY } from "./profileStore";

const SAMPLE = readFileSync(
  fileURLToPath(new URL("../../../contracts/fixtures/GuideWebExport.sample.lua", import.meta.url)),
  "utf8",
);

/** Real Classic quest ids in the sample (Valley of Trials, Durotar, The Barrens), checked against QuestieDB. */
const SAMPLE_QUESTS = [
  784, 786, 788, 789, 790, 791, 792, 794, 804, 805, 806, 808, 812, 815, 817, 818, 823, 825, 826, 827, 828, 829, 830,
  831, 834, 835, 837, 840, 842, 844, 845, 848, 850, 851, 852, 853, 867, 868, 869, 870, 871, 872, 875, 877, 880, 881,
  893, 899, 903, 2161, 3281, 4402, 4641, 5041, 5441, 6365, 6384, 6385, 6386, 6394,
];

function engine(storage = createMemoryStorage(), clock = { t: 1000 }) {
  let n = 0;
  return createProfileEngine({ storage, now: () => clock.t, id: () => `id-${++n}` });
}

describe("GuideWebExport.sample.lua", () => {
  it("parses every exported field", () => {
    const exp = parseGuideWebExport(SAMPLE);
    expect(exp.schemaVersion).toBe(4);
    expect(exp.lastCharacter).toBe("Zugrok Grimfang-Forever");
    expect(exp.characters).toHaveLength(1);
    const c = exp.characters[0]!;
    expect(c).toMatchObject({
      key: "Zugrok Grimfang-Forever",
      name: "Zugrok Grimfang",
      firstName: "Zugrok",
      surname: "Grimfang",
      guid: "Player-2-0A1B2C3D",
      realm: "Forever",
      race: "Orc",
      cls: "Warrior",
      level: 24,
      faction: "Horde",
      schemaVersion: 4,
      xp: 9135,
      xpMax: 17700,
      xpRested: 4200,
      money: 289251,
    });
    expect([...c.completedQuests].sort((a, b) => a - b)).toEqual(SAMPLE_QUESTS);
    expect(c.skills?.filter((s) => s.kind === "primary" || s.kind === "secondary").map((s) => [s.name, s.rank, s.max, s.kind])).toEqual([
      ["Mining", 112, 150, "primary"],
      ["Blacksmithing", 105, 150, "primary"],
      ["Cooking", 87, 150, "secondary"],
      ["First Aid", 120, 150, "secondary"],
    ]);
    expect(c.skills?.find((s) => s.name === "Two-Handed Maces")).toMatchObject({ rank: 112, kind: "weapon" });
    expect(c.gear).toHaveLength(9);
    expect(c.gear?.find((g) => g.slot === 16)).toEqual({ slot: 16, slotName: "mainhand", itemId: 5322, name: "Demolition Hammer" });
    expect(c.questLog?.map((q) => q.id)).toEqual([876, 878]);
    expect(c.questLog?.[1]?.objectives[1]).toMatchObject({
      text: "Bristleback Thornweaver slain: 7/12",
      done: 7,
      total: 12,
      finished: false,
    });
  });

  it("Sync populates level, quests, professions, gold, gear and quest log on a fresh profile", () => {
    const e = engine();
    e.create({ name: "Zugrok Grimfang", race: "Orc", cls: "Warrior", level: 1 });
    const result = e.syncFromGame(parseGuideWebExport(SAMPLE));
    expect(result).toMatchObject({ ok: true, newlyMarked: SAMPLE_QUESTS.length, snapshotApplied: true });

    const p = e.active()!;
    expect(p.level).toBe(24);
    for (const q of SAMPLE_QUESTS) expect(p.quests[q]).toBe("done");
    expect(p.character).toEqual({ name: "Zugrok Grimfang", realm: "Forever", guid: "Player-2-0A1B2C3D" });
    expect(p.money).toBe(289251);
    expect(p.syncedAt).toBe(1000);
    expect(p.skills).toEqual({
      Mining: { cur: 112, max: 150 },
      Blacksmithing: { cur: 105, max: 150 },
      Cooking: { cur: 87, max: 150 },
      "First Aid": { cur: 120, max: 150 },
    });
    expect(p.professions).toEqual(["Blacksmithing", "Mining", "Cooking", "First Aid"]);
    expect(p.gear).toEqual({ 5: 4922, 6: 5328, 7: 2694, 8: 4946, 9: 6062, 10: 4914, 11: 5351, 15: 5314, 16: 5322 });
    expect(p.questLog?.map((q) => q.questId)).toEqual([876, 878]);
    expect(p.questLog?.[1]?.complete).toBe(0);
    expect(p.questLogSyncedAt).toBe(new Date(1000).toISOString());

    // A second identical sync changes nothing.
    expect(e.syncFromGame(parseGuideWebExport(SAMPLE))).toMatchObject({ ok: true, newlyMarked: 0, snapshotApplied: false });
  });

  it("overwrites level, professions, gold and gear on re-sync but never unmarks quests", () => {
    const clock = { t: 1000 };
    const e = engine(createMemoryStorage(), clock);
    e.create({ name: "Zugrok Grimfang", race: "Orc", cls: "Warrior" });
    e.syncFromGame(parseGuideWebExport(SAMPLE));

    const next: GameExport = parseGuideWebExport(SAMPLE);
    const c = next.characters[0]!;
    c.level = 23; // e.g. a different save restored: still overwritten
    c.money = 50;
    c.completedQuests = [788, 7777];
    c.skills = [{ name: "Mining", rank: 125, max: 150, kind: "primary" }];
    c.gear = [{ slot: 16, itemId: 5318, name: "Zhovur Axe" }];
    c.questLog = [];
    c.schemaVersion = 3;
    clock.t = 2000;
    expect(e.syncFromGame(next)).toMatchObject({ ok: true, newlyMarked: 1, snapshotApplied: true });

    const p = e.active()!;
    expect(p.level).toBe(23);
    expect(p.money).toBe(50);
    expect(p.syncedAt).toBe(2000);
    expect(p.skills).toEqual({
      Mining: { cur: 125, max: 150 },
      Blacksmithing: { cur: 105, max: 150 },
    });
    // Cooking and First Aid left the skills list. Blacksmithing stays because the export professions table still has it.
    expect(p.professions).toEqual(["Blacksmithing", "Mining"]);
    expect(p.gear).toEqual({ 16: 5318 });
    expect(p.quests[7777]).toBe("done");
    for (const q of SAMPLE_QUESTS) expect(p.quests[q]).toBe("done");
    // schema 3 with an empty quest log is not a known log: keep the previous snapshot.
    expect(p.questLog?.map((q) => q.questId)).toEqual([876, 878]);
    expect(p.questLogSyncedAt).toBe(new Date(1000).toISOString());
  });

  it("an explicit link syncs a profile whose name differs from the character", () => {
    const e = engine();
    e.create({ name: "My Warrior", race: "Orc", cls: "Warrior" });
    expect(e.syncFromGame(parseGuideWebExport(SAMPLE))).toMatchObject({ ok: false, reason: "name-mismatch" });
    expect(e.active()!.syncedAt).toBeUndefined();

    e.linkGameCharacter({ name: "Zugrok Grimfang", realm: "Forever" });
    expect(e.syncFromGame(parseGuideWebExport(SAMPLE)).ok).toBe(true);
    expect(e.active()!.level).toBe(24);
    expect(e.active()!.name).toBe("My Warrior");

    e.linkGameCharacter(null);
    expect(e.active()!.character).toBeUndefined();
  });

  it("a profile linked to another realm is not touched by a same-name character", () => {
    const e = engine();
    e.create({ name: "Zugrok Grimfang", race: "Orc", cls: "Warrior", level: 5 });
    e.linkGameCharacter({ name: "Zugrok Grimfang", realm: "OtherRealm" });
    const before = structuredClone(e.active());
    expect(e.syncFromGame(parseGuideWebExport(SAMPLE))).toMatchObject({ ok: false, reason: "link-missing" });
    expect(e.active()).toEqual(before);
  });

  it("the synced profile survives a save/load round trip", () => {
    const storage = createMemoryStorage();
    const e = engine(storage);
    e.create({ name: "Zugrok Grimfang", race: "Orc", cls: "Warrior" });
    e.syncFromGame(parseGuideWebExport(SAMPLE));
    const reloaded = migrate(storage.getItem(STORAGE_KEY));
    expect(reloaded.loadError).toBeNull();
    expect(reloaded.state.profiles[0]?.money).toBe(289251);
    expect(reloaded.state.profiles[0]?.character?.realm).toBe("Forever");
    expect(reloaded.state.profiles[0]?.gear?.[16]).toBe(5322);
  });
});

describe("professions stay in step with synced skills", () => {
  it("keeps a planned profession the game never reported, within the two-primary limit", () => {
    const e = engine();
    e.create({ name: "Zugrok Grimfang", race: "Orc", cls: "Warrior" });
    // Planned before syncing: Herbalism (primary) + Fishing (secondary).
    const active = e.active()!;
    e.importParsed(JSON.stringify({ ...active, professions: ["Herbalism", "Fishing"] }));
    e.syncFromGame(parseGuideWebExport(SAMPLE));
    // Mining + Blacksmithing fill both primary slots, so planned Herbalism is dropped; Fishing stays.
    expect(e.active()!.professions).toEqual(["Blacksmithing", "Mining", "Cooking", "First Aid", "Fishing"]);
  });
});

describe("backward compatibility", () => {
  const OLD_EXPORT = `
GuideWebExportDB = {
	["version"] = 1,
	["exportedAt"] = 1700000000,
	["lastCharacter"] = "Thrall-Forever",
	["characters"] = {
		["Thrall-Forever"] = {
			["name"] = "Thrall",
			["race"] = "Orc",
			["raceName"] = "Orc",
			["class"] = "WARRIOR",
			["className"] = "Warrior",
			["level"] = 12,
			["faction"] = "Horde",
			["completed"] = {
				788, -- [1]
				4641, -- [2]
			},
			["completedCount"] = 2,
			["probe"] = {
				["mapID"] = 1411,
			},
			["exportedAt"] = 1700000000,
		},
	},
}
`;

  it("an old-format (v1) export still syncs quests and level and stores no snapshot", () => {
    const exp = parseGuideWebExport(OLD_EXPORT);
    const c = exp.characters[0]!;
    expect(c.schemaVersion).toBeUndefined();
    expect(c.skills).toBeUndefined();
    expect(c.realm).toBe("Forever");

    let n = 0;
    const e = createProfileEngine({ storage: createMemoryStorage(), now: () => 1000, id: () => `id-${++n}` });
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior", level: 3 });
    expect(e.syncFromGame(exp)).toMatchObject({ ok: true, newlyMarked: 2, snapshotApplied: false });
    const p = e.active()!;
    expect(p.quests[788]).toBe("done");
    expect(p.quests[4641]).toBe("done");
    expect(p.level).toBe(12);
    expect(p.skills).toBeUndefined();
    expect(p.money).toBeUndefined();
    expect(p.gear).toBeUndefined();
  });

  it("profiles saved before the synced fields (character, skills, money, gear) existed still load", () => {
    const old: Profile = {
      id: "old",
      name: "Thrall",
      race: "Orc",
      cls: "Warrior",
      level: 9,
      routeStyle: "balanced",
      options: { showOptional: true, hideDone: false },
      steps: {},
      quests: { 788: "done" },
      addedQuests: [],
      createdAt: 1,
      updatedAt: 2,
      schema: 1,
    };
    const r = migrate(JSON.stringify({ schema: 1, activeId: "old", profiles: [old], guestRouteStyle: "balanced" }));
    expect(r.loadError).toBeNull();
    expect(r.state.profiles).toEqual([old]);
  });
});
