Sources: OpenXP, WoW-Pro, TUGs, and Bethink already fix order and breadcrumbs.

# Mulgore 1-12 external review

Route read: `research/nova/v2/mulgore-1-12.json` (115 steps). Map check: Questie zone 215 Mulgore `uiMapId` 1412; Thunder Bluff zone 1638 is 1456; The Barrens zone 17 is 1413. No route JSON was edited.

Compared, facts only: OpenXP `Horde-1-12_Mulgore` (ids and order), WoW-Pro Forever `01_12_Hendo_Mulgore`, TUGs `1-6` and `6-9 Mulgore`, Bethink `H-01-11_Mulgore`. Sage is Alliance. Trailwright is not a quest route.

The file already reaches Thunder Bluff and then continues, so no Skyborne joining tip was added. No Zephra quests were added.

## What already matches

Camp Narache (747, 752, 753, 750, 755, 757, 780, 3376, 781, 763, 1656), Bloodhoof pickup, Poison Water through Thunderhorn Totem, the caravan and Venture Co. chain, Windfury, Mazzranache, Rite of Vision through Journey into Thunder Bluff, and the Forever quests already on the route line up with these guides.

## Biggest fix

Steps 114 and 115 fight each other. 114 sends the player to Kirge Sternhorn in Camp Taurajo (Barrens 44.88, 58.61) for 854. 115 then pins Mulgore 52.0, 29.9 and says to run east to the Crossroads. 52, 29 is the north road outside Thunder Bluff, not the Barrens. 854 is also `exclusiveTo` 844, and 861’s follow-up 860 leads to 844. Drop 854 here. End on the Crossroads talk instead.

## Order

- 746 is completed at Bael’dun (33.1, 54.8) after the northeast mine. Diggers and the only Mulgore forge in Questie are both there, beside Palemane at 36, 66. Do it on the west trip with 745.
- 743 (59.5, 71.2) is south of Morin (54.8, 64.3). Do it before riding north to the mine.
- 754 has no pin. Winterhoof Well Stones (object 2910) cluster at 51.84, 67.93, on the way from Bloodhoof to Morin. Cleanse then, not after the village chores.
- 756 and the Mazzranache parts that share the central cats and stalkers should be finished on that same north-of-village circuit, once 756 is in the log. The Prairie Wolf Heart is not from that camp.

## Missing pins

- 95805 complete has no goto. The Ritual Fire is object 660739 at 56.61, 88.7. The item dies in ten minutes; the turn-in step is already there.
- 98430 complete has no goto. Perith Stormhoof is at 33.11, 65.95.
- 772 complete has no goto. Drink at Zarlman Two-Moons, 46.88, 61.19, then follow to Seer Wiserunner at 34.31, 43.29.
- 773 complete has no goto. Ancestral Spirit is 58.31, 30.7, the same NPC as the turn-in.

## Add

Short, prereqs already on this route or added in the same pass:

- 3091, 3092, 3093, 3094 from Grull on the 747 turn-in. Trainers stand in Camp Narache.
- Shaman 1519, 1520, 1521. Salves drop in Brambleblade Ravine; the earth NPC is at Kodo Rock 51.99, 80.4, on the road off the mesa.
- 758 at the Thunderhorn well (Well Stone 44.48, 50.72), then 759. Eight Prairie Alpha Teeth share the north field with the two quests below. Stop before 760.
- 861 from Skorn Whitecloud in Bloodhoof (46.03, 63.44). Four Flatland Prowler Claws around 51.81, 22.55. Turn in to Melor Stonehoof in Thunder Bluff (61.54, 80.92) and take 860. Turn 860 in to Sergra at the Crossroads (52.23, 31.01).
- 776 from Cairne after 775. Arra’chea’s Questie point is 51.25, 24.82, beside those prowlers. Horn goes back to Cairne.

## Dropped

Not added, and not pulled in as a partial chain:

- 760 Wildmane Cleansing and 98435 Thunderhorn’s Report. Party-accept well cleanse in the harpy camp after a second north trip.
- 770 The Demon Scarred Cloak. Rare drop from Ghost Howl.
- 744 Preparation for Ceremony. Eyahn is in Thunder Bluff, so the harpy camp is a return trip after 743 is already done.
- 854 Journey to the Crossroads. Camp Taurajo detour, and it blocks 844.
- 6361–6364. Giver is Jahan at the Crossroads, not in Mulgore.
- 76156 and its follow-ups. Extra mine loot, then a Thunder Bluff cooking and fishing chain.
- 6061 hunter tame chain. Three separate tames plus a city train.
- 96659 camping tutorial and the profession Camping 101 branches.

## 10-line summary

1. Ops: add 12, modify 7, reorder 3, tip 2, drop 9.
2. Biggest fix: delete the Camp Taurajo 854 detour and end at the Crossroads.
3. 114 runs to Kirge, then 115 pins the north Thunder Bluff road and says “go east.”
4. Move Dwarven Digging onto the Palemane trip; the forge is at 33.1, 54.8.
5. Do Windfury before the Venture Co. mine, and cleanse Winterhoof on the way to Morin.
6. Pin the missing gotos: Ritual Fire, Perith, the vision water, Ancestral Spirit, Winterhoof well.
7. Add the four Camp Narache class notes and the shaman Call of Earth chain.
8. Add 758 and 759 only; leave the Wildmane well and Thunderhorn’s Report off.
9. Add 861, 860, and 776 on the north field with Arra’chea at 51.25, 24.82.
10. All new coordinates are Questie spawns. `verified` is false.
