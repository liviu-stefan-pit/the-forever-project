# AdventureLog

AdventureLog is a World of Warcraft Forever addon. It keeps a diary of one character while you play. A friend can install this folder by itself; the rest of the guide project is not required.

It is part of [The Forever Project](https://github.com/liviu-stefan-pit/the-forever-project).

> **Experimental.** Please report problems at
> https://github.com/liviu-stefan-pit/the-forever-project/issues.

## What it does

While you are logged in, the addon records:

- where you go
- quests
- experience
- loot
- kills
- deaths
- time

On logout (or `/reload`), WoW saves that diary into the addon's SavedVariables file. The addon cannot write the adventure folder on disk by itself. A small script on your computer does that after you leave the game.

## Install

This addon is for **WoW Forever 1.60.1** only.

1. Download [AdventureLog.zip](https://github.com/liviu-stefan-pit/the-forever-project/releases/download/adventurelog-latest/AdventureLog.zip) and unzip it, or copy the `AdventureLog` folder, into:

   `World of Warcraft\_forever_\Interface\AddOns\`

   You should end up with `Interface\AddOns\AdventureLog\AdventureLog.toc`.

2. Type `/reload` in game, or restart the client.

## Slash commands

| Command | What it does |
| --- | --- |
| `/adv status` | Shows whether logging is on |
| `/adv pause` | Stops recording |
| `/adv resume` | Starts recording again |
| `/adv probe` | Prints how many API checks passed |

## Export

Close the game first. If you leave it open, the script still writes the adventure files, but it will not clear the in-game diary.

1. In the addon folder, double-click **Export Adventure.bat**.
2. The script writes a folder named after your character:

   `World of Warcraft\_forever_\Adventures\<Character> - adventure\`

   That folder holds:

   - one `.jsonl` file per play session
   - a summary `.json`
   - a README
   - a raw copy of the SavedVariables file the game wrote

3. It also makes a zip with the same name, next to that folder, so you can email it to
   contact@theforeverproject.app if you want to help improve the guides (see [Privacy](#privacy)).

The in-game data is cleared only after the backup, the session files, and the zip all check out, and only if `Wow.exe` is not running. If the game is open, the data is left as it is.

Running the exporter twice does not duplicate sessions.

## Optional: play, then export

**Play with AdventureLog.bat**, in the same addon folder, starts the game. After the game closes, it runs the same export.

## Timestamps

Each event can carry these time fields:

- `ts` is real clock time.
- `t` is seconds since you logged in this session.
- `pt` is your total `/played` time. That is the speedrun clock. Time spent logged out is not counted.
- `afk` is idle time.

## Before a serious run

Do this once on a throwaway level-1 character, not on the character you care about:

1. Accept a quest.
2. Kill something and loot it.
3. Die once.
4. Take a flight if you can.
5. Ding if you can.
6. Type `/reload`.
7. Run **Export Adventure.bat**.
8. Open the session `.jsonl` and look through it.

A missing value must have an `Err`, `Secret` or `textOther` field next to it. If you see a bare empty value, do not start the real character. Send the file back.

`/adv probe` prints how many API checks passed. Run that in game if you want a quick count before you export.

## Privacy

AdventureLog writes only to WoW's SavedVariables and, through the export script, to a local folder and zip on
your PC. Nothing is uploaded anywhere; sharing the zip is your choice.

**What a log contains:** your character's name, realm, race, class and faction; where you went and when
(real clock time and `/played`); quests, experience, loot, gold, kills, deaths, flights and group size. Loot and
money messages about other players are not kept: the log records only that one happened, never their name.

**If you email it** to contact@theforeverproject.app: the zip is used only to check and improve the guide routes. It is not
published, and your character name and realm do not appear in anything that goes into the project. The zip is
deleted when that work is done, and at the latest 12 months after it arrives. Ask at the same address and it is
deleted sooner. See [PRIVACY.md](https://github.com/liviu-stefan-pit/the-forever-project/blob/main/PRIVACY.md).

## Licence

GPL-3.0-or-later. See [LICENSE](LICENSE) and
[NOTICE.md](https://github.com/liviu-stefan-pit/the-forever-project/blob/main/NOTICE.md).
