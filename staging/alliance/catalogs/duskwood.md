# Duskwood: Alliance + neutral quests (96)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 5 Jitters' Growling Gut  (L20 req17, 390 xp)
  - start: Jitters [npc 288] @ Duskwood 18.4,56.4
  - end:   Chef Grual [npc 272] @ Duskwood 73.8,43.5
  - next=93
  - text: Speak with Chef Grual.

## 93 Dusky Crab Cakes  (L20 req17, 780 xp)
  - start: Chef Grual [npc 272] @ Duskwood 73.8,43.5
  - end:   Chef Grual [npc 272] @ Duskwood 73.8,43.5
  - pre(any)=[5], next=240
  - text: Gather 6 Gooey Spider Legs and bring them to Chef Grual in Darkshire.
  - objectives:
    1. item 6x Gooey Spider Leg <- Venom Web Spider [npc 217] L19-20 ~Duskwood 39,34 (34 spawns); Pygmy Venom Web Spider [npc 539] L18-19 ~Duskwood 33,36 (36 spawns); Green Recluse [npc 569] L21-22 ~Duskwood 48,31 (25 spawns); Naraxis [npc 574] L27-27 ~Duskwood 86,48 (1 spawns)

## 163 Raven Hill  (L20 req17, 390 xp)
  - start: Elaine Carevin [npc 633] @ Duskwood 75.3,48.8
  - end:   Jitters [npc 288] @ Duskwood 18.4,56.4
  - next=5, breadcrumbFor=5
  - text: Find out what is haunting Raven Hill.

## 240 Return to Jitters  (L20 req17, 780 xp)
  - start: Chef Grual [npc 272] @ Duskwood 73.8,43.5
  - end:   Jitters [npc 288] @ Duskwood 18.4,56.4
  - pre(any)=[93]
  - text: Return to Jitters with the Dusky Crab Cakes.

## 226 Wolves at Our Heels  (L21 req19, 1250 xp)
  - start: Lars [npc 893] @ Duskwood 7.7,33.2
  - end:   Lars [npc 893] @ Duskwood 7.7,33.2
  - text: Kill 12 Starving Dire Wolves and 8 Rabid Dire Wolves, then return to Lars at Sven's Camp on the western border of Duskwood.
  - objectives:
    1. kill 12x Starving Dire Wolf <- Starving Dire Wolf [npc 213] L19-20 ~Duskwood 36,24 (38 spawns)
    2. kill 1x Rabid Dire Wolf <- Rabid Dire Wolf [npc 565] L20-21 ~Duskwood 28,31 (33 spawns)

## 245 Eight-Legged Menaces  (L21 req17, 1250 xp)
  - start: Watcher Dodds [npc 888] @ Duskwood 45.1,67.0
  - end:   Watcher Dodds [npc 888] @ Duskwood 45.1,67.0
  - text: Kill 15 Pygmy Venom Web Spiders, and then report back to Watcher Dodds in Duskwood.
  - objectives:
    1. kill 15x Pygmy Venom Web Spider <- Pygmy Venom Web Spider [npc 539] L18-19 ~Duskwood 33,36 (36 spawns)

## 95161 Remember That I Love You  (L22 req15, 175 xp, F)
  - start: Orphan Matron Nightingale [npc 14450] @ Stormwind City 56.3,54.0
  - end:   Avette Fellwood [npc 228] @ Duskwood 73.0,44.4
  - pre(any)=[92415]
  - text: Deliver the Blood-Stained Letter to Avette Fellwood in Duskwood.

## 164 Deliveries to Sven  (L23 req17, 920 xp)
  - start: Elaine Carevin [npc 633] @ Duskwood 75.3,48.8
  - end:   Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - next=95, breadcrumbFor=95
  - text: Deliver the supplies to Sven.

## 96139 The Valor Family  (L23 req18, 1400 xp, F)
  - start: Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - end:   Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - text: Search Raven Hill for anything of interest and return to Sirra Von'Indi in Darkshire.
  - objectives:
    1. item 1x Raven Hill Tome <- Memory of Valor [object 673515] ~Duskwood 21,56 (1 spawns)

## 56 The Night Watch  (L24 req18, 1450 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - next=57
  - text: Commander Althea Ebonlocke of Darkshire wants you to kill 8 Skeletal Warriors and 6 Skeletal Mages.
  - objectives:
    1. kill 8x Skeletal Warrior <- Skeletal Warrior [npc 48] L21-22 ~Duskwood 79,71 (15 spawns)
    2. kill 8x Skeletal Mage <- Skeletal Mage [npc 203] L22-23 ~Duskwood 80,71 (12 spawns)

## 148 Supplies from Darkshire  (L24 req20, 485 xp)
  - start: Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - end:   Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - next=149
  - text: Speak with Madame Eva.

## 149 Ghost Hair Thread  (L24 req20, 485 xp)
  - start: Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - end:   Blind Mary [npc 302] @ Duskwood 82.0,59.1
  - pre(any)=[148], next=154
  - text: Bring the Spectral Comb to Blind Mary.

