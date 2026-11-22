Sources: Class notes plus Questie already settled races, the Blizzard slow cap, and the short trainer quests.

# Horde Mage professions

Leveling role is Frost for every race below. Fire (if the player never AoE-grinds) and an Arcane stretch before Frostbolt rank 5 do not change the profession pair, so each race is listed once.

Improved Blizzard is a short snare, not a pull tool. Public talent notes put rank 3 at a 40% slow for 1.5 seconds (down from a 65% slow), and Cone of Cold is no longer an endless kite. The route stays single-target Frost. No AoE camp steps.

## Pair

Primary pair for Orc, Troll, and Undead: Tailoring and Enchanting.

Cloth falls off the humanoids a Frost mage already kills, and spare greens become dust. Enchanting is also the usual early wand craft (Lesser Magic Wand around level 5, Greater Magic Wand around 13). Those wand item ids are not in `content/questie-db/items.json`, so they stay unnamed here.

Do not add Alchemy to feed Tailoring. Published Forever profession notes say a large set of tailor recipes use alchemist dyes (Cerulean Dye called out on 128 recipes). The skill where that gate starts is UNKNOWN in our notes. When a pattern asks for a dye, buy the dye or skip that pattern and skill on bolts and bags. That is the whole dye plan. Portals and city teleports are mage spells, not a profession.

Secondaries, same three races: First Aid, Cooking, Fishing. First Aid now holds the healing potions. Cook food when it is on the way. Fish only to feed cooking.

`verified` is false. Pairs are planning choices, not in-game checks.

## Races

| Race | Mage? | Pair | Role |
|---|---|---|---|
| Orc | Yes. Questie 98576 Glyphic Parchment is class Mage and race Orc, and the mage class note calls Orc Mage a new Horde option. | Tailoring + Enchanting | Frost (same pair if Fire or early Arcane) |
| Troll | Yes. Classic Horde mage, Questie 3086 Glyphic Tablet. | Tailoring + Enchanting | Frost |
| Undead | Yes. Questie 3098 Glyphic Scroll. | Tailoring + Enchanting | Frost. Touch of the Grave can break Frost Nova, so single-target still wants a root that is not Nova-only. |
| Tauren | Skipped. No Mage class quest with the Tauren race bit, and the class note does not add Tauren mages. | — | — |
| Horde Skyborne (Windshaper) | Skipped. The Zephras race note puts Mage on Alliance High Order only. Windshaper classes listed there are Druid, Hunter, Rogue, Shaman, Warrior. A few level-60 mage set quests use a wide Horde race mask that includes the Skyborne bit; that mask is not treated as a class unlock. | — | — |

## Checkpoints worth a step

Trainer and water only. Water and food are spells (about level 4 and 6), not quests, so they have no ids.

Verified in `content/questie-db/quests.json`:

- Orc: 98576 Glyphic Parchment. Read it and talk to Mai'ah at the Valley of Trials den. Needs 788.
- Troll: 3086 Glyphic Tablet. Same den, Mai'ah. Needs 788.
- Troll (and any mage the mask allows): 1883 Speak with Un'thuwa. Race mask in Questie is 0, so who is offered it is not proven. It is a talk.
- Undead: 3098 Glyphic Scroll, then Isabella in Deathknell. Needs 364.
- Undead: 1881 Speak with Anastasia. Talk in Tirisfal, level 10, race mask Undead+Troll (144).

## Left out on purpose

- 1882 The Balnir Farmstead, 1884 Ju-Ju Heaps, and the level-15 robe chain 1960–1962. They are collection or object clears, not a wand, water, or trainer stop.
- 1947 through 1958, including 1952 Mage's Wand. The wand is the end of a two-branch power chain and an infernal/Uldaman line. Too long.
- 7463 Arcane Refreshment and the level-60 tailoring set turn-ins. Endgame, not leveling.
- Every AoE field named in the class note (Hillsbrad Fields, Azurelode, Lost Rigger, and the rest). The slow cap makes those camps a grind, not a route.

## Sources

- `research/external/web-notes/classes-mage.md` (Mobalytics Frost pages, Conquest Capped mage leveling, Fextralife Improved Blizzard, wowforeverguides Frost).
- `research/external/web-notes/skyborne-zephras.md` (race class lists).
- `research/professions/README.md` for the dye cross-reagent fact only.
- Quest ids checked in `content/questie-db/quests.json` on 21 Nov 2026. Not checked in game.
