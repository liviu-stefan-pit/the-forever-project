/**
 * Map slot contract — **P8 replaces `ZoneMapSlot.tsx`** with the real zone route map and
 * must accept exactly these props (it may add optional ones).
 *
 * - One map per zone **section** (plan D7), never per step.
 * - `variant: "header"` = the banner at the top of each zone section in the step list.
 *   `variant: "panel"`  = the sticky right panel / mobile sheet, showing the current section.
 * - `activeStop` = stop of the current step (pulse it). `doneStops` = every visible step at
 *   that stop is ticked (dim it).
 * - `onStopSelect(stop)` = user clicked a stop; the reader scrolls to and selects that
 *   stop's first visible step.
 */
import type { Section, Stop, ZoneInfo } from "../../data/schema";
import type { StepLeg } from "./route";
import type { MapMarker } from "../../lib/mapMarkers";
import type { StepPoint } from "../../lib/stepPoints";

/** Giver / ender overlay for quest-mode maps (P9). */
export interface QuestMapPin {
  kind: "start" | "end";
  x: number;
  y: number;
  label: string;
}

export interface ZoneMapSlotProps {
  section: Section;
  /** From `zones.json` (bounds, image, levels); undefined while loading or unknown. */
  zone?: ZoneInfo;
  variant: "header" | "panel";
  /** Visible steps in this section (after filters / Speedrun mode). */
  stepCount: number;
  /** 1-based index of this section in the guide and the guide's section count. */
  position?: { index: number; total: number };
  activeStop?: number;
  doneStops?: ReadonlySet<number>;
  onStopSelect?: (stop: Stop) => void;
  /** Step id → short label for the stop hover list. Falls back to the stop label + step count. */
  stepLabels?: Readonly<Record<string, string>>;
  /**
   * `"quest"` = start-to-end quest route and S/E pins.
   * Default `"section"` draws `leg` when the section holds the selected step, otherwise the zone image only.
   */
  mode?: "section" | "quest";
  questPins?: readonly QuestMapPin[];
  /** Selected step's A → via → B leg. Omit on sections that are not showing that step. */
  leg?: StepLeg;
  /** Plain-text name of the selected step, shown under the zone title. */
  caption?: string;
  /** Quest polyline in zone percent. Used when `mode` is `"quest"` instead of `leg`. */
  routePoints?: readonly { x: number; y: number }[];
  /** Progress marks: current step (pulsing ring), done steps (check), the rest (dot). */
  stepPoints?: readonly StepPoint[];
  /** Click on a progress mark: select that spot's first step. */
  onStepPointSelect?: (stepId: string) => void;
  /** Typed markers (giver, turn-in, mob area, vendor, trainer, flight path …) in zone %. */
  markers?: readonly MapMarker[];
  /** Faint full-section line rebuilt from the visible gotos (`visibleRoutePolyline`). */
  sectionRoute?: readonly { x: number; y: number }[];
  /** Region outline rings in zone %; defaults to `zone.outline`. Skipped when missing. */
  outline?: ZoneInfo["outline"];
}
