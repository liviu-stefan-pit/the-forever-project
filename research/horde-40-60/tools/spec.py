# Route spec for Horde 40-60. "S" = in both routes (Speed + Balanced), "B" = Balanced only.
# ops: ("A"|"T"|"C", qid, routes, extra) ; ("FP"|"FLY"|"HS"|"TRAVEL"|"TRAIN"|"GRIND"|"DUNGEON"|"PROF"|"VENDOR", text, routes, extra)
ZONES = []
def zone(name, zid, lv, hub, ops, note=""):
    ZONES.append(dict(zone=name, zoneId=zid, levelRange=lv, hub=hub, ops=ops, note=note))

# ---------------- 40-42 Riverglades wrap-up (WoW Forever zone) ----------------
import auto as _auto
P5URL=["https://github.com/liviu-stefan-pit/project-forever/pull/5","https://github.com/Questie/QuestieDB/releases/tag/v1.1.3"]
def _el(v): return v.get('tag')=='Elite'
def _rf_riv(v): return "B" if _el(v) or (v.get('level') or 0)>43 else "S"
CRAFTQ={"Leather for Inclement Weather","Threading a Solution","Now We're Cooking"}
def _rf_s(v): return "B" if _el(v) or v.get('name') in CRAFTQ else "S"
def _rf_tan(v): return "B" if _el(v) or (v.get('level') or 0)>50 else "S"
def _rf_b(v): return "B"
RIV_OPS,_=_auto.auto_ops("Riverglades",16591,40,46,[59.6,45.0],_rf_riv)
# Lyra's 20-40 route leaves out 94532 and 94535 (level 38) because they need 96109 (level 40, on this route).
def _riv_insert(ops):
    F={"forever5":True,"zoneOverride":16591}
    def at(pred):
        return next(i for i,o in enumerate(ops) if pred(o))
    i=at(lambda o:o[0]=="T" and o[1]==96109)+1
    ops[i:i]=[("A",94532,"S",dict(F)),("A",94535,"S",dict(F))]
    # balanced: do them on the Snargl's Snout trip to the Bristle Hills
    i=at(lambda o:o[0]=="C" and o[1]==94533)+1
    ops[i:i]=[("C",94532,"B",dict(F)),("C",94535,"B",dict(F))]
    i=at(lambda o:o[0]=="T" and o[1]==94533)+1
    ops[i:i]=[("T",94532,"B",dict(F)),("T",94535,"B",dict(F))]
    # speedrun: no Snargl trip; kill the gnolls while at Clear 'em Out / Proof of Profit (south-west), hand in back at Rog'mar
    i=at(lambda o:o[0]=="T" and o[1]==95934)+1
    ops[i:i]=[("C",94532,"P",dict(F,key="c94532-speedrun",note="The Bristle Hills gnolls are a short ride north-west of here.")),("C",94535,"P",dict(F,key="c94535-speedrun"))]
    ops[len(ops):]=[("T",94532,"P",dict(F,key="t94532-speedrun",note="Hand in at Rog'mar before the Krol'dok step and the flight out.")),("T",94535,"P",dict(F,key="t94535-speedrun"))]
    return ops
RIV_OPS=_riv_insert(RIV_OPS)

# ---------------- 40-41 Hillsbrad / Alterac / Arathi wrap-up (Balanced) ----------------
# The 20-40 route keeps only quests up to level 40; these chain parts above 40 continue from it.
zone("Hillsbrad Foothills", 267, [40,41], "Tarren Mill", [
  ("TRAVEL","Balanced: finish the Tarren Mill chains that go past level 40 before leaving the north.","B",dict(verified=False)),
  ("A",519,"B",dict(note="Needs The Crown of Will (518), done in the 20-40 route.")), ("C",519,"B",dict(zoneOverride=36)), ("T",519,"B",{}),
  ("A",520,"B",{}), ("A",507,"B",dict(note="Needs Blackmoore's Legacy (506), done in the 20-40 route.")),
  ("C",520,"B",dict(zoneOverride=36)), ("C",507,"B",dict(zoneOverride=36)), ("T",507,"B",dict(zoneOverride=36)), ("A",508,"B",dict(zoneOverride=36)),
  ("T",520,"B",{}), ("T",508,"B",{}), ("A",521,"B",dict(note="The hand-in is in Undercity; the route passes there after Feralas.")),
  ("TRAVEL","Fly Tarren Mill -> Undercity, take the zeppelin to Orgrimmar, then fly Orgrimmar -> Brackenwall Village (Dustwallow Marsh).","B",dict(idkey="745ac4",verified=False)),
  ("T",521,"B",dict(zoneOverride=1497, idfull="h4060:feralas:t521", note="Balanced: in Undercity, hand in The Crown of Will to Sharlindra before the zeppelin.")),
])
zone("Arathi Highlands", 45, [41,42], "Hammerfall", [
  ("A",643,"B",dict(note="Needs Sigil of Thoradin (641), done in the 20-40 route.")), ("C",643,"B",{}), ("T",643,"B",{}),
  ("A",644,"B",{}), ("C",644,"B",{}), ("T",644,"B",{}),
  ("A",645,"B",{}), ("T",645,"B",{}), ("A",646,"B",{}), ("T",646,"B",{}),
  ("A",652,"B",dict(note="Starts at the Stone of Inner Binding after Stones of Binding (651) from the 20-40 route.")), ("C",652,"B",{}), ("T",652,"B",{}),
  ("FLY","Ride west from Hammerfall through the Thoradin's Wall gap to Tarren Mill (Hillsbrad Foothills).","B",dict(idkey="da009f",verified=False)),
])
_ZW=ZONES[-2:]; del ZONES[-2:]
zone("Riverglades", 16591, [40,43], "Rog'mar", [
  ("TRAVEL","You start at Rog'mar, where the 20-40 route ends (flight master Grakna). Set your hearthstone here: you come back to Rog'mar after Stranglethorn.","S",
     dict(idkey="4a6965", npc={"name":"Grakna","id":255993,"coords":[59.6,45.1],"zone":"Riverglades"}, verified=False, sources=P5URL+["https://foreverquestlog.com/zones/riverglades/"])),
  ("PROF","Before flying in, bank or buy: 10 Chunk of Boar Meat, 10 Heavy Weightstone, 12 Iron Bar and 4 Thick Leather. Three Rog'mar quests (including the Krol'dok key quest) ask for them, so having them ready saves a trip to a capital.","S",
     dict(verified=False, sources=["https://www.wowhead.com/forever/news/riverglades-is-one-of-the-best-leveling-zones-in-wow-forever-383849"])),
  ("TRAVEL","Riverglades quests of level 40 and up follow, hub by hub. Quests below 40 belong to the 20-40 research; any of their follow-ups listed here assume you did them.","S", dict(verified=False, sources=P5URL)),
] + RIV_OPS + [
  ("DUNGEON","Krol'dok Stronghold (level 40-45). Entrance is a cave west of the closed fortress gates; take Eye of Mugg from Krom'rosh and Key Ingredients from Kreza Darkthorn at Rog'mar first.","S",
     dict(dungeonName="Krol'dok Stronghold", coords=[37.5,37.5], verified=False,
          npc={"name":"Krom'rosh","id":256418,"coords":[59.4,45.6],"zone":"Riverglades"},
          sources=["https://warcraftmaps.com/dungeons/kroldok-stronghold","https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506"])),
  ("FLY","Fly Rog'mar -> Kargath (Badlands).","S", dict(verified=False, sources=["https://foreverquestlog.com/zones/riverglades/"])),
])

