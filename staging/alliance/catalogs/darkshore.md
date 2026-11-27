# Darkshore: Alliance + neutral quests (88)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 960 Onu is meditating  (L1 req1, ? xp, F, repeatable)
  - start: Onu [npc 3616] @ Darkshore 43.5,76.3
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - pre(any)=[944]

## 961 Onu is meditating  (L1 req1, ? xp, repeatable)
  - start: Onu [npc 3616] @ Darkshore 43.5,76.3
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - pre(any)=[949]

## 983 Buzzbox 827  (L10 req7, 840 xp)
  - start: Wizbang Cranktoggle [npc 3666] @ Darkshore 37.0,44.1
  - end:   Buzzbox 827 [object 17182] @ Darkshore 36.6,46.3
  - next=1001
  - text: Collect 6 Crawler Legs and place them in Buzzbox 827.
  - objectives:
    1. item 6x Crawler Leg <- Pygmy Tide Crawler [npc 2231] L9-10 ~Darkshore 36,43 (47 spawns); Tide Crawler [npc 2232] L13-14 ~Darkshore 39,43 (27 spawns); Encrusted Tide Crawler [npc 2233] L18-20 ~Darkshore 46,41 (15 spawns); Young Reef Crawler [npc 2234] L10-11 ~Darkshore 37,48 (30 spawns)

## 6341 The Bounty of Teldrassil  (L10 req10, 210 xp, races=NightElf)
  - start: Nessa Shadowsong [npc 10118] @ Teldrassil 56.3,92.4
  - end:   Vesprystus [npc 3838] @ Teldrassil 58.4,94.0
  - next=6342
  - text: Bring Nessa's Collection to Vesprystus.

## 6342 Flight to Auberdine  (L10 req10, 420 xp, races=NightElf)
  - start: Vesprystus [npc 3838] @ Teldrassil 58.4,94.0
  - end:   Laird [npc 4200] @ Darkshore 36.8,44.3
  - pre(any)=[6341], next=6343
  - text: Ride a hippogryph to Auberdine from the hippogryph master Vesprystus, then bring Nessa's Collection to Laird.

## 6343 Return to Nessa  (L10 req10, 1050 xp, races=NightElf)
  - start: Laird [npc 4200] @ Darkshore 36.8,44.3
  - end:   Nessa Shadowsong [npc 10118] @ Teldrassil 56.3,92.4
  - pre(any)=[6342]
  - text: Bring Laird's Response to Nessa Shadowsong.

## 953 The Fall of Ameth'Aran  (L12 req9, 910 xp)
  - start: Sentinel Tysha Moonblade [npc 3639] @ Darkshore 40.3,59.7
  - end:   Sentinel Tysha Moonblade [npc 3639] @ Darkshore 40.3,59.7
  - text: Study the tablets which tell of Ameth'Aran and of its fall, then return to Sentinel Tysha Moonblade in Darkshore.
  - objectives:
    1. object 1x The Lay of Ameth'Aran <- The Lay of Ameth'Aran [object 17188] ~Darkshore 43,59 (1 spawns)
    2. object 1x The Fall of Ameth'Aran <- The Fall of Ameth'Aran [object 17189] ~Darkshore 43,63 (1 spawns)

## 954 Bashal'Aran  (L12 req7, 680 xp)
  - start: Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - end:   Asterion [npc 3650] @ Darkshore 44.2,36.3
  - next=955
  - text: Find the source of the strange blue aura in the ruins of Bashal'Aran.

## 955 Bashal'Aran  (L12 req7, 910 xp)
  - start: Asterion [npc 3650] @ Darkshore 44.2,36.3
  - end:   Asterion [npc 3650] @ Darkshore 44.2,36.3
  - pre(any)=[954], next=956
  - text: Acquire 8 Grell Earrings for Asterion in Bashal'Aran.
  - objectives:
    1. item 8x Grell Earring <- Vile Sprite [npc 2189] L10-11 ~Darkshore 45,38 (17 spawns); Wild Grell [npc 2190] L11-12 ~Darkshore 47,38 (23 spawns)

## 958 Tools of the Highborne  (L12 req9, 910 xp)
  - start: Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - text: Retrieve 7 Highborne Relics for Thundris Windweaver in Auberdine.
  - objectives:
    1. item 7x Highborne Relic <- Cursed Highborne [npc 2176] L10-11 ~Darkshore 42,58 (13 spawns); Writhing Highborne [npc 2177] L11-12 ~Darkshore 42,61 (21 spawns); Wailing Highborne [npc 2178] L12-13 ~Darkshore 43,61 (15 spawns); Terrified Soul [npc 210528] LNone-None

## 1001 Buzzbox 411  (L12 req7, 1150 xp)
  - start: Buzzbox 827 [object 17182] @ Darkshore 36.6,46.3
  - end:   Buzzbox 411 [object 17183] @ Darkshore 42.0,28.6
  - pre(any)=[983], next=1002
  - text: Collect 3 Thresher Eyes from Darkshore Threshers in the deep sea near Buzzbox 411.
  - objectives:
    1. item 3x Thresher Eye <- Darkshore Thresher [npc 2185] L12-14 ~Darkshore 34,42 (51 spawns); Elder Darkshore Thresher [npc 2187] L16-18 ~Darkshore 40,48 (27 spawns)

