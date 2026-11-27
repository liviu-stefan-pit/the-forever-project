# Wetlands: Alliance + neutral quests (72)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 276 Tramping Paws  (L21 req20, 1250 xp)
  - start: Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - end:   Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - next=277
  - text: Kill 15 Mosshide Gnolls and 10 Mosshide Mongrels, then return to Rethiel the Greenwarden in the Wetlands.
  - objectives:
    1. kill 15x Mosshide Gnoll <- Mosshide Gnoll [npc 1007] L20-21 ~Wetlands 60,71 (32 spawns)
    2. kill 15x Mosshide Mongrel <- Mosshide Mongrel [npc 1008] L21-22 ~Wetlands 62,66 (34 spawns)

## 455 The Algaz Gauntlet  (L21 req19, 1250 xp)
  - start: Mountaineer Rockgar [npc 1342] @ Loch Modan 25.4,10.4
  - end:   Valstag Ironjaw [npc 2086] @ Wetlands 10.1,56.9
  - next=473
  - text: Traverse Dun Algaz.
  - text: Kill 8 Dragonmaw Scouts and 6 Dragonmaw Grunts.
  - text: Report to Valstag Ironjaw in Menethil Harbor.
  - objectives:
    1. kill 8x Dragonmaw Scout <- Dragonmaw Scout [npc 2103] L19-20 ~Wetlands 49,77 (17 spawns)
    2. kill 8x Dragonmaw Grunt <- Dragonmaw Grunt [npc 2102] L20-21 ~Wetlands 48,75 (17 spawns)

## 463 The Greenwarden  (L21 req20, 830 xp)
  - start: First Mate Fitzsimmons [npc 1239] @ Wetlands 10.9,59.6
  - end:   Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - next=276, breadcrumbFor=276
  - text: Find the Greenwarden.

## 468 Report to Mountaineer Rockgar  (L21 req19, 165 xp)
  - start: Mountaineer Kadrell [npc 1340] @ Loch Modan 32.6,49.7
  - end:   Mountaineer Rockgar [npc 1342] @ Loch Modan 25.4,10.4
  - next=455, breadcrumbFor=455
  - text: Speak with Mountaineer Rockgar.

## 469 Daily Delivery  (L21 req18, 830 xp)
  - start: Einar Stonegrip [npc 2093] @ Wetlands 49.9,39.4
  - end:   James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - text: Deliver the Bundle of Crocolisk Skins to James Halloran, the tanner, in Menethil Harbor.

## 98459 A Lack of Virtue  (L21 req18, 165 xp, F)
  - start: Tom "Half-fish" Wilson [npc 254078] @ Hillsbrad Foothills 51.2,66.5
  - end:   Bart Tidewater [npc 1481] @ Wetlands 8.7,58.1
  - text: Deliver Tom's Gift to Bart Tidewater in Menethil Harbor in the Wetlands.

## 98461 Unrequited Love  (L21 req18, 165 xp, F)
  - start: Archaeologist Hollee [npc 2913] @ Darkshore 37.4,41.8
  - end:   Tarrel Rockweaver [npc 2096] @ Wetlands 11.5,52.2
  - next=305
  - text: Deliver Hollee's Note to Tarrel Rockweaver near Menethil Harbor in the Wetlands.

## 279 Claws from the Deep  (L22 req20, 1750 xp)
  - start: Karl Boran [npc 1242] @ Wetlands 8.3,58.6
  - end:   Karl Boran [npc 1242] @ Wetlands 8.3,58.6
  - next=281
  - text: Kill 12 Bluegill Murlocs.
  - text: Slay Gobbler and take his head.
  - text: Bring Gobbler's Head to Karl Boran in Menethil Harbor.
  - objectives:
    1. kill 12x Bluegill Murloc <- Bluegill Murloc [npc 1024] L20-21 ~Wetlands 15,40 (25 spawns)
    2. item 1x Gobbler's Head <- Gobbler [npc 1259] L22-22 ~Wetlands 17,41 (2 spawns)

## 484 Young Crocolisk Skins  (L22 req18, 1750 xp)
  - start: James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - end:   James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - next=471
  - text: Obtain 4 Young Crocolisk Skins for James Halloran in Menethil Harbor.
  - objectives:
    1. item 4x Young Crocolisk Skin <- Young Wetlands Crocolisk [npc 1417] L21-22 ~Wetlands 45,49 (77 spawns)

## 94497 Call of Water  (L22 req20, 870 xp, F, class=Shaman, sort=SHAMAN)
  - start: Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - end:   Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - pre(any)=[94495], next=94499
  - text: Fill the Empty Brown Waterskin at the bottom of the waterfalls below Hervdana's cave and return it to her in the Wetlands.
  - objectives:
    1. item 1x Full Brown Waterskin <- ?

