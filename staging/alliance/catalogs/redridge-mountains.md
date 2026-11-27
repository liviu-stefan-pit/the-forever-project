# Redridge Mountains: Alliance + neutral quests (46)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 120 Messenger to Stormwind  (L14 req14, 490 xp)
  - start: Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - end:   General Marcus Jonathan [npc 466] @ Stormwind City 69.2,82.7
  - next=121
  - text: Magistrate Solomon has given you a report which must be delivered to General Marcus Jonathan in Stormwind. The judge wants you to return to him as soon as the delivery has been made.

## 121 Messenger to Stormwind  (L14 req14, 245 xp)
  - start: General Marcus Jonathan [npc 466] @ Stormwind City 69.2,82.7
  - end:   Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - pre(any)=[120], next=143
  - text: Take General Marcus Jonathan's letter of response to Magistrate Solomon in Lakeshire.

## 143 Messenger to Westfall  (L14 req14, 490 xp)
  - start: Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - pre(any)=[121], next=144
  - text: Magistrate Solomon wants you to take his written plea to Gryan Stoutmantle in Westfall.

## 144 Messenger to Westfall  (L14 req14, 245 xp)
  - start: Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - end:   Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - pre(any)=[143], next=145
  - text: Return to Magistrate Solomon with Gryan Stoutmantle's response.

## 116 Dry Times  (L15 req12, 1050 xp)
  - start: Barkeep Daniels [npc 346] @ Redridge Mountains 21.4,44.0
  - end:   Barkeep Daniels [npc 346] @ Redridge Mountains 21.4,44.0
  - text: Barkeep Daniels of Lakeshire needs a keg of Thunderbrew Lager, a cask of Merlot, a bottle of Moonshine and a skin of Sweet Rum.
  - objectives:
    1. item 1x Keg of Thunderbrew <- ?
    2. item 1x Cask of Merlot <- ?
    3. item 1x Bottle of Moonshine <- ?
    4. item 1x Skin of Sweet Rum <- ?

## 129 A Free Lunch  (L15 req12, 540 xp)
  - start: Darcy [npc 379] @ Redridge Mountains 21.5,44.3
  - end:   Guard Parker [npc 464] @ Redridge Mountains 10.4,71.3
  - next=130
  - text: Bring Parker's lunch to Guard Parker. He patrols the road leading to Darkshire.

## 130 Visit the Herbalist  (L15 req12, 270 xp)
  - start: Guard Parker [npc 464] @ Redridge Mountains 10.4,71.3
  - end:   Martie Jainrose [npc 342] @ Redridge Mountains 16.8,46.3
  - pre(any)=[129], next=131
  - text: Speak with the Redridge Herbalist, Martie Jainrose.

## 131 Delivering Daffodils  (L15 req12, 270 xp)
  - start: Martie Jainrose [npc 342] @ Redridge Mountains 16.8,46.3
  - end:   Darcy [npc 379] @ Redridge Mountains 21.5,44.3
  - pre(any)=[130]
  - text: Give Darcy the Daffodil Bouquet.

## 3741 Hilary's Necklace  (L15 req12, 1350 xp)
  - start: Shawn [npc 8965] @ Redridge Mountains 24.2,53.6
  - end:   Hilary [npc 8962] @ Redridge Mountains 24.1,53.6
  - text: Find Hilary's Necklace, and return it to Hilary in Lakeshire.
  - objectives:
    1. item 1x Hilary's Necklace <- Glinting Mud [object 154357] ~Redridge Mountains 24,54 (12 spawns)

## 125 The Lost Tools  (L16 req15, 880 xp)
  - start: Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - end:   Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - next=89
  - text: Foreman Oslow of Lakeshire wants you to retrieve his toolbox from the bottom of Lake Everstill.
  - objectives:
    1. item 1x Oslow's Toolbox <- Sunken Chest [object 32] ~Redridge Mountains 36,55 (1 spawns)

