# Ironforge: Alliance + neutral quests (258)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 60860 Your Reward has Arrived!  (LNone reqNone, ? xp, F)
  - start: Innkeeper Firebrew [npc 5111] @ Ironforge 18.1,51.5; Innkeeper Saelienne [npc 6735] @ Darnassus 67.4,15.7; Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3; Innkeeper Norman [npc 6741] @ Undercity 67.7,37.9; Innkeeper Pala [npc 6746] @ Thunder Bluff 45.8,64.7; Innkeeper Gryshka [npc 6929] @ Orgrimmar 54.1,68.4
  - end:   Innkeeper Firebrew [npc 5111] @ Ironforge 18.1,51.5; Innkeeper Saelienne [npc 6735] @ Darnassus 67.4,15.7; Innkeeper Allison [npc 6740] @ Stormwind City 60.4,75.3; Innkeeper Norman [npc 6741] @ Undercity 67.7,37.9; Innkeeper Pala [npc 6746] @ Thunder Bluff 45.8,64.7; Innkeeper Gryshka [npc 6929] @ Orgrimmar 54.1,68.4
  - exclusiveTo=[60870]

## 8744 A Carefully Wrapped Present  (L1 req1, ? xp, sort=SEASONAL)
  - start: Carefully Wrapped Present [object 180743] @ Ironforge 33.9,65.7
  - end:   Carefully Wrapped Present [object 180743] @ Ironforge 33.9,65.7

## 8767 A Gently Shaken Gift  (L1 req1, ? xp, class=Warrior/Paladin/Hunter/Rogue, sort=SEASONAL)
  - start: Gently Shaken Gift [object 180746] @ Ironforge 33.5,65.6
  - end:   Gently Shaken Gift [object 180746] @ Ironforge 33.5,65.6
  - exclusiveTo=[8788]

## 8788 A Gently Shaken Gift  (L1 req1, ? xp, class=Priest/Shaman/Mage/Warlock/Druid, sort=SEASONAL)
  - start: Gently Shaken Gift [object 180746] @ Ironforge 33.5,65.6
  - end:   Gently Shaken Gift [object 180746] @ Ironforge 33.5,65.6
  - exclusiveTo=[8767]

## 97263 Your Package Has Arrived  (L2 req1, 45 xp, F)
  - start: Misplaced Packages [object 660964] @ Ironforge 72.3,48.6
  - end:   Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8
  - text: Deliver Eldrun's misplaced package.

## 96243 Call of Earth  (L4 req4, 180 xp, F, races=Dwarf/Gnome, class=Shaman, sort=SHAMAN)
  - start: Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8; Ingrid Dunwald [npc 258113] @ Dun Morogh 47.6,52.0
  - end:   Teo Hammerstorm [npc 257446] @ Dun Morogh 28.8,66.2
  - text: Find Teo Hammerstorm in Dun Morogh.

## 96045 Camping 101: Alchemy  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Vosur Brakthel [npc 1246] @ Ironforge 66.3,55.7
  - end:   Vosur Brakthel [npc 1246] @ Ironforge 66.3,55.7
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[97899, 97915, 97927, 97938, 97951, 97963]
  - text: Speak with Vosur Brakthel in Ironforge to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Vosur Brakthel <- Vosur Brakthel [npc 1246] L30-30 ~Ironforge 66,56 (1 spawns)

## 96059 Camping 101: Enchanting  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Thonys Pillarstone [npc 11065] @ Ironforge 60.3,45.4
  - end:   Thonys Pillarstone [npc 11065] @ Ironforge 60.3,45.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[97901, 97917, 97929, 97940, 97953, 98284, 98286]
  - text: Speak with Thonys Pillarstone in Ironforge to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Thonys Pillarstone <- Thonys Pillarstone [npc 11065] L25-25 ~Ironforge 60,45 (1 spawns)

## 1682 Grey Iron Weapons  (L10 req10, 630 xp, class=Warrior, sort=WARRIOR)
  - start: Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - end:   Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - pre(any)=[1681]

## 1715 The Slaughtered Lamb  (L10 req10, 420 xp, class=Warlock, sort=WARLOCK)
  - start: Lago Blackwrench [npc 6120] @ Ironforge 47.6,9.3
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - exclusiveTo=[1688]
  - text: Report to Gakin the Darkbinder in the Mage Quarter of Stormwind.

## 1880 Mage-tastic Gizmonitor  (L10 req10, 840 xp, races=Human/Gnome, class=Mage, sort=MAGE)
  - start: Bink [npc 5144] @ Ironforge 27.2,8.3
  - end:   Bink [npc 5144] @ Ironforge 27.2,8.3
  - exclusiveTo=[1861]
  - text: Bring Bink her Mage-tastic Gizmonitor.
  - objectives:
    1. item 1x Mage-tastic Gizmonitor <- Bink's Toolbox [object 102984] ~Dun Morogh 28,36 (1 spawns)

## 2238 Simple Subterfugin'  (L10 req10, 840 xp, class=Rogue, sort=ROGUE)
  - start: Hulfdan Blackbeard [npc 5165] @ Ironforge 52.0,14.8
  - end:   Onin MacHammar [npc 6886] @ Dun Morogh 25.2,44.5
  - pre(any)=[2218], next=2239
  - text: Find Onin MacHammar by Gnomeregan.

## 5633 Returning Home  (L10 req10, 210 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5627, 5628, 5629, 5630, 5631, 5632]
  - text: Speak to Priestess Alathea in Darnassus.

## 5639 Desperate Prayer  (L10 req10, 210 xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5634, 5635, 5636, 5637, 5638, 5640]
  - text: Speak to High Priestess Laurena in Stormwind.

## 6074 The Hunter's Path  (L10 req10, 85 xp, races=Dwarf, class=Hunter, sort=HUNTER)
  - start: Olmin Burningbeard [npc 5116] @ Ironforge 70.9,83.6
  - end:   Grif Wildheart [npc 1231] @ Dun Morogh 45.8,53.0
  - next=6064, breadcrumbFor=6064, exclusiveTo=[6075, 6076]
  - text: Speak with Grif Wildheart in Kharanos.

## 6721 The Hunter's Path  (L10 req10, 85 xp, races=NightElf, class=Hunter)
  - start: Olmin Burningbeard [npc 5116] @ Ironforge 70.9,83.6
  - end:   Dazalar [npc 3601] @ Teldrassil 56.7,59.5
  - next=6063, breadcrumbFor=6063, exclusiveTo=[6071, 6072, 6073, 6722]
  - text: Speak with Dazalar in Dolanaar.

## 8803 A Festive Gift  (L10 req10, ? xp, sort=SEASONAL)
  - start: Festive Gift [object 180793] @ Ironforge 34.0,65.9
  - end:   Festive Gift [object 180793] @ Ironforge 34.0,65.9

## 94449 Call of Fire  (L10 req10, 420 xp, F, races=Dwarf, class=Shaman, sort=SHAMAN)
  - start: Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8; Ingrid Dunwald [npc 258113] @ Dun Morogh 47.6,52.0; Teo Hammerstorm [npc 257446] @ Dun Morogh 28.8,66.2
  - end:   Bruegs Kindleborn [npc 257597] @ Dun Morogh 87.9,44.8
  - text: Find Bruegs Kindleborn in Dun Morogh.

## 94817 Confounding Flash  (L10 req10, ? xp, F, races=Gnome, class=Priest, sort=PRIEST)
  - start: High Priestess Mims [npc 258785] @ Ironforge 24.6,10.0
  - end:   High Priestess Mims [npc 258785] @ Ironforge 24.6,10.0
  - exclusiveTo=[94821, 94822, 94823, 94824, 94825, 94826]

## 1678 Vejrek  (L11 req10, 1100 xp, class=Warrior, sort=WARRIOR)
  - start: Muren Stormpike [npc 6114] @ Ironforge 70.8,90.3
  - end:   Muren Stormpike [npc 6114] @ Ironforge 70.8,90.3
  - next=1680, exclusiveTo=[1639, 1683]
  - text: Bring Vejrek's Head to Muren Stormpike in Ironforge.
  - objectives:
    1. item 1x Vejrek's Head <- Vejrek [npc 6113] L11-11 ~Dun Morogh 28,58 (1 spawns)

## 1680 Tormus Deepforge  (L11 req10, 90 xp, class=Warrior, sort=WARRIOR)
  - start: Muren Stormpike [npc 6114] @ Ironforge 70.8,90.3
  - end:   Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - pre(any)=[1683, 1678, 1639], next=1681, breadcrumbFor=1681
  - text: Speak with Tormus Deepforge.

## 1681 Ironband's Compound  (L11 req10, 660 xp, class=Warrior, sort=WARRIOR)
  - start: Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - end:   Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - pre(any)=[1683, 1678, 1639], next=1682
  - text: Bring a load of Umbral Ore to Tormus Deepforge in Ironforge.
  - objectives:
    1. item 1x Umbral Ore <- Ironband's Strongbox [object 85562] ~Dun Morogh 78,62 (1 spawns)

## 1578 Supplying the Front  (L12 req1, 910 xp, sort=BLACKSMITHING)
  - start: Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - end:   Thorvald Deepforge [npc 6030] @ Loch Modan 23.7,74.3
  - text: Bring 6 Copper Axes and 6 Copper Chain Belts to Thorvald in the southern guard tower of Loch Modan.
  - objectives:
    1. item 6x Copper Axe <- ?
    2. item 6x Copper Chain Belt <- ?

## 1645 The Tome of Divinity  (L12 req12, ? xp, races=Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - next=1646

## 1647 The Tome of Divinity  (L12 req12, 455 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - end:   John Turner [npc 6175] @ Ironforge 23.3,61.9
  - pre(any)=[1646], next=1648
  - text: Search the outer ring of Ironforge for John Turner.

## 1789 The Symbol of Life  (L12 req12, ? xp, races=Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - pre(any)=[1779], exclusiveTo=[1784]

## 2999 Tome of Divinity  (L12 req12, 90 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: Brandur Ironhammer [npc 5149] @ Ironforge 23.1,6.1
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - next=1646, breadcrumbFor=1646, exclusiveTo=[2997, 3000]
  - text: Speak to Tiza Battleforge in Ironforge

## 3681 Tome of Divinity  (L12 req12, 225 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Brandur Ironhammer [npc 5149] @ Ironforge 23.1,6.1
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - next=1642, breadcrumbFor=1642, exclusiveTo=[2998]
  - text: Speak with Duthorian Rall in Stormwind.

## 1648 The Tome of Divinity  (L13 req12, 910 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: John Turner [npc 6175] @ Ironforge 23.3,61.9
  - end:   John Turner [npc 6175] @ Ironforge 23.3,61.9
  - pre(any)=[1647], next=1778
  - text: Bring 10 Linen Cloth to John Turner in Ironforge.
  - objectives:
    1. item 10x Linen Cloth <- Hidden Strongbox [object 2039] ~Alterac Mountains 19,67 (16 spawns); Battered Chest [object 2844]; Tattered Chest [object 2845]; Tattered Chest [object 2847]

## 1778 The Tome of Divinity  (L13 req12, 230 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: John Turner [npc 6175] @ Ironforge 23.3,61.9
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - pre(any)=[1648], next=1779
  - text: Speak to Tiza Battleforge in Ironforge.

## 1779 The Tome of Divinity  (L13 req12, ? xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - end:   Muiredon Battleforge [npc 6178] @ Ironforge 23.5,8.3
  - pre(any)=[1778], next=1783
  - text: Take the Symbol of Life and speak to Muiredon Battleforge in Ironforge.

## 1783 The Tome of Divinity  (L13 req12, 680 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: Muiredon Battleforge [npc 6178] @ Ironforge 23.5,8.3
  - end:   Narm Faulk [npc 6177] @ Dun Morogh 78.3,58.1
  - pre(any)=[1779], next=1784
  - text: Take the Symbol of Life and resurrect Narm Faulk in Dun Morogh.
  - objectives:
    1. kill 1x Narm Faulk <- Narm Faulk [npc 6177] L8-8 ~Dun Morogh 78,58 (1 spawns)

## 1785 The Tome of Divinity  (L13 req12, 1150 xp, races=Dwarf, class=Paladin, sort=PALADIN)
  - start: Muiredon Battleforge [npc 6178] @ Ironforge 23.5,8.3
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - pre(any)=[1784]
  - text: Speak to Tiza Battleforge in Ironforge.

## 2039 Find Bingles  (L15 req12, 270 xp)
  - start: Gnoarn [npc 6569] @ Ironforge 69.2,50.5
  - end:   Bingles Blastenheimer [npc 6577] @ Loch Modan 63.6,47.9
  - next=2038, breadcrumbFor=2038
  - text: Find Bingles Blastenheimer in Loch Modan.

## 2041 Speak with Shoni  (L15 req15, 270 xp)
  - start: Gnoarn [npc 6569] @ Ironforge 69.2,50.5
  - end:   Shoni the Shilent [npc 6579] @ Stormwind City 62.6,34.1
  - next=2040, breadcrumbFor=2040
  - text: Speak with Shoni the Shilent in Stormwind.

## 96394 The Restless Dead  (L15 req10, ? xp, F)
  - start: Afadra Dunwall [npc 264943] @ Dun Morogh 34.6,51.6
  - end:   Afadra Dunwall [npc 264943] @ Dun Morogh 34.6,51.6
  - text: Kill 15 Enraged Apparitions, 10 Tormented Souls and put the spirit of Anvilmar to rest.
  - objectives:
    1. kill 15x Enraged Apparition <- Enraged Apparition [npc 263389] LNone-None
    2. kill 1x Tormented Soul <- Tormented Soul [npc 263390] LNone-None

## 96395 An Ancient Grudge  (L15 req10, ? xp, F)
  - start: Ghostly Attendant [npc 265002] @ no spawn
  - end:   Ghostly Attendant [npc 265002] @ no spawn
  - text: Put the spirit of Faldrim Anvilmar to rest and then return to the Ghostly Attendant in the Hall of Thanes.
  - objectives:
    1. kill 1x Faldrim Anvilmar <- Faldrim Anvilmar [npc 261306] LNone-None

## 96403 Important Heirlooms  (L15 req10, ? xp, F)
  - start: Thom Filch [npc 265003] @ Ironforge 32.2,44.5
  - end:   Thom Filch [npc 265003] @ Ironforge 32.2,44.5
  - text: Collect 8 Dwarven Heirlooms from the Hall of Thanes.
  - objectives:
    1. item 8x Dwarven Heirloom <- Dwarven Heirloom [object 652227]; Dwarven Heirloom [object 652228]

