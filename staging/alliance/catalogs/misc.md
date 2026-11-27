# Misc: Alliance + neutral quests (146)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 94375 Call of Earth  (L4 req4, 445 xp, F, class=Shaman, sort=SHAMAN)
  - start: Minor Manifestation of Earth [npc 5891] @ Dun Morogh 24.8,61.9 (+2 spawns); Teo Hammerstorm [npc 257446] @ Dun Morogh 28.8,66.2
  - end:   Teo Hammerstorm [npc 257446] @ Dun Morogh 28.8,66.2
  - pre(any)=[94374]
  - text: Bring the Rough Quartz to Teo Hammerstorm in Anvilmar.

## 834 Winds in the Desert  (L9 req7, 780 xp)
  - start: Rezlak [npc 3293] @ Durotar 46.4,22.9
  - end:   Rezlak [npc 3293] @ Durotar 46.4,22.9
  - next=835
  - text: Retrieve 5 Sacks of Supplies and return them to Rezlak near Orgrimmar.
  - objectives:
    1. item 1x Sack of Supplies <- Stolen Supply Sack [object 3290] ~Durotar 49,29 (18 spawns)

## 5929 Great Bear Spirit  (L10 req10, 420 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - pre(any)=[5921], next=5931
  - text: Seek out the Great Bear Spirit in northwestern Moonglade and learn what it has to share with you about the nature of the bear. When finished, return to Dendrite Starblaze in Nighthaven, Moonglade.
  - objectives:
    1. kill 1x Great Bear Spirit <- Great Bear Spirit [npc 11956] L60-60 ~Moonglade 39,28 (1 spawns)

## 5931 Back to Darnassus  (L10 req10, 85 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[5929], next=6001
  - text: Return to Darnassus and speak with Mathrengyl Bearwalker in the Cenarion Enclave.

## 97282 Stormy Potential  (L10 req6, 840 xp, F)
  - start: Rezlak [npc 3293] @ Durotar 46.4,22.9
  - end:   Rezlak [npc 3293] @ Durotar 46.4,22.9
  - pre(any)=[97281]
  - text: Bring 5 Charged Thunder Lizard Organs to Rezlak near Drygulch Ravine.
  - objectives:
    1. item 5x Charged Thunder Lizard Organ <- Thunder Lizard [npc 3130] L9-10 ~Durotar 40,29 (11 spawns); Lightning Hide [npc 3131] L10-11 ~Durotar 41,24 (11 spawns); Halikor [npc 266852] L12-12 ~Durotar 42,27 (2 spawns)

## 835 Securing the Lines  (L11 req7, 880 xp)
  - start: Rezlak [npc 3293] @ Durotar 46.4,22.9
  - end:   Rezlak [npc 3293] @ Durotar 46.4,22.9
  - pre(any)=[834]
  - text: Kill 12 Dustwind Savages and 8 Dustwind Storm Witches for Rezlak near Drygulch Ravine.
  - objectives:
    1. kill 12x Dustwind Savage <- Dustwind Savage [npc 3117] L9-10 ~Durotar 53,24 (15 spawns)
    2. kill 12x Dustwind Storm Witch <- Dustwind Storm Witch [npc 3118] L10-11 ~Durotar 52,22 (18 spawns)

## 97281 A Simmering Storm  (L11 req7, 880 xp, F)
  - start: item Dull Storm Orb [277661] (drops from Dustwind Storm Witch, Dustwind Eggtender)
  - end:   Rezlak [npc 3293] @ Durotar 46.4,22.9
  - next=97282
  - text: Bring the Dull Stormy Orb to Rezlak near Drygulch Ravine.

## 887 Southsea Freebooters  (L14 req9, 740 xp)
  - start: Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - end:   Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - next=890
  - text: Kill 12 Southsea Brigands and 6 Southsea Cannoneers for Gazlowe in Ratchet.
  - objectives:
    1. kill 12x Southsea Brigand <- Southsea Brigand [npc 3381] L12-13 ~The Barrens 64,46 (24 spawns)
    2. kill 12x Southsea Cannoneer <- Southsea Cannoneer [npc 3382] L13-14 ~The Barrens 64,47 (19 spawns)

## 890 The Missing Shipment  (L14 req9, 100 xp)
  - start: Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - end:   Wharfmaster Dizzywig [npc 3453] @ The Barrens 63.4,38.5
  - pre(any)=[887], next=892
  - text: Bring Gazlowe's Ledger to Wharfmaster Dizzywig.

## 892 The Missing Shipment  (L14 req9, 100 xp)
  - start: Wharfmaster Dizzywig [npc 3453] @ The Barrens 63.4,38.5
  - end:   Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - pre(any)=[890], next=888
  - text: Return Gazlowe's Ledger to Gazlowe in Ratchet.

## 894 Samophlange  (L14 req10, 740 xp)
  - start: Sputtervalve [npc 3442] @ The Barrens 63.0,37.2
  - end:   Control Console [object 4141] @ The Barrens 52.4,11.7
  - next=900
  - text: Access the control console at the Venture Company research site.

## 900 Samophlange  (L14 req10, 490 xp)
  - start: Control Console [object 4141] @ The Barrens 52.4,11.7
  - end:   Control Console [object 4141] @ The Barrens 52.4,11.7
  - pre(any)=[894], next=901
  - text: Close off the Fuel Control Valve, the Regulator Valve and the Main Control Valve then use the control console again.
  - objectives:
    1. object 1x Main Control Valve <- Main Control Valve [object 4072] ~The Barrens 52,12 (1 spawns)
    2. object 1x Fuel Control Valve <- Fuel Control Valve [object 61936] ~The Barrens 52,11 (1 spawns)
    3. object 1x Regulator Valve <- Regulator Valve [object 61935] ~The Barrens 52,11 (1 spawns)

## 901 Samophlange  (L14 req10, 740 xp)
  - start: Control Console [object 4141] @ The Barrens 52.4,11.7
  - end:   Control Console [object 4141] @ The Barrens 52.4,11.7
  - pre(any)=[900], next=902
  - text: Get the Console Key from Tinkerer Sniggles to use on the control console.
  - objectives:
    1. item 1x Console Key <- Tinkerer Sniggles [npc 3471] L16-16 ~The Barrens 53,10 (1 spawns)

## 6122 The Principal Source  (L14 req14, 740 xp, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Alanndarian Nightsong [npc 3702] @ Darkshore 37.7,40.7
  - pre(any)=[6121], next=6123
  - text: Use the Empty Cliffspring Falls Sampler to draw a sample of water from the mouth of the cave by the falls.
  - text: Deliver the Filled Cliffspring Falls Sampler to Alanndarian Nightsong in Auberdine, Darkshore.
  - objectives:
    1. item 1x Filled Cliffspring Falls Sampler <- Cliffspring Falls Cave Mouth [object 19463] ~Darkshore 55,33 (1 spawns)

