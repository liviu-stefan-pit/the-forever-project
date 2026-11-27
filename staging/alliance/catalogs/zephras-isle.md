# Zephras Isle: Alliance + neutral quests (122)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 93161 The Ancient Hilt  (L-1 req1, ? xp, F)
  - start: Ancient Hilt [object 676059] @ Zephras Isle 58.2,24.0
  - end:   Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - next=97029
  - text: Find someone who would be interested in the Ancient Hilt you found in the ruins of Ban'aethal.

## 97029 Eluvi'ana  (L-1 req1, ? xp, F)
  - start: Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - end:   Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - pre(any)=[93161]
  - text: Deliver the Ancient Skyborne Blade to Ealaane Nimbuswalker to learn more about it.
  - objectives:
    1. item 1x Ancient Skyborne Blade <- Ancient Sword [object 618822] ~Zephras Isle 55,63 (5 spawns)

## 92460 Coming of Age  (L1 req1, 40 xp, F)
  - start: Ailee Farheart [npc 251362] @ Zephras Isle 42.8,23.4
  - end:   Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - next=92461
  - text: Speak with Rorian the Dayseeker in Thendal Grove.

## 92461 Harmony in Balance  (L1 req1, 80 xp, F)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - pre(any)=[92460]
  - text: Slay 8 Vuldren Juveniles in Thendal Grove.
  - objectives:
    1. kill 1x Juvenile Vuldren <- Juvenile Vuldren [npc 250873] L1-1 ~Zephras Isle 45,25 (73 spawns)

## 92462 Infestation Investigation  (L2 req1, 170 xp, F)
  - start: Elatrell Featherlight [npc 251368] @ Zephras Isle 43.4,24.8
  - end:   Elatrell Featherlight [npc 251368] @ Zephras Isle 43.4,24.8
  - pre(any)=[92460], next=92463
  - text: Slay 8 Pesky Cirrusflies in Thendal Grove.
  - objectives:
    1. kill 8x Pesky Cirrusfly <- Pesky Cirrusfly [npc 251169] L1-1 ~Zephras Isle 46,27 (42 spawns)

## 92474 Falling With Style  (L2 req2, 85 xp, F, races=Skyborne)
  - start: Myriaal Mistwake [npc 263113] @ Zephras Isle 43.7,24.1
  - end:   Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - text: Jump from the top of the watchtower in Thendal Grove and use your Walk on Air ability to slow your fall.

## 92481 A Student of the Arcane  (L2 req2, 85 xp, F, class=Mage, sort=MAGE)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Dorii Brightwhisper [npc 251379] @ Zephras Isle 41.5,23.7
  - pre(any)=[92461]
  - text: Examine the Glowing Recall Crystal, then speak with Dorii Brightwhisper in Thendal Grove.

## 92482 The Way of the Hunter  (L2 req2, 85 xp, F, class=Hunter, sort=HUNTER)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Tai'ree Farsight [npc 251376] @ Zephras Isle 42.5,23.8
  - pre(any)=[92461]
  - text: Read the Scribbled Note and then speak with Tai'ree Farsight in Thendal Grove.

## 92483 At Home in the Shadows  (L2 req2, 85 xp, F, class=Rogue, sort=ROGUE)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Akeri Duskblade [npc 251389] @ Zephras Isle 43.7,24.4
  - pre(any)=[92461]
  - text: Read the Simple Note then speak with Akeri Duskblade within the watchtower in Thendal Grove.

## 92485 A Student of Nature  (L2 req2, 85 xp, F, class=Druid, sort=DRUID)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Xyton Silverwind [npc 251373] @ Zephras Isle 41.9,23.4
  - pre(any)=[92461]
  - text: Read the Folded Parchment then speak with Xyton Silverwind in Thendal Grove.

## 92532 The Warrior's Path  (L2 req2, 85 xp, F, class=Warrior, sort=WARRIOR)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Blademaster Ren [npc 251964] @ Zephras Isle 43.6,24.1
  - pre(any)=[92461]
  - text: Read the Crumpled Note you've been given, then seek out Blademaster Ren inside the Thendal Village watchtower.

## 94414 The Anchors of Zephras  (L2 req2, 85 xp, F)
  - start: Halaan Hawk-Eye [npc 257554] @ Zephras Isle 43.8,24.1
  - end:   Halaan Hawk-Eye [npc 257554] @ Zephras Isle 43.8,24.1
  - text: Speak with Halaan Hawk-Eye and borrow his gift to view the anchor pylon in the distance.
  - objectives:
    1. kill 1x Halaan Hawk-Eye <- Halaan Hawk-Eye [npc 257554] L10-10 ~Zephras Isle 44,24 (1 spawns)

## 92463 The Cirrusfly Queen  (L3 req2, 315 xp, F)
  - start: Elatrell Featherlight [npc 251368] @ Zephras Isle 43.4,24.8
  - end:   Elatrell Featherlight [npc 251368] @ Zephras Isle 43.4,24.8
  - pre(any)=[92462]
  - text: Destroy the Cirrusfly Queen in Thendal Grove.
  - objectives:
    1. kill 1x Cirrusfly Queen <- Cirrusfly Queen [npc 251404] L3-3 ~Zephras Isle 48,29 (1 spawns)

## 92464 Elemental Unrest  (L3 req2, 25 xp, F)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Yala Windwatcher [npc 249363] @ Zephras Isle 47.2,22.0
  - text: Speak to Yala Windwatcher in Thendal Grove.

## 92465 Agitators  (L3 req2, 250 xp, F)
  - start: Yala Windwatcher [npc 249363] @ Zephras Isle 47.2,22.0
  - end:   Yala Windwatcher [npc 249363] @ Zephras Isle 47.2,22.0
  - next=92469
  - text: Slay 6 Roiling Winds and 7 Al'Aketh Converts in Thendal Grove.
  - objectives:
    1. kill 1x Al'Aketh Convert <- Al'Aketh Convert [npc 251160] L2-3 ~Zephras Isle 47,20 (25 spawns)
    2. kill 6x Roiling Winds <- Roiling Winds [npc 251143] L2-3 ~Zephras Isle 47,20 (28 spawns)

## 92469 Return to Rorian  (L4 req3, 35 xp, F)
  - start: Yala Windwatcher [npc 249363] @ Zephras Isle 47.2,22.0
  - end:   Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - pre(any)=[92465]
  - text: Bring word of the Al'Aketh to Rorian the Dayseeker in Thendal Grove.

## 92471 Aetheen of the Gales  (L4 req4, 35 xp, F)
  - start: Rorian the Dayseeker [npc 251361] @ Zephras Isle 42.0,23.5
  - end:   Aetheen of the Gales [npc 251366] @ Zephras Isle 42.8,23.7
  - next=92470
  - text: Speak with Aetheen of the Gales in Thendal Grove.

## 92473 Aggressive Encroachment  (L4 req3, 355 xp, F)
  - start: Valreaa Valewind [npc 257551] @ Zephras Isle 42.4,25.2
  - end:   Valreaa Valewind [npc 257551] @ Zephras Isle 42.4,25.2
  - pre(any)=[92471]
  - text: Collect 6 Scrawny Ursera Claws from Scrawny Ursera in Thendal Grove.
  - objectives:
    1. item 6x Scrawny Ursera Claw <- Scrawny Ursera [npc 250926] L3-4 ~Zephras Isle 40,28 (72 spawns)

## 92597 Reading the Leylines  (L4 req2, 180 xp, F, races=Skyborne)
  - start: Falorne Fallwind [npc 251371] @ Zephras Isle 43.3,24.9
  - end:   Falorne Fallwind [npc 251371] @ Zephras Isle 43.3,24.9
  - pre(any)=[92461]
  - text: Use your Read Leyline racial ability at the leyline in Thendal Grove.
  - objectives:
    1. object 1x Ley Line <- Ley Line [object 460002] ~Zephras Isle 46,18 (1 spawns)

## 93552 Harvesting Windstones  (L4 req2, 355 xp, F)
  - start: Dalia the Collector [npc 251363] @ Zephras Isle 43.4,24.0
  - end:   Dalia the Collector [npc 251363] @ Zephras Isle 43.4,24.0
  - pre(any)=[92461]
  - text: Collect 15 Windstone Clusters from Raw Windstones in Thendal Grove.
  - objectives:
    1. item 15x Windstone Cluster <- Raw Windstone [object 613286] ~Zephras Isle 44,26 (27 spawns)

