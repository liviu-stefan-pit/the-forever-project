# GuideWebExport

GuideWebExport is a small World of Warcraft addon for **WoW: Forever 1.60.1**. It saves your character's
progress to a file on your PC so The Forever Project's guide site can tick off the quests you have already
done. It is part of [The Forever Project](https://github.com/liviu-stefan-pit/the-forever-project).

> **Experimental.** Please report problems at
> https://github.com/liviu-stefan-pit/the-forever-project/issues.

## Install

1. Download
   [GuideWebExport.zip](https://github.com/liviu-stefan-pit/the-forever-project/releases/download/guidewebexport-latest/GuideWebExport.zip).
2. Unzip it into `World of Warcraft\_forever_\Interface\AddOns\` so that this file exists:
   `Interface\AddOns\GuideWebExport\GuideWebExport.toc`
3. On the character screen open **AddOns** and tick **GuideWebExport**. If it is marked out of date, also
   tick **Load out of date AddOns**.

## Use

1. Log in with your character. The addon exports once by itself shortly after login, and refreshes the
   snapshot when you accept or turn in a quest, level up, gain skill, gain or spend gold, change gear, open
   the flight map, and on logout.
2. To export right now, type **`/gwe`** (or `/guidewebexport`). Chat confirms what was exported.
3. Type **`/reload`** or log out. **WoW only writes the file on `/reload` or logout**, never while you play.

The file is written to:

```
World of Warcraft\_forever_\WTF\Account\<account>\SavedVariables\GuideWebExport.lua
```

It holds the character you exported most recently.

## Upload on the site

Open the guide site's **Profile** page and upload or import `GuideWebExport.lua`. The site reads the file in
your browser and marks your completed quests on the matching profile. It also shows your level, skills,
gold, gear and current quest log. Uploading never unticks a step.

If you run the site locally (`npm run dev`), the **Sync** button can read the file directly. See
[docs/GAME_EXPORT.md](https://github.com/liviu-stefan-pit/the-forever-project/blob/main/docs/GAME_EXPORT.md).

## What it exports (privacy)

The addon only reads game information and writes it to its own SavedVariables file. It sends nothing
anywhere; nothing leaves your PC unless you upload the file yourself.

For the character you are playing, the file contains:

- name, realm, character GUID, race, class, faction and level
- XP, rested XP and whether you are dead or a ghost
- completed quest ids and your current quest log with objective progress
- skills and professions with their ranks
- gold (in copper)
- equipped gear, bag contents (item ids and counts) and gear durability
- reputations
- known flight points, your hearthstone location and your current position
- known spell ids, riding skill and mount
- your pet's family, level and name, if you have one

It also stores the game version and the map bounds of each zone, which the project uses to check
coordinates.

## Licence

GPL-3.0-or-later. See [LICENSE](LICENSE) and [NOTICE.md](https://github.com/liviu-stefan-pit/the-forever-project/blob/main/NOTICE.md).
