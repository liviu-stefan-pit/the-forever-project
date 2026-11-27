# Westfall: Alliance + neutral quests (65)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 3861 CLUCK!  (L1 req1, 10 xp, sort=SPECIAL, repeatable)
  - start: Chicken [npc 620] @ Westfall 48.7,21.3 (+27 spawns)
  - end:   Chicken [npc 620] @ Westfall 48.7,21.3 (+27 spawns)
  - text: Find some Special Chicken Feed and return to your befriended chicken. When you find it, /cheer at it before trying to give it the Special Chicken Feed.
  - objectives:
    1. item 1x Special Chicken Feed <- ?

## 184 Furlbrow's Deed  (L9 req8, 590 xp)
  - start: item Westfall Deed [1972] (drops from Defias Bandit, Defias Rogue Wizard, Defias Ambusher)
  - end:   Farmer Furlbrow [npc 237] @ Westfall 60.0,19.4
  - text: Bring Furlbrow's Deed to Farmer Furlbrow.

## 36 Westfall Stew  (L10 req9, 420 xp)
  - start: Verna Furlbrow [npc 238] @ Westfall 59.9,19.4
  - end:   Salma Saldean [npc 235] @ Westfall 56.4,30.5
  - next=38
  - text: Verna Furlbrow wants you to deliver her recipe for Westfall Stew to Salma Saldean.

## 6181 A Swift Message  (L10 req10, 210 xp, races=Human)
  - start: Quartermaster Lewis [npc 491] @ Westfall 57.0,47.2
  - end:   Thor [npc 523] @ Westfall 56.5,52.6
  - next=6281
  - text: Bring Lewis' Note to Thor the gryphon master.

## 6261 Dungar Longdrink  (L10 req10, 210 xp, races=Human)
  - start: Osric Strang [npc 1323] @ Stormwind City 77.2,61.0
  - end:   Dungar Longdrink [npc 352] @ Stormwind City 71.3,72.2
  - pre(any)=[6281], next=6285
  - text: Bring Osric's Crate to Dungar Longdrink the gryphon master.

## 6281 Continue to Stormwind  (L10 req10, 420 xp, races=Human)
  - start: Thor [npc 523] @ Westfall 56.5,52.6
  - end:   Osric Strang [npc 1323] @ Stormwind City 77.2,61.0
  - pre(any)=[6181], next=6261
  - text: Buy a gryphon ride from the gryphon master Thor, then bring Lewis' Note to Osric Strang, in the shop Limited Immunity, in the Old Town of Stormwind.

## 6285 Return to Lewis  (L10 req10, 1050 xp, races=Human)
  - start: Dungar Longdrink [npc 352] @ Stormwind City 71.3,72.2
  - end:   Quartermaster Lewis [npc 491] @ Westfall 57.0,47.2
  - pre(any)=[6261]
  - text: Buy a gryphon ride to Sentinel Hill from the gryphon master Dungar Longdrink, then take Osric's Crate to Lewis at Sentinel Hill.

## 92109 My First Alchemy Set  (L10 req10, 420 xp, F)
  - start: Odd Child [npc 249713] @ Westfall 42.8,72.8
  - end:   Odd Child [npc 249713] @ Westfall 42.8,72.8
  - next=92110
  - text: Bring 5 Empty Vials, 5 Silverleaf, and 5 Peacebloom to the young, aspiring alchemist inside the barn of Moonbrook in Westfall.
  - objectives:
    1. item 5x Empty Vial <- ?
    2. item 1x Peacebloom <- Lasher Sproutling [npc 275703] L6-7 ~Teldrassil 57,69 (176 spawns); Blooming Lasher [npc 275708] L9-10 ~Teldrassil 43,36 (126 spawns); Wrathvine [npc 276099] L8-8 ~Teldrassil 56,70 (33 spawns); Peacebloom [object 1618] ~Westfall 51,47 (19 spawns)
    3. item 1x Silverleaf <- Forest Spider [npc 30] L5-6 ~Elwynn Forest 37,69 (16 spawns); Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Mine Spider [npc 43] L7-9 ~Elwynn Forest 61,47 (8 spawns); Murloc Forager [npc 46] L9-10 ~Elwynn Forest 75,64 (58 spawns)

