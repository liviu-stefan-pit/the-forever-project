# Elwynn Forest: Alliance + neutral quests (136)

Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.
Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).

## 16 Give Gerard a Drink  (L1 req1, ? xp, repeatable)
  - start: Gerard Tiller [npc 255] @ Elwynn Forest 43.1,85.5
  - end:   Gerard Tiller [npc 255] @ Elwynn Forest 43.1,85.5
  - objectives:
    1. item 1x Refreshing Spring Water <- ?

## 783 A Threat Within  (L1 req1, 40 xp)
  - start: Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - end:   Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - next=7
  - text: Speak with Marshal McBride.

## 3100 Simple Letter  (L1 req1, 40 xp, races=Human, class=Warrior, sort=WARRIOR)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Llane Beshere [npc 911] @ Elwynn Forest 50.2,42.3
  - pre(any)=[7]
  - text: Read the Simple Letter and speak to Llane Beshere in Northshire Abbey.

## 3101 Consecrated Letter  (L1 req1, 40 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Brother Sammuel [npc 925] @ Elwynn Forest 50.4,42.1
  - pre(any)=[7]
  - text: Read the Consecrated Letter and speak to Brother Sammuel in Northshire Abbey.

## 3102 Encrypted Letter  (L1 req1, 40 xp, races=Human, class=Rogue, sort=ROGUE)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Jorik Kerridan [npc 915] @ Elwynn Forest 50.3,39.9
  - pre(any)=[7]
  - text: Read the Encrypted Letter and speak to Jorik Kerridan in the stable behind Northshire Abbey.

## 3103 Hallowed Letter  (L1 req1, 40 xp, races=Human, class=Priest, sort=PRIEST)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Priestess Anetta [npc 375] @ Elwynn Forest 49.8,39.5
  - pre(any)=[7]
  - text: Read the Hallowed Letter and speak to Priestess Anetta in Northshire Abbey.

## 3104 Glyphic Letter  (L1 req1, 40 xp, races=Human, class=Mage, sort=MAGE)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Khelden Bremen [npc 198] @ Elwynn Forest 49.7,39.4
  - pre(any)=[7]
  - text: Read the Glyphic Letter and speak to Khelden Bremen inside Northshire Abbey.

## 3105 Tainted Letter  (L1 req1, 40 xp, races=Human, class=Warlock, sort=WARLOCK)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Drusilla La Salle [npc 459] @ Elwynn Forest 49.9,42.6
  - pre(any)=[7]
  - text: Read the Tainted Letter and speak to Drusilla La Salle next to Northshire Abbey.

## 5805 Welcome!  (L1 req1, ? xp, races=Human)
  - start: item Northshire Gift Voucher [14646] (drops from ?)
  - end:   Merissa Stilwell [npc 11940] @ Elwynn Forest 47.4,41.9
  - text: Bring the Northshire Gift Voucher to Merissa Stilwell.

## 7677 White Stallion Exchange  (L1 req60, ? xp, repeatable)
  - start: Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - end:   Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - text: If you bring me your white stallion, I'll trade you for one from the new herd. The new horse will be just as fast as your old one, but have a different look to it. You can look at the swift steeds here to see what it will look like.
  - text: MUST PAY 500 Gold too....
  - objectives:
    1. item 1x White Stallion Bridle <- ?

## 7678 Palomino Exchange  (L1 req60, ? xp, repeatable)
  - start: Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - end:   Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - objectives:
    1. item 1x Palomino Bridle <- ?

## 91736 Applejack Still  (L1 req1, ? xp, F, repeatable)
  - start: Applejack Still [object 562131] @ Elwynn Forest 24.6,58.0
  - end:   Applejack Still [object 562131] @ Elwynn Forest 24.6,58.0
  - objectives:
    1. item 1x Shiny Red Apple <- Kobold Vermin [npc 6] L1-2 ~Elwynn Forest 49,36 (31 spawns); Defias Thug [npc 38] L3-4 ~Elwynn Forest 54,47 (72 spawns); Kobold Miner [npc 40] L6-7 ~Elwynn Forest 53,65 (51 spawns); Mine Spider [npc 43] L7-9 ~Elwynn Forest 61,47 (8 spawns)

## 92479 A Scribbled Letter  (L1 req1, 40 xp, F, races=Human, class=Hunter, sort=WARRIOR)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Tordrin Sternblade [npc 248415] @ Elwynn Forest 51.2,40.8
  - pre(any)=[7]
  - text: Read the Scribbled Letter and speak to Tordrin Stemblade in Northshire Abbey.

## 7 Kobold Camp Cleanup  (L2 req1, 170 xp)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - pre(any)=[783], next=15
  - text: Kill 10 Kobold Vermin, then return to Marshal McBride.
  - objectives:
    1. kill 10x Kobold Vermin <- Kobold Vermin [npc 6] L1-2 ~Elwynn Forest 49,36 (31 spawns)

## 33 Wolves Across the Border  (L2 req1, 170 xp)
  - start: Eagan Peltskinner [npc 196] @ Elwynn Forest 48.9,40.2
  - end:   Eagan Peltskinner [npc 196] @ Elwynn Forest 48.9,40.2
  - text: Bring 8 pieces of Tough Wolf Meat to Eagan Peltskinner outside Northshire Abbey.
  - objectives:
    1. item 8x Tough Wolf Meat <- Timber Wolf [npc 69] L2-2 ~Elwynn Forest 49,40 (26 spawns); Young Wolf [npc 299] L1-1 ~Elwynn Forest 46,47 (29 spawns); Ragged Timber Wolf [npc 704] L2-2 ~Dun Morogh 27,77 (16 spawns); Ragged Young Wolf [npc 705] L1-1 ~Dun Morogh 29,74 (51 spawns)

## 5261 Eagan Peltskinner  (L2 req1, 85 xp)
  - start: Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - end:   Eagan Peltskinner [npc 196] @ Elwynn Forest 48.9,40.2
  - pre(any)=[783], next=33, breadcrumbFor=33
  - text: Speak with Eagan Peltskinner.

## 91741 Nibbled-On Book  (L2 req1, 85 xp, F)
  - start: item Nibbled-On Book [247834] (drops from Kobold Vermin, Kobold Laborer, Kobold Worker)
  - end:   Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - next=92124
  - text: Return the book to Brother Paxton.

## 91743 Rascally Rodents  (L2 req1, 170 xp, F)
  - start: Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - end:   Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - pre(any)=[92124], next=91745
  - text: Retrieve 8 Stolen Books from kobolds in Northshire Valley and return them to Brother Paxton.
  - objectives:
    1. item 8x Stolen Book <- Kobold Vermin [npc 6] L1-2 ~Elwynn Forest 49,36 (31 spawns); Kobold Laborer [npc 80] L3-4 ~Elwynn Forest 49,28 (25 spawns); Kobold Worker [npc 257] L3-3 ~Elwynn Forest 49,35 (45 spawns); Kobold Laborer [npc 246249] LNone-None

## 92124 Book Inventory  (L2 req1, 15 xp, F)
  - start: Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - end:   Daniel [npc 247229] @ Elwynn Forest 49.5,40.7
  - pre(any)=[91741], next=91743
  - text: Speak to Daniel, Brother Paxton's assistant in the library.

## 15 Investigate Echo Ridge  (L3 req1, 250 xp)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - pre(any)=[7], next=21
  - text: Kill 10 Kobold Workers, then report back to Marshal McBride.
  - objectives:
    1. kill 10x Kobold Worker <- Kobold Worker [npc 257] L3-3 ~Elwynn Forest 49,35 (45 spawns)

## 91745 Mining Consultant  (L3 req1, 25 xp, F)
  - start: Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - end:   Kelsey Fargo [npc 247226] @ Elwynn Forest 47.2,32.2
  - pre(any)=[91743], next=91752
  - text: Talk to Kelsey Fargo outside the Echo Ridge Mine in Northshire Valley.

