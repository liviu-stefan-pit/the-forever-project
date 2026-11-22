import re,json
from lib import *
BL=set(int(m) for m in re.findall(r'^\s*\[(\d+)\]\s*=\s*true\b',open('bl_main.txt').read(),re.M))
D={2437:'Ragefire Chasm',718:'Wailing Caverns',209:'Shadowfang Keep',719:'Blackfathom Deeps',491:'Razorfen Kraul',796:'Scarlet Monastery',722:'Razorfen Downs',1337:'Uldaman',1176:"Zul'Farrak",2100:'Maraudon',1477:'Sunken Temple',1584:'Blackrock Depths',1583:'Blackrock Spire',2557:'Dire Maul',2057:'Scholomance',2017:'Stratholme'}
ALT={236:209,1717:491,2797:719,1316:722,6109:796,978:1176,1517:1337,1417:1477,1585:1584,2277:2557,2577:2557,2279:2017}
def dz_of(z):
    if z in D: return z
    return ALT.get(z)
def objlist(q):
    o=g(q,10) or []; res=[]
    for c in (g(o,1) or []): res.append(('npc',g(c,1),None))
    for it in (g(o,3) or []):
        iid=g(it,1); res.append(('item',iid,g(I.get(iid),2) or []))
    for c in (g(o,2) or []): res.append(('obj',g(c,1),None))
    for k in (g(o,5) or []): res.append(('kill',g(k,2),g(k,1) or []))
    return res
def npc_dz(n):
    for sz in spawns(n):
        d=dz_of(sz)
        if d: return d
# 8588 is an AQ war-effort Heavy Leather turn-in, not a dungeon quest, and is not in content/questie-db.
SKIP={8588}
def select():
    out={}
    for qid,q in Q.items():
        if qid in BL or qid in SKIP: continue
        races=g(q,6) or 0
        if races and not (races & 178): continue
        if (g(q,24) or 0)&1: continue  # repeatable
        dz=dz_of(g(q,17))
        how='zoneOrSort' if dz else None
        if not dz:
            for kind,x,drops in objlist(q):
                if kind=='npc' and npc_dz(x): dz=npc_dz(x);how='objective NPC in dungeon';break
                if kind=='kill':
                    for n in drops:
                        if npc_dz(n): dz=npc_dz(n);how='objective NPC in dungeon';break
                    if dz:break
                if kind=='item' and drops:
                    withsp=[n for n in drops if spawns(n)]
                    ind=[n for n in withsp if npc_dz(n)]
                    if withsp and len(ind)*2>=len(withsp): dz=npc_dz(ind[0]);how='objective item drops in dungeon';break
        if not dz: continue
        starters=(g(g(q,2),1) or [])
        if starters and all((g(N.get(s),13) or '')=='A' for s in starters): continue
        out.setdefault(dz,[]).append((qid,how))
    return out
if __name__=='__main__':
    out=select()
    for dz,l in out.items(): print(D[dz],len(l),[ (q,g(Q[q],1),g(Q[q],5)) for q,h in sorted(l)])
    print(sum(len(l) for l in out.values()))