## 6125 Power over Poison  (L14 req14, 980 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[6124]
  - text: Return to Mathrengyl Bearwalker in the Cenarion Enclave, Darnassus.

## 94468 Call of Fire  (L14 req10, 1250 xp, F, races=Dwarf, class=Shaman, sort=SHAMAN)
  - start: Brazier of the Dormant Flame [object 61934] @ Durotar 39.0,58.2 (+1 spawns)
  - end:   Bruegs Kindleborn [npc 257597] @ Dun Morogh 87.9,44.8
  - pre(any)=[94467]
  - text: Bring the Torch of Eternal Flame to Bruegs Kindleborn in Dun Morogh.

## 97253 Parts and Pieces  (L15 req9, 1050 xp, F)
  - start: Wrenix the Wretched [npc 7161] @ The Barrens 63.1,36.3
  - end:   Wrenix the Wretched [npc 7161] @ The Barrens 63.1,36.3
  - text: Collect 5 Handfuls of Complicated Parts from the upper pirate camp south of Ratchet, then return to Wrenix the Wretched in Ratchet.
  - objectives:
    1. item 5x Handful of Complicated Parts <- Pile of Complicated Parts [object 660930] ~The Barrens 62,46 (8 spawns)

## 29 Trial of the Lake  (L16 req16, 880 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Tajarri [npc 11799] @ Moonglade 36.5,40.1
  - pre(any)=[26], next=272
  - text: Find a Shrine Bauble in Lake Elune'ara, and take it to the Shrine of Remulos in northwestern Moonglade. Once there, use the Shrine Bauble.
  - text: You must speak with Tajarri at the shrine afterwards in order to complete the trial.
  - objectives:
    1. object 1x Shrine Of Remulos <- Shrine Of Remulos [object 15885] ~Moonglade 36,41 (1 spawns)

## 272 Trial of the Sea Lion  (L16 req16, 880 xp, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Tajarri [npc 11799] @ Moonglade 36.5,40.1
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - pre(any)=[29], next=5061
  - text: Find the Half Pendant of Aquatic Agility and the Half Pendant of Aquatic Endurance. Speak with the residents of Moonglade to learn clues as to where these items may be located.
  - text: Form the Pendant of the Sea Lion from the two pendant halves. You need to be in proximity of the Shrine of Remulos to do this.
  - text: Bring the joined pendant to Dendrite Starblaze in the village of Nighthaven, Moonglade.
  - objectives:
    1. item 1x Pendant of the Sea Lion <- Shrine Of Remulos [object 15885] ~Moonglade 36,41 (1 spawns)

## 866 Root Samples  (L16 req9, 1150 xp, sort=HERBALISM)
  - start: Mebok Mizzyrix [npc 3446] @ The Barrens 62.4,37.6
  - end:   Mebok Mizzyrix [npc 3446] @ The Barrens 62.4,37.6
  - text: Bring 8 Root Samples to Mebok Mizzyrix in Ratchet.
  - objectives:
    1. item 8x Root Sample <- Peacebloom [object 3724] ~The Barrens 51,40 (26 spawns); Silverleaf [object 3725] ~The Barrens 50,30 (24 spawns); Earthroot [object 3726] ~The Barrens 50,35 (20 spawns); Mageroyal [object 3727] ~The Barrens 49,43 (28 spawns)

## 888 Stolen Booty  (L16 req9, 1150 xp)
  - start: Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - end:   Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - pre(any)=[892]
  - text: Retrieve the Shipment of Boots and Telescopic Lens for Gazlowe in Ratchet.
  - objectives:
    1. item 1x Shipment of Boots <- Drizzlik's Emporium [object 3767] ~The Barrens 63,50 (1 spawns)
    2. item 1x Telescopic Lens <- Fragile - Do Not Drop [object 3768] ~The Barrens 64,49 (1 spawns)

## 895 WANTED: Baron Longshore  (L16 req11, 1150 xp)
  - start: WANTED [object 3972] @ The Barrens 62.6,37.5
  - end:   Gazlowe [npc 3391] @ The Barrens 62.7,36.2
  - text: Bring the head of Baron Longshore to Gazlowe in Ratchet.
  - objectives:
    1. item 1x Baron Longshore's Head <- Baron Longshore [npc 3467] L16-16 ~The Barrens 63,49 (3 spawns)

## 902 Samophlange  (L16 req10, 1150 xp)
  - start: Control Console [object 4141] @ The Barrens 52.4,11.7
  - end:   Sputtervalve [npc 3442] @ The Barrens 63.0,37.2
  - pre(any)=[901], next=3921
  - text: Return the Samophlange to Sputtervalve in Ratchet.

## 5061 Aquatic Form  (L16 req16, 1150 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[272]
  - text: Return to Darnassus and show Mathrengyl Bearwalker the Pendant of the Sea Lion.

## 858 Ignition  (L18 req13, 1350 xp)
  - start: Wizzlecrank's Shredder [npc 3439] @ The Barrens 56.5,7.5
  - end:   Wizzlecrank's Shredder [npc 3439] @ The Barrens 56.5,7.5
  - next=863
  - text: Get the Ignition Key and bring it to Wizzlecrank.
  - objectives:
    1. item 1x Ignition Key <- Supervisor Lugwizzle [npc 3445] L18-18 ~The Barrens 56,9 (1 spawns)

## 863 The Escape  (L18 req13, 1700 xp)
  - start: Wizzlecrank's Shredder [npc 3439] @ The Barrens 56.5,7.5
  - end:   Sputtervalve [npc 3442] @ The Barrens 63.0,37.2
  - pre(any)=[858]
  - text: Protect Wizzlecrank and the stolen goblin shredder on the way to Sputtervalve in Ratchet.

## 865 Raptor Horns  (L18 req13, 1350 xp)
  - start: Mebok Mizzyrix [npc 3446] @ The Barrens 62.4,37.6
  - end:   Mebok Mizzyrix [npc 3446] @ The Barrens 62.4,37.6
  - next=1491
  - text: Gather 5 Intact Raptor Horns from Sunscale Scytheclaws, and bring them to Mebok Mizzyrix in Ratchet.
  - objectives:
    1. item 5x Intact Raptor Horn <- Sunscale Scytheclaw [npc 3256] L16-18 ~The Barrens 52,37 (89 spawns); Ishamuhale [npc 3257] L19-19 ~The Barrens 60,31 (1 spawns); Takk the Leaper [npc 5842] L19-19 ~The Barrens 60,8 (1 spawns)

