# Sources: Horde 40-60 research (Orion)

All step text, tips and notes are written by us. We took only facts (ids, coordinates, levels, vendor lists, drop sources) from the sources below.
No content from paid or NonCommercial guides was used. Wowhead was used only for a few single pages read by hand, plus per-item reference links. Nothing was scraped.

| Name | URL | Licence | What was used |
|---|---|---|---|
| QuestieDB `data/Forever` (quest, NPC, object, item DBs + conversion.json) | https://github.com/Questie/QuestieDB/tree/master/data/Forever | GPL-3.0 (Questie project; credited, name/logo not used in UI) | Quest ids, levels, prerequisites, quest givers and turn-ins, NPC/object ids, spawn coordinates (zone %), item drop sources, recipe vendors, UiMap ids per zone. Derived data lives only in `horde-40-60.route.json` and `prebis.json` |
| QuestieDB v1.1.3 Forever build, via PR #5 `content/questie-db/` (Godfather's import) | https://github.com/Questie/QuestieDB/releases/tag/v1.1.3 ; https://github.com/liviu-stefan-pit/project-forever/pull/5 | GPL-3.0 (credited; Questie name/logo not used in UI) | Primary source for every Forever-new quest id, giver, turn-in, objective, prerequisite, NPC/object id and coordinate, plus flight master NPCs. Only ids are referenced; the data folder is not copied to this branch |
| QuestieDB Forever docs (forever-data.md) | https://github.com/Questie/QuestieDB/blob/master/docs/forever-data.md | GPL-3.0 | UiMap ids for new zones (Riverglades 2548, Mount Hyjal 2482); the fact that the DB is a converted Era baseline without new Forever content |
| Blizzard: Return to Azeroth in WoW Forever | https://news.blizzard.com/en-us/article/24315643/return-to-azeroth-in-world-of-warcraft-forever | Blizzard website terms (facts only) | New zones, dungeons, race/class combos, Legacy system, Darkspear Islands |
| Blizzard: WoW Forever, what's new and what feels familiar | https://news.blizzard.com/en-us/article/24315821/wow-foreverwhats-new-and-what-feels-familiar | Blizzard website terms (facts only) | Class changes (hunter traps and pets), new race/class combos |
| Wowhead: Explore the new dungeons of WoW Forever (Blizzard blog) | https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506 | Wowhead terms: read by hand, facts only | Dungeon names, level ranges, locations |
| Wowhead: Everything you need to know for WoW Forever's launch | https://www.wowhead.com/forever/news/everything-you-need-to-know-for-wow-forevers-global-launch-383656 | Wowhead terms: read by hand, facts only | Launch date, camping system, presets, rulesets |
| Wowhead: Legacy System overview (Forever) | https://www.wowhead.com/forever/guide/legacy-system-overview-rewards | Wowhead terms: read by hand, facts only | Legacy perk names and effects |
| Wowhead: Riverglades zone overview / Riverglades news | https://www.wowhead.com/forever/guide/riverglades-zone-overview | Wowhead terms: read by hand, facts only | Rog'mar hub, Grakna flight master coords, breadcrumbs, items to bring |
| Wowhead Classic item/quest pages | https://www.wowhead.com/classic/ | Wowhead terms: links only | Per-item and per-quest reference links in `sources` (not fetched in bulk) |
| Warcraft Wiki (Well Rested, Professions, Class, Mount) | https://warcraft.wiki.gg/ | CC BY-SA 3.0 (facts only, no text copied) | Legacy perk numbers, general profession and class references |
| wowfdb Legacy calculator | https://wowfdb.com/legacy/ | No licence stated: facts only, flagged unverified | Legacy perk ranks |
| WoW Forever wiki: Leveling and experience | https://wowfwiki.com/wiki/Leveling_and_experience | No licence stated: facts only, flagged unverified | Talented and Frequent Flier effects |
| wow-forever.gg XP bonuses | https://wow-forever.gg/guides/xp-bonuses/ | No licence stated: facts only, flagged unverified | Camp Tent, Well Fed XP, 8 Nov dungeon XP change |
| foreverquestlog Riverglades | https://foreverquestlog.com/zones/riverglades/ | No licence stated: facts only, flagged unverified | Rog'mar hub NPCs and flight costs |
| warcraftmaps Krol'dok Stronghold / Horde route | https://warcraftmaps.com/dungeons/kroldok-stronghold | No licence stated: facts only, flagged unverified | Krol'dok entrance coords and Horde dungeon quests |
| wowforeveraddon Mount Hyjal quests | https://www.wowforeveraddon.com/guides/quests/mount-hyjal/ | No licence stated: facts only, flagged unverified | Horde Hyjal quest names, givers and coordinates |
| wofwforever Mount Hyjal access | https://wofwforever.com/en/guides/wow-forever-mount-hyjal-access/ | No licence stated: facts only, flagged unverified | Hyjal access, Zet'gan coords, quest id 95248 |
| khorium Mount Hyjal quests | https://khorium.pro/guide-view.html?slug=wow-forever-mount-hyjal-quests | No licence stated: facts only, flagged unverified | Hyjal hub order, elite quests |
| bytetavern Mount Hyjal | https://bytetavern.com/wow-forever-mount-hyjal/ | No licence stated: facts only, flagged unverified | Hyjal level range and Horde quest/XP counts |
| allthings.how WoW Forever zones | https://allthings.how/wow-forever-new-zones/ | No licence stated: facts only | Raid names and 9 Dec date |
| bytetavern Shen'dralas | https://bytetavern.com/wow-forever-shendralas/ | No licence stated: facts only, flagged unverified | How to reach Shen'dralas, no flight master |
| Polestar Shen'dralas guide | https://polestar.guide/guides/40-50/shendralas | No licence stated: facts only (access route), flagged unverified | Horde access via Shadowprey Village and the Valley of Bones |

