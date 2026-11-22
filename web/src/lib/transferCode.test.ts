import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { GuideIndex, Profile } from "../data/schema";
import { buildPayload, decodePayload, encodePayload, indexStepIds, MAX_QR_URL, payloadToProfileJson } from "./transferCode";

const index = JSON.parse(readFileSync(join(__dirname, "../../public/data/guide_index.json"), "utf8")) as GuideIndex;

function profileAtLevel40(): Profile {
  const ids = indexStepIds(index);
  // Every step of the Orc chain through the 20-40 packs done.
  const upTo = ids.indexOf(index.entries!.find((e) => e.slug === "horde-40-60-01-riverglades-stv")!.stepIds[0]!);
  const steps: Profile["steps"] = {};
  ids.slice(0, upTo).forEach((id, i) => {
    if (!id.startsWith("mulgore") && !id.startsWith("tirisfal") && !id.startsWith("zephras") && !id.startsWith("silverpine")) steps[id] = i % 97 === 0 ? { skipped: true, at: 1 } : { done: true, at: 1 };
  });
  const quests: Profile["quests"] = {};
  for (let q = 0; q < 900; q++) quests[800 + q * 7] = q % 50 === 0 ? "skipped" : "done";
  for (let q = 0; q < 20; q++) quests[90000 + q * 13] = "accepted";
  return {
    id: "x",
    name: "Grommash",
    race: "Orc",
    cls: "Warrior",
    level: 40,
    routeStyle: "balanced",
    role: "tank",
    professions: ["Mining", "Skinning"],
    options: { showOptional: true, hideDone: false, dungeons: true },
    steps,
    quests,
    addedQuests: [123],
    current: { guide: "horde-40-60-01-riverglades-stv", step: "abc" },
    createdAt: 1,
    updatedAt: 1,
    schema: 1,
  };
}

describe("transfer code", () => {
  it("round-trips a level 40 profile and fits a QR code", async () => {
    const p = profileAtLevel40();
    const code = await encodePayload(buildPayload(p, index));
    const url = `https://example.pages.dev/#/transfer?d=${code}`;
    expect(url.length).toBeLessThan(MAX_QR_URL);
    const back = JSON.parse(payloadToProfileJson(await decodePayload(code), index, 5)) as Profile;
    expect(Object.keys(back.steps).length).toBe(Object.keys(p.steps).length);
    expect(Object.entries(back.steps).filter(([, v]) => "skipped" in v).length).toBe(Object.entries(p.steps).filter(([, v]) => "skipped" in v).length);
    expect(back.quests).toEqual(p.quests);
    expect(back.current).toEqual(p.current);
    expect(back.professions).toEqual(["Mining", "Skinning"]);
    expect(back.options.dungeons).toBe(true);
    expect(back.addedQuests).toEqual([123]);
  });

  it("rejects junk", async () => {
    await expect(decodePayload("not-a-code")).rejects.toThrow();
  });
});
