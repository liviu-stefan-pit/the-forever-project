Sources: Questie quest and item rows plus the web notes were enough to settle race, the lesson, and the weapon chain.

## Race

Horde paladin in this pass is Undead only. Forever-vs-classic names Undead Paladin as one of the new combinations, and the class note limits paladins to Human, Dwarf, and Forsaken. Skyborne cannot be paladins (web-notes). Orc, Troll, and Tauren are not opened by any source used here. Quest 94971 carries race mask 48; that mask is not treated as a Tauren unlock. Whether any later Forever build adds another Horde paladin race is UNKNOWN.

## Roles and professions

All three roles use one primary pair. Protection does not get a second pair: it wears the same plate and only adds a shield, which the same smith work covers. Holy stays on that pair as well. Holy still wears plate here; a caster gather pair does not replace it.

Chosen pair, all three roles: Mining and Blacksmithing.

- Retribution (dps). The spec lives on a two-hander and plate from the first trainer visits through 60. Mining is the bar supply; Blacksmithing is what turns those bars into the weapon and the armor. The smith camp tools (sharpening wheel, lodestone) are strength tools, which match a melee build.
- Protection (tank). Same pair. Shields and plate are smithing output. No separate tank pair.
- Holy (healer). Same pair. Plate is still the armor. Mana is covered by the class heals, food, and First Aid, not by spending a primary slot on herbs.

Rejected pairs (shared, cap of two):

- Blacksmithing and Engineering. Engineering is a level-60 kit (bombs, devices). During leveling it drops the ore skill, so the bars have to be bought. That loses the supply that makes smithing free while the character is still replacing gear every few levels.
- Herbalism and Alchemy. Closest alternative for Holy, and still rejected for all three roles. The Alchemy mana camp overlaps Blessing of Wisdom, and herbalism does not make plate or weapons. Leatherworking, Skinning, Tailoring, and Enchanting are worse fits for the same reason: they do not produce the plate this class equips. They are not listed as extra rejected pairs.

Secondaries, all three roles: First Aid, Cooking, and Fishing. They do not take a primary slot. Push First Aid while linen and wool are already dropping. Cooking and Fishing can lag behind it. Fishing feeds Cooking. No role splits the secondaries.

`research/professions/class_professions.json` already has a Paladin key. This pass still sends a set-pair so the three roles are explicit and the wording is not reused from that file. `verified` stays false.

## Class chain

Confirmed in `content/questie-db/quests.json`. Class filter Paladin, race Undead. These steps are already proposed on the Tirisfal route; this file does not rewrite that route.

- 91282 A Second Home. Req 8, level 11, race 16, sort PALADIN. Talk from Shari Stilwell to Breton Samuels. No `next`. Short talk. Keep.
- 94427, 94434, 94435, 94436, 94438, 94440, 94441. All named A Lesson in Divinity, level 12, req 12, class 2, sort PALADIN. Order is `next` links: 94427 to Tanis Alderwood, 94434 ten linen (item 2589), 94435 back to Danitha Morr, 94436 Deathguard Billmuth, 94438 one resurrection of Deathguard Falgan, 94440 one plan drop (item 264693) from Scarlets in Venomweb Vale, 94441 closing talk to Danitha. 94441 has no `next`. Keep, class-filtered. 94440's race mask is the wide mask; the rest of the lesson is race 16. Still an Undead paladin step.

Not added:

- 91316 Making Repairs. Twelve Sturdy Lumber. Lumber farm. The Bandarion chain after 91282 stays out. 91282 itself stays because it has no `next` and is only the talk onto the keep.

## Wolfsbane

Dropped. The whole chain from 91858 is out.

91858 Diplomatic Incident is real: class 2, race 16, sort PALADIN, req 18, level 22, Danitha Morr to Trevan Rol, `next` 91859. The follow-ups are not a short Sepulcher errand:

- 91859 A Curious Pair, talk, `next` 91860.
- 91860 A Grim Fate, investigate Fenris Isle, `next` 91861.
- 91861 Into Fenris Keep, `next` 91862.
- 91862 Lumina Windsinger, Fenris Isle Key (item 267412) off Rot Hide gnolls, `next` 96204.
- 96204 The Windshaper's Wrath, escort, `next` 95034.
- 95034 The Debt, talk, `next` 95036.
- 95036 A Moon-Kissed Blade, req 20. Materials include Whitestone Oak Lumber (item 6994, Goblin Woodcarver, Deadmines), Enchanted Silver Ingot (item 267361, object), and Purified Kor Gem (item 272448), which is a reward of 95042 Seeking the Kor Gem (Ashenvale, Corrupted Kor Gem item 6995 off naga).
- 95111, 95125, 95126, then 95140 Old Fire-Eye. 95140 has no `next`.

95036 is a dungeon lumber drop plus an Ashenvale gem quest. That is a grind, so the talks in front of it go with it. Do not start 91858.

Level 40 warhorse: 94971 A Paladin's Steed is a single talk to Danitha Morr, req 40, race mask 48. It is not part of Wolfsbane. Routing it is left to the level-40 pass. Not invented as a Horde-race unlock.
