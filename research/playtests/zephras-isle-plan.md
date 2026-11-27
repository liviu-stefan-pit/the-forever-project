# Zephras Isle route rework — plan (playtests 1–3: Shaman 1–14)

Source: AdventureLog of **Nero Clover** (Windshaper Skyborne Shaman), sessions of 2026-11-26 and 2026-11-27.
Playtest 1: `/played` 34.5 → 82.8 min for levels 1 → 6, all of it in segment `01-rorians-camp`. The 34 minutes before the first quest are character creation and idle time. They are not counted.
Playtest 2 (§7): levels 6 → 9, all of segment `02-shendar-village`, up to the A Last Request hand-in.
Playtest 3 (§9): levels 9 → 14, segments 03–07, from the Valanaar arrival to The Earthen Ring.
§1–§6 rebuild segment 01 and set the rules the other segments follow. §7 applies them to segment 02, §9 to segments 03–07. The sessions already read are listed in §8.

**Status (2026-11-27): the pack is play-tested end to end for Shaman, levels 1 → 14.** Every step the Shaman played is `verified`. Other classes' class-quest steps (Warrior, Druid and the other level-2 intros) and the Strange Hermit side chain were not seen in the log and stay unverified.

---

## 1. What the log shows

| Level | Played time | What happened |
|---|---|---|
| 1 → 2 | 6.3 min | Harmony in Balance + Infestation Investigation taken **together** and killed in one pass. The route has them one after the other, with an extra hub trip in between. |
| 2 → 3 | 8.6 min | Hub: Queen, Skysight, Unrest, Embracing, Anchors, Falling With Style, Windstones all taken at once. NE field: Agitators + Skysight + Queen + **Windstones**. |
| 3 → 4 | 15.9 min | Call of Earth picked up only now (it needs level 3, and the hub was left at 865/900 XP, **35 XP short of 3**). West field, then a **death in the Urs'anah cave** (Thendal Cave 38.1, 27.3). |
| 4 → 5 | 8.2 min | Thugs, hand-ins, Call of Earth 2 and 3 (Rise of Spirits round trip). |
| 5 → 6 | — | **At Boro the trainer, 31 XP short of 6** (2769/2800). Walked off, killed 1 mob, came back to train again (80.4 → 82.0 min). |

Findings that change the route:

1. **Quests are taken and handed in one at a time.** Steps 001–031 make about 6 trips to Thendal Village that the player did in 3.
2. **"Work through X at Y" steps add nothing.** They repeat the quest name. They should say what to kill, how many, and where, merged across quests that share a field.
3. **Near-level information is missing.** Two real cases in this one log:
   - Leaving hub 2 at 865/900 XP: one more Juvenile Vuldren (40 XP) means **level 3**, so **Call of Earth (req 3)** can be taken right away and done in the same NE trip as Agitators. Its Signet drops from **Al'Aketh Converts, the same mobs** as Agitators. The player made a separate trip for it instead.
   - Arrived at the trainer 31 XP short of 6, which cost an extra trainer visit.
4. **Data bug: Harvesting Windstones.** The route sends you to 35.8, 30.8 (west). All 12 Windstone Clusters were looted in the **east/NE** (42.9–48.5, 20.7–25.4), along the way to Agitators. It should be picked up at hub 2 and finished passively.
5. **Hidden class steps:** "2 steps hidden · not for your character". **Show** does nothing. `web/src/components/guide/GuideReader.tsx:47` `stepIsShown` always returns false for reason `filter`, even after a reveal. This is a bug.
6. **Professions show up at step 001.** All six isle profession notes (Herbalism ×2, Mining, Skinning, First Aid, Cooking) are attached to `zephras-isle:001`. Every trainer is in **Shen'dar Village** (segment 02, about level 6).
7. **Danger:** the one death was in the Urs'anah den. The step should warn about it and suggest the earth totem from Call of Earth, which the reordered route has by then.

---

## 2. New structure for segment 01 (Rorian's camp)

"Hub" = one step with a checklist of every NPC to visit, each with its own `/way`. "Field" = one step per area with every objective done there, as counts and mob names.

### Hub 1 — Thendal Village (level 1)
- Accept + hand in **Coming of Age** — Ailee Farheart `/way 42.8 23.4` → Rorian `/way 42.0 23.5`
- Accept **Harmony in Balance** — Rorian `/way 42.0 23.5`
- Accept **Infestation Investigation** — Elatrell Featherlight `/way 43.4 24.8`

### Field 1 — Thendal Grove east (`/way 45.4 25.6` → `46.2 27.1`)
- Kill 8 Juvenile Vuldren + 8 Pesky Cirrusfly (same field).
- **Keep Stringy Wolf Meat** (drops from Vuldren; for Cooking, see §4).
- ⚡ Leave once you're **≥ 3 kills past both counts**, or simply level 3. That lets you take Call of Earth at hub 2 (see Field 2).

### Hub 2 — Thendal Village (level 2–3)
- Hand in Harmony in Balance (Rorian) + Infestation Investigation (Elatrell)
- Accept **The Cirrusfly Queen** (Elatrell `/way 43.4 24.8`)
- Accept **Elemental Unrest** (Rorian `/way 42.0 23.5`)
- *Shaman:* accept + hand in **Embracing the Elements** (Rorian → Boro `/way 42.8 23.6`) → **train**
- Accept **The Gift of Skysight** (Ventaari `/way 42.6 24.4`)
- Accept + hand in **The Anchors of Zephras** (Halaan `/way 43.8 24.1`)
- Accept **Falling With Style** (Myriaal `/way 43.7 24.1`): jump from the tower now and hand it in to Rorian
- Accept **Harvesting Windstones** (Dalia `/way 43.4 24.0`)
- *Shaman, level 3:* accept **Call of Earth** (Boro `/way 42.8 23.6`)
- (Other classes: their own class-intro pair goes here, one line each.)

