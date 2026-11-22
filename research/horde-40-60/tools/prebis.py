import json; from db import *
byname={}
for k,v in I.items():
    if v[0]: byname.setdefault(v[0].lower(),[]).append(k)
LISTS={
 "warrior_tank":["Helm of Valor","Onyxia Tooth Pendant","Spaulders of Valor","Breastplate of Valor","Bracers of Valor","Gauntlets of Valor","Belt of Valor","Legplates of Valor","Cape of the Black Baron","Mark of Fordring","Painweaver Band","Blackhand's Breadth","Force of Will","Draconian Deflector","Ironfoe","Satyr's Bow"],
 "physical_dps_plate":["Lionheart Helm","Mask of the Unforgiven","Onyxia Tooth Pendant","Truestrike Shoulders","Cape of the Black Baron","Savage Gladiator Chain","Wristguards of Stability","Devilsaur Gauntlets","Brigam Girdle","Devilsaur Leggings","Battlechaser's Greaves","Don Julio's Band","Blackstone Ring","Hand of Justice","Blackhand's Breadth","Ironfoe","Dal'Rend's Sacred Charge","Dal'Rend's Tribal Guardian","Satyr's Bow","Blastershot Launcher"],
 "rogue_hunter_leather_mail":["Mask of the Unforgiven","Cadaverous Armor","Mark of Fordring","Truestrike Shoulders","Cape of the Black Baron","Devilsaur Gauntlets","Devilsaur Leggings","Wristguards of Stability","Battlechaser's Greaves","Blackhand's Breadth","Hand of Justice","Don Julio's Band","Satyr's Bow","Blackcrow","Barbarous Blade","Assassination Blade","Felstriker","Beaststalker's Cap","Beaststalker's Tunic"],
 "healer":["Devout Crown","Devout Mantle","Devout Robe","Robes of the Exalted","Hide of the Wild","Mana Igniting Cord","Briarwood Reed","Hand of Edward the Odd","Fordring's Seal","Mindtap Talisman","Royal Seal of Eldre'Thalas","Bindings of Elements","Truefaith Vestments"],
 "caster_dps":["Magister's Crown","Dreadmist Mask","Robe of the Archmage","Robe of Winter Night","Mana Igniting Cord","Ban'thok Sash","Briarwood Reed","Eye of the Beast","Hand of Edward the Odd","Freezing Lich Robes","Tome of Knowledge","Rod of the Ogre Magi","Archivist Cape","Amplifying Cloak","Star of Mystaria","Skul's Ghastly Touch"],
}
out={}
for role,names in LISTS.items():
    rows=[]
    for nm in names:
        ids=byname.get(nm.lower())
        if not ids:
            rows.append({"name":nm,"verified":False,"note":"not found in QuestieDB item data; check before use"}); continue
        it=ids[0]; v=I[it]; drops=[]
        for nid in [x for x in (L(v[1]) if isinstance(v[1],dict) else (v[1] or [])) if x][:3]:
            n=N.get(nid); loc=npc_loc(nid) if n else None
            drops.append({"npc":n[0] if n else nid,"npcId":nid,"zone":ZONES.get(loc["zoneId"],loc["zoneId"]) if loc else None})
        rq=[x for x in (v[5] or []) if x] if isinstance(v[5],list) else []
        src = "drop" if drops else ("quest" if rq else ("vendor" if v[13] else "crafted/other"))
        rows.append({"name":nm,"itemId":it,"source":src,"drops":drops or None,"questRewardOf":[{"questId":q,"quest":Q[q][0]} for q in rq if q in Q] or None,
                     "wowhead":f"https://www.wowhead.com/classic/item={it}","verified":True})
    out[role]=rows
INST={"Darkmaster Gandling":"Scholomance","Warchief Rend Blackhand":"Upper Blackrock Spire","Ramstein the Gorger":"Stratholme","Gorosh the Dervish":"Blackrock Depths","General Angerforge":"Blackrock Depths","Emperor Dagran Thaurissan":"Blackrock Depths","Ok'thor the Breaker":"Blackrock Depths","Solakar Flamewreath":"Upper Blackrock Spire","Balnazzar":"Stratholme","General Drakkisath":"Upper Blackrock Spire","Pyroguard Emberseer":"Upper Blackrock Spire","Jed Runewatcher":"Upper Blackrock Spire","Shadow Hunter Vosh'gajin":"Lower Blackrock Spire","Anvilrage Footman":"Blackrock Depths","Anvilrage Soldier":"Blackrock Depths"}
for rows in out.values():
    for x in rows:
        if x.get("source")=="crafted/other": x["source"]="crafted, world drop or vendor (see Wowhead link)"
        for d in x.get("drops") or []:
            if d["npc"] in INST: d["zone"]=INST[d["npc"]]
            elif isinstance(d["zone"],int): d["zone"]={1585:"Blackrock Depths"}.get(d["zone"], d["zone"])
out["_forever_notes"]=[{"name":"Elderwild Construction Hammer","source":"Reward choice from the Horde elite quest Head Scratcher (Mount Hyjal)","verified":False,"sources":["https://khorium.pro/guide-view.html?slug=wow-forever-mount-hyjal-quests","https://bytetavern.com/wow-forever-mount-hyjal/"]},
 {"name":"Blackmaw Hold, Shaper's Terrace and Alcaz Prison loot","source":"WoW Forever max-level dungeons; loot tables are not in QuestieDB and were not checked tonight. Compare them against this list once a Forever loot database is available.","verified":False,"sources":["https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506"]},
 {"name":"Hyjal reputation rings and crafted Elderwild armor","source":"Reported as level-60 rewards from Mount Hyjal","verified":False,"sources":["https://bytetavern.com/wow-forever-mount-hyjal/"]}]
json.dump(out, open("out/prebis.json","w"), indent=1, ensure_ascii=False)
for r,rows in out.items():
    print(r)
    for x in rows: print("  ",x["name"],x.get("itemId"),x.get("source"),[d["npc"]+"/"+str(d["zone"]) for d in (x.get("drops") or [])][:2], [q["quest"] for q in (x.get("questRewardOf") or [])][:1])
