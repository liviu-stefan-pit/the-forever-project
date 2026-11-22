Sources: Questie plus OpenXP, WoW-Pro Vanilla Horde, TUGs, Bethink, and Sage were enough for ids, order, and prerequisites.

# Alterac, Dustwallow, and Swamp of Sorrows (Horde)

Route files were read only. No route JSON was edited.

- `research/levels-20-40.route-v2.json`: Alterac section n=762–789, plus earlier Alterac completes 533, 544, 556, 557, and 7321. Dustwallow n=790–850. Swamp n=896–922, plus Ongeku complete 1373 at n=515.
- `research/horde-40-60/horde-40-60.route.json`: Alterac completes for 507 and 520, with 519–521 and 508 filed under Hillsbrad or Feralas. Dustwallow 1166–1172. Swamp 1420 turn-in through 1383.

## Facts

- Questie `zones.json`: zone 36 Alterac Mountains is UiMap **1416**. Zone 15 Dustwallow Marsh is UiMap **1445**. Zone 8 Swamp of Sorrows is UiMap **1435**. Gotos in these sections already use those ids.
- 533 Infiltration `pre` is 498, which is on the 20–40 route. `next` is 503. 503 `pre` is 533. 506 `pre` is 503. 507 `pre` is 506. 508 `pre` is 507. 533’s objective is one Syndicate Missive.
- 495 has no `pre` and is the breadcrumb for 518. 518 has no `pre` and is 10 Crushridge Maulers. 519 `pre` is 518 and is three named heads. The 40–60 complete step marks that quest elite, group size 3. 520 `pre` is 519. 521 `pre` is 520 and ends at Sharlindra in Undercity. The route’s 521 turn-in step is filed under Feralas.
- 545 `pre` is the group 544 and 93680. Both are already on the 20–40 route. 92434 `pre` is 545 and the turn-in is in Silverpine. 566 `pre` is 549, which is on the 20–40 route. 535 has no `pre`.
- 1206 `pre` is 1218 and asks for 40 Unpopped Darkmist Eyes. `next` is 1203, which is not on either route. 81570 has no `pre` and is `exclusiveTo` 1203. 1261 `pre` is 1240. OpenXP treats the Jeweled Pendant as about a 5% murloc drop. 1262 `pre` is 1261. 7541 `pre` is 1262. 1270 is `PARTY_ACCEPT`.
- 1166 has no `pre` and is Mok’Morokk’s grog, snuff, and strongbox. 1168 has no `pre` and is Firemane kill counts. 1169 has no `pre`, asks for 15 Searing Tongues and 15 Searing Hearts, and `next` is 1170. 1170 `pre` is 1169. 1171 `pre` is 1170. 1172 `pre` is 1171 and is 5 Eggs of Onyxia. 1173 is not on either route.
- 698 has no `pre` (8 flanks). 699 `pre` is 698 (6 claws). 1422 `pre` is 699. 1426 `pre` is 1422. 1427 `pre` is 1426. 1428 `pre` is 1427. 1424 has no `pre` (10 Atal’ai Artifacts). 1429 `pre` is 1424 and ends in the Hinterlands. 1444 is not on these two route files. 1430 has no `pre`. 1393 is `PARTY_ACCEPT`. 1116 `pre` is 1115, which is on the 20–40 route, and asks for 10 Specks of Dream Dust. 1117 is not on either route.
- 1372 has no `pre`. 1383 `pre` is 1372 and asks for 5 Shadow Panther Hearts, Mire Lord Fungus, and a Deep Strider Tumor. 1388 and 1391 are not on either route, so the chain never reaches Stonard. 1373 `pre` is 1370, which is on the 20–40 route, and the objective includes 3000 Gelkis reputation. 93034 is on the 40–60 route in Desolace and needs 1373.
- OpenXP 31–32 does 556, 544, 557, and 533, and it does not take 503. OpenXP 33–34 Dustwallow takes the Shady Rest items before the spies, then 1218, 1206, 1238, and 1239. The later Dustwallow chapter takes 1177, 1269, 1322, 1273, and 1270. OpenXP 41–42 takes 1166, 1168, and 1169 through 1171, and it does not take 1172. OpenXP 43–44 takes 1430, 1424, 699, 1422, 1426, 1427, and 1428, and it does not show Galen’s Escape.
- WoW-Pro Vanilla Horde chapter 2 turns in 533 and tells the player not to take the follow-up, then later still runs 503 and 506. It also runs 1177, 1206, and the 1261 pendant. Chapter 3 runs 1424, 698, 1430, and 1428, marks 1393 as an elite escort, and says not to take the follow-up after 1424. It runs 1166, 1168, and 1169 together.
- Bethink Horde 38–39 runs the inn, 1177, 1206, 1270, and 1273 in one northern loop. Sage’s Alterac and Swamp chapters in this checkout are Alliance. TUGs Horde 39–41 and 45–48 only pick up the Stonard and Brackenwall flight paths in these zones.

## Order this changeset keeps

1. Alterac Dalaran camp, already on the route: 556, 557, and 544, then 93680 and 545. 566 stays. 518 stays as the 10-mauler step after 495. 535 stays as the stout hand-in.
2. Dustwallow, one northern bag: Shady Rest 1268, 1251, and 1269 before the first Brackenwall turn-in, then 1201 and 1202, 1321–1323, 1273, 1218, 1238, and 1239, then 1177 while the route is already on the north shore, then 1240. 1168 stays on the later Firemane visit.
3. Swamp, one Stonard departure: accept 698, 1424, and 1430 before leaving town. Finish flanks, claws, artifacts, crawler legs, and 1426 on the way around the pool and the east coast. Turn in 698 before 699, then 1422, 1426, 1427, and 1428 at the same coast camp. 1389, 1392, 93429, 93430, and 93663 stay on the Harborage and Lost One camp.

## Quests refused as slow or out of scope

Whole chains dropped:

- Syndicate missive chain: 533, 503, 506, 507, 508. 533 is the document camp. WoW-Pro’s own note says not to take the follow-up after 533.
- Crown elites: 519, 520, 521. 519 is the group-of-three head farm. 521’s turn-in step is not in Undercity.
- Dustwallow ogre collection: 1166. Brood collection: 1169, 1170, 1171, 1172. 1173 is not on either route.
- 1206 and the 40-eye farm. 1203 is not on either route. 81570 is the exclusive sword hand-in and is not a camp the route is clearing.
- Rare pendant: 1261, 1262, 7541.
- 1270 Stinky’s Escape (`PARTY_ACCEPT`). 1393 Galen’s Escape (`PARTY_ACCEPT`).
- 1116 and its 10 dream-dust specks. 1117 is not on either route.
- 1372 and 1383. The fungus and panther hearts are separate farms, and 1388 and 1391 are absent, so the chain cannot finish.
- 1373 Ongeku. The Gelkis reputation objective is the long part. 93034 on the 40–60 Desolace steps then has a missing prerequisite.
- 1429. It leaves for the Hinterlands. 1444 is not on these two route files.
- 92434. It turns in outside Alterac, and 96984 is only in the dungeon step file.
- 93464. It turns in in Desolace after that zone is already finished. 93465 is not on either route.
- Both Swamp level-grind steps (about 202 and 215 minutes). They sit between 1424 and 1430 and are not a quest.

1177 stays. Twelve Mirefin Heads finish at Mudcrush, and the route is already on that north shore. 1168 stays. Those Firemane kills are the camp itself, not the ogre item pickup.

## Changeset

20 ops in `changesets/alterac-dustwallow-swamp.json`: add 0, modify 0, reorder 2, drop 16, tip 2. All `verified: false`.
