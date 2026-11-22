import { describe, expect, it } from "vitest";
import type { RouteStyle } from "../data/schema";
import { LEVELING_CHAINS } from "./xp/simulate";
import { resolveNextGuide, resolvePrevGuide } from "./routeChains";

const STYLES: RouteStyle[] = ["speedrun", "balanced"];

describe("resolveNextGuide / resolvePrevGuide", () => {
  it("sends Durotar, Mulgore, and Zephras to Barrens in both styles, with no previous guide", () => {
    for (const slug of ["durotar-1-12", "mulgore-1-12", "zephras-isle"]) {
      for (const style of STYLES) {
        expect(resolveNextGuide(slug, style), `${slug} ${style} next`).toBe("barrens-12-20");
        expect(resolvePrevGuide(slug, style), `${slug} ${style} prev`).toBeUndefined();
      }
    }
  });

  it("skips Silverpine on the Tirisfal speedrun and enters it on balanced", () => {
    expect(resolveNextGuide("tirisfal-1-12", "speedrun")).toBe("barrens-12-20");
    expect(resolvePrevGuide("tirisfal-1-12", "speedrun")).toBeUndefined();
    expect(resolveNextGuide("tirisfal-1-12", "balanced")).toBe("silverpine-11-15");
    expect(resolvePrevGuide("tirisfal-1-12", "balanced")).toBeUndefined();
  });

  it("keeps Silverpine off the speedrun route and hands it to Barrens on balanced", () => {
    expect(resolveNextGuide("silverpine-11-15", "speedrun")).toBeUndefined();
    expect(resolvePrevGuide("silverpine-11-15", "speedrun")).toBeUndefined();
    expect(resolveNextGuide("silverpine-11-15", "balanced")).toBe("barrens-12-20");
    expect(resolvePrevGuide("silverpine-11-15", "balanced")).toBe("tirisfal-1-12");
  });

  it("continues Barrens into the first 20-40 pack in both styles", () => {
    for (const style of STYLES) {
      expect(resolveNextGuide("barrens-12-20", style)).toBe("horde-20-40-01-barrens-a");
    }
  });

  it("ends the route on the wrapup pack and points back at Hyjal to 60", () => {
    for (const style of STYLES) {
      expect(resolveNextGuide("horde-40-60-09-wrapup", style)).toBeUndefined();
      expect(resolvePrevGuide("horde-40-60-09-wrapup", style)).toBe("horde-40-60-08-hyjal-to-60");
    }
  });
});

describe("LEVELING_CHAINS", () => {
  it("uses the speedrun undead list (Tirisfal → Barrens, Silverpine omitted)", () => {
    const undead = LEVELING_CHAINS.find((c) => c.id === "undead");
    expect(undead?.packs[0]).toBe("tirisfal-1-12");
    expect(undead?.packs[1]).toBe("barrens-12-20");
    expect(undead?.packs).not.toContain("silverpine-11-15");
    expect(undead?.handoff).toMatch(/Speedrun tirisfal-1-12 takes the zeppelin/);
    expect(undead?.handoff).toMatch(/Silverpine is not on this route/);
  });
});
