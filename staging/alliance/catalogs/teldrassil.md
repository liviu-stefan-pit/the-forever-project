# Teldrassil: Alliance + neutral quests (107)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 458 The Woodland Protector  (L1 req1, 40 xp)
  - start: Melithar Staghelm [npc 2077] @ Teldrassil 59.9,42.5
  - end:   Tarindrella [npc 1992] @ Teldrassil 57.8,45.2
  - next=459
  - text: Seek out the dryad known as Tarindrella.

## 3116 Simple Sigil  (L1 req1, 40 xp, races=NightElf, class=Warrior, sort=WARRIOR)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Alyissia [npc 3593] @ Teldrassil 59.6,38.4
  - pre(any)=[456]
  - text: Read the Simple Sigil and speak to Alyissia in Shadowglen.

## 3117 Etched Sigil  (L1 req1, 40 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Ayanna Everstride [npc 3596] @ Teldrassil 58.7,40.5
  - pre(any)=[456]
  - text: Read the Etched Sigil and speak to Ayanna Everstride at the top of Aldrassil in Shadowglen.

## 3118 Encrypted Sigil  (L1 req1, 40 xp, races=NightElf, class=Rogue, sort=ROGUE)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Frahun Shadewhisper [npc 3594] @ Teldrassil 59.6,38.7
  - pre(any)=[456]
  - text: Read the Encrypted Sigil and speak to Frahun Shadewhisper in Shadowglen.

## 3119 Hallowed Sigil  (L1 req1, 40 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Shanda [npc 3595] @ Teldrassil 59.2,40.4
  - pre(any)=[456]
  - text: Read the Hallowed Sigil and speak to Shanda in Aldrassil.

## 3120 Verdant Sigil  (L1 req1, 40 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Mardant Strongoak [npc 3597] @ Teldrassil 58.6,40.3
  - pre(any)=[456]
  - text: Read the Verdant Sigil and speak to Mardant Strongoak, in the tree Aldrassil in Shadowglen.

## 5842 Welcome!  (L1 req1, ? xp, races=NightElf)
  - start: item Shadowglen Gift Voucher [14648] (drops from ?)
  - end:   Orenthil Whisperwind [npc 11942] @ Teldrassil 58.8,44.4
  - text: Bring the Shadowglen Gift Voucher to Orenthil Whisperwind.

## 97979 The Goddess Provides  (L1 req1, 40 xp, F, races=NightElf, sort=NIGHT_ELF)
  - start: Shanda [npc 3595] @ Teldrassil 59.2,40.4
  - end:   Shanda [npc 3595] @ Teldrassil 59.2,40.4
  - pre(any)=[456]
  - text: Cast Elune's Light and Shadowmeld.

## 456 The Balance of Nature  (L2 req1, 170 xp)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - next=457
  - text: Kill 7 Young Nightsabers and 4 Young Thistle Boars and return to Conservator Ilthalaine.
  - objectives:
    1. kill 7x Young Nightsaber <- Young Nightsaber [npc 2031] L1-1 ~Teldrassil 61,43 (25 spawns)
    2. kill 7x Young Thistle Boar <- Young Thistle Boar [npc 1984] L1-2 ~Teldrassil 59,43 (24 spawns)

## 457 The Balance of Nature  (L3 req1, 250 xp)
  - start: Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - end:   Conservator Ilthalaine [npc 2079] @ Teldrassil 58.7,44.3
  - pre(any)=[456]
  - text: Conservator Ilthalaine needs you to kill 7 Mangy Nightsabers and 7 Thistle Boars.
  - objectives:
    1. kill 7x Mangy Nightsaber <- Mangy Nightsaber [npc 2032] L2-2 ~Teldrassil 61,36 (23 spawns)
    2. kill 1x Thistle Boar <- Thistle Boar [npc 1985] L2-3 ~Teldrassil 59,36 (20 spawns)

## 459 The Woodland Protector  (L3 req1, 250 xp)
  - start: Tarindrella [npc 1992] @ Teldrassil 57.8,45.2
  - end:   Tarindrella [npc 1992] @ Teldrassil 57.8,45.2
  - pre(any)=[458]
  - text: Collect 8 Fel Moss and bring them to Tarindrella.
  - objectives:
    1. item 8x Fel Moss <- Grell [npc 1988] L2-3 ~Teldrassil 56,45 (12 spawns); Grellkin [npc 1989] L3-4 ~Teldrassil 55,41 (28 spawns); Gremlin [npc 1990] L3-4

## 97977 Nature's Call  (L3 req1, 250 xp, F, races=NightElf)
  - start: Tarindrella [npc 1992] @ Teldrassil 57.8,45.2
  - end:   Tarindrella [npc 1992] @ Teldrassil 57.8,45.2
  - pre(any)=[458]
  - text: Collect 4 Gnarlpine Totems and bring them to Tarindrella.
  - objectives:
    1. item 4x Gnarlpine Totem <- Gnarlpine Totem [object 668482] ~Teldrassil 55,42 (6 spawns); Gnarlpine Totem [object 668493] ~Teldrassil 55,41 (6 spawns)

## 916 Webwood Venom  (L4 req3, 355 xp)
  - start: Gilshalan Windwalker [npc 2082] @ Teldrassil 57.8,41.6
  - end:   Gilshalan Windwalker [npc 2082] @ Teldrassil 57.8,41.6
  - next=917
  - text: Bring 10 Webwood Venom Sacs to Gilshalan Windwalker at Aldrassil.
  - objectives:
    1. item 10x Webwood Venom Sac <- Webwood Spider [npc 1986] L3-4 ~Teldrassil 57,29 (62 spawns); Webwood Creeper UNUSED [npc 1987] L3-4

## 3519 A Friend in Need  (L4 req2, 90 xp)
  - start: Iverron [npc 8584] @ Teldrassil 54.6,33.0
  - end:   Dirania Silvershine [npc 8583] @ Teldrassil 60.9,42.0
  - pre(any)=[4495], next=3521
  - text: Speak to Dirania Silvershine in Shadowglen.

## 3521 Iverron's Antidote  (L4 req2, 355 xp)
  - start: Dirania Silvershine [npc 8583] @ Teldrassil 60.9,42.0
  - end:   Dirania Silvershine [npc 8583] @ Teldrassil 60.9,42.0
  - pre(any)=[3519], next=3522
  - text: Collect 7 Hyacinth Mushrooms, 4 Moonpetal Lilies, and 1 Webwood Ichor for Dirania Silveshine in Shadowglen.
  - objectives:
    1. item 7x Hyacinth Mushroom <- Grell [npc 1988] L2-3 ~Teldrassil 56,45 (12 spawns); Grellkin [npc 1989] L3-4 ~Teldrassil 55,41 (28 spawns); Hyacinth Mushroom [object 152094] ~Teldrassil 59,41 (38 spawns)
    2. item 1x Moonpetal Lily <- Moonpetal Lily [object 152095] ~Teldrassil 58,38 (18 spawns)
    3. item 1x Webwood Ichor <- Webwood Spider [npc 1986] L3-4 ~Teldrassil 57,29 (62 spawns)