## 1618 Gearing Redridge  (L16 req1, 1150 xp, sort=BLACKSMITHING)
  - start: Tormus Deepforge [npc 6031] @ Ironforge 48.6,42.5
  - end:   Verner Osgood [npc 415] @ Redridge Mountains 25.9,47.3
  - text: Tormus Deepforge wants you to bring 4 Runed Copper Belts and 4 Heavy Copper Mauls to Verner Osgood in Redridge.
  - objectives:
    1. item 4x Runed Copper Belt <- ?
    2. item 1x Heavy Copper Maul <- ?

## 2298 Kingly Shakedown  (L16 req16, 115 xp, class=Rogue, sort=ROGUE)
  - start: Hulfdan Blackbeard [npc 5165] @ Ironforge 52.0,14.8
  - end:   Renzik "The Shiv" [npc 6946] @ Stormwind City 78.3,71.1
  - text: Travel to Stormwind and seek out Renzik "The Shiv."

## 96393 Old Ironforge Incursion  (L16 req9, ? xp, F)
  - start: Earthseer Farsen [npc 264936] @ Dun Morogh 64.9,58.5
  - end:   King Magni Bronzebeard [npc 2784] @ Ironforge 39.1,56.2
  - pre(any)=[96391]
  - text: Enter the Hall of Thanes beneath Old Ironforge and claim the Head of Durgen Dirgehammer.
  - objectives:
    1. item 1x Durgen Dirgehammer's Head <- Durgen Dirgehammer [npc 261319] LNone-None

## 8846 Five Signets for War Supplies  (L19 req10, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 1698 Yorus Barleybrew  (L20 req20, 155 xp, class=Warrior, sort=WARRIOR)
  - start: Kelv Sternhammer [npc 5113] @ Ironforge 70.3,90.7; Wu Shen [npc 5479] @ Stormwind City 80.5,59.9; Darnath Bladesinger [npc 7315] @ Darnassus 58.9,35.4
  - end:   Yorus Barleybrew [npc 6166] @ Redridge Mountains 21.5,44.7
  - next=1699, breadcrumbFor=1699
  - text: Speak with Yorus Barleybrew.

## 1717 Gakin's Summons  (L20 req20, 390 xp, class=Warlock, sort=WARLOCK)
  - start: Lago Blackwrench [npc 6120] @ Ironforge 47.6,9.3
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - exclusiveTo=[1716]
  - text: Report to Gakin the Darkbinder in the Mage Quarter of Stormwind.

## 1794 The Tome of Valor  (L20 req20, ? xp, races=Human/Dwarf, class=Paladin, sort=PALADIN, repeatable)
  - start: Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - end:   Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - next=1649

## 5641 A Lack of Fear  (L20 req20, ? xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - end:   High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - exclusiveTo=[5645, 5647]

## 5675 Elune's Grace  (L20 req20, 390 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5672, 5673, 5674]
  - text: Speak to Priestess Alathea in Darnassus.

## 5677 Arcane Feedback  (L20 req20, 390 xp, races=Human, class=Priest, sort=PRIEST)
  - start: High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5676, 5678]
  - text: Speak to High Priestess Laurena in Stormwind.

## 8768 A Gaily Wrapped Present  (L20 req20, ? xp, sort=SEASONAL)
  - start: Gaily Wrapped Present [object 180747] @ Ironforge 33.8,66.4
  - end:   Gaily Wrapped Present [object 180747] @ Ironforge 33.8,66.4

## 94494 Call of Water  (L20 req20, 780 xp, F, class=Shaman, sort=SHAMAN)
  - start: Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8; Ingrid Dunwald [npc 258113] @ Dun Morogh 47.6,52.0
  - end:   Norric Lochthane [npc 258043] @ Loch Modan 41.8,19.1
  - next=94495
  - text: Find Norric Lochthane in Loch Modan.

## 94818 Contingency Plan  (L20 req20, ? xp, F, races=Gnome, class=Priest, sort=PRIEST)
  - start: High Priestess Mims [npc 258785] @ Ironforge 24.6,10.0
  - end:   High Priestess Mims [npc 258785] @ Ironforge 24.6,10.0
  - exclusiveTo=[94819, 94820]

## 1939 High Sorcerer Andromath  (L26 req26, 1050 xp, races=Human/Gnome, class=Mage, sort=MAGE)
  - start: Bink [npc 5144] @ Ironforge 27.2,8.3; Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - end:   High Sorcerer Andromath [npc 5694] @ Stormwind City 48.7,87.6
  - next=1938, breadcrumbFor=1938
  - text: Speak with High Sorcerer Andromath.

## 1708 Iron Coral  (L29 req20, 1750 xp, class=Warrior, sort=WARRIOR)
  - start: Klockmort Spannerspan [npc 6169] @ Ironforge 67.9,46.1
  - end:   Klockmort Spannerspan [npc 6169] @ Ironforge 67.9,46.1
  - pre(any)=[1782], next=1709
  - text: Bring 20 loads of Searing Coral to Klockmort Spannerspan in Ironforge.
  - objectives:
    1. item 1x Searing Coral <- Iron Coral [object 89634] ~Wetlands 9,69 (10 spawns)

## 8847 Ten Signets for War Supplies  (L29 req20, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 637 Sully Balloo's Letter  (L30 req25, 2450 xp)
  - start: item Waterlogged Envelope [4433] (drops from ?)
  - end:   Sara Balloo [npc 2695] @ Ironforge 63.5,67.3
  - next=683
  - text: Deliver Sully Balloo's Letter to Sara Balloo.

## 683 Sara Balloo's Plea  (L30 req25, 1200 xp)
  - start: Sara Balloo [npc 2695] @ Ironforge 63.5,67.3
  - end:   King Magni Bronzebeard [npc 2784] @ Ironforge 39.1,56.2
  - pre(any)=[637], next=686
  - text: Take Sara Balloo's note to King Magni Bronzebeard of Ironforge.

## 686 A King's Tribute  (L30 req25, 1200 xp)
  - start: King Magni Bronzebeard [npc 2784] @ Ironforge 39.1,56.2
  - end:   Grand Mason Marblesten [npc 2790] @ Ironforge 39.0,88.0
  - pre(any)=[683], next=689
  - text: King Magni Bronzebeard wants you to speak with Grand Mason Marblesten.

## 1709 Klockmort's Creation  (L30 req20, 3050 xp, class=Warrior, sort=WARRIOR)
  - start: Klockmort Spannerspan [npc 6169] @ Ironforge 67.9,46.1
  - end:   Klockmort Spannerspan [npc 6169] @ Ironforge 67.9,46.1
  - pre(any)=[1708]

## 1798 Seeking Strahad  (L30 req30, 610 xp, class=Warlock, sort=WARLOCK)
  - start: Lago Blackwrench [npc 6120] @ Ironforge 47.6,9.3; Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - end:   Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - next=1758, breadcrumbFor=1758
  - text: Speak with Strahad Farsan in the Barrens.

## 1802 Tome of the Cabal  (L30 req30, 2450 xp, class=Warlock, sort=WARLOCK)
  - start: Krom Stoutarm [npc 6294] @ Ironforge 74.2,9.4
  - end:   Krom Stoutarm [npc 6294] @ Ironforge 74.2,9.4
  - pre(any)=[1758], next=1804
  - text: Retrieve the Moldy Tome and Tattered Manuscript for Krom Stoutarm in Ironforge.
  - objectives:
    1. item 1x Moldy Tome <- Tome of the Cabal [object 92013] ~Hillsbrad Foothills 28,73 (1 spawns)
    2. item 1x Tattered Manuscript <- Damaged Chest [object 92423] ~Thousand Needles 43,33 (1 spawns)

## 1804 Tome of the Cabal  (L30 req30, 2450 xp, class=Warlock, sort=WARLOCK)
  - start: Krom Stoutarm [npc 6294] @ Ironforge 74.2,9.4
  - end:   Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - pre(any)=[1802], next=1795
  - text: Bring the Reconstructed Tome and 3 Rods of Channeling to Strahad Farsan in Ratchet.
  - objectives:
    1. item 1x Rod of Channeling <- Dragonmaw Shadowwarder [npc 1038] L28-29 ~Wetlands 53,53 (6 spawns); Dragonmaw Bonewarder [npc 1057] L27-27 ~Wetlands 49,47 (20 spawns); Dragonmaw Thaumaturgist [npc 275046] LNone-None

## 94789 Call of Air  (L30 req30, 2450 xp, F, class=Shaman, sort=SHAMAN)
  - start: Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8
  - end:   Veyric Thunderhame [npc 259023] @ Ironforge 47.1,13.8
  - next=96264
  - text: Find Veyric Thundervein in Arathi Highlands.

## 689 A King's Tribute  (L31 req25, 2500 xp)
  - start: Grand Mason Marblesten [npc 2790] @ Ironforge 39.0,88.0
  - end:   Grand Mason Marblesten [npc 2790] @ Ironforge 39.0,88.0
  - pre(any)=[686], next=700
  - text: Grand Mason Marblesten of Ironforge wants 5 pieces of Alterac Granite.
  - objectives:
    1. item 5x Alterac Granite <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns)

## 700 A King's Tribute  (L31 req25, 2500 xp)
  - start: Grand Mason Marblesten [npc 2790] @ Ironforge 39.0,88.0
  - end:   King Magni Bronzebeard [npc 2784] @ Ironforge 39.1,56.2
  - pre(any)=[689]
  - text: Report to King Magni Bronzebeard.

## 4736 In Search of Menara Voidrender  (L31 req31, 630 xp, class=Warlock, sort=WARLOCK)
  - start: Briarthorn [npc 5172] @ Ironforge 50.4,5.7
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - next=1796, breadcrumbFor=1796, exclusiveTo=[4737, 4738, 4739]
  - text: Speak to Menara Voidrender in the Barrens.

## 98313 For Further Study  (L32 req24, ? xp, F)
  - start: Prospector Whelgar [npc 1077] @ Wetlands 38.8,52.4
  - end:   Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - pre(any)=[98310]
  - text: Bring the Whelgar Relic Package to Historian Karnik in Ironforge.

## 1453 Reclaimers' Business in Desolace  (L33 req30, 1300 xp)
  - start: Roetten Stonehammer [npc 5637] @ Ironforge 70.0,21.3
  - end:   Kreldig Ungor [npc 5638] @ Desolace 66.2,9.6
  - text: Speak to Kreldig Ungor in Desolace.

## 98300 Word to Ironforge  (L34 req24, 2700 xp, F)
  - start: Howin Kindfeather [npc 270637] @ Wetlands 49.4,42.1
  - end:   King Magni Bronzebeard [npc 2784] @ Ironforge 39.1,56.2
  - pre(any)=[98297]
  - text: Deliver Howin's Missive to King Magni Bronzebeard in Ironforge.

## 2948 Gnome Improvement  (L35 req28, 2750 xp)
  - start: Talvash del Kissel [npc 6826] @ Ironforge 36.4,3.6
  - end:   Talvash del Kissel [npc 6826] @ Ironforge 36.4,3.6
  - pre(any)=[2947]
  - text: Bring the Brilliant Gold Ring, a Silver Bar, a Moss Agate, and 30 silver coins to Talvash del Kissel in Ironforge.
  - objectives:
    1. item 1x Silver Bar <- Battered Chest [object 2844]; Tattered Chest [object 2845]; Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns)
    2. item 1x Moss Agate <- Tin Vein [object 1732] ~Duskwood 48,49 (1464 spawns); Silver Vein [object 1733] ~Duskwood 48,51 (2009 spawns); Tin Vein [object 2054] ~Redridge Mountains 14,19 (21 spawns); Tattered Chest [object 2847]

## 4965 Knowledge of the Orb of Orahil  (L35 req35, 1350 xp, class=Warlock, sort=WARLOCK)
  - start: Briarthorn [npc 5172] @ Ironforge 50.4,5.7
  - end:   Menara Voidrender [npc 6266] @ The Barrens 62.5,35.5
  - next=1799, breadcrumbFor=1799, exclusiveTo=[4967, 4968, 4969]
  - text: Speak to Menara Voidrender in the Barrens.

## 707 Ironband Wants You!  (L37 req30, 710 xp)
  - start: Prospector Stormpike [npc 1356] @ Ironforge 74.6,11.7
  - end:   Prospector Ironband [npc 1344] @ Loch Modan 65.9,65.6
  - next=738, breadcrumbFor=738
  - text: Speak with Prospector Ironband at Ironband's Excavation Site in Loch Modan.

## 8848 Fifteen Signets for War Supplies  (L39 req30, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 4485 The Tome of Nobility  (L40 req40, 315 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Tiza Battleforge [npc 6179] @ Ironforge 27.6,12.2
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - exclusiveTo=[1661, 4486]
  - text: Speak to Duthorian Rall in Stormwind.

## 4486 The Tome of Nobility  (L40 req40, 315 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Brandur Ironhammer [npc 5149] @ Ironforge 23.1,6.1
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - next=1661, breadcrumbFor=1661, exclusiveTo=[1661, 4485]
  - text: Speak to Duthorian Rall in Stormwind.

## 4487 Summon Felsteed  (L40 req40, 315 xp, class=Warlock, sort=WARLOCK)
  - start: Briarthorn [npc 5172] @ Ironforge 50.4,5.7
  - end:   Strahad Farsan [npc 6251] @ The Barrens 62.6,35.5
  - next=4490, exclusiveTo=[3631, 4488, 4489]
  - text: Speak to Strahad Farsan in Ratchet.

## 5283 The Art of the Armorsmith  (L40 req40, 3150 xp, sort=BLACKSMITHING)
  - start: Grumnus Steelshaper [npc 5164] @ Ironforge 50.0,42.8
  - end:   Grumnus Steelshaper [npc 5164] @ Ironforge 50.0,42.8
  - exclusiveTo=[5284]
  - text: To become an Armorsmith, you must make the following items and return them to Grumnus: 4 Ornate Mithril Helms, 2 Ornate Mithril Boots, 1 Ornate Mithril Breastplate.
  - objectives:
    1. item 4x Ornate Mithril Helm <- ?
    2. item 4x Ornate Mithril Boots <- ?
    3. item 4x Ornate Mithril Breastplate <- ?

