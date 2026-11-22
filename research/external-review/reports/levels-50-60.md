Sources: Questie plus OpenXP, WoW-Pro, TUGs, and Bethink were enough for ids, order, and prerequisites.

# Un'Goro, Felwood, Winterspring, Western and Eastern Plaguelands (Horde 40–60)

Route file was read only: `research/horde-40-60/horde-40-60.route.json`. No route JSON was edited.

This stretch is Un'Goro `h4060:un-goro-crater:t4494` (n=707) through the flight to Bloodvenom (n=757), Felwood `h4060:felwood:a4505` (n=760) through the flight to Everlook (n=786), Winterspring `h4060:winterspring:t4808` (n=797) through `h4060:winterspring:t4842` (n=827), Western Plaguelands `h4060:western-plaguelands:a5093` (n=830) through the Scholomance step (n=857), Eastern Plaguelands `h4060:eastern-plaguelands:a6021` (n=858) through the receipt book (n=875), then the Stratholme step (n=876). Level-60 balanced tails are Winterspring `h4060:winterspring:travel-eb5c19` (n=1200) and Eastern Plaguelands `h4060:eastern-plaguelands:travel-869244` (n=1204). Mount Hyjal, Silithus, Blackmaw Hold, and Shaper's Terrace were left to the other review.

## Facts

- Questie `zones.json`: zone 490 Un'Goro Crater is UiMap **1449**, zone 361 Felwood is **1448**, zone 618 Winterspring is **1452**, zone 28 Western Plaguelands is **1422**, zone 139 Eastern Plaguelands is **1423**. Bulwark turn-ins already use Tirisfal (zone 85, UiMap **1420**) because Questie spawns Shadow Priestess Vandis and Argent Officer Garush there. Steps in this stretch use those ids.
- 4494 `pre.single` is 32 or 7732, and `next` is 4496. 4496 `pre` is 4493 or 4494, and `next` is 4507. 32 and 4493 are the other faction's lead-ins. 7732 is the Zukk'ash report. The Azshara accept `h4060:azshara:a4494` (n=706) sits just before the Gadgetzan turn-in.
- 4284 has no `pre` and no `next`. The pylon quests 4285, 4287, and 4288 each have `pre` 4284 and are flagged `PARTY_ACCEPT`. 4321 `pre.group` is all three pylons. None of those four are steps.
- 4492 `next` is 4491. 4491 is `PARTY_ACCEPT` and has no `next`. 4243 `next` is 4244, then 4245 (`PARTY_ACCEPT`). 4290 `next` is 4291, then 4292. 4289 `next` is 4301. 4145 `next` is 4147. 974 `next` is 980. 980 `next` is 4842. 3884 starts from item 11116 and turns in to Williden Marshal (43.95, 7.14).
- 4505 `next` is 4506 (`PARTY_ACCEPT`). 5155 `next` is 5157. 5157 `next` is 5158 (a trip out to Islen). 4102 has no `pre` and no `next`; the objective is 15 Blood Amber. 4521 has no `pre` and `next` is 4741; the objective is 15 Raging Owlbeasts and 15 Ragged Owlbeasts, turned in to Trull Failbane at Bloodvenom (34.73, 52.79). 8460 `next` is 8462.
- 4726 is accepted and turned in in this same file in Burning Steppes, before 4808. 4808 `pre` is 4726 and `next` is 4809. 4809 `next` is 4810 (back to Tinkee). 3783 `next` is 977. 977 `next` is 5163. 5054 `next` is 5055. 5055 `next` is 5056. 5083 has no `pre` and `next` is 5084. 969 `next` is 975. 6603 `next` is 5082, and 5082 itself has no `pre`. 6029 and 6030 have no `pre`. Duke Nicholas Zverenhoff is at 71.63, 50.09 on map 1423. The route accepts 6030 and never turns it in.
- 5093 has no `pre` and `next` is 5096. 5096 has no `pre` in Questie and is flagged `PARTY_ACCEPT`; `next` is 5098. 5228 `pre` is 5096. The cauldron samples 5229, 5231, and 5233 end at the cauldron object. 5230, 5232, and 5234 are the bottle returns to Vandis. The route returns Felstone and Dalson's Tears and turns 5233 in at the Writhing Haunt cauldron (53.02, 65.61) without accepting 5234. 5234 `pre` is 5233 and `next` is 5235. 5098 `pre` is 5096 and `next` is 838. 4984 `next` is 4985. 5542, 5543, 5544, 6021, 6022, 6164, and 6133 have no `pre`.
- OpenXP 50–51 Un'Goro ids include 4145, 3882, 3883, 4503, 3844, 9052, 3881, 4284, 4243, then the three pylons and 4321, then 4290, 4291. Its later Un'Goro block adds 4492, 4501, 974, 4491, 4289, 980, 4301, 4292. Felwood ids include 4505, 5156, 8462, 4102, 8461, 4506. It does not show 4521. Western Plaguelands is the wildlife and farm-house chain (4984, 5058, 5021, 5142), not the Bulwark cauldrons. Eastern Plaguelands ids include 6021, 5542, 5543, 5544, 6164, and later 6030, 6133. Winterspring ids include 3783, 6603, 980, 4842, 5082, 6030, then later 977 and 969.
- WoW-Pro Forever Un'Goro (51–53) takes 4289 and 4290 on the way in, 3844, 3884, 4284 and the pylons, 4243 with the follow-up skipped, 4504, 4492, 4491, and 4496. Winterspring (54–55) takes 3783, 6029, 6030, 5601, 5054, 4808, 4809, 4842, 5082, 5083, and 5084. The Forever folder has no Felwood, Western Plaguelands, or Eastern Plaguelands chapter. The TBC Horde copies of those chapters use 8460, 5155, 5156, 4102, 4505, 4521, 6162, the Bulwark cauldrons through 5236, 5098, 5542, 5543, 5544, 6022, and 6030.
- TUGs 53–55 takes 4285, 4289, 4243, 4504, 4496, 4505, 5155, 4102, 4521, 6162, and 4506. 55–56 adds 4301, 4292, 4244, 4245, 4492, and 4491. 56–58 adds 5083, 3783, 977, 6030, 6029, 4808, and the Bulwark cauldrons. Bethink 50–52 Un'Goro takes 4494, 4496, 4284, the pylons, 4244, and 4245. Bethink Felwood takes 4505, 4102, 5157, and 4506. Bethink Western Plaguelands is the Bulwark line through the cauldrons and 5098. Bethink Winterspring takes 980, 4842, 5082, 4521, 3783, 6029, 6030, 4809, 969, and 977. Bethink Eastern Plaguelands takes 5542, 5543, 5544, 6022, 6133, and 6030.