## 94499 Call of Water  (L22 req20, 1300 xp, F, class=Shaman, sort=SHAMAN)
  - start: Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - end:   Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - pre(any)=[94497], next=94500
  - text: Fill the Empty Red Waterskin at Stonewatch Falls near the Nightcrawler Murlocs and return to Hervdana Saegrund in the Wetlands.
  - objectives:
    1. item 1x Full Red Waterskin <- ?

## 98197 Spoils of War  (L22 req18, 1750 xp, F)
  - start: Valstag Ironjaw [npc 2086] @ Wetlands 10.1,56.9
  - end:   Valstag Ironjaw [npc 2086] @ Wetlands 10.1,56.9
  - text: Recover 6 Khaz Modan Timber and 30 Khaz Modan Iron from Menethil Harbor for Valstag Ironjaw.
  - objectives:
    1. item 6x Khaz Modan Timber <- Khaz Modan Timber [object 670771] ~Wetlands 9,57 (14 spawns); Khaz Modan Timber [object 670773] ~Wetlands 9,56 (11 spawns)
    2. item 6x Khaz Modan Iron <- Khaz Modan Iron [object 670774] ~Wetlands 10,56 (21 spawns)

## 98282 Alchemical Hazards  (L22 req20, 1750 xp, F)
  - start: Caitlin Grassman [npc 1480] @ Wetlands 11.9,58.8
  - end:   Caitlin Grassman [npc 1480] @ Wetlands 11.9,58.8
  - text: Collect an Unruptured Stalker Gland from Thelgen Rock for Caitlin Grassman in Menethil Harbor.
  - objectives:
    1. item 1x Unruptured Stalker Gland <- Leech Stalker [npc 1111] L21-22 ~Wetlands 52,63 (35 spawns); Cave Stalker [npc 4040] L21-22 ~Wetlands 48,61 (17 spawns); Leech Stalker Corpse [npc 211967] LNone-None

## 277 Fire Taboo  (L23 req20, 1850 xp)
  - start: Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - end:   Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - pre(any)=[276], next=275
  - text: Bring Rethiel the Greenwarden 9 Crude Flints.
  - objectives:
    1. item 9x Crude Flint <- Mosshide Mistweaver [npc 1009] L22-23 ~Wetlands 54,49 (7 spawns); Mosshide Fenrunner [npc 1010] L22-23 ~Wetlands 49,40 (43 spawns); Mosshide Trapper [npc 1011] L23-24 ~Wetlands 38,33 (28 spawns); Mosshide Brute [npc 1012] L24-25 ~Wetlands 36,29 (27 spawns)

## 94500 Call of Water  (L23 req20, 1400 xp, F, class=Shaman, sort=SHAMAN)
  - start: Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - end:   Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - pre(any)=[94499], next=94501
  - text: Fill the Unfilled Blue Waterskin at the waters of Astranaar in Ashenvale and return to Hervdana Saegrund in the Wetlands.
  - objectives:
    1. item 1x Full Blue Waterskin <- ?

## 94501 Call of Water  (L23 req20, 460 xp, F, class=Shaman, sort=SHAMAN)
  - start: Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - end:   Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - pre(any)=[94500], next=94502
  - text: Bring the Vial of Purest Water to Norric Lochthane in Loch Modan.

## 294 Ormer's Revenge  (L24 req22, 1950 xp)
  - start: Ormer Ironbraid [npc 1078] @ Wetlands 38.2,50.9
  - end:   Ormer Ironbraid [npc 1078] @ Wetlands 38.2,50.9
  - next=295
  - text: Ormer Ironbraid at the Whelgar Excavation Site wants you to kill 10 Mottled Screechers and 10 Mottled Raptors.
  - objectives:
    1. kill 10x Mottled Raptor <- Mottled Raptor [npc 1020] L22-23 ~Wetlands 26,49 (27 spawns)
    2. kill 10x Mottled Screecher <- Mottled Screecher [npc 1021] L24-25 ~Wetlands 26,51 (16 spawns)

## 305 In Search of The Excavation Team  (L24 req21, 970 xp)
  - start: Tarrel Rockweaver [npc 2096] @ Wetlands 11.5,52.2
  - end:   Merrin Rockweaver [npc 1076] @ Wetlands 38.9,52.3
  - next=306
  - text: Tarrel Rockweaver wants you to travel to the Excavation Site and contact Merrin Rockweaver.

## 306 In Search of The Excavation Team  (L24 req21, 485 xp)
  - start: Merrin Rockweaver [npc 1076] @ Wetlands 38.9,52.3
  - end:   Tarrel Rockweaver [npc 2096] @ Wetlands 11.5,52.2
  - pre(any)=[305]
  - text: Return to Tarrel Rockweaver with Merrin's note.

