# PASS

Re-check of `research/dungeons/steps-v2.json` against the prior FAIL. JSON parses. `n` is contiguous 1–619 (619 steps). The listed defects are gone. No smallest fix.

## Checks

1. **No collect or accept for 5725, 1491, 2855, 8413, 6163** — none of those `questId`s appear on any action. No accept/collect/turn-in step ids for them. RFC run collect is 5761 only. WC run collects are 1486/959/962. Uldaman run has no 2855. ST run feather collects are `questId` 8425 only. Stratholme run has no 6163 collect.

2. **Hall of Thanes / 96395 gone** — no `dungeons:forever:hall-of-thanes:*` step and no 96395 accept, run, or turn-in.

3. **6981 after the WC run, drop-gated** — `dungeons:wailing-caverns:run` is n 25. `dungeons:wailing-caverns:accept:6981` is n 26: "If the Glowing Shard drops on this clear, accept The Glowing Shard. Do not reset for it." `dungeons:wailing-caverns:turnin:6981` says "only if you accepted it."

4. **Ruins one-clear limbs** — `dungeons:forever:ruins-of-lordaeron:run` (n 545): "Loot 25 Intact Limbs on this one clear. Do not extra-pull if you are short after that clear."

5. **97288 / 95204 drop-gated; 97289 skip prefix** — `accept:97288`: "If the Abominable Head drops on this clear, accept Unending Torment. Do not reset for it." `turnin:97288`: "only if you accepted it." `accept:95204`: "If the Crest of Lordaeron drops on this clear, accept Crest of Lordaeron. Do not reset for it." `turnin:95204`: "only if you accepted it." `accept:97289` starts with "If you turned in Unending Torment."

6. **Gnomeregan** — `dungeons:gnomeregan:run` body is "Run Gnomeregan once and finish Rig Wars." It does not tell the player to do A Fine Mess and does not name 2904, 2949, or 2950. Kernobee is a tip only: "If you find Kernobee during this one clear, escort him out and turn in to Scooty. Do not search for him, and do not reset." A second tip says skip 2945 if the ring does not drop; 2945 is not a step.

7. **3380 before 3444 on both routes** — `dungeons:sunken-temple:accept:3380` (n 185) and `turnin:3380` (n 186) have routes `balanced` and `speedrun`. They sit immediately before `dungeons:sunken-temple:accept:3444` (n 187).

8. **Allowed / absent steps** — 8425 feather collects remain on the ST run. 2904, 2949, 2950, 2945, 96984 are not steps.

## Smallest fix

None. Leave the file as-is.
