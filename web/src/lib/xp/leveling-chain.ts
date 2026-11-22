/**
 * Play order for the split 20–60 Horde route. Step ids are unchanged
 * (`horde-20-40:…`, `h4060:…`); these are guide slugs.
 * Declared `levels` stay on the guide objects — do not copy them here.
 * The slug list itself lives in `routeChains.ts`.
 */
export { HORDE_20_60_PACKS, type Horde2060Pack } from "../routeChains.ts";
import { HORDE_20_60_PACKS, type Horde2060Pack } from "../routeChains.ts";

/** Last pack of the 20–40 band. Exit below 39.5 fails the sub-pack XP report. */
export const LAST_20_40_PACK: Horde2060Pack = "horde-20-40-07-swamp-riverglades";

/** Last pack of the 40–60 band (no `next`). */
export const LAST_40_60_PACK: Horde2060Pack = "horde-40-60-09-wrapup";

const INDEX = new Map<string, number>(HORDE_20_60_PACKS.map((slug, i) => [slug, i]));

export function horde2060Index(slug: string): number | undefined {
  return INDEX.get(slug);
}
