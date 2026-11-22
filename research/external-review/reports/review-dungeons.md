Sources: Questie `content/questie-db/quests.json` (plus npcs/items). Target `research/dungeons/steps-v2.json`.

# FAIL

Edited dungeon pack vs Questie. Step `n` is 1–622 contiguous. Blackmaw 92065 has accept and turn-in on Gatekeeper Rageroar 236573. Torch 3443–3481 plus 4022–4024 is balanced-only. 3380 sits before 3444 on balanced. 6922 is drop-gated. RFC stops at 5730 with no class-weapon follow-up. Required clears are present. Defects below are only the edited quests that still fail the absent / remain rules.

- `dungeons:ragefire-chasm:run` / 5725: run still has two `collect` actions (items 14395, 14396, The Power to Destroy...). Questie starts 5725 on Varimathras 2425 in Undercity; this pack dropped the accept and turn-in. Smallest fix: delete both 5725 collect actions.

- `dungeons:wailing-caverns:run` / 1491: run still has a `collect` for Wailing Essence. Questie 1491 `pre.single` is 865, which this pack already refuses. Smallest fix: delete the 1491 collect action.

- `dungeons:wailing-caverns:accept:6981` / 6981: required accept at `n` 25, before the run (`n` 26). Questie starts 6981 from item 10441 (Glowing Shard). Remain rule is shard only if it drops (same pattern as 6922 after the BFD run). Smallest fix: move this step to immediately after `dungeons:wailing-caverns:run`; text: "If the Glowing Shard drops on this clear, accept The Glowing Shard. Do not reset for it." On `dungeons:wailing-caverns:turnin:6981`, add "if you accepted it."

- `dungeons:forever:ruins-of-lordaeron:accept:92421` / 92421: accept and `dungeons:forever:ruins-of-lordaeron:run` never say to stop after one clear. Questie 92421 is 25 Intact Limbs for Morbin Lightbane 266484. Smallest fix: on the run step, add "Loot 25 Intact Limbs on this one clear. Do not extra-pull if you are short after that clear."

- `dungeons:forever:ruins-of-lordaeron:accept:97288` / 97288: required accept from Abominable Head, no drop gate. Questie starts 97288 from item 280438. Remain rule is only if the head drops. Smallest fix: rewrite like 6922 ("If the Abominable Head drops on this clear, accept Unending Torment. Do not reset for it.") and on `dungeons:forever:ruins-of-lordaeron:turnin:97288` add "if you accepted it." Prefix `dungeons:forever:ruins-of-lordaeron:accept:97289` with "If you turned in Unending Torment" (same skip as 3369).

- `dungeons:forever:ruins-of-lordaeron:accept:95204` / 95204: required accept from Crest of Lordaeron. Questie starts 95204 from item 275521. Remain rule is only if the crest drops. Smallest fix: rewrite like 6922 ("If the Crest of Lordaeron drops on this clear, accept Crest of Lordaeron. Do not reset for it.") and on `dungeons:forever:ruins-of-lordaeron:turnin:95204` add "if you accepted it."

- `dungeons:forever:hall-of-thanes:accept:96395` / 96395: Hall of Thanes accept is still in the pack. Questie zone is The Hall of Thanes (Alliance). Smallest fix: drop this step.

- `dungeons:forever:hall-of-thanes:run` / 96395: Hall of Thanes run is still in the pack. Smallest fix: drop this step.

- `dungeons:forever:hall-of-thanes:turnin:96395` / 96395: Hall of Thanes turn-in is still in the pack. Smallest fix: drop this step (last three `n` values; remaining `n` stays 1–619 contiguous).

- `dungeons:gnomeregan:run` / 2904: tip is "Run Gnomeregan once and finish Rig Wars and A Fine Mess." That tells the player to do 2904. Questie 2904 starts on Kernobee 7850, spawn zone 721 at -1,-1; accept and turn-in are already absent. Smallest fix: rewrite to "Run Gnomeregan once and finish Rig Wars." Optional allowed tip only: "If you find Kernobee during this one clear, escort him out and turn in to Scooty. Do not search for him, and do not reset." Do not name 2904, 2949, or 2950.

- `dungeons:uldaman:run` / 2855: run still has two `collect` actions (Thick Armor Kit, Wildvine). Questie 2855 is Feralas leatherworking (`pre` 2854, Jangdor 7854); accept and turn-in are already dropped. Smallest fix: delete both 2855 collect actions.

- `dungeons:sunken-temple:run` / 8413: run still has three `collect` actions for Da Voodoo feathers. Questie 8413 `pre.single` is 8412, which is absent; 8425 already collects the same three feathers. Smallest fix: delete the three 8413 collect actions.

- `dungeons:sunken-temple:accept:3380` / 3380: accept is `balanced` only. `dungeons:sunken-temple:accept:3444` is `balanced`+`speedrun`. Questie 3444 `pre.single` is 3380 or 3445; 3445 is not in this file. Remain rule is 3380 before 3444. Smallest fix: put `dungeons:sunken-temple:accept:3380` and `dungeons:sunken-temple:turnin:3380` on both routes, keep them immediately before 3444.

- `dungeons:stratholme:run` / 6163: run still has a `collect` for Head of Ramstein the Gorger. Questie 6163 `pre.group` is 6135 and 6136; 6135 is already dropped. Smallest fix: delete the 6163 collect action.