ZONES[0:0]=_ZW
# ---------------- 41-42 Badlands (Kargath) ----------------
zone("Badlands", 3, [41,42], "Kargath", [
  ("A",1419,"S",{}), ("A",2258,"S",{}), ("A",782,"S",{}), ("A",703,"S",{}),
  ("A",710,"B",{}), ("A",713,"B",{}),
  ("C",703,"S",{}), ("C",1419,"S",{}), ("C",2258,"S",{}), ("C",710,"B",{}), ("C",713,"B",{}),
  ("C",782,"S",{}),
  ("T",703,"S",{}), ("T",710,"B",{}), ("T",713,"B",{}),
  ("T",1419,"S",{}), ("T",2258,"S",{}), ("T",782,"S",{}),
  ("A",1420,"S",{}),
  ("DUNGEON","Uldaman (level 42-52). Pick up Uldaman Reagent Run from Jarkal Mossmeld in Kargath and Necklace Recovery from Dran Droffers in Orgrimmar before you go.","S",
     dict(dungeonName="Uldaman", questIds=[2202,2283,1956], verified=True)),
  ("FLY","Fly Kargath -> Stonard.","S",{}),
])

# ---------------- 42-44 Swamp of Sorrows (Stonard) ----------------
zone("Swamp of Sorrows", 8, [42,44], "Stonard", [
  ("T",1420,"S",{}), ("A",698,"S",{}), ("A",1424,"S",{}), ("A",1430,"S",{}), ("A",1393,"B",{}),
  ("C",698,"S",{}), ("C",1430,"S",{}), ("C",1424,"S",{}),
  ("T",698,"S",{}), ("A",699,"S",{}), ("C",699,"S",{}), ("T",699,"S",{}),
  ("A",1422,"S",{}), ("C",1422,"S",{}), ("T",1422,"S",{}),
  ("A",1426,"S",{}), ("C",1426,"S",{}), ("T",1426,"S",{}),
  ("A",1427,"B",{}), ("C",1427,"B",{}), ("T",1427,"B",{}), ("A",1428,"B",{}), ("C",1428,"B",{}), ("T",1428,"B",{}),
  ("C",1393,"B",{}), ("T",1393,"B",{}),
  ("T",1430,"S",{}), ("T",1424,"S",{}), ("A",1429,"S",{}),
  ("TRAVEL","Balanced: ride west from Stonard through Deadwind Pass to the Horde camp on the east edge of Duskwood (about 87.8, 35.6).","B",dict(verified=False)),
  ("A",1372,"B",dict(zoneOverride=10)), ("T",1372,"B",dict(zoneOverride=10)), ("A",1383,"B",dict(zoneOverride=10)), ("C",1383,"B",dict(zoneOverride=10)), ("T",1383,"B",dict(zoneOverride=10)),
  ("FLY","Fly Stonard -> Grom'gol (Stranglethorn).","S",{}),
])

