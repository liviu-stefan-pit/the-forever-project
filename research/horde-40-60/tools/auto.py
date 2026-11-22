# Greedy hub-sweep route generator for WoW Forever-new quests, from PR #5 data (content/questie-db).
from db import *
def _xy(ent_spawns, zid):
    sp=SP(ent_spawns); pts=sp.get(str(zid)) if sp else None
    pts=[p for p in (pts or []) if p and p[0] is not None and p[0]>=0]
    return pts[0] if pts else None
def giver_xy(qid, which, zid, cur=None):
    q=P5Q[str(qid)]; g=q.get(which,{}) or {}
    ents=[('npc',n,N[n][6]) for n in g.get('npc',[]) or [] if n in N]+[('obj',o,O[o][3]) for o in g.get('object',[]) or [] if o in O]
    for z in [cur,zid]+[None]:
        for kind,i,sp in ents:
            spd=SP(sp)
            zs=[str(z)] if z is not None else list(spd.keys())
            for zz in zs:
                p=_xy(sp, zz)
                if p: return (kind,i,p,int(zz))
    return None
def obj_xy(qid, zid):
    q=Q[qid]; obj=q[9]
    if not obj: return None
    pts=[]
    for c in obj[0] or []:
        n=N.get(c[0]); p=n and centroid(n[6],zid)
        if p and p['zoneId']==zid: pts.append(p['coords'])
    for c in obj[1] or []:
        o=O.get(c[0]); p=o and centroid(o[3],zid)
        if p and p['zoneId']==zid: pts.append(p['coords'])
    for c in obj[2] or []:
        it=I.get(c[0])
        for d in (it[1] or [])[:3] if it else []:
            n=N.get(d); p=n and centroid(n[6],zid)
            if p and p['zoneId']==zid: pts.append(p['coords']); break
    if not pts: return None
    return [sum(p[0] for p in pts)/len(pts), sum(p[1] for p in pts)/len(pts)]
def d2(a,b): return (a[0]-b[0])**2+(a[1]-b[1])**2
HORDE5=2|16|32|128
def eligible(v, lmin, lmax, zname):
    if not v.get('forever') or v.get('zone')!=zname: return False
    if v.get('foreverConfidence')!='high' or v.get('id') in NEVER: return False
    lv=v.get('level') or 0
    if lv<lmin or lv>lmax: return False
    r=v.get('races',0)
    if r and not (r & HORDE5): return False
    if v.get('tag') in ('Dungeon','Raid','PvP'): return False
    if v.get('repeatable'): return False
    if v.get('classes'): return False
    return True
def _pres(v):
    p=v.get('pre',{}); return (p.get('group') or [])+(p.get('single') or [])
def _zid(k): return P5Q[str(k)].get('zoneId')
CUR=[None]
def gxy(k,which):
    return giver_xy(k,which,_zid(k),CUR[0])
