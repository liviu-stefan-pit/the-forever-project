# tpf-db unconfirmed (GPL-3.0)

**This folder is licensed GPL-3.0** ([`LICENSE`](LICENSE)), not CC BY 4.0 like the rest of `content/tpf-db`.
Its records come from QuestieDB (`content/questie-db`, itself GPL-3.0); see that folder's README for the
pinned QuestieDB commit and the Questie team's licence notes.

It lists Zephras Isle quests that no AdventureLog run has shown yet (other classes' class quests,
professions, mounts and anything else the island has), plus the NPCs, objects and items those quests name
that the confirmed files do not have.

- Same record shape as the confirmed files, with `"status": "unconfirmed"`.
- `source` names where each field came from (`"QuestieDB <commit>"`). Quests add `classNames` from the class mask.
- Never mixed into the confirmed files. When a later play log shows one of these quests, the rebuild
  (`py -3 -I pipeline/adventurelog …`) builds it from the log into `../quests.json` with evidence, drops it
  from here and records its id in `../meta.json` `promoted`.
- `../meta.json` `unconfirmedByClass` lists these quests per class.