## 5284 The Way of the Weaponsmith  (L40 req40, 3150 xp, sort=BLACKSMITHING)
  - start: Ironus Coldsteel [npc 11146] @ Ironforge 50.3,43.6
  - end:   Ironus Coldsteel [npc 11146] @ Ironforge 50.3,43.6
  - exclusiveTo=[5283]
  - text: To become a Weaponsmith, you must make the following items and return them to Ironus: 4 Moonsteel Broadswords, 4 Massive Iron Axes, 2 Heavy Mithril Axes, and 2 Big Black Maces.
  - objectives:
    1. item 4x Moonsteel Broadsword <- ?
    2. item 1x Massive Iron Axe <- ?
    3. item 1x Heavy Mithril Axe <- ?
    4. item 1x Big Black Mace <- ?

## 82662 The Way of the Weaponsmith  (L40 req40, ? xp, F, races=Human/Dwarf/NightElf, sort=BLACKSMITHING)
  - start: Ironus Coldsteel [npc 11146] @ Ironforge 50.3,43.6
  - end:   Ironus Coldsteel [npc 11146] @ Ironforge 50.3,43.6
  - text: To become a Weaponsmith, you must make the following items and return them to Ironus: 4 Moonsteel Broadswords, 4 Massive Iron Axes, 2 Heavy Mithril Axes, and 2 Big Black Maces.

## 85713 The Art of the Armorsmith  (L40 req40, ? xp, F, sort=BLACKSMITHING)
  - start: Grumnus Steelshaper [npc 5164] @ Ironforge 50.0,42.8
  - end:   Grumnus Steelshaper [npc 5164] @ Ironforge 50.0,42.8
  - text: To become an Armorsmith, you must make the following items and return them to Grumnus: 4 Ornate Mithril Helms, 2 Ornate Mithril Boots, 1 Ornate Mithril Breastplate.
  - objectives:
    1. item 4x Ornate Mithril Helm <- ?
    2. item 4x Ornate Mithril Boots <- ?
    3. item 4x Ornate Mithril Breastplate <- ?

## 95799 Findings for the Explorer's League  (L40 req30, 2350 xp, F)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - pre(any)=[95787]
  - text: Bring Loremaster Dibbs' I'lalai Translations to Historian Karnik in Ironforge.

## 6609 I Got Nothin' Left!  (L45 req35, 970 xp, sort=FISHING)
  - start: Grimnur Stonebrand [npc 5161] @ Ironforge 48.1,6.9
  - end:   Nat Pagle [npc 12919] @ Dustwallow Marsh 58.6,60.1
  - next=6607, breadcrumbFor=6607
  - text: Travel to Kalimdor, to the coastal city of Theramore. From there you must search for an island, south of the main town. Nat Pagle awaits your arrival!

## 6612 I Know A Guy...  (L45 req35, 970 xp, sort=COOKING)
  - start: Daryl Riknussun [npc 5159] @ Ironforge 60.1,36.4
  - end:   Dirge Quikcleave [npc 8125] @ Tanaris 52.6,28.1
  - next=6610, breadcrumbFor=6610
  - text: Travel to Gadgetzan in the Tanaris desert and speak with Dirge Quikcleave about advancing your cooking career.

## 6625 Alliance Trauma  (L45 req35, 970 xp, sort=FIRST_AID)
  - start: Nissa Firestone [npc 5150] @ Ironforge 55.1,58.3
  - end:   Doctor Gustaf VanHowzen [npc 12939] @ Dustwallow Marsh 67.8,49.0
  - next=6624, breadcrumbFor=6624
  - text: Travel to Theramore in the Dustwallow Marsh and speak with Doctor Gustaf VanHowzen about joining the ranks of Alliance Trauma.

## 2439 The Platinum Discs  (L47 req40, 420 xp)
  - start: High Explorer Magellas [npc 5387] @ Ironforge 69.9,18.6
  - end:   Dinita Stonemantle [npc 7292] @ Ironforge 33.9,59.1
  - pre(any)=[2279], next=2963
  - text: Take your reward voucher to Dinita Stonemantle in the Vault of Ironforge.

## 3629 Goblin Engineering  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Springspindle Fizzlegear [npc 5174] @ Ironforge 68.5,43.5
  - end:   Nixx Sprocketspring [npc 8126] @ Tanaris 52.5,27.3
  - next=3638, exclusiveTo=[3526, 3633, 4181, 3640, 3642]
  - text: If you wish to learn more about Goblin Engineering, take the Manual of Engineering Disciplines to Nixx Sprocketspring in Gadgetzan.

## 3632 Gnome Engineering  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Springspindle Fizzlegear [npc 5174] @ Ironforge 68.5,43.5
  - end:   Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - next=3640, exclusiveTo=[3630, 3634, 3635, 3637, 3638, 3642]
  - text: If you wish to learn more about Gnome Engineering, take the Manual of Engineering Disciplines to Tinkmaster Overspark in Ironforge.

## 3640 The Pledge of Secrecy  (L47 req30, 420 xp, sort=ENGINEERING)
  - start: Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - end:   Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - pre(any)=[3630, 3632, 3634], next=3641, exclusiveTo=[3638, 3642]
  - text: If you agree to become a Gnome Engineer, then right-click on the Pledge of Secrecy and speak once more with Tinkmaster Overspark in Ironforge.
  - objectives:
    1. item 1x Overspark's Signed Pledge <- ?

## 3641 Show Your Work  (L47 req30, 3150 xp, sort=ENGINEERING)
  - start: Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - end:   Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - pre(any)=[3640], next=3647, exclusiveTo=[3638, 3639]
  - text: Bring 6 Mithril Tubes, an Accurate Scope, and 2 Advanced Target Dummies to Tinkmaster Overspark in Ironforge.
  - objectives:
    1. item 6x Mithril Tube <- ?
    2. item 1x Accurate Scope <- ?
    3. item 1x Advanced Target Dummy <- ?

## 3647 Membership Card Renewal  (L47 req30, ? xp, sort=ENGINEERING, repeatable)
  - start: Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - end:   Tinkmaster Overspark [npc 7944] @ Ironforge 69.5,50.3
  - pre(any)=[3639, 3641, 3643]

## 3201 At Last!  (L48 req40, 4400 xp)
  - start: Curator Thorius [npc 8256] @ Ironforge 71.5,15.7
  - end:   Mountaineer Pebblebitty [npc 3836] @ Loch Modan 18.2,84.0
  - pre(any)=[3182]
  - text: Take the Proof of Deed back to Mountaineer Pebblebitty.

## 8849 Twenty Signets for War Supplies  (L49 req40, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 2946 Seeing What Happens  (L50 req45, 4700 xp)
  - start: Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - end:   Uldum Pedestal [object 142343] @ Tanaris 37.6,81.4
  - pre(any)=[2963], next=2954
  - text: Bring the miniature platinum discs to the gates of Uldum in Tanaris and look for clues as to the connection between the two.

## 2963 Portents of Uldum  (L50 req45, 470 xp)
  - start: High Explorer Magellas [npc 5387] @ Ironforge 69.9,18.6
  - end:   Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - pre(any)=[2439], next=2946
  - text: Speak with Historian Karnik in the Hall of Explorers within Ironforge.

## 2964 A Future Task  (L50 req45, 4700 xp)
  - start: Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - end:   High Explorer Magellas [npc 5387] @ Ironforge 69.9,18.6
  - pre(any)=[2977]
  - text: Speak with High Explorer Magellas in Ironforge.

## 2977 Return to Ironforge  (L50 req45, 470 xp)
  - start: Uldum Pedestal [object 142343] @ Tanaris 37.6,81.4
  - end:   Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - pre(any)=[2954], next=2964
  - text: Speak with Historian Karnik in Ironforge.

## 3790 Assisting Arch Druid Staghelm  (L50 req47, 470 xp)
  - start: Innkeeper Firebrew [npc 5111] @ Ironforge 18.1,51.5
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - next=3764, breadcrumbFor=3764, exclusiveTo=[3763, 3789]
  - text: Speak with Arch Druid Fandral Staghelm in Darnassus.

## 5090 A Call to Arms: The Plaguelands!  (L50 req50, 470 xp)
  - start: Courier Hammerfall [npc 10877] @ Ironforge 55.9,81.4
  - end:   Commander Ashlam Valorfist [npc 10838] @ Western Plaguelands 42.7,84.0
  - next=5092, breadcrumbFor=5092, exclusiveTo=[5066, 5091]
  - text: Seek out Commander Ashlam Valorfist. His base camp is located at Chillwind Camp, north of the Alterac Mountains.

## 3448 Passing the Burden  (L52 req45, 510 xp)
  - start: Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - end:   Tymor [npc 8507] @ Ironforge 31.0,4.8
  - next=3449
  - text: Speak to Tymor in Ironforge.

## 3449 Arcane Runes  (L52 req45, 2550 xp)
  - start: Tymor [npc 8507] @ Ironforge 31.0,4.8
  - end:   Pilot Xiggs Fuselighter [npc 8392] @ Azshara 77.8,91.4
  - pre(any)=[3448], next=3461
  - text: Using the Drawing Kit, make rubbings of the Rune of Beth'Amara, the Rune of Jin'yael, the Rune of Markri, and the Rune of Sael'hai before heading to the small island off of the southern peninsula of Azshara and signaling Pilot Xiggs Fuselighter to pick them up.
  - objectives:
    1. item 1x Rubbing: Rune of Beth'Amara <- Rune of Beth'Amara [object 149481] ~Azshara 37,53 (1 spawns)
    2. item 1x Rubbing: Rune of Jin'yael <- Rune of Jin'yael [object 149480] ~Azshara 40,50 (1 spawns)
    3. item 1x Rubbing: Rune of Markri <- Rune of Markri [object 149482] ~Azshara 39,55 (1 spawns)
    4. item 1x Rubbing: Rune of Sael'hai <- Rune of Sael'hai [object 149483] ~Azshara 42,64 (1 spawns)

## 3450 An Easy Pickup  (L52 req45, 510 xp)
  - start: Tymor [npc 8507] @ Ironforge 31.0,4.8
  - end:   Xiggs Fuselighter [npc 8517] @ Ironforge 70.9,94.6
  - pre(any)=[3448], next=3451
  - text: Speak to Xiggs Fuselighter in Ironforge.

## 3451 Signal for Pickup  (L52 req45, 510 xp)
  - start: Xiggs Fuselighter [npc 8517] @ Ironforge 70.9,94.6
  - end:   Xiggs Fuselighter [npc 8517] @ Ironforge 70.9,94.6
  - pre(any)=[3450], next=3483
  - text: Speak to Xiggs Fuselighter and get a Standard Issue Flare Gun from him in Ironforge.

## 3461 Return to Tymor  (L52 req45, 7600 xp)
  - start: Pilot Xiggs Fuselighter [npc 8392] @ Azshara 77.8,91.4
  - end:   Tymor [npc 8507] @ Ironforge 31.0,4.8
  - pre(any)=[3449]
  - text: Return Tymor's Drawing Kit to him in Ironforge.

## 3483 Signal for Pickup  (L52 req45, ? xp, repeatable)
  - start: Xiggs Fuselighter [npc 8517] @ Ironforge 70.9,94.6
  - end:   Xiggs Fuselighter [npc 8517] @ Ironforge 70.9,94.6
  - pre(any)=[3451]

## 4512 A Little Slime Goes a Long Way  (L52 req48, 6350 xp)
  - start: Laris Geardawdle [npc 9616] @ Ironforge 75.8,23.4
  - end:   Laris Geardawdle [npc 9616] @ Ironforge 75.8,23.4
  - next=4513
  - text: Bring 6 Filled Cursed Ooze Jars and 6 Filled Tainted Ooze Jars to Laris Geardawdle in Ironforge.
  - objectives:
    1. item 6x Filled Cursed Ooze Jar <- Cursed Ooze [npc 7086] L49-50 ~Felwood 40,70 (24 spawns)
    2. item 6x Filled Tainted Ooze Jar <- Tainted Ooze [npc 7092] L51-52 ~Felwood 41,52 (34 spawns)

## 3701 The Smoldering Ruins of Thaurissan  (L54 req50, 5450 xp)
  - start: Royal Historian Archesonus [npc 8879] @ Ironforge 38.4,55.3
  - end:   Royal Historian Archesonus [npc 8879] @ Ironforge 38.4,55.3
  - pre(any)=[3702], next=4341
  - text: Venture to the Ruins of Thaurissan in the Burning Steppes and recover information from the Thaurissan Relics. Return to Royal Historian Archesonus when you have recovered the information.
  - objectives:
    1. object 1x Thaurissan Relic <- Thaurissan Relic [object 153556] ~Burning Steppes 62,39 (28 spawns)

## 3702 The Smoldering Ruins of Thaurissan  (L54 req50, 540 xp)
  - start: Royal Historian Archesonus [npc 8879] @ Ironforge 38.4,55.3
  - end:   Royal Historian Archesonus [npc 8879] @ Ironforge 38.4,55.3
  - next=3701
  - text: Listen to Royal Historian Archesonus recant the history of Thaurissan.
  - objectives:
    1. kill 1x Royal Historian Archesonus <- Royal Historian Archesonus [npc 8879] L50-50 ~Ironforge 38,55 (1 spawns)

## 4513 A Little Slime Goes a Long Way  (L54 req48, 6800 xp)
  - start: Laris Geardawdle [npc 9616] @ Ironforge 75.8,23.4
  - end:   Laris Geardawdle [npc 9616] @ Ironforge 75.8,23.4
  - pre(any)=[4512]
  - text: Bring 10 Filled Pure Sample Jars to Laris Geardawdle in Ironforge.
  - text: If you have trouble finding them, perhaps try to get more clues from Laris.
  - objectives:
    1. item 10x Filled Pure Sample Jar <- Muculent Ooze [npc 6556] L48-50 ~Un'Goro Crater 68,38 (12 spawns); Primal Ooze [npc 6557] L50-52 ~Un'Goro Crater 52,55 (27 spawns); Glutinous Ooze [npc 6559] L52-54 ~Un'Goro Crater 35,53 (43 spawns)

## 1019 The New Frontier  (L55 req54, 560 xp)
  - start: Courier Hammerfall [npc 10877] @ Ironforge 55.9,81.4
  - end:   Arch Druid Fandral Staghelm [npc 3516] @ Darnassus 34.8,9.3
  - next=6761, exclusiveTo=[1015, 1047]
  - text: Speak with Arch Druid Fandral Staghelm at the Cenarion Enclave of Darnassus about the Cenarion Circle's call to explore the frontiers of Kalimdor.