## 1579 Gaffer Jacks  (L12 req10, 455 xp, sort=FISHING)
  - start: Wizbang Cranktoggle [npc 3666] @ Darkshore 37.0,44.1
  - end:   Wizbang Cranktoggle [npc 3666] @ Darkshore 37.0,44.1
  - next=1580
  - text: Bring 8 Gaffer Jacks to Wizbang Cranktoggle in Auberdine.
  - objectives:
    1. item 8x Gaffer Jack <- ?

## 1580 Electropellers  (L12 req10, 910 xp, sort=FISHING)
  - start: Wizbang Cranktoggle [npc 3666] @ Darkshore 37.0,44.1
  - end:   Wizbang Cranktoggle [npc 3666] @ Darkshore 37.0,44.1
  - pre(any)=[1579]
  - text: Bring 12 Electropellers to Wizbang Cranktoggle in Auberdine.
  - objectives:
    1. item 12x Electropeller <- ?

## 2178 Easy Strider Living  (L12 req9, 910 xp, sort=COOKING)
  - start: Alanndarian Nightsong [npc 3702] @ Darkshore 37.7,40.7
  - end:   Alanndarian Nightsong [npc 3702] @ Darkshore 37.7,40.7
  - text: Bring back 5 Strider Meat to Alanndarian Nightsong in Auberdine.
  - objectives:
    1. item 5x Strider Meat <- Strider Clutchmother [npc 2172] L20-20 ~Darkshore 35,87 (1 spawns); Foreststrider Fledgling [npc 2321] L11-13 ~Darkshore 43,46 (98 spawns); Foreststrider [npc 2322] L14-16 ~Darkshore 47,43 (48 spawns); Giant Foreststrider [npc 2323] L17-19 ~Darkshore 43,76 (61 spawns)

## 956 Bashal'Aran  (L13 req7, 910 xp)
  - start: Asterion [npc 3650] @ Darkshore 44.2,36.3
  - end:   Asterion [npc 3650] @ Darkshore 44.2,36.3
  - pre(any)=[955], next=957
  - text: Obtain the Ancient Moonstone Seal and bring it to Asterion in Bashal'Aran.
  - objectives:
    1. item 1x Ancient Moonstone Seal <- Deth'ryll Satyr [npc 2212] L12-13 ~Darkshore 47,38 (6 spawns)

## 957 Bashal'Aran  (L13 req7, 680 xp)
  - start: Asterion [npc 3650] @ Darkshore 44.2,36.3
  - end:   Asterion [npc 3650] @ Darkshore 44.2,36.3
  - pre(any)=[956]
  - text: Destroy the Ancient Moonstone Seal at the ancient flame in Ameth'Aran, then return to Asterion in Bashal'Aran.
  - objectives:
    1. object 1x Ancient Flame <- Ancient Flame [object 16393] ~Darkshore 42,62 (1 spawns)

## 3524 Washed Ashore  (L13 req11, 680 xp)
  - start: Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - next=4681
  - text: Recover Sea Creature Bones from the beached sea creature just south of Auberdine, and then return with it to Gwennyth Bly'Leggonde in Auberdine.
  - objectives:
    1. item 1x Sea Creature Bones <- Beached Sea Creature [object 175207] ~Darkshore 36,51 (1 spawns)

## 4722 Beached Sea Turtle  (L13 req11, 455 xp)
  - start: Beached Sea Turtle [object 176190] @ Darkshore 37.1,62.2
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Turtle Remains to Gwennyth Bly'Leggonde in Auberdine.

## 4723 Beached Sea Creature  (L13 req11, 455 xp)
  - start: Beached Sea Creature [object 175233] @ Darkshore 41.9,31.5
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Creature Bones to Gwennyth Bly'Leggonde in Auberdine.

## 98025 WANTED: Jai'vhanel  (L13 req10, 1150 xp, F)
  - start: WANTED: Murkdeep! [object 175320] @ Darkshore 37.2,44.2
  - end:   Sentinel Glynda Nal'Shea [npc 2930] @ Darkshore 37.7,43.4
  - text: Find and slay the owl known as Jai'vhanel and take one of her feathers. The black owl was last seen north of the Ameth'Aran ruins near the mountain base. Report the death of Jai'vhanel to Sentinel Glynda Nal'Shea in Auberdine.
  - objectives:
    1. item 1x Feather of Jai'vhanel <- Jai'vhanel [npc 270196] L12-12 ~Darkshore 45,58 (22 spawns)

## 984 How Big a Threat?  (L14 req10, 740 xp)
  - start: Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - end:   Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - next=985
  - text: Find a corrupt furbolg camp in Darkshore and return to Terenthis in Auberdine.

## 985 How Big a Threat?  (L14 req10, 980 xp)
  - start: Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - end:   Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - pre(any)=[984], next=986
  - text: Kill 8 Blackwood Pathfinders and 5 Windtalkers and return to Terenthis in Auberdine.
  - objectives:
    1. kill 8x Blackwood Pathfinder <- Blackwood Pathfinder [npc 2167] L12-13 ~Darkshore 40,54 (12 spawns)
    2. kill 8x Blackwood Windtalker <- Blackwood Windtalker [npc 2324] L13-14 ~Darkshore 40,54 (14 spawns)

## 1002 Buzzbox 323  (L14 req7, 980 xp)
  - start: Buzzbox 411 [object 17183] @ Darkshore 42.0,28.6
  - end:   Buzzbox 323 [object 17184] @ Darkshore 51.3,24.6
  - pre(any)=[1001], next=1003
  - text: Collect 6 Moonstalker Fangs and place them in Buzzbox 323.
  - objectives:
    1. item 6x Moonstalker Fang <- Moonstalker [npc 2069] L14-15 ~Darkshore 45,54 (49 spawns); Moonstalker Runt [npc 2070] L16-17 ~Darkshore 44,43 (60 spawns); Moonstalker Matriarch [npc 2071] L19-20 ~Darkshore 48,57 (12 spawns); Moonstalker Sire [npc 2237] L17-18 ~Darkshore 43,78 (22 spawns)

