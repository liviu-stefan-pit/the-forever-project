# Barrens 12–20 external review

**PASS**

Read only: `research/nova/v2/barrens-12-20.json` against `content/questie-db` and `contracts/route-v2.schema.json`. No route file was edited. Map: Questie zone 17 The Barrens → uiMapId **1413**.

## Checks

| Check | Result |
|---|---|
| JSON valid | Yes. `schema` `project-forever/route`, `version` 2, 141 steps. |
| `n` contiguous | Yes. `n` is 1..141, unique, in order. Step ids unique. |
| route-v2 schema | Pack and steps match required fields. No extra step keys. Tips, hooks, elite, pins, and sources match `$defs`. Coords 0–100. Every `goto.mapId` is 1413. |
| accept / complete / turn-in order | For every quest accepted in this file, complete (when the quest has objectives) and turn-in come after accept. Incoming Durotar/Mulgore turn-ins 840, 809, 854 have no local accept. Dungeon accept 1487 is gated and has no overworld complete. |
| prerequisites | Every accept’s Questie `pre.single` / `pre.group` is already turned in on this route (or empty). 924 after 809; 875 after 867; 3281 after 869; 882 after 3261. |
| Demon Seed 924 | Same Far Watch visit: accept `barrens-12-20:924-accept` n=4 at Ak'Zeloth 62.34, 20.07; altar complete `barrens-12-20:924-complete` n=5 at object 3525 47.98, 19.07; turn-in `barrens-12-20:924-turnin` n=6 back at 62.34, 20.07. Only the altar step sits between accept and turn-in. Repeatable 926 is a tip on `barrens-12-20:003`, not a second trip. |
| complete 875 | Present: `barrens-12-20:875-complete` n=102 at 38.91, 14.31 (Witchwing Slayer npc 3278 / item 5065). |
| Stolen Silver 3281 | One chest: complete `barrens-12-20:3281-complete` n=119 at object 147557 spawn 58.04, 53.87. Item 5061 drops from that object only. No camp pin. |
| 866 Root Samples | Absent. No step, action, or text. |
| Verog / Chen / egg hunt / Northwatch / quillboar collections / Samophlange manual | Not steps. No actions for 851, 852, 4021, 819, 821, 822, 868, 891, 898, 899, 878, 5052, 879, 906, 893, 1153, 95774, 3921–3924. 850 and 902 stop before 851 and 3921. |
| 882 Ishamuhale | Remains: accept `barrens-12-20:120` n=127, complete `barrens-12-20:122` n=129, turn-in `barrens-12-20:123` n=130. Needed later for Stonetalon/Ashenvale 6382 (`pre.single` 882). |
| Hearth | Set `barrens-12-20:005`; use `barrens-12-20:134`. |
| No-layer-swap | Tip on `barrens-12-20:016`: finish the kill count before changing layer. |
| Coordinates sane | Accept/turn-in gotos match Questie giver/end spawns (Ak'Zeloth, Gazrog, Jorn, altar, Stolen Silver chest). Completes with pins sit on Barrens 17 spawns. |

No defects.
