# Loch Modan: Alliance + neutral quests (54)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 6387 Honor Students  (L10 req10, 210 xp, races=Dwarf/Gnome)
  - start: Brock Stoneseeker [npc 1681] @ Loch Modan 37.0,47.8
  - end:   Thorgrum Borrelson [npc 1572] @ Loch Modan 33.9,51.0
  - next=6391
  - text: Bring Brock's List to Thorgrum Borrelson in Thelsamar.

## 6388 Gryth Thurden  (L10 req10, 210 xp, races=Dwarf/Gnome)
  - start: Golnir Bouldertoe [npc 4256] @ Ironforge 51.5,26.3
  - end:   Gryth Thurden [npc 1573] @ Ironforge 55.5,47.7
  - pre(any)=[6391], next=6392
  - text: Bring the Honorary Picks to Gryth Thurden in Ironforge.

## 6391 Ride to Ironforge  (L10 req10, 420 xp, races=Dwarf/Gnome)
  - start: Thorgrum Borrelson [npc 1572] @ Loch Modan 33.9,51.0
  - end:   Golnir Bouldertoe [npc 4256] @ Ironforge 51.5,26.3
  - pre(any)=[6387], next=6388
  - text: Buy a gryphon to Ironforge from the gryphon master Thorgrum Borrelson, then bring Brock's List to Golnir Bouldertoe in Ironforge.

## 6392 Return to Brock  (L10 req10, 1050 xp, races=Dwarf/Gnome)
  - start: Gryth Thurden [npc 1573] @ Ironforge 55.5,47.7
  - end:   Brock Stoneseeker [npc 1681] @ Loch Modan 37.0,47.8
  - pre(any)=[6388]
  - text: Buy a gryphon to Thelsamar from the gryphon master Gryth Thurden, then bring the Honorary Picks to Brock Stoneseeker in Thelsamar.

## 86667 Snowbound  (L10 req10, 420 xp, F)
  - start: Grenhild Darktalon [npc 49808] @ Loch Modan 36.5,48.3
  - end:   Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - text: Deliver a Jar of Snow to Norric Lochthane at his house on the northwest coast of the Loch.
  - objectives:
    1. item 1x Jar of Snow <- ?

## 416 Rat Catching  (L11 req10, 880 xp)
  - start: Mountaineer Kadrell [npc 1340] @ Loch Modan 32.6,49.7
  - end:   Mountaineer Kadrell [npc 1340] @ Loch Modan 32.6,49.7
  - text: Bring 12 Tunnel Rat Ears to Mountaineer Kadrell in Thelsamar.
  - objectives:
    1. item 12x Tunnel Rat Ear <- Tunnel Rat Vermin [npc 1172] L10-11 ~Loch Modan 33,24 (43 spawns); Tunnel Rat Scout [npc 1173] L10-11 ~Loch Modan 29,28 (10 spawns); Tunnel Rat Geomancer [npc 1174] L12-13 ~Loch Modan 36,24 (10 spawns); Tunnel Rat Digger [npc 1175] L12-13 ~Loch Modan 36,24 (13 spawns)

## 418 Thelsamar Blood Sausages  (L11 req7, 880 xp)
  - start: Vidra Hearthstove [npc 1963] @ Loch Modan 34.8,49.3
  - end:   Vidra Hearthstove [npc 1963] @ Loch Modan 34.8,49.3
  - text: Bring 3 pieces of Bear Meat, 3 Boar Intestines, and 3 Spider Ichor to Vidra Hearthstove in Thelsamar.
  - objectives:
    1. item 1x Boar Intestines <- Goretusk [npc 157] L14-15 ~Westfall 44,54 (54 spawns); Bellygrub [npc 345] L24-24 ~Redridge Mountains 11,49 (1 spawns); Young Goretusk [npc 454] L12-13 ~Westfall 51,31 (45 spawns); Great Goretusk [npc 547] L16-17 ~Westfall 36,58 (46 spawns)
    2. item 3x Bear Meat <- Thistle Bear [npc 2163] L11-12 ~Darkshore 44,36 (81 spawns); Rabid Thistle Bear [npc 2164] L13-14 ~Darkshore 44,49 (101 spawns); Grizzled Black Bear [npc 1188] L13-14 ~Loch Modan 63,61 (24 spawns); Black Bear Patriarch [npc 1189] L16-17 ~Loch Modan 68,37 (21 spawns)
    3. item 1x Spider Ichor <- Venom Web Spider [npc 217] L19-20 ~Duskwood 39,34 (34 spawns); Tarantula [npc 442] L15-16 ~Redridge Mountains 11,78 (22 spawns); Mother Fang [npc 471] L7-10 ~Elwynn Forest 62,48 (1 spawns); Greater Tarantula [npc 505] L19-20 ~Redridge Mountains 49,44 (14 spawns)

