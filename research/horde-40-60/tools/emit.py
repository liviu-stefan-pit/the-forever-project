import json, sys
from db import *
import content, tips as T
steps=json.load(open("out/steps.json"))
UI={"Riverglades":2548,"Mount Hyjal":2482}
QS=content.QS
def srcs(lst):
    out=[]
    for s in lst or []:
        if isinstance(s,dict): out.append(s)
        elif "questie" in s.lower(): out.append(QS)
        elif "wowhead.com/classic/quest=" in s: out.append({"url":s,"label":"Wowhead Classic quest "+s.rsplit('=',1)[1]+" (reference link)"})
        else: out.append({"url":s,"label":s.split('/')[2]})
    seen=set(); res=[]
    for s in out:
        if s["url"] not in seen: seen.add(s["url"]); res.append(s)
    return res
ZONE_SPEED={
 "Badlands":"Kargath is a short stop: take the four Kargath quests, clear buzzards and coyotes in one sweep through the middle of the zone, then fly out.",
 "Swamp of Sorrows":"Stonard quests overlap: kill the crocs, whelps and Marsh Inkspewers while you walk the coast for Lack of Surplus. Leave the naga quests for the balanced route unless they are on your path.",
 "Stranglethorn Vale":"Do the Nesingwary final tiers and the Bloodscalp chain from Grom'gol in one loop north, then finish in Booty Bay. Kill raptors and panthers on the way between camps.",
 "Tanaris":"Gadgetzan and Steamwheedle Port have two rounds of quests; do the pirates and Wastewander bandits together because their camps are next to each other.",
 "Feralas":"Camp Mojache's Woodpaw, Gordunni and Zukk'ash quests are clustered east of the camp; do them in one loop before the long ride west.",
 "The Hinterlands":"Revantusk Village quests point at the Vilebranch trolls and the Wildhammer border; collect all of them before the first loop.",
 "Azshara":"Azshara is mostly a quick stop for the Valormok quests and the delivery chain that pays you for flights you are taking anyway.",
 "Un'Goro Crater":"Un'Goro is the best zone of the 50s: pick up all Marshal's Refuge quests, then clear the crater clockwise collecting crystals, eggs and samples on the way.",
 "Felwood":"Felwood's quests run north to south along the road; use Bloodvenom Post as the hub and clean up the corrupted water and Jaedenar quests together.",
 "Winterspring":"Everlook is the hub; the yeti, owl and Winterfall quests are around the hot springs east and south of town.",
 "Western Plaguelands":"The Bulwark's cauldron chain moves you through the fields in a fixed order; follow it and kill everything on the path.",
 "Eastern Plaguelands":"Tirion Fordring and Nathanos Blightcaller give overlapping kill quests in the south of the zone; do them together.",
 "Mount Hyjal":"WoW Forever's Mount Hyjal is worth almost the full 58-60 experience for the Horde. Take every quest a hub offers before moving to the next one.",
 "Riverglades":"WoW Forever's Riverglades is 36-44; finish the last Rog'mar rounds and leave once quests turn green.",
 "Searing Gorge":"Balanced only: Thorium Point quests fit if you want Thorium Brotherhood reputation for crafting.",
 "Silithus":"Balanced only: Cenarion Hold quests are an alternative to Hyjal for the last levels.",
}
FOREVER_SRC=[{"url":"https://www.wowhead.com/forever/news/explore-the-new-dungeons-of-world-of-warcraft-forever-383506","label":"Wowhead: WoW Forever dungeons"}]
MIN={"accept":1,"turnin":1,"kill":8,"collect":8,"complete":6,"travel":4,"dungeon":45,"profession":3,"train":2}
def mapid(z): return UI.get(z) or {v:k for k,v in ZONES.items()}.get(z) and None
AREA={v:k for k,v in ZONES.items()}
import build  # noqa (for UIMAP)
UIMAP=build.UIMAP
import re as _re
VKD=json.load(open("../../dungeons/dungeons.json"))
VK_BY_KEY={}
for _d in VKD["dungeons"]:
    VK_BY_KEY[_d["id"]]=_d
