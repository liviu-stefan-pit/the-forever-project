import { describe, expect, it } from "vitest";
import {
  grayLevel,
  mobsForGap,
  mobXp,
  questXp,
  questXpForPlayer,
  xpToNext,
  zd,
} from "./rules";

describe("xpToNext", () => {
  it("matches Forever 1.60.1.71037 ContentSetID 0 anchors", () => {
    expect(xpToNext(1)).toBe(400);
    expect(xpToNext(59)).toBe(209800);
    let sum = 0;
    for (let level = 1; level <= 59; level++) sum += xpToNext(level);
    expect(sum).toBe(4084700);
  });

  it("returns 0 at the level 60 cap and below 1", () => {
    expect(xpToNext(60)).toBe(0);
    expect(xpToNext(61)).toBe(0);
    expect(xpToNext(0)).toBe(0);
    expect(xpToNext(-3)).toBe(0);
  });
});

describe("questXp", () => {
  it("reads Difficulty_1..7 from the QuestXP row", () => {
    expect(questXp(1, 1)).toBe(10);
    expect(questXp(10, 5)).toBe(840);
    expect(questXp(60, 7)).toBe(9950);
  });

  it("returns 0 for unused and out-of-range tiers", () => {
    expect(questXp(10, 0)).toBe(0);
    expect(questXp(10, 8)).toBe(0);
    expect(questXp(10, 9)).toBe(0);
    expect(questXp(10, 99)).toBe(0);
    expect(questXp(0, 5)).toBe(0);
    expect(questXp(101, 5)).toBe(0);
  });
});

describe("questXpForPlayer", () => {
  it("applies the Classic outlevel penalty and rounds", () => {
    expect(questXpForPlayer(1000, 10, 16)).toBe(800);
    expect(questXpForPlayer(1000, 10, 20)).toBe(100);
    expect(questXpForPlayer(1000, 10, 15)).toBe(1000);
  });

  it("keeps full XP when the quest is at or above the player", () => {
    expect(questXpForPlayer(1000, 16, 10)).toBe(1000);
    expect(questXpForPlayer(1000, 10, 10)).toBe(1000);
  });
});

describe("zd", () => {
  it("uses the Classic Zero Difference brackets", () => {
    expect(zd(1)).toBe(5);
    expect(zd(7)).toBe(5);
    expect(zd(8)).toBe(6);
    expect(zd(9)).toBe(6);
    expect(zd(10)).toBe(7);
    expect(zd(11)).toBe(7);
    expect(zd(12)).toBe(8);
    expect(zd(15)).toBe(8);
    expect(zd(16)).toBe(9);
    expect(zd(19)).toBe(9);
    expect(zd(20)).toBe(11);
    expect(zd(29)).toBe(11);
    expect(zd(30)).toBe(12);
    expect(zd(39)).toBe(12);
    expect(zd(40)).toBe(13);
    expect(zd(44)).toBe(13);
    expect(zd(45)).toBe(14);
    expect(zd(49)).toBe(14);
    expect(zd(50)).toBe(15);
    expect(zd(54)).toBe(15);
    expect(zd(55)).toBe(16);
    expect(zd(59)).toBe(16);
    expect(zd(60)).toBe(17);
    expect(zd(70)).toBe(17);
  });
});

describe("grayLevel", () => {
  it("matches the Classic gray-mob formula anchors", () => {
    expect(grayLevel(1)).toBe(0);
    expect(grayLevel(5)).toBe(0);
    expect(grayLevel(10)).toBe(4);
    expect(grayLevel(20)).toBe(13);
    expect(grayLevel(40)).toBe(31);
    expect(grayLevel(50)).toBe(39);
    expect(grayLevel(59)).toBe(47);
    expect(grayLevel(60)).toBe(47);
  });
});

describe("mobXp", () => {
  it("matches Forever same-level and higher-mob anchors", () => {
    expect(mobXp(16, 16)).toBe(125);
    expect(mobXp(16, 18)).toBe(138);
  });

  it("uses the mob-level base for lower-level Forever kills", () => {
    expect(mobXp(16, 13)).toBe(73);
  });

  it("doubles elite kills and never awards gray mobs", () => {
    expect(mobXp(16, 16, true)).toBe(250);
    expect(mobXp(16, 10)).toBe(0);
    expect(mobXp(16, 7)).toBe(0);
  });
});

describe("mobsForGap", () => {
  it("returns a same-level high end and a ~2-below low end, smaller count first", () => {
    const gap = 1250;
    const { mobs, mobLevel } = mobsForGap(gap, 16);
    expect(mobLevel).toBe(14);
    expect(mobs[0]).toBe(Math.ceil(gap / mobXp(16, 16)));
    expect(mobs[1]).toBe(Math.ceil(gap / mobXp(16, 14)));
    expect(mobs[0]).toBeLessThanOrEqual(mobs[1]);
  });

  it("returns [0, 0] when there is no XP gap", () => {
    expect(mobsForGap(0, 16)).toEqual({ mobs: [0, 0], mobLevel: 14 });
    expect(mobsForGap(-10, 16).mobs).toEqual([0, 0]);
  });
});
