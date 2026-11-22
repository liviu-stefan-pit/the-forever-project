import json,re
from lib import *
from qsel import select,D,dz_of,objlist,BL,npc_dz
ZN={int(k):v for k,v in json.load(open('zonenames.json')).items()}
FIX={1477:"The Temple of Atal'Hakkar",1176:"Zul'Farrak",8:"Swamp of Sorrows",490:"Un'Goro Crater"}
ZN.update(FIX)
QC="e29dc411d70a4f7c6cd5d964f153bd065c5fd834"
QSRC=f"https://github.com/Questie/Questie/blob/{QC}/Database/Classic/classicQuestDB.lua"
NSRC=f"https://github.com/Questie/Questie/blob/{QC}/Database/Classic/classicNpcDB.lua"
OSRC=f"https://github.com/Questie/Questie/blob/{QC}/Database/Classic/classicObjectDB.lua"
ISRC=f"https://github.com/Questie/Questie/blob/{QC}/Database/Classic/classicItemDB.lua"
XSRC=f"https://github.com/Questie/Questie/blob/{QC}/Database/QuestXP/DB/xpDB-classic.lua"
WH="https://www.wowhead.com/classic/"
CLS={1:'Warrior',2:'Paladin',4:'Hunter',8:'Rogue',16:'Priest',64:'Shaman',128:'Mage',256:'Warlock',1024:'Druid'}
RACE={2:'Orc',16:'Undead',32:'Tauren',128:'Troll'}
def zname(z): return ZN.get(z,f"zone {z}")
def objspawns(o):
    s=g(O.get(o),4)
    if not s: return {}
    if isinstance(s,list): return {i+1:v for i,v in enumerate(s) if v}
    return {int(k):v for k,v in s.items()}
def place(sp, prefer_out=True):
    if not sp: return None
    zs=list(sp.keys())
    zs.sort(key=lambda z:(1 if dz_of(z) else 0) if prefer_out else 0)
    z=zs[0]; c=sp[z][0] if sp[z] else None
    if not c or c[0] is None or c[0]<0:
        if dz_of(z): return {"zoneId":z,"zone":zname(dz_of(z)),"x":None,"y":None,"insideDungeon":True,"note":"inside the instance; no outdoor map coordinates"}
        return {"zoneId":z,"zone":zname(z),"x":None,"y":None}
    return {"zoneId":z,"zone":zname(z),"x":round(c[0],1),"y":round(c[1],1),"spawnCount":sum(len(v) for v in sp.values())}
FVSRC="https://github.com/Questie/QuestieDB/tree/9cf27d6491dd80f1998aa0a846dbea9a3c5daad9/data/Forever"
def fobjspawns(o):
    s=g(FO.get(o),4)
    if not s: return {}
    if isinstance(s,list): return {i+1:v for i,v in enumerate(s) if v}
    return {int(k):v for k,v in s.items()}
def fv_mark(p,era):
    if p and era and p.get('x') is not None and era.get('x') is not None and (p['x'],p['y'])!=(era['x'],era['y']) and p['zoneId']==era['zoneId']:
        p['eraX'],p['eraY']=era['x'],era['y']; p['foreverCoordinatesChanged']=True
    if p: p['coordinateSource']="QuestieDB Forever data (Era positions converted to Forever map bounds)"
    return p
def actor(kind,i):
    if kind=='npc':
        e=N.get(i); p=fv_mark(place(fspawns(i)) or place(spawns(i)),place(spawns(i)))
        return {"type":"npc","id":i,"name":g(e,1) if e else None,**(p or {"zone":None,"x":None,"y":None}),"url":f"{WH}npc={i}"}
    if kind=='object':
        e=O.get(i); p=fv_mark(place(fobjspawns(i)) or place(objspawns(i)),place(objspawns(i)))
        return {"type":"object","id":i,"name":g(e,1) if e else None,**(p or {"zone":None,"x":None,"y":None}),"url":f"{WH}object={i}"}
    e=I.get(i); drops=g(e,2) or []
    d=[{"npcId":n,"name":g(N.get(n),1),"zone":zname((list(spawns(n)) or [None])[0])} for n in drops[:5]]
    return {"type":"item","id":i,"name":g(e,1) if e else None,"droppedBy":d,"zone":None,"x":None,"y":None,"url":f"{WH}item={i}"}
def actors(t):
    res=[]
    npcs=g(t,1) or []
    hn=[n for n in npcs if (g(N.get(n),13) or '')!='A']
    for n in (hn or npcs): res.append(actor('npc',n))
    for o in (g(t,2) or []): res.append(actor('object',o))
    for it in (g(t,3) or []): res.append(actor('item',it))
    return res
rew={}
for iid,it in I.items():
    for q in (g(it,6) or []): rew.setdefault(q,[]).append(iid)
children={}
for qid,q in Q.items():
    for p in (g(q,13) or [])+(g(q,12) or []): children.setdefault(p,[]).append(qid)
