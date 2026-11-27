# Stormwind City: Alliance + neutral quests (219)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 1716 Devourer of Souls  (L-1 req20, 780 xp, class=Warlock, sort=WARLOCK)
  - start: Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - end:   Takar the Seer [npc 6244] @ The Barrens 49.3,57.1
  - next=1738
  - text: Speak with Takar the Seer in the Barrens.

## 579 Stormwind Library  (L1 req1, ? xp, repeatable)
  - start: Donyal Tovald [npc 2504] @ Stormwind City 75.0,30.1
  - end:   Donyal Tovald [npc 2504] @ Stormwind City 75.0,30.1
  - objectives:
    1. item 1x Library Scrip <- ?

## 8827 Winter's Presents  (L1 req1, 10 xp, sort=SEASONAL)
  - start: Wonderform Operator [npc 15732] @ Stormwind City 67.9,71.4
  - end:   Greatfather Winter [npc 13444] @ Ironforge 33.2,65.4
  - text: Speak with Greatfather Winter. He is located near the Smokywood Pastures vendor area in Ironforge.

## 332 Wine Shop Advert  (L2 req1, 130 xp)
  - start: Renato Gallina [npc 1432] @ Stormwind City 63.8,73.6
  - end:   Suzetta Gallina [npc 1431] @ Stormwind City 60.3,76.8
  - text: Go to the Gallina Winery, and bring Suzetta Gallina the Wine Ticket for a free bottle of wine.

## 333 Harlan Needs a Resupply  (L2 req1, 85 xp)
  - start: Harlan Bagley [npc 1427] @ Stormwind City 62.3,68.0
  - end:   Rema Schneider [npc 1428] @ Stormwind City 58.1,67.5
  - text: Go to the Canal Tailor Shop and bring Rema Schneider the Cloth Request from Harlan Bagley.

## 334 Package for Thurman  (L2 req1, 130 xp)
  - start: Rema Schneider [npc 1428] @ Stormwind City 58.1,67.5
  - end:   Thurman Schneider [npc 1429] @ Stormwind City 52.6,83.4
  - text: Go to the Larson Clothiers in the Stormwind Mage Quarter, and give Thurman Schneider his Sewing Kit.

## 9260 Investigate the Scourge of Stormwind  (L6 req1, 405 xp, sort=INVASION)
  - start: Lieutenant Orrin [npc 16478] @ Stormwind City 69.0,82.9
  - end:   Lieutenant Orrin [npc 16478] @ Stormwind City 69.0,82.9
  - text: Collect three Dim Necrotic Stones from the Scourge outside Stormwind and investigate the glowing runic circles near their encampment.
  - objectives:
    1. item 1x Dim Necrotic Stone <- Skeletal Soldier [npc 16422] L6-7 ~Elwynn Forest 40,55 (51 spawns); Spectral Apparition [npc 16423] L6-7 ~Elwynn Forest 41,55 (48 spawns); Spectral Spirit [npc 16437] L9-10 ~Dun Morogh 42,39 (54 spawns); Skeletal Trooper [npc 16438] L9-10 ~Dun Morogh 43,38 (56 spawns)

## 1639 Bartleby the Drunk  (L10 req10, 85 xp, class=Warrior, sort=WARRIOR)
  - start: Harry Burlguard [npc 6089] @ Stormwind City 77.1,53.3
  - end:   Bartleby [npc 6090] @ Stormwind City 76.8,52.5
  - next=1640, exclusiveTo=[1678, 1683]
  - text: Speak with Bartleby.

## 1640 Beat Bartleby  (L10 req10, 210 xp, class=Warrior, sort=WARRIOR)
  - start: Bartleby [npc 6090] @ Stormwind City 76.8,52.5
  - end:   Bartleby [npc 6090] @ Stormwind City 76.8,52.5
  - pre(any)=[1639, 1678, 1683], next=1665
  - text: Beat Bartleby, then talk to him.
  - objectives:
    1. kill 1x Bartleby <- Bartleby [npc 6090] L10-10 ~Stormwind City 77,53 (1 spawns)

## 1665 Bartleby's Mug  (L10 req10, 420 xp, class=Warrior, sort=WARRIOR)
  - start: Bartleby [npc 6090] @ Stormwind City 76.8,52.5
  - end:   Harry Burlguard [npc 6089] @ Stormwind City 77.1,53.3
  - pre(any)=[1640], next=1666
  - text: Bring Bartleby's Mug to Burlguard

## 1666 Marshal Haggard  (L10 req10, 420 xp, class=Warrior, sort=WARRIOR)
  - start: Harry Burlguard [npc 6089] @ Stormwind City 77.1,53.3
  - end:   Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - pre(any)=[1665], next=1667
  - text: Speak with Marshal Haggard.

## 1688 Surena Caledon  (L10 req10, 630 xp, class=Warlock, sort=WARLOCK)
  - start: Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - next=1689
  - text: Retrieve Surena's Choker for Gakin the Darkbinder in Stormwind.
  - objectives:
    1. item 1x Surena's Choker <- Surena Caledon [npc 881] L9-9 ~Elwynn Forest 71,81 (1 spawns)

## 1689 The Binding  (L10 req10, 630 xp, class=Warlock, sort=WARLOCK)
  - start: Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - pre(any)=[1688]
  - text: Using the Bloodstone Choker, summon and subdue a voidwalker, then return the Bloodstone Choker to Gakin the Darkbinder in Stormwind.
  - objectives:
    1. kill 1x Summoned Voidwalker <- Summoned Voidwalker [npc 5676] L10-10

## 1861 Mirror Lake  (L10 req10, 840 xp, races=Human/Gnome/Skyborne, class=Mage, sort=MAGE)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - exclusiveTo=[1880]
  - text: Bring a Mirror Lake sample to Jennea Cannon in Stormwind.
  - objectives:
    1. item 1x Mirror Lake Water Sample <- Mirror Lake Waterwall [object 174794] ~Elwynn Forest 29,61 (1 spawns)

## 2206 Snatch and Grab  (L10 req10, 840 xp, class=Rogue, sort=ROGUE)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[2205]
  - text: Find the Defias Dockmaster and recover the Shipping Schedule for Master Mathias Shaw.
  - objectives:
    1. item 1x Defias Shipping Schedule <- Defias Dockmaster [npc 6846] L10-10 ~Elwynn Forest 48,87 (1 spawns)

## 5631 Returning Home  (L10 req10, 210 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5627, 5628, 5629, 5630, 5632, 5633]
  - text: Speak to Priestess Alathea in Darnassus.

## 5632 Returning Home  (L10 req10, 210 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Nara Meideros [npc 11397] @ Stormwind City 35.7,63.2
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5627, 5628, 5629, 5630, 5631, 5633]
  - text: Speak to Priestess Alathea in Darnassus.

## 5634 Desperate Prayer  (L10 req10, ? xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5635, 5636, 5637, 5638, 5639, 5640]

## 5638 Desperate Prayer  (L10 req10, ? xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: Nara Meideros [npc 11397] @ Stormwind City 35.7,63.2
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5634, 5635, 5636, 5637, 5639, 5640]
  - text: Speak to High Priestess Laurena in Stormwind.

## 5924 Heeding the Call  (L10 req10, 85 xp, races=NightElf, class=Druid, sort=DRUID)
  - start: Theridran [npc 5505] @ Stormwind City 36.1,64.4
  - end:   Mathrengyl Bearwalker [npc 4217] @ Darnassus 35.4,8.4
  - next=5921, breadcrumbFor=5921, exclusiveTo=[5923, 5925]
  - text: Speak with Mathrengyl Bearwalker in the Cenarion Enclave, Darnassus.

## 6073 The Hunter's Path  (L10 req10, 85 xp, races=NightElf, class=Hunter, sort=HUNTER)
  - start: Einris Brightspear [npc 5515] @ Stormwind City 67.3,36.2
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - next=6063, breadcrumbFor=6063, exclusiveTo=[6071, 6072, 6721, 6722]
  - text: Speak with Dazalar in Dolanaar.

## 6076 The Hunter's Path  (L10 req10, 85 xp, races=Dwarf, class=Hunter, sort=HUNTER)
  - start: Einris Brightspear [npc 5515] @ Stormwind City 67.3,36.2
  - end:   Grif Wildheart [npc 1231] @ Dun Morogh 45.8,53.0
  - next=6064, breadcrumbFor=6064, exclusiveTo=[6074, 6075]
  - text: Speak with Grif Wildheart in Kharanos.

## 94773 Divine Grace  (L10 req10, ? xp, F, races=Human, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[94774, 94775, 94776, 94777, 94778, 94779]

## 94777 Divine Grace  (L10 req10, 210 xp, F, races=Human, class=Priest, sort=PRIEST)
  - start: Nara Meideros [npc 11397] @ Stormwind City 35.7,63.2
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[94773, 94774, 94775, 94776, 94778, 94779]
  - text: Speak to High Priestess Laurena in Stormwind.

## 94821 Confounding Flash  (L10 req10, 210 xp, F, races=Gnome, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   High Priestess Mims [npc 258785] @ Dun Morogh 55.0,22.4 (+1 spawns)
  - exclusiveTo=[94817, 94822, 94823, 94824, 94825, 94826]
  - text: Speak to High Priestess Mims in Ironforge.

## 94914 Moonglade  (L10 req10, 210 xp, F, races=Skyborne, class=Druid, sort=DRUID)
  - start: Sheldras Moontree [npc 5504] @ Stormwind City 35.8,67.4
  - end:   Dendrite Starblaze [npc 11802] @ Moonglade 56.2,30.6
  - text: Use the spell "Teleport: Moonglade" to travel to Moonglade. When you arrive, speak with Dendrite Starblaze in the village of Nighthaven.

## 1641 The Tome of Divinity  (L12 req12, ? xp, races=Human, class=Paladin, sort=PALADIN, repeatable)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - next=1642

## 1643 The Tome of Divinity  (L12 req12, 455 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Stephanie Turner [npc 6174] @ Stormwind City 63.8,72.2
  - pre(any)=[1642], next=1644
  - text: Search the Trade District of Stormwind for Stephanie Turner.

## 1790 The Symbol of Life  (L12 req12, ? xp, races=Human, class=Paladin, sort=PALADIN, repeatable)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - pre(any)=[1781], exclusiveTo=[1787]

## 3000 Tome of Divinity  (L12 req12, 225 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - next=1646, breadcrumbFor=1646, exclusiveTo=[2997, 2999]
  - text: Speak to Tiza Battleforge in Ironforge.

## 6661 Deeprun Rat Roundup  (L12 req10, 910 xp)
  - start: Monty [npc 12997] @ no spawn
  - end:   Monty [npc 12997] @ no spawn
  - next=6662
  - text: Capture 5 Deeprun Rats by using the Rat Catcher's Flute. Lead the rats back to Monty. Don't forget to turn in the flute when you're finished.
  - objectives:
    1. kill 5x Deeprun Rat <- Deeprun Rat [npc 13016] L1-1

## 6662 Me Brother, Nipsy  (L12 req10, 90 xp)
  - start: Monty [npc 12997] @ no spawn
  - end:   Nipsy [npc 13018] @ no spawn
  - pre(any)=[6661]
  - text: Take the Carton of Mystery Meat to Nipsy at the Stormwind Deeprun Tram Depot.

## 95065 Fishin' Time  (L12 req7, 680 xp, F)
  - start: Gilbert Gray [npc 267118] @ Stormwind City 26.1,47.1
  - end:   Gilbert Gray [npc 267118] @ Stormwind City 26.1,47.1
  - text: Bring 1 Shiny Bauble and 3 Nightcrawlers to Gilbert Gray at the harbor in Stormwind.
  - objectives:
    1. item 1x Shiny Bauble <- Fishing Hut [object 612092] ~Western Plaguelands 57,39 (5 spawns)
    2. item 1x Nightcrawlers <- Fishing Hut [object 612092] ~Western Plaguelands 57,39 (5 spawns)

## 1644 The Tome of Divinity  (L13 req12, 910 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Stephanie Turner [npc 6174] @ Stormwind City 63.8,72.2
  - end:   Stephanie Turner [npc 6174] @ Stormwind City 63.8,72.2
  - pre(any)=[1643], next=1780
  - text: Bring 10 Linen Cloth to Stephanie Turner in Stormwind.
  - objectives:
    1. item 10x Linen Cloth <- Hidden Strongbox [object 2039] ~Alterac Mountains 19,67 (16 spawns); Battered Chest [object 2844]; Tattered Chest [object 2845]; Tattered Chest [object 2847]

