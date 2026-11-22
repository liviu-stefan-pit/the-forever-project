# PASS

Re-check of `research/nova/v2/durotar-1-12.json` after the `:033` / `:163` split. JSON parses. `n` is contiguous 1–155. No route JSON was edited.

## Checks

- **`durotar-1-12:033`** — Shared cave step. Actions are goto map 1411 (42.7, 53) then `complete` 794 only. No `questId` 1516. No `classes` filter, so Burning Blade Medallion stays visible to all.

- **`durotar-1-12:163`** — Immediate next step after `:033` (n 39). `classes` is `["Shaman"]`. Completes 1516 at the Burning Blade cave (goto map 1411, 42.7, 53).

- **2983 / 1524 / 1525** — No step accepts, completes, or turns in these quests. `:160` is gone.

- **Call of Earth order (all `classes: ["Shaman"]`)** — `:153` accept 1516 → `:163` complete 1516 → `:162` turn-in 1516 / accept 1517 → `:154` complete + turn-in 1517 / accept 1518 → `:155` turn-in 1518.

- **816, 812, 813** — Absent.

## Smallest fix

None. Leave the file as-is.