## 92110 My First Real Potion  (L10 req10, 420 xp, F)
  - start: Odd Child [npc 249713] @ Westfall 42.8,72.8
  - end:   Odd Child [npc 249713] @ Westfall 42.8,72.8
  - pre(any)=[92109]
  - text: Gather 3 Murloc Eyes for the young, aspiring alchemist inside the barn of Moonbrook in Westfall.
  - objectives:
    1. item 3x Murloc Eye <- Gobbler [npc 1259] L22-22 ~Wetlands 17,41 (2 spawns); Bluegill Raider [npc 1418] L28-29 ~Wetlands 17,49 (44 spawns); Murloc Tidehunter [npc 127] L18-19 ~Westfall 30,77 (22 spawns); Greymist Hunter [npc 2206] L16-17 ~Darkshore 35,79 (8 spawns)

## 12 The People's Militia  (L12 req9, 910 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - next=13
  - text: Gryan Stoutmantle wants you to kill 15 Defias Trappers and 15 Defias Smugglers then return to him on Sentinel Hill.
  - objectives:
    1. kill 15x Defias Trapper <- Defias Trapper [npc 504] L12-13 ~Westfall 43,35 (39 spawns)
    2. kill 15x Defias Smuggler <- Defias Smuggler [npc 95] L11-12 ~Westfall 46,31 (44 spawns)

## 22 Goretusk Liver Pie  (L12 req9, 910 xp)
  - start: Salma Saldean [npc 235] @ Westfall 56.4,30.5
  - end:   Salma Saldean [npc 235] @ Westfall 56.4,30.5
  - text: Salma Saldean needs 8 Goretusk livers to make a Goretusk Liver Pie.
  - objectives:
    1. item 8x Goretusk Liver <- Goretusk [npc 157] L14-15 ~Westfall 44,54 (54 spawns); Bellygrub [npc 345] L24-24 ~Redridge Mountains 11,49 (1 spawns); Young Goretusk [npc 454] L12-13 ~Westfall 51,31 (45 spawns); Great Goretusk [npc 547] L16-17 ~Westfall 60,62 (16 spawns)

## 64 The Forgotten Heirloom  (L12 req9, 910 xp)
  - start: Farmer Furlbrow [npc 237] @ Westfall 60.0,19.4
  - end:   Farmer Furlbrow [npc 237] @ Westfall 60.0,19.4
  - text: Farmer Furlbrow wants you to retrieve his pocket watch from the wardrobe in his farmhouse at the pumpkin farm to the West.
  - objectives:
    1. item 1x Furlbrow's Pocket Watch <- Furlbrow's Wardrobe [object 290] ~Westfall 49,19 (1 spawns)

## 92742 Testing the Wells  (L12 req9, 455 xp, F)
  - start: Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - end:   Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - text: Use the Well Water Sample Kit to collect samples from the wells at the Jansen Stead and the Molsen Farm.
  - objectives:
    1. item 1x Jansen Stead Water Sample <- Jansen Stead Water Well [object 460005] ~Westfall 57,19 (1 spawns)
    2. item 1x Molsen Farm Water Sample <- Molsen Farm Water Well [object 460006] ~Westfall 46,38 (1 spawns)

## 92744 Murloc Gills  (L12 req9, 455 xp, F)
  - start: Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - end:   Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - text: Alba Fairmoon wants you to collect 7 Longshore Murloc Gills along the shoreline of Westfall.
  - objectives:
    1. item 7x Longshore Murloc Gill <- Murloc Coastrunner [npc 126] L12-13 ~Westfall 48,9 (25 spawns); Murloc Tidehunter [npc 127] L18-19 ~Westfall 30,77 (22 spawns); Murloc Warrior [npc 171] L15-16 ~Westfall 29,36 (33 spawns); Murloc Minor Oracle [npc 456] L12-14 ~Westfall 37,14 (23 spawns)