## 1780 The Tome of Divinity  (L13 req12, 230 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Stephanie Turner [npc 6174] @ Stormwind City 63.8,72.2
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - pre(any)=[1644], next=1781
  - text: Speak to Duthorian Rall in Stormwind.

## 1781 The Tome of Divinity  (L13 req12, ? xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Gazin Tenorm [npc 6173] @ Stormwind City 49.5,45.0
  - pre(any)=[1780], next=1786
  - text: Take the Symbol of Life to Gazin Tenorm in Stormwind.

## 1786 The Tome of Divinity  (L13 req12, 680 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Gazin Tenorm [npc 6173] @ Stormwind City 49.5,45.0
  - end:   Henze Faulk [npc 6172] @ Elwynn Forest 72.6,51.4
  - pre(any)=[1781], next=1787
  - text: Take the Symbol of Life and resurrect Henze Faulk in Elwynn.
  - objectives:
    1. kill 1x Henze Faulk <- Henze Faulk [npc 6172] L10-10 ~Elwynn Forest 73,51 (1 spawns)

## 1788 The Tome of Divinity  (L13 req12, 1150 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Gazin Tenorm [npc 6173] @ Stormwind City 49.5,45.0
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - pre(any)=[1787]
  - text: Speak to Duthorian Rall in Stormwind.

## 93963 Exploring the Alliance  (L13 req7, 1150 xp, F, races=Skyborne)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - pre(any)=[94947]
  - text: Speak with Randal Emerson in Stormwind Keep to receive further instructions. Use the instructions received to locate and speak with King Magni Bronzebeard, High Tinker Mekkatorque, and Tyrande Whisperwind.
  - objectives:
    1. kill 1x Randal Emerson <- Randal Emerson [npc 275491] L40-40 ~Stormwind City 79,45 (1 spawns)
    2. kill 1x High Tinker Mekkatorque <- High Tinker Mekkatorque [npc 7937] L63-63 ~Ironforge 69,49 (1 spawns)
    3. kill 1x King Magni Bronzebeard <- King Magni Bronzebeard [npc 2784] L63-63 ~Ironforge 39,56 (1 spawns)
    4. kill 1x Tyrande Whisperwind <- Tyrande Whisperwind [npc 7999] L63-63 ~Darnassus 39,82 (1 spawns)

## 94947 Welcome to Azeroth  (L13 req7, 680 xp, F, races=Skyborne)
  - start: Denaaris Stargale [npc 259084] @ Alterac Mountains 12.3,56.3
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - next=93963
  - text: Take the Skyborne Portal to Stormwind and report to Bolvar Fordragon in Stormwind Keep.
  - objectives:
    1. object 1x Skyborne Portal to Stormwind <- Skyborne Portal to Stormwind [object 631299] ~Alterac Mountains 12,56 (1 spawns)

## 353 Stormpike's Delivery  (L15 req9, 1050 xp)
  - start: Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - end:   Mountaineer Stormpike [npc 1343] @ Loch Modan 24.8,18.4
  - text: Deliver the Package for Stormpike to Mountaineer Stormpike in Loch Modan.

## 399 Humble Beginnings  (L15 req10, 1050 xp)
  - start: Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - end:   Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - text: Go to Baros Alexston's house in Westfall and search for his compass, then return it to him in Cathedral Square of Stormwind.
  - objectives:
    1. item 1x A Simple Compass <- Alexston's Chest [object 1166] ~Westfall 36,55 (1 spawns)

## 1097 Elmore's Task  (L15 req9, 105 xp)
  - start: Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3; Smith Argus [npc 514] @ Elwynn Forest 41.7,65.5
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - next=353, breadcrumbFor=353
  - text: Speak with Grimand Elmore.

## 1921 Gathering Materials  (L15 req15, 800 xp, races=Human/Gnome/Skyborne, class=Mage, sort=MAGE)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - end:   Wynne Larson [npc 1309] @ Stormwind City 51.8,83.5
  - pre(any)=[1920], next=1941
  - text: Bring 10 Linen Cloth and the 6 Charged Rift Gems to Wynne Larson in Stormwind.
  - objectives:
    1. item 10x Linen Cloth <- Hidden Strongbox [object 2039] ~Alterac Mountains 19,67 (16 spawns); Battered Chest [object 2844]; Tattered Chest [object 2845]; Tattered Chest [object 2847]
    2. item 1x Charged Rift Gem <- Miners' League Crates [object 271] ~Loch Modan 35,24 (14 spawns)

## 1941 Manaweave Robe  (L15 req15, 1050 xp, races=Human/Gnome, class=Mage, sort=MAGE)
  - start: Wynne Larson [npc 1309] @ Stormwind City 51.8,83.5
  - end:   Wynne Larson [npc 1309] @ Stormwind City 51.8,83.5
  - pre(any)=[1921]

## 97220 Philmor's Favor  (L15 req9, 540 xp, F)
  - start: Manifest Clerk Philmor [npc 268511] @ Stormwind City 30.5,28.8
  - end:   Elaine Trias [npc 483] @ Stormwind City 66.6,73.4
  - next=97222
  - text: Bring the Gatehouse Shipment to the stockroom entrance located in Trias' Cheese shop in the Trade District.

## 97222 Gatehouse Goods  (L15 req9, 270 xp, F)
  - start: Elaine Trias [npc 483] @ Stormwind City 66.6,73.4
  - end:   Elaine Trias [npc 483] @ Stormwind City 66.6,73.4
  - pre(any)=[97220]
  - text: Carry the Gatehouse Shipment up the stairs in Trias' shop and leave it outside the door.
  - objectives:
    1. object 1x Gatehouse Door <- Gatehouse Door [object 460004] ~Stormwind City 66,75 (1 spawns)

## 1920 Investigate the Blue Recluse  (L16 req15, 1150 xp, races=Human/Gnome/Skyborne, class=Mage, sort=MAGE)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - next=1921
  - text: Obtain a Cantation of Manifestation and a Chest of Containment coffers from behind Jennea Cannon. Bring 3 Filled Containment Coffers to Jennea at the Wizard's Sanctum.
  - objectives:
    1. item 3x Filled Containment Coffer <- Filled Containment Coffer [object 103574]
    2. item 1x Chest of Containment Coffers <- Chest of Containment Coffers [object 105174] ~Stormwind City 50,86 (4 spawns)
    3. item 1x Cantation of Manifestation <- Cantation of Manifestation [object 105175] ~Stormwind City 50,85 (3 spawns)

## 2281 Redridge Rendezvous  (L16 req16, 115 xp, class=Rogue, sort=ROGUE)
  - start: Renzik "The Shiv" [npc 6946] @ Stormwind City 78.3,71.1
  - end:   Lucius [npc 6966] @ Redridge Mountains 23.0,52.0
  - next=2282
  - text: Venture forth to Lakeshire in the Redridge Mountains and speak with Lucius.

## 97914 Expanding Horizons  (L17 req13, 630 xp, F)
  - start: Thundris Windweaver [npc 3649] @ Darkshore 37.4,40.1
  - end:   Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - next=97926
  - text: Bring Thundris' Letter to Baros Alexston in Stormwind.
  - text: Thundris mentioned a boat in Auberdine that can take you there.

## 97234 Reading Room  (L18 req13, 680 xp, F)
  - start: Roy Lewells [npc 268568] @ Stormwind City 38.8,62.4
  - end:   Donyal Tovald [npc 2504] @ Stormwind City 75.0,30.1
  - next=97237
  - text: Bring the wrapped reading material to the Stormwind library.

## 97237 Shelf Picked  (L18 req13, 680 xp, F)
  - start: Donyal Tovald [npc 2504] @ Stormwind City 75.0,30.1
  - end:   Roy Lewells [npc 268568] @ Stormwind City 38.8,62.4
  - pre(any)=[97234]
  - text: Find each of the reading materials located somewhere in the library and then return to Roy Lewells in Stormwind's Park.
  - objectives:
    1. item 1x Field Accounts of Horde Razings <- Field Accounts of Horde Razings [object 660731] ~Stormwind City 76,31 (1 spawns)
    2. item 1x Trollbane Conquests <- Trollbane Conquests [object 660730] ~Stormwind City 76,30 (1 spawns)
    3. item 1x The Forsaken Ally <- The Forsaken Ally [object 660729] ~Stormwind City 76,30 (1 spawns)
    4. item 1x Cycles of Morality <- Cycles of Morality [object 660732] ~Stormwind City 76,29 (1 spawns)

## 1739 The Binding  (L20 req20, 1150 xp, class=Warlock, sort=WARLOCK)
  - start: Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - pre(any)=[1738]
  - text: Using the Heartswood Core, summon and subdue a succubus, then return the Heartswood Core to Gakin the Darkbinder in the Slaughtered Lamb.
  - objectives:
    1. kill 1x Summoned Succubus <- Summoned Succubus [npc 5677] L20-20

## 1793 The Tome of Valor  (L20 req20, ? xp, races=Human/Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - next=1649

## 2360 Mathias and the Defias  (L20 req20, 390 xp, class=Rogue, sort=ROGUE)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Agent Kearnen [npc 7024] @ Westfall 68.5,70.1
  - next=2359
  - text: Travel to Westfall and find Agent Kearnen for your debriefing.

## 2607 The Touch of Zanzil  (L20 req20, ? xp, class=Rogue, sort=ROGUE)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Doc Mixilpixil [npc 7207] @ Stormwind City 80.1,69.9
  - pre(any)=[2359], next=2608
  - text: Speak with Doc Mixilpixil in the cellar of the Barracks.

## 2608 The Touch of Zanzil  (L20 req20, 155 xp, class=Rogue, sort=ROGUE)
  - start: Doc Mixilpixil [npc 7207] @ Stormwind City 80.1,69.9
  - end:   Doc Mixilpixil [npc 7207] @ Stormwind City 80.1,69.9
  - pre(any)=[2607], next=2609
  - text: /Lay down to be examined by Doc Mixilpixil. How can he find the cure if he can't find the cause?

## 2609 The Touch of Zanzil  (L20 req20, 1150 xp, class=Rogue, sort=ROGUE)
  - start: Doc Mixilpixil [npc 7207] @ Stormwind City 80.1,69.9
  - end:   Doc Mixilpixil [npc 7207] @ Stormwind City 80.1,69.9
  - pre(any)=[2608]
  - text: Bring Doc Mixilpixil one bundle of Simple Wildflowers, one Leaded Vial, one Bronze Tube, and one Spool of Light Chartreuse Silk Thread. The 'itis' doesn't cure itself, young <fella/lady>.
  - objectives:
    1. item 1x Simple Wildflowers <- Bernard Gump [npc 1302] L30-30 ~Stormwind City 69,72 (1 spawns); Felicia Gump [npc 1303] L30-30 ~Stormwind City 69,71 (1 spawns)
    2. item 1x Leaded Vial <- Edna Mullby [npc 1286] L30-30 ~Stormwind City 65,71 (1 spawns); Maria Lumere [npc 1313] L30-30 ~Stormwind City 56,86 (1 spawns); Sloan McCoy [npc 1326] L25-25 ~Stormwind City 79,71 (1 spawns); Keldric Boucher [npc 1257] L30-30 ~Stormwind City 63,75 (1 spawns)
    3. item 1x Bronze Tube <- Crowd Pummeler 9-60 [npc 6229] L32-32; Box of Assorted Parts [object 19019] ~The Barrens 44,33 (3 spawns); Box of Assorted Parts [object 19020] ~The Barrens 48,85 (8 spawns)
    4. item 1x Spool of Light Chartreuse Silk Thread <- Spool of Light Chartreuse Silk Thread [object 140911] ~Stormwind City 51,60 (1 spawns)

## 5645 A Lack of Fear  (L20 req20, 390 xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - exclusiveTo=[5641, 5647]
  - text: Speak to High Priest Rohan in Ironforge.

## 5673 Elune's Grace  (L20 req20, 390 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5672, 5674, 5675]
  - text: Speak to Priestess Alathea in Darnassus.

## 5674 Elune's Grace  (L20 req20, 390 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Nara Meideros [npc 11397] @ Stormwind City 35.7,63.2
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5672, 5673, 5675]
  - text: Speak to Priestess Alathea in Darnassus.