## 91752 The Big Picture  (L3 req1, 315 xp, F)
  - start: Kelsey Fargo [npc 247226] @ Elwynn Forest 47.2,32.2
  - end:   Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - pre(any)=[91745], next=91758
  - text: Retrieve a Sack of "Picture" Books from Shinyfinder Narf. Bring the sack to Marshal McBride just inside Northshire's Abbey.
  - objectives:
    1. item 1x Sack of "Picture" Books <- Shinyfinder Narf [npc 248362] L3-3 ~Elwynn Forest 49,28 (1 spawns)

## 18 Brotherhood of Thieves  (L4 req2, 355 xp)
  - start: Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - end:   Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - pre(any)=[783]
  - text: Bring 12 Red Burlap Bandanas to Deputy Willem outside the Northshire Abbey.
  - objectives:
    1. item 12x Red Burlap Bandana <- Defias Thug [npc 38] L3-4 ~Elwynn Forest 54,47 (72 spawns)

## 1598 The Stolen Tome  (L4 req1, 355 xp, class=Warlock, sort=WARLOCK)
  - start: Drusilla La Salle [npc 459] @ Elwynn Forest 49.9,42.6
  - end:   Drusilla La Salle [npc 459] @ Elwynn Forest 49.9,42.6
  - exclusiveTo=[1599]
  - text: Retrieve the Powers of the Void for Drusilla La Salle.
  - objectives:
    1. item 1x Powers of the Void <- Stolen Books [object 83763] ~Elwynn Forest 57,44 (1 spawns)

## 3903 Milly Osworth  (L4 req2, 35 xp)
  - start: Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - end:   Milly Osworth [npc 9296] @ Elwynn Forest 50.7,39.4
  - pre(any)=[18], next=3904, breadcrumbFor=3904
  - text: Speak with Milly Osworth.

## 3904 Milly's Harvest  (L4 req2, 180 xp)
  - start: Milly Osworth [npc 9296] @ Elwynn Forest 50.7,39.4
  - end:   Milly Osworth [npc 9296] @ Elwynn Forest 50.7,39.4
  - pre(any)=[18], next=3905
  - text: Bring 8 crates of Milly's Harvest to Milly Osworth at Northshire Abbey.
  - objectives:
    1. item 1x Milly's Harvest <- Milly's Harvest [object 161557] ~Elwynn Forest 54,49 (40 spawns)

## 3905 Grape Manifest  (L4 req2, 355 xp)
  - start: Milly Osworth [npc 9296] @ Elwynn Forest 50.7,39.4
  - end:   Brother Neals [npc 952] @ Elwynn Forest 49.5,41.6
  - pre(any)=[3904]
  - text: Bring the Grape Manifest to Brother Neals in Northshire Abbey.

## 5623 In Favor of the Light  (L4 req5, 90 xp, races=Human, class=Priest, sort=PRIEST)
  - start: Priestess Anetta [npc 375] @ Elwynn Forest 49.8,39.5
  - end:   Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - next=5624, breadcrumbFor=5624
  - text: Speak to Priestess Josetta in Elwynn Forest.

## 5624 Garments of the Light  (L4 req5, 270 xp, races=Human, class=Priest, sort=PRIEST)
  - start: Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - end:   Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - text: Find Guard Roberts and heal his wounds using Lesser Heal (Rank 2). Afterwards, grant him Power Word: Fortitude and then return to Priestess Josetta in Goldshire.
  - objectives:
    1. kill 1x Guard Roberts <- Guard Roberts [npc 12423] L7-7 ~Elwynn Forest 48,68 (1 spawns)

## 91758 Follow That Kobold!  (L4 req1, 35 xp, F)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Tordrin Sternblade [npc 248415] @ Elwynn Forest 51.2,40.8
  - pre(any)=[91752], next=91772
  - text: Speak to Tordrin Sternblade near the stable behind Northshire's Abbey.

## 91772 Shhh! We're Hunting Kobolds  (L4 req1, 355 xp, F)
  - start: Tordrin Sternblade [npc 248415] @ Elwynn Forest 51.2,40.8
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - pre(any)=[91758], next=91775
  - text: Follow the kobold tracks and report to Marshal Dughan in Goldshire with your findings and the Kobold Tracking Kit.
  - objectives:
    1. object 1x Kobold Tracks <- Kobold Tracks [object 563442] ~Elwynn Forest 45,56 (13 spawns)

## 6 Bounty on Garrick Padfoot  (L5 req2, 335 xp)
  - start: Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - end:   Deputy Willem [npc 823] @ Elwynn Forest 48.2,42.9
  - pre(any)=[18]
  - text: Kill Garrick Padfoot and bring his head to Deputy Willem at Northshire Abbey.
  - objectives:
    1. item 1x Garrick's Head <- Garrick Padfoot [npc 103] L5-5 ~Elwynn Forest 58,48 (1 spawns)

## 21 Skirmish at Echo Ridge  (L5 req1, 450 xp)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - pre(any)=[15], next=54
  - text: Kill 12 Kobold Laborers, then return to Marshal McBride at Northshire Abbey.
  - objectives:
    1. kill 12x Kobold Laborer <- Kobold Laborer [npc 80] L3-4 ~Elwynn Forest 49,28 (25 spawns)

## 54 Report to Goldshire  (L5 req1, 225 xp)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - pre(any)=[21]
  - text: Take Marshal McBride's Documents to Marshal Dughan in Goldshire.

## 2158 Rest and Relaxation  (L5 req1, 110 xp)
  - start: Falkhaan Isenstrider [npc 6774] @ Elwynn Forest 45.6,47.7
  - end:   Innkeeper Farley [npc 295] @ Elwynn Forest 43.8,65.8
  - text: Speak with Innkeeper Farley at the Lion's Pride Inn.

## 84 Back to Billy  (L6 req5, 135 xp)
  - start: "Auntie" Bernice Stonefield [npc 246] @ Elwynn Forest 34.5,84.2
  - end:   Billy Maclure [npc 247] @ Elwynn Forest 43.1,85.7
  - pre(any)=[86], next=87
  - text: Bring the Pork Belly Pie to Billy Maclure at the Maclure Vineyards.

## 85 Lost Necklace  (L6 req5, 135 xp)
  - start: "Auntie" Bernice Stonefield [npc 246] @ Elwynn Forest 34.5,84.2
  - end:   Billy Maclure [npc 247] @ Elwynn Forest 43.1,85.7
  - next=86
  - text: Speak with Billy Maclure.

## 86 Pie for Billy  (L6 req5, 405 xp)
  - start: Billy Maclure [npc 247] @ Elwynn Forest 43.1,85.7
  - end:   "Auntie" Bernice Stonefield [npc 246] @ Elwynn Forest 34.5,84.2
  - pre(any)=[85], next=84
  - text: Bring 4 Chunks of Boar Meat to Auntie Bernice Stonefield at the Stonefield's Farm.
  - objectives:
    1. item 1x Chunk of Boar Meat <- Stonetusk Boar [npc 113] L5-6 ~Elwynn Forest 38,83 (51 spawns); Longsnout [npc 119] L10-11 ~Elwynn Forest 25,84 (9 spawns); Goretusk [npc 157] L14-15 ~Westfall 44,54 (54 spawns); Princess [npc 330] L9-9 ~Elwynn Forest 70,79 (1 spawns)

## 106 Young Lovers  (L6 req5, 135 xp)
  - start: Maybell Maclure [npc 251] @ Elwynn Forest 43.1,89.6
  - end:   Tommy Joe Stonefield [npc 252] @ Elwynn Forest 29.8,86.0
  - next=111
  - text: Give Maybell's Love Letter to Tommy Joe Stonefield.

## 107 Note to William  (L6 req5, 135 xp)
  - start: Gramma Stonefield [npc 248] @ Elwynn Forest 34.9,83.9
  - end:   William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - pre(any)=[111], next=112
  - text: Take Gramma Stonefield's Note to William Pestle.

## 111 Speak with Gramma  (L6 req5, 135 xp)
  - start: Tommy Joe Stonefield [npc 252] @ Elwynn Forest 29.8,86.0
  - end:   Gramma Stonefield [npc 248] @ Elwynn Forest 34.9,83.9
  - pre(any)=[106], next=107
  - text: Speak with Gramma Stonefield.

