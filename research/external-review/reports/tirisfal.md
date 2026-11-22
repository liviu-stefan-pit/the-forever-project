Sources: QuestieDB plus the public Forever guides already identified ids, prerequisites, and coordinates.

# Tirisfal Glades 1-12 (Undead) external review

Route read only: `research/nova/v2/tirisfal-1-12.json`. No route JSON was edited.

## Map

Every Tirisfal goto in the route uses `mapId` 1420. Undercity steps use 1458. Questie records the same Tirisfal area as `zoneId` 85. Npc and object coordinates in that zone match the 1420 percentage space already used on the route (example: Shadow Priest Sarvis 30.84, 66.2). No coordinate in the changeset was taken from a guide.

## What the route already covers

Deathknell through Brill is the classic Undead line: 363, 364, 376, 3901, 3902, 6395, 380, 381, 382, 383, 8, 5481, 5482, 367, 404, 358, 365, 407, 427, 370, 426, 398, 362, 359, 405, plus Forever steps 98601, 90902, 91208, 91209, 98389 (early Undead paladin), 99134, 99141, 99144, 86784, 96895, 96897, 96898. Exit is Undercity flight path, then zeppelin to Orgrimmar or the road south with 445.

Early paladin steps are class-filtered and their Questie prerequisites sit on quests the route already completes (364, then 90902). Skyborne cannot be paladins; nothing in this review is for them.

## Paladin level 12

Questie ids, all `classes` paladin and race Undead except 94440, which is still `sort` PALADIN:

| Id | Req | Pre | What it is |
|---|---|---|---|
| 91282 A Second Home | 8 | none | Shari Stilwell 60.22, 52.66 to Breton Samuels 21.85, 45.23. Talk only. |
| 94427 A Lesson in Divinity | 12 | none | Danitha Morr 22.09, 44.66 to Tanis Alderwood, Undercity 65.48, 37.49 (map 1458). |
| 94434 | 12 | 94427 | 10 Linen Cloth to Tanis. |
| 94435 | 12 | 94434 | Back to Danitha. |
| 94436 | 12 | 94435 | Deathguard Billmuth 21.92, 44.5. |
| 94438 | 12 | 94436 | Resurrect Deathguard Falgan 86.73, 47.72. |
| 94440 | 12 | 94438 | Scarlet Crusade Attack Plans (item 264693) from Scarlet Zealots, Friars, and related Scarlets. Turn in to Billmuth. |
| 94441 | 12 | 94440 | Danitha again. |

94427 has no Questie prerequisite. 91282 is still the short way onto the keep, where Danitha stands, and it is already possible once 91209 is turned in to Shari and the character is level 8. Ten linen is one common cloth stack from Scarlet humanoids the war quests already kill, not a separate rare-drop camp. The rest is talk, one resurrection, and one plan drop in the same eastern Scarlet area as Captain Vachon. Add this chain, class-filtered to Paladin, at level 12. Do the Undercity linen step on the existing Bethor visit, then finish Falgan and Danitha before the zeppelin. Hearth is in Brill, not at the keep, so budget the run back.

## Wolfsbane (do not add here)

91858 Diplomatic Incident is the weapon chain. Req 18, level 22, no Tirisfal prerequisite, start Danitha Morr, turn-in Trevan Rol in Silverpine, `next` 91859 A Curious Pair at the Sepulcher. That handoff is Silverpine, not a 1-12 Tirisfal step. Silverpine agent: start from 91858, then 91859.

## Dropped

Long farms and chains that turn into a grind. Whole chain dropped even if an early step is only a talk.

- 375 The Chill of Death. Five Duskbat Pelts (item 2876 from Greater/Vampiric Duskbats) plus Coarse Thread. Steps `tirisfal-1-12:056`, `:071`, `:083`.
- 97558 Hides for the Forsaken. Eight Duskbat Wing Membranes, six Darkhound Hides, and three Vile Fin skins. Three camps. Steps `:047`, `:095`, `:102`.
- Bandarion follow-up, not in the route: 91285 Murlocs at the Gates, 91294 Touring the Grounds, 91316 Making Repairs (12 Sturdy Lumber), 91317 The Tarnished, 95803 A Token of Good Faith. 91316 is the lumber farm; the chain after 91282 is dropped as a whole. 91282 itself has no `next` and stays.
- Agamand crypt chain, not in the route: 354 Deaths in the Family, 355 Speak with Sevren, 408 The Family Crypt. 408 is the crypt grind. 362 is already in the route and is only the prerequisite, so 362 stays.
- Lich island chain, not in the route: 357, 366, 409, 411. 405 is already turned in at Bethor; the follow-up is an island trip plus a summon fight.
- 369 and 492, the later New Plague venom and drink steps. Four spider venoms mean a return to the mine.
- 99156 Rear Guard Patrol follow-up (Riptear's Heart, level 13, `next` continues). Not this band.
- Other class quests in the public guides (scrolls 3095-3099, warlock 1470, priest 5651/5650) are out of scope. This pass adds a class filter only for the Undead paladin lesson.

86784 Sticks and Bones stays. It is six Dry Branches beside the Brill campfire chain, not a rare blue. 96898 stays. Twelve Necrotic Crystal Fragments come from the same cultists as 96897 and from object 656366. 5482 Doom Weed stays. It is a node gather the route already accepts, and 99142 is its short follow-up.

## Short adds

Prerequisites are already in the route, or the step is a single talk or a normal kill in a camp the route already visits.

- 590 A Rogue's Deal. Prerequisite 8. Duel Calvin Montague at 38.23, 56.79. Backtrack after the Brill turn-in. Balanced only.
- 360 Return to the Magistrate. Prerequisite 359. Linnea 65.49, 60.25 back to Sevren 61.26, 50.84.
- 356 Rear Guard Patrol. From Linnea. Eight Bleeding Horrors and eight Wandering Spirits around 75-78, 59-62.
- 99142 Tomb Weed. Prerequisite 5482. Five nodes, object 694732, cluster about 74.3-77.9, 58.9-63.1. Turn in Holland 57.44, 48.85.
- 371 At War With The Scarlet Crusade. Prerequisite 370. Captain Vachon 78.82, 56.13 and five Scarlet Friars in that eastern camp.
- 372 At War With The Scarlet Crusade. Prerequisite 371. Captain Melrache 79.52, 25.15 and two Scarlet Bodyguards.
- Paladin 91282, then 94427 through 94441, as above.

## Sources

Facts are Questie `content/questie-db` (quests, npcs, objects, items). Order checked, text not copied, against OpenXP `Horde-01-14_Undead.lua` (CC BY-NC-SA, ids and order only), WoW-Pro Forever `01_12_Hendo_Tirisfal_Glades.lua`, TUGs `6-10 Tirisfal Glades.lua`, and Bethink `H-01-11_Tirisfal_Glades.lua`. Class context from `research/external/web-notes/classes-hunter-druid-shaman-paladin.md`. All changeset rows are `verified: false`.
