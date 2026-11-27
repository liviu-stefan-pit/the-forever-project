# Hillsbrad Foothills: Alliance + neutral quests (23)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 98059 Hillsbrad's Hoard  (L27 req23, 2200 xp, F)
  - start: Captain McManus [npc 251493] @ Hillsbrad Foothills 46.4,50.2
  - end:   Captain McManus [npc 251493] @ Hillsbrad Foothills 46.4,50.2
  - text: Place the Sealed Company Request you were given on the bookkeeping table within Hillsbrad's town hall.

## 98071 Brewer's Trade  (L27 req23, 2200 xp, F)
  - start: Brewmeister Bilger [npc 2705] @ Hillsbrad Foothills 52.1,58.7
  - end:   Brewmeister Bilger [npc 2705] @ Hillsbrad Foothills 52.1,58.7
  - text: Deliver the bottles of Fallrook Varietal to Dun Garok in southeast Hillsbrad Foothills, and bring back a sack of their Homebrew Hops.

## 536 Down the Coast  (L30 req25, 1850 xp)
  - start: Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - end:   Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - next=559
  - text: Kill 10 Torn Fin Tidehunters and 10 Torn Fin Oracles for Lieutenant Farren Orinelle in Southshore.
  - objectives:
    1. kill 10x Torn Fin Tidehunter <- Torn Fin Tidehunter [npc 2377] L31-32 ~Hillsbrad Foothills 43,69 (20 spawns)
    2. kill 10x Torn Fin Oracle <- Torn Fin Oracle [npc 2376] L30-31 ~Hillsbrad Foothills 42,68 (20 spawns)

## 555 Soothing Turtle Bisque  (L31 req28, 2500 xp)
  - start: Chef Jessen [npc 2430] @ Hillsbrad Foothills 51.9,58.7
  - end:   Chef Jessen [npc 2430] @ Hillsbrad Foothills 51.9,58.7
  - exclusiveTo=[7321]
  - text: Bring 10 pieces of Turtle Meat and some Soothing Spices to Chef Jessen in Southshore.
  - objectives:
    1. item 10x Turtle Meat <- Snapjaw [npc 2408] L29-31 ~Hillsbrad Foothills 64,36 (16 spawns); Saltwater Snapjaw [npc 2505] L49-50 ~The Hinterlands 81,59 (63 spawns); Sparkleshell Tortoise [npc 4142] L30-31 ~Thousand Needles 76,58 (22 spawns); Sparkleshell Snapper [npc 4143] L34-35 ~Thousand Needles 82,65 (29 spawns)
    2. item 1x Soothing Spices <- ?

## 559 Farren's Proof  (L32 req25, 2550 xp)
  - start: Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - end:   Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - pre(any)=[536], next=560
  - text: Collect 10 Murloc Heads from the murlocs on the Western Strand for Lieutenant Farren Orinelle in Southshore.
  - objectives:
    1. item 10x Murloc Head <- Torn Fin Muckdweller [npc 2374] L28-29 ~Hillsbrad Foothills 27,71 (21 spawns); Torn Fin Coastrunner [npc 2375] L29-30 ~Hillsbrad Foothills 28,71 (31 spawns); Torn Fin Oracle [npc 2376] L30-31 ~Hillsbrad Foothills 42,68 (20 spawns); Torn Fin Tidehunter [npc 2377] L31-32 ~Hillsbrad Foothills 43,69 (20 spawns)

## 560 Farren's Proof  (L32 req25, 255 xp)
  - start: Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - end:   Marshal Redpath [npc 2263] @ Hillsbrad Foothills 49.5,58.7
  - pre(any)=[559], next=561
  - text: Deliver the sack of murloc heads to Marshall Redpath in Southshore.

## 561 Farren's Proof  (L32 req25, 255 xp)
  - start: Marshal Redpath [npc 2263] @ Hillsbrad Foothills 49.5,58.7
  - end:   Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - pre(any)=[560], next=562
  - text: Speak with Lieutenant Farren Orinelle in Southshore.

## 562 Stormwind Ho!  (L32 req25, 1950 xp)
  - start: Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - end:   Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - pre(any)=[561], next=563
  - text: Kill 10 Daggerspine Shorehunters and 10 Daggerspine Sirens for Lieutenant Farren Orinelle in Southshore.
  - objectives:
    1. kill 10x Daggerspine Shorehunter <- Daggerspine Shorehunter [npc 2369] L30-31 ~Hillsbrad Foothills 57,70 (17 spawns)
    2. kill 10x Daggerspine Siren <- Daggerspine Siren [npc 2371] L31-32 ~Hillsbrad Foothills 57,69 (19 spawns)

## 563 Reassignment  (L32 req25, 3200 xp)
  - start: Lieutenant Farren Orinelle [npc 2228] @ Hillsbrad Foothills 51.5,58.4
  - end:   Major Samuelson [npc 2439] @ Stormwind City 75.8,36.7
  - pre(any)=[562]
  - text: Deliver Farren's report to Major Samuelson in Stormwind Keep.

