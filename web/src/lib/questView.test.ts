import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { QuestInfo } from "../data/schema";
import {
  namedChain,
  questHeatPoints,
  questLeg,
  questMapPins,
  questMapSection,
  wowheadQuestUrl,
} from "./questView";

const quests = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/quests.json", import.meta.url)), "utf-8"),
) as QuestInfo[];
const byId = new Map(quests.map((q) => [q.id, q]));

describe("wowheadQuestUrl", () => {
  it("links vanilla quests to wowhead classic and skips custom quests", () => {
    expect(wowheadQuestUrl(byId.get(788)!)).toBe("https://www.wowhead.com/classic/quest=788");
    expect(wowheadQuestUrl(byId.get(97279)!)).toBeUndefined();
  });
});

describe("quest chain", () => {
  it("names prerequisite and follow-up ids from the quest map", () => {
    const sarkoth = byId.get(790)!;
    expect(sarkoth.next).toBe(804);
    expect(namedChain([sarkoth.next!], byId)).toEqual([{ id: 804, name: byId.get(804)!.name }]);
    expect(namedChain([99999], byId)).toEqual([{ id: 99999, name: "Quest 99999" }]);
  });
});

describe("quest map overlay", () => {
  it("pins giver and ender and limits objective heat to a handful of points", () => {
    const q = byId.get(788)!;
    const pins = questMapPins(q);
    expect(pins.some((p) => p.kind === "start" && p.label === "Gornek")).toBe(true);
    expect(pins.some((p) => p.kind === "end")).toBe(true);
    expect(pins.every((p) => p.x !== 0 || p.y !== 0)).toBe(true);

    const many: QuestInfo = {
      ...q,
      objectives: [
        {
          kind: "kill",
          name: "Boar",
          at: Array.from({ length: 40 }, (_, i) => ({
            mapId: 1411,
            x: 40 + i,
            y: 60 + (i % 5),
            zone: "Durotar",
            exact: true,
          })),
        },
      ],
    };
    expect(questHeatPoints(many).length).toBeLessThanOrEqual(8);
    expect(questHeatPoints(many).length).toBeGreaterThan(0);
  });

  it("keeps the start-to-end path on the display map", () => {
    const at = (mapId: number, x: number, y: number) => ({
      mapId,
      x,
      y,
      zone: mapId === 1411 ? "Durotar" : "Elsewhere",
      exact: true,
    });
    const q = {
      mapId: 1411,
      start: [
        { name: "Here", at: [at(1411, 10, 20)] },
        { name: "Foreign", at: [at(9999, 1, 2)] },
      ],
      end: [{ name: "Ender", at: [at(1411, 80, 90)] }],
      objectives: [
        { at: [at(1411, 40, 50), at(9999, 3, 4)] },
      ],
    } as QuestInfo;

    const leg = questLeg(q);
    expect(leg.path).toEqual([
      { x: 10, y: 20 },
      { x: 40, y: 50 },
      { x: 80, y: 90 },
    ]);
    expect(leg.pins.map((p) => p.label)).toEqual(["Here", "Ender"]);
    expect(leg.pins.map((p) => p.kind)).toEqual(["start", "end"]);
    expect(leg.pins.every((p) => p.mapId === 1411)).toBe(true);
    expect(questMapPins(q).some((p) => p.mapId === 9999)).toBe(false);
    expect(questHeatPoints(q)).toEqual([{ x: 40, y: 50 }]);
  });

  it("builds a section the P8 map can render without inventing stops", () => {
    const sec = questMapSection(byId.get(788)!);
    expect(sec.mapId).toBe(1411);
    expect(sec.zone).toBe("Durotar");
    expect(sec.stops).toEqual([]);
    expect(sec.route).toEqual([]);
  });
});