# ---------------- 44-46 Stranglethorn Vale ----------------
zone("Stranglethorn Vale", 33, [44,46], "Grom'gol / Booty Bay", [
  ("A",570,"S",{}), ("A",584,"S",{}), ("A",598,"B",dict(note="Needs Bloody Bone Necklaces (596), done in the 20-40 route.")),
  ("TRAVEL","Ride north to Nesingwary's camp for the final hunting tiers.","S",{}),
  ("A",193,"S",{}), ("A",196,"S",{}),
  ("C",193,"S",{}), ("C",196,"S",{}), ("T",193,"S",{}), ("T",196,"S",{}),
  ("A",197,"S",{}), ("C",197,"S",{}), ("T",197,"S",{}), ("A",208,"S",{}), ("C",208,"S",{}), ("T",208,"S",{}),
  ("C",570,"S",{}), ("C",584,"S",{}), ("C",598,"B",{}), ("T",570,"S",{}), ("A",572,"S",{}), ("T",584,"S",{}),
  ("A",585,"S",{}), ("A",586,"S",{}), ("C",585,"S",{}), ("C",586,"S",{}), ("C",572,"S",{}),
  ("T",585,"S",{}), ("T",586,"S",{}), ("A",588,"S",{}), ("C",588,"S",{}), ("T",588,"S",{}),
  ("T",572,"S",{}), ("A",571,"S",{}), ("A",589,"S",{}), ("C",589,"S",{}), ("T",589,"S",{}), ("A",591,"S",{}),
  ("TRAVEL","Ride or fly to Booty Bay.","S",{}),
  ("A",595,"S",{}), ("A",617,"B",{}), ("A",621,"S",{}), ("A",209,"B",{}), ("A",2872,"S",{}), ("TRAVEL","Whiskey Slim's Lost Grog (580) is level 50 in the import, too high for this visit: leave it.","B",dict(idfull="h4060:stranglethorn-vale:a580",verified=False,sources=["https://github.com/liviu-stefan-pit/project-forever/tree/main/content/questie-db"])),
  ("T",595,"S",{}),
  ("A",600,"B",dict(note="Needs Singing Blue Shards (605), done in the 20-40 route.")), ("A",606,"B",{}),
  ("A",597,"S",{}), ("C",597,"S",{}), ("T",597,"S",{}), ("A",576,"S",dict(note="Opens once The Bloodsail Buccaneers (597) is handed in.")), ("A",587,"S",{}), ("A",599,"S",{}), ("T",599,"S",{}), ("A",604,"S",{}),
  ("C",604,"S",{}), ("C",576,"S",{}), ("C",587,"S",{}), ("C",600,"B",{}), ("C",606,"B",{}), ("C",617,"B",{}), ("C",209,"B",{}), ("C",621,"S",{}), ("C",571,"S",{}), ("C",591,"S",{}),
  ("T",604,"S",{}), ("T",576,"S",{}), ("T",587,"S",{}), ("T",600,"B",{}), ("T",606,"B",{}), ("A",607,"B",{}), ("T",607,"B",{}), ("A",609,"B",{}), ("C",609,"B",{}), ("T",609,"B",{}),
  ("T",617,"B",{}), ("T",209,"B",{}), ("T",621,"S",{}), ("A",608,"B",{}), ("C",608,"B",{}), ("T",608,"B",{}),
  ("T",571,"S",{}), ("A",573,"B",{}), ("T",591,"S",{}), ("T",598,"B",{}),
  ("A",592,"S",{}), ("C",592,"S",{}), ("T",592,"S",{}), ("A",593,"B",{}), ("C",593,"B",{}), ("T",593,"B",{}),
  ("DUNGEON","The Drowned City (WoW Forever, level 35-40) sits off the coast west of Grom'gol. Skip it at 44+ unless you need its loot; mobs grey out fast.","B",
     dict(dungeonName="The Drowned City", verified=False, sources=["https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506"])),
  ("TRAVEL","Fly Booty Bay -> Stonard, then Stonard -> Rog'mar (Riverglades), or use your hearthstone if it is set at Rog'mar.","S",dict(idkey="e6bbca",verified=False)),
])


# ---------------- 44-46 Dustwallow Marsh (Brackenwall) - Balanced side trip ----------------
zone("Dustwallow Marsh", 15, [44,46], "Brackenwall Village", [
  ("TRAVEL","Balanced: at Brackenwall Village, pick up the Mok'Morokk and Brood of Onyxia quests.","B",dict(idkey="dc7cd3")),
  ("A",1166,"B",{}), ("A",1168,"B",{}), ("A",1169,"B",{}), 
  ("C",1166,"B",{}), ("C",1168,"B",{}), ("C",1169,"B",{}), 
  ("T",1166,"B",{}), ("T",1168,"B",{}), ("T",1169,"B",{}), 
  ("A",1170,"B",{}), ("C",1170,"B",{}), ("T",1170,"B",{}), ("A",1171,"B",{}), ("C",1171,"B",{}), ("T",1171,"B",{}),
  ("A",1172,"B",{}), ("C",1172,"B",{}), ("T",1172,"B",{}),
  ("TRAVEL","Fly Brackenwall Village -> Gadgetzan.","B",{}),
])

# ---------------- 46-48 Tanaris (Gadgetzan) ----------------
zone("Tanaris", 440, [46,48], "Gadgetzan", [
  ("A",1690,"S",{}), ("A",1707,"S",{}), ("A",992,"S",{}), ("A",2605,"B",{}), ("A",5863,"B",{}), ("A",3362,"B",{}),
  ("TRAVEL","Ride east to Steamwheedle Port.","S",{}),
  ("T",2872,"S",{}), ("A",2873,"S",{}), ("A",8365,"S",{}), ("A",8366,"S",{}), ("A",3520,"S",{}),
  ("C",8365,"S",{}), ("C",8366,"S",{}), ("C",2873,"S",{}),
  ("T",8365,"S",{}), ("T",8366,"S",{}), ("T",2873,"S",{}), ("A",2874,"S",{}),
  ("C",1690,"S",{}), ("C",1707,"S",{}), ("C",992,"S",{}), ("C",3520,"S",{}),
  ("T",1690,"S",{}), ("A",1691,"S",{}), ("C",1691,"S",{}), ("T",1691,"S",{}), ("T",1707,"S",{}), ("T",992,"S",{}),
  ("A",82,"S",{}), ("C",82,"S",{}), ("T",82,"S",{}), ("A",10,"S",{}), ("C",10,"S",{}), ("T",10,"S",{}),
  ("A",351,"S",dict(note="The robot beacon item drops from mobs in the zone; only take the escort if it drops.")),
  ("C",2605,"B",{}), ("T",2605,"B",{}), ("C",5863,"B",{}), ("T",5863,"B",{}), ("C",3362,"B",{}), ("T",3362,"B",{}),
  ("TRAVEL","WoW Forever adds new Tanaris quests; pick them up now.","S",dict(verified=False,sources=P5URL)),
  ]+_auto.auto_ops("Tanaris",440,40,60,[51.0,28.0],_rf_tan)[0]+[
  ("DUNGEON","Zul'Farrak (level 44-54). Entrance in north-west Tanaris. Quests: Divino-matic Rod, Scarab Shells, Troll Temper, Tiara of the Deep, Gahz'rilla.","S",
     dict(dungeonName="Zul'Farrak", questIds=[2768,2865,3042,2846,2770], verified=True)),
  ("FLY","Fly Gadgetzan -> Camp Mojache (Feralas).","S",{}),
])

