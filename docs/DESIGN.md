# project-forever — design blueprint

For **Nova** (builds in `web/`) and **Godfather** (step schema, QuestieDB import, route engine). Horde 1–60 only. Grounded in `4417089`. Do not commit guide JSON or third-party guide dumps.

The existing app stays: React 19, Vite 6, Tailwind 3, hash routes, Vitest. Redesign tokens, chrome and step/map/sync UI; do not rebuild the stack.

## 1. Design tokens (Tailwind `theme.extend`)

Dark, WoW-flavored, Horde-first, readable. Replace the Forever-azure primary and the Source Serif 4 `font-sans` alias. Cinzel stays on titles only. Color is never the only signal (shape, label, or icon too). Minimum hit target: 36px.

```js
// web/tailwind.config.js — theme.extend
{
  fontFamily: {
    sans: ['Source Sans 3', 'Segoe UI', 'system-ui', 'sans-serif'],
    display: ['Cinzel', 'Georgia', 'serif'],
    mono: ['ui-monospace', 'Cascadia Mono', 'Consolas', 'monospace'],
  },
  colors: {
    canvas: '#120c0a',
    frame: '#1c150f',
    stroke: '#6b542e',
    ink: '#f3ead7',       // parchment-tinted body
    muted: '#c4b496',
    horde: {
      300: '#e8b4b0',
      400: '#c45c54',
      500: '#9b2c2c',
      600: '#7f1d1d',
      700: '#5c1414',
    },
    bronze: {
      300: '#ffe9a3',
      400: '#e0b85a',
      500: '#c6a15a',
      700: '#6b542e',
      900: '#3d2a10',
    },
    parchment: { DEFAULT: '#e6d3a8', ink: '#3a2a16' },
    // semantic (pair with an icon/label)
    done: '#3d9a5a',
    warn: '#e0943a',
    danger: '#d44a3a',
    tip: '#7eb3e0',
    profession: '#c084fc',
    // rich-text on dark frames (keep contrast)
    rt: {
      friendly: '#5dff6a',
      warn: '#ff9a3c',
      enemy: '#ff5a4a',
      buy: '#ffd100',
      loot: '#c084fc',
      pick: '#7eb3e0',
    },
  },
  minHeight: { touch: '36px' },
  minWidth: { touch: '36px' },
  boxShadow: {
    card: '0 10px 24px -12px rgba(0,0,0,0.75)',
    glow: '0 0 0 1px rgba(198,161,90,0.45), 0 8px 24px -12px rgba(0,0,0,0.8)',
  },
}
```

Usage: `bg-canvas` / `bg-frame` / `text-ink` / `text-muted` / `border-stroke`. Active step: bronze inset ring + left horde bar, no amber pulse as the only cue. Done: `done` check + “Done” label, not opacity alone (opacity 0.7 max). Focus: 2px bronze ring. Error/warn never use bronze gold. `wow-frame` stays (bronze fill, gold inset). `.parchment` stays for quest/search reading surfaces, with the existing darkened `rt-*` overrides. Load Source Sans 3 in `index.html`; drop Source Serif 4.

## 2. Layout

Keep the shell: sticky top bar, left level timeline (drawer < `lg`), main column, sticky right panel at `xl`, mobile bottom bar + sheet.

**Top bar (left → right):** emblem + “Forever · Horde 1–60”; nav (Dashboard, Guide, Overview); spacer; level + zone + % of 1–60; **Route** segmented control **Balanced | Speedrun** (rename Lean; Speedrun is the highly optimized line, Balanced is the relaxed one with worthwhile extras); **Dungeons** toggle (see §6); **Class** chip (opens the profile class/role picker — changing it live-filters tips and steps); **Sync** (36px, status on the right of the button, not a truncated 11px ghost line); Search; Profile.

Route and Dungeons must be reachable without opening Profile (Class and Role live in Profile). On narrow widths, wrap them into a second 36px toolbar under the title, not an overflow menu of 24px icons.

**Guide page**

- Header: zone name, level bracket, step progress, Jump to current.
- Main: step list, grouped by zone section. Compact section map in the header is fine; do not stack a second full pin map above the list on small screens (today’s QA rule stays).
- Right panel (and the mobile Map sheet), top to bottom: **map**, **tips** for the selected step (role tip + elite hook), **profession** (recommended pair for the class + any hint on this step), then quest details.
- Dashboard hero: current zone, route name, class, dungeon on/off, resume CTA, next 5 steps (tip line under the objective).

