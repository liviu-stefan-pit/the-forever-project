# All text below is written by us. Facts (ids, coords, vendors) come from QuestieDB data/Forever.
QS={"url":"https://github.com/Questie/QuestieDB/tree/master/data/Forever","label":"QuestieDB data/Forever (GPL-3.0)"}
def wh(kind,i): return {"url":f"https://www.wowhead.com/classic/{kind}={i}","label":f"Wowhead Classic {kind} {i} (reference link)"}
WIKI_PROF={"url":"https://warcraft.wiki.gg/wiki/Profession","label":"Warcraft Wiki: Professions"}
LEG={"url":"https://www.wowhead.com/forever/guide/legacy-system-overview-rewards","label":"Wowhead: Legacy System overview (Forever)"}
CAMP={"url":"https://www.wowhead.com/forever/news/everything-you-need-to-know-for-wow-forevers-global-launch-383656","label":"Wowhead: WoW Forever launch summary"}
XPB={"url":"https://wow-forever.gg/guides/xp-bonuses/","label":"wow-forever.gg: experience bonuses"}

# Profession hooks: (match, hook). match = ("quest", qid, actionKind) or ("zoneFirst", zone)
HOOKS=[
 (("quest",703,"A"), dict(profession="Cooking", itemId=3404, itemName="Buzzard Wing", skillTarget=175,
   note="This quest rewards Recipe: Barbecued Buzzard Wing. Keep every extra Buzzard Wing from the Badlands buzzards; the recipe uses them and gives skill-ups up to about 175.",
   sources=[QS, wh("item",4609), wh("quest",703)], verified=True)),
 (("quest",1430,"A"), dict(profession="Cooking", itemId=12037, itemName="Mystery Meat", npc=dict(id=989,name="Banalash",zone="Swamp of Sorrows",x=44.8,y=56.6),
   note="Banalash in Stonard sells Recipe: Carrion Surprise. Mystery Meat drops all through the 40s (Swamp, Tanaris, Desolace), so cooking it as you go is free skill.",
   sources=[QS, wh("item",12232)], verified=True)),
 (("quest",570,"A"), dict(profession="Cooking", itemId=12184, itemName="Raptor Flesh", npc=dict(id=1148,name="Nerrist",zone="Stranglethorn Vale",x=32.7,y=29.2),
   note="Nerrist at Grom'gol sells Recipe: Roast Raptor. Keep Raptor Flesh from the Raptor Mastery kills; it cooks into Roast Raptor for skill and food.",
   sources=[QS, wh("item",12228), wh("item",12184)], verified=True)),
 (("quest",595,"A"), dict(profession="Cooking", itemId=4655, itemName="Giant Clam Meat", npc=dict(id=2664,name="Kelsey Yance",zone="Stranglethorn Vale",x=28.2,y=74.3),
   note="Kelsey Yance in Booty Bay sells Recipe: Giant Clam Scorcho and Recipe: Cooked Glossy Mightfish. Open the clams that drop along the coast and keep the meat.",
   sources=[QS, wh("item",6039), wh("item",13940)], verified=True)),
 (("quest",595,"A"), dict(profession="Fishing", itemId=16083, itemName="Expert Fishing - The Bass and You", npc=dict(id=2626,name="Old Man Heming",zone="Stranglethorn Vale",x=27.4,y=77.2),
   note="Old Man Heming in Booty Bay sells the Expert Fishing book (fishing 150 to 225). Buy it while you are here if you fish.",
   sources=[QS, wh("item",16083)], verified=True)),
 (("quest",2872,"T"), dict(profession="Cooking", itemName="Recipe: Undermine Clam Chowder", npc=dict(id=8139,name="Jabbey",zone="Tanaris",x=67.0,y=22.0),
   note="Jabbey at Steamwheedle Port sells Recipe: Undermine Clam Chowder; it uses the clam meat you have been saving.",
   sources=[QS, wh("item",16767)], verified=True)),
 (("quest",1690,"A"), dict(profession="Cooking", itemId=12208, itemName="Tender Wolf Meat", skillTarget=250, npc=dict(id=8125,name="Dirge Quikcleave",zone="Tanaris",x=52.6,y=28.1),
   note="Dirge Quikcleave (and the Gadgetzan innkeeper) sell Recipe: Tender Wolf Steak. From here on keep Tender Wolf Meat from wolves in Feralas, the Hinterlands and Burning Steppes: it is the main 225-275 cooking recipe on this route.",
   sources=[QS, wh("item",18046), wh("item",12208)], verified=True)),
 (("quest",1690,"A"), dict(profession="First Aid", itemId=16084, itemName="Expert First Aid - Under Wraps",
   npc=dict(id=13476,name="Balai Lok'Wein",zone="Dustwallow Marsh",x=36.5,y=30.4),
   note="Expert First Aid (150-225) and the Mageweave bandage manuals are sold by Balai Lok'Wein at Brackenwall Village. The Horde Triage quest (Doctor Gregory Victor, Hammerfall) unlocks 225-300. Bank your Mageweave and Runecloth for bandages.",
   sources=[QS, wh("item",16084), wh("quest",6622)], verified=True)),
 (("quest",2862,"A"), dict(profession="Cooking", npc=dict(id=8145,name="Sheendra Tallgrass",zone="Feralas",x=74.5,y=42.7),
   note="Sheendra Tallgrass at Camp Mojache sells Recipe: Hot Wolf Ribs, Lobster Stew, Mightfish Steak and Baked Salmon. Hot Wolf Ribs uses the Red Wolf Meat you get in Feralas and the Hinterlands.",
   sources=[QS, wh("item",12229), wh("item",13947)], verified=True)),
 (("quest",4505,"A"), dict(profession="Cooking", itemId=12207, itemName="Giant Egg", skillTarget=300, npc=dict(id=2806,name="Bale",zone="Felwood",x=34.8,y=53.2),
   note="Bale at Bloodvenom Post sells Recipe: Monster Omelet (Himmik in Everlook sells it too). Giant Eggs drop from owls and birds in Winterspring, Felwood and the Hinterlands. This recipe carries cooking to 300.",
   sources=[QS, wh("item",16110), wh("item",12207)], verified=True)),
 (("quest",4505,"A"), dict(profession="Herbalism", itemId=13463, itemName="Dreamfoil",
   note="Felwood and Un'Goro have the most Dreamfoil spawns on this route, and Felwood also has Plaguebloom. Gather on the way between quest areas.",
   sources=[QS, wh("item",13463), wh("item",13466)], verified=True)),
 (("quest",4505,"A"), dict(profession="Tailoring", itemId=14256, itemName="Felcloth",
   note="Felcloth drops from the satyrs in Felwood (Jaedenar and the Shadow Hold area). Keep it: Felcloth sells well and tailors need it.",
   sources=[QS, wh("item",14256)], verified=True)),
 (("quest",4284,"A"), dict(profession="Mining", itemId=10620, itemName="Thorium Ore",
   note="Un'Goro, Winterspring, Felwood, Burning Steppes and Eastern Plaguelands hold most Thorium veins. Mine every vein you pass; Thorium bars sell well and level blacksmiths and engineers to 300.",
   sources=[QS, wh("item",10620)], verified=True)),
 (("quest",4284,"A"), dict(profession="Skinning", itemName="Devilsaur Leather",
   note="Devilsaurs in Un'Goro give Devilsaur Leather. With skinning, every devilsaur is worth a detour: the leather makes the Devilsaur pre-raid set for hunters, rogues and warriors and sells for a lot.",
   sources=[wh("item",15417)], verified=False)),
 (("quest",6029,"A"), dict(profession="Herbalism", itemId=13465, itemName="Mountain Silversage",
   note="Winterspring has the most Mountain Silversage spawns in the game data. Herbalists should gather it while questing here.",
   sources=[QS, wh("item",13465)], verified=True)),
 (("quest",5096,"A"), dict(profession="Tailoring", itemId=14047, itemName="Runecloth",
   note="Humanoids in Western and Eastern Plaguelands drop Runecloth. Keep it for tailoring, Heavy Runecloth Bandages and the Horde capital runecloth reputation turn-ins.",
   sources=[QS, wh("item",14047)], verified=True)),
]