## 5676 Arcane Feedback  (L20 req20, 390 xp, races=Human, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5677, 5678]

## 65603 The Binding  (L20 req20, 1150 xp, F, class=Warlock, sort=WARLOCK)
  - start: Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - pre(any)=[65602]
  - text: Using the Wooden Figurine, summon and subdue an incubus, then return the Wooden Figurine to Gakin the Darkbinder in the Slaughtered Lamb.
  - objectives:
    1. kill 1x Summoned Incubus <- Summoned Incubus [npc 185335] L20-20 ~Stormwind City 39,85 (2 spawns)

## 94819 Contingency Plan  (L20 req20, 390 xp, F, races=Gnome, class=Priest, sort=PRIEST)
  - start: High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - end:   High Priestess Mims [npc 258785] @ Dun Morogh 55.0,22.4 (+1 spawns)
  - exclusiveTo=[94818, 94820]
  - text: Speak to High Priestess Mims in Ironforge.

## 1653 The Test of Righteousness  (L21 req20, 830 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Jordan Stilwell [npc 6181] @ Dun Morogh 52.5,36.9
  - pre(any)=[1652], next=1654
  - text: Speak to Jordan Stilwell in Ironforge

## 373 The Unsent Letter  (L22 req16, 870 xp)
  - start: item An Unsent Letter [2874] (drops from Edwin VanCleef)
  - end:   Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - next=389
  - text: Deliver the Letter to the City Architect to Baros Alexston in Stormwind.

## 389 Bazil Thredd  (L22 req16, 435 xp)
  - start: Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - end:   Warden Thelwater [npc 1719] @ Stormwind City 51.5,69.4
  - pre(any)=[373], next=391
  - text: Speak with Warden Thelwater in the Stockade.

## 1650 The Tome of Valor  (L23 req20, 1850 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Daphne Stilwell [npc 6182] @ Westfall 41.7,89.2
  - pre(any)=[1649], next=1651
  - text: Find Daphne Stilwell in Westfall.

## 343 Speaking of Fortitude  (L24 req20, 195 xp)
  - start: Brother Kristoff [npc 1444] @ Stormwind City 55.0,54.2
  - end:   Milton Sheaf [npc 1440] @ Stormwind City 77.1,30.2
  - next=344
  - text: Go to the Royal Library in Stormwind Keep and speak with Milton Sheaf. He can find for you the book on metallurgy that Brother Kristoff needs for his speech.

## 344 Brother Paxton  (L24 req20, 485 xp)
  - start: Milton Sheaf [npc 1440] @ Stormwind City 77.1,30.2
  - end:   Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - pre(any)=[343], next=345
  - text: Speak with Brother Paxton in the Northshire Abbey.

## 345 Ink Supplies  (L24 req20, 485 xp)
  - start: Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - end:   Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - pre(any)=[344], next=347
  - text: Speak with Foreman Oslow in Lakeshire and ask him for Rethban Iron Ore.

## 346 Return to Kristoff  (L24 req20, 1950 xp)
  - start: Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - end:   Brother Kristoff [npc 1444] @ Stormwind City 55.0,54.2
  - pre(any)=[347]
  - text: Return to Brother Kristoff in the Cathedral Square. Give him the book The Stresses of Iron.

## 347 Rethban Ore  (L24 req20, 970 xp)
  - start: Foreman Oslow [npc 341] @ Redridge Mountains 27.1,48.6
  - end:   Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - pre(any)=[345], next=346
  - text: Gather 5 loads of Rethban Ore and bring it to Brother Paxton in the Northshire Library.
  - objectives:
    1. item 1x Rethban Ore <- Redridge Drudger [npc 580] L20-21 ~Redridge Mountains 14,19 (14 spawns); Tin Vein [object 2054] ~Redridge Mountains 14,19 (21 spawns); Copper Vein [object 2055] ~Redridge Mountains 14,19 (21 spawns)

## 3765 The Corruption Abroad  (L24 req18, 1450 xp)
  - start: Argos Nightwhisper [npc 4984] @ Stormwind City 36.2,67.6
  - end:   Gershala Nightwhisper [npc 8997] @ Darkshore 38.3,43.0
  - next=1275, breadcrumbFor=1275
  - text: Travel to Gershala Nightwhisper in Auberdine.

## 98190 A Friend of the Family  (L25 req20, 200 xp, F)
  - start: Captain Stoutfist [npc 2104] @ Wetlands 9.9,57.5
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - pre(any)=[98189], next=98191
  - text: Bring the Menethil Statuette to Highlord Bolvar Fordragon in Stormwind Keep.

## 98191 A Friend of the Family  (L25 req20, 2000 xp, F)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - pre(any)=[98190]
  - text: Bring the Menethil Statuette to Lord Grayson Shadowbreaker in the Cathedral of Light.

## 1940 Pristine Spider Silk  (L26 req26, 1600 xp, races=Human/Gnome/Skyborne, class=Mage, sort=MAGE)
  - start: High Sorcerer Andromath [npc 5694] @ Stormwind City 48.7,87.6
  - end:   Wynne Larson [npc 1309] @ Stormwind City 51.8,83.5
  - pre(any)=[1938], next=1942
  - text: Bring 8 Pristine Spider Silk to Wynne Larson in Stormwind.
  - objectives:
    1. item 8x Pristine Spider Silk <- Black Widow Hatchling [npc 930] L24-25 ~Duskwood 43,49 (55 spawns); Carrion Recluse [npc 949] L25-26 ~Duskwood 20,41 (6 spawns)

## 1942 Astral Knot Garment  (L26 req26, 2100 xp, races=Human/Gnome, class=Mage, sort=MAGE)
  - start: Wynne Larson [npc 1309] @ Stormwind City 51.8,83.5
  - end:   Wynne Larson [npc 1309] @ Stormwind City 51.8,83.5
  - pre(any)=[1940]

## 1241 The Missing Diplomat  (L28 req28, 230 xp)
  - start: Bishop DeLavey [npc 4960] @ Stormwind City 80.2,44.1
  - end:   Jorgen [npc 4959] @ Stormwind City 76.3,85.1
  - pre(any)=[1274], next=1242
  - text: Find Jorgen in Stormwind City.

## 1242 The Missing Diplomat  (L28 req28, 230 xp)
  - start: Jorgen [npc 4959] @ Stormwind City 76.3,85.1
  - end:   Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - pre(any)=[1241], next=1243
  - text: Delivery Jorgen's Sealed Note to Elling Trias in Stormwind City.

## 1243 The Missing Diplomat  (L28 req28, 230 xp)
  - start: Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - end:   Watcher Backus [npc 840] @ Duskwood 74.8,44.2
  - pre(any)=[1242], next=1244
  - text: Give the Sealed Note to Watcher Backus in Duskwood.

## 1274 The Missing Diplomat  (L28 req28, 230 xp)
  - start: Thomas [npc 4982] @ Stormwind City 49.6,44.5
  - end:   Bishop DeLavey [npc 4960] @ Stormwind City 80.2,44.1
  - next=1241
  - text: Find Bishop DeLavey in Stormwind Keep.

## 1700 Grimand Elmore  (L28 req20, 570 xp, races=Human, class=Warrior, sort=WARRIOR)
  - start: Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - pre(any)=[1782], next=1705, breadcrumbFor=1705
  - text: Bring Furen's Notes to Grimand Elmore.

## 1701 Fire Hardened Mail  (L28 req20, 2300 xp, class=Warrior, sort=WARRIOR)
  - start: Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - end:   Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - pre(any)=[1702], next=1782
  - text: Gather the materials Furen Longbeard requires, and bring them to him in Stormwind.
  - objectives:
    1. item 1x Scorched Spider Fang <- Leech Stalker [npc 1111] L21-22 ~Wetlands 52,63 (35 spawns); Cave Stalker [npc 4040] L21-22 ~Wetlands 48,61 (17 spawns); Leech Stalker Corpse [npc 211967] LNone-None
    2. item 1x Charred Horn <- Fledgling Chimaera [npc 4031] L25-27 ~Stonetalon Mountains 33,72 (3 spawns); Young Chimaera [npc 4032] L23-25 ~Stonetalon Mountains 33,65 (2 spawns)
    3. item 1x Galvanized Horn <- Chimaera Matriarch [npc 6167] L28-28 ~Stonetalon Mountains 34,75 (1 spawns)
    4. item 1x Vial of Phlogiston <- Roogug [npc 6168] L28-28

## 1703 Mathiel  (L28 req20, 1150 xp, races=NightElf, class=Warrior, sort=WARRIOR)
  - start: Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - end:   Mathiel [npc 6142] @ Darnassus 59.5,45.4
  - pre(any)=[1782], next=1710, breadcrumbFor=1710
  - text: Bring Furen's Notes to Mathiel.

## 1704 Klockmort Spannerspan  (L28 req20, 570 xp, races=Dwarf/Gnome, class=Warrior, sort=WARRIOR)
  - start: Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - end:   Klockmort Spannerspan [npc 6169] @ Ironforge 67.9,46.1
  - pre(any)=[1782], next=1708, breadcrumbFor=1708
  - text: Bring Furen's Notes to Klockmort Spannerspan.

## 1705 Burning Blood  (L28 req20, 2300 xp, class=Warrior, sort=WARRIOR)
  - start: Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - pre(any)=[1782], next=1706
  - text: Bring 20 vials of Burning Blood and 1 Burning Rock to Grimand Elmore in Stormwind.
  - objectives:
    1. item 1x Burning Blood <- Nightbane Dark Runner [npc 205] L28-29 ~Duskwood 64,61 (57 spawns); Nightbane Vile Fang [npc 206] L29-30 ~Duskwood 70,73 (21 spawns); Nightbane Shadow Weaver [npc 533] L27-28 ~Duskwood 63,55 (27 spawns); Nightbane Worgen [npc 898] L26-27 ~Duskwood 61,41 (28 spawns)
    2. item 1x Burning Rock <- Gutspill [npc 6170] L32-32 ~Duskwood 74,77 (1 spawns); Old Fire-Eye [npc 259897] L25-25 ~Silverpine Forest 50,85 (43 spawns)

## 1782 Furen's Armor  (L28 req20, 3400 xp, class=Warrior, sort=WARRIOR)
  - start: Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - end:   Furen Longbeard [npc 5413] @ Stormwind City 64.6,37.2
  - pre(any)=[1701]

## 1938 Ur's Treatise on Shadow Magic  (L28 req26, 2300 xp, races=Human/Gnome/Skyborne, class=Mage, sort=MAGE)
  - start: High Sorcerer Andromath [npc 5694] @ Stormwind City 48.7,87.6
  - end:   High Sorcerer Andromath [npc 5694] @ Stormwind City 48.7,87.6
  - next=1940
  - text: Bring Ur's Treatise on Shadow Magic to High Sorcerer Andromath in Stormwind.
  - objectives:
    1. item 1x Ur's Treatise on Shadow Magic <- Ur's Treatise on Shadow Magic [object 103628] ~Redridge Mountains 74,48 (1 spawns)

## 392 The Curious Visitor  (L29 req16, 590 xp)
  - start: Warden Thelwater [npc 1719] @ Stormwind City 51.5,69.4
  - end:   Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - pre(any)=[391], next=393
  - text: Bring the Sealed Description of Thredd's Visitor to Baros Alexston in Stormwind.

## 393 Shadow of the Past  (L29 req16, 590 xp)
  - start: Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[392], next=350
  - text: Bring the Sealed Description of Thredd's Visitor to Master Mathias Shaw in Stormwind.

## 335 A Noble Brew  (L30 req25, 2450 xp)
  - start: Zardeth of the Black Claw [npc 1435] @ Stormwind City 40.1,85.3
  - end:   Zardeth of the Black Claw [npc 1435] @ Stormwind City 40.1,85.3
  - next=336
  - text: Zardeth the Black Claw wants you to bring him a Tear of Tilloa from Darkshire and a Musquash Root from the Wetlands.
  - objectives:
    1. item 1x Tear of Tilloa <- Tear of Tilloa [object 321] ~Duskwood 78,36 (1 spawns)
    2. item 1x Musquash Root <- Musquash Root [object 2084] ~Wetlands 65,75 (1 spawns)

