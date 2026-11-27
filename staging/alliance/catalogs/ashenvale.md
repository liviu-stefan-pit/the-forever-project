# Ashenvale: Alliance + neutral quests (55)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 1056 Journey to Stonetalon Peak  (L18 req18, 680 xp)
  - start: Faldreas Goeth'Shael [npc 3996] @ Ashenvale 35.8,49.1
  - end:   Keeper Albagorm [npc 3994] @ Stonetalon Mountains 37.1,8.1
  - next=1057, breadcrumbFor=1057
  - text: Travel to Keeper Albagorm on Stonetalon Peak.

## 990 Trek to Ashenvale  (L19 req15, 365 xp)
  - start: Sentinel Selarin [npc 3694] @ Darkshore 39.3,43.5
  - end:   Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - pre(any)=[994, 995]
  - text: Find Raene Wolfrunner in Ashenvale.

## 991 Raene's Cleansing  (L19 req18, 1450 xp)
  - start: Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - end:   Teronis' Corpse [npc 3891] @ Ashenvale 20.3,42.3
  - next=1023
  - text: Find Teronis in Ashenvale.

## 1008 The Zoram Strand  (L19 req14, 1450 xp)
  - start: Shindrell Swiftfire [npc 3845] @ Ashenvale 34.7,48.8
  - end:   Shindrell Swiftfire [npc 3845] @ Ashenvale 34.7,48.8
  - next=1134
  - text: Bring 20 Wrathtail Heads to Shindrell Swiftfire in Astranaar.
  - objectives:
    1. item 20x Wrathtail Head <- Wrathtail Myrmidon [npc 3711] L20-21 ~Ashenvale 7,15 (14 spawns); Wrathtail Razortail [npc 3712] L19-20 ~Ashenvale 10,27 (13 spawns); Wrathtail Wave Rider [npc 3713] L18-19 ~Ashenvale 14,22 (9 spawns); Wrathtail Sea Witch [npc 3715] L19-20 ~Ashenvale 10,26 (13 spawns)

## 1007 The Ancient Statuette  (L20 req19, 1150 xp)
  - start: Talen [npc 3846] @ Ashenvale 14.8,31.3
  - end:   Talen [npc 3846] @ Ashenvale 14.8,31.3
  - next=1009
  - text: Bring the Ancient Statuette to Talen, in his camp near the Zoram Strand.
  - objectives:
    1. item 1x Ancient Statuette <- Ancient Statuette [object 17783] ~Ashenvale 14,21 (1 spawns)

## 1010 Bathran's Hair  (L20 req20, 780 xp)
  - start: Orendil Broadleaf [npc 3847] @ Ashenvale 26.4,38.6
  - end:   Orendil Broadleaf [npc 3847] @ Ashenvale 26.4,38.6
  - next=1020
  - text: Bring 5 Bathran's Hair to Orendil Broadleaf in Ashenvale.
  - objectives:
    1. item 5x Bathran's Hair <- Plant Bundle [object 17282] ~Ashenvale 32,23 (14 spawns)

## 1020 Orendil's Cure  (L20 req20, 1950 xp)
  - start: Orendil Broadleaf [npc 3847] @ Ashenvale 26.4,38.6
  - end:   Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - pre(any)=[1010], next=1033
  - text: Bring Orendil's Cure to Pelturas Whitemoon in Astranaar.

## 1023 Raene's Cleansing  (L21 req18, 1250 xp)
  - start: Teronis' Corpse [npc 3891] @ Ashenvale 20.3,42.3
  - end:   Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - pre(any)=[991], next=1024
  - text: Find the Glowing Gem and return to Raene Wolfrunner in Astranaar with Teronis' Journal.
  - objectives:
    1. item 1x Glowing Gem <- Saltspittle Puddlejumper [npc 3737] L19-20 ~Ashenvale 20,43 (7 spawns); Saltspittle Warrior [npc 3739] L19-20 ~Ashenvale 21,42 (7 spawns); Saltspittle Muckdweller [npc 3740] L20-21 ~Ashenvale 20,43 (2 spawns); Saltspittle Oracle [npc 3742] L20-21 ~Ashenvale 21,43 (5 spawns)