## 91775 Book Return  (L6 req1, 680 xp, F)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - pre(any)=[91772], next=91777
  - text: Find 6 Lost Books and "Fun with Elementals" and return them to Marshal Dughan.
  - objectives:
    1. item 1x Picture Book: Fun with Elementals <- Nimsy [npc 248464] L6-6 ~Elwynn Forest 42,80 (1 spawns)
    2. item 6x Lost Book <- Kobold Miner [npc 40] L6-7 ~Elwynn Forest 53,65 (51 spawns); Kobold Tunneler [npc 475] L5-6 ~Elwynn Forest 39,82 (39 spawns)

## 95998 The Great Outdoors  (L6 req4, 405 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - exclusiveTo=[96101, 96604, 96605, 96606, 96607, 96608]
  - text: Sit near Sam's Basic Campfire and wait until you receive the Boosted Rest buff.
  - objectives:
    1. object 1x Basic Campfire <- Basic Campfire [object 460003] ~Elwynn Forest 45,63 (1 spawns)
    2. object 1x Basic Campfire <- Basic Campfire [object 460003] ~Elwynn Forest 45,63 (1 spawns)

## 96626 Camping 101: Cooking  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Tomas [npc 1430] @ Elwynn Forest 44.4,66.0
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96629, 96634, 96646, 96655, 96658, 96661]
  - text: Speak with Tomas in Goldshire to learn to become a cook.
  - objectives:
    1. kill 1x Tomas <- Tomas [npc 1430] L10-10 ~Elwynn Forest 44,66 (1 spawns)

## 96627 The Adventurer  (L6 req4, 405 xp, F, sort=CAMPING)
  - start: Marshal McBride [npc 197] @ Elwynn Forest 48.9,41.6
  - end:   Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - pre(any)=[21], next=95998, breadcrumbFor=95998, exclusiveTo=[96628, 96630, 96638, 96652, 96656, 96659]
  - text: Speak to Sam Sarsparilla near Goldshire.

## 97915 Camping 101: Alchemy  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Alchemist Mallory [npc 1215] @ Elwynn Forest 39.8,48.2
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96045, 97899, 97927, 97938, 97951, 97963]
  - text: Speak with Alchemist Mallory in Elwynn Forest near Stormwind to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Alchemist Mallory <- Alchemist Mallory [npc 1215] L26-26 ~Elwynn Forest 40,48 (1 spawns)

## 97916 Camping 101: Blacksmithing  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Smith Argus [npc 514] @ Elwynn Forest 41.7,65.5
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96044, 97900, 97928, 97939, 97952, 97964]
  - text: Speak with Smith Argus in Goldshire to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Smith Argus <- Smith Argus [npc 514] L24-24 ~Elwynn Forest 42,66 (1 spawns)

## 97917 Camping 101: Enchanting  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Betty Quin [npc 11068] @ Stormwind City 53.0,73.7
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96059, 97901, 97929, 97940, 97953, 98284, 98286]
  - text: Speak with Betty Quin in Stormwind to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Betty Quin <- Betty Quin [npc 11068] L25-25 ~Stormwind City 53,74 (1 spawns)

## 97918 Camping 101: Engineering  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Sprite Jumpsprocket [npc 11026] @ Stormwind City 61.9,30.6
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96058, 97902, 97930, 97941, 97954, 98285, 98287]
  - text: Speak with Sprite Jumpsprocket in Stormwind to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Sprite Jumpsprocket <- Sprite Jumpsprocket [npc 11026] L24-24 ~Stormwind City 62,31 (1 spawns)

## 97919 Camping 101: First Aid  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Michelle Belle [npc 2329] @ Elwynn Forest 43.4,65.5
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96047, 97903, 97931, 97942, 97955, 97965]
  - text: Speak with Michelle Belle in Goldshire to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Michelle Belle <- Michelle Belle [npc 2329] L11-11 ~Elwynn Forest 43,66 (1 spawns)

## 97920 Camping 101: Fishing  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Lee Brown [npc 1651] @ Elwynn Forest 47.6,62.3
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96050, 97904, 97932, 97943, 97956, 97967]
  - text: Speak with Lee Brown near Goldshire to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Lee Brown <- Lee Brown [npc 1651] L8-8 ~Elwynn Forest 48,62 (1 spawns)

## 97921 Camping 101: Herbalism  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Herbalist Pomeroy [npc 1218] @ Elwynn Forest 40.0,48.4
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96055, 97905, 97933, 97944, 97957, 97968]
  - text: Speak with Herbalist Pomeroy in Elwynn Forest to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Herbalist Pomeroy <- Herbalist Pomeroy [npc 1218] L10-10 ~Elwynn Forest 40,48 (1 spawns)

## 97922 Camping 101: Leatherworking  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Adele Fielder [npc 1632] @ Elwynn Forest 46.4,62.0
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96031, 97906, 97934, 97946, 97958, 97969]
  - text: Speak with Adele Fielder in Goldshire to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Adele Fielder <- Adele Fielder [npc 1632] L22-22 ~Elwynn Forest 46,62 (1 spawns)

## 97923 Camping 101: Mining  (L6 req4, 270 xp, F, races=NightElf/Gnome, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Gelman Stonehand [npc 5513] @ Stormwind City 59.2,37.8
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96046, 97907, 97935, 97948, 97959, 97970]
  - text: Speak with Gelman Stonehand in Stormwind to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Gelman Stonehand <- Gelman Stonehand [npc 5513] L35-35 ~Stormwind City 59,38 (1 spawns)

## 97924 Camping 101: Skinning  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Helene Peltskinner [npc 6306] @ Elwynn Forest 46.2,62.2
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96056, 97908, 97936, 97949, 97960, 97971]
  - text: Speak with Helene Peltskinner in Goldshire to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Helene Peltskinner <- Helene Peltskinner [npc 6306] L12-12 ~Elwynn Forest 46,62 (1 spawns)

## 97925 Camping 101: Tailoring  (L6 req4, 270 xp, F, sort=CAMPING)
  - start: Sam Sarsaparilla [npc 263399] @ Elwynn Forest 44.9,63.4
  - end:   Eldrin [npc 1103] @ Elwynn Forest 79.2,69.0
  - pre(any)=[95998, 96101, 96604, 96605, 96606, 96607, 96608], exclusiveTo=[96057, 96102, 97937, 97950, 97961, 97972, 97973]
  - text: Speak with Eldrin in the Eastvale Logging Camp in Elwynn Forest to learn to craft a camping item for your profession once you have shown proficiency in your skill.
  - objectives:
    1. kill 1x Eldrin <- Eldrin [npc 1103] L22-22 ~Elwynn Forest 79,69 (1 spawns)

## 47 Gold Dust Exchange  (L7 req4, 630 xp)
  - start: Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - end:   Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - text: Bring 10 Gold Dust to Remy "Two Times" in Goldshire. Gold Dust is gathered from Kobolds in Elwynn Forest.
  - objectives:
    1. item 10x Gold Dust <- Kobold Miner [npc 40] L6-7 ~Elwynn Forest 53,65 (51 spawns); Goldtooth [npc 327] L8-8 ~Elwynn Forest 42,78 (1 spawns); Kobold Tunneler [npc 475] L5-6 ~Elwynn Forest 39,82 (39 spawns); Kobold Geomancer [npc 476] L7-8 ~Elwynn Forest 63,55 (8 spawns)

## 60 Kobold Candles  (L7 req3, 475 xp)
  - start: William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - end:   William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - next=61
  - text: Bring 8 Large Candles to William Pestle in Goldshire.
  - objectives:
    1. item 8x Large Candle <- Kobold Miner [npc 40] L6-7 ~Elwynn Forest 53,65 (51 spawns); Goldtooth [npc 327] L8-8 ~Elwynn Forest 42,78 (1 spawns); Kobold Tunneler [npc 475] L5-6 ~Elwynn Forest 39,82 (39 spawns); Kobold Geomancer [npc 476] L7-8 ~Elwynn Forest 63,55 (8 spawns)

## 61 Shipment to Stormwind  (L7 req3, 790 xp)
  - start: William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - end:   Morgan Pestle [npc 279] @ Stormwind City 63.2,74.4
  - pre(any)=[60]
  - text: Bring William's Shipment to Morgan Pestle in the Stormwind Trade District.

