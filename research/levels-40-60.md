# Horde 40–60 leveling route (solo-first)

Project Forever, Horde only, levels 40 to 60. This file is the route decision for the solo-first overhaul. It is a peer of `research/levels-20-40.md` and `research/nova/ROUTE_1_20.md`. Wording is original. Quest names, ids, coordinates, and decisions only. Forever-new content stays unverified until someone checks it in game.

Authority: `docs/ROUTE_SCHEMA.md`, `docs/DESIGN.md`, `docs/PROVENANCE.md`, `research/dungeons/README.md`, `research/levels-20-40.md`. Hotfix facts below cite [WoW Forever hotfixes — November 20, 2026](https://news.blizzard.com/en-us/article/24315281/wow-forever-hotfixes-november-20-2026).

## Product rules

The default route is fully solo to 60. Dungeons appear only when the existing **Include dungeons** profile toggle is on. Do not invent a group-quests toggle.

Outdoor elites and group quests use the existing conventions: `elite[].groupSize` plus elite tips. Skippable extras sit on `routes: ["balanced"]` and/or `tags.optional` (profile **Show optional**). Class-soloable exceptions use `classes` / `filter`. They are not default-required.

Authoring: edit the catalog monolith `research/catalog/horde-40-60.route.json`, then split-pack. Do not re-run `research/horde-40-60/tools/build.py`.

Dungeon steps are authored only in `research/dungeons/` and spliced from `research/dungeons/integration-plan.json` `afterStepId` anchors. Never paste instance quests into leveling packs.

## Handoff

`horde-20-40` pack 07 ends at the fly from Rog'mar to Kargath (`h4060:riverglades:fly-9c1b4f`). This route starts at step id `h4060:badlands:a1419`. Quest overlap with 20–40 is zero. The mount-at-40 note already lives on 20–40 pack 07. 40–60 assumes mounted travel.

## Zone order (dungeons off)

This is the outdoor order. Arathi, Hillsbrad, and Dustwallow are dropped or heavily trimmed from the balanced route unless `xp:sim` (dungeons off) fails a pack level gate without them.

- **40–42 Riverglades.** Rog'mar, Powderfuse, Bolder'ok (non-elite), Eastsea.
- **42–44 Riverglades finish + Shen'dralas.** Strange Pylons → Fragments → Powering the Pylons → A Heart of Crystal. Mana Mania and similar quests are optional or balanced-only, with elite tips. Ferry Powderfuse (80.6, 54.6) ↔ Steamwheedle Port (68.6, 23.0).
- **44–46 Tanaris pass 1 + Feralas.** Wastewander, Southsea, Water Survey. Skip a repeat of Water Pouch Bounty (0 XP after 16 Nov). Camp Mojache: Woodpaw, Gordunni, On the Other Side. Bind Gadgetzan and Mojache with `type: home`.
- **46–49 Tanaris pass 2 + Hinterlands coast.** Dunemaul Compound (Gor'marok respawn sped 20 Nov) and Thistleshrub. Hinterlands is coastal / Revantusk only. Jintha'Alor (Kidnapped Elder Torntusk 7845, Recover the Key 7846, and the rest of that chain) is optional or balanced, with elite tips. Quest gold starts on most 48+ quests (11 Nov). Do not bank turn-ins for 60.
- **49–52 Searing Gorge, Blasted Lands, Un'Goro.** Thorium Point, Blasted Lands buff-item quests, Un'Goro Marshal's Refuge loop. Bank Un'Goro power crystals only as a note for Shaper's Terrace when dungeons are on.
- **52–55 Felwood + Azshara.** Bloodvenom and Timbermaw to Neutral so the tunnel is usable later. Expanded Azshara outdoor: Valormok, Jediga, Ursolan / Legashi. Blackmaw Hold is dungeon-toggle only.
- **55–57 Plaguelands + Winterspring.** Western Plaguelands Bulwark and cauldrons, Eastern Plaguelands non-elite, Winterspring / Everlook. Bind Undercity, then Everlook.
- **57–60 Mount Hyjal.** Enter via Darkwhisper Gorge. Grab the Tainted Foothills flight path first. Hyjal demon elites, Eastern Plaguelands named elites (Araj, Borelgore, Duskwing), and Winterspring Shy-Rotam / High Chief Winterfall are optional or balanced, with elite tips. Silithus and an owlbeast XP grind are used only if the XP sim still needs a close.

## Hearth and flight paths

The current 40–60 JSON has 0 `home` actions and 0 `fp` actions. Hubs that need `type: home` and/or `type: fp`, plus a `goto` before each fly:

Gadgetzan, Camp Mojache, Revantusk, Thorium Point, Marshal's Refuge, Bloodvenom, Valormok, Everlook, Tainted Foothills, Summit of Eternity, Cenarion Hold, Light's Hope, and Rog'mar if it is not already bound.

Powderfuse: treat it as having no Horde flight master until that is verified in game. Ride to Rog'mar. See Unverified claims.

## Outdoor elites

Do not delete these from the repo if they are already present. Later phases tag them `tags.optional` and/or `routes: ["balanced"]`, and fill elite tips.

**Skip or optional / balanced**

- Jintha'Alor chain (including 7845 Kidnapped Elder Torntusk, 7846 Recover the Key).
- Shen'dralas Mana Mania.
- Riverglades: Twilight No More / Chogg'Zac, WANTED: Old Rot-Chum, Bring Me His Head / Crag'rog.
- Hyjal: Head Scratcher, Flags of Our Forebears, Ve'han's Fall, Blackthorne Blackout, Bait the Beast, Yashiro's Windwalk / Doomguard Xarkul.
- Felwood: Verifying the Corruption.
- Winterspring: Shy-Rotam, High Chief Winterfall.
- Eastern Plaguelands: Duskwing, The Corpulent One, Alas, Andorhal.
- Burning Steppes: WANTED: Overseer Maltorius.
- Azshara: Ley of the Land, Blackmaw Counter-Offensive, The Name of the Beast.
- Un'Goro: It's Dangerous to Go Alone / Blazerunner.
- Dustwallow: Challenge Overlord Mok'Morokk.
- Badlands: Broken Alliances.
- Stranglethorn: The Mind's Eye, Facing Negolash, King Mukla.

**Class-soloable** (`classes` / `filter`, not default-required)

- Bloodmaster's Ring chain at Bolder'ok: hunters, warlocks, and mages at level; melee later.
- Gammerita: hunter-leaning.
- Ursius / Brumeran: hunter pet-tank.
- Deathclasp: hunter.

**Stays on the solo route**

- Gordunni Cobalt is not elite.
- Dunemaul Compound is solo around 48.

**Tuned down (safer solo; can stay if non-elite)**

- 11 Nov, Riverglades: Twilight Enforcer Smash, Executioner Morg, and Forgemaster Mark of Flames, smash damage 1000 → 50.
- 17 Nov, Shen'dralas: pylon credit is party-shared; Decrepit Pylon Protectors cast less.

**Not tuned:** Jintha'Alor, Hyjal demons, Winterspring named elites.

## Grind fallbacks

Use these only if the XP sim still has a gap. Classic XP/hour numbers are ceilings. Forever AoE is weaker. Do not grind Water Pouch Bounty (0 XP after 16 Nov).

| Levels | Spot |
|---|---|
| 40–43 | Stranglethorn raptors |
| 41–45 | Badlands Dustbelcher / rock elementals |
| 42–45 | Woodpaw |
| 45–48 | Lost Rigger Cove / Frayfeather |
| 47–51 | Ravenwind harpies |
| 48–50 | Thistleshrub / Dunemaul |
| 50–55 | Azshara Legashi |
| 51–54 | Western Plaguelands Sorrow Hill / Un'Goro tar |
| 54–56 | Deadwood / Kel'Theril |
| 55–60 | Winterfall / owlbeasts |

Grind steps that stay need `type: xp`. The current grind stub does not.

## Dungeons (toggle on only — later phase, do not implement here)

Run each once, from `research/dungeons/` anchors:

- Krol'dok Stronghold ~42–44.
- Zul'Farrak once, including Gahz'rilla (Carrot on a Stick) ~44–46.
- Maraudon ~47–48.
- Alcaz Prison ~51.
- Sunken Temple ~51, with the level-50 class quest. Forever gives all three rare class-quest items except Undead Paladin, who is locked out of Chillwind Point.
- Dire Maul East ~54–55.
- Blackrock Depths, 1–2 clears, ~55–57.
- Blackmaw Hold ~57–58.
- Shaper's Terrace ~58–59 (needs the banked Un'Goro crystals).

Skip Uldaman, Razorfen Downs, and Scarlet Monastery at 40+ unless the player is already stacked on them. Skip Lower Blackrock Spire, Upper Blackrock Spire, Stratholme, Scholomance, and Dire Maul West and North until 60, except where the existing plan already places Scholomance and Stratholme at 60.

## Hotfixes

From the 20 Nov 2026 Blizzard hotfix article, plus the dates named in that article's window. 18–22 Nov had no outdoor XP formula change.

- **9 Nov.** Dungeon kill XP +50%.
- **11 Nov.** Most quests at level 48 and above pay gold. Do not bank those turn-ins.
- **11 Nov.** Riverglades elite smash values above (1000 → 50).
- **13 Nov.** Trivial dungeon mobs grant 0 XP if anyone in the party greys them. Later clarified to about 12 levels.
- **16 Nov.** Water Pouch Bounty grants no XP. No Soldier Left Behind gives party credit. Screecher Spirits moved.
- **17 Nov.** Cozy Sleeping Bag cannot be used while mounted. Shen'dralas pylon credit is party-shared. Agamaggan's Blood moved outdoors.
- **20 Nov.** Witch Doctor Ti'ik multi-drop. Gor'marok respawns faster. Perfect Yeti Hide does not re-drop. Dungeon enter cap is 5 per hour.

## Unverified claims

Flag only. Do not treat these as design rules.

- Kill XP formula `(45 + 5 × mob level) × (1 − level diff / ZD)` and the ~7% green-mob penalty: the citation in the source PDF was a broken or unknown URL.
- "Dungeon kill XP is 60% of Classic Era" is disputed by community logs. The +50% dungeon kill XP on 9 Nov is the Blizzard fact; the 60% baseline is not.
- A Skyborne 10% apprentice riding discount without Honored is community-reported and contradicts another thread.
- A flight master at Powderfuse is disputed. Route text says none; a third-party map says yes. Prefer no Horde flight path at Powderfuse until verified. Ride to Rog'mar.
- Hyjal "~400,000 XP" is a zone pool, not XP this route earns.
- No timed run exists. Do not claim a speedrun time.

## Gaps later phases must close

Counts on the current 40–60 packs (~1807 steps), as of this research pass:

- 0 `home` / hearth steps, 0 `fp` steps.
- ~139 `complete` actions, against ~393 in 20–40.
- 0 `tags.optional`, 0 `classes` / `filter`.
- Elites often have empty tips.
- Grind stub has no `type: xp`.
- `integration-plan.json` drops Alcaz, Sunken Temple, Blackrock Depths, Dire Maul East, and Gahz'rilla, and has empty `replaces`.
