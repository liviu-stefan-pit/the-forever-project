import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { GuideIndex } from "../data/schema";
import { ProfileProgressProvider } from "../state/profiles";
import { pickNextOpenSteps } from "../lib/guideList";
import { DashboardPage } from "./DashboardPage";

const index: GuideIndex = {
  generatedAt: "t",
  brackets: [{ label: "1-12", guides: ["durotar-1-12"] }],
  starts: [{ race: ["Orc"], label: "Durotar", firstGuide: "durotar-1-12" }],
};

vi.mock("../data/hooks", async () => {
  const actual = await vi.importActual<typeof import("../data/hooks")>("../data/hooks");
  return {
    ...actual,
    useGuideIndex: () => ({ status: "ready", data: index }),
    useGuide: () => ({
      status: "error",
      error: new Error("guides/1-6-durotar.json was not found."),
      retry: () => {},
    }),
    useInsights: () => ({ status: "ready", data: { added: {}, nearMisses: {}, issues: [] } }),
  };
});

describe("DashboardPage", () => {
  it("next 5 steps skip passed trainer and travel steps without marking them done", () => {
    const order = ["goto", "trainer", "quest"];
    const isDone = () => false;
    const shouldSkip = (id: string) => id === "goto" || id === "trainer";
    expect(pickNextOpenSteps(order, { startId: "trainer", isDone, shouldSkip, limit: 5 })).toEqual(["quest"]);
    expect(isDone()).toBe(false);
  });

  it("shows an error and a guide-list link when the current guide fails to load", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ProfileProgressProvider, null, createElement(DashboardPage))),
    );
    expect(html).toContain("Could not load this guide");
    expect(html).toContain("guides/1-6-durotar.json was not found.");
    expect(html).toContain('href="/overview"');
    expect(html).toContain("Open the guide list");
    expect(html).not.toContain("skeleton h-12 w-full");
  });
});
