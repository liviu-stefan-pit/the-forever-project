import json,re
from pathlib import Path
from paths import DUNGEONS_JSON, STEPS_JSON, ZONES_JSON, QUESTS_JSON, NPCS_JSON, OBJECTS_JSON, ITEMS_JSON, TOOL_DIR, DDIR
from pack_fixes import dungeon_of_zone

d=json.load(open(DUNGEONS_JSON))
QDB=json.loads(QUESTS_JSON.read_text())
NPCS_DB=json.loads(NPCS_JSON.read_text())
OBJS_DB=json.loads(OBJECTS_JSON.read_text())
ITEMS_DB=json.loads(ITEMS_JSON.read_text())

def load_ui():
    for pth in (TOOL_DIR/"pin_areaIdToUiMapId.lua", DDIR/"pin_areaIdToUiMapId.lua", Path("pin_areaIdToUiMapId.lua")):
        if pth.exists():
            src=pth.read_text()
            main=src[src.index("ZoneDB.private.areaIdToUiMapId = "):]
            return {int(a):int(b) for a,b in re.findall(r"\[(\d+)\]\s*=\s*(\d+)",main)}, True
    Z=json.loads(ZONES_JSON.read_text())
    return {int(zid):z["uiMapId"] for zid,z in Z.items() if z.get("uiMapId")}, False

UI, HAVE_LUA = load_ui()
QS={"url":"https://github.com/Questie/Questie/tree/e29dc411d70a4f7c6cd5d964f153bd065c5fd834/Database/Classic","label":"QuestieDB Classic (GPL-3.0)"}
QUESTIE_V113={"url":"https://github.com/Questie/QuestieDB/releases/tag/v1.1.3","label":"QuestieDB v1.1.3 Forever (content/questie-db)"}
def wh(kind,i,label): return {"url":f"https://www.wowhead.com/classic/{kind}={i}","label":label}
def srcs(q): return [wh('quest',q['id'],f"Wowhead Classic: {q['name']}"),QS]
ROLES=["tank","healer","dps"]
steps=[]; n=0
seen_accept=set(); seen_turnin=set()
BUILD_CLASSIC = True  # zones.json uiMapIds match the pinned Classic map ids
if not BUILD_CLASSIC:
    existing=json.loads(STEPS_JSON.read_text())
    steps=[s for s in existing["steps"] if not str(s.get("id","")).startswith("dungeons:forever:")]
    n=steps[-1]["n"] if steps else 0
    print("reusing",len(steps),"classic steps from steps-v2.json (no pin_areaIdToUiMapId.lua)")
def add(s):
    global n; n+=1; s['n']=n; steps.append(s)
def goto(a):
    if a.get('x') is None or a.get('zoneId') not in UI: return None
    return {"type":"goto","at":{"mapId":UI[a['zoneId']],"x":a['x'],"y":a['y'],"zone":a['zone'],"exact":True}}
def routes(q):
    r=[k for k in ("balanced","speedrun") if q['route'][k]]
    return r
def npc_pin(a,service,q):
    if a['type']!='npc' or a.get('x') is None or a.get('zoneId') not in UI: return None
    return {"kind":"npc","npcId":a['id'],"name":a['name'],"at":{"mapId":UI[a['zoneId']],"zone":a['zone'],"x":a['x'],"y":a['y']},"service":service,"sources":[wh('npc',a['id'],f"Wowhead Classic: {a['name']}"),QS],"verified":True}
def obj_pin(a,q):
    if a['type']!='object' or a.get('x') is None or a.get('zoneId') not in UI: return None
    return {"kind":"object","objectId":a['id'],"name":a['name'],"at":{"mapId":UI[a['zoneId']],"zone":a['zone'],"x":a['x'],"y":a['y']},"sources":[wh('object',a['id'],f"Wowhead Classic: {a['name']}"),QS],"verified":True}

def pre_of(qid):
    q=QDB.get(str(qid)) or {}
    pre=q.get("pre") or {}
    return list(pre.get("single") or []), list(pre.get("group") or [])