## 62 The Fargodeep Mine  (L7 req4, 475 xp)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - next=76
  - text: Explore the Fargodeep Mine, then return to Marshal Dughan in Goldshire.

## 112 Collecting Kelp  (L7 req5, 315 xp)
  - start: William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - end:   William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - pre(any)=[107], next=114
  - text: Bring 4 Crystal Kelp Fronds to William Pestle in Goldshire.
  - objectives:
    1. item 4x Crystal Kelp Frond <- Murloc [npc 285] L6-7 ~Elwynn Forest 54,67 (33 spawns); Murloc Streamrunner [npc 735] L6-7 ~Elwynn Forest 54,66 (20 spawns)

## 114 The Escape  (L7 req5, 790 xp)
  - start: William Pestle [npc 253] @ Elwynn Forest 43.3,65.7
  - end:   Maybell Maclure [npc 251] @ Elwynn Forest 43.1,89.6
  - pre(any)=[112]
  - text: Take the Invisibility Liquor to Maybell Maclure.

## 91732 Good Steel  (L7 req6, 315 xp, F)
  - start: Hagar Lowe [npc 248266] @ Elwynn Forest 82.5,63.8
  - end:   Hagar Lowe [npc 248266] @ Elwynn Forest 82.5,63.8
  - text: Collect 4 Mining Tools from Jasperlode Mine, then return to Hagar Lowe in Eastvale Logging Camp.
  - objectives:
    1. item 4x Mining Tools <- Mining Tools [object 562114] ~Elwynn Forest 61,52 (5 spawns)

## 91753 An Enchanting Lesson  (L7 req5, 475 xp, F)
  - start: Kitta Firewind [npc 11072] @ Elwynn Forest 64.9,70.7
  - end:   Kitta Firewind [npc 11072] @ Elwynn Forest 64.9,70.7
  - text: Kitta Firewind in the Tower of Azora wants you to collect 3 Luminous Residue.
  - text: Luminous Residue can be obtained by disenchanting Crude Wax Effigies dropped by Kobold Geomancers.
  - objectives:
    1. item 3x Luminous Residue <- ?

## 91777 Rare Books  (L7 req1, 790 xp, F)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Brother Paxton [npc 951] @ Elwynn Forest 49.6,40.4
  - pre(any)=[91775]
  - text: Recover "Geomancy for Curious Young Wizards" and "Arcane Explainer: Magical Stuff in Simple Words" and return them to Brother Paxton inside Northshire's Abbey.
  - objectives:
    1. item 1x Geomancy for Curious Young Wizards <- Geosculptor Yip [npc 248474] L7-7 ~Elwynn Forest 61,49 (1 spawns); Kobold Geomancer [npc 476] L7-8 ~Elwynn Forest 63,55 (8 spawns)
    2. item 1x Arcane Explainer: Magical Stuff in Simple Words <- Mother Fang [npc 471] L7-10 ~Elwynn Forest 62,48 (1 spawns); Kobold Geomancer [npc 476] L7-8 ~Elwynn Forest 63,55 (8 spawns)

## 99127 A Net Disaster  (L7 req4, 475 xp, F)
  - start: Jason Mathers [npc 383] @ Elwynn Forest 47.5,62.2
  - end:   Jason Mathers [npc 383] @ Elwynn Forest 47.5,62.2
  - next=99128
  - text: Check the fishing traps in Crystal Lake.
  - objectives:
    1. item 1x Half-Eaten Fish <- Fishing Trap [object 694772] ~Elwynn Forest 48,64 (14 spawns)

## 99128 Slimy Menace  (L7 req4, 630 xp, F)
  - start: Jason Mathers [npc 383] @ Elwynn Forest 47.5,62.2
  - end:   Jason Mathers [npc 383] @ Elwynn Forest 47.5,62.2
  - pre(any)=[99127], next=99129
  - text: Kill 7 Murlocs and 4 Murloc Streamrunner at Crystal Lake, then return to Jason Mathers.
  - objectives:
    1. kill 7x Murloc <- Murloc [npc 285] L6-7 ~Elwynn Forest 54,67 (33 spawns)
    2. kill 7x Murloc Streamrunner <- Murloc Streamrunner [npc 735] L6-7 ~Elwynn Forest 54,66 (20 spawns)

## 99129 A Man About a Murloc  (L7 req4, 65 xp, F)
  - start: Jason Mathers [npc 383] @ Elwynn Forest 47.5,62.2
  - end:   Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - pre(any)=[99128], next=99130
  - text: Speak with Remy "Two Times" about Jason's murloc problems.

## 99130 An Enticing Offer  (L7 req4, 630 xp, F)
  - start: Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - end:   Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - pre(any)=[99129], next=99131
  - text: Collect 6 Vials of Animal Blood and 18 Duskweed Petals for murloc bait, then return to Remy "Two Times" in Goldshire.
  - objectives:
    1. item 1x Vial of Animal Blood <- Stonetusk Boar [npc 113] L5-6 ~Elwynn Forest 38,83 (51 spawns); Young Forest Bear [npc 822] L8-9 ~Elwynn Forest 60,75 (136 spawns)
    2. item 1x Duskweed Petal <- Overgrown Duskweed [object 694855] ~Elwynn Forest 38,86 (21 spawns)

## 99131 Baited for Success  (L7 req4, 65 xp, F)
  - start: Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - end:   Jason Mathers [npc 383] @ Elwynn Forest 47.5,62.2
  - pre(any)=[99130]
  - text: Return to Jason Mathers.

## 99143 Bottles and Baubles  (L7 req4, 475 xp, F)
  - start: Lee Brown [npc 1651] @ Elwynn Forest 47.6,62.3
  - end:   Lee Brown [npc 1651] @ Elwynn Forest 47.6,62.3
  - text: Collect 6 pieces of shiny junk from the nearby Murloc camp.
  - objectives:
    1. item 1x Shiny Junk <- Junk Pile [object 694785] ~Elwynn Forest 56,67 (10 spawns)

## 87 Goldtooth  (L8 req5, 880 xp)
  - start: Billy Maclure [npc 247] @ Elwynn Forest 43.1,85.7
  - end:   "Auntie" Bernice Stonefield [npc 246] @ Elwynn Forest 34.5,84.2
  - pre(any)=[84]
  - text: Bring Bernice's Necklace to "Auntie" Bernice Stonefield at the Stonefield Farm.
  - objectives:
    1. item 1x Bernice's Necklace <- Goldtooth [npc 327] L8-8 ~Elwynn Forest 42,78 (1 spawns)

## 91723 Delicate Instruments  (L8 req6, 530 xp, F)
  - start: Hamish Bergwort [npc 248242] @ Elwynn Forest 65.1,69.8
  - end:   Hamish Bergwort [npc 248242] @ Elwynn Forest 65.1,69.8
  - next=91724
  - text: Kill 8 Kobold Geomancers in Jasperlode Mine, then return to Hamish Bergwort in the Tower of Azora.
  - objectives:
    1. kill 8x Kobold Geomancer <- Kobold Geomancer [npc 476] L7-8 ~Elwynn Forest 63,55 (8 spawns)

## 91751 Rough Wolf Pelts  (L8 req5, 700 xp, F)
  - start: Helene Peltskinner [npc 6306] @ Elwynn Forest 46.2,62.2
  - end:   Helene Peltskinner [npc 6306] @ Elwynn Forest 46.2,62.2
  - text: Skin wolves around Elwynn Forest to obtain 7 Rough Wolf Pelts, then deliver them to Helene Peltskinner near Goldshire.
  - objectives:
    1. item 7x Rough Wolf Pelt <- Prowler [npc 118] L9-10 ~Elwynn Forest 81,67 (83 spawns); Gray Forest Wolf [npc 1922] L7-8 ~Elwynn Forest 65,64 (56 spawns)

