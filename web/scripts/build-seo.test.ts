import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyPageMeta, guidePage, sitemapXml, writeSeo, type GuideMeta } from "./build-seo.ts";

const SHELL = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>The Forever Project — WoW Forever leveling guide</title>
    <meta
      name="description"
      content="shared description"
    />
    <meta property="og:title" content="shared title" />
    <meta property="og:description" content="shared description" />
    <meta name="twitter:title" content="shared title" />
    <meta name="twitter:description" content="shared description" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index-abc.js"></script>
  </body>
</html>
`;

const DUROTAR: GuideMeta = { slug: "durotar-1-12", displayName: 'Durotar & "Valley"', minLevel: 1, maxLevel: 12, subgroup: "Leveling" };

describe("build-seo", () => {
  it("puts the guide title in the HTML and escapes it", () => {
    const page = guidePage(DUROTAR);
    const html = applyPageMeta(SHELL, page);
    expect(html).toContain("<title>Durotar &amp; &quot;Valley&quot; · The Forever Project</title>");
    expect(html).toContain('rel="canonical" href="https://theforeverproject.app/guide/durotar-1-12"');
    expect(html).toContain('property="og:url" content="https://theforeverproject.app/guide/durotar-1-12"');
    expect(html).toContain("Horde 1–12 guide: Durotar &amp; &quot;Valley&quot;");
    expect(html).toContain('src="/assets/index-abc.js"');
    expect(html).not.toContain("shared description");
  });

  it("writes one HTML file per public URL and a sitemap that omits quests", () => {
    const dist = mkdtempSync(join(tmpdir(), "seo-"));
    const pages = writeSeo(dist, SHELL, [DUROTAR, { slug: "rfc", displayName: "Ragefire Chasm", minLevel: 13, maxLevel: 18, subgroup: "Dungeons" }]);
    const horde = readFileSync(join(dist, "horde", "index.html"), "utf8");
    const guide = readFileSync(join(dist, "guide", "durotar-1-12", "index.html"), "utf8");
    const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
    expect(horde).toContain("<title>Horde 1–60 · The Forever Project</title>");
    expect(guide).toContain("Durotar");
    expect(readFileSync(join(dist, "index.html"), "utf8")).toContain('rel="canonical" href="https://theforeverproject.app/"');
    expect(sitemap).toContain("https://theforeverproject.app/guide/durotar-1-12");
    expect(sitemap).toContain("https://theforeverproject.app/guide/rfc");
    expect(sitemap).toContain("https://theforeverproject.app/gold");
    expect(sitemap).not.toContain("/quest/");
    expect(sitemap).not.toContain("/profile");
    expect(pages.some((page) => page.path === "/quest/1")).toBe(false);
    expect(readFileSync(join(dist, "robots.txt"), "utf8")).toContain("Sitemap: https://theforeverproject.app/sitemap.xml");
  });

  it("lists every page in the sitemap", () => {
    const xml = sitemapXml([guidePage(DUROTAR)]);
    expect(xml).toContain("<loc>https://theforeverproject.app/guide/durotar-1-12</loc>");
  });
});
