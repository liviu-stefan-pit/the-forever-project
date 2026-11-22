Keep 6382. It is a short handoff to Senani Thunderheart, and its prerequisite 882 is already accepted, completed, and turned in in `research/nova/v2/barrens-12-20.json`. Do not drop it for a missing 882, and do not add a hunt.

## Questie (`content/questie-db/quests.json`)

**6382 The Ashenvale Hunt.** `pre.single` is 882. No `objectives`. `objectivesText`: "Speak with Senani Thunderheart at Splintertree Post, Ashenvale." `xp` 390. No `next`.

**6383 The Ashenvale Hunt.** No `pre`. No `objectives`. No `xp`. No `next`. It is not a farm, so it stays.

## Route facts

882 in `research/nova/v2/barrens-12-20.json`: accept `barrens-12-20:120`, complete `barrens-12-20:122`, turn in `barrens-12-20:123` (Ishamuhale to Jorn Skyseer). A previous-file turn-in counts as the prerequisite being on the route.

6382 steps already in `research/levels-20-40.route-v2.json`: `horde-20-40:accept-6382`, `horde-20-40:turnin-6382`. Both stay.

6383 steps `horde-20-40:accept-6383` and `horde-20-40:turnin-6383` stay. Empty `pre` is not a reason to drop them.
