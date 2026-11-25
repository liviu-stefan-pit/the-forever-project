import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

const html = (coffeeUrl: string) => {
  const router = createMemoryRouter([{ path: "/", element: createElement(Footer, { coffeeUrl }) }]);
  return renderToStaticMarkup(createElement(RouterProvider, { router }));
};

describe("Footer", () => {
  it("shows the fan-made notice and the site links", () => {
    const h = html("");
    expect(h).toContain("Not affiliated with or endorsed by Blizzard Entertainment.");
    expect(h).toContain('href="/about"');
    expect(h).toContain('href="/credits"');
    expect(h).toContain('href="/addons"');
    expect(h).toContain('href="https://github.com/liviu-stefan-pit/the-forever-project"');
  });
  it("hides the coffee link when no URL is configured", () => {
    expect(html("")).not.toContain("coffee");
    expect(html("javascript:alert(1)")).not.toContain("coffee");
  });
  it("shows the coffee text link when a URL is set", () => {
    expect(html("https://example.org/c")).toContain("Buy me a coffee");
  });
});