## 3522 Iverron's Antidote  (L4 req2, 445 xp)
  - start: Dirania Silvershine [npc 8583] @ Teldrassil 60.9,42.0
  - end:   Iverron [npc 8584] @ Teldrassil 54.6,33.0
  - pre(any)=[3521]
  - text: Bring Iverron's Antidote to Iverron before the time limit is up. Iverron can be found by the cave to the north.

## 4495 A Good Friend  (L4 req2, 270 xp)
  - start: Dirania Silvershine [npc 8583] @ Teldrassil 60.9,42.0
  - end:   Iverron [npc 8584] @ Teldrassil 54.6,33.0
  - next=3519
  - text: Find Iverron by the cave to the north.

## 5621 Garments of the Moon  (L4 req5, 270 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - end:   Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - text: Find Sentinel Shaya and heal her wounds using Lesser Heal (Rank 2). Afterwards, grant her Power Word: Fortitude and then return to Laurna Morninglight in Dolanaar.
  - objectives:
    1. kill 1x Sentinel Shaya <- Sentinel Shaya [npc 12429] L7-7 ~Teldrassil 57,64 (1 spawns)

## 5622 In Favor of Elune  (L4 req5, 90 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Shanda [npc 3595] @ Teldrassil 59.2,40.4
  - end:   Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - next=5621, breadcrumbFor=5621
  - text: Speak to Laurna Morninglight in Teldrassil.

## 488 Zenn's Bidding  (L5 req4, 450 xp)
  - start: Zenn Foulhoof [npc 2150] @ Teldrassil 60.4,56.2
  - end:   Zenn Foulhoof [npc 2150] @ Teldrassil 60.4,56.2
  - next=489
  - text: Bring Zenn Foulhoof outside of Dolanaar 3 Nightsaber Fangs, 3 Strigid Owl Feathers and 3 swatches of Webwood Spider Silk.
  - objectives:
    1. item 3x Nightsaber Fang <- Elder Nightsaber [npc 2033] L8-9 ~Teldrassil 42,38 (15 spawns); Feral Nightsaber [npc 2034] L10-11 ~Teldrassil 39,27 (6 spawns); Nightsaber [npc 2042] L5-6 ~Teldrassil 56,58 (41 spawns); Nightsaber Stalker [npc 2043] L7-8 ~Teldrassil 49,70 (32 spawns)
    2. item 1x Strigid Owl Feather <- Strigid Owl [npc 1995] L5-6 ~Teldrassil 58,58 (36 spawns); Strigid Screecher [npc 1996] L7-8 ~Teldrassil 48,66 (36 spawns); Strigid Hunter [npc 1997] L8-9 ~Teldrassil 41,39 (13 spawns)
    3. item 1x Webwood Spider Silk <- Webwood Lurker [npc 1998] L5-6 ~Teldrassil 58,60 (37 spawns); Webwood Venomfang [npc 1999] L7-8 ~Teldrassil 48,68 (30 spawns); Webwood Silkspinner [npc 2000] L8-9 ~Teldrassil 42,39 (16 spawns); Giant Webwood Spider [npc 2001] L10-11 ~Teldrassil 41,27 (4 spawns)

## 917 Webwood Egg  (L5 req1, 560 xp)
  - start: Gilshalan Windwalker [npc 2082] @ Teldrassil 57.8,41.6
  - end:   Gilshalan Windwalker [npc 2082] @ Teldrassil 57.8,41.6
  - pre(any)=[916], next=920
  - text: Bring a Webwood Egg to Gilshalan in Aldrassil.
  - objectives:
    1. item 1x Webwood Egg <- Webwood Eggs [object 4406] ~Teldrassil 57,26 (6 spawns)

## 920 Tenaron's Summons  (L5 req1, 45 xp)
  - start: Gilshalan Windwalker [npc 2082] @ Teldrassil 57.8,41.6
  - end:   Tenaron Stormgrip [npc 3514] @ Teldrassil 59.1,39.5
  - pre(any)=[917], next=921
  - text: Speak with Tenaron Stormgrip atop Aldrassil in Shadowglen.

## 921 Crown of the Earth  (L5 req1, 335 xp)
  - start: Tenaron Stormgrip [npc 3514] @ Teldrassil 59.1,39.5
  - end:   Tenaron Stormgrip [npc 3514] @ Teldrassil 59.1,39.5
  - pre(any)=[920], next=928
  - text: Fill the Crystal Phial and bring it back to Tenaron Stormgrip atop Aldrassil.
  - objectives:
    1. item 1x Filled Crystal Phial <- Shadowglen Moonwell [object 19549] ~Teldrassil 60,33 (1 spawns)

## 928 Crown of the Earth  (L5 req1, 225 xp)
  - start: Tenaron Stormgrip [npc 3514] @ Teldrassil 59.1,39.5
  - end:   Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - pre(any)=[921], next=929
  - text: Bring the Partially Filled Vessel to Corithras Moonrage in Dolanaar.

## 929 Crown of the Earth  (L5 req1, 335 xp)
  - start: Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - end:   Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - pre(any)=[928], next=933
  - text: Fill the Jade Phial and bring it back to Corithras Moonrage in Dolanaar.
  - objectives:
    1. item 1x Filled Jade Phial <- Starbreeze Village Moonwell [object 19550] ~Teldrassil 63,58 (1 spawns)

## 997 Denalan's Earth  (L5 req4, 225 xp)
  - start: Syral Bladeleaf [npc 2083] @ Teldrassil 56.1,57.7
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - text: Bring the package of Rare Earth to Denalan at Lake Al'Ameth.

## 2159 Dolanaar Delivery  (L5 req1, 110 xp)
  - start: Porthannius [npc 6780] @ Teldrassil 61.2,47.6
  - end:   Innkeeper Keldamyr [npc 6736] @ Teldrassil 55.6,59.8
  - text: Bring the Dolanaar Delivery to Innkeeper Keldamyr.

## 97236 Fang of Githyiss  (L5 req1, 450 xp, F)
  - start: item Fang of Githyiss [277190] (drops from Githyiss the Vile)
  - end:   Gilshalan Windwalker [npc 2082] @ Teldrassil 57.8,41.6
  - text: Deliver the Fang of Githyiss to someone interested in the study of spiders in Aldrassil.

## 475 A Troubling Breeze  (L6 req4, 270 xp)
  - start: Athridas Bearmantle [npc 2078] @ Teldrassil 56.0,57.3
  - end:   Gaerolas Talvethren [npc 2107] @ Teldrassil 66.3,58.5
  - next=476
  - text: Seek out Gaerolas Talvethren in Starbreeze Village.

