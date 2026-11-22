import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Action, Filter, Guide, Section, Step, Stop } from "../../data/schema";
import {
  MAP_VIEW,
  fitMapView,
  framePct,
  heatPointsFromStep,
  mapMarkers,
  orderedRoute,
  routePathD,
  stepLeg,
  stopHoverLines,
  stopWayCommand,
  toMapSpace,
} from "./route";

const guide = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../../contracts/fixtures/guides/1-6-durotar.json", import.meta.url)), "utf-8"),
) as Guide;
const durotar = guide.sections[0] as Section;

function stop(partial: Partial<Stop> & Pick<Stop, "n" | "x" | "y">): Stop {
  return { label: `Stop ${partial.n}`, kinds: ["quest"], steps: [`s${partial.n}`], ...partial };
}

function guideStep(actions: Action[]): Step {
  return { id: "s", n: 1, tags: {}, text: [], conditions: [], actions };
}

function goto(x: number, y: number, extra?: { hidden?: boolean; filter?: Filter; mapId?: number }): Action {
  return {
    type: "goto",
    at: { mapId: extra?.mapId ?? 1411, x, y, zone: "Durotar", exact: true },
    ...(extra?.hidden ? { hidden: true } : {}),
    ...(extra?.filter ? { filter: extra.filter } : {}),
  };
}

describe("orderedRoute / routePathD", () => {
  it("uses section.route order and drops placeholder 0,0 points", () => {
    const route = [
      { x: 10, y: 20 },
      { x: 0, y: 0 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ];
    expect(orderedRoute(route)).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ]);
    expect(routePathD(route)).toBe("M10.00,20.00 L30.00,40.00 L50.00,60.00");
  });

  it("follows the fixture section.route, including hidden waypoints", () => {
    const pts = orderedRoute(durotar.route);
    expect(pts[0]).toEqual(durotar.route[0]);
    expect(pts[pts.length - 1]).toEqual(durotar.route[durotar.route.length - 1]);
    expect(pts.length).toBeGreaterThan(durotar.stops.length);

    const d = routePathD(durotar.route);
    expect(d.startsWith(`M${durotar.route[0]!.x.toFixed(2)},${durotar.route[0]!.y.toFixed(2)}`)).toBe(true);
    const last = durotar.route[durotar.route.length - 1]!;
    expect(d.endsWith(`L${last.x.toFixed(2)},${last.y.toFixed(2)}`)).toBe(true);
    expect(d).toContain("L40.50,66.83"); // Sarkoth, QuestieDB spawn
  });
});

describe("mapMarkers", () => {
  it("does not pin a hidden-only waypoint that only exists on the route", () => {
    const section: Section = {
      id: "t",
      mapId: 1411,
      zone: "Durotar",
      firstStep: "a",
      lastStep: "c",
      route: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ],
      stops: [stop({ n: 1, x: 10, y: 10, steps: ["a"] }), stop({ n: 2, x: 30, y: 30, steps: ["c"] })],
    };
    const markers = mapMarkers(section, "balanced");
    expect(markers.map((m) => [m.x, m.y])).toEqual([
      [10, 10],
      [30, 30],
    ]);
    expect(orderedRoute(section.route).map((p) => [p.x, p.y])).toEqual([
      [10, 10],
      [20, 20],
      [30, 30],
    ]);
  });

  it("drops bonus-only stops in speedrun mode and keeps mixed/quest stops", () => {
    const bonus = durotar.stops.find((s) => s.kinds.length === 1 && s.kinds[0] === "bonus");
    expect(bonus?.n).toBe(6);
    expect(mapMarkers(durotar, "balanced").some((s) => s.n === 6)).toBe(true);
    expect(mapMarkers(durotar, "speedrun").some((s) => s.n === 6)).toBe(false);
    expect(mapMarkers(durotar, "speedrun").map((s) => s.n)).toEqual(
      durotar.stops.filter((s) => !(s.kinds.length === 1 && s.kinds[0] === "bonus") && !(s.x === 0 && s.y === 0)).map((s) => s.n),
    );
  });
});