## 38 Westfall Stew  (L13 req9, 910 xp)
  - start: Salma Saldean [npc 235] @ Westfall 56.4,30.5
  - end:   Salma Saldean [npc 235] @ Westfall 56.4,30.5
  - pre(any)=[36]
  - text: Salma Saldean wants 3 Stringy Vulture Meat, 3 Goretusk Snouts, 3 Murloc Eyes, 3 Okra.
  - objectives:
    1. item 3x Stringy Vulture Meat <- Greater Fleshripper [npc 154] L16-17 ~Westfall 53,54 (13 spawns); Young Fleshripper [npc 199] L10-11 ~Westfall 51,29 (35 spawns); Vultros [npc 462] L26-26 ~Westfall 53,54 (16 spawns); Fleshripper [npc 1109] L13-14 ~Westfall 43,50 (46 spawns)
    2. item 1x Murloc Eye <- Gobbler [npc 1259] L22-22 ~Wetlands 17,41 (2 spawns); Bluegill Raider [npc 1418] L28-29 ~Wetlands 17,49 (44 spawns); Murloc Tidehunter [npc 127] L18-19 ~Westfall 30,77 (22 spawns); Greymist Hunter [npc 2206] L16-17 ~Darkshore 35,79 (8 spawns)
    3. item 1x Goretusk Snout <- Goretusk [npc 157] L14-15 ~Westfall 44,54 (54 spawns); Young Goretusk [npc 454] L12-13 ~Westfall 51,31 (45 spawns)
    4. item 1x Okra <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Rusty Harvest Golem [npc 480] L9-10 ~Westfall 56,22 (16 spawns)

## 98021 Journey to Sentinel Hill  (L13 req7, 455 xp, F, races=Skyborne)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[94947]
  - text: Report To Gryan Stoutmantle at Sentinel Hill in Westfall.

## 13 The People's Militia  (L14 req9, 980 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[12], next=14
  - text: Gryan Stoutmantle wants you to kill 15 Defias Pillagers and 15 Defias Looters and return to him on Sentinel Hill.
  - objectives:
    1. kill 15x Defias Pillager <- Defias Pillager [npc 589] L14-15 ~Westfall 38,61 (45 spawns)
    2. kill 15x Defias Looter <- Defias Looter [npc 590] L13-14 ~Westfall 39,60 (40 spawns)

## 102 Patrolling Westfall  (L14 req8, 980 xp)
  - start: Captain Danuvin [npc 821] @ Westfall 56.4,47.6
  - end:   Captain Danuvin [npc 821] @ Westfall 56.4,47.6
  - text: Bring 8 Gnoll Paws to Captain Danuvin on Sentinel Hill.
  - objectives:
    1. item 8x Gnoll Paw <- Riverpaw Taskmaster [npc 98] L17-18 ~Westfall 62,74 (46 spawns); Riverpaw Gnoll [npc 117] L11-12 ~Westfall 49,15 (24 spawns); Riverpaw Mongrel [npc 123] L13-14 ~Westfall 32,49 (45 spawns); Riverpaw Brute [npc 124] L15-16 ~Westfall 40,66 (26 spawns)

## 151 Poor Old Blanchy  (L14 req9, 1250 xp)
  - start: Verna Furlbrow [npc 238] @ Westfall 59.9,19.4
  - end:   Verna Furlbrow [npc 238] @ Westfall 59.9,19.4
  - text: Verna Furlbrow in Westfall wants you to bring her 8 Handfuls of Oats.
  - objectives:
    1. item 8x Handful of Oats <- Sack of Oats [object 2724] ~Westfall 48,38 (130 spawns); Noggle's Satchel [object 74731]

## 92745 The State of the Mines  (L14 req9, 490 xp, F)
  - start: Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - end:   Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - pre(all)=[92742, 92744], next=92747
  - text: Slay 4 Kobold Diggers in the Jangolode Mine and 6 Riverpaw Miners in the Gold Coast Quarry.
  - objectives:
    1. kill 4x Kobold Digger <- Kobold Digger [npc 1236] L12-13 ~Westfall 45,20 (7 spawns)
    2. kill 1x Riverpaw Miner <- Riverpaw Miner [npc 1426] L14-15 ~Westfall 30,48 (8 spawns)

## 9 The Killing Fields  (L15 req8, 1050 xp)
  - start: Farmer Saldean [npc 233] @ Westfall 56.0,31.2
  - end:   Farmer Saldean [npc 233] @ Westfall 56.0,31.2
  - text: Farmer Saldean wants you to kill 20 Harvest Watchers.
  - objectives:
    1. kill 20x Harvest Watcher <- Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns)

