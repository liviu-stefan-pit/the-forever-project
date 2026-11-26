import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
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
    createElement(MemoryRouter, null, createElement(StepCard, {
      step,
      isCurrent: false,
      isDone: false,
      lineVisible: () => true,
      onToggle: () => {},
      onSelect: () => {},
      tipCtx: ctx,
    })),
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
    const html = render(step, { route: "balanced", dungeons: false, cls: "Warrior", role: "tank", professions: ["Cooking"] });
    expect(html).toContain("Warrior tank tip");
    expect(html).not.toContain("Hunter tip");
    expect(html).not.toContain("Generic tip");
    expect(html).toContain("Elite");
    expect(html).toContain("Pull the elite to the hut");
    expect(html).toContain("Cooking");
    expect(html).toContain("6× Chunk of Boar Meat");
  });

  it("keeps profession notes off the cards until the character has professions", () => {
    const step: Step = {
      ...base,
      professionHooks: [
        { profession: "Cooking", note: "Keep the boar meat", ...src },
        { profession: "Mining", note: "Mine copper here", ...src },
      ],
    };
    const none = render(step, { route: "balanced", dungeons: false });
    expect(none).not.toContain("Keep the boar meat");
    expect(none).not.toContain("Mine copper here");
    const picked = render(step, { route: "balanced", dungeons: false, professions: ["Mining"] });
    expect(picked).toContain("Mine copper here");
    expect(picked).not.toContain("Keep the boar meat");
    const synced = render(step, { route: "balanced", dungeons: false, skills: { Cooking: { cur: 10, max: 75 } } });
    expect(synced).toContain("Keep the boar meat");
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

  it("puts the unverified chip once, in the top row before the objectives", () => {
    const html = render({ ...base, sources: [], verified: false });
    expect(html.indexOf("step-unverified")).toBeLessThan(html.indexOf("Kill boars"));
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
    expect(html).not.toContain("sm:absolute");
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

  it("shows a revealed step for another class in full, but read-only", () => {
    const html = renderToStaticMarkup(
      createElement(StepCard, {
        step: base,
        isCurrent: false,
        isDone: false,
        lineVisible: () => true,
        onToggle: () => {},
        onSelect: () => {},
        unavailableTag: "Unavailable",
        preview: true,
      }),
    );
    expect(html).toContain("Kill boars");
    expect(html).toContain("Not for your character");
    expect(html).toContain('data-collapsed="false"');
    expect(html).toContain('data-done="false"');
    expect(html).toContain("disabled");
  });

  describe("lines and waypoints", () => {
    const goto = (x: number, y: number) => ({ type: "goto" as const, at: { mapId: 1, x, y, zone: "Zephras Isle", exact: true } });

    it("puts each waypoint on the line that names its quest, with the place in bold", () => {
      const html = render({
        ...base,
        text: [
          { segments: [{ t: "Town stop 4 (level 6). Last stop:" }] },
          { segments: [{ t: "Valreaa Valewind: turn in Aggressive Encroachment." }] },
          { segments: [{ t: "Aetheen of the Gales: turn in Foul Matriarch, accept The Adventurer." }] },
          { segments: [{ t: "Train your level 6 spells." }] },
        ],
        actions: [
          goto(42.4, 25.2),
          { type: "turnin", questId: 1, label: "Aggressive Encroachment" },
          goto(42.8, 23.7),
          { type: "turnin", questId: 2, label: "Foul Matriarch" },
          { type: "accept", questId: 3, label: "The Adventurer" },
          { type: "trainer", label: "Visit your class trainer" },
        ],
      });
      const lines = html.split('data-testid="step-line"').slice(1);
      expect(lines).toHaveLength(4);
      expect(lines[1]).toContain(">Valreaa Valewind: <");
      expect(lines[1]).toContain("42.4, 25.2");
      expect(lines[2]).toContain("42.8, 23.7");
      expect(lines[0]).not.toContain("step-way");
      expect(lines[3]).not.toContain("step-way");
      // quests are highlighted in the sentence, not repeated as chips
      expect(html.match(/data-testid="mark-turnin"/g)?.length).toBe(2);
      expect(html.match(/data-testid="mark-accept"/g)?.length).toBe(1);
      expect(html).not.toContain(">Turn in<");
      // "Train your level 6 spells" already says it, so no trainer chip
      expect(html).not.toContain("Visit your class trainer");
    });

    it("keeps a chip for an action the text never mentions", () => {
      const html = render({
        ...base,
        text: [{ segments: [{ t: "Pick up the crate by the well." }] }],
        actions: [{ type: "trainer", label: "Visit your class trainer" }],
      });
      expect(html).toContain("Visit your class trainer");
    });

    it("puts a single waypoint on the line without a place label", () => {
      const html = render({
        ...base,
        text: [{ segments: [{ t: "Hand The Adventurer over to Raan Wildwind." }] }],
        actions: [goto(41.7, 44.8), { type: "turnin", questId: 3, label: "The Adventurer" }],
      });
      expect(html.match(/data-testid="step-way"/g)?.length).toBe(1);
      expect(html).toContain("mark-turnin");
    });

    it("doesn't read a quest name with a colon as a place", () => {
      const html = render({
        ...base,
        text: [{ segments: [{ t: "Accept WANTED: Vulgara the Insatiable." }] }],
        actions: [goto(43.4, 45.8), { type: "accept", questId: 4, label: "WANTED: Vulgara the Insatiable" }],
      });
      expect(html).not.toContain("<strong");
      expect(html).toContain("mark-accept");
    });

    it("keeps the place when the NPC and the quest share a name", () => {
      const html = render({
        ...base,
        text: [{ segments: [{ t: "Aetheen of the Gales: turn in Aetheen of the Gales." }] }],
        actions: [goto(42.8, 23.7), { type: "turnin", questId: 5, label: "Aetheen of the Gales" }],
      });
      expect(html).toContain(">Aetheen of the Gales: <");
      expect(html).toContain("mark-turnin");
    });

    it("gives each NPC line its own waypoint when a quest name shows up on two lines", () => {
      const html = render({
        ...base,
        text: [
          { segments: [{ t: "Rorian the Dayseeker: turn in Return to Rorian, accept Aetheen of the Gales." }] },
          { segments: [{ t: "Aetheen of the Gales: turn in Aetheen of the Gales, accept Foul Matriarch." }] },
        ],
        actions: [
          goto(42.0, 23.5),
          { type: "turnin", questId: 7, label: "Return to Rorian" },
          { type: "accept", questId: 8, label: "Aetheen of the Gales" },
          goto(42.8, 23.7),
          { type: "turnin", questId: 8, label: "Aetheen of the Gales" },
          { type: "accept", questId: 9, label: "Foul Matriarch" },
        ],
      });
      const lines = html.split('data-testid="step-line"').slice(1);
      expect(lines[0]).toContain("42.0, 23.5");
      expect(lines[0]).not.toContain("42.8, 23.7");
      expect(lines[1]).toContain("42.8, 23.7");
      expect(lines[1]).toContain(">Aetheen of the Gales: <");
    });

    it("hides objective chips the text already says when nothing is synced", () => {
      const html = render({
        ...base,
        text: [{ segments: [{ t: "Den: kill 8 Ursera Scavengers and Urs'anah, and take her head." }] }],
        actions: [
          goto(37.8, 26.1),
          { type: "complete", questId: 6, objective: 1, label: "Ursera Scavengers" },
          { type: "complete", questId: 6, objective: 2, label: "Head of Urs'anah" },
        ],
      });
      expect(html).not.toContain(">Complete<");
      expect(html).not.toContain("Head of Urs'anah");
      expect(html).not.toContain("step-count");
    });
  });

  it("folds a finished step to one line", () => {
    const html = renderToStaticMarkup(
      createElement(StepCard, { step: base, isCurrent: false, isDone: true, lineVisible: () => true, onToggle: () => {}, onSelect: () => {} }),
    );
    expect(html).toContain('data-testid="step-fold"');
    expect(html).toContain('data-testid="step-summary"');
    expect(html).not.toContain("step-areas");
  });
});