## 1141 The Family and the Fishing Pole  (L14 req10, 980 xp)
  - start: Gubber Blump [npc 10216] @ Darkshore 36.1,44.9
  - end:   Gubber Blump [npc 10216] @ Darkshore 36.1,44.9
  - text: Catch 6 Darkshore Grouper for Gubber Blump in Auberdine.
  - objectives:
    1. item 6x Darkshore Grouper <- ?

## 2118 Plagued Lands  (L14 req10, 980 xp)
  - start: Tharnariun Treetender [npc 3701] @ Darkshore 38.8,43.4
  - end:   Tharnariun Treetender [npc 3701] @ Darkshore 38.8,43.4
  - next=2138
  - text: Capture a living Rabid Thistle Bear and bring it back to Tharnariun.
  - text: Should you fail to capture a Rabid Thistle Bear and lose your trap, return to Tharnariun Treetender and request another trap.
  - objectives:
    1. kill 1x Rabid Thistle Bear <- Rabid Thistle Bear [npc 2164] L13-14 ~Darkshore 44,49 (101 spawns)

## 4681 Washed Ashore  (L14 req11, 980 xp)
  - start: Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[3524]
  - text: Recover the Sea Turtle Remains from the Skeletal Sea Turtle in the waters west of Auberdine, and then speak with Gwennyth Bly'Leggonde back in Auberdine.
  - objectives:
    1. item 1x Sea Turtle Remains <- Skeletal Sea Turtle [object 176189] ~Darkshore 32,46 (1 spawns)

## 4728 Beached Sea Creature  (L14 req12, 490 xp)
  - start: Beached Sea Creature [object 175226] @ Darkshore 36.0,70.9
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Creature Bones to Gwennyth Bly'Leggonde in Auberdine.

## 4811 The Red Crystal  (L14 req12, 490 xp)
  - start: Sentinel Glynda Nal'Shea [npc 2930] @ Darkshore 37.7,43.4
  - end:   Sentinel Glynda Nal'Shea [npc 2930] @ Darkshore 37.7,43.4
  - next=4812
  - text: Travel east of Auberdine and look for a large, red crystal along Darkshore's eastern mountain range. Report back what you find to Sentinel Glynda Nal'Shea in Auberdine.
  - objectives:
    1. object 1x Mysterious Red Crystal <- Mysterious Red Crystal [object 175524] ~Darkshore 47,49 (1 spawns)

## 4812 As Water Cascades  (L14 req12, 490 xp)
  - start: Sentinel Glynda Nal'Shea [npc 2930] @ Darkshore 37.7,43.4
  - end:   Mysterious Red Crystal [object 175524] @ Darkshore 47.3,48.7
  - pre(any)=[4811], next=4813
  - text: Fill the Empty Water Tube at the Auberdine moonwell, and then investigate the red crystal along Darkshore's eastern mountain wall.
  - objectives:
    1. item 1x Moonwell Water Tube <- Auberdine Moonwell [object 174795] ~Darkshore 38,44 (1 spawns)

## 4813 The Fragments Within  (L14 req12, 980 xp)
  - start: Mysterious Red Crystal [object 175524] @ Darkshore 47.3,48.7
  - end:   Sentinel Glynda Nal'Shea [npc 2930] @ Darkshore 37.7,43.4
  - pre(any)=[4812]
  - text: Report back what you have found to Sentinel Glynda Nal'Shea in Auberdine.

## 6123 Gathering the Cure  (L14 req14, 740 xp, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Alanndarian Nightsong [npc 3702] @ Darkshore 37.7,40.7
  - end:   Alanndarian Nightsong [npc 3702] @ Darkshore 37.7,40.7
  - pre(any)=[6122], next=6124
  - text: Bring 5 Earthroot and 12 Lunar Funguses to Alanndarian Nightsong in Auberdine so she may make a curative salve.
  - objectives:
    1. item 5x Earthroot <- Lasher Sproutling [npc 275703] L6-7 ~Teldrassil 57,69 (176 spawns); Wrathvine [npc 276099] L8-8 ~Teldrassil 56,70 (33 spawns); Earthroot [object 1619] ~Darkshore 43,67 (22 spawns); Earthroot [object 3726] ~The Barrens 50,35 (20 spawns)
    2. item 1x Lunar Fungus <- Lunar Fungal Bloom [object 177750] ~Darkshore 44,49 (20 spawns)

## 6124 Curing the Sick  (L14 req14, 740 xp, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Alanndarian Nightsong [npc 3702] @ Darkshore 37.7,40.7
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - pre(any)=[6123], next=6125
  - text: Use the Curative Animal Salve on 10 Sickly Deer that are located throughout Darkshore; doing so should cure them. Sickly Deer have been reported starting south of the Cliffspring River to the north of Auberdine and extending all the way into southern Darkshore where the edge of Ashenvale begins.
  - objectives:
    1. kill 10x Sickly Deer <- Sickly Deer [npc 12298] L5-5 ~Darkshore 43,53 (59 spawns)

## 4725 Beached Sea Turtle  (L15 req12, 540 xp)
  - start: Beached Sea Turtle [object 176197] @ Darkshore 44.2,20.6
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Strangely Marked Box to Gwennyth Bly'Leggonde in Auberdine.