## 244 Encroaching Gnolls  (L16 req11, 290 xp)
  - start: Guard Parker [npc 464] @ Redridge Mountains 10.4,71.3
  - end:   Deputy Feldon [npc 1070] @ Redridge Mountains 25.6,60.0
  - next=246
  - text: Report to Deputy Feldon.

## 246 Assessing the Threat  (L17 req11, 950 xp)
  - start: Deputy Feldon [npc 1070] @ Redridge Mountains 25.6,60.0
  - end:   Deputy Feldon [npc 1070] @ Redridge Mountains 25.6,60.0
  - pre(any)=[244]
  - text: Kill 10 Redridge Mongrels and 6 Redridge Poachers, then report back to Deputy Feldon in Lakeshire.
  - objectives:
    1. kill 10x Redridge Mongrel <- Redridge Mongrel [npc 423] L15-16 ~Redridge Mountains 21,72 (18 spawns)
    2. kill 10x Redridge Poacher <- Redridge Poacher [npc 424] L16-17 ~Redridge Mountains 29,80 (17 spawns)

## 98407 Show of Force  (L17 req11, 950 xp, F)
  - start: Deputy Feldon [npc 1070] @ Redridge Mountains 25.6,60.0
  - end:   Deputy Feldon [npc 1070] @ Redridge Mountains 25.6,60.0
  - pre(any)=[244]
  - text: Collect 5 Spiked Collars from Redridge Thrashers for Deputy Feldon near Lakeshire.
  - objectives:
    1. item 5x Spiked Collar <- Redridge Thrasher [npc 712] L14-15 ~Redridge Mountains 13,67 (12 spawns)

## 92 Redridge Goulash  (L18 req15, 1350 xp)
  - start: Chef Breanna [npc 343] @ Redridge Mountains 17.6,43.8
  - end:   Chef Breanna [npc 343] @ Redridge Mountains 17.6,43.8
  - text: Chef Breanna of Lakeshire wants five pieces of Tough Condor Meat, five Great Goretusk Snouts and five helpings of Crisp Spider Meat.
  - objectives:
    1. item 1x Great Goretusk Snout <- Bellygrub [npc 345] L24-24 ~Redridge Mountains 11,49 (1 spawns); Great Goretusk [npc 547] L16-17 ~Redridge Mountains 24,55 (30 spawns); Snort [npc 258617] L38-38 ~Riverglades 67,17 (11 spawns)
    2. item 1x Tough Condor Meat <- Dire Condor [npc 428] L18-19 ~Redridge Mountains 48,57 (20 spawns)
    3. item 1x Crisp Spider Meat <- Venom Web Spider [npc 217] L19-20 ~Duskwood 39,34 (34 spawns); Tarantula [npc 442] L15-16 ~Redridge Mountains 11,78 (22 spawns); Greater Tarantula [npc 505] L19-20 ~Redridge Mountains 49,44 (14 spawns); Pygmy Venom Web Spider [npc 539] L18-19 ~Duskwood 33,36 (36 spawns)

## 118 The Price of Shoes  (L18 req14, 340 xp)
  - start: Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - end:   Smith Argus [npc 514] @ Elwynn Forest 41.7,65.5
  - next=119
  - text: Take Verner's Note to Smith Argus in Goldshire.

## 119 Return to Verner  (L18 req13, 680 xp)
  - start: Smith Argus [npc 514] @ Elwynn Forest 41.7,65.5
  - end:   Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - pre(any)=[118]
  - text: Return to Verner Osgood in Redridge. Give him the Crate of Horseshoes.

## 122 Underbelly Scales  (L18 req14, 1700 xp)
  - start: Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - end:   Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - pre(any)=[119]
  - text: Gather 6 Underbelly Whelp Scales from Black Dragon Whelps, and bring them to Verner Osgood in Redridge.
  - objectives:
    1. item 6x Underbelly Whelp Scale <- Black Dragon Whelp [npc 441] L17-18 ~Redridge Mountains 39,67 (34 spawns); Snarlflare [npc 14272] L18-18 ~Redridge Mountains 37,44 (12 spawns)