## 336 A Noble Brew  (L30 req25, 2450 xp)
  - start: Zardeth of the Black Claw [npc 1435] @ Stormwind City 40.1,85.3
  - end:   Lord Baurles K. Wishock [npc 1439] @ Stormwind City 77.9,49.0
  - pre(any)=[335], next=397
  - text: Take the Black Claw Stout to Lord Wishock in the Hall of Petitioners.

## 397 You Have Served Us Well  (L30 req25, 245 xp, races=Human/Gnome, class=Warlock)
  - start: Zardeth of the Black Claw [npc 1435] @ Stormwind City 40.1,85.3
  - end:   Zggi [npc 1733] @ Stormwind City 40.2,85.3
  - pre(any)=[336]
  - text: Speak with Zggi, the servant of Zardeth the Blackclaw, to claim your reward.

## 1244 The Missing Diplomat  (L30 req28, 2450 xp)
  - start: Watcher Backus [npc 840] @ Duskwood 74.8,44.2
  - end:   Watcher Backus [npc 840] @ Duskwood 74.8,44.2
  - pre(any)=[1243], next=1245
  - text: Find the Defias Docket and return it to Watcher Backus in Duskwood.
  - objectives:
    1. item 1x Defias Docket <- Defias Strongbox [object 21052] ~Duskwood 24,72 (1 spawns)

## 1245 The Missing Diplomat  (L30 req28, 245 xp)
  - start: Watcher Backus [npc 840] @ Duskwood 74.8,44.2
  - end:   Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - pre(any)=[1244], next=1246
  - text: Bring the Defias Docket to Elling Trias in Stormwind.

## 1706 Grimand's Armor  (L30 req20, 3050 xp, class=Warrior, sort=WARRIOR)
  - start: Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - pre(any)=[1705]

## 78090 A Second Opinion  (L30 req22, ? xp, F, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - end:   Ursula Deline [npc 5495] @ Stormwind City 39.9,84.2
  - pre(any)=[78089]
  - text: Find the warlock sanctum within Stormwind and seek advice on the orb.

## 78091 Earning Your Salt  (L30 req22, 2450 xp, F, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Ursula Deline [npc 5495] @ Stormwind City 39.9,84.2
  - end:   Ursula Deline [npc 5495] @ Stormwind City 39.9,84.2
  - pre(any)=[78090], next=78092
  - text: Collect 14 Summoner's Salt from Blackrock Summoners in Redridge Mountains, then return to Ursula Deline in Stormwind.
  - objectives:
    1. item 14x Summoner's Salt <- Gath'Ilzogg [npc 334] L26-26 ~Redridge Mountains 65,56 (1 spawns); Blackrock Champion [npc 435] L24-25 ~Redridge Mountains 25,12 (24 spawns); Blackrock Shadowcaster [npc 436] L22-23 ~Redridge Mountains 59,50 (35 spawns); Blackrock Tracker [npc 615] L23-24 ~Redridge Mountains 29,11 (15 spawns)

## 78092 It Must Be Destroyed  (L30 req22, 3050 xp, F, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Ursula Deline [npc 5495] @ Stormwind City 39.9,84.2
  - end:   Spear of Mannoroth [object 409311] @ Ashenvale 89.5,77.0
  - pre(any)=[78091]
  - text: Gather 12 Motes of Mannoroth from demons in Ashenvale. Bring them along with the Orb of Althalaxx to the Spear of Mannoroth at Demon Fall Canyon.
  - objectives:
    1. item 1x Mote of Mannoroth <- Legion Hound [npc 6071] L29-30 ~Ashenvale 78,82 (1 spawns); Searing Infernal [npc 6073] L29-30 ~Ashenvale 81,77 (39 spawns); Felguard [npc 6115] L29-30 ~Ashenvale 80,78 (28 spawns); Mannoroc Lasher [npc 11697] L29-30 ~Ashenvale 81,80 (32 spawns)

## 98219 The Shamed Lieutenant  (L30 req20, 245 xp, F)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - pre(any)=[98191]
  - text: Speak to Lieutenant Farren Orinelle in Southshore in Hillsbrad Foothills.

## 350 Look to an Old Friend  (L31 req16, 250 xp)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - pre(any)=[393], next=2745
  - text: Speak to Elling Trias in Stormwind.

## 394 The Head of the Beast  (L31 req16, 250 xp)
  - start: Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[434], next=395
  - text: Speak to Mathias Shaw in Stormwind.

## 395 Brotherhood's End  (L31 req16, 630 xp)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - pre(any)=[394], next=396
  - text: Speak with Baros Alexston in Stormwind.

## 396 An Audience with the King  (L31 req16, 3750 xp)
  - start: Baros Alexston [npc 1646] @ Stormwind City 57.7,47.9
  - end:   Lady Katrana Prestor [npc 1749] @ Stormwind City 80.1,38.2
  - pre(any)=[395]
  - text: Deliver Baros Alexston's report on the Defias Brotherhood to King Varian Wrynn in Stormwind Keep.

## 434 The Attack!  (L31 req16, 1900 xp)
  - start: Tyrion [npc 7766] @ Stormwind City 73.2,35.6
  - end:   Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - pre(any)=[2746], next=394
  - text: Remain in the garden until Lord Gregor Lescovar and Marzon the Silent Blade have had their conversation. Afterwards, kill them both before returning to Elling Trias in Stormwind.
  - objectives:
    1. kill 1x Lord Gregor Lescovar <- Lord Gregor Lescovar [npc 1754] L31-31 ~Stormwind City 72,35 (1 spawns)
    2. kill 1x Marzon the Silent Blade <- Marzon the Silent Blade [npc 1755] L30-30 ~Stormwind City 72,35 (1 spawns)

## 1246 The Missing Diplomat  (L31 req28, 250 xp)
  - start: Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - end:   Dashel Stonefist [npc 4961] @ Stormwind City 74.3,59.2
  - pre(any)=[1245], next=1447
  - text: Speak to Dashel Stonefist in Stormwind.

## 1247 The Missing Diplomat  (L31 req28, 250 xp)
  - start: Dashel Stonefist [npc 4961] @ Stormwind City 74.3,59.2
  - end:   Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - pre(any)=[1447], next=1248
  - text: Speak to Elling Trias in Stormwind.

## 1447 The Missing Diplomat  (L31 req28, 1250 xp)
  - start: Dashel Stonefist [npc 4961] @ Stormwind City 74.3,59.2
  - end:   Dashel Stonefist [npc 4961] @ Stormwind City 74.3,59.2
  - pre(any)=[1246], next=1247
  - text: Defeat Dashel Stonefist in Stormwind.
  - objectives:
    1. kill 1x Dashel Stonefist <- Dashel Stonefist [npc 4961] L26-26 ~Stormwind City 74,59 (1 spawns)

## 2745 Infiltrating the Castle  (L31 req16, 250 xp)
  - start: Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - end:   Tyrion [npc 7766] @ Stormwind City 73.2,35.6
  - pre(any)=[350], next=2746
  - text: Speak to Tyrion in Stormwind Castle.

## 2746 Items of Some Consequence  (L31 req16, 630 xp)
  - start: Tyrion [npc 7766] @ Stormwind City 73.2,35.6
  - end:   Tyrion [npc 7766] @ Stormwind City 73.2,35.6
  - pre(any)=[2745], next=434
  - text: Bring 3 Silk Cloth and 2 of Clara's Fresh Apples to Tyrion in Stormwind.
  - objectives:
    1. item 3x Silk Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns)
    2. item 1x Clara's Fresh Apple <- Clara's Fresh Apples [object 142076] ~Elwynn Forest 34,57 (1 spawns)

## 4738 In Search of Menara Voidrender  (L31 req31, 630 xp, class=Warlock, sort=WARLOCK)
  - start: Demisette Cloyce [npc 461] @ Stormwind City 39.2,85.0
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - next=1796, breadcrumbFor=1796, exclusiveTo=[4736, 4737, 4739]
  - text: Speak with Menara Voidrender in the Barrens.

## 690 Malin's Request  (L32 req30, 1950 xp)
  - start: Archmage Malin [npc 2708] @ Stormwind City 50.5,87.5
  - end:   Skuerto [npc 2789] @ Arathi Highlands 46.6,47.0
  - next=691, breadcrumbFor=691
  - text: Find Skuerto at Refuge Pointe in the Arathi Highlands.

## 1248 The Missing Diplomat  (L33 req28, 660 xp)
  - start: Elling Trias [npc 482] @ Stormwind City 66.0,74.1
  - end:   Mikhail [npc 4963] @ Wetlands 10.6,60.8
  - pre(any)=[1247], next=1249
  - text: Speak to Mikhail in the Wetlands.

## 1249 The Missing Diplomat  (L33 req28, 1300 xp)
  - start: Mikhail [npc 4963] @ Wetlands 10.6,60.8
  - end:   Mikhail [npc 4963] @ Wetlands 10.6,60.8
  - pre(any)=[1248], next=1250
  - text: Subdue Tapoke Jahn before he escapes, and then return to Mikhail in Menethil.
  - objectives:
    1. kill 1x Tapoke "Slim" Jahn <- Tapoke "Slim" Jahn [npc 4962] L34-34 ~Wetlands 11,60 (1 spawns)

## 1250 The Missing Diplomat  (L33 req28, 265 xp)
  - start: Tapoke "Slim" Jahn [npc 4962] @ Wetlands 10.5,60.3
  - end:   Mikhail [npc 4963] @ Wetlands 10.6,60.8
  - pre(any)=[1249], next=1264
  - text: Speak to Mikhail in the Wetlands.

## 1264 The Missing Diplomat  (L33 req28, 1300 xp)
  - start: Mikhail [npc 4963] @ Wetlands 10.6,60.8
  - end:   Commander Samaul [npc 4964] @ Dustwallow Marsh 68.0,48.7
  - pre(any)=[1250], next=1265
  - text: Find Commander Samaul in Dustwallow Marsh.

## 1265 The Missing Diplomat  (L35 req28, 275 xp)
  - start: Commander Samaul [npc 4964] @ Dustwallow Marsh 68.0,48.7
  - end:   Archmage Tervosh [npc 4967] @ Dustwallow Marsh 66.4,49.3
  - pre(any)=[1264], next=1266
  - text: Search Sentry Point for any sign of Private Hendel.

## 1301 James Hyal  (L35 req30, 690 xp)
  - start: Connor Rivers [npc 5081] @ Stormwind City 51.1,95.5
  - end:   Vincent Hyal [npc 5082] @ Wetlands 10.8,60.4
  - next=1302, breadcrumbFor=1302
  - text: Speak with Vincent Hyal in Menethil Harbor.

## 4968 Knowledge of the Orb of Orahil  (L35 req35, 1350 xp, class=Warlock, sort=WARLOCK)
  - start: Demisette Cloyce [npc 461] @ Stormwind City 39.2,85.0
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - next=1799, breadcrumbFor=1799, exclusiveTo=[4965, 4967, 4969]
  - text: Speak to Menara Voidrender in the Barrens.

## 1266 The Missing Diplomat  (L36 req28, 700 xp)
  - start: Archmage Tervosh [npc 4967] @ Dustwallow Marsh 66.4,49.3
  - end:   Private Hendel [npc 4966] @ Dustwallow Marsh 45.2,24.6
  - pre(any)=[1265], next=1324
  - text: Find Private Hendel in Dustwallow Marsh.

## 538 Southshore  (L38 req20, 710 xp)
  - start: Milton Sheaf [npc 1440] @ Stormwind City 77.1,30.2
  - end:   Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - pre(any)=[337], next=540
  - text: Speak with Loremaster Dibbs in Southshore.

## 540 Preserving Knowledge  (L38 req20, 3550 xp)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - pre(any)=[538], next=542
  - text: Bring 5 Recovered Tomes and the Worn Leather Book containing The Arm of Gri'lek to Loremaster Dibbs in Southshore.
  - objectives:
    1. item 5x Recovered Tome <- Crushridge Ogre [npc 2252] L34-35 ~Alterac Mountains 50,45 (49 spawns); Crushridge Brute [npc 2253] L35-36 ~Alterac Mountains 49,45 (30 spawns); Crushridge Mauler [npc 2254] L36-37 ~Alterac Mountains 43,46 (16 spawns); Crushridge Mage [npc 2255] L37-38 ~Alterac Mountains 41,45 (8 spawns)
    2. item 1x Worn Leather Book <- Weathered Bookcase [object 1760] ~Alterac Mountains 38,46 (1 spawns); object 556653 [object 556653] ~Alterac Mountains 39,46 (1 spawns)