## 154 Return the Comb  (L24 req20, 195 xp)
  - start: Blind Mary [npc 302] @ Duskwood 82.0,59.1
  - end:   Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - pre(any)=[149], next=157
  - text: Return the Ghost Hair Comb to Madame Eva in Darkshire.

## 156 Gather Rot Blossoms  (L24 req20, 970 xp)
  - start: Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - end:   Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - pre(any)=[158], next=159
  - text: Gather 8 Rot Blossoms and bring them to Tavernkeep Smitts in Darkshire.
  - objectives:
    1. item 8x Rot Blossom <- Skeletal Horror [npc 202] L23-24 ~Duskwood 44,51 (25 spawns); Skeletal Fiend [npc 531] L24-25 ~Duskwood 20,44 (13 spawns); Skeletal Fiend (Enraged Form) [npc 2454] L1-1

## 157 Deliver the Thread  (L24 req20, 1450 xp)
  - start: Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - end:   Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - pre(any)=[154], next=158
  - text: Bring the Ghost Hair Thread to Abercrombie, in his shack north of the Raven Hill Cemetery.

## 158 Zombie Juice  (L24 req20, 485 xp)
  - start: Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - end:   Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - pre(any)=[157], next=156
  - text: Speak with Tavernkeep Smitts.

## 159 Juice Delivery  (L24 req20, 970 xp)
  - start: Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - end:   Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - pre(any)=[156], next=133
  - text: Bring the Zombie Juice to Abercrombie at his shack.

## 90 Seasoned Wolf Kabobs  (L25 req18, 2000 xp)
  - start: Chef Grual [npc 272] @ Duskwood 73.8,43.5
  - end:   Chef Grual [npc 272] @ Duskwood 73.8,43.5
  - text: Gather 10 Lean Wolf Flanks and Stormwind Seasoning Herbs and return to Chef Grual in Darkshire.
  - objectives:
    1. item 10x Lean Wolf Flank <- Starving Dire Wolf [npc 213] L19-20 ~Duskwood 36,24 (38 spawns); Lupos [npc 521] L23-23 ~Duskwood 40,27 (16 spawns); Rabid Dire Wolf [npc 565] L20-21 ~Duskwood 28,31 (33 spawns); Black Ravager [npc 628] L24-25 ~Duskwood 62,42 (10 spawns)
    2. item 1x Stormwind Seasoning Herbs <- ?

## 95 Sven's Revenge  (L25 req20, 1000 xp)
  - start: Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - end:   Mound of loose dirt [object 59] @ Duskwood 49.9,77.7
  - next=230
  - text: Go to Sven's Farm and find what was buried behind the old stump.

## 101 The Totem of Infliction  (L25 req18, 2550 xp)
  - start: Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - end:   Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - text: Bring 10 Ghoul Fangs, 10 Skeleton Fingers and 5 Vials of Spider Venom to Madame Eva in Darkshire.
  - objectives:
    1. item 10x Ghoul Fang <- Flesh Eater [npc 3] L24-25 ~Duskwood 24,37 (9 spawns); Bone Chewer [npc 210] L26-27 ~Duskwood 23,33 (10 spawns); Brain Eater [npc 570] L28-29 ~Duskwood 24,30 (16 spawns); Plague Spreader [npc 604] L27-28 ~Duskwood 23,33 (22 spawns)
    2. item 1x Vial of Spider Venom <- Venom Web Spider [npc 217] L19-20 ~Duskwood 39,34 (34 spawns); Pygmy Venom Web Spider [npc 539] L18-19 ~Duskwood 33,36 (36 spawns); Green Recluse [npc 569] L21-22 ~Duskwood 48,31 (25 spawns); Naraxis [npc 574] L27-27 ~Duskwood 86,48 (1 spawns)
    3. item 1x Skeleton Finger <- Skeletal Warrior [npc 48] L21-22 ~Duskwood 79,71 (15 spawns); Skeletal Horror [npc 202] L23-24 ~Duskwood 44,51 (25 spawns); Skeletal Mage [npc 203] L22-23 ~Duskwood 80,71 (12 spawns); Skeletal Fiend [npc 531] L24-25 ~Duskwood 20,44 (13 spawns)

## 165 The Hermit  (L25 req17, 1000 xp)
  - start: Elaine Carevin [npc 633] @ Duskwood 75.3,48.8
  - end:   Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - next=148, breadcrumbFor=148
  - text: Check on the old man in the shack near Raven Hill cemetery.

## 174 Look To The Stars  (L25 req20, 2000 xp)
  - start: Viktori Prism'Antras [npc 276] @ Duskwood 79.8,48.0
  - end:   Viktori Prism'Antras [npc 276] @ Duskwood 79.8,48.0
  - next=175
  - text: Viktori Prism'Antras of Darkshire wants you to bring him a bronze tube.
  - objectives:
    1. item 1x Bronze Tube <- Crowd Pummeler 9-60 [npc 6229] L32-32; Box of Assorted Parts [object 19019] ~The Barrens 44,33 (3 spawns); Box of Assorted Parts [object 19020] ~The Barrens 48,85 (8 spawns)

