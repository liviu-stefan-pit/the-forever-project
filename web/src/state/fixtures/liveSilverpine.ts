/**
 * Live Silverpine snapshot: Throgar Ashfang, level 13, standing in The Sepulcher
 * (map 1421). Extracted from GuideWebExport.lua (read only). Class is incidental —
 * the export happens to be an Undead Priest. Any class with the same completed
 * quests and quest log hits the same bugs. Race and class are kept so existing
 * guide filters hide the same steps they hide in the app (Paladin-only steps, and
 * so on).
 */
import type { ClassKey, Profile, RaceKey } from "../../data/schema";

export interface LiveQuestLogEntry {
  id: number;
  /** Ready to turn in. Omitted or false means still in the log. */
  complete?: boolean;
  objectives?: { text?: string; finished?: boolean; numFulfilled?: number; numRequired?: number }[];
}

export const liveSilverpine = {
  name: "Throgar Ashfang",
  level: 13,
  race: "Undead" as RaceKey,
  cls: "Priest" as ClassKey,
  hearth: "The Sepulcher",
  position: {
    mapId: 1421,
    x: 0.4553382992744446,
    y: 0.425148069858551,
    zone: "Silverpine Forest",
    subzone: "The Sepulcher",
  },
  taxi: [
    { id: 10, name: "The Sepulcher, Silverpine Forest", mapId: 1463 },
    { id: 11, name: "Undercity, Tirisfal", mapId: 1463 },
  ],
  completed: [
    8, 354, 355, 356, 358, 359, 360, 362, 363, 364, 365, 367, 368, 369, 370, 371, 372, 374, 375, 376, 380, 381, 382,
    383, 398, 404, 405, 407, 408, 426, 427, 429, 435, 445, 449, 492, 3097, 3221, 3901, 3902, 5481, 5482, 5650, 5651,
    6321, 6395, 86784, 95314, 95998, 96047, 96056, 96057, 96101, 96102, 96604, 96605, 96606, 96607, 96608, 96626,
    96627, 96628, 96629, 96630, 96634, 96638, 96646, 96652, 96655, 96656, 96658, 96659, 96661, 96895, 96896, 96897,
    96898, 96899, 97558, 97903, 97908, 97919, 97924, 97925, 97931, 97936, 97937, 97942, 97949, 97950, 97955, 97960,
    97961, 97965, 97971, 97972, 97973, 98289, 98389, 98545, 99134, 99141, 99142, 99144, 99152, 99153, 99156, 99582,
  ],
  questLog: [
    {
      id: 6323,
      complete: true,
      objectives: [
        {
          text: "Buy a bat ride to the Undercity from the bat master Karos Razok, then take Podrig's Order to Gordon Wendham in the Undercity.",
          finished: true,
          numFulfilled: 1,
          numRequired: 1,
        },
      ],
    },
    {
      id: 421,
      complete: false,
      objectives: [{ text: "0/5 Moonrage Whitescalp slain", finished: false, numFulfilled: 0, numRequired: 5 }],
    },
    {
      id: 430,
      complete: true,
      objectives: [
        {
          text: "Bring Quinn's potion to Quinn Yorick at the Ivar Patch, north of the Sepulcher.",
          finished: true,
          numFulfilled: 1,
          numRequired: 1,
        },
      ],
    },
    {
      id: 447,
      complete: false,
      objectives: [
        { text: "0/6 Grizzled Bear Heart", finished: false, numFulfilled: 0, numRequired: 6 },
        { text: "0/6 Skittering Blood", finished: false, numFulfilled: 0, numRequired: 6 },
      ],
    },
    {
      id: 477,
      complete: true,
      objectives: [],
    },
    {
      id: 437,
      complete: false,
      objectives: [
        { text: "0/1 Essence of Nightlash", finished: false, numFulfilled: 0, numRequired: 1 },
        { text: "Enter the Dead Fields", finished: false, numFulfilled: 0, numRequired: 1 },
      ],
    },
    {
      id: 1359,
      complete: true,
      objectives: [
        {
          text: "Bring the Wolf Heart Samples to Apothecary Zinge in the Undercity.",
          finished: true,
          numFulfilled: 1,
          numRequired: 1,
        },
      ],
    },
  ] satisfies LiveQuestLogEntry[],
};

/** Profile fields the step logic reads. Quest-log time is the export clock, not a sync side effect. */
export function liveSilverpineProfile(partial: Partial<Profile> = {}): Profile {
  const quests: Profile["quests"] = {};
  for (const id of liveSilverpine.completed) quests[id] = "done";
  return {
    id: "live-silverpine",
    name: liveSilverpine.name,
    race: liveSilverpine.race,
    cls: liveSilverpine.cls,
    level: liveSilverpine.level,
    routeStyle: "balanced",
    options: { showOptional: true, hideDone: false },
    steps: {},
    quests,
    addedQuests: [],
    questLog: liveSilverpine.questLog.map((entry) => ({
      questId: entry.id,
      complete: entry.complete ? 1 : 0,
      ...(entry.objectives?.length ? { objectives: entry.objectives } : {}),
    })),
    questLogSyncedAt: "2026-11-21T11:24:09.000Z",
    hearth: liveSilverpine.hearth,
    flightPaths: liveSilverpine.taxi.map((node) => ({ ...node })),
    position: { ...liveSilverpine.position },
    createdAt: 1,
    updatedAt: 1,
    schema: 1,
    ...partial,
  };
}
