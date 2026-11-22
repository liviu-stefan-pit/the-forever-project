Sources: Schema from `contracts/schema.ts` / `contracts/route-v2.schema.json` `$defs/ClassProfessionsFile`. File: `research/professions/class_professions.json`.

# FAIL

Ajv 2020-12 accepts the file as `ClassProfessionsFile`. Pairs, roles, mining sentence, and the four forbidden checkpoints are in good shape. Two race-skip sentences are missing from reasons, Hunter never states the no-circuit / buy-or-skip rule, and Warrior secondaries are empty.

## Schema (pass)

- Keys are the nine `ClassKey` values. No extra class, no `race` field (`additionalProperties: false`).
- Each class has `primary`, `secondary`, `levelingPlan`, `sources`, `verified`.
- `primary[].roles` uses only `tank` / `healer` / `dps`. Specs (shadow, holy/disc, enhancement, …) live in `reason`.
- Races live in `reason` text, not a field.
- `verified` is `false` on every class.

## Expected pairs (pass)

| Class | pair | roles | races in reason |
|---|---|---|---|
| Warrior | Mining + Blacksmithing | dps, tank | Orc, Troll, Tauren, Undead, Skyborne |
| Hunter | Skinning + Leatherworking | dps | Orc, Troll, Tauren, Skyborne |
| Rogue | Leatherworking + Skinning | dps (no tank) | Orc, Troll, Undead, Skyborne |
| Priest | Tailoring + Enchanting | dps, healer | Troll, Undead; Orc/Tauren/Skyborne skipped |
| Mage | Tailoring + Enchanting | dps | Orc, Troll, Undead; Tauren skipped; Skyborne Alliance High Order |
| Warlock | Tailoring + Enchanting | dps | Orc, Undead, Troll Affliction + Demonology; Tauren/Skyborne skipped |
| Shaman | Alchemy + Engineering | dps, healer | Orc, Troll, Tauren, Skyborne enhancement/elemental/restoration |
| Druid | Herbalism + Alchemy | dps, healer, tank | Tauren, Skyborne feral / balance / restoration / bear |
| Paladin | Mining + Blacksmithing | dps, tank, healer | Undead ret / prot / holy |

## Gathering / forbidden (pass except Hunter)

Warrior and Paladin both use the required mining sentence: `Mine ore nodes that are already on the route. Do not add a mining circuit. Starter copper veins were cut in the starting zones. If bars are short, buy them or skip that craft.`

Shaman: no herb/mining circuit; buy herbs, ore, and parts, or skip. Druid: pick herbs already on the route; no node circuit; skip off-path herbs. Rogue: skin route kills; no skinning circuit. Priest/Mage/Warlock reject herb/ore loops.

Not required (named only as stay-out): Paladin `Wolfsbane stays out` (no 91858); Druid aquatic 27–31 left off; Shaman `Do not require Kernobee` (no 2904); no Ragefire class axe.

## Defects

1. **`Hunter.primary[0].reason`** — legal races are listed, but **Undead skipped** is not. Expected pairs call that skip out; Priest/Mage/Warlock do the same in reason text. The reason also never says no gathering circuit / buy mats or skip (Skinning is still gathering). `Hunter.levelingPlan[0].note` is the same gap (`Beast corpses supply the leather once Skinning is trained.`).
2. **`Rogue.primary[0].reason`** — Orc, Troll, Undead, Skyborne dps are listed; **Tauren skipped** is not. Circuit language is already present.
3. **`Warrior.secondary`** — `[]`. Every other class fills First Aid / Cooking / Fishing. The warrior plan is First Aid and Cooking, skip Fishing. Reason text never names those secondaries.

Non-blocking: `Hunter.sources`, `Mage.sources`, `Paladin.sources` are `[]`. Schema allows that; they are just empty.

## Smallest fix

1. Append to `Hunter.primary[0].reason` (and mirror on `Hunter.levelingPlan` Skinning note): `Undead skipped: no Forever source says Forsaken can be Hunters. Skin beasts the route already kills. Do not add a gathering circuit. Buy leather or skip the craft.`
2. Append to `Rogue.primary[0].reason`: `Tauren skipped: no Tauren Rogue starter.`
3. Set `Warrior.secondary` to First Aid and Cooking (reasons: train on cities the route already visits; skip Fishing). Leave `verified: false`.
