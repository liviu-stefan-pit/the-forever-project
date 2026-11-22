import json, math, re, hashlib, sys
from db import *
import spec, tips
CONV=json.load(open('/workspace/qdbf/conversion.json'))
P5URL0="https://github.com/liviu-stefan-pit/project-forever/pull/5"; P5URL1="https://github.com/Questie/QuestieDB/releases/tag/v1.1.3"
UIMAP={t['area_id']:t['ui_map_id'] for t in CONV['geometry']['transforms']}
QS="https://github.com/Questie/QuestieDB/tree/master/data/Forever"
WH="https://www.wowhead.com/classic/quest=%d"
warnings=[]
for _k,_v in UIMAP5.items(): UIMAP.setdefault(_k,_v)
def name_of(nid): return N[nid][0] if nid in N else None
def npc_obj(nid, zone_pref):
    loc=npc_loc(nid, zone_pref)
    if not loc: return {"name":name_of(nid),"id":nid}
    return {"name":name_of(nid),"id":nid,"coords":loc.get("coords"),"zone":ZONES.get(loc["zoneId"],loc["zoneId"]),"mapId":UIMAP.get(loc["zoneId"])}
def obj_obj(oid, zone_pref):
    o=O.get(oid); loc=obj_loc(oid, zone_pref)
    d={"name":o[0] if o else None,"id":oid,"kind":"object"}
    if loc: d.update(coords=loc["coords"], zone=ZONES.get(loc["zoneId"],loc["zoneId"]), mapId=UIMAP.get(loc["zoneId"]))
    return d
def giver(q, which, zone_pref):
    g=q[1] if which=="start" else q[2]
    if not g: return None
    if len(g)>0 and g[0]:
        return dict(npc_obj(g[0][0], zone_pref), kind="npc")
    if len(g)>1 and g[1]:
        return obj_obj(g[1][0], zone_pref)
    if which=="start" and len(g)>2 and g[2]:
        it=g[2][0]; return {"kind":"item","id":it,"name":I[it][0] if it in I else None}
    return None
def targets(q, zone_pref):
    out=[]; obj=q[9] or []
    obj=L(obj) if isinstance(obj,dict) else obj
    def lst(x): 
        x=L(x) if isinstance(x,dict) else x
        return x or []
    cre=lst(obj[0]) if len(obj)>0 else []
    for c in cre:
        if not c: continue
        c=L(c) if isinstance(c,dict) else c
        nid=c[0]; n=N.get(nid); cen=centroid(n[6] if n else None, zone_pref)
        out.append({"kind":"kill","name":name_of(nid),"id":nid,"coords":cen["coords"] if cen else None,"zone":ZONES.get(cen["zoneId"]) if cen else None,"spawnCount":cen["spawnCount"] if cen else 0,"level":[n[3],n[4]] if n else None,"elite": bool(n and n[5] in (1,2))})
    objs=lst(obj[1]) if len(obj)>1 else []
    for c in objs:
        if not c: continue
        c=L(c) if isinstance(c,dict) else c
        out.append(dict(obj_obj(c[0], zone_pref), kind="use"))
    items=lst(obj[2]) if len(obj)>2 else []
    for c in items:
        if not c: continue
        c=L(c) if isinstance(c,dict) else c
        it=c[0]; iv=I.get(it); drops=[]
        if iv:
            dl=[x for x in lst(iv[1]) if x]
            inz=[x for x in dl if N.get(x) and str(zone_pref) in SP(N[x][6])]
            for nid in (inz or dl)[:6]:
                n=N.get(nid); cen=centroid(n[6] if n else None, zone_pref)
                drops.append({"name":name_of(nid),"id":nid,"coords":cen["coords"] if cen else None,"zone":ZONES.get(cen["zoneId"]) if cen else None,"elite":bool(n and n[5] in (1,2))})
            ol=[x for x in lst(iv[2]) if x]
            oinz=[x for x in ol if O.get(x) and str(zone_pref) in SP(O[x][3])]
            for oid in (oinz or ol)[:4]:
                drops.append(dict(obj_obj(oid, zone_pref)))
        out.append({"kind":"collect","item":iv[0] if iv else None,"itemId":it,"from":drops})
    ko=lst(obj[4]) if len(obj)>4 else []
    for c in ko:
        if not c: continue
        c=L(c) if isinstance(c,dict) else c
        base=c[1] if len(c)>1 else None
        n=N.get(base); cen=centroid(n[6] if n else None, zone_pref)
        out.append({"kind":"killcredit","name":(c[2] if len(c)>2 else None) or name_of(base),"id":base,"coords":cen["coords"] if cen else None})
    te=q[8]
    if te:
        te=L(te) if isinstance(te,dict) else te
        if te and len(te)>1 and te[1]:
            cen=centroid(te[1], zone_pref)
            if cen: out.append({"kind":"explore","name":te[0],"coords":cen["coords"],"zone":ZONES.get(cen["zoneId"])})
    eo=q[28]
    if eo:
        eo=L(eo) if isinstance(eo,dict) else eo
        for e in eo:
            if not e: continue
            e=L(e) if isinstance(e,dict) else e
            cen=centroid(e[0], zone_pref) if e and e[0] else None
            if cen: out.append({"kind":"extra","name":e[2] if len(e)>2 else None,"coords":cen["coords"],"zone":ZONES.get(cen["zoneId"])})
    return out
