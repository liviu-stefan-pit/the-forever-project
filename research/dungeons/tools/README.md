Regenerate: download the pinned Questie files (Database/Classic/*.lua, Database/QuestXP/DB/xpDB-classic.lua, Database/Corrections/QuestieQuestBlacklist.lua, Database/Zones/data/zoneIds.lua at commit e29dc411) as `pin_*.lua` into one folder, run `lua5.1 dump.lua`, build `bl_main.txt` (lines 14-7054 of the blacklist) and `zonenames.json`, then `python3 assemble.py && python3 readme.py`.

Rebuild the pack (from this folder):

```
python3 pack_fixes.py && python3 match_forever.py && python3 steps.py && python3 readme.py && python3 prereq_audit.py
```

`pack_fixes.py` removes miscategorized Classic quests (e.g. 8588), keeps each shared chain quest in one QuestieDB home dungeon, moves the Ras Frostwhisper follow-ups (5464-5466) into the Stratholme section after 5463, and drops open-world quests that the 40-60 route already owns. `match_forever.py` matches Forever dungeon quests to `content/questie-db` and assigns the nine dungeon id slugs. `steps.py` rebuilds Classic and Forever steps in prerequisite order (Classic map ids come from `content/questie-db/zones.json` when `pin_areaIdToUiMapId.lua` is absent) with `tags.dungeonId` on Forever steps. `prereq_audit.py` checks that every accept comes after its in-pack prereqs are turned in. Run the tools from this folder.