## 3371 Dwarven Justice  (L55 req40, 5650 xp)
  - start: Curator Thorius [npc 8256] @ Ironforge 71.5,15.7
  - end:   Dying Archaeologist [npc 8417] @ Searing Gorge 41.1,25.6
  - pre(any)=[3368], next=3372
  - text: Return to the Searing Gorge and find Dorius's archaeology unit.

## 8275 Taking Back Silithus  (L55 req54, 2800 xp)
  - start: Cenarion Emissary Jademoon [npc 15187] @ Ironforge 58.5,47.3
  - end:   Windcaller Proudhorn [npc 15191] @ Silithus 51.1,38.3
  - next=8280, breadcrumbFor=8280
  - text: Talk to Windcaller Proudhorn at Cenarion Hold in Silithus.

## 7022 Greatfather Winter is Here!  (L60 req10, 660 xp, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - end:   Greatfather Winter [npc 13444] @ Ironforge 33.2,65.4
  - exclusiveTo=[7023]
  - text: Speak with Greatfather Winter; he is located near the Smokywood Pastures vendor area in Ironforge.

## 7025 Treats for Greatfather Winter  (L60 req10, 1650 xp, sort=SEASONAL)
  - start: Greatfather Winter [npc 13444] @ Ironforge 33.2,65.4
  - end:   Greatfather Winter [npc 13444] @ Ironforge 33.2,65.4
  - text: Bring 5 Gingerbread Cookies and an Ice Cold Milk to Greatfather Winter in Ironforge.
  - objectives:
    1. item 5x Gingerbread Cookie <- ?
    2. item 1x Ice Cold Milk <- Defias Smuggler [npc 95] L11-12 ~Westfall 46,31 (44 spawns); Riverpaw Taskmaster [npc 98] L17-18 ~Westfall 62,74 (46 spawns); Harvest Watcher [npc 114] L14-15 ~Westfall 46,37 (35 spawns); Riverpaw Gnoll [npc 117] L11-12 ~Westfall 49,15 (24 spawns)

## 7042 Stolen Winter Veil Treats  (L60 req30, 1650 xp, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - end:   Strange Snowman [npc 13636] @ Alterac Mountains 35.4,72.5
  - next=7043
  - text: Locate the Smokywood Pastures investigator that has gone missing in the snowy regions of the Alterac Mountains.

## 7045 A Smokywood Pastures' Thank You!  (L60 req30, 4950 xp, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - end:   Greatfather Winter [npc 13444] @ Ironforge 33.2,65.4
  - pre(any)=[7043]
  - text: Speak with Greatfather Winter in Ironforge.

## 7062 The Reason for the Season  (L60 req10, 660 xp, sort=SEASONAL)
  - start: Goli Krumn [npc 1365] @ Ironforge 30.3,59.4
  - end:   Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - next=7063
  - text: Speak with Historian Karnik at the Explorer's League in Ironforge about the Feast of Winter Veil.

## 7063 The Feast of Winter Veil  (L60 req10, 660 xp, sort=SEASONAL)
  - start: Historian Karnik [npc 2916] @ Ironforge 77.5,11.8
  - end:   King Magni Bronzebeard [npc 2784] @ Ironforge 39.1,56.2
  - pre(any)=[7062]
  - text: Feel free to read the book, "The Feast of Winter Veil", to learn more about the holiday. When you are finished with the book, deliver it to King Magni Bronzebeard in Ironforge.

## 7342 Arrows Are For Sissies  (L60 req52, ? xp, repeatable)
  - start: Artilleryman Sheldonore [npc 14183] @ Ironforge 19.6,51.8
  - end:   Artilleryman Sheldonore [npc 14183] @ Ironforge 19.6,51.8
  - objectives:
    1. item 1x Thorium Shells <- ?

## 7639 To Show Due Judgment  (L60 req60, 660 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: High Priest Rohan [npc 11406] @ Ironforge 24.7,8.2
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - pre(any)=[7637], next=7640
  - text: Return the Exorcism Censer to Lord Grayson Shadowbreaker in the Cathedral District of Stormwind.

## 7670 Lord Grayson Shadowbreaker  (L60 req60, ? xp, F, class=Paladin, sort=PALADIN)
  - start: Brandur Ironhammer [npc 5149] @ Ironforge 23.1,6.1
  - end:   Lord Grayson Shadowbreaker [npc 928] @ Stormwind City 48.4,50.2
  - next=7637, exclusiveTo=[7638]
  - text: Speak with Lord Grayson Shadowbreaker in Stormwind's Cathedral District.

## 7802 A Donation of Wool  (L60 req12, 660 xp)
  - start: Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - end:   Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - objectives:
    1. item 1x Wool Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns)

## 7803 A Donation of Silk  (L60 req26, 1650 xp)
  - start: Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - end:   Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - objectives:
    1. item 1x Silk Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns)

## 7804 A Donation of Mageweave  (L60 req40, 3300 xp)
  - start: Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - end:   Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - objectives:
    1. item 1x Mageweave Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Solid Chest [object 2855] ~Hillsbrad Foothills 51,41 (52 spawns); Solid Chest [object 2857] ~Dustwallow Marsh 43,43 (90 spawns); Solid Chest [object 4149] ~Dustwallow Marsh 48,57 (105 spawns)

## 7805 A Donation of Runecloth  (L60 req50, 6600 xp)
  - start: Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - end:   Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - pre(all)=[7802, 7803, 7804], next=7806
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 7806 Additional Runecloth  (L60 req50, ? xp, repeatable)
  - start: Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - end:   Mistina Steelshield [npc 14723] @ Ironforge 43.2,31.6
  - pre(any)=[7805]
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 7807 A Donation of Wool  (L60 req12, 660 xp)
  - start: Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - end:   Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - objectives:
    1. item 1x Wool Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns)

## 7808 A Donation of Silk  (L60 req26, 1650 xp)
  - start: Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - end:   Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - objectives:
    1. item 1x Silk Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Duskwood 46,47 (99 spawns); Solid Chest [object 2852] ~Duskwood 49,52 (72 spawns)

## 7809 A Donation of Mageweave  (L60 req40, 3300 xp)
  - start: Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - end:   Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - objectives:
    1. item 1x Mageweave Cloth <- Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns); Solid Chest [object 2855] ~Hillsbrad Foothills 51,41 (52 spawns); Solid Chest [object 2857] ~Dustwallow Marsh 43,43 (90 spawns); Solid Chest [object 4149] ~Dustwallow Marsh 48,57 (105 spawns)

## 7811 A Donation of Runecloth  (L60 req50, 6600 xp)
  - start: Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - end:   Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - pre(all)=[7807, 7808, 7809], next=7812
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 7812 Additional Runecloth  (L60 req50, ? xp, repeatable)
  - start: Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - end:   Bubulo Acerbus [npc 14724] @ Ironforge 74.1,48.2
  - pre(any)=[7811]
  - objectives:
    1. item 1x Runecloth <- Heavy Fel Iron Chest [object 181800]; Adamantite Bound Chest [object 181802]; Felsteel Chest [object 181804]

## 7905 The Darkmoon Faire  (L60 req6, 660 xp)
  - start: Melnan Darkstone [npc 14842] @ Ironforge 29.6,75.2
  - end:   Gelvas Grimegate [npc 14828] @ Elwynn Forest 41.5,68.9 (+1 spawns)
  - text: Deliver the Free Ticket Voucher to Gelvas Grimgate, located inside the Darkmoon Faire carnival.

## 8229 Could I get a Fishing Flier?  (L60 req35, ? xp, sort=FISHING, repeatable)
  - start: Barrus [npc 15119] @ Ironforge 28.2,75.0
  - end:   Barrus [npc 15119] @ Ironforge 28.2,75.0

## 8353 Chicken Clucking for a Mint  (L60 req10, ? xp, sort=SEASONAL, repeatable)
  - start: Innkeeper Firebrew [npc 5111] @ Ironforge 18.1,51.5
  - end:   Innkeeper Firebrew [npc 5111] @ Ironforge 18.1,51.5
  - text: Do a chicken emote at Innkeeper Firebrew, and in exchange you'll receive an Ironforge Mint!
  - objectives:
    1. kill 1x Innkeeper Firebrew <- Innkeeper Firebrew [npc 5111] L30-30 ~Ironforge 18,51 (1 spawns)

## 8355 Incoming Gumdrop  (L60 req10, ? xp, sort=SEASONAL, repeatable)
  - start: Talvash del Kissel [npc 6826] @ Ironforge 36.4,3.6
  - end:   Talvash del Kissel [npc 6826] @ Ironforge 36.4,3.6
  - text: Do a train emote at Talvash del Kissel, and in exchange you'll receive a Gnomeregan Gumdrop!
  - objectives:
    1. kill 1x Talvash del Kissel <- Talvash del Kissel [npc 6826] L50-50 ~Ironforge 36,4 (1 spawns)

## 8371 Concerted Efforts  (L60 req51, 8300 xp)
  - start: Alliance Brigadier General [npc 15351] @ Ironforge 70.4,91.1
  - end:   Alliance Brigadier General [npc 15351] @ Ironforge 70.4,91.1
  - next=8385
  - text: Bring 3 Alterac Valley Mark of Honor, 3 Arathi Basin Mark of Honor and 3 Warsong Gulch Mark of Honor to an Alliance Brigadier General outside the battlegrounds.
  - objectives:
    1. item 3x Alterac Valley Mark of Honor <- ?
    2. item 1x Arathi Basin Mark of Honor <- ?
    3. item 1x Warsong Gulch Mark of Honor <- ?

## 8385 Concerted Efforts  (L60 req51, 6600 xp, repeatable)
  - start: Alliance Brigadier General [npc 15351] @ Ironforge 70.4,91.1
  - end:   Alliance Brigadier General [npc 15351] @ Ironforge 70.4,91.1
  - pre(any)=[8371]
  - objectives:
    1. item 1x Alterac Valley Mark of Honor <- ?
    2. item 1x Arathi Basin Mark of Honor <- ?
    3. item 1x Warsong Gulch Mark of Honor <- ?

## 8492 The Alliance Needs Copper Bars!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Sergeant Stonebrow [npc 15383] @ Ironforge 64.1,65.5
  - end:   Sergeant Stonebrow [npc 15383] @ Ironforge 64.1,65.5
  - next=8493
  - text: Bring 20 Copper Bars to Sergeant Stonebrow at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Copper Bar <- ?

## 8493 The Alliance Needs More Copper Bars!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Sergeant Stonebrow [npc 15383] @ Ironforge 64.1,65.5
  - end:   Sergeant Stonebrow [npc 15383] @ Ironforge 64.1,65.5
  - pre(any)=[8492]
  - text: Bring 20 copper bars to Sergeant Stonebrow at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Copper Bar <- ?

## 8494 The Alliance Needs Iron Bars!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Corporal Carnes [npc 15431] @ Ironforge 65.5,63.9
  - end:   Corporal Carnes [npc 15431] @ Ironforge 65.5,63.9
  - next=8495
  - text: Bring 20 Iron Bars to Corporal Carnes at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Iron Bar <- ?

## 8495 The Alliance Needs More Iron Bars!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Corporal Carnes [npc 15431] @ Ironforge 65.5,63.9
  - end:   Corporal Carnes [npc 15431] @ Ironforge 65.5,63.9
  - pre(any)=[8494]
  - text: Bring 20 iron bars to Corporal Carnes at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Iron Bar <- ?

## 8499 The Alliance Needs Thorium Bars!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Dame Twinbraid [npc 15432] @ Ironforge 63.9,68.2
  - end:   Dame Twinbraid [npc 15432] @ Ironforge 63.9,68.2
  - next=8500
  - text: Bring 20 Thorium Bars to Dame Twinbraid at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Thorium Bar <- ?

## 8500 The Alliance Needs More Thorium Bars!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Dame Twinbraid [npc 15432] @ Ironforge 63.9,68.2
  - end:   Dame Twinbraid [npc 15432] @ Ironforge 63.9,68.2
  - pre(any)=[8499]
  - text: Bring 20 thorium bars to Dame Twinbraid at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Thorium Bar <- ?

## 8503 The Alliance Needs Stranglekelp!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Private Draxlegauge [npc 15434] @ Ironforge 70.3,74.3
  - end:   Private Draxlegauge [npc 15434] @ Ironforge 70.3,74.3
  - next=8504
  - text: Bring 20 Stranglekelp to Private Draxlegauge at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Stranglekelp <- Stranglekelp [object 2045] ~Wetlands 40,51 (547 spawns)

## 8504 The Alliance Needs More Stranglekelp!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Private Draxlegauge [npc 15434] @ Ironforge 70.3,74.3
  - end:   Private Draxlegauge [npc 15434] @ Ironforge 70.3,74.3
  - pre(any)=[8503]
  - text: Bring 20 stranglekelp to Private Draxlegauge at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Stranglekelp <- Stranglekelp [object 2045] ~Wetlands 40,51 (547 spawns)

## 8505 The Alliance Needs Purple Lotus!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Master Nightsong [npc 15437] @ Ironforge 71.9,70.4
  - end:   Master Nightsong [npc 15437] @ Ironforge 71.9,70.4
  - next=8506
  - text: Bring 20 Purple Lotus to Master Nightsong at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Purple Lotus <- Razorlash [npc 12258] L48-48; Purple Lotus [object 142140] ~Azshara 42,52 (298 spawns); Purple Lotus [object 180165]

## 8506 The Alliance Needs More Purple Lotus!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Master Nightsong [npc 15437] @ Ironforge 71.9,70.4
  - end:   Master Nightsong [npc 15437] @ Ironforge 71.9,70.4
  - pre(any)=[8505]
  - text: Bring 20 purple lotus to Master Nightsong at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Purple Lotus <- Razorlash [npc 12258] L48-48; Purple Lotus [object 142140] ~Azshara 42,52 (298 spawns); Purple Lotus [object 180165]

## 8509 The Alliance Needs Arthas' Tears!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Sergeant Major Germaine [npc 15445] @ Ironforge 71.3,71.4
  - end:   Sergeant Major Germaine [npc 15445] @ Ironforge 71.3,71.4
  - next=8510
  - text: Bring 20 Arthas' Tears to Sergeant Major Germaine at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Arthas' Tears <- Arthas' Tears [object 142141] ~Eastern Plaguelands 44,57 (125 spawns); Arthas' Tears [object 176642] ~Felwood 44,52 (4 spawns)

