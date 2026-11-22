import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { DrawerNavView, MainNavLinks } from "./MainNav";

const render = (el: ReactElement, path = "/") => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, el));

describe("drawer main nav (phones)", () => {
  it("puts Dashboard, Guide, Overview and Gold in the timeline drawer", () => {
    const html = render(createElement(DrawerNavView, { guideSlug: "durotar-1-12" }));
    expect(html).toContain('aria-label="Main"');
    expect(html).toContain('href="/horde"');
    expect(html).toContain('href="/guide/durotar-1-12"');
    expect(html).toContain('href="/overview"');
    expect(html.match(/min-h-touch/g)?.length).toBe(4);
    expect(html.indexOf("Dashboard")).toBeLessThan(html.indexOf("Guide"));
    expect(html.indexOf("Guide")).toBeLessThan(html.indexOf("Overview"));
  });

  it("hides Guide until a current guide is known", () => {
    const html = render(createElement(DrawerNavView, {}));
    expect(html).toContain("Dashboard");
    expect(html).not.toContain(">Guide<");
    expect(html).toContain("Overview");
  });

  it("marks the active page", () => {
    const html = render(createElement(DrawerNavView, { guideSlug: "durotar-1-12" }), "/overview");
    expect(html).toMatch(/aria-current="page"[^>]*>Overview|>Overview<\/a>/);
    expect(html).toMatch(/href="\/overview"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/overview"/);
  });

  it("top-bar nav links are 36px targets", () => {
    const html = render(createElement(MainNavLinks, { guideSlug: "x" }));
    expect(html.match(/min-h-touch/g)?.length).toBe(4);
  });
});
