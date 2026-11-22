# Sources used for the Horde 20–40 research pack

Notes only. Official credit rows live in the repository-root CREDITS.md table. No new third-party source is introduced here, so CREDITS.md is not changed.

## QuestieDB v1.1.3 Forever (pinned import)

- Name: QuestieDB (quest database data)
- URL: https://github.com/Questie/QuestieDB
- Pin: release v1.1.3, commit 8b8df2dc12a34e2eb82bc7105b40405dce1c01f7
- Licence: GPL-3.0 (upstream LICENSE.md); the project name and logo are not used as branding
- Used for: Horde and neutral quest ids, names, levels, prerequisites, givers, turn-ins, objectives, NPC and object spawn coordinates (zone %), and the forever / foreverConfidence flags in content/questie-db/ on main
- Files written from those facts: research/levels-20-40.route-v2.json, research/levels-20-40.md

## Vulkan dungeon research

- Path: research/dungeons/ on main (5d1adf8)
- Used for: dungeon ids (wailing-caverns, shadowfang-keep, blackfathom-deeps, razorfen-kraul, scarlet-monastery, razorfen-downs, city-of-dalaran, excavation-site-wetlands), instance area ids, level ranges, and the dungeons-off replacement wording on the one-pointer-per-dungeon steps

## Professions research (Sentinel, PR #15, a8f1d01)

- Used for: pack-level classProfessions and tipsMatrix for all nine classes, including Paladin. Profession hooks are not copied onto steps (they are joined later by the data build). Aza'bek (248198) is mentioned because that vendor sits on the Crossroads Merchant's Favor stop.

## Adjacent research packs

- Nova 1-20, PR #14, 2ee445a: starting state at the Crossroads and the set of quest ids already done.
- Orion 40-60, PR #11, e83da76, and PR #21, 82c901d: ending state at Grakna in Rog'mar, the below-40 Riverglades prerequisites his first steps need, and the quest set used for the zero-overlap scope cut.

## WarcraftMaps (spot citation, already in CREDITS.md)

- URL: https://warcraftmaps.com/guides/classic-vs-forever-professions
- Used for: a short unverified note on Forever profession rule changes and the Merchant's Favor recipe-count claim. Facts only; no guide text was copied.
- Also, item pages https://warcraftmaps.com/item/253711 and https://warcraftmaps.com/item/213127/partial-mystical-notes (checked by hand): Goliath's Wristguards and Partial Mystical Notes start quests 92707 and 95384. Single facts only.

## Solo-first pass (22 Nov 2026)

Conflicts recorded against the uncommitted route. Older rows above stay. Where an older sentence in `research/levels-20-40.md` still treats the 20–40 handoff as starting on Harpy Lieutenants, keeps Magram 1367/1369 and 92743/92754/92818, or keeps 95775/95776/96078 as open-world accepts in pack 04, that sentence is superseded by the Solo-first pass subsection there.

- Journeyman Campfire Kit is Cooking 90 to place, not 140. Blizzard hotfix, 10 Nov 2026: https://news.blizzard.com/article/24315281/wow-forever-hotfixes-november-10-2026 (the 10 Nov list is also carried on the later hotfix pages that reuse article 24315281).
- Drowned City Horde in-dungeon quest XP is 47,650. Method's 50,000 counts the +2,350 follow-up on The Drowned City (8,450 + 2,350, then the rest of the Horde table). https://www.method.gg/wow-forever/dungeons/the-drowned-city
- City of Dalaran in-dungeon quest XP used by this route is 37,600 (4 × 9,400). No separate Method total is cited here; the 37,600 figure is the route count.
- Druid Primal Bite rank 1 is level 40, not 25. Client 1.60.1 (see `docs/GAME_EXPORT.md` and `addon/AdventureLog/README.md` for the client pin). Older notes that put the rank at 25 are superseded.
- Profile `xpMods` (Well Fed, rested, Legacy Well Rested, Sleeping Bag) are player toggles on `Profile.options.xpMods` in `contracts/schema.ts`. They are not route steps. The baked `xp:sim` numbers in the Solo-first pass (dungeons off: pack 07 exit balanced 41.52, speedrun 40.40) do not apply those toggles.

