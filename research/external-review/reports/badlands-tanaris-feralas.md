Sources: Questie plus OpenXP, WoW-Pro, TUGs, and Bethink were enough for ids, order, and prerequisites.

# Badlands, Tanaris, Feralas external review (Horde 40–50)

Route file was read only: `research/horde-40-60/horde-40-60.route.json`. `research/levels-20-40.route-v2.json` was checked only for handoffs. No route JSON was edited.

Badlands in this file is `h4060:badlands:a1419` (n=43) through `h4060:badlands:a1420` (n=63), then the flight to Stonard. Tanaris fieldwork is `h4060:tanaris:a1690` (n=390) through the Zul'Farrak step (n=453). Feralas is `h4060:feralas:a2862` (n=511) through `h4060:feralas:t2974` (n=553). Later Gadgetzan hand-ins for Un'Goro (4494, 4496, 4504) sit in the 50+ stretch and are not a second Tanaris circuit.

## Facts

- Questie `zones.json`: zone 3 Badlands is UiMap **1418**, zone 357 Feralas is **1444**, zone 440 Tanaris is **1446**. Steps in this stretch already use those ids. Riverglades steps that touch this stretch use **2548**.
- 20–40 already turns in 1418 to Neeka in Badlands, and it finishes Martek there: 1106, 1108, and 1137 (News for Fizzle leaves for the Shimmering Flats). Those are satisfied. This stretch correctly starts at 1419. Questie shows no `pre` on 1419 or 1420. 2258 `next` is 2202. 710 `next` is 711, then 712. 713 `next` is 714 (a gyrochronatom), then 715. 782 `next` is 793.
- 2872 Stoley's Debt is accepted in this same file in Stranglethorn (`h4060:stranglethorn-vale:a2872`, n=144). Questie marks it `breadcrumbFor` 2873 and gives 2873 no `pre`. 2874 `pre` is 2873. The route accepts 2874 and never turns it in.
- 95294 Smuggler's Bargain is accepted and turned in in Riverglades (n=327) before 95296. That satisfies 95383. 95472 `pre` is 95321, and its turn-in goto is already Powderfuse Port on map 2548. 95033 is accepted in Riverglades (n=198, map 2548) and turned in at Camp Mojache (n=203, map 1444), long before the real Feralas block.
- 3520 has no `pre`. Its objective is three screecher spirits in Feralas. The complete step sits in the Tanaris block and has no zone pin. There is no turn-in. `next` is 3527 (Zul'Farrak tablets).
- 7730 and 7731 each have `pre` 2903. 7732 `pre` is the group 7730 and 7731. 4494 `pre.single` is 32 or 7732, and `next` is 4496. 32 is the other faction's lead-in. Dropping the Zukk'ash chain blocks the Horde hand-in of March of the Silithid.
- 2973 `next` is 2974. 2974 `next` is 2976 (Orgrimmar). 2822 `next` is 7734 (Rage Scar hides). 2987 has no `pre` and no `next` in Questie. 2978 (the Gordunni scroll) is not on this route; 2979 needs it. 97540 is the turtle walk back to Torta. 95753 is `sort` SHAMAN. 96912, 84135, 84137, and 84138 are level 60.
- OpenXP 41–42 Badlands ids: 782, 2202, 712. It does not take 1419, 703, 710, or 713. Its 41–42 Feralas ids: 2987, 2975, 2862, 2863, 2902, 2903, then later 2980, 2973, 7730, 3121. Its Tanaris ids include 1690, 1707, 8365, 8366, 1691, 992, 82, 5863, 2605, and 10.
- WoW-Pro chapter 3 map ids match Questie (1418, 1446, 1444). It does 1419, 2258, 782, and 703 on one Badlands loop, skips the 2258 and 782 follow-ups, and sends 1420 to Stonard. In Tanaris it does 1690, 1707, and 3520, and it does 2873 in the pirate camp. In Feralas it does 2987 with the ogres, 2822, 2973, 7730, and 3520 on screechers.
- TUGs 45–48 accepts 2981 in Orgrimmar, tells the player to run Uldaman, then takes 1690 and 3520 before 2987, 2862, 2822, 2975, and 7730, and later 8365 and 992. Bethink 42–44 does 782, 2258, 1419, 710, and 713, then a full Uldaman. Bethink 45–47 Feralas takes 2822, 2862, 2973, 2975, 2987, 7730, 7731, 7003, and 7721.
- A free boat runs between Steamwheedle Port and Powderfuse Port. The speedrun step `h4060:riverglades:travel-70eade` already rides to Powderfuse and sails to Steamwheedle. The return trip is the hand-in for 95472. No other Riverglades quests belong on that landing.

## Order this changeset keeps

1. Kargath once: 1419, 2258, 703, 710, 782. Jawbones and fangs are the same coyotes. Gizzards and wings are the same buzzards. Five rock shards and the ten small shards for 710 are the same elementals. Turn that bag in, accept 1420, and fly to Stonard. Do not accept 793, 711, 712, 2202, or 656.
2. Gadgetzan and the port: 1690 and 1707 together, then 1691 on the next wastewander camp. 8366 and 2873 are the same pirate camp; 8365 is not. 992, 82, and 10 are one survey line. 3362 and 2605 are Thistleshrub Valley. 5863 and 97530 are the Dunemaul compound. Stop 2605 at Marin. 2606 is a talk in town; 2641 leaves for a violet tragan. 97534 stays (seven debris, no follow-up on the route).
3. One Zul'Farrak clear only if a group is already forming. No instance script, and no 3527.
4. Camp Mojache once, after the Gadgetzan flight: turn in 95033 here, not during Riverglades. Woodpaw is one south trip: 2862, 2863, 2902, 2903. Gordunni is one north trip: 2975, 2987, then 2980. Do not add 2978 or 2979.
5. Sail from Steamwheedle back to Powderfuse only to turn in 95472.

The Shadowprey alternate (`h4060:shen-dralas:travel-9a2877`) never lands at Camp Mojache, so 95033 waits until a Mojache landing.

## Quests refused as slow or out of scope

Whole chains dropped, not trimmed:

- Badlands catch-up grinds `grind-speedrun-before-782` (about 179 minutes of rock elementals) and `grind-balanced-before-782` (Dustbelcher maulers). 2258, 710, and 782 already cover those camps.
- 713 Coolant Heads Prevail, and with it 714 and 715. It is a frost oil and engineering shopping list.
- 8365 Pirate Hats Ahoy! (20 hats). 8366 stays, because those kills are the camp that holds Stoley's crate.
- 351 Find OOX-17/TN! and 2766 Find OOX-22/FE!. Both are long escorts. A dropped beacon is not a reason to run them.
- 3520 Screecher Spirits and its follow-up 3527. The complete step is in the wrong zone, the turn-in is missing, and the follow-up is a tablet run inside Zul'Farrak.
- 2874 Deliver to MacKinley. 2873 can be turned in at the port. Nothing in the rest of this route returns the bottle to Booty Bay.
- 97540 Oasis. It is the turtle escort.
- Level 60 Tanaris steps: 96912 (ten duels), 84138 (Winterspring handoff), 84135, and 84137.
- Feralas item farms: 2822 and its follow-up 7734; 2973, 2974, and 2976.
- Zukk'ash: 7730 (20 carapaces), 7731, and 7732.
- Forgotten Coast: 7003 (15 zapped giants) and 7721 (10 cores).
- 3121 A Strange Request. The route never turns it in, and 3122 opens the muisek chain.

Not added, because another stretch owns them or they are a separate grind: Uldaman and 2202, 793, 711, 712, 2978, 2979, 2981 as an Orgrimmar detour, 2641, and any Riverglades hub besides the 95472 landing and the 95033 breadcrumb.

## Prerequisite blocks

- Kept quests are not waiting on a missing prerequisite. 1418, 1106, 2872, and 95294 are already in an earlier file or earlier in this file. 2975 does not need 2981. 2873 does not need 2872 in Questie.
- Dropping 7730 and 7731 blocks 7732. That blocks the Horde side of 4494 (`pre` 32 or 7732). 4496 stays behind 4494. The 50+ Gadgetzan steps need a different lead-in, or the Zukk'ash chain has to come back.
- Dropping 3520 blocks 3527. Dropping 2822 blocks 7734. Dropping 2974 blocks 2976. None of those follow-ups are steps in this stretch.

## Changeset

24 ops in `changesets/badlands-tanaris-feralas.json`: add 0, modify 1, reorder 1, drop 18, tip 4. All `verified: false`. Each farm chain shares one drop.
