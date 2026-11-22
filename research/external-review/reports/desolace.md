Sources: Questie plus OpenXP, WoW-Pro, TUGs, and Bethink were enough for ids, order, and prerequisites.

# Desolace external review (Horde 20–40)

Route file was read only: `research/levels-20-40.route-v2.json`. No route JSON was edited.

Desolace steps are `horde-20-40:to-desolace` (n=488) through `horde-20-40:turnin-93225` (n=611). The next section is Stranglethorn Vale. Family Tree (5361) is turned in at Nataka in the Thousand Needles section (`horde-20-40:turnin-5361`), before this block.

## Facts

- Questie `zones.json` zone 405 Desolace is UiMap **1443**. Every Desolace goto in this section already uses 1443.
- 1365 Khan Dez'hepah has no `pre`. 1362 is only `breadcrumbFor` 1365. 1366 Centaur Bounty `pre` is 1365. 1434 `pre` is 1432. 1435 `pre` is 1433. 1436 `pre` is the group 1434 and 1435. 1368 and 1367 have no `pre`; each is a 3000-reputation objective. 1370 `pre` is 1368 (or Alliance 1384). 1369 `pre` is 1367 (or Alliance 1386).
- OpenXP 33–34 Desolace quest ids, in order: 6142, 5741, 5821, 5561, 1365, 1366, 5763, 6143, 6161. It does not take the faction chains, Alliance Relations, the Corrupter, 5381, 5501, 6027, 5581, 6132, or 6134.
- WoW-Pro Vanilla Horde chapter 2 picks one centaur clan, prefers Gelkis, takes 1370, accepts 1373, and leaves the zone with Ongeku unfinished. It tells the player not to accept the follow-up after 1484. It does 5501 in the same graveyard as 5561, and it does 5386 by repeating 5421.
- TUGs accepts 1368, 93225, 1365, 1432–1435, 5381, 6143, 6142, and 5561 at the first Ghost Walker / Shadowprey stop. Bethink treats 1480–1488 as optional and also runs 6134 and 6132.
- 1373 Ongeku completes in Swamp of Sorrows (route goto map 1435). 92743 asks for a Badlands crown. 1528 Call of Water is `sort` SHAMAN, ends at Islen in the Barrens, and its `next` is 1530, which is not in this section.
- 5763 is a carried horn (`sourceItem` 14546). The complete step stands on Roon, the giver. The real turn-in is Hemet in Stranglethorn.
- 1488 is two named kills at level 40. 5943 and 5821 and 6132 are `PARTY_ACCEPT` escorts. 6027 is level 38 and starts only after 5741. 5581 `pre` is 5381 and is six Mannoroc portals. 6134 is level 39 at the graveyard. 5386 needs two Bloodbelly fish; 5421 Fish in a Bucket is the repeatable shellfish trade and is not on the route.
- Web notes mention Abandoned Ferocity as a level 42 kill for a level 35 player. No Desolace step walks a named level 42 pull. It is not added. Maraudon is not a quested clear in this file.

## Order this changeset keeps

One bag per camp.

1. In Orgrimmar, before `to-desolace`: 1431, then 1432.
2. Ghost Walker once: turn in 1432, accept 1433, 1434, 1435, 1365, and 93225.
3. Sargeron and Thunder Axe on the same north sweep: 1434, 97265, 1435, 5741, 5381. Accept 5741 and 5381 at Ethel Rethor and Shadowprey before that sweep, and take the flight path and hearth on that same Shadowprey stop.
4. West shore on the way back to Shadowprey: 6142, 6143, 6161. Turn all of those in with 5381 and 97265 before leaving the village.
5. Road south: 5821 if the caravan is on the Kormek road, then 5561 and 5501 in the graveyard, then Kolkar for 1365, 1366, and 93225.
6. Ghost Walker once more, with that whole bag: turn in 1434, 1435, 1365, 1366, and 93225, and accept 1436. Turn 1436 in to Keldran only when leaving for the next zone. 5763 turns in at Hemet, already in this section as the Stranglethorn handoff.

## Quests refused as slow or out of scope

Whole chains dropped, not trimmed:

- Gelkis faction: 1368, 1370, 1373. 1373 is a Swamp of Sorrows shard, and `next` 93034 is not on this route.
- Magram faction: 1367, 1369, 1371 (engineering dummy), 1375, 92743 (Badlands crown, `next` 92841 not on this route).
- Forever quests whose `pre` is that reputation: 92754 and 92818 need 1369; 92755, 92814, and 92817 need 1370.
- The Corrupter 1480, 1481, 1482, 1484, 1488. 1482 sends the player back to the naga after another Ghost Walker turn-in, and 1488 is the level 40 pair.
- 6027 Book of the Ancients, 5581 Portals of the Legion, 5943 south caravan, 6134 Ghost-o-plasm, 6132 Get Me Out of Here!, 5386 Catch of the Day.
- 1361 and 1362. They are a Hillsbrad and Barrens detour after Felgur has already been visited, and 1365 does not require them.
- 1528 Call of Water. It is the shaman line and leaves Desolace.
- Abandoned Ferocity. No short pull on this path. Maraudon stays with the dungeon agent.

93225 stays. It has no `pre`, and the five totems come off the same centaurs as 1366. 5501 stays beside 5561 because both finish in the graveyard on that one visit. 5821 stays because the north caravan is the road from Kormek to Smeed. 97265 stays on the Sargeron pull with 1434.

## Changeset

31 ops in `changesets/desolace.json`: add 0, modify 2, reorder 4, drop 22, tip 3. All `verified: false`. The Corrupter steps share one drop, and 1361 shares a drop with 1362.
