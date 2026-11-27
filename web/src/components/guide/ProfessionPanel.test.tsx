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
      Shaman: {
        verified: false,
        sources: [],
        primary: [
          {
            rank: 1,
            pair: ["Alchemy", "Engineering"],
            roles: ["dps", "healer"],
            reason:
              "Orc enhancement: Forever DB scores Alchemy and Engineering S for Enhancement and names them partners. Smithing is also S, but taking it drops the nets. Orc elemental: Same S pair as Enhancement. Orc restoration: Restoration stays on the shared S pair. Troll enhancement: Troll shaman is legal: Questie 3084 is class 64 and race bit 128. Berserking and beast slaying do not change the S pair. Tauren skipped: No Forever note for Tauren. Do not add an herb circuit or a mining circuit. Buy herbs, ore, and parts, or skip the craft.",
          },
        ],
        secondary: [
          { profession: "First Aid", reason: "First Aid, then Cooking, then Fishing. Potions moved to First Aid." },
          { profession: "Cooking", reason: "First Aid, then Cooking, then Fishing. Potions moved to First Aid." },
          { profession: "Fishing", reason: "First Aid, then Cooking, then Fishing. Potions moved to First Aid." },
        ],
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

  it("shows the player's specs as separate lines and collapses other races", () => {
    const html = render({ cls: "Shaman", race: "Orc", role: "dps" } as Profile);
    const enhancement = html.slice(html.indexOf('data-spec="enhancement"'), html.indexOf('data-spec="elemental"'));
    expect(enhancement).toContain("Forever DB scores Alchemy and Engineering S");
    expect(enhancement).not.toContain("Troll");
    expect(enhancement).not.toContain("Buy herbs");
    expect(html).toContain("For your Orc Shaman");
    expect(html).toContain("Letter scores are from the WoW Forever lists");

    const otherSpecs = html.slice(html.indexOf('data-testid="other-specs"'), html.indexOf('data-testid="while-you-level"'));
    expect(otherSpecs).toContain("Other specs");
    expect(otherSpecs).toContain("Restoration");

    const level = html.slice(html.indexOf('data-testid="while-you-level"'), html.indexOf('data-testid="also-train"'));
    expect(level).toContain("Buy herbs, ore, and parts");

    const train = html.slice(html.indexOf('data-testid="also-train"'), html.indexOf('data-testid="other-races"'));
    expect(train.indexOf("First Aid")).toBeLessThan(train.indexOf("Cooking"));
    expect(train.indexOf("Cooking")).toBeLessThan(train.indexOf("Fishing"));
    expect(train.match(/Potions moved to First Aid/g)).toHaveLength(1);

    const others = html.slice(html.indexOf('data-testid="other-races"'));
    expect(others).toContain("Other races");
    expect(others).toContain("Questie 3084");
    expect(others).toContain("Not available for Tauren");
    expect(html.indexOf('data-spec="enhancement"')).toBeLessThan(html.indexOf('data-testid="other-races"'));
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
