# Darnassus: Alliance + neutral quests (59)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 7671 Frostsaber Replacement  (L1 req60, ? xp, repeatable)
  - start: Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - end:   Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - objectives:
    1. item 1x Reins of the Frostsaber <- ?

## 7672 Nightsaber Replacement  (L1 req60, ? xp, repeatable)
  - start: Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - end:   Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - objectives:
    1. item 1x Reins of the Nightsaber <- ?

## 1683 Vorlus Vilehoof  (L10 req10, 840 xp, class=Warrior, sort=WARRIOR)
  - start: Elanaria [npc 4088] @ Darnassus 57.3,34.6
  - end:   Elanaria [npc 4088] @ Darnassus 57.3,34.6
  - next=1686, exclusiveTo=[1639, 1678]
  - text: Bring the Horn of Vorlus to Elanaria in Darnassus.
  - objectives:
    1. item 1x Horn of Vorlus <- Vorlus Vilehoof [npc 6128] L10-10 ~Teldrassil 47,64 (1 spawns)

## 1686 The Shade of Elura  (L10 req10, 840 xp, class=Warrior, sort=WARRIOR)
  - start: Elanaria [npc 4088] @ Darnassus 57.3,34.6
  - end:   Elanaria [npc 4088] @ Darnassus 57.3,34.6
  - pre(any)=[1683, 1678, 1639], next=1692
  - text: Bring 8 loads of Elunite Ore and the Medallion of Elura to Elanaria in Darnassus.
  - objectives:
    1. item 1x Elunite Ore <- Crate of Elunite [object 86492] ~Darkshore 33,45 (28 spawns)
    2. item 1x Elura's Medallion <- Shade of Elura [npc 6133] L11-11 ~Darkshore 32,45 (1 spawns)

## 1692 Smith Mathiel  (L10 req10, 420 xp, class=Warrior, sort=WARRIOR)
  - start: Elanaria [npc 4088] @ Darnassus 57.3,34.6
  - end:   Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - pre(any)=[1686], next=1693
  - text: Bring the Case of Elunite to Smith Mathiel.

## 1693 Weapons of Elunite  (L10 req10, 630 xp, class=Warrior, sort=WARRIOR)
  - start: Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - end:   Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - pre(any)=[1692]

## 2242 Destiny Calls  (L10 req10, 840 xp, class=Rogue, sort=ROGUE)
  - start: Syurna [npc 4163] @ Darnassus 37.0,21.9
  - end:   Syurna [npc 4163] @ Darnassus 37.0,21.9
  - pre(any)=[2241]
  - text: Find Sethir the Ancient and bring back any clues that you may discover to Syurna.
  - objectives:
    1. item 1x Sethir's Journal <- Sethir the Ancient [npc 6909] L12-12 ~Teldrassil 37,23 (1 spawns)

## 2519 The Temple of the Moon  (L10 req5, 85 xp)
  - start: Sister Aquinne [npc 7316] @ Darnassus 28.9,45.8
  - end:   Priestess A'moora [npc 7313] @ Darnassus 36.6,85.9
  - next=2518, breadcrumbFor=2518
  - text: Sister Aquinne wants you to speak with Priestess A'moora in the Temple of the Moon.

## 5627 Stars of Elune  (L10 req10, ? xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - pre(any)=[5628, 5629, 5630, 5631, 5632, 5633], exclusiveTo=[5628, 5629, 5630, 5631, 5632, 5633]

## 5640 Desperate Prayer  (L10 req10, ? xp, F, races=Dwarf, class=Priest, sort=PRIEST)
  - start: Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5634, 5635, 5636, 5637, 5638, 5639]
  - text: Speak to High Priestess Laurena in Stormwind.

## 5921 Moonglade  (L10 req10, 210 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - next=5929
  - text: Use the spell "Teleport: Moonglade" to travel to Moonglade. When you arrive, speak with Dendrite Starblaze in the village of Nighthaven.

## 5923 Heeding the Call  (L10 req10, 85 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Denatharion [npc 4218] @ Darnassus 34.8,7.4
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - next=5921, breadcrumbFor=5921, exclusiveTo=[5924, 5925]
  - text: Speak with Mathrengyl Bearwalker in the Cenarion Enclave, Darnassus.

