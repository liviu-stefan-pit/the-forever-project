# FAIL

Re-check of `research/nova/v2/durotar-1-12.json` after the Call of Earth chain fix. JSON parses. `n` is contiguous 1–155. Compared to `content/questie-db`. No route JSON was edited.

## Defects

- **`durotar-1-12:033`** — Shared cave step (no `classes`) still has `complete` 1516 next to `complete` 794. Schema filters whole steps, not actions, so non-shamans see Call of Earth. Smallest fix: remove the 1516 complete from `:033`; add a new Shaman-only step at the same cave (42.7, 53, map 1411) that only completes 1516. Do not put `"classes": ["Shaman"]` on `:033` (that would hide Burning Blade Medallion).

- **`durotar-1-12:160`** — Accepts Call of Fire (2983). Water/Fire/Air must be absent. Smallest fix: delete this step (or at least the 2983 accept). The level-10 trainer tip that names Call of Fire as an example class quest can stay.

## Checks that pass

- Earth order: `:153` accept 1516 → `:033` complete 1516 → `:162` turn-in 1516 / accept 1517 → `:154` complete + turn-in 1517 / accept 1518 → `:155` turn-in 1518. `:153`, `:162`, `:154`, `:155` are `classes: ["Shaman"]`.
- 96822: accept `:070` (Razor Hill), three object completes on `:076` (Tiragarde keep visit 57.4, 57, map 1411), turn-in `:084`. Pins 656180 / 656181 / 656182 at 59.39, 56.41; 57.37, 56.43; 56.54, 53 (Questie zone 14). Not a long camp.
- 816, 812, 813 absent. Call of Water and Call of Air absent.
- `:101` 96873 still says “Skip this if you are not an enchanter.”
