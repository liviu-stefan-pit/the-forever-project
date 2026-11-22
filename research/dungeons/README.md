# Horde dungeon quests, levels 15-60 (WoW: Forever)

Research for the guide's **dungeons on/off** toggle. The machine-readable data is in [`dungeons.json`](dungeons.json); this page is the readable summary.

## How this was built

Quest/NPC/object/item ids, levels, prerequisites, rewards and XP are read programmatically from the Questie Classic-era database pinned at commit e29dc411; NPC/object coordinates come from QuestieDB's Forever data (Questie/QuestieDB data/Forever, commit 9cf27d6), which converts Era positions to Forever's map bounds. Original Era coordinates are kept as eraX/eraY where they differ. Level ranges from Wowhead Classic zone pages. 'verified: true' means every field was present in that source; it does NOT mean confirmed on WoW: Forever live servers, which may change quests.

- 16 Classic dungeons, 346 Horde-available quests (295 verified, 51 unverified).
- 143 level-60 endgame chain quests (Dungeon Set 2, Lord Valthalak, Naxxramas attunement) are listed in `excludedEndgameQuests` only.
- Quests are picked automatically: the quest's QuestieDB zone is the dungeon, or its kill/collect objectives are inside the dungeon. Prerequisite quests outside the dungeon are added with `category: prerequisite`. Alliance-only, repeatable and Questie-blacklisted quests are dropped.
- `verified: false` means QuestieDB lacks a giver, a turn-in or coordinates for it (often item-started quests or NPCs without a spawn); check `verificationNotes`.
- `route.balanced` / `route.speedrun` and the one-line `route.why` are our judgement from the XP value, whether all objectives are inside the dungeon, and how long the prerequisite chain is. Role tips are our own writing.
- Coordinates are zone map percentages, the same as in-game `/way`.
- Classic steps are emitted in prerequisite order from QuestieDB `pre.single` (any one) / `pre.group` (all required): world lead-ins are accepted and turned in first, then remaining accepts, then the run, then turn-ins, then follow-ups. Forever dungeon quests get a turn-in step when QuestieDB provides a finisher NPC or object (`verified: false`); item-started drops from inside the dungeon are accepted after the run. Accepts are still ordered after their in-pack prerequisites. In-pack prerequisites are included on every route (balanced and speedrun) that a later pack quest needs them on.

## WoW: Forever findings