## 1024 Raene's Cleansing  (L21 req18, 830 xp)
  - start: Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - end:   Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - pre(any)=[1023], next=1026
  - text: Find Shael'dryn at the moonwell to the northeast.

## 1070 On Guard in Stonetalon  (L21 req17, 830 xp)
  - start: Sentinel Thenysil [npc 4079] @ Ashenvale 34.9,49.8
  - end:   Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - next=1085, breadcrumbFor=1085
  - text: Find Kaela Shadowspear overlooking the valley entering Windshear Crag in the Stonetalon Mountains.

## 1085 On Guard in Stonetalon  (L21 req17, 165 xp)
  - start: Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - end:   Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - pre(any)=[1070], next=1071
  - text: Speak to Gaxim.

## 1134 Pridewings of Stonetalon  (L21 req18, 1650 xp)
  - start: Shindrell Swiftfire [npc 3845] @ Ashenvale 34.7,48.8
  - end:   Shindrell Swiftfire [npc 3845] @ Ashenvale 34.7,48.8
  - pre(any)=[1008]
  - text: Bring 12 Pridewing Venom Sacs to Shindrell Swiftfire in Astranaar.
  - objectives:
    1. item 12x Pridewing Venom Sac <- Young Pridewing [npc 4011] L19-20 ~Stonetalon Mountains 68,54 (5 spawns); Pridewing Wyvern [npc 4012] L21-22 ~Stonetalon Mountains 51,44 (14 spawns); Pridewing Skyhunter [npc 4013] L23-24 ~Stonetalon Mountains 54,38 (10 spawns); Pridewing Consort [npc 4014] L22-23 ~Stonetalon Mountains 50,42 (14 spawns)

## 1033 Elune's Tear  (L22 req20, 1750 xp)
  - start: Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - end:   Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - pre(any)=[1020], next=1034
  - text: Bring Elune's Tear to Pelturas in Astranaar.
  - objectives:
    1. item 1x Elune's Tear <- Elune's Tear [object 19015] ~Ashenvale 46,46 (8 spawns)

## 1034 The Ruins of Stardust  (L23 req20, 1850 xp)
  - start: Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - end:   Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - pre(any)=[1033], next=1035
  - text: Bring 5 Handfuls of Stardust to Pelturas in Astranaar.
  - objectives:
    1. item 5x Handful of Stardust <- Stardust Covered Bush [object 19016] ~Ashenvale 33,68 (10 spawns)

## 976 Supplies to Auberdine  (L24 req19, 2900 xp)
  - start: Feero Ironhand [npc 4484] @ Ashenvale 26.2,38.9
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[973]
  - text: Speak with Delgren the Purifier at Maestra's Post after seeing Feero safely through Ashenvale Forest.

## 1016 Elemental Bracers  (L24 req20, 1950 xp)
  - start: Sentinel Velene Starstrike [npc 3885] @ Ashenvale 49.8,67.2
  - end:   Sentinel Velene Starstrike [npc 3885] @ Ashenvale 49.8,67.2
  - next=1017
  - text: Collect 5 Intact Elemental Bracers and use the Divining Scroll on them. Afterwards, bring the Divined Scroll to Sentinel Velene Starstrike at the Silverwind Refuge.
  - objectives:
    1. item 1x Divined Scroll <- ?

## 1025 An Aggressive Defense  (L24 req18, 1950 xp)
  - start: Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - end:   Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - pre(any)=[1023]
  - text: Kill 1 Den Watcher, 2 Ursas, 10 Totemics, and 12 Warriors of the Foulweald tribe, and then return to Raene Wolfrunner in Astranaar.
  - objectives:
    1. kill 1x Foulweald Den Watcher <- Foulweald Den Watcher [npc 3746] L24-25 ~Ashenvale 52,61 (4 spawns)
    2. kill 1x Foulweald Ursa <- Foulweald Ursa [npc 3749] L24-25 ~Ashenvale 52,61 (4 spawns)
    3. kill 1x Foulweald Totemic <- Foulweald Totemic [npc 3750] L23-24 ~Ashenvale 54,63 (12 spawns)
    4. kill 1x Foulweald Warrior <- Foulweald Warrior [npc 3743] L23-24 ~Ashenvale 53,62 (15 spawns)

