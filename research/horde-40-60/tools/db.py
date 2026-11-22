import json
def L(v):
    if isinstance(v,dict) and v and all(k.isdigit() for k in v):
        mx=max(int(k) for k in v); return [v.get(str(i)) for i in range(1,mx+1)]
    return v
def LL(v):
    v=L(v)
    return v + [None]*(40-len(v)) if isinstance(v,list) else v
Q={int(k):LL(v) for k,v in json.load(open('/workspace/qdbf/foreverQuestDB.json')).items()}
N={int(k):LL(v) for k,v in json.load(open('/workspace/qdbf/foreverNpcDB.json')).items()}
O={int(k):LL(v) for k,v in json.load(open('/workspace/qdbf/foreverObjectDB.json')).items()}
I={int(k):LL(v) for k,v in json.load(open('/workspace/qdbf/foreverItemDB.json')).items()}
ZONES={33:"Stranglethorn Vale",405:"Desolace",3:"Badlands",8:"Swamp of Sorrows",440:"Tanaris",357:"Feralas",47:"The Hinterlands",51:"Searing Gorge",16:"Azshara",490:"Un'Goro Crater",361:"Felwood",46:"Burning Steppes",28:"Western Plaguelands",139:"Eastern Plaguelands",618:"Winterspring",1377:"Silithus",15:"Dustwallow Marsh",1637:"Orgrimmar",1638:"Thunder Bluff",1497:"Undercity",4:"Blasted Lands",400:"Thousand Needles",45:"Arathi Highlands",36:"Alterac Mountains",267:"Hillsbrad Foothills",85:"Tirisfal Glades",493:"Moonglade",17:"The Barrens",14:"Durotar",331:"Ashenvale",406:"Stonetalon Mountains",215:"Mulgore",130:"Silverpine Forest",10:"Duskwood",41:"Deadwind Pass",44:"Redridge Mountains",148:"Darkshore",1176:"Zul'Farrak",2100:"Maraudon",1417:"Sunken Temple",1584:"Blackrock Depths",1583:"Blackrock Spire",2057:"Scholomance",2017:"Stratholme",2557:"Dire Maul",1337:"Uldaman",11:"Wetlands",1:"Dun Morogh",25:"Blackrock Mountain",1519:"Stormwind City",722:"Razorfen Downs",491:"Razorfen Kraul",796:"Scarlet Monastery",2597:"Alterac Valley",3277:"Warsong Gulch",3358:"Arathi Basin",719:"Blackfathom Deeps",718:"Wailing Caverns",1977:"Zul'Gurub",2717:"Molten Core",2677:"Blackwing Lair",3428:"Ahn'Qiraj",3429:"Ruins of Ahn'Qiraj",2159:"Onyxia's Lair",12:"Elwynn Forest",40:"Westfall",38:"Loch Modan",141:"Teldrassil",1657:"Darnassus",1537:"Ironforge"}
HORDE=2|16|32|128
def horde_ok(q):
    r=q[5] or 0
    return r==0 or (r & HORDE)!=0
def SP(s):
    if isinstance(s,list): return {str(i+1):v for i,v in enumerate(s) if v}
    return {k:v for k,v in (s or {}).items() if v}
def spawns(ent):
    return SP(ent[6] if ent else None)
def npc_loc(nid, prefer=None):
    n=N.get(nid)
    if not n: return None
    sp=spawns(n)
    if not sp: return {"zoneId":n[8],"coords":None}
    z = str(prefer) if prefer and str(prefer) in sp else max(sp, key=lambda k: len(sp[k] or []))
    pts=[p for p in (sp[z] or []) if p and p[0] is not None and p[0]>=0]
    if not pts: return {"zoneId":int(z),"coords":None}
    return {"zoneId":int(z),"coords":[round(pts[0][0],1),round(pts[0][1],1)],"n":len(pts)}
def obj_loc(oid, prefer=None):
    o=O.get(oid)
    if not o: return None
    sp=SP(o[3])
    if not sp: return None
    z = str(prefer) if prefer and str(prefer) in sp else max(sp, key=lambda k: len(sp[k] or []))
    pts=[p for p in (sp[z] or []) if p and p[0] is not None and p[0]>=0]
    return {"zoneId":int(z),"coords":[round(pts[0][0],1),round(pts[0][1],1)] if pts else None}
