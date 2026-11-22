Sources: Questie plus TUGs, WoW-Pro, Bethink, Trailwright, and OpenXP already fix the order.

# Zephras Isle 1-12 proposal (Horde Skyborne / Windshaper)

No route file was written. The changeset proposes a new pack at `research/nova/v2/zephras-isle.route-v2.json`. Map check: Questie zone 16593 Zephras Isle `uiMapId` 2521. Mulgore zone 215 is `uiMapId` 1412. Questie has 121 quests with `zoneId` 16593. `pre.single` means any one prerequisite. `pre.group` means all of them. Every step is `verified: false`. Gotos are Questie NPC, object, or drop medians.

Compared, facts only: TUGs Horde `1-6 Skyborne` and `6-12 Skyborne`, WoW-Pro Forever `01_12_Zephras_Isle_H`, Bethink `H-01-14_Zephras_Isle`, Trailwright `PathData.lua` key `skyborne_h` (a quest-id path, not prose), OpenXP `RestedXP-Skyborne.lua` (CC BY-NC-SA, order only, no sentences copied). Sage is Alliance.

Windshaper classes kept: Druid, Hunter, Rogue, Shaman, Warrior. No Paladin, Mage, or Priest steps. No Tauren aquatic druid chain exists on this island to copy.

## Handoff

Questie 95349, The Earthen Ring, says to take the skycutter from Zephras Isle to Mulgore and speak with Alaana Stormwalker. Her only spawn is zone 215 at 33.37, 22.57. That flight is verified by the quest text. The objective does not name Skywatcher Plateau and does not say to ride to Thunder Bluff.

95350, Welcome to Azeroth, is offered by that same NPC and tells the player to find Thrall in Orgrimmar. 98024 then points at the Crossroads, and 93739 points at Nazgrel in Grommash Hold. Joining the existing Mulgore 1-12 route is not what these quests say. Bethink and the public notes add a ride from the plateau into Thunder Bluff. Those coordinates are not in Questie, so they are not in the proposal. The Thunder Bluff join stays unverified.

## Proposed line

194 steps, 78 quests. 159 of the steps are on both the balanced line and the speedrun. The other 35 are balanced only.

The shared line is Thendal Grove (92460 through the queen, the tower glide, Skysight, agitators), the class notes in that grove, shaman Call of Earth 92466–92468, the ursera den, Al'Aketh Thugs on the road, Shen'dar through Falaath and the western watch, Valanaar, the eastern tower, the turncoat house, and the Shrine of Akir through 95349. Hunter 94007 is only the report from Elayaa Easewind in Shen'dar (45.26, 44.24) to Quel'ana Quickgale in Valanaar (59.56, 72.63). Records 94978, 94979, 94013, and 94050 are not in Questie, so nothing after 94007 is proposed.

Call of Earth stays. Windshaper Boro is in the grove, and the Signet of Akir drops from Al'Aketh Converts at 47.19, 19.88, the agitator camp. The sapta turn-in is the Minor Manifestation of Earth at 49.67, 23.8. Questie `pre.single` on 92467 also lists Durotar 1516 and Mulgore 1519. Those are other races' Call of Earth quests. 92466 is `exclusiveTo` both, so a Skyborne shaman does not need them.

92700 and 92646 are on the line because every Horde guide treats them as the Valanaar and sanctum beats, and the objective text names Ayessa Dawnsinger. Questie stores race mask 32 on both, the classic Tauren bit, with the Skyborne high bit unset. That mask is suspect. The pack author should confirm the quests are actually offered before shipping them.

## Balanced only

- 96638 and 96101. Raan and the campfire are on the walk into Shen'dar. One sit.
- 92515. Ten Prideclaw pelts in the highlands loop already used for hippogryphs.
- The Windfield orchard: 92679, 92682, 92683, 92684, 92698, 92685, 92693, 92703. One Gustberry camp. Not required for the shrine chain.
- Druid 94006 and 94638. Urs'endris is at the falls northeast of Valanaar. The kill text sends you after Ur'endra in the Shen'dar Highlands, which is behind the player by then.

Speedrun drops those as one-off errands or a second camp.

## Dropped as slow, missing, or the wrong class

Not proposed, and not pulled in as a partial chain:

- 93552 Harvesting Windstones. Fifteen clusters, and TUGs tells you to go out of your way.
- 92553 Restocking the Larders. Eggs and strider meat from creatures "throughout" the highlands.
- 93318 WANTED: Vulgara the Insatiable. Elite poster. TUGs marks it optional.
- 93317 Crab Season. Six crawler meats, and nothing in the shrine chain requires it.
- 93736 Unwelcome Spirits. Ten essences in Shadowgale Forest.
- 94896 Aid For The Refugees. Eight belongings in Ban'aethal.
- 94897 and the Shadowgale den: 94484, 94485 (8 moss), 94486 (20 feathers), 94487 (10 heirlooms), 93165, then 94488–94491. 94488's group prerequisite is the three collection quests, so the chain cannot be kept without the farm. TUGs marks this block optional if you only want to leave the island.
- 92551 Stolen Supplies. WoW-Pro uses it. The quest record is not in Questie.
- Call of Fire 98517, 97243, 97244, 97245, 97257. The first stop is the Gustberry shrine, then Kuramaa back in the Shen'dar Highlands.
- Camping 101 profession talks 96646, 97963, 97964, 97965, 97967, 97968, 97969, 97970, 97971, 97972, 98284, 98285. Several ask you to raise a skill. 96646's other `pre.single` ids are other starters or missing; 96101 is enough to unlock them, and they are still errands.
- 96996, 99203, 99216. Riding quests at level 40 and 60.
- 96204. Paladin, and the giver is not on the island.
- Hunter tames after 94007. Unknown. Those four quest records are missing.

## Counts

1. Proposed steps: 194 (78 quests). Speedrun uses 159 of them. Balanced adds 35.
2. Handoff: skycutter to Mulgore is in 95349. Alaana is at 33.37, 22.57 on map 1412. Thunder Bluff and the Mulgore 1-12 join are not in the quest text. 95350 sends you to Orgrimmar.
3. Slow drops: 93552, 92553, 93318, 93317, 93736, 94896, the 94484–94491 den chain plus 93165, and Call of Fire 97243–97257 (with 98517).
4. Also left out: missing 92551 and the missing hunter tames, the Camping 101 profession set, and the level 40/60 riding quests.