## 145 Messenger to Darkshire  (L18 req18, 1000 xp)
  - start: Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - end:   Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - pre(any)=[144], next=146
  - text: Magistrate Solomon wants you to take a letter to Lord Ebonlocke in Darkshire.

## 146 Messenger to Darkshire  (L18 req18, 340 xp)
  - start: Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - end:   Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - pre(any)=[145]
  - text: Return to Magistrate Solomon with Lord Ebonlocke's letter of response.

## 89 The Everstill Bridge  (L20 req15, 1550 xp)
  - start: Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - end:   Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - pre(any)=[125], next=98386
  - text: Bring 5 Iron Pikes and 5 Iron Rivets to Foreman Oslow in Lakeshire.
  - objectives:
    1. item 5x Iron Pike <- Redridge Brute [npc 426] L17-18 ~Redridge Mountains 24,35 (16 spawns); Redridge Mystic [npc 430] L18-19 ~Redridge Mountains 24,29 (28 spawns); Redridge Basher [npc 446] L19-20 ~Redridge Mountains 21,25 (35 spawns); Redridge Drudger [npc 580] L20-21 ~Redridge Mountains 14,19 (14 spawns)
    2. item 5x Iron Rivet <- Redridge Brute [npc 426] L17-18 ~Redridge Mountains 24,35 (16 spawns); Redridge Mystic [npc 430] L18-19 ~Redridge Mountains 24,29 (28 spawns); Redridge Basher [npc 446] L19-20 ~Redridge Mountains 21,25 (35 spawns); Redridge Drudger [npc 580] L20-21 ~Redridge Mountains 14,19 (14 spawns)

## 124 A Baying of Gnolls  (L20 req15, 1150 xp)
  - start: Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - end:   Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - pre(any)=[119], next=126
  - text: Kill 10 Redridge Brutes and 8 Redridge Mystics, then return to Verner Osgood.
  - objectives:
    1. kill 10x Redridge Brute <- Redridge Brute [npc 426] L17-18 ~Redridge Mountains 24,35 (16 spawns)
    2. kill 10x Redridge Mystic <- Redridge Mystic [npc 430] L18-19 ~Redridge Mountains 24,29 (28 spawns)

## 150 Murloc Poachers  (L20 req20, 1550 xp)
  - start: Dockmaster Baren [npc 381] @ Redridge Mountains 22.6,47.4
  - end:   Dockmaster Baren [npc 381] @ Redridge Mountains 22.6,47.4
  - text: Bring 8 Murloc Fins to Dockmaster Baren in Lakeshire.
  - objectives:
    1. item 8x Murloc Fin <- Murloc Flesheater [npc 422] L18-19 ~Redridge Mountains 47,61 (35 spawns); Murloc Nightcrawler [npc 544] L21-22 ~Redridge Mountains 76,59 (4 spawns); Murloc Tidecaller [npc 545] L19-20 ~Redridge Mountains 50,53 (33 spawns); Murloc Minor Tidecaller [npc 548] L17-18 ~Redridge Mountains 47,61 (35 spawns)

## 2282 Alther's Mill  (L20 req16, 1550 xp, class=Rogue, sort=ROGUE)
  - start: Lucius [npc 6966] @ Redridge Mountains 23.0,52.0
  - end:   Lucius [npc 6966] @ Redridge Mountains 23.0,52.0
  - pre(any)=[2281]
  - text: Open Lucius's Lockbox, recover the Token of Thievery and return it to Lucius in Lakeshire.
  - objectives:
    1. item 1x Token of Thievery <- Lucius's Lockbox [object 121264] ~Redridge Mountains 47,45 (1 spawns)

