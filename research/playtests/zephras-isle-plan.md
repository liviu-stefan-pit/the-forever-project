# Zephras Isle route rework — plan (playtest 1: Shaman, levels 1–6)

Source: AdventureLog of **Nero Clover** (Windshaper Skyborne Shaman), session of 2026-11-26.
`/played` 34.5 → 82.8 min for levels 1 → 6, all of it in segment `01-rorians-camp`. The 34 minutes before the first quest are character creation and idle time. They are not counted.
Segments 02–07 have not been played yet. This plan rebuilds segment 01 from real data and sets the rules the other segments will follow once they are played.

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

- Move the six hooks from `zephras-isle:001` to the Shen'dar arrival hub (step 056/058 area). Replace them at 001 with the single line "Keep: Stringy Wolf Meat, Linen Cloth".
- **To verify in game:** the Cooking note says "Camping needs skill 20" and **The Great Outdoors (campfire, step 059)** comes right after arriving. If Camping really needs Cooking 20, the Shen'dar hub must be: train Cooking at Zerril → cook the carried meat to 20 → *then* the campfire. Raan's camp (41.7, 44.8) is about 2 yards from Zerril, so it costs almost nothing. Unconfirmed: check it on the next playtest.
- Recipe reagents in Forever (Minor Healing Potion moved to First Aid) are not in our data yet. Record them from the trainer window next playtest.

---

## 5. Work items (in order)

1. ✅ **Fix** `stepIsShown` so **Show** reveals class-filtered steps. They open read-only ("Not for your character") and stay out of navigation and the map.
2. ✅ **Data fix:** Harvesting Windstones is accepted at town stop 2 and finished in the east field step.
3. ✅ **Re-author segment 01:** 59 steps → 19 (4 town stops, field steps, one step per class intro). Old ids are kept on the merged steps, so saved progress still matches.
4. **Field-step text:** replace the "Work through" generator output with counts + mob + area (all segments).
5. **XP callouts:** surface `sim.next.xpGap` before hubs/trainers ("31 XP to 6 · ~1 Vuldren"). Use live XP when synced.
6. **Professions:** move hooks to Shen'dar; "keep in bags" line before that.
7. **Speedrun:** after playtest 2 (segments 02–03), score each quest with the grind-rate rule (§3) and mark the cuts `routes: ["balanced"]`.
8. **Quest rewards:** add reward items to the quest data so rule 3 (good gear) can be checked.

## 6. Next playtest: please capture
- Whether The Great Outdoors needs Cooking 20.
- Trainer windows (Cooking, First Aid) so the reagents are recorded.
- Export the AdventureLog after the session (`Export Adventure.bat`), or just leave it in SavedVariables. Either works for analysis.