SHEN=["https://bytetavern.com/wow-forever-shendralas/","https://polestar.guide/guides/40-50/shendralas"]
zone("Shen'dralas", 16651, [46,48], "Valley of Bones (no flight path)", [
  ("TRAVEL","Balanced only: fly to Shadowprey Village (Desolace) instead of Camp Mojache, ride east along the southern edge of Desolace past Gelkis Village, and follow the Valley of Bones south into Shen'dralas. The zone has no flight master.","B",dict(verified=False,sources=SHEN)),
  ("TRAVEL","The Shen'dralar guards in the temple and the elves in the Forlorn Gardens are neutral. Leave them alone.","B",dict(verified=False,sources=SHEN)),
] + _auto.auto_ops("Shen'dralas",16651,38,49,None,_rf_b,pull_level=38)[0] + [
  ("TRAVEL","Ride back north through the Valley of Bones, then take the road south from Desolace past Dire Maul into Feralas and on to Camp Mojache.","B",dict(verified=False,sources=SHEN)),
])

# ---------------- 48-50 Feralas (Camp Mojache) ----------------
zone("Feralas", 357, [48,50], "Camp Mojache", [
  ("A",2862,"S",{}), ("A",2975,"S",{}), ("A",2987,"S",{}), ("A",2973,"S",{}), ("A",2822,"B",{}), ("A",3121,"B",{}),
  ("C",2862,"S",{}), ("T",2862,"S",{}), ("A",2863,"S",{}), ("C",2863,"S",{}), ("T",2863,"S",{}),
  ("A",2902,"S",{}), ("C",2902,"S",{}), ("T",2902,"S",{}), ("A",2903,"S",{}), ("C",2903,"S",{}), ("T",2903,"S",{}),
  ("C",2975,"S",{}), ("C",2987,"S",{}), ("C",2973,"S",{}), ("C",2822,"B",{}),
  ("T",2975,"S",{}), ("A",2980,"S",{}), ("T",2987,"S",{}), ("T",2973,"S",{}), ("A",2974,"S",{}), ("T",2822,"B",{}),
  ("A",7730,"S",{}), ("A",7731,"S",{}), ("C",7730,"S",{}), ("C",7731,"S",{}),
  ("A",7721,"S",{}), ("A",7003,"S",{}), ("C",7721,"S",{}), ("C",7003,"S",{}), ("T",7721,"S",{}), ("T",7003,"S",{}),
  ("A",2766,"S",dict(note="The beacon drops from mobs; only escort if it drops.")),
  ("C",2980,"S",{}), ("T",2980,"S",{}), ("T",7730,"S",{}), ("T",7731,"S",{}), ("A",7732,"S",{}),
  ("C",2974,"S",{}), ("T",2974,"S",{}),
  ("DUNGEON","Maraudon (level 45-52) is in Desolace, a short ride north from Feralas; run it with a group between 46 and 52.","S",
     dict(dungeonName="Maraudon", questIds=[7029,7068,7067,7044,7064], verified=True)),
  ("DUNGEON","Dire Maul (level 55-60) sits in north Feralas; come back at 55+ for its wings.","S",
     dict(dungeonName="Dire Maul", verified=True)),
  ("DUNGEON","Alcaz Prison (WoW Forever, level 48-53) on Alcaz Island off Dustwallow Marsh. Run it once between Feralas and Un'Goro if your group is 48-52.","S",
     dict(dungeonName="Alcaz Prison", verified=False, sources=["https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506"])),
  ("FLY","Fly Camp Mojache -> Orgrimmar, then zeppelin to Undercity and fly to Revantusk Village (Hinterlands). Keep Zukk'ash Report in your bags: it is handed in at Orgrimmar after Azshara, when its level-50 follow-up can be taken.","S",dict(idkey="2a22b8")),
])

# ---------------- 49-51 The Hinterlands (Revantusk) ----------------
zone("The Hinterlands", 47, [49,51], "Revantusk Village", [
  ("A",7828,"S",{}), ("A",7829,"S",{}), ("A",7830,"S",{}), ("A",7839,"S",{}), ("A",7841,"S",{}), ("A",7844,"S",{}),
  ("A",7840,"S",{}), ("A",7815,"B",{}), ("A",7849,"S",{}), ("A",7850,"S",{}), ("A",7845,"S",{}),
  ("T",1429,"S",dict(note="Hand The Atal'ai Exile in to the troll exile in the south of the zone."))
  , ("C",7828,"S",{}), ("C",7829,"S",{}), ("C",7830,"S",{}), ("C",7840,"S",{}),
  ("C",7839,"S",{}), ("C",7844,"S",{}), ("C",7841,"S",{}), ("C",7849,"S",{}), ("C",7850,"S",{}), ("C",7845,"S",{}),
  ("T",7845,"S",{}), ("A",7846,"S",{}), ("C",7846,"S",{}), ("T",7846,"S",{}), ("A",7847,"S",{}),
  ("C",7815,"B",{}), ("A",2742,"B",{}), ("C",2742,"B",{}), ("T",2742,"B",{}),
  ("T",7828,"S",{}), ("T",7829,"S",{}), ("T",7830,"S",{}), ("T",7839,"S",{}), ("T",7840,"S",{}), ("T",7841,"S",{}),
  ("T",7844,"S",{}), ("T",7849,"S",{}), ("T",7850,"S",{}), ("T",7847,"S",{}), ("T",7815,"B",{}), ("A",7842,"S",{}),
  ("C",7842,"S",{}), ("T",7842,"S",{}), ("A",7843,"B",{}), ("C",7843,"B",{}), ("T",7843,"B",{}),
  ("DUNGEON","Sunken Temple (level 50-60) in Swamp of Sorrows: Jammal'an the Prophet from the Atal'ai Exile, plus class quests.","S",
     dict(dungeonName="Sunken Temple", questIds=[1446], verified=True)),
])