## 896 Miner's Fortune  (L18 req13, 1700 xp)
  - start: Wharfmaster Dizzywig [npc 3453] @ The Barrens 63.4,38.5
  - end:   Wharfmaster Dizzywig [npc 3453] @ The Barrens 63.4,38.5
  - text: Retrieve the Cats Eye Emerald from one of the Venture Co. Overseers or Enforcers for Wharfmaster Dizzywig at Ratchet.
  - objectives:
    1. item 1x Cats Eye Emerald <- Venture Co. Enforcer [npc 3283] L14-17 ~The Barrens 61,4 (29 spawns); Venture Co. Overseer [npc 3286] L15-18 ~The Barrens 61,4 (22 spawns); Boss Copperplug [npc 9336] L19-19 ~The Barrens 60,4 (1 spawns)

## 1069 Deepmoss Spider Eggs  (L20 req15, 1950 xp)
  - start: Mebok Mizzyrix [npc 3446] @ The Barrens 62.4,37.6
  - end:   Mebok Mizzyrix [npc 3446] @ The Barrens 62.4,37.6
  - text: Bring 15 Deepmoss Eggs to Mebok Mizzyrix in Ratchet.
  - objectives:
    1. item 15x Deepmoss Egg <- Deepmoss Eggs [object 19541] ~Stonetalon Mountains 62,57 (45 spawns)

## 1738 Heartswood  (L20 req20, 1550 xp, class=Warlock, sort=WARLOCK)
  - start: Takar the Seer [npc 6244] @ The Barrens 49.3,57.1
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - pre(any)=[1716], next=1739
  - text: Retrieve the Heartswood from Ashenvale and bring it to Gakin the Darkbinder in the Mage Quarter of Stormwind.
  - objectives:
    1. item 1x Heartswood <- Heartswood [object 93192] ~Ashenvale 32,32 (1 spawns)

## 65602 What Is Love?  (L20 req20, 1550 xp, F, class=Warlock, sort=WARLOCK)
  - start: Takar the Seer [npc 6244] @ The Barrens 49.3,57.1
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - pre(any)=[1716], next=65603
  - text: Retrieve the Wooden Figurine and bring it to Gakin the Darkbinder in the Mage Quarter of Stormwind.
  - objectives:
    1. item 1x Wooden Figurine <- Wooden Figurine [object 375544] ~Ashenvale 27,22 (1 spawns)

## 78124 Nar'thalas Almanac  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 409496] @ Darkshore 59.6,22.2
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Nar'thalas Almanac, Vol. 74 <- Scrolls [object 409496] ~Darkshore 60,22 (1 spawns)

## 78127 The Dalaran Digest  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Dalaran Digest [object 409501] @ Silverpine Forest 63.5,63.2
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x The Dalaran Digest, Vol. 23 <- Dalaran Digest [object 409501] ~Silverpine Forest 64,63 (1 spawns)

## 78142 Bewitchments and Glamours  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Spellbook [object 409562] @ Westfall 45.4,70.4
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Bewitchments and Glamours <- Spellbook [object 409562] ~Westfall 45,70 (1 spawns)

## 78143 Secrets of the Dreamers  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 409692] @ The Barrens 49.3,33.0
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Secrets of the Dreamers <- Scrolls [object 409692] ~The Barrens 49,33 (1 spawns)

## 78145 Arcanic Systems Manual  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Manual [object 409700] @ The Barrens 56.3,8.8
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Arcanic Systems Manual <- Manual [object 409700] ~The Barrens 56,9 (1 spawns)

## 78146 Goaz Scrolls  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 409717] @ Wetlands 33.6,47.9
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Goaz Scrolls <- Scrolls [object 409717] ~Wetlands 34,48 (1 spawns)

## 78147 Crimes Against Anatomy  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Spellbook [object 409735] @ Duskwood 16.7,28.4
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Crimes Against Anatomy <- Spellbook [object 409735] ~Duskwood 17,28 (1 spawns)

## 78148 Runes of the Sorcerer-Kings  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 409731] @ Loch Modan 77.4,14.0
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Runes of the Sorcerer-Kings <- Scrolls [object 409731] ~Loch Modan 77,14 (1 spawns)

## 78149 Fury of the Land  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 409711] @ Stonetalon Mountains 74.4,85.7
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Fury of the Land <- Scrolls [object 409711] ~Stonetalon Mountains 74,86 (1 spawns)

## 78150 Friend of the Library  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5

## 79091 Archmage Antonidas: The Unabridged Autobiography  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Library Book [object 386691] @ Ironforge 76.0,10.4
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Archmage Antonidas: The Unabridged Autobiography <- Library Book [object 386691] ~Ironforge 76,10 (1 spawns)

## 79092 Archmage Theocritus' Research Journal  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Library Book [object 386759] @ Elwynn Forest 65.4,70.1
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Archmage Theocritus' Research Journal <- Library Book [object 386759] ~Elwynn Forest 65,70 (1 spawns)

## 79093 Rumi of Gnomeregan: The Collected Works  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Gnomish Tome [object 408014] @ Loch Modan 35.6,48.9 (+1 spawns)
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Rumi of Gnomeregan: The Collected Works <- Gnomish Tome [object 408014] ~Loch Modan 44,51 (2 spawns)

## 79094 The Lessons of Ta'zo  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Mural of Ta'zo [object 405149] @ Orgrimmar 38.7,78.4
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x The Lessons of Ta'zo <- Mural of Ta'zo [object 405149] ~Orgrimmar 39,78 (1 spawns)

## 79095 The Apothecary's Metaphysical Primer  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Apothecary Society Primer [object 405879] @ Tirisfal Glades 59.4,52.3
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x The Apothecary's Metaphysical Primer <- Apothecary Society Primer [object 405879] ~Tirisfal Glades 59,52 (1 spawns)

## 79096 Ataeric: On Arcane Curiosities  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Arcane Secrets [object 410299] @ Silverpine Forest 43.4,41.2
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Ataeric: On Arcane Curiosities <- Arcane Secrets [object 410299] ~Silverpine Forest 43,41 (1 spawns)

## 79097 Baxtan: On Destructive Magics  (L20 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Goblin Tome [object 407566] @ The Barrens 62.7,36.3
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Baxtan: On Destructive Magics <- Goblin Tome [object 407566] ~The Barrens 63,36 (1 spawns)