def bits(m,tbl): return [v for k,v in tbl.items() if m & k] if m else []
def objectives(q,dz):
    res=[]
    for kind,x,drops in objlist(q):
        if kind=='npc':
            e=N.get(x); res.append({"type":"kill","npcId":x,"name":g(e,1),"rank":{0:'normal',1:'elite',2:'rare elite',3:'boss',4:'rare'}.get(g(e,6) or 0),"insideDungeon":bool(npc_dz(x)),"url":f"{WH}npc={x}"})
        elif kind=='kill':
            res.append({"type":"killCredit","npcIds":drops,"name":g(N.get(x),1) if N.get(x) else None,"insideDungeon":any(npc_dz(n) for n in drops)})
        elif kind=='item':
            dn=[{"npcId":n,"name":g(N.get(n),1),"inside":bool(npc_dz(n))} for n in drops]
            ins=[d for d in dn if d['inside']]
            res.append({"type":"collect","itemId":x,"name":g(I.get(x),1),"droppedBy":(ins or dn)[:6],"insideDungeon":bool(ins),"url":f"{WH}item={x}"})
        elif kind=='obj':
            res.append({"type":"object","objectId":x,"name":g(O.get(x),1),"url":f"{WH}object={x}"})
    return res
def build_quest(qid,dz,how,category):
    q=Q[qid]
    st=actors(g(q,2)); fn=actors(g(q,3))
    xp=XP.get(qid)
    races=g(q,6) or 0; cls=g(q,7) or 0
    rw=[{"id":i,"name":g(I[i],1),"itemLevel":g(I[i],9),"requiredLevel":g(I[i],10),"url":f"{WH}item={i}"} for i in sorted(rew.get(qid,[]))]
    missing=[]
    for a in st+fn:
        if a['type']!='item' and a.get('x') is None and not a.get('insideDungeon'): missing.append(f"{a['type']} {a['id']} has no coordinates in QuestieDB")
    if not st: missing.append("no quest giver in QuestieDB")
    if not fn: missing.append("no turn-in in QuestieDB")
    srcs=[f"{WH}quest={qid}",QSRC,FVSRC]+([NSRC] if any(a['type']=='npc' for a in st+fn) else [])+([OSRC] if any(a['type']=='object' for a in st+fn) else [])+([ISRC] if rw else [])+([XSRC] if xp else [])
    return {"id":qid,"name":g(q,1),"questLevel":g(q,5),"minLevel":g(q,4),"recommendedLevel":g(q,5),
        "category":category,"horde":True,
        "classes":bits(cls,CLS) or None,"races":(bits(races,RACE) if races and races!=178 else None),
        "giver":st,"turnIn":fn,"forever":False,"foreverCoordinatesChanged":any(a.get("foreverCoordinatesChanged") for a in st+fn),
        "prerequisites":{"allOf":g(q,12) or [],"anyOf":g(q,13) or []},
        "leadsTo":sorted(children.get(qid,[])),
        "objectives":objectives(q,dz),
        "rewards":rw,
        "xp":({"atLevel":xp[0] if isinstance(xp,list) else g(xp,1),"amount":xp[1] if isinstance(xp,list) else g(xp,2),"note":"Classic Era base XP; WoW Forever reportedly halves dungeon-quest bonus XP (unofficial)"} if xp else None),
        "requiredSkill":g(q,18),
        "selectionReason":how,
        "sources":srcs,
        "verified":not missing,
        "verificationNotes":missing or ["giver, turn-in, coordinates, level and rewards read from QuestieDB Classic-era data; not yet confirmed on WoW Forever live"],
    }
def run():
    sel=select(); out={}
    for dz,l in sel.items():
        ids={q for q,h in l}; arr=[]
        for qid,how in l:
            q=Q[qid]
            if (g(q,5) or 0)<12: continue
            cat='endgame' if (g(q,5) or 0)>=60 and (g(q,4) or 0)>=58 else 'dungeon'
            arr.append(build_quest(qid,dz,how,cat))
        # prerequisite expansion
        stack=[(p,1) for x in arr for p in x['prerequisites']['allOf']+x['prerequisites']['anyOf']]
        seen=set(ids)
        while stack:
            p,d=stack.pop()
            if p in seen or p not in Q or p in BL or d>8: continue
            q=Q[p]; races=g(q,6) or 0
            if races and not races&178: continue
            seen.add(p)
            cat='endgame' if (g(q,5) or 0)>=60 and (g(q,4) or 0)>=58 else 'prerequisite'
            if (g(q,5) or 0)<12: continue
            arr.append(build_quest(p,dz,'prerequisite of a dungeon quest',cat))
            stack+= [(pp,d+1) for pp in (g(q,12) or [])+(g(q,13) or [])]
        arr.sort(key=lambda x:(x['category']=='endgame',x['questLevel'] or 0,x['id']))
        out[dz]=arr
    return out
if __name__=='__main__':
    o=run()
    json.dump({str(k):v for k,v in o.items()},open('quests_built.json','w'),indent=1)
    for dz,a in o.items(): print(D[dz],len(a),sum(x['verified'] for x in a),[x['id'] for x in a if x['category']=='prerequisite'])
