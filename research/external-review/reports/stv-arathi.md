Sources: Questie prerequisites plus OpenXP, WoW-Pro, TUGs, and Bethink were enough for ids and order.

# Stranglethorn Vale 30–40 and Arathi Highlands external review

Route file was read only: `research/levels-20-40.route-v2.json`. No route JSON was edited. Later jungle (40+) was checked in `research/horde-40-60/horde-40-60.route.json` and was not edited.

## Facts

- Questie `zones.json`: zone 33 Stranglethorn Vale is UiMap **1434**. Zone 45 Arathi Highlands is UiMap **1417**. Steps in these two sections already use those map ids.
- Stranglethorn in this file is two sections: first circuit at n 612 (`horde-20-40:to-stv`) and second circuit at n 851 (`horde-20-40:return-stv`). Arathi is n 683–761. 5762 Hemet Nesingwary is turned in at n 434 and 5763 Hunting in Stranglethorn is turned in from the Desolace section. Both end on Hemet at 35.66, 10.81. Those turn-ins are already on the route. Their follow-ups are not a new breadcrumb.
- 583 Welcome to the Jungle has no prerequisite. Questie `next` is 194. 201 Investigate the Camp is an exploration quest from Krazek (npc 773, 26.95, 77.21) back to Krazek. The route accepts it and turns it in with no camp step, so the explore never happens.
- 568 The Defense of Grom'gol (lashtail raptors) leads to 569 (Mosh'Ogg brute and witch doctor). Both are kill counts. 581 Hunt for Yenniku (pre none) leads to 582 Headhunting. 189 Bloodscalp Ears and 596 Bloody Bone Necklaces share the Bloodscalp camp with 581. 213 Hostile Takeover and 605 Singing Blue Shards are the Venture Co. mine and the northern basilisks. None of these are page turns.
- 676 The Hammer May Fall is already accepted in Hillsbrad (n 332) and turned in on the way into Hammerfall. 677 Call to Arms has no prerequisite. 655 Hammerfall leads to 672, 674, 675, then 701, 702, 847. 671 Foul Magics has no prerequisite. 642 The Princess Trapped leads to 651 Stones of Binding. 663 Land Ho! leads to the Faldir's Cove set 662, 664, 665, 666, 668. Those are the Arathi steps this file should keep.
- 635 Crystal in the Mountains starts from item 4614, Pendant of Myzrael. Questie `npcDrops` for that item include the Witherbark ids used by 677 (2554, 2555, 2556). The route completes and turns in 635 with no accept. 652 Breaking the Keystone is the level-42 follow-up of 651 and is not on this route.

## Order this changeset keeps

Land at Grom'gol, take Thysta's flight path, and pick up 568 and 581 before Booty Bay. In Booty Bay take Gringer, the inn, and 189, 213, 605, and 201. Clear the mine, the basilisks, and the Bloodscalp camp once (ears, tusks, necklaces, lashtails), then stop at Nesingwary. Barnil Stonepot is at 35.66, 10.53. That stop is 583 and the explore credit for 201. Turn 201 in to Krazek only after that visit. Turn 568 and 581 in at Grom'gol, do 569 on the Mosh'Ogg camp, then fly back to Booty Bay for 189, 213, and 605. 582 stays on the second circuit. It is Skullsplitter heads, not another Bloodscalp lap.

Hammerfall: finish the 655 talk chain through 675, and ride 671 with 677 before the first turn-in. Do 678 at Boulderfist Hall. Do 701 on the later raptor pass the spirit chain already requires. Then the binding stones and Faldir's Cove. OpenXP's 32–33 and 36–37 Arathi blocks use that order. WoW-Pro chapter 2, TUGs 33–34 Stranglethorn, and Bethink 31–33 and 37–38 take the same hubs and also keep the mastery kill counts. This changeset does not.

## Quests refused as slow or out of scope

Whole chains dropped, not trimmed:

- Tiger Mastery 185, 186, 187, 188
- Panther Mastery 190, 191, 192
- Raptor Mastery 194, 195
- Crocolisk skins 575 Supply and Demand, 577 Some Assembly Required, 628 Excelsior
- Green Hills pages 338, 339, 340, 341, 342
- Stromgarde sigils 638 Trollbane, 639 Sigil of Strom, 640 The Broken Sigil, 641 Sigil of Thoradin
- 673 Foul Magics (Marez's orb inside Stromgarde)
- 679 Call to Arms and 680 The Real Threat (Stromgarde ogres and Or'Kalar)
- 629 The Vile Reef (elite water, one tablet)

Kurzen's camp is not on this Horde route. Bloodsail page steps are not on it either. 595 and the Buccaneer chain, 600 Venture Company Mining, 209 Skullsplitter Tusks, 584 and 585, 570 through 573 Mok'thardin's Enchantment, 193, 196, 197, and 208 are already the 40+ file or are level 41–46. They were not added. 598 Split Bone Necklace is in that 40+ file. One dungeon clear was not added. Forever-new steps already in these sections were left as they are.

## Chains blocked by a missing prerequisite

Dropping the stacks above strands follow-ups that are not in this file:

- 193 needs 192. 196 needs 195. 197 needs 196. 208 Big Game Hunter needs 188, 193, and 197 together. The 40+ file contains 193, 196, 197, and 208 and does not contain 185–192 or 194–195.
- 598 needs both 596 and 629. This file keeps 596 and drops 629. The 40+ file has 598 and has neither 596 nor 629.
- 640 needs 639, and 641 needs 640. Dropping the sigil chain removes all three.
- 652 needs 651. 651 stays here. 652 is level 42 and was not added.

## Changeset

18 ops in `changesets/stv-arathi.json`: add 1, reorder 6, drop 9, tip 2. All `verified: false`. Target file `research/levels-20-40.route-v2.json`.