## 92470 Foul Matriarch  (L5 req2, 560 xp, F)
  - start: Aetheen of the Gales [npc 251366] @ Zephras Isle 42.8,23.7
  - end:   Aetheen of the Gales [npc 251366] @ Zephras Isle 42.8,23.7
  - pre(any)=[92471], next=92472
  - text: Slay 8 Ursera Scavengers and collect the head of the den mother, Urs'anah in Thendal Grove.
  - objectives:
    1. kill 8x Ursera Scavenger <- Ursera Scavenger [npc 250937] L4-4 ~Zephras Isle 38,26 (31 spawns)
    2. item 1x Head of Urs'anah <- Urs'anah [npc 251115] L5-5 ~Zephras Isle 36,26 (1 spawns)

## 92472 The Next Step  (L5 req3, 225 xp, F)
  - start: Aetheen of the Gales [npc 251366] @ Zephras Isle 42.8,23.7
  - end:   Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - pre(any)=[92470]
  - text: Report to Constable Aonda in Shen'dar Village.

## 92544 Al'Aketh Thugs  (L5 req2, 560 xp, F)
  - start: Hanaa Nightwind [npc 252095] @ Zephras Isle 38.3,30.2
  - end:   Hanaa Nightwind [npc 252095] @ Zephras Isle 38.3,30.2
  - text: Slay 6 Al'Aketh Brutes, 4 Al'Aketh Neophytes, and Malduko Cloudcrush in Thendal Grove.
  - objectives:
    1. kill 6x Al'Aketh Brute <- Al'Aketh Brute [npc 251145] L4-4 ~Zephras Isle 37,33 (30 spawns)
    2. kill 6x Al'Aketh Neophyte <- Al'Aketh Neophyte [npc 251448] L4-4 ~Zephras Isle 37,33 (31 spawns)
    3. kill 1x Malduko Cloudcrush <- Malduko Cloudcrush [npc 256935] L5-5 ~Zephras Isle 36,34 (1 spawns)

## 92515 The Problem With Prideclaws  (L6 req4, 540 xp, F)
  - start: Indari Sunseam [npc 251993] @ Zephras Isle 44.7,44.5
  - end:   Indari Sunseam [npc 251993] @ Zephras Isle 44.7,44.5
  - pre(any)=[92514, 93461]
  - text: Collect 10 Prideclaw Pelts from the Prideclaws in Shen'dar Highlands.
  - objectives:
    1. item 10x Prideclaw Pelt <- Prideclaw [npc 251245] L5-6 ~Zephras Isle 45,53 (623 spawns)

## 92553 Restocking the Larders  (L6 req4, 405 xp, F)
  - start: Zerril Softbreeze [npc 251905] @ Zephras Isle 43.9,43.8
  - end:   Zerril Softbreeze [npc 251905] @ Zephras Isle 43.9,43.8
  - pre(any)=[92514, 93461]
  - text: Collect 3 Small Eggs and 8 Strider Meat from creatures found throughout the Shen'dar Highlands.
  - objectives:
    1. item 3x Small Egg <- Greater Fleshripper [npc 154] L16-17 ~Westfall 53,54 (13 spawns); Young Fleshripper [npc 199] L10-11 ~Westfall 51,29 (35 spawns); Dire Condor [npc 428] L18-19 ~Redridge Mountains 48,57 (20 spawns); Fleshripper [npc 1109] L13-14 ~Westfall 43,50 (46 spawns)
    2. item 1x Strider Meat <- Strider Clutchmother [npc 2172] L20-20 ~Darkshore 35,87 (1 spawns); Foreststrider Fledgling [npc 2321] L11-13 ~Darkshore 43,46 (98 spawns); Foreststrider [npc 2322] L14-16 ~Darkshore 47,43 (48 spawns); Giant Foreststrider [npc 2323] L17-19 ~Darkshore 43,76 (61 spawns)

## 92596 The High Order  (L6 req4, 135 xp, F)
  - start: Rathiril Sunlance [npc 251903] @ Zephras Isle 45.0,46.4
  - end:   Rathiril Sunlance [npc 251903] @ Zephras Isle 45.0,46.4
  - next=94413
  - text: Have a seat and speak with Rathiril Sunlance.
  - objectives:
    1. kill 1x Rathiril Sunlance <- Rathiril Sunlance [npc 251903] L20-20 ~Zephras Isle 45,46 (1 spawns)

## 93461 Welcome to Shen'dar Village  (L6 req4, 135 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - next=92517
  - text: Speak with Rathiril Sunlance and Coriella Calmbreeze in Shen'dar Village.
  - objectives:
    1. kill 1x Rathiril Sunlance <- Rathiril Sunlance [npc 251903] L20-20 ~Zephras Isle 45,46 (1 spawns)
    2. kill 1x Coriella Calmbreeze <- Coriella Calmbreeze [npc 254089] L10-10 ~Zephras Isle 43,43 (1 spawns)

## 94413 A Magical Affront  (L6 req4, 540 xp, F)
  - start: Rathiril Sunlance [npc 251903] @ Zephras Isle 45.0,46.4
  - end:   Rathiril Sunlance [npc 251903] @ Zephras Isle 45.0,46.4
  - pre(any)=[92596]
  - text: Slay 6 Windshaper Novice Seers in Shen'dar Highlands.
  - objectives:
    1. kill 6x Windshaper Novice Seer <- Windshaper Novice Seer [npc 257532] L5-6 ~Zephras Isle 39,47 (41 spawns)

## 96101 The Great Outdoors  (L6 req4, 405 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - exclusiveTo=[95998, 96604, 96605, 96606, 96607, 96608]
  - text: Sit near Raan's Basic Campfire and wait until you receive the Boosted Rest buff.
  - objectives:
    1. object 1x Basic Campfire <- Basic Campfire [object 460003] ~Zephras Isle 42,45 (1 spawns)
    2. object 1x Basic Campfire <- Basic Campfire [object 460003] ~Zephras Isle 42,45 (1 spawns)

## 96638 The Adventurer  (L6 req4, 405 xp, F, sort=CAMPING)
  - start: Aetheen of the Gales [npc 251366] @ Zephras Isle 42.8,23.7
  - end:   Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - pre(any)=[92470], next=96101, breadcrumbFor=96101, exclusiveTo=[96627, 96628, 96630, 96652, 96656, 96659]
  - text: Speak to Raan Wildwind near Shen'dar Village.

## 96646 Camping 101: Cooking  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Zerril Softbreeze [npc 251905] @ Zephras Isle 43.9,43.8
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96626, 96629, 96634, 96655, 96658, 96661]
  - text: Speak with Zerril Softbreeze in Shen'dar Village to learn to become a cook.
  - objectives:
    1. kill 1x Zerril Softbreeze <- Zerril Softbreeze [npc 251905] L20-20 ~Zephras Isle 44,44 (1 spawns)

## 97963 Camping 101: Alchemy  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Nyassa Swiftdraught [npc 257019] @ Zephras Isle 43.7,43.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96045, 97899, 97915, 97927, 97938, 97951]
  - text: Speak with Nyassa Swiftdraught in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Nyassa Swiftdraught <- Nyassa Swiftdraught [npc 257019] L10-10 ~Zephras Isle 44,43 (1 spawns)

## 97964 Camping 101: Blacksmithing  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Aedi Thriceforged [npc 251913] @ Zephras Isle 44.9,44.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96044, 97900, 97916, 97928, 97939, 97952]
  - text: Speak with Aedi Thriceforged in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Aedi Thriceforged <- Aedi Thriceforged [npc 251913] L20-20 ~Zephras Isle 45,44 (1 spawns)

## 97965 Camping 101: First Aid  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Naleeia Tattermend [npc 257018] @ Zephras Isle 43.1,46.3
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96047, 97903, 97919, 97931, 97942, 97955]
  - text: Speak with Naleeia Tattermend in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Naleeia Tattermend <- Naleeia Tattermend [npc 257018] L10-10 ~Zephras Isle 43,46 (1 spawns)