VK_ALIAS={"Uldaman":"uldaman","Zul'Farrak":"zulfarrak","Maraudon":"maraudon","Dire Maul":"dire-maul","Sunken Temple":"sunken-temple",
    "Blackrock Depths":"blackrock-depths","Blackrock Spire":"blackrock-spire","Scholomance":"scholomance","Stratholme":"stratholme"}
VK_NEW={d["name"]:d for d in VKD["wowForever"]["newDungeons"]}
def slug(n): return _re.sub(r"[^a-z0-9]+","-",n.lower().replace("'","")).strip("-")
def vk_lookup(dn):
    if dn in VK_ALIAS:
        d=VK_BY_KEY[VK_ALIAS[dn]]
        return d["id"], {"name":d["name"],"instanceId":d["areaId"],"levels":d["levelRange"]}, "research/dungeons/dungeons.json dungeons[].id"
    if dn in VK_NEW:
        d=VK_NEW[dn]
        return (d.get("id") or slug(d["name"])), {"name":d["name"],"levels":d["levelRange"]}, ("research/dungeons/dungeons.json wowForever.newDungeons[].id" if d.get("id") else "slug of research/dungeons/dungeons.json wowForever.newDungeons[].name (that list has id: null)")
    raise SystemExit("unknown dungeon "+dn)
VK_SRC={"url":"https://github.com/liviu-stefan-pit/project-forever/blob/main/research/dungeons/dungeons.json","label":"Project Forever research: dungeon quests 15-60 (Vulkan)"}
def vk_text(did,name,src):
    return "Run "+name+" (dungeon quests are listed around this step)."
def zone_map(z):
    if z in UI: return UI[z]
    a=AREA.get(z)
    if a is None:
        a=next((k for k,v in P5Z.items() if v.get('name')==z and v.get('uiMapId')), None)
        return P5Z[a]['uiMapId'] if a else None
    return UIMAP.get(a) or UIMAP5.get(a)
out=[]; n=0; first_zone=set(); zone_class_done=set(); fp_done=set()
FPS={"Badlands":[2861],"Swamp of Sorrows":[6026],"Stranglethorn Vale":[1387,2858],"Dustwallow Marsh":[11899],"Tanaris":[7824],"Feralas":[8020],"The Hinterlands":[4314],"Searing Gorge":[3305],"Azshara":[8610],"Un'Goro Crater":[10583],"Felwood":[11900],"Burning Steppes":[13177],"Winterspring":[11139],"Eastern Plaguelands":[12636],"Silithus":[15178]}
CLS={"url":"https://warcraft.wiki.gg/wiki/Class","label":"Warcraft Wiki: Classes"}
def ct(text,classes,roles=None,kind="general"):
    d={"kind":kind,"text":text,"classes":classes,"sources":[CLS],"verified":False}
    if roles: d["roles"]=roles
    return d
ZONE_CLASS={
 "Western Plaguelands":[ct("Most mobs here are undead. Paladins: Exorcism and Holy Wrath hit them hard and Seal of Command procs often. Undead Paladins can Cannibalize on the corpses.",["Paladin"]),
                        ct("Priests can Shackle Undead the extra mob in a pull; Shadow Word: Pain still works on undead.",["Priest"])],
 "Eastern Plaguelands":[ct("Paladins: use Exorcism as an opener on undead and keep Blessing of Wisdom up; Turn Undead removes a second attacker.",["Paladin"]),
                        ct("Mages and warlocks: the ghoul and skeleton packs are slow, so kite them with Frost Nova or Curse of Exhaustion.",["Mage","Warlock"])],
 "Felwood":[ct("Warlocks can Banish an extra demon (satyrs and felguards) and paladins can Exorcism them.",["Warlock","Paladin"]),
            ct("Druids and shamans: Felwood's corruption mobs hit hard; keep a heal over time or Healing Wave ready.",["Druid","Shaman"])],
 "Un'Goro Crater":[ct("Devilsaurs are elite and patrol. Hunters can kite them with Frost Trap and Concussive Shot; everyone else should avoid their path.",["Hunter"]),
                   ct("Rogues: Stealth past the raptor and stegodon packs to the crystal and egg objectives.",["Rogue"])],
 "Mount Hyjal":[ct("Group up for the elite quests; tanks of any class should claim the Doomguard and chimaera pulls.",["Warrior","Paladin","Druid"],["tank"],"elite")],
 "Stranglethorn Vale":[ct("Hunters: Nesingwary's tiger and panther kills are fast with the pet tanking; switch to a cat only if your current pet is lower level.",["Hunter"])],
 "Tanaris":[ct("Mages: Arcane Explosion AoE on the Wastewander bandit camps is the quickest way through both Wastewander Justice quests.",["Mage"],None,"speed")],
}
hooks_by={}
for m,h in content.HOOKS: hooks_by.setdefault((m[1],m[2]),[]).append(h)
# Reuse Sentinel's verified profession hooks (research/professions/profession_hooks.json on sentinel/professions); they replace ours where both exist.
SH={x["hookId"]:x["professionHook"] for x in json.load(open("sentinel_hooks.snapshot.json"))}
SENT_SRC={"url":"https://github.com/liviu-stefan-pit/project-forever/tree/sentinel/professions/research/professions","label":"Project Forever research: professions (Sentinel)"}
def sh(hid):
    h=dict(SH[hid]); h["sources"]=list(h.get("sources",[]))+[SENT_SRC]; return h