## 83 Red Linen Goods  (L9 req4, 780 xp)
  - start: Sara Timberlain [npc 278] @ Elwynn Forest 79.5,68.8
  - end:   Sara Timberlain [npc 278] @ Elwynn Forest 79.5,68.8
  - text: Bring 6 Red Linen Bandanas to Sara Timberlain at the Eastvale Logging Camp.
  - objectives:
    1. item 6x Red Linen Bandana <- Defias Bandit [npc 116] L8-9 ~Elwynn Forest 50,71 (57 spawns); Morgan the Collector [npc 473] L10-10 ~Elwynn Forest 71,81 (1 spawns); Defias Rogue Wizard [npc 474] L9-10 ~Elwynn Forest 64,55 (28 spawns); Defias Ambusher [npc 583] L8-9 ~Elwynn Forest 34,56 (1 spawns)

## 88 Princess Must Die!  (L9 req6, 780 xp)
  - start: Ma Stonefield [npc 244] @ Elwynn Forest 34.7,84.5
  - end:   Ma Stonefield [npc 244] @ Elwynn Forest 34.7,84.5
  - text: Kill Princess, grab her collar, then bring it back to Ma Stonefield at the Stonefield Farm.
  - objectives:
    1. item 1x Brass Collar <- Princess [npc 330] L9-9 ~Elwynn Forest 70,79 (1 spawns)

## 5545 A Bundle of Trouble  (L9 req5, 780 xp)
  - start: Supervisor Raelen [npc 10616] @ Elwynn Forest 81.4,66.1
  - end:   Supervisor Raelen [npc 10616] @ Elwynn Forest 81.4,66.1
  - text: Bring 8 Bundles of Wood to Raelen at the Eastvale Logging Camp.
  - objectives:
    1. item 8x Bundle of Wood <- Bundle of Wood [object 176793] ~Elwynn Forest 80,60 (29 spawns)

## 11 Riverpaw Gnoll Bounty  (L10 req6, 840 xp)
  - start: Deputy Rainer [npc 963] @ Elwynn Forest 24.2,74.5
  - end:   Deputy Rainer [npc 963] @ Elwynn Forest 24.2,74.5
  - pre(any)=[76]
  - text: Bring 8 Painted Gnoll Armbands to Deputy Rainer at the Barracks.
  - objectives:
    1. item 8x Painted Gnoll Armband <- Riverpaw Runt [npc 97] L8-9 ~Elwynn Forest 48,65 (26 spawns); Riverpaw Outrunner [npc 478] L9-10 ~Elwynn Forest 46,67 (58 spawns)

## 35 Further Concerns  (L10 req7, 420 xp)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - pre(any)=[40], next=37
  - text: Marshal Dughan wants you to speak with Guard Thomas.

## 37 Find the Lost Guards  (L10 req7, 210 xp)
  - start: Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - end:   A half-eaten body [object 55] @ Elwynn Forest 72.7,60.3
  - pre(any)=[35], next=45
  - text: Guard Thomas wants you to travel north up the river and search for the two lost guards, Rolf and Malakai.

## 39 Deliver Thomas' Report  (L10 req7, 1050 xp)
  - start: Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - pre(any)=[71], next=59
  - text: Report to Marshal Dughan in Goldshire.

## 40 A Fishy Peril  (L10 req7, 85 xp)
  - start: Remy "Two Times" [npc 241] @ Elwynn Forest 42.1,67.3
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - next=35
  - text: Remy "Two Times" wants you to speak with Marshal Dughan in Goldshire.

## 45 Discover Rolf's Fate  (L10 req7, 420 xp)
  - start: A half-eaten body [object 55] @ Elwynn Forest 72.7,60.3
  - end:   Rolf's corpse [object 56] @ Elwynn Forest 79.8,55.5
  - pre(any)=[37], next=71
  - text: Search the murloc village for Rolf, or signs of his death.

## 46 Bounty on Murlocs  (L10 req7, 840 xp)
  - start: Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - end:   Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - pre(any)=[39]
  - text: Bring 8 Torn Murloc Fins to Guard Thomas at the east Elwynn bridge.
  - objectives:
    1. item 8x Torn Murloc Fin <- Murloc Forager [npc 46] L9-10 ~Elwynn Forest 75,64 (58 spawns); Murloc Lurker [npc 732] L9-10 ~Elwynn Forest 79,70 (42 spawns); Croaky [npc 248278] L11-11 ~Elwynn Forest 76,83 (111 spawns); Elder Finseer [npc 276180] L11-11 ~Elwynn Forest 79,53 (84 spawns)

## 52 Protect the Frontier  (L10 req7, 630 xp)
  - start: Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - end:   Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - text: Kill 8 Prowlers and 5 Young Forest Bears, and then return to Guard Thomas at the east Elwynn bridge.
  - objectives:
    1. kill 8x Prowler <- Prowler [npc 118] L9-10 ~Elwynn Forest 81,67 (83 spawns)
    2. kill 1x Young Forest Bear <- Young Forest Bear [npc 822] L8-9 ~Elwynn Forest 60,75 (136 spawns)

## 59 Cloth and Leather Armor  (L10 req7, 210 xp)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Sara Timberlain [npc 278] @ Elwynn Forest 79.5,68.8
  - pre(any)=[39]
  - text: Give Sara Timberlain the Stormwind Armor Marker.

## 71 Report to Thomas  (L10 req7, 210 xp)
  - start: Rolf's corpse [object 56] @ Elwynn Forest 79.8,55.5
  - end:   Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2
  - pre(any)=[45], next=39
  - text: Deliver Rolf and Malakai's Medallions to Guard Thomas at the eastern Elwynn bridge.

## 76 The Jasperlode Mine  (L10 req4, 840 xp)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - pre(any)=[62], next=239
  - text: Explore the Jasperlode Mine, then report back to Marshal Dughan in Goldshire.

## 109 Report to Gryan Stoutmantle  (L10 req9, 630 xp)
  - start: Farmer Saldean [npc 233] @ Westfall 56.0,31.2; Farmer Furlbrow [npc 237] @ Westfall 60.0,19.4; Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9; Guard Thomas [npc 261] @ Elwynn Forest 74.0,72.2; Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4; Deputy Rainer [npc 963] @ Elwynn Forest 24.2,74.5
  - end:   Gryan Stoutmantle [npc 234] @ Westfall 56.3,47.5
  - text: Talk to Gryan Stoutmantle. He usually can be found in the stone tower on Sentinel Hill, just off the road, in the middle of Westfall.

## 123 The Collector  (L10 req7, 210 xp)
  - start: item Gold Pickup Schedule [1307] (drops from Riverpaw Runt, Gruff Swiftbite, Hogger)
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - next=147
  - text: Go to Marshal Dughan in Goldshire and give him The Collector's Schedule.

## 147 Manhunt  (L10 req7, 840 xp)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - pre(any)=[123]
  - text: Find and kill "the Collector" then return to Marshal Dughan with The Collector's Ring.
  - objectives:
    1. item 1x The Collector's Ring <- Morgan the Collector [npc 473] L10-10 ~Elwynn Forest 71,81 (1 spawns)

## 239 Westbrook Garrison Needs Help!  (L10 req6, 210 xp)
  - start: Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - end:   Deputy Rainer [npc 963] @ Elwynn Forest 24.2,74.5
  - pre(any)=[76], next=11, breadcrumbFor=11
  - text: Go to the Westbrook Garrison and speak with Deputy Rainer.

## 1638 A Warrior's Training  (L10 req10, 85 xp, class=Warrior, sort=WARRIOR)
  - start: Lyria Du Lac [npc 913] @ Elwynn Forest 41.1,65.8; Ilsa Corbin [npc 5480] @ Stormwind City 80.4,59.8
  - end:   Harry Burlguard [npc 6089] @ Stormwind City 77.1,53.3
  - next=1639, exclusiveTo=[1678, 1683, 1639]
  - text: Speak with Harry Burlguard.

## 1667 Dead-tooth Jack  (L10 req10, 840 xp, class=Warrior, sort=WARRIOR)
  - start: Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - end:   Marshal Haggard [npc 294] @ Elwynn Forest 84.6,69.4
  - pre(any)=[1666]
  - text: Retrieve Haggard's Badge from Dead-tooth Jack's camp, and return to Marshal Haggard.
  - objectives:
    1. item 1x Marshal Haggard's Badge <- Dead-tooth's Strongbox [object 85563] ~Elwynn Forest 89,79 (1 spawns)

