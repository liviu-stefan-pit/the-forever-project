# Contributing to The Forever Project

Thanks for helping. Bug reports, route corrections and pull requests are all welcome. This page explains how
to set up the project, what a pull request needs, and how review works.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Found a wrong quest, coordinate or step order?** Open a
  [Route error](https://github.com/liviu-stefan-pit/the-forever-project/issues/new/choose) issue with a
  source. That is often more useful than a pull request.
- **Planning a bigger change?** Open an issue first so we can agree on the approach before you spend time
  on it.
- **Security problem?** Do not open a public issue; see [SECURITY.md](SECURITY.md).

## Setting up

You need Node.js 22.12 or later (or Node 24+). The exact version CI uses is in `web/.node-version`.

```
git clone https://github.com/liviu-stefan-pit/the-forever-project.git
cd the-forever-project/web
npm install
npm run dev        # http://localhost:5173/
```

Python 3.11+ is only needed for the pipeline (`pipeline/`), and Lua 5.1 only for the addon checks. See the
[README](README.md#run-locally) for the data step, the prerequisite check and local game sync.

## Branches and pull requests

- Fork the repository and work on a branch named after the change, with a short prefix:
  `fix/…`, `route/…`, `feat/…`, `docs/…`, `addon/…`, `chore/…`. For example `route/barrens-crossroads-order`.
- Keep pull requests **small and focused: one topic per pull request.** A route fix, a UI change and a
  dependency bump are three pull requests.
- Link the issue the pull request resolves.
- Fill in the pull request template completely, including the checklist.
- Add screenshots (desktop and narrow width) for UI changes.

### Required checks

Run these before you push. CI runs the same checks and they must pass before a pull request can be merged:

```
cd web
npm run typecheck
npm run data       # builds web/public/data/, which some tests read
npm test
npm run build
npm run xp:gate    # after npm run data
```

`npm run xp:gate` runs every start (balanced and speedrun) through the XP simulator and fails if any pack
now ends below the level the next pack starts at (with 0.5 slack), the 20–40 band ends below 39.5, or the
route ends below 59.5. Ending higher than needed always passes. If it fails, the route lost too much XP:
add quests or a grind step back before the hand-off it names.

If you touch the addons, also check the Lua syntax with `luac5.1 -p` on the files you changed, and if you
change GuideWebExport, regenerate its sample:
`lua5.1 addon/tests/mock_client.lua > contracts/fixtures/GuideWebExport.sample.lua`.
If you touch the pipeline, run `python -I -m unittest discover -s pipeline/tests` from the repo root.

## Review policy

Nothing is merged without the maintainer's review.

- Every pull request needs an approving review from the code owner (see `.github/CODEOWNERS`).
- Direct pushes and force-pushes to `main` are blocked; all changes go through pull requests, and pull
  requests are squash-merged.
- An approval is dismissed when new commits are pushed, so the final version is always the one reviewed.
- All review conversations must be resolved before merging.
- CI must pass on the latest commit, with the branch up to date with `main`.
- Maintainers may close pull requests that do not follow the template, mix several topics, or add content
  that breaks the source rules below.

## Data and source rules

Route accuracy and clean sourcing matter more than speed. These rules come from [CREDITS.md](CREDITS.md):

- **Cite every source.** Each fact must come from a source we can check. Route steps cite theirs in
  `sources[]` (see [docs/ROUTE_SCHEMA.md](docs/ROUTE_SCHEMA.md)). How route files are laid out, and why step ids
  must never be renumbered, is in [docs/ROUTE_FILES.md](docs/ROUTE_FILES.md).
- **New source, new CREDITS.md row,** in the same pull request, keeping the table's exact column order
  (`Name | URL | Licence | Used for | Files`). The in-app Credits page is generated from that table.
- **Licences:** MIT, BSD, Apache-2.0, CC0 and CC BY are free to use with credit. GPL and CC BY-SA need care:
  keep derived data in its own file and state its licence. Anything with no licence stays facts-only.
- **No copied text.** Do not copy sentences from other guides, paid or free, or from websites. Write step
  text and tips in your own words. Paid guides are not used as sources at all.
- **No scraping.** Wowhead and similar sites are for checking single facts by hand. No scraping or bulk
  copying.
- **QuestieDB data** in `content/questie-db/` is GPL-3.0 and is regenerated with
  `pipeline/questie_import.py`, not edited by hand.
- **No Blizzard assets.** Do not add game images, icons, sounds or other client files. Zone map images are
  produced locally through the documented map pipeline ([docs/MAP_IMAGES.md](docs/MAP_IMAGES.md)) and are
  never committed.
- **Unconfirmed facts** are marked `verified: false` rather than guessed.

## AI-assisted contributions

This project is itself built with substantial AI help (see [AI_USAGE.md](AI_USAGE.md)), and AI-assisted
contributions are welcome. You are responsible for everything you submit: read it, test it and check its
facts against sources as if you had written it by hand. Disclose AI use in the pull request template
(none / some / substantial). Contributions that look generated but unreviewed will be closed.

## Licensing of contributions

The project is licensed under GPL-3.0-or-later (see [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md)).
Contributions are accepted on an inbound = outbound basis: by opening a pull request you agree that your
contribution is licensed under **GPL-3.0-or-later**, and you confirm you have the right to submit it. Data
derived from Questie / QuestieDB stays under GPL-3.0 under Questie's terms.

## Commit messages

Write the summary line as one full sentence in the imperative mood that says what the change does and why
it matters, ending with a period. For example, from the history:

- `Make the Horde 40-60 route solo-first, with dungeons only when Include dungeons is on.`
- `Keep large guides from mounting every zone section, and mark steps from the synced quest log.`
- `Fix guide maps, stale profiles, and slug changes.`

Add a body when the reason is not obvious. Pull requests are squash-merged, so the pull request title should
follow the same style.