## 97967 Camping 101: Fishing  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Fenn Fairweather [npc 251992] @ Zephras Isle 45.0,48.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96050, 97904, 97920, 97932, 97943, 97956]
  - text: Speak with Fenn Fairweather in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Fenn Fairweather <- Fenn Fairweather [npc 251992] L5-5 ~Zephras Isle 45,48 (1 spawns)

## 97968 Camping 101: Herbalism  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Halassa Fernbreeze [npc 257021] @ Zephras Isle 43.0,43.5
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96055, 97905, 97921, 97933, 97944, 97957]
  - text: Speak with Syriel Nightrain in Valanaar to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Syriel Nightrain <- Syriel Nightrain [npc 254345] L10-10 ~Zephras Isle 58,75 (1 spawns)

## 97969 Camping 101: Leatherworking  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Indari Sunseam [npc 251993] @ Zephras Isle 44.7,44.5
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96031, 97906, 97922, 97934, 97946, 97958]
  - text: Speak with Indari Sunseam in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Indari Sunseam <- Indari Sunseam [npc 251993] L5-5 ~Zephras Isle 45,45 (1 spawns)

## 97970 Camping 101: Mining  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Messana Crestwind [npc 257022] @ Zephras Isle 44.8,44.6
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96046, 97907, 97923, 97935, 97948, 97959]
  - text: Speak with Messana Crestwind in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Messana Crestwind <- Messana Crestwind [npc 257022] L10-10 ~Zephras Isle 45,45 (1 spawns)

## 97971 Camping 101: Skinning  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Mendalass Tattermend [npc 257024] @ Zephras Isle 43.3,43.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96056, 97908, 97924, 97936, 97949, 97960]
  - text: Speak with Mendalass Tattermend in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Mendalass Tattermend <- Mendalass Tattermend [npc 257024] L10-10 ~Zephras Isle 43,43 (1 spawns)

## 97973 Camping 101: Tailoring  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Taleen Shimmerthread [npc 251991] @ Zephras Isle 44.9,44.3
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96057, 96102, 97925, 97937, 97950, 97961, 97972]
  - text: Speak with Taleen Shimmerthread in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Taleen Shimmerthread <- Taleen Shimmerthread [npc 251991] L20-20 ~Zephras Isle 45,44 (1 spawns)

## 98286 Camping 101: Enchanting  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Raan Wildwind [npc 263664] @ Zephras Isle 41.7,44.8
  - end:   Nasalanna Windsinger [npc 257020] @ Zephras Isle 43.2,43.1
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96059, 97901, 97917, 97929, 97940, 97953, 98284]
  - text: Speak with Nasalanna Windsinger in Shen'dar Village to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Nasalanna Windsinger <- Nasalanna Windsinger [npc 257020] L10-10 ~Zephras Isle 43,43 (1 spawns)

## 92516 Hippogryph Harassment  (L7 req4, 630 xp, F)
  - start: Teeri Wellwind [npc 251906] @ Zephras Isle 44.5,45.0
  - end:   Teeri Wellwind [npc 251906] @ Zephras Isle 44.5,45.0
  - pre(any)=[92514, 93461]
  - text: Slay 8 Hippogryph Youths, 6 Hippogryph Protectors and a Hippogryph Matriarch in the Shen'dar Highlands.
  - objectives:
    1. kill 8x Hippogryph Youth <- Hippogryph Youth [npc 251291] L6-6 ~Zephras Isle 38,54 (123 spawns)
    2. kill 8x Hippogryph Protector <- Hippogryph Protector [npc 251284] L6-7 ~Zephras Isle 36,54 (91 spawns)
    3. kill 8x Hippogryph Matriarch <- Hippogryph Matriarch [npc 251261] L7-7 ~Zephras Isle 34,54 (2 spawns)

## 92517 The Criminal Element  (L7 req4, 475 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - pre(any)=[92514, 93461], next=93036
  - text: Kill 10 Highlands Bandits and their leader, "Badwind" Bennic in the Shen'dar Highlands.
  - objectives:
    1. kill 10x Highlands Bandit <- Highlands Bandit [npc 251918] L7-7 ~Zephras Isle 49,37 (32 spawns)
    2. kill 1x "Badwind" Bennic <- "Badwind" Bennic [npc 255534] L7-7 ~Zephras Isle 51,34 (1 spawns)

## 93319 Pilfered Windstones  (L7 req4, 475 xp, F)
  - start: Teeri Wellwind [npc 251906] @ Zephras Isle 44.5,45.0
  - end:   Teeri Wellwind [npc 251906] @ Zephras Isle 44.5,45.0
  - pre(any)=[92514, 93461]
  - text: Collect 10 Pilfered Windstones from the Highlands Bandits in the Shen'dar Highlands.
  - objectives:
    1. item 10x Pilfered Windstone <- Highlands Bandit [npc 251918] L7-7 ~Zephras Isle 49,37 (32 spawns); "Badwind" Bennic [npc 255534] L7-7 ~Zephras Isle 51,34 (1 spawns)

## 93951 A Little Beauty  (L7 req4, 475 xp, F)
  - start: Taleen Shimmerthread [npc 251991] @ Zephras Isle 44.9,44.3
  - end:   Taleen Shimmerthread [npc 251991] @ Zephras Isle 44.9,44.3
  - pre(any)=[92514, 93461]
  - text: Collect 8 Hippogryph Down feathers in the Shen'dar Highlands.
  - objectives:
    1. item 8x Hippogryph Down <- Hippogryph Down [object 617839] ~Zephras Isle 36,54 (13 spawns)

## 92528 Among the Faithful  (L8 req5, 350 xp, F)
  - start: Missionary Jasaan [npc 257065] @ Zephras Isle 46.9,56.2
  - end:   Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - pre(any)=[92529], next=92550
  - text: Look around Falaath Village to learn about the cult's intentions in the Shen'dar Highlands.
  - objectives:
    1. kill 1x Wardrobe <- Wardrobe [npc 254128] L1-1 ~Zephras Isle 49,54 (1 spawns)

## 92529 Falaath Village  (L8 req5, 350 xp, F)
  - start: Sania Silverstream [npc 251904] @ Zephras Isle 44.9,45.5
  - end:   Missionary Jasaan [npc 257065] @ Zephras Isle 46.9,56.2
  - pre(any)=[93036], next=92528
  - text: Report to Missionary Jasaan near the entrance to Falaath Village.
  - text: If you lose your Mark of Akir, speak with Sania Silverstream in Shen'dar Village to regain the effect.

## 92550 Havoc in the Highlands  (L8 req5, 700 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - pre(any)=[92528], next=92579
  - text: Travel to the ruins of Falaath Village and slay 6 Al'Aketh Stormcallers, 4 Living Lightning and take the head of Commander Cyclas.
  - objectives:
    1. kill 6x Al'Aketh Stormcaller <- Al'Aketh Stormcaller [npc 252068] L7-8 ~Zephras Isle 49,54 (1 spawns)
    2. kill 1x Living Lightning <- Living Lightning [npc 251662] L7-8 ~Zephras Isle 49,54 (1 spawns)
    3. item 1x Commander Cyclas's Head <- Commander Cyclas [npc 251966] L8-8 ~Zephras Isle 50,57 (1 spawns)

## 92551 Stolen Supplies  (L8 req5, 530 xp, F, races=Skyborne)
  - start: Danarii Bellowveil [npc 252172] @ Zephras Isle 45.2,45.2
  - end:   Danarii Bellowveil [npc 252172] @ Zephras Isle 45.2,45.2
  - pre(any)=[92528]
  - text: Collect 10 packs of Stolen Shen'dar Supplies from Falaath Village in the Shen'dar Highlands.
  - objectives:
    1. item 1x Stolen Shen'dar Supplies <- Al'Aketh Stormcaller [npc 252068] L7-8 ~Zephras Isle 49,54 (1 spawns); Al'Aketh Healer [npc 254596] L9-10 ~Zephras Isle 66,67 (38 spawns); Tel'daeor the Stormspeaker [npc 259385] L13-13 ~Zephras Isle 65,53 (13 spawns); Galemender Delanea [npc 259398] L11-11 ~Zephras Isle 63,61 (26 spawns)

## 93036 Infiltrating the Cult  (L8 req5, 70 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Sania Silverstream [npc 251904] @ Zephras Isle 44.9,45.5
  - pre(any)=[92517], next=92529
  - text: Speak with Sania Silverstream in Shen'dar Village.