## 470 Digging Through the Ooze  (L24 req19, 2400 xp)
  - start: Sida [npc 2111] @ Wetlands 11.8,58.0
  - end:   Sida [npc 2111] @ Wetlands 11.8,58.0
  - text: One of the oozes at Ironbeard's Tomb has Sida's bag, retrieve it and bring it back to her in Menethil Harbor.
  - objectives:
    1. item 1x Sida's Bag <- Crimson Ooze [npc 1031] L24-25 ~Wetlands 44,25 (8 spawns); Black Ooze [npc 1032] L23-24 ~Wetlands 49,34 (36 spawns); Monstrous Ooze [npc 1033] L25-26 ~Wetlands 57,36 (18 spawns)

## 281 Reclaiming Goods  (L25 req20, 510 xp)
  - start: Karl Boran [npc 1242] @ Wetlands 8.3,58.6
  - end:   Damaged Crate [object 261] @ Wetlands 13.5,41.4
  - pre(any)=[279], next=284
  - text: Search the crates and barrels at the coastal Murloc camps.

## 284 The Search Continues  (L25 req20, 510 xp)
  - start: Damaged Crate [object 261] @ Wetlands 13.5,41.4
  - end:   Sealed Barrel [object 142151] @ Wetlands 13.6,38.2
  - pre(any)=[281], next=285
  - text: Search for the Menethil Statuette.

## 285 Search More Hovels  (L25 req20, 1000 xp)
  - start: Sealed Barrel [object 142151] @ Wetlands 13.6,38.2
  - end:   Half-buried Barrel [object 259] @ Wetlands 13.9,34.8
  - pre(any)=[284], next=286
  - text: Continue searching the Murloc hovels for the Menethil Statuette.

## 286 Return the Statuette  (L25 req20, 1500 xp)
  - start: Half-buried Barrel [object 259] @ Wetlands 13.9,34.8
  - end:   Karl Boran [npc 1242] @ Wetlands 8.3,58.6
  - pre(any)=[285], next=98189
  - text: Bring Karl Boran the Menethil Statuette.

## 98189 Return the Statuette  (L25 req20, 200 xp, F)
  - start: Karl Boran [npc 1242] @ Wetlands 8.3,58.6
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - pre(any)=[286], next=98190
  - text: Bring the Menethil Statuette to Captain Stoutfist in Menethil Keep.

## 275 Blisters on The Land  (L26 req20, 2650 xp)
  - start: Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - end:   Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - pre(any)=[277], next=98283
  - text: Kill 12 Fen Creepers, then return to Rethiel the Greenwarden in the Wetlands.
  - objectives:
    1. kill 12x Fen Creeper <- Fen Creeper [npc 1040] L24-25 ~Wetlands 36,33 (19 spawns)

## 471 Apprentice's Duties  (L26 req18, 2100 xp)
  - start: James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - end:   James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - pre(any)=[484]
  - text: Collect 6 Giant Crocolisk Skins and bring them to James Halloran in Menethil Harbor.
  - objectives:
    1. item 6x Giant Crocolisk Skin <- Giant Wetlands Crocolisk [npc 2089] L25-26 ~Wetlands 19,36 (19 spawns)

## 288 The Third Fleet  (L27 req22, 220 xp)
  - start: First Mate Fitzsimmons [npc 1239] @ Wetlands 10.9,59.6
  - end:   First Mate Fitzsimmons [npc 1239] @ Wetlands 10.9,59.6
  - next=289
  - text: Buy First Mate Fitzsimmons a Flagon of Mead.
  - objectives:
    1. item 1x Flagon of Mead <- ?

## 295 Ormer's Revenge  (L27 req22, 2200 xp)
  - start: Ormer Ironbraid [npc 1078] @ Wetlands 38.2,50.9
  - end:   Ormer Ironbraid [npc 1078] @ Wetlands 38.2,50.9
  - pre(any)=[294], next=296
  - text: Ormer Ironbraid wants you to kill 10 Mottled Scytheclaw raptors and 10 Mottled Razormaw raptors then return to him at the Whelgar Excavation Site.
  - objectives:
    1. kill 10x Mottled Scytheclaw <- Mottled Scytheclaw [npc 1022] L25-26 ~Wetlands 34,48 (14 spawns)
    2. kill 10x Mottled Razormaw <- Mottled Razormaw [npc 1023] L26-27 ~Wetlands 34,48 (9 spawns)