# Class tips matrix: class -> role|any -> Tip[]  (own words; general 40-60 practice)
def T(kind,text,routes=None,src=None,ver=False,roles=None):
    d={"kind":kind,"text":text,"sources":src or [WIKI_PROF],"verified":ver}
    if routes: d["routes"]=routes
    if roles: d["roles"]=roles
    return d
CLS={"url":"https://warcraft.wiki.gg/wiki/Class","label":"Warcraft Wiki: Classes"}
FCLS={"url":"https://news.blizzard.com/en-us/article/24315821/wow-foreverwhats-new-and-what-feels-familiar","label":"Blizzard: WoW Forever, what's new (class changes)"}
TIPS={
 "Warrior":{"any":[T("speed","Keep a two-hander for questing and swap to sword and board only for elites and dungeons. Sweeping Strikes or Cleave on two mobs is faster than one-at-a-time pulls.",["speedrun"],[CLS]),
                    T("general","Bandage between pulls; First Aid is your cheapest downtime fix until you have a healer.",None,[CLS])],
            "tank":[T("general","In dungeons, mark one kill target and one sheep or trap target per pack; Sunder the skull and tab-Sunder the second mob.",None,[CLS])]},
 "Paladin":{"any":[T("general","WoW Forever lets Undead play Paladin. Quest with Seal of Command or Seal of Righteousness and a slow two-hander; judge only when you will reseal before the next swing.",None,[FCLS,CLS]),
                    T("speed","Pull two mobs, use Consecration only when three or more are on you, and drink while Blessing of Wisdom ticks. Undead Paladins can use Cannibalize on humanoid and undead corpses instead of eating.",["speedrun"],[FCLS,CLS])],
            "tank":[T("general","Tank with Righteous Fury and a shield; Consecration holds packs but costs mana, so let the healer know before big pulls.",None,[CLS])],
            "healer":[T("general","Holy Light rank downranking keeps mana up; save Lay on Hands for a wipe-saving moment on the tank.",None,[CLS])]},
 "Hunter":{"any":[T("speed","Feign Death drops threat from extra mobs; use it to reset bad pulls instead of running. Keep the pet a level-appropriate beast so it holds aggro.",["speedrun"],[CLS]),
                   T("general","WoW Forever lets hunters use traps in combat and gives pets gear scaling and family abilities; check your pet family's ability before you choose a new one.",None,[FCLS])]},
 "Rogue":{"any":[T("speed","Stealth past mobs that are not quest targets and open with Cheap Shot on casters. Use Sprint and Vanish to skip long runs back to a quest area.",["speedrun"],[CLS]),
                  T("general","Pick Lockpicking up as you go: the lockboxes from this bracket open junk boxes you can sell and the skill opens doors in Blackrock Depths.",None,[CLS])]},
 "Priest":{"any":[T("speed","Shadow is the fast way to level: Mind Blast, Shadow Word: Pain, wand. Power Word: Shield before the mob arrives so you take no pushback.",["speedrun"],[CLS])],
            "healer":[T("general","In dungeons use lower ranks of Heal and Greater Heal; Renew on the tank before big pulls saves mana.",None,[CLS])]},
 "Shaman":{"any":[T("general","WoW Forever adds Horde-aligned Skyborne (Windshapers) as Shaman. Their racials differ from Orc, Troll and Tauren, so check them before you pick totems and talents.",None,[FCLS,{"url":"https://news.blizzard.com/en-us/article/24315643/return-to-azeroth-in-world-of-warcraft-forever","label":"Blizzard: Return to Azeroth"}]),T("speed","Enhancement with Windfury and a slow two-hander levels fastest. Drop only the totems you need for the fight; Searing Totem on single mobs is wasted mana.",["speedrun"],[CLS])],
            "healer":[T("general","Chain Heal at rank 1 or 2 is your most efficient group heal; keep Mana Spring Totem down in long fights.",None,[CLS])]},
 "Mage":{"any":[T("speed","Frost: Frost Nova, step back, Frostbolt. Arcane Explosion AoE pulls with a Frost Nova reset are the fastest way through mob camps. WoW Forever opens Orc Mage for the Horde.",["speedrun"],[FCLS,CLS]),
                 T("general","Conjure food and water before each zone so you never pay for drinks.",None,[CLS])]},
 "Warlock":{"any":[T("speed","Affliction with the Voidwalker: dot two mobs, Drain Life, Life Tap and keep moving. WoW Forever opens Troll Warlock for the Horde.",["speedrun"],[FCLS,CLS]),
                    T("general","Farm Soul Shards on the last mob of a pull, not the first, so you are not waiting on Drain Soul.",None,[CLS])]},
 "Druid":{"any":[T("speed","Quest in Cat Form; shift to Bear for two or more mobs. Travel Form between quest areas until your mount, and use it to skip fights you do not need.",["speedrun"],[CLS])],
           "tank":[T("general","Bear tanks hold packs with Swipe; ask for a mark on the kill target.",None,[CLS])],
           "healer":[T("general","Regrowth and Rejuvenation on the tank, Healing Touch only for big hits; Innervate yourself during long boss fights.",None,[CLS])]},
}
# Class professions: ranked pairs (own reasoning)
def P(rank,pair,reason,roles=None):
    d={"rank":rank,"pair":pair,"reason":reason}
    if roles: d["roles"]=roles
    return d
