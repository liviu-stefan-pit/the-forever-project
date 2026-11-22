# Horde 1–20 route (Nova) — WoW Forever

**What WoW Forever is:** Blizzard's permanent "Classic+" branch, launched 4 Nov 2026. It is the vanilla
world with new and revamped quests (Blizzard said up to 1,000), new zones, 9 new dungeons, 2 raids, the
Skyborne race, new race/class combos (for example Orc Mage, Troll Warlock, Undead Paladin), and a level cap
that stays at 60. Sources: [GameSpot](https://www.gamespot.com/articles/wow-forever-will-add-all-new-content-to-classic-azeroth-this-november/),
[Blizzard](https://news.blizzard.com/en-us/article/24317866/purchase-world-of-warcraft-forever-upgrades-and-begin-your-next-journey-in-azeroth).

**Data basis:**
- Classic-era quests: id, givers, turn-ins and coordinates from QuestieDB (`verified: true` where nothing else is open).
- Forever-new quests: ids, givers, objectives and coordinates from the QuestieDB **v1.1.3 Forever release** in
  Godfather's PR #5 (`content/questie-db/`), not the raw `data/Forever` at 9cf27d6 (that one is the Classic DB with
  remapped coordinates and no new quests). Every step that uses one is `verified: false` and tagged "New in Forever"
  until someone checks it in game.
- **`forever: true` and the 76k–87k ids:** the ≥ 90000 ids are new Forever quests with new NPCs. PR #5 head 2e40dbf adds
  `foreverConfidence` / `foreverEvidence` and shows that Forever reuses Season of Discovery ids, so the 76k–87k ids
  are real Forever content too. `tools/extract_forever.py` keeps a quest that is either named by a WoW Forever web
  source (wowfdb.com / hardcorehelper.com, `catalog/forever_web_allowlist.json`) or rated high confidence with Wowhead
  Forever evidence; ids below 90000 must be high confidence. Quests 79953 and 81951 (Undercity books, low confidence)
  are excluded everywhere. Result: `catalog/forever_quests_1_20.json`, 132 quests (levels ≤ 23).
- **Coordinates:** all pins and goto points use the Forever map frame (Mulgore was redrawn in Forever, so Classic
  coordinates there are off by up to ~10 points). `tools/check_coords.py` compares all 595 NPC, mob, object and goto
  coordinates in `v2/` with the PR #5 v1.1.3 data and flags any delta over 2 map points. `build_v2.py` runs it with
  `--fix`. Last run: 1 fixed (Taillasher Eggs, Durotar), 0 left.

## Route order

| Levels | Orc / Troll | Tauren | Undead |
|---|---|---|---|
| 1–6 | Valley of Trials | Camp Narache | Deathknell |
| 6–10 | Sen'jin Village → Razor Hill (Tiragarde Keep, Kolkar Crag) | Bloodhoof Village | Brill |
| 10–12/13 | Echo Isles, Razormane Grounds, Thunder Ridge, Drygulch, Orgrimmar, Skull Rock | Venture Co. mine, Windfury, Red Rocks, Thunder Bluff | Agamand Mills, Garren's Haunt, Undercity |
| 12–13 | Far Watch Post (Conscript of the Horde) | run east to the Crossroads (Journey to the Crossroads) | balanced: south into Silverpine, then the longer 11–15 line; speedrun: zeppelin UC → Orgrimmar → Crossroads. Silverpine still has its own shorter speedrun line if that pack is opened |
| 13–16 | Crossroads loops: Razormane camp NE, Forgotten Pools NW, Ratchet + Southsea camp | same | same |
| 16–18 | Sludge Fen / Samophlange, harpies NW, Stagnant + Lushwater oases, Echeyakee | same | same |
| 18–20 | Kolkar camps (Regthar), Scytheclaw nests, Camp Taurajo | same | same |
| 20 | hand off to the 20–30 route (Stonetalon / Ashenvale) | | |

**Forever quests in both routes** (all `verified: false`): Wayward Weapons, Glyphic Parchment (Orc Mage), Tainted Tablet
(Troll Warlock), Legging It, Fizsprocket's Notes, Hides for the Forsaken and the Undead Paladin chain (A Difficult Path,
Rediscovering the Light, Coming to Terms, Continue Your Training).