## 1685 Gakin's Summons  (L10 req10, 420 xp, class=Warlock, sort=WARLOCK)
  - start: Remen Marcot [npc 6121] @ Elwynn Forest 44.5,66.3
  - end:   Gakin the Darkbinder [npc 6122] @ Stormwind City 39.2,85.2
  - next=1688, breadcrumbFor=1688
  - text: Report to Gakin the Darkbinder in the Mage Quarter of Stormwind.

## 1860 Speak with Jennea  (L10 req10, 420 xp, races=Human/Gnome, class=Mage, sort=MAGE)
  - start: Zaldimar Wefhellt [npc 328] @ Elwynn Forest 43.2,66.2
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - next=1861, breadcrumbFor=1861, exclusiveTo=[1880]
  - text: Speak with Jennea Cannon in Stormwind.

## 2205 Seek out SI: 7  (L10 req10, 210 xp, class=Rogue, sort=ROGUE)
  - start: Keryn Sylvius [npc 917] @ Elwynn Forest 43.9,65.9
  - end:   Master Mathias Shaw [npc 332] @ Stormwind City 78.3,70.7
  - next=2206
  - text: Deliver Keryn Sylvius's package to Master Mathias Shaw at the Stormwind Barracks.

## 5628 Returning Home  (L10 req10, 210 xp, races=NightElf, class=Priest, sort=PRIEST)
  - start: Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - end:   Priestess Alathea [npc 11401] @ Darnassus 39.5,81.2
  - exclusiveTo=[5627, 5629, 5630, 5631, 5632, 5633]
  - text: Speak to Priestess Alathea in Darnassus.

## 5635 Desperate Prayer  (L10 req10, 210 xp, races=Dwarf, class=Priest, sort=PRIEST)
  - start: Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[5634, 5636, 5637, 5638, 5639, 5640]
  - text: Speak to High Priestess Laurena in Stormwind.

## 91724 Delicate Instruments  (L10 req7, 840 xp, F)
  - start: Hamish Bergwort [npc 248242] @ Elwynn Forest 65.1,69.8
  - end:   Hamish Bergwort [npc 248242] @ Elwynn Forest 65.1,69.8
  - pre(any)=[91723]
  - text: Kill 8 Defias Rogue Wizards at Stone Cairn Lake, then return to Hamish Bergwort in the Tower of Azora.
  - objectives:
    1. kill 8x Defias Rogue Wizard <- Defias Rogue Wizard [npc 474] L9-10 ~Elwynn Forest 64,55 (28 spawns)

## 91725 Stolen Enchanting Supplies  (L10 req7, 630 xp, F)
  - start: Blixie Fitzwink [npc 248248] @ Elwynn Forest 63.2,72.6
  - end:   Blixie Fitzwink [npc 248248] @ Elwynn Forest 63.2,72.6
  - text: Collect 5 Stolen Enchanting Supplies from gnoll camps around Stone Cairn Lake, then return to Blixie Fitzwink near the Tower of Azora.
  - objectives:
    1. item 5x Stolen Enchanting Supplies <- Stolen Enchanting Supplies [object 561159] ~Elwynn Forest 67,42 (17 spawns)

## 91733 Downstream  (L10 req7, 630 xp, F)
  - start: Ormin Pelford [npc 248265] @ Elwynn Forest 76.5,71.9
  - end:   Ormin Pelford [npc 248265] @ Elwynn Forest 76.5,71.9
  - text: Collect the Waterlogged Axe, Waterlogged Saw, and Waterlogged Toolbox that have washed downstream from Eastvale Logging Camp, then return to Ormin Pelford.
  - objectives:
    1. item 1x Waterlogged Axe <- Waterlogged Axe [object 562105] ~Elwynn Forest 77,82 (1 spawns)
    2. item 1x Waterlogged Saw <- Waterlogged Saw [object 562103] ~Elwynn Forest 74,76 (1 spawns)
    3. item 1x Waterlogged Toolbox <- Waterlogged Toolbox [object 562106] ~Elwynn Forest 77,87 (1 spawns)

## 91738 An Apple Treat  (L10 req7, 630 xp, F)
  - start: Sergeant De Vries [npc 955] @ Elwynn Forest 24.1,73.2
  - end:   Sergeant De Vries [npc 955] @ Elwynn Forest 24.1,73.2
  - objectives:
    1. item 1x Thunder Applejack <- ?

## 94774 Divine Grace  (L10 req10, 210 xp, F, races=Human, class=Priest, sort=PRIEST)
  - start: Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - end:   High Priestess Laurena [npc 376] @ Stormwind City 49.5,44.6
  - exclusiveTo=[94773, 94775, 94776, 94777, 94778, 94779]
  - text: Speak to High Priestess Laurena in Stormwind.

## 94792 Taming the Beast  (L10 req10, 840 xp, F, class=Hunter, sort=HUNTER)
  - start: Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - end:   Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - next=94863
  - text: Use the Taming Rod to tame a Rockhide Boar. Practice your skills, then return the Taming Rod to Josephine Carson.
  - objectives:
    1. kill 1x Rockhide Boar <- Rockhide Boar [npc 524] L7-8 ~Elwynn Forest 58,79 (90 spawns)

## 94793 Training the Beast  (L10 req10, 420 xp, F, class=Hunter, sort=HUNTER)
  - start: Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - end:   Isaac Chan [npc 258930] @ Elwynn Forest 41.8,66.4
  - pre(any)=[94864]
  - text: Speak to Isaac Chan in Goldshire.

## 94822 Confounding Flash  (L10 req10, 210 xp, F, races=Gnome, class=Priest, sort=PRIEST)
  - start: Priestess Josetta [npc 377] @ Elwynn Forest 43.3,65.7
  - end:   High Priestess Mims [npc 258785] @ Dun Morogh 55.0,22.4 (+1 spawns)
  - exclusiveTo=[94817, 94821, 94823, 94824, 94825, 94826]
  - text: Speak to High Priestess Mims in Ironforge.

## 94863 Taming the Beast  (L10 req10, 840 xp, F, class=Hunter, sort=HUNTER)
  - start: Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - end:   Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - pre(any)=[94792], next=94864
  - text: Use the Taming Rod to tame a Gray Forest Wolf. Practice your skills, then return the Taming Rod to Josephine Carson.
  - objectives:
    1. kill 1x Gray Forest Wolf <- Gray Forest Wolf [npc 1922] L7-8 ~Elwynn Forest 65,64 (56 spawns)

## 94864 Taming the Beast  (L10 req10, 840 xp, F, class=Hunter, sort=HUNTER)
  - start: Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - end:   Josephine Carson [npc 251507] @ Elwynn Forest 41.1,66.2
  - pre(any)=[94863], next=94793
  - text: Use the Taming Rod to tame a Young Forest Bear. Practice your skills, then return the Taming Rod to Josephine Carson.
  - objectives:
    1. kill 1x Young Forest Bear <- Young Forest Bear [npc 822] L8-9 ~Elwynn Forest 60,75 (136 spawns)

## 176 WANTED: "Hogger"  (L11 req5, 880 xp)
  - start: Wanted Poster [object 68] @ Elwynn Forest 24.6,74.7; Wanted Poster [object 156561] @ Elwynn Forest 24.6,78.2
  - end:   Marshal Dughan [npc 240] @ Elwynn Forest 42.1,65.9
  - text: Slay the gnoll Hogger and bring his Huge Gnoll Claw to Marshal Dughan.
  - objectives:
    1. item 1x Huge Gnoll Claw <- Hogger [npc 448] L11-11 ~Elwynn Forest 25,93 (1 spawns)

## 91740 Croaky's Head  (L11 req7, 880 xp, F)
  - start: item Croaky's Head [247826] (drops from Croaky)
  - end:   Merell Ross [npc 248277] @ Elwynn Forest 84.8,79.3
  - text: Deliver Croaky's Head to Merell Ross at Ridgepoint Tower.