## 4727 Beached Sea Turtle  (L15 req12, 540 xp)
  - start: Beached Sea Turtle [object 176196] @ Darkshore 53.1,18.1
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Turtle Remains to Gwennyth Bly'Leggonde in Auberdine.

## 4761 Thundris Windweaver  (L15 req11, 105 xp)
  - start: Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - pre(any)=[984], next=4762
  - text: Speak with Thundris Windweaver in Auberdine.

## 4762 The Cliffspring River  (L15 req11, 800 xp)
  - start: Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - pre(any)=[4761], next=4763
  - text: Travel north of Auberdine to the first waterfall along the Cliffspring River and draw a sample from the pool there.
  - text: Return to Thundris Windweaver in Auberdine with the Cliffspring River Sample.
  - objectives:
    1. item 1x Cliffspring River Sample <- Cliffspring River Waterfall [object 175371] ~Darkshore 51,26 (1 spawns)

## 5713 One Shot.  One Kill.  (L15 req10, 1050 xp)
  - start: Sentinel Aynasha [npc 11711] @ Darkshore 45.9,90.3
  - end:   Sentinel Onaeya [npc 11806] @ Ashenvale 26.6,36.7
  - text: Protect Sentinel Aynasha, then speak with Onaeya at Maestra's Post in Ashenvale.

## 963 For Love Eternal  (L16 req11, 880 xp)
  - start: Cerellean Whiteclaw [npc 3644] @ Darkshore 35.7,43.7
  - end:   Cerellean Whiteclaw [npc 3644] @ Darkshore 35.7,43.7
  - text: Free the spirit of Anaya Dawnrunner and bring her pendant back to Cerellean Whiteclaw in Auberdine.
  - objectives:
    1. item 1x Anaya's Pendant <- Anaya Dawnrunner [npc 3667] L16-16 ~Darkshore 42,61 (1 spawns)

## 1003 Buzzbox 525  (L16 req7, 1150 xp)
  - start: Buzzbox 323 [object 17184] @ Darkshore 51.3,24.6
  - end:   Buzzbox 525 [object 17185] @ Darkshore 41.4,80.6
  - pre(any)=[1002]
  - text: Collect 4 Grizzled Scalps from Grizzled Thistle Bears to the south of Auberdine and place them in Buzzbox 525.
  - objectives:
    1. item 4x Grizzled Scalp <- Grizzled Thistle Bear [npc 2165] L16-17 ~Darkshore 40,80 (19 spawns); Den Mother [npc 6788] L18-19 ~Darkshore 51,38 (1 spawns)

## 2138 Cleansing of the Infected  (L16 req10, 1150 xp)
  - start: Tharnariun Treetender [npc 3701] @ Darkshore 38.8,43.4
  - end:   Tharnariun Treetender [npc 3701] @ Darkshore 38.8,43.4
  - pre(any)=[2118], next=2139
  - text: Cleanse the forest of 20 Rabid Thistle Bears and return to Tharnariun Treetender in Darkshore.
  - objectives:
    1. kill 20x Rabid Thistle Bear <- Rabid Thistle Bear [npc 2164] L13-14 ~Darkshore 44,49 (101 spawns)

## 4730 Beached Sea Creature  (L16 req12, 580 xp)
  - start: Beached Sea Creature [object 175227] @ Darkshore 32.7,80.8
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Creature Bones to Gwennyth Bly'Leggonde in Auberdine.

## 944 The Master's Glaive  (L17 req12, 630 xp)
  - start: Onu [npc 3616] @ Darkshore 43.5,76.3
  - end:   Scrying Bowl [object 10076] @ Darkshore 38.6,86.2
  - pre(any)=[948], next=949
  - text: Gather information, then use the Phial of Scrying to create a Scrying Bowl. Use the bowl to speak with Onu.

## 947 Cave Mushrooms  (L17 req12, 1250 xp)
  - start: Barithras Moonshade [npc 3583] @ Darkshore 37.3,43.6
  - end:   Barithras Moonshade [npc 3583] @ Darkshore 37.3,43.6
  - next=948
  - text: Bring 5 Scaber Stalks and 1 Death Cap to Barithras Moonshade in Auberdine.
  - objectives:
    1. item 5x Scaber Stalk <- Scaber Stalk [object 11714] ~Darkshore 56,35 (15 spawns)
    2. item 1x Death Cap <- Death Cap [object 11713] ~Darkshore 56,36 (6 spawns)

## 948 Onu  (L17 req12, 630 xp)
  - start: Barithras Moonshade [npc 3583] @ Darkshore 37.3,43.6
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - pre(any)=[947], next=944
  - text: Speak with Onu at the Grove of the Ancients.

## 949 The Twilight Camp  (L17 req12, 1250 xp)
  - start: Scrying Bowl [object 10076] @ Darkshore 38.6,86.2
  - end:   Twilight Tome [object 12666] @ Darkshore 38.5,86.0
  - pre(any)=[944], next=950
  - text: Find a clue in the Twilight's Hammer camp at the Master's Glaive.

## 950 Return to Onu  (L17 req12, 950 xp)
  - start: Twilight Tome [object 12666] @ Darkshore 38.5,86.0
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - pre(any)=[949], next=951
  - text: Bring Onu the recovered Insane Scribbles.

## 952 Grove of the Ancients  (L17 req6, 1250 xp)
  - start: Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - pre(any)=[940]
  - text: Deliver Fandral's message to Onu in the Grove of the Ancients in Darkshore, south of Auberdine.