## 20 Blackrock Menace  (L21 req18, 1650 xp)
  - start: Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - end:   Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - text: Bring 10 Battleworn Axes to Marshal Marris in Lakeshire.
  - objectives:
    1. item 10x Battleworn Axe <- Blackrock Champion [npc 435] L24-25 ~Redridge Mountains 25,12 (24 spawns); Blackrock Shadowcaster [npc 436] L22-23 ~Redridge Mountains 59,50 (35 spawns); Blackrock Renegade [npc 437] L21-22 ~Redridge Mountains 56,44 (27 spawns); Blackrock Grunt [npc 440] L19-20 ~Redridge Mountains 57,59 (38 spawns)

## 94 A Watchful Eye  (L21 req20, 1250 xp)
  - start: Theocritus [npc 313] @ Elwynn Forest 65.2,69.7
  - end:   Old Lion Statue [object 31] @ Redridge Mountains 79.4,46.8
  - next=248
  - text: Take the Glyph of Azora to the Lion Statue near the Tower of Ilgalar in Redridge.

## 127 Selling Fish  (L21 req16, 1250 xp)
  - start: Dockmaster Baren [npc 381] @ Redridge Mountains 22.6,47.4
  - end:   Dockmaster Baren [npc 381] @ Redridge Mountains 22.6,47.4
  - text: Bring 10 Spotted Sunfish to Dockmaster Baren in Lakeshire.
  - objectives:
    1. item 10x Spotted Sunfish <- Murloc Flesheater [npc 422] L18-19 ~Redridge Mountains 47,61 (35 spawns); Murloc Nightcrawler [npc 544] L21-22 ~Redridge Mountains 76,59 (4 spawns); Murloc Tidecaller [npc 545] L19-20 ~Redridge Mountains 50,53 (33 spawns); Murloc Minor Tidecaller [npc 548] L17-18 ~Redridge Mountains 47,61 (35 spawns)

## 98386 Alther's Mill  (L21 req15, 1650 xp, F)
  - start: Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - end:   Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - pre(any)=[89]
  - text: Slay 12 Greater Tarantulas and destroy 6 Tarantula Eggs in Alther's Mill for Foreman Oslow in Redridge.
  - objectives:
    1. object 1x Tarantula Egg <- Tarantula Egg [object 673101] ~Redridge Mountains 49,41 (35 spawns)
    2. kill 12x Greater Tarantula <- Greater Tarantula [npc 505] L19-20 ~Redridge Mountains 49,44 (14 spawns); Greater Tarantula [npc 271898] L18-19 ~Redridge Mountains 49,42 (158 spawns); Greater Tarantula [npc 271988] LNone-None

## 98387 Blackrock Blockade  (L21 req18, 1650 xp, F)
  - start: Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - end:   Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - next=19
  - text: Bring 8 Stolen Weapons and 10 Blackrock Supplies to Marshal Marris in Lakeshire.
  - objectives:
    1. item 8x Stolen Weapon <- Weapon Rack [object 673390] ~Redridge Mountains 71,77 (21 spawns); Stolen Weapon [object 673399] ~Redridge Mountains 69,78 (18 spawns)
    2. item 1x Blackrock Supplies <- Meat Haunch [object 673376] ~Redridge Mountains 71,78 (4 spawns); Water Barrel [object 673384] ~Redridge Mountains 70,74 (7 spawns); Blackrock Supplies [object 673385] ~Redridge Mountains 70,78 (30 spawns)

## 248 Looking Further  (L22 req20, 1300 xp)
  - start: Old Lion Statue [object 31] @ Redridge Mountains 79.4,46.8
  - end:   An Empty Jar [object 76] @ Redridge Mountains 58.2,49.8
  - pre(any)=[94], next=249
  - text: Climb the intact watch tower beside Stonewatch Keep.
  - text: Find a suitable container to place the Glyph of Azora.

## 1699 The Rethban Gauntlet  (L22 req20, 1300 xp, class=Warrior, sort=WARRIOR)
  - start: Yorus Barleybrew [npc 6166] @ Redridge Mountains 21.5,44.7
  - end:   Yorus Barleybrew [npc 6166] @ Redridge Mountains 21.5,44.7
  - next=1702
  - text: Enter the Rethban Caverns, reach the first fork, and return to Yorus Barleybrew within the time allowed.
  - text: You must not die and release your spirit.