## 224 In Defense of the King's Lands  (L12 req10, 910 xp)
  - start: Mountaineer Cobbleflint [npc 1089] @ Loch Modan 22.1,73.1
  - end:   Mountaineer Cobbleflint [npc 1089] @ Loch Modan 22.1,73.1
  - next=237
  - text: Mountaineer Cobbleflint of the southern guard tower wants you to kill 10 Stonesplinter Troggs and 10 Stonesplinter Scouts.
  - objectives:
    1. kill 10x Stonesplinter Trogg <- Stonesplinter Trogg [npc 1161] L11-12 ~Loch Modan 31,68 (40 spawns)
    2. kill 10x Stonesplinter Scout <- Stonesplinter Scout [npc 1162] L11-12 ~Loch Modan 31,68 (31 spawns)

## 267 The Trogg Threat  (L12 req10, 910 xp)
  - start: Captain Rugelfuss [npc 1092] @ Loch Modan 23.2,73.7
  - end:   Captain Rugelfuss [npc 1092] @ Loch Modan 23.2,73.7
  - next=217
  - text: Bring 8 Trogg Stone Teeth to Captain Rugelfuss in the southern guard tower.
  - objectives:
    1. item 8x Trogg Stone Tooth <- Stonesplinter Trogg [npc 1161] L11-12 ~Loch Modan 31,68 (40 spawns); Stonesplinter Scout [npc 1162] L11-12 ~Loch Modan 31,68 (31 spawns); Stonesplinter Skullthumper [npc 1163] L13-14 ~Loch Modan 37,71 (31 spawns); Stonesplinter Bonesnapper [npc 1164] L15-16 ~Loch Modan 44,60 (17 spawns)

## 94473 Fire Sapta  (L13 req10, ? xp, F, class=Shaman, sort=SHAMAN, repeatable)
  - start: Braldir Ashmantle [npc 257808] @ Loch Modan 32.2,66.0
  - end:   Braldir Ashmantle [npc 257808] @ Loch Modan 32.2,66.0
  - pre(any)=[94466]
  - text: Speak to Braldir Ashmantle for another Fire Sapta

## 1338 Stormpike's Order  (L14 req9, 980 xp)
  - start: Mountaineer Stormpike [npc 1343] @ Loch Modan 24.8,18.4
  - end:   Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - text: Bring Stormpike's Request to Furen Longbeard in Stormwind.

## 94466 Call of Fire  (L14 req10, 980 xp, F, class=Shaman, sort=SHAMAN)
  - start: Braldir Ashmantle [npc 257808] @ Loch Modan 32.2,66.0
  - end:   Braldir Ashmantle [npc 257808] @ Loch Modan 32.2,66.0
  - pre(any)=[94465], next=94467
  - text: Bring 1 Fire Tar and 1 Reagent Pouch to Braldir Ashmantle in Loch Modan.
  - objectives:
    1. item 1x Fire Tar <- Razormane Water Seeker [npc 3267] L10-11 ~The Barrens 55,26 (18 spawns); Razormane Thornweaver [npc 3268] L10-11 ~The Barrens 55,26 (13 spawns); Razormane Geomancer [npc 3269] L12-13 ~The Barrens 58,25 (17 spawns); Razormane Mystic [npc 3271] L13-14 ~The Barrens 59,27 (6 spawns)
    2. item 1x Reagent Pouch <- Burning Blade Cultist [npc 3199] L10-11 ~Durotar 52,26 (7 spawns); Stonesplinter Seer [npc 1166] L13-14 ~Loch Modan 38,64 (47 spawns)

## 94467 Call of Fire  (L14 req10, 1250 xp, F, class=Shaman, sort=SHAMAN)
  - start: Braldir Ashmantle [npc 257808] @ Loch Modan 32.2,66.0
  - end:   Brazier of the Dormant Flame [object 61934] @ Loch Modan 31.8,64.5
  - pre(any)=[94466], next=94468
  - text: Defeat the Minor Manifestation of Fire, and place the Glowing Ember in the brazier atop the Shrine of Eternal Flame.
  - objectives:
    1. item 1x Glowing Ember <- Minor Manifestation of Fire [npc 5893] L12-12 ~Loch Modan 32,64 (1 spawns); Manifestation of Flames [npc 268763] L12-12 ~Zephras Isle 51,86 (2 spawns)