## 8510 The Alliance Needs More Arthas' Tears!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Sergeant Major Germaine [npc 15445] @ Ironforge 71.3,71.4
  - end:   Sergeant Major Germaine [npc 15445] @ Ironforge 71.3,71.4
  - pre(any)=[8509]
  - text: Bring 20 Arthas' Tears to Sergeant Major Germaine at the airfield in Dun Morogh.
  - objectives:
    1. item 20x Arthas' Tears <- Arthas' Tears [object 142141] ~Eastern Plaguelands 44,57 (125 spawns); Arthas' Tears [object 176642] ~Felwood 44,52 (4 spawns)

## 8511 The Alliance Needs Light Leather!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Bonnie Stoneflayer [npc 15446] @ Ironforge 58.0,75.9
  - end:   Bonnie Stoneflayer [npc 15446] @ Ironforge 58.0,75.9
  - next=8512
  - text: Bring 10 Light Leather to Bonnie Stoneflayer at the Military Ward in Ironforge.
  - objectives:
    1. item 10x Light Leather <- ?

## 8512 The Alliance Needs Light Leather!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Bonnie Stoneflayer [npc 15446] @ Ironforge 58.0,75.9
  - end:   Bonnie Stoneflayer [npc 15446] @ Ironforge 58.0,75.9
  - pre(any)=[8511]
  - text: Bring 10 light leather to Bonnie Stoneflayer at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Light Leather <- ?

## 8513 The Alliance Needs Medium Leather!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Private Porter [npc 15448] @ Ironforge 58.7,75.0
  - end:   Private Porter [npc 15448] @ Ironforge 58.7,75.0
  - next=8514
  - text: Bring 10 Medium Leather to Private Porter at the Military Ward in Ironforge.
  - objectives:
    1. item 10x Medium Leather <- Starving Dire Wolf [npc 213] L19-20 ~Duskwood 36,24 (38 spawns); Rabid Dire Wolf [npc 565] L20-21 ~Duskwood 28,31 (33 spawns); Gray Bear [npc 2351] L21-22 ~Hillsbrad Foothills 50,32 (46 spawns); Stormhide [npc 3238] L22-23 ~The Barrens 47,77 (42 spawns)

## 8514 The Alliance Needs More Medium Leather!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Private Porter [npc 15448] @ Ironforge 58.7,75.0
  - end:   Private Porter [npc 15448] @ Ironforge 58.7,75.0
  - pre(any)=[8513]
  - text: Bring 10 medium leather to Private Porter at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Medium Leather <- Starving Dire Wolf [npc 213] L19-20 ~Duskwood 36,24 (38 spawns); Rabid Dire Wolf [npc 565] L20-21 ~Duskwood 28,31 (33 spawns); Gray Bear [npc 2351] L21-22 ~Hillsbrad Foothills 50,32 (46 spawns); Stormhide [npc 3238] L22-23 ~The Barrens 47,77 (42 spawns)

## 8515 The Alliance Needs Thick Leather!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Marta Finespindle [npc 15450] @ Ironforge 57.1,75.0
  - end:   Marta Finespindle [npc 15450] @ Ironforge 57.1,75.0
  - next=8516
  - text: Bring 10 Thick Leather to Marta Finespindle at the Military Ward in Ironforge.
  - objectives:
    1. item 10x Thick Leather <- ?

## 8516 The Alliance Needs More Thick Leather!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Marta Finespindle [npc 15450] @ Ironforge 57.1,75.0
  - end:   Marta Finespindle [npc 15450] @ Ironforge 57.1,75.0
  - pre(any)=[8515]
  - text: Bring 10 thick leather to Marta Finespindle at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Thick Leather <- ?

## 8517 The Alliance Needs Linen Bandages!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Sentinel Silversky [npc 15451] @ Ironforge 54.5,77.9
  - end:   Sentinel Silversky [npc 15451] @ Ironforge 54.5,77.9
  - next=8518
  - text: Bring 20 Linen Bandages to Sentinel Silversky at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Linen Bandage <- ?

## 8518 The Alliance Needs More Linen Bandages!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Sentinel Silversky [npc 15451] @ Ironforge 54.5,77.9
  - end:   Sentinel Silversky [npc 15451] @ Ironforge 54.5,77.9
  - pre(any)=[8517]
  - text: Bring 20 linen bandages to Sentinel Silversky at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Linen Bandage <- ?

## 8520 The Alliance Needs Silk Bandages!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Nurse Stonefield [npc 15452] @ Ironforge 57.6,75.8
  - end:   Nurse Stonefield [npc 15452] @ Ironforge 57.6,75.8
  - next=8521
  - text: Bring 20 Silk Bandages to Nurse Stonefield at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Silk Bandage <- ?

## 8521 The Alliance Needs More Silk Bandages!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Nurse Stonefield [npc 15452] @ Ironforge 57.6,75.8
  - end:   Nurse Stonefield [npc 15452] @ Ironforge 57.6,75.8
  - pre(any)=[8520]
  - text: Bring 20 silk bandages to Nurse Stonefield at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Silk Bandage <- ?

## 8522 The Alliance Needs Runecloth Bandages!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Keeper Moonshade [npc 15453] @ Ironforge 55.7,75.9
  - end:   Keeper Moonshade [npc 15453] @ Ironforge 55.7,75.9
  - next=8523
  - text: Bring 20 Runecloth Bandages to Keeper Moonshade at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Runecloth Bandage <- ?

## 8523 The Alliance Needs More Runecloth Bandages!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Keeper Moonshade [npc 15453] @ Ironforge 55.7,75.9
  - end:   Keeper Moonshade [npc 15453] @ Ironforge 55.7,75.9
  - pre(any)=[8522]
  - text: Bring 20 runecloth bandages to Keeper Moonshade at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Runecloth Bandage <- ?

## 8524 The Alliance Needs Rainbow Fin Albacore!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Slicky Gastronome [npc 15455] @ Ironforge 71.6,69.2
  - end:   Slicky Gastronome [npc 15455] @ Ironforge 71.6,69.2
  - next=8525
  - text: Bring 20 Rainbow Fin Albacore to Slicky Gastronome at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Rainbow Fin Albacore <- ?

## 8525 The Alliance Needs More Rainbow Fin Albacore!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Slicky Gastronome [npc 15455] @ Ironforge 71.6,69.2
  - end:   Slicky Gastronome [npc 15455] @ Ironforge 71.6,69.2
  - pre(any)=[8524]
  - text: Bring 20 rainbow fin albacore to Slicky Gastronome at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Rainbow Fin Albacore <- ?

## 8526 The Alliance Needs Roast Raptor!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Sarah Sadwhistle [npc 15456] @ Ironforge 72.1,69.6
  - end:   Sarah Sadwhistle [npc 15456] @ Ironforge 72.1,69.6
  - next=8527
  - text: Bring 20 Roast Raptor to Sarah Sadwhistle at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Roast Raptor <- ?

## 8527 The Alliance Needs More Roast Raptor!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Sarah Sadwhistle [npc 15456] @ Ironforge 72.1,69.6
  - end:   Sarah Sadwhistle [npc 15456] @ Ironforge 72.1,69.6
  - pre(any)=[8526]
  - text: Bring 20 roast raptor to Sarah Sadwhistle at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Roast Raptor <- ?

## 8528 The Alliance Needs Spotted Yellowtail!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR)
  - start: Huntress Swiftriver [npc 15457] @ Ironforge 73.0,68.5
  - end:   Huntress Swiftriver [npc 15457] @ Ironforge 73.0,68.5
  - next=8529
  - text: Bring 20 Spotted Yellowtail to Huntress Swiftriver at the Military Ward in Ironforge.
  - objectives:
    1. item 20x Spotted Yellowtail <- Darcy [npc 379] L15-15 ~Redridge Mountains 22,44 (1 spawns); Witherbark Hideskinner [npc 2651] L42-43 ~The Hinterlands 31,58 (18 spawns); Witherbark Venomblood [npc 2652] L43-43 ~The Hinterlands 31,59 (8 spawns); Green Sludge [npc 2655] L46-47 ~The Hinterlands 52,45 (46 spawns)

## 8529 The Alliance Needs More Spotted Yellowtail!  (L60 req1, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Huntress Swiftriver [npc 15457] @ Ironforge 73.0,68.5
  - end:   Huntress Swiftriver [npc 15457] @ Ironforge 73.0,68.5
  - pre(any)=[8528]
  - text: Bring 20 spotted yellowtail to Huntress Swiftriver at the airfield in Dun Morogh.
  - objectives:
    1. item 1x Spotted Yellowtail <- Darcy [npc 379] L15-15 ~Redridge Mountains 22,44 (1 spawns); Witherbark Hideskinner [npc 2651] L42-43 ~The Hinterlands 31,58 (18 spawns); Witherbark Venomblood [npc 2652] L43-43 ~The Hinterlands 31,59 (8 spawns); Green Sludge [npc 2655] L46-47 ~The Hinterlands 52,45 (46 spawns)

## 8762 Metzen the Reindeer  (L60 req40, 4950 xp, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - end:   Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - next=8763
  - text: Find Metzen the Reindeer. Use the notes provided to you for clues as to where he is being held.
  - text: When you find Metzen, have the Pouch of Reindeer Dust in your possession so you can sprinkle some of the dust on him; this should free Metzen from his bonds of captivity.
  - text: Return the Pouch of Reindeer Dust to Wulmort Jinglepocket in Ironforge once Metzen is freed.
  - objectives:
    1. kill 1x Metzen the Reindeer <- Metzen the Reindeer [npc 15664] L5-5 ~Tanaris 71,41 (2 spawns)
    2. item 1x Pouch of Reindeer Dust <- Giant Yeti [npc 2251] L33-34 ~Alterac Mountains 36,58 (34 spawns); Shadowforge Digger [npc 4846] L35-36 ~Badlands 48,12 (59 spawns); Glassweb Spider [npc 5856] L43-45 ~Searing Gorge 66,50 (20 spawns); Southsea Pirate [npc 7855] L44-45 ~Tanaris 72,46 (26 spawns)

## 8763 The Hero of the Day  (L60 req40, ? xp, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 13433] @ Ironforge 33.7,67.2
  - end:   Holly Preserver [object 180715] @ Ironforge 35.0,68.2
  - pre(any)=[8762]
  - text: Bring 1 Deeprock Salt and 5 gold coins to any Holly Preserver machine, upon which you will receive 5 Preserved Holly.
  - objectives:
    1. item 1x Deeprock Salt <- Rock Elemental [npc 92] L39-40 ~Badlands 35,69 (30 spawns); Felhunter [npc 417] L60-60; Stone Fury [npc 2258] L37-37 ~Alterac Mountains 65,45 (1 spawns); Elemental Slave [npc 2359] L32-34 ~Alterac Mountains 24,56 (14 spawns)

## 8795 The Alliance Needs Your Help!  (L60 req1, 660 xp, sort=AHN_QIRAJ_WAR)
  - start: Master Sergeant Fizzlebolt [npc 15707] @ Ironforge 27.5,73.3
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - exclusiveTo=[8796, 8797]
  - text: Speak with Field Marshal Snowfall in Ironforge's Military Ward.

## 8811 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Darnassus Commendation Officer [npc 15731] @ Ironforge 61.2,69.4; Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - end:   Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - next=8830
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8812 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Gnomeregan Commendation Officer [npc 15733] @ Ironforge 58.6,72.7; Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - end:   Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - next=8834
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8813 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Ironforge Commendation Officer [npc 15734] @ Ironforge 61.1,77.0; Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - end:   Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - next=8836
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8814 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Stormwind Commendation Officer [npc 15735] @ Ironforge 63.3,69.3; Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - end:   Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - next=8838
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8819 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Darnassus Commendation Officer [npc 15731] @ Ironforge 61.2,69.4; Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - end:   Officer Maloof [npc 15766] @ Stormwind City 62.4,74.5
  - next=8831
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8820 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Gnomeregan Commendation Officer [npc 15733] @ Ironforge 58.6,72.7; Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - end:   Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - next=8835
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8821 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Ironforge Commendation Officer [npc 15734] @ Ironforge 61.1,77.0; Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - end:   Officer Lunalight [npc 15762] @ Darnassus 38.2,38.6
  - next=8837
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8822 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Stormwind Commendation Officer [npc 15735] @ Ironforge 63.3,69.3; Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - end:   Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - next=8839
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8834 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - end:   Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - pre(any)=[8812]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8835 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - end:   Officer Ironbeard [npc 15764] @ Ironforge 43.2,46.5
  - pre(any)=[8820]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8838 One Commendation Signet  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - end:   Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - pre(any)=[8814]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8839 Ten Commendation Signets  (L60 req1, ? xp, sort=REPUTATION, repeatable)
  - start: Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - end:   Officer Porterhouse [npc 15763] @ Ironforge 69.7,46.0
  - pre(any)=[8822]
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8850 Thirty Signets for War Supplies  (L60 req50, ? xp, sort=AHN_QIRAJ_WAR, repeatable)
  - start: Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - end:   Field Marshal Snowfall [npc 15701] @ Ironforge 61.3,74.2
  - objectives:
    1. item 1x Alliance Commendation Signet <- ?

## 8866 Bronzebeard the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Bronzebeard [npc 15871] @ Ironforge 29.2,17.1
  - end:   Elder Bronzebeard [npc 15871] @ Ironforge 29.2,17.1

## 8898 Dearest Colara,  (L60 req1, ? xp, sort=SEASONAL)
  - start: Tormek Stoneriver [npc 16009] @ Ironforge 32.6,66.2
  - end:   Colara Dean [npc 16002] @ Stormwind City 61.7,75.5
  - next=8903, breadcrumbFor=8903, exclusiveTo=[8897, 8899]
  - text: Deliver the Creased Letter to Colara Dean outside the bank in Stormwind.

## 8905 An Earnest Proposition  (L60 req58, 6600 xp, class=Druid)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Wildheart Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Wildheart Bracers <- Crimson Inquisitor [npc 10426] L59-60; Shrieking Banshee [npc 10463] L57-58; Wailing Banshee [npc 10464] L58-59; Diseased Ghoul [npc 10495] L58-59

## 8906 An Earnest Proposition  (L60 req58, 6600 xp, class=Hunter)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Beaststalker's Bindings to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Beaststalker's Bindings <- Rage Talon Dragonspawn [npc 9096] L58-59; Ghoul Ravener [npc 10406] L58-59; Fleshflayer Ghoul [npc 10407] L59-60; Crimson Defender [npc 10421] L58-59

## 8907 An Earnest Proposition  (L60 req58, 6600 xp, class=Mage)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Magister's Bindings to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Magister's Bindings <- Scarshield Spellbinder [npc 9098] L54-55; Firebrand Invoker [npc 9262] L56-57; Firebrand Pyromancer [npc 9264] L57-58; Bloodaxe Evoker [npc 9693] L58-59

