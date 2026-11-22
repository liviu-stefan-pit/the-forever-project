# Horde 20–40 leveling route (Lyra research)

Project Forever, Horde only, levels 20 to 40. Two variants share this pack: **Speedrun** (tight Classic path plus high-value Forever-new quests) and **Balanced** (the same path plus the rest of the Classic work in each zone, and the remaining Forever-new quests).

Wording here is original. Quest ids, NPC ids, coordinates (zone %), levels and prerequisites come from the pinned QuestieDB v1.1.3 Forever import in `content/questie-db/` on main. Every Forever-new step is marked unverified.

## Counts

- Total steps: 994
- Speedrun steps: 778
- Balanced steps: 994
- Unverified steps: 173
- Classic quest ids used: 278
- Forever-new quest ids used: 56

## Sub-packs

The packs are edited directly in `research/routes/horde-20-40/<pack>/`, one file per segment (see [docs/ROUTE_FILES.md](../docs/ROUTE_FILES.md)). The old monolith (`research/catalog/levels-20-40.route-v2.json`) and its `split-pack` config were removed in Nov 2026: the packs had been edited by hand since the last split, so re-splitting would have undone those edits. Step counts in the table below are from the original split.

| Slug | Levels | Steps | First step | Last step | Hub |
|---|---|---:|---|---|---|
| horde-20-40-01-barrens-a | 20–22 | 188 | `horde-20-40:handoff-from-1-20` | `horde-20-40:accept-1159` | Starts at the Crossroads after 1–20; ends picking up Test of Lore before Undercity |
| horde-20-40-02-barrens-b | 22–24 | 121 | `horde-20-40:complete-1159` | `horde-20-40:turnin-95774` | Undercity Test of Lore through the rest of Late Barrens (Olgra) |
| horde-20-40-03-stonetalon-ashenvale-hillsbrad | 24–28 | 254 | `horde-20-40:to-stonetalon` | `horde-20-40:turnin-98095` | Stonetalon, Ashenvale, then Hillsbrad |
| horde-20-40-04-needles | 28–31 | 202 | `horde-20-40:to-needles` | `horde-20-40:turnin-98070` | Thousand Needles and the Shimmering Flats |
| horde-20-40-05-desolace | 31–34 | 130 | `horde-20-40:accept-1431` | `horde-20-40:turnin-97265` | Desolace |
| horde-20-40-06-stv-arathi | 34–38 | 308 | `horde-20-40:to-stv` | `horde-20-40:turnin-97453` | Interleaved STV / Arathi / Alterac / Dustwallow / STV return |
| horde-20-40-07-swamp-riverglades | 38–40 | 151 | `horde-20-40:to-sos` | `h4060:riverglades:fly-9c1b4f` | Swamp of Sorrows, Badlands, Riverglades; hands off after Fly Rog'mar → Kargath (36-step 40-60 prefix moved here so speedrun ≥ 39.5; 40-60 starts at `h4060:badlands:a1419`) |

## Zone order

- Late Barrens
- Stonetalon Mountains
- Ashenvale
- Hillsbrad Foothills
- Thousand Needles and the Shimmering Flats
- Desolace
- Stranglethorn Vale (first circuit)
- Arathi Highlands
- Alterac Mountains
- Dustwallow Marsh
- Stranglethorn Vale (second circuit)
- Swamp of Sorrows
- Riverglades (Forever-new)
- Training
- Orgrimmar leftovers from 12-20
- Dungeon: Wailing Caverns
- Dungeon: Shadowfang Keep
- Dungeon: Blackfathom Deeps
- Dungeon: Razorfen Kraul
- Dungeon: Scarlet Monastery
- Dungeon: Razorfen Downs
- Dungeon: City of Dalaran
- Dungeon: Excavation Site: Wetlands

## Handoffs

