# tpf-db: The Forever Project's own game database (CC BY 4.0)

Quests, NPCs, objects, items, drop rates, XP, spawns and trainers for WoW Forever, built only from what our
own addon [AdventureLog](../../addon/AdventureLog/) recorded while people played. The repo calls it **tpf.db**.

**How to credit:** "Data from The Forever Project tpf-db (CC BY 4.0), https://github.com/liviu-stefan-pit/the-forever-project"

## Licence

| Path | Licence | Why |
|---|---|---|
| everything in this folder **except** `unconfirmed/` | [CC BY 4.0](LICENSE) | facts seen in our own play logs |
| [`unconfirmed/`](unconfirmed/) | GPL-3.0 (QuestieDB) | QuestieDB records for quests no log has shown yet |
| the parser, [`pipeline/adventurelog/`](../../pipeline/adventurelog/) | MIT | our code |

Free for anyone to use, change and share, commercially too, with the credit line above. Nothing in the
confirmed files comes from QuestieDB, Wowhead or any other database, not even to fill a gap. Fields the logs
cannot show (quest level, required level, race and class masks, objective text) are left out.

## Scope

Zephras Isle (Horde Skyborne start, levels 1-13), all classes. Confirmed data: one Shaman run from character
creation to level 13 (17 logged sessions; the 6 with quest or kill events are used, idle ones are listed in
`meta.json` and skipped).
Other classes' quests are in `unconfirmed/` until someone plays them.

## Files

Id-keyed files hold one record per line, like `content/questie-db`, and use the same field names where the
meaning is the same (`name`, `start`, `end`, `objectives`, `spawns`, `minLevel`, `npcDrops` …), so
`web/scripts/build-data.ts` can read either.

| File | Contents |
|---|---|
| `quests.json` | `name`, `zone`, `mapId`, `start` / `end` (`npc`, `object`, `item` ids from the quest dialog), `giverAt` / `enderAt` (where the dialog was), `acceptAt` / `turninAt` (where the player stood; sessions before AdventureLog 1.2.0 have only these), `objectives` (`creatures`, `items`, `objects`, `events`: `id`, `count`, `text`, `index`; item objectives add `fromNpcs` / `fromObjects`), `xpReceived` (XP at the player's level then), `money` (copper), `rewards` (`items`, `choices`, `chosen`), `pre` (`status: "inferred"`: accepted within 10 s of turning in that quest at the same NPC or spot), `acceptedAtLevel`, `turnedInAtLevel`, `observed` (accepted / turned in / abandoned counts) |
| `npcs.json` | `name`, `roles` (`questGiver`, `questEnder`, `trainer`, `mob`), `questStarts`, `questEnds`, `trainerTypes`, `minLevel` / `maxLevel` and `classification` (mobs), `kills` per bucket, `spawns` |
| `objects.json` | `name`, `roles` (`questGiver`, `questObjective`, `lootable`, `readable`), `use` (how it was used), `questObjectiveOf`, `spawns`; `sourceGuessed` when an old session's loot slot did not say it was an object (the id was never seen as a creature) |
| `items.json` | `name`, `quality`, `npcDrops`, `objectDrops`, `skinnedFrom`, `questRewards`, `questChoices`, `questObjectiveOf`, `obtainedBy` |
| `zones.json` | `map:<uiMapId>` → `name`, `uiMapId`, `subzones` |
| `drops.json` | `mobs`: kills per bucket, `lootWindows`, items with `drops`, `items`, `dropPct`, `sampleSize`; `skinning`; `objects`: items per opened object; `quests`: quest item × mob rows (see below) |
| `xp.json` | `quests` (XP and copper received per player level), `kills` (kill XP per mob, mob level and player level), `killsByLevel`, `explore` (discovery XP), `excludedKills` |
| `spawns.json` | `map:<uiMapId>` → subzone → npc id → `points`, `samples` |
| `trainers.json` | trainer NPC → `trainerTypes`, `spawns`, `taught` (spells bought: `spell`, `rank`, `cost`, `reqLevel`, `skillLine`), `seenBy` (classes), `idFrom` (`log`, or `name-match` when an old session logged the name only) |
| `meta.json` | sessions used (class, race, levels, AdventureLog features), counts, licences, credit line, `unconfirmedByClass`, `promoted` |

Every record has `status: "confirmed"`, `samples` (how many events back it) and `evidence`:
`[{"session": "<AdventureLog session id>", "t": [<seconds since that login>, …]}]`. The same session id and `t`
find the event in the log.

### Positions

Zone % (0-100) of the **player** when the event fired (dialog, kill, loot, object use), keyed by `map:<uiMapId>`.
The log records UI map ids, not the AreaTable ids QuestieDB keys by. Quest NPCs are within talking range of
the point; mob points are where the fight was, not the spawn itself.

### Kills, drops and XP

Kills fall in one bucket each:

| Bucket | Meaning | In drop % and kill XP? |
|---|---|---|
| `solo` | your kill, not grouped | yes |
| `grouped` | grouped, or the kill line had a group bonus | no (flagged) |
| `groupCredit` | credit from a group member's fight | no (flagged) |
| `untracked` | not tracked in one of your fights | no (flagged) |
| `tapDenied` | someone else's tag | no (flagged) |

Sessions before AdventureLog 1.2.0 have no kill flags: their kills are `solo` unless the group size was above 0
or the kill line had a group bonus. Rested kills are left out of kill XP (`excludedKills.rested`).

`dropPct` = loot windows holding the item / solo kills × 100. Quest rows (`drops.quests`) count only kills
made while that objective was unfinished, and count drops from the quest log's objective increments matched
to the loot window they came from (`attributedBy`). `sampleSize` is the kill count behind the percentage;
small samples are rough.

## Rebuild

```
py -3 -I pipeline/adventurelog --log "<WoW>\_forever_\WTF\Account\<acct>\<realm>\<char>\SavedVariables\AdventureLog.lua" --zone "Zephras Isle"
```

`--log` also takes an exporter folder (`Adventures\<Character> - adventure\`) or a single `.jsonl`, and can
be repeated to merge characters and classes. Logs are only read. The same logs give byte-identical files.
`--check` exits 1 when the files here would change.

When a log shows a quest listed in `unconfirmed/`, the rebuild moves it into the confirmed files with its
evidence and adds its id to `meta.json` `promoted`.

## Not in the log (left out)

Quest level and required level, race / class restrictions, objective and description text, vendor, innkeeper
and flight master NPC ids (AdventureLog logs those visits without the NPC id), mob spawn points as opposed to
fight positions.
