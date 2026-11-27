import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { Guide, GuideIndex } from "../../data/schema";
import { InMemoryProgressProvider } from "../../state/progress";
import { GuideHeader } from "./GuideHeader";

vi.mock("../../data/hooks", () => ({
  dataOf: (r: { status: string; data?: { displayName?: string } }) => (r.status === "ready" ? r.data : undefined),
  useGuide: (slug: string | undefined) =>
    slug === "barrens-12-20"
      ? { status: "ready" as const, data: { displayName: "The Barrens 12-20" } }
      : slug === "silverpine-11-15"
        ? { status: "ready" as const, data: { displayName: "Silverpine Forest 11-15" } }
        : { status: "loading" as const },
}));

const index: GuideIndex = {
  generatedAt: "t",
  brackets: [
    { label: "1-12", guides: ["tirisfal-1-12", "silverpine-11-15"] },
    { label: "12-20", guides: ["barrens-12-20"] },
  ],
  starts: [{ race: ["Scourge"], label: "Tirisfal", firstGuide: "tirisfal-1-12" }],
};

function guide(over: Partial<Guide> = {}): Guide {
  return {
    slug: "tirisfal-1-12",
    name: "Tirisfal Glades 1-12",
    displayName: "Tirisfal Glades 1-12",
    subgroup: "Tirisfal",
    minLevel: 1,
    maxLevel: 12,
    next: "silverpine-11-15",
    nextByRoute: { speedrun: "barrens-12-20", balanced: "silverpine-11-15" },
    zones: ["Tirisfal Glades"],
    source: "builtin",
    sections: [],
    steps: Array.from({ length: 154 }, (_, i) => ({
      id: `tirisfal-1-12:${i + 1}`,
      n: i + 1,
      tags: {},
      text: [],
      actions: [],
      conditions: [],
    })),
    ...over,
  };
}

function render(opts: { routeStyle: "speedrun" | "balanced"; done?: number; total?: number; g?: Guide }) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(
        InMemoryProgressProvider,
        {
          initial: { routeStyle: opts.routeStyle },
          children: createElement(GuideHeader, {
            guide: opts.g ?? guide(),
            index,
            insights: undefined,
            bonusHidden: 0,
            done: opts.done,
            total: opts.total,
            onJumpCurrent: () => {},
          }),
        },
      ),
    ),
  );
}

describe("GuideHeader next guide", () => {
  it("links to Barrens on speedrun and labels it with the loaded display name", () => {
    const markup = render({ routeStyle: "speedrun", done: 0, total: 95 });
    expect(markup).toContain("Next guide: The Barrens 12-20");
    expect(markup).toContain('href="/guide/barrens-12-20"');
    expect(markup).not.toContain('href="/guide/silverpine-11-15"');
  });

  it("highlights the next-guide link when the visible route is complete", () => {
    const done = render({ routeStyle: "speedrun", done: 95, total: 95 });
    const open = render({ routeStyle: "speedrun", done: 10, total: 95 });
    expect(done).toContain("bg-bronze-500/25");
    expect(open).not.toContain("bg-bronze-500/25");
  });

  it("links to Silverpine on balanced", () => {
    const markup = render({ routeStyle: "balanced", done: 0, total: 95 });
    expect(markup).toContain("Next guide: Silverpine Forest 11-15");
    expect(markup).toContain('href="/guide/silverpine-11-15"');
    expect(markup).not.toContain('href="/guide/barrens-12-20"');
  });

  it("shows the visible step count before the full length", () => {
    const markup = render({ routeStyle: "balanced", done: 0, total: 95 });
    expect(markup).toContain("95 steps (154 total)");
    expect(markup).not.toContain(">154 steps<");
  });

  it("does not flash 0 steps before completion loads", () => {
    const markup = render({ routeStyle: "balanced", done: 0, total: 0 });
    expect(markup).toContain("154 steps");
    expect(markup).not.toContain("0 steps");
  });
});

describe("GuideHeader status badge", () => {
  it("shows the green Play-tested badge for a play-tested guide and Experimental otherwise", () => {
    const tested = render({ routeStyle: "balanced", g: guide({ status: "play-tested", playtested: { date: "2026-11-27", class: "Shaman", levels: [1, 13] } }) });
    expect(tested).toContain('data-testid="badge-playtested"');
    expect(tested).not.toContain('data-testid="badge-experimental"');
    const plain = render({ routeStyle: "balanced" });
    expect(plain).toContain('data-testid="badge-experimental"');
    expect(plain).not.toContain('data-testid="badge-playtested"');
  });
});
