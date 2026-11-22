import { describe, expect, it } from "vitest";
import { luaCharacterLabel } from "./ProfilePage";
import type { GameExportCharacter } from "../state/luaExport";

function ch(partial: Partial<GameExportCharacter> & Pick<GameExportCharacter, "key">): GameExportCharacter {
  return { completedQuests: [], ...partial };
}

describe("lua import character list", () => {
  it("labels every exported character, not only the first", () => {
    const labels = [
      ch({ key: "Zugrok", name: "Zugrok", race: "Orc", cls: "Warrior", level: 12, completedQuests: [1, 2] }),
      ch({ key: "Thrall", name: "Thrall Stormrage", realm: "" }),
    ].map(luaCharacterLabel);
    expect(labels).toEqual(["Zugrok · Orc Warrior · lv 12 · 2 completed quests", "Thrall Stormrage"]);
  });
});