## 93926 The Western Watch  (L8 req5, 350 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Peacekeeper Vaaniel [npc 252155] @ Zephras Isle 42.3,62.0
  - pre(any)=[92528], next=93927
  - text: Find Peacekeeper Vaaniel at the western watchtower.
  - objectives:
    1. kill 1x Peacekeeper Vaaniel <- Peacekeeper Vaaniel [npc 252155] L5-5 ~Zephras Isle 42,62 (1 spawns)

## 93927 A Last Request  (L8 req5, 530 xp, F)
  - start: Peacekeeper Vaaniel [npc 252155] @ Zephras Isle 42.3,62.0
  - end:   Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - pre(any)=[93926]
  - text: Collect the note you found near the dead peacekeeper and read it to determine your next steps.
  - objectives:
    1. kill 1x Skypriest Aanders <- Skypriest Aanders [npc 256966] L8-8 ~Zephras Isle 41,64 (2 spawns)
    2. item 1x Bloody Note <- Bloody Note [object 617704] ~Zephras Isle 42,62 (1 spawns)
    3. item 1x Raani's Lucky Feather <- Raani Windgazer [object 617675] ~Zephras Isle 41,64 (1 spawns)
    4. item 1x Shadowsong Family Signet <- Arvensus Shadowsong [object 617674] ~Zephras Isle 41,64 (1 spawns)

## 93949 Bugged  (L8 req6, 700 xp, F)
  - start: Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - end:   Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - pre(any)=[93948]
  - text: Kill Skyhoppers in Valanaar until you've eliminated 8 Enchanted Skyhoppers.
  - objectives:
    1. kill 1x Skyhopper <- Skyhopper [npc 251727] L7-8 ~Zephras Isle 62,76 (87 spawns)

## 92679 Blood Tithe  (L9 req5, 390 xp, F)
  - start: Alvarion Windfield [npc 252448] @ Zephras Isle 62.1,73.3
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - next=92682
  - text: Listen to what Alvarion Windfield has to say and find Aamelia Windfield at the Windfield Orchard.
  - objectives:
    1. kill 1x Aamelia Windfield <- Aamelia Windfield [npc 252800] L10-10 ~Zephras Isle 47,82 (1 spawns)
    2. kill 1x Alvarion Windfield <- Alvarion Windfield [npc 252448] L10-10 ~Zephras Isle 62,73 (1 spawns)

## 92682 Make Yourself Useful  (L9 req5, 780 xp, F)
  - start: Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - pre(any)=[92679], next=92685
  - text: Gather 10 Ripe Stormapples and slay 5 Hungry Bandits at the Windfield Orchard.
  - objectives:
    1. kill 1x Hungry Bandit <- Hungry Bandit [npc 252802] L8-9 ~Zephras Isle 48,81 (73 spawns)
    2. item 10x Ripe Stormapple <- Ripe Stormapple [object 578937] ~Zephras Isle 47,81 (13 spawns)

## 92683 Flutterfly Dust  (L9 req5, 590 xp, F)
  - start: Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - pre(any)=[92679]
  - text: Gather 5 Flutterfly Dust from the Flutterflies around the Gustberry Lowlands.
  - objectives:
    1. item 5x Flutterfly Dust <- Flutterfly Dust [object 578959] ~Zephras Isle 50,79 (38 spawns)

## 92684 Ornery Ornery Galestriders  (L9 req5, 590 xp, F)
  - start: Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - pre(any)=[92679], next=92685
  - text: Gather 7 Lowlands Galestrider Tenderloins from the Ornery Galestriders found throughout the Gustberry Lowlands.
  - objectives:
    1. item 7x Lowlands Galestrider Tenderloin <- Ornery Galestrider [npc 251707] L8-9 ~Zephras Isle 56,73 (349 spawns)

## 92685 The Hills Have Eyes  (L9 req5, 780 xp, F)
  - start: Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - pre(all)=[92682, 92683, 92684], next=92693
  - text: Loot 7 Blood-Stained Bandit Masks from Highwayman Bandits in the Gustberry Lowlands.
  - objectives:
    1. item 7x Blood-Stained Bandit Mask <- Bandit Highwayman [npc 252820] L8-9 ~Zephras Isle 49,75 (115 spawns)

## 92693 Standing Our Ground  (L9 req5, 195 xp, F)
  - start: Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - pre(any)=[92685], next=92703
  - text: Speak with Aamelia Windfield when you are ready to confront the bandit leader.
  - objectives:
    1. kill 1x Aamelia Windfield <- Aamelia Windfield [npc 252800] L10-10 ~Zephras Isle 47,82 (1 spawns)
    2. kill 1x Ferauu the Bludgeon <- Ferauu the Bludgeon [npc 252863] L8-8 ~Zephras Isle 48,77 (18 spawns)

## 92698 What Is My Purpose?  (L9 req5, 195 xp, F)
  - start: Malfunctioning Cyclone Construct [npc 250929] @ Zephras Isle 48.9,78.2
  - end:   Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - pre(any)=[92679]
  - text: Speak with Aamelia Windfield about the Malfunctioning Cyclone Construct.

## 92699 The Supreme Magister  (L9 req4, 80 xp, F)
  - start: Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[92701]
  - text: Find Elaadrin Evengale in Valanaar.

## 92701 To Valanaar  (L9 req6, 80 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - pre(all)=[92550, 93927], next=92699
  - text: Deliver Aonda's Written Report to Valennia Stormfist in Valanaar.

## 92703 Deliver the News  (L9 req5, 590 xp, F)
  - start: Aamelia Windfield [npc 252800] @ Zephras Isle 46.7,82.0
  - end:   Alvarion Windfield [npc 252448] @ Zephras Isle 62.1,73.3
  - pre(any)=[92693]
  - text: Speak with Alvarion Windfield in Valanaar.

## 93317 Crab Season  (L9 req4, 590 xp, F)
  - start: Nyalah Brightfire [npc 257006] @ Zephras Isle 60.6,72.7
  - end:   Nyalah Brightfire [npc 257006] @ Zephras Isle 60.6,72.7
  - text: Collect 6 pieces of Windsong Crawler Meat.
  - objectives:
    1. item 6x Windsong Crawler Meat <- Windsong Crawler [npc 254588] L8-9 ~Zephras Isle 54,59 (478 spawns)

## 93318 WANTED: Vulgara the Insatiable  (L9 req4, 780 xp, F)
  - start: Bounty Available: Vulgara the Insatiable! [object 610954] @ Zephras Isle 43.4,45.8
  - end:   Danarii Bellowveil [npc 252172] @ Zephras Isle 45.2,45.2
  - pre(any)=[92514, 93461]
  - text: Kill Vulgara the Insatiable in the Shen'dar Highlands and bring her head to Danarii Bellowveil.
  - objectives:
    1. item 1x Vulgara's Head <- Vulgara the Insatiable [npc 254589] L8-8 ~Zephras Isle 43,53 (1 spawns)

## 93948 Deliver the Signet  (L9 req6, 390 xp, F)
  - start: Constable Aonda [npc 251523] @ Zephras Isle 45.7,45.5
  - end:   Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - pre(all)=[92550, 93927], next=93949
  - text: Deliver the Shadowsong Family Signet to Talaanis Shadowsong in Valanaar.

## 92727 The Missing Scholar  (L10 req4, 210 xp, F)
  - start: Dondallion Whisperwind [npc 253204] @ Zephras Isle 66.3,79.8
  - end:   Bloodstained Satchel [object 581822] @ Zephras Isle 53.3,72.1
  - pre(any)=[92699], next=92849
  - text: Discover what became of Fillion Flamebreeze.

## 92849 The Missing Scholar  (L10 req4, 840 xp, F, races=Skyborne)
  - start: Bloodstained Satchel [object 581822] @ Zephras Isle 53.3,72.1
  - end:   Fillion Flamebreeze [npc 253284] @ Zephras Isle 52.1,69.4
  - pre(any)=[92727], next=92850
  - text: Keep searching for Fillion Flamebreeze.
  - objectives:
    1. kill 1x Fillion Flamebreeze <- Fillion Flamebreeze [npc 253002] L10-10 ~Zephras Isle 51,65 (1 spawns)
    2. object 1x Dusty Bedroll <- Dusty Bedroll [object 581820] ~Zephras Isle 52,69 (1 spawns)

