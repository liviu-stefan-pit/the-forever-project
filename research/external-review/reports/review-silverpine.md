# FAIL — silverpine-11-15

File `research/nova/v2/silverpine-11-15.json`. Map ids 1421 / 1458. JSON parses; `n` is 1–54 with no gaps; balanced and speedrun are exclusive `routes` (no mixed membership); speedrun has 445, 421, 428, 6321 (Undead filter), 435, 429, 449, 3221, 1359; Wild Hearts text does not give a heart count; 92401 is tip-only; 422 / 437 / 447 / 481 / 6323 are not required actions. Prerequisites inside the file are in order. Exit coordinates are Karos Razok 45.62, 42.6, not 60.7, 58.8.

## Defects

- **silverpine-11-15:038** (n=37): turn-in of 1359 and accept of 1358 are a goto on Undercity (map 1458, 50.14, 67.97) *before* the Silverpine leave step. The player is already in Undercity.
  - Smallest fix: run **silverpine-11-15:036** first (Karos Razok 45.62, 42.6 on map 1421), then 038.

- **silverpine-11-15:sr15** / **silverpine-11-15:sr16**: sr15 already gotos Undercity and turns in 1359; sr16 then gotos Karos Razok 45.62, 42.6. That is a rewind, not a fly-out.
  - Smallest fix: keep 1359 accept at Renferrel on sr15; move the Undercity 1359 turn-in and 1358 accept onto sr16 *after* the Karos goto (fly, then Zinge).
