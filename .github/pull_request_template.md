## What and why

<!-- One or two sentences: what this pull request changes and why. -->

Closes #<!-- issue number -->

## Checklist

- [ ] This pull request covers **one topic** only.
- [ ] It links the issue it resolves (or explains why there is none).
- [ ] Checks pass locally: `cd web && npm run typecheck && npm run data && npm test && npm run build && npm run xp:gate`
      (plus `luac5.1 -p` for addon changes and `python -I -m unittest discover -s pipeline/tests` for pipeline changes).
- [ ] Every new fact cites a source, and every **new source has a row in `CREDITS.md`** in the same pull request.
- [ ] No text is copied from other guides (paid or free) or websites; step text and tips are in my own words.
- [ ] No Blizzard assets are added (images, icons, sounds, client files), except through the documented map pipeline (`docs/MAP_IMAGES.md`), whose output is never committed.
- [ ] Screenshots are attached for UI changes (desktop and narrow width), or this pull request has no UI change.
- [ ] I license my contribution under **GPL-3.0-or-later** and have the right to submit it.

## AI assistance

<!-- Tick one. You are responsible for everything you submit, however it was written. See AI_USAGE.md. -->

- [ ] None
- [ ] Some (for example autocomplete, small snippets, wording help)
- [ ] Substantial (AI wrote a large part of the code, data or text) — briefly describe what and how you checked it:

## Screenshots

<!-- For UI changes. -->

## Notes for the reviewer

<!-- Anything that needs special attention, follow-ups, or known limitations. -->