## 92850 The Missing Scholar  (L10 req4, 840 xp, F, races=Skyborne)
  - start: Fillion Flamebreeze [npc 253284] @ Zephras Isle 52.1,69.4
  - end:   Fillion Flamebreeze [npc 253285] @ Zephras Isle 66.2,79.9
  - pre(any)=[92849], next=99260
  - text: Slay the Shriekling Matriarch in the Shriekling Den then return its head to Fillion Flamebreeze in Valanaar.
  - objectives:
    1. item 1x Shriekling Matriarch's Head <- Shriekling Matriarch [npc 253283] L9-9 ~Zephras Isle 52,66 (7 spawns)

## 93791 Speak with Belann  (L10 req10, 420 xp, F, class=Mage, sort=MAGE)
  - start: Anathamaas Aetherwind [npc 252373] @ Zephras Isle 65.9,80.6; Belann Windwood [npc 256507] @ Zephras Isle 62.9,77.4
  - end:   Belann Windwood [npc 256507] @ Zephras Isle 62.9,77.4
  - next=93797
  - text: Speak with Belann Windwood in Valanaar.

## 93797 Boughs in the Wind  (L10 req10, 840 xp, F, class=Mage, sort=MAGE)
  - start: Belann Windwood [npc 256507] @ Zephras Isle 62.9,77.4
  - end:   Belann Windwood [npc 256507] @ Zephras Isle 62.9,77.4
  - pre(any)=[93791]
  - text: Bring a Wind-Infused Bough to Belann Windwood in Valanaar.
  - objectives:
    1. item 1x Wind-Infused Bough <- Wind-Infused Bough [object 616860] ~Zephras Isle 49,68 (1 spawns)

## 94003 The Skybreaker Bulwark  (L10 req10, 840 xp, F, races=Skyborne, class=Warrior, sort=WARRIOR)
  - start: Seena Skybreaker [npc 252377] @ Zephras Isle 59.9,72.9
  - end:   Seena Skybreaker [npc 252377] @ Zephras Isle 59.9,72.9
  - text: Reclaim the Skybreaker Bulwark from Zaal Stormshield at the Shrine of Akir.
  - objectives:
    1. item 1x Skybreaker Bulwark <- Zaal Stormshield [npc 257196] L10-10 ~Zephras Isle 57,50 (1 spawns)

## 94006 The Great Ursera Spirit  (L10 req10, 840 xp, F, races=Skyborne, class=Druid, sort=DRUID)
  - start: Lotheluum Starbreeze [npc 252359] @ Zephras Isle 64.0,75.1
  - end:   Urs'endris [npc 255853] @ Zephras Isle 69.8,61.7
  - next=94638
  - text: Speak with Urs'endris near the falls northeast of Valanaar.

## 94007 Taming the Beast  (L10 req10, 210 xp, F, races=Skyborne, class=Hunter, sort=HUNTER)
  - start: Elayaa Easewind [npc 254084] @ Zephras Isle 45.3,44.2
  - end:   Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - text: Report to Quel'ana Quickgale in Valanaar.

## 94013 Taming the Beast  (L10 req10, 840 xp, F, races=Skyborne, class=Hunter, sort=HUNTER)
  - start: Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - end:   Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - pre(any)=[94979], next=94050, exclusiveTo=[6063]
  - text: Use the Taming Rod to tame a Vuldren Alpha in the Gustberry Lowlands. Practice your skills, then return the Taming Rod to Quel'ana Quickgale in Valanaar.
  - objectives:
    1. kill 1x Vuldren Alpha <- Vuldren Alpha [npc 250874] L10-10 ~Zephras Isle 55,74 (253 spawns)

## 94050 Training the Beast  (L10 req10, 420 xp, F, races=Skyborne, class=Hunter, sort=HUNTER)
  - start: Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - end:   Quel'dora Quickgale [npc 254411] @ Zephras Isle 59.7,72.8
  - pre(any)=[94013]
  - text: Speak to Quel'dora Quickgale in Valanaar.

## 94638 Strength and Mercy  (L10 req10, 840 xp, F, races=Skyborne, class=Druid, sort=DRUID)
  - start: Urs'endris [npc 255853] @ Zephras Isle 69.8,61.7
  - end:   Urs'endris [npc 255853] @ Zephras Isle 69.8,61.7
  - pre(any)=[94006]
  - text: Find and kill Ur'endra in the Shen'dar Highlands.
  - objectives:
    1. kill 1x Ur'endra <- Ur'endra [npc 258443] L10-10 ~Zephras Isle 54,65 (9 spawns)

## 94978 Taming the Beast  (L10 req10, 840 xp, F, races=Skyborne, class=Hunter, sort=HUNTER)
  - start: Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - end:   Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - next=94979
  - text: Use the Taming Rod to tame a Windsong Crawler found near bodies of water.
  - text: Practice your skills, then return the Taming Rod to Quel'ana Quickgale in Valanaar.
  - objectives:
    1. kill 1x Windsong Crawler <- Windsong Crawler [npc 254588] L8-9 ~Zephras Isle 54,59 (478 spawns)

## 94979 Taming the Beast  (L10 req10, 840 xp, F, races=Skyborne, class=Hunter, sort=HUNTER)
  - start: Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - end:   Quel'ana Quickgale [npc 252389] @ Zephras Isle 59.6,72.6
  - pre(any)=[94978], next=94013
  - text: Use the Taming Rod to tame an Ornery Galestrider in the Gustberry Lowlands.
  - text: Practice your skills, then return the Taming Rod to Quel'ana Quickgale in Valanaar.
  - objectives:
    1. kill 1x Ornery Galestrider <- Ornery Galestrider [npc 251707] L8-9 ~Zephras Isle 56,73 (349 spawns)

## 99260 Fillion's Mission  (L10 req5, 85 xp, F)
  - start: Fillion Flamebreeze [npc 253285] @ Zephras Isle 66.2,79.9
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[92850], next=92840
  - text: Speak with Elaadrin Evengale in Valanaar.

## 92640 Desperate Times  (L11 req6, 660 xp, F)
  - start: Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - end:   Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - pre(any)=[94568], next=93065
  - text: Speak with Valennia Stormfist in Valanaar and follow her instructions.
  - objectives:
    1. kill 1x Valennia Stormfist <- Valennia Stormfist [npc 252383] L20-20 ~Zephras Isle 66,77 (1 spawns)
    2. kill 1x Ayessa Dawnsinger <- Ayessa Dawnsinger [npc 251968] L9999-9999 ~Zephras Isle 59,80 (1 spawns)
    3. kill 1x Elaadrin Evengale <- Elaadrin Evengale [npc 252475] L9999-9999 ~Zephras Isle 67,80 (1 spawns)

## 92642 Disrupting Logistics  (L11 req6, 440 xp, F)
  - start: Yorana Windyreed [npc 252378] @ Zephras Isle 69.7,67.1
  - end:   Yorana Windyreed [npc 252378] @ Zephras Isle 69.7,67.1
  - pre(any)=[93320]
  - text: Slay 4 Al'Aketh Healers and 8 Al'Aketh Brawlers in the Gustberry Lowlands.
  - objectives:
    1. kill 4x Al'Aketh Healer <- Al'Aketh Healer [npc 254596] L9-10 ~Zephras Isle 66,67 (38 spawns)
    2. kill 4x Al'Aketh Brawler <- Al'Aketh Brawler [npc 270201] L8-10 ~Zephras Isle 65,67 (80 spawns)

## 92643 The Turncoat  (L11 req6, 660 xp, F)
  - start: Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - end:   Dead Cultist [npc 253372] @ Zephras Isle 56.2,59.0
  - pre(any)=[92881], next=92644
  - text: Find the cultist turncoat at the house just inside the highlands northwest of Valanaar.
  - objectives:
    1. kill 1x DNT KILL CREDIT <- DNT KILL CREDIT [npc 255013] LNone-None ~Zephras Isle 56,61 (1 spawns)
    2. kill 1x Dead Cultist <- Dead Cultist [npc 253372] L10-10 ~Zephras Isle 56,59 (1 spawns)