def pack_quest_ids():
    ids=set()
    for x in d.get("dungeons") or []:
        for q in x.get("quests") or []:
            if q.get("category")=="endgame":
                continue
            if q.get("id") is not None:
                ids.add(q["id"])
    for nd in (d.get("wowForever") or {}).get("newDungeons") or []:
        for q in nd.get("quests") or []:
            if q.get("id") is not None:
                ids.add(q["id"])
    return ids

PACK_IDS=pack_quest_ids()
ORDER_WARNINGS=[]

def all_pack_quests():
    out=[]
    for x in d.get("dungeons") or []:
        for q in x.get("quests") or []:
            if q.get("category")=="endgame" or q.get("id") is None:
                continue
            if not routes(q):
                continue
            out.append(q)
    return out

def effective_routes_map():
    """If a pack quest is on a route, every in-pack pre.group member is too, and at least one pre.single member is."""
    qs=all_pack_quests()
    need={q["id"]: set(routes(q)) for q in qs}
    changed=True
    while changed:
        changed=False
        for q in qs:
            qid=q["id"]
            single, group = pre_of(qid)
            # pre.group = all-of: every in-pack member must appear on the same routes.
            for p in group:
                if p in need:
                    extra=need[qid]-need[p]
                    if extra:
                        need[p] |= extra
                        changed=True
            # pre.single = any-of: one member is enough. If another member is out of pack,
            # the any-of can be satisfied outside, so don't pull an in-pack member onto the route.
            in_pack_s=[p for p in single if p in need]
            if not in_pack_s or any(p not in need for p in single):
                continue
            for route in list(need[qid]):
                if any(route in need[p] for p in in_pack_s):
                    continue
                p=in_pack_s[0]
                if route not in need[p]:
                    need[p].add(route)
                    changed=True
    return need

ROUTE_NEED=effective_routes_map()

def routes_of(q):
    extra=ROUTE_NEED.get(q["id"])
    if extra:
        return [k for k in ("balanced","speedrun") if k in extra]
    return routes(q)

def prereqs_ready(qid, done, pack_ids=None):
    """True when pre.single (any-of) is satisfied and every in-pack pre.group (all-of) member is in done.

    An any-of list that includes an out-of-pack quest can be satisfied outside this pack, so it
    does not block in-pack order. Out-of-pack all-of members are also left to the expansion guard.
    """
    pack_ids = PACK_IDS if pack_ids is None else pack_ids
    single, group = pre_of(qid)
    in_pack_single=[p for p in single if p in pack_ids]
    if in_pack_single and all(p in pack_ids for p in single):
        if not any(p in done for p in in_pack_single):
            return False
    for p in group:
        if p in pack_ids and p not in done:
            return False
    return True

def needs_dungeon_run(q, dungeon_key):
    if q.get("category")=="dungeon":
        return True
    for o in q.get("objectives") or []:
        if o.get("insideDungeon"):
            return True
    for tv in q.get("turnIn") or []:
        zid=tv.get("zoneId")
        if zid is not None and dungeon_of_zone(zid)==dungeon_key:
            return True
    return False

def classify(qs, dungeon_key):
    pack={q["id"] for q in qs}
    requires={q["id"]: needs_dungeon_run(q, dungeon_key) for q in qs}
    followup=set()
    changed=True
    while changed:
        changed=False
        for q in qs:
            qid=q["id"]
            if qid in followup:
                continue
            single, group = pre_of(qid)
            # pre.group = all-of: any required in-pack member that needs the run delays this quest.
            if any((p in pack and (requires.get(p) or p in followup)) for p in group):
                followup.add(qid); changed=True; continue
            # pre.single = any-of: delayed only if every listed quest is in this dungeon and needs the run.
            in_pack_s=[p for p in single if p in pack]
            if single and in_pack_s and len(in_pack_s)==len(single) and all(requires.get(p) or p in followup for p in in_pack_s):
                followup.add(qid); changed=True
    lead=[q for q in qs if q["id"] not in followup and not requires[q["id"]]]
    prerun=[q for q in qs if q["id"] not in followup and requires[q["id"]]]
    follows=[q for q in qs if q["id"] in followup]
    return lead, prerun, follows