def step_type(op, q, tg):
    if op=="A": return "accept"
    if op=="T": return "turnin"
    kinds={t["kind"] for t in tg}
    if "collect" in kinds: return "collect"
    if "kill" in kinds or "killcredit" in kinds: return "kill"
    return "complete"
CLASSN={1:"Warrior",2:"Paladin",4:"Hunter",8:"Rogue",16:"Priest",64:"Shaman",128:"Mage",256:"Warlock",1024:"Druid"}
def role_tips(t, extra=None):
    base=dict(tips.GENERIC.get({"complete":"kill"}.get(t,t), tips.GENERIC["travel"]))
    return base
steps=[]; seen={}
def sid(zone, key):
    base=re.sub(r'[^a-z0-9]+','-',zone.lower()).strip('-')
    k=f"h4060:{base}:{key}"; seen[k]=seen.get(k,0)+1
    return k if seen[k]==1 else f"{k}:{seen[k]}"
EXTERNAL={582,192,195,188,596,189,1429,1373,518,506,641,651,605}
done={"speed":set(EXTERNAL),"balanced":set(EXTERNAL)}
for z in spec.ZONES:
    zp=z["zoneId"]
    for op in z["ops"]:
        kind,ref,routes,extra=op
        rl={"S":["speed","balanced"],"B":["balanced"],"P":["speed"]}[routes]
        if kind in ("A","T","C"):
            qid=ref; q=Q.get(qid)
            if not q:
                warnings.append(f"missing quest {qid}"); continue
            if not horde_ok(q): warnings.append(f"quest {qid} {q[0]} not Horde")
            if kind=="C" and not q[9] and not q[8]:
                continue  # talk-only quest: no objective step needed
            zq=extra.get("zoneOverride") or zp
            st_g = giver(q,"start",zq) if kind=="A" else None
            en_g = giver(q,"end",zq) if kind=="T" else None
            tg = targets(q,zq) if kind=="C" else []
            t=step_type(kind,q,tg)
            if kind=="A":
                pre=(q[11] or [])+(q[12] or [])
                for r in rl:
                    # preQuestSingle: any one; preQuestGroup: all
                    if q[12] and not any(p in done[r] for p in q[12]) and not extra.get("dungeonOnly"):
                        warnings.append(f"[{r}] {qid} {q[0]}: none of preQuestSingle {q[12]} turned in earlier")
                    if q[11] and not all(p in done[r] for p in q[11]):
                        warnings.append(f"[{r}] {qid} {q[0]}: preQuestGroup {q[11]} not all done earlier")
            if kind=="T":
                for r in rl: done[r].add(qid)
            title={"A":"Accept","T":"Turn in","C":"Complete"}[kind]+": "+q[0]
            cls=q[6] or 0
            step={"id":(extra.get("idfull") or sid(z["zone"],extra.get("key") or f"{kind.lower()}{qid}")),"route":rl,"levelRange":z["levelRange"],"zone":z["zone"],
                  "mapId":UIMAP.get(zp),"type":t,"questId":qid,"title":title,"questLevel":q[4],"requiredLevel":q[3],
                  "npc": st_g or en_g, "targets":tg, "objZone": ZONES.get(zq),
                  "objectivesText": q[7] if kind=="C" else None,
                  "dungeon": bool(extra.get("dungeonOnly")), "dungeonOnly": bool(extra.get("dungeonOnly")), "dungeonName": extra.get("dungeonName"),
                  "classes":[v for k,v in CLASSN.items() if cls & k] if cls else None,
                  "roleTips": role_tips(t), "classTips":None, "professionHooks":[], "eliteTips":None, "goldTips":None,
                  "notes": extra.get("note"),
                  "requires":[p for p in ((q[11] or [])+(q[12] or [])) if p in EXTERNAL] or None,
                  "sources":([P5URL0, P5URL1] if qid in FOREVER_Q else [QS, WH%qid]), "verified": qid not in FOREVER_Q,
                  "forever": qid in FOREVER_Q,
                  "verifiedBy":("WoW Forever-new quest from PR #5 content/questie-db (QuestieDB v1.1.3 Forever build); not checked in game" if qid in FOREVER_Q else "QuestieDB data/Forever (converted Era baseline)")}
            qt=tips.QUEST.get(qid,{})
            if kind=="C":
                if qt.get("elite"): step["eliteTips"]=qt["elite"]
                if qt.get("tip"): step["notes"]=(step["notes"]+" " if step["notes"] else "")+qt["tip"]
                if any(x.get("elite") for x in tg) or any(x.get("from") and all(d.get("elite") for d in x["from"] if "elite" in d) and any("elite" in d for d in x["from"]) for x in tg):
                    step["eliteTips"]=step["eliteTips"] or "At least one target is elite. Bring a friend or group up from the zone channel; tanks pull it away from adds, healers stay out of melee range, damage dealers burst it after the tank has a few seconds of threat."
            if kind=="C" and not any(x.get('coords') or any(d.get('coords') for d in x.get('from',[])) for x in tg):
                step["needsCoords"]=True
            steps.append(step)
        else:
            t={"FP":"travel","FLY":"travel","HS":"travel","TRAVEL":"travel","TRAIN":"train","GRIND":"kill","DUNGEON":"dungeon","PROF":"profession","VENDOR":"travel"}.get(kind)
            if kind.startswith("FQ"):
                a=kind[2]; t={"A":"accept","T":"turnin","C":"kill"}[a]
                step={"id":sid(z["zone"],f"forever-{a.lower()}-"+re.sub(r'[^a-z0-9]+','-',extra.get('key',extra['title']).lower()).strip('-')),"route":rl,"levelRange":z["levelRange"],"zone":z["zone"],
                      "mapId":None,"type":t,"questId":extra.get("questId"),"title":{"A":"Accept","T":"Turn in","C":"Complete"}[a]+": "+extra["title"],
                      "npc":(dict(extra["npc"],kind="npc") if a!="C" else None),"targets":[],"dungeon":False,"roleTips":role_tips(t),"classTips":None,"professionHooks":[],
                      "eliteTips":("Elite quest. Bring two or three players at 60; this is one of the WoW Forever group quests on the mountain." if extra.get("elite") and a=="C" else None),
                      "goldTips":None,"notes":None,"forever":True,"sources":extra["sources"],"verified":False,
                      "verifiedBy":"Third-party WoW Forever quest lists; quest id not confirmed in QuestieDB" }
                steps.append(step); continue
            step={"id":extra.get("idfull") or sid(z["zone"],kind.lower()+"-"+(extra.get("idkey") or hashlib.sha1(ref.encode()).hexdigest()[:6])),"route":rl,"levelRange":z["levelRange"],"zone":z["zone"],
                  "mapId":UIMAP.get(zp),"type":t,"questId":None,"title":ref.split(". ")[0][:90],"text":ref,
                  "npc":extra.get("npc"),"targets":[],"dungeon": kind=="DUNGEON",
                  "dungeonName":extra.get("dungeonName"),"dungeonQuestIds":extra.get("questIds"),
                  "coords":extra.get("coords"),
                  "roleTips":role_tips(t),"classTips":None,"professionHooks":[],"eliteTips":None,"goldTips":None,"notes":None,
                  "sources":extra.get("sources",[QS] if extra.get("questIds") else []),
                  "verified":extra.get("verified", True if kind in("FLY","TRAVEL") and zp else False)}
            steps.append(step)
import grind
steps=grind.insert_grinds(steps, sid)
for i,s in enumerate(steps): s["order"]=i+1
import os as _os2; _os2.makedirs("out", exist_ok=True)
json.dump(steps, open("out/steps.json","w"), indent=1, ensure_ascii=False)
print(len(steps), "steps"); print("\n".join(warnings))