## 6001 Body and Heart  (L10 req10, 840 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[5931]
  - text: Use the Cenarion Moondust on the Moonkin Stone of Auberdine to bring forth Lunaclaw. From there, you must face Lunaclaw and earn the strength of body and heart it possesses.
  - text: Speak with Mathrengyl Bearwalker in Darnassus when you are done.
  - objectives:
    1. kill 1x Lunaclaw Spirit <- Lunaclaw Spirit [npc 12144] L13-13

## 6071 The Hunter's Path  (L10 req10, 85 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Jocaste [npc 4146] @ Darnassus 40.4,8.6
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - next=6063, breadcrumbFor=6063, exclusiveTo=[6072, 6073, 6721, 6722]
  - text: Speak with Dazalar in Dolanaar.

## 6344 Nessa Shadowsong  (L10 req10, 210 xp, races=NightElf)
  - start: Mydrannul [npc 4241] @ Darnassus 70.7,45.4
  - end:   Nessa Shadowsong [npc 10118] @ Teldrassil 56.3,92.4
  - next=6341, breadcrumbFor=6341
  - text: Speak with Nessa Shadowsong.

## 9262 Investigate the Scourge of Darnassus  (L10 req1, 630 xp, sort=INVASION)
  - start: Lieutenant Beitha [npc 16495] @ Darnassus 78.2,41.4
  - end:   Lieutenant Beitha [npc 16495] @ Darnassus 78.2,41.4
  - text: Collect three Dim Necrotic Stones from the Scourge outside Darnassus and investigate the glowing runic circles near their encampment.
  - objectives:
    1. item 1x Dim Necrotic Stone <- Skeletal Soldier [npc 16422] L6-7 ~Elwynn Forest 40,55 (51 spawns); Spectral Apparition [npc 16423] L6-7 ~Elwynn Forest 41,55 (48 spawns); Spectral Spirit [npc 16437] L9-10 ~Dun Morogh 42,39 (54 spawns); Skeletal Trooper [npc 16438] L9-10 ~Dun Morogh 43,38 (56 spawns)

## 98391 The Sisterhood of Elune  (L10 req5, 85 xp, F)
  - start: Laurna Morninglight [npc 3600] @ Teldrassil 55.6,56.8
  - end:   Sister Aquinne [npc 7316] @ Darnassus 28.9,45.8
  - next=2519, breadcrumbFor=2519, exclusiveTo=[2518]
  - text: Speak to Sister Aquinne in Darnassus.

## 98067 Eyes of the Sentinels  (L11 req1, 660 xp, F)
  - start: Sentinel Dalia Sunblade [npc 8396] @ Darnassus 39.6,89.5
  - end:   Sentinel Dalia Sunblade [npc 8396] @ Darnassus 39.6,89.5
  - text: Place Sentinel Owls at the entrance to the Cenarion Hold depths, the Darnassus Bank, the Craftsman's Terrace Inn, and the City Gate for Sentinel Dalia Sunblade in the Temple of the Moon in Darnassus.
  - objectives:
    1. kill 1x Credit <- Credit [npc 270418] L60-60 ~Darnassus 33,17 (1 spawns)
    2. kill 1x Credit <- Credit [npc 270419] L60-60 ~Darnassus 41,44 (1 spawns)
    3. kill 1x Credit <- Credit [npc 270420] L60-60 ~Darnassus 66,15 (1 spawns)
    4. kill 1x Credit <- Credit [npc 270421] L60-60 ~Darnassus 89,35 (1 spawns)

## 2518 Tears of the Moon  (L12 req5, 1150 xp)
  - start: Priestess A'moora [npc 7313] @ Darnassus 36.6,85.9
  - end:   Priestess A'moora [npc 7313] @ Darnassus 36.6,85.9
  - next=2520
  - text: Priestess A'moora in the Temple of the Moon at Darnassus wants you to bring her Lady Sathrah's Silvery Spinnerets.
  - objectives:
    1. item 1x Silvery Spinnerets <- Lady Sathrah [npc 7319] L12-12 ~Teldrassil 43,25 (13 spawns)