## 97286 Research Access  (L20 req1, ? xp, F, class=Mage, sort=MAGE)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - pre(any)=[78124, 78127, 78142, 78143, 78145, 78146, 78147, 78148, 78149, 79091, 79092, 79093, 79094, 79095, 79096, 79097, 79535, 79947, 79948, 79949, 79950, 79951, 79952, 79953, 81947, 81949, 81951, 81952, 81953, 81954, 81955, 81956, 84395, 84396, 84397, 84398, 84399, 84400, 84401, 84402]

## 98341 The Great Windborne Cat Spirit  (L20 req20, 780 xp, F, races=Skyborne, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Avatar of Saeyleenan [npc 272054] @ Moonglade 43.9,73.4
  - pre(any)=[98340, 98393], next=98404, exclusiveTo=[98394, 98405]
  - text: Seek out the Avatar of Saeyleenan in the southern part Moonglade and learn what it has to share with you about the nature of the windborne cat.

## 98394 The Great Cat Spirit  (L20 req20, 780 xp, F, races=NightElf, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Great Cat Spirit [npc 11957] @ Moonglade 58.4,73.5
  - pre(any)=[98340, 98393], next=98396, exclusiveTo=[98341, 98405]
  - text: Seek out the Great Cat Spirit in southern part Moonglade and learn what it has to share with you about the nature of the cat.

## 98396 The Great Cat Spirit  (L20 req20, 780 xp, F, races=NightElf, class=Druid, sort=DRUID)
  - start: Great Cat Spirit [npc 11957] @ Moonglade 58.4,73.5
  - end:   Great Cat Spirit [npc 11957] @ Moonglade 58.4,73.5
  - pre(any)=[98394], next=98731, exclusiveTo=[98342, 98404]
  - text: Recover the Relic of the Fang, Relic of the Claw, and Relic of the Silent Shadow from the Stormrage Barrow Den, and return them to the Great Cat Spirit.
  - objectives:
    1. item 1x Relic of the Fang <- Relic of the Fang [object 672821] ~Moonglade 72,66 (1 spawns)
    2. item 1x Relic of the Claw <- Relic of the Claw [object 673093] ~Moonglade 75,67 (1 spawns)
    3. item 1x Relic of the Silent Shadow <- Relic of the Silent Shadow [object 673094] ~Moonglade 74,65 (1 spawns)

## 98397 To Darnassus  (L20 req20, 155 xp, F, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[98731, 98738, 98739], exclusiveTo=[98362]
  - text: Return to Darnassus and speak with Mathrengyl Bearwalker in the Cenarion Enclave.

## 98404 The Great Windborne Cat Spirit  (L20 req20, 780 xp, F, races=Skyborne, class=Druid, sort=DRUID)
  - start: Avatar of Saeyleenan [npc 272054] @ Moonglade 43.9,73.4
  - end:   Avatar of Saeyleenan [npc 272054] @ Moonglade 43.9,73.4
  - pre(any)=[98341], next=98738, exclusiveTo=[98342, 98396]
  - text: Recover the Relic of the Fang, Relic of the Claw, and Relic of the Silent Shadow from the Stormrage Barrow Den, and return them to the Avatar of Saeyleenan.
  - objectives:
    1. item 1x Relic of the Fang <- Relic of the Fang [object 672821] ~Moonglade 72,66 (1 spawns)
    2. item 1x Relic of the Claw <- Relic of the Claw [object 673093] ~Moonglade 75,67 (1 spawns)
    3. item 1x Relic of the Silent Shadow <- Relic of the Silent Shadow [object 673094] ~Moonglade 74,65 (1 spawns)

## 98731 Blessings of the Great Cat Spirit  (L20 req20, 780 xp, F, races=NightElf, class=Druid, sort=DRUID)
  - start: Great Cat Spirit [npc 11957] @ Moonglade 58.4,73.5
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - pre(any)=[98396], next=98397, exclusiveTo=[98738, 98739]
  - text: Speak to Dendrite.

## 98738 Blessings of the Great Windborne Cat Spirit  (L20 req20, 780 xp, F, races=Skyborne, sort=DRUID)
  - start: Avatar of Saeyleenan [npc 272054] @ Moonglade 43.9,73.4
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - pre(any)=[98404], exclusiveTo=[98731, 98739]
  - text: Speak to Dendrite.

## 1483 Ziz Fizziks  (L21 req16, 415 xp)
  - start: Sputtervalve [npc 3442] @ The Barrens 63.0,37.2
  - end:   Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - next=1093, breadcrumbFor=1093
  - text: Speak with Ziz Fizziks in Windshear Crag.

## 95250 Abominable Creatures  (L21 req15, ? xp, F)
  - start: ?
  - end:   ?
  - text: Collect the Head of the Baron in the Ruins of Lordaeron and bring it back to Captain Truman.
  - objectives:
    1. item 1x Head of the Baron <- The Baron [npc 250660] LNone-None

## 97005 Chol'aruk the Ravener  (L21 req15, ? xp, F)
  - start: Bainham [npc 267309] @ The Barrens 61.9,39.4
  - end:   Bainham [npc 267309] @ The Barrens 61.9,39.4
  - text: Bring Chol'aruk's Head to Bainham in the Barrens.
  - objectives:
    1. item 1x Chol'aruk's Head <- Chol'aruk [npc 267307] L20-20 ~The Barrens 58,27 (1 spawns)

## 92415 Remember That I Love You  (L22 req15, ? xp, F)
  - start: item Blood-Stained Parchment [251270] (drops from ?); item Last Scrawlings of Edward Heartweaver [251520] (drops from ?)
  - end:   Orphan Matron Nightingale [npc 14450] @ Stormwind City 56.3,54.0
  - next=95161
  - text: Bring the Blood-Stained Letter to Orphan Matron Nightingale in Stormwind City.

## 95189 Crest of Lordaeron  (L22 req15, ? xp, F)
  - start: item Crest of Lordaeron [268579] (drops from ?)
  - end:   Lady Dena Kennedy [npc 15991] @ Stormwind City 68.0,28.9
  - exclusiveTo=[95204]
  - text: Return the Crest of Lordaeron to Lady Dena Kennedy in Stormwind City.

## 95195 Bloodied Insignia  (L22 req15, ? xp, F)
  - start: item Bloodied Insignia [268535] (drops from Skeleton, Ragged Ghoul, Mangled Cadaver)
  - end:   General Marcus Jonathan [npc 466] @ Stormwind City 69.2,82.7
  - text: Collect 10 Bloodied Insignias and take them to General Marcus Jonathan in Stormwind City.
  - objectives:
    1. item 10x Bloodied Insignia <- Skeleton [npc 250618] LNone-None; Cadaver [npc 250621] LNone-None; Ragged Ghoul [npc 250622] LNone-None; Mangled Cadaver [npc 250623] LNone-None