## 2998 Tome of Divinity  (L12 req12, 225 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Brother Wilhelm [npc 927] @ Elwynn Forest 41.1,66.0
  - end:   Duthorian Rall [npc 6171] @ Stormwind City 50.5,47.5
  - next=1642, breadcrumbFor=1642, exclusiveTo=[3681]
  - text: Speak to Duthorian Rall in Stormwind.

## 91746 Elmpaw's Head  (L12 req7, 910 xp, F)
  - start: item Elmpaw's Head [247862] (drops from Elmpaw)
  - end:   Helene Peltskinner [npc 6306] @ Elwynn Forest 46.2,62.2
  - text: Deliver Elmpaw's Head to Helene Peltskinner near Goldshire.

## 1787 The Tome of Divinity  (L13 req12, 680 xp, races=Human, class=Paladin, sort=PALADIN)
  - start: Henze Faulk [npc 6172] @ Elwynn Forest 72.6,51.4
  - end:   Gazin Tenorm [npc 6173] @ Stormwind City 49.5,45.0
  - pre(any)=[1786], next=1788
  - text: Retrieve a Defias Script from the Defias Rogue Wizards in Elwynn, and return to Gazin Tenorm in Stormwind.
  - objectives:
    1. item 1x Defias Script <- Defias Rogue Wizard [npc 474] L9-10 ~Elwynn Forest 64,55 (28 spawns); Defias Bodyguard [npc 6866] L10-10 ~Elwynn Forest 48,87 (1 spawns)

## 1919 Report to Jennea  (L15 req15, 105 xp, races=Human/Gnome, class=Mage, sort=MAGE)
  - start: Zaldimar Wefhellt [npc 328] @ Elwynn Forest 43.2,66.2; Magis Sparkmantle [npc 1228] @ Dun Morogh 47.5,52.1; Dink [npc 7312] @ Ironforge 27.2,8.6
  - end:   Jennea Cannon [npc 5497] @ Stormwind City 49.6,85.8
  - next=1920, breadcrumbFor=1920
  - text: Speak with Jennea Cannon in Stormwind.

## 2300 SI:7  (L16 req16, 115 xp, class=Rogue, sort=ROGUE)
  - start: Keryn Sylvius [npc 917] @ Elwynn Forest 43.9,65.9
  - end:   Renzik "The Shiv" [npc 6946] @ Stormwind City 78.3,71.1
  - next=2281
  - text: Travel to Stormwind and seek out Renzik "The Shiv."

## 97045 Your First Horse  (L40 req40, ? xp, F, races=Human)
  - start: Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - end:   Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - exclusiveTo=[95511, 96982, 96989, 96994, 96996, 96997, 97017, 97046, 97171, 97446, 98166, 99326]
  - text: Inspect the riding horses to choose your first mount.

## 97170 Learning to Ride  (L40 req40, ? xp, F, races=Human)
  - start: Randal Hunter [npc 4732] @ Elwynn Forest 84.3,64.9
  - end:   Katie Hunter [npc 384] @ Elwynn Forest 84.2,65.5
  - exclusiveTo=[97018, 97074, 97188, 97194, 97200, 97203, 97204, 97205]
  - text: Learn the Apprentice Riding skill from Randal Hunter.

## 7881 Carnival Boots  (L60 req1, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - end:   Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - objectives:
    1. item 1x Embossed Leather Boots <- ?

## 7882 Carnival Jerkins  (L60 req10, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - end:   Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - objectives:
    1. item 1x Toughened Leather Armor <- ?

## 7883 The World's Largest Gnome!  (L60 req20, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - end:   Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - objectives:
    1. item 1x Barbaric Harness <- ?

## 7884 Crocolisk Boy and the Bearded Murloc  (L60 req30, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - end:   Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - objectives:
    1. item 1x Turtle Scale Leggings <- ?

## 7885 Armor Kits  (L60 req40, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - end:   Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - objectives:
    1. item 1x Rugged Armor Kit <- Rabid Blisterpaw [npc 5427] L47-48 ~Tanaris 38,63 (99 spawns); Scorching Elemental [npc 6520] L53-54 ~Un'Goro Crater 51,49 (12 spawns); Larion [npc 9118] L51-51 ~Un'Goro Crater 46,9 (1 spawns)

## 7899 Small Furry Paws  (L60 req1, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Small Furry Paw <- Moonstalker [npc 2069] L14-15 ~Darkshore 45,54 (49 spawns); Moonstalker Runt [npc 2070] L16-17 ~Darkshore 44,43 (60 spawns); Moonstalker Matriarch [npc 2071] L19-20 ~Darkshore 48,57 (12 spawns); Shadowclaw [npc 2175] L13-13 ~Darkshore 40,41 (1 spawns)

## 7900 Torn Bear Pelts  (L60 req10, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Torn Bear Pelt <- Gray Bear [npc 2351] L21-22 ~Hillsbrad Foothills 50,32 (46 spawns); Vicious Gray Bear [npc 2354] L22-23 ~Hillsbrad Foothills 51,40 (45 spawns); Elder Gray Bear [npc 2356] L25-26 ~Hillsbrad Foothills 53,52 (109 spawns); Ashenvale Bear [npc 3809] L21-22 ~The Barrens 46,58 (92 spawns)

## 7901 Soft Bushy Tails  (L60 req20, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Soft Bushy Tail <- Crag Coyote [npc 2727] L35-36 ~Badlands 51,39 (28 spawns); Feral Crag Coyote [npc 2728] L37-38 ~Badlands 57,61 (39 spawns); Elder Crag Coyote [npc 2729] L38-40 ~Badlands 28,64 (46 spawns); Scarlet Tracking Hound [npc 4304] L33-33

## 7902 Vibrant Plumes  (L60 req30, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Vibrant Plume <- Carrion Vulture [npc 1809] L50-52 ~Western Plaguelands 31,59 (2 spawns); Vicious Owlbeast [npc 2927] L42-43 ~The Hinterlands 30,57 (27 spawns); Primitive Owlbeast [npc 2928] L44-45 ~The Hinterlands 42,53 (44 spawns); Savage Owlbeast [npc 2929] L46-47 ~The Hinterlands 58,50 (173 spawns)

## 7903 Evil Bat Eyes  (L60 req40, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Evil Bat Eye <- Plaguebat [npc 8600] L53-55 ~Eastern Plaguelands 31,65 (86 spawns); Noxious Plaguebat [npc 8601] L54-56 ~Eastern Plaguelands 52,51 (61 spawns); Monstrous Plaguebat [npc 8602] L56-58 ~Eastern Plaguelands 42,27 (57 spawns); Dark Screecher [npc 8927] L50-52

## 7941 More Armor Kits  (L60 req40, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - end:   Chronos [npc 14833] @ Elwynn Forest 43.6,70.8
  - objectives:
    1. item 1x Rugged Armor Kit <- Rabid Blisterpaw [npc 5427] L47-48 ~Tanaris 38,63 (99 spawns); Scorching Elemental [npc 6520] L53-54 ~Un'Goro Crater 51,49 (12 spawns); Larion [npc 9118] L51-51 ~Un'Goro Crater 46,9 (1 spawns)

## 7943 More Bat Eyes  (L60 req40, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Evil Bat Eye <- Plaguebat [npc 8600] L53-55 ~Eastern Plaguelands 31,65 (86 spawns); Noxious Plaguebat [npc 8601] L54-56 ~Eastern Plaguelands 52,51 (61 spawns); Monstrous Plaguebat [npc 8602] L56-58 ~Eastern Plaguelands 42,27 (57 spawns); Dark Screecher [npc 8927] L50-52

## 7946 Spawn of Jubjub  (L60 req1, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Morja [npc 14871] @ Elwynn Forest 43.3,70.3
  - end:   Morja [npc 14871] @ Elwynn Forest 43.3,70.3
  - objectives:
    1. item 1x Dark Iron Ale Mug <- Whit Wantmal [npc 275] L27-27 ~Duskwood 79,44 (1 spawns); Anvilrage Officer [npc 8895] L53-54; Grim Patron [npc 9545] L48-52; Guzzling Patron [npc 9547] L48-52

