# Alterac Mountains: Alliance + neutral quests (44)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 94912 Child of Nature  (L10 req10, 840 xp, F, races=Skyborne, class=Druid, sort=DRUID)
  - start: Archmage Ansirem Runeweaver [npc 2543] @ Alterac Mountains 18.8,78.5; Alfina Nightgaze [npc 270459] @ Alterac Mountains 11.8,56.6
  - end:   Sheldras Moontree [npc 5504] @ Stormwind City 35.8,67.4
  - text: Speak with Sheldras Moontree in Stormwind.

## 96779 Syndicate Sabotage  (L24 req24, 1950 xp, F, class=Rogue, sort=ROGUE)
  - start: Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - end:   Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - pre(any)=[6681]
  - text: Find Lord Tomas inside Durnholde Keep, in Hillsbrad Foothills, and kill him. Then, return to Myrokos Silentform.
  - objectives:
    1. kill 1x Lord Tomas <- Lord Tomas [npc 266216] L24-24 ~Hillsbrad Foothills 80,46 (26 spawns)

## 505 Syndicate Assassins  (L33 req26, 1950 xp)
  - start: Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - text: Kill 12 Syndicate Footpads and 8 Syndicate Thieves, then return to Magistrate Henry Maleb in Southshore.
  - objectives:
    1. kill 12x Syndicate Footpad <- Syndicate Footpad [npc 2240] L32-33 ~Alterac Mountains 54,72 (11 spawns)
    2. kill 12x Syndicate Thief <- Syndicate Thief [npc 2241] L33-34 ~Alterac Mountains 53,75 (12 spawns)

## 92432 An Alarming Request  (L33 req30, 660 xp, F)
  - start: Emissary Jacques [npc 247264] @ Hillsbrad Foothills 48.3,60.0
  - end:   Image of Archmage Modera [npc 269127] @ Silverpine Forest 68.6,45.1
  - next=92458
  - text: Report to the Image of Archmage Modera near the City of Dalaran.

## 92459 Friend of the Kirin Tor  (L33 req24, 265 xp, F)
  - start: Image of Archmage Modera [npc 269127] @ Silverpine Forest 68.6,45.1
  - end:   Archmage Celindra [npc 252085] @ Alterac Mountains 14.2,60.0
  - pre(any)=[92458, 96984]
  - text: Speak to Archmage Celindra in the City of Dalaran.

## 510 Foreboding Plans  (L34 req26, 1350 xp)
  - start: Syndicate Documents [object 1738] @ no spawn; Syndicate Documents [object 1739] @ no spawn; Syndicate Documents [object 1740] @ Alterac Mountains 58.3,67.9; Syndicate Documents [object 556628] @ Alterac Mountains 58.3,67.9
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - next=512
  - text: Bring the Foreboding Plans to Magistrate Maleb in Southshore.

## 511 Encrypted Letter  (L34 req30, 1350 xp)
  - start: Syndicate Documents [object 1738] @ no spawn; Syndicate Documents [object 1739] @ no spawn; Syndicate Documents [object 1740] @ Alterac Mountains 58.3,67.9; Syndicate Documents [object 556628] @ Alterac Mountains 58.3,67.9
  - end:   Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - next=514
  - text: Bring the Encrypted Letter to Loremaster Dibbs in Southshore.

## 514 Letter to Stormpike  (L34 req30, 1350 xp)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Prospector Stormpike [npc 1356] @ Ironforge 74.6,11.7
  - pre(any)=[511], next=525
  - text: Take the Cleverly Encrypted Letter to Prospector Stormpike in Ironforge.

## 525 Further Mysteries  (L34 req30, 1350 xp)
  - start: Prospector Stormpike [npc 1356] @ Ironforge 74.6,11.7
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - pre(any)=[514], next=537
  - text: Bring the Decrypted Letter to Magistrate Maleb in Southshore.

