import { describe, expect, it } from "vitest";
import { validateDungeonPlan, type IntegrationPlan, type RouteTimeline } from "./dungeonPlan.ts";

const timeline: RouteTimeline = {
  packs: [{ id: "p", steps: ["a:pickup", "a:hub", "a:run"].map((id) => ({ id, zone: "Tanaris", hubs: [] })) as never }],
};

function plan(beforeRun?: boolean): IntegrationPlan {
  return {
    dungeons: [
      {
        id: "zf",
        levels: [44, 54],
        byRoute: {
          balanced: {
            byRace: {
              all: {
                includedQuestIds: [1],
                run: { afterStepId: "a:run", estLevel: 50 },
                turnins: [{ afterStepId: "a:hub", questIds: [1], dungeonStepIds: ["d:turnin:1"], beforeRun }],
              },
            },
          },
        },
      },
    ],
  };
}

describe("validateDungeonPlan turn-ins before the run", () => {
  it("rejects a turn-in anchored before the run", () => {
    expect(validateDungeonPlan(plan(), new Map(), timeline).map((e) => e.code)).toContain("turnin-before-run");
  });

  it("allows it when the entry is marked beforeRun", () => {
    expect(validateDungeonPlan(plan(true), new Map(), timeline).map((e) => e.code)).not.toContain("turnin-before-run");
  });
});
