import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { writeDungeons } from "../../lib/profileExtras";
import { ROUTE_OPTIONS, routeLabel } from "../../lib/routeStyle";
import { InMemoryProgressProvider } from "../../state/progress";
import { DungeonToggleView, GuideXpMeter, ROUTE_TOOLBAR_CLASS, RouteStyleSwitch } from "./TopBar";

describe("route picker", () => {
  it("labels the two routes Balanced and Speedrun, never Lean", () => {
    const html = renderToStaticMarkup(createElement(InMemoryProgressProvider, { initial: { routeStyle: "speedrun" }, children: createElement(RouteStyleSwitch) }));
    expect(html).toContain("Balanced");
    expect(html).toContain("Speedrun");
    expect(html).not.toMatch(/lean/i);
    expect(html).toMatch(/aria-checked="true"[^>]*>.*?Speedrun/);
  });

  it("stores the schema values balanced | speedrun", () => {
    expect(ROUTE_OPTIONS.map((o) => o.v)).toEqual(["balanced", "speedrun"]);
    expect(routeLabel("lean")).toBe("Speedrun");
    expect(routeLabel("balanced")).toBe("Balanced");
  });
});

describe("dungeon toggle", () => {
  it("is a labelled switch that reflects the option", () => {
    const off = renderToStaticMarkup(createElement(DungeonToggleView, { on: false, onChange: () => {} }));
    const on = renderToStaticMarkup(createElement(DungeonToggleView, { on: true, onChange: () => {} }));
    expect(off).toContain('role="switch"');
    expect(off).toContain('aria-checked="false"');
    expect(on).toContain('aria-checked="true"');
    expect(off).toContain("Include dungeons (off = fully solo route)");
  });

  it("clicking flips the value", () => {
    const onChange = vi.fn();
    const el = DungeonToggleView({ on: false, onChange }) as ReactElement<{ onClick: () => void }>;
    el.props.onClick();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("writes the profile option `dungeons`", () => {
    const api = { setOptions: vi.fn() };
    writeDungeons(api, true);
    expect(api.setOptions).toHaveBeenCalledWith({ dungeons: true });
    writeDungeons(api, false);
    expect(api.setOptions).toHaveBeenLastCalledWith({ dungeons: false });
  });
});

describe("375px route toolbar", () => {
  it("never scrolls sideways and lets items shrink", () => {
    const cls = ROUTE_TOOLBAR_CLASS.split(/\s+/);
    expect(cls).not.toContain("overflow-x-auto");
    expect(cls).not.toContain("overflow-x-scroll");
    expect(cls).toContain("overflow-hidden");
    expect(cls).toContain("min-w-0");
    expect(cls).toContain("3xl:hidden");
  });

  it("renders compact guide XP markup with the completed fraction", () => {
    const html = renderToStaticMarkup(
      createElement(GuideXpMeter, {
        earned: 100,
        total: 400,
        bracket: "1–12",
        title: "Tirisfal Glades 1-12 (Horde) · XP from completed steps in this guide",
      }),
    );
    expect(html).toContain("1–12");
    expect(html).toContain("100 / 400 XP");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="400"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toMatch(/width:\s*25%/);
  });

  it("compact XP uses short numbers and keeps exact values in the tooltip", () => {
    const html = renderToStaticMarkup(
      createElement(GuideXpMeter, { earned: 12_345, total: 98_765, bracket: "20–30", title: "Guide", compact: true }),
    );
    expect(html).toContain("12.3k / 98.8k XP");
    expect(html).toContain("12,345 / 98,765 XP");
  });
});
