Sources: QuestieDB, the route, dungeon steps, and the public guides were enough.

# Horde endgame zones: Hyjal, Silithus, Shen'dralas, Blackmaw, Shaper's Terrace

Route file was read only: `research/horde-40-60/horde-40-60.route.json`. Dungeon steps were read only: `research/dungeons/steps-v2.json`. No route JSON was edited.

Map ids from `content/questie-db/zones.json`: Mount Hyjal zone 616, uiMapId 2482. Silithus zone 1377, uiMapId 1451. Shen'dralas zone 16651, uiMapId 2652. The Shaper's Terrace is area 4382, parent Un'Goro Crater zone 490, uiMapId 1449. Blackmaw Hold has no row in `zones.json`. Azshara is zone 16, uiMapId 1447. `pre.single` is any one prerequisite. `pre.group` is all of them.

Published notes used as level context, not as quest ids: Hyjal is described as level 60, the Shen'dralas bracket was unpublished, one Blackmaw Hold table had no level number, and Shaper's Terrace is about 59. Those unpublished figures stay unverified. Questie levels below are the check.

## Already decided, still on the route

- 969 Luck Be With You is still `h4060:winterspring:a969`, `c969`, and `t969` (n=1201–1203). Questie: level 60, req 55, no `pre`, `next` 975, text is 4 Frostmaul Shards. 975 Cache of Mau'ari is not on the route. The Hyjal exit that only exists for this stop is `h4060:winterspring:travel-eb5c19` (n=1200): leave through Everlook for the level-60 Winterspring quests. Drop the travel step with the three quest steps. Do not add 975.
- 7732 Zukk'ash Report is still `h4060:feralas:a7732` and `h4060:feralas:t7732`. 4494 March of the Silithid `pre.single` is 32 or 7732, `next` 4496. 32 is not the Horde lead-in. 4496 `pre.single` is 4493 or 4494, `next` 4507. 4507 is not on this route. Drop the report accept and turn-in with `h4060:azshara:a4494`, `h4060:un-goro-crater:t4494`, `a4496`, `c4496`, and `t4496`.
- 93034 Valley of Bones is still `h4060:shen-dralas:a93034` and `t93034`. Questie `pre.single` is 1373. 1373 is not on the route. Follow-ups that stay on the route and require that chain: 93035 and 93037 (`pre` 93034), 93041 (`pre.group` 93035 and 93037, `next` 93044), 93044 A Cleansing Cry (accept and turn-in are on the route; 93044 is not in `quests.json`), 93045 (`pre` 93044), 93058 and 93062 (`pre` 93045), 93122 (`pre.group` 93058 and 93062, `next` 93128). 93128 Khan Jehn is not on the route. Do not add it. Every one of those texts tells the player to hold Gelkis standing.

## Shen'dralas

Shen'dralas is on the 40-60 route, n=456–510, from `h4060:shen-dralas:travel-9a2877` through `h4060:shen-dralas:travel-eac5ae`. The bracket was unpublished, so the level band is unverified. Questie levels on the kept chain sit in the low 40s with req 35, which is early for this stretch of the file.

93125 Going Home has an empty `pre`. It is not part of the 93034 chain. Its text still says to maintain Gelkis standing. It stays, with a tip that 1373 is not on the route.

## Mount Hyjal

The zone opens at `h4060:mount-hyjal:travel-e67d15` (n=878). Public notes call Hyjal level 60. Questie req levels on the hub quests sampled here are often 54, with quest levels 56–60. That published "60" is unverified against a single bracket.

Dropped inside the hub, separate from the decided list:

- 94504 Barkskin Beginnings and 96666 Burrow Bonding. Both objectives are Barkskin Burrow reputation (Neutral, then Friendly). No `pre`, no `next`.
- 90854 Leather for Inclement Weather. `pre.single` is 92449 or 95026. 95026 is already on the route, so this is not a missing-prerequisite block. The objective is 2 Rugged Armor Kits and 1 Cured Rugged Hide.

No Hyjal Summit raid steps and no Barrow Deeps steps are on this route. None are added.

Blackmaw and Shaper's Terrace are pointers only: `h4060:mount-hyjal:dungeon-d40300` and `h4060:mount-hyjal:dungeon-030568`, with dungeons-off skips. One quested clear is a tip. The instance is not scripted here.

## Silithus

The route's Silithus slice is n=1212–1219: 8276 Taking Back Silithus (level 55, req 54, no `pre`, `next` 8280), 8280 Securing the Supply Lines (15 Dredge Strikers, `next` 8281), and 8277 Deadly Desert Venom (8 stingers and 8 fangs, `next` 8278). Those three have empty `pre` lists and stay.

Not added. 8281 is 20 Dredge Crushers. 8278 is three more sting and fang types and its `next` is 8282, the southern satchel. 8284 is 8 Twilight Tablet Fragments. 8318 is 10 Encrypted Twilight Texts. 9422 is a Silithyst delivery. OpenXP's Horde 55–56 Silithus does 8277, 8280, 8278, and 8281, and the 58–59 section starts the tablet, text, and general chain. TUGs 58–60 only picks up the Cenarion Hold flight point. WoW-Pro's Horde leveling files in this checkout stop before this band. That Cenarion continuation is the slow chain, so it stays off the route.

## Blackmaw Hold and Shaper's Terrace

Dungeon file quests, one clear, no new script:

- 92343 Get to the Roots of It, level 55, req 45. `pre.single` is 92345 or 92346. 92346 Beneath Nordrassil is already on `horde-40-60.route.json`, and its `next` is 92343. Not blocked. Objective is 10 Nordrassil Root Caps inside the hold.
- 97198 Blackmaw Magic, level 59, req 52, no `pre`. One ritual totem.
- 92066 The Twin Bears, level 55, req 47, no `pre`. Two totems.
- 92065 Blackmaw Reclamation, level 60, req 47, no `pre`. Accept is `dungeons:forever:blackmaw-hold:accept:92065`. There is no turn-in step. Questie end npc is the same as the start npc, 236573.
- 97327 Blackmaw Pouches, level 60, req 55, no `pre`. 5 pouches.
- 99187 The Reliquary of Tyr, level 58, req 50, no `pre`.

Questie levels for these run 55–60. A table that printed no level for the hold stays unverified.

Shaper's Terrace quests in the dungeon file: 95928, 97049, and 95926. Each is quest level 60, req 55, empty `pre`, empty `next`. 95924 and 95925 are not in `quests.json` and are not on the dungeon steps. The "about 59" public note stays unverified next to quest level 60.

## Changeset

13 ops in `changesets/hyjal-silithus.json`: drop 7, tip 6. All `verified: false`.

Slow chains dropped: Frostmaul shards (969) and the Everlook exit, the Zukk'ash report (7732) with March of the Silithid (4494, 4496), the Gelkis Valley of Bones chain from 93034 through 93122, Barkskin reputation (94504, 96666), and the rugged-leather delivery (90854). Silithus is not extended into crushers, tablets, encrypted texts, or Silithyst.

Blocked by a missing prerequisite: 93034 needs 1373, and the follow-ups above need 93034. Horde 4494 needs 7732 once that report is dropped. 32 does not replace it. 92343 is not blocked, because 92346 is already on the route.