## 7043 You're a Mean One...  (L35 req30, 3450 xp, sort=SEASONAL)
  - start: Strange Snowman [npc 13636] @ Alterac Mountains 35.4,72.5
  - end:   Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - pre(any)=[7042], next=7045
  - text: Locate and return the Stolen Treats to Wulmort Jinglepocket in Ironforge. It was last thought to be in the possession of the Abominable Greench, found somewhere in the snowy regions of the Alterac Mountains.
  - objectives:
    1. item 1x Stolen Treats <- The Abominable Greench [npc 13602] L36-36 ~Alterac Mountains 36,62 (12 spawns)

## 500 Crushridge Bounty  (L36 req30, 3500 xp)
  - start: Marshal Redpath [npc 2263] @ Hillsbrad Foothills 49.5,58.7
  - end:   Marshal Redpath [npc 2263] @ Hillsbrad Foothills 49.5,58.7
  - next=504
  - text: Gather 9 Dirty Knucklebones from Crushridge ogres in the Alterac Mountains. Bring them to Marshal Redpath in Southshore.
  - objectives:
    1. item 9x Dirty Knucklebones <- Crushridge Ogre [npc 2252] L34-35 ~Alterac Mountains 50,45 (49 spawns); Crushridge Brute [npc 2253] L35-36 ~Alterac Mountains 49,45 (30 spawns); Crushridge Mauler [npc 2254] L36-37 ~Alterac Mountains 43,46 (16 spawns); Crushridge Mage [npc 2255] L37-38 ~Alterac Mountains 41,45 (8 spawns)

## 512 Noble Deaths  (L36 req26, 2800 xp)
  - start: Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - pre(any)=[510]
  - text: Bring 7 Alterac Signet Rings to Magistrate Maleb in Southshore.
  - objectives:
    1. item 7x Alterac Signet Ring <- Syndicate Spy [npc 2242] L35-36 ~Alterac Mountains 61,44 (23 spawns); Syndicate Sentry [npc 2243] L36-37 ~Alterac Mountains 53,25 (31 spawns); Syndicate Saboteur [npc 2245] L37-38 ~Alterac Mountains 55,25 (8 spawns); Syndicate Assassin [npc 2246] L38-39 ~Alterac Mountains 40,17 (16 spawns)

## 95534 Strahnbrad Mystery  (L36 req25, 2800 xp, F)
  - start: item Singed Note [213421] (drops from Argus Shadow Mage, Syndicate Wizard)
  - end:   Kundric Zanden [npc 2378] @ Hillsbrad Foothills 48.6,59.0; Shara Blazen [npc 2402] @ Hillsbrad Foothills 63.7,21.2
  - text: Solve the mystery of Strahnbrad and report your findings in town in Hillsbrad.

## 96781 What's the Big Idea?  (L36 req24, 2800 xp, F, class=Rogue, sort=ROGUE)
  - start: Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - end:   Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - pre(any)=[6681], next=96782
  - text: Steal Barton's Scouting Report by pickpocketing it from him. Then, bring the report to Myrokos Silentform at Ravenholdt Manor.
  - objectives:
    1. item 1x Barton's Scouting Report <- Barton [npc 266357] L36-36 ~Alterac Mountains 62,46 (52 spawns)

## 96782 Covert Extraction  (L36 req24, 2800 xp, F, class=Rogue, sort=ROGUE)
  - start: Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - end:   Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - pre(any)=[96781]
  - text: Find the Blade of House Perenolde and the Royal Aegis of Perenolde among the ruins of Alterac. Then, bring them to Myrokos Silentform.
  - objectives:
    1. item 1x Blade of House Perenolde <- object 656100 [object 656100] ~Alterac Mountains 39,58 (1 spawns)
    2. item 1x Royal Aegis of Perenolde <- object 656101 [object 656101] ~Alterac Mountains 41,40 (1 spawns)

## 96783 A Way In  (L36 req24, 2800 xp, F, class=Rogue, sort=ROGUE)
  - start: Myrokos Silentform [npc 13085] @ Alterac Mountains 84.9,80.4
  - end:   Syndicate Footlocker [object 656157] @ Arathi Highlands 32.3,26.6
  - pre(any)=[6681], next=96784
  - text: Steal a Syndicate uniform from Northfold Manor to infiltrate Stromgarde Keep.