## Research pass (2026-11-21)

Step counts are the `n` of the last step. The 20-40 file sits next to this pack in the same pass.

| File | Steps |
|---|---|
| `research/levels-20-40.route-v2.json` | 656 |
| `research/horde-40-60/horde-40-60.route.json` | 1053 |
| `research/dungeons/steps-v2.json` | 619 |

Free sources under `research/external` were reference only. Quest ids, order and coordinates were checked. Step text is original.

Git clones (`research/external/github/VERSIONS.md`, shallow clones on 2026-11-21): Guidelime `57c1dd686d2d1eac3a9ea5e9d5c10d697f6dbffe` (2026-11-20), Questie `99bef7a7b721aefb4ba070029ef91d62e9108d61` (2026-11-20), QuestieDB `5b857c29e32c1f0a6bc095bde64f6c5c05dd86ff` (2026-11-21), factoruide `4e88b398e17f3a59001d35fd5af2e45c53b37504` (2026-11-20), Harubex `7205beddfab9c332a7238b43deb68bea72c72320` (2023-08-23), OpenXP `b3f094095ceca7a5eee1d64b2851c861cf25ecf1` (2026-11-17), WoW-Pro-Guides `4bd7bb847a12818d6b53a71565ac737e4d114409` (2026-11-20).

CurseForge packs (`research/external/curseforge/MANIFEST.md`, downloaded 2026-11-21): Trailwright 0.1.86-beta (file 9721853, 2026-11-20), OpenXP 1.3.66 (file 9678070, 2026-11-18), GuideLime TUGs Forever (file 9705547, 2026-11-19, no version in the zip name), Guidelime Sage 2026.11.18 (file 9694441, page date 2026-11-19), WoW-Pro v2026.11.12.A (file 9576975, 2026-11-12), Guidelime Bethink 1.0.12 (file 9698758, 2026-11-19).

OpenXP is CC BY-NC-SA. Facts and quest ids only. No OpenXP sentences were copied. The similarity audit passed: `research/external-review/reports/similarity-audit.md`.

Paid guides (RestedXP, Zygor, Dugi, Joana) were not used as sources.

Quest data for this pass is the QuestieDB checkout in `content/questie-db/meta.json` and `content/questie-db/README.md`: commit `5b857c29e32c1f0a6bc095bde64f6c5c05dd86ff`, Questie `99bef7a7b721aefb4ba070029ef91d62e9108d61`. That replaces the v1.1.3 zip pin (`8b8df2d`) named in the table above.

`npm run data` exited 0 and wrote 9 packs, including zephras-isle. Pipeline tests: 70 passed. No browser pass.

## Research pass (2026-11-22)

Solo-first route decision only. No pack, schema, or UI edits. Decision doc: `research/levels-40-60.md`.

Facts recorded there (ids, names, coordinates, hotfix dates) come from the sources already in the table above plus the Blizzard hotfix post https://news.blizzard.com/en-us/article/24315281/wow-forever-hotfixes-november-20-2026 (facts only). No third-party guide prose was copied.

Weak claims left flagged unverified in that doc, and not used as design rules: the kill-XP formula and ~7% green penalty (broken citation), "dungeon kill XP is 60% of Classic Era", a Skyborne 10% apprentice riding discount without Honored, a Powderfuse flight master, Hyjal "~400,000 XP" as route XP, and any speedrun time. Nov 18–22 had no outdoor XP formula change in that hotfix article.

Current 40–60 pack snapshot called out for later phases: ~1807 steps, 0 home, 0 fp, ~139 completes, 0 `tags.optional`, 0 class filters, empty elite tips, grind stub without `type: xp`, and an integration plan that drops Alcaz, Sunken Temple, BRD, Dire Maul East, and Gahz'rilla.
