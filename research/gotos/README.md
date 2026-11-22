# Goto backfill (QuestieDB coordinates)

`backfill.py` adds a `goto` action to route-v2 steps that have none, using only spawn coordinates from
`content/questie-db` (QuestieDB v1.1.3 Forever, GPL-3.0; credited in the root `CREDITS.md`). Nothing comes from
Wowhead or any guide, and no coordinate is typed in by hand.

```
python3 research/gotos/backfill.py          # edit the packs + write report.json
python3 research/gotos/backfill.py --check  # exit 1 if any pack would still change
```

Re-run it after regenerating `research/dungeons/steps-v2.json`, because its generator overwrites the pack.
It reads whole packs, segment folders included, and writes each step back to its own segment file. It is idempotent: steps that already have a goto are not touched.

## Rules

- accept: quest starter NPC/object spawn. Item-started quests: spawns of the NPCs/objects that drop the item
  (not for dungeon steps, where the item drops inside the instance).
- turn-in: quest finisher NPC/object spawn.
- collect: NPC/object drop sources of that item. mob: the listed NPC ids. complete: the quest's objective target,
  only when the quest has exactly one objective.
- QuestieDB marks instance spawns as `[-1, -1]`; those never become a goto.
- The step's zone is the map of the previous goto, then the next goto, then the quest's own zone. Inside that map
  the spawn nearest the neighbouring goto is used (ties: first in QuestieDB order). Spawns in any other zone are
  rejected and the step is listed.
- New gotos use the existing shape (`mapId`, `x`, `y`, `zone`, `exact: true`), go first in `actions`, and add the
  QuestieDB v1.1.3 source to the step's `sources`. Step `verified` flags are unchanged (Forever stays `false`).
- Travel notes, hearthstone, flight and class-trainer steps are skipped: QuestieDB has no single location for them.

## Result (source packs)

| Pack | Steps | Missing before | Filled | Missing after |
|---|---|---|---|---|
| `horde-dungeons-15-60` | 685 | 128 | 1 | 127 |
| `horde-40-60` | 1228 | 115 | 18 | 97 |
| `horde-20-40` | 994 | 30 | 0 | 30 |
| `barrens-12-20` | 136 | 7 | 2 | 5 |
| `durotar-1-12` | 150 | 9 | 3 | 6 |
| `mulgore-1-12` | 115 | 10 | 4 | 6 |
| `silverpine-11-15` | 36 | 3 | 2 | 1 |
| `tirisfal-1-12` | 119 | 6 | 0 | 6 |
| **total** | | **308** | **30** | **278** |

Every filled step (with the NPC/object it came from) and every unfilled step with its reason is in `report.json`.
The Deathstalker Agent (NPC 13155, quests 95663 / 95682) has no spawn in QuestieDB, so those steps stay without a goto.
