# FAIL

Route file was read only: `research/horde-40-60/horde-40-60.route.json`. Checked against `content/questie-db/quests.json` and `npcs.json`. No route JSON was edited.

Forbidden quests are not accept/complete/turn-in actions: 193, 196, 197, 208, 598, 4494, 4496, 95472, 95775, 95776, 95748, 95770, 95773, 93034–93122, 7730–7732, 8365, 351/648/836/2767, 2973, 7003/7721, 4284, 4491/4492, 4102, 4521, 4809, 969, 6133. Silithus stays 8276, 8277, 8280. 584, 585, 600 remain with accept → complete → turn-in. Boat tip on `h4060:tanaris:travel-6e1a1d` is optional and does not require 95472. Drowned City tip on `h4060:stranglethorn-vale:dungeon-40f1cb` does not require 629. 3884 is “when the journal drops,” not a farm. 5234 stops before Gahrron’s (5235 absent). 6030 text is not “Turn in Duke Nicholas Zverenhoff to Duke Nicholas Zverenhoff.”

## Defects

- **`h4060:feralas:fly-2a22b8`** (n=438) / **7732**. Required fly text and `fly` label still say to keep Zukk'ash Report for an Orgrimmar hand-in after Azshara. Questie 7732 (`pre.group` 7730 and 7731) has no accept/turn-in on this route. Smallest fix: rewrite the required text and label to only the flight (Camp Mojache → Orgrimmar → Undercity → Revantusk). Delete the Zukk'ash Report sentence.

- **`h4060:azshara:fly-3f5199`** (n=581) / **7732**, **4494**. Required fly text and `fly` label still say to hand Zukk'ash Report to Zilzibin Drumlore and take March of the Silithid. Questie 7732 ends at npc 7010; 4494 starts at 7010 with `pre.single` 32 or 7732. Neither is a quest step. Smallest fix: rewrite the required text and label to “Fly Valormok → Orgrimmar, then fly on to Gadgetzan.” Delete the report hand-in and 4494 accept.

- **`h4060:eastern-plaguelands:t6030`** (n=705) / **6030**. Turn-in is `balanced`+`speedrun`. Accept `h4060:winterspring:a6030` (n=654) is **balanced only**. Questie 6030 is a book from Gregor Greystone (npc 10431, 61.35, 38.97, zone 618) to Duke Nicholas Zverenhoff (npc 11039, 71.63, 50.09, zone 139). Speedrun cannot turn in a quest it never took. Smallest fix: add `"speedrun"` to `h4060:winterspring:a6030` `routes` (speedrun is already at Gregor for 6029). Do not change the turn-in sentence.