## 299 Uncovering the Past  (L27 req22, 2200 xp)
  - start: Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - end:   Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - next=98216
  - text: Prospector Whelgar wants you to scour the excavation site in search of the 4 missing tablet fragments: Ados, Modr, Golm and Neru.
  - objectives:
    1. item 1x Ados Fragment <- Ancient Relic [object 35252] ~Wetlands 34,48 (34 spawns)
    2. item 1x Modr Fragment <- Ancient Relic [object 334] ~Wetlands 34,48 (34 spawns)
    3. item 1x Golm Fragment <- Ancient Relic [object 333] ~Wetlands 34,48 (34 spawns)
    4. item 1x Neru Fragment <- Loose Soil [object 331] ~Wetlands 34,48 (34 spawns)

## 98072 Crocs of the Sky  (L27 reqNone, 2200 xp, F)
  - start: James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - end:   James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - pre(any)=[471], next=98240
  - text: Collect 8 Pristine Crimson Scales and bring them to James Halloran in Menethil Harbor.
  - objectives:
    1. item 8x Pristine Crimson Scale <- Red Whelp [npc 1042] L23-24 ~Wetlands 62,47 (13 spawns); Lost Whelp [npc 1043] L24-25 ~Wetlands 64,45 (21 spawns); Flamesnorting Whelp [npc 1044] L26-27 ~Wetlands 67,41 (10 spawns); Crimson Whelp [npc 1069] L25-26 ~Wetlands 65,42 (26 spawns)

## 464 War Banners  (L28 req23, 2300 xp)
  - start: Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - next=465
  - text: Bring 8 Dragonmaw War Banners to Captain Stoutfist.
  - objectives:
    1. item 8x Dragonmaw War Banner <- Dragonmaw Raider [npc 1034] L26-27 ~Wetlands 46,45 (57 spawns); Dragonmaw Swamprunner [npc 1035] L27-28 ~Wetlands 47,47 (11 spawns); Dragonmaw Centurion [npc 1036] L28-29 ~Wetlands 52,51 (6 spawns); Dragonmaw Battlemaster [npc 1037] L30-30 ~Wetlands 45,44 (1 spawns)

## 473 Report to Captain Stoutfist  (L28 req23, 230 xp)
  - start: Valstag Ironjaw [npc 2086] @ Wetlands 10.1,56.9
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - pre(any)=[455], next=464, breadcrumbFor=464
  - text: Speak with Captain Stoutfist.

## 98221 From the Ashes  (L28 req23, 2300 xp, F)
  - start: Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - next=465
  - text: Captain Stoutfist in Menethil Keep wants you to destroy the 4 sets of Attack Plans in the Angerfang Encampment.

## 289 The Cursed Crew  (L29 req22, 1750 xp)
  - start: First Mate Fitzsimmons [npc 1239] @ Wetlands 10.9,59.6
  - end:   First Mate Fitzsimmons [npc 1239] @ Wetlands 10.9,59.6
  - pre(any)=[288], next=290
  - text: Kill 13 Cursed Sailors, 5 Cursed Marines and First Mate Snellig. Bring Snellig's Snuffbox to First Mate Fitzsimmons in Menethil Harbor.
  - objectives:
    1. kill 13x Cursed Sailor <- Cursed Sailor [npc 1157] L26-27 ~Wetlands 14,30 (14 spawns)
    2. kill 13x Cursed Marine <- Cursed Marine [npc 1158] L27-28 ~Wetlands 15,25 (25 spawns)
    3. item 1x Snellig's Snuffbox <- First Mate Snellig [npc 1159] L29-29 ~Wetlands 14,30 (1 spawns)

## 296 Ormer's Revenge  (L29 req22, 2950 xp)
  - start: Ormer Ironbraid [npc 1078] @ Wetlands 38.2,50.9
  - end:   Ormer Ironbraid [npc 1078] @ Wetlands 38.2,50.9
  - pre(any)=[295]
  - text: Ormer Ironbraid at the Whelgar Excavation Site wants you to kill Sarltooth and return to him with one of his talons once the task is fulfilled.
  - objectives:
    1. item 1x Sarltooth's Talon <- Sarltooth [npc 1353] L29-29 ~Wetlands 33,52 (1 spawns)

## 98208 Bloom of the Heavens  (L29 reqNone, 1750 xp, F)
  - start: Sylessa Duskwhisper [npc 270844] @ Wetlands 7.9,55.8
  - end:   Sylessa Duskwhisper [npc 270844] @ Wetlands 7.9,55.8
  - next=98209
  - text: Recover Nord'el for Sylessa Duskwhisper in Menethil Harbor.
  - objectives:
    1. item 1x Nord'el <- Nord'el [object 670962] ~Wetlands 12,64 (1 spawns)

## 98209 Bloom of the Heavens  (L29 req22, 1200 xp, F)
  - start: Sylessa Duskwhisper [npc 270844] @ Wetlands 7.9,55.8
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - pre(any)=[98208]
  - text: Bring Nord'el to Thundris Windweaver in Auberdine in Darkshore.
  - text: You recall Sylessa mentioning a boat in Menethil Harbor can take you there.