def iter_ready(cands, done, label):
    """Yield quests from cands in original order as soon as in-pack prereqs are in done."""
    remaining=list(cands)
    while remaining:
        ready=[q for q in remaining if prereqs_ready(q["id"], done)]
        if not ready:
            ORDER_WARNINGS.append({"label":label,"stuck":[q["id"] for q in remaining],"done":sorted(done)})
            ready=remaining[:]
        q=ready[0]
        remaining.remove(q)
        yield q

def emit_accept(x, key, dref, q):
    if q["id"] in seen_accept:
        return
    seen_accept.add(q["id"])
    cls=q["classes"]; base={"tags":{},"conditions":[],"routes":routes_of(q),"dungeon":dref,"sources":srcs(q),"verified":q["verified"]}
    if cls: base["classes"]=cls
    if q["races"]: base["filter"]={"any":[[{"race":r}] for r in q["races"]]}
    gv=q["giver"][0] if q["giver"] else None
    acts=[]; pins=[]
    if gv:
        g=goto(gv); acts+= [g] if g else []
        p=npc_pin(gv,"questGiver",q) or obj_pin(gv,q); pins+=[p] if p else []
    acts.append({"type":"accept","questId":q["id"],"label":q["name"]})
    where=(f"from {gv['name']} in {gv['zone']}" if gv and gv.get("zone") else (f"from the item {gv['name']} (drops in the dungeon)" if gv and gv["type"]=="item" else ""))
    tip={"kind":"speed","text":q["route"]["why"],"routes":routes(q),"sources":[{"url":"https://github.com/liviu-stefan-pit/project-forever/blob/vulkan/dungeons/research/dungeons/README.md","label":"Team route judgement (research/dungeons)"}],"verified":False}
    add({**base,"id":f"dungeons:{key}:accept:{q['id']}","section":x["name"],"text":[{"segments":[{"t":f"Accept {q['name']} {where} (level {q['minLevel']}+, quest level {q['questLevel']})".replace("  "," ")}]}],"actions":acts,"pins":pins,"tips":[tip]})

def emit_turnin(x, key, dref, q):
    if q["id"] in seen_turnin:
        return
    seen_turnin.add(q["id"])
    tv=q["turnIn"][0] if q["turnIn"] else None
    base={"tags":{},"conditions":[],"routes":routes_of(q),"dungeon":dref,"sources":srcs(q),"verified":q["verified"]}
    if q["classes"]: base["classes"]=q["classes"]
    if q["races"]: base["filter"]={"any":[[{"race":r}] for r in q["races"]]}
    acts=[];pins=[]
    if tv:
        g=goto(tv); acts+=[g] if g else []
        p=npc_pin(tv,"turnIn",q) or obj_pin(tv,q); pins+=[p] if p else []
    acts.append({"type":"turnin","questId":q["id"],"label":q["name"]})
    rw=", ".join(r["name"] for r in q["rewards"][:4])
    t=f"Turn in {q['name']}"+(f" to {tv['name']} ({tv['zone']})" if tv and tv.get("zone") else "")+(f". Reward choices include {rw}" if rw else "")
    st={**base,"id":f"dungeons:{key}:turnin:{q['id']}","section":x["name"],"text":[{"segments":[{"t":t}]}],"actions":acts,"pins":pins}
    if q.get("professionHooks"): st["professionHooks"]=q["professionHooks"]
    add(st)