## 237 In Defense of the King's Lands  (L15 req10, 1050 xp)
  - start: Mountaineer Gravelgaw [npc 1091] @ Loch Modan 23.5,76.4
  - end:   Mountaineer Gravelgaw [npc 1091] @ Loch Modan 23.5,76.4
  - pre(any)=[224], next=263
  - text: Mountaineer Gravelgaw in the southern guard tower wants you to kill 10 Stonesplinter Skullthumpers and 10 Stonesplinter Seers and report back to him.
  - objectives:
    1. kill 10x Stonesplinter Skullthumper <- Stonesplinter Skullthumper [npc 1163] L13-14 ~Loch Modan 37,71 (31 spawns)
    2. kill 10x Stonesplinter Seer <- Stonesplinter Seer [npc 1166] L13-14 ~Loch Modan 38,64 (47 spawns)

## 263 In Defense of the King's Lands  (L15 req10, 1050 xp)
  - start: Mountaineer Wallbang [npc 1090] @ Loch Modan 23.5,74.5
  - end:   Mountaineer Wallbang [npc 1090] @ Loch Modan 23.5,74.5
  - pre(any)=[237]
  - text: Mountaineer Wallbang in the southern guard tower wants you to kill 10 Stonesplinter Shaman and 10 Stonesplinter Bonesnappers.
  - objectives:
    1. kill 10x Stonesplinter Shaman <- Stonesplinter Shaman [npc 1197] L15-16 ~Loch Modan 42,69 (23 spawns)
    2. kill 10x Stonesplinter Bonesnapper <- Stonesplinter Bonesnapper [npc 1164] L15-16 ~Loch Modan 44,60 (17 spawns)

## 273 Resupplying the Excavation  (L15 req10, 270 xp)
  - start: Jern Hornhelm [npc 1105] @ Loch Modan 37.2,47.4
  - end:   Huldar [npc 2057] @ Loch Modan 52.2,69.3
  - pre(any)=[302], next=454
  - text: Speak with Huldar.
  - objectives:
    1. kill 1x Pat's Firework Guy - BLUE BIG <- Miran [npc 1379] L15-15 ~Loch Modan 52,69 (1 spawns); Huldar [npc 2057] L15-15 ~Loch Modan 52,69 (1 spawns)

## 298 Excavation Progress Report  (L15 req10, 270 xp)
  - start: Prospector Ironband [npc 1344] @ Loch Modan 65.9,65.6
  - end:   Jern Hornhelm [npc 1105] @ Loch Modan 37.2,47.4
  - next=301
  - text: Bring Ironband's Progress Report to Jern Hornhelm in Thelsamar.

## 301 Report to Ironforge  (L15 req10, 540 xp)
  - start: Jern Hornhelm [npc 1105] @ Loch Modan 37.2,47.4
  - end:   Prospector Stormpike [npc 1356] @ Ironforge 74.6,11.7
  - pre(any)=[298], next=302
  - text: Take Ironband's Progress Report to Prospector Stormpike.

## 302 Powder to Ironband  (L15 req10, 270 xp)
  - start: Prospector Stormpike [npc 1356] @ Ironforge 74.6,11.7
  - end:   Jern Hornhelm [npc 1105] @ Loch Modan 37.2,47.4
  - pre(any)=[301], next=273
  - text: Speak with Jern Hornhelm in Thelsamar.

## 307 Filthy Paws  (L15 req9, 1350 xp)
  - start: Mountaineer Stormpike [npc 1343] @ Loch Modan 24.8,18.4
  - end:   Mountaineer Stormpike [npc 1343] @ Loch Modan 24.8,18.4
  - text: Go to the Silver Stream Mine and collect 4 loads of Miners' Gear.
  - text: Return to Mountaineer Stormpike.
  - objectives:
    1. item 1x Miners' Gear <- Miners' League Crates [object 271] ~Loch Modan 35,24 (14 spawns)

## 309 Protecting the Shipment  (L15 req10, 1050 xp)
  - start: Miran [npc 1379] @ Loch Modan 52.2,69.4
  - end:   Prospector Ironband [npc 1344] @ Loch Modan 65.9,65.6
  - pre(any)=[454]
  - text: Ensure Miran and the shipment arrive at the excavation site, then inform Prospector Ironband.

