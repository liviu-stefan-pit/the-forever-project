# Stonetalon Mountains: Alliance + neutral quests (28)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 1071 A Gnome's Respite  (L21 req17, 1650 xp)
  - start: Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - end:   Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - pre(any)=[1085]
  - text: Kill 10 Venture Co. Loggers, and 10 Venture Co. Deforesters and return to Gaxim Rustfizzle in Stonetalon.
  - objectives:
    1. kill 10x Venture Co. Logger <- Venture Co. Logger [npc 3989] L18-19 ~Stonetalon Mountains 67,52 (67 spawns)
    2. kill 10x Venture Co. Deforester <- Venture Co. Deforester [npc 3991] L19-20 ~Stonetalon Mountains 68,53 (36 spawns)

## 1072 An Old Colleague  (L21 req17, 830 xp)
  - start: Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - end:   Lomac Gearstrip [npc 4081] @ Ironforge 72.1,51.9
  - pre(any)=[1071], next=1073
  - text: Speak to Lomac Gearstrip in Ironforge.

## 1073 Ineptitude + Chemicals = Fun  (L21 req17, 1650 xp)
  - start: Lomac Gearstrip [npc 4081] @ Ironforge 72.1,51.9
  - end:   Lomac Gearstrip [npc 4081] @ Ironforge 72.1,51.9
  - pre(any)=[1072], next=1074
  - text: Bring 4 Minor Mana Potions and 2 Elixirs of Minor Fortitude to Lomac Gearstrip in Ironforge.
  - objectives:
    1. item 4x Minor Mana Potion <- Defias Smuggler [npc 95] L11-12 ~Westfall 46,31 (44 spawns); Riverpaw Taskmaster [npc 98] L17-18 ~Westfall 62,74 (46 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Riverpaw Gnoll [npc 117] L11-12 ~Westfall 49,15 (24 spawns)
    2. item 1x Elixir of Minor Fortitude <- ?

## 1074 Ineptitude + Chemicals = Fun  (L21 req17, 830 xp)
  - start: Lomac Gearstrip [npc 4081] @ Ironforge 72.1,51.9
  - end:   Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - pre(any)=[1073]
  - text: Bring the Nitromirglyceronium back to Gaxim Rustfizzle in Stonetalon.

## 1075 A Scroll from Mauren  (L21 req17, 830 xp)
  - start: Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - end:   Collin Mauren [npc 4078] @ Stormwind City 53.0,86.6
  - pre(any)=[1071], next=1076
  - text: Find Collin Mauren in Stormwind.

## 1076 Devils in Westfall  (L21 req17, 1650 xp)
  - start: Collin Mauren [npc 4078] @ Stormwind City 53.0,86.6
  - end:   Collin Mauren [npc 4078] @ Stormwind City 53.0,86.6
  - pre(any)=[1075], next=1077
  - text: Bring Dust Devil Debris to Collin Mauren in Stormwind.
  - objectives:
    1. item 1x Dust Devil Debris <- Dust Devil [npc 832] L18-19 ~Westfall 46,49 (12 spawns)

## 1077 Special Delivery for Gaxim  (L21 req17, 830 xp)
  - start: Collin Mauren [npc 4078] @ Stormwind City 53.0,86.6
  - end:   Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - pre(any)=[1076]
  - text: Bring the Scroll of Messaging to Gaxim Rustfizzle in Stonetalon.

## 1093 Super Reaper 6000  (L21 req16, 1650 xp)
  - start: Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - end:   Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - next=1094
  - text: Get the Super Reaper 6000 Blueprints for Ziz Fizziks in the Stonetalon Mountains.
  - objectives:
    1. item 1x Super Reaper 6000 Blueprints <- Venture Co. Operator [npc 3988] L19-20 ~Stonetalon Mountains 69,51 (24 spawns)

## 1094 Further Instructions  (L21 req16, 830 xp)
  - start: Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - end:   Sputtervalve [npc 3442] @ The Barrens 63.0,37.2
  - pre(any)=[1093], next=1095
  - text: Deliver the Sealed Envelope to Sputtervalve in the Barrens.

## 1079 Covert Ops - Alpha  (L22 req17, 2200 xp)
  - start: Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - end:   Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - pre(all)=[1077, 1074], next=1091
  - text: Retrieve the Venture Co.'s Engineering Plans from the lumber mill in Windshear Crag.
  - objectives:
    1. item 1x Venture Co. Engineering Plans <- Venture Co. Engineering Plans [object 19602] ~Stonetalon Mountains 66,51 (1 spawns)

## 1080 Covert Ops - Beta  (L22 req17, 2200 xp)
  - start: Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - end:   Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - pre(all)=[1077, 1074], next=1091
  - text: Retrieve the Venture Co. Letters from Windshear Mine at the east end of Windshear Crag.
  - objectives:
    1. item 1x Venture Co. Letters <- Venture Co. Documents [object 19603] ~Stonetalon Mountains 74,59 (1 spawns)

## 1082 Update for Sentinel Thenysil  (L22 req17, 870 xp)
  - start: Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - end:   Sentinel Thenysil [npc 4079] @ Ashenvale 34.9,49.8
  - pre(all)=[1083, 1084], next=1081
  - text: Return to Sentinel Thenysil in Ashenvale.

## 1090 Gerenzo's Orders  (L22 req17, 2200 xp)
  - start: Piznik [npc 4276] @ Stonetalon Mountains 71.9,60.0
  - end:   Piznik [npc 4276] @ Stonetalon Mountains 71.9,60.0
  - next=1092
  - text: Get the mysterious ore from Piznik after he finishes mining it.
  - objectives:
    1. kill 1x Piznik <- Piznik [npc 4276] L20-20 ~Stonetalon Mountains 72,60 (1 spawns)

## 1091 Kaela's Update  (L22 req17, 175 xp)
  - start: Gaxim Rustfizzle [npc 4077] @ Stonetalon Mountains 59.5,67.2
  - end:   Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - pre(all)=[1079, 1080]
  - text: Bring the Venture Co. Letters to Kaela Shadowspear.

## 1092 Gerenzo's Orders  (L22 req17, 1300 xp)
  - start: Piznik [npc 4276] @ Stonetalon Mountains 71.9,60.0
  - end:   Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - pre(any)=[1090]
  - text: Deliver the Unidentified Ore to Ziz Fizziks in the Stonetalon Mountains.

## 78270 Goblin Lockpicks  (L23 req1, ? xp, F, class=Rogue, sort=ROGUE)
  - start: Veenix [npc 4086] @ Stonetalon Mountains 58.2,51.7
  - end:   Veenix [npc 4086] @ Stonetalon Mountains 58.2,51.7
  - text: Find The Horn of Xelthos inside of Shadowfang Keep. Then, return it to C's dead drop near Pyrewood Village.
  - objectives:
    1. item 1x Venture Co. Work Order <- Venture Co. Deforester [npc 3991] L19-20 ~Stonetalon Mountains 68,53 (36 spawns); Venture Co. Operator [npc 3988] L19-20 ~Stonetalon Mountains 69,51 (24 spawns); Venture Co. Logger [npc 3989] L18-19 ~Stonetalon Mountains 67,52 (67 spawns); Venture Co. Machine Smith [npc 3993] L21-22 ~Stonetalon Mountains 64,40 (3 spawns)

## 79980 Scramble  (L24 req14, 195 xp, F)
  - start: Pocket Litter [object 424005] @ Stonetalon Mountains 40.8,52.6
  - end:   Mound of Dirt [object 424012] @ Stonetalon Mountains 39.6,49.8
  - pre(any)=[79192], next=79974
  - text: Find what awaits you.

## 86574 Stonetalon Supply Run  (L24 req20, 1950 xp, F)
  - start: Night Elf Courier [npc 268925] @ Stonetalon Mountains 48.7,39.9
  - end:   Innkeeper Faralia [npc 16458] @ Stonetalon Mountains 35.8,5.7
  - text: Collect 6 Stonetalon Supplies from Pridewing Wyverns and deliver them to Innkeeper Faralia.
  - objectives:
    1. item 6x Stonetalon Supply Bundle <- Young Pridewing [npc 4011] L19-20 ~Stonetalon Mountains 68,54 (5 spawns); Pridewing Wyvern [npc 4012] L21-22 ~Stonetalon Mountains 51,44 (14 spawns); Pridewing Skyhunter [npc 4013] L23-24 ~Stonetalon Mountains 54,38 (10 spawns); Pridewing Consort [npc 4014] L22-23 ~Stonetalon Mountains 50,42 (14 spawns)

## 1078 Retrieval for Mauren  (L26 req17, 2100 xp)
  - start: Collin Mauren [npc 4078] @ Stormwind City 53.0,86.6
  - end:   Collin Mauren [npc 4078] @ Stormwind City 53.0,86.6
  - text: Bring 8 Crystalized Scales to Collin Mauren in Stormwind.
  - objectives:
    1. item 8x Crystalized Scales <- Scorched Basilisk [npc 4041] L27-28 ~Stonetalon Mountains 33,72 (11 spawns); Singed Basilisk [npc 4042] L25-26 ~Stonetalon Mountains 32,66 (5 spawns); Blackened Basilisk [npc 4044] L23-24 ~Stonetalon Mountains 39,49 (9 spawns); Saltstone Basilisk [npc 4147] L30-31 ~Thousand Needles 75,60 (20 spawns)

## 1083 Enraged Spirits  (L26 req20, 2100 xp)
  - start: Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - end:   Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - pre(any)=[1091], next=1082
  - text: Bring 8 Smoldering Embers from any of the fire elementals in the Charred Vale to Kaela Shadowspear in Stonetalon.
  - objectives:
    1. item 8x Smoldering Embers <- Rogue Flame Spirit [npc 4036] L23-24 ~Stonetalon Mountains 37,53 (8 spawns); Burning Ravager [npc 4037] L24-25 ~Stonetalon Mountains 31,66 (5 spawns); Burning Destroyer [npc 4038] L26-27 ~Stonetalon Mountains 33,73 (7 spawns)

## 1057 Reclaiming the Charred Vale  (L27 req20, 2200 xp)
  - start: Keeper Albagorm [npc 3994] @ Stonetalon Mountains 37.1,8.1
  - end:   Keeper Albagorm [npc 3994] @ Stonetalon Mountains 37.1,8.1
  - next=1059
  - text: Keeper Albagorm on Stonetalon Peak wants you to slay 7 Bloodfury Harpies, 7 Bloodfury Ambushers, 7 Bloodfury Slayers and 7 Bloodfury Roguefeathers.
  - objectives:
    1. kill 7x Bloodfury Harpy <- Bloodfury Harpy [npc 4022] L23-24 ~Stonetalon Mountains 33,60 (13 spawns)
    2. kill 7x Bloodfury Ambusher <- Bloodfury Ambusher [npc 4025] L23-24 ~Stonetalon Mountains 31,62 (6 spawns)
    3. kill 7x Bloodfury Slayer <- Bloodfury Slayer [npc 4024] L25-26 ~Stonetalon Mountains 32,69 (11 spawns)
    4. kill 7x Bloodfury Roguefeather <- Bloodfury Roguefeather [npc 4023] L25-26 ~Stonetalon Mountains 33,69 (11 spawns)

## 1059 Reclaiming the Charred Vale  (L27 req20, 2200 xp)
  - start: Keeper Albagorm [npc 3994] @ Stonetalon Mountains 37.1,8.1
  - end:   Falfindel Waywarder [npc 4048] @ Feralas 89.6,46.6
  - pre(any)=[1057]
  - text: Travel to Falfindel Waywarder on the border of Thousand Needles and Feralas.

## 1095 Further Instructions  (L27 req16, 1100 xp)
  - start: Sputtervalve [npc 3442] @ The Barrens 63.0,37.2
  - end:   Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - pre(any)=[1094], next=1096
  - text: Bring the new orders to Ziz Fizziks in the Stonetalon Mountains.

## 1096 Gerenzo Wrenchwhistle  (L27 req16, 2200 xp)
  - start: Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - end:   Ziz Fizziks [npc 4201] @ Stonetalon Mountains 59.0,62.6
  - pre(any)=[1095]
  - text: Bring Gerenzo Wrenchwhistle's Mechanical Arm to Ziz Fizziks in the Stonetalon Mountains.
  - objectives:
    1. item 1x Gerenzo's Mechanical Arm <- Gerenzo Wrenchwhistle [npc 4202] L27-27 ~Stonetalon Mountains 64,40 (3 spawns)

## 1081 Reception from Tyrande  (L28 req17, 3400 xp)
  - start: Sentinel Thenysil [npc 4079] @ Ashenvale 34.9,49.8
  - end:   Tyrande Whisperwind [npc 7999] @ Darnassus 39.1,81.6
  - pre(any)=[1082]
  - text: Find Tyrande Whisperwind in Darnassus.

## 1084 Wounded Ancients  (L28 req22, 2300 xp)
  - start: Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - end:   Kaela Shadowspear [npc 4080] @ Stonetalon Mountains 59.9,66.8
  - pre(any)=[1091], next=1082
  - text: Bring a piece of Corroded Shrapnel to Kaela Shadowspear in Stonetalon.
  - objectives:
    1. item 1x Corroded Shrapnel <- Charred Ancient [npc 4028] L25-26 ~Stonetalon Mountains 33,68 (3 spawns); Blackened Ancient [npc 4029] L27-28 ~Stonetalon Mountains 32,64 (2 spawns); Vengeful Ancient [npc 4030] L30-30 ~Stonetalon Mountains 30,68 (1 spawns)

## 79974 Wet Job  (L32 req14, 2550 xp, F)
  - start: Mound of Dirt [object 424012] @ Stonetalon Mountains 39.6,49.8
  - end:   Carved Figurine [object 424007] @ Loch Modan 49.4,12.9
  - pre(any)=[79980], next=79975
  - text: Dusting off a messenger bag emerging from the soil, you find a parchment nestled among the supplies.

## 80001 Rekindle  (L40 req1, ? xp, F)
  - start: Firepit [object 424082] @ Stonetalon Mountains 40.6,52.4
  - end:   Firepit [object 424082] @ Stonetalon Mountains 40.6,52.4
  - objectives:
    1. item 1x Simple Wood <- Dirt-stained Map [object 3076] ~Mulgore 60,82 (1 spawns)
    2. item 1x Flint and Tinder <- Horizon Scout Crewman [npc 8386] L42-42 ~Azshara 53,88 (8 spawns); Dirt-stained Map [object 3076] ~Mulgore 60,82 (1 spawns)

# Service NPCs

- Chylina <General Supplies> [npc 4084] 35.5,6.2: vendor
- Nizzik <Venture Armor Salesman> [npc 4085] 62.7,40.2: repair, vendor
- Veenix <Venture Co. Merchant> [npc 4086] 58.2,51.7: repair, vendor
- Illyanie <Cloth Armor Merchant> [npc 4188] 35.6,7.3: repair, vendor
- Teloren <Hippogryph Master> [npc 4407] 36.4,7.2: flightMaster
- Spirit Healer <> [npc 6491] 36.4,75.2: spiritHealer
- Innkeeper Faralia <Innkeeper> [npc 16458] 35.8,5.7: innkeeper, vendor
- Xaphod Bizznox <> [npc 262471] 71.4,99.5: vendor
