# GuideWebExport

<img src="branding/icon-128.png" alt="GuideWebExport icon: the guide site's F inside two sync arrows (game to site and back)" width="96" height="96">

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

In desktop Chrome or Edge you can choose the file once under **Game sync** on the Profile page; after that
the **Sync** button re-reads it with one click. See
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

## Icon and store images

The icon shows the guide site's F inside two sync arrows (game to site and back), on the guide site's Horde/Alliance disc. The master is
[`branding/icon.svg`](branding/icon.svg) (animated with CSS, still under *reduce motion*); everything else is
rendered from it with `node web/scripts/render-addon-icons.mjs GuideWebExport` (needs Chrome or Edge and ffmpeg).

| File | Use it for |
| --- | --- |
| `media/icon.tga` | In game: the AddOns list shows it next to the name (`## IconTexture:` in the `.toc`). Ships in the zip. |
| `branding/icon-400.png` | **CurseForge** project avatar (square, 400 x 400). Also the **Wago** project icon. |
| `branding/icon-256.png` | Wago or anywhere that asks for a smaller square logo. |
| `branding/icon.gif` | **WoWInterface**: no project avatar there, so add it as the first screenshot. Also forums and Discord (256 px, animated). |
| `branding/icon.webp` | Animated, 400 px, transparent corners, for pages that take WebP. |
| `branding/icon-128.png`, `icon-64.png` | Small still versions (READMEs, link previews). |
| `branding/icon.svg` | The guide site's Addons page (a copy lives in `web/public/addons/`). |

Store sites change their size rules, so check the upload form; the 400 px PNG is the safe default.
`branding/` is left out of the release zip; only `media/` ships.

## Licence

GPL-3.0-or-later. See [LICENSE](LICENSE) and [NOTICE.md](https://github.com/liviu-stefan-pit/the-forever-project/blob/main/NOTICE.md).
