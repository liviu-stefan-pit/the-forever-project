# Licence note for research/dungeons

`dungeons.json` and `steps-v2.json` contain facts (quest, NPC, object and item ids, levels, coordinates, prerequisites, quest-reward item ids and quest XP) extracted from:

- the Questie addon's Classic-era database, commit `e29dc411d70a4f7c6cd5d964f153bd065c5fd834` (https://github.com/Questie/Questie), and
- QuestieDB's Forever data, commit `9cf27d6491dd80f1998aa0a846dbea9a3c5daad9` (https://github.com/Questie/QuestieDB, `data/Forever/`, `conversion.json`), used for NPC/object coordinates and for converting dungeon entrances to Forever map bounds.

Licensing per the upstream `LICENSE.md` files: the Questie team permits forking and copying under the **GNU GPL v3** terms (with a note that historic contributions are not all formally licensed), and this does not extend to the Questie name or logo. We take facts only, credit the Questie and QuestieDB contributors, distribute this derived data under GPL-3.0, and do not use Questie branding.

Dungeon level ranges come from Wowhead Classic zone pages and Blizzard news (facts only, no text copied). Forever-only dungeon quests come from fan guides (facts only, `verified: false`, URLs per quest). Role tips, route judgements and summaries are written by the project team. No third-party guide content was used.

The scripts in `tools/` regenerate the JSON from the pinned upstream files (`tools/dump.lua` converts the Lua tables, `tools/assemble.py` builds the output, `tools/steps.py` emits route v2 steps).
