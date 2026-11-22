import { describe, expect, it } from "vitest";
import { approach, particleBudget, seamSide, seamSlope, seamTarget, seamX, type Seam } from "./fusion";

const flat = (cx: number, slope: number): Seam => ({ cx, cy: 400, slope, amp: 0, t: 0 });

describe("landing fusion background maths", () => {
  it("moves the seam towards the hovered card's opposite side", () => {
    expect(seamTarget(1440, null)).toBe(0.5);
    expect(seamTarget(1440, "horde")).toBeGreaterThan(0.5);
    expect(seamTarget(1440, "alliance")).toBeLessThan(0.5);
  });

  it("leans gently on wide screens and steeply on phones, so stacked cards land on their own side", () => {
    expect(seamSlope(1440, 900)).toBeCloseTo(-0.22);
    const w = 390;
    const h = 844;
    const s: Seam = { cx: w / 2, cy: h / 2, slope: seamSlope(w, h), amp: 0, t: 0 };
    // Horde card centred near the top, Alliance card near the bottom.
    expect(seamSide(s, w / 2, h * 0.3)).toBeLessThan(0);
    expect(seamSide(s, w / 2, h * 0.78)).toBeGreaterThan(0);
  });

  it("is negative on the Horde (left) side and positive on the Alliance (right) side", () => {
    const s = flat(500, -0.2);
    expect(seamX(s, 400)).toBe(500);
    expect(seamSide(s, 300, 400)).toBeLessThan(0);
    expect(seamSide(s, 700, 400)).toBeGreaterThan(0);
    // Top of the screen leans right.
    expect(seamX(s, 0)).toBeGreaterThan(seamX(s, 800));
  });

  it("keeps the particle count between phone and 4K limits", () => {
    expect(particleBudget(375, 667)).toBe(40);
    expect(particleBudget(3840, 2160)).toBe(150);
    const mid = particleBudget(1440, 900);
    expect(mid).toBeGreaterThan(40);
    expect(mid).toBeLessThan(150);
  });

  it("eases towards a target without overshooting", () => {
    const v = approach(0, 1, 0.1, 0.45);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
    expect(approach(0, 1, 10, 0.45)).toBeCloseTo(1, 5);
  });
});