# ---------------- 48-50 Searing Gorge (Balanced only) ----------------
zone("Searing Gorge", 51, [48,50], "Thorium Point", [
  ("A",7723,"B",{}), ("A",7724,"B",{}), ("A",7727,"B",{}), ("A",7722,"B",{}), ("A",3441,"B",{}),
  ("C",7723,"B",{}), ("C",7724,"B",{}), ("C",7727,"B",{}), ("C",3441,"B",{}),
  ("T",7723,"B",{}), ("T",7724,"B",{}), ("T",7727,"B",{}), ("T",3441,"B",{}), ("A",3442,"B",{}),
  ("C",3442,"B",{}), ("T",3442,"B",{}),
])

# ---------------- 51-52 Azshara (Valormok) ----------------
zone("Azshara", 16, [51,52], "Valormok", [
  ("A",5535,"S",{}), ("A",5536,"S",{}), ("A",3517,"S",{}), ("A",3601,"B",{}),
  ("C",5535,"S",{}), ("C",5536,"S",{}), ("C",3517,"S",{}), ("C",3601,"B",{}),
  ("T",5535,"S",{}), ("T",5536,"S",{}), ("T",3517,"S",{}), ("T",3601,"B",{}), ("A",5534,"B",{}), ("C",5534,"B",{}), ("T",5534,"B",{}),
  ("A",3518,"S",dict(note="Delivery quests pay well for a flight you are making anyway: take the Thunder Bluff and Undercity ones and hand them in as the route passes those cities.")),
  ("A",3541,"B",{}), ("A",3542,"S",{}), ("A",3561,"B",{}),
  ("TRAVEL","WoW Forever adds new Azshara quests; work through them hub by hub.","S",dict(verified=False,sources=P5URL)),
  ]+_auto.auto_ops("Azshara",16,48,60,[22.0,49.6],_rf_s)[0]+[
  ("FLY","Fly Valormok -> Orgrimmar. Hand Zukk'ash Report to Zilzibin Drumlore (Valley of Spirits) and take March of the Silithid, then fly on to Gadgetzan.","S",{}),
  ("T",7732,"S",dict(idfull="h4060:feralas:t7732")), ("A",4494,"S",dict(note="Level 50 needed; hand it to Alchemist Pestlezugg in Gadgetzan.")),
])

# ---------------- 52-55 Un'Goro Crater (Marshal's Refuge) ----------------
zone("Un'Goro Crater", 490, [52,55], "Marshal's Refuge", [
  ("T",4494,"S",dict(note="Alchemist Pestlezugg, Gadgetzan.")),
  ("A",4496,"S",dict(note="Take Bungle in the Jungle from Alchemist Pestlezugg in Gadgetzan on the way in.")),
  ("A",4504,"S",dict(note="Take Super Sticky from Tran'rek in Gadgetzan on the way in.")),
  ("A",3882,"S",{}), ("A",4503,"S",{}), ("A",3883,"S",{}), ("A",4145,"S",{}), ("A",4243,"S",{}), ("A",4284,"S",{}),
  ("A",4492,"S",{}), ("A",3881,"B",{}), ("A",4501,"S",{}),
  ("C",4284,"S",{}), ("C",3883,"S",{}), ("C",4503,"S",{}), ("C",3882,"S",{}), ("C",4145,"S",{}), ("C",4504,"S",{}), ("C",4496,"S",{}),
  ("C",4492,"S",{}), ("T",4492,"S",{}), ("A",4491,"S",{}), ("C",4491,"S",{}), ("T",4491,"S",{}),
  ("A",4289,"S",{}), ("A",4290,"S",{}), ("C",4289,"S",{}), ("C",4290,"S",{}), ("T",4289,"S",{}), ("T",4290,"S",{}),
  ("A",4291,"S",{}), ("C",4291,"S",{}), ("T",4291,"S",{}), ("A",4301,"B",{}), ("C",4301,"B",{}), ("T",4301,"B",{}),
  ("C",4501,"S",{}), ("C",3881,"B",{}),
  ("A",974,"S",{}), ("C",974,"S",{}), ("T",974,"S",{}), ("A",980,"S",{}),
  ("C",4243,"S",{}), ("T",4243,"S",{}),
  ("T",4284,"S",{}), ("T",3883,"S",{}), ("T",4503,"S",{}), ("T",3882,"S",{}), ("T",4145,"S",{}), ("T",4501,"S",{}), ("T",3881,"B",{}),
  ("FLY","Fly Marshal's Refuge -> Gadgetzan to hand in the Tanaris quests, then fly to Bloodvenom Post (Felwood).","S",{}),
  ("T",4496,"S",{}), ("T",4504,"S",{}),
])