SEC=[{"profession":"First Aid","reason":"Bandages cut downtime for every class and are needed for elites without a healer."},
     {"profession":"Cooking","reason":"Well Fed buffs add stats, and in WoW Forever cooked food also gives a small kill-experience bonus and powers camp features."},
     {"profession":"Fishing","reason":"Optional; useful for cooking skill and for Mightfish and Stonescale Eel if you sell to raiders."}]
def plan(pairs):
    out=[]
    for prof in pairs:
        if prof in ("Mining","Herbalism","Skinning"):
            out.append({"profession":prof,"skillTarget":300,"levels":[50,58],"note":f"{prof} reaches 300 naturally by gathering in Un'Goro, Felwood, Winterspring and the Plaguelands along this route."})
        else:
            out.append({"profession":prof,"skillTarget":300,"levels":[55,60],"note":f"Level {prof} with the materials saved from the route; buy the last recipes in the capitals or from the vendors linked in the step hooks."})
    out.append({"profession":"Cooking","skillTarget":300,"levels":[40,56],"note":"Follow the cooking hooks: Roast Raptor and Giant Clam Scorcho in Stranglethorn, Tender Wolf Steak from Tanaris, Monster Omelet from Felwood."})
    out.append({"profession":"First Aid","skillTarget":300,"levels":[40,55],"note":"Buy Expert First Aid in Dustwallow Marsh and do the Triage quest at Hammerfall once you reach 225 skill."})
    return out