## 1714 Essence of the Exile  (L37 req30, ? xp, class=Warrior, sort=WARRIOR, repeatable)
  - start: Bath'rah's Cauldron [object 89931] @ Alterac Mountains 79.3,66.8
  - end:   Bath'rah's Cauldron [object 89931] @ Alterac Mountains 79.3,66.8
  - objectives:
    1. item 1x Thundering Charm <- Drywhisker Kobold [npc 2572] L35-36 ~Arathi Highlands 79,38 (21 spawns); Drywhisker Surveyor [npc 2573] L37-38 ~Arathi Highlands 85,32 (8 spawns); Drywhisker Digger [npc 2574] L36-37 ~Arathi Highlands 85,33 (14 spawns); Thundering Exile [npc 2762] L38-39 ~Arathi Highlands 52,51 (12 spawns)
    2. item 1x Burning Charm <- Drywhisker Kobold [npc 2572] L35-36 ~Arathi Highlands 79,38 (21 spawns); Drywhisker Surveyor [npc 2573] L37-38 ~Arathi Highlands 85,32 (8 spawns); Drywhisker Digger [npc 2574] L36-37 ~Arathi Highlands 85,33 (14 spawns); Burning Exile [npc 2760] L38-39 ~Arathi Highlands 26,30 (14 spawns)
    3. item 1x Cresting Charm <- Drywhisker Kobold [npc 2572] L35-36 ~Arathi Highlands 79,38 (21 spawns); Drywhisker Surveyor [npc 2573] L37-38 ~Arathi Highlands 85,32 (8 spawns); Drywhisker Digger [npc 2574] L36-37 ~Arathi Highlands 85,33 (14 spawns); Cresting Exile [npc 2761] L38-39 ~Arathi Highlands 67,30 (14 spawns)

## 522 Assassin's Contract  (L38 req30, 710 xp)
  - start: item Assassin's Contract [3668] (drops from Shadowy Assassin)
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - next=523
  - text: Bring the Assassin's Contract to Magistrate Maleb in Southshore.

## 504 Crushridge Warmongers  (L40 req30, 4700 xp)
  - start: Marshal Redpath [npc 2263] @ Hillsbrad Foothills 49.5,58.7
  - end:   Marshal Redpath [npc 2263] @ Hillsbrad Foothills 49.5,58.7
  - pre(any)=[500]
  - text: Slay 15 Crushridge Warmongers, then return to Marshal Redpath in Southshore.
  - objectives:
    1. kill 15x Crushridge Warmonger <- Crushridge Warmonger [npc 2287] L39-40 ~Alterac Mountains 37,54 (26 spawns)

## 523 Baron's Demise  (L40 req30, 3900 xp)
  - start: Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - pre(any)=[522]
  - text: Bring the Head of Baron Vardus to Magistrate Maleb in Southshore.
  - objectives:
    1. item 1x Head of Baron Vardus <- Baron Vardus [npc 2306] L40-40 ~Alterac Mountains 55,27 (5 spawns)

## 537 Dark Council  (L40 req30, 3150 xp)
  - start: Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - end:   Magistrate Henry Maleb [npc 2276] @ Hillsbrad Foothills 48.1,59.1
  - pre(any)=[525]
  - text: Kill 4 Argus Shadow Mages.
  - text: Bring the Head of Nagaz to Magistrate Maleb in Southshore.
  - objectives:
    1. kill 4x Argus Shadow Mage <- Argus Shadow Mage [npc 2318] L35-36 ~Alterac Mountains 58,35 (9 spawns)
    2. item 1x Head of Nagaz <- Nagaz [npc 2320] L40-40 ~Alterac Mountains 39,14 (1 spawns)

## 551 The Ensorcelled Parchment  (L40 req30, 780 xp)
  - start: item Ensorcelled Parchment [3706] (drops from ?)
  - end:   Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - next=554
  - text: Take the Ensorcelled Parchment to Loremaster Dibbs in Southshore.

