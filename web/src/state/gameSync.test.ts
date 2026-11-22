import { describe, expect, it } from "vitest";
import { characterRealm, evaluateGameSync, linkFor, syncedFields } from "./gameSync";
import type { GameExport, GameExportCharacter } from "./luaExport";
import { createMemoryStorage, createProfileEngine } from "./profileStore";

function ch(partial: Partial<GameExportCharacter> & { key: string }): GameExportCharacter {
  return { completedQuests: [], ...partial };
}

describe("evaluateGameSync", () => {
  it("matches the profile name case-insensitively and returns quest ids", () => {
    const exp: GameExport = {
      exportedAt: 100,
      characters: [ch({ key: "Thrall-Forever", name: " thrall ", level: 12, completedQuests: [788, 4641], exportedAt: 200 })],
    };
    const result = evaluateGameSync(exp, "Thrall");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.questIds).toEqual([788, 4641]);
    expect(result.level).toBe(12);
    expect(result.exportedAt).toBe(200);
    expect(result.character.key).toBe("Thrall-Forever");
  });

  it("refuses to guess when an unlinked profile name exists on several realms", () => {
    const exp: GameExport = {
      lastCharacter: "Thrall-Alt",
      characters: [
        ch({ key: "Thrall-Forever", name: "Thrall", completedQuests: [1] }),
        ch({ key: "Thrall-Alt", name: "Thrall", completedQuests: [2], level: 4 }),
      ],
    };
    expect(evaluateGameSync(exp, "thrall")).toMatchObject({ ok: false, reason: "ambiguous", profileName: "thrall" });

    const otherLast: GameExport = {
      lastCharacter: "Grom-Alt",
      characters: [
        ch({ key: "Thrall-Forever", name: "Thrall", completedQuests: [1], level: 9 }),
        ch({ key: "Grom-Alt", name: "Grom", completedQuests: [2] }),
      ],
    };
    const single = evaluateGameSync(otherLast, "Thrall");
    expect(single.ok).toBe(true);
    if (single.ok) {
      expect(single.character.key).toBe("Thrall-Forever");
      expect(single.link).toEqual({ name: "Thrall", realm: "Forever" });
      expect(single.questIds).toEqual([1]);
    }
  });

  it("matches a linked profile on name + realm only", () => {
    const exp: GameExport = {
      lastCharacter: "Thrall-Alt",
      characters: [
        ch({ key: "Thrall-Forever", name: "Thrall", realm: "Forever", completedQuests: [1] }),
        ch({ key: "Thrall-Alt", name: "Thrall", realm: "Alt", completedQuests: [2] }),
      ],
    };
    const linked = evaluateGameSync(exp, "Thrall", { name: "Thrall", realm: "Forever" });
    expect(linked.ok).toBe(true);
    if (linked.ok) expect(linked.questIds).toEqual([1]);

    // Name and realm match case-insensitively.
    const byNameRealm = evaluateGameSync(exp, "Thrall", { name: "thrall", realm: "alt" });
    expect(byNameRealm.ok && byNameRealm.character.key).toBe("Thrall-Alt");

    // Same name on a realm that is not in the export: nothing is applied.
    expect(evaluateGameSync(exp, "Thrall", { name: "Thrall", realm: "Other" })).toMatchObject({
      ok: false,
      reason: "link-missing",
      linkKey: "Thrall-Other",
    });
  });

  it("follows an explicit link even when the profile name differs from the character", () => {
    const exp: GameExport = {
      characters: [ch({ key: "Zugrok-Forever", name: "Zugrok", completedQuests: [788] })],
    };
    expect(evaluateGameSync(exp, "My Warrior")).toMatchObject({ ok: false, reason: "name-mismatch" });
    const r = evaluateGameSync(exp, "My Warrior", { name: "Zugrok", realm: "Forever" });
    expect(r.ok).toBe(true);
  });

  it("accepts a schema-2 character with no completed quests (fresh character)", () => {
    const exp: GameExport = {
      characters: [ch({ key: "Newbie-Forever", name: "Newbie", level: 1, schemaVersion: 2, completedQuests: [] })],
    };
    expect(evaluateGameSync(exp, "Newbie")).toMatchObject({ ok: true, level: 1 });
  });

  it("does not select a different name when lastCharacter mismatches", () => {
    const exp: GameExport = {
      lastCharacter: "Grom-Realm",
      exportedAt: 50,
      characters: [
        ch({ key: "Thrall-Forever", name: "Thrall", completedQuests: [1] }),
        ch({ key: "Grom-Realm", name: "Grom", completedQuests: [2] }),
      ],
    };
    const result = evaluateGameSync(exp, "Cairne");
    expect(result).toMatchObject({
      ok: false,
      reason: "name-mismatch",
      exportName: "Grom",
      profileName: "Cairne",
    });
  });

  it("returns empty when the matched character has no completed quests", () => {
    const exp: GameExport = {
      characters: [ch({ key: "Thrall-Forever", name: "Thrall", level: 3, completedQuests: [] })],
    };
    expect(evaluateGameSync(exp, "Thrall")).toMatchObject({ ok: false, reason: "empty" });
  });

  it("returns no-profile when the profile name is blank and missing when there is no export", () => {
    const exp: GameExport = {
      characters: [ch({ key: "Thrall-Forever", name: "Thrall", completedQuests: [1] })],
    };
    expect(evaluateGameSync(exp, "  ")).toEqual({ ok: false, reason: "no-profile" });
    expect(evaluateGameSync(null, "Thrall")).toEqual({ ok: false, reason: "missing" });
    expect(evaluateGameSync({ characters: [] }, "Thrall").ok).toBe(false);
    expect(evaluateGameSync({ characters: [] }, "Thrall")).toMatchObject({ reason: "missing" });
  });

  it("does not read a realm from the key when realm is present but empty", () => {
    const empty = ch({ key: "Throgar-Surname", name: "Throgar", realm: "" });
    expect(characterRealm(empty)).toBeUndefined();
    expect(linkFor(empty)).toEqual({ name: "Throgar", realm: "" });
    const blank = ch({ key: "Throgar-Surname", name: "Throgar", realm: "   " });
    expect(characterRealm(blank)).toBeUndefined();
    const missing = ch({ key: "Thrall-Azralon", name: "Thrall" });
    expect(characterRealm(missing)).toBe("Azralon");
  });

  it("matches an unlinked profile on a normalized full name", () => {
    const exp: GameExport = {
      characters: [ch({ key: "Throgar-x", name: "Throgar  Stonehand", realm: "", completedQuests: [3] })],
    };
    const result = evaluateGameSync(exp, " throgar-stonehand ");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.link).toEqual({ name: "Throgar  Stonehand", realm: "" });
  });

  it("matches one legacy first-name export and refuses two", () => {
    const one: GameExport = {
      characters: [ch({ key: "Throgar-Surname", name: "Throgar", realm: "", completedQuests: [3] })],
    };
    const hit = evaluateGameSync(one, "Throgar Stonehand");
    expect(hit.ok).toBe(true);
    if (hit.ok) expect(hit.link?.name).toBe("Throgar");

    const two: GameExport = {
      characters: [
        ch({ key: "Throgar-A", name: "Throgar", realm: "A", completedQuests: [1] }),
        ch({ key: "Throgar-B", name: "Throgar", realm: "B", completedQuests: [2] }),
      ],
    };
    expect(evaluateGameSync(two, "Throgar Stonehand")).toMatchObject({ ok: false, reason: "ambiguous" });
  });

  it("upgrades a first-name link to the full name and matches by guid", () => {
    const exp: GameExport = {
      characters: [
        ch({
          key: "Throgar-Forever",
          name: "Throgar Stonehand",
          firstName: "Throgar",
          surname: "Stonehand",
          realm: "Forever",
          guid: "abc",
          completedQuests: [9],
        }),
      ],
    };
    const upgraded = evaluateGameSync(exp, "Alt", { name: "Throgar", realm: "Forever" });
    expect(upgraded.ok).toBe(true);
    if (upgraded.ok) expect(upgraded.link).toEqual({ name: "Throgar Stonehand", realm: "Forever", guid: "abc" });

    const renamed: GameExport = {
      characters: [ch({ key: "X", name: "New Name", realm: "Forever", guid: "abc", completedQuests: [9] })],
    };
    const byGuid = evaluateGameSync(renamed, "Alt", { name: "Old Name", realm: "Other", guid: "abc" });
    expect(byGuid.ok).toBe(true);
    if (byGuid.ok) expect(byGuid.link?.name).toBe("New Name");

    const noGuid: GameExport = {
      characters: [
        ch({
          key: "Throgar-Forever",
          name: "Throgar Stonehand",
          firstName: "Throgar",
          surname: "Stonehand",
          realm: "Forever",
          completedQuests: [9],
        }),
      ],
    };
    const kept = evaluateGameSync(noGuid, "Alt", { name: "Throgar Stonehand", realm: "Forever", guid: "kept" });
    expect(kept.ok).toBe(true);
    if (kept.ok) expect(kept.link).toEqual({ name: "Throgar Stonehand", realm: "Forever", guid: "kept" });
  });

  it("lists every export name on a mismatch", () => {
    const exp: GameExport = {
      lastCharacter: "Grom-Realm",
      characters: [
        ch({ key: "Thrall-Forever", name: "Thrall", completedQuests: [1] }),
        ch({ key: "Grom-Realm", name: "Grom", completedQuests: [2] }),
      ],
    };
    expect(evaluateGameSync(exp, "Cairne")).toMatchObject({
      ok: false,
      reason: "name-mismatch",
      exportNames: ["Thrall", "Grom"],
    });
  });

  it("falls back to the db exportedAt when the character has none", () => {
    const exp: GameExport = {
      exportedAt: 333,
      characters: [ch({ key: "Thrall-Forever", name: "Thrall", completedQuests: [7] })],
    };
    const result = evaluateGameSync(exp, "Thrall");
    expect(result.ok && result.exportedAt).toBe(333);
  });
});