## 542 Return to Milton  (L38 req20, 3550 xp)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Milton Sheaf [npc 1440] @ Stormwind City 77.1,30.2
  - pre(any)=[540]
  - text: Bring the Tomes of Alterac to Milton Sheaf in Stormwind.

## 1267 The Missing Diplomat  (L38 req28, 4300 xp)
  - start: Lady Jaina Proudmoore [npc 4968] @ Dustwallow Marsh 66.3,49.0
  - end:   Lady Jaina Proudmoore [npc 4968] @ Dustwallow Marsh 66.3,49.0
  - pre(any)=[1324]
  - text: Speak to Jaina Proudmore in Dustwallow Swamp.

## 1324 The Missing Diplomat  (L38 req28, 2150 xp)
  - start: Private Hendel [npc 4966] @ Dustwallow Marsh 45.2,24.6
  - end:   Archmage Tervosh [npc 4967] @ Dustwallow Marsh 66.4,49.3
  - pre(any)=[1266], next=1267
  - text: Defeat Private Hendel in Dustwallow Marsh.
  - objectives:
    1. kill 1x Private Hendel <- Private Hendel [npc 4966] L35-35 ~Dustwallow Marsh 45,25 (1 spawns)

## 212 A Meal Served Cold  (L40 req35, 3900 xp)
  - start: Angus Stern [npc 1141] @ Stormwind City 51.8,93.6
  - end:   Angus Stern [npc 1141] @ Stormwind City 51.8,93.6
  - text: Kill a Cold Eye Basilisk, get a Chilled Basilisk Haunch, and return it to Angus Stern in the Blue Recluse.
  - objectives:
    1. item 1x Chilled Basilisk Haunch <- Cold Eye Basilisk [npc 690] L39-40 ~Stranglethorn Vale 33,40 (19 spawns)

## 543 The Perenolde Tiara  (L40 req30, 4700 xp)
  - start: Count Remington Ridgewell [npc 2285] @ Stormwind City 76.9,47.8
  - end:   Count Remington Ridgewell [npc 2285] @ Stormwind City 76.9,47.8
  - text: Bring the Perenolde Tiara to Remington Ridgewell in Stormwind.
  - objectives:
    1. item 1x Perenolde Tiara <- Grel'borg the Miser [npc 2417] L39-39 ~Alterac Mountains 36,54 (1 spawns)

## 1661 The Tome of Nobility  (L40 req40, ? xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - exclusiveTo=[4485, 4486]
  - text: Speak to Duthorian Rall in Stormwind.

## 2758 The Origins of Smithing  (L40 req40, 3150 xp, sort=BLACKSMITHING)
  - start: Hank the Hammer [npc 7798] @ Stormwind City 62.9,36.8
  - end:   Hank the Hammer [npc 7798] @ Stormwind City 62.9,36.8
  - next=2759
  - text: Bring six Golden Scale Bracers to Hank the Hammer in Stormwind.
  - objectives:
    1. item 1x Golden Scale Bracers <- ?

## 2759 In Search of Galvan  (L40 req40, 1550 xp, sort=BLACKSMITHING)
  - start: Hank the Hammer [npc 7798] @ Stormwind City 62.9,36.8
  - end:   McGavan [npc 7794] @ Stranglethorn Vale 28.9,75.4
  - pre(any)=[2758], next=2760
  - text: Speak with McGavan in Booty Bay.

## 4488 Summon Felsteed  (L40 req40, 315 xp, class=Warlock, sort=WARLOCK)
  - start: Demisette Cloyce [npc 461] @ Stormwind City 39.2,85.0
  - end:   Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - next=4490, exclusiveTo=[3631, 4487, 4489]
  - text: Speak to Strahad Farsan in Ratchet.

## 79940 A Lost Brother  (L40 req35, 2350 xp, F, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - end:   Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - pre(any)=[79939]
  - text: Speak with Katherine the Pure and learn more about the broken hammer.

## 79946 A Brother In Need  (L40 req35, ? xp, F, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - end:   Aeonas [npc 217996] @ no spawn
  - pre(any)=[79945]
  - text: Speak with Katherine to learn more about Aeonas, and then find him in the Scarlet Monastery.

## 80241 The Origins of Smithing  (L40 req40, ? xp, F, sort=BLACKSMITHING)
  - start: Hank the Hammer [npc 7798] @ Stormwind City 62.9,36.8
  - end:   Hank the Hammer [npc 7798] @ Stormwind City 62.9,36.8
  - text: Bring six Golden Scale Bracers to Hank the Hammer in Stormwind.
  - objectives:
    1. item 1x Golden Scale Bracers <- ?

## 96438 Battle at the Mannoroc Coven  (L40 req35, 2350 xp, F, class=Paladin, sort=PALADIN)
  - start: Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - end:   Broken Warhammer [object 423703] @ Desolace 52.7,84.8
  - text: Investigate the battle at the Mannoroc Coven in Desolace.

## 1363 Mazen's Behest  (L41 req37, 330 xp)
  - start: Mazen Mac'Nadir [npc 338] @ Stormwind City 51.8,74.2
  - end:   Acolyte Dellis [npc 5386] @ Stormwind City 51.4,73.8
  - next=1364
  - text: Speak with Acolyte Dellis in Stormwind.

## 1364 Mazen's Behest  (L41 req37, 3300 xp)
  - start: Acolyte Dellis [npc 5386] @ Stormwind City 51.4,73.8
  - end:   Watcher Mahar Ba [npc 5385] @ Blasted Lands 67.7,19.2
  - pre(any)=[1363]
  - text: Retrieve Khadgar's Essays on Dimensional Convergence and deliver them to Watcher Mahar Ba in Nethergarde Keep.
  - objectives:
    1. item 1x Khadgar's Essays on Dimensional Convergence <- Swampwalker [npc 764] L38-39 ~Swamp of Sorrows 28,37 (11 spawns); Swampwalker Elder [npc 765] L39-40 ~Swamp of Sorrows 11,32 (2 spawns); Tangled Horror [npc 766] L40-41 ~Swamp of Sorrows 58,47 (26 spawns); Mire Lord [npc 1081] L42-42 ~Swamp of Sorrows 6,31 (1 spawns)

## 1448 In Search of The Temple  (L43 req38, 3600 xp)
  - start: Brohann Caskbelly [npc 5384] @ Stormwind City 69.5,40.4
  - end:   Brohann Caskbelly [npc 5384] @ Stormwind City 69.5,40.4
  - next=1449
  - text: Brohann Caskbelly in Stormwind wants you to search for the Temple of Atal'Hakkar.

## 1449 To The Hinterlands  (L43 req38, 1800 xp)
  - start: Brohann Caskbelly [npc 5384] @ Stormwind City 69.5,40.4
  - end:   Falstad Wildhammer [npc 5635] @ The Hinterlands 11.8,46.8
  - pre(any)=[1448], next=1450
  - text: Speak with High Thane Falstad Wildhammer at Aerie Peak in the Hinterlands.

## 1477 Vital Supplies  (L45 req40, 970 xp)
  - start: High Sorcerer Andromath [npc 5694] @ Stormwind City 48.7,87.6
  - end:   Watchmaster Sorigal [npc 5464] @ Duskwood 75.8,46.2
  - next=1395, breadcrumbFor=1395
  - text: Speak with Watchmaster Sorigal.

## 3630 Gnome Engineering  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Lilliam Sparkspindle [npc 5518] @ Stormwind City 62.1,30.3
  - end:   Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - next=3640, exclusiveTo=[3632, 3634, 3635, 3637, 3638, 3642]
  - text: If you wish to learn more about Gnome Engineering, take the Manual of Engineering Disciplines to Tinkmaster Overspark in Ironforge.

## 4181 Goblin Engineering  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Lilliam Sparkspindle [npc 5518] @ Stormwind City 62.1,30.3
  - end:   Nixx Sprocketspring [npc 8126] @ Tanaris 52.5,27.3
  - next=3638, exclusiveTo=[3526, 3629, 3633, 3640, 3642]
  - text: If you wish to learn more about Goblin Engineering, take the Manual of Engineering Disciplines to Nixx Sprocketspring in Gadgetzan.

## 3787 Jonespyre's Request  (L50 req47, 1200 xp)
  - start: Tannysa [npc 5566] @ Stormwind City 54.3,84.1
  - end:   Quintis Jonespyre [npc 7879] @ Feralas 32.5,43.8
  - pre(any)=[3781], next=3791, breadcrumbFor=3791, exclusiveTo=[3788]
  - text: Speak with Quintis Jonespyre in Feathermoon Stronghold.

## 3789 Assisting Arch Druid Staghelm  (L50 req47, 470 xp)
  - start: Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - next=3764, breadcrumbFor=3764, exclusiveTo=[3763, 3790]
  - text: Speak with Arch Druid Fandral Staghelm in Darnassus.

## 5066 A Call to Arms: The Plaguelands!  (L50 req50, 470 xp)
  - start: Crier Goodman [npc 2198] @ Stormwind City 56.4,74.1
  - end:   Commander Ashlam Valorfist [npc 10838] @ Western Plaguelands 42.7,84.0
  - next=5092, breadcrumbFor=5092, exclusiveTo=[5090, 5091]
  - text: Seek out Commander Ashlam Valorfist. His base camp is located at Chillwind Camp, north of the Alterac Mountains.

## 81762 Some Good News  (L50 req45, 2350 xp, F, class=Paladin, sort=PALADIN)
  - start: Aeonas the Vindicated [npc 218160] @ Stormwind City 48.7,49.1
  - end:   Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - text: Speak with Katherine the Pure at the Cathedral of Light in Stormwind.

## 81764 The Mysterious Merchant  (L50 req45, 4700 xp, F, class=Paladin, sort=PALADIN)
  - start: Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - end:   Elrick [npc 221575] @ Dustwallow Marsh 66.5,45.4
  - text: Travel to Theramore and find the mysterious merchant.

## 5048 Good Natured Emma  (L52 req50, 5100 xp)
  - start: Royal Factor Bathrilor [npc 10782] @ Stormwind City 57.2,48.1
  - end:   Ol' Emma [npc 3520] @ Stormwind City 60.2,57.0
  - pre(any)=[5022], next=5050
  - text: Find Ol' Emma in Stormwind and see if she is in fact Emma Felstone. If she is, then perhaps she'd like the package Janice Felstone made for her.

## 8233 A Simple Request  (L52 req50, 510 xp, class=Rogue, sort=ROGUE)
  - start: Osborne the Night Man [npc 918] @ Stormwind City 77.4,65.3; Ormok [npc 3328] @ Orgrimmar 43.9,54.6; Syurna [npc 4163] @ Darnassus 37.0,21.9; Miles Dexter [npc 4583] @ Undercity 85.2,71.6; Hulfdan Blackbeard [npc 5165] @ Ironforge 52.0,14.8; Fenthwick [npc 5167] @ Ironforge 51.5,15.3
  - end:   Lord Jorach Ravenholdt [npc 6768] @ Alterac Mountains 86.0,78.9
  - next=8234, breadcrumbFor=8234
  - text: Speak with Lord Jorach Ravenholdt in Ravenholdt Manor.

## 8250 Magecraft  (L52 req50, 510 xp, class=Mage, sort=MAGE)
  - start: Maginor Dumas [npc 331] @ Stormwind City 49.2,87.8; Archmage Shymm [npc 3047] @ Thunder Bluff 22.8,14.5; Pierce Shackleton [npc 4567] @ Undercity 85.5,13.5; Uthel'nay [npc 7311] @ Orgrimmar 39.2,86.3; Dink [npc 7312] @ Ironforge 27.2,8.6
  - end:   Sanath Lim-yo [npc 8395] @ Azshara 28.1,50.1
  - text: Seek out Sanath Lim-yo and gain passage to see Archmage Xylem.

## 8415 Chillwind Point  (L52 req50, 510 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2; Brandur Ironhammer [npc 5149] @ Ironforge 23.1,6.1
  - end:   Commander Ashlam Valorfist [npc 10838] @ Western Plaguelands 42.7,84.0
  - next=8414, breadcrumbFor=8414
  - text: Speak to Commander Ashlam Valorfist at Chillwind Camp.

