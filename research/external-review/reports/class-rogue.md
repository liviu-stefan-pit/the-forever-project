Sources: Questie, trainer records, and the Horde route reviews were enough.

# Horde Rogue professions

Role in local Forever notes is **dps** only. `tips_matrix.json` has Rogue keys `any` and `dps`. No tank, healer, or other role is documented, so no second pair. A tank pair is **UNKNOWN**.

Lockpicking and poisons are class skills. Do not add a poison-reagent loop.

## Races

| Race | Rogue? | Pair | Role |
|---|---|---|---|
| Orc | Yes. Quest 3088, race bit 2, class 8. Trainer Rwag (3155), Valley of Trials. | Leatherworking + Skinning | dps |
| Troll | Yes. Quest 3083, race bit 128, class 8. Same trainer, Rwag. | Leatherworking + Skinning | dps |
| Undead | Yes. Quest 3096, race bit 16, class 8. Trainer David Trias (2122), Deathknell. | Leatherworking + Skinning | dps |
| Skyborne | Yes, with a caveat. Zephras has Rogue trainers Akeri Duskblade (251389), Eltheen Nightbreeze (252379), and Miriaan Mistblade (254087). Quest 92483 is class 8 on Zephras Isle. Its `races` field is 0, so it does not by itself lock the class to Skyborne. Blizzard's published new pairs name Skyborne Shaman only. Treated as legal for this plan, `verified: false`. | Leatherworking + Skinning | dps |
| Tauren | **Skipped.** No race-bit-32 Rogue starter. The shared Horde mask on quest 2378 includes the Tauren bit the way older class quests do, and that is not a Forever confirmation. Boarton Shadetotem (205729) is tagged `Rogue Trainer?` in Questie, which is not a confirmation. | none | — |

Blood Elf and Goblin are not Horde Rogue options in this database.

## Chosen pair

**Leatherworking + Skinning** for every legal race above, role dps.

Skin what the route already kills: Valley of Trials and Tirisfal beasts, Barrens wildlife, later Ashenvale, Feralas, Hinterlands (the 40-60 route flies to Revantusk), Un'Goro, and Winterspring. Train Leatherworking on that same path.

Do not ride to the published Medium Leather camp. Hook p2-083 is Mottled Razormaw in Wetlands. Wetlands is not a Horde leveling zone here. It appears only as a dungeon pointer. That camp is a detour, so it is dropped. The pair stays, because the route already supplies hides.

### Train on the route

- Orc and Troll: apprentice Skinning from Kagil (267327), Valley of Trials. Later ranks from Dranh (6387) at Camp Taurajo or Thuwd (7088) in Orgrimmar. Leatherworking from Krulmoo Fullmoon (3703) at Camp Taurajo, or Kamari (5811) / Karolek (3365) in Orgrimmar. Skip Waldor (5784). His verified spot is the cave above Wailing Caverns, off the Barrens road.
- Undead: apprentice Skinning from Margaret Weaver (267324), Deathknell. Higher ranks from Rand Rhobart (6289) at Brill or Killian Hagey (7087) in the Undercity Rogues' Quarter. Leatherworking from Shelene Rhobart (3549) at Brill, then Arthur Moore (4588) in Undercity, or the Orgrimmar trainers after the zeppelin.
- Skyborne: Indari Sunseam (251993) for apprentice Leatherworking and Mendalass Tattermend (257024) for Skinning, both in Shen'dar Village on Zephras. The shared Horde route does not include Zephras steps. After they join Kalimdor, use the Orc trainers above. When that join happens is **UNKNOWN**.

## Rejected pairs

1. **Engineering + Mining.** Starter copper veins were cut, so Mining is a node loop beside the kill path. Engineering gadgets are a later kit, not the leveling pair.
2. **Alchemy + Herbalism.** Healing potions sit on First Aid in Forever, so Alchemy is not the sustain plan. Herb nodes are a second pass over ground the route is already crossing for quests.

Enchanting, Blacksmithing, and Tailoring were not needed. A rogue wears leather, and cloth or plate crafting does not change the pair.

## Secondaries

First Aid, Cooking, and Fishing for every legal race. First Aid is the heal kit. Cooking builds the campfire. Fishing feeds Cooking. None of them takes a primary slot. Do not script a long fish or food grind.

Quest ids that exist if someone trains the books later, all `reqLevel` 35 in Questie: 6622 Triage (Arathi), 6610 Clamlette Surprise (Tanaris), 6607 Nat Pagle, Angler Extreme (Dustwallow). Those zones are on the Horde route. Skill gates beyond `reqLevel` were not on the quest records checked here, so they stay **UNKNOWN**.

## Class quests

Short talks whose prerequisites are already on the route:

- Orc: 3088 Encrypted Parchment. Requires 788 Cutting Teeth, which the Durotar route turns in at the Den. Rwag is in the Valley.
- Troll: 3083 Encrypted Tablet. Same prerequisite, 788. Same trainer.
- Undead: 3096 Encrypted Scroll. Requires 364 The Mindless Ones, which the Tirisfal route already runs in Deathknell. David Trias is in Deathknell.

Skyborne: 92483 At Home in the Shadows needs 92461, which is a Zephras quest. Zephras is not on the shared Horde route, so 92483 is not a checkpoint.

Left off, because they are chains rather than a short talk on the current steps: 1859 / 1963 / 1858 (Shattered Hand), 1885 through 1978 (Deathstalkers), 2380 through 2480 and 2478, 6681 and 96779 through 96786, 78261 / 78270 (Shadowfang), and 8233 through 8236. Quest 91859 is a Paladin quest (class bit 2), not a Rogue quest.

## Not edited

`class_professions.json` and route JSON were not changed. Ops are in `changesets/class-rogue.json`. Every op is `verified: false`.