## 79192 Stepping Stones  (L24 req14, 1950 xp, F)
  - start: Nailed Plank [object 417072] @ The Barrens 46.4,73.8; Nailed Plank [object 424010] @ Westfall 37.4,50.8
  - end:   Pocket Litter [object 424005] @ Stonetalon Mountains 40.8,52.6
  - pre(any)=[79007, 79008], next=79980
  - text: You tear the note from the plank and read the scrawled writing.

## 1740 The Orb of Soran'ruk  (L25 req20, 2550 xp, class=Warlock, sort=WARLOCK)
  - start: Doan Karhan [npc 6247] @ The Barrens 49.3,57.2
  - end:   Doan Karhan [npc 6247] @ The Barrens 49.3,57.2
  - text: Find 3 Soran'ruk Fragments and 1 Large Soran'ruk Fragment and return them to Doan Karhan in the Barrens.
  - objectives:
    1. item 3x Soran'ruk Fragment <- Twilight Acolyte [npc 4809] L24-25
    2. item 1x Large Soran'ruk Fragment <- Shadowfang Darksoul [npc 3855] L21-21

## 3370 In Nightmares  (L25 req15, 2000 xp)
  - start: Falla Sagewind [npc 8418] @ The Barrens 48.2,32.8
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[6981]
  - text: Bring the Nightmare Shard to Mathrengyl Bearwalker in Darnassus.

## 1719 The Affray  (L30 req30, 2450 xp, class=Warrior, sort=WARRIOR)
  - start: Klannoc Macleod [npc 6236] @ The Barrens 68.6,49.2
  - end:   Klannoc Macleod [npc 6236] @ The Barrens 68.6,49.2
  - pre(any)=[1718], next=1791
  - text: Kill Big Will, then speak to Klannoc Macleod on Fray Island.
  - objectives:
    1. kill 1x Big Will <- Big Will [npc 6238] L33-33 ~The Barrens 69,49 (1 spawns)

## 1758 Tome of the Cabal  (L30 req30, 610 xp, class=Warlock, sort=WARLOCK)
  - start: Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - end:   Krom Stoutarm [npc 6294] @ Ironforge 74.2,9.4
  - next=1802
  - text: Speak with Krom Stoutarm in Ironforge.

## 1791 The Windwatcher  (L30 req30, 245 xp, class=Warrior, sort=WARRIOR)
  - start: Klannoc Macleod [npc 6236] @ The Barrens 68.6,49.2
  - end:   Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9
  - pre(any)=[1719], next=1712
  - text: Speak with Bath'rah the Windwatcher.

## 1795 The Binding  (L30 req30, 2450 xp, class=Warlock, sort=WARLOCK)
  - start: Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - end:   Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - pre(any)=[1805, 1804]
  - text: Using the Tome of the Cabal, summon and subdue a felhunter, then return the Tome of the Cabal to Strahad Farsan in Ratchet.
  - objectives:
    1. kill 1x Summoned Felhunter <- Summoned Felhunter [npc 6268] L30-30 ~The Barrens 63,35 (1 spawns)

## 1796 Components for the Enchanted Gold Bloodrobe  (L31 req31, 2500 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - next=4781
  - text: Bring Robes of the Arcana to Menara Voidrender in the Barrens.
  - objectives:
    1. item 1x Robes of Arcana <- ?

## 4781 Components for the Enchanted Gold Bloodrobe  (L34 req31, 2000 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Xizk Goodstitch [npc 2670] @ Stranglethorn Vale 28.7,76.9
  - pre(any)=[1796], next=4782
  - text: Bring a Gold Bar to Xizk Goodstitch in Stranglethorn Vale.
  - objectives:
    1. item 1x Gold Bar <- Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns); Solid Chest [object 2855] ~Hillsbrad Foothills 51,41 (52 spawns)

## 79535 Basilisks: Should Petrification be Feared?  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Research Notes [object 421526] @ Stranglethorn Vale 41.5,50.8
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Basilisks: Should Petrification be Feared? <- Research Notes [object 421526] ~Stranglethorn Vale 42,51 (1 spawns)

## 79536 Greater Friend of the Library  (L35 req20, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - pre(any)=[78150]

## 79947 Geomancy: The Stone-Cold Truth  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 423895] @ Thousand Needles 34.4,40.1 (+1 spawns)
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Geomancy: The Stone-Cold Truth <- Scrolls [object 423895] ~Thousand Needles 34,40 (2 spawns)

## 79948 Defensive Magics 101  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Manual [object 423896] @ Alterac Mountains 48.4,57.6 (+1 spawns)
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Defensive Magics 101 <- Manual [object 423896] ~Alterac Mountains 48,58 (2 spawns)

## 79949 A Web of Lies: Debunking Myths and Legends  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 423897] @ Arathi Highlands 73.6,65.2
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x A Web of Lies: Debunking Myths and Legends <- Scrolls [object 423897] ~Arathi Highlands 74,65 (1 spawns)

## 79950 Demons and You  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Mysterious Book [object 423898] @ Desolace 55.0,26.2
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Demons and You <- Mysterious Book [object 423898] ~Desolace 55,26 (1 spawns)

## 79951 Mummies: A Guide to the Unsavory Undead  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Scrolls [object 423899] @ Badlands 56.7,39.9
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Mummies: A Guide to the Unsavory Undead <- Scrolls [object 423899] ~Badlands 57,40 (1 spawns)

## 79952 RwlRwlRwlRwl!  (L35 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Waterlogged Book [object 423900] @ Dustwallow Marsh 57.2,20.8
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x RwlRwlRwlRwl! <- Waterlogged Book [object 423900] ~Dustwallow Marsh 57,21 (1 spawns)

## 79953 A Ludite's Guide to Caring for Your Demonic Pet  (L35 req1, ? xp, F)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 423901] @ Swamp of Sorrows 61.5,22.5
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x A Luddite's Guide to Caring for Your Demonic Pet <- ?

## 4783 Components for the Enchanted Gold Bloodrobe  (L37 req31, 2850 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - pre(any)=[4782], next=4784
  - text: Bring 10 Vials of Hatefury Blood and 1 Lesser Infernal Stone to Menara Voidrender in the Barrens.
  - objectives:
    1. item 1x Vial of Hatefury Blood <- Hatefury Rogue [npc 4670] L31-32 ~Desolace 75,18 (14 spawns); Hatefury Trickster [npc 4671] L31-32 ~Desolace 76,21 (15 spawns); Hatefury Felsworn [npc 4672] L31-32 ~Desolace 75,20 (16 spawns); Hatefury Betrayer [npc 4673] L32-33 ~Desolace 76,19 (16 spawns)
    2. item 1x Lesser Infernal Stone <- Lesser Infernal [npc 4676] L36-37 ~Desolace 53,77 (16 spawns); Demon Portal Guardian [npc 11937] L38-39 ~Desolace 52,77 (26 spawns)