REPL={(570,"A"):[sh("hook-16")],(2862,"A"):[sh("hook-18")]}
hooks_by[(570,"A")]=REPL[(570,"A")]
hooks_by[(2862,"A")]=[sh("hook-18")]+[h for h in hooks_by[(2862,"A")] if "Hot Wolf" not in h["note"]]
hooks_by[(1690,"A")]=[sh("hook-25")]+[h for h in hooks_by[(1690,"A")] if h["profession"]!="Cooking"]
hooks_by[(4505,"A")]=[sh("hook-24")]+[h for h in hooks_by[(4505,"A")] if h["profession"]!="Cooking"]
hooks_by[(1430,"A")]=hooks_by.get((1430,"A"),[])+[sh("hook-21")]
hooks_by[(1166,"A")]=[sh("hook-22")]
FOREVER_PROF_TIP={"kind":"profession","text":"WoW Forever profession changes to keep in mind from 40 on: healing potions are now made with First Aid, any node or skin can give rare bonus materials, each corpse can be skinned only once, every profession unlocks a Camp feature at skill 20, and Merchant's Favor (from supply crates handed in at the Horde camp outside the Crossroads) buys around 320 recipes. Crafting items just to sell to vendors no longer pays, so craft for skill or for players.","sources":[SENT_SRC],"verified":False}
def goto(x,y,z):
    mid=zone_map(z)
    if mid is None or x is None: return None
    return {"type":"goto","at":{"mapId":mid,"x":x,"y":y,"zone":z,"exact":True}}