## 982 Deep Ocean, Vast Sea  (L17 req13, 1250 xp)
  - start: Gorbold Steelhand [npc 6301] @ Darkshore 38.1,41.2
  - end:   Gorbold Steelhand [npc 6301] @ Darkshore 38.1,41.2
  - text: Recover the Silver Dawning's Lockbox and the Mist Veil's Lockbox for Gorbold Steelhand in Auberdine. Both items should be found aboard the wreckage of the ships to the north of the village.
  - objectives:
    1. item 1x Silver Dawning's Lockbox <- Silver Dawning's Lockbox [object 175165] ~Darkshore 38,29 (1 spawns)
    2. item 1x Mist Veil's Lockbox <- Mist Veil's Lockbox [object 175166] ~Darkshore 40,27 (1 spawns)

## 1138 Fruit of the Sea  (L17 req15, 1250 xp)
  - start: Gubber Blump [npc 10216] @ Darkshore 36.1,44.9
  - end:   Gubber Blump [npc 10216] @ Darkshore 36.1,44.9
  - text: Collect 6 Fine Crab Chunks for Gubber Blump in Auberdine.
  - objectives:
    1. item 6x Fine Crab Chunks <- Encrusted Tide Crawler [npc 2233] L18-20 ~Darkshore 46,41 (15 spawns); Reef Crawler [npc 2235] L15-17 ~Darkshore 43,39 (18 spawns)

## 97894 Business in Auberdine  (L17 req13, 630 xp, F)
  - start: Borgus Steelhand [npc 7232] @ Stormwind City 59.4,34.3
  - end:   Gorbold Steelhand [npc 6301] @ Darkshore 38.1,41.2
  - next=982, breadcrumbFor=982
  - text: Check on Gorbold Steelhand in Auberdine in Darkshore.
  - text: Borgus mentioned a boat on the southern-most dock in Stormwind Harbor that can take you there.

## 97926 Making Do  (L17 req13, 630 xp, F)
  - start: Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - pre(any)=[97914]
  - text: Bring Alexston's Reply to Thundris Windweaver in Auberdine in Darkshore.

## 98042 It's All Fun and Games Until...  (L17 req12, 1250 xp, F)
  - start: Twilight Tome [object 12666] @ Darkshore 38.5,86.0
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - pre(any)=[949]
  - text: Obtain a Peerless Eye from a Twilight Disciple or Thug at the Master's Glaive in Darkshore and find someone in Auberdine who is willing to take it.
  - objectives:
    1. item 1x Peerless Eye <- Twilight Disciple [npc 2338] L16-17 ~Darkshore 39,87 (6 spawns); Twilight Thug [npc 2339] L17-18 ~Darkshore 43,74 (16 spawns)

## 945 Therylune's Escape  (L18 req10, 1350 xp)
  - start: Therylune [npc 3584] @ Darkshore 38.6,87.3
  - end:   Therysil [npc 3585] @ Ashenvale 22.6,51.9
  - text: Help Therylune escape, then tell Therysil at the Shrine of Aessina that her sister is safe.

## 965 The Tower of Althalaxx  (L18 req13, 680 xp)
  - start: Sentinel Elissa Starbreeze [npc 3657] @ Darkshore 39.0,43.5
  - end:   Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - next=966
  - text: Find Balthule Shadowstrike near the Tower of Althalaxx in Darkshore.

## 966 The Tower of Althalaxx  (L18 req13, 1350 xp)
  - start: Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - end:   Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - pre(any)=[965], next=967
  - text: Collect 4 Worn Parchments for Balthule Shadowstrike near the Tower of Althalaxx.
  - objectives:
    1. item 4x Worn Parchment <- Dark Strand Fanatic [npc 2336] L16-17 ~Darkshore 56,27 (26 spawns)

## 967 The Tower of Althalaxx  (L18 req13, 1000 xp)
  - start: Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[966], next=970
  - text: Deliver Balthule's letter to Delgren the Purifier in Ashenvale Forest.

## 968 The Powers Below  (L18 req10, 1700 xp)
  - start: item Book: The Powers Below [5352] (drops from Twilight Disciple, Twilight Thug)
  - end:   Gerrig Bonegrip [npc 2786] @ Ironforge 50.8,5.6
  - text: Bring the Book: The Powers Below to Gerrig Bonegrip in the Forlorn Cavern, Ironforge.

## 2139 Tharnariun's Hope  (L18 req10, 1350 xp)
  - start: Tharnariun Treetender [npc 3701] @ Darkshore 38.8,43.4
  - end:   Tharnariun Treetender [npc 3701] @ Darkshore 38.8,43.4
  - pre(any)=[2138]
  - text: Find and kill the Den Mother.
  - objectives:
    1. kill 1x Den Mother <- Den Mother [npc 6788] L18-19 ~Darkshore 51,38 (1 spawns)

## 4740 WANTED: Murkdeep!  (L18 req15, 1700 xp)
  - start: WANTED: Murkdeep! [object 175320] @ Darkshore 37.2,44.2
  - end:   Sentinel Glynda Nal'Shea [npc 2930] @ Darkshore 37.7,43.4
  - text: Find and slay the murloc known as Murkdeep. The creature is thought to be defending the murloc huts south of Auberdine along the water.
  - text: Report the death of Murkdeep to Sentinel Glynda Nal'Shea in Auberdine.
  - objectives:
    1. kill 1x Murkdeep <- Murkdeep [npc 10323] L19-19 ~Darkshore 36,77 (1 spawns)

