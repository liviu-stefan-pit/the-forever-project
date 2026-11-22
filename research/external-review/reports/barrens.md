Sources: Questie plus OpenXP, TUGs, WoW-Pro, and Bethink were enough for ids, order, and spawns.

# Barrens 12–20 external review

Route file was read only: `research/nova/v2/barrens-12-20.json`. No route JSON was edited.

## Facts

- Questie `zones.json` maps classic zone 17 (The Barrens) to UiMap **1413**. Every goto already in the route uses 1413.
- Handoff quests already on the route: 840 Conscript of the Horde (no pre) → 842 Crossroads Conscription; 809 Ak'Zeloth (pre 829, Durotar); 854 Journey to the Crossroads (Mulgore, no pre). 844 Plainstrider Menace has no prerequisite, so the Mulgore breadcrumb 860 is not required.
- 870 The Forgotten Pools is exploration and has no object pin. The Forgotten Pools mushroom cluster for 848 is Laden Mushroom (object 3640) around 45, 22. Step `023` completes 870 with no goto.
- 875 Harpy Lieutenants is accepted at `091` and turned in at `135` with no complete step. Rings drop from Witchwing Slayer (npc 3278); a real spawn is 38.91, 14.31. Prerequisite is 867, which is already turned in at `090`.
- 866 Root Samples is `sort: HERBALISM` with `requiredSkill` herbalism. It is accepted and turned in for everyone, and it has no complete step. Questie’s item 5056 object list is generic herb nodes, not a dedicated root pin.
- 869 Raptor Thieves `next` is 3281 Stolen Silver. The chest (object 147557) is a single spawn at 58.04, 53.87. Prerequisite 869 is on the route. OpenXP, WoW-Pro, Bethink, and TUGs all take 3281. This route never accepts it.
- 809 `next` is 924 The Demon Seed (one object). The Altar of Fire (object 3525) is at 47.98, 19.07. 926 Flawed Power Stone is repeatable if the stone expires. WoW-Pro does 924 and 926 at this turn-in, before the Crossroads.
- Kolkar Leaders (850) is turned in, then the route runs south and comes back. Barak Kodobane is one spawn at 42.8, 23.5, next to Regthar at 45.3, 28.4. The follow-up chain 851 Verog → 852 Hezrul → 4021 Counterattack is not on the route.
- Harpy Raiders (867) are completed at `087` after The Escape has already dumped the player in Ratchet. Witchwing harpies sit on the same northern ridge as the Vrang/Walton steps (`066`–`079`), before Ignition.
- Parts and Pieces (97253) is completed and turned in, then the same south-shore camps are walked again for Southsea Freebooters and Baron Longshore. Pile of Complicated Parts (object 660930) spawns from about 61.4, 44.2 to 62.3, 46.2, beside the pirate mobs.
- Wailing Caverns: 1486 is an outside hide turn-in at the entrance; 1487 is already dungeon-only on `106` with a dungeons-off skip. Left for the dungeon agent. 865 `next` is 1491 Smart Drinks (inside WC); not added.
- Ragefire / class: 5726 Hidden Enemies and 5761 Slaying the Beast are not on this route, and the route never enters Orgrimmar, so there is no breadcrumb step to hang them on. A class agent owns that chain. No Axe of Orgrimmar quest is in this file.
- 1061 The Spirits of Stonetalon starts on Zor Lonetree in Orgrimmar (npc 4047), not in the Barrens. 1483 Ziz Fizziks starts on Sputtervalve, who is already visited for Samophlange; `next` is 1093 in Stonetalon. 876 Serena Bloodfeather (`pre` 875) `next` is 1060 Letter to Jin'Zil.
- Web notes do not mention Barrens crowding. `zone-level-ranges.md` lists Barrens mobs 10–25 and Stonetalon 15–27, and puts Wailing Caverns in an 18–22 band beside Barrens, Stonetalon, and Ashenvale. Early Stonetalon is a tip only.

## Order this changeset keeps

Finish the Crossroads, Ratchet shore, northern harpy ridge, and Regthar in one visit each. Where WoW-Pro and TUGs add Verog, Counterattack, Chen’s keg, Miner's Fortune, or the Samophlange manual, those are skipped. OpenXP also takes several of those; the shorter hub order wins.

## Quests refused as slow or out of scope

Whole chains dropped, not trimmed:

- 851 Verog the Dervish, 852 Hezrul Bloodmark, 4021 Counterattack! (spawn camp, then a group event)
- 3921 Wenikee Boltbucket through 3924 Samophlange Manual (leaves the Barrens after 902)
- 874 Mahren Skyseer and 873 Isha Awak (coast run, then an elite; 907/913 are the short part and are only a tip)
- 6543 The Warsong Reports after the 6541 talk (three deliveries)
- 899 Consumed by Hatred; 878 Tribes at War and 5052 Blood Shards through 879/906 Betrayal from Within
- 893 Weapons of Choice and 1153 A New Ore Sample
- 843 Gann’s Reclamation and both 846/849 Revenge of Gann steps
- 891 The Guns of Northwatch; 898 Free From the Hold
- 868 Egg Hunt; 896 Miner's Fortune; 819/821/822 Chen’s Empty Keg; 857 The Tear of the Moons
- 1069 Deepmoss Spider Eggs and the rest of the Stonetalon line (1062, 1093, and so on)
- 95774 Her Name Is Olgra (four quillboar drops after the one-click 4921)
- 1487 and the rest of Wailing Caverns (dungeon agent); 5726–5730 and 5761 (class / Ragefire agent)

907 Enraged Thunder Lizards and 913 Cry of the Thunderhawk were not added as steps. They are short (stormsnout 48.92, 51.37 and hatchling 46.76, 50.95) but they are another hub loop after Ishamuhale. A tip records them. 4921 Lost in Battle is the same: one corpse at 49.33, 50.32, recorded as a tip so the changeset does not grow another accept/complete/turn-in set.

## Changeset

17 ops in `changesets/barrens.json`: add 7, modify 1, reorder 3, drop 1, tip 5. All `verified: false`.
