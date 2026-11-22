Sources: Questie plus OpenXP, TUGs, WoW-Pro, and Bethink name the same three clears.

# Early Horde dungeons — Ragefire Chasm, Wailing Caverns, Ruins of Lordaeron

One quested clear each. Inside kill credit is not a grind loop (about five entries an hour, and kill XP is zero at 12 or more levels above the mob). No reset, no second farm. Speedrun already skips Ragefire Chasm and Wailing Caverns in 1-20, so those steps stay balanced-only. Ruins of Lordaeron is the same: one balanced clear around 15-20.

Questie `races` 8589934770 is the Horde mask used on these rows. `classes` 0 means not class-locked. Coordinates below are Questie spawn percents. UiMap ids are the ones the routes already use (1454 Orgrimmar, 1456 Thunder Bluff, 1458 Undercity, 1413 Barrens, 1420 Tirisfal, 1421 Silverpine). Instance corpses with spawn `[-1, -1]` have no pin.

## Ragefire Chasm (13-18)

Placeholder `durotar-1-12:148` accepts **5728** (balanced, dungeons on). Durotar already does **5726** and **5727** before that. Mulgore has neither, so the dungeon pack still needs those two accepts for Tauren. Do not accept them again if they are already turned in.

| Id | Name | Req / level / xp | `pre` | Giver |
|---|---|---|---|---|
| 5726 | Hidden Enemies | 9 / 12 / 910 | none | Thrall 4949 at 31.73, 37.82 (area 1637) |
| 5727 | Hidden Enemies | 9 / 12 / 455 | 5726 | Thrall, then Neeru Fireblade 3216 at 49.47, 50.59 |
| 5728 | Hidden Enemies | 9 / 16 / 1150 | 5727 | Thrall. Kill Bazzalan and Jergosh |
| 5761 | Slaying the Beast | 9 / 16 / 1150 | none | Neeru. Taragaman's heart |
| 5723 | Testing an Enemy's Strength | 9 / 15 / 800 | none | Rahauro 11833 at 70.14, 29.52 (area 1638). 8 troggs and 8 shaman |
| 5722 | Searching for the Lost Satchel | 9 / 16 / 880 | none | Rahauro. Maur Grimtotem 11834 has no spawn point |
| 5724 | Returning the Lost Satchel | 9 / 16 / 1450 | 5722 | Maur, back to Rahauro |
| 5729 | Hidden Enemies | 9 / 15 / 105 | 5728 | Thrall to Neeru. Talk |
| 5730 | Hidden Enemies | 9 / 16 / 1450 | 5729 | Neeru to Thrall. Talk |

5726 through 5728 are Horde, not a warrior-only row (`classes` 0). 5728 is the dungeon part. 5729 and 5730 are two talks in Orgrimmar on NPCs the clear already visits. Nothing in Questie has `pre` 5730. Stop there. Do not write a class-weapon or warrior spec follow-up.

Keep one clear: 5728, 5761, 5723, and 5722/5724 if Rahauro was visited in Thunder Bluff. OpenXP's Horde dungeon file uses 5728, 5761, 5723, and 5725. TUGs and WoW-Pro Forever also pick up 5722. Bethink's Barrens files run one clear at 15 or 16 for the trogg count and the two end bosses.

## Wailing Caverns (17-24)

Barrens already turns in **880** at `barrens-12-20:102` before the placeholder `barrens-12-20:106` (accept **1487**, balanced). **1486** is completed in the cave outside the portal (`barrens-12-20:104` at 48.2, 32.8) and turned in at step 105, still before the placeholder. The dungeon pack must not play 870, 877, 880, 865, or 1486 again.

Handoff skip: **1491** Smart Drinks needs **865**, and 865 is turned in only after the placeholder (complete near line 7951, turn-in near 8989). Leave 865 on the Barrens. Do not move the horn farm forward.

| Id | Name | Req / level / xp | `pre` | On this clear? |
|---|---|---|---|---|
| 1489 | Hamuul Runetotem | 12 / 16 / 290 | 880 | Yes. Tonga 3448 at 52.26, 31.93 to Hamuul 5769 at 78.62, 28.56 |
| 1490 | Nara Wildmane | 12 / 16 / 115 | 1489 | Yes. Talk to Nara 5770 at 75.65, 31.61 |
| 914 | Leaders of the Fang | 11 / 22 / 2200 | 1490 | Yes. Four fanglord gems, same clear |
| 959 | Trouble at the Docks | 14 / 18 / 1350 | none | Yes. Bigglefuzz 3665 at 63.09, 37.61. One bottle on Mad Magglish |
| 962 | Serpentbloom | 14 / 18 / 1350 | none | Yes. Zamah 3419 at 22.81, 20.89. 10 blooms while clearing |
| 1487 | Deviate Eradication | 15 / 21 / 2050 | none | Yes. Ebru 5768 at 46.01, 35.74. The 7/7/7/7 count is the clear |
| 6981 | The Glowing Shard | 15 / 26 / 2650 | none | Only if item 10441 drops from this clear. Falla Sagewind 8418 at 48.18, 32.78 |
| 3369 | In Nightmares | 15 / 25 / 2000 | 6981 | Only after 6981. Hamuul. Horde (`races` 8589934770) |

