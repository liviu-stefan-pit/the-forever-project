Sources: Questie plus OpenXP, TUGs, WoW-Pro, and Bethink were enough for ids, order, and spawns.

# Stonetalon Mountains and Ashenvale (Horde 20–40) — external review

Route file was read only: `research/levels-20-40.route-v2.json`. No route JSON was edited.

Map check: Questie `zones.json` maps area **406** Stonetalon Mountains to UiMap **1442**, and area **331** Ashenvale to UiMap **1440**. Steps in those sections already use 1442 and 1440. Seereth Stonebreak (4049) and Makaba Flathoof (11857) spawn in Barrens area **17**, so their pins stay on UiMap **1413** (35.26, 27.88 and 35.19, 27.76). Do not treat 406 or 331 as `mapId`.

`pre.single` means any one of the listed quests. `pre.group` means all of them.

## What this file already does

Late Barrens, before the Stonetalon header, already enters the zone: turn in **1060** (pre **876**, and 876 is on this file), accept **1061** in Orgrimmar, turn it in to Seereth, **1062** (15 Venture Co. Loggers) and **1068** (XT:4 and XT:9), **6548** and **6629** (Grimtotem), turn in **1483** and finish **1093** at Ziz Fizziks (58.99, 62.6). **6382** is accepted at Jorn and turned in at Senani. **5881** is accepted at Maggran on balanced only. **79192** is turned in at Pocket Litter (40.75, 52.57).

The Stonetalon section then tells the player to clear Grimtotem and Windshear again, gets Tharm’s flight path (45.12, 59.84), and runs **1094 → 1095 → 1096**, **6461**, **6284**, **6282 → 6283**, **1087 → 1088 → 1089**, **1063 → 1064**, then balanced-only **6421 → 6481**, **6301 → 6381**, **6393**, **1090 → 1092**, plus Forever **86576**, **97538**, **78270** (balanced), **79980** (balanced).

Ashenvale opens at Zoram’gar (Andruk 12.24, 33.8), flies to Splintertree (Vhulgra 73.18, 61.59), then does **6442**, **216**, **6503**, **6544**, **6383**, the three hunt items **23 / 24 / 2** and **247**, **6441**, **25**, **1918**, **824**, balanced **6462**, **6641**, **6482**, **6504**, **6571**, balanced **6581**, **6621**, and Forever **95042**.

**6523** Protect Kaya is not on this file. **6401** needs 6523, so it stays off. Blackfathom quests **6563** and **6921** are not on this file.

## Speedrun line

One Windshear pass (already in Late Barrens), Sun Rock flight path, one Malaka’jin stop, the Thunder Bluff handoff that this file already continues in Hillsbrad, then Splintertree and one Zoram trip.

Keep: **1060, 1061, 1062, 1068, 6548, 6629, 1483, 1093, 1094, 1095, 1096, 6461, 1063, 1064, 5881, 6442, 216, 6503, 25, 6383**. **1918 → 824** only when the globe actually drops while killing the elementals for 25. **6562** is a new talk: accept at Tsunaman, turn in at Je’neu on the Zoram visit this section already makes. Do not accept **6563**.

**1062** has an empty `pre`. **1061** is only the breadcrumb (`next` 1062). **1063** requires 1062, which is already turned in before the Stonetalon header. **1064** `next` is **1065**, and 1065 is already on this file in Hillsbrad. That Thunder Bluff stop is the handoff, not a new city loop.

**6382** is not on the speedrun line. Its `pre` is **882** Ishamuhale. 882 is not in this file (it is only in the 12–20 Barrens pack). **6383** has an empty `pre` and no xp. Accept it and turn it in at Senani so the hunt items can be handed in later. Do not camp the beasts.

## Balanced

Same combat line as speedrun. The extra balanced steps in the file are the ones dropped below (crystal cave, seeds, incendrites, Piznik, troll charms, saw blades, lockpicks, Scramble). They are not a second circuit worth keeping.

Set the Sun Rock hearth only if you are staying for 6461 and the Ziz turn-ins. The section-start sentence that says to clear Grimtotem and Windshear again repeats Late Barrens.

## 15–17 crowd tip

Not a second Barrens guide. If the Barrens road is packed, the south Stonetalon border has three quests whose `pre` is empty: **6548** (req 12, Makaba beside Seereth), **6461** (req 13, Xen’Zilla at 71.25, 95.02, spiders around 59.4, 78.9), and **1483** once Sputtervalve has been spoken to (no `pre`, `next` 1093). **1060** still needs **876**, which this file does in Late Barrens, so it is not a 15–17 pickup unless Serena is already turned in. Do not start 1058, 6523, Besseleth, or the peak on that dip.

## Dropped as slow (whole chain)

Elites (`rank` 1), escorts (`PARTY_ACCEPT`), collection counts, or a follow-up trip that exists only to finish that quest.

