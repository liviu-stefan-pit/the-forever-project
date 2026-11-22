# Similarity audit — new/changed step text and tips

**Verdict: PASS**

Nothing in the listed route files is a near-duplicate of OpenXP guide prose. Shared quest names, NPC names, item names, and coordinates were ignored. Distinctive OpenXP tactical sentences were not found in the candidate text.

## Scope

Compared **new or changed** step text and tips only:

| File | What was treated as new/changed |
|---|---|
| `research/nova/v2/durotar-1-12.json` | All tips, changeset-linked steps, and long instructional step sentences |
| `research/nova/v2/mulgore-1-12.json` | same |
| `research/nova/v2/tirisfal-1-12.json` | same |
| `research/nova/v2/silverpine-11-15.json` | same |
| `research/nova/v2/barrens-12-20.json` | same |
| `research/nova/v2/zephras-isle.route-v2.json` | Entire pack (new) |
| `research/levels-20-40.route-v2.json` | Step ids in `research/external-review/changesets`, plus unverified instructional sentences |
| `research/horde-40-60/horde-40-60.route.json` | same |
| `research/dungeons/steps-v2.json` | same |
| `research/professions/class_professions.json` | `reason` and leveling-plan `note` text |

Sources (read-only):

- CurseForge OpenXP: `research/external/curseforge/openxp/OpenXP/Guides/`
- GitHub OpenXP: `research/external/github/OpenXP/Guides/`
- Fact checks also used Questie (quest/NPC/objective facts) and `research/external/web-notes/`

~1,550 candidate strings vs ~26,000 cleaned source sentences.

## Method

- Strip RXP color/texture markup, then compare **8-word n-grams**.
- Also scanned **6-word n-grams** and a list of distinctive OpenXP phrases (vendor-copper amounts, “including your armor”, 10–15 windstones, sit-macro, “Feel free to skip them”, hearth-after-dungeon boilerplate, “as we need it soon”, and similar).
- Flag only when a **sentence** is a near-duplicate. Quest titles, NPC names, “Accept / Turn in / Use X at Y”, flight-path lines, and coordinates are not copies.

## N-gram hits (all discarded)

Four 8-gram overlaps appeared. All are quest-objective templates, not guide prose:

| Step | Overlap (identifying fragment only) | Why it is not a copy |
|---|---|---|
| `mulgore-1-12:065` | “use the winterhoof cleansing totem at the well” | Quest item + well objective. OpenXP has the same accept/use line; our step adds the Well Stone cluster pin. |
| `tirisfal` paladin complete (changeset) | “use the symbol of life on deathguard falgan” | Paladin quest objective + NPC name. |
| `dungeons:razorfen-kraul:turnin:1824` | “turn in trial at the field of giants” | Quest title inside a **do not** turn-in. |
| `silverpine-11-15:sr01` / similar | “turn in delivery to silverpine forest” | Quest title. |

6-gram hits were the same class: Galgar's Cactus Apple Surprise, Grace of An'she and Mu'sha, At War With The Scarlet Crusade, Camp Taurajo / Sun Rock Retreat flight path, Collection of the Corrupt Water, The Wildlife Suffers Too, Allegiance to the Old Gods.

None of those are sentence copies.

## Distinctive-phrase check

These OpenXP fragments do **not** appear in any candidate step, tip, or profession reason:

- vendor-item copper / silver grind amounts, “including your armor”
- “Feel free to skip them” / long travel-time dungeon pickup
- “so you can Hearth after completing the dungeon”
- Skyborne: ~10 stones / up to 15, “abnormally crowded”, 15 min vs 15 sec buffs, sit macro
- “Don't use Walk on Air as we need it soon”

Zephras `zephras-isle:029` tells the player to jump the watchtower and use Walk on Air. That wording matches **Questie objective text** for 92474, not OpenXP’s “while falling… aim for the quest giver” / “don't use it yet” lines. Questie is an allowed fact source.

Mulgore incense “10 minutes” is the timed-quest fact. OpenXP says “this starts a 10-minute timed quest”; our tips restate the timer in different sentences (“burns out in ten minutes”). Fact overlap only.

Profession `reason` text is trainer locations, race/role pairings, and “mine nodes already on the route” — sourced from `trainers.json` and class web-notes, not OpenXP talent/profession sentences.

## Result

**PASS.** No rephrase list.

If later edits paste OpenXP `cRXP_WARN_` lines or dungeon pickup boilerplate, re-run this audit on those steps only.
