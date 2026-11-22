/**
 * Horde 1–60 play order. One definition for both route styles.
 * Shared tail packs (Barrens and 20–60) have the same neighbor in every chain.
 * `LevelingChain.packs` in the XP sim uses the speedrun list (Tirisfal → Barrens).
 */
import type { RouteStyle } from "../data/schema";

/** Play order for the split 20–60 Horde route. Guide slugs, not step ids. */
export const HORDE_20_60_PACKS = [
  "horde-20-40-01-barrens-a",
  "horde-20-40-02-barrens-b",
  "horde-20-40-03-stonetalon-ashenvale-hillsbrad",
  "horde-20-40-04-needles",
  "horde-20-40-05-desolace",
  "horde-20-40-06-stv-arathi",
  "horde-20-40-07-swamp-riverglades",
  "horde-40-60-01-riverglades-stv",
  "horde-40-60-02-riverglades-arathi",
  "horde-40-60-03-tanaris-feralas",
  "horde-40-60-04-hinterlands-azshara",
  "horde-40-60-05-ungoro-felwood",
  "horde-40-60-06-plaguelands",
  "horde-40-60-07-hyjal-winterspring",
  "horde-40-60-08-hyjal-to-60",
  "horde-40-60-09-wrapup",
] as const;

export type Horde2060Pack = (typeof HORDE_20_60_PACKS)[number];

/** Last pack of the 1–60 route. No successor in either style. */
export const FINAL_LEVELING_PACK: Horde2060Pack = "horde-40-60-09-wrapup";

const TAIL = ["barrens-12-20", ...HORDE_20_60_PACKS] as const;

export interface RouteChain {
  id: string;
  title: string;
  packs: Record<RouteStyle, readonly string[]>;
  /** How this chain was discovered from pack endings. */
  handoff: string;
}

export const ROUTE_CHAINS: readonly RouteChain[] = [
  {
    id: "orc",
    title: "Durotar → Barrens → 20-60",
    packs: {
      speedrun: ["durotar-1-12", ...TAIL],
      balanced: ["durotar-1-12", ...TAIL],
    },
    handoff:
      "durotar-1-12 last step leaves Orgrimmar west gate into the Barrens (Far Watch). barrens-12-20 ends on grind-to-20 (Stormsnouts south of Camp Taurajo until level 20), which the first 20-40 pack names as its start. 40-60 continues from the end of 20-40.",
  },
  {
    id: "tauren",
    title: "Mulgore → Barrens → 20-60",
    packs: {
      speedrun: ["mulgore-1-12", ...TAIL],
      balanced: ["mulgore-1-12", ...TAIL],
    },
    handoff:
      "mulgore-1-12 last step runs east to Thork at the Crossroads. Then the same Barrens → 20-60 tail.",
  },
  {
    id: "undead",
    title: "Tirisfal → Barrens → 20-60",
    packs: {
      speedrun: ["tirisfal-1-12", ...TAIL],
      balanced: ["tirisfal-1-12", "silverpine-11-15", ...TAIL],
    },
    handoff:
      "Speedrun tirisfal-1-12 takes the zeppelin and hands off to barrens-12-20 at about 12 (Silverpine is not on this route). Balanced tirisfal-1-12 goes south into silverpine-11-15 (Delivery to Silverpine Forest); silverpine then joins barrens-12-20. XP simulation uses the speedrun pack list (Tirisfal → Barrens). Then 20-60.",
  },
  {
    id: "skyborne",
    title: "Zephras Isle → Barrens → 20-60",
    packs: {
      speedrun: ["zephras-isle", ...TAIL],
      balanced: ["zephras-isle", ...TAIL],
    },
    handoff:
      "zephras-isle ends at Alaana Stormwalker in Mulgore (The Earthen Ring). The pack tip says a join into Mulgore 1-12 is unverified; the natural 12+ bracket is Barrens (same as the other 1-12 finishes).",
  },
];

const NEXT: Record<RouteStyle, Map<string, string | undefined>> = {
  balanced: neighborIndex("balanced", 1),
  speedrun: neighborIndex("speedrun", 1),
};
const PREV: Record<RouteStyle, Map<string, string | undefined>> = {
  balanced: neighborIndex("balanced", -1),
  speedrun: neighborIndex("speedrun", -1),
};

/** Next slug when every chain that contains `slug` agrees. Undefined when the slug is absent or neighbors disagree. */
export function resolveNextGuide(slug: string, routeStyle: RouteStyle): string | undefined {
  return NEXT[routeStyle].get(slug);
}

export function resolvePrevGuide(slug: string, routeStyle: RouteStyle): string | undefined {
  return PREV[routeStyle].get(slug);
}

/** True when `slug` is on a chain and neither style has a successor (the wrapup pack). */
export function isChainTerminal(slug: string): boolean {
  const onChain = ROUTE_CHAINS.some(
    (c) => c.packs.speedrun.includes(slug) || c.packs.balanced.includes(slug),
  );
  if (!onChain) return false;
  return resolveNextGuide(slug, "speedrun") === undefined && resolveNextGuide(slug, "balanced") === undefined;
}

function neighborIndex(style: RouteStyle, delta: 1 | -1): Map<string, string | undefined> {
  const votes = new Map<string, Set<string | undefined>>();
  for (const chain of ROUTE_CHAINS) {
    const packs = chain.packs[style];
    for (let i = 0; i < packs.length; i++) {
      const slug = packs[i]!;
      const neighbor = packs[i + delta];
      let set = votes.get(slug);
      if (!set) {
        set = new Set();
        votes.set(slug, set);
      }
      set.add(neighbor);
    }
  }
  const out = new Map<string, string | undefined>();
  for (const [slug, set] of votes) {
    out.set(slug, set.size === 1 ? [...set][0] : undefined);
  }
  return out;
}