## 385 Crocolisk Hunting  (L15 req10, 1050 xp)
  - start: Marek Ironheart [npc 1154] @ Loch Modan 81.8,61.7
  - end:   Marek Ironheart [npc 1154] @ Loch Modan 81.8,61.7
  - text: Get 5 pieces of Crocolisk Meat and 6 Crocolisk Skins for Marek Ironheart at the Farstrider Lodge.
  - objectives:
    1. item 5x Crocolisk Meat <- Saltwater Crocolisk [npc 1151] L35-36 ~Stranglethorn Vale 24,19 (13 spawns); Wetlands Crocolisk [npc 1400] L23-24 ~Wetlands 33,35 (52 spawns); Young Wetlands Crocolisk [npc 1417] L21-22 ~Wetlands 45,49 (77 spawns); Loch Crocolisk [npc 1693] L14-15 ~Loch Modan 56,42 (27 spawns)
    2. item 5x Crocolisk Skin <- Saltwater Crocolisk [npc 1151] L35-36 ~Stranglethorn Vale 24,19 (13 spawns); Wetlands Crocolisk [npc 1400] L23-24 ~Wetlands 33,35 (52 spawns); Young Wetlands Crocolisk [npc 1417] L21-22 ~Wetlands 45,49 (77 spawns); Loch Crocolisk [npc 1693] L14-15 ~Loch Modan 56,42 (27 spawns)

## 454 After the Ambush  (L15 req10, 105 xp)
  - start: Huldar [npc 2057] @ Loch Modan 52.2,69.3
  - end:   Miran [npc 1379] @ Loch Modan 52.2,69.4
  - pre(any)=[273], next=309
  - text: Speak with Miran.

## 1339 Mountaineer Stormpike's Task  (L15 req9, 540 xp)
  - start: Mountaineer Kadrell [npc 1340] @ Loch Modan 32.6,49.7
  - end:   Mountaineer Stormpike [npc 1343] @ Loch Modan 24.8,18.4
  - next=1338, breadcrumbFor=1338
  - text: Speak with Mountaineer Stormpike.

## 2038 Bingles' Missing Supplies  (L15 req12, 1050 xp)
  - start: Bingles Blastenheimer [npc 6577] @ Loch Modan 63.6,47.9
  - end:   Bingles Blastenheimer [npc 6577] @ Loch Modan 63.6,47.9
  - text: Find and return Bingles' supplies:
  - text: Bingles' Wrench, Bingles' Screwdriver, Bingles' Hammer, and Bingles' Blastencapper.
  - objectives:
    1. item 1x Bingles' Wrench <- Bingles's Toolbucket [object 104564] ~Loch Modan 49,30 (1 spawns)
    2. item 1x Bingles' Screwdriver <- Bingles's Toolbucket [object 104569] ~Loch Modan 48,21 (1 spawns)
    3. item 1x Bingles' Hammer <- Bingles's Toolbucket [object 104574] ~Loch Modan 52,24 (1 spawns)
    4. item 1x Bingles' Blastencapper <- Bingles's Blastencapper [object 104575] ~Loch Modan 54,27 (1 spawns)

## 257 A Hunter's Boast  (L16 req11, 880 xp)
  - start: Daryl the Youngling [npc 1187] @ Loch Modan 83.5,65.5
  - end:   Daryl the Youngling [npc 1187] @ Loch Modan 83.5,65.5
  - next=258
  - text: Kill 6 Mountain Buzzards and return to Daryl the Youngling in the Farstrider Lodge within 15 minutes.
  - objectives:
    1. kill 6x Mountain Buzzard <- Mountain Buzzard [npc 1194] L15-16 ~Loch Modan 75,67 (25 spawns)

## 86758 Twisting the Knife  (L16 req12, 1150 xp, F)
  - start: Marek Ironheart [npc 1154] @ Loch Modan 81.8,61.7
  - end:   Marek Ironheart [npc 1154] @ Loch Modan 81.8,61.7
  - text: Find and defeat the crocolisk Daggerfang and bring back Marek's knife.
  - objectives:
    1. item 1x Marek's Croc-Hunting Knife <- Daggerfang [npc 270693] L15-15 ~Loch Modan 61,44 (355 spawns)

