import { describe, expect, it } from "vitest";
import { formatZoneCoord, isNameMismatchStatus, linkLabel, linkOptions } from "./GameSyncPanel";

describe("GameSyncPanel link select", () => {
  const a = { name: "Zugrok", realm: "Forever" };
  const b = { name: "Zugrok", realm: "Alt" };
  it("lists every exported character with its realm", () => {
    expect(linkOptions([a, b]).map(linkLabel)).toEqual(["Zugrok — Forever", "Zugrok — Alt"]);
  });
  it("keeps the current link selectable when it is not in the export", () => {
    const old = { name: "Old", realm: "Gone" };
    expect(linkOptions([a], old)).toEqual([a, old]);
    expect(linkOptions([a], a)).toEqual([a]);
  });
  it("detects the name-mismatch status that shows Link to buttons", () => {
    expect(
      isNameMismatchStatus(
        "This profile is Grom; export has Thrall. Pick the character under Game sync on the Profile page.",
      ),
    ).toBe(true);
    expect(isNameMismatchStatus("Synced Zugrok — Forever")).toBe(false);
  });
});

describe("formatZoneCoord", () => {
  it("turns 0–1 export coords into zone percent and leaves 0–100 coords alone", () => {
    expect(formatZoneCoord(0.455)).toBe("45.5");
    expect(formatZoneCoord(0.425)).toBe("42.5");
    expect(formatZoneCoord(45.5)).toBe("45.5");
    expect(formatZoneCoord(42.5)).toBe("42.5");
    expect(formatZoneCoord(0)).toBe("0.0");
    expect(formatZoneCoord(100)).toBe("100.0");
  });
});