## 1009 Ruuzel  (L25 req20, 2550 xp)
  - start: Talen [npc 3846] @ Ashenvale 14.8,31.3
  - end:   Talen [npc 3846] @ Ashenvale 14.8,31.3
  - pre(any)=[1007]
  - text: Bring the Ring of Zoram to Talen near the Zoram Strand.
  - objectives:
    1. item 1x Ring of Zoram <- Ruuzel [npc 3943] L22-22 ~Ashenvale 7,13 (1 spawns)

## 1017 Mage Summoner  (L25 req20, 2550 xp)
  - start: Sentinel Velene Starstrike [npc 3885] @ Ashenvale 49.8,67.2
  - end:   Sentinel Velene Starstrike [npc 3885] @ Ashenvale 49.8,67.2
  - pre(any)=[1016]
  - text: Slay Sarilus Foulborne and bring his head to Sentinel Velene Starstrike in Silverwind Refuge.
  - objectives:
    1. item 1x Sarilus Foulborne's Head <- Sarilus Foulborne [npc 3986] L25-25 ~The Barrens 48,19 (1 spawns)

## 1054 Culling the Threat  (L25 req18, 2000 xp)
  - start: Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - end:   Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - text: Bring Dal Bloodclaw's Skull to Raene Wolfrunner in Astranaar.
  - objectives:
    1. item 1x Dal Bloodclaw's Skull <- Dal Bloodclaw [npc 3987] L25-25 ~Ashenvale 40,36 (1 spawns)

## 78132 Dragonslayer's Helm  (L25 req15, ? xp, F)
  - start: Alonso [npc 210995] @ Ashenvale 42.0,69.2 (+4 spawns)
  - end:   Alonso [npc 210995] @ Ashenvale 42.0,69.2 (+4 spawns)
  - objectives:
    1. item 1x Dragonslayer's Helm <- Discarded Helm [object 409758]

## 78133 Dragonslayer's Shield  (L25 req15, ? xp, F)
  - start: Alonso [npc 210995] @ Ashenvale 42.0,69.2 (+4 spawns)
  - end:   Alonso [npc 210995] @ Ashenvale 42.0,69.2 (+4 spawns)
  - objectives:
    1. item 1x Dragonslayer's Shield <- Wall-Mounted Shield [object 409754]

## 78134 Dragonslayer's Lance  (L25 req15, ? xp, F)
  - start: Alonso [npc 210995] @ Ashenvale 42.0,69.2 (+4 spawns)
  - end:   Alonso [npc 210995] @ Ashenvale 42.0,69.2 (+4 spawns)
  - objectives:
    1. item 1x Dragonslayer's Lance <- ?

## 98027 Gleaming Crescent Necklace  (L26 req22, 1600 xp, F)
  - start: Gleaming Crescent Pendant [object 669176] @ Ashenvale 63.0,71.6
  - end:   Maliynn [npc 3961] @ Ashenvale 36.6,50.0
  - text: Deliver the Crescent Necklace to Maliynn in Astranaar.

## 1026 Raene's Cleansing  (L27 req18, 2200 xp)
  - start: Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - end:   Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - pre(any)=[1024], next=1027
  - text: Find the Wooden Key and a piece of Dartol's Rod before returning to Shael'dryn at the moonwell.
  - objectives:
    1. item 1x Iron Shaft <- Worn Chest [object 19022] ~Ashenvale 54,35 (1 spawns)

## 1027 Raene's Cleansing  (L28 req18, 2300 xp)
  - start: Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - end:   Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - pre(any)=[1026], next=1028
  - text: Find the final piece of Dartol's Rod and return to Shael'dryn at the moonwell.
  - objectives:
    1. item 1x Iron Pommel <- Rusty Chest [object 19021] ~Ashenvale 74,75 (41 spawns)

## 1028 Raene's Cleansing  (L28 req18, 1700 xp)
  - start: Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - end:   Hidden Shrine [object 19024] @ Ashenvale 56.4,49.2
  - pre(any)=[1027], next=1055
  - text: Find the hidden shrine and re-enchant Dartol's Rod.