**Balanced** adds the other Forever side quests (For Honor, This Fruit Could Bite Back, Lost in the Shadows,
Bloodtalon Matriarch, Forgotten Loa Idols, A Pain in the Neck, A Missing Hand + Threat from Below, A Simmering Storm +
Stormy Potential; Grace of An'she and Mu'sha, Chakuyak, Sparring Match, Kyle's Gone Missing!, The Longwalkers escort,
the Longwalker Malah chain to Drive Them Out / The High Chieftain, Ceasing Operations (elite); A Light in the Darkness,
Discipline, Patience, Sticks and Bones, Seeking Refuge escort, The Argent Emissary → The Cult of the Damned + Remnants of
War; Barrens: Parts and Pieces, Vrang Wildgore's Bruised Pride and Lion Hides + Vrang's Game, The Hermit Tanner →
Trouble in the Valley → Unwelcome Guests), the
Hidden Enemies chain, Lost But Not Forgotten, A Sacred Burial, the Wizzlecrank escort and the Forever elites
(Bruuz, Chol'aruk, Wrongly Blamed) at 20–23.

**Balanced and Speedrun are filters on the same packs**, not two copies of the route. A step lists `routes`. Both paces see a step tagged with both; a pace-only step is hidden on the other pace.

**What Speedrun skips** (balanced-only on the packs): Lazy Peons 5441 and its follow-up Thazz'ril's Pick 6394, Ukor's Lost Pack 96876, The Family Crypt 408, At War With The Scarlet Crusade (Captain Melrache) 372, and A Husband's Revenge 530. Since the 22 Nov 2026 research pass also: the Thunder Ridge quests (This Is Spinal Axe 96874, Beasts of Thunder Ridge 96875: crafted items; Halikor's Hoof 96877: level 12 elite), Rear Guard Patrol 99156 (Riptear, level 13 elite) and Stalk With The Earthmother 76156/76160/76240 (three trips back out of Thunder Bluff).

**Both paces** keep the starter bag quests, The Great Outdoors where it is routed (Durotar 96604, Mulgore 96605, Zephras 96101; Tirisfal does not route 96607), Miner's Fortune 896 turned in once at Barrens n=94, and Raptor Horns plus Parts and Pieces (97253).

**Hearths:** Razor Hill (Innkeeper Grosk), Bloodhoof (Innkeeper Kauth), Brill (Innkeeper Renee), the Sepulcher (Innkeeper Bates), and Valanaar on Zephras Isle (Donaal Downbreeze). The Barrens hearth stays at the Crossroads (Innkeeper Boorand Plainswind). Do not rebind at Camp Taurajo before the hearth step `barrens-12-20:134`.

**Skyborne** skips the green Crossroads starter chain: Plainstrider Menace 844 and its follow-ups through Ishamuhale 882, plus the 20–40 Enraged Thunder Lizards 907 and Cry of the Thunderhawk 913. Forgotten Pools 870 stays on for Skyborne. The skip is a race filter (`Skyborne` not), not a pace filter.

**Speedrun and Silverpine:** the Tirisfal travel fork is still there. `tirisfal-1-12:118` (zeppelin from the Undercity to Orgrimmar, then the Crossroads) is Speedrun only, and `:119` (south into Silverpine) is Balanced only, so Speedrun is not a strict subset of Balanced there. `silverpine-11-15` itself is no longer empty on Speedrun: 72 of 124 steps are on that pace (53 shared, 19 speedrun-only), against 105 on Balanced. The old "0 speedrun steps" note is out of date.

**Dungeons are opt-in.** The profile switch is "Include dungeons", default off. The solo route does not require them. When it is on, each dungeon is run once: Ragefire Chasm after `barrens-12-20:061`, Ruins of Lordaeron after `barrens-12-20:100`, Wailing Caverns after `barrens-12-20:135` (band 17–24). The same dungeon is not run again at 20–40; the later anchor stays in the plan and is not spliced when the 1–20 step exists. With dungeons off, the open-world steps still reach 20.

## Step counts (route-v2 packs in `v2/`, counted from each step's `routes` on the current JSON)

Balanced = steps tagged `balanced` (including both). Speedrun = steps tagged `speedrun` (including both). Unverified = `verified` is not true.

| Pack | Steps | Balanced | Speedrun | Unverified |
|---|---|---|---|---|
| durotar-1-12 | 177 | 175 | 122 | 51 |
| mulgore-1-12 | 158 | 157 | 117 | 55 |
| tirisfal-1-12 | 171 | 169 | 137 | 48 |
| silverpine-11-15 | 124 | 105 | 72 | 28 |
| barrens-12-20 | 165 | 165 | 133 | 39 |
| zephras-isle | 257 | 257 | 230 | 199 |

## Profession hooks (all vendors and drop sources checked in QuestieDB)
Scorpid Surprise (Grimtak, Razor Hill), Crispy Bat Wing (Abigail Shiel, Brill), Roasted Kodo Meat (Wunna Darkmane,
Bloodhoof), Strider Stew and Crispy Lizard Tail (Tari'qa, Crossroads), Hot Lion Chops (Zargh, Crossroads),
Deviate Scale patterns (Kalldan Felmoon, WC; drop list not checked). Sentinel's `profession_hooks.json` (sentinel/professions 464b42a) is merged in by zone and level band; their item replaces ours when both cover the same item. Forever profession tips at the level-6 trainer step (skin-once, camp at 20, vendor price cuts: verified on WarcraftMaps; First Aid potions and first-rank-only starter trainers: unverified). Merchant's Favor: Dokimi at 50.1, 29.3 outside the Crossroads (Waylaid Crates). Forever: Galgar's quest now offers a gathering
starter book; Camping 101 quests per profession (givers unverified). Recipe skill levels are not stated on purpose.

## Travel fork in Tirisfal (intentional)
`tirisfal-1-12:118` (n=169, zeppelin from the Undercity to Orgrimmar, then the Crossroads) is Speedrun only, and `:119` (n=170, south into
Silverpine with Delivery to Silverpine Forest) is Balanced only. This is a deliberate travel fork, so in that spot Speedrun is not a strict subset of Balanced.

## Dungeons (opt-in)
There are no dungeon placeholder steps inside the 1–12 packs. Expansion reads `research/dungeons/integration-plan.json`. With "Include dungeons" on, the early runs are Ragefire Chasm after `barrens-12-20:061`, Ruins of Lordaeron after `barrens-12-20:100`, and Wailing Caverns after `barrens-12-20:135`. Default is off. The 20–40 run anchors are not spliced again when those early steps exist.

## Prerequisite order
Every accept comes after its prerequisite is turned in, on the same route and class scope (checked by `web/scripts/prereq-check.ts`).
Step ids are positional (`<pack>:<n>`), so steps after an insert or removal get new numbers.
- Exploring the Horde (93739) is off the route: it needs Welcome to Azeroth (95350), which is restricted to race bit 33 in content/questie-db (not Orc or Troll; most likely Skyborne).
- Warlocks do Ruzan's Vile Familiars (1485, then 1499) instead of 792, so they still unlock Burning Blade Medallion.
- In Silverpine, Ivar the Foul now needs the Forever chain Wild Eyes (91920) and Return to Quinn (Again) (91921) first.

## Gaps
- Silverpine (Sepulcher, north coast, 11–15) now routes Wild Eyes 91920 and Return to Quinn (Again) 91921 (Balanced) and Arugal's Folly 98298 (both paces).
  Stop the Spread 98299 and Watching the Roads 95981 are quest level 20 in QuestieDB (required level 9 / 10); check them in game.
- Balanced only, with elite or crafted-item tips: Threat from Below part 4 (Aggor the Young, level 11 elite), This Is Spinal Axe /
  Beasts of Thunder Ridge (crafted items), Halikor's Hoof (level 12 elite), Rear Guard Patrol 99156 (level 13 elite), Stalk With The Earthmother.
- Not routed: Ukor's Lost Pack, the Bandarion Keep chain for all classes (96899 and follow-ups, level 12) and the Undead Paladin chain
  Murlocs at the Gates 91285 → A Token of Good Faith 95803. All are in `catalog/forever_quests_1_20.json` for a later pass.
- Her Name Is Olgra 95774 (needs Lost in Battle 4921) is routed in 20–40, not here.
- Undercity Friend of the Library books are in the catalog but not routed (side trips).
- Undead Paladin A Second Home (needs 8) and A Lesson in Divinity (needs 12) sit where the worst-case sim is about 5.6 and 9.5–10.5.
  The step text says "At level 8 / 12"; they were not moved because moving them adds trips to Bandarion Keep.
- Orgrimmar / Thunder Bluff / Undercity Forever quests are not routed yet.
- Skyborne starts on `zephras-isle` (257 steps; Shaman Call of Fire 97243–97257 added, Hunter Taming the Beast 94007 dropped because it needs level 10). The pack ends at `zephras-isle:194` (n=257). A join from 95350 into the existing Mulgore route is still unverified.

## Rebuild
`tools/route_spec.py` (our route) → `python3 tools/build_route.py` (checks every quest id and name against the
QuestieDB catalog and the Forever catalog, writes `zones/`) → `python tools/build_v2.py contracts/route-v2.schema.json` (writes `v2/`,
snaps coordinates to PR #5 with `check_coords.py --fix`, validates). `python3 tools/check_coords.py` on its own exits 1 if any delta is over 2.

## Handoff to 20–40 (Lyra)
- **Hearth hand-in:** `barrens-12-20:135` (n=148) still turns in Harpy Lieutenants to Darsok Swiftdagger at the Crossroads (The Barrens 51.6, 30.9,
  uiMap 1413), right after hearthing to the Crossroads at `:134`. The hearth stays at the Crossroads; do not rebind at Camp Taurajo before that hearth.
  Barrens does not end on Harpy Lieutenants, and the 20–40 handoff does not start there. Both paces then finish Chen's Empty Keg (819/821), Samophlange (3921–3924), and Mura Runetotem (3301).
  The last step is `barrens-12-20:grind-to-20`: Stormsnouts south of Camp Taurajo until level 20 (mob 3240, both paces). Players already at 20 skip it.
  Flight paths already known at that handoff: Crossroads, Ratchet, Camp Taurajo.
- **Quest log at ~20:** Speedrun: empty. Balanced: Deviate Eradication (1487, only with dungeons on, Wailing Caverns). Orc/Troll
  balanced also carry Hidden Enemies (5728, Ragefire Chasm, dungeons on). Everything else from 1–20 is handed in.
