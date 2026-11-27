# pipeline/adventurelog (MIT)

Reads AdventureLog play logs and writes [`content/tpf-db`](../../content/tpf-db/). This folder's code is MIT
([`LICENSE`](LICENSE)); the data it writes is CC BY 4.0, except `content/tpf-db/unconfirmed/` (GPL-3.0, from QuestieDB).

```
py -3 -I pipeline/adventurelog --log <AdventureLog.lua | export folder | session.jsonl> [--log …] [--zone "Zephras Isle"] [--check]
```

| Module | Job |
|---|---|
| `reader.py` | SavedVariables (`AdventureLogDB`, events are JSON strings) or the exporter's `character.json` + `sessions/*.jsonl`. Read only. The same session from two sources is kept once |
| `build.py` | Sessions → confirmed records (`quests`, `npcs`, `objects`, `items`, `zones`, `drops`, `xp`, `spawns`, `trainers`), each with `status`, `samples`, `evidence` |
| `unconfirmed.py` | QuestieDB quests in the logged zones that no log has shown, and promotion |
| `db.py` | `build_db` (pure) and `write_db` (one record per line, `\n`, sorted keys; refuses the WoW folder) |

Rules:

- Deterministic: no run timestamps, sorted keys and lists, rounded floats. Same logs → same bytes.
- Never writes to a log. Copy a log elsewhere if you want to keep a snapshot.
- Merges any number of sessions and characters. Session ids come from the log; the character name is not stored.
- Idle sessions (no quest or kill events) are listed in `meta.json` and skipped.
- AdventureLog 1.2.0+ fields (giver / ender ids, kill flags, rewards, trainer spells, object use, XP source) are
  used when present; older sessions fall back to positions and chat lines.

Tests: `py -3 -I -m unittest pipeline.tests.test_adventurelog` (fixture logs are built in the test; no real log needed).