## 1029 Raene's Cleansing  (L28 req18, 230 xp)
  - start: Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - end:   Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - pre(any)=[1055], next=1030
  - text: Return to Raene Wolfrunner in Astranaar.

## 1030 Raene's Cleansing  (L28 req18, 1700 xp)
  - start: Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - end:   Krolg [npc 3897] @ Ashenvale 50.8,75.1
  - pre(any)=[1029], next=1045
  - text: Find an uncorrupted furbolg, and using the power of Dartol's Rod of Transformation, speak to him.

## 1055 Raene's Cleansing  (L28 req18, 230 xp)
  - start: Hidden Shrine [object 19024] @ Ashenvale 56.4,49.2
  - end:   Shael'dryn [npc 3916] @ Ashenvale 53.5,46.2
  - pre(any)=[1028], next=1029
  - text: Return to Shael'dryn at the moonwell.

## 98417 Vengeful Trail  (L28 req23, 1700 xp, F)
  - start: Maseara Autumnmoon [npc 221269] @ Ashenvale 86.2,45.9
  - end:   Maseara Autumnmoon [npc 221269] @ Ashenvale 86.2,45.9
  - next=98418
  - text: Maseara Autumnmoon wants you to search west of Forest Song, amongst the Satyrnaar demons. Report any signs of her husband Kurothel upon your return.
  - objectives:
    1. item 1x Vine-Wrapped Scroll <- Kurothel's Knapsack [object 673431] ~Ashenvale 81,49 (1 spawns)

## 1011 Forsaken Diseases  (L29 req24, 2350 xp)
  - start: Kayneth Stillwind [npc 3848] @ Ashenvale 85.2,44.7
  - end:   Kayneth Stillwind [npc 3848] @ Ashenvale 85.2,44.7
  - next=1012
  - text: Bring a Bottle of Disease to Kayneth Stillwind in Forest Song.
  - objectives:
    1. item 1x Bottle of Disease <- Bottle of Disease [object 18036] ~Ashenvale 75,72 (5 spawns)

## 4581 Kayneth Stillwind  (L29 req24, 590 xp)
  - start: Shindrell Swiftfire [npc 3845] @ Ashenvale 34.7,48.8
  - end:   Kayneth Stillwind [npc 3848] @ Ashenvale 85.2,44.7
  - text: Take Shindrell's Note to Kayneth Stillwind in Forest Song.

## 1022 The Howling Vale  (L30 req25, 2450 xp)
  - start: Sentinel Melyria Frostshadow [npc 3880] @ Ashenvale 22.2,53.0
  - end:   Sentinel Melyria Frostshadow [npc 3880] @ Ashenvale 22.2,53.0
  - next=1037
  - text: Go to the Howling Vale and study the Tome of Mel'Thandris, then return to Sentinel Melyria Frostshadow at Forest Song.
  - objectives:
    1. object 1x Tome of Mel'Thandris <- Tome of Mel'Thandris [object 19027] ~Ashenvale 50,39 (1 spawns)

## 1035 Fallen Sky Lake  (L30 req20, 3050 xp)
  - start: Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - end:   Pelturas Whitemoon [npc 3894] @ Ashenvale 37.4,51.8
  - pre(any)=[1034]
  - text: Retrieve a Fallen Moonstone from the Shadethicket Oracle, then bring it to Pelturas in Astranaar.
  - objectives:
    1. item 1x Fallen Moonstone <- Shadethicket Oracle [npc 3931] L30-30 ~Ashenvale 67,82 (1 spawns)

## 1037 Velinde Starsong  (L30 req25, 610 xp)
  - start: Sentinel Melyria Frostshadow [npc 3880] @ Ashenvale 22.2,53.0
  - end:   Thyn'tel Bladeweaver [npc 8026] @ Darnassus 61.8,39.2
  - pre(any)=[1022], next=1038
  - text: Speak with Thyn'tel Bladeweaver at the Warrior's Terrace in Darnassus.

