# Alliance 1-20 routes (staging, not on the site)

Alliance leveling routes for WoW Forever, levels 1-20, in **balanced** and **speedrun** styles. This folder is
**not read by the website**. `web/scripts/build-data.ts` only discovers packs under `research/`. To publish a pack
later, move its folder from `staging/alliance/routes/alliance-1-20/` to `research/routes/alliance-1-20/`. You also
need Alliance quest data wired into the build (see "Going live" below).

## Layout

| Path | What |
|---|---|
| `plans/<pack>.json` | **Source of truth for now.** The authored route order, one file per pack (format below). |
| `routes/alliance-1-20/<pack>/` | Built route packs (`pack.json` + segment files) in the exact layout of [docs/ROUTE_FILES.md](../../docs/ROUTE_FILES.md). Generated; do not hand-edit while the plans are the source. |
| `catalogs/<zone>.md` | Per-zone quest catalogs for authors: every Alliance/neutral quest with level, giver/turn-in coordinates, objectives, chain links and XP. Generated. |
| `tools/build_pack.py` | Plan → pack builder, route checker and XP walk. |
| `tools/catalog.py` | Regenerates `catalogs/`. |
| `tools/adb.py` | Shared loader for `content/questie-db-alliance` plus the XP rules (same formulas as `web/src/lib/xp/rules.ts`). |
| `research/` | Notes: the Gemini deep-research report summary and the open questions. |

Quest data comes from `content/questie-db-alliance/` (`python3 -I pipeline/questie_import.py --faction alliance`;
same pinned QuestieDB commit as the Horde snapshot, GPL-3.0).

## Commands

```
python3 -I staging/alliance/tools/catalog.py                      # rebuild catalogs
python3 -I staging/alliance/tools/build_pack.py --check plans/X   # check + XP walk, write nothing
python3 -I staging/alliance/tools/build_pack.py staging/alliance/plans/X.json   # build one pack
python3 -I staging/alliance/tools/build_pack.py --all             # build every pack
python3 -I staging/alliance/tools/build_pack.py -v --classes Hunter,Mage plans/X   # level after each step
```

The checker walks every race in the plan × both routes (× the classes you pass), starting from the packs named in
`after`. It reports these problems:

- an accept below the quest's required level
- missing prerequisites (`pre.single`: one of them turned in; `pre.group`: all of them)
- accepting an exclusive quest or the same quest twice
- completing or turning in a quest that is not in the log
- turning in a quest with no complete step
- a quest log above 20
- quests left open at the end (unless they are listed in `carry`)
- a giver, turn-in or objective with no coordinates

The XP walk is the worst case (no rested XP, no food, dungeons off, one kill per kill objective and about 1.6 kills
per drop). It reports the level on leaving each pack, so the next pack's `enterLevel` can be checked.

## Plan format

```jsonc
{
  "id": "elwynn-1-12",                     // pack id = folder name; step ids are "<id>:<action>-<questId>"
  "title": "Elwynn Forest 1-12 (Alliance)",
  "levels": [1, 12],
  "next": "westfall-12-17",                // balanced successor; "nextByRoute": {"speedrun": "..."} optional
  "races": ["Human"],                      // races this pack serves: Human, Dwarf, Gnome, NightElf, Skyborne
  "maps": [1429, 1453],                    // preferred UiMap ids, first = main zone (picks spawns / clusters)
  "enterLevel": 1,                         // level on entering when there is no "after" chain
  "after": {"Human": ["elwynn-1-12"], "*": []},   // packs a race has done before this one (prereqs, log, level)
  "carry": [123],                          // quests deliberately left open for the next pack
  "segments": [
    {"file": "01-northshire-valley.json", "title": "Northshire Valley", "routes": null, "steps": [ ... ]}
  ]
}
```

A segment is a hub or zone visit (Northshire Valley, Goldshire, Eastvale), not a level. It should hold about 15-60
steps. A segment-level `"routes": "b"` makes every step in it balanced-only.

### Steps

Each entry in `steps` is a string or an object with `"do"`.