## 1702 The Shieldsmith  (L22 req20, 435 xp, class=Warrior, sort=WARRIOR)
  - start: Yorus Barleybrew [npc 6166] @ Redridge Mountains 21.5,44.7
  - end:   Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - pre(any)=[1699], next=1701
  - text: Bring the Cask of Scalder to Furen Longbeard.

## 2358 Horns of Nez'ra  (L22 req16, 1750 xp, class=Rogue, sort=ROGUE)
  - start: Arantir [npc 7009] @ Redridge Mountains 23.0,52.3
  - end:   Arantir [npc 7009] @ Redridge Mountains 23.0,52.3
  - text: Return the Horns of Nez'ra to Arantir's Shadow in Lakeshire.
  - objectives:
    1. item 1x Horns of Nez'ra <- Gath'Ilzogg [npc 334] L26-26 ~Redridge Mountains 65,56 (1 spawns); Blackrock Champion [npc 435] L24-25 ~Redridge Mountains 25,12 (24 spawns); Blackrock Shadowcaster [npc 436] L22-23 ~Redridge Mountains 59,50 (35 spawns); Blackrock Renegade [npc 437] L21-22 ~Redridge Mountains 56,44 (27 spawns)

## 91 Solomon's Law  (L23 req17, 1850 xp)
  - start: Bailiff Conacher [npc 900] @ Redridge Mountains 24.6,44.3
  - end:   Bailiff Conacher [npc 900] @ Redridge Mountains 24.6,44.3
  - text: Bring 10 Shadowhide Pendants to Bailiff Conacher in the Lakeshire Town Hall.
  - objectives:
    1. item 10x Shadowhide Pendant <- Shadowhide Darkweaver [npc 429] L25-26 ~Redridge Mountains 75,48 (23 spawns); Shadowhide Slayer [npc 431] L25-26 ~Redridge Mountains 75,50 (19 spawns); Shadowhide Brute [npc 432] L23-24 ~Redridge Mountains 73,41 (13 spawns); Shadowhide Gnoll [npc 433] L22-23 ~Redridge Mountains 69,50 (19 spawns)

## 115 Shadow Magic  (L23 req18, 2300 xp)
  - start: Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - end:   Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - pre(all)=[20, 98387]
  - text: Bring 3 Midnight Orbs to Marshal Marris in Lakeshire.
  - objectives:
    1. item 3x Midnight Orb <- Blackrock Shadowcaster [npc 436] L22-23 ~Redridge Mountains 59,50 (35 spawns)

## 178 Theocritus' Retrieval  (L23 req15, 1400 xp)
  - start: item Glowing Shadowhide Pendant [1962] (drops from Shadowhide Darkweaver, Shadowhide Slayer, Shadowhide Brute)
  - end:   Theocritus [npc 313] @ Elwynn Forest 65.2,69.7
  - text: Bring the Faded Shadowhide Pendant to Theocritus the Mage.

## 34 An Unwelcome Guest  (L24 req18, 1950 xp)
  - start: Martie Jainrose [npc 342] @ Redridge Mountains 16.8,46.3
  - end:   Martie Jainrose [npc 342] @ Redridge Mountains 16.8,46.3
  - text: Martie Jainrose of Lakeshire wants you to kill Bellygrub. Bring her his tusk as proof.
  - objectives:
    1. item 1x Bellygrub's Tusk <- Bellygrub [npc 345] L24-24 ~Redridge Mountains 11,49 (1 spawns)

## 19 Tharil'zun  (L25 req18, 2550 xp)
  - start: Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - end:   Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - pre(all)=[20, 98387]
  - text: Bring Tharil'zun's Head to Marshal Marris in Redridge.
  - objectives:
    1. item 1x Tharil'zun's Head <- Tharil'zun [npc 486] L24-24 ~Redridge Mountains 64,59 (1 spawns)