## 476 Gnarlpine Corruption  (L6 req4, 540 xp)
  - start: Gaerolas Talvethren [npc 2107] @ Teldrassil 66.3,58.5
  - end:   Athridas Bearmantle [npc 2078] @ Teldrassil 56.0,57.3
  - pre(any)=[475], next=483
  - text: Return to Athridas Bearmantle in Dolanaar.

## 2438 The Emerald Dreamcatcher  (L6 req1, 405 xp)
  - start: Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - end:   Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - next=2459
  - text: Bring the Emerald Dreamcatcher to Tallonkai Swiftroot in Dolanaar.
  - objectives:
    1. item 1x Emerald Dreamcatcher <- Tallonkai's Dresser [object 126158] ~Teldrassil 68,60 (1 spawns)

## 96606 The Great Outdoors  (L6 req4, 405 xp, F, races=NightElf, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - exclusiveTo=[95998, 96101, 96604, 96605, 96607, 96608]
  - text: Sit near Lyreena's Basic Campfire and wait until you receive the Boosted Rest buff.
  - objectives:
    1. object 1x Basic Campfire <- Basic Campfire [object 460003] ~Teldrassil 58,57 (1 spawns)
    2. object 1x Basic Campfire <- Basic Campfire [object 460003] ~Teldrassil 58,57 (1 spawns)

## 96630 The Adventurer  (L6 req4, 405 xp, F, sort=CAMPING)
  - start: Lost Journal [object 654846] @ Teldrassil 59.1,39.5
  - end:   Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - pre(any)=[921], next=96606, breadcrumbFor=96606, exclusiveTo=[96627, 96628, 96638, 96652, 96656, 96659]
  - text: Bring the journal to Lyreena Duskblade near Dolanaar.

## 96634 Camping 101: Cooking  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Zarrin [npc 6286] @ Teldrassil 57.1,61.3
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96626, 96629, 96646, 96655, 96658, 96661]
  - text: Speak with Zarrin in Dolanaar to learn to become a cook.
  - objectives:
    1. kill 1x Zarrin <- Zarrin [npc 6286] L13-13 ~Teldrassil 57,61 (1 spawns)

## 97938 Camping 101: Alchemy  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Cyndra Kindwhisper [npc 3603] @ Teldrassil 57.6,60.8
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96045, 97899, 97915, 97927, 97951, 97963]
  - text: Speak with Cyndra Kindwhisper in Dolanaar to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Cyndra Kindwhisper <- Cyndra Kindwhisper [npc 3603] L28-28 ~Teldrassil 58,61 (1 spawns)

## 97939 Camping 101: Blacksmithing  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Elisa Steelhand [npc 6300] @ Darkshore 38.1,41.1
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96044, 97900, 97916, 97928, 97952, 97964]
  - text: Speak with Elisa Steelhand in Auberdine in Darkshore to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Elisa Steelhand <- Elisa Steelhand [npc 6300] L30-30 ~Darkshore 38,41 (1 spawns)

## 97940 Camping 101: Enchanting  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Alanna Raveneye [npc 3606] @ Teldrassil 36.7,34.2
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96059, 97901, 97917, 97929, 97953, 98284, 98286]
  - text: Speak with Alanna Raveneye in the Oracle Glade in Teldrassil to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Alanna Raveneye <- Alanna Raveneye [npc 3606] L29-29 ~Teldrassil 37,34 (1 spawns)

## 97941 Camping 101: Engineering  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Jenna Lemkenilli [npc 11037] @ Darkshore 38.3,41.1
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96058, 97902, 97918, 97930, 97954, 98285, 98287]
  - text: Speak with Jenna Lemkenilli in Auberdine in Darkshore to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Jenna Lemkenilli <- Jenna Lemkenilli [npc 11037] L26-26 ~Darkshore 38,41 (1 spawns)

## 97942 Camping 101: First Aid  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Byancie [npc 6094] @ Teldrassil 55.3,56.8
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96047, 97903, 97919, 97931, 97955, 97965]
  - text: Speak with Byancie in Dolanaar to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Byancie <- Byancie [npc 6094] L22-22 ~Teldrassil 55,57 (1 spawns)

## 97943 Camping 101: Fishing  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Astaia [npc 4156] @ Darnassus 47.9,56.6
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96050, 97904, 97920, 97932, 97956, 97967]
  - text: Speak with Astaia in Darnassus to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Astaia <- Astaia [npc 4156] L35-35 ~Darnassus 48,57 (1 spawns)

## 97944 Camping 101: Herbalism  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Malorne Bladeleaf [npc 3604] @ Teldrassil 57.7,60.6
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96055, 97905, 97921, 97933, 97957, 97968]
  - text: Speak with Malorne Bladeleaf in Dolanaar to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Malorne Bladeleaf <- Malorne Bladeleaf [npc 3604] L17-17 ~Teldrassil 58,61 (1 spawns)

## 97946 Camping 101: Leatherworking  (L6 req4, 270 xp, F, races=NightElf, class=Hunter/Rogue/Druid, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Nadyia Maneweaver [npc 3605] @ Teldrassil 41.9,49.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96031, 97906, 97922, 97934, 97958, 97969]
  - text: Speak with Nadyia Maneweaver on the road to Darnassus from Dolanaar to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Nadyia Maneweaver <- Nadyia Maneweaver [npc 3605] L30-30 ~Teldrassil 42,49 (1 spawns)

## 97948 Camping 101: Mining  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Kurdram Stonehammer [npc 6297] @ Darkshore 38.2,41.0
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96046, 97907, 97923, 97935, 97959, 97970]
  - text: Speak with Kurdram Stonehammer in Auberdine to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Kurdram Stonehammer <- Kurdram Stonehammer [npc 6297] L35-35 ~Darkshore 38,41 (1 spawns)

## 97949 Camping 101: Skinning  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Radnaal Maneweaver [npc 6287] @ Teldrassil 42.1,50.0
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96056, 97908, 97924, 97936, 97960, 97971]
  - text: Speak with Radnaal Maneweaver on the road to Darnassus from Dolanaar to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Radnaal Maneweaver <- Radnaal Maneweaver [npc 6287] L19-19 ~Teldrassil 42,50 (1 spawns)

## 97950 Camping 101: Tailoring  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Lyreena Duskblade [npc 265811] @ Teldrassil 57.6,56.6
  - end:   Trianna [npc 11050] @ Darnassus 63.5,21.2
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96057, 96102, 97925, 97937, 97961, 97972, 97973]
  - text: Speak with Trianna in Darnassus to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Trianna <- Trianna [npc 11050] L25-25 ~Darnassus 64,21 (1 spawns)

