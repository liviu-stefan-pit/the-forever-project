Sources: Questie prerequisites plus OpenXP, TUGs, WoW-Pro, and Bethink ids and order were enough.

# Hillsbrad and Thousand Needles external review

Route file was read only: `research/levels-20-40.route-v2.json`. No route JSON was edited.

## Facts

- `zones.json` zone 267 Hillsbrad Foothills is UiMap **1424**. Zone 400 Thousand Needles is UiMap **1441**. The Shimmering Flats subzone 439 uses 1441. Every goto already in these steps uses those map ids.
- Hillsbrad circuit is steps `horde-20-40:to-hillsbrad` through `turnin-98095` (n 261–371). Thousand Needles is `to-needles` through `turnin-98070` (n 372–487). Two earlier needles pins sit in Late Barrens: complete 1153 and turnin 5881.
- 1065 Journey to Tarren Mill `pre` is 1064. `horde-20-40:turnin-1064` is already on this route, so the chain is allowed. The route still accepts 1065 only after it has flown to Tarren Mill, then walks back to Apothecary Zamah. 1066 and 1067 stay. The fake complete at Zamah does not.
- 1153 A New Ore Sample `pre` is 893, already on Late Barrens. One sample at the Great Lift dig, same visit as the 5881 turn-in. Kept.
- 494 Time To Strike starts on Deathstalker Lesh at 20.79, 47.40, on the Silverpine road. The route accepts it only after the Thunder Bluff round trip.
- 496, 501, and 527 share the Hillsbrad fields. The route finishes the bear loop, drinks the elixir, then rides the same fields again for lions and only then accepts Battle of Hillsbrad.
- 502 ends on Stanley at 32.66, 35.32. The complete step still points at Lydon in Tarren Mill.
- 549 has no prerequisite. Its `next` is 566, which already has Alterac steps. 498 The Rescue is a key jail break in the same Syndicate camp as 1066, not an escort. Both stay. 546 needs 527 and is skulls from the same peasants as 528. 567 names four humans inside Hillsbrad while 532 is already clearing the town.
- 1145 starts on Korran in the Barrens and 1146 on Belgrom in Orgrimmar. Both are on this route, so 1147 at Moktar Krin is allowed. 1111 is one Ratchet handoff; 1112 and 1114 finish back at the mirage. 1115 `next` is 1116, and 1116 is already later on this route, so the letter stays.
- 676 `next` is 677, and 677 is already in the Arathi stretch of this same file. The Hillsbrad steps stay so that handoff is not broken. Do the ogres when Arathi starts.

## Order this changeset keeps

Enter Hillsbrad from Silverpine, take 494 on the road, set the Tarren Mill hearth, and clear the Syndicate camp once (1066, 498, 549). Pick up 496, 501, and 527 together and clear the fields and the town through 539 and 567. Mudsnout blossoms (509) and the Undercity drop-off (513) stay. Stop the agony chain there.

In Thousand Needles, take 4542 from Brave Moonhorn on the lift road before the Freewind flight path. Do Freewind, Highperch eggs, and the Grimtotem notes before the Barrens and Orgrimmar letter run for 1145. At the mirage, do rocket parts, venom, shells, vulture bones, and basilisks in one loop, plus the Ratchet parts turn-in. Leave the silithid hive after 1147 only.

OpenXP, WoW-Pro, TUGs, and Bethink still take several of the dropped quests (Dun Garok, turtle bisque, Helcular, Martek, sponsorship, tail fins). The camp-finish rule wins.

## Quests refused as slow or out of scope

Whole chains dropped, not trimmed:

- 7321 Soothing Turtle Bisque (turtle meat plus spices; the complete pin is in Alterac)
- 547 Humbert's Sword (one rare sword off Dun Garok)
- 552 and 553 Helcular's Revenge (yeti rod, then three flame braziers)
- 533 Infiltration (Syndicate missive). Blocks 503, 506, 507, and 508, and 503 already has Alterac steps
- 544 Prison Break In (four bloodstones in Alterac)
- 556 and 557 Stone Tokens and Bracers of Binding (Alterac elementals)
- 515, 517, and 524 Elixir of Agony from the murloc and naga collect onward (WoW-Pro's own note treats the keg follow-up as an elite skip; 5 Torn Fin Eyes and 5 Daggerspine Scales are on that step)
- 541 and 550 Battle of Hillsbrad (Dun Garok kill list, then the Undercity commendation that requires it)
- 4770 Homeward Bound and 4904 Free at Last (`PARTY_ACCEPT` escorts)
- 5147 WANTED: Arnak Grimtotem (elite in that same camp)
- 4881 and 4966 (dropped note, then the Galak assassin defense)
- 5088 Arikara (`PARTY_ACCEPT` summon). 5062 Sacred Fire stays; the plants are in the Grimtotem camp
- 1148 and 1184 Parts of the Swarm (heart, talons, and carapace after 1147, then Barrens and Orgrimmar)
- 1107 Encrusted Tail Fins (Stranglethorn)
- 1106, 1108, and 1137 (Badlands letter, ore flakes, return). 1190 is `next` of 1137 and is not on this route
- 1178 through 1183 Goblin Sponsorship (Ratchet, Booty Bay, and the stolen plans). 1186 is not on this route
- 5361 Family Tree (Feralas delivery)
- 5762 Hemet Nesingwary (Stranglethorn letter)
- The placeholder complete for 1065, which stands on Zamah after the note is already in the bag

1149 Test of Faith has no prerequisite, and it was not added. 1150 Test of Endurance is the follow-up.

## Changeset

30 ops in `changesets/hillsbrad-needles.json`: add 0, modify 1, reorder 7, drop 20, tip 2. All `verified: false`.