## 175 Look To The Stars  (L25 req20, 1000 xp)
  - start: Viktori Prism'Antras [npc 276] @ Duskwood 79.8,48.0
  - end:   Blind Mary [npc 302] @ Duskwood 82.0,59.1
  - pre(any)=[174], next=177
  - text: Locate Mary and persuade her to give up a reflective surface for Viktori's project.

## 177 Look To The Stars  (L25 req20, 1500 xp)
  - start: Blind Mary [npc 302] @ Duskwood 82.0,59.1
  - end:   Viktori Prism'Antras [npc 276] @ Duskwood 79.8,48.0
  - pre(any)=[175], next=181
  - text: Retrieve Blind Mary's Looking Glass from the Insane Ghoul and give it to Viktori in Darkshire.
  - objectives:
    1. item 1x Mary's Looking Glass <- Insane Ghoul [npc 511] L26-26 ~Duskwood 81,72 (1 spawns)

## 230 Sven's Camp  (L25 req20, 1000 xp)
  - start: Mound of loose dirt [object 59] @ Duskwood 49.9,77.7
  - end:   Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - pre(any)=[95], next=262
  - text: Bring the Book from Sven's Farm to Sven.

## 262 The Shadowy Figure  (L25 req20, 510 xp)
  - start: Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - end:   Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - pre(any)=[230], next=265
  - text: Take the book you found at Sven's farm and show it to townsfolk in Darkshire.

## 265 The Shadowy Search Continues  (L25 req20, 200 xp)
  - start: Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - end:   Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - pre(any)=[262], next=266
  - text: See if other townsfolk have clues about the shadowy figure.

## 266 Inquire at the Inn  (L25 req20, 200 xp)
  - start: Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - end:   Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - pre(any)=[265], next=453
  - text: Search the inn for clues about the shadowy figure.

## 268 Return to Sven  (L25 req20, 510 xp)
  - start: Jitters [npc 288] @ Duskwood 18.4,56.4
  - end:   Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - pre(any)=[453], next=323
  - text: Return to Sven with Jitters' completed journal.

## 337 An Old History Book  (L25 req20, 1500 xp)
  - start: item An Old History Book [2794] (drops from Flesh Eater, Skeletal Warrior, Skeletal Horror)
  - end:   Milton Sheaf [npc 1440] @ Stormwind City 77.1,30.2
  - next=538
  - text: Return the book: The History of Stormwind, to the Stormwind Library.

## 453 Finding the Shadowy Figure  (L25 req20, 1000 xp)
  - start: Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - end:   Jitters [npc 288] @ Duskwood 18.4,56.4
  - pre(any)=[266], next=268
  - text: Find the Shadowy Figure. Your clues:
  - text: He is not native to Darkshire.
  - text: He is a nervous, jittery person.
  - text: He left Darkshire and headed west.

## 96137 Ira's Dagger  (L25 req18, 2000 xp, F)
  - start: Bath'rah the Windwatcher [npc 6176] @ Alterac Mountains 80.5,66.9; item Ira's Dagger [281143] (drops from Lost Stalker)
  - end:   Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - text: Defeat 10 Young Black Ravagers and 7 Black Ravagers then return to Sirra Von'Indi in Darkshire for more information.
  - objectives:
    1. kill 10x Young Black Ravager <- Young Black Ravager [npc 923] L23-24 ~Duskwood 43,64 (40 spawns)
    2. kill 1x Black Ravager <- Black Ravager [npc 628] L24-25 ~Duskwood 62,42 (10 spawns)

## 57 The Night Watch  (L26 req18, 2100 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - pre(any)=[56], next=58
  - text: Commander Althea Ebonlocke of Darkshire wants you to kill 15 Skeletal Fiends and 15 Skeletal Horrors.
  - objectives:
    1. kill 15x Skeletal Fiend <- Skeletal Fiend [npc 531] L24-25 ~Duskwood 20,44 (13 spawns)
    2. kill 15x Skeletal Horror <- Skeletal Horror [npc 202] L23-24 ~Duskwood 44,51 (25 spawns)

## 133 Ghoulish Effigy  (L27 req20, 1650 xp)
  - start: Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - end:   Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - pre(any)=[159], next=134
  - text: Gather 7 Ghoul Ribs and bring them to Abercrombie at his shack.
  - objectives:
    1. item 7x Ghoul Rib <- Flesh Eater [npc 3] L24-25 ~Duskwood 24,37 (9 spawns); Bone Chewer [npc 210] L26-27 ~Duskwood 23,33 (10 spawns); Brain Eater [npc 570] L28-29 ~Duskwood 24,30 (16 spawns); Plague Spreader [npc 604] L27-28 ~Duskwood 23,33 (22 spawns)