## 489 Seek Redemption!  (L7 req4, 630 xp)
  - start: Sentinel Kyra Starsong [npc 2081] @ Teldrassil 56.0,59.5; Syral Bladeleaf [npc 2083] @ Teldrassil 56.1,57.7; Moon Priestess Amara [npc 2151] @ Teldrassil 52.9,57.2; Sentinel Shayla Nightbreeze [npc 2155] @ Teldrassil 40.5,50.7
  - end:   Zenn Foulhoof [npc 2150] @ Teldrassil 60.4,56.2
  - pre(any)=[488]
  - text: Collect 3 Fel Cones and give them to Zenn Foulhoof outside of Dolanaar.
  - objectives:
    1. item 3x Fel Cone <- Fel Cone [object 1673] ~Teldrassil 54,64 (64 spawns)

## 918 Timberling Seeds  (L7 req4, 630 xp)
  - start: Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - next=922
  - text: Bring 8 Timberling Seeds to Denelan at Lake Al'Ameth.
  - objectives:
    1. item 8x Timberling Seed <- Timberling [npc 2022] L5-6 ~Teldrassil 59,67 (27 spawns); Timberling Bark Ripper [npc 2025] L7-8 ~Teldrassil 52,72 (12 spawns); Timberling Trampler [npc 2027] L8-9 ~Teldrassil 46,52 (12 spawns); Timberling Mire Beast [npc 2029] L9-10 ~Teldrassil 43,34 (9 spawns)

## 919 Timberling Sprouts  (L7 req4, 790 xp)
  - start: Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - text: Bring 12 Timberling Sprouts to Denalan at Lake Al'Ameth.
  - objectives:
    1. item 12x Timberling Sprout <- Timberling Sprout [object 4608] ~Teldrassil 56,69 (33 spawns)

## 922 Rellian Greenspyre  (L7 req4, 315 xp)
  - start: Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - end:   Rellian Greenspyre [npc 3517] @ Darnassus 38.2,21.6
  - pre(any)=[918], next=923
  - text: Bring a Timberling Seed to Rellian Greenspyre in Darnassus.

## 4161 Recipe of the Kaldorei  (L7 req1, 630 xp, sort=COOKING)
  - start: Zarrin [npc 6286] @ Teldrassil 57.1,61.3
  - end:   Zarrin [npc 6286] @ Teldrassil 57.1,61.3
  - text: Collect 7 Small Spider Legs for Zarrin in Dolanaar.
  - objectives:
    1. item 7x Small Spider Leg <- Forest Spider [npc 30] L5-6 ~Elwynn Forest 37,69 (16 spawns); Mine Spider [npc 43] L7-9 ~Elwynn Forest 61,47 (8 spawns); Mother Fang [npc 471] L7-10 ~Elwynn Forest 62,48 (1 spawns); Cliff Lurker [npc 1184] L18-18 ~Loch Modan 59,64 (17 spawns)

## 87288 Soft Saber Pelts  (L7 req4, 630 xp, F)
  - start: Aldia [npc 3608] @ Teldrassil 55.5,57.1
  - end:   Aldia [npc 3608] @ Teldrassil 55.5,57.1
  - text: Bring 6 Soft Nightsaber Pelts to Aldria.
  - objectives:
    1. item 6x Soft Nightsaber Pelt <- Nightsaber [npc 2042] L5-6 ~Teldrassil 56,58 (41 spawns)

## 487 The Road to Darnassus  (L8 req5, 700 xp)
  - start: Moon Priestess Amara [npc 2151] @ Teldrassil 52.9,57.2
  - end:   Moon Priestess Amara [npc 2151] @ Teldrassil 52.9,57.2
  - text: Slay 6 Gnarlpine Ambushers and return to Sentinel Amara Nightwalker outside of Dolanaar.
  - objectives:
    1. kill 6x Gnarlpine Ambusher <- Gnarlpine Ambusher [npc 2152] L6-7 ~Teldrassil 47,53 (15 spawns)

## 490 Bounty: Gnarlpine Furbolg  (L8 req5, 700 xp, F)
  - start: Sentinel Shayla Nightbreeze [npc 2155] @ Teldrassil 40.5,50.7
  - end:   Sentinel Shayla Nightbreeze [npc 2155] @ Teldrassil 40.5,50.7
  - text: Shayla Nightbreeze on the road outside of Darnassus wants you to bring her 15 Gnarlpine Fangs.
  - objectives:
    1. item 15x Gnarlpine Fang <- Gnarlpine Ursa [npc 2006] L5-6 ~Teldrassil 66,61 (10 spawns); Gnarlpine Gardener [npc 2007] L5-6 ~Teldrassil 66,61 (13 spawns); Gnarlpine Warrior [npc 2008] L6-7 ~Teldrassil 63,59 (34 spawns); Gnarlpine Shaman [npc 2009] L7-8 ~Teldrassil 46,65 (47 spawns)

## 932 Twisted Hatred  (L8 req4, 700 xp)
  - start: Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - end:   Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - next=98403
  - text: Kill Lord Melenas and bring his head to Tallonkai Swiftroot in Dolanaar.
  - objectives:
    1. item 1x Melenas' Head <- Lord Melenas [npc 2038] L8-8 ~Teldrassil 52,50 (3 spawns)

## 1581 Elixirs for the Bladeleafs  (L8 req4, 700 xp, sort=ALCHEMY)
  - start: Syral Bladeleaf [npc 2083] @ Teldrassil 56.1,57.7
  - end:   Syral Bladeleaf [npc 2083] @ Teldrassil 56.1,57.7
  - text: Bring 6 Elixirs of Lion's Strength and 2 Elixirs of Minor Defense to Syral Bladeleaf in Dolanaar.
  - objectives:
    1. item 6x Elixir of Lion's Strength <- ?
    2. item 6x Elixir of Minor Defense <- ?

## 2459 Ferocitas the Dream Eater  (L8 req1, 880 xp)
  - start: Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - end:   Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - pre(any)=[2438]
  - text: Tallonkai Swiftroot in Dolanaar wants you to kill 7 Gnarlpine Mystics and find the Missing Jewel.
  - objectives:
    1. kill 7x Gnarlpine Mystic <- Gnarlpine Mystic [npc 7235] L6-7 ~Teldrassil 69,53 (9 spawns)
    2. item 1x Tallonkai's Jewel <- ?

## 2541 The Sleeping Druid  (L8 req3, 700 xp)
  - start: Oben Rageclaw [npc 7317] @ Teldrassil 44.9,61.6
  - end:   Oben Rageclaw [npc 7317] @ Teldrassil 44.9,61.6
  - next=2561
  - text: Bring a Shaman Voodoo Charm to Oben Rageclaw in the Ban'ethil Barrow Den.
  - objectives:
    1. item 1x Shaman Voodoo Charm <- Gnarlpine Shaman [npc 2009] L7-8 ~Teldrassil 46,65 (47 spawns)