## 92644 Unfortunate News  (L11 req6, 440 xp, F)
  - start: Dead Cultist [npc 253372] @ Zephras Isle 56.2,59.0
  - end:   Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - pre(any)=[92643], next=94568
  - text: Deliver the glowing crystal to Talanaanis Shadowsong in Valanaar.

## 92645 Breaking the Breaker  (L11 req6, 660 xp, F)
  - start: Yorana Windyreed [npc 252378] @ Zephras Isle 69.7,67.1
  - end:   Yorana Windyreed [npc 252378] @ Zephras Isle 69.7,67.1
  - pre(any)=[93320]
  - text: Slay Commander Belguilos in the Gustberry Lowlands.
  - objectives:
    1. kill 1x Commander Belguilos <- Commander Belguilos [npc 252666] L10-10 ~Zephras Isle 66,66 (1 spawns)

## 92834 Avenged Tenfold  (L11 req6, 880 xp, F)
  - start: Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[92840]
  - text: Collect 10 Al'Aketh Windstone Charms from Al'Aketh cultists found north of Valanaar at the Gustberry Fields or Shrine of Akir.
  - objectives:
    1. item 10x Al'Aketh Windstone Charm <- Al'Aketh Stormchaser [npc 252664] L10-11 ~Zephras Isle 64,38 (43 spawns); Al'Aketh Footsoldier [npc 252665] L10-11 ~Zephras Isle 64,37 (29 spawns); Al'Aketh Guardian [npc 252762] L10-11 ~Zephras Isle 62,50 (82 spawns); Al'Aketh Spiritcaller [npc 252763] L10-10 ~Zephras Isle 62,50 (81 spawns)

## 92840 Catching Wind  (L11 req5, 880 xp, F)
  - start: Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[99260], next=92834
  - text: Take the Index Esoteria to the Overlook Standing Stones in Shen'dar Highlands and use it on the Windstone Formations in the area to gather data.
  - objectives:
    1. object 1x Windstone Formation <- Windstone Formation [object 697118] ~Zephras Isle 48,69 (7 spawns)

## 92880 Return to Valanaar  (L11 req6, 440 xp, F)
  - start: Yorana Windyreed [npc 252378] @ Zephras Isle 69.7,67.1
  - end:   Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - pre(all)=[92642, 92645], next=92881
  - text: Bring Yorna's Report to Valennia Stormfist in Valanaar.

## 92881 The High Elder's Request  (L11 req6, 90 xp, F)
  - start: Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - end:   Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - pre(any)=[92880], next=92643
  - text: Speak with Talaanis Shadowsong in Valanaar.

## 93320 Tower Defense  (L11 req6, 440 xp, F)
  - start: Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - end:   Yorana Windyreed [npc 252378] @ Zephras Isle 69.7,67.1
  - pre(any)=[92860, 92871]
  - text: Report to Yorana Windyreed at the eastern watchtower in the Gustberry Lowlands.

## 94484 Unnerving Silence  (L11 req8, 220 xp, F)
  - start: Lotheluum Starbreeze [npc 252359] @ Zephras Isle 64.0,75.1
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - exclusiveTo=[94493]
  - text: Find and speak with Elegael Thornpaw in the northeastern part of Shadowgale Forest.

## 94486 Feathers for Binding  (L11 req8, 880 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - pre(any)=[94484, 94493]
  - text: Collect 20 feathers from the Shadowgale Shrieklings in Shadowgale Forest.
  - objectives:
    1. item 1x Pristine Shriekling Feather <- Shadowgale Shriekling [npc 256092] L10-11 ~Zephras Isle 59,40 (177 spawns)

## 94487 Unwanted and Unworthy  (L11 req8, 880 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - pre(any)=[94484, 94493]
  - text: Collect 10 Bloodied Heirlooms from Al'Aketh Footsoldiers and Al'Aketh Stormchasers in the Shadowgale Forest.
  - objectives:
    1. item 1x Bloody Heirloom <- Al'Aketh Stormchaser [npc 252664] L10-11 ~Zephras Isle 64,38 (43 spawns); Al'Aketh Footsoldier [npc 252665] L10-11 ~Zephras Isle 64,37 (29 spawns)

## 94488 The Ties That Bind  (L11 req8, 880 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - pre(all)=[94485, 94486, 94487]
  - text: Kill Commander Haalien and bring his head to Elegael Thornpaw in the Shadowgale Forest.
  - objectives:
    1. item 1x Commander Haalien's Severed Head <- Commander Haalien [npc 253622] L10-10 ~Zephras Isle 66,36 (1 spawns)

## 94493 A Sacrifice in Vain  (L11 req8, 220 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - exclusiveTo=[94484]
  - text: Speak with Elegael Thornpaw in the northeastern part of Shadowgale Forest.

## 94568 The Cult's True Plans  (L11 req6, 440 xp, F)
  - start: Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - end:   Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - pre(any)=[92644], next=92640
  - text: Speak with Talaanis Shadowsong and observe the conversation.
  - objectives:
    1. kill 1x Talaanis Shadowsong <- Talaanis Shadowsong [npc 252476] L13-13 ~Zephras Isle 66,77 (1 spawns)

## 94896 Aid For The Refugees  (L11 req8, 880 xp, F)
  - start: Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - end:   Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - text: Collect 8 Abandoned Belongings from the ruins of Ban'aethal.
  - objectives:
    1. item 8x Abandoned Belongings <- Abandoned Belongings [object 623295] ~Zephras Isle 58,32 (14 spawns)

## 94897 The Fate of a Loved One  (L11 req8, 880 xp, F)
  - start: Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - end:   Ealaane Nimbuswalker [npc 259012] @ Zephras Isle 66.0,74.3
  - text: Find Resaan in the Ruins of Ban'aethal.
  - objectives:
    1. item 1x Resaan's Heirloom <- Resaan Nimbuswalker [npc 259013] L10-10 ~Zephras Isle 57,29 (1 spawns)

## 98512 Al'Aketh Assassins  (L11 req6, 880 xp, F)
  - start: Fendaal Windstone [npc 273017] @ Zephras Isle 56.8,61.1
  - end:   Fendaal Windstone [npc 273017] @ Zephras Isle 56.8,61.1
  - text: Kill 10 Al'Aketh Assassins in the Shen'dar Highlands.
  - objectives:
    1. kill 10x Al'Aketh Assassin <- Al'Aketh Assassin [npc 254626] L9-10 ~Zephras Isle 56,61 (33 spawns)

## 92709 A Grand Adventure  (L12 req7, 90 xp, F)
  - start: Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[92699]
  - text: Listen to what Elaadrin Evengale in Valanaar has to say.
  - objectives:
    1. kill 1x Elaadrin Evengale <- Elaadrin Evengale [npc 252475] L9999-9999 ~Zephras Isle 67,80 (1 spawns)

## 92860 In Service of Zephras  (L12 req6, 225 xp, F)
  - start: Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - end:   Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - pre(any)=[92840], next=93320
  - text: Report to Valennia Stormfist and let her know that the High Order is with them in their fight against the Al'Aketh.

## 92947 Making Our Move  (L12 req7, 910 xp, F)
  - start: Valennia Stormfist [npc 253844] @ Zephras Isle 61.1,70.9
  - end:   Hyusaa Quickbreeze [npc 253576] @ Zephras Isle 63.8,50.5
  - pre(any)=[93065], next=93958
  - text: Slay 7 Al'Aketh Guardians, 7 Al'Aketh Spiritcallers, and 7 Al'Aketh Blademasters, then report to Hyusaa Quickbreeze at the Shrine of Akir.
  - objectives:
    1. kill 7x Al'Aketh Guardian <- Al'Aketh Guardian [npc 252762] L10-11 ~Zephras Isle 62,50 (82 spawns)
    2. kill 7x Al'Aketh Spiritcaller <- Al'Aketh Spiritcaller [npc 252763] L10-10 ~Zephras Isle 62,50 (81 spawns)
    3. kill 7x Al'Aketh Blademaster <- Al'Aketh Blademaster [npc 252765] L10-10 ~Zephras Isle 63,51 (88 spawns)
    4. kill 1x Hyusaa Quickbreeze <- Hyusaa Quickbreeze [npc 253576] L13-13 ~Zephras Isle 64,51 (1 spawns)

