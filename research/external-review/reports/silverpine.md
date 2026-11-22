Sources: Questie plus OpenXP, TUGs, WoW-Pro, and Bethink were enough to order a short line.

# Silverpine Forest 11-15 (Horde) — external review

Map check: route steps use UiMap **1421**. OpenXP’s Forever zone table maps the name Silverpine Forest to 1421. Questie area id for the same zone is **130** (`zoneId` on quests and the key inside `spawns`). Those are different id spaces. Npc and object coordinates below are Questie `spawns["130"]` percents. Do not treat 130 as `mapId`.

Tirisfal handoff already in the route: **445** Delivery to Silverpine Forest (req 9, level 10, 630 xp). Giver Apothecary Johaan (1518) in Tirisfal. Turn-in Apothecary Renferrel (1937) at 42.8, 40.86. No `pre`. `sourceItem` 3238.

## What the current route already does

Balanced only, 36 steps, no speedrun tags. Quest ids in file order: 445, flight path (Karos Razok 2226 at 45.62, 42.6), 421, 428, 6321 (Undead filter), 421 complete, 428 turn-in, 429, 435, 435 complete and turn-in, 449, 429 complete, 449 turn-in, 421 turn-in, 3221, 3221 turn-in, 429 turn-in, 430, 477, 430 turn-in, 91920, 91920 complete and turn-in, 91921, 91921 turn-in, 425, 425 complete and turn-in, 477 turn-in, 478, 478 turn-in, then a leave step.

That is three trips between the Sepulcher and the Ivar Patch, plus a south run to the Dalaran crate. Exit step `silverpine-11-15:036` is a goto on map 1421 at 60.7, 58.8. That point is still Silverpine. The zeppelin to Orgrimmar is in Tirisfal. Karos Razok is the flight master on the Sepulcher pin already in step 002.

## Questie chain facts for ids on the route

| Id | Name | Req / level / xp | `pre` | Next | Giver → end | Objective |
|---|---|---|---|---|---|---|
| 421 | Prove Your Worth | 9 / 10 / 880 | none | 422 | Dalar Dawnweaver 1938, 44.2, 39.81 | Kill Moonrage Whitescalp 1769 (spawns from about 47.8, 34.1 to 56.7, 19.5) |
| 428 | Lost Deathstalkers | 10 / 12 / 225 | none | 429 | Hadrec 1952, 43.42, 40.86 → Rane Yorick 1950, 53.46, 13.43 | Find Quinn and Rane. No creature objective |
| 429 | Wild Hearts | 10 / 11 / 440 | none | 430 | Rane → Renferrel | Item 3164. Questie text says **6** hearts. No count field on the item objective |
| 435 | Escorting Erland | 10 / 11 / 880 | none | 449 | Deathstalker Erland 1978, 56.18, 9.18 → Rane | Escort. `PARTY_ACCEPT` |
| 449 | The Deathstalkers' Report | 10 / 11 / 440 | 435 | 3221 | Rane → Hadrec | Item delivery |
| 3221 | Speak with Renferrel | 10 / 12 / 90 | 449 | 1359 | Hadrec → Renferrel | Talk |
| 430 | Return to Quinn | 10 / 11 / 660 | 429 | 91920 | Renferrel → Quinn Yorick 1951, 53.43, 12.59 | Talk / potion |
| 91920 | Wild Eyes | 10 / 11 / 440 | 430 | 91921 | Quinn → Renferrel | Item 730. Route tip and OpenXP collect line use **3** eyes. Questie text does not give a count |
| 91921 | Return to Quinn (Again) | 10 / 11 / 660 | 91920 | 425 | Renferrel → Quinn | Talk |
| 425 | Ivar the Foul | 10 / 12 / 680 | **91921** (not 430) | none | Rane → Rane | Item 3621 from Ivar 1971 at 51.52, 13.9 |
| 477 | Border Crossings | 10 / 14 / 980 | none | 478 | Allister 2121, 43.98, 40.93 → object | Dalaran Crate 1627 at **49.89, 60.33** |
| 478 | Maps and Runes | 10 / 14 / 740 | 477 | 481 | Crate → Allister | Pendant delivery |
| 6321 | Supplying the Sepulcher | 10 / 10 / 210 | none | 6323 | Podrig 6389, 43.42, 41.68 → Karos 2226 | Undead only (`races` 16) |

428 does not have to be in the log for 429 (`pre` is empty). Turning 428 in still requires the quest, so the safe order is accept 428 before speaking to Rane. 425 does not open from 430. WoW-Pro’s `PRE|430` on 425 does not match this Questie row.

Heart-count conflict, left unresolved: Questie objective text for 429 still says 6. The route tip and OpenXP’s `.collect 3164,3` both say 3 (OpenXP’s comment on that line still says x6). Do not treat 3 as verified from Questie.

## Speedrun line (own steps, not a tag on the balanced list)

One Sepulcher hub, one north circuit, fly out. No second or third Ivar trip. No south crate.

Order: turn in 445 → flight path → accept 421, 428, and 6321 (Undead) → turn in 6321 at the same bat → kill 5 whitescalps on the road north → turn in 428 → accept 429 → accept and finish 435 → accept 449 → finish 429 beside the patch → back to the Sepulcher → turn in 449, 421, 3221, and 429 → accept **1359** → fly Karos Razok to Undercity → turn in 1359 to Apothecary Zinge (5204) at Questie 50.14, 67.97 (spawn key 1497) → accept 1358 and leave it for the Barrens → zeppelin to Orgrimmar.