describe("stopWayCommand", () => {
  it("formats /way with one decimal and skips placeholder 0,0", () => {
    expect(stopWayCommand("Durotar", 42.4, 68.5)).toBe("/way Durotar 42.4 68.5");
    expect(stopWayCommand("Durotar", 43.29, 68.53)).toBe("/way Durotar 43.3 68.5");
    expect(stopWayCommand("Durotar", 0, 0)).toBeUndefined();
  });
});

describe("stopHoverLines / heatPointsFromStep", () => {
  it("falls back to the stop label and step count when step text is missing", () => {
    const s = stop({ n: 1, x: 1, y: 2, label: "The Den", steps: ["a", "b"] });
    expect(stopHoverLines(s)).toEqual({ title: "The Den", lines: ["2 steps"] });
    expect(stopHoverLines(s, { a: "Accept Cutting Teeth", b: "Train" })).toEqual({
      title: "The Den",
      lines: ["Accept Cutting Teeth", "Train"],
    });
  });

  it("collects visible goto points from the current step for the heat overlay", () => {
    const step: Step = {
      id: "s",
      n: 1,
      tags: {},
      text: [],
      conditions: [],
      actions: [
        { type: "goto", at: { mapId: 1411, x: 40.5, y: 62.6, zone: "Durotar", exact: true } },
        { type: "goto", at: { mapId: 1411, x: 41.2, y: 63.0, zone: "Durotar", exact: true }, hidden: true },
        { type: "goto", at: { mapId: 1411, x: 0, y: 0, zone: "Durotar", exact: false } },
        { type: "accept", questId: 1, label: "A" },
      ],
    };
    expect(heatPointsFromStep(step)).toEqual([{ x: 40.5, y: 62.6 }]);
    expect(heatPointsFromStep(undefined)).toEqual([]);
  });
});