## 483 The Relics of Wakening  (L9 req4, 780 xp)
  - start: Athridas Bearmantle [npc 2078] @ Teldrassil 56.0,57.3
  - end:   Athridas Bearmantle [npc 2078] @ Teldrassil 56.0,57.3
  - pre(any)=[476], next=486
  - text: Retrieve the Relics of Wakening and bring them to Athridas Bearmantle in Dolanaar.
  - objectives:
    1. item 1x Raven Claw Talisman <- Chest of the Raven Claw [object 2740] ~Teldrassil 46,57 (1 spawns)
    2. item 1x Black Feather Quill <- Chest of the Black Feather [object 2739] ~Teldrassil 44,61 (1 spawns)
    3. item 1x Sapphire of Sky <- Chest of the Sky [object 2741] ~Teldrassil 45,62 (1 spawns)
    4. item 1x Rune of Nesting <- Chest of Nesting [object 2742] ~Teldrassil 44,61 (1 spawns)

## 923 Tumors  (L9 req4, 980 xp)
  - start: Rellian Greenspyre [npc 3517] @ Darnassus 38.2,21.6
  - end:   Rellian Greenspyre [npc 3517] @ Darnassus 38.2,21.6
  - pre(any)=[922], next=2498
  - text: Bring 5 Mossy Tumors to Rellian Greenspyre in Darnassus.
  - objectives:
    1. item 5x Mossy Tumor <- Timberling Trampler [npc 2027] L8-9 ~Teldrassil 46,52 (12 spawns); Timberling Mire Beast [npc 2029] L9-10 ~Teldrassil 43,34 (9 spawns); Elder Timberling [npc 2030] L10-11 ~Teldrassil 44,27 (9 spawns)

## 933 Crown of the Earth  (L9 req1, 780 xp)
  - start: Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - end:   Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - pre(any)=[929], next=7383
  - text: Fill the Tourmaline Phial and bring it back to Corithras Moonrage in Dolanaar.
  - objectives:
    1. item 1x Filled Tourmaline Phial <- Pools of Arlithrien Moonwell [object 19551] ~Teldrassil 42,67 (1 spawns)

## 2498 Return to Denalan  (L9 req4, 80 xp)
  - start: Rellian Greenspyre [npc 3517] @ Darnassus 38.2,21.6
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - pre(any)=[923], next=2499
  - text: Rellian Greenspyre wants you to speak with Denalan at Lake Al'Ameth.

## 2499 Oakenscowl  (L9 req4, 980 xp)
  - start: Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - pre(any)=[2498]
  - text: Denalan at Lake Al'Ameth wants you to collect the Gargantuan Tumor from Oakenscowl.
  - objectives:
    1. item 1x Gargantuan Tumor <- Oakenscowl [npc 2166] L9-9 ~Teldrassil 54,75 (1 spawns)

## 99046 The Lost Runner  (L9 req4, 80 xp, F)
  - start: Sentinel Kyra Starsong [npc 2081] @ Teldrassil 56.0,59.5
  - end:   Sentinel Eralya Leafshadow [npc 275683] @ Teldrassil 37.5,36.8
  - next=99047, breadcrumbFor=99047
  - text: Search for Sentinel Eralya Leafshadow on the road leading to the Oracle Glade.

## 99047 Not Dead Yet  (L9 req4, 80 xp, F)
  - start: Sentinel Eralya Leafshadow [npc 275683] @ Teldrassil 37.5,36.8
  - end:   Byancie [npc 6094] @ Teldrassil 55.3,56.8
  - next=99050
  - text: Seek aid from Byancie in Dolanaar for Sentinel Eralya Leafshadow.

## 930 The Glowing Fruit  (L10 req4, 840 xp)
  - start: Strange Fruited Plant [object 6751] @ Teldrassil 42.6,76.2
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - pre(any)=[918]
  - text: Bring the glowing fruit to Denalan at Lake Al'Ameth.

## 931 The Shimmering Frond  (L10 req4, 840 xp)
  - start: Strange Fronded Plant [object 6752] @ Teldrassil 34.6,28.8
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - pre(any)=[918], next=2399
  - text: Bring a Shimmering Frond to Denalan at Lake Al'Ameth

## 1684 Elanaria  (L10 req10, 85 xp, class=Warrior, sort=WARRIOR)
  - start: Moon Priestess Amara [npc 2151] @ Teldrassil 52.9,57.2; Kyra Windblade [npc 3598] @ Teldrassil 56.2,59.2; Sentinel Elissa Starbreeze [npc 3657] @ Darkshore 39.0,43.5
  - end:   Elanaria [npc 4088] @ Darnassus 57.3,34.6
  - exclusiveTo=[1639, 1678, 1683]
  - text: Speak with Elanaria.

## 2241 The Apple Falls  (L10 req10, 420 xp, class=Rogue, sort=ROGUE)
  - start: Jannok Breezesong [npc 3599] @ Teldrassil 56.4,60.1
  - end:   Syurna [npc 4163] @ Darnassus 37.0,21.9
  - next=2242
  - text: Take Jannok's Rose to Syurna in Darnassus.

## 2399 The Sprouted Fronds  (L10 req4, 85 xp)
  - start: Sprouted Frond [object 7510] @ Teldrassil 60.8,68.6 (+2 spawns)
  - end:   Sprouted Frond [object 7510] @ Teldrassil 60.8,68.6 (+2 spawns)
  - pre(any)=[931]

## 2561 Druid of the Claw  (L10 req3, 1050 xp)
  - start: Oben Rageclaw [npc 7317] @ Teldrassil 44.9,61.6
  - end:   Oben Rageclaw [npc 7317] @ Teldrassil 44.9,61.6
  - pre(any)=[2541]
  - text: Oben Rageclaw wants you to kill his soulless body, and then use the Voodoo Charm.
  - objectives:
    1. kill 1x Rageclaw <- Rageclaw [npc 7318] L10-10 ~Teldrassil 46,59 (1 spawns)

## 5629 Returning Home  (L10 req10, 210 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5627, 5628, 5630, 5631, 5632, 5633]
  - text: Speak to Priestess Alathea in Darnassus.

## 5636 Desperate Prayer  (L10 req10, 210 xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5634, 5635, 5637, 5638, 5639, 5640]
  - text: Speak to High Priestess Laurena in Stormwind.

## 5925 Heeding the Call  (L10 req10, 85 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Kal [npc 3602] @ Teldrassil 56.0,61.6
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - next=5921, breadcrumbFor=5921, exclusiveTo=[5923, 5924]
  - text: Speak with Mathrengyl Bearwalker in the Cenarion Enclave, Darnassus.

## 6063 Taming the Beast  (L10 req10, 840 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - next=6101, exclusiveTo=[94013]
  - text: Use the Taming Rod to tame a Webwood Lurker. Practice your skills, then return the Taming Rod to Dazalar in Dolanaar.
  - objectives:
    1. kill 1x Webwood Lurker <- Webwood Lurker [npc 1998] L5-6 ~Teldrassil 58,60 (37 spawns)