## 93065 Prepare for Battle  (L12 req7, 455 xp, F)
  - start: Valennia Stormfist [npc 252383] @ Zephras Isle 66.1,76.6
  - end:   Valennia Stormfist [npc 253844] @ Zephras Isle 61.1,70.9
  - pre(any)=[92640], next=92947
  - text: Speak with Valennia Stormfist in the Gustberry Lowlands.
  - objectives:
    1. kill 1x Valennia Stormfist <- Valennia Stormfist [npc 253844] L13-13 ~Zephras Isle 61,71 (1 spawns)

## 93835 Confront Lorthuna  (L12 req7, 455 xp, F)
  - start: Valennia Stormfist [npc 253590] @ Zephras Isle 65.2,50.4
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[93958], next=94369, exclusiveTo=[92646]
  - text: Take the portal to the Rohashi Spires overhead and join Elaadrin Evengale and Ayessa Dawnsinger in their confrontation with High Priestess Lorthuna.

## 93958 The Inner Sanctum  (L12 req7, 910 xp, F)
  - start: Hyusaa Quickbreeze [npc 253576] @ Zephras Isle 63.8,50.5
  - end:   Valennia Stormfist [npc 253590] @ Zephras Isle 65.2,50.4
  - pre(any)=[92947]
  - text: Speak with Valennia Stormfist inside the inner sanctum at the Shrine of Akir.

## 94369 The Fate of Zephras  (L12 req7, 90 xp, F)
  - start: Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - end:   Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - pre(any)=[93835], next=93089
  - text: Speak with Talaanis Shadowsong in Valanaar.
  - objectives:
    1. kill 1x Talaanis Shadowsong <- Talaanis Shadowsong [npc 252476] L13-13 ~Zephras Isle 66,77 (1 spawns)

## 94485 Tears of the Lady  (L12 req8, 225 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - pre(any)=[94484, 94493]
  - text: Collect 8 Lady's Tear Moss.
  - objectives:
    1. item 8x Lady's Tear Moss <- Lady's Tear Moss [object 619450] ~Zephras Isle 61,39 (14 spawns)

## 94489 The Wounds of Betrayal  (L12 req8, 910 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - pre(all)=[94485, 94486, 94487]
  - text: Enter the Nightfang Den and heal 7 druids and find Jorel Windsinger in Shadowgale Forest.
  - objectives:
    1. kill 1x Jorel Windsinger <- Jorel Windsinger [npc 258130] L10-10 ~Zephras Isle 64,35 (1 spawns)
    2. kill 1x Naaleos Leafwhisper <- Naaleos Leafwhisper [npc 258134] L10-10 ~Zephras Isle 65,35 (1 spawns); Telenos Leafwhisper [npc 258137] L10-10 ~Zephras Isle 65,35 (1 spawns); Nayeela Snarlfang [npc 258138] L10-10 ~Zephras Isle 65,35 (1 spawns); Neyasteel Mossmender [npc 258275] L10-10 ~Zephras Isle 64,32 (1 spawns)

## 94490 Ripped Missive  (L12 req9, 910 xp, F)
  - start: item Ripped Missive [265476] (drops from Commander Haalien)
  - end:   Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - pre(all)=[94485, 94486, 94487], next=94491
  - text: Bring the Ripped Missive to Elegael Thornpaw in the Shadowgale Forest.

## 94491 The Fate of the Den  (L12 req8, 455 xp, F)
  - start: Elegael Thornpaw [npc 257944] @ Zephras Isle 61.7,39.2
  - end:   Lotheluum Starbreeze [npc 252359] @ Zephras Isle 64.0,75.1
  - pre(any)=[94490]
  - text: Give the missive to Lotheluum in Valanaar and tell him what has transpired.

## 92741 Unwelcome Visitors  (L13 req8, 910 xp, F)
  - start: Iaadaria Bitterwind [npc 253004] @ Zephras Isle 66.3,79.5
  - end:   Iaadaria Bitterwind [npc 253004] @ Zephras Isle 66.3,79.5
  - pre(any)=[92699]
  - text: Travel to Shadowgale Forest and collect 8 Shriekling Talons for Iaadaria Bitterwind in Valanaar.
  - objectives:
    1. item 8x Shriekling Talons <- Shadowgale Manticore [npc 251247] LNone-None; Shadowgale Shriekling [npc 256092] L10-11 ~Zephras Isle 59,40 (177 spawns)

## 93089 What Comes Next  (L13 req7, 90 xp, F)
  - start: Talaanis Shadowsong [npc 252476] @ Zephras Isle 66.2,76.5
  - end:   Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - pre(any)=[94369], next=94946
  - text: Speak with Elaadrin Evengale when you are prepared to leave Zephras Isle.

## 93159 The Strange Hermit  (L13 req8, 230 xp, F)
  - start: Strange Hermit [npc 251684] @ Zephras Isle 54.0,38.9
  - end:   Strange Hermit [npc 251684] @ Zephras Isle 54.0,38.9
  - text: Speak with the Strange Hermit in the Shadowgale Forest and learn more about him.
  - objectives:
    1. kill 1x Strange Hermit <- Strange Hermit [npc 251684] L10-10 ~Zephras Isle 54,39 (1 spawns)

## 93160 The Forest's Bounty  (L13 req8, 680 xp, F)
  - start: Strange Hermit [npc 251684] @ Zephras Isle 54.0,38.9
  - end:   Strange Hermit [npc 251684] @ Zephras Isle 54.0,38.9
  - pre(any)=[93159]
  - text: Gather 8 Shadowgale Acorns in Shadowgale Forest.
  - objectives:
    1. item 1x Zephyrseed <- Zephyrseed Cone [object 613238] ~Zephras Isle 59,39 (29 spawns)

## 93165 Mercy Falls on Deaf Ears  (L13 req8, 910 xp, F)
  - start: Vayn Moongaze [npc 254151] @ Zephras Isle 63.8,35.9
  - end:   Vayn Moongaze [npc 254151] @ Zephras Isle 63.8,35.9
  - pre(any)=[94484, 94493], next=93459
  - text: Collect 5 Al'Aketh Cultist's Ears from the Al'Aketh cultists in Shadowgale Forest, the Shrine of Akir, or Gustberry Lowlands.
  - objectives:
    1. item 5x Al'Aketh Cultist's Ear <- Al'Aketh Stormchaser [npc 252664] L10-11 ~Zephras Isle 64,38 (43 spawns); Al'Aketh Footsoldier [npc 252665] L10-11 ~Zephras Isle 64,37 (29 spawns); Al'Aketh Guardian [npc 252762] L10-11 ~Zephras Isle 62,50 (82 spawns); Al'Aketh Spiritcaller [npc 252763] L10-10 ~Zephras Isle 62,50 (81 spawns)

## 93172 Free the Hollows  (L13 req8, 680 xp, F)
  - start: Strange Hermit [npc 251684] @ Zephras Isle 54.0,38.9
  - end:   Strange Hermit [npc 251684] @ Zephras Isle 54.0,38.9
  - pre(any)=[93159]
  - text: Destroy 10 Wind Hollows in Shadowgale Forest.
  - objectives:
    1. kill 10x Wind Hollow <- Wind Hollow [npc 251676] L10-11 ~Zephras Isle 58,32 (41 spawns)

## 93459 More Al'Aketh Ears  (L13 req8, ? xp, F, repeatable)
  - start: Vayn Moongaze [npc 254151] @ Zephras Isle 63.8,35.9
  - end:   Vayn Moongaze [npc 254151] @ Zephras Isle 63.8,35.9
  - pre(any)=[93165]
  - objectives:
    1. item 1x Al'Aketh Cultist's Ear <- Al'Aketh Stormchaser [npc 252664] L10-11 ~Zephras Isle 64,38 (43 spawns); Al'Aketh Footsoldier [npc 252665] L10-11 ~Zephras Isle 64,37 (29 spawns); Al'Aketh Guardian [npc 252762] L10-11 ~Zephras Isle 62,50 (82 spawns); Al'Aketh Spiritcaller [npc 252763] L10-10 ~Zephras Isle 62,50 (81 spawns)

## 94946 The Magical City of Dalaran  (L13 req7, 90 xp, F)
  - start: Elaadrin Evengale [npc 252475] @ Zephras Isle 66.6,79.9
  - end:   Denaaris Stargale [npc 259084] @ Alterac Mountains 12.3,56.3
  - pre(any)=[93089]
  - text: Take the skycutter ship from Zephras Isle to Dalaran City and speak with Danaaris Stargale when you arrive.