## 4763 The Blackwood Corrupted  (L18 req15, 1700 xp)
  - start: Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - pre(any)=[4762]
  - text: Fill the Empty Cleansing Bowl at the Auberdine Moonwell.
  - text: Gather a sample of fruit, nut, and grain from the northern Blackwood furbolg camps.
  - text: Mix the bowl and place it near the bonfire closest to the Cliffspring River at the northern camp, thus summoning the satyr corruptor.
  - text: Take the Talisman of Corruption and bring it to Thundris Windweaver in Auberdine.
  - objectives:
    1. item 1x Talisman of Corruption <- Xabraxxis' Demon Bag [object 177624] ~Darkshore 52,33 (1 spawns)

## 4731 Beached Sea Turtle  (L19 req13, 730 xp)
  - start: Beached Sea Turtle [object 176198] @ Darkshore 31.7,83.7
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Strangely Marked Box to Gwennyth Bly'Leggonde in Auberdine.

## 4732 Beached Sea Turtle  (L19 req13, 730 xp)
  - start: Beached Sea Turtle [object 176191] @ Darkshore 31.2,85.6
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Turtle Remains to Gwennyth Bly'Leggonde in Auberdine.

## 4733 Beached Sea Creature  (L19 req13, 730 xp)
  - start: Beached Sea Creature [object 175230] @ Darkshore 31.3,87.4
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(any)=[4681]
  - text: Take the Sea Creature Bones to Gwennyth Bly'Leggonde in Auberdine.

## 729 The Absent Minded Prospector  (L20 req15, 1150 xp)
  - start: Archaeologist Hollee [npc 2913] @ Darkshore 37.4,41.8
  - end:   Prospector Remtravel [npc 2917] @ Darkshore 35.7,83.7
  - next=731
  - text: Travel south and check on Prospector Remtravel.

## 731 The Absent Minded Prospector  (L20 req15, 1950 xp)
  - start: Prospector Remtravel [npc 2917] @ Darkshore 35.7,83.7
  - end:   Archaeologist Hollee [npc 2913] @ Darkshore 37.4,41.8
  - pre(any)=[729], next=741
  - text: Protect Prospector Remtravel as he searches for the mysterious fossil, then return to Archaeologist Hollee in Auberdine.

## 741 The Absent Minded Prospector  (L20 req15, 1150 xp)
  - start: Archaeologist Hollee [npc 2913] @ Darkshore 37.4,41.8
  - end:   Chief Archaeologist Greywhisker [npc 2912] @ Darnassus 31.2,84.5
  - pre(any)=[731], next=942
  - text: Take the mysterious fossil to Chief Archaeologist Greywhisker in Darnassus.

## 942 The Absent Minded Prospector  (L20 req15, 1550 xp)
  - start: Chief Archaeologist Greywhisker [npc 2912] @ Darnassus 31.2,84.5
  - end:   Archaeologist Flagongut [npc 2911] @ Wetlands 10.8,60.4
  - pre(any)=[741], next=943
  - text: Take the mysterious fossil to Archaeologist Flagongut in Menethil Harbor.

## 951 Mathystra Relics  (L20 req12, 1950 xp)
  - start: Onu [npc 3616] @ Darkshore 43.5,76.3
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - pre(any)=[950]
  - text: Bring 6 Mathystra Relics to Onu at the Grove of the Ancients.
  - objectives:
    1. item 6x Mathystra Relic <- Mathystra Relic [object 12654] ~Darkshore 60,22 (5 spawns); Mathystra Relic [object 13360] ~Darkshore 58,22 (6 spawns); Mathystra Relic [object 13872] ~Darkshore 60,21 (9 spawns)

## 986 A Lost Master  (L20 req10, 1550 xp)
  - start: Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - end:   Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - pre(any)=[985], next=993
  - text: Find 5 Fine Moonstalker Pelts and return them to Terenthis in Auberdine.
  - objectives:
    1. item 5x Fine Moonstalker Pelt <- Moonstalker Matriarch [npc 2071] L19-20 ~Darkshore 48,57 (12 spawns); Moonstalker Sire [npc 2237] L17-18 ~Darkshore 43,78 (22 spawns)

## 993 A Lost Master  (L20 req10, 780 xp)
  - start: Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - end:   Volcor [npc 3692] @ Darkshore 45.0,85.3
  - pre(any)=[986]
  - text: Find Volcor in Darkshore and give him the Enchanted Moonstalker Cloak.

## 995 Escape Through Stealth  (L20 req10, 780 xp)
  - start: Volcor [npc 3692] @ Darkshore 45.0,85.3
  - end:   Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - pre(any)=[993], next=990, exclusiveTo=[994]
  - text: Escape the Furbolg cave and meet Terenthis in Auberdine.

## 2078 Gyromast's Revenge  (L20 req14, 1150 xp)
  - start: Gelkak Gyromast [npc 6667] @ Darkshore 56.7,13.5
  - end:   Gelkak Gyromast [npc 6667] @ Darkshore 56.7,13.5
  - pre(any)=[2098]
  - text: Find Gelkak's First Mate, the Threshwackonator 4100, and lead it back to Gelkak.
  - objectives:
    1. kill 1x The Threshwackonator 4100 <- The Threshwackonator 4100 [npc 6669] L20-20 ~Darkshore 56,18 (1 spawns)

