import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

const html = () => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ["/"] }, createElement(LandingPage)));

/** The markup of one faction card, from its opening tag to the next card (or the end of the section). */
function card(h: string, faction: "horde" | "alliance"): string {
  const start = h.indexOf(`faction-card faction-${faction}`);
  const open = h.lastIndexOf("<", start);
  const next = h.indexOf("faction-card faction-", start + 20);
  return h.slice(open, next > 0 ? h.lastIndexOf("<", next) : h.indexOf("</section>", start));
}

describe("LandingPage", () => {
  it("shows both factions, with Horde as a link into the guide", () => {
    const h = html();
    expect(h).toContain("Choose your faction.");
    const horde = card(h, "horde");
    expect(horde.startsWith("<a")).toBe(true);
    expect(horde).toContain('href="#/horde"');
    expect(horde).toContain("Available now");
    expect(horde).toContain("Enter");
    expect(horde).toContain("Experimental");
    // Anchors cannot nest: the badge inside the card link is plain text.
    expect(horde.match(/<a /g)?.length).toBe(1);
  });

  it("locks the Alliance card: not a link, marked disabled, says coming soon", () => {
    const alliance = card(html(), "alliance");
    expect(alliance.startsWith("<article")).toBe(true);
    expect(alliance).not.toContain("href=");
    expect(alliance).toContain('aria-disabled="true"');
    expect(alliance).toContain('aria-label="Alliance: coming soon"');
    expect(alliance).toContain("Coming soon");
  });

  it("keeps the fan-site notice and links to About, Credits and Addons", () => {
    const h = html();
    expect(h).toContain("Not affiliated with Blizzard Entertainment or WoW Forever.");
    expect(h).toContain('href="/about"');
    expect(h).toContain('href="/credits"');
    expect(h).toContain('href="/addons"');
    expect(h).toContain('href="/about#experimental"');
  });
});