## 8419 An Imp's Request  (L52 req50, 3800 xp, class=Warlock, sort=WARLOCK)
  - start: Demisette Cloyce [npc 461] @ Stormwind City 39.2,85.0; Zevrost [npc 3326] @ Orgrimmar 48.5,45.4; Kaal Soulreaper [npc 4563] @ Undercity 86.2,15.9; Briarthorn [npc 5172] @ Ironforge 50.4,5.7
  - end:   Impsy [npc 14470] @ Felwood 41.4,45.0
  - next=8421, exclusiveTo=[8420]
  - text: Bring a piece of felcloth to Impsy in Felwood.
  - objectives:
    1. item 1x Felcloth <- Felhunter [npc 417] L60-60; Felguard Sentry [npc 6011] L54-55 ~Blasted Lands 59,51 (5 spawns); Legashi Satyr [npc 6200] L51-52 ~Azshara 61,21 (16 spawns); Legashi Rogue [npc 6201] L51-53 ~Azshara 61,21 (17 spawns)

## 95264 Shaw Needs To Know  (L53 req48, 1300 xp, F)
  - start: Sully McCleary [npc 260271] @ Dustwallow Marsh 63.5,42.3
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[95263]
  - text: Bring the news to Matthias Shaw in Stormwind.

## 96377 State Secrets  (L53 req48, ? xp, F)
  - start: Renzik "The Shiv" [npc 6946] @ Stormwind City 78.3,71.1
  - end:   Renzik "The Shiv" [npc 6946] @ Stormwind City 78.3,71.1
  - objectives:
    1. item 1x Document Box <- ?

## 96476 In Search of Aeonas  (L53 req45, 2650 xp, F, class=Paladin, sort=PALADIN)
  - start: Katherine the Pure [npc 5492] @ Stormwind City 48.5,49.1
  - end:   Aeonas the Vindicated [npc 221587] @ Felwood 45.0,52.1
  - text: Search for signs of Aeonas the Vindicated at the Emerald Sanctuary in Felwood.

## 1015 The New Frontier  (L55 req54, 560 xp)
  - start: Crier Goodman [npc 2198] @ Stormwind City 56.4,74.1
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - next=6761, exclusiveTo=[1047, 1019]
  - text: Speak with Arch Druid Fandral Staghelm at the Cenarion Enclave of Darnassus about the Cenarion Circle's call to explore the frontiers of Kalimdor.

## 7562 Mor'zul Bloodbringer  (L58 req60, 620 xp, class=Warlock, sort=WARLOCK)
  - start: Spackle Thornberry [npc 5520] @ Stormwind City 39.5,84.5; Kurgul [npc 5815] @ Orgrimmar 47.5,46.7; Jubahl Corpseseeker [npc 6382] @ Ironforge 52.7,6.1; Greshka [npc 12807] @ Swamp of Sorrows 48.6,55.3
  - end:   Mor'zul Bloodbringer [npc 14436] @ Burning Steppes 12.7,31.6
  - next=7563, breadcrumbFor=7563
  - text: Speak with Mor'zul Bloodbringer in the Burning Steppes.

## 84394 Greater Friend of the Library  (L58 req50, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9

## 171 A Warden of the Alliance  (L60 req10, 1650 xp, sort=SPECIAL)
  - start: Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - end:   Orphan Matron Nightingale [npc 14450] @ Stormwind City 56.3,54.0
  - pre(all)=[558, 4822]
  - text: Return your ward to the Stormwind orphanage by handing in the Human Orphan Whistle to Orphan Matron Nightingale in the Cathedral District.
  - objectives:
    1. item 1x Human Orphan Whistle <- ?

## 558 Jaina's Autograph  (L60 req10, 660 xp, sort=SPECIAL)
  - start: Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - end:   Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - pre(all)=[1687, 1479, 1558]
  - text: Travel to Theramore to see about getting Lady Jaina Proudmoore's autograph for your ward.
  - objectives:
    1. item 1x Jaina's Autograph <- Lady Jaina Proudmoore [npc 4968] L63-63 ~Dustwallow Marsh 66,49 (1 spawns)

## 1468 Children's Week  (L60 req10, ? xp, sort=SPECIAL)
  - start: Orphan Matron Nightingale [npc 14450] @ Stormwind City 56.3,54.0
  - end:   Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - text: Use the Human Orphan Whistle to talk with the child you will be looking after during Children's Week.

## 1479 The Bough of the Eternals  (L60 req10, 660 xp, sort=SPECIAL)
  - start: Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - end:   Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - pre(any)=[1468]
  - text: Take the orphan to the bank of Darnassus. The bank itself is hollowed out of a tree known as the Bough of the Eternals.

## 1558 The Stonewrought Dam  (L60 req10, 660 xp, sort=SPECIAL)
  - start: Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - end:   Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - pre(any)=[1468]
  - text: Take the orphan to the Stonewrought Dam in Loch Modan. You should take him to the middle of the dam so he can see out over the giant waterfall.

## 1687 Spooky Lighthouse  (L60 req10, 660 xp, sort=SPECIAL)
  - start: Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - end:   Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - pre(any)=[1468]
  - text: Take the orphan to see the lighthouse off the coast of Westfall.

## 4822 You Scream, I Scream...  (L60 req10, 660 xp, sort=SPECIAL)
  - start: Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - end:   Human Orphan [npc 14305] @ Stormwind City 56.3,54.3
  - pre(all)=[1479, 1558, 1687]
  - text: Get some Strawberry Ice Cream for your ward. The lad seems to prefer Tigule's brand ice cream.
  - objectives:
    1. item 1x Tigule's Strawberry Ice Cream <- ?

## 6182 The First and the Last  (L60 req56, 660 xp)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - next=6183
  - text: Speak with Mathias Shaw in Old Town Stormwind. He resides in the Barracks.

## 6183 Honor the Dead  (L60 req56, 660 xp)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - pre(any)=[6182], next=6184
  - text: Speak with Mathias Shaw again if you wish to accept his task.

## 6186 The Blightcaller Cometh  (L60 req56, 6600 xp)
  - start: Flint Shadowmore [npc 12425] @ Western Plaguelands 43.6,84.5
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - pre(any)=[6185], next=6187
  - text: Return to Stormwind and inform Highlord Bolvar Fordragon of the fate of Nathanos Marris.

## 6402 Stormwind Rendezvous  (L60 req50, 660 xp)
  - start: Marshal Maxwell [npc 9560] @ Burning Steppes 84.7,69.0
  - end:   Reginald Windsor [npc 12580] @ Stormwind City 73.6,91.0
  - pre(any)=[4322], next=6403
  - text: Travel to Stormwind City and venture to the city gates. Speak with Squire Rowe so that he may let Marshal Windsor know that you have arrived.

## 6403 The Great Masquerade  (L60 req50, 9950 xp)
  - start: Reginald Windsor [npc 12580] @ Stormwind City 73.6,91.0
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - pre(any)=[6402], next=6501, exclusiveTo=[99435]
  - text: Follow Reginald Windsor through Stormwind. Protect him from harm!

## 6501 The Dragon's Eye  (L60 req50, 6600 xp)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Haleh [npc 10929] @ Winterspring 54.5,51.2
  - pre(any)=[6403], next=6502
  - text: You must search the world for a being capable of restoring the power to the Fragment of the Dragon's Eye. The only information you possess about such a being is that they exist.

## 7023 Greatfather Winter is Here!  (L60 req10, 660 xp, sort=SEASONAL)
  - start: Khole Jinglepocket [npc 13435] @ Stormwind City 62.2,70.3
  - end:   Greatfather Winter [npc 13444] @ Ironforge 33.2,65.4
  - exclusiveTo=[7022]
  - text: Speak with Greatfather Winter; he is located near the Smokywood Pastures vendor area in Ironforge.

## 7495 Victory for the Alliance  (L60 req60, 9950 xp)
  - start: item Head of Onyxia [18423] (drops from Onyxia)
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - pre(any)=[6502], next=7496
  - text: Take the Head of Onyxia to Highlord Bolvar Fordragon in Stormwind.

## 7496 Celebrating Good Times  (L60 req60, 9950 xp)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Major Mattingly [npc 14394] @ Stormwind City 67.2,85.5
  - pre(any)=[7495], next=7497
  - text: Seek out Major Mattingly in the Valley of Heroes.

## 7497 The Journey Has Just Begun  (L60 req60, ? xp)
  - start: Major Mattingly [npc 14394] @ Stormwind City 67.2,85.5
  - end:   Major Mattingly [npc 14394] @ Stormwind City 67.2,85.5
  - pre(any)=[7496]

## 7637 Emphasis on Sacrifice  (L60 req60, 660 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - pre(any)=[7638], next=7639
  - text: Travel to Ironforge and get High Priest Rohan's Exorcism Censer. You will need to make a donation of 150 gold in order to secure it.

## 7638 Lord Grayson Shadowbreaker  (L60 req60, 660 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - text: Speak with Lord Grayson Shadowbreaker in Stormwind's Cathedral District.

## 7640 Exorcising Terrordale  (L60 req60, 6600 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - pre(any)=[7639]
  - text: Use the Exorcism Censer to drive out the spirits that torment Terrordale. When you have slain 25 Terrordale Spirits, return to Lord Grayson Shadowbreaker in the Cathedral District of Stormwind.
  - objectives:
    1. kill 25x Terrordale Spirit <- Terrordale Spirit [npc 14564] L59-60 ~Eastern Plaguelands 12,21 (35 spawns)

## 7641 The Work of Grimand Elmore  (L60 req60, 660 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - pre(any)=[7640], next=7642
  - text: Speak with Grimand Elmore in Stormwind's Dwarven District.

## 7642 Collection of Goods  (L60 req60, 1650 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - end:   Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - pre(any)=[7641]
  - text: Bring 40 Runecloth, 6 Arcanite Bars, 10 Arthas' Tears, 5 Stratholme Holy Water vials, and 150 gold to Grimand Elmore in the Dwarven District of Stormwind.
  - objectives:
    1. item 1x Stratholme Holy Water <- Supply Crate [object 176224]; Stratholme Supply Crate [object 181085]
    2. item 1x Arthas' Tears <- Arthas' Tears [object 142141] ~Eastern Plaguelands 44,57 (125 spawns); Arthas' Tears [object 176642] ~Felwood 44,52 (4 spawns)
    3. item 40x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]
    4. item 1x Arcanite Bar <- ?

## 7643 Ancient Equine Spirit  (L60 req60, 4950 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Ancient Equine Spirit [npc 14566] @ no spawn
  - pre(any)=[7642], next=7644
  - text: Acquire special horse feed used for feeding a spirit horse. Merideth Carlson in Southshore apparently is the source for such food.
  - text: Travel to the Dire Maul dungeon in Feralas and slay Tendris Warpwood. Doing so will free the Ancient Equine Spirit. Feed it the special horse feed, thereby soothing the spirit. Finally, give it the Arcanite Barding so it may bless it.
  - objectives:
    1. item 1x Manna-Enriched Horse Feed <- ?

## 7646 The Divination Scryer  (L60 req60, 3300 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - pre(any)=[7644], next=7647
  - text: Bring an Azerothian Diamond and a Pristine Black Diamond to Lord Grayson Shadowbreaker in the Cathedral District of Stormwind.
  - objectives:
    1. item 1x Azerothian Diamond <- Cliff Breaker [npc 6146] L54-55 ~Azshara 62,58 (24 spawns); Anubisath Guardian [npc 15355] L62-62; Small Thorium Vein [object 324] ~Silithus 53,47 (811 spawns); Ooze Covered Thorium Vein [object 123848] ~Feralas 53,79 (13 spawns)
    2. item 1x Pristine Black Diamond <- Skeletal Warlord [npc 1788] L56-57 ~Western Plaguelands 44,68 (6 spawns); Flesh Golem [npc 1805] L56-57 ~Western Plaguelands 45,69 (2 spawns); Scarlet Magus [npc 1832] L56-57 ~Western Plaguelands 46,15 (9 spawns); Scarlet Cavalier [npc 1836] L56-58 ~Western Plaguelands 42,15 (6 spawns)

## 7647 Judgment and Redemption  (L60 req60, 9950 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Darkreaver's Fallen Charger [npc 14568] @ no spawn
  - pre(any)=[7646]
  - text: Use the Divination Scryer in the heart of the Great Ossuary's basement in the Scholomance. Doing so will bring forth the spirits you must judge. Defeating these spirits will summon forth Death Knight Darkreaver. Defeat him and reclaim the lost soul of the fallen charger.
  - text: Give the Charger's Redeemed Soul and the Blessed Enchanted Barding to Darkreaver's Fallen Charger.
  - objectives:
    1. item 1x Charger's Redeemed Soul <- ?
    2. item 1x Blessed Arcanite Barding <- Risen Construct [npc 10488] L58-61; Petrified Treant [npc 11458] L57-59

