# Feralas Zukk'ash turn-in, March of the Silithid, boat tip

Route file was read only: `research/horde-40-60/horde-40-60.route.json`. No route JSON was edited. This changeset supersedes the Consolation Prize boat tip in `changesets/badlands-tanaris-feralas.json` on the same step id. That file was not edited.

## Facts

- The earlier drop of the Zukk'ash carapace stack (7730 and 7731, plus accept of 7732) left the report turn-in in the route. `h4060:feralas:t7732` is quest 7732, Zukk'ash Report. It goes with the stack.
- QuestieDB 4494 March of the Silithid `pre.single` is 32 or 7732. `next` is 4496. 32 is not a Horde substitute for 7732. The earlier note on `h4060:azshara:a4494` was only a tip. Horde 4494 needs 7732, which this pass drops, so the accept, turn-in, and the 4496 steps come out.
- Each of these ids is present in `horde-40-60.route.json`: `h4060:azshara:a4494`, `h4060:un-goro-crater:t4494`, `h4060:un-goro-crater:a4496`, `h4060:un-goro-crater:c4496`, `h4060:un-goro-crater:t4496`.
- Quest 95472 was dropped because 95321 is not on the route. 95321 needs 95312. The Steamwheedle boat to Powderfuse Port stays optional travel, about a minute, and it is not tied to Consolation Prize.

## Step ids

- `h4060:feralas:t7732` — drop
- `h4060:azshara:a4494` — drop
- `h4060:un-goro-crater:t4494` — drop
- `h4060:un-goro-crater:a4496` — drop
- `h4060:un-goro-crater:c4496` — drop
- `h4060:un-goro-crater:t4496` — drop
- `h4060:tanaris:travel-6e1a1d` — tip, supersedes the 95472 boat tip

## Changeset

3 ops in `changesets/feralas-silithid-boat.json`: drop 2, tip 1. All `verified: false`. Sources are QuestieDB.