# ---------------- 54-56 Felwood (Bloodvenom Post) ----------------
zone("Felwood", 361, [54,56], "Bloodvenom Post", [
  ("A",4505,"S",{}), ("A",4521,"S",{}), ("A",6162,"B",{}),
  ("A",5155,"S",{}), ("A",5156,"S",{}), ("A",4102,"S",{}), ("A",8460,"B",{}),
  ("C",5155,"S",{}), ("C",5156,"S",{}), ("C",4505,"S",{}), ("C",4521,"S",{}), ("C",4102,"S",{}), ("C",6162,"B",{}), ("C",8460,"B",{}),
  ("T",5155,"S",{}), ("T",5156,"S",{}), ("T",4102,"S",{}), ("A",5157,"S",{}), ("C",5157,"S",{}), ("T",5157,"S",{}),
  ("T",4505,"S",{}), ("T",4521,"S",{}), ("T",6162,"B",{}), ("T",8460,"B",{}), ("A",4506,"S",{}),
  ("C",4506,"S",{}), ("T",4506,"S",{}),
  ("FLY","Fly Bloodvenom Post -> Everlook (Winterspring). If you have not walked there yet, go through the Timbermaw Hold tunnel in north Felwood.","S",{}),
])


# ---------------- 54-55 Burning Steppes (Flame Crest) ----------------
zone("Burning Steppes", 46, [54,55], "Flame Crest", [
  ("A",4726,"S",{}), ("A",4296,"B",{}), ("C",4726,"S",{}), ("C",4296,"B",{}), ("T",4726,"S",{}), ("T",4296,"B",{}),
  ("A",4808,"S",dict(note="Felnok Steelspring is in Everlook; this sends you to Winterspring next.")),
  ("DUNGEON","Blackrock Depths (level 52-60) is in Blackrock Mountain between Searing Gorge and Burning Steppes.","S",
     dict(dungeonName="Blackrock Depths", questIds=[4136,4123,3907], verified=True)),
  ("FLY","Fly Flame Crest -> Orgrimmar, then on to Everlook (Winterspring).","S",{}),
])

# ---------------- 55-57 Winterspring (Everlook) ----------------
zone("Winterspring", 618, [55,57], "Everlook", [
  ("T",4808,"S",{}), ("A",4809,"S",{}), ("A",6029,"S",{}), ("A",6030,"B",{}), ("A",6603,"S",{}), ("A",5054,"S",{}), ("A",3783,"S",{}), ("A",969,"B",{}),
  ("T",980,"S",dict(note="The New Springs from Un'Goro is handed in to Donova Snowden at the hot springs.")), ("A",4842,"S",{}),
  ("T",6603,"S",{}), ("A",5082,"S",{}), ("C",5082,"S",{}), ("C",5054,"S",{}), ("C",3783,"S",{}), ("C",4842,"S",{}),
  ("T",5082,"S",{}), ("A",5083,"S",dict(note="Starts from a Winterfall Firewater drop; keep the first one.")),
  ("T",5083,"S",{}),
  ("T",5054,"S",{}), ("A",5055,"S",{}), ("C",5055,"S",{}), ("T",5055,"S",{}), ("T",3783,"S",{}), ("A",977,"S",{}),
  ("C",977,"S",{}), ("T",977,"S",{}), ("C",4809,"S",{}), ("T",4809,"S",{}), ("T",4842,"S",{}),
  # dungeon-unlock: Blackrock Spire after Chillwind Horns (4809) so Return to Tinkee (4810) and its chain open
  ("DUNGEON","Blackrock Spire (level 55-60), also in Blackrock Mountain. The lower part starts the Warlord's Command chain.","S",
     dict(dungeonName="Blackrock Spire", questIds=[4903], verified=True, idfull="h4060:burning-steppes:dungeon-1e7cdc")),
  ("C",969,"B",{}), ("T",969,"B",{}),
])

# ---------------- 56-58 Western + Eastern Plaguelands ----------------
zone("Western Plaguelands", 28, [56,57], "The Bulwark", [
  ("A",5093,"S",dict(note="A Call to Arms: The Plaguelands! is offered in Orgrimmar, Undercity and Thunder Bluff; take one.")),
  ("T",5093,"S",{}), ("T",6029,"S",dict(note="The Everlook Report goes to Argent Officer Garush at the Bulwark.")), ("A",5096,"S",{}), ("C",5096,"S",{}), ("T",5096,"S",{}),
  ("A",5228,"S",{}), ("T",5228,"S",{}), ("A",5229,"S",{}), ("C",5229,"S",{}), ("T",5229,"S",{}), ("A",5230,"S",{}), ("T",5230,"S",{}),
  ("A",5231,"S",{}), ("C",5231,"S",{}), ("T",5231,"S",{}), ("A",5232,"S",{}), ("T",5232,"S",{}),
  ("A",5233,"B",{}), ("C",5233,"B",{}), ("T",5233,"B",{}),
  ("A",4984,"S",{}), ("C",4984,"S",{}), ("T",4984,"S",{}), ("A",5098,"S",{}), ("C",5098,"S",{}), ("T",5098,"S",{}),
  ("DUNGEON","Scholomance (level 55-60) on Caer Darrow. It needs the key chain that starts after All Along the Watchtowers.","S",
     dict(dungeonName="Scholomance", questIds=[838,5098], verified=True)),
])
zone("Eastern Plaguelands", 139, [57,58], "Light's Hope Chapel", [
  ("A",6021,"S",{}), ("A",6164,"B",{}), ("A",5542,"S",{}), ("A",5543,"S",{}), ("A",5544,"S",{}),
  ("A",6022,"S",dict(note="From Nathanos Blightcaller at his farm south-west of Light's Hope.")),
  ("A",6133,"B",{}),
  ("C",5542,"S",{}), ("C",5543,"S",{}), ("C",5544,"S",{}), ("C",6021,"S",{}), ("C",6022,"S",{}), ("C",6133,"B",{}), ("C",6164,"B",{}),
  ("T",5542,"S",{}), ("T",5543,"S",{}), ("T",5544,"S",{}), ("T",6021,"S",{}), ("T",6022,"S",{}), ("T",6133,"B",{}), ("T",6164,"B",{}),
  # dungeon-unlock: Stratholme after 5542-5544 and 6022 so Redemption (5742) and Duskwing (6135) open
  ("DUNGEON","Stratholme (level 58-60) in north Eastern Plaguelands. The live side needs no key.","S",
     dict(dungeonName="Stratholme", verified=True, idfull="h4060:western-plaguelands:dungeon-04957c")),
])