## 126 Howling in the Hills  (L25 req15, 2000 xp)
  - start: Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - end:   Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - pre(any)=[124]
  - text: Bring Yowler's Paw to Verner Osgood in Lakeshire.
  - objectives:
    1. item 1x Yowler's Paw <- Yowler [npc 518] L25-25 ~Redridge Mountains 23,21 (1 spawns)

## 128 Blackrock Bounty  (L25 req20, 2000 xp)
  - start: Guard Howe [npc 903] @ Redridge Mountains 26.4,57.9
  - end:   Guard Howe [npc 903] @ Redridge Mountains 26.4,57.9
  - text: Kill 15 Blackrock Champions and Guard Howe in Lakeshire will reward you.
  - objectives:
    1. kill 15x Blackrock Champion <- Blackrock Champion [npc 435] L24-25 ~Redridge Mountains 25,12 (24 spawns)

## 219 Missing In Action  (L25 req19, 2550 xp)
  - start: Corporal Keeshan [npc 349] @ Redridge Mountains 23.3,12.6
  - end:   Marshal Marris [npc 382] @ Redridge Mountains 28.4,49.0
  - text: Protect Corporal Keeshan on the journey back to Redridge.

## 95999 WANTED: Incinerator Gar'im  (L25 req16, 2550 xp, F)
  - start: Wanted: Incinerator Gar'im [object 649051] @ Redridge Mountains 24.3,46.2
  - end:   Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - text: Deliver the Broken Staff of Incinerator Gar'im to Magistrate Solomon in Lakeshire.
  - objectives:
    1. item 1x Broken Staff of Incinerator Gar'im <- Incinerator Gar'im [npc 214519] L23-23 ~Redridge Mountains 73,86 (1 spawns)

## 169 WANTED: Gath'Ilzogg  (L26 req15, 2650 xp)
  - start: Wanted: Gath'Ilzogg [object 60] @ Redridge Mountains 24.5,46.2
  - end:   Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - text: Kill Gath'Ilzogg and bring his head to Magistrate Solomon in Lakeshire for the reward.
  - objectives:
    1. item 1x Head of Gath'Ilzogg <- Gath'Ilzogg [npc 334] L26-26 ~Redridge Mountains 65,56 (1 spawns)

## 180 WANTED: Lieutenant Fangore  (L26 req15, 2650 xp)
  - start: Wanted: Lieutenant Fangore [object 47] @ Redridge Mountains 21.7,46.4
  - end:   Magistrate Solomon [npc 344] @ Redridge Mountains 24.9,44.5
  - text: Kill Lieutenant Fangore and return to Magistrate Solomon in Lakeshire with his paw.
  - objectives:
    1. item 1x Fangore's Paw <- Lieutenant Fangore [npc 703] L26-26 ~Redridge Mountains 75,37 (1 spawns)

## 249 Morganth  (L27 req20, 2750 xp)
  - start: Theocritus [npc 313] @ Elwynn Forest 65.2,69.7; Old Lion Statue [object 31] @ Redridge Mountains 79.4,46.8
  - end:   Theocritus [npc 313] @ Elwynn Forest 65.2,69.7
  - pre(any)=[248]
  - text: Defeat Morganth.
  - text: Bring his Pendant of Shadow to Theocritus at the Tower of Azora in Elwynn Forest.
  - objectives:
    1. item 1x Pendant of Shadow <- Morganth [npc 397] L26-26 ~Redridge Mountains 75,49 (1 spawns)

## 95816 Sign Me Up!  (L60 req1, ? xp, F)
  - start: item Advertising License Application [270888] (drops from ?)
  - end:   Elaine Compton [npc 256391] @ Redridge Mountains 10.3,70.9
  - text: Bring the completed form to Elaine Compton in Redridge Mountains.
  - objectives:
    1. item 1x Massive Pile of Completed Forms <- ?

