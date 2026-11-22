import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Step } from "../../data/schema";
import type { TipContext } from "../../lib/stepExtras";
import { StepCard } from "./StepCard";

const src = { sources: [{ url: "https://example.org", label: "test" }], verified: true };

const base: Step = {
  id: "t:1",
  n: 1,
  tags: {},
  conditions: [],
  text: [{ segments: [{ t: "Kill boars" }] }],
  actions: [],
};

const render = (step: Step, ctx?: TipContext) =>
  renderToStaticMarkup(
    createElement(StepCard, {
      step,
      isCurrent: false,
      isDone: false,
      lineVisible: () => true,
      onToggle: () => {},
      onSelect: () => {},
      tipCtx: ctx,
    }),
  );

describe("StepCard", () => {
  it("has no source toggle and no raw text", () => {
    const html = render({ ...base, ...({ raw: "step\n .goto 1,2,3" } as object) } as Step);
    expect(html).not.toMatch(/>\s*source\s*</i);
    expect(html).not.toContain(".goto");
    expect(html).not.toContain("<pre");
  });

  it("renders the best tip for the class and role, elite and profession chips", () => {
    const step: Step = {
      ...base,
      tips: [
        { kind: "general", text: "Generic tip", ...src },
        { kind: "general", text: "Hunter tip", classes: ["Hunter"], ...src },
        { kind: "general", text: "Warrior tank tip", classes: ["Warrior"], roles: ["tank"], ...src },
        { kind: "elite", text: "Pull the elite to the hut", ...src },
      ],
      professionHooks: [{ profession: "Cooking", itemName: "Chunk of Boar Meat", qty: 6, note: "Keep the boar meat", ...src }],
    };
    const html = render(step, { route: "balanced", dungeons: false, cls: "Warrior", role: "tank" });
    expect(html).toContain("Warrior tank tip");
    expect(html).not.toContain("Hunter tip");
    expect(html).not.toContain("Generic tip");
    expect(html).toContain("Elite");
    expect(html).toContain("Pull the elite to the hut");
    expect(html).toContain("Cooking");
    expect(html).toContain("6× Chunk of Boar Meat");
  });

  it("hides the tip slot when nothing matches", () => {
    const step: Step = { ...base, tips: [{ kind: "general", text: "Mage only", classes: ["Mage"], ...src }] };
    const html = render(step, { route: "balanced", dungeons: false, cls: "Warrior" });
    expect(html).not.toContain('data-testid="step-tip"');
  });

  it("shows route-filtered speed tips only on Speedrun", () => {
    const step: Step = { ...base, tips: [{ kind: "speed", text: "Skip the cave", routes: ["speedrun"], ...src }] };
    expect(render(step, { route: "balanced", dungeons: false })).not.toContain("Skip the cave");
    expect(render(step, { route: "speedrun", dungeons: false })).toContain("Skip the cave");
  });

  it("shows the dungeon badge with the instance name and the Balanced extra chip", () => {
    const step: Step = { ...base, dungeon: { name: "RFC" }, routes: ["balanced"] };
    const html = render(step, { route: "balanced", dungeons: false, guideHasSpeedrun: true });
    expect(html).toContain("Dungeon · RFC");
    expect(html).toContain("Balanced extra");
    expect(render(step, { route: "balanced", dungeons: false })).not.toContain("Balanced extra");
  });

  it("shows a quiet unverified chip with a tooltip when verified is false", () => {
    const html = render({ ...base, sources: [], verified: false });
    expect(html).toContain('data-testid="step-unverified"');
    expect(html).toContain('title="From WoW Forever data, not yet checked in game."');
    expect(html).toContain("Unverified");
    expect(html).toMatch(/step-unverified"[^>]*text-muted/);
    expect(html).not.toMatch(/step-unverified"[^>]*text-(warn|danger)/);
    expect(render({ ...base, sources: [], verified: true })).not.toContain("step-unverified");
    expect(render(base)).not.toContain("step-unverified");
  });

  it("puts the unverified chip after the objective line", () => {
    const html = render({ ...base, sources: [], verified: false });
    expect(html.indexOf("Kill boars")).toBeLessThan(html.indexOf("step-unverified"));
    expect(html.match(/step-unverified/g)?.length).toBe(1);
    const noText = render({ ...base, text: [], sources: [], verified: false });
    expect(noText.match(/step-unverified/g)?.length).toBe(1);
  });

  it("renders a blocked banner with accept-step link or not-in-guide note", () => {
    const html = renderToStaticMarkup(
      createElement(StepCard, {
        step: base,
        isCurrent: false,
        isDone: false,
        lineVisible: () => true,
        onToggle: () => {},
        onSelect: () => {},
        blocked: {
          text: "Blocked: pick up/finish Sample first (Renferrel, Silverpine Forest)",
          entries: [
            {
              questId: 1358,
              detail: "pick up/finish Sample first (Renferrel, Silverpine Forest)",
              acceptStepId: "g:a1358",
              notInGuide: false,
            },
            {
              questId: 99,
              detail: "pick up/finish Orphan first",
              notInGuide: true,
            },
          ],
        },
      }),
    );
    expect(html).toContain('data-testid="step-blocked"');
    expect(html).toContain("pick up/finish Sample first");
    expect(html).toContain("Go to accept step");
    expect(html).toContain("not in this guide");
  });

  it("shows the step XP total from sim.gained on the active route", () => {
    const step: Step = {
      ...base,
      sim: {
        balanced: { level: 5.2, gained: 1240, questXp: [{ questId: 1, xp: 800, fullXp: 1000 }] },
        speedrun: { level: 5.1, gained: 0 },
      },
    };
    const html = render(step, { route: "balanced", dungeons: false });
    expect(html).toContain('data-testid="step-xp"');
    expect(html).toContain("absolute right-2 top-2");
    expect(html).toContain("+1,240 XP");
    expect(html).toContain("Turn-ins +800 XP");
    expect(html).toContain("Kills/grind +440 XP");
    expect(html.indexOf("step-xp")).toBeLessThan(html.indexOf(">Kill boars"));
    expect(render(step, { route: "speedrun", dungeons: false })).not.toContain("+1,240 XP");
    expect(render({ ...base, sim: { balanced: { level: 5, gained: 0 } } }, { route: "balanced", dungeons: false })).not.toContain("+0 XP");
  });

  it("renders a level-up banner from the active route sim", () => {
    const step: Step = {
      ...base,
      sim: {
        balanced: {
          level: 14,
          gained: 500,
          levelUp: 14,
          next: { level: 15, quests: 2, xpGap: 0, mobs: [0, 0], mobLevel: 14 },
        },
        speedrun: { level: 13.2, gained: 0 },
      },
    };
    const balanced = render(step, { route: "balanced", dungeons: false });
    expect(balanced).toContain("Level 14!");
    expect(balanced).toContain("Next: 2 quests to reach 15.");
    expect(render(step, { route: "speedrun", dungeons: false })).not.toContain("Level 14!");
    expect(render(base, { route: "balanced", dungeons: false })).not.toContain("step-level-up");
  });

  it("disables the checkbox when the step is unavailable", () => {
    const html = renderToStaticMarkup(
      createElement(StepCard, {
        step: base,
        isCurrent: false,
        isDone: false,
        lineVisible: () => true,
        onToggle: () => {},
        onSelect: () => {},
        unavailableTag: "Unavailable",
      }),
    );
    expect(html).toContain('aria-label="Step 1 unavailable"');
    expect(html).toContain("disabled");
    expect(html).not.toContain("Mark step 1 not done");
    expect(html).toContain("tick-pop");
    expect(html).toContain("Unavailable");
  });
});
