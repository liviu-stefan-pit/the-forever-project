# PASS

Re-check of `research/horde-40-60/horde-40-60.route.json` only. Route JSON was not edited.

## Checks

1. **`h4060:feralas:fly-2a22b8`** (n=438) — required text and `fly` label are Camp Mojache → Orgrimmar → Undercity zeppelin → Revantusk. No keep/hand-in of 7732. Flight remains.

2. **`h4060:azshara:fly-3f5199`** (n=581) — required text and `fly` label are “Fly Valormok -> Orgrimmar, then fly on to Gadgetzan.” No 7732 hand-in, no 4494 accept. Flight remains.

3. **4494 / 4496** — no `"questId": 4494` or `"questId": 4496` accept/turn-in (or complete) actions anywhere in the file.

4. **`h4060:winterspring:a6030`** (n=654) `routes` are `balanced` and `speedrun`. **`h4060:eastern-plaguelands:t6030`** (n=705) `routes` are still `balanced` and `speedrun`. Speedrun can accept 6030 before turning it in.

5. **6030 turn-in text** (`h4060:eastern-plaguelands:t6030`) is “Turn Duke Nicholas Zverenhoff in at Light's Hope before riding to Tirion.” It is not “Turn in Duke Nicholas Zverenhoff to Duke Nicholas Zverenhoff.”

6. **`h4060:western-plaguelands:a5234`** and **`t5234`** `routes` are `["balanced"]` only. Quests 643, 644, 645, 646 have no accept/turn-in actions in the file.

## Smallest fix

None. Leave the file as-is.