- Nine new five-player dungeons (levels 13-60) exist in WoW: Forever. (official: https://news.blizzard.com/en-us/article/24301455/explore-the-new-dungeons-of-world-of-warcraft-forever)
- Group Finder is a manual listing tool with a level-filtered dungeon list; no automatic queue or teleport, so players still travel to the entrance. (fan site, unofficial: https://howtovideogame.com/wow-forever-dungeon-finder/)
- Dungeon loot reworked: unique boss items are blue, hundreds of new drops, combined hit/crit stats, shared appearances for eligible looters. (fan site, unofficial: https://wowforevertierlist.com/dungeons/classic)
- Reported XP change: dungeon quests give about 50% less bonus XP, and kills inside dungeons give more (+20% to +50% reported across beta hotfixes). (fan site, unofficial: https://warcraftmaps.com/guides/classic-vs-forever-dungeons)
- Shadowfang Keep: Fenrus summons Voidwalkers at 50% health, Nandos summons worgs, and Arugal's table book gives the Black Tome that leads to a secret boss in City of Dalaran. (fan site, unofficial: https://wowclassicforever.info/dungeons/)
- Maraudon hotfix (Nov 6): Zaetar's Spirit now spawns correctly after Princess Theradras dies. (fan site, unofficial: https://wowclassicforever.info/dungeons/)
- Blizzard has published no official level table for the Classic dungeons in Forever; ranges here are Classic ranges from Wowhead. (fan site, unofficial: https://wowforevertierlist.com/dungeons/classic)

- WoW: Forever is Blizzard's official Classic+ (launched November 2026) with 1,000+ new quests, new zones (Mount Hyjal, Shen'dralas, the Riverglades, Zephras Isle) and nine new dungeons. (official: https://news.blizzard.com/en-us/article/24315643/return-to-azeroth-in-world-of-warcraft-forever)
- Classic dungeon quests here are verified against Classic Era data only. Fan sites report Forever lowered many dungeon quest rewards to Uncommon and halved dungeon-quest bonus XP, so rewards and XP may differ in game.
- QuestieDB v1.1.3 Forever data is imported in content/questie-db/ (Questie/QuestieDB release v1.1.3, commit 8b8df2d, artifact sha256 98201b11…624d). It includes 1,112 Forever-new Horde and neutral quests (1,110 high confidence, 2 low: 79953 and 81951, which are never used here). Forever dungeon quests in this file are matched to those ids by name, then checked against level, giver and zone or dungeon. Coordinates are Forever-frame zone map percents from that import. Every Forever quest stays verified: false until it is checked in game. (https://github.com/Questie/QuestieDB/releases/tag/v1.1.3)

### New Forever dungeons (all `verified: false`)

The nine new dungeons have stable id slugs (used as `tags.dungeonId` in the dungeons pack): `ruins-of-lordaeron`, `city-of-dalaran`, `excavation-site-wetlands`, `the-drowned-city`, `kroldok-stronghold`, `alcaz-prison`, `blackmaw-hold`, `shapers-terrace`, `hall-of-thanes`.
- 49 Horde quests across the nine dungeons, all with imported QuestieDB v1.1.3 ids; 47 have `foreverConfidence` from that import.
- Level ranges and locations are official (Blizzard). Quest ids, giver and turn-in NPC ids, and Forever-frame coordinates are taken from `content/questie-db` when the name plus level, giver and zone or dungeon agree.
- Every Forever quest stays `verified: false` until it is checked in game. Quests 79953 and 81951 are never used.

#### Ruins of Lordaeron (`ruins-of-lordaeron`, levels 15-20), Ruins above the Undercity, Tirisfal Glades

- Entrance: Undercity (reported) 66.0, 11.0 (reported). Horde access: Easy: from the Undercity.

- **Light's Justice** `92421` [high]: Morbin Lightbane, Undercity 58.08, 89.51. Collect 25 Intact Limbs within The Ruins of Lordaeron for Morbin Lightbane in the Undercity.
- **The New Plague** `95216` [high]: Theodore Griffs, Undercity 46.31, 71.91. Collect the Highly Toxic Strain from Witherfang in Ruins of Lordaeron for Theodore Griffs in Undercity. Needs: A Recipe for Death chain (Apothecary Renferrel, The Sepulcher).
- **The Wrath of Rath'mael** `92422` [high]: Deathguard Kristof, Tirisfal Glades 65.25, 60.2. Kill Rath'mael in the Ruins of Lordaeron for Deathguard Kristof in Brill. Needs: Breadcrumb from Deathguard Linnea (reported).
- **A Frightened Request** `92401` [high]: Tabitha Heartweaver, Silverpine Forest 44.52, 43.02. Investigate the disappearance of Edward Heartweaver in the Ruins of Lordaeron.
- **Unending Torment** `97288` [high]: Abominable Head, None. Deliver the Abominable Head to Master Apothecary Faranell within the Undercity.
- **Crest of Lordaeron** `95204` [high]: Crest of Lordaeron, None. Bring the Crest of Lordaeron to Oran Snakewrithe in Undercity.

#### City of Dalaran (`city-of-dalaran`, levels 28-33), Alterac Mountains

- Entrance: Alterac Mountains 8.0, 61.0 (reported). Horde access: Attunement: Dalaran Sewer Key from the Image of Archmage Modera after the Tarren Mill chain.

- **Prison Break In** `544`: Magus Wordeen Voidglare, Hillsbrad Foothills 61.6, 20.85. Find the traitors and recover their artifacts, then return to Magus Voidglare in Tarren Mill.
- **Key to the City** `93680` [high]: Magus Wordeen Voidglare, Hillsbrad Foothills 61.6, 20.85. Acquire the Dalaran Sewer Key for Magus Wordeen Voidglare in Tarren Mill.
- **Dalaran Patrols** `545`: Magus Wordeen Voidglare, Hillsbrad Foothills 61.6, 20.85. Kill 6 Dalaran Summoners and 12 Elemental Slaves, then return to Magus Voidglare in Tarren Mill. Needs: Prison Break In, Key to the City.
- **Blood in the Streets** `92434` [high]: Magus Wordeen Voidglare, Hillsbrad Foothills 61.6, 20.85. Find a way into Dalaran along the Lordamere Lake. Needs: Dalaran Patrols.
- **Heart of Disruption** `96984` [high]: Image of Archmage Modera, Silverpine Forest 68.6, 45.1. Collect the Arcane Mote in the City of Dalaran for Magus Wordeen Voidglare in Tarren Mill. Needs: Blood in the Streets.
- **Source of Power** `96988` [high]: Doctor Martin Felben, Undercity 46.61, 74.09. Collect 6 Cracked Sentry Cores in the City of Dalaran for Doctor Martin Felben in Undercity.
- **The Grave Knight** `96986` [high]: Melisara, Hillsbrad Foothills 62.63, 20.65. Defeat Atrexis the Grave Knight in the City of Dalaran for Melisara in Tarren Mill.
- **Opportunistic Education** `96987` [high]: Rexxie Copperclutch, City of Dalaran (inside entrance). Collect the Founding of Dalaran from the City of Dalaran for Rexxie Copperclutch near the sewer entrance.

#### Excavation Site: Wetlands (`excavation-site-wetlands`, levels 24-29), Above Whelgar's Excavation, Wetlands

- Entrance: Wetlands 53.4, 65.3 (reported). Horde access: Long trek: Hillsbrad -> Arathi Highlands -> Thandol Span.

- **Changing Tastes** `95697` [high]: Borstan, Orgrimmar 57.2, 53.32. Enter the Excavation Sites in the Wetlands and bring back Thicket Raptor Meat.
- **Dragonmaw Rumors** `95663` [high]: Zaruk, Arathi Highlands 74.54, 35.64. Travel to the Wetlands and meet the Deathstalker Agent in the hills above the Dragonmaw camp.
- **Open the Maw** `95682` [high]: Deathstalker Agent, None. Slay the Dragonmaw forces within the Excavation Site and return to the Deathstalker Agent outside with anything you recover. Needs: Dragonmaw Rumors (Zaruk, Hammerfall 74.4, 35.6).
- **Elder Knowledge** `95664` [high]: Titan Relic, None. Take the Titan Relic to the Elder Rise in Thunder Bluff and look for someone who can tell you more about it.
- **Earthen Echo** `98823` [high]: Bashana Runetotem, Thunder Bluff 71.06, 34.19. Bring the Titan Relic to Muln Earthfury at the Skywatcher Plateau in northwest Mulgore. Needs: Elder Knowledge.

#### The Drowned City (`the-drowned-city`, levels 35-40), Off the coast of Stranglethorn Vale, west of Grom'gol

- Entrance: Stranglethorn Vale (underwater, reported) 21.0, 28.0 (reported). Horde access: Fly or zeppelin to Grom'gol, swim west and dive.

- **The Drowned City** `95775` [high]: Kin'weelay, Stranglethorn Vale 32.27, 27.71. Use the hide and charcoal to create rubbings of the tablets found in the Drowned City. Needs: The Vile Reef, The Gurubashi Legends of Old, Locating the Lost City.
- **The Only Good Brinescale...** `95776` [high]: Commander Aggro'gosh, Stranglethorn Vale 32.17, 28.9. Slay Var'Taka in the Drowned City. Needs: Enemies in the Water, Locating the Lost City.
- **Ancient Gurubashi Idol** `96774` [high]: Mazu'kon, Mulgore 32.5, 20.66. Recover an Ancient Gurubashi Idol from the Drowned City.
- **Shady Saltseers** `95789` [high]: Krazek, Stranglethorn Vale 26.95, 77.21. Collect 10 Voodoo Infused Artifacts from Saltseer pirates in the Drowned City.
- **The Saltseer Captain** `95791` [high]: Krazek, Stranglethorn Vale 26.95, 77.21. Slay 3 Saltseer Coroners and Captain Dreadrise in the Drowned City.

#### Krol'dok Stronghold (`kroldok-stronghold`, levels 40-45), Riverglades

- Entrance: Riverglades 37.5, 37.5 (reported). Horde access: Fly to Rog'mar; long Riverglades chain unlocks most quests.

- **A Token of Vengeance** `94975` [high]: Da'grosh, Riverglades 33.47, 37.93. Collect 15 Cultist Ears from the Twilight's Hammer in Krol'dok Stronghold. Needs: Bring Me His Head (wowhead forever quest 94768).
- **Eye of Mugg** `94968` [high]: Krom'rosh, Riverglades 59.37, 45.6. Infiltrate Krol'dok Stronghold and return to Krom'rosh with proof of their leader's demise. Needs: The Wayward Warrior chain (wowhead forever quest 94744), It Is Time, Brother....
- **Tome of Twilight** `94972` [high]: Tran'gul, Riverglades 59.51, 43.96. Recover the Tome of Twilight from Krol'dok Stronghold. Needs: It Is Time, Brother....
- **Krol'dok Moulding** `94973` [high]: Krol'dok Moulding, None. Find someone in Rog'mar who may know about the mould.
- **Key Ingredients** `94974` [high]: Kreza Darkthorn, Riverglades 59.92, 45.97. Bring 4 Thick Leather and 12 Iron Bar to Kreza Darkthorn.

#### Alcaz Prison (`alcaz-prison`, levels 48-53), Alcaz Island, Dustwallow Marsh

- Entrance: not published. Horde access: Breadcrumb from Eitrigg in Orgrimmar to Brackenwall Village.

- **The Missing Kor'kron** `95283` [high]: Eitrigg, Orgrimmar 34.28, 39.35. Speak with Nazeer Bloodspike in Brackenwall Village.
- **The Elite of the Elite** `95284` [high]: Nazeer Bloodpike, Dustwallow Marsh 35.21, 30.66. Find the missing Kor'kron Elites. Needs: The Missing Kor'kron.
- **Right Place, Wrong Time** `95285` [high]: Sergeant Ulka, Dustwallow Marsh 70.3, 18.85. Speak with Sergeant Ulka to learn more about the situation on Alcaz Isle.
- **No Orc Left Behind** `95309` [high]: Sergeant Ulka, Dustwallow Marsh 70.3, 18.85. Enter the Alcaz Prison and find Commander Folkar. Needs: The Elite of the Elite.
- **The Honor of the Kor'kron** `95454` [high]: None, None. Look for King Varian Wrynn in Alcaz Prison.
- **Bad News for Folkar** `96369` [high]: None, None. Report back to Commander Folkar.
- **Thrall Needs to Know** `95483` [high]: None, None. Bring word of Varian Wrynn's fate to Thrall in Orgrimmar.
- **A Little Payback** `96332` [high]: Sergeant Ulka, Dustwallow Marsh 70.3, 18.85. Enter the Alcaz Prison and slay 15 Strashasz Soldiers, 8 Strashaz Enchantresses, and bring the head of Tidemistress Ca'zass to Sergeant Ulka. Needs: The Elite of the Elite.
- **Blood Red Bandanas** `96334` [high]: Sergeant Ulka, Dustwallow Marsh 70.3, 18.85. Enter Alcaz Prison and collect 8 Blood Red Bandanas from the human guards there. Needs: The Elite of the Elite.
- **The Man in the Iron Chains** `96335` [high]: None, None. Recover the Alcaz Shackle Key from The Questioner in Alcaz Prison.

#### Blackmaw Hold (`blackmaw-hold`, levels 55-60), Azshara

- Entrance: not published. Horde access: Azshara; quests from Thunder Bluff, Mulgore and Azshara.

- **Get to the Roots of It** `92343` [high]: Nara Wildmane, Thunder Bluff 75.65, 31.61. Gather 10 Nordrassil Root Caps inside Blackmaw Hold for Nara Wildmane in Thunder Bluff.
- **Blackmaw Magic** `97198` [high]: Muln Earthfury, Mulgore 33.41, 22.59. Recover a Blackmaw Ritual Totem from Blackmaw Hold.
- **The Twin Bears** `92066` [high]: Lorekeeper Nok, Azshara 41.31, 20.1. Find the Totem of Ursoc and the Totem of Ursol inside Blackmaw Hold. Then, return them to Lorekeeper Nok at Ursolan.
- **Blackmaw Reclamation** `92065` [high]: Gatekeeper Rageroar, Azshara 42.28, 20.13. Bring Varrox Bleakhoof's Head to Gatekeeper Rageroar at Ursolan.
- **Blackmaw Pouches** `97327` [high]: Ekkal, Azshara 42.0, 38.88. Enter Blackmaw Hold and recover 5 Blackmaw Pouches for Ekkal at the Ruins of Eldarath in Azshara.
- **The Reliquary of Tyr** `99187` [high]: Knight of Mourning, Tirisfal Glades 17.58, 67.6. Travel to Blackmaw Hold in Kalimdor, and recover the Reliquary of Tyr.

#### Shaper's Terrace (`shapers-terrace`, levels 58-60), Northern hills of Un'Goro Crater

- Entrance: Un'Goro Crater 48.1, 6.1 (reported). Horde access: Bring Un'Goro power crystals for the consoles inside (Blizzard).

- **Crystalline Elements** `95928` [high]: Mayena Earthseeker, Mulgore 34.97, 22.08. Bring Mayena Earthseeker a Moist Crystal, a Charged Crystal, a Noxious Crystal and a Fiery Crystal from Shaper's Terrace.
- **Essence of Seeping Slimes** `97049` [high]: Chemist Fuely, Undercity 47.45, 73.35. Gather 8 Seeping Slime Essence in the Shaper's Terrace.
- **The Dark Crystal** `95926` [high]: Master Apothecary Faranell, Undercity 48.82, 69.28. Gather a colorless Drained Crystal Fragment near the Achromatic Crystal in the Shaper's Terrace.

#### Hall of Thanes (`hall-of-thanes`, levels 13-18), Beneath Ironforge, Dun Morogh

- Entrance: not published. Horde access: Hard: deep in Alliance territory (Blizzard). Low value for a Horde leveling route.

- **An Ancient Grudge** `96395` [high]: Ghostly Attendant, The Hall of Thanes. Put the spirit of Faldrim Anvilmar to rest and then return to the Ghostly Attendant in the Hall of Thanes.
- Excluded: **Important Heirlooms** `96403`. Excluded from Horde data because it is probably Alliance-only: quest 96403 is not in the QuestieDB v1.1.3 Horde+neutral import (content/questie-db/quests.json). NPC 265003 Thom Filch exists in Ironforge and references that quest.


## Dungeons

### Ragefire Chasm (levels 13-18)

- Entrance: Orgrimmar 52.6, 49.0
- Pick up quests: Orgrimmar (Cleft of Shadow / Valley of Wisdom givers), usually levels 13-16 between Durotar and the Barrens
- Tank: Pull troggs in pairs and let casters come to you around corners; Taragaman and Jergosh are the only real threats.
- Healer: Mana is the limit at this level; drink after every second pack and stand where the tank can line-of-sight casters to you.
- DPS: Kill shaman first; the whole run is a straight line, so skip side caves unless you still need satchel or quest drops.
- Dungeons off: Finish Durotar (Razor Hill, Echo Isles) and early Northern Barrens quests from the Crossroads instead; Barrens kill quests out-pace RFC solo.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Hidden Enemies](https://www.wowhead.com/classic/quest=5726) `5726` | 12 (9) | prerequisite | Thrall (Orgrimmar 31.7, 37.8) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Hidden Enemies](https://www.wowhead.com/classic/quest=5727) `5727` | 12 (9) | prerequisite | Thrall (Orgrimmar 31.7, 37.8) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Testing an Enemy's Strength](https://www.wowhead.com/classic/quest=5723) `5723` | 15 (9) | dungeon | Rahauro (Thunder Bluff 70.1, 29.5) | yes | no | Low XP for the effort (800 base at level 15); take it only if you pass the giver anyway. |
| [Searching for the Lost Satchel](https://www.wowhead.com/classic/quest=5722) `5722` | 16 (9) | dungeon | Rahauro (Thunder Bluff 70.1, 29.5) | yes | no | Low XP for the effort (880 base at level 16); take it only if you pass the giver anyway. |
| [Returning the Lost Satchel](https://www.wowhead.com/classic/quest=5724) `5724` | 16 (9) | dungeon | Maur Grimtotem (npc) | yes | yes | Done entirely inside the run and pays 1450 XP base, high for level 16. |
| [The Power to Destroy...](https://www.wowhead.com/classic/quest=5725) `5725` | 16 (9) | dungeon | Varimathras (Undercity 56.2, 92.2) | yes | yes | Done entirely inside the run and pays 1450 XP base, high for level 16. |
| [Hidden Enemies](https://www.wowhead.com/classic/quest=5728) `5728` | 16 (9) | dungeon | Thrall (Orgrimmar 31.7, 37.8) | yes | no | Low XP for the effort (1150 base at level 16); take it only if you pass the giver anyway. |
| [Slaying the Beast](https://www.wowhead.com/classic/quest=5761) `5761` | 16 (9) | dungeon | Neeru Fireblade (Orgrimmar 49.5, 50.6) | yes | yes | Kill the last boss you pass anyway; the giver is in Orgrimmar where you train. |

### Wailing Caverns (levels 17-24)

- Entrance: The Barrens 46.0, 36.5
- Pick up quests: Crossroads / Lushwater Oasis area of the Barrens and Thunder Bluff, levels 16-22
- Tank: Deviate mobs come in loose groups; pull back to the corridor so nothing aggros from the pools. Mark the lashers.
- Healer: Druids of the Fang cast Sleep and heal; ask for interrupts and keep a dispel ready.
- DPS: Collect Deviate Hides and Serpentbloom while moving; the four Fang leaders are spread out, so follow the outer ramp loop instead of jumping into the water.
- Dungeons off: Stay in the Barrens (Crossroads, Camp Taurajo chains) and go to Stonetalon Mountains around 18-22.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [The Forgotten Pools](https://www.wowhead.com/classic/quest=870) `870` | 13 (10) | prerequisite | Tonga Runetotem (The Barrens 52.3, 31.9) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Stagnant Oasis](https://www.wowhead.com/classic/quest=877) `877` | 16 (10) | prerequisite | Tonga Runetotem (The Barrens 52.3, 31.9) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Altered Beings](https://www.wowhead.com/classic/quest=880) `880` | 16 (10) | prerequisite | Tonga Runetotem (The Barrens 52.3, 31.9) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Hamuul Runetotem](https://www.wowhead.com/classic/quest=1489) `1489` | 16 (12) | dungeon | Tonga Runetotem (The Barrens 52.3, 31.9) | yes | yes | Two-minute breadcrumb that unlocks Leaders of the Fang. |
| [Nara Wildmane](https://www.wowhead.com/classic/quest=1490) `1490` | 16 (12) | dungeon | Arch Druid Hamuul Runetotem (Thunder Bluff 78.6, 28.6) | yes | yes | Breadcrumb in Thunder Bluff that unlocks Leaders of the Fang. |
| [Deviate Hides](https://www.wowhead.com/classic/quest=1486) `1486` | 17 (13) | dungeon | Nalpak (The Barrens 46.0, 35.7) | yes | yes | Done entirely inside the run and pays 1600 XP base, high for level 17. |
| [Raptor Horns](https://www.wowhead.com/classic/quest=865) `865` | 18 (13) | prerequisite | Mebok Mizzyrix (The Barrens 62.4, 37.6) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Trouble at the Docks](https://www.wowhead.com/classic/quest=959) `959` | 18 (14) | dungeon | Crane Operator Bigglefuzz (The Barrens 63.1, 37.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Serpentbloom](https://www.wowhead.com/classic/quest=962) `962` | 18 (14) | dungeon | Apothecary Zamah (Thunder Bluff 22.8, 20.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Smart Drinks](https://www.wowhead.com/classic/quest=1491) `1491` | 18 (13) | dungeon | Mebok Mizzyrix (The Barrens 62.4, 37.6) | yes | no | Low XP for the effort (1350 base at level 18); take it only if you pass the giver anyway. |
| [Deviate Eradication](https://www.wowhead.com/classic/quest=1487) `1487` | 21 (15) | dungeon | Ebru (The Barrens 46.0, 35.7) | yes | yes | Done entirely inside the run and pays 2050 XP base, high for level 21. |
| [Leaders of the Fang](https://www.wowhead.com/classic/quest=914) `914` | 22 (11) | dungeon | Nara Wildmane (Thunder Bluff 75.7, 31.6) | yes | yes | Main Wailing Caverns reward quest; the Nara Wildmane chain is short and the run ends at the last Fang leader anyway. |
| [The Glowing Shard](https://www.wowhead.com/classic/quest=6981) `6981` | 26 (15) | dungeon | Glowing Shard (item) | yes | yes | Done entirely inside the run and pays 2650 XP base, high for level 26. |

### Shadowfang Keep (levels 22-30)

- Entrance: Silverpine Forest 44.8, 67.8
- Pick up quests: The Sepulcher in Silverpine Forest, levels 20-25
- Tank: Courtyard and stair pulls are packed; use doorways to break line of sight. Fenrus and Nandos add summons in WoW Forever.
- Healer: Arugal's Void Bolt hurts; stay behind pillars to break line of sight on his teleports.
- DPS: Burn worgen packs fast; most groups skip optional side rooms because all three Horde quests are on the main path to Arugal.
- Dungeons off: Silverpine Forest and Hillsbrad Foothills (Tarren Mill) quest hubs cover the same 20-30 band.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Deathstalkers in Shadowfang](https://www.wowhead.com/classic/quest=1098) `1098` | 25 (18) | dungeon | High Executor Hadrec (Silverpine Forest 43.4, 40.9) | yes | yes | Free XP on the main path through SFK. |
| [The Book of Ur](https://www.wowhead.com/classic/quest=1013) `1013` | 26 (16) | dungeon | Keeper Bel'dugur (Undercity 53.7, 54.5) | yes | no | Needs the Book of Ur from the library side room and a trip to Undercity; fine on a relaxed route. |
| [Arugal Must Die](https://www.wowhead.com/classic/quest=1014) `1014` | 27 (18) | dungeon | Dalar Dawnweaver (Silverpine Forest 44.2, 39.8) | yes | yes | Biggest XP quest in Shadowfang Keep; Arugal is the end of the run. |

### Blackfathom Deeps (levels 24-32)

- Entrance: Ashenvale 14.5, 14.2
- Pick up quests: Zoram'gar Outpost on the Ashenvale coast and Orgrimmar, levels 22-27
- Tank: Lots of swimming; pull murlocs and nagas out of the water so casters can't kite you.
- Healer: Bring breath and water-walking if you have it; Aku'mai and Lorgus Jett packs spike damage.
- DPS: Grab the Sapphires of Aku'Mai on the wall crystals early in the run for the Essence quest.
- Dungeons off: Ashenvale (Splintertree Post, Zoram'gar) and Stonetalon Mountains quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Trouble in the Deeps](https://www.wowhead.com/classic/quest=6562) `6562` | 22 (17) | dungeon | Tsunaman (Stonetalon Mountains 47.4, 64.2) | yes | no | Low XP for the effort (435 base at level 22); take it only if you pass the giver anyway. |
| [The Essence of Aku'Mai](https://www.wowhead.com/classic/quest=6563) `6563` | 22 (17) | dungeon | Je'neu Sancrea (Ashenvale 11.6, 34.3) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Allegiance to the Old Gods](https://www.wowhead.com/classic/quest=6564) `6564` | 22 (17) | dungeon | Damp Note (item) | yes | no | Low XP for the effort (1750 base at level 22); take it only if you pass the giver anyway. |
| [The Orb of Soran'ruk](https://www.wowhead.com/classic/quest=1740) `1740` [Warlock] | 25 (20) | dungeon | Doan Karhan (The Barrens 49.3, 57.2) | yes | yes | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [Allegiance to the Old Gods](https://www.wowhead.com/classic/quest=6565) `6565` | 26 (17) | dungeon | Je'neu Sancrea (Ashenvale 11.6, 34.3) | yes | yes | Done entirely inside the run and pays 2650 XP base, high for level 26. |
| [Blackfathom Villainy](https://www.wowhead.com/classic/quest=6561) `6561` | 27 (18) | dungeon | Argent Guard Thaelrid (npc) | yes | no | Low XP for the effort (1650 base at level 27); take it only if you pass the giver anyway. |
| [Amongst the Ruins](https://www.wowhead.com/classic/quest=6921) `6921` | 27 (21) | dungeon | Je'neu Sancrea (Ashenvale 11.6, 34.3) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |

### Razorfen Kraul (levels 32-42)

- Entrance: The Barrens 42.9, 90.2
- Pick up quests: Camp Taurajo / southern Barrens and Thunder Bluff, levels 25-30
- Tank: Quilboar casters and totems: kill totems first and use line of sight around the bramble walls.
- Healer: Charlga Razorflank heals herself and adds; keep mana for a long last fight.
- DPS: For Blueleaf Tubers, use the gopher from the Crate With Holes and the Snufflenose Command Stick; send it to dig while the group clears.
- Dungeons off: Thousand Needles and southern Barrens quests, then Hillsbrad Foothills.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Speak with Ruga](https://www.wowhead.com/classic/quest=1823) `1823` [Warrior] | 20 (20) | prerequisite | Sorek (Orgrimmar 80.4, 32.4) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Trial at the Field of Giants](https://www.wowhead.com/classic/quest=1824) `1824` [Warrior] | 20 (20) | prerequisite | Ruga Ragetotem (The Barrens 44.7, 59.4) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Speak with Thun'grim](https://www.wowhead.com/classic/quest=1825) `1825` [Warrior] | 20 (20) | prerequisite | Ruga Ragetotem (The Barrens 44.7, 59.4) | yes | no | Class quest (Warrior) — show only for that class; usually worth it for the reward. |
| [Blueleaf Tubers](https://www.wowhead.com/classic/quest=1221) `1221` | 26 (20) | dungeon | Mebok Mizzyrix (The Barrens 62.4, 37.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Willix the Importer](https://www.wowhead.com/classic/quest=1144) `1144` | 30 (23) | dungeon | Willix the Importer (npc) | yes | yes | Done entirely inside the run and pays 3050 XP base, high for level 30. |
| [Brutal Armor](https://www.wowhead.com/classic/quest=1838) `1838` [Warrior] | 30 (20) | dungeon | Thun'grim Firegaze (The Barrens 57.2, 30.3) | yes | yes | Class quest (Warrior) — show only for that class; usually worth it for the reward. |
| [Going, Going, Guano!](https://www.wowhead.com/classic/quest=1109) `1109` | 33 (30) | dungeon | Master Apothecary Faranell (Undercity 48.8, 69.3) | yes | yes | Done entirely inside the run and pays 3300 XP base, high for level 33. |
| [A Vengeful Fate](https://www.wowhead.com/classic/quest=1102) `1102` | 34 (29) | dungeon | Auld Stonespire (Thunder Bluff 36.0, 59.9) | yes | yes | Done entirely inside the run and pays 4050 XP base, high for level 34. |

### Scarlet Monastery (levels 26-45)

- Entrance: Tirisfal Glades 82.6, 33.8
- Pick up quests: Undercity and Tirisfal Glades (Brill area), levels 30-40
- Wings: Graveyard, Library, Armory, Cathedral
- Tank: Scarlet humanoids flee at low health; position packs so runners don't chain-pull the next room.
- Healer: Library and Armory caster pulls hurt; stand behind the tank's line-of-sight corners.
- DPS: Run Library for Compendium and Test of Lore, then Armory and Cathedral back to back; Graveyard is quick XP for Vorrel's Revenge.
- Dungeons off: Arathi Highlands (Hammerfall), Thousand Needles and Desolace quests cover levels 30-40.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Test of Faith](https://www.wowhead.com/classic/quest=1149) `1149` | 26 (25) | prerequisite | Dorn Plainstalker (Thousand Needles 54.0, 41.5) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Test of Endurance](https://www.wowhead.com/classic/quest=1150) `1150` | 30 (25) | prerequisite | Dorn Plainstalker (Thousand Needles 54.0, 41.5) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Test of Strength](https://www.wowhead.com/classic/quest=1151) `1151` | 30 (25) | prerequisite | Dorn Plainstalker (Thousand Needles 54.0, 41.5) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Test of Lore](https://www.wowhead.com/classic/quest=1152) `1152` | 30 (25) | prerequisite | Dorn Plainstalker (Thousand Needles 54.0, 41.5) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Test of Lore](https://www.wowhead.com/classic/quest=1154) `1154` | 30 (25) | prerequisite | Braug Dimspirit (Stonetalon Mountains 78.8, 45.7) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Test of Lore](https://www.wowhead.com/classic/quest=1159) `1159` | 30 (25) | prerequisite | Braug Dimspirit (Stonetalon Mountains 78.8, 45.7) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Test of Lore](https://www.wowhead.com/classic/quest=6627) `6627` | 30 (25) | prerequisite | Braug Dimspirit (Stonetalon Mountains 78.8, 45.7) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Vorrel's Revenge](https://www.wowhead.com/classic/quest=1051) `1051` (Graveyard) | 33 (25) | dungeon | Vorrel Sengutz (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Hearts of Zeal](https://www.wowhead.com/classic/quest=1113) `1113` (Graveyard/Library/Armory/Cathedral) | 33 (30) | dungeon | Master Apothecary Faranell (Undercity 48.8, 69.3) | yes | yes | Done entirely inside the run and pays 3300 XP base, high for level 33. |
| [Test of Lore](https://www.wowhead.com/classic/quest=1160) `1160` (Library) | 36 (25) | dungeon | Parqual Fintallas (Undercity 57.8, 65.4) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Compendium of the Fallen](https://www.wowhead.com/classic/quest=1049) `1049` (Library) | 38 (28) | dungeon | Sage Truthseeker (Thunder Bluff 34.4, 46.9) | yes | yes | Library boss quest with a strong reward; worth it if you set Thunder Bluff hearth or pass through. |
| [Into The Scarlet Monastery](https://www.wowhead.com/classic/quest=1048) `1048` (Library/Armory/Cathedral) | 42 (33) | dungeon | Varimathras (Undercity 56.2, 92.2) | yes | yes | Done entirely inside the run and pays 5150 XP base, high for level 42. |

### Razorfen Downs (levels 35-45)

- Entrance: The Barrens 49.0, 93.9
- Pick up quests: Thunder Bluff, Undercity and the Barrens/Thousand Needles border, levels 34-40
- Tank: The gong event spawns waves: stack them on one corner where the healer can see you.
- Healer: Undead casters silence; spread slightly and save mana for the Tuten'kash waves.
- DPS: Burn the idol-ritual adds quickly on Extinguishing the Idol; the escort must survive.
- Dungeons off: Desolace, Dustwallow Marsh and Stranglethorn Vale quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [A Host of Evil](https://www.wowhead.com/classic/quest=6626) `6626` | 35 (28) | dungeon | Myriam Moonsinger (The Barrens 49.0, 94.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [An Unholy Alliance](https://www.wowhead.com/classic/quest=6521) `6521` | 36 (28) | dungeon | Varimathras (Undercity 56.2, 92.2) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [An Unholy Alliance](https://www.wowhead.com/classic/quest=6522) `6522` | 36 (28) | dungeon | Small Scroll (item) | yes | yes | Done entirely inside the run and pays 3500 XP base, high for level 36. |
| [Scourge of the Downs](https://www.wowhead.com/classic/quest=3523) `3523` | 37 (32) | dungeon | Belnistrasz (npc) | yes | no | Low XP for the effort (285 base at level 37); take it only if you pass the giver anyway. |
| [Extinguishing the Idol](https://www.wowhead.com/classic/quest=3525) `3525` | 37 (32) | dungeon | Belnistrasz (npc) | yes | yes | Done entirely inside the run and pays 4250 XP base, high for level 37. |
| [Bring the End](https://www.wowhead.com/classic/quest=3341) `3341` | 42 (37) | dungeon | Andrew Brownell (Undercity 74.0, 33.3) | yes | yes | Done entirely inside the run and pays 4300 XP base, high for level 42. |

### Uldaman (levels 42-52)

- Entrance: Badlands 44.6, 12.1; Badlands 65.2, 43.5
- Pick up quests: Kargath in the Badlands, levels 38-45
- Tank: Troggs and dwarves come in mixed packs; earth elementals hit hard, pull them separately.
- Healer: Archaedas activates guardians in waves; position by the entrance so you can see the whole room.
- DPS: Collect Power Stones and Shattered Necklace pieces from the trogg area before descending.
- Dungeons off: Badlands, Swamp of Sorrows and Stranglethorn Vale quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Power Stones](https://www.wowhead.com/classic/quest=2418) `2418` | 36 (30) | dungeon | Rigglefuzz (Badlands 42.4, 52.9) | yes | yes | Done entirely inside the run and pays 3500 XP base, high for level 36. |
| [Solution to Doom](https://www.wowhead.com/classic/quest=709) `709` | 40 (30) | dungeon | Theldurin the Lost (Badlands 51.4, 76.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Return to the Marsh](https://www.wowhead.com/classic/quest=1953) `1953` [Mage] | 40 (35) | prerequisite | Anastasia Hartwell (Undercity 85.1, 10.0) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Infernal Orb](https://www.wowhead.com/classic/quest=1954) `1954` [Mage] | 40 (35) | prerequisite | Tabetha (Dustwallow Marsh 46.1, 57.1) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Exorcism](https://www.wowhead.com/classic/quest=1955) `1955` [Mage] | 40 (35) | prerequisite | Tabetha (Dustwallow Marsh 46.1, 57.1) | yes | no | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [Power in Uldaman](https://www.wowhead.com/classic/quest=1956) `1956` [Mage] | 40 (35) | dungeon | Tabetha (Dustwallow Marsh 46.1, 57.1) | yes | yes | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [Necklace Recovery](https://www.wowhead.com/classic/quest=2283) `2283` | 41 (37) | dungeon | Dran Droffers (Orgrimmar 59.5, 36.6) | yes | no | Low XP for the effort (2450 base at level 41); take it only if you pass the giver anyway. |
| [Necklace Recovery, Take 2](https://www.wowhead.com/classic/quest=2284) `2284` | 41 (37) | dungeon | Dran Droffers (Orgrimmar 59.5, 36.6) | yes | no | Low XP for the effort (2450 base at level 41); take it only if you pass the giver anyway. |
| [Uldaman Reagent Run](https://www.wowhead.com/classic/quest=2202) `2202` | 42 (36) | dungeon | Jarkal Mossmeld (Badlands 2.4, 46.1) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Translating the Journal](https://www.wowhead.com/classic/quest=2318) `2318` | 42 (37) | dungeon | Remains of a Paladin (npc) | yes | no | Low XP for the effort (860 base at level 42); take it only if you pass the giver anyway. |
| [Translating the Journal](https://www.wowhead.com/classic/quest=2338) `2338` | 42 (37) | dungeon | Jarkal Mossmeld (Badlands 2.4, 46.1) | yes | no | Low XP for the effort (345 base at level 42); take it only if you pass the giver anyway. |
| [Reclaimed Treasures](https://www.wowhead.com/classic/quest=2342) `2342` | 43 (33) | dungeon | Patrick Garrett (Undercity 62.3, 48.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Find the Gems and Power Source](https://www.wowhead.com/classic/quest=2339) `2339` | 44 (37) | dungeon | Jarkal Mossmeld (Badlands 2.4, 46.1) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Deliver the Gems](https://www.wowhead.com/classic/quest=2340) `2340` | 44 (37) | dungeon | Jarkal Mossmeld (Badlands 2.4, 46.1) | yes | no | Low XP for the effort (1850 base at level 44); take it only if you pass the giver anyway. |
| [Necklace Recovery, Take 3](https://www.wowhead.com/classic/quest=2341) `2341` | 44 (40) | dungeon | Dran Droffers (Orgrimmar 59.5, 36.6) | yes | yes | Done entirely inside the run and pays 5600 XP base, high for level 44. |
| [Wild Leather Armor](https://www.wowhead.com/classic/quest=2854) `2854` | 45 (30) | prerequisite | Jangdor Swiftstrider (Feralas 74.4, 42.9) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Wild Leather Shoulders](https://www.wowhead.com/classic/quest=2855) `2855` | 45 (30) | dungeon | Jangdor Swiftstrider (Feralas 74.4, 42.9) | yes | no | Low XP for the effort (2900 base at level 45); take it only if you pass the giver anyway. |
| [The Platinum Discs](https://www.wowhead.com/classic/quest=2278) `2278` | 47 (40) | dungeon | The Discs of Norgannon (object) | yes | yes | Done entirely inside the run and pays 4200 XP base, high for level 47. |
| [The Platinum Discs](https://www.wowhead.com/classic/quest=2280) `2280` | 47 (40) | dungeon | The Discs of Norgannon (object) | yes | yes | Done entirely inside the run and pays 5250 XP base, high for level 47. |

### Zul'Farrak (levels 44-54)

- Entrance: Tanaris 38.7, 20.1
- Pick up quests: Gadgetzan and Steamwheedle Port in Tanaris, levels 42-47
- Tank: The pyramid stair event pulls the whole troll army; hold the top of the stairs and pick up adds as they arrive.
- Healer: Stay at the top of the stairs during the event; sandfury shaman packs need interrupts.
- DPS: Use the Mallet of Zul'Farrak at the gong for Gahz'rilla; collect Scarab Shells as you clear.
- Dungeons off: Tanaris, Feralas and The Hinterlands quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Venom Bottles](https://www.wowhead.com/classic/quest=2933) `2933` | 43 (40) | prerequisite | Venom Bottle (The Hinterlands 23.5, 58.8) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Screecher Spirits](https://www.wowhead.com/classic/quest=3520) `3520` | 44 (40) | prerequisite | Yeh'kinya (Tanaris 67.0, 22.4) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Tran'rek](https://www.wowhead.com/classic/quest=2864) `2864` | 45 (40) | dungeon | Krazek (Stranglethorn Vale 26.9, 77.2) | yes | no | Low XP for the effort (390 base at level 45); take it only if you pass the giver anyway. |
| [Scarab Shells](https://www.wowhead.com/classic/quest=2865) `2865` | 45 (40) | dungeon | Tran'rek (Tanaris 51.6, 26.8) | yes | yes | Done entirely inside the run and pays 3900 XP base, high for level 45. |
| [Undamaged Venom Sac](https://www.wowhead.com/classic/quest=2934) `2934` | 45 (40) | prerequisite | Apothecary Lydon (Hillsbrad Foothills 61.4, 19.1) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Consult Master Gadrin](https://www.wowhead.com/classic/quest=2935) `2935` | 45 (40) | prerequisite | Apothecary Lydon (Hillsbrad Foothills 61.4, 19.1) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Spider God](https://www.wowhead.com/classic/quest=2936) `2936` | 45 (40) | dungeon | Master Gadrin (Durotar 56.0, 74.7) | yes | yes | Done entirely inside the run and pays 4850 XP base, high for level 45. |
| [Troll Temper](https://www.wowhead.com/classic/quest=3042) `3042` | 45 (40) | dungeon | Trenton Lighthammer (Tanaris 51.4, 28.8) | yes | yes | Done entirely inside the run and pays 3900 XP base, high for level 45. |
| [Tiara of the Deep](https://www.wowhead.com/classic/quest=2846) `2846` | 46 (40) | dungeon | Tabetha (Dustwallow Marsh 46.1, 57.1) | yes | yes | Done entirely inside the run and pays 6050 XP base, high for level 46. |
| [Tabetha's Task](https://www.wowhead.com/classic/quest=2861) `2861` | 46 (40) | dungeon | Ursyn Ghull (Thunder Bluff 25.7, 14.2) | yes | no | Low XP for the effort (405 base at level 46); take it only if you pass the giver anyway. |
| [Divino-matic Rod](https://www.wowhead.com/classic/quest=2768) `2768` | 47 (40) | dungeon | Chief Engineer Bilgewhizzle (Tanaris 52.5, 28.5) | yes | yes | Done entirely inside the run and pays 6300 XP base, high for level 47. |
| [The Prophecy of Mosh'aru](https://www.wowhead.com/classic/quest=3527) `3527` | 47 (40) | dungeon | Yeh'kinya (Tanaris 67.0, 22.4) | yes | yes | Done entirely inside the run and pays 5250 XP base, high for level 47. |
| [Gahz'rilla](https://www.wowhead.com/classic/quest=2770) `2770` | 50 (40) | dungeon | Wizzle Brassbolts (Thousand Needles 78.1, 77.1) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |

### Maraudon (levels 45-52)

- Entrance: Desolace 29.1, 62.5
- Pick up quests: Shadowprey Village in Desolace and the Maraudon entrance area, levels 44-50
- Wings: Orange (Vyletongue), Purple, Inner (Princess Theradras)
- Tank: Kill elementals and satyrs at corners; on the waterfall side, pull slowly.
- Healer: Princess Theradras knocks back; keep tank and healer near walls.
- DPS: Use the Celebras scepter chain to unlock the shortcut to the inner side on later runs.
- Dungeons off: Feralas (Camp Mojache), Tanaris and Azshara quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Shadowshard Fragments](https://www.wowhead.com/classic/quest=7068) `7068` | 42 (38) | dungeon | Uthel'nay (Orgrimmar 39.2, 86.3) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Twisted Evils](https://www.wowhead.com/classic/quest=7028) `7028` (Inner) | 47 (41) | dungeon | Willow (Desolace 62.2, 39.6) | yes | yes | Done entirely inside the run and pays 5250 XP base, high for level 47. |
| [Vyletongue Corruption](https://www.wowhead.com/classic/quest=7029) `7029` | 47 (41) | dungeon | Vark Battlescar (Desolace 23.2, 70.3) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Pariah's Instructions](https://www.wowhead.com/classic/quest=7067) `7067` | 48 (39) | dungeon | Centaur Pariah (Desolace 50.4, 86.7) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Legends of Maraudon](https://www.wowhead.com/classic/quest=7044) `7044` (Orange/Purple (outer)) ⚠ | 49 (41) | dungeon | Cavindra (Desolace 32.1, 64.0) | yes | no | Low XP for the effort (3400 base at level 49); take it only if you pass the giver anyway. |
| [The Scepter of Celebras](https://www.wowhead.com/classic/quest=7046) `7046` ⚠ | 49 (41) | dungeon | Celebras the Redeemed (npc) | yes | yes | Done entirely inside the run and pays 5700 XP base, high for level 49. |
| [Corruption of Earth and Seed](https://www.wowhead.com/classic/quest=7064) `7064` (Inner) | 51 (45) | dungeon | Selendra (Desolace 26.9, 77.7) | yes | yes | Done entirely inside the run and pays 6100 XP base, high for level 51. |
| [Seed of Life](https://www.wowhead.com/classic/quest=7066) `7066` ⚠ | 51 (45) | dungeon | Zaetar's Spirit (npc) | yes | yes | Done entirely inside the run and pays 6100 XP base, high for level 51. |

### Sunken Temple (Temple of Atal'Hakkar) (levels 50-60)

- Entrance: Swamp of Sorrows 69.9, 53.5
- Pick up quests: Stonard (Swamp of Sorrows), Un'Goro Crater and Orgrimmar, levels 48-52
- Tank: The balcony troll ring must be cleared in order to unlock Jammal'an; mark each statue troll.
- Healer: Dragonkin breathe fire; avoid the front of drakes and keep cooldowns for the Eranikus shade.
- DPS: Pick up the Atal'ai Haunts and class quest items as you go; most quests finish on the bottom floor.
- Dungeons off: Felwood, Un'Goro Crater and Azshara quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Return to Fel'Zerul](https://www.wowhead.com/classic/quest=1444) `1444` | 44 (38) | prerequisite | Atal'ai Exile (The Hinterlands 33.8, 75.2) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Temple of Atal'Hakkar](https://www.wowhead.com/classic/quest=1445) `1445` | 50 (38) | dungeon | Fel'zerul (Swamp of Sorrows 47.9, 54.8) | yes | yes | Done entirely inside the run and pays 5900 XP base, high for level 50. |
| [The Ancient Egg](https://www.wowhead.com/classic/quest=4787) `4787` | 50 (40) | prerequisite | Yeh'kinya (Tanaris 67.0, 22.4) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Elemental Mastery](https://www.wowhead.com/classic/quest=8410) `8410` [Shaman] | 50 (50) | prerequisite | Haromm (Swamp of Sorrows 48.2, 57.9) | yes | no | Class quest (Shaman) — show only for that class; usually worth it for the reward. |
| [The Sunken Temple](https://www.wowhead.com/classic/quest=3380) `3380` | 51 (46) | dungeon | Witch Doctor Uzer'i (Feralas 74.4, 43.4) | yes | no | Low XP for the effort (3650 base at level 51); take it only if you pass the giver anyway. |
| [The Stone Circle](https://www.wowhead.com/classic/quest=3444) `3444` | 51 (46) | prerequisite | Marvon Rivetseeker (Tanaris 52.7, 45.9) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Into the Depths](https://www.wowhead.com/classic/quest=3446) `3446` | 51 (46) | dungeon | Marvon Rivetseeker (Tanaris 52.7, 45.9) | yes | yes | Done entirely inside the run and pays 4900 XP base, high for level 51. |
| [Secret of the Circle](https://www.wowhead.com/classic/quest=3447) `3447` | 51 (46) | dungeon | Marvon Rivetseeker (Tanaris 52.7, 45.9) | yes | yes | Done entirely inside the run and pays 6100 XP base, high for level 51. |
| [Zapper Fuel](https://www.wowhead.com/classic/quest=4146) `4146` | 52 (47) | dungeon | Liv Rizzlefix (The Barrens 62.5, 38.7) | yes | yes | Done entirely inside the run and pays 5100 XP base, high for level 52. |
| [Marvon's Workshop](https://www.wowhead.com/classic/quest=4147) `4147` | 52 (47) | prerequisite | Larion (Un'Goro Crater 45.5, 8.7) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Hunter's Charm](https://www.wowhead.com/classic/quest=8151) `8151` [Hunter] | 52 (50) | prerequisite | Kary Thunderhorn (Thunder Bluff 58.5, 88.3) | yes | no | Class quest (Hunter) — show only for that class; usually worth it for the reward. |
| [Courser Antlers](https://www.wowhead.com/classic/quest=8153) `8153` [Hunter] | 52 (50) | prerequisite | Ogtinc (Azshara 42.4, 42.6) | yes | yes | Class quest (Hunter) — show only for that class; usually worth it for the reward. |
| [Wavethrashing](https://www.wowhead.com/classic/quest=8231) `8231` [Hunter] | 52 (50) | prerequisite | Ogtinc (Azshara 42.4, 42.6) | yes | yes | Class quest (Hunter) — show only for that class; usually worth it for the reward. |
| [The Green Drake](https://www.wowhead.com/classic/quest=8232) `8232` [Hunter] | 52 (50) | dungeon | Ogtinc (Azshara 42.4, 42.6) | yes | yes | Class quest (Hunter) — show only for that class; usually worth it for the reward. |
| [A Simple Request](https://www.wowhead.com/classic/quest=8233) `8233` [Rogue] | 52 (50) | prerequisite | Ormok (Orgrimmar 43.9, 54.6) | yes | no | Class quest (Rogue) — show only for that class; usually worth it for the reward. |
| [Sealed Azure Bag](https://www.wowhead.com/classic/quest=8234) `8234` [Rogue] | 52 (50) | prerequisite | Lord Jorach Ravenholdt (Alterac Mountains 86.0, 78.9) | yes | yes | Class quest (Rogue) — show only for that class; usually worth it for the reward. |
| [Encoded Fragments](https://www.wowhead.com/classic/quest=8235) `8235` [Rogue] | 52 (50) | prerequisite | Archmage Xylem (Azshara 29.2, 40.2) | yes | yes | Class quest (Rogue) — show only for that class; usually worth it for the reward. |
| [The Azure Key](https://www.wowhead.com/classic/quest=8236) `8236` [Rogue] | 52 (50) | dungeon | Archmage Xylem (Azshara 29.2, 40.2) | yes | yes | Class quest (Rogue) — show only for that class; usually worth it for the reward. |
| [Magecraft](https://www.wowhead.com/classic/quest=8250) `8250` [Mage] | 52 (50) | prerequisite | Thurston Xane (Thunder Bluff 25.2, 21.0) | yes | no | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [Magic Dust](https://www.wowhead.com/classic/quest=8251) `8251` [Mage] | 52 (50) | prerequisite | Archmage Xylem (Azshara 29.2, 40.2) | yes | yes | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [The Siren's Coral](https://www.wowhead.com/classic/quest=8252) `8252` [Mage] | 52 (50) | prerequisite | Archmage Xylem (Azshara 29.2, 40.2) | yes | yes | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [Destroy Morphaz](https://www.wowhead.com/classic/quest=8253) `8253` [Mage] | 52 (50) | dungeon | Archmage Xylem (Azshara 29.2, 40.2) | yes | yes | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [Cenarion Aid](https://www.wowhead.com/classic/quest=8254) `8254` [Priest] | 52 (50) | prerequisite | Malakai Cross (Thunder Bluff 24.6, 22.6) | yes | no | Class quest (Priest) — show only for that class; usually worth it for the reward. |
| [Of Coursers We Know](https://www.wowhead.com/classic/quest=8255) `8255` [Priest] | 52 (50) | prerequisite | Ogtinc (Azshara 42.4, 42.6) | yes | yes | Class quest (Priest) — show only for that class; usually worth it for the reward. |
| [The Ichor of Undeath](https://www.wowhead.com/classic/quest=8256) `8256` [Priest] | 52 (50) | prerequisite | Ogtinc (Azshara 42.4, 42.6) | yes | yes | Class quest (Priest) — show only for that class; usually worth it for the reward. |
| [Blood of Morphaz](https://www.wowhead.com/classic/quest=8257) `8257` [Priest] | 52 (50) | dungeon | Ogtinc (Azshara 42.4, 42.6) | yes | yes | Class quest (Priest) — show only for that class; usually worth it for the reward. |
| [Spirit Totem](https://www.wowhead.com/classic/quest=8412) `8412` [Shaman] | 52 (50) | prerequisite | Bath'rah the Windwatcher (Alterac Mountains 80.5, 66.9) | yes | yes | Class quest (Shaman) — show only for that class; usually worth it for the reward. |
| [Da Voodoo](https://www.wowhead.com/classic/quest=8413) `8413` [Shaman] | 52 (50) | dungeon | Bath'rah the Windwatcher (Alterac Mountains 80.5, 66.9) | yes | yes | Class quest (Shaman) — show only for that class; usually worth it for the reward. |
| [An Imp's Request](https://www.wowhead.com/classic/quest=8419) `8419` [Warlock] | 52 (50) | prerequisite | Kartosh (Swamp of Sorrows 48.6, 55.6) | yes | no | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [Hot and Itchy](https://www.wowhead.com/classic/quest=8420) `8420` [Warlock] | 52 (50) | prerequisite | Impsy (Felwood 41.4, 45.0) | yes | no | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [The Wrong Stuff](https://www.wowhead.com/classic/quest=8421) `8421` [Warlock] | 52 (50) | prerequisite | Impsy (Felwood 41.4, 45.0) | yes | yes | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [Trolls of a Feather](https://www.wowhead.com/classic/quest=8422) `8422` [Warlock] | 52 (50) | dungeon | Impsy (Felwood 41.4, 45.0) | yes | yes | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [Warrior Kinship](https://www.wowhead.com/classic/quest=8423) `8423` [Warrior] | 52 (50) | prerequisite | Fallen Hero of the Horde (Swamp of Sorrows 34.3, 66.1) | yes | yes | Class quest (Warrior) — show only for that class; usually worth it for the reward. |
| [War on the Shadowsworn](https://www.wowhead.com/classic/quest=8424) `8424` [Warrior] | 52 (50) | prerequisite | Fallen Hero of the Horde (Swamp of Sorrows 34.3, 66.1) | yes | yes | Class quest (Warrior) — show only for that class; usually worth it for the reward. |
| [Voodoo Feathers](https://www.wowhead.com/classic/quest=8425) `8425` [Warrior] | 52 (50) | dungeon | Fallen Hero of the Horde (Swamp of Sorrows 34.3, 66.1) | yes | yes | Class quest (Warrior) — show only for that class; usually worth it for the reward. |
| [Jammal'an the Prophet](https://www.wowhead.com/classic/quest=1446) `1446` | 53 (38) | dungeon | Atal'ai Exile (The Hinterlands 33.8, 75.2) | yes | yes | Done entirely inside the run and pays 6550 XP base, high for level 53. |
| [The God Hakkar](https://www.wowhead.com/classic/quest=3528) `3528` | 53 (40) | dungeon | Yeh'kinya (Tanaris 67.0, 22.4) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Essence of Eranikus](https://www.wowhead.com/classic/quest=3373) `3373` | 55 (48) | dungeon | Essence of Eranikus (item) | yes | no | Low XP for the effort (2800 base at level 55); take it only if you pass the giver anyway. |
| [Eranikus, Tyrant of the Dream](https://www.wowhead.com/classic/quest=8733) `8733` ⚠ | 60 (60) | endgame | Malfurion Stormrage (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |

### Blackrock Depths (levels 52-60)

- Entrance: Searing Gorge 34.8, 85.3; Burning Steppes 29.4, 38.3
- Pick up quests: Kargath (Badlands), Flame Crest (Burning Steppes) and Thorium Point (Searing Gorge), levels 50-56
- Tank: BRD is huge: decide the route (prison, Ring of Law, Lyceum, Emperor) before you enter and avoid patrolling golems.
- Healer: Fire resistance helps for Lord Incendius and the Lyceum; drink during the Ring of Law arena reset.
- DPS: Grab Commander Gor'shak and the Ring of Law early; the Kharan Mighthammer and Princess Moira chain is the big XP step.
- Dungeons off: Burning Steppes, Western Plaguelands, Eastern Plaguelands and Winterspring quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Forging the Shaft](https://www.wowhead.com/classic/quest=3443) `3443` | 48 (40) | prerequisite | Kalaran Windblade (Searing Gorge 39.1, 39.0) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Flame's Casing](https://www.wowhead.com/classic/quest=3452) `3452` | 50 (40) | prerequisite | Kalaran Windblade (Searing Gorge 39.1, 39.0) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Torch of Retribution](https://www.wowhead.com/classic/quest=3453) `3453` | 50 (40) | prerequisite | Kalaran Windblade (Searing Gorge 39.1, 39.0) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Torch of Retribution](https://www.wowhead.com/classic/quest=3454) `3454` | 50 (40) | prerequisite | Kalaran Windblade (Searing Gorge 39.1, 39.0) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Squire Maltrake](https://www.wowhead.com/classic/quest=3462) `3462` | 50 (40) | prerequisite | Kalaran Windblade (Searing Gorge 39.1, 39.0) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Trinkets...](https://www.wowhead.com/classic/quest=3481) `3481` | 50 (40) | prerequisite | Hoard of the Black Dragonflight (Searing Gorge 38.9, 39.0) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Set Them Ablaze!](https://www.wowhead.com/classic/quest=3463) `3463` | 52 (40) | prerequisite | Squire Maltrake (Searing Gorge 39.2, 39) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Dark Iron Legacy](https://www.wowhead.com/classic/quest=3801) `3801` ⚠ | 52 (48) | dungeon | Franclorn Forgewright (npc) | yes | no | Low XP for the effort (510 base at level 52); take it only if you pass the giver anyway. |
| [Dark Iron Legacy](https://www.wowhead.com/classic/quest=3802) `3802` ⚠ | 52 (48) | dungeon | Franclorn Forgewright (npc) | yes | yes | Done entirely inside the run and pays 5100 XP base, high for level 52. |
| [Disharmony of Flame](https://www.wowhead.com/classic/quest=3906) `3906` | 52 (48) | prerequisite | Thunderheart (Badlands 3.3, 48.3) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Commander Gor'shak](https://www.wowhead.com/classic/quest=3981) `3981` | 52 (48) | dungeon | Galamav the Marksman (Badlands 6.0, 47.7) | yes | yes | Done entirely inside the run and pays 5100 XP base, high for level 52. |
| [KILL ON SIGHT: Dark Iron Dwarves](https://www.wowhead.com/classic/quest=4081) `4081` | 52 (48) | dungeon | WANTED (Badlands 3.7, 47.4) | yes | yes | Done entirely inside the run and pays 5100 XP base, high for level 52. |
| [Ribbly Screwspigot](https://www.wowhead.com/classic/quest=4136) `4136` | 53 (48) | dungeon | Yuka Screwspigot (Burning Steppes 66.1, 21.9) | yes | no | Low XP for the effort (2650 base at level 53); take it only if you pass the giver anyway. |
| [Yuka Screwspigot](https://www.wowhead.com/classic/quest=4324) `4324` | 53 (48) | dungeon | Yorba Screwspigot (Tanaris 67.0, 24.0) | yes | no | Low XP for the effort (2650 base at level 53); take it only if you pass the giver anyway. |
| [What Is Going On?](https://www.wowhead.com/classic/quest=3982) `3982` | 54 (48) | prerequisite | Commander Gor'shak (npc) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [What Is Going On?](https://www.wowhead.com/classic/quest=4001) `4001` | 54 (48) | dungeon | Commander Gor'shak (npc) | yes | no | Low XP for the effort (540 base at level 54); take it only if you pass the giver anyway. |
| [The Eastern Kingdom](https://www.wowhead.com/classic/quest=4002) `4002` | 54 (48) | dungeon | Thrall (Orgrimmar 31.7, 37.8) | yes | no | No XP data in the source; treat as optional. |
| [A Taste of Flame](https://www.wowhead.com/classic/quest=4022) `4022` | 54 (52) | prerequisite | Cyrus Therepentous (Burning Steppes 95.1, 31.6) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [A Taste of Flame](https://www.wowhead.com/classic/quest=4023) `4023` | 54 (52) | prerequisite | Cyrus Therepentous (Burning Steppes 95.1, 31.6) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Rise of the Machines](https://www.wowhead.com/classic/quest=4061) `4061` | 54 (52) | prerequisite | Hierophant Theodora Mulvadania (Badlands 3.0, 47.8) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Rise of the Machines](https://www.wowhead.com/classic/quest=4062) `4062` | 54 (52) | prerequisite | Hierophant Theodora Mulvadania (Badlands 3.0, 47.8) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [KILL ON SIGHT: High Ranking Dark Iron Officials](https://www.wowhead.com/classic/quest=4082) `4082` | 54 (50) | dungeon | KILL ON SIGHT (Badlands 3.9, 46.7) | yes | yes | Done entirely inside the run and pays 5450 XP base, high for level 54. |
| [The Love Potion](https://www.wowhead.com/classic/quest=4201) `4201` | 54 (50) | dungeon | Mistress Nagmara (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Last Element](https://www.wowhead.com/classic/quest=7201) `7201` | 54 (48) | dungeon | Shadowmage Vivian Lagrave (Badlands 2.9, 47.8) | yes | yes | Done entirely inside the run and pays 5450 XP base, high for level 54. |
| [The Spectral Chalice](https://www.wowhead.com/classic/quest=4083) `4083` | 55 (40) | dungeon | Spectral Chalice (object) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Heart of the Mountain](https://www.wowhead.com/classic/quest=4123) `4123` | 55 (50) | dungeon | Maxwort Uberglint (Burning Steppes 65.2, 23.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Vivian Lagrave](https://www.wowhead.com/classic/quest=4133) `4133` | 55 (50) | dungeon | Apothecary Zinge (Undercity 50.1, 68.0) | yes | no | Low XP for the effort (560 base at level 55); take it only if you pass the giver anyway. |
| [Lost Thunderbrew Recipe](https://www.wowhead.com/classic/quest=4134) `4134` | 55 (50) | dungeon | Shadowmage Vivian Lagrave (Badlands 2.9, 47.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Disharmony of Fire](https://www.wowhead.com/classic/quest=3907) `3907` | 56 (48) | dungeon | Thunderheart (Badlands 3.3, 48.3) | yes | yes | Done entirely inside the run and pays 7300 XP base, high for level 56. |
| [A Taste of Flame](https://www.wowhead.com/classic/quest=4024) `4024` | 58 (52) | dungeon | Cyrus Therepentous (Burning Steppes 95.1, 31.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Rise of the Machines](https://www.wowhead.com/classic/quest=4063) `4063` | 58 (52) | dungeon | Lotwil Veriatus (Badlands 25.9, 44.9) | yes | yes | Done entirely inside the run and pays 6200 XP base, high for level 58. |
| [Precarious Predicament](https://www.wowhead.com/classic/quest=4121) `4121` | 58 (52) | dungeon | Grark Lorkrub (Burning Steppes 40.2, 34.2) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Grark Lorkrub](https://www.wowhead.com/classic/quest=4122) `4122` | 58 (52) | dungeon | Lexlort (Badlands 5.9, 47.6) | yes | yes | Done entirely inside the run and pays 6200 XP base, high for level 58. |
| [Operation: Death to Angerforge](https://www.wowhead.com/classic/quest=4132) `4132` | 58 (52) | dungeon | Warlord Goretooth (Badlands 5.8, 47.5) | yes | yes | Done entirely inside the run and pays 7750 XP base, high for level 58. |
| [Mor'zul Bloodbringer](https://www.wowhead.com/classic/quest=7562) `7562` [Warlock] | 58 (60) | prerequisite | Kurgul (Orgrimmar 47.5, 46.7) | yes | no | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [Rage of Blood](https://www.wowhead.com/classic/quest=7563) `7563` [Warlock] | 58 (60) | prerequisite | Mor'zul Bloodbringer (Burning Steppes 12.7, 31.6) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Wildeyes](https://www.wowhead.com/classic/quest=7564) `7564` [Warlock] | 58 (60) | prerequisite | Mor'zul Bloodbringer (Burning Steppes 12.7, 31.6) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Royal Rescue](https://www.wowhead.com/classic/quest=4003) `4003` | 59 (48) | dungeon | Thrall (Orgrimmar 31.7, 37.8) | yes | yes | Done entirely inside the run and pays 8050 XP base, high for level 59. |
| [The Princess Saved?](https://www.wowhead.com/classic/quest=4004) `4004` | 60 (48) | dungeon | Princess Moira Bronzebeard (npc) | yes | yes | Done entirely inside the run and pays 9950 XP base, high for level 60. |
| [Binding the Dreadnaught](https://www.wowhead.com/classic/quest=9131) `9131` | 60 (55) | dungeon | Korfax, Champion of the Light (Eastern Plaguelands 72.0, 48.5) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Wheel of the Black March](https://www.wowhead.com/classic/quest=7627) `7627` [Warlock] | 60 (60) | endgame | Mor'zul Bloodbringer (Burning Steppes 12.7, 31.6) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Proof of Life](https://www.wowhead.com/classic/quest=8946) `8946` ⚠ | 60 (58) | endgame | Ysida Harmon (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Three Kings of Flame](https://www.wowhead.com/classic/quest=8961) `8961` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Challenge](https://www.wowhead.com/classic/quest=9015) `9015` | 60 (58) | endgame | Falrin Treeshaper (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Bodley's Unfortunate Fate](https://www.wowhead.com/classic/quest=9032) `9032` ⚠ | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |

### Blackrock Spire (Lower and Upper) (levels 55-60)

- Entrance: Searing Gorge 34.8, 85.3; Burning Steppes 29.4, 38.3
- Pick up quests: Flame Crest (Burning Steppes), Orgrimmar and Un'Goro Crater, levels 55-60
- Wings: Lower Blackrock Spire, Upper Blackrock Spire (Seal of Ascension key, endgame)
- Tank: Pull orc packs to the corridors; the spider and orc rooms near Halycon need careful line-of-sight pulls.
- Healer: LBRS is long; plan breaks after each big room.
- DPS: Kill Highlord Omokk, Voone and Wyrmthalak in one run to finish most Horde LBRS quests at once.
- Dungeons off: Eastern Plaguelands, Western Plaguelands, Silithus and Winterspring quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Return to Tinkee](https://www.wowhead.com/classic/quest=4810) `4810` | 54 (50) | prerequisite | Felnok Steelspring (Winterspring 61.6, 38.6) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Poisoned Water](https://www.wowhead.com/classic/quest=6804) `6804` | 56 (55) | prerequisite | Duke Hydraxis (Azshara 79.3, 73.7) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Stormers and Rumblers](https://www.wowhead.com/classic/quest=6805) `6805` | 57 (55) | prerequisite | Duke Hydraxis (Azshara 79.3, 73.7) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Final Tablets](https://www.wowhead.com/classic/quest=4788) `4788` | 58 (40) | dungeon | Prospector Ironboot (Tanaris 66.9, 24.0) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Lost Tablets of Mosh'aru](https://www.wowhead.com/classic/quest=5065) `5065` | 58 (40) | prerequisite | Prospector Ironboot (Tanaris 66.9, 24.0) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Pack Mistress](https://www.wowhead.com/classic/quest=4724) `4724` (Lower Blackrock Spire) | 59 (55) | dungeon | Galamav the Marksman (Badlands 6.0, 47.7) | yes | yes | Done entirely inside the run and pays 6400 XP base, high for level 59. |
| [Kibler's Exotic Pets](https://www.wowhead.com/classic/quest=4729) `4729` | 59 (55) | dungeon | Kibler (Burning Steppes 65.9, 21.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [En-Ay-Es-Tee-Why](https://www.wowhead.com/classic/quest=4862) `4862` | 59 (55) | dungeon | Kibler (Burning Steppes 65.9, 21.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Operative Bijou](https://www.wowhead.com/classic/quest=4981) `4981` | 59 (55) | dungeon | Lexlort (Badlands 5.9, 47.6) | yes | yes | Done entirely inside the run and pays 6400 XP base, high for level 59. |
| [Bijou's Belongings](https://www.wowhead.com/classic/quest=4982) `4982` (Lower Blackrock Spire) | 59 (55) | dungeon | Bijou (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Bijou's Reconnaissance Report](https://www.wowhead.com/classic/quest=4983) `4983` | 59 (55) | dungeon | Bijou (npc) | yes | yes | Done entirely inside the run and pays 6400 XP base, high for level 59. |
| [Egg Freezing](https://www.wowhead.com/classic/quest=4734) `4734` | 60 (57) | dungeon | Tinkee Steamboil (Burning Steppes 65.2, 24) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [Egg Collection](https://www.wowhead.com/classic/quest=4735) `4735` | 60 (57) | dungeon | Tinkee Steamboil (Burning Steppes 65.2, 24) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Seal of Ascension](https://www.wowhead.com/classic/quest=4742) `4742` (Lower Blackrock Spire) ⚠ | 60 (57) | dungeon | Vaelan (npc) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [Seal of Ascension](https://www.wowhead.com/classic/quest=4743) `4743` ⚠ | 60 (57) | dungeon | Vaelan (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Darkstone Tablet](https://www.wowhead.com/classic/quest=4768) `4768` | 60 (57) | dungeon | Shadowmage Vivian Lagrave (Badlands 2.9, 47.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Vivian Lagrave and the Darkstone Tablet](https://www.wowhead.com/classic/quest=4769) `4769` | 60 (57) | dungeon | Apothecary Zinge (Undercity 50.1, 68.0) | yes | no | Low XP for the effort (660 base at level 60); take it only if you pass the giver anyway. |
| [Mother's Milk](https://www.wowhead.com/classic/quest=4866) `4866` | 60 (55) | dungeon | Ragged John (Burning Steppes 65.0, 23.8) | yes | yes | Done entirely inside the run and pays 9950 XP base, high for level 60. |
| [Urok Doomhowl](https://www.wowhead.com/classic/quest=4867) `4867` (Lower Blackrock Spire) | 60 (55) | dungeon | Warosh (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Warlord's Command](https://www.wowhead.com/classic/quest=4903) `4903` (Lower Blackrock Spire) | 60 (55) | dungeon | Warlord Goretooth (Badlands 5.8, 47.5) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [Tinkee Steamboil](https://www.wowhead.com/classic/quest=4907) `4907` | 60 (57) | dungeon | Felnok Steelspring (Winterspring 61.6, 38.6) | yes | no | Low XP for the effort (660 base at level 60); take it only if you pass the giver anyway. |
| [Eitrigg's Wisdom](https://www.wowhead.com/classic/quest=4941) `4941` | 60 (55) | prerequisite | Warlord Goretooth (Badlands 5.8, 47.5) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [For The Horde!](https://www.wowhead.com/classic/quest=4974) `4974` (Upper Blackrock Spire) | 60 (55) | dungeon | Thrall (Orgrimmar 31.7, 37.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Finkle Einhorn, At Your Service!](https://www.wowhead.com/classic/quest=5047) `5047` ⚠ | 60 (55) | dungeon | Finkle Einhorn (npc) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Lorax's Tale](https://www.wowhead.com/classic/quest=5126) `5126` | 60 (55) | prerequisite | Lorax (Winterspring 63.8, 73.8) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Demon Forge](https://www.wowhead.com/classic/quest=5127) `5127` | 60 (55) | dungeon | Lorax (Winterspring 63.8, 73.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Matron Protectorate](https://www.wowhead.com/classic/quest=5160) `5160` | 60 (57) | dungeon | Awbee (npc) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Wrath of the Blue Flight](https://www.wowhead.com/classic/quest=5161) `5161` | 60 (57) | prerequisite | Haleh (Winterspring 54.5, 51.2) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Wrath of the Blue Flight](https://www.wowhead.com/classic/quest=5162) `5162` | 60 (57) | prerequisite | Haleh (Winterspring 54.5, 51.2) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Catalogue of the Wayward](https://www.wowhead.com/classic/quest=5164) `5164` | 60 (57) | prerequisite | Jeziba (Western Plaguelands 39.4, 66.8) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Breastplate of the Chromatic Flight](https://www.wowhead.com/classic/quest=5166) `5166` (Upper Blackrock Spire) | 60 (57) | dungeon | Catalogue of the Wayward (Western Plaguelands 39.4, 66.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Legplates of the Chromatic Defier](https://www.wowhead.com/classic/quest=5167) `5167` (Upper Blackrock Spire) | 60 (57) | dungeon | Catalogue of the Wayward (Western Plaguelands 39.4, 66.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Snakestone of the Shadow Huntress](https://www.wowhead.com/classic/quest=5306) `5306` (Lower Blackrock Spire) | 60 (50) | dungeon | Kilram (Winterspring 61.3, 37.1) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [What the Wind Carries](https://www.wowhead.com/classic/quest=6566) `6566` | 60 (55) | prerequisite | Thrall (Orgrimmar 31.7, 37.8) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Champion of the Horde](https://www.wowhead.com/classic/quest=6567) `6567` | 60 (55) | prerequisite | Thrall (Orgrimmar 31.7, 37.8) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Testament of Rexxar](https://www.wowhead.com/classic/quest=6568) `6568` | 60 (55) | prerequisite | Rexxar (Feralas 46.4, 18.2) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Oculus Illusions](https://www.wowhead.com/classic/quest=6569) `6569` (Lower Blackrock Spire) | 60 (55) | dungeon | Myranda the Hag (Western Plaguelands 50.8, 77.8) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Emberstrife](https://www.wowhead.com/classic/quest=6570) `6570` | 60 (55) | prerequisite | Myranda the Hag (Western Plaguelands 50.8, 77.8) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Test of Skulls, Scryer](https://www.wowhead.com/classic/quest=6582) `6582` | 60 (55) | prerequisite | Emberstrife (Dustwallow Marsh 56.7, 87.7) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Test of Skulls, Somnus](https://www.wowhead.com/classic/quest=6583) `6583` | 60 (55) | prerequisite | Emberstrife (Dustwallow Marsh 56.7, 87.7) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Test of Skulls, Chronalis](https://www.wowhead.com/classic/quest=6584) `6584` | 60 (55) | prerequisite | Emberstrife (Dustwallow Marsh 56.7, 87.7) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Test of Skulls, Axtroz](https://www.wowhead.com/classic/quest=6585) `6585` | 60 (55) | prerequisite | Emberstrife (Dustwallow Marsh 56.7, 87.7) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Ascension...](https://www.wowhead.com/classic/quest=6601) `6601` | 60 (55) | prerequisite | Emberstrife (Dustwallow Marsh 56.7, 87.7) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Blood of the Black Dragon Champion](https://www.wowhead.com/classic/quest=6602) `6602` (Upper Blackrock Spire) | 60 (55) | dungeon | Rexxar (Feralas 46.4, 18.2) | yes | yes | Done entirely inside the run and pays 9950 XP base, high for level 60. |
| [Eye of the Emberseer](https://www.wowhead.com/classic/quest=6821) `6821` (Upper Blackrock Spire) | 60 (56) | dungeon | Duke Hydraxis (Azshara 79.3, 73.7) | yes | no | Long out-of-dungeon prerequisite chain; only worth it on a relaxed route. |
| [Blackhand's Command](https://www.wowhead.com/classic/quest=7761) `7761` | 60 (55) | dungeon | Blackhand's Command (item) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Material Assistance](https://www.wowhead.com/classic/quest=7667) `7667` [Shaman] (Lower Blackrock Spire) | 60 (58) | endgame | Sagorne Creststrider (Orgrimmar 38.7, 35.9) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Ectoplasmic Distiller](https://www.wowhead.com/classic/quest=8921) `8921` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Supernatural Device](https://www.wowhead.com/classic/quest=8923) `8923` | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Hunting for Ectoplasm](https://www.wowhead.com/classic/quest=8924) `8924` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Portable Power Source](https://www.wowhead.com/classic/quest=8925) `8925` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Shifty Merchant](https://www.wowhead.com/classic/quest=8928) `8928` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Proof of Life](https://www.wowhead.com/classic/quest=8946) `8946` ⚠ | 60 (58) | endgame | Ysida Harmon (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Three Kings of Flame](https://www.wowhead.com/classic/quest=8961) `8961` (Upper Blackrock Spire) ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8962) `8962` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8963) `8963` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8964) `8964` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8965) `8965` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [I See Alcaz Island In Your Future...](https://www.wowhead.com/classic/quest=8970) `8970` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Return to Mokvar](https://www.wowhead.com/classic/quest=8978) `8978` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8985) `8985` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8986) `8986` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8987) `8987` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8988) `8988` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Return to Bodley](https://www.wowhead.com/classic/quest=8996) `8996` ⚠ | 60 (58) | endgame | Spirit of Lord Valthalak (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Back to the Beginning](https://www.wowhead.com/classic/quest=8998) `8998` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Challenge](https://www.wowhead.com/classic/quest=9015) `9015` | 60 (58) | endgame | Falrin Treeshaper (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Bodley's Unfortunate Fate](https://www.wowhead.com/classic/quest=9032) `9032` ⚠ | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |

### Dire Maul (levels 55-60)

- Entrance: Feralas 59.2, 45.1
- Pick up quests: Camp Mojache (Feralas) and the Dire Maul entrance, levels 56-60
- Wings: East, West, North
- Tank: East wing is fast and good for Lethtendris and Pusillin; North wing tribute run rewards ogre-suit stealth.
- Healer: West wing pylons need group discipline; drink after each pylon.
- DPS: Grab the Gordok Courtyard key and run North tribute for a quick gear chest.
- Dungeons off: Feralas, Winterspring and Silithus quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Lethtendris's Web](https://www.wowhead.com/classic/quest=7489) `7489` (East) | 57 (54) | dungeon | Talo Thornhoof (Feralas 76.2, 43.8) | yes | yes | Done entirely inside the run and pays 7550 XP base, high for level 57. |
| [Camp Mojache](https://www.wowhead.com/classic/quest=7492) `7492` | 57 (54) | dungeon | Warcaller Gorlach (Orgrimmar 37.6, 75.4) | yes | no | Low XP for the effort (1500 base at level 57); take it only if you pass the giver anyway. |
| [Pusillin and the Elder Azj'Tordin](https://www.wowhead.com/classic/quest=7441) `7441` (East) | 58 (54) | dungeon | Azj'Tordin (Feralas 76.9, 37.4) | yes | yes | Done entirely inside the run and pays 7750 XP base, high for level 58. |
| [A Broken Trap](https://www.wowhead.com/classic/quest=1193) `1193` (North) | 60 (56) | dungeon | Broken Trap (object) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Gordok Ogre Suit](https://www.wowhead.com/classic/quest=5518) `5518` (North) | 60 (56) | dungeon | Knot Thimblejack (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Free Knot!](https://www.wowhead.com/classic/quest=5525) `5525` (North) | 60 (57) | dungeon | Knot Thimblejack (npc) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [The Gordok Taste Test](https://www.wowhead.com/classic/quest=5528) `5528` | 60 (57) | dungeon | Stomper Kreeg (npc) | yes | no | No XP data in the source; treat as optional. |
| [The Madness Within](https://www.wowhead.com/classic/quest=7461) `7461` (West) | 60 (56) | dungeon | Shen'dralar Ancient (npc) | yes | yes | Done entirely inside the run and pays 9950 XP base, high for level 60. |
| [Elven Legends](https://www.wowhead.com/classic/quest=7481) `7481` | 60 (54) | dungeon | Sage Korolusk (Feralas 75.2, 43.8) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [Garona: A Study on Stealth and Treachery](https://www.wowhead.com/classic/quest=7498) `7498` [Rogue] | 60 (54) | dungeon | Garona: A Study on Stealth and Treachery (item) | yes | yes | Class quest (Rogue) — show only for that class; usually worth it for the reward. |
| [Codex of Defense](https://www.wowhead.com/classic/quest=7499) `7499` [Warrior] | 60 (54) | dungeon | Codex of Defense (item) | yes | yes | Class quest (Warrior) — show only for that class; usually worth it for the reward. |
| [The Arcanist's Cookbook](https://www.wowhead.com/classic/quest=7500) `7500` [Mage] | 60 (54) | dungeon | The Arcanist's Cookbook (item) | yes | yes | Class quest (Mage) — show only for that class; usually worth it for the reward. |
| [The Light and How To Swing It](https://www.wowhead.com/classic/quest=7501) `7501` [Paladin] | 60 (54) | dungeon | The Light and How to Swing It (item) | yes | yes | Class quest (Paladin) — show only for that class; usually worth it for the reward. |
| [Harnessing Shadows](https://www.wowhead.com/classic/quest=7502) `7502` [Warlock] | 60 (54) | dungeon | Harnessing Shadows (item) | yes | yes | Class quest (Warlock) — show only for that class; usually worth it for the reward. |
| [The Greatest Race of Hunters](https://www.wowhead.com/classic/quest=7503) `7503` [Hunter] | 60 (54) | dungeon | The Greatest Race of Hunters (item) | yes | yes | Class quest (Hunter) — show only for that class; usually worth it for the reward. |
| [Holy Bologna: What the Light Won't Tell You](https://www.wowhead.com/classic/quest=7504) `7504` [Priest] | 60 (54) | dungeon | Holy Bologna: What the Light Won't Tell You (item) | yes | yes | Class quest (Priest) — show only for that class; usually worth it for the reward. |
| [Frost Shock and You](https://www.wowhead.com/classic/quest=7505) `7505` [Shaman] | 60 (54) | dungeon | Frost Shock and You (item) | yes | yes | Class quest (Shaman) — show only for that class; usually worth it for the reward. |
| [The Emerald Dream...](https://www.wowhead.com/classic/quest=7506) `7506` [Druid] | 60 (54) | dungeon | The Emerald Dream (item) | yes | yes | Class quest (Druid) — show only for that class; usually worth it for the reward. |
| [Unfinished Gordok Business](https://www.wowhead.com/classic/quest=7703) `7703` (North) | 60 (56) | dungeon | Captain Kromcrush (npc) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Treasure of the Shen'dralar](https://www.wowhead.com/classic/quest=7877) `7877` | 60 (56) | dungeon | Shen'dralar Ancient (npc) | yes | no | Low XP for the effort (660 base at level 60); take it only if you pass the giver anyway. |
| [Arcane Refreshment](https://www.wowhead.com/classic/quest=7463) `7463` [Mage] (East) | 60 (60) | endgame | Lorekeeper Lydros (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Foror's Compendium](https://www.wowhead.com/classic/quest=7507) `7507` | 60 (60) | endgame | Foror's Compendium of Dragon Slaying (item) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Forging of Quel'Serrar](https://www.wowhead.com/classic/quest=7508) `7508` | 60 (60) | endgame | A Dull and Flat Elven Blade (item) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Prison's Bindings](https://www.wowhead.com/classic/quest=7581) `7581` [Warlock] | 60 (60) | endgame | Daio the Decrepit (Blasted Lands 34.1, 50.1) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Portable Power Source](https://www.wowhead.com/classic/quest=8925) `8925` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Shifty Merchant](https://www.wowhead.com/classic/quest=8928) `8928` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Proof of Life](https://www.wowhead.com/classic/quest=8946) `8946` ⚠ | 60 (58) | endgame | Ysida Harmon (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Three Kings of Flame](https://www.wowhead.com/classic/quest=8961) `8961` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8962) `8962` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8963) `8963` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8964) `8964` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8965) `8965` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [I See Alcaz Island In Your Future...](https://www.wowhead.com/classic/quest=8970) `8970` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Return to Mokvar](https://www.wowhead.com/classic/quest=8978) `8978` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8985) `8985` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Challenge](https://www.wowhead.com/classic/quest=9015) `9015` | 60 (58) | endgame | Falrin Treeshaper (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Bodley's Unfortunate Fate](https://www.wowhead.com/classic/quest=9032) `9032` ⚠ | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |

### Scholomance (levels 55-60)

- Entrance: Western Plaguelands 69.7, 73.2
- Pick up quests: Chillwind/Bulwark area of Western Plaguelands and Light's Hope Chapel, level 58-60 (key quest required)
- Tank: Scholomance has big trash rooms; control the Viewing Room and the bone-mage rooms with line of sight.
- Healer: Ras Frostwhisper hits hard with frost; keep shields and frost resistance ready.
- DPS: Key quest chain is long; for leveling, consider it endgame unless your group already has keys.
- Dungeons off: Western/Eastern Plaguelands, Winterspring and Silithus quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Plagued Hatchlings](https://www.wowhead.com/classic/quest=5529) `5529` | 58 (55) | dungeon | Betina Bigglezink (Eastern Plaguelands 71.7, 49.9) | yes | yes | Done entirely inside the run and pays 6200 XP base, high for level 58. |
| [Dawn's Gambit](https://www.wowhead.com/classic/quest=4771) `4771` | 60 (57) | dungeon | Betina Bigglezink (Eastern Plaguelands 71.7, 49.9) | yes | yes | Done entirely inside the run and pays 9950 XP base, high for level 60. |
| [Barov Family Fortune](https://www.wowhead.com/classic/quest=5341) `5341` | 60 (52) | dungeon | Alexi Barov (Tirisfal Glades 83.1, 71.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Doctor Theolen Krastinov, the Butcher](https://www.wowhead.com/classic/quest=5382) `5382` | 60 (55) | dungeon | Eva Sarkhoff (Western Plaguelands 70.2, 73.7) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Kirtonos the Herald](https://www.wowhead.com/classic/quest=5384) `5384` | 60 (55) | dungeon | Eva Sarkhoff (Western Plaguelands 70.2, 73.7) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Krastinov's Bag of Horrors](https://www.wowhead.com/classic/quest=5515) `5515` | 60 (55) | dungeon | Eva Sarkhoff (Western Plaguelands 70.2, 73.7) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Leonid Barthalomew](https://www.wowhead.com/classic/quest=5522) `5522` | 60 (57) | prerequisite | Tinkee Steamboil (Burning Steppes 65.2, 24) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Betina Bigglezink](https://www.wowhead.com/classic/quest=5531) `5531` | 60 (57) | dungeon | Leonid Barthalomew the Revered (Eastern Plaguelands 71.9, 48.3) | yes | no | Low XP for the effort (1650 base at level 60); take it only if you pass the giver anyway. |
| [The Ultimate Deception](https://www.wowhead.com/classic/quest=8829) `8829` | 60 (60) | endgame | Logistics Task Briefing XI (item) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Three Kings of Flame](https://www.wowhead.com/classic/quest=8961) `8961` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8962) `8962` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8963) `8963` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8964) `8964` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8965) `8965` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [I See Alcaz Island In Your Future...](https://www.wowhead.com/classic/quest=8970) `8970` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8988) `8988` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Challenge](https://www.wowhead.com/classic/quest=9015) `9015` | 60 (58) | endgame | Falrin Treeshaper (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Bodley's Unfortunate Fate](https://www.wowhead.com/classic/quest=9032) `9032` ⚠ | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |

### Stratholme (levels 58-60)

- Entrance: Eastern Plaguelands 26.5, 10.4; Eastern Plaguelands 41.5, 17.7
- Pick up quests: Light's Hope Chapel (Eastern Plaguelands) and Andorhal camps, level 58-60
- Wings: Live (Scarlet side, main gate), Undead (service entrance, Baron)
- Tank: Live side: pull Scarlet packs one at a time, the bastion is full of patrols. Undead side: abominations hit hard.
- Healer: Undead side ghouls stack disease; dispel aggressively.
- DPS: Do Live side for the Scarlet quest items, Undead side for Ramstein and the Baron quests.
- Dungeons off: Eastern Plaguelands, Winterspring and Silithus quests.

| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |
|---|---|---|---|---|---|---|
| [Leggings of Arcana](https://www.wowhead.com/classic/quest=5067) `5067` | 50 (57) | dungeon | Malyfous's Catalogue (Winterspring 61, 38.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Redemption](https://www.wowhead.com/classic/quest=5742) `5742` | 56 (52) | prerequisite | Tirion Fordring (Eastern Plaguelands 5.2, 35.6) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Of Forgotten Memories](https://www.wowhead.com/classic/quest=5781) `5781` | 57 (52) | prerequisite | Tirion Fordring (Eastern Plaguelands 5.2, 35.6) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Of Lost Honor](https://www.wowhead.com/classic/quest=5845) `5845` | 58 (52) | prerequisite | Tirion Fordring (Eastern Plaguelands 5.2, 35.6) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Of Love and Family](https://www.wowhead.com/classic/quest=5846) `5846` | 58 (52) | prerequisite | Tirion Fordring (Eastern Plaguelands 5.2, 35.6) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Cap of the Scarlet Savant](https://www.wowhead.com/classic/quest=5063) `5063` | 60 (57) | dungeon | Malyfous's Catalogue (Winterspring 61, 38.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Breastplate of Bloodthirst](https://www.wowhead.com/classic/quest=5068) `5068` | 60 (57) | dungeon | Malyfous's Catalogue (Winterspring 61, 38.8) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Medallion of Faith](https://www.wowhead.com/classic/quest=5122) `5122` | 60 (55) | prerequisite | Aurius (npc) | yes | no | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Aurius' Reckoning](https://www.wowhead.com/classic/quest=5125) `5125` | 60 (55) | dungeon | Aurius (npc) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [The Flesh Does Not Lie](https://www.wowhead.com/classic/quest=5212) `5212` | 60 (55) | dungeon | Betina Bigglezink (Eastern Plaguelands 71.7, 49.9) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [The Active Agent](https://www.wowhead.com/classic/quest=5213) `5213` | 60 (55) | dungeon | Betina Bigglezink (Eastern Plaguelands 71.7, 49.9) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Great Fras Siabi](https://www.wowhead.com/classic/quest=5214) `5214` (Live (Scarlet side)) | 60 (55) | dungeon | Smokey LaRue (Eastern Plaguelands 70.9, 48.4) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Houses of the Holy](https://www.wowhead.com/classic/quest=5243) `5243` | 60 (55) | dungeon | Leonid Barthalomew the Revered (Eastern Plaguelands 71.9, 48.3) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Archivist](https://www.wowhead.com/classic/quest=5251) `5251` (Live (Scarlet side)) | 60 (55) | dungeon | Duke Nicholas Zverenhoff (Eastern Plaguelands 71.6, 50.1) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [The Truth Comes Crashing Down](https://www.wowhead.com/classic/quest=5262) `5262` | 60 (55) | dungeon | Head of Balnazzar (item) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [Above and Beyond](https://www.wowhead.com/classic/quest=5263) `5263` (Undead (Baron side)) | 60 (55) | dungeon | Duke Nicholas Zverenhoff (Eastern Plaguelands 71.6, 50.1) | yes | yes | Done entirely inside the run and pays 8300 XP base, high for level 60. |
| [The Restless Souls](https://www.wowhead.com/classic/quest=5281) `5281` | 60 (55) | prerequisite | Caretaker Alen (Eastern Plaguelands 69.9, 53.7) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [The Restless Souls](https://www.wowhead.com/classic/quest=5282) `5282` | 60 (55) | dungeon | Egan (Eastern Plaguelands 11.4, 26.6) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Human, Ras Frostwhisper](https://www.wowhead.com/classic/quest=5461) `5461` | 60 (57) | prerequisite | Magistrate Marduke (Western Plaguelands 70.6, 74.1) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Dying, Ras Frostwhisper](https://www.wowhead.com/classic/quest=5462) `5462` | 60 (57) | prerequisite | Magistrate Marduke (Western Plaguelands 70.6, 74.1) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Menethil's Gift](https://www.wowhead.com/classic/quest=5463) `5463` | 60 (57) | dungeon | Leonid Barthalomew the Revered (Eastern Plaguelands 71.9, 48.3) | yes | yes | Done entirely inside the run and pays 6600 XP base, high for level 60. |
| [Menethil's Gift](https://www.wowhead.com/classic/quest=5464) `5464` | 60 (57) | prerequisite | Menethil's Gift (object) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [Soulbound Keepsake](https://www.wowhead.com/classic/quest=5465) `5465` | 60 (57) | prerequisite | Leonid Barthalomew the Revered (Eastern Plaguelands 71.9, 48.3) | yes | yes | Unlocks a dungeon quest; take it when you are already in the giver's zone. |
| [The Lich, Ras Frostwhisper](https://www.wowhead.com/classic/quest=5466) `5466` | 60 (57) | dungeon | Magistrate Marduke (Western Plaguelands 70.6, 74.1) | yes | yes | Done entirely inside the run and pays 9950 XP base, high for level 60. |
| [Of Love and Family](https://www.wowhead.com/classic/quest=5848) `5848` | 60 (52) | dungeon | Artist Renfray (Western Plaguelands 65.8, 75.4) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [Duskwing, Oh How I Hate Thee...](https://www.wowhead.com/classic/quest=6135) `6135` | 60 (56) | prerequisite | Nathanos Blightcaller (Eastern Plaguelands 22.2, 63.5) | yes | no | Unlocks a dungeon quest that the speed route skips; take it only on the balanced route. |
| [Ramstein](https://www.wowhead.com/classic/quest=6163) `6163` (Undead (Baron side)) | 60 (56) | dungeon | Nathanos Blightcaller (Eastern Plaguelands 22.2, 63.5) | yes | no | Needs objectives outside the dungeon, which costs extra travel in a speed run. |
| [The Ectoplasmic Distiller](https://www.wowhead.com/classic/quest=8921) `8921` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Supernatural Device](https://www.wowhead.com/classic/quest=8923) `8923` | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Hunting for Ectoplasm](https://www.wowhead.com/classic/quest=8924) `8924` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Portable Power Source](https://www.wowhead.com/classic/quest=8925) `8925` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [A Shifty Merchant](https://www.wowhead.com/classic/quest=8928) `8928` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Three Kings of Flame](https://www.wowhead.com/classic/quest=8961) `8961` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8962) `8962` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8963) `8963` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8964) `8964` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Components of Importance](https://www.wowhead.com/classic/quest=8965) `8965` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [I See Alcaz Island In Your Future...](https://www.wowhead.com/classic/quest=8970) `8970` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Return to Mokvar](https://www.wowhead.com/classic/quest=8978) `8978` | 60 (58) | endgame | Mux Manascrambler (Tanaris 52.5, 27.2) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [More Components of Importance](https://www.wowhead.com/classic/quest=8987) `8987` ⚠ | 60 (58) | endgame | Bodley (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [The Challenge](https://www.wowhead.com/classic/quest=9015) `9015` | 60 (58) | endgame | Falrin Treeshaper (npc) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |
| [Bodley's Unfortunate Fate](https://www.wowhead.com/classic/quest=9032) `9032` ⚠ | 60 (58) | endgame | Mokvar (Orgrimmar 35.0, 38.3) | no | no | Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame. |

## Pack fixes

- Removed `8588` **The Horde Needs Heavy Leather!** from `uldaman`. Removed: miscategorized. This is a level-60 AQ war-effort turn-in to Skinner Jamani in Orgrimmar, not a dungeon quest. It is not in content/questie-db/quests.json (the QuestieDB v1.1.3 Forever import). It had been attached to Uldaman only because Heavy Leather can drop from a basilisk inside the instance.
- Shared chain quests now have exactly one accept and one turn-in, in the dungeon QuestieDB assigns (quest zone if it is a dungeon; otherwise the next dungeon quest in the imported chain):
  - `1109` **Going, Going, Guano!** stays in `razorfen-kraul`, dropped from `scarlet-monastery`. QuestieDB zone is Razorfen Kraul (1717), which is razorfen-kraul.
  - `3520` **Screecher Spirits** stays in `zulfarrak`, dropped from `sunken-temple`, `blackrock-spire`. Turn-in and quest zone are in the world (QuestieDB zone Tanaris); the next dungeon quest in the imported chain is in zulfarrak.
  - `3527` **The Prophecy of Mosh'aru** stays in `zulfarrak`, dropped from `sunken-temple`, `blackrock-spire`. QuestieDB zone is Zul'Farrak (978), which is zulfarrak.
  - `4787` **The Ancient Egg** stays in `sunken-temple`, dropped from `blackrock-spire`. Turn-in and quest zone are in the world (QuestieDB zone The Hinterlands); the next dungeon quest in the imported chain is in sunken-temple.
  - `3528` **The God Hakkar** stays in `sunken-temple`, dropped from `blackrock-spire`. QuestieDB zone is Sunken Temple (1417), which is sunken-temple.
  - `4810` **Return to Tinkee** stays in `blackrock-spire`, dropped from `scholomance`. Turn-in and quest zone are in the world (QuestieDB zone Winterspring); the next dungeon quest in the imported chain is in blackrock-spire.
  - `4734` **Egg Freezing** stays in `blackrock-spire`, dropped from `scholomance`. QuestieDB zone is Blackrock Spire (1583), which is blackrock-spire.
  - `4735` **Egg Collection** stays in `blackrock-spire`, dropped from `scholomance`. QuestieDB zone is Blackrock Spire (1583), which is blackrock-spire.
  - `5047` **Pip Quickwit, At Your Service!** stays in `blackrock-spire`, dropped from `stratholme`. QuestieDB zone is Blackrock Spire (1583), which is blackrock-spire.
  - `5382` **Doctor Theolen Krastinov, the Butcher** stays in `scholomance`, dropped from `stratholme`. QuestieDB zone is Scholomance (2057), which is scholomance.
  - `5384` **Kirtonos the Herald** stays in `scholomance`, dropped from `stratholme`. QuestieDB zone is Scholomance (2057), which is scholomance.
  - `5461` **The Human, Ras Frostwhisper** stays in `stratholme`, dropped from `scholomance`. Turn-in and quest zone are in the world (QuestieDB zone Western Plaguelands); the next dungeon quest in the imported chain is in stratholme.
  - `5462` **The Dying, Ras Frostwhisper** stays in `stratholme`, dropped from `scholomance`. Turn-in and quest zone are in the world (QuestieDB zone Western Plaguelands); the next dungeon quest in the imported chain is in stratholme.
  - `5463` **Menethil's Gift** stays in `stratholme`, dropped from `scholomance`. QuestieDB zone is Stratholme (2017), which is stratholme.
  - `5515` **Krastinov's Bag of Horrors** stays in `scholomance`, dropped from `stratholme`. QuestieDB zone is Scholomance (2057), which is scholomance.
- Follow-ups were moved so they are accepted only after their in-pack prerequisite is turned in:
  - `5464` **Menethil's Gift** moved from `scholomance` to `stratholme` after `5463`. Moved after Menethil's Gift (5463) in the Stratholme section so the Ras Frostwhisper follow-ups are accepted only after 5463 is turned in.
  - `5465` **Soulbound Keepsake** moved from `scholomance` to `stratholme` after `5463`. Moved after Menethil's Gift (5463) in the Stratholme section so the Ras Frostwhisper follow-ups are accepted only after 5463 is turned in.
  - `5466` **The Lich, Ras Frostwhisper** moved from `scholomance` to `stratholme` after `5463`. Moved after Menethil's Gift (5463) in the Stratholme section so the Ras Frostwhisper follow-ups are accepted only after 5463 is turned in.
- These quests also appear in the 40-60 leveling route. QuestieDB objective mobs, objects, and items are in the open world (not a dungeon zone), so 40-60 owns accept and turn-in and this pack drops them:
  - `2258` **Badlands Reagent Run** dropped from `uldaman` (owner: 40-60). npc `2829` Starving Buzzard in Badlands (3); npc `2830` Buzzard in Badlands (3); npc `2831` Giant Buzzard in Badlands (3); npc `6013` Wayward Buzzard in unknown zone; npc `2727` Crag Coyote in Badlands (3); npc `2728` Feral Crag Coyote in Badlands (3); npc `2729` Elder Crag Coyote in Badlands (3); npc `2730` Rabid Crag Coyote in Badlands (3); npc `92` Rock Elemental in Badlands (3); npc `2735` Lesser Rock Elemental in Badlands (3); npc `2736` Greater Rock Elemental in Badlands (3); npc `2745` Ambassador Infernus in Badlands (3); npc `2752` Rumbler in Badlands (3); npc `2791` Enraged Rock Elemental in Badlands (3); npc `2919` Fam'retor Guardian in Badlands (3); npc `8278` Smoldar in Searing Gorge (51); npc `232422` Earth Elemental in unknown zone.
  - `1424` **Pool of Tears** dropped from `sunken-temple` (owner: 40-60). object `30854` Atal'ai Artifact in Swamp of Sorrows (8); object `30855` Atal'ai Artifact in Swamp of Sorrows (8); object `30856` Atal'ai Artifact in Swamp of Sorrows (8).
  - `1429` **The Atal'ai Exile** dropped from `sunken-temple` (owner: 40-60). no objective mobs/objects/items (world delivery).
  - `4145` **Larion and Muigin** dropped from `sunken-temple` (owner: 40-60). npc `6509` Bloodpetal Lasher in Un'Goro Crater (490); npc `6512` Bloodpetal Trapper in Un'Goro Crater (490); npc `6510` Bloodpetal Flayer in Un'Goro Crater (490); npc `6511` Bloodpetal Thresher in Un'Goro Crater (490).
  - `4726` **Broodling Essence** dropped from `blackrock-spire` (owner: 40-60). object `175264` Broodling Essence in Burning Steppes (46).
  - `4808` **Felnok Steelspring** dropped from `blackrock-spire` (owner: 40-60). no objective mobs/objects/items (world delivery).
  - `4809` **Chillwind Horns** dropped from `blackrock-spire` (owner: 40-60). npc `7447` Fledgling Chillwind in Winterspring (618); npc `7448` Chillwind Chimaera in Winterspring (618); npc `7449` Chillwind Ravager in Winterspring (618).
  - `5542` **Demon Dogs** dropped from `stratholme` (owner: 40-60). npc `8596` Plaguehound Runt in Eastern Plaguelands (139); npc `8597` Plaguehound in Eastern Plaguelands (139); npc `8598` Frenzied Plaguehound in Eastern Plaguelands (139).
  - `5543` **Blood Tinged Skies** dropped from `stratholme` (owner: 40-60). npc `8600` Plaguebat in Eastern Plaguelands (139).
  - `5544` **Carrion Grubbage** dropped from `stratholme` (owner: 40-60). npc `8603` Carrion Grub in Eastern Plaguelands (139); npc `8605` Carrion Devourer in Eastern Plaguelands (139); npc `222412` Random Worm in unknown zone.
  - `6133` **The Ranger Lord's Behest** dropped from `stratholme` (owner: 40-60). npc `8565` Pathstrider in Eastern Plaguelands (139); npc `8564` Ranger in Eastern Plaguelands (139); npc `8563` Woodsman in Eastern Plaguelands (139); object `177747` Quel'Thalas Registry in Eastern Plaguelands (139).

## Prerequisites outside this pack

These dungeon quests have a `pre.single` (any one) or `pre.group` (all required) prerequisite that is not accepted or turned in inside this pack. The expansion / leveling-route PR is expected to guard them; they are not dropped unless a prerequisite is class-specific or clearly unreachable.

| Quest | Prereq | Kind | Dungeon section | Prereq zone |
|---|---|---|---|---|
| Uldaman Reagent Run (2202) | Badlands Reagent Run (2258) | single | Uldaman | Badlands |
| Return to Fel'Zerul (1444) | The Atal'ai Exile (1429) | single | Sunken Temple (Temple of Atal'Hakkar) | Swamp of Sorrows |
| The Stone Circle (3444) | 3445 (not in the import) | single | Sunken Temple (Temple of Atal'Hakkar) | unknown |
| Marvon's Workshop (4147) | Larion and Muigin (4145) | single | Sunken Temple (Temple of Atal'Hakkar) | Un'Goro Crater |
| Spirit Totem (8412) | Mastering the Elements (8411) | single | Sunken Temple (Temple of Atal'Hakkar) | Alterac Mountains |
| Forging the Shaft (3443) | The Flawless Flame (3442) | single | Blackrock Depths | Searing Gorge |
| Return to Tinkee (4810) | Chillwind Horns (4809) | single | Blackrock Spire (Lower and Upper) | Winterspring |
| Redemption (5742) | Demon Dogs (5542) | group | Stratholme | Eastern Plaguelands |
| Redemption (5742) | Blood Tinged Skies (5543) | group | Stratholme | Eastern Plaguelands |
| Redemption (5742) | Carrion Grubbage (5544) | group | Stratholme | Eastern Plaguelands |
| Duskwing, Oh How I Hate Thee... (6135) | To Kill With Purpose (6022) | group | Stratholme | Eastern Plaguelands |
| Duskwing, Oh How I Hate Thee... (6135) | Un-Life's Little Annoyances (6042) | group | Stratholme | Eastern Plaguelands |
| Duskwing, Oh How I Hate Thee... (6135) | The Ranger Lord's Behest (6133) | group | Stratholme | Eastern Plaguelands |
| Ramstein (6163) | The Corpulent One (6136) | group | Stratholme | Eastern Plaguelands (Elite) |
| The New Plague (95216) | A Recipe For Death (451) | single | Ruins of Lordaeron | Silverpine Forest |
| The Wrath of Rath'mael (92422) | Rear Guard Patrol (99156) | single | Ruins of Lordaeron | Tirisfal Glades (Elite) |
| The Drowned City (95775) | Locating the Lost City (95770) | single | The Drowned City | Stranglethorn Vale |
| The Only Good Brinescale... (95776) | Locating the Lost City (95770) | group | The Drowned City | Stranglethorn Vale |
| The Only Good Brinescale... (95776) | Enemies in the Water (95773) | group | The Drowned City | Stranglethorn Vale |
| A Token of Vengeance (94975) | Bring Me His Head (94768) | single | Krol'dok Stronghold | Riverglades (Elite) |
| Eye of Mugg (94968) | It Is Time, Brother... (95278) | single | Krol'dok Stronghold | Riverglades |
| Tome of Twilight (94972) | It Is Time, Brother... (95278) | single | Krol'dok Stronghold | Riverglades |
| Get to the Roots of It (92343) | 92345 (not in the import) | single | Blackmaw Hold | unknown |
| Get to the Roots of It (92343) | Beneath Nordrassil (92346) | single | Blackmaw Hold | Azshara |

Forever dungeon quests get a turn-in step when QuestieDB provides a finisher NPC or object (`verified: false`). Quests with no finisher in the import stay accept-only; a later accept may then treat that accept as satisfying the prerequisite.

## Forever quests with no finisher in the import

These Forever dungeon quests have no end NPC or object in `content/questie-db`. The pack does not invent a turn-in for them; they stay accept-only.

- `96987` **Opportunistic Education** (`city-of-dalaran`)
- `95309` **No Orc Left Behind** (`alcaz-prison`)
- `95454` **The Honor of the Kor'kron** (`alcaz-prison`)
- `96369` **Bad News for Folkar** (`alcaz-prison`)
- `96335` **The Man in the Iron Chains** (`alcaz-prison`)
- `92065` **Blackmaw Reclamation** (`blackmaw-hold`)

## Known gaps

- Quest data is Classic Era (QuestieDB). It has not been checked in the WoW: Forever client; Forever may have changed rewards, XP or availability.
- Wowhead spot-checks could not be run in bulk (Wowhead rate-limited our fetches), so `verified` means "present in QuestieDB".
- NPCs inside instances have no outdoor coordinates (`insideDungeon: true`); objective locations inside the dungeon are given as NPC names, not in-instance map points.
- Wing tags are only set for Scarlet Monastery, Blackrock Spire, Dire Maul, Stratholme and Maraudon quests whose objective NPCs match a known boss name.
- Route judgements and role tips are team opinion (`verified: false` on tips). Dungeons-off replacements name zones only; the open-world quest steps come from the zone research lanes.
- Forever dungeon quests are matched to QuestieDB v1.1.3 in `content/questie-db`. Hall of Thanes “Important Heirlooms” (96403, giver Thom Filch 265003) is excluded from the Horde data because it is probably Alliance-only: 96403 is not in the Horde+neutral import. Alcaz Prison and Blackmaw Hold entrances are still not published. All Forever quests stay `verified: false` until checked in game.

⚠ = unverified (see `verificationNotes` in the JSON).

## Licence

See [LICENSE.md](LICENSE.md): the quest data derives from Questie (GPL-3.0).
