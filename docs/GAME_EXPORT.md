# In-game export (GuideWebExport addon)

The small **GuideWebExport** addon lets the web app fill in your progress automatically. With the
addon installed, pressing **Sync** in the app (or just opening it) copies from the game:

- completed quests (marked done on the profile, never unmarked),
- level, and XP for the readout,
- professions and secondary skills with current/max skill (Mining 112/150, Cooking 87/150, ...),
- gold (stored in copper),
- equipped gear (item id per slot),
- the current quest log with objective progress (shown on the Profile page).

It also exports the game's own map bounds (uiMap world bounds). Route coordinates are already zone
percent (QuestieDB and research packs), so the site does not need them; they are kept for checking
world positions (`pipeline/maps/savedvars.py`).

The addon only reads game APIs. It writes nothing except its own SavedVariables file and sends
nothing anywhere.

## 1. Install the addon (once)

Copy the folder

```
<this repo>\addon\GuideWebExport
```

into

```
C:\Program Files (x86)\World of Warcraft\_forever_\Interface\AddOns\
```

so that `...\AddOns\GuideWebExport\GuideWebExport.toc` exists. Do this yourself; the pipeline never
writes into the WoW folder.

## 2. Run it in game

1. Start WoW Forever. On the character screen, open **AddOns** and make sure *GuideWebExport* is
   ticked. If it is listed as out of date, tick *Load out of date AddOns*.
2. Log in with the character you want to sync. The first full export runs after the first
   quest-log update (a short debounce). If that event never arrives, a fallback runs after about
   8 seconds.
3. Play. The character snapshot refreshes by itself when you turn in or accept a quest, level up,
   gain skill, gain or spend gold, change gear, or open the flight map, and once more on logout.
   You can force a full export any time with **`/gwe`**. Chat then shows something like
   `GuideWebExport: exported 1234 maps (…), 87 completed quests, 8 skills and 12 gear slots for Name-Realm (/gwe).`
4. Type **`/reload`**, or log out. **WoW writes the SavedVariables file only on `/reload` or
   logout**, never while you play, so the app cannot see anything newer until you do this.

The file now exists at
`_forever_\WTF\Account\<account>\SavedVariables\GuideWebExport.lua`.
The file holds only the character you exported last. To sync another character, log in with it,
repeat steps 2–4, and import again.

## 3. Check the export (optional)

`pipeline/maps/savedvars.py` reads the file (`read_export`, `find_saved_variables`), and
`pipeline/tests/test_addon_export.py` runs the addon under Lua 5.1 and checks the bounds and the
in-game probe. The web app reads the character snapshot directly (section 4).

## 4. Automatic progress sync

The addon still only writes SavedVariables. WoW flushes that file on `/reload` or logout, not
continuously while playing. Type `/gwe` (it also runs shortly after login) and then `/reload` or
log out before the app can see new quests.

While the guide is running with `npm run dev` or `npm run preview` from `web/`, the
app reads `GuideWebExport.lua` from the WoW Forever WTF folder itself.

The app first asks the local server whether the file exists and only then downloads it (no request
for a missing file). On startup, and when you press **Sync** in the top bar or **Sync now** on the
Profile page, it applies the export to the active profile. While the tab is visible it notices a
newer file about every 8 seconds.

**Which character.** A profile follows one in-game character, identified by **name and realm**
(`Profile.character`).

- The first sync links the profile to the one exported character whose name matches the profile
  name (case-insensitive). From then on only that name on that realm is used.
