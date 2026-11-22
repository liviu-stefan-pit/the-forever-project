# Sources — Nova, Horde 1–20 research

| Source | Used for | Licence / terms |
|---|---|---|
| QuestieDB `data/Forever/*` — https://github.com/Questie/QuestieDB/tree/master/data/Forever | Quest IDs, quest chains, NPC/object IDs, NPC + mob spawn coordinates (zone %), item drop sources | Questie project is **GPL-3.0** (https://github.com/Questie/Questie). Facts only (IDs, coordinates); we redistribute derived JSON with attribution under GPL-3.0 terms. |
| QuestieDB `data/Forever/conversion.json` | Confirms the Forever DB is a *converted Era baseline* (Classic IDs + Forever map transforms; Mulgore and a few maps rescaled; new Forever content not included) | same |
| QuestieDB **v1.1.3 Forever release**, merged to main in PR #5 (`content/questie-db/*.json`) — https://github.com/liviu-stefan-pit/project-forever/tree/main/content/questie-db | Ids, givers, turn-ins, objectives, NPC levels and coordinates of Forever-new quests (ids ≥ 90000; 76k–87k ids treated as Season of Discovery and left out). Filtered by `tools/extract_forever.py` → `catalog/forever_quests_1_20.json` | GPL-3.0 (Questie). Facts only |
| Wowhead Classic — https://www.wowhead.com/classic/quest=ID, /npc=ID, /item=ID | Per-item reference links (one per quest/NPC/item) | Facts only, no prose copied |
| WoW Forever DB — https://wowfdb.com/zones/durotar/ (and /mulgore/, /tirisfal-glades/, /the-barrens/, /silverpine-forest/) | Which quests are new/changed in Forever, zone levels, enemy levels | Facts only |
| Hardcore Helper Forever zone guides — https://www.hardcorehelper.com/forever/guides/durotar-leveling-guide, mulgore-, tirisfal-glades- | Forever-new quest names, giver NPC names, objectives, XP | Facts only |
| Hackverso Forever leveling table — https://hackverso.com/en/wowforever/leveling/ | Forever-new city quests (Exploring the Horde, Rocks to Rests), Ruins of Lordaeron dungeon 15–22 | Facts only |
| Blizzard / press: https://www.gamespot.com/articles/wow-forever-will-add-all-new-content-to-classic-azeroth-this-november/ , https://news.blizzard.com/en-us/article/24317866/ | What WoW Forever is | — |

| Questie Forever audit — https://github.com/Questie/Questie/blob/master/FOREVER_WORK_LEFT_TO_DO.md , docs/forever-development.md | Confirms Questie on Forever runs on Era content; new Forever quests are a known content gap | GPL-3.0 |
| WarcraftMaps, Classic vs Forever professions — https://warcraftmaps.com/guides/classic-vs-forever-professions | Skin-once, camp at skill 20, vendor price cuts (16 Oct) | Facts only |
| Method / Mobalytics / classic-wow.com — https://www.method.gg/wow-forever/how-to-get-waylaid-crates-and-merchants-favor-in-wow-forever , https://mobalytics.gg/wow-forever/guides/waylaid-crates-explained , https://www.classic-wow.com/database/npc/256386/dokimi | Dokimi (npc 256386, 50.1 29.3 Barrens), Waylaid Crates, Merchant's Favor | Facts only |
| Sentinel profession hooks — branch sentinel/professions 464b42a, research/professions/profession_hooks.json | Profession hooks merged per zone/level (their sources/verified kept) | team data |

Rules applied: no prose from third-party guides or Wowhead. All route text is ours. Anything without a QuestieDB ID is `"unverified": true` with the web source that names it.
Regenerate the catalog: download the four Lua files, `lua5.1 tools/dump.lua` (writes forever.json), then `python3 tools/extract_catalog.py forever.json catalog/quests_horde_1_24.json`.

## Research pass (2026-11-21)

Step counts are the `n` of the last step in each file.

| File | Steps |
|---|---|
| `research/nova/v2/durotar-1-12.json` | 155 |
| `research/nova/v2/mulgore-1-12.json` | 126 |
| `research/nova/v2/tirisfal-1-12.json` | 127 |
| `research/nova/v2/silverpine-11-15.json` | 54 |
| `research/nova/v2/barrens-12-20.json` | 141 |
| `research/nova/v2/zephras-isle.route-v2.json` | 194 |

Free sources under `research/external` were reference only. Quest ids, order and coordinates were checked. Step text is original.

Git clones (`research/external/github/VERSIONS.md`, shallow clones on 2026-11-21):

| Repo | Commit | Committer date |
|---|---|---|
| Guidelime | `57c1dd686d2d1eac3a9ea5e9d5c10d697f6dbffe` | 2026-11-20 |
| Questie | `99bef7a7b721aefb4ba070029ef91d62e9108d61` | 2026-11-20 |
| QuestieDB | `5b857c29e32c1f0a6bc095bde64f6c5c05dd86ff` | 2026-11-21 |
| factoruide | `4e88b398e17f3a59001d35fd5af2e45c53b37504` | 2026-11-20 |
| Harubex classic-leveling-guide | `7205beddfab9c332a7238b43deb68bea72c72320` | 2023-08-23 |
| OpenXP | `b3f094095ceca7a5eee1d64b2851c861cf25ecf1` | 2026-11-17 |
| WoW-Pro-Guides | `4bd7bb847a12818d6b53a71565ac737e4d114409` | 2026-11-20 |

CurseForge packs (`research/external/curseforge/MANIFEST.md`, downloaded 2026-11-21). Dates are addon-page `dateModified`.

| Pack | Version / file |
|---|---|
| Trailwright | 0.1.86-beta, file 9721853, 2026-11-20 |
| OpenXP | 1.3.66, file 9678070, 2026-11-18 |
| GuideLime TUGs Forever | file 9705547, 2026-11-19 (no version in the zip name) |
| Guidelime Sage | 2026.11.18, file 9694441, page date 2026-11-19 |
| WoW-Pro | v2026.11.12.A, file 9576975, 2026-11-12 |
| Guidelime Bethink | 1.0.12, file 9698758, 2026-11-19 |

OpenXP is CC BY-NC-SA. Facts and quest ids only. No OpenXP sentences were copied. The similarity audit passed: `research/external-review/reports/similarity-audit.md`.

Paid guides (RestedXP, Zygor, Dugi, Joana) were not used as sources.

The QuestieDB import cited by `content/questie-db/meta.json` and `content/questie-db/README.md` is checkout commit `5b857c29e32c1f0a6bc095bde64f6c5c05dd86ff`, with Questie zone names at `99bef7a7b721aefb4ba070029ef91d62e9108d61`. That import replaces the earlier v1.1.3 zip pin (`8b8df2d`).

`npm run data` exited 0 and wrote 9 packs, including zephras-isle. Pipeline tests: 70 passed. No browser pass.
