import { describe, expect, it } from "vitest";
import { closeQuestHref, questHref } from "./questNav";

describe("questHref", () => {
  it("opens a drawer over the current guide and deep-links elsewhere", () => {
    expect(questHref(788, { pathname: "/guide/1-6-durotar", search: "?step=abc" })).toBe(
      "/guide/1-6-durotar?step=abc&quest=788",
    );
    expect(questHref(788, { pathname: "/guide/1-6-durotar", search: "?step=abc&stepFor=p1" }, "card:032")).toBe(
      "/guide/1-6-durotar?step=card%3A032&stepFor=p1&quest=788",
    );
    expect(questHref(788, { pathname: "/overview", search: "?step=abc" }, "card:032")).toBe("/quest/788");
    expect(questHref(788, { pathname: "/overview", search: "" })).toBe("/quest/788");
    expect(questHref(804, { pathname: "/quest/788", search: "" })).toBe("/quest/804");
  });
});

describe("closeQuestHref", () => {
  it("drops the quest param and keeps the step", () => {
    expect(closeQuestHref({ pathname: "/guide/1-6-durotar", search: "?step=abc&quest=788" })).toBe(
      "/guide/1-6-durotar?step=abc",
    );
  });
});