## 8908 An Earnest Proposition  (L60 req58, 6600 xp, class=Paladin)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Lightforge Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Lightforge Bracers <- Rockwing Gargoyle [npc 10408] L57-58; Rockwing Screecher [npc 10409] L58-59; Risen Warrior [npc 10486] L59-61; Risen Protector [npc 10487] L58-60

## 8909 An Earnest Proposition  (L60 req58, 6600 xp, class=Priest)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with 1 set of Devout Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Devout Bracers <- Thuzadin Shadowcaster [npc 10398] L58-59; Thuzadin Necromancer [npc 10400] L59-61; Crimson Conjuror [npc 10419] L57-58; Crimson Initiate [npc 10420] L57-58

## 8910 An Earnest Proposition  (L60 req58, 6600 xp, class=Rogue)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Shadowcraft Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Shadowcraft Bracers <- Smolderthorn Shadow Hunter [npc 9265] L56-57; Plague Ghoul [npc 10405] L57-58; Scholomance Occultist [npc 10472] L58-59; Risen Construct [npc 10488] L58-61

## 8911 An Earnest Proposition  (L60 req58, 6600 xp, class=Warlock)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Dreadmist Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Dreadmist Bracers <- Scarshield Warlock [npc 9257] L54-55; Firebrand Darkweaver [npc 9261] L56-57; Firebrand Dreadweaver [npc 9263] L57-58; Smolderthorn Seer [npc 9269] L56-57

## 8912 An Earnest Proposition  (L60 req58, 6600 xp, class=Warrior)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - next=8922
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Bracers of Valor to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Bracers of Valor <- Scarshield Legionnaire [npc 9097] L54-55; Firebrand Grunt [npc 9259] L56-57; Firebrand Legionnaire [npc 9260] L57-58; Smolderthorn Axe Thrower [npc 9267] L55-56

## 8926 Just Compensation  (L60 req58, 9950 xp, class=Druid)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Wildheart Belt and a set of Wildheart Gloves Deliana in Ironforge.
  - objectives:
    1. item 1x Wildheart Belt <- Scarshield Raider [npc 9258] L54-56; Bloodaxe Raider [npc 9692] L57-58; Bile Spewer [npc 10416] L59-60; Venom Belcher [npc 10417] L60-61
    2. item 1x Wildheart Gloves <- Rage Talon Dragonspawn [npc 9096] L58-59; Scarshield Raider [npc 9258] L54-56; Firebrand Invoker [npc 9262] L56-57; Firebrand Pyromancer [npc 9264] L57-58

## 8931 Just Compensation  (L60 req58, 9950 xp, class=Hunter)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Beaststalker's Belt and a set of Beaststalker's Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Beaststalker's Belt <- Smolderthorn Headhunter [npc 9241] L56-57; Scarshield Raider [npc 9258] L54-56; Firebrand Grunt [npc 9259] L56-57; Firebrand Legionnaire [npc 9260] L57-58
    2. item 1x Beaststalker's Gloves <- War Master Voone [npc 9237] L58-58

## 8932 Just Compensation  (L60 req58, 9950 xp, class=Mage)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Magister's Belt and a set of Magister's Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Magister's Belt <- Smolderthorn Mystic [npc 9239] L55-56; Thuzadin Shadowcaster [npc 10398] L58-59; Thuzadin Necromancer [npc 10400] L59-61; Crimson Conjuror [npc 10419] L57-58
    2. item 1x Magister's Gloves <- Scholomance Adept [npc 10469] L58-59; Doctor Theolen Krastinov [npc 11261] L60-60

## 8933 Just Compensation  (L60 req58, 9950 xp, class=Paladin)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Lightforge Belt and a set of Lightforge Gauntlets to Deliana in Ironforge.
  - objectives:
    1. item 1x Lightforge Belt <- Rockwing Gargoyle [npc 10408] L57-58; Rockwing Screecher [npc 10409] L58-59; Crimson Guardsman [npc 10418] L57-58; Crimson Gallant [npc 10424] L59-60
    2. item 1x Lightforge Gauntlets <- Timmy the Cruel [npc 10808] L58-58

## 8934 Just Compensation  (L60 req58, 9950 xp, class=Priest)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Devout Belt and a set of Devout Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Devout Belt <- Scarshield Spellbinder [npc 9098] L54-55; Smolderthorn Shadow Priest [npc 9240] L55-56; Firebrand Darkweaver [npc 9261] L56-57; Firebrand Dreadweaver [npc 9263] L57-58
    2. item 1x Devout Gloves <- Archivist Galford [npc 10811] L60-60

## 8935 Just Compensation  (L60 req58, 9950 xp, class=Rogue)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Shadowcraft Belt and a set of Shadowcraft Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Shadowcraft Belt <- Scarshield Quartermaster [npc 9046] L55-55 ~Eastern Kingdoms 49,64 (1 spawns); Scarshield Legionnaire [npc 9097] L54-55; Firebrand Grunt [npc 9259] L56-57; Firebrand Legionnaire [npc 9260] L57-58
    2. item 1x Shadowcraft Gloves <- Shadow Hunter Vosh'gajin [npc 9236] L58-58

## 8936 Just Compensation  (L60 req58, 9950 xp, class=Warlock)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Dreadmist Belt and a set of Dreadmist Wraps to Deliana in Ironforge.
  - objectives:
    1. item 1x Dreadmist Belt <- Thuzadin Shadowcaster [npc 10398] L58-59; Thuzadin Necromancer [npc 10400] L59-61; Crimson Conjuror [npc 10419] L57-58; Crimson Sorcerer [npc 10422] L58-59
    2. item 1x Dreadmist Wraps <- Scholomance Necromancer [npc 10477] L58-59; Lorekeeper Polkelt [npc 10901] L60-60

## 8937 Just Compensation  (L60 req58, 9950 xp, class=Warrior)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8977], next=8929
  - text: Bring a Belt of Valor and a set of Gauntlets of Valor to Deliana in Ironforge.
  - objectives:
    1. item 1x Belt of Valor <- Smolderthorn Berserker [npc 9268] L57-58; Patchwork Horror [npc 10414] L57-58; Bile Spewer [npc 10416] L59-60; Venom Belcher [npc 10417] L60-61
    2. item 1x Gauntlets of Valor <- Ramstein the Gorger [npc 10439] L61-61

## 8951 Anthion's Parting Words  (L60 req58, 9950 xp, class=Druid)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Wildheart Boots, a Wildheart Kilt and Wildheart Spaulders.
  - objectives:
    1. item 1x Wildheart Boots <- Mother Smolderweb [npc 10596] L59-59
    2. item 1x Wildheart Kilt <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Wildheart Spaulders <- Gizrul the Slavener [npc 10268] L60-60

## 8952 Anthion's Parting Words  (L60 req58, 9950 xp, class=Hunter)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Beaststalker's Boots, Beaststalker's Pants and Beaststalker's Mantle.
  - objectives:
    1. item 1x Beaststalker's Boots <- Nerub'enkan [npc 10437] L60-60
    2. item 1x Beaststalker's Pants <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Beaststalker's Mantle <- Overlord Wyrmthalak [npc 9568] L60-60

## 8953 Anthion's Parting Words  (L60 req58, 9950 xp, class=Mage)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Magister's Boots, Magister's Leggings and Magister's Mantle.
  - objectives:
    1. item 1x Magister's Boots <- Hearthsinger Forresten [npc 10558] L57-57
    2. item 1x Magister's Leggings <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Magister's Mantle <- ?

## 8954 Anthion's Parting Words  (L60 req58, 9950 xp, class=Paladin)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Lightforge Boots, Lightforge Legplates and Lightforge Spaulders.
  - objectives:
    1. item 1x Lightforge Boots <- Balnazzar [npc 10813] L62-62
    2. item 1x Lightforge Legplates <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Lightforge Spaulders <- The Beast [npc 10430] L62-62

## 8955 Anthion's Parting Words  (L60 req58, 9950 xp, class=Priest)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Devout Sandals, Devout Skirt and Devout Mantle.
  - objectives:
    1. item 1x Devout Sandals <- Maleki the Pallid [npc 10438] L61-61
    2. item 1x Devout Skirt <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Devout Mantle <- Solakar Flamewreath [npc 10264] L60-60

## 8956 Anthion's Parting Words  (L60 req58, 9950 xp, class=Rogue)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Shadowcraft Boots, Shadowcraft Pants and Shadowcraft Spaulders.
  - objectives:
    1. item 1x Shadowcraft Boots <- Rattlegore [npc 11622] L61-61
    2. item 1x Shadowcraft Pants <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Shadowcraft Spaulders <- Cannon Master Willey [npc 10997] L60-60

## 8958 Anthion's Parting Words  (L60 req58, 9950 xp, class=Warlock)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Dreadmist Sandals, Dreadmist Leggings and Dreadmist Mantle.
  - objectives:
    1. item 1x Dreadmist Sandals <- Baroness Anastari [npc 10436] L59-59
    2. item 1x Dreadmist Leggings <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Dreadmist Mantle <- Jandice Barov [npc 10503] L61-61

## 8959 Anthion's Parting Words  (L60 req58, 9950 xp, class=Warrior)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[9015], next=8960
  - text: Return to Deliana in Ironforge with a set of Boots of Valor, Legplates of Valor and Spaulders of Valor.
  - objectives:
    1. item 1x Boots of Valor <- Kirtonos the Herald [npc 10506] L60-60
    2. item 1x Legplates of Valor <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Spaulders of Valor <- Warchief Rend Blackhand [npc 10429] L62-62

## 8977 Return to Deliana  (L60 req58, 6600 xp)
  - start: Mux Manascrambler [npc 16014] @ Tanaris 52.5,27.2
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6; Deliana [npc 230319] @ Ironforge 43.6,52.6
  - pre(any)=[8928]
  - text: Bring the Extra-Dimensional Ghost Revealer to Deliana in Ironforge.

## 8997 Back to the Beginning  (L60 req58, 660 xp)
  - start: Bodley [npc 16033] @ Eastern Kingdoms 48.9,63.9
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8996]
  - text: Speak with Deliana at The High Seat in Ironforge.

## 8999 Saving the Best for Last  (L60 req58, 1650 xp, class=Druid)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Wildheart Cowl and Wildheart Vest.
  - objectives:
    1. item 1x Wildheart Cowl <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Wildheart Vest <- General Drakkisath [npc 10363] L62-62

## 9000 Saving the Best for Last  (L60 req58, 1650 xp, class=Hunter)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Beaststalker's Cap and Beaststalker's Tunic.
  - objectives:
    1. item 1x Beaststalker's Cap <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Beaststalker's Tunic <- General Drakkisath [npc 10363] L62-62

## 9001 Saving the Best for Last  (L60 req58, 1650 xp, class=Mage)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Magister's Crown and Magister's Robes.
  - objectives:
    1. item 1x Magister's Crown <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Magister's Robes <- General Drakkisath [npc 10363] L62-62

## 9002 Saving the Best for Last  (L60 req58, 1650 xp, class=Paladin)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Lightforge Helm and Lightforge Breastplate.
  - objectives:
    1. item 1x Lightforge Helm <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Lightforge Breastplate <- General Drakkisath [npc 10363] L62-62

## 9003 Saving the Best for Last  (L60 req58, 1650 xp, class=Priest)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Devout Crown and Devout Robe.
  - objectives:
    1. item 1x Devout Crown <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Devout Robe <- General Drakkisath [npc 10363] L62-62

## 9004 Saving the Best for Last  (L60 req58, 1650 xp, class=Rogue)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Shadowcraft Cap and Shadowcraft Tunic.
  - objectives:
    1. item 1x Shadowcraft Cap <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Shadowcraft Tunic <- General Drakkisath [npc 10363] L62-62

## 9005 Saving the Best for Last  (L60 req58, 1650 xp, class=Warlock)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Dreadmist Mask and Dreadmist Robe.
  - objectives:
    1. item 1x Dreadmist Mask <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Dreadmist Robe <- General Drakkisath [npc 10363] L62-62

## 9006 Saving the Best for Last  (L60 req58, 1650 xp, class=Warrior)
  - start: Deliana [npc 16013] @ Ironforge 43.5,52.6
  - end:   Deliana [npc 16013] @ Ironforge 43.5,52.6
  - pre(any)=[8997]
  - text: Give Deliana your Helm of Valor and Breastplate of Valor.
  - objectives:
    1. item 1x Helm of Valor <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Breastplate of Valor <- General Drakkisath [npc 10363] L62-62

## 9094 Argent Dawn Gloves  (L60 req50, ? xp, sort=INVASION, repeatable)
  - start: Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - end:   Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - pre(any)=[9153]
  - objectives:
    1. item 1x Necrotic Rune <- Lumbering Horror [npc 14697] L1-1; Ghoul Berserker [npc 16141] L59-60; Shadow of Doom [npc 16143] L60-60 ~Eastern Plaguelands 45,47 (34 spawns); Spectral Soldier [npc 16298] L59-60

## 9154 Light's Hope Chapel  (L60 req50, ? xp, sort=INVASION)
  - start: Argent Recruiter [npc 16241] @ Ironforge 34.1,68.1 (+1 spawns); Argent Scout [npc 16255] @ Undercity 66.2,47.0 (+2 spawns)
  - end:   Keeper of the Rolls [npc 16281] @ Eastern Plaguelands 71.2,50.5
  - text: Deliver the Call to Arms Announcement to the Keeper of the Rolls at Light's Hope Chapel in the Eastern Plaguelands.

## 9317 Consecrated Sharpening Stones  (L60 req50, ? xp, sort=INVASION, repeatable)
  - start: Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - end:   Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - pre(any)=[9153]
  - objectives:
    1. item 1x Necrotic Rune <- Lumbering Horror [npc 14697] L1-1; Ghoul Berserker [npc 16141] L59-60; Shadow of Doom [npc 16143] L60-60 ~Eastern Plaguelands 45,47 (34 spawns); Spectral Soldier [npc 16298] L59-60

## 9318 Blessed Wizard Oil  (L60 req50, ? xp, sort=INVASION, repeatable)
  - start: Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - end:   Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - pre(any)=[9153]
  - objectives:
    1. item 1x Necrotic Rune <- Lumbering Horror [npc 14697] L1-1; Ghoul Berserker [npc 16141] L59-60; Shadow of Doom [npc 16143] L60-60 ~Eastern Plaguelands 45,47 (34 spawns); Spectral Soldier [npc 16298] L59-60