def emit_run(x, key, dref, qs):
    run_id=f"dungeons:{key}:run"; off_id=f"dungeons:{key}:off"
    acts=[]
    e=x["entrances"][0]
    if e["zoneId"] in UI: acts.append({"type":"goto","at":{"mapId":UI[e["zoneId"]],"x":e["x"],"y":e["y"],"zone":e["zone"],"exact":True}})
    elites={}
    for q in qs:
        for i,o in enumerate(q["objectives"],1):
            if o["type"] in ("kill","killCredit"): acts.append({"type":"complete","questId":q["id"],"objective":i,"label":f"{q['name']}: {o.get('name')}"})
            elif o["type"]=="collect": acts.append({"type":"collect","itemId":o["itemId"],"count":1,"questId":q["id"],"objective":i,"label":f"{q['name']}: {o.get('name')}"})
            if o["type"]=="kill" and o.get("rank") in ("elite","boss","rare elite") and o.get("insideDungeon"):
                elites.setdefault(o["npcId"],(o["name"],q["name"]))
    tips=[{"kind":"general","text":x["roleTips"][r],"roles":[r],"dungeons":True,"sources":[{"url":x["levelRangeSource"],"label":f"Wowhead Classic: {x['name']}"}],"verified":False} for r in ROLES]
    for f in d["wowForever"]["notes"]:
        if x["name"].split(" (")[0] in f["finding"]:
            tips.append({"kind":"general","text":"WoW Forever change: "+f["finding"],"dungeons":True,"sources":[{"url":f["source"],"label":"WoW Forever report"+("" if f["official"] else " (unofficial)")}],"verified":False})
    elite=[{"name":nm,"npcId":nid,"groupSize":5,"tips":[{"kind":"elite","text":f"Quest kill for {qn}; it is inside the instance, so bring a full group.","sources":[wh("npc",nid,f"Wowhead Classic: {nm}"),QS],"verified":True}],"sources":[wh("npc",nid,f"Wowhead Classic: {nm}"),QS],"verified":True} for nid,(nm,qn) in elites.items()]
    rr=sorted({r for q in qs for r in routes_of(q)}) or ["balanced"]
    add({"id":run_id,"section":x["name"],"tags":{},"conditions":[],"text":[{"segments":[{"t":f"Run {x['name']} (levels {x['levelRange'][0]}-{x['levelRange'][1]}) and finish the quests you picked up"}]}],
         "actions":acts,"routes":rr,"dungeon":dref,"alternativeTo":[off_id],"tips":tips,"elite":elite,
         "sources":[{"url":x["entranceSource"],"label":"QuestieDB dungeon entrances (GPL-3.0)"},{"url":x["levelRangeSource"],"label":f"Wowhead Classic: {x['name']} level range"}],"verified":True})
    return run_id, off_id

def emit_off(x, run_id, off_id):
    add({"id":off_id,"section":x["name"],"tags":{},"conditions":[],"text":[{"segments":[{"t":f"Dungeons off: {x['dungeonsOffReplacement']}"}]}],"actions":[],
         "dungeonsOff":True,"alternativeTo":[run_id],"routes":["balanced","speedrun"],
         "sources":[{"url":"https://github.com/liviu-stefan-pit/project-forever/blob/vulkan/dungeons/research/dungeons/README.md","label":"Team judgement; open-world quest steps come from the zone research lanes"}],"verified":False})

# done_global tracks in-pack quests already turned in (classic) or accepted when no turn-in exists (Forever)
done_global=set()

for x in (d["dungeons"] if BUILD_CLASSIC else []):
    key=x["id"]; dref={"name":x["name"],"instanceId":x["areaId"],"levels":x["levelRange"]}
    qs=[q for q in x["quests"] if q["category"]!="endgame" and routes(q)]
    lead, prerun, follows = classify(qs, key)
    # World lead-ins: accept + turn in (topo order) before any dungeon pickup.
    for q in iter_ready(lead, done_global, f"{key}:lead-in"):
        emit_accept(x, key, dref, q)
        emit_turnin(x, key, dref, q)
        done_global.add(q["id"])
    # Remaining accepts whose prereqs are already satisfied.
    for q in iter_ready(prerun, done_global, f"{key}:pre-run"):
        emit_accept(x, key, dref, q)
    run_id, off_id = emit_run(x, key, dref, prerun)
    # Turn in the run quests, then follow-up accepts + their turn-ins in topo order.
    for q in prerun:
        emit_turnin(x, key, dref, q)
        done_global.add(q["id"])
    for q in iter_ready(follows, done_global, f"{key}:follow-up"):
        emit_accept(x, key, dref, q)
        emit_turnin(x, key, dref, q)
        done_global.add(q["id"])
    emit_off(x, run_id, off_id)