## 2520 Sathrah's Sacrifice  (L12 req5, 910 xp)
  - start: Priestess A'moora [npc 7313] @ Darnassus 36.6,85.9
  - end:   Priestess A'moora [npc 7313] @ Darnassus 36.6,85.9
  - pre(any)=[2518]
  - text: Priestess A'moora wants you to place Lady Sathrah's silvery spinnerets at the fountain inside the temple, and then return to her.
  - objectives:
    1. object 1x Temple of the Moon Fountain <- Temple of the Moon Fountain [object 138498] ~Darnassus 39,86 (1 spawns)

## 730 Trouble In Darkshore?  (L14 req14, 490 xp)
  - start: Chief Archaeologist Greywhisker [npc 2912] @ Darnassus 31.2,84.5
  - end:   Archaeologist Hollee [npc 2913] @ Darkshore 37.4,41.8
  - next=729, breadcrumbFor=729
  - text: Travel to Auberdine and look for signs of the dwarven excavation team.

## 6121 Lessons Anew  (L14 req14, 100 xp, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4; Alfina Nightgaze [npc 270459] @ Alterac Mountains 11.8,56.6
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - next=6122
  - text: Travel to Moonglade and speak with Dendrite Starblaze in the village of Nighthaven.

## 26 A Lesson to Learn  (L16 req16, 115 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - next=29
  - text: Speak with Dendrite Starblaze in the village of Nighthaven, Moonglade.

## 2260 Erion's Behest  (L16 req16, 580 xp, class=Rogue, sort=ROGUE)
  - start: Erion Shadewhisper [npc 4214] @ Darnassus 34.5,25.9
  - end:   Renzik "The Shiv" [npc 6946] @ Stormwind City 78.3,71.1
  - text: Travel to Stormwind City and seek council with Renzik "The Shiv."

## 1582 Moonglow Vest  (L18 req8, 1350 xp, sort=LEATHERWORKING)
  - start: Lotherias [npc 6034] @ Darnassus 64.4,22.2
  - end:   Lotherias [npc 6034] @ Darnassus 64.4,22.2
  - text: Bring 1 Embossed Leather Gloves, 5 Embossed Leather Boots and 5 Embossed Leather Cloaks to Lotherias in Darnassus.
  - objectives:
    1. item 1x Embossed Leather Gloves <- ?
    2. item 1x Embossed Leather Boots <- ?
    3. item 1x Embossed Leather Cloak <- ?

## 5647 A Lack of Fear  (L20 req20, 390 xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - end:   High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - exclusiveTo=[5641, 5645]
  - text: Speak to High Priest Rohan in Ironforge.

## 5672 Elune's Grace  (L20 req20, ? xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5673, 5674, 5675]

## 5678 Arcane Feedback  (L20 req20, 390 xp, F, races=Human, class=Priest, sort=PRIEST)
  - start: Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5676, 5677]
  - text: Speak to High Priestess Laurena in Stormwind.

## 94820 Contingency Plan  (L20 req20, 390 xp, F, races=Gnome, class=Priest, sort=PRIEST)
  - start: Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - end:   High Priestess Mims [npc 258785] @ Dun Morogh 55.0,22.4 (+1 spawns)
  - exclusiveTo=[94818, 94819]
  - text: Speak to High Priestess Mims in Ironforge.

## 98393 The Great Cat Spirit  (L20 req20, 390 xp, F, races=NightElf/Skyborne, class=Druid, sort=DRUID)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - next=98394, exclusiveTo=[98340]
  - text: Speak with Dendrite Starblaze in the village of Nighthaven, Moonglade.

## 1710 Sunscorched Shells  (L30 req20, 1850 xp, class=Warrior, sort=WARRIOR)
  - start: Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - end:   Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - pre(any)=[1782], next=1711
  - text: Bring 20 Sunscorched Shells to Mathiel in Darnassus.
  - objectives:
    1. item 20x Sunscorched Shell <- Sunscorched Shell [object 89635] ~Thousand Needles 12,37 (9 spawns)

## 1711 Mathiel's Armor  (L30 req20, 3050 xp, class=Warrior, sort=WARRIOR)
  - start: Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - end:   Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - pre(any)=[1710]

## 95511 Your First Feline Friend  (L40 req40, 1550 xp, F, races=NightElf)
  - start: Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - end:   Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - pre(any)=[97074], exclusiveTo=[96982, 96989, 96994, 96996, 96997, 97017, 97045, 97046, 97171, 97446, 98166, 99326]
  - text: Inspect the riding sabers to choose your first mount.