## 9321 Major Healing Potion  (L60 req50, ? xp, sort=INVASION, repeatable)
  - start: Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - end:   Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - pre(any)=[9153]
  - objectives:
    1. item 1x Necrotic Rune <- Lumbering Horror [npc 14697] L1-1; Ghoul Berserker [npc 16141] L59-60; Shadow of Doom [npc 16143] L60-60 ~Eastern Plaguelands 45,47 (34 spawns); Spectral Soldier [npc 16298] L59-60

## 9337 Major Mana Potion  (L60 req50, ? xp, sort=INVASION, repeatable)
  - start: Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - end:   Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - pre(any)=[9153]
  - objectives:
    1. item 1x Necrotic Rune <- Lumbering Horror [npc 14697] L1-1; Ghoul Berserker [npc 16141] L59-60; Shadow of Doom [npc 16143] L60-60 ~Eastern Plaguelands 45,47 (34 spawns); Spectral Soldier [npc 16298] L59-60

## 9341 Tabard of the Argent Dawn  (L60 req50, ? xp, sort=INVASION, repeatable)
  - start: Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - end:   Argent Quartermaster [npc 16786] @ Ironforge 33.9,67.8 (+2 spawns)
  - pre(any)=[9153]
  - objectives:
    1. item 1x Necrotic Rune <- Lumbering Horror [npc 14697] L1-1; Ghoul Berserker [npc 16141] L59-60; Shadow of Doom [npc 16143] L60-60 ~Eastern Plaguelands 45,47 (34 spawns); Spectral Soldier [npc 16298] L59-60

## 79482 Stolen Winter Veil Treats  (L60 req25, ? xp, F, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 216902] @ Ironforge 32.4,67.4 (+8 spawns)
  - end:   Strange Snowman [npc 216915] @ Alterac Mountains 35.4,72.4 (+3 spawns)
  - text: Locate the Smokywood Pastures investigator that has gone missing in the snowy regions of the Alterac Mountains.

## 79492 Metzen the Reindeer  (L60 req25, ? xp, F, sort=SEASONAL)
  - start: Wulmort Jinglepocket [npc 216902] @ Ironforge 32.4,67.4 (+8 spawns)
  - end:   Wulmort Jinglepocket [npc 216902] @ Ironforge 32.4,67.4 (+8 spawns)
  - text: Find Metzen the Reindeer. Use the notes provided to you for clues as to where he is being held.
  - text: When you find Metzen, have the Pouch of Reindeer Dust in your possession so you can sprinkle some of the dust on him; this should free Metzen from his bonds of captivity.
  - text: Return the Pouch of Reindeer Dust to Wulmort Jinglepocket in Ironforge once Metzen is freed.

## 84147 An Earnest Proposition  (L60 req58, ? xp, F, class=Druid)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Wildheart Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Wildheart Bracers <- Crimson Inquisitor [npc 10426] L59-60; Shrieking Banshee [npc 10463] L57-58; Wailing Banshee [npc 10464] L58-59; Diseased Ghoul [npc 10495] L58-59

## 84148 An Earnest Proposition  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Beaststalker's Bindings to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Beaststalker's Bindings <- Rage Talon Dragonspawn [npc 9096] L58-59; Ghoul Ravener [npc 10406] L58-59; Fleshflayer Ghoul [npc 10407] L59-60; Crimson Defender [npc 10421] L58-59

## 84149 An Earnest Proposition  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Magister's Bindings to Deliana in Ironforge.

## 84150 An Earnest Proposition  (L60 req58, ? xp, F, class=Paladin)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Lightforge Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Lightforge Bracers <- Rockwing Gargoyle [npc 10408] L57-58; Rockwing Screecher [npc 10409] L58-59; Risen Warrior [npc 10486] L59-61; Risen Protector [npc 10487] L58-60

## 84151 An Earnest Proposition  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with 1 set of Devout Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Devout Bracers <- Thuzadin Shadowcaster [npc 10398] L58-59; Thuzadin Necromancer [npc 10400] L59-61; Crimson Conjuror [npc 10419] L57-58; Crimson Initiate [npc 10420] L57-58

## 84152 An Earnest Proposition  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Shadowcraft Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Shadowcraft Bracers <- Smolderthorn Shadow Hunter [npc 9265] L56-57; Plague Ghoul [npc 10405] L57-58; Scholomance Occultist [npc 10472] L58-59; Risen Construct [npc 10488] L58-61

## 84153 An Earnest Proposition  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Dreadmist Bracers to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Dreadmist Bracers <- Scarshield Warlock [npc 9257] L54-55; Firebrand Darkweaver [npc 9261] L56-57; Firebrand Dreadweaver [npc 9263] L57-58; Smolderthorn Seer [npc 9269] L56-57

## 84154 An Earnest Proposition  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Bracers of Valor to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Bracers of Valor <- Scarshield Legionnaire [npc 9097] L54-55; Firebrand Grunt [npc 9259] L56-57; Firebrand Legionnaire [npc 9260] L57-58; Smolderthorn Axe Thrower [npc 9267] L55-56

## 84163 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Wildheart Belt and a set of Wildheart Gloves Deliana in Ironforge.
  - objectives:
    1. item 1x Wildheart Belt <- Scarshield Raider [npc 9258] L54-56; Bloodaxe Raider [npc 9692] L57-58; Bile Spewer [npc 10416] L59-60; Venom Belcher [npc 10417] L60-61
    2. item 1x Wildheart Gloves <- Rage Talon Dragonspawn [npc 9096] L58-59; Scarshield Raider [npc 9258] L54-56; Firebrand Invoker [npc 9262] L56-57; Firebrand Pyromancer [npc 9264] L57-58

## 84164 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Beaststalker's Belt and a set of Beaststalker's Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Beaststalker's Belt <- Smolderthorn Headhunter [npc 9241] L56-57; Scarshield Raider [npc 9258] L54-56; Firebrand Grunt [npc 9259] L56-57; Firebrand Legionnaire [npc 9260] L57-58
    2. item 1x Beaststalker's Gloves <- War Master Voone [npc 9237] L58-58

## 84165 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Magister's Belt and a set of Magister's Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Magister's Belt <- Smolderthorn Mystic [npc 9239] L55-56; Thuzadin Shadowcaster [npc 10398] L58-59; Thuzadin Necromancer [npc 10400] L59-61; Crimson Conjuror [npc 10419] L57-58
    2. item 1x Magister's Gloves <- Scholomance Adept [npc 10469] L58-59; Doctor Theolen Krastinov [npc 11261] L60-60

## 84166 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Lightforge Belt and a set of Lightforge Gauntlets to Deliana in Ironforge.
  - objectives:
    1. item 1x Lightforge Belt <- Rockwing Gargoyle [npc 10408] L57-58; Rockwing Screecher [npc 10409] L58-59; Crimson Guardsman [npc 10418] L57-58; Crimson Gallant [npc 10424] L59-60
    2. item 1x Lightforge Gauntlets <- Timmy the Cruel [npc 10808] L58-58

## 84167 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Devout Belt and a set of Devout Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Devout Belt <- Scarshield Spellbinder [npc 9098] L54-55; Smolderthorn Shadow Priest [npc 9240] L55-56; Firebrand Darkweaver [npc 9261] L56-57; Firebrand Dreadweaver [npc 9263] L57-58
    2. item 1x Devout Gloves <- Archivist Galford [npc 10811] L60-60

## 84168 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Shadowcraft Belt and a set of Shadowcraft Gloves to Deliana in Ironforge.
  - objectives:
    1. item 1x Shadowcraft Belt <- Scarshield Quartermaster [npc 9046] L55-55 ~Eastern Kingdoms 49,64 (1 spawns); Scarshield Legionnaire [npc 9097] L54-55; Firebrand Grunt [npc 9259] L56-57; Firebrand Legionnaire [npc 9260] L57-58
    2. item 1x Shadowcraft Gloves <- Shadow Hunter Vosh'gajin [npc 9236] L58-58

## 84169 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Dreadmist Belt and a set of Dreadmist Wraps to Deliana in Ironforge.
  - objectives:
    1. item 1x Dreadmist Belt <- Thuzadin Shadowcaster [npc 10398] L58-59; Thuzadin Necromancer [npc 10400] L59-61; Crimson Conjuror [npc 10419] L57-58; Crimson Sorcerer [npc 10422] L58-59
    2. item 1x Dreadmist Wraps <- Scholomance Necromancer [npc 10477] L58-59; Lorekeeper Polkelt [npc 10901] L60-60

## 84170 Just Compensation  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Bring a Belt of Valor and a set of Gauntlets of Valor to Deliana in Ironforge.
  - objectives:
    1. item 1x Belt of Valor <- Smolderthorn Berserker [npc 9268] L57-58; Patchwork Horror [npc 10414] L57-58; Bile Spewer [npc 10416] L59-60; Venom Belcher [npc 10417] L60-61
    2. item 1x Gauntlets of Valor <- Ramstein the Gorger [npc 10439] L61-61

## 84179 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Wildheart Boots, a Wildheart Kilt and Wildheart Spaulders.
  - objectives:
    1. item 1x Wildheart Boots <- Mother Smolderweb [npc 10596] L59-59
    2. item 1x Wildheart Kilt <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Wildheart Spaulders <- Gizrul the Slavener [npc 10268] L60-60

## 84180 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Beaststalker's Boots, Beaststalker's Pants and Beaststalker's Mantle.
  - objectives:
    1. item 1x Beaststalker's Boots <- Nerub'enkan [npc 10437] L60-60
    2. item 1x Beaststalker's Pants <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Beaststalker's Mantle <- Overlord Wyrmthalak [npc 9568] L60-60

## 84181 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Magister's Boots, Magister's Leggings and Magister's Mantle.
  - objectives:
    1. item 1x Magister's Boots <- Hearthsinger Forresten [npc 10558] L57-57
    2. item 1x Magister's Leggings <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Magister's Mantle <- ?

## 84182 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Lightforge Boots, Lightforge Legplates and Lightforge Spaulders.
  - objectives:
    1. item 1x Lightforge Boots <- Balnazzar [npc 10813] L62-62
    2. item 1x Lightforge Legplates <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Lightforge Spaulders <- The Beast [npc 10430] L62-62

## 84183 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Devout Sandals, Devout Skirt and Devout Mantle.
  - objectives:
    1. item 1x Devout Sandals <- Maleki the Pallid [npc 10438] L61-61
    2. item 1x Devout Skirt <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Devout Mantle <- Solakar Flamewreath [npc 10264] L60-60

## 84184 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Shadowcraft Boots, Shadowcraft Pants and Shadowcraft Spaulders.
  - objectives:
    1. item 1x Shadowcraft Boots <- Rattlegore [npc 11622] L61-61
    2. item 1x Shadowcraft Pants <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Shadowcraft Spaulders <- Cannon Master Willey [npc 10997] L60-60

## 84186 Anthion's Parting Words  (L60 req58, ? xp, F)
  - start: Anthion Harmon [npc 16016] @ Eastern Plaguelands 26.1,11.3
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Return to Deliana in Ironforge with a set of Boots of Valor, Legplates of Valor and Spaulders of Valor.
  - objectives:
    1. item 1x Boots of Valor <- Kirtonos the Herald [npc 10506] L60-60
    2. item 1x Legplates of Valor <- Baron Rivendare [npc 10440] L62-62
    3. item 1x Spaulders of Valor <- Warchief Rend Blackhand [npc 10429] L62-62

## 84195 Saving the Best for Last  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Give Deliana your Wildheart Cowl and Wildheart Vest.
  - objectives:
    1. item 1x Wildheart Cowl <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Wildheart Vest <- General Drakkisath [npc 10363] L62-62

## 84196 Saving the Best for Last  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Give Deliana your Beaststalker's Cap and Beaststalker's Tunic.
  - objectives:
    1. item 1x Beaststalker's Cap <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Beaststalker's Tunic <- General Drakkisath [npc 10363] L62-62

## 84200 Saving the Best for Last  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Give Deliana your Shadowcraft Cap and Shadowcraft Tunic.
  - objectives:
    1. item 1x Shadowcraft Cap <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Shadowcraft Tunic <- General Drakkisath [npc 10363] L62-62

## 84202 Saving the Best for Last  (L60 req58, ? xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Give Deliana your Helm of Valor and Breastplate of Valor.
  - objectives:
    1. item 1x Helm of Valor <- Darkmaster Gandling [npc 1853] L61-61
    2. item 1x Breastplate of Valor <- General Drakkisath [npc 10363] L62-62

## 95817 Rotgath Stonebeard  (L60 req1, ? xp, F)
  - start: ?
  - end:   ?
  - text: Meet Rotgath Stonebeard near the Great Forge in Ironforge.

## 97168 Material Assistance  (L60 req58, 4950 xp, F, class=Shaman, sort=SHAMAN)
  - start: Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8
  - end:   Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8
  - text: If you are interested in helping Eldrun Stormbreaker in Ironforge, bring him an Azerothian Diamond and a Pristine Black Diamond.
  - objectives:
    1. item 1x Azerothian Diamond <- Cliff Breaker [npc 6146] L54-55 ~Azshara 62,58 (24 spawns); Anubisath Guardian [npc 15355] L62-62; Small Thorium Vein [object 324] ~Silithus 53,47 (811 spawns); Ooze Covered Thorium Vein [object 123848] ~Feralas 53,79 (13 spawns)
    2. item 1x Pristine Black Diamond <- Skeletal Warlord [npc 1788] L56-57 ~Western Plaguelands 44,68 (6 spawns); Flesh Golem [npc 1805] L56-57 ~Western Plaguelands 45,69 (2 spawns); Scarlet Magus [npc 1832] L56-57 ~Western Plaguelands 46,15 (9 spawns); Scarlet Cavalier [npc 1836] L56-58 ~Western Plaguelands 42,15 (6 spawns)

## 97169 The Darkreaver Menace  (L60 reqNone, ? xp, F)
  - start: Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8
  - end:   Eldrun Stormbreaker [npc 258098] @ Ironforge 47.1,13.8
  - text: Use the Divination Scryer in the heart of the Great Ossuary's basement in the Scholomance.  Doing so will bring forth spirits you must fight. Defeating these spirits will summon forth Death Knight Darkreaver; defeat him.
  - text: Bring Darkreaver's Head to Eldrun Stormbreaker in the Forlorn Caverns, Ironforge.
  - objectives:
    1. item 1x Darkreaver's Head <- Death Knight Darkreaver [npc 14516] L62-62

