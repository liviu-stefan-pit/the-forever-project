# The Forever Project

A free, fan-made **Horde 1–60 leveling guide for WoW: Forever**. Pick a relaxed **Balanced** route or an
optimised **Speedrun** route and follow it step by step, with per-zone route maps, quest details, class and
role tips, profession hooks, an optional dungeon line and local character profiles. Every route step is
written for this project from open data (the GPL-3.0 QuestieDB quest database) and cited public pages; see
[CREDITS.md](CREDITS.md). It runs entirely in your browser: no accounts, no server-side database.

> [!WARNING]
> **Experimental.** The routes, the site and both addons are a work in progress. WoW: Forever changes
> often, and some steps are still marked unverified. Expect mistakes, and please
> [report them](https://github.com/liviu-stefan-pit/the-forever-project/issues/new/choose).

**Live site:** `https://<your-site>.pages.dev` <!-- TODO(maintainer): replace with the real Cloudflare Pages URL -->

## Features

- **Two Horde routes to 60:** **Balanced** (default) is the relaxed line with worthwhile extra quests;
  **Speedrun** is the highly optimised line. Switch in the top bar at any time.
- **Starts for every Horde race:** Durotar (Orc, Troll), Mulgore (Tauren) and Tirisfal Glades (Undead),
  then the shared route through the Barrens and on to 60.
- **Dungeons toggle:** the route is solo-first; turn on **Dungeons** to fold dungeon steps into the line.
- **Class / role picker:** filters steps, tips and the map line for your class and role.
- **Route maps** per zone, quest pages (`#/quest/<id>`) with givers, turn-ins and objectives, an overview
  page, search, and profession hooks along the way.
- **Local character profiles:** ticks, quests and settings live in your browser. **Export** /
  **Import JSON profile** on the Profile page move them between browsers.
- **Optional in-game sync** with the GuideWebExport addon (see below). On the hosted site, desktop
  Chrome / Edge can remember the chosen `GuideWebExport.lua` for one-click Sync (and re-sync on `/reload`
  while the tab is open); other browsers use **Import GuideWebExport.lua** on the Profile page.
- **Gold plan** (`#/gold`): what to save for (riding at 40, dual spec, riding at 60), a savings pace, and
  where to earn in each level bracket; tracks your gold after a Sync.
- **Start at your level:** not level 1? Pick your level on the dashboard and the guide opens at the right
  step with earlier steps marked done. Rough **play-time estimates** per guide and to 60.
- **Phone as a second screen:** scan the QR code on the Profile page to copy a profile to your phone
  (nothing is uploaded), keep the screen on while a guide is open, and install the site to the home
  screen; guides you have opened keep working offline.
- **Credits page** (`#/credits`) generated from [CREDITS.md](CREDITS.md).

Hash routes: `#/` (faction landing page), `#/horde` (dashboard), `#/guide/<slug>`, `#/quest/<id>`,
`#/overview`, `#/gold`, `#/transfer`, `#/profile`, `#/credits`. Alliance is not available yet.

## The addons

Both addons are for **WoW: Forever 1.60.1** only (`## Interface: 16001`) and are experimental. Download
the latest zip from [Releases](https://github.com/liviu-stefan-pit/the-forever-project/releases) and unzip
it into `World of Warcraft\_forever_\Interface\AddOns\`.

| Addon | Download | What it does |
|---|---|---|
| **GuideWebExport** | [GuideWebExport.zip](https://github.com/liviu-stefan-pit/the-forever-project/releases/download/guidewebexport-latest/GuideWebExport.zip) | Exports your character's progress (completed quests, quest log, level, professions, gold, gear and more) to its SavedVariables file. Upload that file on the site's **Profile** page to tick off what you have already done. [README](addon/GuideWebExport/README.md) |
| **AdventureLog** | [AdventureLog.zip](https://github.com/liviu-stefan-pit/the-forever-project/releases/download/adventurelog-latest/AdventureLog.zip) | Keeps a diary of one character while you play (where you go, quests, XP, loot, kills, deaths, time) so recorded play can improve the guides. [README](addon/AdventureLog/README.md) |

Neither addon sends anything anywhere. They write only to WoW's SavedVariables (and, for AdventureLog's
export script, a local folder on your PC). Nothing is uploaded unless you upload it yourself.

## Run locally

You need **Node.js 22.12 or later**, or **Node 24+**. The data scripts use `node --experimental-strip-types`
(added in Node 22.6), and `npm test` uses Vitest 5, which requires Node `^22.12 || ^24 || >=26`.

Python and a local QuestieDB install are **not** required to run the site. A normal clone already includes
`content/questie-db/`. Python 3.11+ is only needed to regenerate that database, export map tiles, or run
the pipeline tests.

There is no `package.json` at the repo root. From a fresh clone:

```
cd web
npm install
npm run dev
```

The app always uses `http://localhost:5173/`. Starting it again closes the previous dev server on that port
instead of picking 5174. On Windows you can also double-click `run-app.bat`.

Profiles live in the browser for that exact address. A tab still open on another port (5174, 5175, …) has
its own profile: on that tab open the Profile page, click **Export**, then on `http://localhost:5173` click
**Import JSON profile**. `npm run preview` (`http://localhost:4173/`) does not share the dev profile either.

For a production build: `npm run build` (output in `web/dist/`), then `npm run preview`. The public site is
hosted on Cloudflare Pages with root directory `web`, build command `npm run build` and output directory
`dist`.

### The data step

`npm run dev` and `npm run build` first run `npm run data` (`web/scripts/build-data.ts`) through the
`predev` / `prebuild` hooks. It writes `web/public/data/` (git-ignored) from this repo's `research/` route
packs and `content/questie-db/` only (see [docs/PROVENANCE.md](docs/PROVENANCE.md)). It:

- finds every route-v2 pack under `research/` (single files and segment folders) and validates it against `contracts/route-v2.schema.json`;
  a schema error or duplicate pack/step id fails the build;
- strips low-confidence Forever quests (79953, 81951) with a warning, and marks steps that use
  Forever-only quests as unverified;
- runs the duplicate turn-in check (`web/scripts/turnin-check.ts`): a quest turned in by two steps one
  character can both see fails the build;
- runs the quest-prerequisite check (`web/scripts/prereq-check.ts`) for every route × Horde class × race
  start × dungeons on/off. Prerequisites a source confirms are stale in Forever go in
  `research/prereq-allowlist.json`;
- joins profession hooks onto steps, then writes the manifest, guide packs, quest data, zones, tips and the
  search index.

No environment variables are required. Optional:

- `PF_PREREQ_CHECK=warn` or `off`: the prerequisite check fails the build by default (`fail`); `warn` lists
  findings in `manifest.json` warnings instead, `off` skips it.

Route content follows [docs/ROUTE_SCHEMA.md](docs/ROUTE_SCHEMA.md); how packs are split into files and edited is in
[docs/ROUTE_FILES.md](docs/ROUTE_FILES.md).

### Sync with the game

In desktop Chrome or Edge, choose `GuideWebExport.lua` once under **Game sync** on the Profile page
(`World of Warcraft\_forever_\WTF\Account\<ACCOUNT>\SavedVariables\GuideWebExport.lua`). The browser
remembers the file, so the top-bar **Sync** button (and **Sync now** on the Profile page) re-reads it with one
click, and while the tab is open a `/reload` in game is picked up automatically. The file is read in the
browser and never uploaded. In Firefox, Safari and on mobile, use **Import GuideWebExport.lua** on the Profile
page instead. This works the same on the hosted site and in `npm run dev`. Full details, character matching
and troubleshooting: [docs/GAME_EXPORT.md](docs/GAME_EXPORT.md).

### Map images

Until you add map images, maps use a stylised grid fallback. To use real zone maps, export the tiles from
your own game install: see [docs/MAP_IMAGES.md](docs/MAP_IMAGES.md)
(`python -I pipeline/map_images.py --images <export>`). Map images are © Blizzard Entertainment and are
git-ignored; they are not part of this repository's GPL licence (see [NOTICE.md](NOTICE.md)).

### Tests

In `web/` (run `npm run data` or `npm run dev` once first, since some tests read `web/public/data/`):

```
npm run typecheck
npm test
npm run build
```

Pipeline and addon tests, from the repo root (Python 3.11+; on Windows use `py -3`):

```
python3 -I -m unittest discover -s pipeline/tests
lua5.1 addon/tests/mock_client.lua > contracts/fixtures/GuideWebExport.sample.lua
```

Some pipeline tests skip when optional inputs are missing (a local QuestieDB install, Pillow, or a `lua`
interpreter on `PATH`). `python -I pipeline/questie_import.py` regenerates `content/questie-db/`.

## Repository layout

| Path | What it is |
|---|---|
| `web/` | The React + Vite site (`src/`), its data build scripts (`scripts/`) and tests |
| `research/` | Route packs (route-v2 JSON), dungeon and profession research, source notes |
| `content/questie-db/` | Compact QuestieDB-derived quest, NPC, object, item and zone data (GPL-3.0) |
| `contracts/` | Route schema and test fixtures |
| `pipeline/` | Python tools: QuestieDB import, map image export, SavedVariables readers, tests |
| `addon/GuideWebExport/` | In-game progress export addon |
| `addon/AdventureLog/` | In-game play diary addon and its export script |
| `addon/tests/` | Offline Lua harness for GuideWebExport |
| `docs/` | Route schema, game export, map images, provenance and design notes |

## Contributing

Bug reports, route corrections and pull requests are welcome. Please read
[CONTRIBUTING.md](CONTRIBUTING.md) first: every pull request is reviewed by the maintainer before it is
merged. Route errors have their own issue form. Please follow the
[Code of Conduct](CODE_OF_CONDUCT.md), and report security problems privately as described in
[SECURITY.md](SECURITY.md).

## Licence

Copyright (C) 2026 The Forever Project contributors.

The code, route text and addons are licensed under the **GNU General Public License v3.0 or later**
([LICENSE](LICENSE)). Data derived from Questie / QuestieDB (`content/questie-db/` and the files listed in
[CREDITS.md](CREDITS.md)) is GPL-3.0 under Questie's terms. Fonts and npm dependencies keep their own
licences, and game content belongs to Blizzard. See [NOTICE.md](NOTICE.md) for details.

## Use of AI

The Forever Project is built and maintained with substantial help from AI, and a human maintainer reviews
every change before it is published. See [AI_USAGE.md](AI_USAGE.md).

## Privacy

No accounts and no server-side database: your profiles stay in your browser. See [PRIVACY.md](PRIVACY.md).
Privacy and takedown contact: liviustefan.petroaia@gmail.com.

## Disclaimer

The Forever Project is a free, fan-made, non-commercial project. It is not affiliated with, endorsed,
sponsored or approved by Blizzard Entertainment, Inc. World of Warcraft, Warcraft and Blizzard
Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or
other countries. Game names, map images and other game content are © Blizzard Entertainment, Inc. and are
used for this free, non-commercial fan project within the limits Blizzard sets for fan sites (see the
[Blizzard Legal FAQ](https://www.blizzard.com/en-us/legal/c1ae32ac-7ff9-4ac3-a03b-fc04b8697010/blizzard-legal-faq)). Blizzard can withdraw that permission at any time; see
[NOTICE.md](NOTICE.md) for takedown requests.

The guides, the site and the addons are provided as is, without warranty of any kind, and you use them
at your own risk. Follow Blizzard's terms of use when you play; the project is not responsible for
anything that happens to your game account, characters or files.