## 4784 Components for the Enchanted Gold Bloodrobe  (L37 req31, 2100 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - pre(any)=[4783], next=4786
  - text: Bring some Fine Gold Thread, 2 Smoldering Coals, and a Soul Shard to Menara Voidrender in the Barrens.
  - objectives:
    1. item 1x Fine Gold Thread <- Xizk Goodstitch [npc 2670] L43-43 ~Stranglethorn Vale 29,77 (1 spawns)
    2. item 2x Smoldering Coal <- Burning Exile [npc 2760] L38-39 ~Arathi Highlands 26,30 (14 spawns)
    3. item 1x Soul Shard <- ?

## 4786 The Completed Robe  (L38 req31, 3550 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - pre(any)=[4784]
  - text: Wait for Menara Voidrender to complete your robe and then speak to her again.
  - objectives:
    1. kill 1x Menara Voidrender <- Menara Voidrender [npc 6266] L50-50 ~The Barrens 63,35 (1 spawns)

## 1799 Fragments of the Orb of Orahil  (L40 req35, 3150 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Tabetha [npc 6546] @ Dustwallow Marsh 46.1,57.1
  - pre(any)=[4965, 4967, 4968, 4969]
  - text: Speak to Menara's acolytes inside the tower above Ratchet and choose one of their paths to follow.
  - text: Afterwards, bring an Infernal Orb to Tabetha in Dustwallow Marsh.
  - objectives:
    1. item 1x Infernal Orb <- Burning Blade Summoner [npc 4668] L38-39 ~Desolace 68,78 (13 spawns)

## 4490 Summon Felsteed  (L40 req40, 315 xp, class=Warlock, sort=WARLOCK)
  - start: Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - end:   Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - pre(any)=[3631, 4487, 4488, 4489]
  - text: Speak to Strahad Farsan in Ratchet to learn the ability to summon a Felsteed.

## 4962 Shard of a Felhound  (L40 req35, 2350 xp, class=Warlock, sort=WARLOCK)
  - start: Acolyte Wytula [npc 6254] @ The Barrens 62.6,35.3
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - exclusiveTo=[4963]
  - text: Take the Felhas Ruby and use it on one of the Felhounds found in Desolace. After successful, bring the Felhas Ruby and the Imprisoned Felhound Spirit back to Menara Voidrender in the Barrens.
  - objectives:
    1. item 1x Imprisoned Felhound Spirit <- Mana Eater [npc 4678] L37-38 ~Desolace 52,68 (2 spawns)

## 4963 Shard of an Infernal  (L40 req35, 2350 xp, class=Warlock, sort=WARLOCK)
  - start: Acolyte Magaz [npc 6252] @ The Barrens 62.6,35.2
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - exclusiveTo=[4962]
  - text: Take the Infus Emerald and use it on one of the Infernals found in Desolace. After successful, bring the Infus Emerald and the Imprisoned Infernal Spirit back to Menara Voidrender in the Barrens.
  - objectives:
    1. item 1x Imprisoned Infernal Spirit <- Lesser Infernal [npc 4676] L36-37 ~Desolace 53,77 (16 spawns)

## 4964 The Completed Orb of Dar'Orahil  (L40 req35, 3900 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - pre(all)=[4976, -4962], exclusiveTo=[4963]
  - text: Wait for Menara Voidrender to complete the Orb of Dar'Orahil and then speak to her again.
  - objectives:
    1. kill 1x Menara Voidrender <- Menara Voidrender [npc 6266] L50-50 ~The Barrens 63,35 (1 spawns)

## 4975 The Completed Orb of Noh'Orahil  (L40 req35, 3900 xp, class=Warlock, sort=WARLOCK)
  - start: Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - pre(all)=[4976, -4963], exclusiveTo=[4962]
  - text: Wait for Menara Voidrender to complete the Orb of Noh'Orahil and then speak to her again.
  - objectives:
    1. kill 1x Menara Voidrender <- Menara Voidrender [npc 6266] L50-50 ~The Barrens 63,35 (1 spawns)

## 81947 Sanguine Sorcery  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441247] @ Swamp of Sorrows 70.0,51.0
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Sanguine Sorcery <- Book [object 441247] ~Swamp of Sorrows 70,51 (1 spawns)

## 81949 Legends of the Tidesages  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441248] @ Tanaris 72.7,47.8
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Legends of the Tidesages <- Book [object 441248] ~Tanaris 73,48 (1 spawns)

## 81951 The Liminal and the Arcane  (L45 req1, ? xp, F)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441249] @ Feralas 50.6,15.7
  - end:   ?
  - objectives:
    1. item 1x The Liminal and the Arcane <- Book [object 441249] ~Feralas 51,16 (1 spawns)

## 81952 Everyday Etiquette  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441250] @ Azshara 20.7,62.0
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Everyday Etiquette <- Book [object 441250] ~Azshara 21,62 (1 spawns)

## 81953 Stonewrought Design  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441251] @ Burning Steppes 29.0,28.9
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Stonewrought Design <- Book [object 441251] ~Burning Steppes 29,29 (1 spawns)

## 81954 Venomous Journeys  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441252] @ The Hinterlands 36.0,72.8
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Venomous Journeys <- Book [object 441252] ~The Hinterlands 36,73 (1 spawns)

## 81955 A Mind of Metal  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441253] @ Searing Gorge 37.8,49.3 (+1 spawns)
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x A Mind of Metal <- Book [object 441253] ~Searing Gorge 38,49 (2 spawns)

## 81956 Conjurer's Codex  (L45 req1, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5; Book [object 441254] @ Blasted Lands 55.4,32.2 (+2 spawns)
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - objectives:
    1. item 1x Conjurer's Codex <- Book [object 441254] ~Blasted Lands 55,32 (3 spawns)

