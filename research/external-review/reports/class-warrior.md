Sources: Questie, trainers.json, and the external web notes already name the legal races, the trainers on the walked cities, and which warrior quests are not steps.

# Horde Warrior — race, role, professions

Legal Horde warriors: Orc, Troll, Tauren, Undead, and Horde Skyborne (Windshaper). Skyborne Warrior is in the public race notes (`research/external/web-notes/skyborne-zephras.md`: Druid, Hunter, Rogue, Shaman, Warrior; Paladin is absent, which does not decide Warrior). No other Horde race is in those notes. None marked UNKNOWN.

`class_professions.json` has one Warrior block and no race. It skips Orc, Troll, Tauren, Undead, and Skyborne. Rank 1 is Mining + Blacksmithing for both dps and tank, which this plan keeps. Rank 2 (Blacksmithing + Engineering, dps, called level 60) and rank 3 (Blacksmithing + Alchemy, tank, called level 60) are not leveling pairs. They are not copied.

## Matrix

- Orc dps — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Orc tank — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Troll dps — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Troll tank — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Tauren dps — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Tauren tank — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Undead dps — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Undead tank — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Skyborne dps — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.
- Skyborne tank — Mining + Blacksmithing. First Aid, Cooking. Skip Fishing.

No second leveling pair. Mining feeds plate and weapons for both roles, so the level-60 Engineering and Alchemy rows are a bad fit while leveling.

Rejected for every race and both roles:

- Skinning + Leatherworking — wrong armor.
- Herbalism + Alchemy — long farm.

## Where the pair is trained

- Orc and Troll: Dwukk (Blacksmithing) and Krunn (Mining) are in Durotar, then Ug'thok / Snarl and Makaru in Orgrimmar. The 1–12 file already walks Razor Hill and the city.
- Tauren: Camp Narache has no smith and no miner. Thrag Stonehoof and Brek Stonehoof are in Thunder Bluff. The Mulgore file already enters the city. Twizwick teaches Engineering only as an apprentice, and Thunder Bluff has no Engineering trainer, which is another reason not to pair Engineering here.
- Undead: Angus Hammerhand (Blacksmithing) is in Tirisfal. Johan Focht (Mining) is in Silverpine, which is the next file, and Brom Killian is in Undercity.
- Skyborne: Aedi Thriceforged (Blacksmithing apprentice) and Daeann Steelwind (journeyman) are on Zephras Isle, with Messana Crestwind and Halavuul Cragwind (Mining). After the skyship, the same Thunder Bluff pair as Tauren. Zephras itself is not a file we walk.

## Secondaries

First Aid on every race and both roles. Forever healing items sit on First Aid, and a warrior has no healer spell. Cooking on the same cities the route already visits. Skip Fishing. It does not make weapons or plate, and no fishing quest is required for the pair.

## Checkpoints that already sit on a walked file

Stances: Battle Stance is the level-1 stance. New spell ranks go on the class-trainer lines already in Durotar (level 6 in the Valley, level 10 at Razor Hill), Tirisfal (level 6 in Deathknell), and Mulgore (Harutt, then Krang). Berserker Stance is a level-30 trainer spell on Grezz Ragefist or Sorek in Orgrimmar, or Ker / Sark Ragetotem in Thunder Bluff. Do not add a city trip for it. Defensive Stance is the reward of Path of Defense (1498) or Ulag the Cleaver (1819). Those quests are not steps. This plan does not add them.

- Orc and Troll: train at Frang and Tarshaw on the visits already in `durotar-1-12`. Do not add Veteran Uzzek (1505). It is exclusive with 1819, the breadcrumb points at Far Watch, and 1498 then wants Singed Scales (item 6486) from Durotar thunder lizards 3130 and 3131 after the route has left on Conscript of the Horde (840). Forged Steel (1503) is the chest at 55.05, 26.65 and is not a step. The one Ragefire clear (5726–5730) is Horde (`races` 8589934770) and `classes` 0. No quest with `pre` 5730 exists, and Questie items have no Axe of Orgrimmar or Hammer of Orgrimmar. Do not class-filter a weapon onto that clear.
- Tauren: train on the Mulgore class-trainer lines. Sparring Match (99108) is already accepted from Krang and is `classes` 0, so it is not a warrior-only weapon. 1505 can start on Krang, but the turn-in is Uzzek at Far Watch, and the Tauren road into the Barrens is not the 840 hand-in. Do not add it.
- Undead: train on the Deathknell class-trainer line (Dannal Stern). Dillinger is already the Mills Overrun turn-in. 1818 starts at Austil de Mon, and 1819 is Ulag at 59.47, 48.28, which is not that mill step. Agamand Heirlooms (1821) needs four family weapons and is not a step. Do not add 1818–1822. 1505 is exclusive with 1819, so Undead do not take the Far Watch breadcrumb either.
- Skyborne: Questie 92532 The Warrior's Path (`classes` 1, `pre` 92461, Zephras) and 94003 The Skybreaker Bulwark (`classes` 1, `races` 12884901888, both Skyborne factions, item 263993) are island quests. No Horde route file walks Zephras. Do not paste them onto Mulgore. After the plateau landing, use the same Mulgore trainer lines as Tauren.

Also dropped for every race: Hall of Thanes, Abandoned Ferocity, the Leatherworking camp-tent detour, Brutal Armor (1838, a mat list), and Whirlwind Weapon (1712 / 1713 / 1792). The 20–40 notes already say that weapon chain is not on a route.