## 81730 Duskwood Mission I: Defeat Worgen  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Defeat 10 Nightmare Runners and 10 Nightmare Weavers in the Duskwood Nightmare Incursion in the Rotting Orchard and return to Field Captain Palandar.
  - objectives:
    1. kill 10x Nightmare Runner <- Nightmare Runner [npc 221171] L26-26 ~Duskwood 63,71 (45 spawns)
    2. kill 10x Nightmare Weaver <- Nightmare Weaver [npc 221172] L26-26 ~Duskwood 64,71 (27 spawns)

## 81731 Duskwood Mission II: Defeat Ogres  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Defeat 3 Deranged Ogres and 3 Demented Fire Weavers in the Duskwood Nightmare Incursion at the Vul'gol Ogre Mound and return to Field Captain Palandar.
  - objectives:
    1. kill 3x Deranged Ogre <- Deranged Ogre [npc 221174] L26-26 ~Duskwood 36,75 (39 spawns)
    2. kill 1x Demented Fire Weaver <- Demented Fire Weaver [npc 221175] L26-26 ~Duskwood 36,76 (38 spawns)

## 81732 Duskwood Mission III: Defeat Dragonkin  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Defeat 3 Wyrmkin Terrorwalkers and 10 Nightterror Whelps in the Duskwood Nightmare Incursion at the Yorgen Farmstead and return to Field Captain Palandar.
  - objectives:
    1. kill 3x Wyrmkin Terrorwalker <- Wyrmkin Terrorwalker [npc 221200] L26-26 ~Duskwood 50,74 (21 spawns)
    2. kill 1x Nightterror Whelp <- Nightterror Whelp [npc 221176] L26-26 ~Duskwood 49,73 (65 spawns)

## 81733 Duskwood Mission IV: Ogre Intelligence  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Gather intelligence from Dreamwarden Thalinar in the Duskwood Nightmare Incursion deep inside the Vul'gol Ogre Mound and return to Field Captain Palandar.
  - objectives:
    1. item 1x Intelligence Report: Vul'gol Ogre Mound <- ?

## 81734 Duskwood Mission V: Worgen Intelligence  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Gather intelligence from Dreamwarden Dorilar in the Duskwood Nightmare Incursion in the barn at the Rotting Orchard and return to Field Captain Palandar.
  - objectives:
    1. item 1x Intelligence Report: Rotting Orchard <- ?

## 81735 Duskwood Mission VI: Dragon Intelligence  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Gather intelligence from Dreamwarden Amalia in the Duskwood Nightmare Incursion in the farmhouse at the Yorgen Farmstead and return to Field Captain Palandar.
  - objectives:
    1. item 1x Intelligence Report: Yorgen Farmstead <- ?

## 81736 Duskwood Mission VII: Recover Shadowscythe  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Recover the Shadowscythe in the Duskwood Nightmare Incursion upstairs in the farmhouse at the Rotting Orchard and return to Field Captain Palandar.
  - objectives:
    1. item 1x Shadowscythe <- Mysterious Box [object 441114] ~Duskwood 66,67 (2 spawns)

## 81737 Duskwood Mission VIII: Recover Ogre Magi text  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Recover an Ogre Magi Text in the Duskwood Nightmare Incursion within the Vul'gol Ogre Mound and return to Field Captain Palandar.
  - objectives:
    1. item 1x Ogre Magi Text <- Ogre Magi Text [object 441113] ~Duskwood 37,82 (2 spawns)

## 81738 Duskwood Mission IX: Recover Dragon Egg  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Recover an Unhatched Green Dragon Egg in the Duskwood Nightmare Incursion from the Yorgen Farmstead near the large stump in the fields and return to Field Captain Palandar.
  - objectives:
    1. item 1x Unhatched Green Dragon Egg <- Unhatched Green Dragon Egg [object 441119] ~Duskwood 49,72 (4 spawns)

## 81739 Duskwood Mission X: Nightmare Moss  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Gather 10 Nightmare Moss in the Duskwood Nightmare Incursions and return to Field Captain Palandar.
  - objectives:
    1. item 10x Nightmare Moss <- ?

## 81740 Duskwood Mission XI: Cold Iron Ore  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Gather 10 Cold Iron Ore in the Duskwood Nightmare Incursions and return to Field Captain Palandar.
  - objectives:
    1. item 10x Cold Iron Ore <- ?

## 81741 Duskwood Mission XII: Dream-Touched Dragonscale  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Gather 10 Dream-Touched Dragonscales in the Duskwood Nightmare Incursions and return to Field Captain Palandar.
  - objectives:
    1. item 10x Dream-Touched Dragonscale <- Nightterror Whelp [npc 221176] L26-26 ~Duskwood 49,73 (65 spawns); Wyrmkin Terrorwalker [npc 221200] L26-26 ~Duskwood 50,74 (21 spawns); Ylanthrius [npc 221204] L9999-9999 ~Duskwood 49,73 (72 spawns)

## 81742 Duskwood Mission XIII: Defeat Ylanthrius  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Defeat Ylanthrius in the Duskwood Nightmare Incursion at the Yorgen Farmstead field and return to Field Captain Palandar.
  - objectives:
    1. kill 1x Ylanthrius <- Ylanthrius [npc 221204] L9999-9999 ~Duskwood 49,73 (72 spawns)