# ---- Forever-only dungeons (verified:false; ids from content/questie-db where matched) ----
ZUI={"Undercity":1458,"Tirisfal Glades":1420,"Silverpine Forest":1421,"Hillsbrad Foothills":1424,"Orgrimmar":1454,"Wetlands":1437,"Stranglethorn Vale":1434,"Mulgore":1412,"Thunder Bluff":1456,"Dustwallow Marsh":1445,"Un'Goro Crater":1449,"Alterac Mountains":1416,"Ironforge":1455,"Azshara":1447,"Arathi Highlands":1417}
def zui(z, zone_id=None):
    if zone_id is not None and int(zone_id) in UI:
        name = z if isinstance(z,str) and z else None
        return name or z, UI[int(zone_id)]
    for k,v in ZUI.items():
        if z and str(z).startswith(k): return k,v
    return None,None
def giver_obj(q):
    gv=q.get("giver")
    if not gv: return {}
    if isinstance(gv, list): return gv[0] or {}
    return gv
def turn_obj(q):
    t=q.get("turnIn")
    if not t: return {}
    if isinstance(t, list): return t[0] or {}
    if isinstance(t, str): return {"name": t}
    return t
def forever_sources(q):
    out=[]
    for u in q.get("sources") or []:
        if isinstance(u, dict) and str(u.get("url","")).startswith("http"):
            out.append(u)
        elif isinstance(u, str) and u.startswith("http"):
            out.append({"url":u,"label":"WoW Forever fan guide / news"})
        elif u=="content/questie-db" or (isinstance(u,str) and "content/questie-db" in u):
            if QUESTIE_V113 not in out:
                out.append(QUESTIE_V113)
    if q.get("id") and QUESTIE_V113 not in out:
        out.append(QUESTIE_V113)
    return out

def forever_finisher(q):
    """Return the QuestieDB/pack finisher (NPC or object), or None if none was imported."""
    t=turn_obj(q)
    if t.get("id") or t.get("name"):
        return t
    db=QDB.get(str(q.get("id") or "")) or {}
    end=db.get("end") or {}
    if end.get("npc"):
        return {"type":"npc","id":end["npc"][0]}
    if end.get("object"):
        return {"type":"object","id":end["object"][0]}
    return None

def forever_zone_ids(nd):
    ids=set()
    for q in nd.get("quests") or []:
        db=QDB.get(str(q.get("id") or "")) or {}
        if db.get("zoneId") is not None:
            ids.add(int(db["zoneId"]))
    return ids

def _real_world_spawn(zids_spawns, dungeon_zones):
    """True if any spawn is in a non-dungeon zone with real coordinates."""
    for zid, pts in (zids_spawns or {}).items():
        try:
            z=int(zid)
        except (TypeError, ValueError):
            continue
        if z in dungeon_zones:
            continue
        for pt in pts or []:
            if isinstance(pt, (list, tuple)) and len(pt)>=2:
                x,y=pt[0],pt[1]
                if x is not None and y is not None and not (x==-1 and y==-1):
                    return True
    return False

def item_started_inside(q, dungeon_zones):
    """Quest starts from an item whose drop sources are in the dungeon (or have no open-world spawn)."""
    db=QDB.get(str(q.get("id") or "")) or {}
    start=db.get("start") or {}
    item_ids=list(start.get("item") or [])
    if not item_ids and not (start.get("npc") or start.get("object")):
        if db.get("sourceItem"):
            item_ids=[db["sourceItem"]]
    gv=giver_obj(q)
    if gv.get("type")=="item" and gv.get("id") and gv["id"] not in item_ids:
        item_ids.append(gv["id"])
    if not item_ids:
        return False
    saw_source=False
    for iid in item_ids:
        it=ITEMS_DB.get(str(iid)) or {}
        for nid in it.get("npcDrops") or []:
            saw_source=True
            n=NPCS_DB.get(str(nid)) or {}
            spawns=n.get("spawns") or {}
            if _real_world_spawn(spawns, dungeon_zones):
                return False
        for oid in it.get("objectDrops") or []:
            saw_source=True
            o=OBJS_DB.get(str(oid)) or {}
            spawns=o.get("spawns") or {}
            if _real_world_spawn(spawns, dungeon_zones):
                return False
    # Item-started with only dungeon / missing / placeholder spawns (or no sources at all).
    return True