## 1038 Velinde's Effects  (L30 req25, 610 xp)
  - start: Thyn'tel Bladeweaver [npc 8026] @ Darnassus 61.8,39.2
  - end:   Thyn'tel Bladeweaver [npc 8026] @ Darnassus 61.8,39.2
  - pre(any)=[1037], next=1039
  - text: Search through Velinde's chest for her journal, then return it along with the key to Thyn'tel Bladeweaver in Darnassus.
  - objectives:
    1. item 1x Velinde's Journal <- Velinde's Locker [object 19877] ~Darnassus 62,83 (1 spawns)

## 1039 The Barrens Port  (L30 req25, 1200 xp)
  - start: Thyn'tel Bladeweaver [npc 8026] @ Darnassus 61.8,39.2
  - end:   Wharfmaster Dizzywig [npc 3453] @ The Barrens 63.4,38.5
  - pre(any)=[1038], next=1040
  - text: Speak with Wharfmaster Dizzywig in Ratchet.

## 1040 Passage to Booty Bay  (L30 req25, 610 xp)
  - start: Wharfmaster Dizzywig [npc 3453] @ The Barrens 63.4,38.5
  - end:   Caravaneer Ruzzgot [npc 3945] @ Stranglethorn Vale 27.4,74.1
  - pre(any)=[1039], next=1041
  - text: Take a boat to Booty Bay and speak with Caravaneer Ruzzgot.

## 1041 The Caravan Road  (L30 req25, 1200 xp)
  - start: Caravaneer Ruzzgot [npc 3945] @ Stranglethorn Vale 27.4,74.1
  - end:   Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - pre(any)=[1040], next=1042
  - text: Speak with Clerk Daltry in Darkshire.

## 1042 The Carevin Family  (L30 req25, 245 xp)
  - start: Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - end:   Jonathan Carevin [npc 661] @ Duskwood 75.3,49.0
  - pre(any)=[1041], next=1043
  - text: Speak with Jonathan Carevin in Darkshire.

## 1043 The Scythe of Elune  (L30 req25, 2450 xp)
  - start: Jonathan Carevin [npc 661] @ Duskwood 75.3,49.0
  - end:   Jonathan Carevin [npc 661] @ Duskwood 75.3,49.0
  - pre(any)=[1042], next=1044
  - text: Look for signs of the Scythe of Elune then return to Jonathan Carevin in Darkshire.
  - objectives:
    1. object 1x Mound of Dirt <- Mound of Dirt [object 19030] ~Duskwood 74,79 (1 spawns)

## 1044 Answered Questions  (L30 req25, 3050 xp)
  - start: Jonathan Carevin [npc 661] @ Duskwood 75.3,49.0
  - end:   Thyn'tel Bladeweaver [npc 8026] @ Darnassus 61.8,39.2
  - pre(any)=[1043]
  - text: Return to Thyn'tel Bladeweaver in Darnassus.

## 1045 Raene's Cleansing  (L30 req18, 2450 xp)
  - start: Krolg [npc 3897] @ Ashenvale 50.8,75.1
  - end:   Krolg [npc 3897] @ Ashenvale 50.8,75.1
  - pre(any)=[1030], next=1046
  - text: Kill Ran Bloodtooth and 4 Bloodtooth Guards and return to Krolg near Lake Mystral.
  - objectives:
    1. kill 4x Bloodtooth Guard <- Bloodtooth Guard [npc 3932] L27-28 ~Ashenvale 55,78 (11 spawns)
    2. item 1x Ran Bloodtooth's Skull <- Ran Bloodtooth [npc 3696] L30-30 ~Ashenvale 55,80 (1 spawns)

## 1046 Raene's Cleansing  (L30 req18, 3050 xp)
  - start: Krolg [npc 3897] @ Ashenvale 50.8,75.1
  - end:   Raene Wolfrunner [npc 3691] @ Ashenvale 36.6,49.6
  - pre(any)=[1045]
  - text: Bring Ran Bloodtooth's Skull and Dartol's Rod of Transformation to Raene Wolfrunner in Astranaar.
  - objectives:
    1. item 1x Dartol's Rod of Transformation <- ?

## 78089 Advice From Stormwind  (L30 req22, 1850 xp, F, class=Paladin, sort=PALADIN)
  - start: Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - end:   Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - pre(any)=[78088], next=78090
  - text: Bring the Althalaxx Orb to Katherine the Pure in Stormwind.