## 97074 Learning to Ride  (L40 req40, ? xp, F, races=NightElf)
  - start: Jartsam [npc 4753] @ Darnassus 38.7,15.8
  - end:   Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - exclusiveTo=[97018, 97170, 97188, 97194, 97200, 97203, 97204, 97205]
  - text: Learn the Apprentice Riding skill from Jartsam.

## 3763 Assisting Arch Druid Staghelm  (L50 req47, 470 xp)
  - start: Innkeeper Saelienne [npc 6735] @ Darnassus 67.4,15.7
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - next=3764, breadcrumbFor=3764, exclusiveTo=[3789, 3790]
  - text: Speak with Arch Druid Fandral Staghelm in Darnassus.

## 3764 Un'Goro Soil  (L50 req47, 4700 xp)
  - start: Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - end:   Jenal [npc 9047] @ Darnassus 31.5,8.2
  - next=3781
  - text: Bring 20 Un'Goro Soil samples to Jenal at the Cenarion Enclave in Darnassus.
  - objectives:
    1. item 20x Un'Goro Soil <- Un'Goro Dirt Pile [object 157936] ~Un'Goro Crater 47,54 (49 spawns)

## 3781 Morrowgrain Research  (L50 req47, 470 xp)
  - start: Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[3764], next=3785
  - text: Take the Arch Druid's Seed Voucher to Mathrengyl Bearwalker in the Cenarion Enclave of Darnassus.

## 3785 Morrowgrain Research  (L50 req47, 4700 xp)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[3781], next=3803
  - text: Use an Evergreen Pouch with a Packet of Tharlendis Seeds and two Un'Goro Soil samples to try and cultivate samples of Morrowgrain.
  - text: Bring 10 Morrowgrain to Mathrengyl Bearwalker in Darnassus.
  - objectives:
    1. item 10x Morrowgrain <- ?

## 5091 A Call to Arms: The Plaguelands!  (L50 req50, 470 xp)
  - start: Herald Moonstalker [npc 10878] @ Darnassus 47.8,82.0
  - end:   Commander Ashlam Valorfist [npc 10838] @ Western Plaguelands 42.7,84.0
  - next=5092, breadcrumbFor=5092, exclusiveTo=[5066, 5090]
  - text: Seek out Commander Ashlam Valorfist. His base camp is located at Chillwind Camp, north of the Alterac Mountains.

## 4493 March of the Silithid  (L53 req50, 530 xp)
  - start: Gracina Spiritmight [npc 7740] @ Darnassus 41.8,85.6
  - end:   Alchemist Pestlezugg [npc 5594] @ Tanaris 50.9,27.0
  - pre(any)=[162], next=4496
  - text: Speak to Alchemist Pestlezugg in Gadgetzan.

## 4510 Calm Before the Storm  (L54 req50, 8150 xp)
  - start: Gracina Spiritmight [npc 7740] @ Darnassus 41.8,85.6
  - end:   Idriana [npc 4155] @ Darnassus 39.4,42.4
  - pre(any)=[4508]
  - text: Bring the Bank Voucher to Idriana in the bank of Darnassus.

## 1047 The New Frontier  (L55 req54, 560 xp)
  - start: Herald Moonstalker [npc 10878] @ Darnassus 47.8,82.0
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - next=6761, exclusiveTo=[1015, 1019]
  - text: Speak with Arch Druid Fandral Staghelm at the Cenarion Enclave of Darnassus about the Cenarion Circle's call to explore the frontiers of Kalimdor.

## 3803 Morrowgrain to Darnassus  (L55 req47, 4200 xp, repeatable)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[3785]
  - objectives:
    1. item 1x Morrowgrain <- ?

## 6761 The New Frontier  (L55 req54, 560 xp)
  - start: Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[1015, 1019, 1047], next=6762
  - text: Speak with Mathrengyl Bearwalker at the Cenarion Enclave of Darnassus.

## 6762 Rabine Saturna  (L55 req54, 1400 xp)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Rabine Saturna [npc 11801] @ Moonglade 51.7,45.1
  - pre(any)=[6761], next=1124
  - text: Speak with Rabine Saturna in the village of Nighthaven, Moonglade. Moonglade lies between Felwood and Winterspring, accessible through a path out of Timbermaw Hold.