- If the same name exists on several realms, nothing is applied until you pick the character.
- On the Profile page, **Game sync → In-game character** lets you pick any exported character
  (the profile name doesn't have to match), or go back to matching by profile name.
- If the linked character isn't in the file, nothing changes and the status says so.

**What changes.**

- Quests: completed quests are added (a union). Sync never unchecks a step. Steps with no quest
  id stay manual.
- Level, profession skills (`Profile.skills`), gold (`Profile.money`, copper) and gear
  (`Profile.gear`, slot id → item id) are **replaced** with the game's values on every sync.
- `Profile.professions` follows the synced skills: every profession the game reports is listed,
  one the game reported before but no longer does (unlearned) is removed, and professions you
  picked that the game hasn't reported yet stay while there is room (two primary at most).
- Race and class are left alone.
- An export from the older addon version (completed quests and level only) still works. It just
  doesn't touch skills, gold or gear.

The Profile page shows a plain readout of the synced fields and the current quest log.

A static open of the production build has no `/api/game-sync` endpoint, so automatic sync does not
run. The Profile page file upload still works.

The server looks at the repo-root `config.local.json` keys `gwe_saved_variables` or `wow_root`,
otherwise `C:\Program Files (x86)\World of Warcraft\_forever_\WTF\Account\*\SavedVariables\GuideWebExport.lua`
(newest mtime). `WOW_FOREVER_ROOT` overrides the root. The server never accepts a path from the
browser and never writes into the WoW folder.

## Saved data format (schema 4)

`GuideWebExportDB.schemaVersion = 4`; `version` stays `1` because the map format is unchanged.
The addon is WoW Forever 1.60.1 only. Each `characters["Name-Realm"]` entry uses the full
character name in both `name` and the key (on Forever that is `"First Surname"`, so the key
looks like `"First Surname-"` when the realm is empty). A previous key built from the first
name only is removed on the next export.

Per character: `name`, `firstName`, `surname` (absent when the second `UnitName` return is empty
or matches the realm), `guid`, `realm`, `race`, `raceName`, `class`, `className`, `level`,
`faction`, `completed`, `completedCount`, `exportedAt`, `schemaVersion`, `xp`, `xpMax`,
`xpRested`, `xpPercent`, `restState`, `money` (copper), `deadOrGhost`.

`position` is `{ mapId, zone, subzone, x, y }` with `x`/`y` normalized 0–1. `questLog` entries
are `{ id, title, level, complete, objectives }`. `complete` is `1` (ready), `-1` (failed) or
absent. Objectives are `{ text, type, finished, numFulfilled, numRequired }`. `skills` entries
are `{ skillID, name, kind, rank, max, modifier, temp, categoryID }` with `kind` one of
`primary`, `secondary`, `riding`, `weapon`, `other`. `professions` entries are
`{ skillLine, name, rank, max, modifier, specIndex }`. `gear` is `{ slot, slotName, itemId, name }`.

Also: `taxi` (`[nodeID] = { name, mapId }`, merged across sessions), `bind`, `bags`
(`[itemId] = count`), `reputation` (`factionID`, `name`, `reaction`, `current`, `min`, `max`,
`isHeader`, `atWar`), `spells` (`riding` 0/75/150, `mount` only when a watched mount spell is
known, `known` spell ids), `durability` (`pct`, `lowestSlot`), `pet` (`family`, `level`, `name`,
or absent when you have no pet).

Each collector sets its own flag: `questLogOk`, `skillsOk`, `positionOk`, `bindOk`, `bagsOk`,
`reputationOk`, `spellsOk`, `durabilityOk`, `petOk`. `taxiOk` is set only after a flight map
has been read; until then the flag is absent. `petOk` is true even when `pet` is absent.

`contracts/fixtures/GuideWebExport.sample.lua` is generated by running the real addon against
the WoW Forever mock:

`lua5.1 addon/tests/mock_client.lua > contracts/fixtures/GuideWebExport.sample.lua`

The harness checks event refreshes, the turned-in-quest fix-up, and header expand/restore.

## Troubleshooting

- *The app shows old data*: you haven't typed `/reload` or logged out since playing. WoW writes
  SavedVariables only at those moments.
- *"exists on several realms"*: pick the character under **Profile → Game sync**.
- *"Linked character … is not in the export"*: log in with that character once (so the addon
  exports it), or pick another character on the Profile page.

- *No chat message after `/gwe`*: the addon isn't loaded. Check the AddOns list and the folder name.
- *The app does not find the file*: you didn't `/reload` or log out after `/gwe`, or the WTF
  account folder differs.
- *Map position looks wrong*: report the `position` block. The HereBeDragons axis convention
  would then differ on this client, and `convert` in `pipeline/maps/savedvars.py` needs a look.

## Adventure log (separate addon)

**AdventureLog** is a separate addon from GuideWebExport. Install and export steps for a friend
are in `addon/AdventureLog/README.md`.

GuideWebExport now keeps only the current character's snapshot. Map bounds are still kept.

Adventures are written under the `_forever_\Adventures` folder by `export.ps1`, not by the web app.