## 659 Hints of a New Plague?  (L33 req30, 1300 xp)
  - start: Phin Odelic [npc 2711] @ Hillsbrad Foothills 50.4,59.0
  - end:   Quae [npc 2712] @ Arathi Highlands 60.2,53.9
  - next=658
  - text: Find Quae and Kinelory near the Go'Shek Farm in the Arathi Highlands.

## 564 Costly Menace  (L34 req30, 2700 xp)
  - start: Darren Malvew [npc 2382] @ Hillsbrad Foothills 52.4,56.0
  - end:   Darren Malvew [npc 2382] @ Hillsbrad Foothills 52.4,56.0
  - text: Darren Malvew of Southshore wants you to kill 8 Mountain Lions and 10 Hulking Mountain Lions.
  - objectives:
    1. kill 8x Mountain Lion <- Mountain Lion [npc 2406] L32-33 ~Hillsbrad Foothills 39,25 (1 spawns)
    2. kill 1x Hulking Mountain Lion <- Hulking Mountain Lion [npc 2407] L33-34 ~Alterac Mountains 55,52 (27 spawns)

## 565 Bartolo's Yeti Fur Cloak  (L34 req29, 2700 xp)
  - start: Bartolo Ginsetti [npc 2438] @ Hillsbrad Foothills 49.4,55.5
  - end:   Bartolo Ginsetti [npc 2438] @ Hillsbrad Foothills 49.4,55.5
  - text: Bring Bartolo Ginsetti of Southshore a Bolt of Wool, a Hillman's Cloak, Fine Thread and 10 clumps of Yeti Fur.
  - objectives:
    1. item 1x Bolt of Woolen Cloth <- Tattered Chest [object 2847]; Battered Chest [object 2849] ~Silverpine Forest 49,47 (88 spawns); Solid Chest [object 2850] ~Hillsbrad Foothills 77,39 (4 spawns); Solid Chest [object 2852] ~Hillsbrad Foothills 46,66 (6 spawns)
    2. item 1x Fine Thread <- ?
    3. item 1x Hillman's Cloak <- ?
    4. item 1x Yeti Fur <- Cave Yeti [npc 2248] L30-31 ~Hillsbrad Foothills 45,31 (17 spawns); Ferocious Yeti [npc 2249] L31-32 ~Hillsbrad Foothills 44,29 (17 spawns); Mountain Yeti [npc 2250] L32-33 ~Alterac Mountains 35,68 (18 spawns); Giant Yeti [npc 2251] L33-34 ~Alterac Mountains 36,58 (34 spawns)

## 657 Hints of a New Plague?  (L36 req30, ? xp)
  - start: Quae [npc 2712] @ Arathi Highlands 60.2,53.9
  - end:   Kinelory [npc 2713] @ Arathi Highlands 60.2,53.9
  - pre(any)=[658], next=660
  - text: Speak to Kinelory.

## 658 Hints of a New Plague?  (L36 req30, 2800 xp)
  - start: Quae [npc 2712] @ Arathi Highlands 60.2,53.9
  - end:   Quae [npc 2712] @ Arathi Highlands 60.2,53.9
  - pre(any)=[659], next=657
  - text: Find the Forsaken Courier and bring back her Sealed Folder to Quae near the Go'Shek Farm.
  - objectives:
    1. item 1x Sealed Folder <- Forsaken Courier [npc 2714] L35-35 ~Arathi Highlands 52,62 (1 spawns); Alterac Granite [object 2714] ~Hillsbrad Foothills 44,29 (6 spawns)

## 660 Hints of a New Plague?  (L37 req30, 2850 xp)
  - start: Kinelory [npc 2713] @ Arathi Highlands 60.2,53.9
  - end:   Quae [npc 2712] @ Arathi Highlands 60.2,53.9
  - pre(any)=[657], next=661
  - text: Protect Kinelory until she returns to Quae.

## 661 Hints of a New Plague?  (L37 req30, 3550 xp)
  - start: Quae [npc 2712] @ Arathi Highlands 60.2,53.9
  - end:   Phin Odelic [npc 2711] @ Hillsbrad Foothills 50.4,59.0
  - pre(any)=[660]
  - text: Find Phin Odelic in Southshore.

## 95787 Take Two With Water  (L40 req30, ? xp, F)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - pre(any)=[95786]
  - text: Use the hide and charcoal to create rubbings of the tablets found in the Drowned City.
  - objectives:
    1. item 1x The First Tablet of I'lalai <- object 642943 [object 642943]
    2. item 1x The Second Tablet of I'lalai <- object 642944 [object 642944]
    3. item 1x The Third Tablet of I'lalai <- object 642945 [object 642945]
    4. item 1x The Fourth Tablet of I'lalai <- object 642946 [object 642946]