| `do` | Meaning |
|---|---|
| `A 783` | accept quest 783 (goes to the giver; an item-start quest goes to the drop's mob camp) |
| `T 783` | turn in 783 at the ender |
| `C 7` | complete every objective (goes to the densest spawn cluster of the objective mobs/objects, adds a mob-area pin) |
| `C 7.2` / `C 7.1,3` | only those objectives (1-based: creatures, then items, then objects, the web build's order) |
| `T 783; A 7; A 5261` | several actions in one step at the first action's place (same NPC or same spot) |
| `home <npcId>` | set hearthstone at an innkeeper |
| `fp <npcId>` | learn a flight path; `fly <npcId> <Destination>` takes a flight |
| `hs <Place>` | use the hearthstone |
| `trainer` / `trainer <npcId>` | visit your class trainer (optionally go to a trainer NPC) |
| `vendor <npcId>` / `npc <npcId>` | visit / talk to an NPC (vendor action / just a goto) |
| `xp <level> <mobId> [extra]` | grind to `level` on that mob (camp chosen from spawns); `extra` = XP past the level |
| `goto` | free step: needs `"at": [x, y]` (and `"map"` if not the previous map) and `"text"` |

Suffix `@b` = balanced only, `@s` = speedrun only (e.g. `"A 5261 @b"`). Object options:

| Key | Effect |
|---|---|
| `routes` | `"b"`, `"s"` or `"both"` |
| `text` | replaces the generated step text (write your own words; never copy guide prose) |
| `at`, `map` | override the location (`[x, y]` zone %, `map` = UiMap id) |
| `tip` / `speed` / `elite` / `prof` | string or list: general / speedrun-only / elite tactic / profession tip |
| `tipSources` | `[{url,label}]` for the tips (default: the step's own sources) |
| `races`, `classes` | restrict the step (quests with race/class masks get these automatically) |
| `optional` | `true`: marked optional |
| `dungeon` | `{"name": "Hall of Thanes", "levels": [13, 18]}`: shown only with dungeons on; `dungeonPart` = pickup/prep/run/turnin |
| `dungeonsOff` | `true`: open-world alternative shown only with dungeons off |
| `minutes` | expected minutes |
| `id` | custom step id slug (rarely needed) |
| `noPin` | do not add the mob-area pin |

## Authoring rules

1. **Every quest id must come from the catalog / `content/questie-db-alliance`.** Never invent ids, NPCs or
   coordinates. The builder fills names and coordinates from the data, so if a step needs `at` that is a sign to
   double-check.
2. **Balanced** is the complete, relaxed line: worthwhile side quests, class quests, gear rewards, Forever
   additions, Camping 101 and gathering-trainer pickups when cheap, and an optional dungeon detour (`dungeon`).
   **Speedrun** is its own optimised order. It is not just balanced without the extras: it batches quests, skips
   bad XP-per-minute quests and long walks, grinds where that beats walking (`xp`), uses hearthstone and deathskips
   (as tips), and accepts that some quests are left undone.
3. Aim for the pack's level range on **both** routes in the worst-case walk. Speedrun may end with a short `xp`
   grind to reach the exit level. Don't accept quests below their required level (the checker fails it).
4. Keep the quest log ≤ 20. Abandon nothing silently: quests you don't finish are simply never accepted.
5. Race/class quests get filters automatically from their masks; add every class's class quest at the right
   trainer (the site hides other classes' steps).
6. Tips are short, in your own words, and practical (where to pull, what to skip, what is new in Forever). Mark
   Forever-specific claims that are not in the data with `tipSources` pointing at a real source.
7. Steps for Forever-new quests are auto-tagged "New in Forever" and `verified: false`. Classic quests are
   `verified: true` like the Horde packs (the quest exists in Forever's QuestieDB baseline). Nothing here was
   playtested yet.

## Pack chain

| Race | Balanced | Notes |
|---|---|---|
| Human | `elwynn-1-12` → `westfall-12-17` → `redridge-17-20` | Hall of Thanes (dungeons on) via the Deeprun Tram from Westfall |
| Dwarf, Gnome | `dunmorogh-1-12` → `lochmodan-12-17` → `redridge-17-20` | Hall of Thanes under Ironforge |
| Night Elf | `teldrassil-1-12` → `darkshore-12-20` | Forever Stormwind ↔ Auberdine boat noted as an alternative |
| Skyborne (High Order) | `zephras-isle-alliance` (1-13) → `westfall-12-17` → `redridge-17-20` | exits via the Valanaar Skycutter to Dalaran, then Stormwind |

## Going live (later, not done)

The site build reads `content/questie-db` (Horde) for quest names, XP, pins and the prereq/turn-in checks. Before
the packs can move to `research/routes/`, that build (and `web/scripts/xp-sim.ts`) needs to read
`content/questie-db-alliance` as well. The UI also needs Alliance races and starts. Until then the packs are
validated with the real site build in a scratch worktree, with the Alliance data swapped in (see `research/VALIDATION.md`).