## 92344 Get to the Roots of It  (L55 req45, ? xp, F)
  - start: Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - pre(any)=[92345, 92346]
  - text: Gather 10 Nordrassil Root Caps inside Blackmaw Hold for Mathrengyl Bearwalker in Darnassus.
  - objectives:
    1. item 10x Nordrassil Root Cap <- object 571511 [object 571511]

## 7792 A Donation of Wool  (L60 req12, 660 xp)
  - start: Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - end:   Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - objectives:
    1. item 1x Wool Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns)

## 7798 A Donation of Silk  (L60 req26, 1650 xp)
  - start: Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - end:   Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - objectives:
    1. item 1x Silk Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns)

## 7799 A Donation of Mageweave  (L60 req40, 3300 xp)
  - start: Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - end:   Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - objectives:
    1. item 1x Mageweave Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Solid Chest [object 2855] ~Hillsbrad Foothills 51,41 (52 spawns); Solid Chest [object 2857] ~Dustwallow Marsh 43,43 (90 spawns); Solid Chest [object 4149] ~Dustwallow Marsh 48,57 (105 spawns)

## 7800 A Donation of Runecloth  (L60 req50, 6600 xp)
  - start: Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - end:   Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - pre(all)=[7792, 7798, 7799], next=7801
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 7801 Additional Runecloth  (L60 req50, ? xp, repeatable)
  - start: Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - end:   Raedon Duskstriker [npc 14725] @ Darnassus 64.0,23.0
  - pre(any)=[7800]
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 8357 Dancing for Marzipan  (L60 req10, ? xp, sort=SEASONAL, repeatable)
  - start: Innkeeper Saelienne [npc 6735] @ Darnassus 67.4,15.7
  - end:   Innkeeper Saelienne [npc 6735] @ Darnassus 67.4,15.7
  - text: Do a dance emote at Innkeeper Saelienne, and in exchange you'll receive Darnassus Marzipan!
  - objectives:
    1. kill 1x Innkeeper Saelienne <- Innkeeper Saelienne [npc 6735] L30-30 ~Darnassus 67,16 (1 spawns)

## 8718 Bladeswift the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Bladeswift [npc 15598] @ Darnassus 33.5,14.3
  - end:   Elder Bladeswift [npc 15598] @ Darnassus 33.5,14.3

## 8797 The Alliance Needs Your Help!  (L60 req1, 9950 xp, sort=AHN_QIRAJ_WAR)
  - start: Master Sergeant Moonshadow [npc 15709] @ Darnassus 39.1,38.3
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - exclusiveTo=[8795, 8796]
  - text: Speak with Field Marshal Snowfall in Ironforge's Military Ward.

## 8836 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - end:   Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - pre(any)=[8813]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8837 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - end:   Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - pre(any)=[8821]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8899 Dearest Colara,  (L60 req1, ? xp, sort=SEASONAL)
  - start: Aldris Fourclouds [npc 16001] @ Darnassus 42.0,42.3
  - end:   Colara Dean [npc 16002] @ Stormwind City 61.7,75.5
  - next=8903, breadcrumbFor=8903, exclusiveTo=[8897, 8898]
  - text: Deliver the Immaculate Letter to Colara Dean outside the bank in Stormwind.

## 99205 Swift as the Wind  (L60 req60, ? xp, F, races=NightElf)
  - start: Jartsam [npc 4753] @ Darnassus 38.7,15.8
  - end:   Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - text: Learn the Journeyman Riding skill from Jartsam.

## 99214 An Epic Ride  (L60 req60, ? xp, F)
  - start: Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - end:   Lelanai [npc 4730] @ Darnassus 38.3,15.4
  - text: Inspect the armored riding sabers to choose your epic mount.
  - objectives:
    1. kill 1x Swift Stormsaber <- Swift Stormsaber [npc 276730] L1-2 ~Darnassus 38,16 (1 spawns)
    2. kill 1x Swift Mistsaber <- Swift Mistsaber [npc 276731] L1-2 ~Darnassus 38,16 (1 spawns)
    3. kill 1x Swift Frostsaber <- Swift Frostsaber [npc 276732] L1-2 ~Darnassus 38,16 (1 spawns)

# Service NPCs

