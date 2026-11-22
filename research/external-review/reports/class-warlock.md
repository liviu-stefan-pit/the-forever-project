Sources: Public Blizzard race table, QuestieDB, and third-party Forever pages were enough.

`web-notes\classes-warlock.md` and `web-notes\skyborne-zephras.md` are not in this checkout.

## Races

Blizzard’s Horde race/class table marks Warlock for Orc, Undead, and Troll. Troll Warlock is one of the new Forever pairs. The same table leaves Warlock blank for Tauren and for Horde Skyborne (Windshaper). Those two are skipped. No Forever source in this pass says either can be a Warlock.

## Roles

Affliction is the usual 1–60 leveling spec (drain, little downtime). Demonology is the pet-tank alternative (Soul Link once 20 Demonology points are in). Both are used while leveling, so each race lists both. Destruction is not a leveling role here.

Pet and talent timing, third-party unless a quest id is named:

- Imp: level 1, at the starter trainer the 1–12 route already visits (Nartok in the Den for Orc and Troll; the Tirisfal “visit your class trainer” stop for Undead).
- Succubus: class quest opens at required level 20. The 20–40 pack dropped the later steps, so this plan does not add that chain.
- Demonic Sacrifice: Demonology row 3. Earliest level is 20, and only after 10 points in Demonology. Affliction leveling does not take it on the way to 60.
- Soul Link: Demonology row 5, needs Demonic Sacrifice. Earliest level is 30, and only on the Demonology leveling build. Affliction’s published leveling split stops short of 20 Demonology points, so Soul Link stays off that build.
- Exact grimoire item ids: UNKNOWN. Questie `items.json` has no pet grimoire names. Buy whatever demon booklet the trainer sells while you are already there to train.

## Profession pair (every race, both roles)

Primary pair: Tailoring + Enchanting.

Rejected: Herbalism + Alchemy; Herbalism + Skinning.

Secondaries: First Aid, Cooking, Fishing.

Public leveling pages put the same two crafts on Affliction and Demonology. Race changes the racial (Orc Command and Blood Fury, Undead Cannibalize, Troll Berserking), not the craft pair. Gathering pays for spell ranks but does not make the shadow cloth or the early wand. `verified` stays false: these are guide sites, not a Blizzard profession article.

## Checkpoints

- Level 1 trainer stop already on the 1–12 route: train the Imp. Do not add a second trip for a booklet.
- Level 20, 30, and 40: the 20–40 route already says to train in Orgrimmar, including Troll Warlock. Buy new ranks and any grimoire that trainer sells for the demon you already have. No extra city run.
- Succubus chain stays off the route. Questie ids, required level 20: Orgrimmar side 1507 then 1513 (The Binding), with 1510, 1511, 1512, and 1515 in between. Undercity side 1472 then 1474. Those middle steps were already dropped from 20–40. Do not put them back.
- Felsteed is a talk chain, not a drop grind. Questie: 3631 from Zevrost in Orgrimmar (warlock trainer), or 4489 from Kaal Soulreaper in Undercity, then 4490 at Strahad Farsan in Ratchet. Required level 40. The level-40 Orgrimmar train is the natural pickup for 3631. Neither 3631 nor 4490 is in the current route JSON, so this is a tip, not a claim the route already accepts them.
- Voidwalker bindings exist in Questie (Orc 1501/1504, Undead 1473/1471, summons 1506 and 1478, required level 10). This pass does not add them; the route’s early warlock letters are 3090 (Orc), 3099 (Undead), and 98575 (Troll).

## Race × role

| Race | Role | Pair |
|---|---|---|
| Orc | Affliction | Tailoring + Enchanting |
| Orc | Demonology | Tailoring + Enchanting |
| Undead | Affliction | Tailoring + Enchanting |
| Undead | Demonology | Tailoring + Enchanting |
| Troll | Affliction | Tailoring + Enchanting |
| Troll | Demonology | Tailoring + Enchanting |

Skipped: Tauren, Horde Skyborne.
