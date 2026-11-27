import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ExperimentalBadge, EXPERIMENTAL_TEXT } from "../components/ui/ExperimentalBadge";
import { ABOUT_SECTIONS, AboutPage } from "./AboutPage";
import { AddonsPage } from "./AddonsPage";

const render = (el: ReactElement) => renderToStaticMarkup(createElement(MemoryRouter, null, el));

describe("About page", () => {
  it("has a linkable section for every topic", () => {
    const h = render(createElement(AboutPage));
    for (const id of ["about", "experimental", "ai", "privacy", "license", "disclaimer", "contact"]) {
      expect(h).toContain(`id="${id}"`);
    }
    expect(ABOUT_SECTIONS).toHaveLength(7);
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