## 98247 Shipping Label  (L60 req10, 660 xp, F)
  - start: item Shipping Label [280179] (drops from ?)
  - end:   Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - exclusiveTo=[98248]
  - text: Deliver the Shipping Label to someone at the Azeroth Commerce Authority trade hub in Redridge Mountains.
  - objectives:
    1. item 1x Shipping Label <- ?

# Service NPCs

- Amy Davenport <Tradeswoman> [npc 777] 24.0,47.3: vendor
- Kimberly Hiett <Fletcher> [npc 789] 22.0,45.5: repair, vendor
- Karen Taylor <Mining and Smithing Supplies> [npc 790] 24.8,47.4: vendor
- Lindsay Ashlock <General Supplies> [npc 791] 23.7,47.3: vendor
- Kara Adams <Shield Crafter> [npc 793] 25.5,46.5: repair, vendor
- Alma Jainrose <Herbalism Trainer> [npc 812] 16.6,45.8: trainer
- Ariena Stormfeather <Gryphon Master> [npc 931] 25.5,59.4: flightMaster
- Dorin Songblade <Armorer> [npc 956] 25.8,46.4: repair, vendor
- Lamar Veisilli <Fruit Seller> [npc 1671] 16.0,46.2: vendor
- Vernon Hale <Bait and Tackle Supplier> [npc 1678] 22.4,47.8: vendor
- Matthew Hooper <Fishing Trainer> [npc 1680] 21.9,51.1: trainer
- Clyde Ranthal <Leatherworking Supplies> [npc 2697] 83.9,70.9: vendor
- Gloria Femmel <Cooking Supplies> [npc 3085] 21.6,43.5: vendor
- Gretchen Vogel <Waitress> [npc 3086] 17.8,44.3: vendor
- Crystal Boughman <Cooking Trainer> [npc 3087] 17.7,43.5: trainer
- Henry Chapal <Gunsmith> [npc 3088] 18.8,41.3: repair, vendor
- Sherman Femmel <Butcher> [npc 3089] 21.6,43.2: vendor
- Gerald Crawley <Poison Supplier> [npc 3090] 20.0,41.1: vendor
- Franklin Hamar <Tailoring Supplies> [npc 3091] 22.1,45.5: vendor
- Captured Servant of Azora <Specialist Tailoring Supplies> [npc 3096] 69.4,79.5: vendor
- Bernard Brubaker <Leather Armor Merchant> [npc 3097] 83.2,71.0: repair, vendor
- Bartender Wental <Food and Drinks> [npc 5620] 21.6,43.9: vendor
- Wilma Ranthal <Skinning Trainer> [npc 6295] 83.7,71.3: trainer
- Spirit Healer <> [npc 6491] 15.7,56.6: spiritHealer
- Innkeeper Brianna <Innkeeper> [npc 6727] 21.9,44.8: innkeeper, vendor
- Penny <Stable Master> [npc 9982] 21.7,46.6: stableMaster
- Tamelyn Aldridge <Supply Officer> [npc 256389] 10.7,71.3: vendor
- Nina Surefire <Alchemist> [npc 256729] 10.9,72.4: vendor
- Stondry Darkhammer <Blacksmith> [npc 256730] 10.4,74.8: repair, vendor
- Kalsey Sanden <Chef> [npc 256731] 10.8,72.8: vendor
- Alynsia <Enchanter> [npc 256732] 11.2,71.5: vendor
- Fritz Fizzle <Engineer> [npc 256733] 10.4,74.3: vendor
- Daniel Stitchsong <Leatherworker> [npc 256734] 10.0,72.7: vendor
- Mivin Shadowweave <Tailor> [npc 256735] 10.0,72.8: vendor
- Huey Sunnydale <Mule Handler> [npc 256736] 8.4,72.1: vendor
- Auctioneer Quickcoin <> [npc 258878] 9.5,72.0: auctioneer
- Uninspected Shipment <> [npc 258880] 9.5,72.0: banker