## 554 Stormpike's Deciphering  (L40 req28, 1550 xp)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Prospector Stormpike [npc 1356] @ Ironforge 74.6,11.7
  - pre(any)=[551]
  - text: Take the Ensorcelled Parchment to Prospector Stormpike in Ironforge.

## 1712 Cyclonian  (L40 req30, 2350 xp, class=Warrior, sort=WARRIOR)
  - start: Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - end:   Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - pre(any)=[1791], next=1713
  - text: Bring the items on Bath'rah's Parchment to Bath'rah the Windwatcher in Alterac.
  - objectives:
    1. item 1x Liferoot <- Liferoot [object 2041] ~Alterac Mountains 37,39 (50 spawns)
    2. item 1x Bloodscalp Tusk <- Bloodscalp Warrior [npc 587] L33-34 ~Stranglethorn Vale 32,17 (5 spawns); Bloodscalp Scout [npc 588] L34-35 ~Stranglethorn Vale 25,12 (28 spawns); Bloodscalp Hunter [npc 595] L34-35 ~Stranglethorn Vale 25,11 (18 spawns); Bloodscalp Berserker [npc 597] L36-37 ~Stranglethorn Vale 22,10 (19 spawns)
    3. item 1x Essence of the Exile <- ?

## 1713 The Summoning  (L40 req30, 2350 xp, class=Warrior, sort=WARRIOR)
  - start: Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - end:   Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - pre(any)=[1712], next=1792
  - text: Bring the Whirlwind Heart to Bath'rah Windwatcher.
  - objectives:
    1. item 1x Whirlwind Heart <- Cyclonian [npc 6239] L40-40 ~Alterac Mountains 80,62 (1 spawns)

## 1792 Whirlwind Weapon  (L40 req30, 3900 xp, class=Warrior, sort=WARRIOR)
  - start: Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - end:   Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - pre(any)=[1713]

## 95798 The Web of Magic  (L40 req30, 2350 xp, F)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Abra Cadabra [npc 252019] @ Alterac Mountains 12.0,70.5
  - pre(any)=[95788]
  - text: Bring the I'lalai Fetish to Abra Cadabra in Dalaran.

## 97130 Ancient Gurubashi Secrets  (L40 req34, ? xp, F)
  - start: Archmage Timear [npc 31439] @ Alterac Mountains 15.4,74.1
  - end:   Archmage Timear [npc 31439] @ Alterac Mountains 15.4,74.1
  - text: Recover an Ancient Gurubashi Idol from the Drowned City.
  - objectives:
    1. item 1x Ancient Gurubashi Idol <- Deathless Marrow [npc 260202] LNone-None

## 96771 Vengeance of the Highborne  (L45 req37, ? xp, F)
  - start: Ranath Nightstride [npc 268425] @ Alterac Mountains 17.8,66.0
  - end:   Ranath Nightstride [npc 268425] @ Alterac Mountains 17.8,66.0
  - text: Travel to Krol'dok Stronghold and slay Zalfan Moonshadow.
  - objectives:
    1. kill 1x Zalfan Moonshadow <- Zalfan Moonshadow [npc 268423] LNone-None

## 80411 The Talisman of Kazdor  (L50 req45, 4700 xp, F, class=Rogue, sort=ROGUE)
  - start: Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - end:   Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - pre(any)=[80526]
  - text: Find The Talisman of Kazdor inside of Zul'Farrak. Then, bring it to Fahrad at Ravenholdt Manor. You must complete the job alone.
  - objectives:
    1. item 1x Talisman of Kazdor <- Spellbound War Chest [object 433596]

## 80453 Best Laid Plans  (L50 req45, 470 xp, F, class=Rogue, sort=ROGUE)
  - start: Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - end:   Zan Shivsproket [npc 6777] @ Alterac Mountains 86.0,80.0
  - text: Bring the Talisman of Kazdor to Zan Shivsprocket in the basement of Ravenholdt Manor.