## 6072 The Hunter's Path  (L10 req10, 85 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Ayanna Everstride [npc 3596] @ Teldrassil 58.7,40.5
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - next=6063, breadcrumbFor=6063, exclusiveTo=[6071, 6073, 6721, 6722]
  - text: Speak with Dazalar in Dolanaar.

## 6101 Taming the Beast  (L10 req10, 840 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - pre(any)=[6063], next=6102
  - text: Use the Taming Rod to tame a Nightsaber Stalker. Practice your skills, then return the Taming Rod to Dazalar in Dolanaar.
  - objectives:
    1. kill 1x Nightsaber Stalker <- Nightsaber Stalker [npc 2043] L7-8 ~Teldrassil 49,70 (32 spawns)

## 6102 Taming the Beast  (L10 req10, 840 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - pre(any)=[6101], next=6103
  - text: Use the Taming Rod to tame a Strigid Screecher. Practice your skills, then return the Taming Rod to Dazalar in Dolanaar.
  - objectives:
    1. kill 1x Strigid Screecher <- Strigid Screecher [npc 1996] L7-8 ~Teldrassil 48,66 (36 spawns)

## 6103 Training the Beast  (L10 req10, 420 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - end:   Jocaste [npc 4146] @ Darnassus 40.4,8.6
  - pre(any)=[6102]
  - text: Speak to Jocaste in the Cenarion Enclave, in Darnassus.

## 94775 Divine Grace  (L10 req10, 210 xp, F, races=Human, class=Priest, sort=PRIEST)
  - start: Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[94773, 94774, 94776, 94777, 94778, 94779]
  - text: Speak to High Priestess Laurena in Stormwind.

## 99050 The Great Tree Provides  (L10 req4, 840 xp, F, races=NightElf/Skyborne)
  - start: Byancie [npc 6094] @ Teldrassil 55.3,56.8
  - end:   Byancie [npc 6094] @ Teldrassil 55.3,56.8
  - pre(any)=[99047], next=99073
  - text: Collect 6 Dewy Lasher Fronds, an Empty Vial, and a Refreshing Spring Water for Byancie in Dolanaar.
  - objectives:
    1. item 6x Dewy Lasher Frond <- Lasher Sproutling [npc 275703] L6-7 ~Teldrassil 57,69 (176 spawns); Blooming Lasher [npc 275708] L9-10 ~Teldrassil 43,36 (126 spawns); Wrathvine [npc 276099] L8-8 ~Teldrassil 56,70 (33 spawns)
    2. item 1x Empty Vial <- ?
    3. item 1x Refreshing Spring Water <- ?

## 99053 Escaping Ban'ethil  (L10 req4, 840 xp, F)
  - start: Sentinel Lynessa Duskblossom [npc 275744] @ Teldrassil 44.7,58.9
  - end:   Sentinel Kyra Starsong [npc 2081] @ Teldrassil 56.0,59.5
  - text: Help Sentinel Lynessa Duskblossom escape Ban'ethil Barrow Den, and report her safety to Sentinel Kyra Starsong in Dolanaar.

## 99073 Easing Suffering  (L10 req4, 85 xp, F, races=NightElf/Skyborne)
  - start: Byancie [npc 6094] @ Teldrassil 55.3,56.8
  - end:   Sentinel Eralya Leafshadow [npc 275683] @ Teldrassil 37.5,36.8
  - pre(any)=[99050]
  - text: Take the Lashwater Salve to Sentinel Eralya Leafshadow on the road to the Oracle Tree.

## 934 Crown of the Earth  (L11 req1, 660 xp)
  - start: ?
  - end:   ?
  - next=935, exclusiveTo=[7383]
  - text: Fill the Amethyst Phial and bring it back to Corithras Moonrage in Dolanaar.
  - objectives:
    1. item 1x Vial of Blessed Water <- Temple of the Moon Fountain [object 138498] ~Darnassus 39,86 (1 spawns)

## 935 Crown of the Earth  (L11 req1, 1100 xp)
  - start: Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - pre(any)=[7383], next=98046
  - text: Bring the Filled Vessel to Arch Druid Fandral Staghelm in Darnassus.

## 937 The Enchanted Glade  (L11 req6, 440 xp)
  - start: Sentinel Arynia Cloudsbreak [npc 3519] @ Teldrassil 38.3,34.4
  - end:   Sentinel Arynia Cloudsbreak [npc 3519] @ Teldrassil 38.3,34.4
  - next=98392
  - text: Acquire 6 Bloodfeather Belts and bring them to Sentinel Arynia Cloudsbreak in the Oracle Glade.
  - objectives:
    1. item 6x Bloodfeather Belt <- Bloodfeather Harpy [npc 2015] L8-9 ~Teldrassil 37,40 (11 spawns); Bloodfeather Rogue [npc 2017] L8-9 ~Teldrassil 36,38 (20 spawns); Bloodfeather Sorceress [npc 2018] L9-9 ~Teldrassil 36,39 (5 spawns); Bloodfeather Fury [npc 2019] L9-10 ~Teldrassil 34,28 (5 spawns)

## 940 Teldrassil  (L11 req6, 440 xp)
  - start: Oracle Tree Bark [object 673378] @ Teldrassil 37.0,34.0
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - pre(any)=[98398], next=952
  - text: Deliver the Oracle Tree's report to Arch Druid Fandral Staghelm in Darnassus.

## 7383 Crown of the Earth  (L11 req1, 660 xp)
  - start: Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - end:   Corithras Moonrage [npc 3515] @ Teldrassil 56.1,61.7
  - pre(any)=[933], next=935, exclusiveTo=[934]
  - text: Fill the Amethyst Phial and bring it back to Corithras Moonrage in Dolanaar.
  - objectives:
    1. item 1x Filled Amethyst Phial <- Oracle Glade Moonwell [object 19552] ~Teldrassil 38,34 (1 spawns)

## 98046 Crown of the Earth  (L11 req1, 90 xp, F)
  - start: Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - end:   Lariia [npc 4092] @ Darnassus 40.4,88.7
  - pre(any)=[935], next=98065
  - text: Bring the Drained Vessel to Lariia in the Temple of the Moon in Darnassus.

## 98065 Crown of the Earth  (L11 req1, 90 xp, F, races=NightElf)
  - start: Lariia [npc 4092] @ Darnassus 40.4,88.7
  - end:   Tyrande Whisperwind [npc 7999] @ Darnassus 39.1,81.6
  - pre(any)=[98046]
  - text: Bring the Moonwell Remnants to Tyrande Whisperwind in the Temple of the Moon in Darnassus.

## 486 Ursal the Mauler  (L12 req4, 1150 xp)
  - start: Athridas Bearmantle [npc 2078] @ Teldrassil 56.0,57.3
  - end:   Athridas Bearmantle [npc 2078] @ Teldrassil 56.0,57.3
  - pre(any)=[483]
  - text: Kill Ursal the Mauler and return to Athridas Bearmantle in Dolanaar.
  - objectives:
    1. kill 1x Ursal the Mauler <- Ursal the Mauler [npc 2039] L12-12 ~Teldrassil 39,80 (1 spawns)