## 117 Thunderbrew  (L15 req10, ? xp, repeatable)
  - start: Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - end:   Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - text: Bring Grimbooze Thunderbrew 5 hops to complete his special brew.
  - objectives:
    1. item 1x Hops <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Rusty Harvest Golem [npc 480] L9-10 ~Westfall 56,22 (16 spawns)

## 153 Red Leather Bandanas  (L15 req10, 1050 xp)
  - start: Scout Galiaan [npc 878] @ Westfall 54.0,53.0
  - end:   Scout Galiaan [npc 878] @ Westfall 54.0,53.0
  - text: Bring 15 Red Leather Bandanas to Scout Galiaan at Sentinel Hill.
  - objectives:
    1. item 15x Red Leather Bandana <- Defias Smuggler [npc 95] L11-12 ~Westfall 46,31 (44 spawns); Defias Pathstalker [npc 121] L15-16 ~Westfall 43,75 (11 spawns); Defias Highwayman [npc 122] L17-18 ~Westfall 47,77 (26 spawns); Defias Knuckleduster [npc 449] L15-17 ~Westfall 45,75 (15 spawns)

## 92747 Moonbrook Espionage  (L15 req9, 800 xp, F)
  - start: Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - end:   Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - pre(any)=[92745], next=92748
  - text: Collect 8 Suspicious Industrial Supplies from Moonbrook.
  - objectives:
    1. item 8x Suspicious Industrial Supplies <- Suspicious Crate [object 581777] ~Westfall 43,69 (10 spawns)

## 92909 Harvesting the Harvesters  (L15 req8, 800 xp, F)
  - start: Ozwin Ironsprocket [npc 253395] @ Westfall 51.5,32.3
  - end:   Ozwin Ironsprocket [npc 253395] @ Westfall 51.5,32.3
  - text: Ozwin Ironsprocket at Saldean's Farm wants you to bring him 14 Golem Isosprings and 5 Harvester Gyrostabilizers.
  - objectives:
    1. item 14x Golem Isospring <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Rusty Harvest Golem [npc 480] L9-10 ~Westfall 56,22 (16 spawns)
    2. item 1x Harvester Gyrostabilizer <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Bulky Protective Ironweave [npc 211953] L60-60 ~Westfall 54,44 (3 spawns)

## 92910 Harvesting the Harvesters  (L15 req8, 800 xp, F)
  - start: item Precessive Autocognition Assembly [255155] (drops from Harvest Golem, Harvest Watcher, Harvest Reaper)
  - end:   Ozwin Ironsprocket [npc 253395] @ Westfall 51.5,32.3
  - next=92911
  - text: Bring the Precessive Autocognition Assembly to Ozwin Ironsprocket at Saldean's Farm.

## 92911 Harvesting the Harvesters  (L15 req8, 1050 xp, F)
  - start: Ozwin Ironsprocket [npc 253395] @ Westfall 51.5,32.3
  - end:   Ozwin Ironsprocket [npc 253395] @ Westfall 51.5,32.3
  - pre(any)=[92910]
  - text: Ozwin Ironsprocket at Saldean's Farm wants you to bring him 8 Golem Isosprings, 4 Copper Modulators, and a Crude Scope.
  - objectives:
    1. item 8x Golem Isospring <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Rusty Harvest Golem [npc 480] L9-10 ~Westfall 56,22 (16 spawns)
    2. item 1x Copper Modulator <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Murloc Hunter [npc 458] L16-17 ~Westfall 27,45 (33 spawns)
    3. item 1x Crude Scope <- Murloc Hunter [npc 458] L16-17 ~Westfall 27,45 (33 spawns); Murloc Netter [npc 513] L14-15 ~Westfall 35,19 (30 spawns); Defias Pillager [npc 589] L14-15 ~Westfall 38,61 (45 spawns); Defias Looter [npc 590] L13-14 ~Westfall 39,60 (40 spawns)

## 93928 Of Mice and Milk  (L15 req15, 105 xp, F)
  - start: Mouse [npc 6271] @ Westfall 35.9,76.6 (+3 spawns)
  - end:   Hemet Nesingwary [npc 715] @ Stranglethorn Vale 35.7,10.8
  - text: Get the mouse a cookie.