## 7648 Grimand's Finest Work  (L60 req60, 6600 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Grimand Elmore [npc 1416] @ Stormwind City 59.7,33.8
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - pre(any)=[7642]
  - text: Take the Arcanite Barding to Lord Grayson Shadowbreaker in Stormwind's Cathedral District for his inspection.

## 7666 Again Into the Great Ossuary  (L60 req60, ? xp, races=Human/Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - pre(any)=[7647]

## 7781 The Lord of Blackrock  (L60 req60, 9950 xp)
  - start: item Head of Nefarian [19003] (drops from Nefarian)
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - next=7782
  - text: Return the Head of Nefarian to Highlord Bolvar Fordragon in Stormwind.

## 7782 The Lord of Blackrock  (L60 req60, 9950 xp)
  - start: Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - end:   Field Marshal Stonebridge [npc 14721] @ Stormwind City 71.5,80.5
  - pre(any)=[7781]
  - text: Venture to the Valley of Heroes in Stormwind City and speak with Field Marshal Afrasiabi.

## 7791 A Donation of Wool  (L60 req12, 660 xp)
  - start: Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - end:   Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - objectives:
    1. item 1x Wool Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns)

## 7793 A Donation of Silk  (L60 req26, 1650 xp)
  - start: Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - end:   Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - objectives:
    1. item 1x Silk Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns)

## 7794 A Donation of Mageweave  (L60 req40, 3300 xp)
  - start: Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - end:   Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - objectives:
    1. item 1x Mageweave Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Solid Chest [object 2855] ~Hillsbrad Foothills 51,41 (52 spawns); Solid Chest [object 2857] ~Dustwallow Marsh 43,43 (90 spawns); Solid Chest [object 4149] ~Dustwallow Marsh 48,57 (105 spawns)

## 7795 A Donation of Runecloth  (L60 req50, 6600 xp)
  - start: Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - end:   Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - pre(all)=[7791, 7793, 7794], next=7796
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 7796 Additional Runecloth  (L60 req50, ? xp, repeatable)
  - start: Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - end:   Clavicus Knavingham [npc 14722] @ Stormwind City 53.9,81.7
  - pre(any)=[7795]
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 8311 Hallow's End Treats for Jesper!  (L60 req10, 1650 xp, sort=SEASONAL)
  - start: Jesper [npc 15310] @ Stormwind City 56.5,51.8
  - end:   Jesper [npc 15310] @ Stormwind City 56.5,51.8
  - text: Speak with the innkeepers of Stormwind, Ironforge, and Darnassus, as well as Talvash del Kissel in Ironforge. Perform the tricks they ask of you in exchange for the treats they offer.
  - text: Return to Jesper at the Stormwind Orphanage with a Darnassus Marzipan, Gnomeregan Gumdrop, Stormwind Nougat, and Ironforge Mint.
  - objectives:
    1. item 1x Stormwind Nougat <- Innkeeper Allison [npc 6740] L30-30 ~Stormwind City 60,75 (1 spawns)
    2. item 1x Gnomeregan Gumdrop <- Talvash del Kissel [npc 6826] L50-50 ~Ironforge 36,4 (1 spawns)
    3. item 1x Ironforge Mint <- Innkeeper Firebrew [npc 5111] L30-30 ~Ironforge 18,51 (1 spawns)
    4. item 1x Darnassus Marzipan <- Innkeeper Saelienne [npc 6735] L30-30 ~Darnassus 67,16 (1 spawns)

## 8356 Flexing for Nougat  (L60 req10, ? xp, sort=SEASONAL, repeatable)
  - start: Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3
  - end:   Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3
  - text: Do a flex emote at Innkeeper Allison, and in exchange you'll receive Stormwind Nougat!
  - objectives:
    1. kill 1x Innkeeper Allison <- Innkeeper Allison [npc 6740] L30-30 ~Stormwind City 60,75 (1 spawns)

## 8646 Hammershout the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Hammershout [npc 15562] @ Stormwind City 36.3,66.1
  - end:   Elder Hammershout [npc 15562] @ Stormwind City 36.3,66.1

## 8796 The Alliance Needs Your Help!  (L60 req1, 9950 xp, sort=AHN_QIRAJ_WAR)
  - start: Master Sergeant Maclure [npc 15708] @ Stormwind City 61.5,70.6
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - exclusiveTo=[8795, 8797]
  - text: Speak with Field Marshal Snowfall in Ironforge's Military Ward.

## 8830 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - end:   Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - pre(any)=[8811]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8831 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - end:   Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - pre(any)=[8819]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8860 New Year Celebrations!  (L60 req1, ? xp, sort=SEASONAL)
  - start: Wonderform Operator [npc 15732] @ Stormwind City 67.9,71.4
  - end:   Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3
  - text: Bring the Smokywood Supplies to Innkeeper Allison in Stormwind.

## 8870 The Lunar Festival  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Lunar Festival Emissary [npc 15892] @ Stormwind City 61.7,75.7
  - end:   Lunar Festival Harbinger [npc 15895] @ Stormwind City 37.6,65.6
  - next=8867, breadcrumbFor=8867, exclusiveTo=[8871, 8872]
  - text: Talk to the Lunar Festival Harbinger in the Mystic Ward of Ironforge. You can also talk to Lunar Festival Harbingers in other capital cities.

## 8897 Dearest Colara,  (L60 req1, ? xp, sort=SEASONAL)
  - start: Lieutenant Jocryn Heldric [npc 16005] @ Stormwind City 63.8,70.5
  - end:   Colara Dean [npc 16002] @ Stormwind City 61.7,75.5
  - next=8903, breadcrumbFor=8903, exclusiveTo=[8898, 8899]
  - text: Deliver Lieutenant Heldric's Carefully Penned Note to Colara Dean outside the bank in Stormwind.

## 8903 Dangerous Love  (L60 req1, ? xp, sort=SEASONAL)
  - start: Aristan Mottar [npc 16105] @ Stormwind City 61.9,75.0
  - end:   Aristan Mottar [npc 16105] @ Stormwind City 61.9,75.0
  - next=9024
  - text: Get a Stormwind Guard's Card and return it to Aristan Mottar in Stormwind.
  - objectives:
    1. item 1x Stormwind Guard's Card <- ?

## 9024 Aristan's Hunch  (L60 req1, ? xp, sort=SEASONAL)
  - start: Aristan Mottar [npc 16105] @ Stormwind City 61.9,75.0
  - end:   Morgan Pestle [npc 279] @ Stormwind City 63.2,74.4
  - pre(any)=[8903], next=9025
  - text: Bring 1 Cologne Bottle and 1 Perfume Bottle to Morgan Pestle in the Trade District of Stormwind.
  - objectives:
    1. item 1x Cologne Bottle <- ?
    2. item 1x Perfume Bottle <- ?

## 9025 Morgan's Discovery  (L60 req1, ? xp, sort=SEASONAL)
  - start: Morgan Pestle [npc 279] @ Stormwind City 63.2,74.4
  - end:   Aristan Mottar [npc 16105] @ Stormwind City 61.9,75.0
  - pre(any)=[9024], next=9026
  - text: Return to Aristan Mottar outside the bank in Stormwind's Trade District.

## 9026 Tracing the Source  (L60 req1, ? xp, sort=SEASONAL)
  - start: Aristan Mottar [npc 16105] @ Stormwind City 61.9,75.0
  - end:   Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3
  - pre(any)=[9025], next=9027
  - text: Speak with Innkeeper Allison at The Gilded Rose in Stormwind's Trade District.

## 9027 Tracing the Source  (L60 req1, ? xp, sort=SEASONAL)
  - start: Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3
  - end:   Evert Sorisam [npc 16106] @ Stormwind City 50.5,60.8
  - pre(any)=[9026], next=9028
  - text: Speak with Evert Sorisam at The Finest Thread along Stormwind's Canals.

## 9028 The Source Revealed  (L60 req1, ? xp, sort=SEASONAL)
  - start: Evert Sorisam [npc 16106] @ Stormwind City 50.5,60.8
  - end:   Apothecary Staffron Lerent [npc 16107] @ Alterac Mountains 89.4,74.9
  - pre(any)=[9027], next=9029, exclusiveTo=[8984]
  - text: Find Apothecary Staffron Lerent in the Hillsbrad Foothills behind Ravenholdt Manor.

## 84377 End of the Dark Horde  (L60 req60, ? xp, F)
  - start: ?
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7; General Marcus Jonathan [npc 466] @ Stormwind City 69.2,82.7
  - text: Take the Head of Rend Blackhand to Master Mathias Shaw in Stormwind.

## 84395 Undead Potatoes  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463213] @ Western Plaguelands 38.2,54.6
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x Undead Potatoes <- Book [object 463213] ~Western Plaguelands 38,55 (1 spawns)

## 84396 Magma or Lava?  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463206] @ Burning Steppes 26.4,24.4
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x Magma or Lava? <- Book [object 463206] ~Burning Steppes 26,24 (1 spawns)

## 84397 Northern Kalimdor - A Comprehensive Guide  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463209] @ Felwood 65.2,3.3
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x Northern Kalimdor - A Comprehensive Guide <- Book [object 463209] ~Felwood 65,3 (1 spawns)

## 84398 A Study of the Light  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463207] @ Eastern Plaguelands 71.9,48.3
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x A Study of the Light <- Book [object 463207] ~Eastern Plaguelands 72,48 (1 spawns)

## 84399 Ka-Boom!  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463214] @ Winterspring 60.7,37.7
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x Ka-Boom! <- Book [object 463214] ~Winterspring 61,38 (1 spawns)

## 84400 The Knight and the Lady  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463208] @ Eastern Plaguelands 47.3,42.2
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x The Knight and the Lady <- Book [object 463208] ~Eastern Plaguelands 47,42 (1 spawns)

## 84401 Scourge: Undead Menace or Misunderstood?  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463212] @ Eastern Plaguelands 26.4,15.1
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x Scourge: Undead Menace or Misunderstood? <- Book [object 463212] ~Eastern Plaguelands 26,15 (1 spawns)

## 84402 Necromancy 101  (L60 req1, ? xp, F, sort=SPECIAL)
  - start: Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9; Book [object 463211] @ Western Plaguelands 69.4,72.8
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8; Oran Snakewrithe [npc 7825] @ Undercity 73.1,32.9
  - objectives:
    1. item 1x Necromancy 101 <- Book [object 463211] ~Western Plaguelands 69,73 (1 spawns)

## 97883 End of the Dark Horde  (L60 req60, ? xp, F)
  - start: Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - end:   Major Mattingly [npc 14394] @ Stormwind City 67.2,85.5
  - text: Bring the Head of Rend Blackhand to Major Mattingly in Stormwind.

## 99435 The Great Masquerade  (L60 reqNone, 9950 xp, F)
  - start: Squire Rowe [npc 17804] @ Stormwind City 74.2,90.3
  - end:   Highlord Bolvar Fordragon [npc 1748] @ Stormwind City 80.2,38.4
  - pre(any)=[6402], exclusiveTo=[6403]
  - text: Follow Reginald Windsor through Stormwind. Protect him from harm!
  - text: Speak to Squire Rowe if you need to contact Reginald Windsor again.

# Service NPCs