## 98230 This Land Was Their Land  (L29 req22, 235 xp, F)
  - start: Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - end:   Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - pre(all)=[474, 98223]
  - text: Find Howin Kindfeather east of Menethil Harbor, along the road.

## 98240 Crimson Crate Delivery  (L29 req19, 1200 xp, F)
  - start: James Halloran [npc 2094] @ Wetlands 8.6,55.7
  - end:   Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - pre(any)=[98072], next=98245
  - text: Bring the Crimson Crate to Howin Kindfeather off the road to the east of Menethil Harbor.

## 98245 Razormaw Needling  (L29 req21, 2350 xp, F)
  - start: Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - end:   Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - text: Collect 10 Razormaw Incisors for Howin Kindfeather.
  - objectives:
    1. item 10x Razormaw Incisor <- Highland Razormaw [npc 1018] L27-28 ~Wetlands 63,30 (37 spawns); Elder Razormaw [npc 1019] L29-29 ~Wetlands 57,25 (22 spawns)

## 98246 Trying Times  (L29 req21, 2350 xp, F)
  - start: Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - end:   Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - next=98291
  - text: Gather 12 Perfect Razormaw Eggs for Howin Kindfeather.
  - objectives:
    1. item 12x Perfect Razormaw Egg <- object 671892 [object 671892] ~Wetlands 55,29 (12 spawns); object 671931 [object 671931] ~Wetlands 60,31 (30 spawns)

## 290 Lifting the Curse  (L30 req22, 1200 xp)
  - start: First Mate Fitzsimmons [npc 1239] @ Wetlands 10.9,59.6
  - end:   Intrepid's Locked Strongbox [object 112948] @ Wetlands 14.4,24.0
  - pre(any)=[289], next=292
  - text: Get the Intrepid Strongbox Key from Captain Halyndor.
  - text: Use the key to open the Intrepid's Locked Strongbox.
  - objectives:
    1. item 1x Intrepid Strongbox Key <- Captain Halyndor [npc 1160] L30-30 ~Wetlands 15,24 (1 spawns)

## 292 The Eye of Paleth  (L30 req22, 1200 xp)
  - start: Intrepid's Locked Strongbox [object 112948] @ Wetlands 14.4,24.0
  - end:   Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - pre(any)=[290], next=293
  - text: Bring the Cursed Eye of Paleth to Glorin Steelbrow.

## 293 Cleansing the Eye  (L30 req22, 2450 xp)
  - start: Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - end:   Archbishop Benedictus [npc 1284] @ Stormwind City 50.3,45.5
  - pre(any)=[292]
  - text: Bring Archbishop Benedictus the Cursed Eye of Paleth. Benedictus is in the Cathedral of Light, in the city of Stormwind.

## 303 The Dark Iron War  (L30 req22, 2450 xp)
  - start: Motley Garmason [npc 1074] @ Wetlands 49.7,18.2
  - end:   Motley Garmason [npc 1074] @ Wetlands 49.7,18.2
  - next=378
  - text: Motley Garmason at Dun Modr wants you to kill 10 Dark Iron Dwarves, 5 Dark Iron Tunnelers, 5 Dark Iron Saboteurs and 5 Dark Iron Demolitionists.
  - objectives:
    1. kill 10x Dark Iron Dwarf <- Dark Iron Dwarf [npc 1051] L27-28 ~Wetlands 55,21 (16 spawns)
    2. kill 10x Dark Iron Tunneler <- Dark Iron Tunneler [npc 1053] L29-30 ~Wetlands 52,20 (23 spawns)
    3. kill 10x Dark Iron Saboteur <- Dark Iron Saboteur [npc 1052] L28-29 ~Wetlands 53,19 (17 spawns)
    4. kill 10x Dark Iron Demolitionist <- Dark Iron Demolitionist [npc 1054] L30-31 ~Wetlands 55,22 (11 spawns)

## 472 Fall of Dun Modr  (L30 req25, 1200 xp)
  - start: Harlo Barnaby [npc 2097] @ Wetlands 10.8,55.9
  - end:   Longbraid the Grim [npc 1071] @ Wetlands 49.8,18.3
  - text: Search for Longbraid near the town of Dun Modr.

## 647 MacKreel's Moonshine  (L30 req28, 3050 xp)
  - start: Foggy MacKreel [npc 2696] @ Arathi Highlands 43.2,92.6
  - end:   Brewmeister Bilger [npc 2705] @ Hillsbrad Foothills 52.1,58.7
  - text: Take MacKreel's Moonshine to Brewmeister Bilger in Southshore.