## 80454 One Last Drop  (L50 req45, 4700 xp, F, class=Rogue, sort=ROGUE)
  - start: Zan Shivsproket [npc 6777] @ Alterac Mountains 86.0,80.0
  - end:   Dead Drop [object 410369] @ Silverpine Forest 47.1,71.0
  - text: Take the Modified Talisman to Caius' dead drop near Pyrewood Village.

## 80526 Fool Me Twice  (L50 req45, 470 xp, F, class=Rogue, sort=ROGUE)
  - start: Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - end:   Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - next=80411
  - text: Speak to Fahrad when you're ready to hear his plan.

## 8234 Sealed Azure Bag  (L52 req50, 5100 xp, class=Rogue, sort=ROGUE)
  - start: Lord Jorach Ravenholdt [npc 6768] @ Alterac Mountains 86.0,78.9
  - end:   Archmage Xylem [npc 8379] @ Azshara 29.2,40.2
  - pre(any)=[8233], next=8235
  - text: Retrieve the Sealed Azure Bag from the Timbermaw Shaman in Azshara. Then take the bag to Archmage Xylem, also found in Azshara.
  - objectives:
    1. item 1x Sealed Azure Bag <- Timbermaw Shaman [npc 6188] L50-51 ~Azshara 44,24 (31 spawns); Blackmaw Shaman [npc 237736] L50-51 ~Azshara 45,26 (110 spawns)

## 96772 The Dragon's Journal  (L53 req46, ? xp, F)
  - start: Archmage Lan'dalock [npc 20735] @ Alterac Mountains 15.3,73.9
  - end:   Archmage Lan'dalock [npc 20735] @ Alterac Mountains 15.3,73.9
  - text: Recover Zarla's Journal from the depths of Alcaz Prison.
  - objectives:
    1. item 1x Zarla's Journal <- Blazeroar [npc 255702] LNone-None

## 97173 Blackmaw Magic  (L59 req52, ? xp, F)
  - start: Archmage Timear [npc 31439] @ Alterac Mountains 15.4,74.1
  - end:   Archmage Timear [npc 31439] @ Alterac Mountains 15.4,74.1
  - text: Recover a Blackmaw Ritual Totem from Blackmaw Hold.
  - objectives:
    1. item 1x Blackmaw Ritual Totem <- Elder Shaman Bloodmane [npc 247209] LNone-None

## 6701 Syndicate Emblems  (L60 req24, ? xp, class=Rogue, sort=ROGUE, repeatable)
  - start: Ravenholdt Guard [npc 6766] @ Alterac Mountains 81.5,76.9 (+6 spawns)
  - end:   Ravenholdt Guard [npc 6766] @ Alterac Mountains 81.5,76.9 (+6 spawns)
  - pre(any)=[6681]
  - objectives:
    1. item 1x Syndicate Emblem <- Syndicate Assassin [npc 2246] L38-39 ~Alterac Mountains 40,17 (16 spawns); Syndicate Conjuror [npc 2590] L35-36 ~Arathi Highlands 27,64 (12 spawns); Syndicate Footpad [npc 2240] L32-33 ~Alterac Mountains 54,72 (11 spawns); Syndicate Highwayman [npc 2586] L30-31 ~Arathi Highlands 32,29 (23 spawns)

## 8249 Junkboxes Needed  (L60 req50, ? xp, sort=ROGUE, repeatable)
  - start: Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - end:   Fahrad [npc 6707] @ Alterac Mountains 84.5,80.3
  - objectives:
    1. item 1x Heavy Junkbox <- Theramore Guard [npc 4979] L53-57 ~Dustwallow Marsh 67,50 (32 spawns); Irondeep Trogg [npc 10987] L52-53 ~Alterac Valley 51,7 (46 spawns); Irondeep Skullthumper [npc 11602] L54-55 ~Alterac Valley 51,7 (34 spawns); Taskmaster Snivvle [npc 11677] L58-58 ~Alterac Valley 44,68 (2 spawns)