## 78093 Return to Delgren  (L30 req22, ? xp, F, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Shattered Orb [object 409315] @ Ashenvale 89.4,77.0
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[78092]
  - text: Return the Orb Shards to Delgren.

## 86757 Slowing the Orc Advance  (L30 req25, 2450 xp, F)
  - start: Shandrina [npc 3955] @ Ashenvale 49.5,67.1
  - end:   Shandrina [npc 3955] @ Ashenvale 49.5,67.1
  - text: Bring 6 Jagged Orc Swords and 4 Curved Orc Daggers to Shandrina.
  - objectives:
    1. item 6x Jagged Orcish Sword <- Horde Grunt [npc 11682] L29-30 ~Ashenvale 85,63 (13 spawns)
    2. item 1x Curved Orcish Dagger <- Horde Scout [npc 11680] L26-28 ~Ashenvale 84,64 (45 spawns)

## 98418 Shared Fury  (L30 req23, 2450 xp, F)
  - start: Maseara Autumnmoon [npc 221269] @ Ashenvale 86.2,45.9
  - end:   Maseara Autumnmoon [npc 221269] @ Ashenvale 86.2,45.9
  - pre(any)=[98417]
  - text: Kill 5 Xavian Rogues, 5 Felsworn, 5 Betrayers, and 5 Hellcallers.
  - text: Return to Maseara Autumnmoon in Forest Song afterwards.
  - objectives:
    1. kill 5x Xavian Betrayer <- Xavian Betrayer [npc 3754] L28-29 ~Ashenvale 78,46 (2 spawns)
    2. kill 5x Xavian Felsworn <- Xavian Felsworn [npc 3755] L28-29 ~Ashenvale 78,46 (9 spawns)
    3. kill 5x Xavian Hellcaller <- Xavian Hellcaller [npc 3757] L29-30 ~Ashenvale 78,45 (6 spawns)
    4. kill 5x Xavian Rogue <- Xavian Rogue [npc 3752] L29-30 ~Ashenvale 78,45 (6 spawns)

## 1012 Insane Druids  (L32 req24, 3200 xp)
  - start: Kayneth Stillwind [npc 3848] @ Ashenvale 85.2,44.7
  - end:   Kayneth Stillwind [npc 3848] @ Ashenvale 85.2,44.7
  - pre(any)=[1011]
  - text: Kill the druids: Taneel Darkwood, Uthil Mooncall, Mavoris Cloudsbreak; then return to Kayneth Stillwind in Forest Song.
  - objectives:
    1. kill 1x Taneel Darkwood <- Taneel Darkwood [npc 3940] L32-32 ~Ashenvale 77,74 (1 spawns)
    2. kill 1x Uthil Mooncall <- Uthil Mooncall [npc 3941] L32-32 ~Ashenvale 78,73 (1 spawns)
    3. kill 1x Mavoris Cloudsbreak <- Mavoris Cloudsbreak [npc 3942] L32-32 ~Ashenvale 75,74 (1 spawns)

## 1021 Vile Satyr! Dryads in Danger!  (L32 req26, 2550 xp)
  - start: Illiyana [npc 3901] @ Ashenvale 21.7,53.3
  - end:   Anilia [npc 3920] @ Ashenvale 78.3,44.8
  - next=1031
  - text: Find Anilia in Xavian.

## 1031 The Branch of Cenarius  (L32 req26, 2550 xp)
  - start: Anilia [npc 3920] @ Ashenvale 78.3,44.8
  - end:   Illiyana [npc 3901] @ Ashenvale 21.7,53.3
  - pre(any)=[1021], next=1032
  - text: Kill Geltharis and return the Branch of Cenarius to Illiyana at Forest Song.
  - objectives:
    1. item 1x Branch of Cenarius <- Geltharis [npc 4619] L32-32 ~Ashenvale 78,42 (1 spawns)