## 81743 Duskwood Mission XIV: Defeat Vvarc'zul  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Defeat Vvarc'zul in the Duskwood Nightmare Incursion deep in the Vul'gol Ogre Mound and return to Field Captain Palandar.
  - objectives:
    1. kill 1x Vvarc' Zul <- Vvarc' Zul [npc 221206] L9999-9999 ~Duskwood 37,84 (6 spawns)

## 81744 Duskwood Mission XV: Defeat Amokarok  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Defeat Amokarok in the Duskwood Nightmare Incursion at a campsite near the barn in the Rotting Orchard and return to Field Captain Palandar.
  - objectives:
    1. kill 1x Amokarok <- Amokarok [npc 221207] L9999-9999 ~Duskwood 66,76 (4 spawns)

## 81745 Duskwood Mission XVI: Rescue Kroll Mountainshade  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Rescue Kroll Mountainshade from the Duskwood Nightmare Incursion in the guest house at the Rotting Orchard and return to Field Captain Palandar.

## 81746 Duskwood Mission XVII: Rescue Alara Grovemender  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Rescue Alara Grovemender in the Duskwood Nightmare Incursion in the stable at the Yorgen Farmstead and return to Field Captain Palandar.

## 81747 Duskwood Mission XVIII: Rescue Elenora Marshwalker  (L27 req23, ? xp, F)
  - start: Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - end:   Field Captain Palandar [npc 221471] @ Duskwood 45.4,51.2 (+3 spawns)
  - text: Rescue Elenora Marshwalker in the Duskwood Nightmare Incursion in the ruins of a farmhouse near the Vul'gol Ogre Mound and return to Field Captain Palandar.

## 66 The Legend of Stalvan  (L28 req22, 230 xp)
  - start: Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - end:   Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - next=67
  - text: Seek out the Clerk Daltry in the Darkshire Town Hall.

## 67 The Legend of Stalvan  (L28 req22, 1150 xp)
  - start: Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - end:   Old Footlocker [object 3643] @ Westfall 41.5,66.7
  - pre(any)=[66], next=68
  - text: Travel to the Moonbrook Schoolhouse and bring back any updated information about Stalvan to Clerk Daltry.

## 68 The Legend of Stalvan  (L28 req22, 1700 xp)
  - start: Old Footlocker [object 3643] @ Westfall 41.5,66.7
  - end:   Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - pre(any)=[67], next=69
  - text: Take the Dusty Unsent Letter to Clerk Daltry.

## 69 The Legend of Stalvan  (L28 req22, 570 xp)
  - start: Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - end:   Innkeeper Farley [npc 295] @ Elwynn Forest 43.8,65.8
  - pre(any)=[68], next=70
  - text: Go to The Lion's Pride Inn to see if anyone there has heard of the name Stalvan.

## 70 The Legend of Stalvan  (L28 req22, 1700 xp)
  - start: Innkeeper Farley [npc 295] @ Elwynn Forest 43.8,65.8
  - end:   Caretaker Folsom [npc 297] @ Stormwind City 42.5,72.4
  - pre(any)=[69], next=72
  - text: Retrieve Stalvan's Undelivered Letter from the chest and deliver it to the Canal District in Stormwind.
  - objectives:
    1. item 1x An Undelivered Letter <- Storage Chest [object 1560] ~Elwynn Forest 44,66 (1 spawns)

## 72 The Legend of Stalvan  (L28 req22, 230 xp)
  - start: Caretaker Folsom [npc 297] @ Stormwind City 42.5,72.4
  - end:   Sealed Crate [object 1561] @ Stormwind City 42.5,72.0
  - pre(any)=[70], next=74
  - text: Search through the packed up possessions for a clue.

## 74 The Legend of Stalvan  (L28 req22, 1150 xp)
  - start: Sealed Crate [object 1561] @ Stormwind City 42.5,72.0
  - end:   Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - pre(any)=[72], next=75
  - text: The Torn Journal page you discovered provides your next clue.

## 75 The Legend of Stalvan  (L28 req22, 1150 xp)
  - start: Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - end:   Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - pre(any)=[74], next=78
  - text: Marshal Haggard wants you to check the chest upstairs for the Faded Journal Page.
  - objectives:
    1. item 1x A Faded Journal Page <- Marshal Haggard's Chest [object 1562] ~Elwynn Forest 86,70 (1 spawns)

## 78 The Legend of Stalvan  (L28 req22, 570 xp)
  - start: Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - end:   Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - pre(any)=[75], next=79
  - text: Take the Faded Journal Page to Tavernkeep Smitts.

## 79 The Legend of Stalvan  (L28 req22, 230 xp)
  - start: Tavernkeep Smitts [npc 273] @ Duskwood 73.8,44.5
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - pre(any)=[78], next=80
  - text: Take the muddy page to Commander Ebonlocke.