function engine() {
  let n = 0;
  const clock = { t: 1000 };
  return {
    clock,
    e: createProfileEngine({ storage: createMemoryStorage(), now: () => clock.t, id: () => `id-${++n}` }),
  };
}

describe("v4 sync rules", () => {
  it("does not treat an empty v3 quest log as known, and a v4 questLogOk empty log is known", () => {
    const { e, clock } = engine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    const seeded: GameExport = {
      characters: [
        ch({
          key: "Thrall-Forever",
          name: "Thrall",
          schemaVersion: 3,
          completedQuests: [1],
          questLog: [{ id: 788, title: "Cutting Teeth", complete: false, objectives: [{ text: "Boars", finished: false, done: 1, total: 10 }] }],
          skills: [{ name: "Mining", rank: 10, max: 75, kind: "primary" }],
        }),
      ],
    };
    expect(e.syncFromGame(seeded).ok).toBe(true);
    expect(e.active()!.questLogSyncedAt).toBe(new Date(1000).toISOString());
    expect(e.active()!.questLog?.[0]?.objectives?.[0]).toEqual({ text: "Boars", finished: false, numFulfilled: 1, numRequired: 10 });

    clock.t = 2000;
    const emptyV3: GameExport = {
      characters: [
        ch({
          key: "Thrall-Forever",
          name: "Thrall",
          schemaVersion: 3,
          completedQuests: [1],
          questLog: [],
          skills: [{ name: "Mining", rank: 10, max: 75, kind: "primary" }],
        }),
      ],
    };
    e.syncFromGame(emptyV3);
    expect(e.active()!.questLog?.map((q) => q.questId)).toEqual([788]);
    expect(e.active()!.questLogSyncedAt).toBe(new Date(1000).toISOString());

    clock.t = 3000;
    const emptyV4: GameExport = {
      characters: [
        ch({
          key: "Thrall-Forever",
          name: "Thrall",
          schemaVersion: 4,
          questLogOk: true,
          skillsOk: true,
          completedQuests: [1],
          questLog: [],
          skills: [{ name: "Mining", rank: 10, max: 75, kind: "primary" }],
        }),
      ],
    };
    e.syncFromGame(emptyV4);
    expect(e.active()!.questLog).toEqual([]);
    expect(e.active()!.questLogSyncedAt).toBe(new Date(3000).toISOString());
  });

  it("does not wipe skills when skillsOk is false, unions taxi, and maps skillID 186 to Mining", () => {
    const { e, clock } = engine();
    e.create({ name: "Thrall", race: "Troll", cls: "Hunter" });
    e.syncFromGame({
      characters: [
        ch({
          key: "Thrall-Forever",
          name: "Thrall",
          race: "Orc",
          cls: "Warrior",
          schemaVersion: 4,
          skillsOk: true,
          questLogOk: true,
          completedQuests: [1],
          skills: [{ name: "Skinning", rank: 5, max: 75, kind: "primary", skillID: 393 }],
          taxi: [{ id: 22, name: "Crossroads, The Barrens", mapId: 1413 }],
        }),
      ],
    });
    expect(e.active()!.skills).toEqual({ Skinning: { cur: 5, max: 75 } });
    expect(e.active()!.race).toBe("Orc");
    expect(e.active()!.cls).toBe("Warrior");
    expect(e.active()!.flightPaths).toEqual([{ id: 22, name: "Crossroads, The Barrens", mapId: 1413 }]);

    clock.t = 2000;
    e.syncFromGame({
      characters: [
        ch({
          key: "Thrall-Forever",
          name: "Thrall",
          schemaVersion: 4,
          skillsOk: false,
          questLogOk: false,
          completedQuests: [1],
          skills: [],
          taxi: [{ id: 23, name: "Camp Taurajo, The Barrens", mapId: 1413 }],
        }),
      ],
    });
    expect(e.active()!.skills).toEqual({ Skinning: { cur: 5, max: 75 } });
    expect(e.active()!.professions).toEqual(["Skinning"]);
    expect(e.active()!.flightPaths?.map((n) => n.id)).toEqual([22, 23]);
    expect(e.active()!.exportWarnings).toEqual(["quest log", "professions", "durability"]);

    expect(
      syncedFields(
        ch({
          key: "x",
          skills: [{ name: "Bergbau", rank: 40, max: 75, kind: "primary", skillID: 186 }],
        }),
      ).skills,
    ).toEqual({ Mining: { cur: 40, max: 75 } });
  });

  it("warns on a schema-4 export when durabilityOk is false or missing, and not when it is true", () => {
    const { e } = engine();
    e.create({ name: "Thrall", race: "Orc", cls: "Warrior" });
    const base = {
      key: "Thrall-Forever",
      name: "Thrall",
      schemaVersion: 4 as const,
      questLogOk: true,
      skillsOk: true,
      completedQuests: [1],
    };
    e.syncFromGame({ characters: [ch({ ...base, durabilityOk: false })] });
    expect(e.active()!.exportWarnings).toContain("durability");

    e.syncFromGame({ characters: [ch(base)] });
    expect(e.active()!.exportWarnings).toContain("durability");

    e.syncFromGame({ characters: [ch({ ...base, durabilityOk: true })] });
    expect(e.active()!.exportWarnings ?? []).not.toContain("durability");
  });
});
