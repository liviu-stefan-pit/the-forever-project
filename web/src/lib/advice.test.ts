import { describe, expect, it } from "vitest";
import type { Step, Tip } from "../data/schema";
import { resolveRoute } from "./resolveRoute";
import { cardTips } from "./stepExtras";

const src = [{ url: "https://example.com/test", label: "test" }];
const adv = (role: Tip["roles"], text: string, extra: Partial<Tip> = {}): Tip => ({ kind: "advice", text, roles: role, sources: [], verified: false, ...extra });
const general: Tip = { kind: "general", text: "general tip", sources: src, verified: true };
const step: Step = {
  id: "s",
  n: 1,
  tags: {},
  text: [],
  actions: [],
  conditions: [],
  sources: src,
  verified: true,
  tips: [general, adv(["tank"], "tank advice"), adv(["healer"], "healer advice"), adv(["dps"], "dps advice")],
};

describe("role advice tips", () => {
  it("never replaces the general tip, and shows the advice for the picked role only", () => {
    const t = cardTips(step, { route: "balanced", dungeons: false, role: "healer" });
    expect(t.tip?.text).toBe("general tip");
    expect(t.advice?.text).toBe("healer advice");
  });
  it("shows no advice when no role is picked", () => {
    expect(cardTips(step, { route: "balanced", dungeons: false }).advice).toBeUndefined();
  });
  it("prefers class-tagged advice for a matching class", () => {
    const s: Step = { ...step, tips: [adv(["tank"], "any tank"), adv(["tank"], "warrior tank", { classes: ["Warrior"] })] };
    expect(cardTips(s, { route: "balanced", dungeons: false, role: "tank", cls: "Warrior" }).advice?.text).toBe("warrior tank");
    expect(cardTips(s, { route: "balanced", dungeons: false, role: "tank", cls: "Druid" }).advice?.text).toBe("any tank");
  });
  it("does not mark a verified step unverified because of source-less advice", () => {
    expect(resolveRoute([step], { route: "balanced", dungeons: false, role: "tank" }).steps[0]!.unverified).toBe(false);
  });
});
