# Gemini deep research: Alliance 1-20 (summary and assessment)

Source: "World of Warcraft: Forever — Alliance Leveling Compendium (Levels 1–20)", a Gemini Deep Research PDF
(36 pages, 27 November 2026) supplied by the project owner. This file is our own summary, not a copy. The report
had **no usable quest ids or coordinates**: nearly every table cell is UNKNOWN. All ids, NPCs and coordinates in the
routes come from `content/questie-db-alliance` instead.

## Useful facts (with the report's verification label)

| Topic | Claim | Label | Source cited |
|---|---|---|---|
| Races | New Alliance combos: Human Hunter, Dwarf Shaman, Gnome Priest. High Order Skyborne (Alliance Skyborne) can be Druid, Hunter, Mage, Rogue, Warrior; Mage is Alliance-Skyborne only. Skyborne needs the Skyborne Heroic/Epic pack. | Verified | news.blizzard.com 24315643, 24315821 |
| Zephras Isle | Shared island, phased per faction; full clear ≈ level 14; hubs NW→NE: Thendal Village, farms, Shen'dar Village (~L5), Shrine of Alar, Shadowgate Forest, Ruins of Ban'aethal, Valanaar (city, no flight paths). Exit: Valanaar Skycutter to Dalaran, "The Magical City of Dalaran" then "Exploring the Alliance" in Stormwind Keep. | Mostly unverified | mobalytics.gg zephras map, classicwowforever.com Skyborne guide |
| Zephras bugs | Non-Skyborne Alliance visitors report Elegael Thornpaw / Ealaane Nimbuswalker quests not entering the log; Horde-only quest "Meddlesome Mages" in Shen'dar. Camping 101: Herbalism turns in at Shen'dar Village since 16 Nov. | Unverified / verified (hotfix) | us.forums.blizzard.com 2430705; Blizzard hotfixes 24315281 |
| Elwynn | New Forever quests: Nibbled-On Book, Book Inventory, Rascally Rodents, Mining Consultant; "Rediscovering the Light" and "Rough Wolf Pelts" hotfixed 9 Nov. | Unverified / verified | youtube Qf8xhBDWFy4; Blizzard hotfixes |
| Hall of Thanes | New Alliance dungeon 13-18 under Ironforge (Old Ironforge). Entrance: Throne Room, left corridor (~43.5, 52.0 Ironforge) to the portal (~27.8, 47.9). Quests: The Restless Dead, Important Heirlooms, An Ancient Grudge (inside), Old Ironforge Incursion (needs Underground Map from Dark Iron Spies at Ironband's Compound), Treaty of Understanding (tablet in the last vault, not shareable). Comfortable at party level 15. Bosses: Faldrim Anvilmar, Magmatus, Plunder, Durgen Dirgehammer. | Verified (dungeon) / unverified (details) | Blizzard 24301455; mobalytics, icy-veins, space4games |
| Dungeon XP | Dungeon kill XP 60% of Classic after the 8 Nov hotfix (community estimates 36-45%); kill XP zeroed when a party member is >12 levels above the mob (13-14 Nov); 5 instance entries per hour (20 Nov). Dungeon quest XP is large (Deadmines 18,450 total quest XP incl. one new 2,700 XP quest). | Mixed | Blizzard hotfixes; method.gg; seramate |
| Travel | New boats: Stormwind Harbor ↔ Auberdine; Menethil → Southshore → Auberdine → Menethil triangle; Valanaar ↔ Dalaran Skycutter. Deeprun Tram unchanged. | Unverified | classicwowforever.com/boats-and-zeppelins |
| Cozy Sleeping Bag | Chain opens at level 14: Stepping Stones (Westfall, wagon at Alexston Farmstead ~37.1, 50.1), Scramble (Stonetalon, Old Toolbox 12-slot bag). Bag: +1% XP per stack up to 3 (+3%), 2 h buff, survives death. In our data: 79192 Stepping Stones → 79980 Scramble (req 14). | Unverified | vanilla.games blog; youtube ZQB4-gyOldQ |
| XP buffs | Well Fed +5% kill XP only; Camp Tent (Leatherworking) +5% of a level rested, capped; Legacy perks (Well Rested, Talented: talents 5 levels earlier, Thrill of Adventure, Frequent Flier). | Verified (systems) / unverified (numbers) | Blizzard 24307383, 24301516 |
| Camping | Cooking (skill 1) Basic Campfire; skill-20 Camp Features per profession (Fishing Bowl +8% stats, First Aid Kit Stamina, Sharpening Wheel Str, Mana Well, Incense Candle Int, Faction Banner Spi, Camp Chair crit, Camp Tent rested). Starter zones have Camping 101 quests. | Verified | Blizzard 24301516 |
| Night Elf fixes | Teldrassil lashers no longer Nature-immune; Kerlonian (The Sleeper Has Awakened) sleeps less, Horn of Awakening given at start; Vorsha the Lasher fixed; Damp Note drop rate raised (9 Nov). | Verified | Blizzard hotfixes 24315281 |
| Dun Morogh fixes | Ammo for Rumbleshot loot fixed (9 Nov); Dwarf Shaman quest "With Wind Beneath Your Wings" (79365) reported bugged (level 100 requirement). | Verified / unverified | Blizzard hotfixes; forum 2430465 |
| Class notes | Hunters/Warlocks fastest solo levelers; Hawk pet melee +80%; Voidwalker +40 HP; Paladin mount quests; Priests level better Shadow/Disc than Holy. | Mostly unverified | classicwowforever.com; Blizzard hotfixes |
| Questing beats grinding | Survey of 9,757 early 60s: median 922 quests, most ran each leveling dungeon once. | Unverified | reddit r/classicwow 1y5lau4 |

## What we could not use

- Quest ids, NPC ids, coordinates and XP: the report has none for 1-20 Alliance zones.
- Steps 3-6 of the Cozy Sleeping Bag chain, transport timings, per-zone /played splits: unknown.
- Some names conflict with our data (the report says "Sage" is not the Alliance Skyborne name; QuestieDB race key is
  `SKYBORNE_ALLIANCE`). The routes use "Skyborne" as the race token.