## 82084 A Lesson in Literacy  (L45 req42, 3900 xp, F, class=Mage, sort=MAGE)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - text: Track down and collect the spellbook materials requested by the librarian.
  - objectives:
    1. item 1x Pristine Owlbeast Quill <- Vicious Owlbeast [npc 2927] L42-43 ~The Hinterlands 30,57 (27 spawns); Primitive Owlbeast [npc 2928] L44-45 ~The Hinterlands 42,53 (44 spawns); Savage Owlbeast [npc 2929] L46-47 ~The Hinterlands 58,50 (173 spawns)
    2. item 1x Zukk'ash Resin <- Zukk'ash Stinger [npc 5244] L45-46 ~Feralas 76,64 (10 spawns); Zukk'ash Wasp [npc 5245] L44-45 ~Feralas 74,63 (10 spawns); Zukk'ash Worker [npc 5246] L44-45 ~Feralas 75,61 (10 spawns); Zukk'ash Tunneler [npc 5247] L45-46 ~Feralas 76,64 (29 spawns)
    3. item 1x Farraki Papyrus <- Zul'Farrak Zombie [npc 7286] L43-44; Shallow Grave [object 128308]; Shallow Grave [object 128403]

## 82208 Greater Friend of the Library  (L45 req35, ? xp, F, sort=SPECIAL)
  - start: Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - end:   Owen Thadd [npc 211022] @ Undercity 73.4,33.0; Garion Wendell [npc 211033] @ Stormwind City 48.9,86.5
  - pre(any)=[79536]
  - text: You will need to hand in 25 books to complete this quest, however you can hand 1 in at any time.

## 3633 Goblin Engineering  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Tinkerwiz [npc 3494] @ The Barrens 62.7,36.3
  - end:   Nixx Sprocketspring [npc 8126] @ Tanaris 52.5,27.3
  - next=3638, exclusiveTo=[3526, 3629, 4181, 3640, 3642]
  - text: If you wish to learn more about Goblin Engineering, take the Manual of Engineering Disciplines to Nixx Sprocketspring in Gadgetzan.

## 3634 Gnome Engineering  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Tinkerwiz [npc 3494] @ The Barrens 62.7,36.3
  - end:   Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - next=3640, exclusiveTo=[3630, 3632, 3635, 3637, 3638, 3642]
  - text: If you wish to learn more about Gnome Engineering, take the Manual of Engineering Disciplines to Tinkmaster Overspark in Ironforge.

## 3646 Membership Card Renewal  (L47 req30, ? xp, sort=ENGINEERING, repeatable)
  - start: Vazario Linkgrease [npc 8738] @ The Barrens 62.7,36.2
  - end:   Vazario Linkgrease [npc 8738] @ The Barrens 62.7,36.2
  - pre(any)=[3639, 3641, 3643]

## 1124 Wasteland  (L55 req54, 2800 xp)
  - start: Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - end:   Layo Starstrike [npc 13220] @ Silithus 81.9,18.9
  - pre(any)=[1123, 6762], next=1125
  - text: Speak with Layo Starstrike near the Valor's Rest graveyard of Silithus, showing him Rabine's Letter.

## 1185 Under the Chitin Was...  (L57 req54, 3000 xp)
  - start: Umber [npc 11939] @ Moonglade 44.9,35.6
  - end:   Umber [npc 11939] @ Moonglade 44.9,35.6
  - pre(any)=[6845]

## 6845 Uncovering Past Secrets  (L57 req54, 7550 xp)
  - start: Umber [npc 11939] @ Moonglade 44.9,35.6
  - end:   Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - pre(any)=[6844], next=1185
  - text: Speak with Rabine Saturna in the village of Nighthaven, Moonglade.

## 93773 The Pact  (L58 reqNone, 3100 xp, F)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Ketharas [npc 256222] @ Felwood 51.2,82.2 (+1 spawns)
  - pre(any)=[95006], next=96930
  - text: Report back Ketharas on Mount Hyjal.

## 95006 Stolen Power  (L58 reqNone, 620 xp, F)
  - start: Orokai [npc 216289] @ Moonglade 41.5,43.6
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - pre(any)=[96209], next=93773
  - text: Speak with Orokai when you are ready to see what he learned from the Faintly Glowing Branch.

## 96209 The Ancient, Orokai  (L58 reqNone, 620 xp, F)
  - start: Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - end:   Orokai [npc 216289] @ Moonglade 41.5,43.6
  - pre(any)=[92612], next=95006
  - text: Seek out Orokai in Moonglade.

## 5526 Shards of the Felvine  (L60 req56, 8300 xp)
  - start: Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - end:   Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - pre(any)=[5527]
  - text: Find the Felvine in Dire Maul and acquire a shard from it. Chances are you'll only be able to procure one with the demise of Alzzin the Wildshaper. Use the Reliquary of Purity to securely seal the shard inside, and return it to Rabine Saturna in Nighthaven, Moonglade.
  - objectives:
    1. item 1x Sealed Reliquary of Purity <- ?

## 5527 A Reliquary of Purity  (L60 req56, 6600 xp)
  - start: Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - end:   Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - next=5526
  - text: Travel to Silithus and search for a Reliquary of Purity within the ruins of Southwind Village. If you are able to find it, return with it to Rabine Saturna in Nighthaven, Moonglade.
  - objectives:
    1. item 1x Reliquary of Purity <- Dusty Reliquary [object 179565] ~Silithus 63,55 (1 spawns)

## 8447 Waking Legends  (L60 req60, ? xp, sort=EPIC)
  - start: Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - end:   Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - pre(any)=[8446]
  - text: Wait for Keeper Remulos at the Moonglade to cleanse the Nightmare Engulfed Object.

## 8648 Darkcore the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Darkcore [npc 15564] @ Undercity 66.6,38.2
  - end:   Elder Darkcore [npc 15564] @ Undercity 66.6,38.2

## 8670 Runetotem the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Runetotem [npc 15572] @ Durotar 53.2,43.7
  - end:   Elder Runetotem [npc 15572] @ Durotar 53.2,43.7

## 8680 Windtotem the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Windtotem [npc 15582] @ The Barrens 62.7,36.7
  - end:   Elder Windtotem [npc 15582] @ The Barrens 62.7,36.7

## 8686 High Mountain the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder High Mountain [npc 15588] @ The Barrens 45.1,57.9
  - end:   Elder High Mountain [npc 15588] @ The Barrens 45.1,57.9

## 8717 Moonwarden the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Moonwarden [npc 15597] @ The Barrens 51.4,30.7
  - end:   Elder Moonwarden [npc 15597] @ The Barrens 51.4,30.7