## 1132 Fiora Longears  (L30 req30, 1200 xp)
  - start: Red Jack Flint [npc 4455] @ Wetlands 10.0,58.0
  - end:   Fiora Longears [npc 4456] @ Dustwallow Marsh 66.5,45.1
  - next=1133, breadcrumbFor=1133
  - text: Speak with Fiora Longears on the docks at Theramore in Dustwallow Marsh.

## 87491 Spark of Freedom  (L30 req25, 2450 xp, F)
  - start: Captive Fire Elemental [npc 271481] @ Wetlands 45.7,16.7
  - end:   Roggo Harlbarrow [npc 1072] @ Wetlands 49.9,18.1
  - text: Escort the captive fire elemental out of Dun Modr and to its freedom.

## 98283 Carnage  (L30 req22, 3050 xp, F)
  - start: Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - end:   Rethiel the Greenwarden [npc 1244] @ Wetlands 56.4,40.4
  - pre(any)=[275]
  - text: Bring Carnage's Head to Rethiel the Greenwarden in The Green Belt.
  - objectives:
    1. item 1x Malignant Rotclaw Flesh <- Maddened Rotclaw [npc 271334] L25-26 ~Wetlands 62,41 (614 spawns)
    2. item 1x Carnage's Head <- Carnage [npc 271336] L30-30 ~Wetlands 70,30 (20 spawns)

## 98291 Death to the Dragonmaw  (L30 req22, 3050 xp, F)
  - start: Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - end:   Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - pre(all)=[98245, 98246], next=98297
  - text: Kill 8 Dragonmaw Reclaimers, 5 Dragonmaw Soulbinders, and 3 Dragonmaw Infiltrators in Dragonmaw Retreat for Howin Kindfeather.
  - objectives:
    1. kill 8x Dragonmaw Reclaimer <- Dragonmaw Reclaimer [npc 271351] L29-30 ~Wetlands 65,46 (444 spawns)
    2. kill 8x Dragonmaw Soulbinder <- Dragonmaw Soulbinder [npc 271348] L29-30 ~Wetlands 66,46 (278 spawns)
    3. kill 8x Dragonmaw Infiltrator <- Dragonmaw Infiltrator [npc 271346] L29-30 ~Wetlands 65,46 (372 spawns)

## 98293 Forced Disarmament  (L30 req22, 2450 xp, F)
  - start: Dragonmaw Armaments [object 672330] @ Wetlands 58.9,45.2
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - text: Collect 30 Dragonmaw Armaments in Dragonmaw Retreat, then bring them to Captain Stoutfist in Menethil Keep.
  - objectives:
    1. item 30x Dragonmaw Armaments <- object 672334 [object 672334] ~Wetlands 68,46 (10 spawns); object 672336 [object 672336] ~Wetlands 66,46 (8 spawns); object 672337 [object 672337] ~Wetlands 69,47 (12 spawns)

## 465 Nek'rosh's Gambit  (L31 req23, 1900 xp)
  - start: Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - end:   Dragonmaw Catapult [object 1609] @ Wetlands 47.5,47.0; Dragonmaw Catapult [object 630696] @ Wetlands 47.5,47.0
  - pre(all)=[464, 98221]
  - text: Destroy the Dragonmaw catapults.

## 631 The Thandol Span  (L31 req26, 2500 xp)
  - start: Rhag Garmason [npc 1075] @ Wetlands 49.9,18.2
  - end:   Ebenezer Rustlocke's Corpse [object 2652] @ Wetlands 51.3,8.0
  - next=632
  - text: Rhag Garmason wants you to locate Ol' Rustlocke.

## 632 The Thandol Span  (L31 req26, 2500 xp)
  - start: Ebenezer Rustlocke's Corpse [object 2652] @ Wetlands 51.3,8.0
  - end:   Rhag Garmason [npc 1075] @ Wetlands 49.9,18.2
  - pre(any)=[631], next=633
  - text: Report back to Rhag Garmason and show him the parchment you found on Rustlocke's corpse.

## 633 The Thandol Span  (L31 req26, 2500 xp)
  - start: Rhag Garmason [npc 1075] @ Wetlands 49.9,18.2
  - end:   Rhag Garmason [npc 1075] @ Wetlands 49.9,18.2
  - pre(any)=[632], next=634
  - text: Destroy the cache of explosives.
  - objectives:
    1. object 1x Cache of Explosives <- Cache of Explosives [object 2704] ~Arathi Highlands 49,88 (1 spawns)

## 634 Plea To The Alliance  (L31 req28, 1250 xp)
  - start: Rhag Garmason [npc 1075] @ Wetlands 49.9,18.2
  - end:   Captain Nials [npc 2700] @ Arathi Highlands 45.8,47.6
  - pre(any)=[633]
  - text: Seek out Captain Nials at Refuge Pointe.

