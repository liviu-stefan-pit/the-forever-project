import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { GuideCompleteCard } from "./GuideCompleteCard";

function html(props: { nextSlug?: string; nextName?: string; expectedLevel?: number }) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(GuideCompleteCard, props)));
}

describe("GuideCompleteCard", () => {
  it("continues to Barrens when the speedrun handoff is Barrens", () => {
    const markup = html({ nextSlug: "barrens-12-20", nextName: "The Barrens 12-20", expectedLevel: 19.4 });
    expect(markup).toContain('id="guide-complete"');
    expect(markup).toContain("Guide complete");
    expect(markup).toContain("Lok&#x27;tar ogar!");
    expect(markup).toContain("Continue to The Barrens 12-20");
    expect(markup).toContain('href="/guide/barrens-12-20"');
    expect(markup).not.toContain('href="/guide/silverpine-11-15"');
    expect(markup).toContain("You finish this guide around level");
    expect(markup).toContain("19.4");
    expect(markup).not.toContain("Back to route");
  });

  it("continues to Silverpine when the balanced handoff is Silverpine", () => {
    const markup = html({ nextSlug: "silverpine-11-15", nextName: "Silverpine Forest 11-15", expectedLevel: 12 });
    expect(markup).toContain("Continue to Silverpine Forest 11-15");
    expect(markup).toContain('href="/guide/silverpine-11-15"');
    expect(markup).not.toContain('href="/guide/barrens-12-20"');
    expect(markup).not.toContain("Back to route");
  });

  it("omits a fake level and a dead continue button on the wrapup pack", () => {
    const markup = html({});
    expect(markup).toContain("Guide complete");
    expect(markup).toContain("Back to route");
    expect(markup).toContain('href="/horde"');
    expect(markup).not.toContain("Continue to");
    expect(markup).not.toContain("You finish this guide around level");
  });
});