def forever_requires_run(q, nd, dungeon_zones):
    if item_started_inside(q, dungeon_zones):
        return True
    db=QDB.get(str(q.get("id") or "")) or {}
    objs=db.get("objectives") or {}
    if objs.get("creatures") or objs.get("objects") or objs.get("items"):
        # Item/creature objectives in a dungeon quest typically need the run.
        # 95664's only "objective" is the starter item itself; still after the run
        # via item_started_inside. Other collect/kill objectives are done inside
        # or (if clearly outdoor-only) still treated as needing the instance
        # because these records live in the Forever dungeon pack.
        if not item_started_inside(q, dungeon_zones):
            return True
    text=" ".join(
        list(db.get("objectivesText") or []) + [q.get("objectiveSummary") or ""]
    ).lower()
    name=(nd.get("name") or "").lower()
    keys=("inside", "within the", "enter the", "in the dungeon", "inside the instance")
    if name and name in text:
        return True
    if any(k in text for k in keys):
        return True
    tv=forever_finisher(q)
    if tv and tv.get("zoneId") is not None and int(tv["zoneId"]) in dungeon_zones:
        return True
    return False

def classify_forever(qs, nd):
    dungeon_zones=forever_zone_ids(nd)
    pack={q["id"] for q in qs if q.get("id") is not None}
    requires={}
    inside_start={}
    for q in qs:
        qid=q.get("id")
        if qid is None:
            continue
        inside_start[qid]=item_started_inside(q, dungeon_zones)
        requires[qid]=forever_requires_run(q, nd, dungeon_zones) or inside_start[qid]
    followup=set()
    changed=True
    while changed:
        changed=False
        for q in qs:
            qid=q.get("id")
            if qid is None or qid in followup:
                continue
            if inside_start.get(qid):
                followup.add(qid); changed=True; continue
            single, group = pre_of(qid)
            if any((p in pack and (requires.get(p) or p in followup)) for p in group):
                followup.add(qid); changed=True; continue
            in_pack_s=[p for p in single if p in pack]
            if single and in_pack_s and len(in_pack_s)==len(single) and all(requires.get(p) or p in followup for p in in_pack_s):
                followup.add(qid); changed=True
    lead, prerun, follows, unlabeled = [], [], [], []
    for q in qs:
        qid=q.get("id")
        if qid is None:
            unlabeled.append(q)
        elif qid in followup:
            follows.append(q)
        elif not requires.get(qid):
            lead.append(q)
        else:
            prerun.append(q)
    return lead, prerun, follows, unlabeled

def emit_forever_accept(nd, key, dref, tags, q, i=1):
    if q.get("id") is not None and q["id"] in seen_accept:
        return
    gv=giver_obj(q); acts=[]
    zn,mid=zui(gv.get("zone"), gv.get("zoneId"))
    if mid and gv.get("x") is not None:
        acts.append({"type":"goto","at":{"mapId":mid,"x":gv["x"],"y":gv["y"],"zone":zn or gv.get("zone"),"exact":False}})
    if q.get("id"):
        acts.append({"type":"accept","questId":q["id"],"label":q["name"]})
    who=gv.get("name")
    where=gv.get("zone")
    t=f"[Forever] Accept {q['name']}"
    if q.get("id"): t+=f" `{q['id']}`"
    if who: t+=f" from {who}"
    if where: t+=f" ({where})"
    if q.get("objectiveSummary"): t+=f": {q['objectiveSummary']}"
    if q.get("prerequisitesByName"): t+=f". Needs: {', '.join(q['prerequisitesByName'])}"
    sid=f"dungeons:forever:{key}:accept:{q['id']}" if q.get("id") else f"dungeons:forever:{key}:q{i}"
    add({"id":sid,"section":nd["name"],"tags":tags,"conditions":[],"text":[{"segments":[{"t":t}]}],"actions":acts,
         "routes":["balanced"],"dungeon":dref,"sources":forever_sources(q),"verified":False})
    if q.get("id") is not None:
        seen_accept.add(q["id"])