# ---------------- 58-60 Mount Hyjal (WoW Forever) - Speed finish ----------------
HY=["https://www.wowforeveraddon.com/guides/quests/mount-hyjal/","https://wofwforever.com/en/guides/wow-forever-mount-hyjal-access/","https://khorium.pro/guide-view.html?slug=wow-forever-mount-hyjal-quests","https://bytetavern.com/wow-forever-mount-hyjal/"]
def hy(t, title, npc, xy, routes="S", qid=None, extra=None):
    d=dict(title=title, npc={"name":npc,"coords":xy,"zone":"Mount Hyjal"}, verified=False, sources=HY, forever=True)
    if qid: d["questId"]=qid
    if extra: d.update(extra)
    return ("FQ"+t, title, routes, d)
import hyjal as _hy
def _hyops():
    ops=[("TRAVEL","From Everlook, ride east through Darkwhisper Gorge into Mount Hyjal. Faction quests need level 54; the zone's quests are built for 56-60.","S", dict(verified=False, sources=HY))]
    ops+=_auto.auto_ops("Mount Hyjal",616,56,60,None,_rf_s,pull_level=54,near=(493,618))[0]
    ops.append(("DUNGEON","At 60, Blackmaw Hold (Azshara, level 55-60) is a WoW Forever max-level dungeon for pre-raid gear.","S",
     dict(dungeonName="Blackmaw Hold", verified=False, sources=["https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506"])))
    ops.append(("DUNGEON","At 60, Shaper's Terrace (Un'Goro, level 58-60) is the other WoW Forever max-level dungeon for pre-raid gear.","S",
     dict(dungeonName="Shaper's Terrace", verified=False, sources=["https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506"])))
    return ops
zone("Mount Hyjal", 616, [58,60], "Horde camp (Zet'gan)", _hyops())

# ---------------- 58-60 Silithus (Balanced alternative / extra) ----------------
zone("Silithus", 1377, [58,60], "Cenarion Hold", [
  ("A",8276,"B",dict(note="Taking Back Silithus is offered in Orgrimmar.")), ("T",8276,"B",{}), ("A",8280,"B",{}), ("A",8277,"B",{}),
  ("C",8280,"B",{}), ("C",8277,"B",{}), ("T",8280,"B",{}), ("T",8277,"B",{}),
])


# ---------------- Level-curve reorder (20-40 now arrives at Rog'mar at about 38 balanced / 34.5 speedrun) ----------------
def _split_riv():
    zi=next(i for i,z in enumerate(ZONES) if z['zone']=="Riverglades")
    z=ZONES[zi]; ops=z['ops']
    qops=[o for o in ops if o[0] in ("A","C","T")]
    lvl={o[1]:(_auto.P5Q[str(o[1])].get('level') or 0) for o in qops}
    low=set()
    for o in qops:
        q=o[1]
        if q in low: continue
        pre=(_auto.P5Q[str(q)].get('pre') or {})
        pres=(pre.get('group') or [])+(pre.get('single') or [])
        if lvl[q]<=40 and all((p not in lvl) or (p in low) for p in pres): low.add(q)
    head=[o for o in ops[:3]]
    tail_d=[o for o in ops if o[0]=="DUNGEON"]
    fly=[o for o in ops if o[0]=="FLY"]
    lo=[o for o in ops[3:] if o[0] in ("A","C","T") and o[1] in low]
    hi=[o for o in ops[3:] if o[0] in ("A","C","T") and o[1] not in low]
    zlow=dict(z, levelRange=[38,41], ops=head+lo+fly)
    zhigh=dict(z, levelRange=[44,46], ops=[("TRAVEL","Back at Rog'mar: the Riverglades quests of level 41 and up are open now.","S",dict(verified=False,sources=P5URL))]+hi+tail_d+[
        ("TRAVEL","Speedrun: ride east to Powderfuse Port and take the boat to Steamwheedle Port (Tanaris), then ride west to Gadgetzan.","P",dict(verified=False,sources=P5URL+["https://foreverquestlog.com/zones/riverglades/"])),
        ("FLY","Balanced: fly Rog'mar -> Hammerfall (Arathi Highlands).","B",dict(verified=False,sources=["https://foreverquestlog.com/zones/riverglades/"]))])
    return zlow, zhigh
_zl,_zh=_split_riv()
_by={}
for _z in ZONES: _by.setdefault(_z['zone'],_z)
import os as _os
_mid={"B":_by["Badlands"],"W":_by["Swamp of Sorrows"],"T":_by["Stranglethorn Vale"],"H":_zh}
_order=[_zl]+[_mid[c] for c in _os.environ.get("ORD","BWTH")]+[_by["Arathi Highlands"],_by["Hillsbrad Foothills"],_by["Dustwallow Marsh"]]
_rest=[z for z in ZONES if z['zone'] not in ("Riverglades","Badlands","Swamp of Sorrows","Stranglethorn Vale","Arathi Highlands","Hillsbrad Foothills","Dustwallow Marsh")]
ZONES[:]=_order+_rest

