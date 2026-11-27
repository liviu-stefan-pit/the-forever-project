import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ExperimentalBadge, EXPERIMENTAL_TEXT } from "../components/ui/ExperimentalBadge";
import { PLAYTESTED_HREF, StatusBadge } from "../components/ui/ExperimentalBadge";
import type { GuideIndex } from "../data/schema";
import { routeStatus } from "../lib/packStatus";
import { ABOUT_SECTIONS, AboutPage } from "./AboutPage";
import { AddonsPage } from "./AddonsPage";

const render = (el: ReactElement) => renderToStaticMarkup(createElement(MemoryRouter, null, el));

describe("About page", () => {
  it("has a linkable section for every topic", () => {
    const h = render(createElement(AboutPage));
    for (const id of ["about", "experimental", "play-tested", "ai", "privacy", "license", "disclaimer", "contact"]) {
      expect(h).toContain(`id="${id}"`);
    }
    expect(ABOUT_SECTIONS).toHaveLength(8);
    expect(h).toContain("GPL-3.0-or-later");
    expect(h).toContain("not affiliated with, endorsed, sponsored or approved by Blizzard Entertainment");
    expect(h).toContain("https://github.com/liviu-stefan-pit/the-forever-project/issues");
    expect(h).toContain("Godfather");
  });
});

describe("Addons page", () => {
  it("links both release downloads and all versions", () => {
    const h = render(createElement(AddonsPage));
    expect(h).toContain("https://github.com/liviu-stefan-pit/the-forever-project/releases/download/guidewebexport-latest/GuideWebExport.zip");
    expect(h).toContain("https://github.com/liviu-stefan-pit/the-forever-project/releases/download/adventurelog-latest/AdventureLog.zip");
    expect(h).toContain('href="https://github.com/liviu-stefan-pit/the-forever-project/releases"');
    expect(h).toContain("1.60.x only");
  });
  it("shows each addon's animated icon with a PNG fallback and alt text", () => {
    const h = render(createElement(AddonsPage));
    for (const id of ["guidewebexport", "adventurelog"]) {
      expect(h).toContain(`srcSet="/addons/${id}.svg"`);
      expect(h).toMatch(new RegExp(`<img src="/addons/${id}-128.png" alt="[^"]+ icon: [^"]+"`));
      expect(existsSync(resolve(__dirname, `../../public/addons/${id}.svg`))).toBe(true);
      expect(existsSync(resolve(__dirname, `../../public/addons/${id}-128.png`))).toBe(true);
    }
  });
});

describe("ExperimentalBadge", () => {
  it("links to the About page's experimental section with the warning as tooltip", () => {
    const h = render(createElement(ExperimentalBadge));
    expect(h.startsWith("<a")).toBe(true);
    expect(h).toContain('href="/about#experimental"');
    expect(h).toContain(`title="${EXPERIMENTAL_TEXT}"`);
  });
  it("is plain text when it sits inside another link", () => {
    const h = render(createElement(ExperimentalBadge, { link: false }));
    expect(h.startsWith("<span")).toBe(true);
    expect(h).not.toContain("href=");
  });
});

describe("Play-tested badge per pack", () => {
  const run = { date: "2026-11-27", class: "Shaman" as const, levels: [1, 13] as [number, number] };
  const index = (statuses: ("play-tested" | undefined)[]): GuideIndex => ({
    generatedAt: "t",
    brackets: [],
    starts: [],
    entries: statuses.map((status, i) => ({ slug: `p${i}`, stepIds: [], stepCount: 0, ...(status ? { status } : {}) })),
  });

  it("is green and links to #play-tested for a play-tested pack", () => {
    const h = render(createElement(StatusBadge, { status: "play-tested", playtested: run }));
    expect(PLAYTESTED_HREF).toBe("/about#play-tested");
    expect(h).toContain('href="/about#play-tested"');
    expect(h).toContain("Play-tested");
    expect(h).toContain("text-done");
    expect(h).toContain("AdventureLog on a Shaman, levels 1–13, 2026-11-27");
    expect(h).toContain("Class quests for other classes are still unconfirmed.");
    expect(h).not.toContain("Experimental");
  });

  it("stays Experimental for a pack without a status (older data) or an experimental one", () => {
    for (const status of [undefined, "experimental" as const]) {
      const h = render(createElement(StatusBadge, { status }));
      expect(h).toContain('href="/about#experimental"');
      expect(h).toContain("Experimental");
      expect(h).not.toContain("Play-tested");
    }
  });

  it("keeps mixed pages Experimental while any pack is still experimental", () => {
    expect(routeStatus(index(["play-tested", undefined]))).toBe("experimental");
    expect(routeStatus(index(["play-tested", "play-tested"]))).toBe("play-tested");
    expect(routeStatus(index([]))).toBe("experimental");
    expect(routeStatus(undefined)).toBe("experimental");
  });

  it("has an About section for play-tested next to Experimental", () => {
    const h = render(createElement(AboutPage));
    expect(h.indexOf('id="play-tested"')).toBeGreaterThan(h.indexOf('id="experimental"'));
    expect(h.indexOf('id="play-tested"')).toBeLessThan(h.indexOf('id="ai"'));
    expect(h).toContain("Unconfirmed");
  });
});
