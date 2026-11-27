# QuestieDB-derived data, Alliance (GPL-3.0)

The Alliance counterpart of [`content/questie-db/`](../questie-db/) (Horde). It comes from the same pinned
QuestieDB and Questie commits and the same exporter, with the faction filter flipped:

```
py -3 -I pipeline/questie_import.py --faction alliance --verbose
```

- Quests: Alliance + neutral (race mask 0, or any overlap with Human, Dwarf, Night Elf, Gnome, Alliance Skyborne).
  A neutral quest whose only givers are Horde-only NPCs is dropped.
- NPCs: every NPC a kept quest references, plus spawned NPCs that are not Horde-only friendly.
- Dungeon entrances use the Alliance branch of QuestieDB's `dungeons.lua`.

The file format, coordinate frames, `forever` flag and `foreverConfidence` are the same as in
[`content/questie-db/README.md`](../questie-db/README.md). Counts are in `meta.json`.

**Licence:** GPL-3.0 (see [`LICENSE`](LICENSE)), kept separate from the rest of the repository like the Horde folder.
Credit only: the Questie name and logo are not used in app branding.

**Used by:** `staging/alliance/` (Alliance 1-20 route authoring). The website does not read this folder yet.
