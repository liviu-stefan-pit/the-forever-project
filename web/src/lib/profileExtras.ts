/** Small helpers for the top-bar Dungeons toggle and the class/role picker (DESIGN.md §6). */
import type { Profile, Role } from "../data/schema";

export function readDungeons(profile: Pick<Profile, "options"> | null | undefined): boolean {
  return profile?.options.dungeons === true;
}

export function readRole(profile: Pick<Profile, "role"> | null | undefined): Role | undefined {
  return profile?.role;
}

/** Turn dungeons on/off on the active profile. The route engine does the filtering. */
export function writeDungeons(api: { setOptions(partial: Partial<Profile["options"]>): void }, on: boolean): void {
  api.setOptions({ dungeons: on });
}

export const ROLE_LABEL: Readonly<Record<Role, string>> = { tank: "Tank", healer: "Healer", dps: "DPS" };
