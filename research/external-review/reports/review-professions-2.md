# PASS

Re-check of `research/professions/class_professions.json` after the small fix. The five named checks hold. No extra class, no `race` field, pairs unchanged, `verified` still false.

## Checks

1. **`Hunter.primary[0].reason`** — ends with `Undead is skipped. Skins come from beasts already killed. Do not add a skinning circuit. Buy leather or skip the craft.`
2. **`Hunter.levelingPlan[0].note`** (Skinning) — `Beast corpses supply the leather once Skinning is trained. Do not add a skinning circuit. Buy leather or skip the craft.` Same no-circuit / buy-or-skip idea.
3. **`Rogue.primary[0].reason`** — ends with `Tauren is skipped.`
4. **`Warrior.secondary`** — exactly two rows, `First Aid` then `Cooking`, each with `profession` and `reason`. No Fishing row. Reason: `Train First Aid and Cooking when a trainer is already on the route. Skip Fishing. Do not detour for Triage (6622) or Clamlette Surprise (6610).`
5. **`verified`** is `false` on all nine classes. Grep finds no `"race"` key. Pairs match the prior table:

| Class | pair |
|---|---|
| Warrior | Mining + Blacksmithing |
| Hunter | Skinning + Leatherworking |
| Rogue | Leatherworking + Skinning |
| Priest | Tailoring + Enchanting |
| Mage | Tailoring + Enchanting |
| Warlock | Tailoring + Enchanting |
| Shaman | Alchemy + Engineering |
| Druid | Herbalism + Alchemy |
| Paladin | Mining + Blacksmithing |

## Smallest fix

None. Leave the file as-is.