## 80 The Legend of Stalvan  (L28 req22, 230 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - pre(any)=[79], next=97
  - text: Show Clerk Daltry the Bloodstained Journal Page.

## 97 The Legend of Stalvan  (L28 req22, 230 xp)
  - start: Clerk Daltry [npc 267] @ Duskwood 72.5,46.9
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - pre(any)=[80], next=98
  - text: Report the news to Commander Ebonlocke.

## 173 Worgen in the Woods  (L28 req23, 1150 xp)
  - start: Calor [npc 663] @ Duskwood 75.8,47.6
  - end:   Calor [npc 663] @ Duskwood 75.8,47.6
  - next=221
  - text: Kill 6 Nightbane Shadow Weaver worgen for Calor in Darkshire.
  - objectives:
    1. kill 6x Nightbane Shadow Weaver <- Nightbane Shadow Weaver [npc 533] L27-28 ~Duskwood 63,55 (27 spawns)

## 323 Proving Your Worth  (L28 req20, 2300 xp)
  - start: Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - end:   Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - pre(any)=[268], next=269
  - text: Kill 15 Skeletal Raiders, 3 Skeletal Healers and 3 Skeletal Warders, and then return to Sven.
  - objectives:
    1. kill 15x Skeletal Raider <- Skeletal Raider [npc 1110] L27-28 ~Duskwood 16,36 (16 spawns)
    2. kill 15x Skeletal Healer <- Skeletal Healer [npc 787] L26-27 ~Duskwood 16,36 (13 spawns)
    3. kill 15x Skeletal Warder <- Skeletal Warder [npc 785] L28-29 ~Duskwood 16,34 (17 spawns)

## 221 Worgen in the Woods  (L29 req23, 1750 xp)
  - start: Calor [npc 663] @ Duskwood 75.8,47.6
  - end:   Calor [npc 663] @ Duskwood 75.8,47.6
  - pre(any)=[173], next=222
  - text: Kill 12 Nightbane Dark Runner worgen for Calor in Darkshire.
  - objectives:
    1. kill 12x Nightbane Dark Runner <- Nightbane Dark Runner [npc 205] L28-29 ~Duskwood 64,61 (57 spawns)

## 269 Seeking Wisdom  (L29 req20, 590 xp)
  - start: Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - end:   Bishop Farthing [npc 1212] @ Stormwind City 49.9,46.0
  - pre(any)=[323], next=270
  - text: Give Jitters' Completed Journal to Bishop Farthing in Stormwind.

## 270 The Doomed Fleet  (L29 req20, 1200 xp)
  - start: Bishop Farthing [npc 1212] @ Stormwind City 49.9,46.0
  - end:   Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - pre(any)=[269], next=321
  - text: Go to Menethil Harbor in the Wetlands, and speak with Glorin Steelbrow.

## 321 Lightforge Iron  (L29 req20, 590 xp)
  - start: Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - end:   Waterlogged Chest [object 2734] @ Wetlands 12.1,64.2
  - pre(any)=[270], next=324
  - text: Search the wreckage of The Flying Osprey in the Wetlands.

## 322 Blessed Arm  (L29 req20, 1200 xp)
  - start: Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - pre(any)=[324], next=325
  - text: Take the Crate of Lightforge Ingots to Grimand Elmore in Stormwind.

## 324 The Lost Ingots  (L29 req20, 1750 xp)
  - start: Waterlogged Chest [object 2734] @ Wetlands 12.1,64.2
  - end:   Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - pre(any)=[321], next=322, exclusiveTo=[526]
  - text: Gather 5 Lightforge Ingots, then return to Glorin Steelbrow in the Wetlands.
  - objectives:
    1. item 5x Lightforge Ingot <- Bluegill Raider [npc 1418] L28-29 ~Wetlands 17,49 (44 spawns)

## 325 Armed and Ready  (L29 req20, 590 xp)
  - start: Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - end:   Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - pre(any)=[322], next=55
  - text: Bring Morbent's Bane to Sven in Duskwood.

## 526 Lightforge Ingots  (L29 req20, 1750 xp)
  - start: Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - end:   Glorin Steelbrow [npc 1217] @ Wetlands 10.6,60.6
  - pre(any)=[321], next=322, exclusiveTo=[324]
  - text: Gather 5 lightforge ingots, then return to Glorin Steelbrow in the Wetlands.
  - objectives:
    1. item 1x Lightforge Ingot <- Bluegill Raider [npc 1418] L28-29 ~Wetlands 17,49 (44 spawns)

## 58 The Night Watch  (L30 req18, 2450 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - pre(any)=[57]
  - text: Commander Althea Ebonlocke of Darkshire wants you to kill 20 Plague Spreaders in the eastern Raven Hill mausoleum.
  - objectives:
    1. kill 20x Plague Spreader <- Plague Spreader [npc 604] L27-28 ~Duskwood 23,33 (22 spawns)

