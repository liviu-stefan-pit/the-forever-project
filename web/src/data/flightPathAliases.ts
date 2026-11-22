/**
 * Extra names for guide `fp` place/label strings that do not appear inside the taxi node name.
 * Keys are already normalized (lowercase, punctuation stripped).
 * Zone places such as "Stonetalon Mountains" match the node suffix and do not need an entry.
 */
export const FLIGHT_PATH_ALIASES: Record<string, readonly string[]> = {
  "get the flight path from devrak": ["crossroads"],
  "get the flight path from bragok": ["ratchet"],
  "get the flight path from omusa thunderhorn": ["camp taurajo"],
  "get the flight path from doras": ["orgrimmar"],
  "get the flight path from tal": ["thunder bluff"],
  "get the flight path from michael garrett": ["undercity"],
  "get the flight path from karos razok": ["the sepulcher", "sepulcher"],
  riverglades: ["revantusk village", "the hinterlands"],
};
