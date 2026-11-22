import { describe, expect, it } from "vitest";
import type { Step } from "../data/schema";
import { legendKinds, stepMarkers } from "./mapMarkers";

const prov = { sources: [], verified: false };
const at = (x: number, y: number) => ({ mapId: 1411, zone: "Durotar", x, y });

const step: Step = {
  id: "t:1",
  n: 1,
  tags: {},
  conditions: [],
  text: [],
  actions: [],
  pins: [
    { kind: "npc", npcId: 1, name: "Vendor Joe", at: at(10, 10), service: "vendor", ...prov },
    { kind: "npc", npcId: 2, name: "Trainer Ann", at: at(20, 20), service: "trainer", ...prov },
    { kind: "npc", npcId: 3, name: "Razor Hill FP", at: at(30, 30), service: "flightPath", ...prov },
    { kind: "npc", npcId: 4, name: "Elsewhere", at: { ...at(1, 1), mapId: 1412 }, service: "vendor", ...prov },
    { kind: "mobArea", npcIds: [5], name: "Boars", mapId: 1411, zone: "Durotar", polygon: [{ x: 40, y: 40 }, { x: 50, y: 40 }, { x: 45, y: 50 }], ...prov },
    { kind: "mobArea", npcIds: [6], name: "Scorpids", mapId: 1411, zone: "Durotar", center: { x: 60, y: 60 }, radius: 4, ...prov },
  ],
};

describe("stepMarkers", () => {
  it("maps hand-placed pins to marker kinds on the current map only", () => {
    const m = stepMarkers(step, undefined, 1411);
    expect(m.map((x) => x.kind).sort()).toEqual(["flightPath", "mobArea", "mobArea", "trainer", "vendor"]);
    expect(m.find((x) => x.label === "Elsewhere")).toBeUndefined();
    const boars = m.find((x) => x.label === "Boars")!;
    expect(boars.polygon).toHaveLength(3);
    expect(boars.x).toBeCloseTo(45);
    expect(m.find((x) => x.label === "Scorpids")!.radius).toBe(4);
  });

  it("orders the legend", () => {
    expect(legendKinds(stepMarkers(step, undefined, 1411))).toEqual(["mobArea", "vendor", "trainer", "flightPath"]);
  });

  it("returns nothing without a step", () => {
    expect(stepMarkers(undefined, undefined, 1411)).toEqual([]);
  });
});
