# Route schema v2

Single source of truth: [`contracts/schema.ts`](../contracts/schema.ts) (TypeScript) and
[`contracts/route-v2.schema.json`](../contracts/route-v2.schema.json) (JSON Schema, draft 2020-12).
`ROUTE_SCHEMA_VERSION = 2`. v2 **extends** the v1 `Step`; every new field is optional so existing
guides keep loading. The `raw` source-text field is **removed** (no third-party guide text is shown or stored).

How packs are split into files on disk (a `pack.json` manifest plus one file per segment) and the rules for editing
them are in [ROUTE_FILES.md](ROUTE_FILES.md).

## Rules every author follows

- Every authored item (step, tip, profession hook, elite tactic, pin, class profession block) has
  `sources: [{ url, label }]` and `verified: boolean`. `verified: false` is shown as **unverified** and QA flags it.
- Coordinates are **zone %** (0–100), the same space as QuestieDB spawns; `mapId` is the UiMap id (1411 Durotar …).
- Quests are referenced by **quest id** (`accept` / `turnin` / `complete` actions). Quest-giver, turn-in and
  objective (mob / object / item) pins are **derived** from quest data (`web/src/lib/pins.ts`), not hand-placed.
- Only hand-place what quest data cannot give: vendors, trainers, flight paths, inns, mob camps (`pins`).

## Step fields (v2 additions)

| Field | Meaning |
|---|---|
| `routes` | `["balanced"]`, `["speedrun"]` or both. Default: legacy `bonus` steps → balanced only, everything else → both. Speedrun is its own optimized line, not "balanced minus bonus". |
| `dungeon` | `{ name, instanceId?, levels? }`: dungeon content, shown only when `Profile.options.dungeons` is on. |
| `dungeonsOff` | Open-world alternative, shown only when dungeons are off. Cannot be combined with `dungeon`. |
| `dungeonsOffRoutes` | `["balanced"]`, `["speedrun"]` or both. When dungeons are on, hide this step only on these route styles (subject to `routes` when dungeons are off). |
| `tags.dungeonPart` | `pickup` \| `prep` \| `run` \| `turnin`. Labels a step's place in a dungeon detour. Does not affect visibility. |
| `alternativeTo` | Step ids this one replaces when the toggle flips (QA / docs). |
| `classes`, `roles` | Show only for these classes / roles (`tank`, `healer`, `dps`). The v1 race/class `filter` still works. |
| `tips[]` | `{ kind: general\|elite\|profession\|speed, text, roles?, classes?, routes?, dungeons?, sources, verified }`. |
| `professionHooks[]` | `{ profession, itemId?, itemName?, qty?, skillTarget?, npc?: {id,name,zone,x,y}, note, sources, verified }`. |
| `elite[]` | `{ name, npcId?, level?, groupSize?, tips[], sources, verified }`: elite / group-quest tactics, tips filtered by role/class. |
| `pins[]` | `npc` (with `service`: questGiver, turnIn, vendor, trainer, flightPath, innkeeper), `object`, `mobArea` (`polygon` ≥ 3 points, or `center` + `radius`). |
| `minutes` | Expected time for the step. |
| `sources`, `verified` | Provenance of the step itself. |

Other shapes: `ZoneInfo.outline` (region outlines), `ClassProfessionsFile` (`class → { primary: ranked pairs with
reason, secondary, levelingPlan: milestones tied to stepIds or levels, sources, verified }`), `TipsMatrixFile`
(`class → role|any → Tip[]`), `SyncStatus` (top-bar addon sync), `MarkerKind`.

## Profile

`routeStyle: "balanced" | "speedrun"` (legacy `"lean"` is migrated to `"speedrun"` on load and import),
`role?`, `professions?`, `options.dungeons?` (missing = off).

`Guide.nextByRoute` and `RoutePack.nextByRoute` are optional successors per route style. `next` stays the balanced default. `Step.simDungeons` has the same shape as `sim` and comes from a dungeons-on walk; solo `sim` stays the dungeons-off case, and the reader uses `simDungeons` when `Profile.options.dungeons` is on. `Profile.options.xpMods` (`XpMods`: Well Fed, rested policy, Legacy Well Rested rank, Sleeping Bag) is optional. When it is missing or every toggle is off, the reader keeps the baked worst-case sim. These fields are declared in `contracts/schema.ts`.

## Resolving a route

```ts
import { resolveRoute } from "web/src/lib/resolveRoute";
const { steps, hidden } = resolveRoute(allSteps, {
  route: "speedrun", dungeons: false, race: "Orc", class: "Warrior", role: "tank", professions: ["Mining", "Blacksmithing"],
});
```

Rules, in order: dungeon toggle → race/class `filter` and `classes` → `roles` → optional (`showOptional: false`)
→ route membership. Kept steps get `routeIndex` (1..n) and `unverified`; `tips`, `professionHooks` and elite tips
are narrowed to the character (`professions` undefined = show all hooks). Guest mode, profiles, the map and the
resolver all use the same evaluator (`createProfileEvaluator`), so they cannot disagree. After filtering,
`visibleRoutePolyline(steps, mapId, isVisible)` rebuilds the map line from the visible gotos (hidden waypoints kept).

## Example

[`contracts/fixtures/route-v2/example.json`](../contracts/fixtures/route-v2/example.json) is a **synthetic**
pack (placeholder ids, names and coordinates, all `verified: false`) that shows every shape; it is validated
against the JSON Schema in `web/src/data/routeSchema.test.ts`. A trimmed step:

```json
{
  "id": "example:accept-a", "n": 1, "tags": {}, "conditions": [],
  "text": [{ "segments": [{ "t": "Accept Example Quest A" }] }],
  "actions": [
    { "type": "goto", "at": { "mapId": 1411, "x": 40, "y": 60, "zone": "Example Zone", "exact": true } },
    { "type": "accept", "questId": 900001, "label": "Example Quest A" }
  ],
  "routes": ["balanced", "speedrun"],
  "tips": [{ "kind": "speed", "text": "…", "roles": ["dps"], "routes": ["speedrun"], "sources": [{ "url": "https://…", "label": "…" }], "verified": false }],
  "professionHooks": [{ "profession": "Cooking", "itemId": 900100, "qty": 5, "skillTarget": 50, "npc": { "id": 900200, "name": "…", "zone": "…", "x": 41.5, "y": 61.2 }, "note": "…", "sources": [], "verified": false }],
  "sources": [{ "url": "https://…", "label": "…" }], "verified": false
}
```