## 927 The Moss-twined Heart  (L12 req5, 455 xp)
  - start: item Moss-twined Heart [5179] (drops from Blackmoss the Fetid)
  - end:   Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - next=941
  - text: Bring the Moss-twined Heart to Denalan at Lake Al'Ameth.

## 938 Mist  (L12 req7, 910 xp)
  - start: Mist [npc 3568] @ Teldrassil 31.5,31.6
  - end:   Sentinel Arynia Cloudsbreak [npc 3519] @ Teldrassil 38.3,34.4
  - text: Escort Mist to Sentinel Arynia Cloudsbreak at the moon well near the Oracle Tree.

## 941 Planting the Heart  (L12 req9, 910 xp)
  - start: Denalan [npc 2080] @ Teldrassil 60.9,68.5
  - end:   Denalan's Planter [object 7923] @ Teldrassil 60.8,68.6
  - pre(any)=[927]
  - text: Plant the Tainted Heart in Denalan's Planter.

## 98392 Darkness in the Glade  (L12 req6, 910 xp, F)
  - start: Sentinel Arynia Cloudsbreak [npc 3519] @ Teldrassil 38.3,34.4
  - end:   Sentinel Arynia Cloudsbreak [npc 3519] @ Teldrassil 38.3,34.4
  - pre(any)=[937], next=98398
  - text: Collect Hatescreech's Amulet, Windmistress Gaedress' Amulet, and Witchmother Arysa's Amulet for Sentinel Arynia Cloudsbreak in the Oracle Glade.
  - objectives:
    1. item 1x Hatescreech's Amulet <- Hatescreech [npc 272034] L10-10 ~Teldrassil 35,39 (1 spawns)
    2. item 1x Windmistress Gaedress' Amulet <- Windmistress Gaedress [npc 272044] L10-10 ~Teldrassil 33,36 (1 spawns)
    3. item 1x Witchmother Arysa's Amulet <- Witchmother Arysa [npc 272046] L12-12 ~Teldrassil 34,28 (1 spawns)

## 98398 The Oracle Tree  (L12 req6, 90 xp, F)
  - start: Sentinel Arynia Cloudsbreak [npc 3519] @ Teldrassil 38.3,34.4
  - end:   Oracle Tree Bark [object 673378] @ Teldrassil 37.0,34.0
  - pre(any)=[98392], next=940
  - text: Find the Oracle Tree Bark nearby to receive its message.

## 98403 Twisted Hatred  (L12 req4, 910 xp, F)
  - start: Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - end:   Tallonkai Swiftroot [npc 3567] @ Teldrassil 55.6,57.0
  - pre(any)=[932]
  - text: Kill 8 Befouled Webwoods and bring Xethorr the Wicked's Mature Fel Moss to Tallonkai Swiftroot in Dolanaar.
  - objectives:
    1. kill 8x Befouled Webwood <- Befouled Webwood [npc 272096] L10-11 ~Teldrassil 50,45 (56 spawns)
    2. item 1x Mature Fel Moss <- Xethorr the Wicked [npc 272116] L12-12 ~Teldrassil 51,44 (10 spawns)

## 2259 Erion Shadewhisper  (L16 req16, 115 xp, class=Rogue, sort=ROGUE)
  - start: Jannok Breezesong [npc 3599] @ Teldrassil 56.4,60.1
  - end:   Erion Shadewhisper [npc 4214] @ Darnassus 34.5,25.9
  - next=2260, breadcrumbFor=2260
  - text: Contact Erion Shadewhisper in Darnassus.

## 9388 Flickering Flames in Kalimdor  (L25 req1, 3050 xp, sort=MIDSUMMER)
  - start: Festival Loremaster [npc 16817] @ Teldrassil 56.5,92.2; Festival Talespinner [npc 16818] @ Undercity 66.5,37.8 (+2 spawns)
  - end:   Festival Flamekeeper [npc 16788] @ Teldrassil 56.6,91.9
  - text: Visit the bonfires within Ashenvale, the Barrens, Darkshore, and Stonetalon Mountains, then speak with the Festival Flamekeeper.
  - objectives:
    1. object 1x Flame of Ashenvale <- Flame of Ashenvale [object 181561] ~Ashenvale 65,72 (1 spawns)
    2. object 1x Flame of the Barrens <- Flame of the Barrens [object 181560] ~The Barrens 60,39 (1 spawns)
    3. object 1x Flame of Darkshore <- Flame of Darkshore [object 181563] ~Darkshore 42,91 (1 spawns)
    4. object 1x Flame of Stonetalon <- Flame of Stonetalon [object 181562] ~Stonetalon Mountains 59,72 (1 spawns)

## 9389 Flickering Flames in the Eastern Kingdoms  (L25 req1, 3050 xp, sort=MIDSUMMER)
  - start: Festival Loremaster [npc 16817] @ Teldrassil 56.5,92.2; Festival Talespinner [npc 16818] @ Undercity 66.5,37.8 (+2 spawns)
  - end:   Festival Flamekeeper [npc 16788] @ Teldrassil 56.6,91.9
  - text: Visit the bonfires within Hillsbrad Foothills, Silverpine Forest, Westfall, and the Wetlands, then speak with the Festival Flamekeeper.
  - objectives:
    1. object 1x Flame of Hillsbrad <- Flame of Hillsbrad [object 181566] ~Hillsbrad Foothills 54,34 (1 spawns)
    2. object 1x Flame of Silverpine <- Flame of Silverpine [object 181564] ~Silverpine Forest 54,69 (1 spawns)
    3. object 1x Flame of Westfall <- Flame of Westfall [object 181565] ~Westfall 34,80 (1 spawns)
    4. object 1x Flame of the Wetlands <- Flame of the Wetlands [object 181567] ~Wetlands 51,17 (1 spawns)

## 3661 Favored of Elune?  (L47 req42, 4200 xp)
  - start: Erelas Ambersky [npc 7916] @ Teldrassil 55.5,92.0
  - end:   Erelas Ambersky [npc 7916] @ Teldrassil 55.5,92.0
  - next=978
  - text: Collect 15 Wildkin Feathers from the Hinterlands for Erelas Ambersky in Rut'theran Village.
  - objectives:
    1. item 15x Wildkin Feather <- Wildkin Feather [object 153239] ~The Hinterlands 37,52 (92 spawns)

## 978 Moontouched Wildkin  (L55 req52, 5650 xp)
  - start: Erelas Ambersky [npc 7916] @ Teldrassil 55.5,92.0
  - end:   Erelas Ambersky [npc 7916] @ Teldrassil 55.5,92.0
  - pre(any)=[3661], next=979
  - text: Collect 10 Moontouched Feathers from Winterspring, then return to Erelas Ambersky in Rut'theran Village.
  - objectives:
    1. item 10x Moontouched Feather <- Moontouched Feather [object 175407] ~Winterspring 48,40 (60 spawns)