# Speedrun now arrives at 34.5: in the opening zones, also send the plain (non-elite, non-crafting) balanced quests down the speedrun line,
# because doing them at the same hubs is faster than grinding the same XP.
def _local(q, z):
    """Giver and hand-in both stand in this block's zone (no city or cross-zone legs), and the quest is not above the block's band."""
    v=_auto.P5Q.get(str(q)) or {}
    if (v.get('level') or 99) > z['levelRange'][1]+1: return False
    zid=str(z.get('zoneId') or z.get('uiMap') or '')
    def here(ref):
        if not ref: return False
        for nid in (ref.get('npc') or []):
            sp=(_auto.P5N.get(str(nid)) or {}).get('spawns') or {}
            if zid in sp: return True
        return False
    return here(v.get('start')) and here(v.get('end'))

def _promote():
    blocks=ZONES[:5]
    if _os.environ.get("PROMOTE_ALL","1")=="1":
        # level-curve-2: also promote zone-local plain quests in the later zones the speedrun line already visits
        blocks=blocks+[z for z in ZONES[5:] if any(o[0] in ("A","T") and o[2] in ("S","P") for o in z['ops'])]
    sq=set()
    for z in ZONES:
        for o in z['ops']:
            if o[0] in ("A","T") and o[2] in ("S","P"): sq.add(o[1])
    cand={}
    for z in blocks:
        for o in z['ops']:
            if o[0] in ("A","C","T") and o[2]=="B":
                v=_auto.P5Q.get(str(o[1]))
                if not v or v.get('tag') in ('Elite','Dungeon','Raid','PvP') or v.get('name') in CRAFTQ or v.get('groupHints'): continue
                if o[1] in (1393,94532,94535,1372,1383,580,598): continue   # escort, side trips, speed-only variants, out-of-band
                if z not in ZONES[:5] and not _local(o[1], z): continue
                cand[o[1]]=v
    changed=True
    ok=set()
    while changed:
        changed=False
        for q,v in cand.items():
            if q in ok: continue
            pre=v.get('pre') or {}
            g=pre.get('group') or []; s1=pre.get('single') or []
            inroute=lambda p: any(o[0]=="T" and o[1]==p for z in ZONES for o in z['ops'])
            gok=all((p in sq or p in ok) or not inroute(p) for p in g)
            sok=(not s1) or any(p in sq or p in ok for p in s1) or not any(inroute(p) for p in s1)
            if gok and sok: ok.add(q); changed=True
    for z in blocks:
        z['ops']=[(o[0],o[1],"S",o[3]) if o[0] in ("A","C","T") and o[2]=="B" and o[1] in ok else o for o in z['ops']]
    return sorted(ok)
PROMOTED=_promote()

# Tanaris Forever quests of level 55+ (balanced only) move to a short Tanaris stop after Silithus, where they fit the level.
def _move_tanaris():
    ti=next(i for i,z in enumerate(ZONES) if z['zone']=="Tanaris")
    z=ZONES[ti]
    hi=[o for o in z['ops'] if o[0] in ("A","C","T") and o[2]=="B" and (_auto.P5Q.get(str(o[1]),{}).get('level') or 0)>=55]
    ids={o[1] for o in hi}
    z['ops']=[o for o in z['ops'] if o not in hi]
    ZONES.append(dict(z, levelRange=[59,60], ops=[("TRAVEL","Balanced: fly Cenarion Hold -> Gadgetzan for the level-60 Tanaris quests.","B",dict(verified=False))]+hi))
    return sorted(ids)
TAN_MOVED=_move_tanaris()

# Balanced-only quests of level 55+ in Azshara, Winterspring and Eastern Plaguelands wait for a second visit after Mount Hyjal.
def _move_late(zname, minlvl, travel):
    zi=next(i for i,z in enumerate(ZONES) if z['zone']==zname)
    z=ZONES[zi]
    mv=[o for o in z['ops'] if o[0] in ("A","C","T") and o[2]=="B" and (_auto.P5Q.get(str(o[1]),{}).get('level') or 0)>=minlvl]
    ids={o[1] for o in mv}
    # keep chains whole: pull follow-ups whose prerequisite moved
    changed=True
    while changed:
        changed=False
        for o in z['ops']:
            if o[0] in ("A","C","T") and o[1] not in ids and o[2]=="B":
                pre=_auto.P5Q.get(str(o[1]),{}).get('pre') or {}
                if any(p in ids for p in (pre.get('group') or [])+(pre.get('single') or [])): ids.add(o[1]); changed=True
    mv=[o for o in z['ops'] if o[0] in ("A","C","T") and o[1] in ids]
    if any(o[2]!="B" for o in mv): raise SystemExit("late move would touch speedrun "+zname)
    z['ops']=[o for o in z['ops'] if o not in mv]
    hy=next(i for i,zz in enumerate(ZONES) if zz['zone']=="Mount Hyjal")
    ZONES.insert(hy+1+sum(1 for zz in ZONES[hy+1:] if zz.get('late')), dict(z, levelRange=[59,60], late=True, ops=[("TRAVEL",travel,"B",dict(verified=False))]+mv))
    return sorted(ids)
LATE={}
LATE["Winterspring"]=_move_late("Winterspring",55,"Balanced: on the way out of Mount Hyjal through Everlook, finish the level-60 Winterspring quests.")
LATE["Eastern Plaguelands"]=_move_late("Eastern Plaguelands",59,"Balanced: fly Everlook -> Light's Hope Chapel for the level-60 Eastern Plaguelands quests.")
LATE["Azshara"]=_move_late("Azshara",55,"Balanced: fly to Valormok (Azshara) for the level 55+ Azshara group quests, then on to Silithus.")
