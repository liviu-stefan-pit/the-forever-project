# Project Forever: Horde professions research (WoW Forever, patch 1.60.1)

Built by Sentinel, 21 Nov 2026 (Bucharest time). Horde only. All prose here is our own; no paid or NonCommercial guide text was used.

## What WoW Forever is
- A separate, permanent WoW version, alongside retail and Classic. It launched on 4/5 Nov 2026. It keeps the original continents and the 1-60 climb, but runs on the modern engine and UI. Blizzard says it is not a mode, a season or a new version of Classic. ([Blizzard: Forever Now Live](https://news.blizzard.com/en-us/article/24315820/world-of-warcraft-forever-now-live), [WarcraftMaps: what's new](https://warcraftmaps.com/whats-new))
- It adds 1,000+ new quests, new or rebuilt zones (Mount Hyjal, Shen'dralas, Riverglades at about 36-44, and Zephras Isle at 1-12), 9 new dungeons, the Skyborne race, rebuilt talents, the Legacy account system, Camping, transmog, rulesets instead of realms, and a Group Finder.
- **New Horde race/class pairs (official, from Blizzard):** Orc Mage, Troll Warlock, Undead Paladin, and Skyborne (Windshaper) Shaman. So Paladin is a Horde class, and all 9 classes are covered.
  - WarcraftMaps' class table also lists Horde Skyborne as Druid, Hunter, Rogue and Warrior. Blizzard names only Shaman, so those four are **unverified**.

## What it changes for professions
Sources: [WarcraftMaps: Classic vs Forever professions](https://warcraftmaps.com/guides/classic-vs-forever-professions), [WoW Forever DB professions](https://wowfdb.com/professions/), [Forever Guides professions](https://theforeverguides.com/professions/).
- **Same:** 2 primary and 3 secondary professions, and the 75/150/225/300 ranks. Journeyman needs skill 50 and level 10, Expert 125 and level 20, Artisan 200 and level 35.
- **New recipes and cross-profession reagents:** 600+ new recipes, many at low skill. Tailors need Alchemist dyes (128 recipes use Cerulean Dye). Smiths need Sulfuric Acid and Sandpaper.
- **Healing potions moved to First Aid.** First Aid also gains poultices, tourniquets and anti-venoms, so it is S or A tier for most specs.
- **Scarce materials:** they can drop from any herb, ore or skin, for example Pristine Leather, which is used in 126 recipes. Each corpse can only be skinned once.
- **Gathering details:**
  - Poor Copper veins were cut in starter areas.
  - Tauren Cultivation now has level gates and a 15-minute cooldown.
  - Starter-zone Herbalism and Skinning trainers teach Apprentice only. City trainers teach all four ranks.
- **Camping:** every profession has a camp object at skill 20 (Lodestone, Sharpening Wheel, Camp Tent, Mana Well and others). Cooking builds the campfires.
- **Merchant's Favor:** you fill Waylaid Crates and hand them in at Durotar Supply and Logistics, just outside the Crossroads (Barrens, about 49.5, 29.3). The currency buys about 320 recipes that no trainer teaches.
- **Vendoring crafted items no longer pays:** vendor prices were cut on 16 Oct.
- **Legacy Points** at 150, 225 and 300 in each tradeskill.
- **Trainers and recipe vendors may have moved compared with Classic,** so we cross-checked the data (see Verification).

## Files (team schema: `origin/main` @ 9004b41, `contracts/route-v2.schema.json`)
| File | Shape | Count |
|---|---|---|
| `class_professions.json` | **ClassProfessionsFile**, validates against `contracts/route-v2.schema.json` | 9 classes, 137 levelingPlan milestones |
| `tips_matrix.json` | **TipsMatrixFile**, validates | 61 tips (general/elite/speed), 57 verified |
| `profession_hooks.json` | `{hookId, zone, levels, mob, mobId, mobSpawn, otherMobs, issues, professionHook}`, where `professionHook` validates as **ProfessionHook** | 296 hooks (39 pass 1 + 257 pass 2) |
| `hooks.json` | the richer research version of the hooks (provenance, Questie vs Forever coords) | 296 |
| `trainers.json` | per-trainer record: tier, npc_id, zone, x, y (zone %), side, level/skill gates, Expert book or Artisan quest unlocks | 156 (148 verified) |
| `classes.json` | the brief's format: class, role, leveling_pair, endgame_pair, reasoning, key_crafts, per-spec tier lists | 16 class×role rows, 43 key crafts |
| `gold_notes.json` | gold notes for gathering professions and cloth, by level band | 6 groups, 16 bands |
| `build/*.py` | reproducible generators. `raw/` holds the fetched source pages | — |

Validation: `class_professions.json` and `tips_matrix.json` have 0 errors against their `$defs`. All 39 `professionHook` objects are valid, checked with Draft 2020-12 jsonschema.

## How each field was sourced
- **NPC and item ids, mob spawns and levels:** QuestieDB Classic DBs from GitHub (`classicNpcDB` / `classicItemDB` / `classicQuestDB`).
- **Forever trainer list and /way coordinates:** [Forever Guides crafting trainers](https://theforeverguides.com/professions/crafting-trainers/) and [gathering trainers](https://theforeverguides.com/professions/gathering-trainers/). Wowhead Forever was only spot-checked on single pages (alchemy, trainer tables). There was no bulk Wowhead scraping.
- **Forever recipe vendors and prices:** [Forever Guides cooking recipes](https://theforeverguides.com/professions/cooking-recipes/), which is datamined from the client.
- **Reagents and skill-up colours:** [WoW Forever DB recipes](https://wowfdb.com/professions/cooking/recipes/), from client build 1.60.1.71037.
- **NPC positions in Forever:** WoW Forever DB zone maps.
- **Class pairs:** the WoW Forever DB PvE tier list for each spec, plus the Forever Guides pick per class.

## Verification summary
- **Trainers: 113 of 150 verified.** That means the npc_id resolved in QuestieDB and the Forever coordinates are within 2 units of Classic.
  - 37 are unverified. Most are new Forever NPCs with no Classic id: Zephras Isle trainers, Riverglades and Hyjal (beta zones), Master Mycologist Shurome, Kaylaena Springwhisper, William Pickman, Pa'zula, Angus Hammerhand, and the starter Herbalism and Skinning trainers Zor'la, Kagil and others.
  - Waldor (Barrens LW) differs from Classic by about 20 units, so he moved. Chaw Stronghide and Pyall Silentstride differ by about 3.5.
  - Annora is listed by the source as Badlands, but she is inside Uldaman.
- **Hooks: 25 of 39 verified.**
  - The 4 Merchant's Favor smoothie hooks use Aza'bek, a new Forever NPC. His name and coordinates come from WoW Forever DB, and pass 2 resolved him to npc 248198 (see below).
  - The 9 Alchemy recipe-drop hooks come from a Wowhead Forever spot-check. The recipe items are new in Forever, so they have no item ids.
  - Tasty Raptor Bites rests on a single report.
  - Every hook covers Cooking or Alchemy, from level 1 to 58.
- **Key crafts: 24 of 43 have item ids.** The rest are new Forever items, or items QuestieDB doesn't track, such as Legionite Glaive, Net-o-Matic and Veteran's Silvered Chain Helm.
- **Tips: 57 of 61 verified.** The unverified ones are:
  - Victory Rush, which isn't on public spell lists yet;
  - the Rogue Poised cost;
  - two gold-from-gathering opinions.
- **ClassProfessions `verified: false` for every class.** The pairs are sourced, but the `levels` windows in `levelingPlan` are our own planning estimates. They are bounded by the rank level gates and the material and zone bands from the source pages.
- **Gold bands: 9 of 16 verified.** The high-level zones are marked Classic-based or [Unconfirmed] by the source.

## Caveats and coverage gaps
1. Mob drops and spawns are Classic (QuestieDB) data. Blizzard says Forever re-examined loot, so drop rates and some drop tables may differ, and new Forever mobs aren't covered.
2. The WoW Forever DB NPC coordinates match QuestieDB to rounding (about 0.04), so they don't independently prove the NPCs haven't moved. Where Forever Guides /way values differ, that's flagged.
3. **Not covered yet:**
   - hooks for Leatherworking, Tailoring, Blacksmithing, Engineering, Enchanting and First Aid. Forever recipe vendor lists exist on Forever Guides and WoW Forever DB for those professions; this is the next pass;
   - hooks in the new zones (Riverglades, Shen'dralas, Hyjal, Zephras Isle);
   - Merchant's Favor recipe rewards by faction standing;
   - item ids for new Forever items.
4. Level-60 crafting picks are "not yet published" on Forever Guides. Our endgame pairs come from the WoW Forever DB tier lists, which are rated on Classic market data adjusted for Forever.
5. The Raptor Egg used by Tasty Raptor Bites drops in Classic data only outside the Barrens (Wetlands, STV, Arathi), so its Forever source is unknown.

## Pass 2 (21 Nov 2026, Bucharest time)

### New sources
- **QuestieDB v1.1.3 Forever data** from project-forever PR #5 (`content/questie-db/`, Forever map frames). It supplied the ids for Forever-new NPCs, mob spawns, the 149 "Crafting" quests, and the coordinate audit.
- **[Icy Veins WoW Forever DB](https://db.icy-veins.com/wow-forever/)** (client data, robots.txt allows all crawlers). We fetched single NPC, quest and search pages to get vendor stock with item ids and prices, writ rewards, and a third position check.
- **[Zephras](https://zephras.com/forever/enUS/)** (in-game sightings from players, crawlers welcome). Used for zone NPC pins and Aza'bek.
- **WoW Forever DB pages** already in `raw/`: profession leveling pages (which recipe each Horde vendor sells and which mobs drop it) and the Herbalism and Mining route pages (Forever node spawns for each zone).
- No Wowhead bulk fetching.

### What changed
- **Hooks: 39 → 296.** The 257 new hooks break down as:
  - 149 Craftsman's Writs;
  - 34 gathering windows: 16 Herbalism, 10 Mining, 8 Skinning;
  - 31 recipes sold by Horde vendors;
  - 15 recipe drops from a single source;
  - 12 trainer hooks in the new zones;
  - 10 mob-drop hooks for cloth and anti-venom;
  - 6 First Aid healing potions.
- **Non-writ hooks by profession:** Herbalism 17, Tailoring 15, First Aid 15, Engineering 12, Mining 12, Enchanting 10, Skinning 9, Leatherworking 8, Blacksmithing 6, Cooking 3, Fishing 1.
- **New zones:**
  - Zephras Isle: 6 hooks (trainers and a herb window).
  - Riverglades: 10 hooks (Gur'dok BS, Melbin Powderfuse goblin engineering, Grungle mining, Gorg cooking, Krix fishing, plus writ turn-ins).
  - Mount Hyjal: 2 hooks.
  - Shen'dralas: none. Neither DB lists any trainers or vendors there yet.
- **Craftsman's Writs (quests 94004–94355):** every writ is open to Horde (races 0 or the Horde mask). Each hook gives:
  - the quest id and the writ item id;
  - the item to deliver and its profession and learn skill (from the WoW Forever DB recipes);
  - the customer NPC with coordinates (118 have one; the other 31 have no turn-in point in QuestieDB);
  - the reward: 75, 125 or 200 reputation with Durotar Supply and Logistics for Journeyman (44), Expert (60) and Artisan (45) writs.

  All writs are `verified:false`, because these are forever:true quests not checked in game. 9 writ items are missing from the WoW Forever DB recipe lists, so their profession comes from Classic and their skill is unknown.
- **Forever-new NPC ids:** 36 of the 37 unverified trainers were resolved by name and zone in the PR #5 DB.
  - All 36 agree with Forever Guides /way and Icy Veins to within 0.5 units, so they are now verified.
  - Waldor's Forever Guides /way turned out to be a rare extra spawn. QuestieDB and 9 of 10 Icy Veins spawns put him in the cave above Wailing Caverns, so we moved him there.
  - Annora stays unverified: she is inside Uldaman and has no spawn data.
  - 7 trainers were added from the new zones (unverified: their ranks and caps aren't documented).
  - Aza'bek = npc 248198. The 4 smoothie hooks now carry `npc`, and their recipe item ids are 249885–249888.
  - The 9 Forever Alchemy recipe-drop hooks now have item ids from Icy Veins (250368–250988).
  - Key crafts with item ids: 24 → 40 of 43. Still missing: Net-o-Matic Projector, The Persuader.
- **Coordinate audit (Vulkan review):** every record with an NPC or mob id was compared with the nearest PR #5 spawn in the same zone. **12 corrections:**
  - 4 trainers, all in Mulgore and all in the Classic frame: Twizwick 58.65,39.38; Yonn 44.97,61.4; Vira 46.08,63.96; Uthan 44.16,63.8.
  - 2 hook NPCs: hook-34 and hook-39.
  - 6 mob spawns: the hook-03 kodos 2972–2974 to 56.72,30.39; hook-21 Monstrous Crawler; and the mob spawns of hook-34 and hook-39.

  No record had to be set to unverified. Every hook NPC and trainer id exists in the DB. Chaw Stronghide and Pyall Silentstride are verified. Thuwd's duplicate Leatherworking row was removed (Kamari 5811 stays). The log is in `raw/coord_audit_log.json`.
- **Verified counts:**
  - hooks 116 of 296: 29 of 39 from pass 1, and 87 of the 108 new hooks that aren't writs;
  - trainers 148 of 156;
  - tips 57 of 61 (unchanged).

### Validation
`build/validate.mjs` validates against the **origin/main** schema, using Ajv2020 the same way as `web/src/data/routeSchema.test.ts`. It checks:
- `ClassProfessionsFile`;
- `TipsMatrixFile`;
- all 296 `ProfessionHook` objects;
- the main `example.json` RoutePack with all 296 hooks attached to one step.

**Result: 0 errors.** A cross-check with Python `jsonschema` (Draft 2020-12) also gives 0 errors.

### Still open
- Several Craftsman's Writ turn-in NPCs stand in Alliance or contested areas (QuestieDB doesn't flag them Horde-friendly). The issues field flags them.
- 3 vendor recipes (Gem-studded Leather Belt from Rikqiz, Sylvan Shoulders from Mishta, Minor Recombobulator from Gagsprocket) are missing from Icy Veins vendor stock, so they stay unverified. They are probably limited-supply or changed.
- Thick and Rugged Leather, Mageweave and Runecloth spots are Classic picks, so they are unverified.
- Mob drop rates are not published for Forever.

Rebuild order: `build/trainers_pass2.py`, then `build/hooks2.py`, then `build/audit_coords.py`, then `node build/validate.mjs` (needs `ajv`).
