/** Route labels for the Balanced | Speedrun picker (DESIGN.md §2, §6). */
import type { RouteStyle } from "../data/schema";

export const SPEEDRUN: RouteStyle = "speedrun";

export function isSpeedrun(style: string | undefined): boolean {
  return style === "speedrun" || style === "lean";
}

export const ROUTE_OPTIONS: readonly { v: RouteStyle; label: string; title: string }[] = [
  { v: "balanced", label: "Balanced", title: "Relaxed line with worthwhile extra quests" },
  { v: "speedrun", label: "Speedrun", title: "The highly optimised line: no extras" },
];

export function routeLabel(style: string | undefined): string {
  return isSpeedrun(style) ? "Speedrun" : "Balanced";
}
