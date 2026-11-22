import json,re
from lib import *
from gen import run,ZN,dz_of,QSRC
from meta import META,FOREVER_NEW,WHZ,QZ
from qsel import D
from forever_new import NEW
ENDGAME_CHAIN=re.compile(r"An Earnest Proposition|Just Compensation|Anthion|Valthalak|Final Preparations|Mea Culpa|Saving the Best for Last|Bonescythe|Dread Citadel|Dead Man's Plea|Savage Flora|Falrin's Vendetta|Instigator's Enchantment")
FORVER_SRC=["https://warcraftmaps.com/guides/classic-vs-forever-dungeons"]
def judge(q):
    lv=q['questLevel'] or 0; xp=(q['xp'] or {}).get('amount') or 0
    outside=[o for o in q['objectives'] if not o.get('insideDungeon',True) and o['type']!='object']
    prereq=len(q['prerequisites']['allOf'])+len(q['prerequisites']['anyOf'])
    if q['category']=='endgame':
        return dict(balanced=False,speedrun=False,why="Level-60 endgame or attunement step; outside the 1-60 leveling scope, list it under endgame.")
    if q['classes']:
        return dict(balanced=True,speedrun=xp>=80*lv,why=f"Class quest ({', '.join(q['classes'])}) — show only for that class; usually worth it for the reward.")
    if q['category']=='prerequisite':
        return dict(balanced=True,speedrun=xp>=60*lv,why="Unlocks a dungeon quest; take it when you are already in the giver's zone.")
    if outside:
        return dict(balanced=True,speedrun=False,why="Needs objectives outside the dungeon, which costs extra travel in a speed run.")
    if prereq>1:
        return dict(balanced=True,speedrun=False,why="Long out-of-dungeon prerequisite chain; only worth it on a relaxed route.")
    if xp and xp>=80*lv:
        return dict(balanced=True,speedrun=True,why=f"Done entirely inside the run and pays {xp} XP base, high for level {lv}.")
    if not xp:
        return dict(balanced=True,speedrun=False,why="No XP data in the source; treat as optional.")
    return dict(balanced=True,speedrun=False,why=f"Low XP for the effort ({xp} base at level {lv}); take it only if you pass the giver anyway.")
def pickup(q):
    g0=next((a for a in q['giver'] if a.get('zone')),None)
    where=g0['zone'] if g0 else ("from a dropped item inside the dungeon" if q['giver'] and q['giver'][0]['type']=='item' else "unknown")
    return {"zone":where,"levels":[q['minLevel'],q['questLevel']],"text":f"Pick up in {where} at about level {q['minLevel']}-{q['questLevel']}."}
CONV={t['area_id']:t for t in json.load(open('fv/conversion.json'))['geometry']['transforms'] if t.get('area_id')}
def conv_entrance(z,x,y):
    e={"zoneId":z,"zone":ZN.get(z),"x":x,"y":y}
    t=CONV.get(z)
    if t and t.get('changed'):
        c=t['coefficients']; e['eraX'],e['eraY']=x,y
        e['x']=round(c['scale_x']*x+c['offset_x'],1); e['y']=round(c['scale_y']*y+c['offset_y'],1)
        e['foreverCoordinatesChanged']=True
        e['coordinateNote']="Era entrance converted to the Forever map with the published QuestieDB conversion.json coefficients (assumes the world position did not move)"
    return e
built=run(); dungeons=[]; excluded=[]
for dz,m in META.items():
    qs=[]
    for q in built.get(dz,[]):
        if ENDGAME_CHAIN.search(q['name']):
            excluded.append({"id":q['id'],"name":q['name'],"dungeon":m['name'],"reason":"Dungeon Set 2 / Lord Valthalak / Naxxramas attunement endgame chain; out of leveling scope"}); continue
        q['route']=judge(q); q['pickup']=pickup(q); qs.append(q)
    dungeons.append({"id":m['key'],"areaId":dz,"name":m['name'],"faction":"Horde","levelRange":m['levelRange'],
        "levelRangeSource":WHZ+str(dz),"wings":m.get('wings'),
        "entrances":[conv_entrance(z,x,y) for z,x,y in m['entrances']],
        "entranceSource":QZ,"pickupHub":m['pickupHub'],"roleTips":m['tips'],"roleTipsNote":"Editorial tips written by the team, not copied from any guide.",
        "dungeonsOffReplacement":m['dungeonsOff'],
        "questCount":len(qs),"quests":qs,
        "forever":False,"sources":[WHZ+str(dz),QZ,QSRC,"https://github.com/Questie/QuestieDB/blob/9cf27d6491dd80f1998aa0a846dbea9a3c5daad9/data/Forever/conversion.json"],"verified":True})