- Roberto Pupellyverbos <Merlot Connoisseur> [npc 277] 60.0,76.9: vendor
- Maginor Dumas <Master Mage> [npc 331] 49.2,87.8: trainer
- Kendor Kabonka <Master of Cooking Recipes> [npc 340] 77.5,52.7: vendor
- Dungar Longdrink <Gryphon Master> [npc 352] 71.3,72.2: flightMaster
- High Priestess Laurena <Priest Trainer> [npc 376] 49.5,44.6: trainer
- Demisette Cloyce <Warlock Trainer> [npc 461] 39.2,85.0: trainer
- Elaine Trias <Mistress of Cheese> [npc 483] 66.6,73.4: vendor
- Ander Germaine <Warrior Trainer> [npc 914] 80.2,61.3: trainer
- Osborne the Night Man <Rogue Trainer> [npc 918] 77.4,65.3: trainer
- Lord Grayson Shadowbreaker <Paladin Trainer> [npc 928] 48.4,50.2: trainer
- Dane Lindgren <Journeyman Blacksmith> [npc 957] 64.1,37.0: trainer
- Keldric Boucher <Arcane Goods Vendor> [npc 1257] 62.8,75.0: vendor
- Kyra Boucher <Reagent Vendor> [npc 1275] 63.1,74.9: vendor
- Thurman Mullby <General Goods Vendor> [npc 1285] 64.8,72.2: vendor
- Edna Mullby <Trade Supplier> [npc 1286] 64.7,71.3: vendor
- Marda Weller <Weapons Merchant> [npc 1287] 64.1,68.4: repair, vendor
- Gunther Weller <Weapons Merchant> [npc 1289] 64.2,68.6: repair, vendor
- Carla Granger <Cloth Armor Merchant> [npc 1291] 62.0,67.8: repair, vendor
- Maris Granger <Skinning Trainer> [npc 1292] 72.1,62.2: trainer
- Aldric Moore <Mail Armor Merchant> [npc 1294] 61.9,67.2: repair, vendor
- Lara Moore <Leather Armor Merchant> [npc 1295] 62.0,67.5: repair, vendor
- Lina Stover <Bow & Gun Merchant> [npc 1297] 58.7,68.7: repair, vendor
- Frederick Stover <Bow & Arrow Merchant> [npc 1298] 58.4,69.0: repair, vendor
- Lisbeth Schneider <Clothier> [npc 1299] 58.3,67.2: repair, vendor
- Lawrence Schneider <Journeyman Tailor> [npc 1300] 53.5,81.5: trainer
- Julia Gallina <Wine Vendor> [npc 1301] 59.9,77.7: vendor
- Bernard Gump <Florist> [npc 1302] 69.2,71.8: vendor
- Felicia Gump <Herbalism Supplier> [npc 1303] 69.3,71.3: vendor
- Darian Singh <Fireworks Vendor> [npc 1304] 42.4,76.9: vendor
- Jarel Moor <Bartender> [npc 1305] 42.0,82.7: vendor
- Charys Yserian <Arcane Trinkets Vendor> [npc 1307] 44.6,86.3: vendor
- Owen Vaughn <Reagent Vendor> [npc 1308] 47.4,82.5: vendor
- Wynne Larson <Robe Merchant> [npc 1309] 51.8,83.5: repair, vendor
- Evan Larson <Hatter> [npc 1310] 52.6,83.7: repair, vendor
- Joachim Brenlow <Bartender> [npc 1311] 51.5,94.1: vendor
- Ardwyn Cailen <Wand Merchant> [npc 1312] 52.9,74.8: repair, vendor
- Maria Lumere <Alchemy Supplies> [npc 1313] 55.9,85.6: vendor
- Duncan Cullen <Light Armor Merchant> [npc 1314] 53.2,82.0: repair, vendor
- Allan Hafgan <Staves Merchant> [npc 1315] 53.0,74.9: repair, vendor
- Adair Gilroy <Librarian> [npc 1316] 51.8,75.1: vendor
- Lucan Cordell <Expert Enchanter> [npc 1317] 52.9,74.5: trainer
- Jessara Cordell <Enchanting Supplies> [npc 1318] 52.8,74.3: vendor
- Bryan Cross <Shield Merchant> [npc 1319] 69.2,57.6: repair, vendor
- Seoman Griffith <Leather Armor Merchant> [npc 1320] 71.9,62.0: repair, vendor
- Alyssa Griffith <Bag Vendor> [npc 1321] 71.7,62.2: vendor
- Osric Strang <Heavy Armor Merchant> [npc 1323] 77.2,61.0: repair, vendor
- Heinrich Stone <Blade Merchant> [npc 1324] 77.2,57.4: repair, vendor
- Jasper Fel <Shady Dealer> [npc 1325] 80.3,70.1: vendor
- Sloan McCoy <Poison Supplier> [npc 1326] 78.6,70.9: vendor
- Elly Langston <Barmaid> [npc 1328] 76.5,54.3: vendor
- Gerik Koen <Two Handed Weapon Merchant> [npc 1333] 73.0,57.5: repair, vendor
- Mayda Thane <Cobbler> [npc 1339] 71.7,58.2: repair, vendor
- Wilhelm Strang <Mail Armor Merchant> [npc 1341] 77.5,61.3: repair, vendor
- Georgio Bolero <Artisan Tailor> [npc 1346] 53.1,81.3: trainer
- Alexandra Bolero <Tailoring Supplies> [npc 1347] 53.1,81.8: vendor
- Gregory Ardus <Staff & Mace Merchant> [npc 1348] 48.1,55.1: repair, vendor
- Agustus Moulaine <Mail Armor Merchant> [npc 1349] 53.5,57.6: repair, vendor
- Theresa Moulaine <Robe Vendor> [npc 1350] 53.2,57.9: repair, vendor
- Brother Cassius <Reagent Vendor> [npc 1351] 53.3,45.3: vendor
- Milton Sheaf <Librarian> [npc 1440] 77.1,30.2: vendor
- Shaina Fuller <First Aid Trainer> [npc 2327] 53.0,44.7: trainer
- Olivia Burnside <Banker> [npc 2455] 64.3,80.8: banker
- Newton Burnside <Banker> [npc 2456] 63.9,81.1: banker
- John Burnside <Banker> [npc 2457] 63.5,81.5: banker
- Larimaine Purdue <Portal Trainer> [npc 2485] 50.4,86.0: trainer
- Karrina Mekenda <Pet Trainer> [npc 2879] 67.3,36.8: trainer
- Thomas Miller <Baker> [npc 3518] 67.9,72.1: vendor
- Aldwin Laughlin <Guild Master> [npc 4974] 63.8,76.8: petitioner, tabardDesigner
- Ben Trias <Apprentice of Cheese> [npc 4981] 66.4,73.5: vendor
- Rebecca Laughlin <Tabard Vendor> [npc 5193] 64.0,77.5: tabardDesigner, vendor
- Wu Shen <Warrior Trainer> [npc 5479] 80.5,59.9: trainer
- Ilsa Corbin <Warrior Trainer> [npc 5480] 80.4,59.8: trainer
- Stephen Ryback <Cooking Trainer> [npc 5482] 78.2,53.1: trainer
- Erika Tate <Cooking Supplier> [npc 5483] 78.5,52.9: vendor
- Brother Benjamin <Priest Trainer> [npc 5484] 52.3,47.6: trainer
- Brother Joshua <Priest Trainer> [npc 5489] 49.5,45.2: trainer
- Arthur the Faithful <Paladin Trainer> [npc 5491] 49.6,49.8: trainer
- Katherine the Pure <Church of the Holy Light> [npc 5492] 48.5,49.1: trainer
- Arnold Leland <Fishing Trainer> [npc 5493] 55.0,69.7: trainer
- Catherine Leland <Fishing Supplier> [npc 5494] 55.1,69.8: vendor
- Ursula Deline <Warlock Trainer> [npc 5495] 39.9,84.2: trainer
- Sandahl <Warlock Trainer> [npc 5496] 39.7,85.7: trainer
- Jennea Cannon <Mage Trainer> [npc 5497] 49.6,85.8: trainer
- Elsharin <Mage Trainer> [npc 5498] 48.2,87.2: trainer
- Lilyssia Nightbreeze <Expert Alchemist> [npc 5499] 55.7,86.1: trainer
- Tel'Athir <Journeyman Alchemist> [npc 5500] 55.5,85.7: trainer
- Shylamiir <Herbalism Trainer> [npc 5502] 31.5,62.6: trainer
- Eldraeith <Herbalism Supplier> [npc 5503] 55.8,85.3: vendor
- Sheldras Moontree <Druid Trainer> [npc 5504] 35.8,67.4: trainer
- Theridran <Druid Trainer> [npc 5505] 36.1,64.4: trainer
- Maldryn <Druid Trainer> [npc 5506] 34.4,65.2: trainer
- Kathrum Axehand <Axe Merchant> [npc 5509] 59.3,33.8: repair, vendor
- Thulman Flintcrag <Guns Vendor> [npc 5510] 62.0,36.6: repair, vendor
- Therum Deepforge <Expert Blacksmith> [npc 5511] 63.7,37.0: trainer
- Kaita Deepforge <Blacksmithing Supplies> [npc 5512] 63.3,37.7: repair, vendor
- Gelman Stonehand <Mining Trainer> [npc 5513] 59.2,37.8: trainer
- Brooke Stonebraid <Mining Supplier> [npc 5514] 59.1,37.5: vendor
- Einris Brightspear <Hunter Trainer> [npc 5515] 67.3,36.2: trainer
- Ulfir Ironbeard <Hunter Trainer> [npc 5516] 67.6,35.8: trainer
- Thorfin Stoneshield <Hunter Trainer> [npc 5517] 68.0,36.0: trainer
- Lilliam Sparkspindle <Expert Engineer> [npc 5518] 62.1,30.3: trainer
- Billibub Cogspinner <Engineering Supplier> [npc 5519] 62.4,29.9: vendor
- Spackle Thornberry <Demon Trainer> [npc 5520] 39.5,84.5: vendor
- Simon Tanner <Expert Leatherworker> [npc 5564] 71.7,63.0: trainer
- Jillian Tanner <Leatherworking Supplies> [npc 5565] 71.6,62.8: vendor
- Tannysa <Herbalism Trainer> [npc 5566] 54.3,84.1: trainer
- Sellandus <Expert Tailor> [npc 5567] 52.2,83.1: trainer
- Innkeeper Allison <Innkeeper> [npc 6740] 60.4,75.3: innkeeper, vendor
- Borgus Steelhand <Weapon Crafter> [npc 7232] 59.4,34.3: trainer
- Thelman Slatefist <Alterac Valley Battlemaster> [npc 7410] 79.4,37.0: battlemaster
- Lil Timmy <Boy with kittens> [npc 8666] 46.6,55.7: vendor
- Auctioneer Chilton <> [npc 8670] 60.9,71.5: auctioneer
- Auctioneer Fitch <> [npc 8719] 61.2,71.3: auctioneer
- Jalane Ayrole <Master Shadoweave Tailor> [npc 9584] 40.4,84.6: trainer
- Sylista <Stable Master> [npc 9977] 42.6,64.1: stableMaster
- Sprite Jumpsprocket <Journeyman Engineer> [npc 11026] 61.9,30.6: trainer
- Betty Quin <Journeyman Enchanter> [npc 11068] 53.0,73.7: trainer
- Jenova Stoneshield <Stable Master> [npc 11069] 67.2,37.7: stableMaster
- Randal Worth <Journeyman Leatherworker> [npc 11096] 72.1,62.9: trainer
- Nara Meideros <Priest Trainer> [npc 11397] 35.7,63.2: trainer
- Woo Ping <Weapon Master> [npc 11867] 63.9,69.1: trainer
- Officer Areyn <Accessories Quartermaster> [npc 12805] 76.8,66.0: repair, vendor
- Lord Tony Romano <Rogue Trainer> [npc 13283] 80.3,68.6: trainer
- Guchie Jinglepocket <Smokywood Pastures> [npc 13436] 62.6,70.0: vendor
- Orphan Matron Nightingale <> [npc 14450] 56.3,54.0: vendor
- Emmithue Smails <Sweet Treats> [npc 14481] 61.3,75.0: vendor
- Elfarran <Warsong Gulch Battlemaster> [npc 14981] 80.8,39.6: battlemaster
- Lady Hoteshem <Arathi Basin Battlemaster> [npc 15008] 80.2,36.7: battlemaster
- Alliance Brigadier General <> [npc 15351] 81.2,38.2: vendor
- Auctioneer Jaxon <> [npc 15659] 61.2,70.7: auctioneer
- Lunar Festival Vendor <> [npc 15898] 37.3,64.0: vendor
- Liv Bradford <Bartender> [npc 203475] 37.1,74.2: vendor
- Antonio Bolero <Tailoring Recipes> [npc 258568] 53.5,81.8: vendor
- James Battlewing <Darkspear Islands Battlemaster> [npc 263349] 81.2,38.7: battlemaster
- Fyrenz Vishonar <Transmogrifier> [npc 270581] 48.0,84.6: transmogrifier
- Jelinek Sharpshear <Barber> [npc 277024] 61.4,64.9: barber
