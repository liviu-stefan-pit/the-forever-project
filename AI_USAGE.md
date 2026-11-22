# Use of AI

The Forever Project is built and maintained with substantial help from AI. AI coding assistants
(Anthropic's Claude, through Claude Code) write and refactor much of the code, research quest facts from
the public sources listed on the Credits page, draft route steps and tips, and review changes. Notes in the
source repository refer to the AI agents by code names (Nova, Lyra, Orion, Sentinel, Vulkan, Godfather). A human
maintainer directs the work and reviews every change before it is published. Facts are cross-checked
against QuestieDB and cited sources, but AI can make mistakes — if something is wrong, please
[report it](https://github.com/liviu-stefan-pit/the-forever-project/issues/new/choose).

## What AI does here

- **Code:** the web app, the data build and its checks, the Python pipeline and the two addons are largely
  written and refactored by AI assistants, to the maintainer's instructions.
- **Research:** quest ids, givers, turn-ins, coordinates and Forever changes are looked up in QuestieDB and
  in the public sources listed in [CREDITS.md](CREDITS.md). Each source is recorded there.
- **Route drafting:** route steps, tips and profession hooks are drafted by AI as original text. No text is
  copied from other guides, and paid guides are not used as sources.
- **Reviews:** AI agents review changes, audit routes against QuestieDB, and check for copied text.
- **Maintenance:** dependency updates, documentation and housekeeping.

You will see the agent code names (Nova, Lyra, Orion, Sentinel, Vulkan, Godfather) in research folders, notes and
commit history. They are names for AI working sessions, not people.

## How changes are checked

- The maintainer reviews every change before it is merged or published.
- The data build validates every route pack against the schema and fails on duplicate turn-ins and missing
  quest prerequisites (see the README).
- Coordinates and quest facts are compared with QuestieDB; steps that rely on unconfirmed Forever data are
  marked unverified in the guide.
- Continuous integration runs the type check, tests and build on every pull request.

## AI-assisted contributions

AI-assisted contributions are welcome. If you contribute:

- You are responsible for everything you submit, whoever or whatever wrote it. Read and test it first.
- Disclose substantial AI use in the pull request (the template asks: none / some / substantial).
- AI output must follow the same rules as any other contribution: cite sources, add a
  [CREDITS.md](CREDITS.md) row for any new source, and do not paste text from other guides.

See [CONTRIBUTING.md](CONTRIBUTING.md).
