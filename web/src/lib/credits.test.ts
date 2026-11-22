import { describe, expect, it } from "vitest";
import { CREDITS, parseCredits, safeUrl } from "./credits";

// Copy of the CREDITS.md table format (sentinel/credits 2b3fab5).
const SAMPLE = `# Credits and sources

Project Forever is a free, fan-made World of Warcraft leveling guide. It is not affiliated with or endorsed by Blizzard Entertainment.
World of Warcraft and Blizzard Entertainment are trademarks of Blizzard Entertainment, Inc.

| Not | a | source |
|---|---|---|
| outside | the | markers |

<!-- sources:start -->
| Name | URL | Licence | Used for | Files |
|---|---|---|---|---|
| Questie (quest database) | https://github.com/Questie/Questie | GPL-3.0 by permission of the Questie team; see their LICENSE.md. The Questie name and logo are not used. | Quest ids, quest givers and turn-ins, NPC and object ids, spawn coordinates | (added by the import PR) |
| Wowhead Classic | https://www.wowhead.com/classic | Proprietary site; facts checked by hand only, nothing copied | Objective counts for quests 878 and 868 | contracts/fixtures/GuideWebExport.sample.lua, addon/tests/mock_client.lua |
<!-- sources:end -->
`;

describe("parseCredits", () => {
  it("reads only the table between the markers", () => {
    const c = parseCredits(SAMPLE);
    expect(c.sources).toHaveLength(2);
    expect(c.sources[0]).toEqual({
      name: "Questie (quest database)",
      url: "https://github.com/Questie/Questie",
      licence: "GPL-3.0 by permission of the Questie team; see their LICENSE.md. The Questie name and logo are not used.",
      usedFor: "Quest ids, quest givers and turn-ins, NPC and object ids, spawn coordinates",
      files: "(added by the import PR)",
    });
    expect(c.sources[1]!.files).toContain("addon/tests/mock_client.lua");
    expect(c.sources.some((s) => s.name === "outside")).toBe(false);
  });

  it("extracts the not-affiliated line", () => {
    expect(parseCredits(SAMPLE).notice).toMatch(/not affiliated with or endorsed by Blizzard Entertainment/);
  });

  it("handles a missing file or missing markers", () => {
    expect(parseCredits(undefined)).toEqual({ sources: [] });
    expect(parseCredits("# nothing here").sources).toEqual([]);
  });

  it("keeps escaped pipes inside a cell", () => {
    const md = "<!-- sources:start -->\n| Name | URL | Licence | Used for | Files |\n|---|---|---|---|---|\n| A \\| B | https://x.org | MIT | ids | a.json |\n<!-- sources:end -->";
    expect(parseCredits(md).sources[0]!.name).toBe("A | B");
  });

  it("links only http(s) URLs", () => {
    expect(safeUrl("https://github.com/Questie/Questie")).toBe("https://github.com/Questie/Questie");
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("bundles the repo CREDITS.md", () => {
    expect(CREDITS.sources.length).toBeGreaterThan(0);
  });
});