doc={"schemaVersion":1,"generatedAt":"2026-11-21","faction":"Horde","scope":"Classic dungeon quests for levels 15-60 on WoW: Forever (dungeons on/off toggle)",
 "dataBasis":"Quest/NPC/object/item ids, levels, prerequisites, rewards and XP are read programmatically from the Questie Classic-era database pinned at commit e29dc411; NPC/object coordinates come from QuestieDB's Forever data (Questie/QuestieDB data/Forever, commit 9cf27d6), which converts Era positions to Forever's map bounds. Original Era coordinates are kept as eraX/eraY where they differ. Level ranges from Wowhead Classic zone pages. 'verified: true' means every field was present in that source; it does NOT mean confirmed on WoW: Forever live servers, which may change quests.",
 "coordinateSystem":"zone map percent (0-100), same as in-game /way",
 "wowForever":{"notes":[
   {"finding":"Nine new five-player dungeons (levels 13-60) exist in WoW: Forever.","source":"https://news.blizzard.com/en-us/article/24301455/explore-the-new-dungeons-of-world-of-warcraft-forever","official":True},
   {"finding":"Group Finder is a manual listing tool with a level-filtered dungeon list; no automatic queue or teleport, so players still travel to the entrance.","source":"https://howtovideogame.com/wow-forever-dungeon-finder/","official":False},
   {"finding":"Dungeon loot reworked: unique boss items are blue, hundreds of new drops, combined hit/crit stats, shared appearances for eligible looters.","source":"https://wowforevertierlist.com/dungeons/classic","official":False},
   {"finding":"Reported XP change: dungeon quests give about 50% less bonus XP, and kills inside dungeons give more (+20% to +50% reported across beta hotfixes).","source":"https://warcraftmaps.com/guides/classic-vs-forever-dungeons","official":False},
   {"finding":"Shadowfang Keep: Fenrus summons Voidwalkers at 50% health, Nandos summons worgs, and Arugal's table book gives the Black Tome that leads to a secret boss in City of Dalaran.","source":"https://wowclassicforever.info/dungeons/","official":False},
   {"finding":"Maraudon hotfix (Nov 6): Zaetar's Spirit now spawns correctly after Princess Theradras dies.","source":"https://wowclassicforever.info/dungeons/","official":False},
   {"finding":"Blizzard has published no official level table for the Classic dungeons in Forever; ranges here are Classic ranges from Wowhead.","source":"https://wowforevertierlist.com/dungeons/classic","official":False},
  ],
  "launch":{"finding":"WoW: Forever is Blizzard's official Classic+ (launched November 2026) with 1,000+ new quests, new zones (Mount Hyjal, Shen'dralas, the Riverglades, Zephras Isle) and nine new dungeons.","source":"https://news.blizzard.com/en-us/article/24315643/return-to-azeroth-in-world-of-warcraft-forever","official":True},
 "classicQuestCaveat":"Classic dungeon quests here are verified against Classic Era data only. Fan sites report Forever lowered many dungeon quest rewards to Uncommon and halved dungeon-quest bonus XP, so rewards and XP may differ in game.",
 "questieForeverData":{"finding":"QuestieDB v1.1.3 Forever data is imported in content/questie-db/ (Questie/QuestieDB release v1.1.3, commit 8b8df2d). It includes 1,112 Forever-new Horde and neutral quests. Forever dungeon quests are matched to those ids by name, then checked against level, giver and zone or dungeon. Coordinates are Forever-frame zone map percents from that import. Every Forever quest stays verified: false until it is checked in game.","source":"https://github.com/Questie/QuestieDB/releases/tag/v1.1.3","official":False},
 "newDungeons":[{**n,"forever":True,"id":n.get("id"),"quests":[{**q,"forever":True} for q in n['quests']]} for n in NEW]},
 "dungeons":dungeons,"excludedEndgameQuests":excluded}
json.dump(doc,open('dungeons.json','w'),indent=1,ensure_ascii=False)
tq=sum(len(d['quests']) for d in dungeons); v=sum(q['verified'] for d in dungeons for q in d['quests'])
print(len(dungeons),tq,v,tq-v,len(excluded))
for d in dungeons: print(d['name'],d['questCount'],sum(q['route']['speedrun'] for q in d['quests']))

# ---- pass 2: overrides, prerequisite speed rule, wings ----
OVR={
 914:(True,True,"Main Wailing Caverns reward quest; the Nara Wildmane chain is short and the run ends at the last Fang leader anyway."),
 1489:(True,True,"Two-minute breadcrumb that unlocks Leaders of the Fang."),
 1490:(True,True,"Breadcrumb in Thunder Bluff that unlocks Leaders of the Fang."),
 5761:(True,True,"Kill the last boss you pass anyway; the giver is in Orgrimmar where you train."),
 1049:(True,True,"Library boss quest with a strong reward; worth it if you set Thunder Bluff hearth or pass through."),
 1014:(True,True,"Biggest XP quest in Shadowfang Keep; Arugal is the end of the run."),
 1098:(True,True,"Free XP on the main path through SFK."),
 1013:(True,False,"Needs the Book of Ur from the library side room and a trip to Undercity; fine on a relaxed route."),
}
for x in doc['dungeons']:
    byid={q['id']:q for q in x['quests']}
    for qid,(b,s,w) in OVR.items():
        if qid in byid: byid[qid]['route']=dict(balanced=b,speedrun=s,why=w)
    for q in x['quests']:
        if q['category']=='prerequisite' and q['id'] not in OVR:
            kids=[byid[k] for k in q['leadsTo'] if k in byid]
            if kids and not any(k['route']['speedrun'] for k in kids):
                q['route']['speedrun']=False
                q['route']['why']="Unlocks a dungeon quest that the speed route skips; take it only on the balanced route."