## 95788 Magics of the Drowned City  (L40 req30, ? xp, F)
  - start: Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - end:   Loremaster Dibbs [npc 2277] @ Hillsbrad Foothills 50.6,57.1
  - pre(any)=[95786]
  - text: Collect 5 I'lalai Fetishes from trolls in the Drowned City.
  - objectives:
    1. item 5x I'lalai Fetish <- Risen Sentry [npc 258792] LNone-None; Profane Necromancer [npc 263196] LNone-None; Undying Offering [npc 263899] LNone-None

## 99326 Your First Horse  (L40 req40, ? xp, F, races=Human)
  - start: ?
  - end:   ?
  - exclusiveTo=[95511, 96982, 96989, 96994, 96996, 96997, 97017, 97045, 97046, 97171, 97446, 98166]
  - text: Inspect the riding horses to choose your first mount.

## 81944 A Newly Discovered Purpose...  (L53 req45, ? xp, F, class=Paladin, sort=PALADIN)
  - start: Brave Stonetorch [npc 214529] @ Hillsbrad Foothills 67.5,14.9
  - end:   Brave Stonetorch [npc 214529] @ Hillsbrad Foothills 67.5,14.9

## 1658 Crashing the Wickerman Festival  (L60 req25, 6600 xp, sort=SEASONAL)
  - start: Sergeant Hartman [npc 15199] @ Hillsbrad Foothills 50.0,57.4
  - end:   Sergeant Hartman [npc 15199] @ Hillsbrad Foothills 50.0,57.4
  - text: Locate the Forsaken's Wickerman Festival in Tirisfal Glade. Return to Sergeant Hartman in Southshore once you've done so.

## 7645 Manna-Enriched Horse Feed  (L60 req60, 660 xp, races=Human/Dwarf, class=Paladin, sort=PALADIN)
  - start: Merideth Carlson [npc 2357] @ Hillsbrad Foothills 52.2,55.5
  - end:   Merideth Carlson [npc 2357] @ Hillsbrad Foothills 52.2,55.5
  - text: Retrieve 20 Enriched Manna Biscuits - the key ingredient in making Manna-Enriched Horse Feed - for Merideth Carlson at Southshore in the Hillsbrad Foothills. The Argent Dawn is known as the sole purveyor of the biscuits.
  - text: You also need to give her 50 gold to soothe her ruffled sensibilities.
  - objectives:
    1. item 20x Enriched Manna Biscuit <- ?

## 8373 The Power of Pine  (L60 req25, 1650 xp, sort=SEASONAL)
  - start: Sergeant Hartman [npc 15199] @ Hillsbrad Foothills 50.0,57.4
  - end:   Sergeant Hartman [npc 15199] @ Hillsbrad Foothills 50.0,57.4
  - text: Use a Stink Bomb Cleaner to remove any Forsaken Stink Bomb that's been dropped on Southshore. Return to Sergeant Hartman in Southshore when you're done.
  - objectives:
    1. object 1x Forsaken Stink Bomb <- Forsaken Stink Bomb [object 180449] ~Hillsbrad Foothills 50,57 (4 spawns)

# Service NPCs

- Hillsbrad Tailor <> [npc 2264] 36.8,44.3: trainer, vendor
- Hillsbrad Apprentice Blacksmith <> [npc 2265] 32.6,45.1: vendor
- Innkeeper Anderson <Innkeeper> [npc 2352] 51.2,58.9: innkeeper, vendor
- Merideth Carlson <Horse Breeder> [npc 2357] 52.2,55.5: vendor
- Neema <Waitress> [npc 2364] 51.1,59.2: vendor
- Bront Coldcleave <Butcher> [npc 2365] 48.8,57.2: vendor
- Barkeep Kelly <Bartender> [npc 2366] 51.6,58.6: vendor
- Donald Rabonne <Fisherman> [npc 2367] 50.8,61.0: trainer
- Nandar Branson <Alchemy Supplies> [npc 2380] 50.9,57.1: vendor
- Micha Yance <Trade Goods> [npc 2381] 48.9,55.0: vendor
- Lindea Rabonne <Tackle and Bait> [npc 2383] 50.6,61.0: vendor
- Blacksmith Verringtan <> [npc 2404] 32.1,44.4: repair, vendor
- Darla Harris <Gryphon Master> [npc 2432] 49.3,52.3: flightMaster
- Kris Legace <Freewheeling Tradeswoman> [npc 3536] 80.1,38.9: repair, vendor
- Zixil <Merchant Supreme> [npc 3537] 55.4,34.7: repair, vendor
- Hal McAllister <Fish Merchant> [npc 3540] 49.9,62.4: vendor
- Sarah Raycroft <General Goods> [npc 3541] 49.1,55.1: vendor
- Jaysin Lanyda <Poisons & Reagents> [npc 3542] 50.8,59.0: vendor
- Robert Aebischer <Superior Armorsmith> [npc 3543] 51.2,57.0: repair, vendor
- Spirit Healer <> [npc 6491] 51.8,52.5: spiritHealer
- Wesley <Stable Master> [npc 9978] 50.4,58.8: stableMaster
- Hunter Moore <Fisherman> [npc 255877] 54.2,80.3: trainer
