Sources: Questie race and class masks plus the Skyborne race note already settled who can be a Horde Priest.

Target file for the ops is `research/professions/class_professions.json`. This pass does not edit that file or any route JSON. Every op is `verified: false`.

## Legal races

| Race | Shadow leveling | Holy/discipline healer | Primary pair |
| --- | --- | --- | --- |
| Troll | yes | yes | Tailoring + Enchanting |
| Undead | yes | yes | Tailoring + Enchanting |

The pair is the same for both roles. It is stated once per race below. Secondaries for both races and both roles: First Aid, Cooking, Fishing. They do not take a primary slot.

### Troll

Both roles use Tailoring and Enchanting. Bolts come off humanoids the route already kills, and those bolts make the cloth a priest equips plus bags. Spare uncommon drops become wands, so there is no mining or herb loop.

Rejected, both roles:

- Herbalism + Alchemy. Node circuits are their own lap, and the potions do not exist until that lap is done.
- Skinning + Leatherworking. Leather fills the wrong armor slots.

### Undead

Same pair as the Troll priest, for the same reason: cloth from kills already on the path, wands from greens. Rejected pairs are the same two: Herbalism + Alchemy (long node farm) and Skinning + Leatherworking (wrong armor).

## Troll garment quests

Included. Questie `quests.json` records both as `classes` 16, `races` 128, `sort` PRIEST.

- **5649 In Favor of Spirituality** starts at Ken'jai (npc 3707), 42.36, 68.81, zone 14. The Durotar route already enters the Den beside that point (steps around 42.1, 68.3 and 42.7, 68.7).
- **5648 Garments of Spirituality** starts and ends at Tai'jin (npc 3706), 54.26, 42.93. Razor Hill is already a route stop (innkeeper Grosk at 51.51, 41.64). The objective is Grunt Kor'ja (npc 12430) at 53.1, 46.46: one heal, one Fortitude, then back to Tai'jin.

No new camp. This is a trainer talk plus two spells in Razor Hill.

## Skipped races

- **Orc.** Starter priest letter in Questie is 3085, race mask 128 (Troll only). Forever notes add Orc Mage, not Orc Priest. No pair.
- **Tauren.** No priest starter uses race bit 32. Forever race notes do not add Tauren Priest. No pair.
- **Horde Skyborne.** `research/external/web-notes/skyborne-zephras.md` lists Windshaper classes as Druid, Hunter, Rogue, Shaman, and Warrior, and names Priest as not available. No pair.

4 `set-pair`, 3 `tip`, 6 `drop-checkpoint` in `changesets/class-priest.json`.