def emit_forever_turnin(nd, key, dref, tags, q):
    fin=forever_finisher(q)
    if not fin or q.get("id") is None:
        return False
    if q["id"] in seen_turnin:
        return True
    acts=[]; tv=fin
    zn,mid=zui(tv.get("zone"), tv.get("zoneId"))
    if mid and tv.get("x") is not None:
        acts.append({"type":"goto","at":{"mapId":mid,"x":tv["x"],"y":tv["y"],"zone":zn or tv.get("zone"),"exact":False}})
    acts.append({"type":"turnin","questId":q["id"],"label":q["name"]})
    who=tv.get("name")
    where=tv.get("zone")
    t=f"[Forever] Turn in {q['name']}"
    t+=f" `{q['id']}`"
    if who: t+=f" to {who}"
    if where: t+=f" ({where})"
    sid=f"dungeons:forever:{key}:turnin:{q['id']}"
    add({"id":sid,"section":nd["name"],"tags":tags,"conditions":[],"text":[{"segments":[{"t":t}]}],"actions":acts,
         "routes":["balanced"],"dungeon":dref,"sources":forever_sources(q),"verified":False})
    seen_turnin.add(q["id"])
    return True

for nd in d["wowForever"]["newDungeons"]:
    key=nd.get("id") or re.sub(r"[^a-z0-9]+","-",nd["name"].lower().replace("'","")).strip("-")
    dref={"name":nd["name"],"levels":nd["levelRange"]}
    rid=f"dungeons:forever:{key}:run"
    tags={"dungeonId":key}
    lead, prerun, follows, unlabeled = classify_forever(nd["quests"], nd)
    # World lead-ins (accept + turn-in when a finisher exists), then remaining accepts.
    for q in iter_ready(lead, done_global, f"forever:{key}:lead-in"):
        emit_forever_accept(nd, key, dref, tags, q)
        if emit_forever_turnin(nd, key, dref, tags, q):
            done_global.add(q["id"])
        elif q.get("id") is not None:
            # No imported finisher: later accepts may depend on this accept alone.
            done_global.add(q["id"])
    for q in unlabeled:
        emit_forever_accept(nd, key, dref, tags, q)
    for q in iter_ready(prerun, done_global, f"forever:{key}:pre-run"):
        emit_forever_accept(nd, key, dref, tags, q)
    e=nd.get("entrance"); acts=[]
    if e:
        zn,mid=zui(e.get("zone"), e.get("zoneId"))
        if mid: acts.append({"type":"goto","at":{"mapId":mid,"x":e["x"],"y":e["y"],"zone":zn or e.get("zone"),"exact":False}})
    add({"id":rid,"section":nd["name"],"tags":tags,"conditions":[],"text":[{"segments":[{"t":f"[Forever] Run {nd['name']} (levels {nd['levelRange'][0]}-{nd['levelRange'][1]}, {nd['location']}). {nd['hordeAccess']}"}]}],
         "actions":acts,"routes":["balanced"],"dungeon":dref,"sources":[{"url":nd["levelRangeSource"],"label":"Blizzard: Explore the New Dungeons of WoW: Forever"}],"verified":False})
    for q in prerun:
        if emit_forever_turnin(nd, key, dref, tags, q):
            done_global.add(q["id"])
        elif q.get("id") is not None:
            done_global.add(q["id"])
    for q in iter_ready(follows, done_global, f"forever:{key}:follow-up"):
        emit_forever_accept(nd, key, dref, tags, q)
        if emit_forever_turnin(nd, key, dref, tags, q):
            done_global.add(q["id"])
        elif q.get("id") is not None:
            done_global.add(q["id"])

doc={"schema":"project-forever/route","version":2,"id":"horde-dungeons-15-60","title":"Horde dungeon quests 13-60 (dungeons toggle)","levels":[13,60],"steps":steps}
STEPS_JSON.write_text(json.dumps(doc,indent=1,ensure_ascii=False)+"\n")
print("total",len(steps))
if ORDER_WARNINGS:
    print("order warnings:",len(ORDER_WARNINGS))
    for w in ORDER_WARNINGS:
        print(" ",w)