## 88756 Bring Back a Bang  (L31 req25, 2500 xp, F)
  - start: Ashlan Stonesmirk [npc 1073] @ Wetlands 50.0,18.2
  - end:   Ashlan Stonesmirk [npc 1073] @ Wetlands 50.0,18.2
  - text: Retrieve 3 Stolen Explosives from the Dark Iron Dwarf camps.
  - objectives:
    1. item 3x Stolen Explosives <- object 673206 [object 673206] ~Wetlands 62,26 (7 spawns)

## 98216 Understanding Our Present  (L31 req23, 3150 xp, F)
  - start: Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - end:   Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - pre(any)=[299], next=98310
  - text: Use the Goaz Stone near the Goaz Warder and bring its Titanic Keystone back to Prospector Whelgar.
  - objectives:
    1. item 1x Titanic Keystone <- Goaz Warder [npc 270892] L32-32 ~Wetlands 35,47 (72 spawns)

## 98223 Old Habits  (L31 req23, 1250 xp, F)
  - start: Tattered Spellbook [object 671518] @ Wetlands 53.5,54.6
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - next=98230
  - text: Bring the Tattered Spellbook to Captain Stoutfist in Menethil Harbor.

## 474 Defeat Nek'rosh  (L32 req23, 2550 xp)
  - start: Dragonmaw Catapult [object 1609] @ Wetlands 47.5,47.0; Dragonmaw Catapult [object 630696] @ Wetlands 47.5,47.0
  - end:   Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - pre(any)=[465], next=98230
  - text: Kill Chieftain Nek'rosh
  - text: Bring Nek'rosh's Head to Captain Stoutfist.
  - objectives:
    1. item 1x Nek'rosh's Head <- Chieftain Nek'rosh [npc 2091] L32-32 ~Wetlands 54,55 (1 spawns)

## 98310 Gleaning Our Future  (L32 req24, 3200 xp, F)
  - start: Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - end:   Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - pre(any)=[98216], next=98313
  - text: Use the Goaz Stone near Ados, Modr, Golm, and Neru and bring their hearts back to Prospector Whelgar.
  - objectives:
    1. item 1x Heart of Ados <- Ados [npc 271338] L32-32 ~Wetlands 76,46 (38 spawns)
    2. item 1x Heart of Modr <- Modr [npc 271460] L32-32 ~Wetlands 50,21 (70 spawns)
    3. item 1x Heart of Golm <- Golm [npc 271462] L32-32 ~Wetlands 66,69 (65 spawns)
    4. item 1x Heart of Neru <- Neru [npc 271458] L32-32 ~Wetlands 60,25 (35 spawns)

## 87318 Hearts of the Lost  (L33 req28, 2650 xp, F)
  - start: Comar Villard [npc 5683] @ Wetlands 49.9,12.6
  - end:   Essene Villard [npc 271322] @ Wetlands 51.5,9.0
  - text: Search for Corma's partner Essene.

## 88757 Accessories of the Lost  (L33 req28, 2650 xp, F)
  - start: Essene Villard [npc 271322] @ Wetlands 51.5,9.0
  - end:   Essene Villard [npc 271322] @ Wetlands 51.5,9.0
  - pre(any)=[87318]
  - text: Bring back Essene's Necklace, Essene's Spellbook, and Essene's Waterskin.
  - objectives:
    1. item 1x Essene's Necklace <- object 687845 [object 687845] ~Wetlands 51,8 (1 spawns)
    2. item 1x Essene's Spellbook <- object 678590 [object 678590] ~Wetlands 51,8 (1 spawns)
    3. item 1x Essene's Waterskin <- object 678585 [object 678585] ~Wetlands 51,8 (1 spawns)

## 88758 Sentiments of the Lost  (L33 req28, ? xp, F)
  - start: Essene Villard [npc 271322] @ Wetlands 51.5,9.0
  - end:   Comar Villard [npc 5683] @ Wetlands 49.9,12.6
  - pre(any)=[88757]
  - text: Bring Essene's note back to Corma Villard.

## 304 A Grim Task  (L34 req26, 3350 xp)
  - start: Longbraid the Grim [npc 1071] @ Wetlands 49.8,18.3
  - end:   Longbraid the Grim [npc 1071] @ Wetlands 49.8,18.3
  - text: Kill Balgaras the Foul and bring his ear to Longbraid the Grim outside of Dun Modr.
  - objectives:
    1. item 1x Ear of Balgaras <- Balgaras the Foul [npc 1364] L34-34 ~Wetlands 57,25 (6 spawns)

