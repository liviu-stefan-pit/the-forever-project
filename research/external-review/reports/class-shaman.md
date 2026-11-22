Sources: Questie, the Horde route files, and the public profession pages were enough.

# Horde Shaman professions

`class_professions.json` has no race rows. It folds Enhancement and Elemental into one `dps` bucket, ranks Skinning + Leatherworking first for both `dps` and `healer`, and treats Engineering as a lighter add on the healer. This plan does not follow that order. WoW Forever DB, rated 11 Nov 2026, names Alchemy + Engineering as the best pair for Enhancement, Elemental, and Restoration separately. Forever Guides still picks Skinning + Leatherworking for leveling and says it has not published a level-60 slot list.

## Races

| Race | Shaman? | Evidence |
|---|---|---|
| Orc | Yes | Questie 3089, class mask 64, race bit 2, Valley of Trials. |
| Troll | Yes | Questie 3084, class mask 64, race bit 128, same valley. Classic Troll shaman. |
| Tauren | Yes | Questie 3093, class mask 64, race bit 32, Camp Narache. |
| Skyborne (Horde Windshaper) | Yes | Blizzard launch notes name Windshaper Shaman. Questie 92466 is a Forever Call of Earth from Windshaper Boro on Zephras Isle. |
| Undead | No | No Forever source gives Forsaken the class. No shaman starter note uses race bit 16 alone. The big Horde mask on totem quests includes that bit the same way it includes other Horde races. That mask is not a class unlock. |

No shaman weapon quest in Questie is both short and already standing on the Horde route. 7667 / 8258 is Scholomance. 8410 sends the player after four elemental samples. Both are drops. WarcraftMaps says the totem quests are still required and that two-handed axes and maces are baseline, so Orc axe skill does not create a Blacksmithing checkpoint.

## Pair, every legal race, all three roles

Chosen pair: **Alchemy + Engineering**.

Shared on purpose. All three Forever DB lists score both professions S and name each other as the partner. Engineering’s nets and stun grenades are the hard control a shaman does not have, including the healer. Spell-power goggles are on the Elemental and Restoration pages. Enhancement’s weapon damage does not move the pair: Blacksmithing is also S there, and that page still names Alchemy as its partner, so smithing would cost the nets.

Rejected, same two for every race and role:

1. Skinning + Leatherworking. Leatherworking is A and helps while the character is still in leather, then mail patterns. Skinning is B for Enhancement and only C for Elemental and Restoration, because those two kill beasts more slowly. That is the leveling pair in `class_professions.json`. It is the one that favors melee over the healer, so it is not the shared pair.
2. Mining + Blacksmithing. Mining is D for Enhancement and F for Elemental and Restoration. Orc axe skill does not fix the ore slot. Tauren Cultivation does not swap the pair either: the professions research notes say that racial now has level gates and a 15-minute cooldown, and Herbalism is only C for Enhancement and B for the other two. Herbalism + Alchemy would also drop Engineering.

Secondaries, all races and roles: First Aid, then Cooking, then Fishing. First Aid is S for Enhancement and Elemental and A for Restoration, because healing potions sit on First Aid in Forever and a healer already heals itself. Cooking is B (stat food and a small kill-XP bump). Fishing is F on every shaman list. It stays because it is a secondary and it feeds Cooking. It is not a primary.

Skyborne has no profession racial in these sources. Zephras trainer pins were not used to invent a different pair. `verified` is false on every row.

## Checkpoints

Kept, because the kill is a cave or ravine the route already enters:

- Orc and Troll, Durotar. 1516, 1517, 1518. `research/nova/v2/durotar-1-12.json` already clears the Burning Blade cave for 794. Felstalkers (npc 3102) spawn in that cave. Spirit Rock is the hill south of the Den, then back to Canaga.
- Tauren, Mulgore. 1519, 1520, 1521. The route already fights Brambleblade Ravine for 757. Ritual Salve (item 6634) drops from Bristleback Shaman (npc 2953) in that ravine. Kodo Rock is the drink stop on the road off the mesa. Questie tags 1521’s zone as Durotar; the objective text turns the quartz in to Seer Ravenfeather at Camp Narache.

Dropped:

- Call of Water. 2985, 2986, 1528, 1529, then 1530, 1535, 1536 (Tarren Mill), 1534 (Ashenvale), 220, 63, 100, 96. That is the long chain already refused in the Silverpine and Desolace reviews. 6563 is not part of it and is not added.
- Call of Fire on the mainland. 2983 and 2984 are only the breadcrumb. 1524 through 1527 leave for Telf Joolam, Fire Tar, a reagent pouch, and the shrine. Those kills are not a camp the route already clears.
- Skyborne totems. 92466, 92467, 92468 and the fire line 98517, 97243, 97244, 97245, 97257 are Zephras steps. The Horde mainland route does not clear that island, so the starter-cave exception does not apply.
- Call of Air. 1531 and 1532 lead to 79360, which is Charlga in Razorfen Kraul. 96136 is the Mulgore Forever breadcrumb into the same next step.

## Race × role

| Race | Enhancement | Elemental | Restoration |
|---|---|---|---|
| Orc | Alchemy + Engineering | Alchemy + Engineering | Alchemy + Engineering |
| Troll | Alchemy + Engineering | Alchemy + Engineering | Alchemy + Engineering |
| Tauren | Alchemy + Engineering | Alchemy + Engineering | Alchemy + Engineering |
| Skyborne | Alchemy + Engineering | Alchemy + Engineering | Alchemy + Engineering |

Undead: no row.