1359 Zinge's Delivery: level 15, req 10, 105 xp, `pre` 3221, next 1358. 1358 Sample for Helbrim is the Barrens hand-in (Apothecary Helbrim). Do not write Barrens steps here.

Quests on that line: **445, 421, 428, 6321 (Undead), 435, 429, 449, 3221, 1359**. Flight path is on the line and is not a quest. 6323 is not on the line.

Off the speedrun line even though balanced keeps them: **430, 91920, 91921, 425, 477, 478**. 430 is only a walk, but it forces a second north trip, then 91920 turns in back at Renferrel, then 91921 forces a third trip before 425. That is the long way around a short zone. 477 is a separate south camp of frost mages for one crate; 478 only leads to 481, which only leads to the Ambermill pendant farm.

## Balanced

Keep the current quest list. It is already thinner than OpenXP and WoW-Pro, which still run Arugal’s Folly through the mine, The Dead Fields, and A Recipe For Death.

Add 1359 after the 3221 turn-in, and turn it in on the Undercity pass, for the same reason as speedrun. Keep 430 through 425 and 477–478. They are short once you have already paid for the extra trips. Stop there.

Do not add 481 Dalar's Analysis or 482 Dalaran's Intentions on either line. They are 100 xp talks whose next step is 479.

Exit: leave from Karos Razok (45.62, 42.6), not from 60.7, 58.8 on map 1421.

## Dropped chains (do not add)

Long drop farms, elite or mine kills, or a `pre` that is not 445 and not on the route. The whole chain goes, including any short first step.

- **422 → 423 → 424 → 99 → 98298 / 98299.** 422 is one book in a house and opens from 421, which is on the route. 423 is 6 Glutton Shackles (3156) and 3 Darksoul Shackles (3157). 424 is Grimson the Pale inside Deep Elem Mine. 99 is 6 Pyrewood Shackles and requires 424. Drop the whole Arugal chain, including 422.
- **437 → 438 → 439 → 440 → 441 → 530**, and **443 → 444 → 446 → 448 → 442.** 437 is kill gnolls until Nightlash spawns (level 14, item 3622). 443 is 8 Rot Hide Ichor and needs 439. Fenris (442) is level 24. 440’s `pre` is 439, which is not on the route.
- **447 → 450 → 451.** 447 has no `pre` and is 6 Grizzled Bear Hearts (3253) plus 6 Skittering Blood (3254), turned in to Faranell in Undercity. 450 is a Pyrewood journal. 451 is lake moss. OpenXP, TUGs, WoW-Pro, and Bethink all keep 447. It is still a two-stack drop farm on a zone this route is trying to cross quickly. Drop it.
- **6323 → 6322 → 6324.** Undead courier loop back to Podrig. 6321 can be turned in while taking the flight path. Do not fly back from Undercity for 6324.
- **479 Ambermill Investigations** (8 Dalaran Pendants, `pre` 482) and **95981 Watching the Roads** (`pre` 482, 8 wizards and 8 watchers) and **480 The Weaver** (`pre` group 479 and 95981).
- **452 Pyrewood Ambush** (council, `PARTY_ACCEPT`), **460 → 461 → 491** (dropped head, not a quest giver on the route), **516 Beren's Peril** (req 16, level 21), **493 Journey to Hillsbrad** (req 19).
- Class and dungeon chains that only touch the zone: shaman Call of Water (63 / 100 / 96, req 20), rogue Fenris (91859+, req 18), 78261 Horn of Xelthos (Shadowfang Keep), 5725 (Ragefire Chasm books; TUGs turns it in while in Undercity; not a Silverpine step).

## Ruins of Lordaeron

**92401 A Frightened Request** (Forever, req 15, level 22). Giver and turn-in are the same npc: Tabitha Heartweaver **250686** at Questie 44.52, 43.02 (area 130). Objective text sends the player into the Ruins. OpenXP accepts it only with a dungeon tag and an xp check. Bethink’s Silverpine file is a 19–21 route and runs a Ruins clear around 20, which is outside this 11–15 file. Tip only: at 15 the quest is available at the Sepulcher entrance; do not enter the dungeon in this route. Do not add 92421 or 92422. 92422’s `pre` is 99156, which is a Tirisfal quest, not this route.

## Source notes (facts, not wording)

- OpenXP Forever Undead speedrun (`Horde-01-14_Undead.lua`, block named 12-14 Silverpine Forest): north escort and hearts before the Sepulcher hub; collects 3 of item 3164 and 3 of item 730; still does 422, 423, 424, 437, 438, 447, and 477. That is a full zone clear, not this short line. It also shows the road in from Tirisfal reaches Erland before the Sepulcher, and it warns about a level 25 Son of Arugal.
- TUGs `10-12 Silverpine Forest`: packs 447, 437, 429, and 421 together, then still does 422, 91920, and 425, and leaves via Undercity with 6323 and 447.
- WoW-Pro Forever `12_15_Hendo_Silverpine_Forest.lua`: levels 10–15, next guide Barrens. Same wide clear, including the mine and Ambermill, and an explicit note to move to a Ruins of Lordaeron guide or skip it. Hearth and grind steps are in that guide; they are not used here.
- Bethink `H-19-21_Silverpine_Forest.lua`: starts at 19, so it is a later pass (Ambermill, Beren's Peril, one Ruins clear). It is not a template for 11–15.

Profession hooks already on step 001 (40 bear meat, wool from level 18–19 Dalaran Watchers, enchanting drop) are not quests. They are optional and are not part of either combat line.
