# Durotar 1-12 review

**FAIL**

Route: `research/nova/v2/durotar-1-12.json`. Compared to `content/questie-db` and `contracts/route-v2.schema.json`. JSON is valid; `n` is 1..154; 816/812/813 are absent; 96873 stays unfiltered with “Skip this if you are not an enchanter.”

## Defects

- **`durotar-1-12:153`** — Accepts Call of Earth (1516). Questie requires 2 Felstalker Hooves (`items` 6640); the file never completes or turns 1516 in. Smallest fix: add `complete` 1516 on `durotar-1-12:033` (Felstalkers share the Burning Blade cave at 42.7, 53), then `turnin` 1516 and `accept` 1517 at Canaga (NPC 5887, 42.4, 69.2) after the cave return (`:034` / `:156` are already at 42.8–42.9, 69.1–69.2).

- **`durotar-1-12:154`** — Completes 1517 with no accept. 1517 is given by Canaga after 1516 is turned in; the Earth Sapta is that reward. Smallest fix: accept 1517 at Canaga first; on this step keep the Spirit Rock complete (44.0, 76.2), then `turnin` 1517 to NPC 5891 (same point) and `accept` 1518.

- **`durotar-1-12:155`** — Turns in 1518 with no accept. 1518 starts at the manifestation after 1517 is turned in. Smallest fix: accept 1518 on `:154`; leave this Canaga turn-in (42.4, 69.2).

- **`durotar-1-12:084`** — Turns in For Honor (96822) with no complete. Questie objectives are objects 656180 / 656181 / 656182 at Tiragarde (59.39, 56.41; 57.37, 56.43; 56.54, 53). Smallest fix: add three `complete` 96822 actions on `durotar-1-12:076` (keep at 57.4, 57).