CP={
 "Warrior":[P(1,["Mining","Blacksmithing"],"Blacksmiths make the Lionheart Helm, a pre-raid helm for damage warriors, and can make their own weapons and armour.",["dps","tank"]),P(2,["Mining","Engineering"],"Engineering gives grenades, sappers and target dummies, the strongest tools for tanking and PvP."),P(3,["Skinning","Leatherworking"],"Devilsaur leather and the Devilsaur set, plus steady gold from leather sales while leveling.")],
 "Paladin":[P(1,["Mining","Blacksmithing"],"Plate crafting and weapon upgrades; Lionheart Helm for Retribution.",["dps","tank"]),P(2,["Herbalism","Alchemy"],"Mana potions and flasks for a healer, and herbs are easy to gather while questing.",["healer"]),P(3,["Mining","Engineering"],"Grenades and gadgets for tanking and PvP.")],
 "Hunter":[P(1,["Skinning","Leatherworking"],"Devilsaur set and Blackstone-tier mail crafts; skinning pays for training while leveling."),P(2,["Mining","Engineering"],"Engineers make the best ranged weapons and scopes before raids (for example the Blastershot Launcher).")],
 "Rogue":[P(1,["Skinning","Leatherworking"],"Devilsaur Gauntlets and Leggings are pre-raid best for rogues; skinning is gold while leveling."),P(2,["Mining","Engineering"],"Engineering gadgets for PvP and Gnomish/Goblin tools.")],
 "Priest":[P(1,["Herbalism","Alchemy"],"Mana potions for healing and leveling; herbs are everywhere on the 50-60 route.",["healer"]),P(2,["Tailoring","Enchanting"],"Tailors make Robe of the Archmage-tier caster gear and Truefaith Vestments for healers; enchanters disenchant the leftover cloth gear.")],
 "Shaman":[P(1,["Herbalism","Alchemy"],"Mana potions and elixirs; easy to gather while questing."),P(2,["Mining","Blacksmithing"],"Weapon crafting for Enhancement.",["dps"]),P(3,["Skinning","Leatherworking"],"Mail and leather pieces plus gold from leather.")],
 "Mage":[P(1,["Tailoring","Enchanting"],"Robe of the Archmage and other cloth crafts; enchanting turns the leftover gear into materials."),P(2,["Herbalism","Alchemy"],"Mana potions and Flask of Supreme Power later.")],
 "Warlock":[P(1,["Tailoring","Enchanting"],"Felcloth from Felwood feeds Robe of the Void and other warlock tailoring; enchanting uses the cloth gear you replace."),P(2,["Herbalism","Alchemy"],"Mana and health potions; Felwood herbs are on the route.")],
 "Druid":[P(1,["Herbalism","Alchemy"],"Herbalism works in Travel Form gathering runs; alchemy covers potions for every spec."),P(2,["Skinning","Leatherworking"],"Leather gear for Feral and Hide of the Wild for healers.",["dps","tank","healer"])],
}
CLASS_PROF={c:{"primary":v,"secondary":SEC,"levelingPlan":plan(v[0]["pair"]),"sources":[WIKI_PROF,QS],"verified":False} for c,v in CP.items()}