## 1032 Satyr Slaying!  (L32 req26, 2550 xp)
  - start: Illiyana [npc 3901] @ Ashenvale 21.7,53.3
  - end:   Illiyana [npc 3901] @ Ashenvale 21.7,53.3
  - pre(any)=[1031]
  - text: Bring 16 Satyr Horns to Illiyana in Forest Song.
  - objectives:
    1. item 16x Satyr Horns <- Xavian Rogue [npc 3752] L29-30 ~Ashenvale 78,45 (6 spawns); Xavian Betrayer [npc 3754] L28-29 ~Ashenvale 78,46 (2 spawns); Xavian Felsworn [npc 3755] L28-29 ~Ashenvale 78,46 (9 spawns); Xavian Hellcaller [npc 3757] L29-30 ~Ashenvale 78,45 (6 spawns)

## 8725 Riversong the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Riversong [npc 15605] @ Ashenvale 35.6,48.8
  - end:   Elder Riversong [npc 15605] @ Ashenvale 35.6,48.8

## 79090 Repelling Invaders  (L60 req18, ? xp, F)
  - start: item Warsong Outrider Mark [211814] (drops from Warsong Grunt, Warsong Raider, Warsong Shaman)
  - end:   Felore Moonray [npc 212970] @ Ashenvale 60.0,70.4 (+3 spawns); Felore Moonray [npc 217707] @ Ashenvale 36.8,49.6
  - text: Bring the Warsong Outrider Mark to Felore Moonray, Priestess of the Moon, at the Moonwell base in Ashenvale.

# Service NPCs

- Bolyun <Pet Trainer> [npc 3698] 18.0,60.0: trainer
- Bhaldaran Ravenshade <Bowyer> [npc 3951] 50.3,67.3: repair, vendor
- Aeolynn <Clothier> [npc 3952] 34.5,49.5: repair, vendor
- Tandaan Lightmane <Leather Armor Merchant> [npc 3953] 34.5,49.9: repair, vendor
- Dalria <Trade Goods> [npc 3954] 35.1,52.1: vendor
- Shandrina <Trade Goods> [npc 3955] 49.5,67.1: vendor
- Harklan Moongrove <Alchemy Supplies> [npc 3956] 50.8,67.0: vendor
- Lardan <Leatherworking Supplies> [npc 3958] 34.8,49.8: vendor
- Nantar <Baker> [npc 3959] 37.1,49.9: vendor
- Ulthaan <Butcher> [npc 3960] 50.0,66.6: vendor
- Maliynn <Food & Drink Vendor> [npc 3961] 36.6,50.0: vendor
- Haljan Oakheart <General Goods> [npc 3962] 34.9,50.9: vendor
- Danlaar Nightstride <Hunter Trainer> [npc 3963] 50.1,68.0: trainer
- Kylanna <Expert Alchemist> [npc 3964] 50.9,67.1: trainer
- Cylania Rootstalker <Herbalist> [npc 3965] 50.7,67.2: trainer
- Aayndia Floralwind <Expert Leatherworker> [npc 3967] 36.0,52.1: trainer
- Fahran Silentblade <Tools & Supplies> [npc 3969] 36.5,49.5: vendor
- Llana <Reagent Supplies> [npc 3970] 35.0,48.5: vendor
- Daelyshia <Hippogryph Master> [npc 4267] 34.4,48.0: flightMaster
- Caelyb <Pet Trainer> [npc 4320] 49.7,67.0: trainer
- Jayla <Skinner> [npc 6288] 50.0,67.3: trainer
- Spirit Healer <> [npc 6491] 80.7,58.4: spiritHealer
- Harlown Darkweave <Leatherworking Supplies> [npc 6731] 18.2,60.0: vendor
- Innkeeper Kimlya <Innkeeper> [npc 6738] 37.0,49.2: innkeeper, vendor
- Alenndaar Lapidaar <Hunter Trainer> [npc 8308] 18.0,59.8: trainer
- Maluressian <Stable Master> [npc 10052] 36.5,50.4: stableMaster
- Xai'ander <Weaponsmith> [npc 11137] 35.8,52.0: repair, vendor
- Illiyana Moonblaze <Silverwing Supply Officer> [npc 14753] 61.5,83.9: vendor
- Gapp Jinglepocket <Smokywood Pastures> [npc 14963] 62.1,82.8: vendor
- Alliance Brigadier General <> [npc 15351] 61.9,83.8: vendor
- Quartermaster Kyleen <> [npc 222685] 89.4,40.4: repair, vendor
