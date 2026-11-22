# Inserts grind steps where the level model says a quest would be accepted too far above the player.
from db import P5N, FOREVER_N, ZONES
from levelsim import Player, step_xp, mob_xp
START={"balanced":39.6,"speed":37.6}   # 20-40 arrival at Rog'mar as modelled in PR #29
MARGIN={"balanced":2,"speed":3}
KPM=2.5   # kills per minute while grinding one camp (pull, kill, short rest)
ZID={v:k for k,v in ZONES.items()}
P5URL0="https://github.com/liviu-stefan-pit/project-forever/tree/main/content/questie-db"
def camp(zone_name, target):
    zid=str(ZID.get(zone_name))
    best=None
    for k,n in P5N.items():
        if n.get('friendly') or n.get('rank') or n.get('sub'): continue
        sp=(n.get('spawns') or {}).get(zid)
        if not sp or len(sp)<6: continue
        lo,hi=n.get('minLevel') or 0, n.get('maxLevel') or 0
        if not (lo<=target+1 and hi>=target-1 and lo>=target-3): continue
        mid=(lo+hi)/2
        score=(abs(mid-(target+0.5)), -len(sp))
        if best is None or score<best[0]: best=(score,int(k),n,sp)
    if not best: return None
    _,k,n,sp=best
    pts=[p for p in sp if p and p[0]>=0]
    mx=sum(p[0] for p in pts)/len(pts); my=sum(p[1] for p in pts)/len(pts)
    c=min(pts,key=lambda p:(p[0]-mx)**2+(p[1]-my)**2)
    ds=sorted(((p[0]-c[0])**2+(p[1]-c[1])**2)**0.5 for p in pts)
    r=ds[int(len(ds)*0.75)]
    return dict(id=k,name=n['name'],levels=[n.get('minLevel'),n.get('maxLevel')],x=round(c[0],1),y=round(c[1],1),radius=round(min(max(r,1.5),10),1),spawns=len(pts),forever=bool(n.get('forever')))
def simulate(steps, route):
    p=Player(START[route]); lv=[]
    for s in steps:
        lv.append(p.level if route in s['route'] else None)
        if route in s['route']: p.add(step_xp(s,p))
    return lv, p.level
ADDED=[]
import os
def insert_grinds(steps, sid):
    if os.environ.get("NOGRIND"): return steps
    for route in ("speed","balanced"):
        guard=0
        while guard<200:
            guard+=1
            lv,_=simulate(steps, route)
            bad=None
            for i,s in enumerate(steps):
                if route in s['route'] and s['type']=='accept' and s.get('questLevel') and s['questLevel']>lv[i]+MARGIN[route]+1e-9:
                    bad=i; break
            if bad is None: break
            s=steps[bad]
            # look ahead: highest accept in the next 8 accepts of this route in the same zone
            ahead=[x['questLevel'] for x in steps[bad:] if route in x['route'] and x['type']=='accept' and x['zone']==s['zone'] and x.get('questLevel') and x['questLevel']<=s['questLevel']+1][:8]
            target=max(ahead)-MARGIN[route]
            here=lv[bad]
            c=camp(s.get('objZone') or s['zone'], int(round(here)))
            if not c: c=camp(s['zone'], int(here)+1)
            if not c: raise SystemExit("no camp for %s %s"%(s['zone'],here))
            # xp needed
            p=Player(here); need=0
            while p.level<target:
                x=mob_xp(p.level, c['levels'][1]); p.add(x); need+=x
            kills=int(need/ max(1,mob_xp(here, c['levels'][1])))+1
            mins=int(round(kills/KPM))
            g={"id":sid(s['zone'], f"grind-{'speedrun' if route=='speed' else 'balanced'}-before-{s['questId']}"),
               "route":[route],"levelRange":s['levelRange'],"zone":s['zone'],"objZone":s.get('objZone') or s['zone'],"mapId":s.get('mapId'),
               "type":"kill","questId":None,"grind":True,"grindXp":need,"minutesEst":max(5,mins),
               "title":f"Grind {c['name']} to level {target:.1f}",
               "text":f"Grind {c['name']} (level {c['levels'][0]}-{c['levels'][1]}, npc {c['id']}) around {c['x']}, {c['y']} in {s.get('objZone') or s['zone']} until about level {target:.1f} (model: from {here:.1f}, about {kills} kills, {max(5,mins)} minutes). The next quest here is level {s['questLevel']}.",
               "npc":None,"targets":[{"kind":"kill","name":c['name'],"id":c['id'],"coords":[c['x'],c['y']],"zone":s.get('objZone') or s['zone'],"spawnCount":c['spawns'],"level":c['levels'],"elite":False,"radius":c['radius']}],
               "dungeon":False,"roleTips":None,"classTips":None,"professionHooks":[],"eliteTips":None,"goldTips":None,"notes":None,
               "forever":c['forever'],"sources":[P5URL0],"verified":not c['forever']}
            steps.insert(bad,g); ADDED.append((g['id'],route,round(here,2),round(target,2),g['minutesEst'],c['id'],c['name'],c['x'],c['y']))
        lv,end=simulate(steps, route)
        if end<60.0:
            last=max(i for i,s in enumerate(steps) if route in s['route'] and s['zone']=="Mount Hyjal")
            s=steps[last]; here=lv[last]
            c=camp("Mount Hyjal", 59) or camp("Mount Hyjal", 58)
            p=Player(end); need=0
            while p.level<60.0:
                x=mob_xp(p.level, c['levels'][1]); p.add(x); need+=x
            kills=int(need/max(1,mob_xp(end,c['levels'][1])))+1; mins=max(5,int(round(kills/KPM)))
            gid=sid("Mount Hyjal", f"grind-{'speedrun' if route=='speed' else 'balanced'}-to-60")
            gs={"id":gid,"route":[route],"levelRange":[59,60],"zone":"Mount Hyjal","objZone":"Mount Hyjal","mapId":s.get('mapId'),"type":"kill","questId":None,"grind":True,"grindXp":need,"minutesEst":mins,
               "title":f"Grind {c['name']} to level 60","text":f"Grind {c['name']} (level {c['levels'][0]}-{c['levels'][1]}, npc {c['id']}) around {c['x']}, {c['y']} in Mount Hyjal for the last bit to 60 (model: from {end:.2f}, about {kills} kills, {mins} minutes).",
               "npc":None,"targets":[{"kind":"kill","name":c['name'],"id":c['id'],"coords":[c['x'],c['y']],"zone":"Mount Hyjal","spawnCount":c['spawns'],"level":c['levels'],"elite":False}],
               "dungeon":False,"roleTips":None,"classTips":None,"professionHooks":[],"eliteTips":None,"goldTips":None,"notes":None,"forever":c['forever'],"sources":[P5URL0],"verified":not c['forever']}
            steps.insert(last+1,gs); ADDED.append((gid,route,round(end,2),60.0,mins,c['id'],c['name'],c['x'],c['y']))
    return steps