## Order this changeset keeps

1. Gadgetzan, then Marshal's Refuge once: 4504, 3882, 4503, 3883, 4145, 4243, 3881, 4501. If A Mangled Journal (11116) drops, turn 3884 in to Williden with 3881. Do the east cave for the ape pelts and A-Me, the tar pits for 4504, the two camps for 3881, the hive room for 3883, and the west pterrordax for 4501 and 4503. Thermometer at the volcano is 974, then accept 980. Turn the refuge quests in, fly to Gadgetzan for 4504, then Bloodvenom.
2. Torwa on the south entrance: 4289, 4290, 4291, and 4301 while already in the ape cave. Stop there.
3. Bloodvenom once: 5155, 5156, 6162, 8460, then 5157 at the same Jaedenar moonwell. Turn those in at the post and at Grazle. Fly to Everlook. Do not walk the hold for a second furbolg quest.
4. Everlook once: turn in 4808 and 980, accept 6029, 6030, 6603, 5054, 4842, 5082. Winterfall and Darkwhisper Gorge are the same south road. Kill Ursius and Brumeran as the named targets on that loop. Hand 6029 to Garush at the Bulwark with 5093.
5. Bulwark: 5096, then Felstone, Dalson's Tears, and Writhing Haunt, each sample returned to Vandis, including the missing Writhing Haunt bottle (5234). 4984 is the wolves beside that road. 5098 is the four Andorhal towers on the way back.
6. Light's Hope first: turn in 6030, accept 6021. Then Tirion (5542, 5543, 5544), the receipt book, Zaeldarr, and Nathanos (6022) on the same road.

One Scholomance clear and one Stratholme clear stay optional tips. No instance script.

## Quests refused as slow or out of scope

Whole chains dropped, not trimmed:

- 4494 March of the Silithid and 4496 Bungle in the Jungle, including the Azshara accept. 4507 is the hive-queen follow-up and is not a step.
- 4284 Crystals of Power (7 of each color). The pylon trio and 4321 are not added.
- 4492 Lost! and 4491 A Little Help From My Friends. The second is the Ringo escort.
- 4505 Well of Corruption and 4506 Corrupted Sabers. The second is the kitten escort.
- 4102 Cleansing Felwood (15 Blood Amber).
- 4521 Wild Guardians (15 and 15 owlbeasts). 4741 is not added.
- 3783 and 977 Are We There, Yeti? The second is two pristine horns. 5163 is not added.
- 4809 Chillwind Horns (8 uncracked horns) and its return 4810. The 4808 turn-in stays; it is a talk, and 4726 is already done.
- 969 Luck Be With You (4 Frostmaul Shards) and the balanced trip that exists to do it. 975 is not added.
- 6133 The Ranger Lord's Behest (8 and 8 and 8, plus the registry) and the balanced flight that exists to do it.
- Winterspring catch-up grinds `grind-speedrun-before-5055` (about 84 minutes of Ice Thistle yeti) and `grind-balanced-before-5055` (about 103 minutes of crazed owlbeasts).

Not added, because they leave the camp or they are a second lap: 4285, 4287, 4288, 4321, 4244, 4245, 4292, 4147, 3844 and the rest of Linken's chain, 5158, 8462, 4741, 5084, 4810, 4985, 5235 and the Gahrron's Wither lap, 838 as a script, 5601 and Pamela's chain, 5163, 4507, and any Mount Hyjal or Silithus step.

## Prerequisite blocks

- Kept quests are not waiting on a missing prerequisite. 4726, 974, 5096, 5155, 5054, and 5233 are already in this file before the step that needs them. 980 is accepted in Un'Goro and turned in at Donova.
- 4494 stays blocked on the Horde side by 7732. Dropping 4494 blocks 4496. Dropping 4496 blocks 4507. None of those are kept.
- Dropping 4284 blocks 4285, 4287, 4288, and 4321. Dropping 4492 blocks 4491. Dropping 4505 blocks 4506. Dropping 3783 blocks 977 and 5163. Dropping 4809 blocks 4810. Dropping 4521 blocks 4741. Dropping 969 blocks 975. Those follow-ups are not steps, except 4491, 4506, and 977, which are dropped with the parent.

## Changeset

27 ops in `changesets/levels-50-60.json`: add 6, modify 0, reorder 0, drop 11, tip 10. All `verified: false`. Each farm chain shares one drop.