## 9029 A Bubbling Cauldron  (L60 req1, ? xp, sort=SEASONAL)
  - start: Fragrant Cauldron [object 181073] @ Alterac Mountains 89.4,75.1
  - end:   Fragrant Cauldron [object 181073] @ Alterac Mountains 89.4,75.1
  - pre(any)=[8984, 9028]

## 99191 A Donation of Wool  (L60 req12, ? xp, F)
  - start: Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - end:   Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - objectives:
    1. item 1x Wool Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns)

## 99192 A Donation of Silk  (L60 req26, ? xp, F)
  - start: Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - end:   Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - objectives:
    1. item 1x Silk Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns)

## 99193 A Donation of Mageweave  (L60 req40, ? xp, F)
  - start: Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - end:   Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - objectives:
    1. item 1x Mageweave Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Solid Chest [object 2855] ~Alterac Mountains 51,46 (8 spawns); Solid Chest [object 2857] ~Alterac Mountains 42,31 (9 spawns); Solid Chest [object 4149] ~Dustwallow Marsh 48,57 (105 spawns)

## 99194 A Donation of Runecloth  (L60 req50, ? xp, F)
  - start: Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - end:   Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - pre(all)=[99191, 99192, 99193], next=99195
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 99195 Additional Runecloth  (L60 req50, ? xp, F, repeatable)
  - start: Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - end:   Belanaa Windveil [npc 276170] @ Alterac Mountains 11.7,57.8
  - pre(any)=[99194]
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

# Service NPCs