## 217 In Defense of the King's Lands  (L17 req10, 1600 xp)
  - start: Captain Rugelfuss [npc 1092] @ Loch Modan 23.2,73.7
  - end:   Captain Rugelfuss [npc 1092] @ Loch Modan 23.2,73.7
  - pre(all)=[263, 267]
  - text: Kill the Trogg leader, Grawmug, and his two guards, Gnasher and Brawler then report back to Captain Rugelfuss in the southern guard tower.
  - objectives:
    1. kill 1x Grawmug <- Grawmug [npc 1205] L17-17 ~Loch Modan 35,90 (1 spawns)
    2. kill 1x Gnasher <- Gnasher [npc 1206] L16-16 ~Loch Modan 35,91 (1 spawns)
    3. kill 1x Brawler <- Brawler [npc 1207] L16-16 ~Loch Modan 35,91 (1 spawns)

## 258 A Hunter's Challenge  (L17 req11, 950 xp)
  - start: Daryl the Youngling [npc 1187] @ Loch Modan 83.5,65.5
  - end:   Daryl the Youngling [npc 1187] @ Loch Modan 83.5,65.5
  - pre(any)=[257], next=271
  - text: Kill 5 Elder Mountain Boars and return to Daryl the Youngling in the Farstrider Lodge within 12 minutes.
  - objectives:
    1. kill 5x Elder Mountain Boar <- Elder Mountain Boar [npc 1192] L16-17 ~Loch Modan 66,40 (19 spawns)

## 86585 Banner of the Fallen  (L17 req10, 1250 xp, F)
  - start: Mountaineer Ylva [npc 269153] @ Loch Modan 31.8,86.3
  - end:   Captain Rugelfuss [npc 1092] @ Loch Modan 23.2,73.7
  - text: Raise the standard of Ironforge, call out the trogg Headsplitter and kill it, then report to Captain Rugelfuss.
  - objectives:
    1. kill 1x Headsplitter <- Headsplitter [npc 269185] L15-17 ~Loch Modan 32,85 (39 spawns)

## 161 A Dark Threat Looms  (L18 req16, 1350 xp)
  - start: Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - end:   Ashlan Stonesmirk [npc 1073] @ Wetlands 50.0,18.2
  - pre(any)=[199], next=274
  - text: Chief Engineer Hinderweir wants you to take the strange smelling powder to Ashlan Stonesmirk, the explosives expert in Dun Modr.

## 199 A Dark Threat Looms  (L18 req16, 1350 xp)
  - start: Suspicious Barrel [object 257] @ Loch Modan 56.0,13.2
  - end:   Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - pre(any)=[250], next=161
  - text: Return to Chief Engineer Hinderweir and show him the clue that you discovered.

## 250 A Dark Threat Looms  (L18 req16, 680 xp)
  - start: Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - end:   Suspicious Barrel [object 257] @ Loch Modan 56.0,13.2
  - next=199
  - text: Investigate the area near the eastern ramp of the Dam and bring Chief Engineer Hinderweir a clue that might reveal what the Dark Iron Dwarves are up to.

## 274 A Dark Threat Looms  (L18 req16, 340 xp)
  - start: Ashlan Stonesmirk [npc 1073] @ Wetlands 50.0,18.2
  - end:   Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - pre(any)=[161], next=278
  - text: Ashlan Stonesmirk wants you to return to Chief Engineer Hinderweir and inform him of the new discovery.

## 278 A Dark Threat Looms  (L18 req16, 1350 xp)
  - start: Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - end:   Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - pre(any)=[274], next=280
  - text: Chief Engineer Hinderweir wants you to gather Lurker Venom, a Mo'grosh Crystal, and a Crocolisk Tear.
  - objectives:
    1. item 1x Lurker Venom <- Cliff Lurker [npc 1184] L18-18 ~Loch Modan 59,64 (17 spawns); Wood Lurker [npc 1185] L17-18 ~Loch Modan 76,36 (11 spawns); Forest Lurker [npc 1195] L10-11 ~Loch Modan 31,42 (35 spawns); Shanda the Spinner [npc 14266] L19-19 ~Loch Modan 78,52 (1 spawns)
    2. item 1x Mo'grosh Crystal <- Mo'grosh Ogre [npc 1178] L18-19 ~Loch Modan 69,26 (15 spawns); Mo'grosh Enforcer [npc 1179] L18-19 ~Loch Modan 72,23 (20 spawns); Mo'grosh Brute [npc 1180] L19-20 ~Loch Modan 76,17 (9 spawns); Mo'grosh Shaman [npc 1181] L18-19 ~Loch Modan 73,21 (14 spawns)
    3. item 1x Crocolisk Tear <- Loch Crocolisk [npc 1693] L14-15 ~Loch Modan 56,42 (27 spawns); Large Loch Crocolisk [npc 2476] L22-22 ~Loch Modan 60,35 (2 spawns); Daggerfang [npc 270693] L15-15 ~Loch Modan 61,44 (355 spawns)

