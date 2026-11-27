# Mulgore route rework: plan (research pass, 2026-11-27)

**Status: not play-tested yet.** The Zephras Isle playtest rules (`zephras-isle-plan.md` §3) are applied here using our quest and spawn data (QuestieDB) and the XP sim. The next Mulgore playtest checks this, and its findings go in a new section at the end.

## 1. What changed

- **119 one-NPC steps became 46 steps.** Each one is a town stop with a checklist, a field step (counts, mob names, where), or a class step. Merged steps keep one old id each. New ids: `hearth-bloodhoof-exit`, and the segment files `03-west-trip-and-wiserunner.json`, `04-east-trip-venture-co.json`, `05-north-thunder-bluff-and-exit.json`.
- **Camp Narache:** 4 town stops. The incense for Grace of An'she and Mu'sha goes from Graytongue east to the shrine, and the ravine is right next to the shrine, so trip 2 does pelts → Graytongue → shrine → Rite of Strength belts and the map, all in one trip. That puts the player at **level 4.26 at town stop 3** (sim), so Shaman takes Call of Earth (needs 4) there and loots the salves on the Sharptusk trip. The old route took it at 3.27, which is below the level the quest needs.
- **Bloodhoof:** 4 town stops and 3 trips (south-east, west, east), then the north.
  - **South-east (5.9 → 7.1):** Poison Water, Sharing the Land at the **south-east Palemane camp** (46–53, 72–74; QuestieDB has 12 Tanners, 11 Skinners and 7 Poachers there), Rite of Vision Well Stones at the **Winterhoof well**, Kyle's meat and two Mazzranache parts. On the way back: Malah, Morin, the crate, then Morin again.
  - **Winterhoof hop** (about 1.5 min) at town stop 2. This is the only extra walk out of town.
  - **West (8.2 → 9.0):** the vision walk crosses the stalker/cougar/swoop field around 42–50, 42–55, so Thunderhorn Totem, Swoop Hunting and the last two Mazzranache parts are done on the way to Wiserunner. After that: the west harpy camp (Windfury), Bael'dun, Perith at Palemane Rock, Chakuyak.
  - **East (9.0 → 10.1):** the Thunderhorn well (it's on the way), the Venture Co. mine with all three Fizsprocket pages, the Galak camp, then Morin's hand-ins.
- **North:** Prairie Wolf Alpha teeth and Flatland Prowler claws on the walk to Red Rocks, then Rite of Wisdom and A Sacred Burial. After that, Thunder Bluff, the harpy camp below it (Preparation for Ceremony) and Arra'chea. Last, **hearth to Bloodhoof** for the Wildmane Totem hand-in: from there the walk east to the Barrens is shorter than from Thunder Bluff.
- **Dropped:** Wildmane Cleansing + Thunderhorn's Report (another round trip to a well in the far north), The Demon Scarred Cloak (rare drop), and Journey to the Crossroads (854: a Camp Taurajo detour that also locks you out of Plainstrider Menace).

## 2. Speedrun vs Balanced (grind rate ~150 XP/min at 6–10, ~200 at 11)

| Quest | Verdict |
|---|---|
| Grace of An'she, Sparring Match, Kyle, Longwalker chain, The Longwalkers escort, Chakuyak, A Sacred Burial | **now both routes**: on the path, or a few kills next to an NPC you visit anyway (they were Balanced only) |
| Traditions of the Bluff | **Balanced only**: about 3 min of vendor errands for 420 XP |
| Ceasing Operations (elite), Stalk With The Earthmother chain | Balanced only, as before |
| Gathering Leather / Kodo Hide Bag | both routes, skinners only (the bag reward) |
| Camping 101: Fishing | left out: about 7 min for 270 XP is under half the grind rate |

Sim exit levels: **Speedrun 12.0** (it grinds Windfury Matriarchs until 2,950 XP short of 12, before the Thunder Bluff hand-ins; the old route grinded more than that), and **Balanced 11.8 with no grind** (the Crossroads quests need 9–10, Harpy Raiders needs 12 and comes later). `npm run xp:gate` passes.

## 3. Please check in the playtest

- The south-east Palemane camp: is it really there, and is it enough for 10/8/5 without the west camp?
- Do the Well Stones at the Winterhoof well count for Rite of Vision?
- Rite of Vision: do you have to follow the vision all the way, or can you walk ahead and kill along the field?
- Where the Mulgore exit to the Barrens is, and whether hearthing to Bloodhoof is faster than walking from Thunder Bluff.
- Galak camp: only 6 of each centaur spawn there. How long are the respawn waits? Also check Herak at level ~9.5.
- Sparring Match with Novice Warriors: does it work solo, and do they give XP?
- Real level at each town stop compared with the sim (5.8 / 7.7 / 9.0 / 10.1).