WINGS={
 796:{"Graveyard":["Bloodmage Thalnos","Interrogator Vishas","Azshir","Fallen Champion","Ironspine","Vorrel"],"Library":["Houndmaster Loksey","Arcanist Doan"],"Armory":["Herod"],"Cathedral":["Mograine","Whitemane","Fairbanks"]},
 1583:{"Lower Blackrock Spire":["Omokk","Voone","Wyrmthalak","Halycon","Gizrul","Urok","Bijou","Zigris","Smolderweb","Vosh'gajin","Spirestone","Bannok","Mor Grayhoof"],"Upper Blackrock Spire":["Emberseer","Solakar","Jed Runewatcher","Rend","Gyth","The Beast","Drakkisath","Goraluk","Vaelan","Blackhand"]},
 2557:{"East":["Pusillin","Zevrim","Hydrospawn","Lethtendris","Alzzin","Isalien"],"West":["Tendris","Illyanna","Immol'thar","Tortheldrin","Kalendris"],"North":["Mol'dar","Kreeg","Fengus","Slip'kik","Cho'Rush","Gordok"]},
 2017:{"Live (Scarlet side)":["Timmy","Malor","Willey","Galford","Balnazzar","Fras Siabi","Forresten","Postmaster","Aurius","Crusader"],"Undead (Baron side)":["Barthilas","Ramstein","Rivendare","Nerub'enkan","Maleki","Anastari","Ash'ari"]},
 2100:{"Orange/Purple (outer)":["Vyletongue","Noxxion","Razorlash","Celebras"],"Inner":["Theradras","Landslide","Rotgrip","Tinkerer Gizlock"]},
}
for x in doc['dungeons']:
    wm=WINGS.get(x['areaId'])
    if not wm: continue
    for q in x['quests']:
        names=" ".join(str(o.get('name') or '')+" "+" ".join(str(d.get('name') or '') for d in o.get('droppedBy',[])) for o in q['objectives'])
        hits=[w for w,bs in wm.items() if any(b in names for b in bs)]
        if hits: q['wing']=hits; q['wingSource']="derived from objective NPC names in QuestieDB"
json.dump(doc,open('dungeons.json','w'),indent=1,ensure_ascii=False)
print('wings',sum(1 for x in doc['dungeons'] for q in x['quests'] if q.get('wing')), 'speed',sum(q['route']['speedrun'] for x in doc['dungeons'] for q in x['quests']))

# ---- pass 3: profession hooks from recipe rewards / required skill; SM wing fixes ----
from lib import I as ITEMS, g as G
RECIPE={1:'Leatherworking',2:'Tailoring',3:'Engineering',4:'Blacksmithing',5:'Cooking',6:'Alchemy',7:'First Aid',8:'Enchanting',9:'Fishing'}
SKILL={164:'Blacksmithing',165:'Leatherworking',171:'Alchemy',182:'Herbalism',185:'Cooking',186:'Mining',197:'Tailoring',202:'Engineering',333:'Enchanting',356:'Fishing',393:'Skinning',129:'First Aid'}
SMW={1049:["Library"],1160:["Library"],1051:["Graveyard"],1048:["Library","Armory","Cathedral"]}
nh=0
for x in doc['dungeons']:
    for q in x['quests']:
        hooks=[]
        for r in q['rewards']:
            it=ITEMS.get(r['id'])
            if it and G(it,12)==9 and G(it,13) in RECIPE:
                hooks.append({"profession":RECIPE[G(it,13)],"itemId":r['id'],"itemName":r['name'],"note":f"Quest reward recipe: {r['name']}.","sources":[{"url":r['url'],"label":f"Wowhead Classic: {r['name']}"},{"url":"https://github.com/Questie/Questie/blob/e29dc411d70a4f7c6cd5d964f153bd065c5fd834/Database/Classic/classicItemDB.lua","label":"QuestieDB items (GPL-3.0)"}],"verified":True})
        rs=q.get('requiredSkill')
        if rs:
            sk=rs[0] if isinstance(rs,list) else rs.get('1'); val=rs[1] if isinstance(rs,list) else rs.get('2')
            if sk in SKILL:
                hooks.append({"profession":SKILL[sk],"skillTarget":val,"note":f"Requires {SKILL[sk]} {val} to accept.","sources":[{"url":f"https://www.wowhead.com/classic/quest={q['id']}","label":"Wowhead Classic"}],"verified":True})
        if hooks: q['professionHooks']=hooks; nh+=len(hooks)
        if x['areaId']==796 and q['id'] in SMW: q['wing']=SMW[q['id']]; q['wingSource']="team assignment from quest objective location"
json.dump(doc,open('dungeons.json','w'),indent=1,ensure_ascii=False)
print('hooks',nh)
