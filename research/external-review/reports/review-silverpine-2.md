# PASS — silverpine-11-15 (fly-out reorder)

File `research/nova/v2/silverpine-11-15.json`. JSON parses. `n` is 1–54 with no gaps. The prior FAIL is gone: balanced flies from Karos before the Undercity 1359 turn-in, and speedrun no longer rewinds to Karos after Undercity.

## Balanced

- **silverpine-11-15:037** (n=21): accept 1359 at Renferrel, Silverpine.
- **silverpine-11-15:036** (n=37): Karos Razok goto 45.62, 42.6, map 1421 (fly-out).
- **silverpine-11-15:038** (n=38): Undercity map 1458, turn-in 1359, accept 1358.

Karos is before the 1359 turn-in. 1359/1358 are in Undercity after the flight. No later Karos step on this route (002/006 are the early FP and Undead 6321 turn-in, both before 038).

## Speedrun

- **silverpine-11-15:sr15** (n=53): accept 1359 at Renferrel, then Karos Razok 45.62, 42.6, map 1421.
- **silverpine-11-15:sr16** (n=54): Undercity map 1458, turn-in 1359, accept 1358.

No Karos step after Undercity (sr02/sr05 are the early FP and Undead 6321, both before sr15).

## Other gates

- Wild Hearts (010/015/021, sr08/sr10/sr14) does not state a heart count; tips say the count is unverified.
- 92401 is tip-only on 036 and sr15. No 92401 action.
- 6321 is present (005/006, sr05) with Undead race filter.
- Arugal, Dead Fields, Ambermill, recipe 447, and return bats 6323 are not required steps (6323 appears only as “Do not take 6323” on sr05).

## Smallest fix

None. Leave the file as-is.
