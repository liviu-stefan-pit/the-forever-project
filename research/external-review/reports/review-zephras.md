Sources: QuestieDB (`content/questie-db`) plus `contracts/route-v2.schema.json` were enough.

# PASS

`research/nova/v2/zephras-isle.route-v2.json` against Forever Questie and route-v2.

- JSON valid. `schema` `project-forever/route`, `version` 2. 194 steps, `n` 1..194, no `raw`. Every step has `sources` and `verified: false`.
- Accept before complete before turn-in on both routes. 78 accepts, 65 completes, 78 turn-ins. The 7 quests with no complete step (94414, 92595, 93926, 92708, 94568, 93065, 93836) are speak-with the turn-in NPC.
- Every `pre.single` / `pre.group` needed on a route is turned in earlier on that same route (including speedrun). Class quests are filtered: Hunter 92482/94007, Rogue 92483, Shaman 92484/92466–92468, Druid 92485/94006/94638, Warrior 92532/94003.
- Gotos are zone percents. Map ids used: 2521 (Zephras Isle) and 1412 (Mulgore). Accept/turn-in pins match Questie NPC medians.
- Forbidden ids are absent from actions and prose: 93552, 92553, 93318, 93317, 93736, 94896, Shadowgale 94484–94491 and 93165, Call of Fire 98517 and 97243–97257, 92551, hunter tames after 94007, Camping 101, riding 96996/99203/99216.
- Speedrun is a subset of balanced (65 vs 78 quests). Balanced-only: 96638, 96101, 92515, Windfield 92679/92682/92683/92684/92698/92685/92693/92703, druid 94006/94638. Speedrun still has the shrine line through 95349.
- End: `zephras-isle:194` turns in **95349** The Earthen Ring to Alaana Stormwalker at **33.37, 22.57 map 1412** (Questie npc 259119, zone 215). Tip on that step: 95350 points at Thrall in Orgrimmar; a Mulgore 1-12 join is unverified. `verified` is false. The pack does not claim a verified ride to Thunder Bluff or a verified join into the Tauren Mulgore route.

Questie stores race mask 32 (Tauren) on 92700 and 92646, while 93836 (Horde+Skyborne, `pre.single` 92646) needs 92646. That is a Questie mask inconsistency, not a pack handoff lie. The pack keeps both on the shared line.