DROPPED={}
NEVER={79953,81951}
PLANNED={}
def auto_ops(zname, zid, lmin, lmax, start, routes_fn, skip=(), extra_q=(), pull_level=None, near=()):
    pool={int(k):v for k,v in P5Q.items() if eligible(v,lmin,lmax,zname) and int(k) not in skip and int(k) not in PLANNED}
    for k in extra_q: pool[k]=P5Q[str(k)]
    if pull_level is not None:
        grow=True
        while grow:
            grow=False
            for k,v in list(pool.items()):
                for p in _pres(v):
                    pv=P5Q.get(str(p))
                    if p in pool or p in PLANNED or not pv: continue
                    if pv.get('forever') and pv.get('foreverConfidence')=='high' and p not in NEVER and (pv.get('level') or 0)>=pull_level and pv.get('tag') not in ('Dungeon','Raid') and not pv.get('classes') and (not pv.get('races') or pv['races']&HORDE5):
                        pool[p]=pv; grow=True
    CUR[0]=zid
    pool={k:v for k,v in pool.items() if gxy(k,'start') and gxy(k,'end')}
    notes={}
    changed=True
    while changed:
        changed=False
        for k,v in list(pool.items()):
            for p in _pres(v):
                if p in pool or p in PLANNED: continue
                pv=P5Q.get(str(p))
                if pv and ((pv.get('forever') and pv.get('zone')==zname and (pv.get('level') or 0)<lmin) or (not pv.get('forever') and (pv.get('level') or 99)<40)) and pv.get('tag')!='Dungeon':
                    notes.setdefault(k,[]).append(p); continue
                single=v.get('pre',{}).get('single') or []
                if p in single and any(x in pool for x in single): continue
                DROPPED[k]=(v.get('name'),zname,"prerequisite %s (%s) is outside this route"%(p,(pv or {}).get('name'))); pool.pop(k); changed=True; break
    # balanced-only propagates to follow-ups
    rmap={k:("B" if gxy(k,'start')[3] not in (zid,)+tuple(near) else routes_fn(v)) for k,v in pool.items()}
    changed=True
    while changed:
        changed=False
        for k,v in pool.items():
            if rmap[k]=="S" and any((rmap.get(p) or PLANNED.get(p))=="B" for p in (v.get('pre',{}).get('group') or [])) :
                rmap[k]="B"; changed=True
            sg=[p for p in (v.get('pre',{}).get('single') or []) if p in pool or p in PLANNED]
            if rmap[k]=="S" and sg and all((rmap.get(p) or PLANNED.get(p))=="B" for p in sg): rmap[k]="B"; changed=True
    for k in pool: PLANNED[k]=rmap[k]
    routes_fn=lambda v,_m=rmap: _m[v['id']]
    done=set(); acc=set(); ops=[]; pos=start; excl=set()
    if pos is None:
        roots=[k for k,v in pool.items() if not any(p in pool for p in (v.get('pre',{}).get('group') or [])+(v.get('pre',{}).get('single') or []))]
        roots=[k for k in roots if _zid(k)==zid] or roots; k0=min(roots,key=lambda k:(pool[k].get('level') or 0,k)); pos=gxy(k0,'start')[2]
    def ready(k,v):
        pre=v.get('pre',{})
        g=[p for p in pre.get('group',[]) or [] if p in pool]
        s=[p for p in pre.get('single',[]) or [] if p in pool]
        if g and not all(p in done for p in g): return False
        if s and not any(p in done for p in s): return False
        return k not in excl
    while True:
        avail=[k for k,v in pool.items() if k not in done and k not in acc and ready(k,v)]
        if not avail: break
        # nearest giver with available quests
        by={}
        for k in avail:
            g=gxy(k,'start'); by.setdefault((g[0],g[1]),((g[2] if g[3]==zid else [g[2][0]+500,g[2][1]]),[]))[1].append(k)
        key=min(by,key=lambda x:d2(pos,by[x][0])); gp,batch=by[key]; pos=gp
        # also grab quests from any giver within ~3% of this one (same hub)
        for kk,(p,lst) in by.items():
            if kk!=key and d2(p,gp)<9: batch+=lst
        batch=sorted(set(batch))
        for k in batch:
            ops.append(("A",k,routes_fn(pool[k]),{"forever5":True,"note":("Needs earlier quest(s) %s from the levels below 40 (covered by the 20-40 research)."%", ".join(map(str,notes[k])) if k in notes else None),"zoneOverride":gxy(k,'start')[3]})); acc.add(k)
            for x in pool[k].get('exclusiveTo',[]) or []: excl.add(x)
        # complete in nearest-neighbour order
        todo=[k for k in batch if Q[k][9]]
        while todo:
            k=min(todo,key=lambda k:d2(pos,obj_xy(k,_zid(k)) or pos)); todo.remove(k)
            pos=obj_xy(k,_zid(k)) or pos
            ops.append(("C",k,routes_fn(pool[k]),{"forever5":True,"zoneOverride":_zid(k)}))
        # turn in nearest-neighbour by ender
        tt=list(batch)
        while tt:
            k=min(tt,key=lambda k:d2(pos,gxy(k,'end')[2])+(0 if gxy(k,'end')[3]==zid else 250000)); tt.remove(k)
            pos=gxy(k,'end')[2]
            ops.append(("T",k,routes_fn(pool[k]),{"forever5":True,"zoneOverride":gxy(k,'end')[3]})); acc.discard(k); done.add(k)
    return ops, pool