## 2098 Gyromast's Retrieval  (L20 req14, 1550 xp)
  - start: Gelkak Gyromast [npc 6667] @ Darkshore 56.7,13.5
  - end:   Gelkak Gyromast [npc 6667] @ Darkshore 56.7,13.5
  - next=2078
  - text: Find and return the three pieces of Gelkak's Key to Gelkak Gyromast.
  - objectives:
    1. item 1x Top of Gelkak's Key <- Giant Foreststrider [npc 2323] L17-19 ~Darkshore 43,76 (61 spawns)
    2. item 1x Middle of Gelkak's Key <- Greymist Raider [npc 2201] L11-12 ~Darkshore 36,51 (1 spawns); Greymist Coastrunner [npc 2202] L12-13 ~Darkshore 39,38 (27 spawns); Greymist Seer [npc 2203] L13-14 ~Darkshore 39,39 (23 spawns); Greymist Netter [npc 2204] L14-15 ~Darkshore 39,51 (5 spawns)
    3. item 1x Bottom of Gelkak's Key <- Encrusted Tide Crawler [npc 2233] L18-20 ~Darkshore 46,41 (15 spawns); Raging Reef Crawler [npc 2236] L20-21 ~Darkshore 44,50 (24 spawns)

## 5321 The Sleeper Has Awakened  (L20 req17, 1550 xp)
  - start: Kerlonian Evershade [npc 11218] @ Darkshore 44.4,76.4
  - end:   Liladris Moonriver [npc 11219] @ Ashenvale 27.3,35.6
  - text: Escort Kerlonian Evershade to Liladris Moonriver at Maestra's Post in Ashenvale.

## 87760 Holy Diver  (L20 req15, 1550 xp, F)
  - start: Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - end:   Gwennyth Bly'Leggonde [npc 10219] @ Darkshore 36.6,45.6
  - pre(all)=[4722, 4723, 4725, 4727, 4728, 4730, 4731, 4732, 4733]
  - text: Find a Stormscale Beastmistress, slay her, and bring back her Rod of Deep Dominion.
  - objectives:
    1. item 1x Rod of Deep Dominion <- Stormscale Beastmistress [npc 271903] L19-20 ~Darkshore 50,13 (37 spawns)

## 98013 Swelling Forces  (L20 req12, 1550 xp, F)
  - start: Arbal [npc 270269] @ Darkshore 43.6,76.4
  - end:   Arbal [npc 270269] @ Darkshore 43.6,76.4
  - pre(any)=[950]
  - text: Eliminate 12 Stormscale Myrmidons, 8 Stormscale Sorceresses, and 6 Stormscale Warriors for Arbal at the Grove of the Ancients.
  - objectives:
    1. kill 12x Stormscale Myrmidon <- Stormscale Myrmidon [npc 2181] L18-19 ~Darkshore 59,21 (40 spawns)
    2. kill 12x Stormscale Sorceress <- Stormscale Sorceress [npc 2182] L19-20 ~Darkshore 60,21 (24 spawns)
    3. kill 12x Stormscale Warrior <- Stormscale Warrior [npc 2183] L20-21 ~Darkshore 61,20 (19 spawns)

## 970 The Tower of Althalaxx  (L21 req13, 1650 xp)
  - start: Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[967], next=973
  - text: Collect a Glowing Soul Gem and return it to Delgren the Purifier at Maestra's Post.
  - objectives:
    1. item 1x Glowing Soul Gem <- Dark Strand Cultist [npc 3725] L18-19 ~Ashenvale 31,31 (7 spawns); Dark Strand Enforcer [npc 3727] L20-21 ~Ashenvale 32,31 (1 spawns); Dark Strand Adept [npc 3728] L18-19 ~Ashenvale 32,30 (3 spawns); Dark Strand Excavator [npc 3730] L19-20 ~Ashenvale 32,31 (5 spawns)

## 98028 Baron Marinous  (L21 req17, 1650 xp, F)
  - start: item Clouded Water Globe [279275] (drops from Baron Marinous)
  - end:   Onu [npc 3616] @ Darkshore 43.5,76.3
  - text: Bring the Clouded Water Globe to Onu at the Grove of the Ancients in Darkshore.

## 994 Escape Through Force  (L22 req10, 1750 xp)
  - start: Volcor [npc 3692] @ Darkshore 45.0,85.3
  - end:   Terenthis [npc 3693] @ Darkshore 39.4,43.5
  - pre(any)=[993], next=990, exclusiveTo=[995]
  - text: Protect Volcor until you reach the road, then speak to Terenthis in Auberdine.

## 1442 Seeking the Kor Gem  (L22 req20, 870 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - end:   Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - text: Bring a Kor Gem to Thundris Windweaver in Darkshore.
  - objectives:
    1. item 1x Corrupted Kor Gem <- Blackfathom Tide Priestess [npc 4802] L20-21 ~Ashenvale 14,12 (1 spawns); Blackfathom Oracle [npc 4803] L21-22 ~Darkshore 32,93 (22 spawns); Blackfathom Sea Witch [npc 4805] L23-24; Fathom Dweller [npc 235325] LNone-None

## 943 The Absent Minded Prospector  (L24 req15, 2400 xp)
  - start: Archaeologist Flagongut [npc 2911] @ Wetlands 10.8,60.4
  - end:   Archaeologist Flagongut [npc 2911] @ Wetlands 10.8,60.4
  - pre(any)=[942]
  - text: Archaeologist Flagongut in Menethil Harbor wants you to bring him the Stone of Relu and Flagongut's Fossil.
  - objectives:
    1. item 1x Stone of Relu <- Mottled Raptor [npc 1020] L22-23 ~Wetlands 26,49 (27 spawns); Mottled Screecher [npc 1021] L24-25 ~Wetlands 26,51 (16 spawns); Mottled Scytheclaw [npc 1022] L25-26 ~Wetlands 34,48 (14 spawns); Mottled Razormaw [npc 1023] L26-27 ~Wetlands 34,48 (9 spawns)
    2. item 1x Flagongut's Fossil <- Flagongut's Fossil [object 9630] ~Wetlands 39,52 (1 spawns)

