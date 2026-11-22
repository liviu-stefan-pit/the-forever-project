Drop `dungeons:gnomeregan:accept:2904` and `dungeons:gnomeregan:turnin:2904`. Questie npc 7850 Kernobee (`content/questie-db/npcs.json`) spawns in zone 721 at -1,-1, so A Fine Mess has no pin and must not be a required step. Put the escort on the existing clear step `dungeons:gnomeregan:run` as a tip: if you find Kernobee during this one clear, escort him out and turn the quest in to Scooty. Do not search the instance for him, and do not reset.

Questie object 142487 The Sparklematic 5200 (`content/questie-db/objects.json`) also spawns in zone 721 at -1,-1. The machine has no location. Drop `dungeons:gnomeregan:turnin:2945` (2945 ends on that object) and `dungeons:gnomeregan:accept:2949` (2949 starts on that object).

Leave `dungeons:gnomeregan:accept:2945` and `dungeons:gnomeregan:turnin:2949`. Those proposed steps pin to Nogg at 75.99, 25.41 in Orgrimmar, which is a real coordinate. 2945 starts from item 9326, and 2949 ends on npc 3412.

verified false. sources QuestieDB. targetFile `research/dungeons/steps-v2.json`.