## 96996 Your First Riding Galestrider  (L40 req40, 3150 xp, F, races=Skyborne)
  - start: Genn Fairweather [npc 265756] @ Zephras Isle 53.8,81.3
  - end:   Genn Fairweather [npc 265756] @ Zephras Isle 53.8,81.3
  - exclusiveTo=[95511, 96982, 96989, 96994, 96997, 97017, 97045, 97046, 97171, 97446, 98166, 99326]
  - text: Inspect the riding striders to choose your first mount.
  - objectives:
    1. kill 1x Empyrean Galestrider <- Empyrean Galestrider [npc 267304] L1-1 ~Zephras Isle 54,81 (1 spawns)
    2. kill 1x Stormy Galestrider <- Stormy Galestrider [npc 267305] L1-1 ~Zephras Isle 54,81 (1 spawns)
    3. kill 1x Umber Galestrider <- Umber Galestrider [npc 267306] L1-1 ~Zephras Isle 54,81 (1 spawns)

## 97205 Learning to Ride  (L40 req40, ? xp, F, races=Skyborne)
  - start: Genn Fairweather [npc 265756] @ Zephras Isle 53.8,81.3
  - end:   Genn Fairweather [npc 265756] @ Zephras Isle 53.8,81.3
  - exclusiveTo=[97018, 97074, 97170, 97188, 97194, 97200, 97203, 97204]
  - text: Learn the Apprentice Riding skill from Genn Fairweather.

## 99203 Swift as the Wind  (L60 req60, ? xp, F)
  - start: Genn Fairweather [npc 265756] @ Zephras Isle 53.8,81.3
  - end:   ?
  - text: Learn the Journeyman Riding skill from Genn Fairweather.

## 99216 An Epic Ride  (L60 req60, ? xp, F)
  - start: ?
  - end:   ?
  - text: Inspect the armored riding striders to choose your epic mount.

# Service NPCs

- Destin Thriceforged <Weapon Merchant> [npc 251364] 43.4,23.5: repair, vendor
- Jolee Brightmeadows <Cloth & Leather Armor> [npc 251365] 43.5,23.6: repair, vendor
- Xyton Silverwind <Druid Trainer> [npc 251373] 41.9,23.4: trainer
- Tai'ree Farsight <Hunter Trainer> [npc 251376] 42.5,23.8: trainer
- Dorii Brightwhisper <Mage Trainer> [npc 251379] 41.5,23.7: trainer
- Akeri Duskblade <Rogue Trainer> [npc 251389] 43.7,24.4: trainer
- Uualia Suncrest <General Goods> [npc 251537] 42.8,24.5: repair, vendor
- Strange Hermit <> [npc 251684] 54.0,38.9: trainer
- Zerril Softbreeze <Cook> [npc 251905] 43.9,43.8: trainer, vendor
- Aedi Thriceforged <Blacksmith> [npc 251913] 44.9,44.4: repair, trainer, vendor
- Blademaster Ren <Warrior Trainer> [npc 251964] 43.6,24.1: trainer
- Fevrath Skyhammer <Armorer & Shieldcrafter> [npc 251965] 43.4,23.4: repair, vendor
- Taleen Shimmerthread <Tailor> [npc 251991] 44.9,44.3: trainer, vendor
- Fenn Fairweather <Fisherman> [npc 251992] 45.0,48.4: repair, trainer, vendor
- Indari Sunseam <Leatherworker> [npc 251993] 44.7,44.5: repair, trainer, vendor
- Lotheluum Starbreeze <Druid Trainer> [npc 252359] 64.0,75.1: trainer
- Anathamaas Aetherwind <Mage Trainer> [npc 252373] 65.9,80.6: trainer
- Emerii Tallgust <Leatherworker> [npc 252376] 63.7,80.7: trainer, vendor
- Seena Skybreaker <Warrior Trainer> [npc 252377] 59.9,72.9: trainer
- Eltheen Nightbreeze <Rogue Trainer> [npc 252379] 59.9,72.5: trainer
- Othesia Evengale <Tailor> [npc 252380] 64.4,81.2: trainer, vendor
- Halavuul Cragwind <Mining Trainer> [npc 252388] 65.4,80.5: trainer, vendor
- Quel'ana Quickgale <Hunter Trainer> [npc 252389] 59.6,72.6: trainer
- Antelariaa Cloudgaze <General Goods> [npc 252390] 63.0,77.8: vendor
- Iallion Featherfall <Trade Supplies> [npc 252449] 59.0,75.5: vendor
- Daeann Steelwind <Blacksmith> [npc 252479] 65.5,80.3: repair, trainer, vendor
- Iaadaria Bitterwind <Alchemist> [npc 253004] 66.3,79.5: trainer, vendor
- Naeluna Swiftmend <Druid Trainer> [npc 254081] 45.2,44.2: trainer
- Elayaa Easewind <Hunter Trainer> [npc 254084] 45.3,44.2: trainer
- Shenaan Spellwind <Mage Trainer> [npc 254086] 45.1,45.9: trainer
- Miriaan Mistblade <Rogue Trainer> [npc 254087] 43.1,43.3: trainer
- Corsan Earthrazer <Warrior Trainer> [npc 254088] 45.0,45.1: trainer
- Coriella Calmbreeze <Innkeeper> [npc 254089] 43.0,43.2: innkeeper, vendor
- Vayn Moongaze <> [npc 254151] 63.8,35.9: vendor
- Syriel Nightrain <Herbalist> [npc 254345] 57.9,75.5: trainer
- Veena Vericloud <General Goods> [npc 254358] 44.7,45.5: vendor
- Belandiel Farflight <Trade Supplies> [npc 254360] 44.8,45.0: vendor
- Donaal Downbreeze <Innkeeper> [npc 255940] 62.2,72.6: innkeeper, vendor
- Belann Windwood <Staff Merchant> [npc 256507] 62.9,77.4: repair, vendor
- Ishlee Breezewhisper <Skinner> [npc 257003] 59.6,76.1: trainer, vendor
- Eaysaa Brightgust <Enchanter> [npc 257004] 59.2,76.4: trainer, vendor
- Valiena Swiftgale <Alchemist> [npc 257005] 59.2,76.3: trainer, vendor
- Nyalah Brightfire <Cook> [npc 257006] 60.6,72.7: trainer, vendor
- Melasa Fairmend <Medic> [npc 257007] 63.2,72.6: trainer
- Baelann Swiftcurrent <Fisher> [npc 257008] 63.3,75.7: trainer, vendor
- Naleeia Tattermend <Medic> [npc 257018] 43.1,46.3: trainer
- Nyassa Swiftdraught <Alchemist> [npc 257019] 43.7,43.4: trainer, vendor
- Nasalanna Windsinger <Enchanter> [npc 257020] 43.2,43.1: trainer, vendor
- Halassa Fernbreeze <Herbalist> [npc 257021] 43.0,43.5: trainer
- Messana Crestwind <Miner> [npc 257022] 44.8,44.6: trainer, vendor
- Mendalass Tattermend <Skinner> [npc 257024] 43.3,43.4: trainer, vendor
- Baelann Favorbreeze <Banker> [npc 257036] 57.6,77.2: banker
- Zelena Favorbreeze <Auctioneer> [npc 257037] 57.9,77.1: auctioneer
- Tephri Thriceforged <Weapon Merchant> [npc 257421] 44.8,44.2: repair, vendor
- Railee Thriceforged <Weapon Merchant> [npc 257422] 59.0,75.5: repair, vendor
- Genn Fairweather <Stablemaster and Riding Trainer> [npc 265756] 53.8,81.3: repair, trainer, vendor
- Falfaan Halfwind <Artisan Weapon Crafter> [npc 271465] 59.4,75.7: repair, vendor
- Elaria Anvilwind <Artisan Armorsmith> [npc 271478] 59.5,76.1: repair, vendor
- Taliaa Brightsky <Artisan Clothier> [npc 271480] 59.3,76.2: repair, vendor
- Ergaan Eastwind <Artisan Leather Goods> [npc 271483] 59.7,76.0: repair, vendor