## 134 Ogre Thieves  (L30 req20, 1200 xp)
  - start: Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - end:   Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - pre(any)=[133], next=160
  - text: Return Abercrombie's Crate to Abercrombie.
  - objectives:
    1. item 1x Abercrombie's Crate <- Abercrombie's Crate [object 119] ~Duskwood 33,76 (1 spawns); Abercrombie's Crate [object 167] ~Duskwood 33,76 (1 spawns)

## 160 Note to the Mayor  (L30 req20, 610 xp)
  - start: Abercrombie [npc 289] @ Duskwood 28.1,31.5
  - end:   Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - pre(any)=[134], next=251
  - text: Bring Abercrombie's Letter to Ello Ebonlocke, Mayor of Darkshire.

## 181 Look To The Stars  (L30 req20, 2450 xp)
  - start: Viktori Prism'Antras [npc 276] @ Duskwood 79.8,48.0
  - end:   Viktori Prism'Antras [npc 276] @ Duskwood 79.8,48.0
  - pre(any)=[177]
  - text: Locate Zzarc'Vul in the southern ogre mound in Duskwood and return his monocle to Viktori in Darkshire.
  - objectives:
    1. item 1x Ogre's Monocle <- Zzarc' Vul [npc 300] L30-30 ~Duskwood 37,81 (3 spawns)

## 251 Translate Abercrombie's Note  (L30 req20, 245 xp)
  - start: Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - end:   Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - pre(any)=[160], next=401
  - text: Bring the Letter to Ello to Sirra Von'Indi.

## 252 Translation to Ello  (L30 req20, 245 xp)
  - start: Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - end:   Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - pre(any)=[401], next=253
  - text: Bring the Translated Letter to Lord Ello Ebonlocke

## 253 Bride of the Embalmer  (L30 req20, 3650 xp)
  - start: Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - end:   Lord Ello Ebonlocke [npc 263] @ Duskwood 71.9,46.4
  - pre(any)=[252]
  - text: Find Eliza's grave. Retrieve the Embalmer's Heart from her, then return to Ello Ebonlocke.
  - objectives:
    1. item 1x The Embalmer's Heart <- Eliza [npc 314] L31-31 ~Duskwood 29,31 (1 spawns)

## 401 Wait for Sirra to Finish  (L30 req20, 1850 xp)
  - start: Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - end:   Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - pre(any)=[251], next=252
  - text: Wait a moment, then speak with Sirra Von'Indi again.

## 96138 Merrick's Bow  (L30 req18, 2450 xp, F)
  - start: item Merrick's Bow [281142] (drops from Lost Watcher)
  - end:   Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - text: Defeat 8 Splinter Fist Warriors and 4 Splinter Fist Taskmasters then return to Sirra Von'Indi in Darkshire for more information.
  - objectives:
    1. kill 8x Splinter Fist Warrior <- Splinter Fist Warrior [npc 212] L29-30 ~Duskwood 34,75 (11 spawns)
    2. kill 8x Splinter Fist Taskmaster <- Splinter Fist Taskmaster [npc 892] L27-28 ~Duskwood 36,72 (4 spawns)

## 222 Worgen in the Woods  (L31 req23, 1900 xp)
  - start: Calor [npc 663] @ Duskwood 75.8,47.6
  - end:   Calor [npc 663] @ Duskwood 75.8,47.6
  - pre(any)=[221], next=223
  - text: Kill 8 Nightbane Vile Fang and 8 Nightbane Tainted One worgen for Calor in Darkshire.
  - objectives:
    1. kill 8x Nightbane Vile Fang <- Nightbane Vile Fang [npc 206] L29-30 ~Duskwood 70,73 (21 spawns)
    2. kill 8x Nightbane Tainted One <- Nightbane Tainted One [npc 920] L30-31 ~Duskwood 67,80 (14 spawns)

## 223 Worgen in the Woods  (L31 req23, 3150 xp)
  - start: Calor [npc 663] @ Duskwood 75.8,47.6
  - end:   Jonathan Carevin [npc 661] @ Duskwood 75.3,49.0
  - pre(any)=[222]
  - text: Bring Calor's note to Jonathan Carevin.

## 55 Morbent Fel  (L32 req20, 3850 xp)
  - start: Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - end:   Sven Yorgen [npc 311] @ Duskwood 7.8,34.1
  - pre(any)=[325]
  - text: Use Morbent's Bane on Morbent Fel, kill Morbent Fel, then return Morbent's Bane to Sven at his camp.
  - objectives:
    1. kill 1x Morbent Fel <- Morbent Fel [npc 1200] L32-32 ~Duskwood 17,33 (1 spawns)

## 98 The Legend of Stalvan  (L35 req22, 4100 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Madame Eva [npc 265] @ Duskwood 75.8,45.3
  - pre(any)=[97]
  - text: Kill Stalvan Mistmantle and show Madame Eva his family ring.
  - objectives:
    1. item 1x Mistmantle Family Ring <- Stalvan Mistmantle [npc 315] L32-32 ~Duskwood 77,36 (1 spawns)