**From 12–20 (Nova, PR #14, 2ee445a).** The first step starts at the Crossroads at level 20, just after `barrens-12-20:135` (Harpy Lieutenants turned in to Darsok Swiftdagger at 51.6, 30.9). The hearth is already set at the Crossroads. Speedrun: the quest log is empty. Balanced: Deviate Eradication (1487) may still be in the log when dungeons were on; Orc and Troll may also still have Hidden Enemies (5728). This pack never re-accepts those, and it does not repeat any quest already present in her packs.

**To 40–60 (Orion, PR #11, e83da76; checked against main and PR #21, 82c901d).** The last step leaves you at Rog'mar in Riverglades, at flight master Grakna (NPC 255993, about 59.6, 45.1). All Riverglades quests below level 40 are done, including 94483, 96063 and 96104, which his first accepts need. Ongeku (1373) is turned in in Desolace. Valley of Bones (93034) is not started here.

## Dungeons

Inside-instance work belongs to `research/dungeons/`. This pack only has one pickup/turn-in pointer per dungeon, keyed to Vulkan's dungeon ids, each with a dungeons-off alternative. Classic pointers in this band: Wailing Caverns, Shadowfang Keep, Blackfathom Deeps, Razorfen Kraul, Scarlet Monastery, and Razorfen Downs. Uldaman and Zul'Farrak sit mostly above 40 and are pointed to by the 40-60 route. Ragefire Chasm is below this route. Forever-new pointers in this band, keyed to `dungeons:forever:<slug>:`: City of Dalaran and Excavation Site: Wetlands (The Drowned City is on the 40-60 route). Krol'dok Stronghold starts at 40 and belongs to the 40-60 route.

## Notes and blockers

- 94532 and 94535 need prerequisite 96109. Pack 07 turns 96109 in and then does both quests on balanced and speedrun. The warning step that told the player to leave them has been removed.
- Low-confidence Forever ids 79953 and 81951 (Undercity books) are excluded.
- Gelkis alliance (1368 → 1370 → 1373 Ongeku) is the Desolace path used here; the exclusive Magram side is skipped.
- Profession hooks are not pasted onto these steps. Zone and level hooks from the professions pack are joined later by the data build. classProfessions and tipsMatrix for all nine classes, including Paladin, are copied from professions research (PR #15, a8f1d01) at pack level. Aza'bek (NPC 248198) and Dokimi (NPC 256386) are pinned on the Merchant's Favor stop west of the Crossroads because that stop is on this route.
- 477 (Border Crossings) and 749 (The Ravaged Caravan) are still open in some 12-20 logs; they belong to earlier zones and are not finished on this route.

## Forever-new quest ids used

78270, 79007, 79192, 79980, 81570, 86576, 92434, 92519, 92707, 92743, 92754, 92755, 92814, 92817, 92818, 93176, 93225, 93429, 93430, 93464, 93663, 93680, 93786, 93787, 93788, 93976, 94480, 94481, 94483, 95042, 95062, 95141, 95143, 95384, 95534, 95663, 95748, 95770, 95773, 95774, 95951, 95955, 95982, 96063, 96103, 96104, 97265, 97328, 97453, 97538, 97539, 98069, 98070, 98093, 98094, 98095


## Dungeon pointers

Each dungeon pointer step carries `tags.dungeonId` (Vulkan's research/dungeons ids) so `expandDungeonPlaceholders()` can expand it. Uldaman, Zul'Farrak and The Drowned City are left to the 40-60 route, which already points to them, so they are not expanded twice.

## Scope cut (Sentinel gate on #18, Orion ruling)

This pack now hands every quest the 40-60 route uses, and everything above quest level 40, to that route.

- Removed 61 quests (170 steps): every quest the 40-60 pack on main accepts, completes or turns in (36; PR #21 also covers 19 more of the removed quests), every turn-in above quest level 40, and Taretha's Gift (508), whose prerequisite 507 is now on 40-60. Quest levels come from `content/questie-db/quests.json`.
- Overlap with the 40-60 pack is 0 quest ids on main and on PR #21. The highest quest turned in here is level 40.
- The last parts kept here, where 40-60 picks up: STV Panther Mastery 192 (→193), Raptor Mastery 195 (→196), Tiger Mastery 188 (→208), Bloodscalp Ears 189 (→209), Headhunting 582 (→584), Bloody Bone Necklaces 596 and The Vile Reef 629 (→598), Singing Blue Shards 605 (→600). Hillsbrad: Blackmoore's Legacy 506 (→507), The Crown of Will 518 (→519). Arathi: Sigil of Thoradin 641 (→643), Stones of Binding 651 (→652). Dustwallow (1168-1172) and the Swamp chains (698/699, 1393, 1420-1430) start on 40-60; Neeka Bloodscar (1418, level 35) is kept here as the lead-in to 1420.
- Removed and not on either 40-60 version: 508, 594, 624, 625, 1205, 97332. Listed for Orion; not re-added here.
- Added to soften the XP loss, all from QuestieDB with sources, none used by another pack: Sunken Treasure 666 and 668 (both routes), Foul Magics 673 and The Corrupter 1488 (balanced, elite), and the Forever-new A Conqueror's Crown 92743 and Carved Centaur Totems 93225 (balanced, unverified).
- Arrival estimate: see the Prerequisite pass below.

## Prerequisite pass (Sentinel gate on #18 at f2f6580, Orion rulings)

Checked with Lyra's prerequisite walker (`prereq_check.py`, shared with Sentinel on request; it walks Nova's 1-20 packs, this pack, then 40-60 on main, per route, race, class and dungeon setting, using QuestieDB `pre.single` = any one, `pre.group` = all, `exclusiveTo`, and the race/class masks). Result: 0 violations from this pack's steps, matching Godfather's check in PR #22 (e5af295, `PF_PREREQ_CHECK=warn npm run data`: 0 for horde-20-40, 14 in other packs). With Vulkan's dungeon expansion (PR #23) merged on top, 16 violations appear inside the expanded dungeon quest chains (Wailing Caverns, Blackfathom Deeps, Razorfen Kraul, Scarlet Monastery, Razorfen Downs, Excavation Site) because their outside prerequisites are not in the dungeon pack; none come from steps written here.

- Dropped (no verifiable prerequisite on the route): 822, 2760, 3369 (needs the Wailing Caverns item quest), 6628 (needs Scarlet Monastery 1160), 96078 (needs Drowned City 95775), 97048, 97287, 97331 (QuestieDB prerequisite ids that are not in the import), and 95322 with 95325-95327 (95322 moves to 40-60 per Orion).
- Dropped class quests whose class chain is not on any route (Orion: no class chains tonight): Warlock 1510, 1511, 1512, 1515, 4782, 4961, 4976; Warrior 1712, 1713, 1792; Mage 1948-1950, 1952, 1957, 1958; Rogue 2478, 96781, 96783-96786; Shaman 79364, 79365 (also wrong race); Paladin 95125, 95126.
- Moved after their prerequisite (balanced): 879 and 906 after 5052, 79192 after 79007, 5062 and 5088 after 4865, 1137 after 1108, 1322, 1323 and 1276 after 1321, 545 and 92434 after 93680, 98094 now before 98095.
- Speedrun: dropped 879, 906, 1137, 1322, 1323, 5062, 5088, 79192, 92754, 92818 (their prerequisites are balanced only); added the prerequisites 533, 577, 581, 640 and 98094 so 503, 628, 582 and 641 stay valid and 40-60's 507, 584 and 643 keep their speedrun prerequisites.
- 1203 and the Forever 81570 (Jarl Needs a Blade) are mutually exclusive; 81570 has no prerequisite, so it replaces 1203 on both routes.
- Added Wharfmaster Dizzywig (1111) before Parts for Kravel (1112), and Boulderslide Ravine (6421) before Earthen Arise (6481), all from QuestieDB.
- The Orgrimmar leftover (5728) carries an Orc/Troll filter. Exploring the Horde (93739) was removed after PR #26 dropped it from 1-20.
- Arrival (quest XP only, QuestieDB `xp`, Classic 20-40 curve, gray-quest penalty, class quests not counted): balanced about 35.5 (before the scope cut 38.2, after it 35.9), speedrun about 31.7 (was 34.2, then 32.3). With mob XP on top (roughly a third of questing XP), balanced lands around 38-39.5 and speedrun around 34-35.5 at Rog'mar, so speedrun needs extra grinding or Riverglades work before the handoff.

## Follow-up: item starters (Sentinel's "turned in but never accepted" check)

- The Giant in the Den (92707) and Partial Mystical Notes (95384) have no starter in QuestieDB v1.1.3. Our import shows the objective items dropping from Witherbark Goliath (218032, Arathi, elite) and Skullsplitter Mystic (780, Stranglethorn), and WarcraftMaps (checked by hand, item pages 253711 and 213127) lists those items as the quest starters. Each quest now has a loot-and-accept step (`horde-20-40:accept-92707`, `horde-20-40:accept-95384`) at the QuestieDB spawn area before its complete step. Both stay unverified.

## Follow-up: Excavation Site: Wetlands lead-ins (Orion: ours)

- Dragonmaw Rumors (95663, Forever, level 31): `horde-20-40:accept-95663` at Zaruk in Hammerfall (74.5, 35.6, QuestieDB) right after the Hammerfall turn-ins, and `horde-20-40:turnin-95663` just before the `horde-20-40:dungeon:excavation-site-wetlands` pointer. Balanced, dungeons on only, unverified. The Deathstalker Agent (NPC 13155) has no spawn coordinates in QuestieDB, so the turn-in step has no map point; the text uses QuestieDB's objective wording. Cost: about 1 minute in Hammerfall, and the turn-in is on the way into the run.
- Elder Knowledge (95664) is not added. It starts from the Titan Relic (item 270866), which drops from the Relic Guardian (NPC 260326, no spawns in QuestieDB) inside the run, so it cannot be picked up before the pointer. The turn-in to Bashana Runetotem in Thunder Bluff (71.1, 34.2), which unlocks Earthen Echo (98823), belongs after the run in the dungeon pack.

## Follow-up: speedrun arrival level

Speedrun now aims to reach Rog'mar at level 37.5 or higher. The model is quest XP from QuestieDB `xp` (class quests not counted, gray-quest penalty) plus kill XP at about a third of the total, on the Classic 20-40 curve.

- Added 47 balanced quests to speedrun, picked greedily by XP per minute (step minutes plus a rough walking estimate from the nearest speedrun step), with prerequisites satisfied on speedrun, no class, elite or dungeon quests, and turn-ins of level 40 or lower: 338, 509, 552, 553, 596, 878, 879, 885, 897, 898, 899, 906, 1058, 1116, 1153, 1206, 1238, 1239, 1240, 1261, 1262, 1361, 1362, 1366, 1367, 1369, 4770, 4821, 4904, 5052, 5064, 5147, 5821, 5943, 6132, 6161, 6482, 6504, 6571, 6621, 6641, 7321, 7541, 92743, 92818, 93225, 93464.
- Modelled arrival: speedrun 37.6 (was 35.3; 33.7 from quest XP alone), balanced 39.6 (35.5 from quest XP alone). About 235 extra speedrun minutes by the step estimate, which is rough.

## Solo-first pass (22 Nov 2026)

The uncommitted Horde 20–40 route is solo-first. Dungeons are opt-in. The UI label is "Include dungeons (off = fully solo route)". The default is off, and a solo route must not show dungeon pickups. Older sentences that contradict this pass are superseded, and they are left above as history.

**Superseded.** The Handoffs paragraph that starts 20–40 just after `barrens-12-20:135` (Harpy Lieutenants) is superseded. `barrens-12-20` ends on `barrens-12-20:grind-to-20` (Stormsnouts south of Camp Taurajo until level 20). Before that grind, both paces finish Chen's Empty Keg (819/821), Samophlange (3921–3924), and Mura Runetotem (3301). The hearth is the Crossroads. Flight paths already known are Crossroads, Ratchet, and Camp Taurajo. Step `horde-20-40:handoff-from-1-20` keeps that id. Do not re-accept those quests, or Miner's Fortune (896). Skyborne skip Jorn's thunder-lizard chain (907/913 are filtered).

**Superseded.** Gelkis is still the Desolace side, but the speedrun-arrival list and the Forever-new id list that include Magram 1367/1369 and follow-ups 92743, 92754, and 92818 are superseded. Those quests are not on the route. The route is 1368 Gelkis Alliance, 1370 Stealing Supplies, and 1373 Ongeku: accept in Desolace, kill beside the Stonard flight path in pack 07, turn in to Uthek, and do not accept Valley of Bones (93034). The 40–60 packs were not rewritten. The scope-cut line that added 92743 to soften the XP loss is superseded for the same reason.

**Superseded.** Open-world accepts of 95775, 95776, and 96078 were removed from pack 04. They live on the Drowned City splice. The prerequisite-pass line that dropped 96078 and 97287 as having no verifiable open-world prerequisite is superseded for those two ids: 97287 Shrewd Negotiations is on the dungeon plan, with RFD 97196 The Coldbringer's Eye and Dalaran 96984 Heart of Disruption. The Dungeons paragraph that treats The Drowned City as only a 40–60 pointer is superseded for the opt-in splice. Wailing Caverns, Ragefire Chasm, and Ruins of Lordaeron still run once, from the 1–20 anchors, and are not spliced again here. The note that 477 and 749 stay unfinished, and that dungeon work inside the instance belongs to `research/dungeons/`, still stands.

**Bugfixes.** 544 Prison Break In moved from pack 02 to pack 06, immediately before 545 (required level 30). The Riverglades order is 629, then 95748, then 95770, then 95773. The quest 502 complete step points at Stanley. Deathstalker Agent (NPC 13155) is pinned at Wetlands 51.4, 59.2 on a dungeon-gated step. The older Wetlands lead-in note that this NPC has no map point is superseded for that pin.

**Travel.** New flight path `horde-20-40:fp-2861`, Gorrik at Kargath (Badlands about 4, 45), comes before Rog'mar. The fastest Undercity to Rog'mar path is Undercity, then Kargath, then Rog'mar. Powderfuse Port has no usable flight master.

**XP.** With dungeons off, after these edits, `xp:sim` leaves pack 07 at balanced 41.52 and speedrun 40.40. Both paces clear 40 without a grind. The earlier arrival estimate that speedrun still needs a grind before Rog'mar is superseded. Quest 208 stayed in pack 06.

**Class steps** use `classes` / `filter`. There is no schema change. Warrior: Affray 1718/1719. Shaman: Call of Air 1531/1532. 79360 Elemental Aid is dungeon-gated (Razorfen Kraul). Tauren druid: Great Cat Spirit 98340/98405/98342. Warlock 1740 is an outdoor accept and turn-in, with dungeon completes in Blackfathom Deeps and Shadowfang Keep. Undead paladin 91858 / Wolfsbane is skipped because the Deadmines lumber NPC has no coordinates. The older "no class chains" drop list is history for the chains this pass put back; it still records why the other dropped class quests stayed off.

**Source conflicts** (detail and URLs in `research/sources-20-40.md`). Journeyman Campfire is Cooking 90, not 140 (Blizzard hotfix, 10 Nov 2026). Drowned City Horde in-dungeon quest XP is 47,650; Method's 50,000 counts the +2,350 follow-up. Dalaran is 37,600 (4 × 9,400). Druid Primal Bite rank 1 is level 40, not 25 (client 1.60.1). Profile `xpMods` (Well Fed, rested, Legacy Well Rested, Sleeping Bag) are player toggles, not route steps.

## Horde 20-30 corrections (22 Nov 2026)

Never Coming Back now runs during the Ashenvale pass after the Mystral elementals. Bears are killed in Ashenvale, and A Void Path (98252) follows it on both routes.

Calling in the Reserves is turned in at the Great Lift on both routes, beside the ore sample.

Thundering Hearts is Balanced only. The kill is Stormheart at Freewind. The turn-in waits for the later Undercity visit. Speedrun does not take it.

Vorsha and A New Ore Sample carry the 9 Nov and 17 Nov hotfix notes.
