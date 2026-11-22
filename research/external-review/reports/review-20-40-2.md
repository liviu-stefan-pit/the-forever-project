# PASS

Re-check of `research/levels-20-40.route-v2.json` after the small fix. JSON parses. `n` is contiguous 1–656 (656 steps). No route JSON was edited.

## Checks

1. **Not actions** — 545, 544, 95748, 95770, 95773, 629, 6563 have no accept/complete/turn-in and no `questId` action. 6563 remains only as source text on `horde-20-40:accept-6562` and a “Do not accept 6563” tip on `horde-20-40:turnin-25`.

2. **Must remain**
   - **6382** accept `horde-20-40:accept-6382` (n 48) and turn-in `horde-20-40:turnin-6382` (n 49).
   - **676** accept/complete/turn-in `horde-20-40:accept-676` through `turnin-676` (n 246–248).
   - **6562** accept `horde-20-40:accept-6562` (n 81), then turn-in `horde-20-40:turnin-6562` (n 82) to Je'neu at 11.56, 34.29, map 1440.

3. **`horde-20-40:complete-201`** routes `["balanced"]` only. Matches `horde-20-40:accept-201` (n 408) and `horde-20-40:turnin-201` (n 413).

4. **No leftover complete/turn-in without accept** — none of 6282, 6283, 6284, 1058, 1087, 1088, 1089, 6441, 6504, 6544, 6571, 6641, 6482, 6621, 247, 2, 23, 24, 1090, 6393, 6421, 6462, 6581 have complete or turn-in (and none have accept).

## Smallest fix

None. Leave the file as-is.
