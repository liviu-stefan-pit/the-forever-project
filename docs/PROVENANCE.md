# Data provenance

Where every committed data file in this repo comes from. Audited on 2026-11-21.

**Bottom line:** every committed data file comes from QuestieDB, cited public pages, our own addon,
or text written for this project. Two test fixtures were regenerated from QuestieDB (see the table
and note (2) below).

`pipeline/maps/` holds only helpers that read the user's own game files:
- `images.py` stitches world-map tiles (driven by `pipeline/map_images.py`);
- `zones_static.py` holds uiMap ids and world-map folder names;
- `savedvars.py` and `lua_table.py` read our own GuideWebExport addon's SavedVariables.

The `data/` and `web/public/data/` folders are build output and are git-ignored. Zone map images in `web/public/maps/` are committed once generated.

## Per data area

| Area | Files | Source |
|---|---|---|
| Quest / NPC / object / item / zone DB | `content/questie-db/*` | Pinned QuestieDB release v1.1.3 (GPL-3.0), fetched by `pipeline/questie_import.py` with sha256 checks; see that folder's README |
| 1-20 route packs | `research/routes/horde-1-20/` (one folder per pack, one file per segment), `research/nova/catalog/*` | Written by Nova from content/questie-db, the QuestieDB Forever data (`tools/dump.lua`) and Wowhead quest pages, which each step cites in `sources[]` (1) |
| 40-60 route pack, gold, pre-BiS | `research/horde-40-60/*` | Built by `research/horde-40-60/tools/*` from content/questie-db plus cited Wowhead pages (1) |
| Dungeon chains | `research/dungeons/*` | Built by `research/dungeons/tools/*` from QuestieDB (`dump.lua`, `dumpfv.lua`) plus cited pages (1) |
| Professions, tips, trainers | `research/professions/*` | Written by Sentinel and Vulkan, with NPC coordinates from QuestieDB and cited sources |
| Gold plan | `research/gold/gold-plan.json` | Written for this project from a player research summary (22 Nov 2026) of public WoW Forever gold guides; every item cites its URLs. Figures are estimates and were not re-checked in game |
| Route schema and example | `contracts/route-v2.schema.json`, `contracts/fixtures/route-v2/example.json` | Written for this project; the example uses placeholder ids and coordinates |
| Zone fixture | `contracts/fixtures/zones.json` | Durotar `bounds` are the game's own world-map bounds (the same values HereBeDragons uses: left -1962.5, top 1808.33, 5287.5 × 3525). They are not a fit from guide lines |
| Quest fixture | `contracts/fixtures/quests.json` | QuestieDB records: all 24 giver and 29 objective points match content/questie-db spawns (2) |
| Durotar guide fixture | `contracts/fixtures/guides/1-6-durotar.json` | Our own text. **Coordinates and step ids regenerated (2)** |
| Insights fixture | `contracts/fixtures/insights.json` | Small original sample. Step ids remapped and one statistic replaced (2) |
| Guide index fixture | `contracts/fixtures/guide_index.json` | Written by hand: one bracket and one start |
| Addon sample | `contracts/fixtures/GuideWebExport.sample.lua`, `addon/tests/mock_client.lua` | Output of our own addon (#4) and a mock client |
| Web app code | `web/src/**` | No embedded coordinate, outline or pin data. The map draws only what the data files contain |
| Map images | `web/public/maps/*.webp` | Stitched from the game client's own world-map tiles by `pipeline/map_images.py`. © Blizzard Entertainment, used under Blizzard's Fan Content Policy; not covered by the GPL (see `NOTICE.md`) |

(1) **Coordinate check:** the route packs' points were compared with content/questie-db spawns (±0.15
zone %). Matches were 96% of dungeon gotos, 99% of the 40-60 pack, and 85–93% of the 1-20 packs.
Every pack pin in the 40-60 and Silverpine packs matched; a few 1-20 pins and dungeon pins did not.
The leftover points are hand-rounded one-decimal mob-area centres that cite Wowhead quest pages.

(2) **Regenerated:** `contracts/fixtures/tools/rebuild_durotar_fixture.py` (repeatable; reads only
content/questie-db) does the following.
- **Coordinates:** each map point becomes a QuestieDB spawn: the quest giver or turn-in NPC, the
  step's target NPC, or an objective mob or object. Mob loops are spread over the mob's own spawn
  points.
- **Removed points:** approach points with no QuestieDB anchor, the step 4 class-filtered approach
  points and the travel points in step 16.
- **Step ids:** renumbered to `1-6-durotar:NN`.
- **Rebuilt:** the section route and stops.
- **References:** the step ids in `quests.json` and `insights.json` were rewritten.
- **Text:** one statistic line in insights was replaced with our own sample text.

## Research pass (2026-11-21)

Route JSON was edited in research. This note records what those edits may cite. Step counts are the `n` of the last step.

| File | Steps |
|---|---|
| `research/nova/v2/durotar-1-12.json` | 155 |
| `research/nova/v2/mulgore-1-12.json` | 126 |
| `research/nova/v2/tirisfal-1-12.json` | 127 |
| `research/nova/v2/silverpine-11-15.json` | 54 |
| `research/nova/v2/barrens-12-20.json` | 141 |
| `research/nova/v2/zephras-isle.route-v2.json` | 194 |
| `research/levels-20-40.route-v2.json` | 656 |
| `research/horde-40-60/horde-40-60.route.json` | 1053 |
| `research/dungeons/steps-v2.json` | 619 |

- Free, publicly available guide addons were consulted as reference only (listed in `CREDITS.md`). Quest ids, order and coordinates were checked. Step text is original.
- Upstream versions checked. Git: Guidelime `57c1dd686d2d1eac3a9ea5e9d5c10d697f6dbffe`, Questie `99bef7a7b721aefb4ba070029ef91d62e9108d61`, QuestieDB `5b857c29e32c1f0a6bc095bde64f6c5c05dd86ff`, factoruide `4e88b398e17f3a59001d35fd5af2e45c53b37504`, Harubex `7205beddfab9c332a7238b43deb68bea72c72320`, OpenXP `b3f094095ceca7a5eee1d64b2851c861cf25ecf1`, WoW-Pro-Guides `4bd7bb847a12818d6b53a71565ac737e4d114409`. CurseForge: Trailwright 0.1.86-beta, OpenXP 1.3.66, GuideLime TUGs Forever (file 9705547, no version in the zip name), Guidelime Sage 2026.11.18, WoW-Pro v2026.11.12.A, Guidelime Bethink 1.0.12.
- QuestieDB JSON in `content/questie-db/` is that same QuestieDB commit (`content/questie-db/meta.json`, `content/questie-db/README.md`). It replaces the v1.1.3 zip pin (`8b8df2d`).
- OpenXP is CC BY-NC-SA. Facts and quest ids only. No OpenXP sentences were copied. Similarity audit passed: `research/external-review/reports/similarity-audit.md`.
- Paid guides (RestedXP, Zygor, Dugi, Joana) were not used as sources.
- `npm run data` exited 0 and wrote 9 packs, including zephras-isle. Pipeline tests: 70 passed. No browser pass on this pass.