### Field 2 — North-east (Thendal Standing Stones)
- Hand in Elemental Unrest → accept **Agitators** (Yala `/way 47.2 22.0`)
- Use Skysight at the Elemental Convergence `/way 48.3 20.6`
- Kill 6 Roiling Winds + 7 Al'Aketh Converts `/way 47.0 20.3`; *Shaman:* Signet of Akir from the same Converts
- Loot Windstone Clusters as you go (the whole east side)
- Kill the Cirrusfly Queen `/way 48.4 28.5`
- Hand in Agitators → accept **Return to Rorian** (Yala)
- *Shaman:* Call of Earth part 2 is at the Rise of Spirits `/way 49.7 23.8`. Do it now if you have the Signet (you're next to it), otherwise at hub 3.

### Hub 3 — Thendal Village (level ~4)
- Hand in Skysight, Queen, Windstones, Return to Rorian, Call of Earth
- Accept + hand in **Aetheen of the Gales** → accept **Foul Matriarch** (Aetheen `/way 42.8 23.7`)
- Accept **Aggressive Encroachment** (Valreaa `/way 42.4 25.2`)
- *Shaman:* **train**, plus Call of Earth chain 2/3 if it isn't done yet (Rise of Spirits round trip, ~2.5 min)

### Field 3 — West (Thendal Grove west + cave)
- Accept **Al'Aketh Thugs** (Hanaa `/way 38.3 30.2`)
- Kill 6 Scrawny Ursera (claws) `/way 39.8 27.6`; 8 Ursera Scavengers + **Urs'anah** in the den `/way 37.8 26.1` — ⚠ the den killed us once; drop the earth totem and pull single
- Kill 6 Al'Aketh Brutes, 4 Neophytes, Malduko Cloudcrush `/way 37.4 32.8` → hand in Thugs to Hanaa

### Hub 4 — Thendal Village (level ~5.9 → 6)
- ⚡ **XP check before you walk in:** you should be within about 1 mob of 6. If the guide shows "N XP to 6", kill those mobs first so you only train once.
- Hand in Foul Matriarch + Aggressive Encroachment
- Accept **The Adventurer** + **The Next Step** (Aetheen)
- **Train** (level 6)
- → Shen'dar Village

Result: 4 hub visits instead of about 8. No "work through" steps. Every kill step has counts and a `/way`.

---

## 3. General rules for every segment (02–07 when played)

1. **Hub steps:** one step per town visit, with a checklist of every accept/hand-in available *at that moment*. Each NPC gets its own `goto` and `/way` (the schema already allows several actions per step).
2. **Field steps:** one step per area. Text = objective counts + mob names + where. Never "Work through …". Quests that share mobs or an area are merged into one step.
3. **Level-gate awareness:** when a quest at the coming hub needs a level the sim says you won't have yet, add a "⚡ N XP short: kill ~K more X here" line to the field step before it.
4. **Trainer top-off:** before every hub where you train, show "N XP to level L" (sim value, or live XP from GuideWebExport when synced) so you ding *before* you walk in.
5. **Train steps** as their own checklist line when the class gets new spells (levels 2, 4, 6, 8, 10, 12 for most classes).
6. **Danger notes** where the log recorded a death (hotspot data in the AdventureLog summary).
7. **Class steps:** they stay hidden for other classes, and **Show** must work (fix `stepIsShown`).

### Speedrun vs Balanced
Today both modes are the same for the whole isle (every step is `["balanced","speedrun"]`). Speedrun should be stricter.

#### The grind-rate rule
Measured from the log, levels 1–6: about **50 XP per mob**, one kill every **~21 s** including walking to the next mob, so **≈140 XP/min** from grinding whatever is in front of you.

A quest stays in Speedrun only if one of these is true:
1. **XP per extra minute ≥ grind rate** (~140 XP/min at 1–6; re-measure per level band). "Extra minute" means the time the quest adds *on top of* the route: detours, walking back, talking, non-XP objectives (looting objects, using items). Kills count as free, because those mobs give XP anyway.
2. It **unlocks a chain** whose total XP passes rule 1 (e.g. Elemental Unrest, 25 XP, opens Agitators, 250 XP).
3. Its **reward is a real upgrade** for the class/role (weapon, bag, a clear armour upgrade), or a **class spell/totem**.
4. It **costs nothing**: the hand-in is at a hub you visit anyway.

Example: a 100 XP quest that costs a 1.5-minute walk is **67 XP/min**. Three mobs on the spot give ~150 XP in ~1 minute, so it's cut.

Balanced keeps everything that passes rule 1 at **half** the grind rate, plus anything with a good reward.

#### Segment 01 scored with the rule

| Quest | XP | Extra cost | Verdict |
|---|---|---|---|
| Coming of Age | 40 | 0 (instant) | keep: chain start |
| Harmony in Balance / Infestation Investigation | 80 / 170 | kills only | keep |
| The Cirrusfly Queen | 315 | ~1.5 min detour south | keep (~210/min) |
| Elemental Unrest | 25 | 0 (on the way) | keep: unlocks Agitators |
| The Gift of Skysight | 180 | ~0.5 min in the NE field | keep |
| Embracing the Elements | 85 | instant | keep: shaman training |
| The Anchors of Zephras | 85 | instant | keep |
| Falling With Style | 85 | ~0.4 min (tower jump) | keep (~210/min) |
| Harvesting Windstones | 355 | ~0 when looted on the way east | keep (only because of the location fix) |
| Agitators / Return to Rorian | 250 / 35 | kills / hand-in at a hub | keep |
| Call of Earth ×3 | 805 total | ~2.5 min Rise of Spirits round trip | keep: totem + ~320/min |
| Aetheen of the Gales | 35 | instant | keep: unlocks Matriarch + Encroachment |
| Foul Matriarch / Aggressive Encroachment / Al'Aketh Thugs | 560 / 355 / 560 | kills only | keep |

**Honest result:** nothing in segment 01 falls under the grind rate. Every quest there is close by. The time lost in segment 01 came from the **order**: extra hub trips and the trainer re-visit. Batching fixes that. The rule will start cutting in later segments, where there are delivery and long-walk quests. Each one will be scored from the next playtest's log.

#### Other Speedrun rules
- Never go back to a hub only for hand-ins. Carry them to the next hub you pass anyway.
- No profession steps except First Aid (bandages save downtime), and no detours for herbs or cloth.
- Take campfire/rest buffs only when they're on the path.

#### Missing data
Our quest data (QuestieDB) has **no reward items**, so rule 3 can't be checked automatically yet. We need a reward source (Wowhead Forever / Icy Veins quest pages, or recording rewards from the quest window in the AdventureLog) before cutting quests in later segments.

---

## 4. Professions on the isle

Every trainer is in **Shen'dar Village**, which the route reaches at about level 6. Until then the guide shows **only what to keep in your bags**:

| Profession | Trainer (Shen'dar) | Keep from earlier |
|---|---|---|
| Cooking | Zerril Softbreeze `/way 43.9 43.8` | **Stringy Wolf Meat** (Juvenile Vuldren, Field 1) |
| First Aid | Naleeia Tattermend `/way 43.1 46.3` | **Linen Cloth** (humanoids: Al'Aketh, bandits; none dropped in segment 01 so far) |
| Herbalism / Mining / Skinning | Shen'dar (see `profession_hooks.json`) | nothing to carry; learn on arrival |

- ✅ The six isle hooks (`p2-081`, `p2-097`…`p2-101`) now carry `"stepId": "zephras-isle:056"`, so they join the Shen'dar arrival town stop. `joinHooks` attaches a hook with `stepId` to that step only. Step 001 has one tip instead: keep Stringy Wolf Meat and Linen Cloth.
- ✅ **Answered (playtest 2):** The Great Outdoors does **not** need Cooking. It was accepted, done (sat at Raan's fire about 60 s for Boosted Rest) and handed in at 8141–8209 s `/played`. Cooking was first learned at 8318 s. The Cooking hook note was corrected.
- **Camping 101** (from Raan Wildwind, 270 XP each): Cooking = learn Cooking (instant). First Aid / Fishing / Leatherworking = raise the skill to 20. Skinning was ready on accept, because the character already had it. The secondary ones (Cooking, First Aid) are route actions in town stop 1. The primary ones and Fishing are text only.
- Recipe reagents in Forever (Minor Healing Potion moved to First Aid) are not in our data yet. Record them from the trainer window next playtest.

---

## 5. Work items (in order)

1. ✅ **Fix** `stepIsShown` so **Show** reveals class-filtered steps. They open read-only ("Not for your character") and stay out of navigation and the map.
2. ✅ **Data fix:** Harvesting Windstones is accepted at town stop 2 and finished in the east field step.
3. ✅ **Re-author segment 01:** 59 steps → 19 (4 town stops, field steps, one step per class intro). Old ids are kept on the merged steps, so saved progress still matches.
4. ✅ **Field-step text:** replace the "Work through" generator output with counts + mob + area. Segments 01–07 (§9 for 03–07).
5. **XP callouts:** surface `sim.next.xpGap` before hubs/trainers ("31 XP to 6 · ~1 Vuldren"). Use live XP when synced. Hand-written XP-check tips are in place at town stops 2, 3 and 6 (§9).
6. ✅ **Professions:** hooks moved to Shen'dar (`stepId`), with a "keep in bags" tip on step 001. Playtest 3 showed no better place for any hook (§9.6).
7. ✅ **Speedrun:** score each quest with the grind-rate rule (§3) and mark the cuts `routes: ["balanced"]`. Segment 02 (§7.4) and segments 03–07 (§9.5): no quest falls under the grind rate, so the differences are order, hand-in timing and profession time, not cuts.
9. **Quest data:** Stolen Supplies (92551, Danarii Bellowveil, 525 XP, 10 Stolen Shen'dar Supplies from Al'Aketh Stormcallers) is missing from `quests.json`. ✅ It now comes from our own `tpf-db` (job C), and steps 086/097/098 have their quest actions back. Skypriest Aanders' NPC spawn (48.9, 54.6) is wrong: he was at the West Pylon Watchtower, 41.1, 64.1. Kuramaa's Stump (object 660848, 42.5, 68.9) is missing from `objects.json`.
8. **Quest rewards:** add reward items to the quest data so rule 3 (good gear) can be checked. AdventureLog 1.2.0 now records the reward choices; §9.5 uses them by hand, and `tpf-db` (job C) stores them.
10. **Open:** Hunter's Taming the Beast (94007) starts in Shen'dar (Elayaa Easewind, 45.3, 44.2) and needs level 10, but the route leaves Shen'dar at 9. It is not in the route. Decide whether Hunters get a trip back or the quest is left out.
11. **Open:** a "neither route" membership for story-only steps does not exist (`routes: []` falls back to both). Optional steps use `tags.optional` + `routes: ["balanced"]`, which the XP sim counts on Balanced (§9.7).

## 6. Next playtest: please capture
- Trainer windows (Cooking, First Aid) so the reagents are recorded.
- Whether Stolen Supplies (92551) is offered by Danarii only after Among the Faithful, or earlier.
- Export the AdventureLog after the session (`Export Adventure.bat`), or just leave it in SavedVariables. Either works for analysis.

---

## 7. Playtest 2: segment 02, Shen'dar Village (Shaman 6 → 9)

Sessions `20261126-1531-34b5` and `20261126-1814-5af9` (`/played` 7984 → 14721 s). `20261126-1327-17ae` and `20261126-1348-1c89` are about 50 minutes AFK in Thendal Grove with no events, and `20261126-1607-3d06` is a 1-minute login. None of them are counted. Active play: **110 min for levels 6 → 9** (ding 7 at 9504 s, 8 at 11103 s, 9 at 13692 s). **No deaths.** Last quest handed in: **A Last Request** (14678 s), then To Valanaar and Deliver the Signet were accepted at the same NPC. Everything from step 103 (segment 03) on is untouched.

### 7.1 What the log shows

| `/played` | Where | What happened |
|---|---|---|
| 7984–8817 | Shen'dar arrival (11.3 min) | Adventurer, Great Outdoors (campfire 68 s), four Camping 101s, five trainers, all eleven quest pickups. About 5 min of it is profession and vendor work. |
| 8817–9736 | West Highlands 39–40, 41–46 | 13 Prideclaws (10 pelts) + 12 Galestriders (8 meat, 3 eggs). Ding 7. |
| 9736–10101 | Town | Hand in Restocking + Prideclaws, then about 5 min of Leatherworking/vendor. Town is on the way from west to north-east. |
| 10346–11033 | Windsong Standing 46, 39 → Bandit camp/Hideout 47–51, 33–39 | 6 Apprentices, 18 Bandits + Bennic, 10 Windstones. **Grouped with other players in the Hideout.** |
| 11033–11344 | Town | Mages, Windstones, Criminal Element, Infiltrating the Cult → **ding 8 on the Sania hand-in**, accept Falaath Village, Shaman trainer. |
| 11344–12043 | South: Vulgara 42.6, 52.1 → hippogryphs 35–39, 50–54 | Vulgara, 7+ Youths, 7 Protectors, Matriarch 35.5, 54.2, 8 Down from the ground. First Aid reached 20. |
| 12043–12323 | Town | Hand in Down, Harassment, Vulgara, First Aid Camping. |
| 12323–12492 | **Falaath round trip** | Jasaan turn-in + wardrobe (48.9, 53.9), then **back to town**, only to hand in Among the Faithful to Aonda. |
| 12500–13201 | Windsong Lake | Fishing 1 → 20 (about 7 min), Camping 101: Fishing, then Among the Faithful hand-in, Havoc + Western Watch + Stolen Supplies pickups. |
| 13201–14001 | Falaath ruins 47–50, 53–59 | 19 Stormcallers, 6 Living Lightning, Cyclas 50.7, 56.7 (ding 9), 10 Stolen Supplies. |
| 14001–14262 | Western watchtower 42.3, 62.0 | Vaaniel, note, Skypriest Aanders at **41.1, 64.1**, walk back. |
| 14262–14721 | Town | Stolen Supplies, Havoc, A Last Request → To Valanaar + Deliver the Signet. About 6 min of vendor time first. |

### 7.2 Findings that changed the route

1. **51 one-NPC steps → 14 steps** (5 town stops, 4 field areas, Falaath, Western Watch, Shaman training, Fishing, Speedrun hand-ins). Merged steps keep an old id (056, 082, 083, 070, 071, 079, 090, 086, 097, 095, 098). New ids: `sr-handins-shendar-3`, `train-shaman-8`, `fishing-shendar`.
2. **Wrong locations in the old steps:** Restocking the Larders pointed to 35.5, 78.5 (the meat and eggs drop from Galestriders right next to the Prideclaws at 39, 43). Prideclaws pointed to 45.1, 52.7 (they are at 39–40, 41–46). Hippogryphs were at 38.3, 54.1 (Youths 38, 52; Protectors and Matriarch 35.5, 52–54).
3. **Wasted Falaath round trip (~3 min):** Among the Faithful only unlocks at Aonda, but Falaath Village is already in the log before the hippogryph field. The route now goes hippogryphs → Falaath (Jasaan + wardrobe) → town, so it's one trip out.
4. **Level 8 at town stop 3 only came from extra profession XP.** Two primary-profession Camping 101s (540 XP) and a little rested XP gave exactly level 8 on the last hand-in. Without them the sim lands at 7.76 (about 700 XP short). Training moved to town stop 4 (sim 8.54), with an XP-check tip at stop 3.
5. **Western Watch / A Last Request look like a long walk, but they're required:** To Valanaar and Deliver the Signet need both Havoc **and** A Last Request (QuestieDB `pre.group`).
6. **Town time was the biggest loss:** about 25 of the 110 minutes were vendor, profession training and crafting in Shen'dar. That's a player choice, but it is why Speedrun keeps profession lines out of the town stops except Cooking/First Aid Camping 101.
7. No deaths, so there are no danger tips. The Bandit Hideout was done in a group; the step says solo will be slower.

### 7.3 Grind rate (measured, mob kills only, gaps under 90 s between kills)

| Level | Kills | XP/kill | s/kill (incl. walking) | XP/min |
|---|---|---|---|---|
| 6 → 7 | 24 | 68 (first 2 rested) | 27.6 | ~150 |
| 7 → 8 | 29 | 58 | 24.2 | ~148 |
| 8 → 9 | 33 | 66 | 29.0 | ~140 |
| 9 (Falaath ruins only) | 15 | 60 | 21.5 | ~180 (dense pack, small sample) |

Speedrun threshold for 6–9: **~150 XP/min**.

### 7.4 Segment 02 scored with the rule

"Extra" = time on top of the route: walking, waiting, talking, pickups. Kills count as free.

| Quest | XP | Extra (from log) | XP/extra min | Verdict |
|---|---|---|---|---|
| The Adventurer | 410 | 0 (arrival) | — | keep |
| The Great Outdoors | 410 | 68 s campfire wait | ~360 | keep (+ Boosted Rest) |
| Camping 101: Cooking | 270 | ~10 s at Zerril (on the stop) | ~1600 | keep, both routes |
| Camping 101: First Aid | 270 | ~20 s Naleeia + bandages in downtime | ~500+ | keep, both routes (bandages save downtime) |
| Camping 101: Fishing | 270 | ~7 min fishing | ~40 | **Balanced only** (text step `fishing-shendar`) |
| Camping 101: primary professions | 270 each | at the trainer you visit anyway | — | text only; depends on the player's professions |
| The Next Step | 230 | 0 | — | keep |
| Welcome to Shen'dar Village + The Windshapers | 140 + 140 | ~160 s talking/innkeeper | ~105 | keep: **unlocks** every Shen'dar quest + Meddlesome Mages |
| Meddlesome Mages | 410 | 0 (Windsong Standing is on the way north-east) | — | keep |
| The Criminal Element / Pilfered Windstones | 480 / 475 | kills (~18 bandits) | — | keep |
| The Problem With Prideclaws / Restocking the Larders | 540 / 405 | kills | — | keep |
| Hippogryph Harassment | 630 | kills | — | keep |
| A Little Beauty | 475 | ~1 min of Down pickups | ~475 | keep |
| WANTED: Vulgara the Insatiable | 780 | ~50 s (one kill on the way) | ~900 | keep |
| Infiltrating the Cult | 70 | 9 s | — | keep: unlocks Falaath |
| Falaath Village + Among the Faithful | 350 + 350 | ~1 min with the new order (was ~3 min) | ~700 | keep: unlocks Havoc, Western Watch, Stolen Supplies |
| Havoc in the Highlands / Stolen Supplies | 700 / 525 | kills (~19 Stormcallers) | — | keep |
| The Western Watch + A Last Request | 350 + 530 | ~3.1 min detour | ~285 | keep (and required for To Valanaar) |

**Result:** nothing in segment 02 falls under ~150 XP/min. Speedrun changes are about order, not cuts:
- **Town stop 2** (Restocking + Prideclaws hand-ins only) is `["balanced"]`. Speedrun carries both to town stop 3 (step `sr-handins-shendar-3`), so it never stops in town only for hand-ins.
- Fishing is Balanced only. Primary-profession lines are text, not route actions.
- Rule amendment: a profession quest that is pure XP above the grind rate (Camping 101: Cooking) stays in Speedrun. The "no profession steps except First Aid" rule is about detours and grinding skill, not free XP.

---

## 8. Analyzed sessions

The next analysis skips these (AdventureLog session ids):

| Session | Content |
|---|---|
| 20261126-1142-ff01 | playtest 1 (login) |
| 20261126-1143-ff42 | playtest 1 |
| 20261126-1219-07ab | playtest 1 (reload) |
| 20261126-1219-07b4 | playtest 1 (reload) |
| 20261126-1220-07d3 | playtest 1 (reload) |
| 20261126-1221-0830 | playtest 1 (reload) |
| 20261126-1221-083b | playtest 1, levels 1–6 |
| 20261126-1305-1269 | playtest 1 (end, `/played` ≈ 4970 s) |
| 20261126-1327-17ae | idle / AFK, no play |
| 20261126-1348-1c89 | idle / AFK, no play |
| 20261126-1531-34b5 | playtest 2, levels 6–7 |
| 20261126-1607-3d06 | login only |
| 20261126-1814-5af9 | playtest 2, levels 7–9, ends after the A Last Request hand-in (`/played` 14721 s) |
| 20261126-1929-6c83 | idle / AFK in Shen'dar, no quest or kill events |
| 20261126-2012-767c | playtest 3, levels 9–13, Valanaar arrival → Making Our Move (part); 29 min AFK at Ayessa not counted |
| 20261127-0000-ac07 | login only |
| 20261127-0910-2d03 | playtest 3, levels 13–14, Making Our Move → The Earthen Ring, level 14 training (`/played` 31492 s) |

---

## 9. Playtest 3: segments 03–07, Valanaar to The Earthen Ring (Shaman 9 → 14)

Sessions `20261126-2012-767c` and `20261127-0910-2d03` (AdventureLog 1.2.0: XP source, quest givers and rewards, trainer spells, object use, group flags). `20261126-1929-6c83` (idle in Shen'dar) and `20261127-0000-ac07` (login) are not counted, nor the 29-minute AFK at Ayessa (`/played` 16809–18558). **Active play: about 217 min for levels 9.5 → 14** (ding 10 at active 17539 s, 11 at 20079, 12 at 22917, 13 at 24772, 14 at 30237). **Two deaths** (§9.4). Every quest was on Zephras Isle; the character did not board the skycutter, so the Mulgore hand-in is not play-tested.

### 9.1 What the log shows

Times are active seconds (`/played` minus AFK).

| Active | Where | What happened |
|---|---|---|
| 15939–16930 | Valanaar stop 1 (16.5 min) | Crab Season, hearth, Blood Tithe, Unnerving Silence, To Valanaar, Deliver the Signet, Bugged, Refugees + Loved One, Grand Skyseer/Adventure, Broken Construct 1–2, Unwelcome Spirits. 13 Skyhoppers (8 counted). **Death 1** (fall, 158 s). |
| 16930–18800 | Windfield Orchard (31 min) | Blood Tithe → MYU, Flutterfly Dust, Galestriders, What Is My Purpose?, Hills Have Eyes, Standing Our Ground. Air Construct Core at the bandit camp. Ding 10. |
| 18800–19283 | Shriekling Den → Valanaar stop 2 | Crystallized Lightning in the den, Deliver the News, Call of Fire, train 10. |
| 19283–19782 | Olariaan (51.2, 86.1) → Faladiel (64.4, 63.7) | Call of Fire 1, Faladiel's Heart (**grouped kill** with another player). |
| 20079–22923 | Northern hollows (47 min) | Elegael ×2 hand-in rounds, Vayn, Ban'aethal ruins, Nightclaw Cavern. Ding 11 at Elegael, 12 on the second round. ~2.5 min reading lore books. |
| 22923–23496 | Windsong Lake | Enchanted Gyrozephyr, 13 Crawlers for 6 Crab Meat. |
| 23496–24158 | Call of Fire 2–4 | Olariaan → Kuramaa (42.5, 68.9) → Olariaan → Eternal Flame to Valanaar (124 s). |
| 24158–24772 | Valanaar stop 3 | Train 12, eight hand-ins, ~4 min crafting by Nyalah. Ding 13 on the last hand-in. |
| 24772–25129 | A Firm Response round trip (6 min) | Belathaan at 59.9, 57.0; 2 Living Storms (0 XP). |
| 25129–26347 | East Pylon Watchtower (20 min) | Tower Defense, Disrupting Logistics, Breaking the Breaker, Blood for Blood (charms from the Brawlers here), Return to Valanaar. 14 kills before Disrupting Logistics was accepted. |
| 26347–27547 | Turncoat house + Valanaar stop 5 | Turncoat, Assassins, Unfortunate News, Cult's True Plans (2.5 min watching), Desperate Times, Prepare for Battle. |
| 27547–30226 | Shrine of Akir | Making Our Move across both sessions. **Death 2**, then **grouped**. |
| 30226–30953 | Sanctum, Rohashi Spires, Valanaar | Inner Sanctum (ding 14), Confront Lorthuna (grouped, Duke Anvillaxx elite 13), teleported back, Fate of Zephras, What Comes Next, The Earthen Ring, train 14. |

### 9.2 Findings that changed the route

1. **147 steps → 56** in segments 03–07, in the order the Shaman played: stop 1 → Windfield → stop 2 (+ Call of Fire 1, Faladiel) → northern hollows → Windsong Lake → (Call of Fire 2–4) → stop 3 → Firm Response → East Pylon → cult → finale → exit. The old route put the northern hollows last and Windfield Balanced-only. Segment files now follow that order: `05-northern-hollows.json` (new), `06-valanaar-defense-and-call-of-fire.json` and `07-the-cult-and-lorthuna.json` (renumbered), and `07-northern-hollows-and-departure.json` is gone.
2. **Merged ids** (each merged step keeps one old id): 103, 107, 110, 122, 124, 125, 127, 135, 136, 141, 142, 145, 146, 153, 155, 156, 167, 171, 174, 181, 183, 184, 186, 188, w2-94484-2, w2-93165-1, w2-93165-3, w2-94487-2, w2-93736-2, w2-94486-2, w2-94485-3, w2-94488-2, w2-94488-3, w2-93159-1, w2-93317-2, w2-98512-1, w2-98512-3. Kept as they were: the Shaman cof-1…cof-7 (rewritten), Warrior 163–165, Druid 118/119/160–162, 194. **New ids:** `shriekling-den`, `confront-lorthuna`, `leave-zephras`.
3. **Wrong locations in the old steps** (QuestieDB spawns were right; our `goto`s were not):
   - Blood for Blood (old 150) sent you to the Stormchasers in the north (63.8, 37.6). The charms dropped from **Al'Aketh Brawlers at the East Pylon** (64.5–67.4, 64.8–69.4), next to Disrupting Logistics.
   - Crab Season (old w2-93317-2) pointed to 42.7, 68.8. The Crawlers are at **Windsong Lake**, 52–55.5, 44–53.
   - Galestriders (old 127): 55.9, 72.6 → **49–53, 78–82.5**, east of the orchard. Flutterfly Dust (old 130): 50.4, 78.8 → 47–48.6, 77–79.5.
   - Feathers for Binding (old w2-94486-2): 52.4, 40.8 → **56–63, 36–41**. Unwanted / Mercy Falls: 60.2, 34.4 → 63–65.5, 36.5–39. Unwelcome Spirits / Refugees: 56.8, 34–35 → 57–58, 29–33. Al'Aketh Assassins: 53.5, 57.5 → 55.8–56.7, 59.3–61.
   - Aamelia Windfield stands at her house (46.7, 81.9, as in QuestieDB) **and** at the field edge (47.5, 78.5) at different times.
   - Bugged needs Deliver the Signet turned in first, so it is accepted on a second word with Valennia.
   - Only the Skyhopper with npc id 251727 counts for Bugged. 5 of 13 kills were on the other Skyhopper (251314).
4. **Round trips cut:** Bugged is handed in at stop 2 instead of a walk back east at stop 1 (~2 min). The Air Construct Core is picked up in the bandit-camp step. Kill the East Pylon mobs only after taking Disrupting Logistics (14 kills were wasted for it).
5. **Quest XP does not drop with level here.** Every turn-in paid QuestieDB's base XP (ratio 0.98–1.03), even level-9 quests at 13. Only kill XP drops (level 8–10 mobs give 32–59 XP at 13). The island stays worth questing to the end; see §9.5.
6. The sim tracked the log well: Balanced 14.33, Speedrun 14.14 at the last stop (with Stolen Supplies back as a quest action) (real: 14 at the Sanctum). Real play was about 0.4–0.5 levels ahead from Windfield on (profession Camping 101s in segment 02, rested XP, extra kills).
7. **Training:** 10 at stop 2 (sim 10.27), Shaman 12 at Sessaria after Call of Fire (sim 12.15–12.41), other classes 12 at the **end** of stop 3 (without Call of Fire the Speedrun sim arrives at exactly 12.0), 14 at the last stop (both sims reach 14 at the Sanctum, Speedrun at 14.03).
8. **Grouped:** Skypriest Faladiel (another player), the Shrine of Akir after death 2, the Inner Sanctum and the Rohashi Spires (Duke Anvillaxx, elite 13). Those kills are left out of the grind rate, and the steps say solo will be slower.

### 9.3 Grind rate (solo, tracked kills only, gaps under 90 s)

| Level | Kills | XP/kill | s/kill (incl. walking) | XP/min |
|---|---|---|---|---|
| 9 (Skyhoppers only, grey) | 16 | 26 | 22.1 | ~70 |
| 10 | 33 | 65 | 30.6 | ~127 |
| 11 | 54 | 82 | 39.2 | ~125 |
| 12 (Windsong Crawlers, small sample) | 10 | 43 | 24.7 | ~106 |
| 13 (21 grouped kills left out) | 47 | 38 | 20.3 | ~111 |

**Island grind rate at 10–13: ~115–125 XP/min.** It falls because the island mobs are 1–4 levels below you. On-level mobs paid 95 XP at 10 and 100 at 11 (= 45 + 5 × level), so **grinding on-level mobs elsewhere at 13 would be ~110 XP per ~30 s ≈ 200–220 XP/min**. That is an estimate, not measured: it is the bar for "leave the island now".

### 9.4 Deaths

| # | Where | What killed you | Lost | Tip |
|---|---|---|---|---|
| 1 | 60.1, 81.2, south edge of Valanaar below Ayessa (level 9) | No enemy in combat, `killers` empty, after a 30 s walk south-west from 63.2, 78.8: most likely a **fall** off the ledge | 158 s corpse run | step 107: walk around the edge |
| 2 | 59.4, 51.3, west entrance of the Shrine of Akir (level 13) | **Two Al'Aketh Spiritcallers** (level 10) at once | 36 s | step 183: pull one at a time, Spiritcallers first |

### 9.5 Drops, pickups and the per-quest Speedrun score

Drop rates (kills of that mob while the quest was in the log, against items received):

| Quest | Item | Mob | Kills | Items | Drop % | First kill → done | Tail | Verdict |
|---|---|---|---|---|---|---|---|---|
| Ornery Ornery Galestriders | Lowlands Galestrider Tenderloin | Ornery Galestrider (8–9) | 19 | 7 | **37%** | 11.1 min | 11 min (all of it after the orchard) | keep: ~130 XP/min during the tail = grind rate; boots/bracers/pants |
| The Hills Have Eyes | Blood-Stained Bandit Mask | Bandit Highwayman | 10 | 7 | 70% | 5.3 min | 0 | keep |
| Unwanted and Unworthy | Bloody Heirloom | Al'Aketh Stormchaser / Footsoldier | 12 (11 looted) | 10 | 83% (91% of loots) | 7.5 min | 0 | keep |
| Mercy Falls on Deaf Ears | Al'Aketh Cultist's Ear | same mobs | 14 (13 looted) | 5 | **36%** | 8.3 min | 1.6 min after the heirlooms | keep |
| Feathers for Binding | Pristine Shriekling Feather (2–4 per drop) | Shadowgale Shriekling | 13 | 20 (7 drops) | 54% of kills | spread over 38 min of other work | — | keep |
| Unwelcome Spirits | Wind Hollow Essence | Wind Hollow (10–11) | 28 | 10 | **36%** | 16 min | 11 min after the Belongings | keep: Wind Hollows give ~92 XP, ~159 XP/min during the tail |
| Crab Season | Windsong Crawler Meat | Windsong Crawler (8–9) | 13 | 6 | 46% | 7.3 min | 5.5 min after the Gyrozephyr | keep: ~1.5 extra min → ~400 XP/extra min |
| Blood for Blood | Al'Aketh Windstone Charm | Al'Aketh Brawler (+1 Pillager) | 20 | 10 | 50% (53% of loots) | 12.4 min | 0.4 min | keep |

Ground and object pickups: Ripe Stormapple 10/10 pickups in 4.9 min (46–47, 79–80); Flutterfly Dust 5/5 in 4.6 min (47–48.6, 77–79.5); Lady's Tear Moss 8/8 spread over 12 min (58.8–62.2, 36.4–40.4); Abandoned Belongings 9 pickups for 8 in 7.5 min (56.7–58.7, 27–33.5); Construct Parts 4 piles for 3 parts (the Shriekling Den has two; the second gave the part). None needed a respawn wait.

Per-quest score ("extra" = time on top of the route; kills count as free unless the mob is grey):

| Quest(s) | XP | Extra (from log) | XP/extra min | Verdict |
|---|---|---|---|---|
| To Valanaar, Deliver the Signet | 570 | 0 (arrival) | — | keep |
| The Grand Skyseer + A Grand Adventure | 170 | ~1.5 min (listening) | ~110 | keep: unlocks Broken Construct, Unwelcome Spirits |
| Bugged | 700 | ~3 min (Skyhoppers give 6 XP) | ~230 | keep |
| Unnerving Silence | 220 | 0 (carried north) | — | keep: unlocks Elegael's six quests |
| Windfield: Blood Tithe … Deliver the News (8 quests) | 4,140 | whole block 31 min at 226 XP/min incl. kills | — | **keep, both routes** (was Balanced only); the Air Construct Core is there anyway |
| The Broken Construct ×3 | 1,975 | ~3 min (Shriekling Den, pickups) | ~650 | keep: required for A Firm Response |
| Call of Fire ×4 (Shaman) | 3,170 | ~20 min of walking | ~160 | keep: Fire Totem (class spell) |
| Northern hollows (Elegael ×6, Vayn, Ban'aethal ×3, Fate of the Den) | 9,560 | whole block 47 min at 234 XP/min incl. kills | — | keep |
| Tears of the Lady | 230 | ~1.5 min of moss | ~150 | keep: unlocks Ties / Wounds / Missive (2,675 XP) |
| Crab Season | 600 | ~1.5 min | ~400 | keep |
| A Firm Response | 600 | 6 min round trip | ~100 | keep: unlocks In Service, Tower Defense, Blood for Blood; Windshaped Shield |
| East Pylon chain (6 quests) | 2,840 | block 20 min at 155 XP/min incl. kills | — | keep: bracers, gauntlets, a weapon; unlocks the cult chain |
| The Turncoat, Al'Aketh Assassins, Unfortunate News | 2,055 | 11 min at 327 XP/min incl. kills | — | keep |
| The Cult's True Plans, Desperate Times, Prepare for Battle | 1,550 | ~8.7 min (watching, talking) | ~180 | keep: unlocks the finale; chest reward |
| Making Our Move, The Inner Sanctum, Confront Lorthuna | 2,260 | ~20 min grouped at 185–240 XP/min incl. kills | — | keep: Empyrean gear (slower solo) |
| The Fate of Zephras, What Comes Next | 920 | 3.8 min | ~360 | keep |

**Result: no quest in segments 03–07 falls below the grind rate** that is not also a chain unlock, a gear upgrade or a class spell. Speedrun cuts nothing here. The Speedrun/Balanced differences are crafting time (the Nyalah tip) and the unplayed Strange Hermit chain (Balanced, optional).

### 9.6 Professions

Skinning 72 → 81 on the way (Galestriders), and ~4 min of crafting next to Nyalah in Valanaar (Leatherworking 39 → 49, First Aid 32 → 44, Cooking 16 → 17). Nyalah's trainer window had nothing new at 9 or 12. Crab Season rewards Recipe: Pincer Bites. No hook moves: the log shows no better place than the Shen'dar town stop (`zephras-isle:056`).

### 9.7 Where each route leaves the island

- **Both routes exit at the same step**, `leave-zephras`, after The Earthen Ring is accepted (sim: Balanced 14.33, Speedrun 14.14; real: 14, reached at the Sanctum of Storms). Next: skycutter to Mulgore (step 194, not play-tested), then the Crossroads and `barrens-12-20` (pack.json `next` and `nextByRoute` are both `barrens-12-20`).
- Why not earlier: island quest XP did not drop with level (§9.2.5), and every remaining block paid at or above the off-island estimate (~200–220 XP/min, §9.3) or unlocked one that did. The weakest link, Cult's True Plans + Desperate Times (~180 XP/extra min), unlocks the finale, which paid ~200–360 XP/min and the Empyrean gear.
- **Story note:** the route already covers the whole story up to The Earthen Ring, so there is no "story continuation" after the exit. What's left on the island is the Strange Hermit chain (`w2-93159-1`, Balanced, `tags.optional`, label "Not play-tested", 1,590 XP by QuestieDB), More Al'Aketh Ears (not offered or not taken; not in the route), A Sacrifice in Vain (the alternative breadcrumb to Elegael) and other classes' class quests.
- The guide's only optional mechanism is `tags.optional` (hidden when "show optional" is off; shown by default). It needs a route membership, and `routes: []` means both routes, so a step cannot belong to neither. To show story-only steps outside both routes, the guide would need a third membership (e.g. `routes: ["story"]` shown only with "show optional") that the XP sim skips.
- pack.json: title "Zephras Isle 1-14 (Horde Skyborne)", levels [1, 14].