- Bro'kin <Alchemy Supplies> [npc 2480] 38.2,38.9: vendor
- Rizz Loosebolt <Engineering Supplies> [npc 2684] 47.3,35.2: vendor
- Spirit Healer <> [npc 6491] 42.9,38.0: spiritHealer
- Fahrad <Grand Master Rogue> [npc 6707] 84.5,80.3: trainer
- Zan Shivsproket <Specialty Engineer> [npc 6777] 86.0,80.0: vendor
- Smudge Thunderwood <Poison Vendor> [npc 6779] 86.1,79.6: vendor
- Thanthaldis Snowgleam <Stormpike Supply Officer> [npc 13217] 39.5,81.7: repair, vendor
- Mirvyna Jinglepocket <Smokywood Pastures> [npc 14961] 40.0,80.2: vendor
- Dillord Copperpinch <Smokywood Pastures> [npc 14962] 62.0,58.6: vendor
- Alliance Brigadier General <> [npc 15351] 39.3,82.3: vendor
- Amisi Azuregaze <Innkeeper> [npc 28687] 18.2,66.6: innkeeper
- Alard Schmied <Blacksmith> [npc 28694] 19.7,63.4: trainer
- Elizabeth Ross <Tabard Vendor> [npc 28776] 15.8,69.0: vendor
- Aemara <Bowyer> [npc 28989] 17.2,71.5: repair, vendor
- Anthony Durain <Shields> [npc 28990] 20.1,63.7: repair, vendor
- Arille Azuregaze <Bartender> [npc 29049] 18.5,65.7: vendor
- Karandonna <Clothier> [npc 29491] 16.0,65.5: vendor
- "Baroness" Llana <> [npc 29534] 17.3,70.1: battlemaster
- Darahir <Reagents & Magical Goods> [npc 29537] 21.7,69.0: vendor
- Applebough <Fruit Vendor> [npc 29547] 14.4,66.0: vendor
- "Techs" Rickard Rustbolt <Warsong Gulch Battlemaster> [npc 29568] 16.2,66.2: battlemaster
- Archmage Alvareaux <Quartermaster> [npc 32287] 14.0,63.3: vendor
- Minzi the Minx <Arathi Basin Battlemaster> [npc 32330] 17.7,63.9: battlemaster
- Christi Stockton <Wine Vendor> [npc 32337] 20.1,67.3: vendor
- Sandra Bartan <Barmaid> [npc 32403] 18.2,66.3: vendor
- Afsaneh Asrar <Assistant Innkeeper> [npc 32411] 17.8,66.3: innkeeper
- Isirami Fairwind <Innkeeper> [npc 32413] 12.1,66.4: innkeeper, vendor
- Laire Brewgold <Brewmaiden> [npc 32424] 10.3,65.9: vendor
- Coira Longrifle <Brewmaiden> [npc 32426] 10.3,65.7: vendor
- Alfred Copperworth <Butler> [npc 32631] 15.3,56.5: vendor
- Bimble Sparkfingers <Darkspear Islands Battlemaster> [npc 32748] 17.6,67.9: battlemaster
- Linzy Blackbolt <Alchemist> [npc 246795] 18.5,62.4: trainer
- Jessa Weaver <Mage Trainer> [npc 246797] 17.7,69.5: trainer
- Talia Softglen <Stable Master> [npc 251953] 19.8,70.2: stableMaster
- Lucian Trias <Bread & Cheese Vendor> [npc 251955] 20.4,67.6: vendor
- Charles Worth <Expert Tailor> [npc 251972] 17.7,60.3: trainer
- Dominique Stefano <Tailoring Supplies> [npc 251973] 17.6,60.2: vendor
- Harold Winston <Jewelry Vendor> [npc 251975] 18.1,62.0: vendor
- Tiffany Cartier <Jewelry Vendor> [npc 251976] 18.1,62.1: vendor
- Angelique Butler <First Aid Trainer> [npc 251977] 17.1,61.1: trainer
- Vanessa Sellers <Enchanting Trainer> [npc 251978] 16.8,62.3: trainer
- Rueben Lauren <Cloth Armor Merchant> [npc 251980] 15.9,65.2: vendor
- Sheddle Glossgleam <Cobbler> [npc 251981] 16.5,65.5: vendor
- Norvin Alderman <Cloaks> [npc 251997] 16.0,65.5: vendor
- Debbi Moore <Trinkets & Charms> [npc 251999] 15.4,68.3: vendor
- Brammold Deepmine <Antiques> [npc 252000] 15.9,68.7: vendor
- Abra Cadabra <Wands> [npc 252019] 12.0,70.5: repair, vendor
- Jack Findle <Trade Supplies> [npc 252020] 13.2,71.6: vendor
- Hagatha Moorehead <Reagent Merchant> [npc 252040] 14.0,63.5: vendor
- Stefan Cotter <Bartender> [npc 252080] 12.9,66.7: vendor
- Derek Odds <Cooking Supplies> [npc 252083] 12.5,65.9: vendor
- Katherine Lee <Cooking Trainer> [npc 252084] 12.6,65.8: trainer
- Windle Sparkshine <> [npc 256372] 14.4,66.7: vendor
- Ajay Green <Bartender> [npc 265730] 14.4,64.7: vendor
- Paige <Chef> [npc 267000] 20.8,74.7: vendor
- Cody <Baker> [npc 267001] 21.7,74.4: vendor
- Alfina Nightgaze <Druid Trainer> [npc 270459] 11.8,56.6: trainer
- Spellweaver Thaldris <Transmogrifier> [npc 270513] 17.8,60.6: transmogrifier
- Edward Egan <Herbalist> [npc 275321] 18.4,63.2: trainer
- Patricia Egan <Alchemist> [npc 275322] 18.5,62.4: trainer
- Rafael Langrom <Leather Armor Merchant> [npc 275596] 12.7,71.0: repair
- Valerie Langrom <Leather Armor Merchant> [npc 275598] 12.6,71.1: repair, vendor
- Bragund Brightlink <Mail Armor Merchant> [npc 275603] 12.5,71.1: repair
- Kerta the Bold <Axe & Polearm Merchant> [npc 275622] 14.7,70.8: repair, vendor
- Valaden Silverblade <Sword Merchant> [npc 275623] 14.7,71.3: repair, vendor
- Bartram Haller <Dagger & Fist Weapon Merchant> [npc 275625] 14.7,71.2: repair, vendor
- Walther Whiteford <Mace Merchant> [npc 275626] 14.8,71.1: repair, vendor
- Barber <> [npc 400001] 19.8,66.4: barber