## 8222 Glowing Scorpid Blood  (L60 req40, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Glowing Scorpid Blood <- Scorpok Stinger [npc 5988] L50-51 ~Blasted Lands 49,24 (90 spawns); Clack the Reaver [npc 8301] L53-53 ~Blasted Lands 55,35 (17 spawns); Deep Stinger [npc 8926] L50-52; Venomtip Scorpid [npc 9691] L52-53 ~Burning Steppes 89,41 (11 spawns)

## 8223 More Glowing Scorpid Blood  (L60 req40, ? xp, sort=DARKMOON_FAIRE, repeatable)
  - start: Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - end:   Yebb Neblegear [npc 14829] @ Elwynn Forest 40.2,69.5
  - objectives:
    1. item 1x Glowing Scorpid Blood <- Scorpok Stinger [npc 5988] L50-51 ~Blasted Lands 49,24 (90 spawns); Clack the Reaver [npc 8301] L53-53 ~Blasted Lands 55,35 (17 spawns); Deep Stinger [npc 8926] L50-52; Venomtip Scorpid [npc 9691] L52-53 ~Burning Steppes 89,41 (11 spawns)

## 8649 Stormbrow the Elder  (L60 req1, ? xp, sort=LUNAR_FESTIVAL)
  - start: Elder Stormbrow [npc 15565] @ Elwynn Forest 39.8,63.7
  - end:   Elder Stormbrow [npc 15565] @ Elwynn Forest 39.8,63.7

## 99206 Swift as the Wind  (L60 req60, ? xp, F)
  - start: ?
  - end:   ?
  - text: Learn the Journeyman Riding skill from Randal Hunter.

## 99213 An Epic Ride  (L60 req60, ? xp, F)
  - start: ?
  - end:   ?
  - text: Inspect the armored riding horses to choose your epic mount.
  - objectives:
    1. kill 1x Swift Brown Steed <- Swift Brown Steed [npc 276785] L1-2 ~Elwynn Forest 85,65 (1 spawns)
    2. kill 1x Swift Palomino <- Swift Palomino [npc 276786] L1-2 ~Elwynn Forest 84,65 (1 spawns)
    3. kill 1x Swift White Steed <- Swift White Steed [npc 276787] L1-2 ~Elwynn Forest 85,65 (1 spawns)

# Service NPCs

- Corina Steele <Weaponsmith> [npc 54] 41.5,65.9: repair, vendor
- Tharynn Bouden <Trade Supplies> [npc 66] 41.8,67.2: vendor
- Kurran Steele <Cloth & Leather Armor Merchant> [npc 74] 41.4,65.6: repair, vendor
- Janos Hammerknuckle <Weaponsmith> [npc 78] 47.2,41.9: repair, vendor
- Brog Hamfist <General Supplies> [npc 151] 44.0,65.9: vendor
- Brother Danil <General Supplies> [npc 152] 47.5,41.6: vendor
- Dermot Johns <Cloth & Leather Armor Merchant> [npc 190] 47.6,41.4: repair, vendor
- Khelden Bremen <Mage Trainer> [npc 198] 49.7,39.4: trainer
- Joshua Maclure <Vintner> [npc 258] 42.4,89.4: vendor
- Innkeeper Farley <Innkeeper> [npc 295] 43.8,65.8: innkeeper, vendor
- Zaldimar Wefhellt <Mage Trainer> [npc 328] 43.2,66.2: trainer
- Priestess Anetta <Priest Trainer> [npc 375] 49.8,39.5: trainer
- Priestess Josetta <Priest Trainer> [npc 377] 43.3,65.7: trainer
- Katie Hunter <Horse Breeder> [npc 384] 84.2,65.5: vendor
- Drusilla La Salle <Warlock Trainer> [npc 459] 49.9,42.6: trainer
- Barkeep Dobbins <Bartender> [npc 465] 44.0,65.7: vendor
- Smith Argus <Journeyman Blacksmith> [npc 514] 41.7,65.5: trainer
- Antonio Perelli <Traveling Salesman> [npc 844] 78.1,73.0: vendor
- Homer Stonefield <Fruit Seller> [npc 894] 33.7,82.9: vendor
- Veldan Lightfoot <Leather Armor Merchant> [npc 896] 25.2,73.9: repair, vendor
- Maximillian Crowe <Warlock Trainer> [npc 906] 44.4,66.2: trainer
- Llane Beshere <Warrior Trainer> [npc 911] 50.2,42.3: trainer
- Lyria Du Lac <Warrior Trainer> [npc 913] 41.1,65.8: trainer
- Jorik Kerridan <Rogue Trainer> [npc 915] 50.3,39.9: trainer
- Keryn Sylvius <Rogue Trainer> [npc 917] 43.9,65.9: trainer
- Brother Sammuel <Paladin Trainer> [npc 925] 50.4,42.1: trainer
- Brother Wilhelm <Paladin Trainer> [npc 927] 41.1,66.0: trainer
- Sergeant De Vries <Morale Officer> [npc 955] 24.1,73.2: vendor
- Dawn Brightstar <Arcane Goods> [npc 958] 64.9,69.2: vendor
- Morley Eberlein <Clothier> [npc 959] 64.7,69.5: repair, vendor
- Eldrin <Journeyman Tailor> [npc 1103] 79.2,69.0: trainer
- Rallic Finn <Bowyer> [npc 1198] 83.3,66.1: repair, vendor
- Godric Rothgar <Armorer & Shieldcrafter> [npc 1213] 47.7,41.4: repair, vendor
- Alchemist Mallory <Journeyman Alchemist> [npc 1215] 39.8,48.2: trainer
- Herbalist Pomeroy <Herbalism Trainer> [npc 1218] 40.0,48.4: trainer
- Quartermaster Hudson <Armorer & Shieldcrafter> [npc 1249] 25.2,74.1: repair, vendor
- Drake Lindgren <General & Trade Supplies> [npc 1250] 83.3,66.7: vendor
- Tomas <Cook> [npc 1430] 44.4,66.0: trainer
- Adele Fielder <Journeyman Leatherworker> [npc 1632] 46.4,62.0: trainer
- Quartermaster Hicks <Master Weaponsmith> [npc 1645] 25.4,74.0: repair, vendor
- Terry Palin <Lumberjack> [npc 1650] 83.0,63.3: vendor
- Lee Brown <Fisherman> [npc 1651] 47.6,62.3: trainer
- Andrew Krighton <Armorer & Shieldcrafter> [npc 2046] 41.7,65.9: repair, vendor
- Michelle Belle <Physician> [npc 2329] 43.4,65.5: trainer
- Toddrick <Butcher> [npc 3935] 44.2,66.0: vendor
- Kira Songshine <Traveling Baker> [npc 3937] 42.5,66.0: vendor
- Randal Hunter <Horse Riding Instructor> [npc 4732] 84.3,64.9: trainer
- Helene Peltskinner <Skinner> [npc 6306] 46.2,62.2: trainer
- Donni Anthania <Crazy Cat Lady> [npc 6367] 44.2,53.4: vendor
- Dane Winslow <Demon Trainer> [npc 6373] 50.0,42.7: vendor
- Cylina Darkheart <Demon Trainer> [npc 6374] 44.4,66.0: vendor
- Spirit Healer <> [npc 6491] 83.6,69.8: spiritHealer
- Erma <Stable Master> [npc 6749] 42.9,66.0: stableMaster
- Kitta Firewind <Artisan Enchanter> [npc 11072] 64.9,70.7: trainer
- Sylannia <Darkmoon Faire Drink Vendor> [npc 14844] 42.2,70.1: vendor
- Flik <> [npc 14860] 41.8,68.1: vendor
- Nancy Songflower <Junior Herbalism Trainer> [npc 247223] 52.4,43.9: trainer
- Kelsey Fargo <Junior Mining Trainer> [npc 247226] 47.2,32.2: trainer, vendor
- Riley Peltskinner <Junior Skinning Trainer> [npc 247227] 47.0,39.9: trainer, vendor
- Tordrin Sternblade <Hunter Trainer> [npc 248415] 51.2,40.8: trainer
- Josephine Carson <Hunter Trainer> [npc 251507] 41.1,66.2: trainer
- Nordun Steadysight <Traveling Ranged Weapon Salesman> [npc 268238] 42.0,66.4: repair, vendor
