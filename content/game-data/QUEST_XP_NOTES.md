# Quest XP notes (Forever 1.60.1.71037)

Source tables: `QuestXP.1.60.1.71037.csv` and `LevelExperience.1.60.1.71037.csv` (wago ContentSetID 0). `xpTier` is Difficulty_1..7 on the quest-level row that equals `xp`.

## Build (guide quests)

`npm run data` wrote 1221 quests to `web/public/data/quests.json`.

- **1209** have `xpTier` (Difficulty_1..7 matched, or an override tier).
- **0** XP-table mismatches (no quest has `xp` that fails to match the row and lacks an override tier).
- **5** still have no `xp` / `xpTier` (unconfirmed; left unset): 1193, 1422, 5122, 6383, 78270.
- Confirmed **xp: 0** (item-only, repeatable with no XP listed, or player-logged 0): 593, 2843, 5063, 5067, 5068, 5528, 93680.

## Overrides (44)

`estimated: false` only when a Forever page stated XP (or listed item-only rewards with no XP). `estimated: true` is a guess or an unreachable/unconfirmed page.

| id | name | estimated | xp / tier | source |
| --- | --- | --- | --- | --- |
| 421 | Prove Your Worth | false | 840 / 5 | https://questing.wiki/wow-forever/quests/421/ |
| 593 | Filling the Soul Gem | false | 0 | https://questing.wiki/wow-forever/quests/593/ (item only; repeatable) |
| 1193 | A Broken Trap | true | omitted | unconfirmed — https://questing.wiki/wow-forever/quests/1193/ (rewards unknown) |
| 1422 | Threat From the Sea | true | omitted | unconfirmed — Forever pages still say rewards unknown |
| 2843 | Gnomer-gooooone! | false | 0 | https://questing.wiki/wow-forever/quests/2843/ (Goblin Transponder only) |
| 5063 | Cap of the Scarlet Savant | false | 0 | https://questing.wiki/wow-forever/quests/5063/ (item/gold only) |
| 5067 | Leggings of Arcana | false | 0 | https://questing.wiki/wow-forever/quests/5067/ (item/gold only) |
| 5068 | Breastplate of Bloodthirst | false | 0 | https://questing.wiki/wow-forever/quests/5068/ (item/gold only) |
| 5122 | The Medallion of Faith | true | omitted | unconfirmed — https://questing.wiki/wow-forever/quests/5122/ (rewards unknown) |
| 5528 | The Gordok Taste Test | false | 0 | https://questing.wiki/wow-forever/quests/5528/ (items only) |
| 6383 | The Ashenvale Hunt | true | omitted | unconfirmed — https://questing.wiki/wow-forever/quests/6383/ (rewards unknown) |
| 8410 | Elemental Mastery | false | 3800 / 4 | https://questing.wiki/wow-forever/quests/8410/ (3800 XP; table match is level 52 Difficulty_4) |
| 78270 | Goblin Lockpicks | true | omitted | unconfirmed — item reward only; no Forever XP figure |
| 80001 | Rekindle | true | 3150 / 5 | guessed Difficulty_5 at level 40; https://www.wowhead.com/forever/quest=80001 has no XP |
| 92065 | Blackmaw Reclamation | false | 6600 / 5 | https://warcraftmaps.com/quest/92065 |
| 92066 | The Twin Bears | false | 5650 / 5 | https://warcraftmaps.com/quest/92066 |
| 92343 | Get to the Roots of It | false | 5650 / 5 | https://warcraftmaps.com/quest/92343 |
| 92401 | A Frightened Request | false | 2200 / 6 | https://questing.wiki/wow-forever/quests/92401/ |
| 92421 | Light's Justice | false | 2200 / 6 | https://questing.wiki/wow-forever/quests/92421/ |
| 93404 | Rot and Regret | false | 5700 / 6 | https://warcraftmaps.com/quest/93404 |
| 93604 | Agamaggan's Blood | false | 4850 / 6 | https://warcraftmaps.com/quest/93604 |
| 93680 | Key to the City | false | 0 | https://foreverdb.net/quest/93680-key-to-the-city (0 XP seen in Forever at 30–33) |
| 94968 | Eye of Mugg | false | 4850 / 6 | https://warcraftmaps.com/quest/94968 |
| 94972 | Tome of Twilight | false | 4650 / 6 | https://warcraftmaps.com/quest/94972 |
| 94975 | A Token of Vengeance | false | 3450 / 5 | https://warcraftmaps.com/quest/94975 |
| 95204 | Crest of Lordaeron | false | 2600 / 7 | https://questing.wiki/wow-forever/quests/95204/ |
| 95663 | Dragonmaw Rumors | false | 250 / 1 | https://questing.wiki/wow-forever/quests/95663/ |
| 95682 | Open the Maw | false | 3150 / 6 | https://questing.wiki/wow-forever/quests/95682/ |
| 95697 | Changing Tastes | false | 3150 / 6 | https://questing.wiki/wow-forever/quests/95697/ |
| 95789 | Shady Saltseers | false | 3900 / 6 | https://warcraftmaps.com/quest/95789 |
| 95791 | The Saltseer Captain | false | 3900 / 6 | https://warcraftmaps.com/quest/95791 |
| 95926 | The Dark Crystal | false | 6600 / 5 | https://warcraftmaps.com/quest/95926 |
| 95928 | Crystalline Elements | false | 6600 / 5 | https://warcraftmaps.com/quest/95928 |
| 96332 | A Little Payback | false | 5250 / 5 | https://warcraftmaps.com/quest/96332 |
| 96334 | Blood Red Bandanas | false | 5250 / 5 | https://warcraftmaps.com/quest/96334 |
| 96774 | Ancient Gurubashi Idol | false | 3900 / 6 | https://warcraftmaps.com/quest/96774 |
| 96986 | The Grave Knight | false | 3950 / 7 | https://questing.wiki/wow-forever/quests/96986/ |
| 96987 | Opportunistic Education | false | 3950 / 7 | https://questing.wiki/wow-forever/quests/96987/ |
| 97003 | Chol'aruk the Ravener | false | 2050 / 6 | https://questing.wiki/wow-forever/quests/97003/ |
| 97049 | Essence of Seeping Slimes | false | 6600 / 5 | https://warcraftmaps.com/quest/97049 |
| 97198 | Blackmaw Magic | false | 8050 / 6 | https://warcraftmaps.com/quest/97198 |
| 97288 | Unending Torment | false | 1650 / 5 | https://questing.wiki/wow-forever/quests/97288/ |
| 97327 | Blackmaw Pouches | false | 6600 / 5 | https://warcraftmaps.com/quest/97327 |
| 99187 | The Reliquary of Tyr | false | 7750 / 6 | https://warcraftmaps.com/quest/99187 |

Override totals: **38 confirmed** (`estimated: false`), **6 estimated**. Of the confirmed set, **7 are xp: 0** (593, 2843, 5063, 5067, 5068, 5528, 93680) and **31 include xp+tier**. One estimated row (80001) includes a guessed xp+tier.

Still unknown (no XP written): **1193, 1422, 5122, 6383, 78270**. Wowhead Forever / questing.wiki still mark rewards as unconfirmed; do not invent a number.

421 is the Questie XP correction (880 → 840). 8410 keeps 3800 XP; `xpTier` 4 is forced because that value sits on the level-52 row, not the stored level-50 row.