## 5250 Starfall  (L56 req53, 580 xp)
  - start: Daryn Lightwind [npc 7907] @ Teldrassil 55.4,92.2
  - end:   Wynd Nightchaser [npc 11079] @ Winterspring 52.0,30.4
  - next=5244, breadcrumbFor=5244, exclusiveTo=[5249]
  - text: Find Starfall in Winterspring and speak with Wynd Nightchaser.

## 979 Find Ranshalla  (L57 req52, 3000 xp)
  - start: Erelas Ambersky [npc 7916] @ Teldrassil 55.5,92.0
  - end:   Ranshalla [npc 10300] @ Winterspring 63.1,59.5
  - pre(any)=[978], next=4901
  - text: Find Ranshalla in eastern Winterspring.

## 8715 Bladeleaf the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Bladeleaf [npc 15595] @ Teldrassil 57.3,60.8
  - end:   Elder Bladeleaf [npc 15595] @ Teldrassil 57.3,60.8

## 8734 Tyrande and Remulos  (L60 req60, 1650 xp)
  - start: Forest Wisp [npc 15624] @ Teldrassil 37.5,47.9
  - end:   Keeper Remulos [npc 11832] @ Moonglade 36.2,41.8
  - pre(any)=[8733], next=8735
  - text: Travel to the Moonglade and speak to Keeper Remulos.

## 9365 A Thief's Reward  (L60 req50, ? xp, sort=MIDSUMMER)
  - start: Festival Loremaster [npc 16817] @ Teldrassil 56.5,92.2
  - end:   Festival Loremaster [npc 16817] @ Teldrassil 56.5,92.2
  - pre(all)=[9324, 9325, 9326]

## 9367 The Festival of Fire  (L60 req1, 0 xp, sort=MIDSUMMER)
  - start: Festival Loremaster [npc 16817] @ Teldrassil 56.5,92.2
  - end:   Festival Loremaster [npc 16817] @ Teldrassil 56.5,92.2
  - text: Touch the bonfires within Stormwind, Ironforge, and Darnassus, then speak to a Festival Loremaster within the capital cities.
  - objectives:
    1. object 1x Flame of Stormwind <- Flame of Stormwind [object 181332] ~Stormwind City 50,72 (1 spawns)
    2. object 1x Flame of Ironforge <- Flame of Ironforge [object 181333] ~Ironforge 65,25 (1 spawns)
    3. object 1x Flame of Darnassus <- Flame of Darnassus [object 181334] ~Teldrassil 57,92 (1 spawns)

# Service NPCs

- Keldas <Pet Trainer> [npc 3306] 56.8,59.8: trainer
- Lyrai <General Supplies> [npc 3587] 59.5,40.9: vendor
- Khardan Proudblade <Weaponsmith> [npc 3588] 58.7,39.7: repair, vendor
- Keina <Bowyer> [npc 3589] 59.3,41.1: repair, vendor
- Janna Brightmoon <Clothier> [npc 3590] 59.5,41.0: repair, vendor
- Freja Nightwing <Leather Armor Merchant> [npc 3591] 59.0,39.6: repair, vendor
- Andiss <Armorer & Shieldcrafter> [npc 3592] 58.7,39.8: repair, vendor
- Alyissia <Warrior Trainer> [npc 3593] 59.6,38.4: trainer
- Frahun Shadewhisper <Rogue Trainer> [npc 3594] 59.6,38.7: trainer
- Shanda <Priest Trainer> [npc 3595] 59.2,40.4: trainer
- Ayanna Everstride <Hunter Trainer> [npc 3596] 58.7,40.5: trainer
- Mardant Strongoak <Druid Trainer> [npc 3597] 58.6,40.3: trainer
- Kyra Windblade <Warrior Trainer> [npc 3598] 56.2,59.2: trainer
- Jannok Breezesong <Rogue Trainer> [npc 3599] 56.4,60.1: trainer
- Laurna Morninglight <Priest Trainer> [npc 3600] 55.6,56.8: trainer
- Dazalar <Hunter Trainer> [npc 3601] 56.7,59.5: trainer
- Kal <Druid Trainer> [npc 3602] 56.0,61.6: trainer
- Cyndra Kindwhisper <Journeyman Alchemist> [npc 3603] 57.6,60.8: trainer
- Malorne Bladeleaf <Herbalist> [npc 3604] 57.7,60.6: trainer
- Nadyia Maneweaver <Journeyman Leatherworker> [npc 3605] 41.9,49.4: trainer, vendor
- Alanna Raveneye <Journeyman Enchanter> [npc 3606] 36.7,34.2: trainer
- Androl Oakhand <Fisherman> [npc 3607] 55.9,93.5: trainer
- Aldia <General Supplies> [npc 3608] 55.5,57.1: vendor
- Shalomon <Weaponsmith> [npc 3609] 56.3,59.5: repair, vendor
- Jeena Featherbow <Bowyer> [npc 3610] 55.9,59.2: repair, vendor
- Brannol Eaglemoon <Clothier> [npc 3611] 56.1,60.2: vendor
- Sinda <Leather Armor Merchant> [npc 3612] 56.3,59.6: vendor
- Meri Ironweave <Armorer & Shieldcrafter> [npc 3613] 56.3,59.4: repair, vendor
- Narret Shadowgrove <Trade Supplies> [npc 3614] 55.3,57.1: vendor
- Vesprystus <Hippogryph Master> [npc 3838] 58.4,94.0: flightMaster
- Nyoma <Cooking Supplies> [npc 4265] 57.2,61.3: vendor
- Danlyia <Food & Drink Vendor> [npc 4266] 55.4,57.2: vendor
- Dellylah <Food & Drink Vendor> [npc 6091] 59.6,40.7: vendor
- Byancie <First Aid Trainer> [npc 6094] 55.3,56.8: trainer
- Zarrin <Cook> [npc 6286] 57.1,61.3: trainer
- Radnaal Maneweaver <Skinner> [npc 6287] 42.1,50.0: trainer
- Spirit Healer <> [npc 6491] 56.2,63.3: spiritHealer
- Innkeeper Keldamyr <Innkeeper> [npc 6736] 55.6,59.8: innkeeper, vendor
- Seriadne <Stable Master> [npc 10051] 56.6,59.6: stableMaster
- Nessa Shadowsong <Fishing Supplies> [npc 10118] 56.3,92.4: vendor
- Terunne Bearshaper <Junior Skinning Trainer> [npc 267333] 59.4,38.6: trainer, vendor
- Fanorran Stilloak <Junior Mining Trainer> [npc 267334] 58.2,41.4: trainer, vendor
- Eleyna Duskbreeze <Junior Herbalism Trainer> [npc 267335] 59.9,41.3: trainer
