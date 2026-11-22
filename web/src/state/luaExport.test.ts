import { describe, expect, it } from "vitest";
import { parseGuideWebExport } from "./luaExport";

const FIXTURE = `
GuideWebExportDB = {
	["version"] = 1,
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
		},
	},
}
`;

describe("parseGuideWebExport", () => {
  it("reads quest ids from a completion list and from a GetQuestsCompleted set", () => {
    const list = `
GuideWebExportDB = {
  characters = {
    ["Thrall-Forever"] = {
      name = "Thrall",
      completed = { 788, 4641 },
    },
  },
}
`;
    const set = `
GuideWebExportDB = {
  characters = {
    ["Thrall-Forever"] = {
      name = "Thrall",
      completed = { [4641] = true, [788] = true },
    },
  },
}
`;
    expect(parseGuideWebExport(list).characters[0]!.completedQuests).toEqual([788, 4641]);
    expect(parseGuideWebExport(set).characters[0]!.completedQuests).toEqual([788, 4641]);
  });

  it("reads completed quest ids and character fields from a SavedVariables snippet", () => {
    const parsed = parseGuideWebExport(FIXTURE);
    expect(parsed.lastCharacter).toBe("Thrall-Forever");
    expect(parsed.characters).toHaveLength(1);
    const c = parsed.characters[0]!;
    expect(c.key).toBe("Thrall-Forever");
    expect(c.name).toBe("Thrall");
    expect(c.race).toBe("Orc");
    expect(c.cls).toBe("Warrior");
    expect(c.level).toBe(12);
    expect(c.completedQuests).toEqual([788, 4641]);
  });

  it("skips a maps table sibling without walking it and still parses character fields", () => {
    const text = `
GuideWebExportDB = {
	["version"] = 1,
	["lastCharacter"] = "Thrall-Forever",
	maps = {
		big = {
			nested = {
				oops = this_identifier_is_not_a_value,
			},
		},
	},
	["characters"] = {
		["Thrall-Forever"] = {
			["name"] = "Thrall",
			["race"] = "Orc",
			["raceName"] = "Orc",
			["class"] = "WARRIOR",
			["className"] = "Warrior",
			["level"] = 12,
			["completed"] = {
				788, -- [1]
				4641, -- [2]
			},
		},
	},
}
`;
    const parsed = parseGuideWebExport(text);
    expect(parsed.lastCharacter).toBe("Thrall-Forever");
    const c = parsed.characters[0]!;
    expect(c.name).toBe("Thrall");
    expect(c.race).toBe("Orc");
    expect(c.cls).toBe("Warrior");
    expect(c.level).toBe(12);
    expect(c.completedQuests).toEqual([788, 4641]);
  });

  it("maps Undead/Scourge and class tokens", () => {
    const text = `
GuideWebExportDB = {
  characters = {
    ["Bob-Realm"] = {
      name = "Bob",
      race = "Scourge",
      raceName = "Undead",
      class = "MAGE",
      className = "Mage",
      level = 20,
      completed = { 1, 2, 3 },
    },
  },
  lastCharacter = "Bob-Realm",
}
`;
    const c = parseGuideWebExport(text).characters[0]!;
    expect(c.race).toBe("Undead");
    expect(c.cls).toBe("Mage");
    expect(c.completedQuests).toEqual([1, 2, 3]);
  });

  it("keeps exportedAt and still skips a maps blob", () => {
    const text = `
GuideWebExportDB = {
  exportedAt = 1700000000,
  exportedAtText = "2023-11-14",
  lastCharacter = "Thrall-Forever",
  maps = {
    zone = {
      junk = not_a_lua_value,
    },
  },
  characters = {
    ["Thrall-Forever"] = {
      name = "Thrall",
      level = 12,
      exportedAt = 1700001111,
      completed = { 788 },
    },
  },
}
`;
    const parsed = parseGuideWebExport(text);
    expect(parsed.exportedAt).toBe(1700000000);
    expect(parsed.characters[0]!.exportedAt).toBe(1700001111);
    expect(parsed.characters[0]!.completedQuests).toEqual([788]);
    expect(parsed.characters[0]!.name).toBe("Thrall");
  });

  it("reads firstName, surname, and guid, and keeps an empty realm empty", () => {
    const text = `
GuideWebExportDB = {
  schemaVersion = 2,
  characters = {
    ["Throgar-Surname"] = {
      name = "Throgar Stonehand",
      firstName = "Throgar",
      surname = "Stonehand",
      guid = "guid-1",
      realm = "",
      level = 4,
      completed = { 1 },
    },
    ["Thrall-Azralon"] = {
      name = "Thrall",
      firstName = "",
      surname = "",
      guid = "",
      level = 2,
      completed = { 2 },
    },
  },
}
`;
    const parsed = parseGuideWebExport(text);
    const throgar = parsed.characters.find((c) => c.key === "Throgar-Surname")!;
    expect(throgar.name).toBe("Throgar Stonehand");
    expect(throgar.firstName).toBe("Throgar");
    expect(throgar.surname).toBe("Stonehand");
    expect(throgar.guid).toBe("guid-1");
    expect(throgar.realm).toBe("");
    const thrall = parsed.characters.find((c) => c.key === "Thrall-Azralon")!;
    expect(thrall.firstName).toBeUndefined();
    expect(thrall.surname).toBeUndefined();
    expect(thrall.guid).toBeUndefined();
    expect(thrall.realm).toBe("Azralon");
  });

  it("parses a v4 snapshot and drops a quest-log row whose id is not a number", () => {
    const text = `
GuideWebExportDB = {
  schemaVersion = 4,
  lastCharacter = "Thrall-Forever",
  characters = {
    ["Thrall-Forever"] = {
      schemaVersion = 4,
      name = "Thrall",
      race = "Orc",
      class = "WARRIOR",
      level = 12,
      questLogOk = true,
      skillsOk = false,
      questLog = {
        { id = "nope", title = "Bad" },
        { id = 788, title = "Cutting Teeth", level = 2, complete = 1, objectives = {
          { text = "Mottled Boar slain: 1/10", type = "monster", finished = false, numFulfilled = 1, numRequired = 10 },
        } },
      },
      skills = {
        { skillID = 186, name = "Bergbau", kind = "primary", rank = 40, max = 75, modifier = 0, temp = 0, categoryID = 11 },
        { skillID = 762, name = "Riding", kind = "riding", rank = 75, max = 75 },
        { name = "Swords", kind = "weapon", rank = 10, max = 300 },
      },
      taxi = {
        [22] = { name = "Crossroads, The Barrens", mapId = 1413 },
      },
      taxiOk = true,
      bind = "Razor Hill, Durotar",
      bindOk = true,
      bags = { [6948] = 1, [118] = 5 },
      bagsOk = true,
      xp = 10, xpMax = 100, xpRested = 20, xpPercent = 10, restState = 1,
      position = { mapId = 1411, zone = "Durotar", subzone = "Razor Hill", x = 51.2, y = 42.5 },
      positionOk = true,
      reputation = {
        { factionID = 76, name = "Orgrimmar", reaction = 5, current = 1200, min = 0, max = 3000, isHeader = false, atWar = false },
      },
      reputationOk = true,
      spells = { riding = 75, mount = true, known = { 6648 } },
      spellsOk = true,
      durability = { pct = 80, lowestSlot = 16 },
      durabilityOk = true,
      petOk = false,
      deadOrGhost = false,
      completed = { 1 },
    },
  },
}
`;
    const c = parseGuideWebExport(text).characters[0]!;
    expect(c.schemaVersion).toBe(4);
    expect(c.questLogOk).toBe(true);
    expect(c.skillsOk).toBe(false);
    expect(c.questLog?.map((q) => q.id)).toEqual([788]);
    expect(c.questLog?.[0]?.objectives[0]).toMatchObject({ text: "Mottled Boar slain: 1/10", numFulfilled: 1, numRequired: 10, finished: false });
    expect(c.skills?.map((s) => [s.skillID, s.kind])).toEqual([[186, "primary"], [762, "riding"], [undefined, "weapon"]]);
    expect(c.taxi).toEqual([{ id: 22, name: "Crossroads, The Barrens", mapId: 1413 }]);
    expect(c.bind).toBe("Razor Hill, Durotar");
    expect(c.bags).toEqual({ 6948: 1, 118: 5 });
    expect(c.position?.zone).toBe("Durotar");
    expect(c.reputation?.[0]?.name).toBe("Orgrimmar");
    expect(c.spells).toEqual({ riding: 75, mount: true, known: [6648] });
    expect(c.durability).toEqual({ pct: 80, lowestSlot: 16 });
    expect(c.deadOrGhost).toBe(false);
    expect(c.pet).toBeUndefined();
  });

  it("treats a v3 empty quest log as present but not confirmed", () => {
    const text = `
GuideWebExportDB = {
  characters = {
    ["Thrall-Forever"] = {
      schemaVersion = 3,
      name = "Thrall",
      class = "WARRIOR",
      questLog = {},
      completed = { 1 },
    },
  },
}
`;
    const c = parseGuideWebExport(text).characters[0]!;
    expect(c.schemaVersion).toBe(3);
    expect(c.questLog).toEqual([]);
    expect(c.questLogOk).toBeUndefined();
  });
});
