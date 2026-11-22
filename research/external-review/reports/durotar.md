Sources: Questie plus the free Horde guides (OpenXP, WoW-Pro Forever, TUGs, Bethink) already showed the order gaps and the missing objectives.

Durotar map id confirmed in `zones.json`: zone 14, uiMapId **1411**. Orgrimmar steps in this route use uiMapId 1454. Questie `pre.single` means any one prerequisite, not all of them.

## Quests we lack that are worth adding

- **1516, 1517, 1518 Call of Earth** (shaman). Hooves drop from Felstalkers in the same Burning Blade cave as Burning Blade Medallion. Spirit Rock is the hill just south of the Den (44.0, 76.2). Canaga Earthcaller is at 42.4, 69.2.
- **832 Burning Shadows**. The eye drops in Skull Rock while killing for Skull Rock (827) and Hidden Enemies (5726). Turn it in to Neeru Fireblade in Orgrimmar (49.5, 50.6) on the same visit as 829.
- **96652 The Adventurer** and **96604 The Great Outdoors**. Journal on the barrel by Zureetha (42.8, 69.1), needs 794. Brakk and the campfire are on the road into Razor Hill (52.0, 47.3 and 52.1, 47.4). Sit at the fire for the rest buff. Short Forever breadcrumb. Do not add the Camping 101 profession quests.
- **5649 In Favor of Spirituality** and **5648 Garments of Spirituality** (troll priest). Ken'jai is already in the Den (42.4, 68.8). Tai'jin is in Razor Hill (54.3, 42.9). Grunt Kor'ja stands at 53.1, 46.5.
- **2983 Call of Fire** (shaman), accept only from Swart in Razor Hill (54.4, 42.6). Turn-in is Kranal Fiss in the Barrens (56.0, 19.9, map 1413), so it belongs at the handoff with Conscript of the Horde, not as a Durotar farm.

Worth adding later, not in the changeset: hunter tame **6062, 6083, 6082, 6081**. Dire mottled boars are beside Razor Hill, but the surf crawler and armored scorpid are a second circuit after the coast and scorpids are already finished. Class parchments other than Glyphic Parchment (98576) and Tainted Tablet (98575) are 40 XP trainer letters. Low value next to the missing completes below.

## Ordering problems

- **4402 Galgar's Cactus Apple Surprise** is accepted at step 011 and turned in at step 013. There is no complete. Cactus Apples spawn across the valley floor (one spawn 44.7, 64.8). Turn in only after the scorpid and peon loop.
- **97279 Wayward Weapons** is accepted at step 004 and turned in at step 012. There is no complete. Abandoned Training Weapons are on that same valley floor (one spawn 44.6, 64.6). Loot them with the boars and turn in on the Cutting Teeth hand-in.
- **6394 Thazz'ril's Pick** is accepted at step 032 and turned in at step 035. There is no complete. The pick is inside the cave at 43.7, 53.8, on the same trip as Burning Blade Medallion. Loot it before leaving the cave.
- Echo Isles hand-in is split. Step 098 turns in Practical Prey, then steps 099–101 still finish Forgotten Loa Idols, Bloodtalon Matriarch, and A Pain in the Neck. Finish every isle objective before the run back to Sen'jin.
- **97281 A Simmering Storm** is an item turn-in (Dull Stormy Orb). Loot it while killing harpies for Securing the Lines. The current order does that, then walks back to Rezlak twice. Turn in 97281 and 835 on the same visit.

## Steps missing coordinates

- `durotar-1-12:055` completes Lost in the Shadows (99123) with no goto. Pal'juh, the escort start, is at 46.3, 78.6, inside the kolkar camp already used for Thwarting Kolkar Aggression.
- `durotar-1-12:101` completes A Pain in the Neck (96873) with no goto. Luminous Residue comes from Hexed Pendants on the Echo Isles trolls (same camp as Zalazane, 67.7, 84.0). Questie `requiredSkill` is Enchanting, so this step is enchanters only.
- `durotar-1-12:126` "Into Orgrimmar" uses 45.1, 63.9 on map 1411. That point is the Valley of Trials. The same numbers are Doras inside Orgrimmar on map 1454. On the Durotar map the road at the city is the Orgrimmar Grunt spawn 50.5, 13.5.

## Prerequisite bugs

No accept is missing its Questie prerequisite. `pre.single` is any-one: 1499 needs 1485 or 1470 (1485 is in the route), and 794 needs 792 or 1499 (both are in the route). 840 is accepted before the northern canyons and Orgrimmar, which is early but the prerequisite list is empty, so it is not a prerequisite bug. 5728 is Ragefire and the route already has a dungeons-off skip.

## Dropped because slow

- **816 Lost But Not Forgotten** (in the route). Kron's keepsake is a rare crocolisk drop along the river, then a walk back to the farm. OpenXP and WoW-Pro include it. Cut the whole quest.
- **812 Need for a Cure** and **813 Finding the Antidote** (in the route). Talking to Rhinag puts a damage-over-time poison on the character. 813 gives no XP in Questie and is a venom-sac collection plus two Orgrimmar trips. Cut both.
- **99051 and 99052 Threat from Below** (not in the route). Nine Naga Spinefins, then another collection. OpenXP comments the follow-up out. Stop at 99049.
- **96874 This Is Spinal Axe** and **96875 Beasts of Thunder Ridge**. Profession mat farms in Thunder Ridge, givers in Orgrimmar. Not on the way.
- **96876 Ukor's Lost Pack**. Item start, no shown camp that the route is already clearing.
- Camping 101 profession quests (96655, 97900, and the rest). Each one needs a profession and a crafting detour. TUGs and OpenXP pick some of them up. Leave them off this route.
- **1505 Veteran Uzzek**. Warrior breadcrumb out to Far Watch. The route already leaves on 840.