## 225 The Weathered Grave  (L35 req28, 690 xp)
  - start: A Weathered Grave [object 61] @ Duskwood 17.7,29.1
  - end:   Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - next=227
  - text: Speak with Sirra Von'Indi in Darkshire.

## 227 Morgan Ladimore  (L35 req28, 275 xp)
  - start: Sirra Von'Indi [npc 268] @ Duskwood 72.6,47.6
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - pre(any)=[225], next=228
  - text: Speak with Commander Althea Ebonlocke in Darkshire.

## 228 Mor'Ladim  (L35 req28, 2750 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - pre(any)=[227], next=229
  - text: Kill Mor'Ladim, then return his skull to Commander Althea Ebonlocke in Darkshire.
  - objectives:
    1. item 1x Mor'Ladim's Skull <- Mor'Ladim [npc 522] L35-35 ~Duskwood 17,37 (1 spawns)

## 229 The Daughter Who Lived  (L35 req28, 275 xp)
  - start: Commander Althea Ebonlocke [npc 264] @ Duskwood 73.5,46.8
  - end:   Watcher Ladimore [npc 576] @ Duskwood 74.0,47.8
  - pre(any)=[228], next=231
  - text: Speak with Watcher Sarah Ladimore in Darkshire.

## 231 A Daughter's Love  (L35 req28, 1350 xp)
  - start: Watcher Ladimore [npc 576] @ Duskwood 74.0,47.8
  - end:   A Weathered Grave [object 61] @ Duskwood 17.7,29.1
  - pre(any)=[229]
  - text: Take Sarah Ladimore's ring to Morgan Ladimore's grave.

## 254 Digging Through the Dirt  (L35 req20, ? xp, repeatable)
  - start: Eliza's Grave Dirt [object 51708] @ Duskwood 28.9,30.8
  - end:   Eliza's Grave Dirt [object 51708] @ Duskwood 28.9,30.8

## 1395 Supplies for Nethergarde  (L45 req40, 2900 xp)
  - start: Watchmaster Sorigal [npc 5464] @ Duskwood 75.8,46.2
  - end:   Quartermaster Lungertz [npc 5393] @ Blasted Lands 66.5,21.4
  - text: Bring the Crate of Powerstones to Quartermaster Lungertz, before the powerstones expire.

## 98372 An Unfortunate End  (L60 req1, ? xp, F)
  - start: Night Watch Guard [npc 271866] @ Duskwood 20.9,34.4 (+8 spawns)
  - end:   Night Watch Guard [npc 271866] @ Duskwood 20.9,34.4 (+8 spawns)

## 99267 An Unfortunate End  (L60 req1, ? xp, F)
  - start: Night Watch Guard [npc 271866] @ Duskwood 20.9,34.4 (+8 spawns)
  - end:   Night Watch Guard [npc 271866] @ Duskwood 20.9,34.4 (+8 spawns)

# Service NPCs

- Gavin Gnarltree <Weaponsmith> [npc 225] 73.6,50.0: repair, vendor
- Morg Gnarltree <Armorer> [npc 226] 74.0,48.9: repair, vendor
- Mabel Solaj <General Goods Vendor> [npc 227] 74.2,44.8: vendor
- Avette Fellwood <Bowyer> [npc 228] 73.0,44.4: repair, vendor
- Barkeep Hann <Bartender> [npc 274] 73.7,44.0: vendor
- Gunder Thornbush <Tradesman> [npc 960] 73.8,45.1: vendor
- Lohgan Eva <Tailoring Supplies> [npc 1672] 75.7,44.6: vendor
- Alyssa Eva <Reagent Vendor> [npc 1673] 76.3,45.3: vendor
- Finbus Geargrind <Expert Engineer> [npc 1676] 77.4,48.8: trainer
- Felicia Maline <Gryphon Master> [npc 2409] 77.5,44.3: flightMaster
- Bliztik <Alchemy Supplies> [npc 2481] 18.0,54.4: vendor
- Danielle Zipstitch <Tailoring Supplies> [npc 2668] 75.9,45.6: vendor
- Sheri Zipstitch <Tailoring Supplies> [npc 2669] 75.7,45.6: vendor
- Herble Baubbletump <Engineering and Mining Supplies> [npc 3133] 78.0,48.3: vendor
- Kzixx <Rare Goods> [npc 3134] 81.8,19.8: vendor
- Malissa <Poison Supplier> [npc 3135] 79.4,44.3: vendor
- Clarise Gnarltree <Expert Blacksmith> [npc 3136] 74.0,48.5: trainer
- Matt Johnson <Mining Trainer> [npc 3137] 74.0,49.6: trainer
- Scott Carevin <Mushroom Seller> [npc 3138] 75.8,48.7: vendor
- Spirit Healer <> [npc 6491] 20.0,49.2: spiritHealer
- Innkeeper Trelayne <Innkeeper> [npc 6790] 73.9,44.4: innkeeper, vendor
- Steven Black <Stable Master> [npc 10062] 74.0,46.1: stableMaster
- Quartermaster Falinar <> [npc 222684] 45.6,51.2: repair, vendor
