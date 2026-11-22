import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Profile } from "../../data/schema";
import type { TipContext } from "../../lib/stepExtras";
import { ProfessionPanel } from "./ProfessionPanel";

vi.mock("../../data/hooks", () => ({
  useClassProfessions: () => ({
    status: "ready",
    data: {
      Priest: {
        verified: false,
        sources: [],
        primary: [{ rank: 1, pair: ["Tailoring", "Enchanting"], reason: "cloth" }],
        secondary: [],
        levelingPlan: [],
      },
    },
  }),
  dataOf: (r: { status: string; data?: unknown }) => (r.status === "ready" ? r.data : undefined),
}));

const ctx: TipContext = { route: "speedrun", dungeons: false };

function render(profile: Profile | null) {
  return renderToStaticMarkup(createElement(ProfessionPanel, { profile, step: undefined, ctx }));
}

describe("ProfessionPanel", () => {
  it("labels an unverified class recommendation without hiding the chip", () => {
    const html = render({ cls: "Priest" } as Profile);
    expect(html).toContain("Recommendation unverified");
    expect(html).toContain('title="From WoW Forever data, not yet checked in game."');
    expect(html).not.toContain("Synced from game");
  });

  it("notes that skill bars came from a game sync", () => {
    const html = render({
      cls: "Priest",
      skills: { Tailoring: { cur: 40, max: 75 } },
    } as Profile);
    expect(html).toContain("Synced from game");
    expect(html).toContain("Tailoring");
    expect(html).toContain("40/75");
  });
});