describe("toMapSpace / framePct", () => {
  const full = { x: 0, y: 0, w: 150, h: 100 };

  it("converts zone percent into 3:2 map space (x * 1.5, y unchanged)", () => {
    expect(toMapSpace({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(toMapSpace({ x: 100, y: 100 })).toEqual({ x: 150, y: 100 });
    expect(toMapSpace({ x: 50, y: 50 })).toEqual({ x: 75, y: 50 });
  });

  it("aligns HTML pins with the 3:2 viewBox, including zoom and pan", () => {
    expect(framePct({ x: 0, y: 0 }, full)).toEqual({ left: 0, top: 0 });
    expect(framePct({ x: 100, y: 100 }, full)).toEqual({ left: 100, top: 100 });
    expect(framePct({ x: 50, y: 50 }, full)).toEqual({ left: 50, top: 50 });

    const zoom2 = { x: 0, y: 0, w: 75, h: 50 };
    expect(framePct({ x: 0, y: 0 }, zoom2)).toEqual({ left: 0, top: 0 });
    expect(framePct({ x: 50, y: 50 }, zoom2)).toEqual({ left: 100, top: 100 });

    const pan = { x: 75, y: 50, w: 75, h: 50 };
    expect(framePct({ x: 50, y: 50 }, pan)).toEqual({ left: 0, top: 0 });
    expect(framePct({ x: 100, y: 100 }, pan)).toEqual({ left: 100, top: 100 });
  });
});

describe("stepLeg", () => {
  const mapId = 1411;

  it("keeps a hidden waypoint in the path and pins A, via, then B", () => {
    const previous = guideStep([goto(10, 10)]);
    const step = guideStep([goto(30, 20), goto(40, 25, { hidden: true }), goto(50, 40)]);
    const leg = stepLeg({ step, previous, mapId });
    expect(leg.path).toEqual([
      { x: 10, y: 10 },
      { x: 30, y: 20 },
      { x: 40, y: 25 },
      { x: 50, y: 40 },
    ]);
    expect(leg.pins).toEqual([
      { x: 10, y: 10, role: "a" },
      { x: 30, y: 20, role: "via" },
      { x: 50, y: 40, role: "b" },
    ]);
  });

  it("drops a filtered-out fork from the path and the pins", () => {
    const orc: Filter = { any: [[{ race: "Orc" }]] };
    const tauren: Filter = { any: [[{ race: "Tauren" }]] };
    const step = guideStep([goto(20, 20, { filter: orc }), goto(80, 80, { filter: tauren })]);
    const leg = stepLeg({
      step,
      mapId,
      lineVisible: (filter) => filter?.any[0]?.[0]?.race !== "Tauren",
    });
    expect(leg.path).toEqual([{ x: 20, y: 20 }]);
    expect(leg.pins).toEqual([{ x: 20, y: 20, role: "b" }]);
  });

  it("borrows the previous step's last goto as A", () => {
    const previous = guideStep([goto(12, 14), goto(15, 18)]);
    const step = guideStep([goto(40, 50)]);
    const leg = stepLeg({ step, previous, mapId });
    expect(leg.pins.map((p) => p.role)).toEqual(["a", "b"]);
    expect(leg.path[0]).toEqual({ x: 15, y: 18 });
    expect(leg.path[leg.path.length - 1]).toEqual({ x: 40, y: 50 });
  });

  it("drops a goto on a different map", () => {
    const step = guideStep([goto(10, 10, { mapId: 1412 }), goto(22, 33)]);
    const leg = stepLeg({ step, mapId });
    expect(leg.path).toEqual([{ x: 22, y: 33 }]);
    expect(leg.pins).toEqual([{ x: 22, y: 33, role: "b" }]);
  });

  it("shows only B when there is no previous step", () => {
    const step = guideStep([goto(22, 33)]);
    const leg = stepLeg({ step, mapId, previousStop: { x: 1, y: 1 } });
    expect(leg.pins).toEqual([{ x: 22, y: 33, role: "b" }]);
    expect(leg.path).toEqual([{ x: 22, y: 33 }]);
  });

  it("uses stop as B and the previous goto or previous stop as A", () => {
    const bare = guideStep([{ type: "accept", questId: 1, label: "A" }]);
    const fromGoto = stepLeg({
      step: bare,
      previous: guideStep([goto(8, 9)]),
      stop: { x: 60, y: 70 },
      mapId,
    });
    expect(fromGoto.pins).toEqual([
      { x: 8, y: 9, role: "a" },
      { x: 60, y: 70, role: "b" },
    ]);
    expect(fromGoto.path).toEqual([
      { x: 8, y: 9 },
      { x: 60, y: 70 },
    ]);

    const fromStop = stepLeg({
      step: bare,
      previous: guideStep([{ type: "accept", questId: 2, label: "B" }]),
      previousStop: { x: 4, y: 5 },
      stop: { x: 60, y: 70 },
      mapId,
    });
    expect(fromStop.pins[0]).toEqual({ x: 4, y: 5, role: "a" });
    expect(fromStop.pins[1]).toEqual({ x: 60, y: 70, role: "b" });
  });

  it("keeps hidden gotos on the path when there is no pin", () => {
    const previous = guideStep([goto(10, 10)]);
    const step = guideStep([goto(20, 20, { hidden: true }), goto(30, 30, { hidden: true })]);
    const leg = stepLeg({ step, previous, mapId });
    expect(leg.pins).toEqual([]);
    expect(leg.path).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ]);
  });

  it("returns an empty leg when the step is missing", () => {
    expect(stepLeg({ step: undefined, mapId })).toEqual({ path: [], pins: [] });
  });
});

describe("fitMapView", () => {
  it("fits two nearby points to a 3:2 box inside the full map", () => {
    const a = { x: 40, y: 50 };
    const b = { x: 44, y: 53 };
    const vb = fitMapView([a, b]);
    expect(vb.w / vb.h).toBe(1.5);
    expect(vb.w).toBeLessThan(MAP_VIEW.w);
    expect(vb.h).toBeLessThan(MAP_VIEW.h);
    for (const p of [a, b].map(toMapSpace)) {
      expect(p.x).toBeGreaterThanOrEqual(vb.x);
      expect(p.x).toBeLessThanOrEqual(vb.x + vb.w);
      expect(p.y).toBeGreaterThanOrEqual(vb.y);
      expect(p.y).toBeLessThanOrEqual(vb.y + vb.h);
    }
  });

  it("returns the full map for an empty point list", () => {
    expect(fitMapView([])).toEqual(MAP_VIEW);
  });

  it("returns the full map when points span wider than the zone", () => {
    expect(fitMapView([{ x: 0, y: 10 }, { x: 100, y: 90 }])).toEqual(MAP_VIEW);
  });
});