## 3. Step card anatomy

Drop the **Source** toggle and any `raw` dump. Cards are the player-facing guide, not a third-party guide viewer.

```
[ 36px tick ]  #n   [Stop]  [Dungeon] [Optional] [Speedrun-only / Balanced extra]
               Objective (rich text — talk, kill, turn in, fly…)
               43.3, 68.5  ·  Durotar          [copy /way]
               Tip  (role/class)  Pull the elite with your pet; MD the pat.
               [Profession] Keep the bat wings. Buy recipe X from NPC Y in Razor Hill.
```

- **Objective:** existing rich lines. No source.
- **Coordinates:** from the step’s visible goto (zone % + zone name). Copy `/way` stays, as a 36px control.
- **Role tip:** one short paragraph from `tips[]` matching the active class/role. If none, hide the slot; do not show an empty “Tip” heading.
- **Elite hook:** if the tip (or hook) is elite-tagged, show a skull + “Elite” badge beside the tip, not color alone.
- **Profession chip:** one line, `profession` token + bag icon. Hide if no hint on this step.
- **Dungeon badge:** “Dungeon · RFC” (or the instance name). Visible even when the toggle is on, so the list change is obvious.
- **Unverified chip:** when a step (or its quest) has `verified: false`, which includes every `forever: true` quest until it is checked in game, show a small muted outline chip with a question-mark icon and the word "Unverified" after the step title, with the tooltip "From WoW Forever data, not yet checked in game." Never amber, never red, and never hide the step.
- **Optional / skip:** “Optional” or “Skip once you are level N — reason”.
- **Route membership:** a muted “Balanced extra” chip on steps that are not on Speedrun; Speedrun-only steps are hidden in Balanced (or labelled if Godfather emits any). Tick + badge, not gold vs red, distinguish the two.

Selected card: horde left rail + bronze ring + `aria-current="step"`. Done: tick fills `done` green, “Done” in the aria-label, slight fade, text still readable.

## 4. Map visual spec

Keep `ZoneMapSlot`: SVG, pins in zone % (0–100), 3:2 viewBox, pan/zoom only in the full-screen / sheet view, `.map-grid` fallback when a webp tile is missing. Rebuild the **route polyline from the visible gotos** of the current route + dungeon + class filter (not a pre-baked line that still shows hidden dungeon or Lean-bonus points).

| Kind | Shape | Fill / stroke | Label |
|---|---|---|---|
| Quest giver (quest start) | Exclamation in a bronze circle | Bronze 400 fill, canvas stroke | Name on hover |
| Turn-in (quest end) | Question in a horde-red circle | Horde 500 fill, ink “?” | Name on hover |
| Mob / objective area | Soft ellipse or hull at 20–30% fill, dashed stroke | Danger / warn at 25% opacity, dashed ink | Mob name; do not use a single pin for a camp |
| NPC vendor / trainer | Square / diamond | Profession purple vendor, tip-blue trainer | Role (Vendor, Trainer, Cooking) |
| Flight path | Winged teardrop | Bronze 300 | FP name |
| Current step | 36px hit target, pulse ring (respect reduced motion: static ring) | Bronze ring | “Current” |
| Done stop | Smaller, `done` check overlay | Muted | — |

A/B letter pins may stay as the selected-leg endpoints, but giver / turn-in / mob must also be present from quest start, end and objectives. Draw a thin **region outline** (zone boundary) in `stroke` at 40% opacity when the geometry is available; if it is missing, skip the outline, do not invent a rectangle.

Route line: 2px `#ffd100` core, 6px bronze understroke at 30% opacity, arrowheads every few segments (already in the canvas). Hidden waypoints may stay in the polyline if they only smooth travel, but they must not render as pins.

Legend (map header, compact): icon + word for each kind on screen. Hover still offers `/way` copy on the parchment chip.

## 5. Sync flow (plain sentences)

Keep the addon + picked-file sync behaviour (additive quest marks, name match, no uncheck, `/reload` or logout to flush). Make the states readable:

| State | Button | Status line |
|---|---|---|
| Addon missing / file not found | Sync, enabled | “The GuideWebExport addon was not found. Install it, type /gwe in game, then /reload.” |
| Syncing | Sync, disabled, `aria-busy` | “Syncing progress from the game…” |
| Synced | Sync, enabled | “Synced at 14:32 (Europe/Bucharest). Marked 12 quests.” or “Synced at 14:32. Already up to date.” |
| No profile | Sync, enabled | “Pick a character profile before syncing.” |
| Name mismatch | Sync, enabled | “The export is for Thrall, but this profile is Rexxar.” |
| Empty export | Sync, enabled | “No completed quests in the export. Type /gwe, then /reload.” |
| No file chosen yet | Sync opens the file picker | “Choose GuideWebExport.lua once, then Sync reads it with one click.” |
| Browser needs permission again | Sync, enabled | “Click Sync to let the browser read GuideWebExport.lua again.” |
| Browser without File System Access | Sync hidden; Profile import | “One-click sync needs desktop Chrome or Edge. …” |

Never show a raw path or HTTP code as the only message. Tooltip may repeat: “The game file updates only after /reload or logout.”

## 6. Controls that change the list

- **`routeStyle`:** `balanced` \| `speedrun` (rename every Lean label, title and `HIDDEN_REASON_TEXT`). Switching rebuilds visible steps, the polyline and the dashboard “next 5”.
- **`options.dungeons`:** boolean, default off (today every positive dungeon condition is force-hidden by `isDungeonHidden` — replace that with this toggle). On: dungeon steps and their gotos appear, badges on. Off: those steps hide and the route line skips them. Reason text: “hidden because dungeons are off”, not “not for your character”.
- **Class / role:** from the active profile, changeable in the bar. Filters steps that are class-locked **and** selects the matching tip.
- Existing `showOptional` / `hideDone` stay on Profile.

## 7. UI data needs

Godfather owns the schema. The UI needs to *read* the following; names can change if the loader maps them. Source: Questie DB + Godfather’s routes, not third-party `raw` text.

- **Route membership** for each step: whether it belongs to `balanced`, `speedrun`, or both. The Speedrun route is a real optimized line, not “Balanced minus bonus”.
- **`routeStyle`** on the profile: `balanced` \| `speedrun` (replace `lean`).
- **`options.dungeons`** (boolean) on the profile, honoured by the visibility evaluator.
- **`tips[]`** on a step: each tip has a **role/class** (or “any”), the tip body, and optional **elite** and **profession** hooks (elite flag/text; profession hint such as “keep these bat wings, buy recipe X from NPC Y”). The card shows the best match for the active class.
- **Profession recs** per class (best-in-slot / recommended pair, with a short why) for the side panel, plus any trainer/recipe NPC the hint refers to (name + zone % if known).
- **Dungeon flag** (and instance name/id) on dungeon steps, distinct from a generic condition badge.
- **Map geometry:** zone % points for every visible goto; **NPC and mob pins from quest start, end and objectives** (giver, turn-in, objective/mob locations, optional radius/hull for camps); vendor/trainer/FP points when the step has those actions; optional region/zone outline. The **route polyline is rebuilt from the visible gotos** after route, dungeon and class filters.
- **Existing needs that stay:** step id, order, objective text, coordinates, optional/skip, quest ids for Sync, zone / mapId / image path, filter by race/class.

The UI should not require a `raw` source field. Sync still needs completed quest ids, character name and level from the addon export.

## 8. Credits and support

The site is free, with every feature open to everyone. Every source is credited.

- **Credits page** (`#/credits`, linked from the footer and from Settings): one row per source with its name, link, licence (e.g. GPL-3.0, MIT), and what we used it for (quest ids, NPC coordinates, map shapes, addon code). It is rendered from the root `CREDITS.md` (one file, owned by Sentinel), so a new dataset can't ship without a credit. Text is plain body type, with no logos unless a licence asks for them.
- **"Buy me a coffee"** link in the footer, as a secondary text link with a small cup icon, placed next to Credits. It is never a modal, banner, toast, or step-card element, and never amber/gold accent. It has no "support to unlock" wording anywhere, because nothing is locked.
- The footer line reads: "Free and fan-made. Not affiliated with or endorsed by Blizzard Entertainment." plus the Credits and coffee links.