## 973 The Tower of Althalaxx  (L24 req13, 1950 xp)
  - start: Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[970], next=1140
  - text: Bring Ilkrud Magthrull's Tome to Delgren the Purifier at Maestra's Post.
  - objectives:
    1. item 1x Ilkrud Magthrull's Tome <- Ilkrud Magthrull [npc 3664] L24-24 ~Ashenvale 25,61 (1 spawns)

## 1140 The Tower of Althalaxx  (L28 req13, 2300 xp)
  - start: Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[973], next=1167
  - text: Free the trapped Highborne souls in Night Run and Satyrnaar, then return to Delgren the Purifier at Maestra's Post.
  - objectives:
    1. object 1x Circle of Imprisonment <- Circle of Imprisonment [object 19901] ~Ashenvale 67,57 (1 spawns)
    2. object 1x Circle of Imprisonment <- Circle of Imprisonment [object 20352] ~Ashenvale 82,49 (1 spawns)

## 1167 The Tower of Althalaxx  (L28 req13, 570 xp)
  - start: Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - end:   Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - pre(any)=[1140], next=1143
  - text: Speak with Balthule Shadowstrike near the Tower of Althalaxx.

## 78088 A Strange Artifact  (L30 req22, 2450 xp, F, class=Paladin, sort=PALADIN)
  - start: Strange Orb [object 409289] @ Darkshore 56.2,26.4
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - next=78089
  - text: Bring the Althalaxx Orb to Delgren the Purifier at Maestra's Post in Ashenvale.

## 981 The Tower of Althalaxx  (L31 req13, 2500 xp)
  - start: Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - end:   Delgren the Purifier [npc 3663] @ Ashenvale 26.2,38.7
  - pre(any)=[1143]
  - text: Talk to Delgren the Purifier at Maestra's Post.

## 1143 The Tower of Althalaxx  (L31 req13, 2500 xp)
  - start: Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - end:   Balthule Shadowstrike [npc 3661] @ Darkshore 55.0,24.9
  - pre(any)=[1167], next=981
  - text: Kill Athrikus Narassin and bring his head to Balthule Shadowstrike near the Tower of Althalaxx.
  - objectives:
    1. item 1x Athrikus Narassin's Head <- Athrikus Narassin [npc 3660] L31-31 ~Darkshore 56,26 (1 spawns); Galvinquam Leafsyre [npc 267109] L58-58 ~Mount Hyjal 33,54 (1 spawns)

## 8721 Starweave the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Starweave [npc 15601] @ Darkshore 36.8,46.8
  - end:   Elder Starweave [npc 15601] @ Darkshore 36.8,46.8

# Service NPCs

- Caylais Moonfeather <Hippogryph Master> [npc 3841] 36.3,45.6: flightMaster
- Dalmond <General Goods> [npc 4182] 37.5,40.5: vendor
- Naram Longclaw <Weaponsmith> [npc 4183] 37.6,40.4: repair, vendor
- Shaldyn <Clothier> [npc 4185] 38.2,40.4: vendor
- Mavralyn <Leather Armor & Leatherworking Supplies> [npc 4186] 37.0,41.2: repair, vendor
- Harlon Thornguard <Armorer & Shieldsmith> [npc 4187] 37.0,41.3: repair, vendor
- Valdaron <Tailoring Supplies> [npc 4189] 38.1,40.6: vendor
- Kyndri <Baker> [npc 4190] 36.9,44.6: vendor
- Allyndia <Food & Drink Vendor> [npc 4191] 37.1,43.6: vendor
- Taldan <Drink Vendor> [npc 4192] 36.8,43.9: vendor
- Grondal Moonbreeze <Journeyman Tailor> [npc 4193] 38.2,40.5: trainer
- Ullanna <Trade Supplies> [npc 4194] 43.8,76.4: vendor
- Tiyani <Food & Drink Vendor> [npc 4195] 43.7,76.6: vendor
- Laird <Fish Vendor> [npc 4200] 36.8,44.3: vendor
- Heldan Galesong <Fisherman> [npc 4307] 37.0,56.4: vendor
- Kurdram Stonehammer <Mining Trainer> [npc 6297] 38.2,41.0: trainer
- Thelgrum Stonehammer <Mining Supplier> [npc 6298] 38.2,41.2: vendor
- Delfrum Flintbeard <Journeyman Blacksmith> [npc 6299] 38.2,40.9: trainer
- Elisa Steelhand <Blacksmithing Supplies> [npc 6300] 38.1,41.1: repair, vendor
- Gorbold Steelhand <General Trade Supplier> [npc 6301] 38.1,41.2: vendor
- Spirit Healer <> [npc 6491] 43.5,92.4: spiritHealer
- Innkeeper Shaussiy <Innkeeper> [npc 6737] 37.0,44.1: innkeeper, vendor
- Jaelysia <Stable Master> [npc 10085] 37.4,44.3: stableMaster
- Gubber Blump <> [npc 10216] 36.1,44.9: vendor
- Jenna Lemkenilli <Journeyman Engineer> [npc 11037] 38.3,41.1: trainer