## 280 A Dark Threat Looms  (L18 req16, 680 xp)
  - start: Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - end:   Explosive Charge [object 1585] @ Loch Modan 50.6,14.3
  - pre(any)=[278], next=283
  - text: Chief Engineer Hinderweir wants you to swim down to the base of the dam, locate the powder keg and stir in the Disarming Mixture to prevent an explosion.

## 297 Gathering Idols  (L18 req13, 1350 xp)
  - start: Magmar Fellhew [npc 1345] @ Loch Modan 64.9,66.7
  - end:   Magmar Fellhew [npc 1345] @ Loch Modan 64.9,66.7
  - text: Bring Magmar Fellhew 8 Carved Stone Idols.
  - objectives:
    1. item 8x Carved Stone Idol <- Stonesplinter Geomancer [npc 1165] L17-18 ~Loch Modan 70,64 (11 spawns); Stonesplinter Digger [npc 1167] L18-19 ~Loch Modan 70,65 (15 spawns); Berserk Trogg [npc 1393] L19-20 ~Loch Modan 70,64 (5 spawns)

## 436 Ironband's Excavation  (L18 req13, 340 xp)
  - start: Jern Hornhelm [npc 1105] @ Loch Modan 37.2,47.4
  - end:   Magmar Fellhew [npc 1345] @ Loch Modan 64.9,66.7
  - next=297, breadcrumbFor=297
  - text: Speak with Explorer Fellhew.

## 86613 Excavation Tools  (L18 req13, 1350 xp, F)
  - start: item Excavation Tools [278049] (drops from ?)
  - end:   Prospector Ironband [npc 1344] @ Loch Modan 65.9,65.6
  - text: Return 6 Excavation Tools to Magmar Fellhew.
  - objectives:
    1. item 6x Excavation Tools <- Excavation Tools [object 665282] ~Loch Modan 69,64 (14 spawns)

## 255 Mercenaries  (L19 req15, 1800 xp)
  - start: Magistrate Bluntnose [npc 1139] @ Loch Modan 34.6,44.5
  - end:   Magistrate Bluntnose [npc 1139] @ Loch Modan 34.6,44.5
  - text: Magistrate Bluntnose of Thelsamar has hired you to kill 4 Mo'grosh Ogres, 4 Mo'grosh Brutes and 4 Mo'grosh Enforcers.
  - objectives:
    1. kill 4x Mo'grosh Ogre <- Mo'grosh Ogre [npc 1178] L18-19 ~Loch Modan 69,26 (15 spawns)
    2. kill 4x Mo'grosh Brute <- Mo'grosh Brute [npc 1180] L19-20 ~Loch Modan 76,17 (9 spawns)
    3. kill 4x Mo'grosh Enforcer <- Mo'grosh Enforcer [npc 1179] L18-19 ~Loch Modan 72,23 (20 spawns)

## 271 Vyrin's Revenge  (L20 req15, 780 xp)
  - start: Vyrin Swiftwind [npc 1156] @ Loch Modan 81.7,64.1
  - end:   Daryl the Youngling [npc 1187] @ Loch Modan 83.5,65.5
  - pre(any)=[258], next=531
  - text: Kill Ol' Sooty then show your handiwork to Daryl the Youngling at the Farstrider Lodge.
  - objectives:
    1. item 1x Ol' Sooty's Head <- Ol' Sooty [npc 1225] L20-20 ~Loch Modan 38,63 (1 spawns)

## 283 A Dark Threat Looms  (L20 req16, 1950 xp)
  - start: Explosive Charge [object 1585] @ Loch Modan 50.6,14.3
  - end:   Chief Engineer Hinderweir VII [npc 1093] @ Loch Modan 46.0,13.6
  - pre(any)=[280]
  - text: The Disarming Mixture seemed to take effect. Return to Chief Engineer Hinderweir to report the good news.

