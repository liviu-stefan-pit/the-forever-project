# FAIL

Route file was read only: `research/levels-20-40.route-v2.json`. Checked against `content/questie-db/quests.json` and `npcs.json`. Prerequisite 882 was confirmed in `research/nova/v2/barrens-12-20.json`. No route JSON was edited.

## Must remain — present

- **6382** accept `horde-20-40:accept-6382` (Jorn, Barrens 1413) and turn-in `horde-20-40:turnin-6382` (Senani 73.78, 61.46, Ashenvale 1440). Questie `pre.single` is 882. 882 is accepted, completed, and turned in at `barrens-12-20:120` / `:122` / `:123`. Talk only; no hunt.
- **6562** accept `horde-20-40:accept-6562` (Tsunaman 47.36, 64.25, Stonetalon 1442). **6563** has no step. Tip on `horde-20-40:turnin-25` says do not accept 6563.
- **676** accept/complete/turn-in `horde-20-40:accept-676` through `turnin-676` (n 332–334), before Arathi **677** (n 686–688). Questie 677 has empty `pre`; 676 is `breadcrumbFor` 677. 678 `pre.single` 677 is turned in first.
- **6383** accept and turn-in stay.

## Must absent — quest actions

No accept/complete/turn-in for 503, 506, 533, 629, 93034, Gelkis/Magram (1367–1371, 1373, 1375, 92743, 92754, 92755, 92814, 92817, 92818), 7321, 547, 552, 553, 541, 550, 4770, 4904, 5088, 1148, 1184, 1106, 1108, 1137, STV mastery 185–188 / 190–192 / 194–195, crocolisk 575 / 577 / 628, Green Hills 338–342, or sigils 638–641.

Wailing Caverns is one placeholder (`horde-20-40:dungeon:wailing-caverns`) plus the dungeons-off skip. Text: run the pack once, do not run it twice. 1487 is not a step in this file.

Map ids on gotos already match: Stonetalon 1442, Ashenvale 1440, Hillsbrad 1424, Alterac 1416, Desolace 1443, Dustwallow 1445, Swamp of Sorrows 1435, Thousand Needles 1441.

Class-locked rows that remain (1530 shaman, 78270 rogue, 95042 paladin) match Questie `classes` bits. No class-locked quest is unfiltered.

## Blockers

1. **`horde-20-40:accept-545`** (also `complete-545`, `turnin-545`) / **545** Dalaran Patrols. Questie `pre.group` is **544 and 93680**. 93680 is on the route; **544 was dropped**. Smallest fix: drop the three 545 steps. Do not restore 544.

2. **`horde-20-40:accept-95748`** (also complete/turn-in 95748; accept/turn-in **95770**; accept/complete/turn-in **95773**) / **95748**. Questie `pre.single` is **629**. 95770 and 95773 `pre.single` is 95748. 629 has no step. Complete 95748 is the Vile Reef tablet (22.95, 12.02, map 1434); 95770 is “Explore the Vile Reef”. `optional: true` does not supply 629. Smallest fix: drop all 95748 / 95770 / 95773 steps.

3. **`horde-20-40:accept-6562`** / **6562**. Added accept; no turn-in action. Questie is a talk to Je'neu (npc 12736, 11.56, 34.29, map 1440). The only Je'neu goto later is `turnin-824`, which exists only if the globe drops. Smallest fix: add `horde-20-40:turnin-6562` at Je'neu on the Zoram visit with 6442. Do not accept 6563.

4. **`horde-20-40:complete-201`** / **201**. Added explore complete is `balanced`+`speedrun`. Accept and turn-in are **balanced only**. Speedrun cannot complete a quest it never took. Smallest fix: set `complete-201` routes to `["balanced"]`.

5. Stonetalon / Ashenvale drops removed **accepts** and left required **complete/turn-in** with no accept (player cannot finish a quest not in the log):

   - 6282 `complete-6282`, `turnin-6282`
   - 6283 `complete-6283`, `turnin-6283`
   - 6284 `complete-6284`, `turnin-6284`
   - 1058 `complete-1058`, `turnin-1058`
   - 1087–1089 `complete/turnin-1087`, `-1088`, `-1089`
   - 6441 `complete-6441`, `turnin-6441`
   - 6504 `complete-6504`, `turnin-6504`
   - 6544 `turnin-6544`
   - 6571 `complete-6571`, `turnin-6571`
   - 6641 `complete-6641`, `turnin-6641`
   - 6482 `turnin-6482`
   - 6621 `complete-6621`, `turnin-6621` (`pre.single` 216; 216 stays, but 6621 accept is gone)
   - 247 `turnin-247` (`pre.group` 2, 23, 24). Required `turnin-2` / `turnin-23` / `turnin-24` / `turnin-247` force the hunt the 6383 tip says not to camp.

   Balanced-only same pattern: 1090, 6393, 6421, 6462, 6581.

   Smallest fix: drop those leftover complete/turn-in steps (mark 2/23/24 turn-ins optional if a claw/paw/head actually drops; do not keep required 247).