## 103 Keeper of the Flame  (L16 req10, 1150 xp)
  - start: Captain Grayson [npc 392] @ Westfall 30.0,86.0
  - end:   Captain Grayson [npc 392] @ Westfall 30.0,86.0
  - text: Bring 5 Flasks of Oil to Captain Grayson at the Westfall Lighthouse.
  - objectives:
    1. item 1x Flask of Oil <- Harvest Golem [npc 36] L11-12 ~Westfall 45,43 (28 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Harvest Reaper [npc 115] L17-18 ~Westfall 64,61 (10 spawns); Rusty Harvest Golem [npc 480] L9-10 ~Westfall 56,22 (16 spawns)

## 136 Captain Sander's Hidden Treasure  (L16 req10, 580 xp)
  - start: item Captain Sander's Treasure Map [1357] (drops from Murloc Coastrunner, Murloc Tidehunter, Murloc Warrior)
  - end:   Captain's Footlocker [object 35] @ Westfall 25.9,47.8
  - next=138
  - text: Find Captain Sanders' footlocker and search it for the next clue.

## 138 Captain Sander's Hidden Treasure  (L16 req10, 580 xp)
  - start: Captain's Footlocker [object 35] @ Westfall 25.9,47.8
  - end:   Broken Barrel [object 36] @ Westfall 40.5,47.8
  - pre(any)=[136], next=139
  - text: Find the old barrel near the ruined chimney and search it for your next clue.

## 139 Captain Sander's Hidden Treasure  (L16 req10, 580 xp)
  - start: Broken Barrel [object 36] @ Westfall 40.5,47.8
  - end:   Old Jug [object 34] @ Westfall 40.6,17.0
  - pre(any)=[138], next=140
  - text: Search the empty jug next to the windmill for the next clue.

## 140 Captain Sander's Hidden Treasure  (L16 req10, 1150 xp)
  - start: Old Jug [object 34] @ Westfall 40.6,17.0
  - end:   Locked Chest [object 33] @ Westfall 26.0,16.9
  - pre(any)=[139]
  - text: Locate Captain Sanders' chest and open it for your reward.

## 92748 Explosive Consultation  (L16 req9, 580 xp, F)
  - start: Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - end:   Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - pre(any)=[92747]
  - text: Travel to the Dwarven District in Stormwind and find an engineer who can help.

## 92749 A Dynamite Plan  (L16 req9, 580 xp, F)
  - start: Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - end:   Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - pre(any)=[92748]
  - text: Obtain 10 Rough Dynamite from crafting, trading, or the auction house, then return to Sprite Jumpsprocket in the Dwarven District of Stormwind.
  - objectives:
    1. item 10x Rough Dynamite <- ?

## 92750 Detonation at a Distance  (L16 req9, 115 xp, F)
  - start: Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - end:   Jasper Fel [npc 1325] @ Stormwind City 80.3,70.1
  - pre(any)=[92748], next=92751
  - text: Talk to someone in Stormwind Intelligence about acquiring a remote detonator.

## 92751 Detonation at a Distance  (L16 req9, 115 xp, F)
  - start: Jasper Fel [npc 1325] @ Stormwind City 80.3,70.1
  - end:   Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - pre(any)=[92750]
  - text: Bring the Remote Detonator Kit to Sprite Jumpsprocket in the Dwarven District of Stormwind.

## 92752 Explosive Consultation  (L16 req9, 580 xp, F)
  - start: Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - end:   Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - pre(all)=[92749, 92751], next=92753
  - text: Return to Alba Fairmoon in Westfall.

## 14 The People's Militia  (L17 req9, 1600 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[13]
  - text: Gryan Stoutmantle wants you to kill 15 Defias Highwaymen, 5 Defias Pathstalkers and 5 Defias Knuckledusters then return to him on Sentinel Hill.
  - objectives:
    1. kill 15x Defias Highwayman <- Defias Highwayman [npc 122] L17-18 ~Westfall 47,77 (26 spawns)
    2. kill 15x Defias Pathstalker <- Defias Pathstalker [npc 121] L15-16 ~Westfall 43,75 (11 spawns)
    3. kill 15x Defias Knuckleduster <- Defias Knuckleduster [npc 449] L15-17 ~Westfall 45,75 (15 spawns)

## 214 Red Silk Bandanas  (L17 req14, 1250 xp)
  - start: Scout Riell [npc 820] @ Westfall 56.7,47.4
  - end:   Scout Riell [npc 820] @ Westfall 56.7,47.4
  - pre(any)=[155]
  - text: Scout Riell at the Sentinel Hill Tower wants you to bring her 10 Red Silk Bandanas.
  - objectives:
    1. item 10x Red Silk Bandana <- Defias Henchman [npc 594] L15-16 ~Westfall 43,75 (5 spawns); Defias Miner [npc 598] L18-18; Defias Conjurer [npc 619] L15-16 ~Westfall 42,76 (3 spawns); Defias Overseer [npc 634] L17-18

## 65 The Defias Brotherhood  (L18 req14, 1350 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Wiley the Black [npc 266] @ Redridge Mountains 21.4,45.4
  - next=132
  - text: Gryan Stoutmantle wants you to talk to Wiley in Lakeshire.

## 132 The Defias Brotherhood  (L18 req14, 680 xp)
  - start: Wiley the Black [npc 266] @ Redridge Mountains 21.4,45.4
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[65], next=135
  - text: Take Wiley's Note to Gryan Stoutmantle in Westfall.

## 135 The Defias Brotherhood  (L18 req14, 680 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[132], next=141
  - text: Take Wiley's Note to Mathias Shaw in Stormwind.

## 141 The Defias Brotherhood  (L18 req14, 340 xp)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[135], next=142
  - text: Take Shaw's report to Gryan Stoutmantle in Westfall.

## 142 The Defias Brotherhood  (L18 req14, 1350 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[141], next=155
  - text: Track down the Defias Messenger in Westfall and bring his message to Stoutmantle.
  - objectives:
    1. item 1x A Mysterious Message <- Defias Messenger [npc 550] L14-15 ~Westfall 45,69 (1 spawns)

## 155 The Defias Brotherhood  (L18 req14, 1700 xp)
  - start: The Defias Traitor [npc 467] @ Westfall 55.7,47.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[142], next=166
  - text: Escort the Defias Traitor to the secret hideout of the Defias Brotherhood. Once the Defias Traitor shows you where VanCleef and his men are hiding out, return to Gryan Stoutmantle with the information.

## 168 Collecting Memories  (L18 req14, 1350 xp)
  - start: Wilder Thistlenettle [npc 656] @ Stormwind City 70.3,40.8
  - end:   Wilder Thistlenettle [npc 656] @ Stormwind City 70.3,40.8
  - text: Retrieve 4 Miners' Union Cards and return them to Wilder Thistlenettle in Stormwind.
  - objectives:
    1. item 4x Miners' Union Card <- Skeletal Miner [npc 623] L17-18 ~Westfall 41,82 (9 spawns); Undead Excavator [npc 624] L17-18 ~Westfall 41,82 (5 spawns); Undead Dynamiter [npc 625] L17-18 ~Westfall 42,82 (6 spawns)

## 92753 Destruction in Deadmines  (L18 req9, ? xp, F)
  - start: Alba Fairmoon [npc 253092] @ Westfall 52.5,53.0
  - end:   Alba Fairmoon [npc 253279] @ Westfall 38.7,83.7
  - pre(any)=[92752], next=92819
  - text: Find the forge hidden in the Deadmines, and plant the Extra-Destructive Explosives nearby. Then, meet up with Alba Fairmoon at the Deadmines exit.
  - objectives:
    1. kill 1x [DNT] Kill Credit: Place Explosives <- [DNT] Kill Credit: Place Explosives [npc 253370] LNone-None

## 92819 Destruction in Deadmines  (L18 req9, 135 xp, F)
  - start: Alba Fairmoon [npc 253279] @ Westfall 38.7,83.7
  - end:   Alba Fairmoon [npc 253279] @ Westfall 38.7,83.7
  - pre(any)=[92753]
  - text: Use the detonator.
  - objectives:
    1. object 1x Detonator <- Detonator [object 581792] ~Westfall 39,84 (1 spawns)

## 152 The Coast Isn't Clear  (L19 req10, 1450 xp)
  - start: Captain Grayson [npc 392] @ Westfall 30.0,86.0
  - end:   Captain Grayson [npc 392] @ Westfall 30.0,86.0
  - text: Kill 7 Tidehunters, 7 Warriors, 7 Oracles and 7 Coastrunners and return to Captain Grayson at the Westfall Lighthouse.
  - objectives:
    1. kill 1x Murloc Coastrunner <- Murloc Coastrunner [npc 126] L12-13 ~Westfall 48,9 (25 spawns)
    2. kill 1x Murloc Warrior <- Murloc Warrior [npc 171] L15-16 ~Westfall 29,36 (33 spawns)
    3. kill 1x Murloc Tidehunter <- Murloc Tidehunter [npc 127] L18-19 ~Westfall 30,77 (22 spawns)
    4. kill 1x Murloc Oracle <- Murloc Oracle [npc 517] L16-18 ~Westfall 28,68 (28 spawns)

## 104 The Coastal Menace  (L20 req15, 1550 xp)
  - start: Captain Grayson [npc 392] @ Westfall 30.0,86.0
  - end:   Captain Grayson [npc 392] @ Westfall 30.0,86.0
  - text: Bring a scale of Old Murk-Eye to Captain Grayson at the Westfall Lighthouse.
  - objectives:
    1. item 1x Scale of Old Murk-Eye <- Old Murk-Eye [npc 391] L20-20 ~Westfall 29,76 (1 spawns)

## 167 Oh Brother. . .  (L20 req15, 1550 xp)
  - start: Wilder Thistlenettle [npc 656] @ Stormwind City 70.3,40.8
  - end:   Wilder Thistlenettle [npc 656] @ Stormwind City 70.3,40.8
  - text: Bring Foreman Thistlenettle's Explorers' League Badge to Wilder Thistlenettle in Stormwind.
  - objectives:
    1. item 1x Thistlenettle's Badge <- Foreman Thistlenettle [npc 626] L20-20 ~Westfall 42,83 (1 spawns)

## 2040 Underground Assault  (L20 req15, 1550 xp)
  - start: Shoni the Shilent [npc 6579] @ Stormwind City 62.6,34.1
  - end:   Shoni the Shilent [npc 6579] @ Stormwind City 62.6,34.1
  - text: Retrieve the Gnoam Sprecklesprocket from the Deadmines and return it to Shoni the Shilent in Stormwind.
  - objectives:
    1. item 1x Gnoam Sprecklesprocket <- Sneed's Shredder [npc 642] L20-20

## 166 The Defias Brotherhood  (L22 req14, 2600 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[155]
  - text: Kill Edwin VanCleef and bring his head to Gryan Stoutmantle.
  - objectives:
    1. item 1x Head of VanCleef <- Edwin VanCleef [npc 639] L21-21

## 79008 ... and that note you found  (L22 req14, 1750 xp, F)
  - start: Burned-Out Remains [object 415107] @ Westfall 37.4,50.7
  - end:   Burned-Out Remains [object 415106] @ The Barrens 46.4,73.9; Nailed Plank [object 417072] @ The Barrens 46.4,73.8
  - next=79192
  - text: Charred remains of the note serve as your only guide.

## 94503 Call of Water  (L23 req20, 185 xp, F, races=Dwarf, class=Shaman, sort=SHAMAN)
  - start: Forgotten Shrine [object 619896] @ Westfall 45.6,59.9
  - end:   Minor Manifestation of Water [npc 5895] @ Silverpine Forest 38.6,44.6
  - pre(any)=[94502], next=94505
  - text: Speak to the Minor Manifestation of Water in Westfall.

## 2359 Klaven's Tower  (L24 req20, 1950 xp, class=Rogue, sort=ROGUE)
  - start: Agent Kearnen [npc 7024] @ Westfall 68.5,70.1
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[2360], next=2607
  - text: Steal the Defias Tower Key, break into the Defias Tower and uncover the contents of the Duskwood Chest. Take whatever information you find back to Mathias Shaw in Stormwind. Read Kearnen's Journal to gain insight about the tower.
  - objectives:
    1. item 1x Klaven Mortwake's Journal <- Duskwood Chest [object 123214] ~Westfall 70,74 (1 spawns)
    2. item 1x Defias Tower Key <- Malformed Defias Drone [npc 7051] L23-24 ~Westfall 69,74 (1 spawns)

## 1651 The Tome of Valor  (L25 req20, 1000 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Daphne Stilwell [npc 6182] @ Westfall 41.7,89.2
  - end:   Daphne Stilwell [npc 6182] @ Westfall 41.7,89.2
  - pre(any)=[1650], next=1652
  - text: Defend Daphne Stilwell from the Defias attack.
  - text: Neither of your spirits must be released from their mortal coils if you wish to succeed.
  - text: After you are successful, speak to Daphne Stilwell again.

## 1652 The Tome of Valor  (L25 req20, 2550 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Daphne Stilwell [npc 6182] @ Westfall 41.7,89.2
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - pre(any)=[1651], next=1653
  - text: Speak to Duthorian Rall in Stormwind.

## 48 Sweet Amber  (L44 req40, 3750 xp)
  - start: Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - end:   Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - next=49
  - text: Bring Holy Spring Water to Grimbooze Thunderbrew.
  - objectives:
    1. item 1x Holy Spring Water <- The Holy Spring [object 759] ~Stranglethorn Vale 29,62 (1 spawns)

## 49 Sweet Amber  (L44 req40, 4650 xp)
  - start: Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - end:   Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - pre(any)=[48], next=50
  - text: Grimbooze Thunderbrew wants a Sack of Barley, a Sack of Rye and a Sack of Corn.
  - objectives:
    1. item 1x Sack of Barley <- Sack of Barley [object 50936] ~Swamp of Sorrows 63,23 (1 spawns)
    2. item 1x Sack of Corn <- Sack of Corn [object 50935] ~Tanaris 66,37 (1 spawns)
    3. item 1x Sack of Rye <- Sack of Rye [object 50937] ~The Hinterlands 40,66 (1 spawns)

## 50 Sweet Amber  (L44 req40, 4650 xp)
  - start: Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - end:   Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - pre(any)=[49], next=51
  - text: Grimbooze Thunderbrew wants Truesilver.
  - objectives:
    1. item 1x Truesilver Bar <- Solid Chest [object 4149] ~Dustwallow Marsh 48,57 (105 spawns); Solid Chest [object 153451] ~Azshara 53,53 (51 spawns); Solid Chest [object 153453] ~Eastern Plaguelands 52,52 (53 spawns); Solid Chest [object 153454] ~Eastern Plaguelands 57,41 (29 spawns)

## 51 Sweet Amber  (L44 req40, 4650 xp)
  - start: Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - end:   Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - pre(any)=[50], next=53
  - text: Bring a Sycamore Branch to Grimbooze Thunderbrew.
  - objectives:
    1. item 1x A Sycamore Branch <- Cursed Sycamore [npc 5881] L45-45 ~Feralas 57,75 (1 spawns)

## 53 Sweet Amber  (L44 req40, 5600 xp)
  - start: Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - end:   Grimbooze Thunderbrew [npc 239] @ Westfall 44.6,80.2
  - pre(any)=[51]
  - text: Bring Grimbooze Thunderbrew a bundle of Charred Oak.
  - objectives:
    1. item 1x Bundle of Charred Oak <- The Charred Oak [object 50982] ~Searing Gorge 54,50 (1 spawns)

## 8675 Skychaser the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Skychaser [npc 15577] @ Westfall 56.6,47.1
  - end:   Elder Skychaser [npc 15577] @ Westfall 56.6,47.1

# Service NPCs

- Farmer Saldean <> [npc 233] 56.0,31.2: vendor
- Quartermaster Lewis <Quartermaster> [npc 491] 57.0,47.2: vendor
- Thor <Gryphon Master> [npc 523] 56.5,52.6: flightMaster
- Gina MacGregor <Trade Supplies> [npc 843] 57.6,54.0: vendor
- William MacGregor <Bowyer> [npc 1668] 57.7,53.9: repair, vendor
- Defias Profiteer <Free Wheeling Merchant> [npc 1669] 43.5,66.8: repair, vendor
- Mike Miller <Bread Merchant> [npc 1670] 57.8,53.7: vendor
- Kriggon Talsone <Fisherman> [npc 4305] 36.2,90.2: vendor
- Spirit Healer <> [npc 6491] 51.7,49.7: spiritHealer
- Innkeeper Heather <Innkeeper> [npc 8931] 52.9,53.7: innkeeper, vendor
- Christopher Hewen <General Trade Goods Vendor> [npc 8934] 52.2,52.8: vendor
- Kirk Maxwell <Stable Master> [npc 10045] 52.9,53.1: stableMaster
- Odd Child <> [npc 249713] 42.8,72.8: trainer
