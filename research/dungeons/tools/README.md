Regenerate: download the pinned Questie files (Database/Classic/*.lua, Database/QuestXP/DB/xpDB-classic.lua, Database/Corrections/QuestieQuestBlacklist.lua, Database/Zones/data/zoneIds.lua at commit e29dc411) as `pin_*.lua` into one folder, run `lua5.1 dump.lua`, build `bl_main.txt` (lines 14-7054 of the blacklist) and `zonenames.json`, then `python3 assemble.py && python3 readme.py`.

The dungeons route pack is edited directly in `research/routes/dungeons/horde-dungeons-15-60/` (one file per dungeon,
the four largest split into pick-ups and run / turn-ins; see `docs/ROUTE_FILES.md`). `steps.py`, which used to regenerate
the whole pack, was removed in Nov 2026: the pack had been edited by hand since its last run, and re-running it changed
607 of 648 steps. Check the pack and refresh the README with (from this folder):

```
python3 prereq_audit.py && python3 readme.py
```

`pack_fixes.py` and `match_forever.py` still maintain `dungeons.json`. `pack_fixes.py` removes miscategorized Classic quests (e.g. 8588), keeps each shared chain quest in one QuestieDB home dungeon, moves the Ras Frostwhisper follow-ups (5464-5466) into the Stratholme section after 5463, and drops open-world quests that the 40-60 route already owns. `match_forever.py` matches Forever dungeon quests to `content/questie-db` and assigns the nine dungeon id slugs. `prereq_audit.py` checks that every accept comes after its in-pack prereqs are turned in. Run the tools from this folder.
