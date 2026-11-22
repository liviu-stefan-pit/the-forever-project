import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichLine } from "../components/step/RichLine";
import type { Guide, RichText } from "../data/schema";
import { cleanEscapes, iconGlyph, linePlainText, safeHref, tokenizeLine } from "./richtext";

const guide = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/guides/1-6-durotar.json", import.meta.url)), "utf-8"),
) as Guide;

describe("tokenizeLine", () => {
  it("keeps colour kinds and splits [item] names", () => {
    const line: RichText = {
      segments: [
        { t: "Buy", kind: "buy" },
        { t: " " },
        { t: "", kind: "icon", icon: "132794" },
        { t: "[Refreshing Spring Water] " },
        { t: "from her", kind: "buy" },
      ],
    };
    expect(tokenizeLine(line)).toEqual([
      { type: "text", text: "Buy", kind: "buy" },
      { type: "text", text: " " },
      { type: "icon", glyph: "item", src: "132794" },
      { type: "item", text: "Refreshing Spring Water" },
      { type: "text", text: " " },
      { type: "text", text: "from her", kind: "buy" },
    ]);
  });

  it("maps icon references to generic glyphs", () => {
    expect(iconGlyph("interface/common/chat.blp")).toBe("chat");
    expect(iconGlyph("133486")).toBe("item");
    expect(iconGlyph("interface/icons/foo")).toBe("generic");
    expect(iconGlyph(undefined)).toBe("generic");
  });

  it("sanitises links (http/https only)", () => {
    expect(safeHref("https://www.youtube.com/watch?v=x")).toBe("https://www.youtube.com/watch?v=x");
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("not a url")).toBeUndefined();
    const toks = tokenizeLine({ segments: [{ t: "click", kind: "link", href: "javascript:alert(1)" }] });
    expect(toks).toEqual([{ type: "link", text: "click", href: undefined }]);
  });

  it("strips leftover WoW escape codes", () => {
    expect(cleanEscapes("Kill|r |cFFFF0000red|r |T1234:0|tx")).toBe("Kill red x");
  });

  it("produces plain text for summaries", () => {
    const step = guide.steps.find((s) => s.n === 6)!;
    expect(linePlainText(step.text[1]!)).toBe("Buy [Refreshing Spring Water]");
  });

  it("tokenizes every fixture line without losing text", () => {
    for (const s of guide.steps)
      for (const l of s.text) {
        const want = l.segments.filter((g) => g.kind !== "icon").map((g) => g.t).join("");
        const got = tokenizeLine(l)
          .map((t) => (t.type === "item" ? `[${t.text}]` : t.type === "icon" ? "" : t.text))
          .join("");
        expect(got).toBe(want);
      }
  });
});

describe("<RichLine>", () => {
  it("renders coloured spans, item names, glyphs and safe links", () => {
    const html = renderToStaticMarkup(
      <RichLine
        line={{
          segments: [
            { t: "", kind: "icon", icon: "interface/common/chat.blp" },
            { t: "Kill " },
            { t: "Sarkoth", kind: "enemy" },
            { t: " for " },
            { t: "[Claw]", kind: "loot" },
            { t: " · " },
            { t: "video", kind: "link", href: "https://example.com/v" },
          ],
        }}
      />,
    );
    expect(html).toContain('data-kind="enemy"');
    expect(html).toContain("text-rt-enemy");
    expect(html).toContain('data-kind="item"');
    expect(html).toContain("text-rt-loot");
    expect(html).toContain('title="Talk"');
    expect(html).toContain('href="https://example.com/v"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders every kind used by the fixture", () => {
    const kinds = new Set<string>();
    for (const s of guide.steps)
      for (const l of s.text) {
        const html = renderToStaticMarkup(<RichLine line={l} />);
        for (const m of html.matchAll(/data-kind="(\w+)"/g)) kinds.add(m[1]!);
      }
    for (const k of ["friendly", "warn", "enemy", "buy", "loot", "pick", "item"]) expect(kinds).toContain(k);
  });
});
