import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { arrangeProfessionNotes, hasLetterScore, parseProfessionReason } from "./professionNotes";

const file = JSON.parse(
  readFileSync(new URL("../../../research/professions/class_professions.json", import.meta.url), "utf8"),
) as {
  Shaman: { primary: { reason: string }[]; secondary: { reason: string }[] };
  Mage: { primary: { reason: string }[]; secondary: { reason: string }[] };
  Hunter: { primary: { reason: string }[]; secondary: { reason: string }[] };
  Rogue: { primary: { reason: string }[]; secondary: { reason: string }[] };
};

function reasons(cls: { secondary: { reason: string }[] }): string[] {
  return cls.secondary.map((row) => row.reason);
}

describe("parseProfessionReason", () => {
  const notes = parseProfessionReason(file.Shaman.primary[0].reason, reasons(file.Shaman));

  it("splits the Shaman reason into race and spec blocks", () => {
    const orc = notes.blocks.filter((block) => block.race === "Orc").map((block) => block.spec);
    expect(orc).toEqual(["enhancement", "elemental", "restoration"]);
    expect(notes.blocks.map((block) => block.race)).toEqual([
      "Orc",
      "Orc",
      "Orc",
      "Troll",
      "Troll",
      "Troll",
      "Tauren",
      "Tauren",
      "Tauren",
      "Skyborne",
      "Skyborne",
      "Skyborne",
    ]);
  });

  it("keeps each spec's sentences out of the other specs", () => {
    const enhancement = notes.blocks.find((block) => block.race === "Orc" && block.spec === "enhancement");
    const text = enhancement?.sentences.map((sentence) => sentence.text).join(" ");
    expect(text).toContain("Forever DB scores Alchemy and Engineering S");
    expect(text).not.toContain("Troll");
    expect(text).not.toContain("Buy herbs");
  });

  it("puts the shared crafting rules in the tail, once", () => {
    const tail = notes.tail.map((sentence) => sentence.text).join(" ");
    expect(tail).toContain("Do not add an herb circuit");
    expect(tail).toContain("Buy herbs, ore, and parts");
    expect(tail).toContain("Do not require Kernobee");
    expect(tail).not.toContain("First Aid, then Cooking");
    expect(notes.blocks.some((block) => block.sentences.some((sentence) => sentence.text.includes("Buy herbs")))).toBe(false);
  });

  it("marks Questie and race-bit sentences as source notes", () => {
    const troll = notes.blocks.find((block) => block.race === "Troll" && block.spec === "enhancement");
    const proof = troll?.sentences.find((sentence) => sentence.text.includes("Questie"));
    expect(proof?.sourceNote).toBe(true);
    expect(troll?.sentences.some((sentence) => !sentence.sourceNote && sentence.text.includes("Berserking"))).toBe(true);
  });

  it("marks a skipped race from the real Mage and Hunter notes", () => {
    const mage = parseProfessionReason(file.Mage.primary[0].reason, reasons(file.Mage));
    expect(mage.blocks.some((block) => block.race === "Tauren" && block.skipped)).toBe(true);
    expect(mage.blocks.some((block) => block.race === "Skyborne" && block.skipped)).toBe(true);

    const hunter = parseProfessionReason(file.Hunter.primary[0].reason, reasons(file.Hunter));
    const undead = hunter.blocks.find((block) => block.race === "Undead");
    expect(undead?.skipped).toBe(true);
    expect(undead?.sentences.map((sentence) => sentence.text).join(" ")).toContain("Skins come from beasts");
    expect(hunter.tail.some((sentence) => sentence.text.startsWith("Buy leather"))).toBe(true);
  });

  it("drops a tail sentence that is the start of a secondary reason", () => {
    const parsed = parseProfessionReason(
      "Undead shadow: Both roles take the pair. First Aid, Cooking, and Fishing stay secondary.",
      ["First Aid, Cooking, and Fishing stay secondary for both priest roles. Bandages spend the cloth."],
    );
    expect(parsed.tail.map((sentence) => sentence.text)).toEqual([]);
    expect(parsed.blocks[0].sentences.map((sentence) => sentence.text)).toEqual(["Both roles take the pair."]);
  });

  it("keeps a reason with no race label as tail bullets", () => {
    const plain = parseProfessionReason("Buy dyes or skip dyed patterns. Do not level Alchemy to feed Tailoring.");
    expect(plain.blocks).toEqual([]);
    expect(plain.tail.map((sentence) => sentence.text)).toEqual([
      "Buy dyes or skip dyed patterns.",
      "Do not level Alchemy to feed Tailoring.",
    ]);
  });

  it("parses every class without dropping the reason", () => {
    for (const [name, row] of Object.entries(file) as [string, { primary: { reason: string }[]; secondary: { reason: string }[] }][]) {
      const parsed = parseProfessionReason(row.primary[0].reason, reasons(row));
      const rendered = [...parsed.blocks.flatMap((block) => block.sentences), ...parsed.tail].map((sentence) => sentence.text).join(" ");
      expect(rendered.length, name).toBeGreaterThan(20);
      expect(parsed.blocks.every((block) => block.race.length > 0), name).toBe(true);
    }
  });

  it("reads 'Tauren is skipped' with no colon", () => {
    const rogue = parseProfessionReason(file.Rogue.primary[0].reason, reasons(file.Rogue));
    expect(rogue.blocks.some((block) => block.race === "Tauren" && block.skipped)).toBe(true);
  });
});

describe("arrangeProfessionNotes", () => {
  const notes = parseProfessionReason(file.Shaman.primary[0].reason, reasons(file.Shaman));

  it("opens the player's race and role, and collapses the rest", () => {
    const arranged = arrangeProfessionNotes(notes, "Orc", "dps");
    expect(arranged.focused).toBe(true);
    expect(arranged.open.map((group) => group.race)).toEqual(["Orc"]);
    expect(arranged.open[0].shown.map((block) => block.spec)).toEqual(["enhancement", "elemental"]);
    expect(arranged.open[0].other.map((block) => block.spec)).toEqual(["restoration"]);
    expect(arranged.others.map((group) => group.race)).toEqual(["Troll", "Tauren", "Skyborne"]);
  });

  it("leaves every race open when the profile has no race", () => {
    const arranged = arrangeProfessionNotes(notes, undefined, "healer");
    expect(arranged.focused).toBe(false);
    expect(arranged.others).toEqual([]);
    expect(arranged.open.map((group) => group.race)).toEqual(["Orc", "Troll", "Tauren", "Skyborne"]);
    expect(arranged.open[0].shown.map((block) => block.spec)).toEqual(["restoration"]);
    expect(arranged.open[0].other.map((block) => block.spec)).toEqual(["enhancement", "elemental"]);
  });
});

describe("hasLetterScore", () => {
  it("ignores the article A and catches a list score", () => {
    expect(hasLetterScore(["A Tauren healer still wants the S flasks."])).toBe(true);
    expect(hasLetterScore(["Mining is only D."])).toBe(true);
    expect(hasLetterScore(["Cloth bolts drop off humanoids already on the kill path."])).toBe(false);
  });
});