for s in steps:
    n+=1
    routes=["speedrun" if r=="speed" else r for r in s["route"]]
    routes=[r for r in ["balanced","speedrun"] if r in routes]
    st={"id":s["id"],"n":n,"tags":{},"text":[],"actions":[],"conditions":[],"routes":routes}
    FD={"Krol'dok Stronghold","The Drowned City","Alcaz Prison","Blackmaw Hold","Shaper's Terrace","Blackmaw Hold / Shaper's Terrace"}
    if s.get("forever") or s["zone"] in UI or s.get("dungeonName") in FD: st["tags"]["forever"]=True
    st["text"].append({"segments":[{"t":s["title"]}]})
    if s.get("text") and s["text"]!=s["title"]: st["text"].append({"segments":[{"t":s["text"]}]})
    if s.get("notes"): st["text"].append({"segments":[{"t":s["notes"],"kind":"warn"}]})
    if s.get("requires"): st["text"].append({"segments":[{"t":"Needs the earlier quest(s) %s from the 30-40 route."%", ".join(map(str,s["requires"])),"kind":"warn"}]})
    npc=s.get("npc") or {}
    t=s["type"]; qid=s.get("questId")
    if npc.get("coords"):
        g=goto(npc["coords"][0],npc["coords"][1],npc.get("zone") or s["zone"]); 
        if g: st["actions"].append(g)
    elif s.get("coords"):
        g=goto(s["coords"][0],s["coords"][1],s["zone"])
        if g: st["actions"].append(g)
    tg=s.get("targets") or []
    if t in ("kill","collect","complete") and not npc:
        for x in tg:
            c=x.get("coords") or next((d.get("coords") for d in x.get("from",[]) if d.get("coords") and d.get("zone")==s["zone"]),None)
            if c:
                g=goto(c[0],c[1],s.get("objZone") or s["zone"]); 
                if g: st["actions"].append(g); break
    if qid and t=="accept": st["actions"].append({"type":"accept","questId":qid,"label":s["title"].split(": ",1)[1]})
    elif qid and t=="turnin": st["actions"].append({"type":"turnin","questId":qid,"label":s["title"].split(": ",1)[1]})
    elif qid and t in ("kill","collect","complete"):
        for i,x in enumerate(tg):
            if x["kind"]=="collect": st["actions"].append({"type":"collect","itemId":x["itemId"],"count":1,"questId":qid,"objective":i+1,"label":x.get("item") or "item"})
            elif x["kind"] in ("kill","killcredit","use"): st["actions"].append({"type":"complete","questId":qid,"objective":i+1,"label":x.get("name") or "objective"})
        if not tg: st["actions"].append({"type":"complete","questId":qid,"objective":1,"label":s["title"].split(": ",1)[1]})
        for x in tg:
            if x["kind"]=="kill": st["actions"].append({"type":"mob","name":x["name"],"npcIds":[x["id"]]})
    elif s.get("grind"):
        for x in tg: st["actions"].append({"type":"mob","name":x["name"],"npcIds":[x["id"]]})
    elif t=="travel": st["actions"].append({"type":"fly" if s["title"].lower().startswith("fly") else "zone","label":s.get("text") or s["title"]})
    if s.get("classes"): st["classes"]=s["classes"]
    # dungeon
    if s.get("dungeonOnly") or t=="dungeon":
        dn=s.get("dungeonName") or "Dungeon quest"
        did,dref,dsrc=vk_lookup(dn)
        st["dungeon"]=dref
        st["tags"]["dungeonId"]=did; st["tags"]["dungeonIdSource"]=dsrc
        if t=="dungeon":
            st["text"]=[{"segments":[{"t":vk_text(did,dref["name"],dsrc)}]}]
            st["sources"]=list(st.get("sources",[]))+[VK_SRC]
    # tips
    tl=[]
    if t in ("kill","collect","complete","dungeon"):
        base=T.GENERIC["dungeon" if t=="dungeon" else ("collect" if t=="collect" else "kill")]
        for r,txt in base.items():
            tl.append({"kind":"general","text":txt,"roles":[r],"sources":[QS],"verified":False})
    if s["zone"] not in first_zone:
        first_zone.add(s["zone"])
        if s["zone"] in ZONE_SPEED:
            tl.append({"kind":"speed","text":ZONE_SPEED[s["zone"]],"routes":["speedrun"],"sources":[QS] if s["zone"] not in ("Mount Hyjal","Riverglades") else srcs(s.get("sources")) or FOREVER_SRC,"verified":s["zone"] not in ("Mount Hyjal","Riverglades")})
    if s["id"]=="h4060:riverglades:travel-4a6965": tl.append(FOREVER_PROF_TIP)
    # data-derived spawn tip (verified)
    if t in ("kill","collect"):
        for x in tg[:2]:
            cands=[x] if x["kind"]=="kill" else [d for d in x.get("from",[]) if d.get("zone")==s["zone"] and "kind" not in d][:1]
            for c in cands:
                n_=N.get(c.get("id"))
                if n_ and c.get("coords"):
                    lv=f"level {n_[3]}-{n_[4]}" if n_[3]!=n_[4] else f"level {n_[3]}"
                    tl.append({"kind":"speed","text":f"{c['name']} ({lv}) spawns are densest around {c['coords'][0]}, {c['coords'][1]}"+(f" ({x.get('spawnCount')} spawn points)" if x.get('spawnCount') else "")+". Start there and loop outward.","sources":[QS],"verified":True})
    for ct in ZONE_CLASS.get(s["zone"],[]) if s["zone"] not in zone_class_done else []:
        tl.append(ct)
    zone_class_done.add(s["zone"])
    if tl: st["tips"]=tl
    if s.get("eliteTips"):
        el={"name":(next((x["name"] for x in tg if x.get("elite")),None) or s["title"].split(": ",1)[-1]),"groupSize":3,
            "tips":[{"kind":"elite","text":s["eliteTips"],"sources":[QS],"verified":False},
                    {"kind":"elite","text":"Tank: pick the elite up first and turn it away from the group.","roles":["tank"],"sources":[QS],"verified":False},
                    {"kind":"elite","text":"Healer: stay at max range and keep a mana break ready between pulls.","roles":["healer"],"sources":[QS],"verified":False},
                    {"kind":"elite","text":"Damage: wait two or three seconds for threat, then use cooldowns.","roles":["dps"],"sources":[QS],"verified":False}],
            "sources":srcs(s.get("sources")),"verified":bool(s.get("verified"))}
        eid=next((x["id"] for x in tg if x.get("elite") and x.get("id")),None)
        if eid: el["npcId"]=eid
        st["elite"]=[el]
    # hooks
    hk=[]
    if qid:
        for h in hooks_by.get((qid,{"accept":"A","turnin":"T"}.get(t,"C")),[]):
            h=dict(h)
            if "npc" in h:
                h["npc"]=dict(h["npc"]); mid=zone_map(h["npc"]["zone"])
                if mid: h["npc"]["mapId"]=mid
            hk.append(h)
    if hk: st["professionHooks"]=hk
    # pins: mob areas for kill / collect targets
    pins=[]
    zid=AREA.get(s["zone"]); mid=zone_map(s["zone"])
    if zid and mid:
        for x in tg:
            ids=[x["id"]] if x["kind"]=="kill" else [d["id"] for d in x.get("from",[]) if d.get("id") and d.get("zone")==s["zone"] and "kind" not in d]
            for nid in ids[:3]:
                n_=N.get(nid); 
                if not n_: continue
                ma=mobarea(n_[6], zid)
                if ma: pins.append({"kind":"mobArea","npcIds":[nid],"name":n_[0],"mapId":mid,"zone":s["zone"],"center":{"x":ma["x"],"y":ma["y"]},"radius":ma["radius"],"sources":[QS],"verified":True})
    if t in ("travel",) and npc.get("coords") and s.get("forever"):
        pass
    if s["zone"] not in fp_done and zid and mid:
        fp_done.add(s["zone"])
        for fid in FPS.get(s["zone"],[]):
            loc=npc_loc(fid, zid)
            if loc and loc.get("coords") and loc["zoneId"]==zid:
                pins.append({"kind":"npc","npcId":fid,"name":N[fid][0],"at":{"mapId":mid,"zone":s["zone"],"x":loc["coords"][0],"y":loc["coords"][1]},"service":"flightPath","sources":[QS],"verified":True})
    if s["zone"]=="Riverglades" and "Riverglades" not in fp_done:
        fp_done.add("Riverglades")
    if pins: st["pins"]=pins
    st["minutes"]=s.get("minutesEst") or MIN.get(t,2)
    st["sources"]=srcs(s.get("sources")) or [QS]
    st["verified"]=bool(s.get("verified"))
    if s.get("forever") and (s.get("questId") or s.get("grind")):
        def _uv(o):
            if isinstance(o,dict):
                if "verified" in o: o["verified"]=False
                for v in o.values(): _uv(v)
            elif isinstance(o,list):
                for v in o: _uv(v)
        _uv(st)
    out.append(st)
    # dungeons-off alternative
    if t=="dungeon":
        n+=1
        alt={"id":s["id"]+":off","n":n,"tags":{},"text":[{"segments":[{"t":"Dungeons off: skip %s"%(s.get("dungeonName") or "the dungeon")}]},
              {"segments":[{"t":"Stay on the open-world line. If you fall behind the level shown for the next zone, do this zone's balanced-only quests or grind the last quest area for 10-15 minutes before moving on."}]}],
             "actions":[],"conditions":[],"routes":routes,"dungeonsOff":True,"alternativeTo":[s["id"]],"minutes":10,"sources":[QS],"verified":False}
        st["alternativeTo"]=[alt["id"]]
        out.append(alt)
pack={"schema":"project-forever/route","version":2,"id":"horde-40-60","title":"Horde 40-60 (Orion research): Balanced and Speedrun","levels":[40,60],
      "steps":out,"classProfessions":content.CLASS_PROF,"tipsMatrix":content.TIPS}
json.dump(pack, open("out/horde-40-60.route.json","w"), indent=1, ensure_ascii=False)
print(len(out))
