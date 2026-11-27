# Tirisfal Glades route rework: plan (research pass, 2026-11-27)

**Status: not play-tested yet.** The Zephras Isle playtest rules (`zephras-isle-plan.md` §3) are applied here using our quest and spawn data (QuestieDB) and the XP sim, the same way as `mulgore-plan.md`. The next Tirisfal playtest checks this, and its findings go in a new section at the end.

## 1. What changed

- **171 one-NPC steps became 68 steps**: town stops with a checklist, field steps (counts, mob names, where), class steps and the Balanced-only tail. Merged steps keep one old id each, so saved progress on that id still matches. New ids: the class intros (`warrior-3095`, `rogue-3096`, `priest-3097`, `mage-3098`, `warlock-3099`, `warlock-1470`, `priest-5651`, `priest-5650`), `adventurer-96656` and `rear-guard-356`. Segment files are now `02-brill-and-the-west.json`, `03-north-trip-agamand-mills.json`, `04-south-and-east-balnir.json` and `05-undercity-and-exit.json`.
- **Deathknell: 6 town stops, 4 short fields.** Zombies → (stop 2, level 2) skeletons, scavengers and bats in one loop → (stop 3, 3.5) Night Web's Hollow + A Light in the Darkness + the Equipment Boxes → (stop 4, 5.0) the Scarlet camp, where **Samuel Fipps stands at the edge**, so Marla's Last Wish is done on the armband trip instead of a separate walk → stop 5 → Meven Korgal (30 s) → stop 6.
- **Class intros added.** The old route only had the Paladin. Every Undead class now gets its scroll step at town stop 2, plus Warlock Piercing the Veil (same skeletons) and the Priest In Favor of Darkness / Garments of Darkness pair (Deathguard Kel is at the north edge of Brill).
- **The Adventurer chain added** (it wasn't in the route): Arren gives The Adventurer at stop 6, then Eleanor Shackleton's camp just south-west of Brill has The Great Outdoors and the Cooking and First Aid Camping 101s (2,100 XP, ~1.5 min).
- **Road to Brill:** Calvin (A Rogue's Deal), Simmer (Fields of Grief) and Gordo (Gordo's Task + the Gloom Weed by the road) in one step.
- **Brill: 5 town stops, 5 trips.**
  - **Stop 1 (6.2):** every quest Brill has at level 6, Discipline done in town, Dillinger's report for Patience.
  - **East hop (~3 min):** Decrepit Darkhounds between Brill and the Undercity for the Darkhound Blood, Kristof's report, and **Hides for the Forsaken picked up now** so its membranes, hides and murloc skins drop on the next two trips. The old route took it at level 9.8.
  - **West trip (6.5 → 7.9):** Putrid Claws, Dry Branches and Gordo's report on the way out; Darkhound Hides, pumpkins, Scarlet Warriors and Bareth's escort at the Solliden Farm / Crusader's Outpost. Sticks and Bones is handed in at Eleanor on the way back.
  - **North trip (8 → 9.5):** gnolls + Doom Weed + Duskbat Pelts, then Agamand Mills (Mills Overrun, all four Agamands, the Letter), then **Maggot Eye and the north-coast murlocs on the way home**. The old route did Maggot Eye (level 11) first, at 8.3; now he comes last, after a full trip of kills.
  - **South hop (Captain Perrine) → stop 4 → east trip (9.7 → 10.3):** Perrine has to be handed in before Captain Vachon can be taken, and coming back through Brill only costs ~1.5 min. The east trip is Linnea's camp → Balnir (Rear Guard Patrol + Tomb Weed, same field) → Scarlet Watch Post (Vachon + Friars) → Venomweb (spider venom) → back to Linnea.
  - **Stop 5 (~11):** all hand-ins, then The Argent Emissary (needs level 10, which is why it isn't earlier) and the Cult camp next to Linnea's camp.
- **Speedrun exit:** cult quests, then Dark Neophytes until 12 (the sim says about 1,800 XP, ~18 kills; it was about 7,000 XP before because the Cult quests were Balanced only), zeppelin from the tower outside the Undercity.
- **Balanced exit:** Undercity (Prodigal Lich, flight path) → Melrache → Gunther's Retreat (spellbook) → Family Crypt → Brill → Shadowvale → Brill → Undercity → Gunther → Undercity → Silverpine.

## 2. Speedrun vs Balanced (grind rate ~150 XP/min at 6–10, ~200–250 at 11–12 on the Dark Neophytes)

| Quest | Verdict |
|---|---|
| A Light in the Darkness, Discipline, Patience, Sticks and Bones, Seeking Refuge | **now both routes**: in town, or on a field you clear anyway (they were Balanced only) |
| The Argent Emissary, The Cult of the Damned, Remnants of War | **now both routes**: Speedrun grinds at the same camp anyway, so the kills are free |
| The Adventurer, The Great Outdoors, Camping 101: Cooking / First Aid | **new, both routes** |
| The Prodigal Lich → The Prodigal Lich Returns (5 quests) | **now Balanced only**: 2,645 XP for three Undercity visits and two island trips, ~105 XP/min |
| That Shadowvale Green Elixir, Whispering Horror Residue | **now Balanced only**: the far west, ~10 min of walking for 1,750 XP |
| Family Crypt, Melrache (372), Riptear (99156), Calvin's duel (590), Delivery to Silverpine | Balanced only, as before |

Sim exit levels: **Speedrun 12.0** (grinds ~1,800 XP), **Balanced 12.8**. `npm run xp:gate` passes.

## 3. Please check in the playtest

- Real level at each Brill stop compared with the sim (6.2 / 7.9 / 9.5 / 9.8 / 11.0). The Argent Emissary needs 10 at stop 5; the level-8 train at stop 2 is ~1 mob short in the sim.
- Is the east hop worth it, or is Hides better picked up later?
- Maggot Eye (11) at ~9.3 after the mills, and the four Agamands (10) at ~8.5: solo-able?
- Graverobbers: how many Graverobbers and Mongrels it asks for (Wowhead wasn't reachable, so the step only gives the 8 Embalming Ichor).
- Samuel Fipps: does he stand at 36.7, 61.6, next to the Scarlet camp?
- Does Proof of Demise really need At War With The Scarlet Crusade (427) done first (QuestieDB says so)? If not, take it at stop 1 and loot rings from the Scarlet Warriors.
- Bareth Dawnstone's escort: how long, and where it ends.
- Whether Speedrun needs the Undercity flight path later (it's Balanced only now).
- **Open:** the Paladin chain (A Second Home, A Lesson in Divinity) is left as it was. It crosses the whole zone (Bandarion Keep in the west, the Undercity, Venomweb in the east) and needs its own pass. The level-10 class quests (Warrior, Warlock, Mage, Rogue) are not in the route.