The 20-40 step `horde-20-40:dungeon:wailing-caverns` is the known unexpanded placeholder. It must not start a second clear. If 1487 is already in the log from Barrens, finish that one run. If dungeons were off through level 20 and are on now, this is the only clear.

OpenXP, TUGs, WoW-Pro, and Bethink all run one Wailing Caverns clear and include 1491. This route does not, because 865 is not turned in first.

## Ruins of Lordaeron (15-20)

**92401** is only the Sepulcher breadcrumb. Silverpine already tips it and does not enter. The clear belongs here. Tabitha Heartweaver 250686 is at 44.52, 43.02 (area 130). No `pre`. Horde. Req 15, level 22. Objective is Edward Heartweaver inside the ruins. Turn-in is the same npc.

| Id | Name | Req / level | `pre` | Use |
|---|---|---|---|---|
| 92421 | Light's Justice | 15 / 22 | none | Yes. Morbin Lightbane 266484 at 58.08, 89.51 (area 1497). 25 Intact Limbs looted on the one clear |
| 92401 | A Frightened Request | 15 / 22 | none | Yes, as the inside objective. Pickup stays the Sepulcher tip |
| 97288 | Unending Torment | 15 / 21 | none | Yes if the Abominable Head (280438) drops on this clear. Faranell 2055 at 48.82, 69.28 |
| 97289 | Unending Torment | 15 / 21 / 1650 | 97288 | Head to Othmar's body, npc 271613 at 45.88, 61.7 |
| 97290 | Unending Torment | 15 / 21 / 1650 | 97289 | Back to Faranell |
| 97291 | Unending Torment | 15 / 21 / 1650 | 97290 | Tawny Grisette 4554 at 65.19, 49.84; Blisterweed by Katrina Alliestar 4615 at 54.73, 48.92 (Martha 4614 at 54, 49.55); Ezekiel Graves 4585 at 75.2, 51.18 |
| 97292 | Unending Torment | 15 / 21 / 1650 | 97291 | Object 460007 above Othmar. No object spawn in Questie; pin the body npc |
| 95204 | Crest of Lordaeron | 15 / 22 | none | Only if item 275521 drops. Oran Snakewrithe 7825 at 73.06, 32.85. `exclusiveTo` 95189, and 95189 is not a row in this quest file |

WoW-Pro Forever, TUGs, and Bethink's 19-21 Silverpine file each do one Ruins clear. WoW-Pro also runs 92422 and 95216. Those two are refused below. Bethink treats the head and the crest as optional drops, which matches Questie (`start.item`).

## Refused (whole chain)

- **5725 The Power to Destroy...** Two books inside the clear, but the only giver is Varimathras in Undercity (56.25, 92.2). The Horde placeholder fires in Orgrimmar at the end of Durotar. Undead leave Tirisfal for Silverpine, not Ragefire. Do not add an Undercity trip for this.
- **5729's class-weapon follow-up.** 5729 and 5730 themselves are kept. No later quest id in Questie uses `pre` 5730. Do not invent a warrior weapon chain.
- **865** stays on the Barrens. It is not a dungeon step. **1491** is refused because its `pre` is 865 and 865 is turned in after the Wailing Caverns placeholder. Five Intact Raptor Horns is the farm. Do not pull it forward.
- **870, 877, 880, 1486** are refused as dungeon-pack steps. They are already Barrens steps before the placeholder. Not refused as quests.
- **447 → 450 → 451 → 95216 The New Plague.** Silverpine already dropped 447 (two stacks of low-rate drops), 450 (elite Pyrewood journal), and 451 (lake moss plus a rare tumor). 95216's `pre` is 451, so the Witherfang item in the Ruins goes with that chain.
- **99156 → 92422 The Wrath of Rath'mael**, and any Forsaken Greataxe reward on 92422. 99156 is `pre` 356, `races` 18 (orc + undead bits, not the full Horde mask), and the Tirisfal review already refused it. 356 can be on Tirisfal. 99156 is not. There is no separate Greataxe quest id in Questie. Drop the whole chain. Do not kill Rath'mael for credit.
- **96395 An Ancient Grudge** (Hall of Thanes). `races` 0, but the zone is Hall of Thanes. No other Hall of Thanes quest is in this file. Not added.

## Source notes

OpenXP `Dungeons-Horde.lua` (CC BY-NC-SA, facts only): Ragefire 13-18 is 5728, 5761, 5723, 5725. Wailing Caverns 17-24 adds 1486, 1487, 1489, 1491, 959, 962, 914, 1490. No Ruins guide in that file. The Undead 1-14 guide only accepts 92401.

TUGs: `14-16 Ragefire Chasm` uses 5723, 5722, 5726, 5727, 5761, 5728, 5725. `20-22 Wailing Caverns` uses 1487, 1486, 959, 962, 1491, 914, 6981, 3369. `16-18 Ruins of Lordaeron` uses 92422, 92421, 95216, 92401, 95204, and 97288 through 97292.

WoW-Pro Forever Horde: same RFC set as TUGs, WC through the fang lords, and the Ruins file adds the Silverpine recipe chain before 95216.

Bethink: one Ragefire clear from the Barrens, one Wailing Caverns clear at 19, one Ruins clear on the 19-21 Silverpine pass. 97288 and 95204 are optional drops there.