- **6282 → 6283.** 7+7+7+7 harpies, then Bloodfury Ripper (12579, level 26, rank 1) at 30.75, 61.91.
- **6284.** Besseleth (11921, level 21, rank 1). Poster is at 59.06, 75.71. No `next`.
- **6421 → 6481.** 10 Resonite Crystals, then Goggeroc (11920, level 20, rank 1) at 57.4, 89.4.
- **6301 → 6381.** 10 Gaea Seeds, then plant 10 mounds.
- **6393.** 10 Incendrites.
- **1058.** 5 Stonetalon Sap, 5 Twilight Whiskers, 30 Courser Eyes, 1 Fey Dragon Scale. No `next`.
- **1090 → 1092.** Piznik is `PARTY_ACCEPT` and `STAY_ALIVE`.
- **1087 → 1088 → 1089.** Peak kill quota, then Ordanus’ head in Ashenvale (4273 at 62.05, 51.37), then three keys in the Den.
- **86576.** 15 Glittering Sunstones.
- **97538.** 30 Mirkweed Pods, turned in in Thunder Bluff.
- **78270.** Rogue (`classes` 8), no xp. Questie objective text sends the player to Shadowfang Keep. Not an open-world Windshear step.
- **79980** and do not add **79974** or **79975**. 79980 is 195 xp. Its `next` is Wet Job (level 32), then Eagle’s Fist in Stonewrought Dam. **79192** stays: `pre.single` is 79007 or 79008, and **79007** is already on this file. 79008 is not in `quests.json`.
- **6544** Torek’s Assault, **6641** Vorsha, **6482** Ruul. All `PARTY_ACCEPT`. Do not add **6523**.
- **2, 23, 24, 247.** Item starts off Sharptalon (level 31, one spawn 74.98, 70.06), Shadumbra (level 28, 57.5, 56.05), Ursangous (level 25, 39.76, 65.21). 247 `pre.group` is all three. WoW-Pro’s 15–21 Barrens note skips them because the lowest does not grey until 32. The route’s complete pins for all three are Senani at 73.78, 61.46, which is the turn-in, not the mob.
- **6441.** 16 Satyr Horns.
- **6462.** 8 Troll Charms in the furbolg cave.
- **6504.** 12 manual pages into three chapters.
- **6571** and **6581.** Four supply items; 6581 has no xp.
- **6621.** Needs **216**, which stays, because the avengers and shaman are turned in at Karang on the same Zoram visit. The banner is a separate trip to 56.5, 63.5 and back. 216 is not dropped.
- **95042.** One Kor Gem (item 6995).
- **6382** only. Missing **882** on this file. See below. **6383** stays.

## Missing-prereq chains

- **6382** The Ashenvale Hunt from Jorn. `pre.single` **882**. 882 is not in `levels-20-40.route-v2.json`. Drop 6382 here. **235** (Orgrimmar) and **742** (Thunder Bluff) also lead to Senani and have empty `pre`; they are not added, because **6383** itself has an empty `pre`.
- Nothing else on the kept list is waiting on a quest that this file never turns in. **1060** has 876. **1063** has 1062. **1094** has 1093. **216**, **6442**, **6503**, **25**, **6461**, **6548** have empty `pre`.

## Order

Accept **25** at Mastok (73.67, 60.0) on the first Splintertree stop, with **6503**, and kill the elementals at Mystral Lake before the satyr camp. A real Befouled Water Elemental spawn is **49.36, 69.85** on map 1440. The current complete step stands on Senani’s coordinates. Scout the lake gazebo in the same pull. If item 16408 drops, accept **1918**, turn it in at Mastok, and accept **824**. Turn **824** in at Je’neu (11.56, 34.29) on the Zoram trip that already turns in **6442** and **216**. Do not make a flight only for the globe.

Accept **6562** from Tsunaman (47.36, 64.25, map 1442) before leaving Sun Rock. Turn it in to Je’neu on that same Zoram visit. Leave **6563** (20 Sapphires of Aku’Mai) to the Blackfathom stretch.

## Source notes (facts, not wording)

- OpenXP `Horde-22-30.lua` does Ashenvale before a later Stonetalon block and still accepts 6482, 6441, 6503, 6621, 6301, 6282, 86576, and 1087. OpenXP Forever `Horde-12-22_Barrens.lua` does 6548, 6629, and 6523 on the way into the zone around the high teens. Ids and that camp order only.
- TUGs `25-26 Ashenvale` turns in 742, accepts 6383, runs 25, 6442, 216, 6462, 6641, 6482, 6503, 6544, and picks up 23 and 24 only if the items drop.
- WoW-Pro Forever `15_21_Hendo_The_Barrens.lua` accepts 6382 from Jorn, turns in at Senani, accepts 6383, and tells the player not to hunt the three beasts yet. `21_30_Hendo_HordeChapter1.lua` looks for those three later.
- Bethink `H-24-27_Ashenvale.lua` still runs 6393, 6282, 6283, 6301, 6381, 6462, 6641, 6544, 6441, and the three hunt turn-ins. There is no Bethink Stonetalon file. `H-11-19` / `H-14-19` Barrens are the early-zone context only.