## 8735 The Nightmare's Corruption  (L60 req60, 6600 xp)
  - start: Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - end:   Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - pre(any)=[8734], next=8736
  - text: Travel to the four Emerald Dream portals in Azeroth and collect a Fragment of the Nightmare's Corruption from each. Return to Keeper Remulos in the Moonglade when you have completed this task.
  - objectives:
    1. item 1x Fragment of the Nightmare's Corruption <- Emeraldon Boughguard [npc 12474] L62-62 ~Ashenvale 93,39 (8 spawns); Emeraldon Tree Warder [npc 12475] L60-60 ~Ashenvale 91,39 (6 spawns); Emeraldon Oracle [npc 12476] L61-61 ~Ashenvale 92,39 (7 spawns)
    2. item 1x Fragment of the Nightmare's Corruption <- Twilight Corrupter [npc 15625] L63-63 ~Duskwood 49,40 (1 spawns)
    3. item 1x Fragment of the Nightmare's Corruption <- Jademir Oracle [npc 5317] L61-61 ~Feralas 51,12 (20 spawns); Jademir Tree Warder [npc 5319] L60-60 ~Feralas 51,12 (20 spawns); Jademir Boughguard [npc 5320] L62-62 ~Feralas 51,12 (20 spawns); Jademir Dragonspawn [npc 5315] L60-60
    4. item 1x Fragment of the Nightmare's Corruption <- Verdantine Boughguard [npc 12477] L62-62 ~The Hinterlands 64,26 (22 spawns); Verdantine Oracle [npc 12478] L61-61 ~The Hinterlands 64,25 (15 spawns); Verdantine Tree Warder [npc 12479] L60-60 ~The Hinterlands 63,25 (8 spawns)

## 8736 The Nightmare Manifests  (L60 req60, 9950 xp)
  - start: Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - end:   Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - pre(any)=[8735], next=8741
  - text: Defend Nighthaven from Eranikus. Do not let Keeper Remulos perish. Do not slay Eranikus. Defend yourself. Await Tyrande.

## 8741 The Champion Returns  (L60 req60, 6600 xp)
  - start: Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - end:   Anachronos [npc 15192] @ Tanaris 65.3,50.0
  - pre(any)=[8736]
  - text: Take the Green Scepter Shard to Anachronos at the Caverns of Time in Tanaris.

## 8862 Elune's Candle  (L60 req10, ? xp, sort=LUNAR_FESTIVAL)
  - start: Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - end:   Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8863 Festival Dumplings  (L60 req1, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - end:   Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8864 Festive Lunar Dresses  (L60 req1, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - end:   Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8865 Festive Lunar Pant Suits  (L60 req1, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - end:   Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8867 Lunar Fireworks  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Lunar Festival Harbinger [npc 15895] @ Undercity 65.6,36.0 (+5 spawns)
  - end:   Lunar Festival Harbinger [npc 15895] @ Undercity 65.6,36.0 (+5 spawns)
  - next=8883
  - text: Launch 8 Lunar Fireworks and 2 Cluster Fireworks and return to a Lunar Festival Harbinger at any capital city.
  - objectives:
    1. object 1x Firework Launcher <- Firework Launcher [object 180771] ~Undercity 49,44 (111 spawns)
    2. object 1x Cluster Launcher <- Cluster Launcher [object 180772] ~Undercity 53,44 (65 spawns)

## 8868 Elune's Blessing  (L60 req40, 6600 xp, sort=LUNAR_FESTIVAL)
  - start: Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - end:   Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - text: Summon Omen, defeat him and gain Elune's Blessing. Return to Valadar Starsong in Nighthaven

## 8876 Small Rockets  (L60 req25, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8877 Firework Launcher  (L60 req45, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8878 Festive Recipes  (L60 req50, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8879 Large Rockets  (L60 req35, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8880 Cluster Rockets  (L60 req45, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8881 Large Cluster Rockets  (L60 req55, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8882 Cluster Launcher  (L60 req55, ? xp, sort=LUNAR_FESTIVAL, repeatable)
  - start: Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - end:   Fariel Starsong [npc 15909] @ Moonglade 53.8,35.3
  - objectives:
    1. item 1x Coin of Ancestry <- ?

## 8883 Valadar Starsong  (L60 req1, 660 xp, sort=LUNAR_FESTIVAL)
  - start: Lunar Festival Harbinger [npc 15895] @ Undercity 65.6,36.0 (+5 spawns)
  - end:   Valadar Starsong [npc 15864] @ Moonglade 53.6,35.3
  - pre(any)=[8867]
  - text: Use your Lunar Festival Invitation in the moonlight to travel to Moonglade. Speak with Valadar Starsong in Nighthaven when you arrive.

## 8993 Gift Giving  (L60 req1, ? xp, sort=SEASONAL, repeatable)
  - start: Kwee Q. Peddlefeet [npc 16075] @ Undercity 55.2,90.0 (+5 spawns)
  - end:   Kwee Q. Peddlefeet [npc 16075] @ Undercity 55.2,90.0 (+5 spawns)
  - objectives:
    1. item 1x Alliance Gift Collection <- ?

## 9267 Mending Old Wounds  (L60 req15, ? xp, repeatable)
  - start: Mupsi Shacklefridd [npc 16418] @ The Barrens 61.2,37.9
  - end:   Mupsi Shacklefridd [npc 16418] @ The Barrens 61.2,37.9
  - objectives:
    1. item 1x Linen Cloth <- Hidden Strongbox [object 2039] ~Alterac Mountains 19,67 (16 spawns); Battered Chest [object 2844]; Tattered Chest [object 2845]; Tattered Chest [object 2847]
    2. item 1x Empty Vial <- ?

## 91899 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - objectives:
    1. item 1x Sealed Apprentice Crate <- ?

## 91900 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - objectives:
    1. item 1x Sealed Journeyman Crate <- ?

## 91901 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9

## 91902 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9

## 91904 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - objectives:
    1. item 1x Sealed Apprentice Crate <- ?

## 91905 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - objectives:
    1. item 1x Sealed Journeyman Crate <- ?

## 91906 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9

## 91907 A Sealed Crate  (L60 req1, ? xp, F, repeatable)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9

## 93862 Crate Return  (L60 req1, ? xp, F)
  - start: Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - end:   Dokimi [npc 256386] @ The Barrens 50.1,29.4; Marcy Baker [npc 256390] @ Redridge Mountains 9.7,70.9
  - objectives:
    1. item 1x Notarized Shipping Container <- ?

## 96339 Legacy Reward: Replica Ironforge Air Rifle  (L60 reqNone, ? xp, F)
  - start: Innkeeper Wiley [npc 6791] @ The Barrens 62.0,39.4
  - end:   Innkeeper Wiley [npc 6791] @ The Barrens 62.0,39.4

## 96383 Legacy Reward: Spectral Bear Cub  (L60 reqNone, ? xp, F)
  - start: Innkeeper Wiley [npc 6791] @ The Barrens 62.0,39.4
  - end:   Innkeeper Wiley [npc 6791] @ The Barrens 62.0,39.4