def centroid(sp, z=None):
    sp=SP(sp)
    if not sp: return None
    z = str(z) if z and str(z) in sp else max(sp, key=lambda k: len(sp[k] or []))
    pts=[p for p in (sp[z] or []) if p and p[0] is not None and p[0]>=0]
    if not pts: return None
    # pick medoid-ish: point nearest to mean
    mx=sum(p[0] for p in pts)/len(pts); my=sum(p[1] for p in pts)/len(pts)
    b=min(pts,key=lambda p:(p[0]-mx)**2+(p[1]-my)**2)
    return {"zoneId":int(z),"coords":[round(b[0],1),round(b[1],1)],"spawnCount":len(pts)}
def find(name):
    return [(k,v) for k,v in Q.items() if v[0] and name.lower() in v[0].lower()]

def mobarea(sp, z):
    sp=SP(sp)
    if not sp or str(z) not in sp: return None
    pts=[p for p in sp[str(z)] if p and p[0] is not None and p[0]>=0]
    if not pts: return None
    mx=sum(p[0] for p in pts)/len(pts); my=sum(p[1] for p in pts)/len(pts)
    b=min(pts,key=lambda p:(p[0]-mx)**2+(p[1]-my)**2)
    ds=sorted(((p[0]-b[0])**2+(p[1]-b[1])**2)**0.5 for p in pts)
    r=ds[int(len(ds)*0.75)] if ds else 2
    return {"x":round(b[0],1),"y":round(b[1],1),"radius":round(min(max(r,1.5),15),1),"n":len(pts)}

# ---- PR #5 (content/questie-db, QuestieDB v1.1.3 Forever build) merge ----
import os
P5='/workspace/r4060/pr5'
P5Q=json.load(open(P5+'/quests.json')); P5N=json.load(open(P5+'/npcs.json')); P5O=json.load(open(P5+'/objects.json')); P5I=json.load(open(P5+'/items.json')); P5Z=json.load(open(P5+'/zones.json'))
FOREVER_Q=set(); FOREVER_N=set(); FOREVER_O=set()
def _q5(q):
    t=[None]*40; s=q.get('start',{}); e=q.get('end',{}); o=q.get('objectives',{})
    t[0]=q.get('name'); t[1]=[s.get('npc'),s.get('object'),s.get('item')]; t[2]=[e.get('npc'),e.get('object')]
    t[3]=q.get('reqLevel'); t[4]=q.get('level'); t[5]=q.get('races',0); t[6]=q.get('classes',0); t[7]=q.get('objectivesText')
    cr=[[c['id']] for c in o.get('creatures',[])]; ob=[[c['id']] for c in o.get('objects',[])]; it=[[c['id']] for c in o.get('items',[])]
    kc=[[d.get('ids'),d.get('baseId'),d.get('text')] for k in o.get('killCredit',[]) for d in (k if isinstance(k,list) else [k]) if isinstance(d,dict)]
    t[9]=[cr,ob,it,None,kc] if (cr or ob or it or kc) else None
    pre=q.get('pre',{}); t[11]=pre.get('group'); t[12]=pre.get('single'); t[16]=q.get('zoneId')
    return t
def _n5(n):
    t=[None]*40; t[0]=n.get('name'); t[3]=n.get('minLevel'); t[4]=n.get('maxLevel'); t[5]=n.get('rank',0)
    t[6]=n.get('spawns'); t[8]=n.get('zoneId'); t[12]=n.get('friendly'); t[13]=n.get('sub'); return t
def _o5(o):
    t=[None]*40; t[0]=o.get('name'); t[3]=o.get('spawns'); return t
def _i5(i):
    t=[None]*40; t[0]=i.get('name'); t[1]=i.get('npcDrops'); t[2]=i.get('objectDrops'); return t
for k,v in P5Q.items():
    if v.get('forever'): FOREVER_Q.add(int(k)); Q[int(k)]=_q5(v)
for k,v in P5N.items():
    if v.get('forever') or int(k) not in N:
        if v.get('forever'): FOREVER_N.add(int(k))
        N[int(k)]=_n5(v)
for k,v in P5O.items():
    if v.get('forever') or int(k) not in O:
        if v.get('forever'): FOREVER_O.add(int(k))
        O[int(k)]=_o5(v)
for k,v in P5I.items():
    if v.get('forever') or int(k) not in I: I[int(k)]=_i5(v)
for k,v in P5Z.items():
    if v.get('name') and int(k) not in ZONES and v.get('uiMapId'): ZONES[int(k)]=v['name']
UIMAP5={int(k):v['uiMapId'] for k,v in P5Z.items() if v.get('uiMapId')}
P5SRC="content/questie-db (PR #5, QuestieDB v1.1.3 Forever build, GPL-3.0)"