## 97447 An Earnest Proposition  (L60 req58, 6600 xp, F)
  - start: Deliana [npc 230319] @ Ironforge 43.6,52.6
  - end:   Deliana [npc 230319] @ Ironforge 43.6,52.6
  - text: Acquire 15 Winterspring Blood Samples and 20 gold and bring them along with a set of Bindings of the Elements to Deliana in Ironforge.
  - objectives:
    1. item 15x Winterspring Blood Sample <- Frostsaber Cub [npc 7430] L55-56 ~Winterspring 51,12 (22 spawns); Frostsaber [npc 7431] L56-57 ~Winterspring 54,16 (21 spawns); Frostsaber Stalker [npc 7432] L59-60 ~Winterspring 52,16 (42 spawns); Frostsaber Huntress [npc 7433] L58-59 ~Winterspring 51,12 (25 spawns)
    2. item 1x Bindings of Elements <- Crypt Crawler [npc 10412] L58-59; Crypt Beast [npc 10413] L59-60; Splintered Skeleton [npc 10478] L59-60; Crimson Monk [npc 11043] L58-60

## 97448 Just Compensation  (L60 req58, ? xp, F)
  - start: ?
  - end:   ?
  - text: Bring a Cord of the Elements and a set of Gauntlets of the Elements to Deliana in Ironforge.
  - objectives:
    1. item 1x Cord of Elements <- Scarshield Quartermaster [npc 9046] L55-55 ~Eastern Kingdoms 49,64 (1 spawns); Scarshield Warlock [npc 9257] L54-55; Firebrand Invoker [npc 9262] L56-57; Firebrand Pyromancer [npc 9264] L57-58
    2. item 1x Gauntlets of Elements <- Pyroguard Emberseer [npc 9816] L60-60

# Service NPCs

- Donal Osgood <Arathi Basin Battlemaster> [npc 857] 69.9,89.0: battlemaster
- Vosur Brakthel <Journeyman Alchemist> [npc 1246] 66.3,55.7: trainer
- Gretta Finespindle <Journeyman Leatherworker> [npc 1466] 38.8,32.9: trainer
- Gryth Thurden <Gryphon Master> [npc 1573] 55.5,47.7: flightMaster
- Uthrar Threx <Journeyman Tailor> [npc 1703] 43.8,27.9: trainer
- Kelstrum Stonebreaker <Warrior Trainer> [npc 1901] 67.0,90.2: trainer
- Barnum Stonemantle <Banker> [npc 2460] 35.0,58.4: banker
- Bailey Stonemantle <Banker> [npc 2461] 35.9,60.1: banker
- Milstaff Stormeye <Portal Trainer> [npc 2489] 25.5,7.1: trainer
- Durtham Greldon <> [npc 2737] 51.3,15.0: trainer
- Geofram Bouldertoe <Mining Trainer> [npc 4254] 50.0,26.3: trainer
- Golnir Bouldertoe <Mining Supplier> [npc 4256] 51.5,26.3: vendor
- Bengus Deepforge <Artisan Blacksmith> [npc 4258] 52.5,41.5: trainer
- Thurgrum Deepforge <Blacksmithing Supplies> [npc 4259] 51.7,42.8: repair, vendor
- Lyesa Steelbrow <Guild Tabard Vendor> [npc 5049] 36.3,85.5: tabardDesigner, vendor
- Soleil Stonemantle <Banker> [npc 5099] 36.8,61.9: banker
- Fillius Fizzlespinner <Trade Supplier> [npc 5100] 38.1,73.7: vendor
- Bryllia Ironbrand <General Goods Vendor> [npc 5101] 39.2,74.5: vendor
- Dolman Steelfury <Weapon Merchant> [npc 5102] 35.8,65.7: repair, vendor
- Grenil Steelfury <Weapon Merchant> [npc 5103] 36.0,65.4: repair, vendor
- Bromiir Ormsen <Heavy Armor Merchant> [npc 5106] 31.7,58.3: repair, vendor
- Mangorn Flinthammer <Heavy Armor Merchant> [npc 5107] 31.9,57.9: repair, vendor
- Raena Flinthammer <Light Armor Merchant> [npc 5108] 32.6,57.4: repair, vendor
- Myra Tyrngaarde <Bread Vendor> [npc 5109] 29.6,67.5: vendor
- Barim Jurgenstaad <Reagent Vendor> [npc 5110] 19.2,56.1: vendor
- Innkeeper Firebrew <Innkeeper> [npc 5111] 18.1,51.5: innkeeper, vendor
- Gwenna Firebrew <Barmaid> [npc 5112] 18.6,51.8: vendor
- Kelv Sternhammer <Warrior Trainer> [npc 5113] 70.3,90.7: trainer
- Bilban Tosslespanner <Warrior Trainer> [npc 5114] 65.9,88.4: trainer
- Daera Brightspear <Hunter Trainer> [npc 5115] 71.0,89.8: trainer
- Olmin Burningbeard <Hunter Trainer> [npc 5116] 70.9,83.6: trainer
- Regnus Thundergranite <Hunter Trainer> [npc 5117] 69.9,82.9: trainer
- Hegnar Swiftaxe <Axe Merchant> [npc 5119] 62.2,88.2: repair, vendor
- Brenwyn Wintersteel <Blade Merchant> [npc 5120] 62.4,88.7: repair, vendor
- Kelomir Ironhand <Maces & Staves> [npc 5121] 62.5,88.7: repair, vendor
- Skolmin Goldfury <Bow Merchant> [npc 5122] 71.8,66.7: repair, vendor
- Bretta Goldfury <Gun Merchant> [npc 5123] 72.2,65.2: repair, vendor
- Sognar Cliffbeard <Meat Vendor> [npc 5124] 56.6,82.2: vendor
- Dolkin Craghelm <Mail Armor Merchant> [npc 5125] 53.9,87.9: repair, vendor
- Olthran Craghelm <Heavy Armor Merchant> [npc 5126] 54.9,87.4: repair, vendor
- Fimble Finespindle <Expert Leatherworker> [npc 5127] 40.2,33.7: trainer
- Bombus Finespindle <Leatherworking Supplies> [npc 5128] 39.6,34.5: vendor
- Lissyphus Finespindle <Light Armor Merchant> [npc 5129] 54.7,88.0: repair, vendor
- Jondor Steelbrow <Guild Master> [npc 5130] 35.9,84.7: petitioner, tabardDesigner
- Pithwick <Bag Vendor> [npc 5132] 38.0,74.7: vendor
- Harick Boulderdrum <Wands Merchant> [npc 5133] 23.1,15.9: repair, vendor
- Reyna Stonebranch <Herbalism Trainer> [npc 5137] 55.9,59.1: trainer
- Gwina Stonebranch <Herbalism Supplier> [npc 5138] 55.1,59.5: vendor
- Edris Barleybeard <Barmaid> [npc 5140] 72.2,75.8: vendor
- Theodrus Frostbeard <Priest Trainer> [npc 5141] 24.1,8.4: trainer
- Braenna Flintcrag <Priest Trainer> [npc 5142] 24.4,9.2: trainer
- Toldren Deepiron <Priest Trainer> [npc 5143] 25.2,10.8: trainer
- Bink <Mage Trainer> [npc 5144] 27.2,8.3: trainer
- Juli Stormkettle <Mage Trainer> [npc 5145] 26.3,6.8: trainer
- Nittlebur Sparkfizzle <Mage Trainer> [npc 5146] 25.9,6.2: trainer
- Valgar Highforge <Paladin Trainer> [npc 5147] 23.7,5.1: trainer
- Beldruk Doombrow <Paladin Trainer> [npc 5148] 24.6,4.5: trainer
- Brandur Ironhammer <Paladin Trainer> [npc 5149] 23.1,6.1: trainer
- Nissa Firestone <First Aid Trainer> [npc 5150] 55.1,58.3: trainer
- Ginny Longberry <Reagent Vendor> [npc 5151] 31.3,27.8: vendor
- Bingus <Weapon Merchant> [npc 5152] 22.8,15.9: repair, vendor
- Jormund Stonebrow <Expert Tailor> [npc 5153] 43.1,29.4: trainer
- Poranna Snowbraid <Tailoring Supplies> [npc 5154] 42.9,28.3: vendor
- Ingrys Stonebrow <Cloth Armor Merchant> [npc 5155] 38.2,5.2: repair, vendor
- Maeva Snowbraid <Robe Merchant> [npc 5156] 38.7,6.0: repair, vendor
- Gimble Thistlefuzz <Expert Enchanter> [npc 5157] 59.8,45.5: trainer
- Tilli Thistlefuzz <Enchanting Supplies> [npc 5158] 61.0,44.0: vendor
- Daryl Riknussun <Cooking Trainer> [npc 5159] 60.1,36.4: trainer
- Emrul Riknussun <Cooking Supplier> [npc 5160] 59.9,37.4: vendor
- Grimnur Stonebrand <Fishing Trainer> [npc 5161] 48.1,6.9: trainer
- Tansy Puddlefizz <Fishing Supplier> [npc 5162] 48.2,6.5: vendor
- Burbik Gearspanner <Trade Supplier> [npc 5163] 46.4,26.9: vendor
- Grumnus Steelshaper <Armor Crafter> [npc 5164] 50.0,42.8: trainer
- Hulfdan Blackbeard <Rogue Trainer> [npc 5165] 52.0,14.8: trainer
- Ormyr Flinteye <Rogue Trainer> [npc 5166] 52.9,15.0: trainer
- Fenthwick <Rogue Trainer> [npc 5167] 51.5,15.3: trainer
- Tynnus Venomsprout <Shady Dealer> [npc 5169] 53.0,13.7: vendor
- Hjoldir Stoneblade <Blade Merchant> [npc 5170] 45.0,6.8: repair, vendor
- Thistleheart <Warlock Trainer> [npc 5171] 51.1,6.6: trainer
- Briarthorn <Warlock Trainer> [npc 5172] 50.4,5.7: trainer
- Alexander Calder <Warlock Trainer> [npc 5173] 50.1,7.5: trainer
- Springspindle Fizzlegear <Artisan Engineer> [npc 5174] 68.5,43.5: trainer
- Gearcutter Cogspinner <Engineering Supplies> [npc 5175] 67.8,42.5: vendor
- Tally Berryfizz <Expert Alchemist> [npc 5177] 66.6,55.7: trainer
- Soolie Berryfizz <Alchemy Supplies> [npc 5178] 66.2,54.5: vendor
- Fizzlebang Booms <Fireworks Vendor> [npc 5569] 73.6,53.4: vendor
- Bruuk Barleybeard <Bartender> [npc 5570] 72.5,77.0: vendor
- Balthus Stoneflayer <Skinning Trainer> [npc 6291] 39.9,32.5: trainer
- Jubahl Corpseseeker <Demon Trainer> [npc 6382] 52.7,6.1: vendor
- Dink <Mage Trainer> [npc 7312] 27.2,8.6: trainer
- Tinkmaster Overspark <Master Gnome Engineer> [npc 7944] 69.5,50.3: trainer
- Thalgus Thunderfist <Weapon Merchant> [npc 7976] 61.5,89.4: repair, vendor
- Bimble Longberry <Fruit Vendor> [npc 7978] 26.8,27.7: vendor
- Auctioneer Buckler <> [npc 8671] 23.8,71.8: auctioneer
- Outfitter Eric <Speciality Tailoring Supplies> [npc 8681] 43.4,29.3: vendor
- Auctioneer Redmuse <> [npc 8720] 24.2,74.7: auctioneer
- Sraaz <Pie Vendor> [npc 9099] 55.8,35.6: vendor
- Auctioneer Lympkin <> [npc 9859] 25.8,75.5: auctioneer
- Ulbrek Firehand <Stable Master> [npc 9984] 69.3,83.6: stableMaster
- Belia Thundergranite <Pet Trainer> [npc 10090] 70.9,85.8: trainer
- Rotgath Stonebeard <Expert Blacksmith> [npc 10276] 52.4,42.5: trainer
- Groum Stonebeard <Journeyman Blacksmith> [npc 10277] 52.3,41.9: trainer
- Jemma Quikswitch <Journeyman Engineer> [npc 11028] 67.7,44.2: trainer
- Trixie Quikswitch <Expert Engineer> [npc 11029] 67.5,42.9: trainer
- Thonys Pillarstone <Journeyman Enchanter> [npc 11065] 60.3,45.4: trainer
- Ironus Coldsteel <Special Weapon Crafter> [npc 11146] 50.3,43.6: trainer
- High Priest Rohan <Priest Trainer> [npc 11406] 24.7,8.2: trainer
- Buliwyf Stonehand <Weapon Master> [npc 11865] 61.2,89.5: trainer
- Glordrum Steelbeard <Alterac Valley Battlemaster> [npc 12197] 69.8,90.4: battlemaster
- Bixi Wobblebonk <Weapon Master> [npc 13084] 62.2,89.6: trainer
- Macey Jinglepocket <Smokywood Pastures> [npc 13434] 33.6,67.7: vendor
- Lylandris <Warsong Gulch Battlemaster> [npc 14982] 70.7,89.0: battlemaster
- Alliance Brigadier General <> [npc 15351] 70.4,91.1: vendor
- Katrina Shimmerstar <Hallow's End Treats> [npc 15353] 34.1,66.2: vendor
- Ironforge Commendation Officer <> [npc 15734] 61.1,77.0: vendor
- Lunar Festival Vendor <> [npc 15898] 29.9,14.2: vendor
- Tamelyn Aldridge <Supply Officer> [npc 214099] 24.4,67.4: vendor
- Wulmort Jinglepocket <Smokywood Pastures> [npc 216902] 32.4,67.4: vendor
- Deliana <> [npc 230319] 43.6,52.6: vendor
- Ironforge Guard <> [npc 230565] 42.4,53.8: vendor
- Eldrun Stormbreaker <Shaman Trainer> [npc 258098] 47.1,13.8: trainer
- Granny Finespindle <Leatherworking Recipes> [npc 258306] 39.2,33.6: vendor
- Ellie Stonebrow <Tailoring Recipes> [npc 258548] 43.5,27.9: vendor
- High Priestess Mims <Priest Trainer> [npc 258785] 24.6,10.0: trainer
- Sean Guardoff <Darkspear Islands Battlemaster> [npc 263643] 70.3,88.8: battlemaster
- Donovan Steelbeard <Barber> [npc 277037] 26.7,50.3: barber