## 531 Vyrin's Revenge  (L20 req15, 1550 xp)
  - start: Daryl the Youngling [npc 1187] @ Loch Modan 83.5,65.5
  - end:   Vyrin Swiftwind [npc 1156] @ Loch Modan 81.7,64.1
  - pre(any)=[271]
  - text: Bring Ol' Sooty's head to Vyrin Swiftwind at the Farstrider Lodge.

## 86614 Silver of the Waves  (L20 req13, 1550 xp, F)
  - start: Discarded Fishing Toolbox [object 665289] @ Loch Modan 45.7,43.3
  - end:   Khara Deepwater [npc 1684] @ Loch Modan 40.3,39.3
  - text: Return the Monogrammed Silver Hair clip to its owner.

## 94616 Water Sapta  (L20 req20, ? xp, F, class=Shaman, sort=SHAMAN, repeatable)
  - start: Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - end:   Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - pre(any)=[94501]

## 256 WANTED: Chok'sul  (L22 req17, 1750 xp)
  - start: WANTED [object 256] @ Loch Modan 37.3,46.5
  - end:   Magistrate Bluntnose [npc 1139] @ Loch Modan 34.6,44.5
  - text: Kill Chok'sul and bring his head to Magistrate Bluntnose of Thelsamar.
  - objectives:
    1. item 1x Chok'sul's Head <- Chok'sul [npc 1210] L22-22 ~Loch Modan 80,15 (1 spawns)

## 1655 Bailor's Ore Shipment  (L22 req20, 435 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Bailor Stonehand [npc 6241] @ Loch Modan 36.0,44.9
  - end:   Bailor Stonehand [npc 6241] @ Loch Modan 36.0,44.9
  - text: Bring Jordan's Ore Shipment to Bailor Stonehand in Loch Modan.
  - objectives:
    1. item 1x Jordan's Ore Shipment <- Bailor's Ore [object 92420] ~Loch Modan 72,22 (1 spawns)

## 94495 Call of Water  (L22 req20, 435 xp, F, class=Shaman, sort=SHAMAN)
  - start: Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - end:   Hervdana Saegrund [npc 258203] @ Wetlands 65.8,76.5
  - pre(any)=[94494], next=94497
  - text: Find Hervdana Saegrund in the Wetlands.

## 94502 Call of Water  (L23 req20, 1400 xp, F, class=Shaman, sort=SHAMAN)
  - start: Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - end:   Forgotten Shrine [object 619896] @ Westfall 45.6,59.9
  - pre(any)=[94501], next=94503
  - text: Drink the Water Sapta and Cleanse the corruption at Stendel's Pond in Westfall.
  - text: Return to Norric in Loch Modan when finished.
  - objectives:
    1. item 1x Corrupt Manifestation's Bracers <- Corrupt Minor Manifestation of Water [npc 5894] L22-22 ~Silverpine Forest 39,44 (1 spawns)

## 86776 Ingredients for the Forge  (L30 req15, 2450 xp, F)
  - start: Morhan Coppertongue [npc 167] @ Loch Modan 34.0,46.5
  - end:   Morhan Coppertongue [npc 167] @ Loch Modan 34.0,46.5
  - text: Bring 10 Bronze Bars to Morhan Coppertongue.
  - objectives:
    1. item 10x Bronze Bar <- ?

## 2500 Badlands Reagent Run  (L39 req36, 3000 xp)
  - start: Ghak Healtouch [npc 1470] @ Loch Modan 37.1,49.4
  - end:   Ghak Healtouch [npc 1470] @ Loch Modan 37.1,49.4
  - next=17
  - text: Acquire the reagents Ghak Healtouch needs from the Badlands, then return to him in Thelsamar.
  - objectives:
    1. item 1x Buzzard Gizzard <- Starving Buzzard [npc 2829] L35-37 ~Badlands 57,27 (6 spawns); Buzzard [npc 2830] L37-39 ~Badlands 55,63 (7 spawns); Giant Buzzard [npc 2831] L39-41 ~Badlands 19,64 (17 spawns); Wayward Buzzard [npc 6013] L37-37
    2. item 1x Crag Coyote Fang <- Crag Coyote [npc 2727] L35-36 ~Badlands 51,39 (28 spawns); Feral Crag Coyote [npc 2728] L37-38 ~Badlands 57,61 (39 spawns); Elder Crag Coyote [npc 2729] L38-40 ~Badlands 28,64 (46 spawns); Rabid Crag Coyote [npc 2730] L42-43 ~Badlands 71,34 (6 spawns)
    3. item 1x Rock Elemental Shard <- Rock Elemental [npc 92] L39-40 ~Badlands 35,69 (30 spawns); Lesser Rock Elemental [npc 2735] L37-39 ~Badlands 19,43 (18 spawns); Greater Rock Elemental [npc 2736] L42-44 ~Badlands 8,83 (28 spawns); Ambassador Infernus [npc 2745] L42-42 ~Badlands 42,29 (1 spawns)