## 98297 Stopping the Cycle  (L34 req24, 2700 xp, F)
  - start: Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - end:   Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - pre(any)=[98291], next=98300
  - text: Kill the Subdued Dragonspawn at the Dragonmaw Gates for Howin Kindfeather.
  - objectives:
    1. kill 1x Subdued Dragonspawn <- Subdued Dragonspawn [npc 271373] L34-34 ~Wetlands 75,45 (55 spawns)

## 1302 James Hyal  (L35 req30, 690 xp)
  - start: Vincent Hyal [npc 5082] @ Wetlands 10.8,60.4
  - end:   Clerk Lendry [npc 5083] @ Dustwallow Marsh 67.9,48.2
  - text: Speak with Clerk Lendry at Foothold Citadel in Theramore.

## 96449 Aeonas's Secret Refuge  (L40 req35, 2350 xp, F, class=Paladin, sort=PALADIN)
  - start: Harold Riggs [npc 3179] @ Wetlands 8.1,58.6
  - end:   Slain Scarlet Crusader [npc 217957] @ Dun Morogh 11.4,75.7
  - text: Use the Old Dingy at Menethil Harbor to search for Aeonas.

## 97171 Your First Horse  (L40 req40, 1550 xp, F, races=Human)
  - start: Unger Statforth [npc 1460] @ Wetlands 8.6,54.3
  - end:   Unger Statforth [npc 1460] @ Wetlands 8.6,54.3
  - exclusiveTo=[95511, 96982, 96989, 96994, 96996, 96997, 97017, 97045, 97046, 97446, 98166, 99326]
  - text: Inspect the riding horses to choose your first mount.

## 98166 Your First Horse  (L40 req40, 1550 xp, F, races=Human)
  - start: Gregor MacVince [npc 4885] @ Dustwallow Marsh 65.2,51.5
  - end:   ?
  - exclusiveTo=[95511, 96982, 96989, 96994, 96996, 96997, 97017, 97045, 97046, 97171, 97446, 99326]
  - text: Inspect the riding horses to choose your first mount.

# Service NPCs

- Brak Durnad <Weaponsmith> [npc 1441] 11.4,59.7: repair, vendor
- Neal Allen <Engineering & General Goods Supplier> [npc 1448] 10.8,56.8: vendor
- Brahnmar <Armorer> [npc 1450] 11.5,59.9: repair, vendor
- Gruham Rumdnul <General Supplies> [npc 1452] 12.1,58.0: vendor
- Dewin Shimmerdawn <Alchemy Supplies> [npc 1453] 8.0,56.3: vendor
- Jennabink Powerseam <Tailoring Supplies & Specialty Goods> [npc 1454] 8.1,55.8: repair, vendor
- Kersok Prond <Tradesman> [npc 1456] 10.4,60.6: vendor
- Samor Festivus <Shady Dealer> [npc 1457] 10.5,60.2: vendor
- Telurinon Moonshadow <Herbalism Trainer> [npc 1458] 8.0,55.8: trainer
- Naela Trance <Bowyer> [npc 1459] 11.3,58.4: repair, vendor
- Unger Statforth <Horse Breeder> [npc 1460] 8.6,54.3: vendor
- Murndan Derth <Gunsmith> [npc 1461] 11.3,59.6: repair, vendor
- Edwina Monzor <Fletcher> [npc 1462] 11.1,58.3: repair, vendor
- Falkan Armonis <Reagent Vendor> [npc 1463] 8.3,56.5: vendor
- Innkeeper Helbrek <Innkeeper> [npc 1464] 10.7,61.0: innkeeper, vendor
- Shellei Brondir <Gryphon Master> [npc 1571] 9.5,59.7: flightMaster
- Wenna Silkbeard <Special Goods Dealer> [npc 2679] 25.6,25.8: repair, vendor
- Fradd Swiftgear <Engineering Supplies> [npc 2682] 26.4,25.8: vendor
- Stuart Fleming <Fisherman> [npc 3178] 8.0,58.4: vendor
- Harold Riggs <Fishing Trainer> [npc 3179] 8.1,58.6: trainer
- Dark Iron Entrepreneur <Speciality Goods> [npc 3180] 46.5,18.4: vendor
- Fremal Doohickey <First Aid Trainer> [npc 3181] 10.8,61.4: trainer
- Junder Brokk <> [npc 3182] 10.8,60.2: trainer
- Mikhail <Bartender> [npc 4963] 10.6,60.8: vendor
- Spirit Healer <> [npc 6491] 11.0,43.8: spiritHealer
- Kixxle <Potions & Herbs> [npc 8305] 50.2,37.7: vendor
- Bethaine Flinthammer <Stable Master> [npc 10046] 10.5,59.7: stableMaster
- Aurian Highgrove <Bartender> [npc 265346] 52.8,80.3: vendor
- Bhalir Firebrew <Chef> [npc 265347] 52.7,80.2: vendor