- Keras Wolfheart <Arathi Basin Battlemaster> [npc 907] 58.0,37.3: battlemaster
- Aethalas <Warsong Gulch Battlemaster> [npc 2302] 59.0,36.9: battlemaster
- Faelyssa <> [npc 2796] 32.5,21.3: trainer
- Kyrai <Poison Vendor> [npc 3561] 32.5,19.7: vendor
- Alaindia <Reagent Vendor> [npc 3562] 39.0,74.2: vendor
- Arias'ta Bladesinger <Warrior Trainer> [npc 4087] 58.7,34.9: trainer
- Sildanair <Warrior Trainer> [npc 4089] 61.8,42.2: trainer
- Astarii Starseeker <Priest Trainer> [npc 4090] 38.3,81.0: trainer
- Jandria <Priest Trainer> [npc 4091] 37.9,82.7: trainer
- Lariia <Priest Trainer> [npc 4092] 40.4,88.7: trainer
- Jeen'ra Nightrunner <Hunter Trainer> [npc 4138] 39.7,5.4: trainer
- Jocaste <Hunter Trainer> [npc 4146] 40.4,8.6: trainer
- Idriana <Banker> [npc 4155] 39.4,42.4: banker
- Astaia <Fishing Trainer> [npc 4156] 47.9,56.6: trainer
- Me'lynn <Expert Tailor> [npc 4159] 63.4,22.4: trainer
- Ainethil <Artisan Alchemist> [npc 4160] 54.9,24.0: trainer
- Lysheana <Guild Master> [npc 4161] 69.8,23.0: petitioner, tabardDesigner
- Syurna <Rogue Trainer> [npc 4163] 37.0,21.9: trainer
- Cylania <Night Elf Armorer> [npc 4164] 59.2,46.4: repair, vendor
- Elissa Dumas <Portal Trainer> [npc 4165] 40.6,82.1: trainer
- Dendrythis <Food & Drink Vendor> [npc 4167] 33.6,15.9: vendor
- Elynna <Tailoring Supplies> [npc 4168] 64.6,21.6: vendor
- Jaeana <Meat Vendor> [npc 4169] 64.5,71.7: vendor
- Ellandrieth <General Goods Vendor> [npc 4170] 64.7,53.0: vendor
- Merelyssa <Blade Merchant> [npc 4171] 65.4,59.7: vendor
- Anadyia <Robe Vendor> [npc 4172] 55.7,90.0: vendor
- Landria <Bow Merchant> [npc 4173] 63.3,66.3: repair, vendor
- Vinasia <Cloth Armor Merchant> [npc 4175] 60.7,72.5: vendor
- Melea <Mail Armor Merchant> [npc 4177] 57.1,77.0: vendor
- Ealyshia Dewwhisper <Two Handed Weapon Merchant> [npc 4180] 60.6,72.1: vendor
- Fyrenna <Food & Drink Vendor> [npc 4181] 69.3,45.0: vendor
- Ariyell Skyshadow <Weapon Merchant> [npc 4203] 58.8,44.5: repair, vendor
- Firodren Mooncaller <Herbalism Trainer> [npc 4204] 48.0,68.0: trainer
- Dorion <Hunter Trainer> [npc 4205] 42.2,7.3: trainer
- Lairn <Banker> [npc 4208] 39.7,41.5: banker
- Garryeth <Banker> [npc 4209] 39.6,42.0: banker
- Alegorn <Cooking Trainer> [npc 4210] 49.0,21.2: trainer
- Dannelor <First Aid Trainer> [npc 4211] 51.7,12.2: trainer
- Telonis <Artisan Leatherworker> [npc 4212] 64.4,21.5: trainer
- Taladan <Expert Enchanter> [npc 4213] 58.4,13.1: trainer
- Erion Shadewhisper <Rogue Trainer> [npc 4214] 34.5,25.9: trainer
- Anishar <Rogue Trainer> [npc 4215] 37.9,20.9: trainer
- Chardryn <Herbalism Supplier> [npc 4216] 48.5,69.0: vendor
- Mathrengyl Bearwalker <Druid Trainer> [npc 4217] 35.4,8.4: trainer, vendor
- Denatharion <Druid Trainer> [npc 4218] 34.8,7.4: trainer
- Fylerian Nightwing <Druid Trainer> [npc 4219] 33.5,8.3: trainer
- Cyroen <Reagent Vendor> [npc 4220] 33.9,9.5: vendor
- Talaelar <Fish Vendor> [npc 4221] 47.5,57.5: vendor
- Voloren <Fishing Supplier> [npc 4222] 46.9,57.0: vendor
- Fyldan <Cooking Supplier> [npc 4223] 48.5,21.6: vendor
- Saenorion <Leatherworking Supplies> [npc 4225] 63.7,22.3: vendor
- Ulthir <Alchemy Supplies> [npc 4226] 55.8,24.5: vendor
- Vaean <Enchanting Supplies> [npc 4228] 58.6,14.7: vendor
- Mythrin'dir <General Trade Supplier> [npc 4229] 61.0,17.7: vendor
- Yldan <Bag Merchant> [npc 4230] 65.3,53.0: vendor
- Kieran <Weapon Merchant> [npc 4231] 65.0,60.2: repair, vendor
- Glorandiir <Axe Merchant> [npc 4232] 64.2,59.1: vendor
- Mythidan <Mace & Staff Merchant> [npc 4233] 65.2,60.7: vendor
- Andrus <Staff Merchant> [npc 4234] 56.1,88.9: vendor
- Turian <Thrown Weapons Merchant> [npc 4235] 62.7,65.6: vendor
- Cyridan <Leather Armor Merchant> [npc 4236] 52.9,80.5: vendor
- Caynrus <Shield Merchant> [npc 4240] 56.9,76.3: repair, vendor
- Mydrannul <General Goods Vendor> [npc 4241] 70.7,45.4: vendor
- Lelanai <Saber Handler> [npc 4730] 38.3,15.4: vendor
- Jartsam <Nightsaber Riding Instructor> [npc 4753] 38.7,15.8: trainer
- Brogun Stoneshield <Alterac Valley Battlemaster> [npc 5118] 58.1,44.6: battlemaster
- Shalumon <Tabard Vendor> [npc 5191] 70.4,23.4: tabardDesigner, vendor
- Eladriel <Skinning Trainer> [npc 6292] 64.1,22.3: trainer
- Spirit Healer <> [npc 6491] 77.7,25.9: spiritHealer
- Innkeeper Saelienne <Innkeeper> [npc 6735] 67.4,15.7: innkeeper, vendor
- Darnath Bladesinger <Warrior Trainer> [npc 7315] 58.9,35.4: trainer
- Shylenai <Owl Trainer> [npc 8665] 69.6,45.9: vendor
- Auctioneer Tolon <> [npc 8669] 56.4,51.8: auctioneer
- Auctioneer Golothas <> [npc 8723] 56.2,54.0: auctioneer
- Alassin <Stable Master> [npc 10056] 39.3,10.1: stableMaster
- Silvaria <Pet Trainer> [npc 10089] 42.5,9.2: trainer
- Milla Fairancora <Journeyman Alchemist> [npc 11041] 55.4,22.7: trainer
- Sylvanna Forestmoon <Expert Alchemist> [npc 11042] 56.4,24.2: trainer
- Trianna <Journeyman Tailor> [npc 11050] 63.5,21.2: trainer
- Lalina Summermoon <Journeyman Enchanter> [npc 11070] 58.8,12.7: trainer
- Faldron <Expert Leatherworker> [npc 11081] 64.8,21.8: trainer
- Darianna <Journeyman Leatherworker> [npc 11083] 64.4,20.9: trainer
- Priestess Alathea <Priest Trainer> [npc 11401] 39.5,81.2: trainer
- Ilyenia Moonfire <Weapon Master> [npc 11866] 57.6,46.7: trainer
- Alliance Brigadier General <> [npc 15351] 58.0,34.5: vendor
- Auctioneer Silva'las <> [npc 15678] 57.3,53.6: auctioneer
- Auctioneer Cazarez <> [npc 15679] 55.6,52.5: auctioneer
- Lunar Festival Vendor <> [npc 15898] 31.6,13.7: vendor
- Marcy Baker <Supply Officer> [npc 214101] 59.2,56.6: vendor
- Dani'ill <Tailoring Recipes> [npc 258572] 63.9,21.3: vendor
- Pherry Leftee <Darkspear Islands Battlemaster> [npc 263644] 58.5,34.3: battlemaster
- Teuren Vineshade <Barber> [npc 277042] 58.9,50.2: barber