## 2501 Badlands Reagent Run II  (L44 req40, 3750 xp)
  - start: Ghak Healtouch [npc 1470] @ Loch Modan 37.1,49.4
  - end:   Ghak Healtouch [npc 1470] @ Loch Modan 37.1,49.4
  - pre(all)=[2500, 17]
  - text: Use the empty thaumaturgy vessels on scorched guardian dragons found in the Badlands. Once you have them filled, bring them to Ghak Healtouch in Thelsamar.
  - objectives:
    1. item 1x Vessel of Dragon's Blood <- Scorched Guardian [npc 2726] L43-45 ~Badlands 81,52 (12 spawns)

## 3182 Proof of Deed  (L48 req40, 4400 xp)
  - start: Mountaineer Pebblebitty [npc 3836] @ Loch Modan 18.2,84.0
  - end:   Curator Thorius [npc 8256] @ Ironforge 71.5,15.7
  - pre(any)=[3181], next=3201
  - text: Take Margol's Gigantic Horn to Curator Thorius in Ironforge.

## 8642 Silvervein the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Silvervein [npc 15558] @ Loch Modan 33.3,46.5
  - end:   Elder Silvervein [npc 15558] @ Loch Modan 33.3,46.5

# Service NPCs

- Morhan Coppertongue <Metalsmith> [npc 167] 34.0,46.5: repair, vendor
- Nillen Andemar <Macecrafter> [npc 222] 42.9,9.9: repair, vendor
- Karm Ironquill <Mining Supplies> [npc 372] 37.1,47.2: vendor
- Kat Sampson <Leather Armor Merchant> [npc 954] 82.7,64.1: repair, vendor
- Aldren Cordon <Clothier> [npc 1214] 64.8,66.0: repair, vendor
- Gothor Brumn <Armorer> [npc 1362] 24.1,18.2: repair, vendor
- Drac Roughcut <Tradesman> [npc 1465] 35.6,49.1: vendor
- Vrok Blunderblast <Gunsmith> [npc 1469] 35.8,43.5: repair, vendor
- Ghak Healtouch <Journeyman Alchemist> [npc 1470] 37.1,49.4: trainer
- Kali Healtouch <Herbalist> [npc 1473] 36.5,48.5: trainer
- Rann Flamespinner <Tailoring Supplies> [npc 1474] 36.0,45.9: vendor
- Thorgrum Borrelson <Gryphon Master> [npc 1572] 33.9,51.0: flightMaster
- Brock Stoneseeker <Mining Trainer> [npc 1681] 37.0,47.8: trainer
- Yanni Stoutheart <General Supplies> [npc 1682] 34.8,48.6: vendor
- Warg Deepwater <Fisherman> [npc 1683] 40.5,39.7: trainer
- Khara Deepwater <Fishing Supplies> [npc 1684] 40.3,39.3: vendor
- Xandar Goodbeard <General Supplies> [npc 1685] 82.5,63.4: vendor
- Irene Sureshot <Gunsmith> [npc 1686] 83.2,63.4: repair, vendor
- Cliff Hadin <Bowyer> [npc 1687] 83.0,63.0: repair, vendor
- Deek Fizzlebizz <Journeyman Engineer> [npc 3290] 45.9,13.4: trainer
- Greishan Ironstove <Traveling Merchant> [npc 3291] 25.6,11.8: vendor
- Claude Erksine <Pet Trainer> [npc 3545] 82.2,62.8: trainer
- Honni Goldenoat <Baker> [npc 3948] 35.3,49.7: vendor
- Spirit Healer <> [npc 6491] 32.6,47.0: spiritHealer
- Innkeeper Hearthstove <Innkeeper> [npc 6734] 35.5,48.4: innkeeper, vendor
- Lina Hearthstove <Stable Master> [npc 9989] 34.6,48.1: stableMaster
- Dargh Trueaim <Hunter Trainer> [npc 10930] 82.4,62.4: trainer
