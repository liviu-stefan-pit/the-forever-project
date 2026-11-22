import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import type { RoutePack } from "./schema";
import { resolveRoute } from "../lib/resolveRoute";

const root = new URL("../../../contracts/", import.meta.url);
const read = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, root)), "utf8")) as unknown;
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(read("route-v2.schema.json") as object);
const example = read("fixtures/route-v2/example.json") as RoutePack;
const clone = () => JSON.parse(JSON.stringify(example)) as RoutePack;

describe("route-v2 JSON Schema", () => {
  it("accepts the example pack", () => {
    expect(validate(example), JSON.stringify(validate.errors)).toBe(true);
  });

  it("rejects a raw source field (removed in v2)", () => {
    const p = clone();
    (p.steps[0] as unknown as Record<string, unknown>).raw = "x";
    expect(validate(p)).toBe(false);
  });

  it("rejects tips without sources/verified, bad coords, tiny polygons, unknown route", () => {
    const a = clone();
    delete (a.steps[0]!.tips![0] as unknown as Record<string, unknown>).verified;
    expect(validate(a)).toBe(false);
    const b = clone();
    b.steps[0]!.professionHooks![0]!.npc!.x = 140;
    expect(validate(b)).toBe(false);
    const c = clone();
    const pin = c.steps[0]!.pins![0]!;
    if (pin.kind === "mobArea") pin.polygon = pin.polygon!.slice(0, 2);
    expect(validate(c)).toBe(false);
    const d = clone();
    (d.steps[0] as unknown as Record<string, unknown>).routes = ["lean"];
    expect(validate(d)).toBe(false);
  });

  it("accepts dungeonsOffRoutes and tags.dungeonPart", () => {
    const p = clone();
    const s = p.steps[0]!;
    s.dungeonsOffRoutes = ["speedrun"];
    s.tags = { ...s.tags, dungeonPart: "run" };
    expect(validate(p), JSON.stringify(validate.errors)).toBe(true);
  });

  it("rejects a step that is both dungeon and dungeonsOff", () => {
    const p = clone();
    p.steps[1]!.dungeonsOff = true;
    expect(validate(p)).toBe(false);
  });

  it("example resolves differently with the dungeon toggle", () => {
    const off = resolveRoute(example.steps, { route: "balanced", dungeons: false }).steps.map((s) => s.id);
    const on = resolveRoute(example.steps, { route: "balanced", dungeons: true }).steps.map((s) => s.id);
    expect(off).toEqual(["example:accept-a", "example:open-world", "example:bonus"]);
    expect(on).toEqual(["example:accept-a", "example:dungeon", "example:bonus"]);
  });
});
