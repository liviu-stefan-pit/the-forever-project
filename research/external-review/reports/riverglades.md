Sources: Questie plus Bethink Horde, OpenXP map names, WoW-Pro zone data, and the travel and level notes were enough.

# Riverglades and The Drowned City external review (Horde)

Route files were read only. No route JSON was edited.

- `research/levels-20-40.route-v2.json`: `horde-20-40:turnin-95143` (n=761), `horde-20-40:turnin-95141` (n=892), then Riverglades `horde-20-40:to-riverglades` (n=923) through `horde-20-40:handoff-to-40-60` (n=994).
- `research/horde-40-60/horde-40-60.route.json`: Riverglades n=1–42, return n=195–342, Krol'dok step n=339, Drowned City step n=192, and `h4060:tanaris:t95472` (n=448).

## Facts

- Questie `zones.json`: zone 16591 Riverglades is UiMap **2548**. Subzones parented to 16591, including 17780, also use 2548. There is no Drowned City row and no UiMap 17853 in this file. The Drowned Reef row is Arathi (zone 328, UiMap 1417) and is a different place. OpenXP names TDC 17853 and KS 17780; WoW-Pro Forever only defines zone 2548. Those instance ids are not confirmed here.
- Public travel notes: the zone is about 36–44. Free boat Steamwheedle Port (Tanaris about 68.6, 23.0) to Powderfuse Port, about 52 seconds. Horde flight master is Grakna at Rog'mar (about 59.6, 45.1), with routes to Stonard, Kargath, Flame Crest, and Hammerfall. Powderfuse has a wind rider and no flight routes in that build. On foot, Horde can come from Stonard through Redridge Pass, or from Kargath around level 40. Web level tables put Riverglades in 35–38 and 38–40, Krol'dok at 40, and The Drowned City at 40. A client dump lists Krol'dok as 40–45.
- OpenXP Horde 30–40 and WoW-Pro Forever Horde have no Riverglades chapter. TUGs has no Riverglades text. Bethink Horde 39–42 and 44–45 is the guide that walks Rog'mar, Powderfuse, and one clear of each dungeon.
- 94483 `pre` is the group 93786 and 93787. 96104 `pre` is 96103. 94672 and 94680 `pre` is 94483. 94727 `pre` is the group 94672 and 94680. 95427 `pre` is the group 95601 and 95602. 96105 `pre` is 96104. 96067 `pre` is 96063. 94532, 94533, and 94535 `pre` is 96109. Those prerequisites are on these two files.
- 95775 The Drowned City `pre` is 95770, which `pre` is 95748, which `pre` is 629. 629 is already on the 20–40 Stranglethorn route. 95776 `pre` is the group 95770 and 95773. 95773 `pre` is 95748. 95789 and 95791 have no `pre`. 96774 has no `pre` and starts in Mulgore. None of 95748, 95770, 95773, 95775, 95776, 95789, 95791, or 96774 are steps.
- 94968 and 94972 `pre` is 95278. 94975 `pre` is 94768. 94973 starts from item 267137 and its `next` is 94974 (4 Thick Leather and 12 Iron Bar). 95278 and 94768 are steps before the Krol'dok step. 94968, 94972, 94973, 94974, and 94975 are not steps.
- 95472 `pre` is 95321. 95321 `pre` is 95312. 95312 is a later Tanaris step. 95321 is not a step. 95982 is 10 Briny Seafood Stew. 97884 starts at an Undercity npc and asks for one Sunnyglade tome.

## Order this changeset keeps

One bag per camp. Level 40 and up stay on the 40–60 file.

1. Reach Rog'mar by the Tanaris boat to Powderfuse, then the inland road, or by the Rog'mar flight path from Stonard or Kargath. Set hearth with Toka and take Grakna once.
2. Turn in 95143 and 95141 on that arrival. Do not fly to Rog'mar in the middle of Arathi or the Stranglethorn second circuit.
3. Accept 93786, 93787, 93788, and 95951, then do Meadowsbrook and Turner's Logging Camp once. Pick up 96103 on that same south ride. Turn the bag in at Rog'mar, then take 94480, 94483, 95955, 96104, and the Powderfuse delivery 93976.
4. On the 40–60 file, do 95121 on the east shore with 95118, not before the flight to Kargath. Destroy the five ritual circles for 95602 in the Sunnyglade caves before that turn-in.
5. One Drowned City clear and one Krol'dok clear. The dungeon pack owns the inside of each run. A breadcrumb tip names the quests to hold before zoning in.

## Quests refused as slow or blocked

- 95982 Not My Circus. Ten stews is a cook grind at Powderfuse. No follow-up.
- 97884 Armory of Sunnyglade. The giver is in Undercity, and the tome is a separate errand from the Sunnyglade cave the route already walks.
- 95472 Consolation Prize. Its prerequisite 95321 is not a step, so the turn-in is blocked. 95321's own prerequisite is 95312.
- 95789 Shady Saltseers. Ten artifacts are a poor drop for a full group in one clear. It is not added.
- 96774 Ancient Gurubashi Idol. It starts and ends on a Mulgore plateau. It is not added.
- No Leatherworking camp-tent detour.

94968, 94972, and 94975 stay as a tip on the existing Krol'dok step because their prerequisites are already turned in before that step. 94974 uses the iron and thick leather the 40–60 buy line already names.

## Changeset

19 ops in `changesets/riverglades.json`: add 0, modify 7, reorder 5, drop 3, tip 4. All `verified: false`.
