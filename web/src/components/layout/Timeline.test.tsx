import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { GuideIndex } from "../../data/schema";
import { InMemoryProgressProvider } from "../../state/progress";
import { Timeline } from "./Timeline";

const index: GuideIndex = {
  generatedAt: "t",
  brackets: [{ label: "1-12", guides: ["tirisfal-1-12", "silverpine-11-15", "barrens-12-20"] }],
  starts: [{ race: ["Scourge"], label: "Tirisfal", firstGuide: "tirisfal-1-12" }],
};

vi.mock("../../data/hooks", async () => {
  const actual = await vi.importActual<typeof import("../../data/hooks")>("../../data/hooks");
  return {
    ...actual,
    useGuideIndex: () => ({ status: "ready", data: index }),
    useGuide: () => ({ status: "loading" }),
  };
});

function render(routeStyle: "speedrun" | "balanced") {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(InMemoryProgressProvider, {
        initial: { routeStyle },
        children: createElement(Timeline),
      }),
    ),
  );
}

describe("Timeline Silverpine row", () => {
  it("dims Silverpine and labels it Balanced on speedrun, but keeps it clickable", () => {
    const markup = render("speedrun");
    expect(markup).toContain('href="/guide/silverpine-11-15"');
    expect(markup).toMatch(/href="\/guide\/silverpine-11-15"[^>]*>[\s\S]*Balanced/);
    expect(markup).toContain("opacity-55");
  });

  it("renders Silverpine like any other guide on balanced", () => {
    const markup = render("balanced");
    expect(markup).toContain('href="/guide/silverpine-11-15"');
    expect(markup).not.toMatch(/href="\/guide\/silverpine-11-15"[^>]*>[\s\S]*Balanced/);
    expect(markup).not.toContain("opacity-55");
  });
});
