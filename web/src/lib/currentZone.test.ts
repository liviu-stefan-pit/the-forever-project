import { describe, expect, it } from "vitest";
import { currentZone } from "./currentZone";

const sec = (zone: string, firstStep: string, lastStep: string) => ({ id: zone, mapId: 1, zone, firstStep, lastStep, stops: [], route: [] });
const guide = {
  steps: ["a", "b", "c", "d"].map((id, i) => ({ id, n: i + 1, tags: {}, conditions: [], text: [], actions: [] })),
  sections: [sec("Durotar", "a", "b"), sec("Orgrimmar", "c", "d")],
};

describe("currentZone", () => {
  it("names the zone of the section holding the current step", () => {
    expect(currentZone(guide, "c")).toBe("Orgrimmar");
    expect(currentZone(guide, "b")).toBe("Durotar");
  });
  it("falls back to the first section", () => {
    expect(currentZone(guide)).toBe("Durotar");
    expect(currentZone(guide, "zz")).toBe("Durotar");
    expect(currentZone(undefined)).toBeUndefined();
    expect(currentZone({ steps: [], sections: [] })).toBeUndefined();
  });
});
