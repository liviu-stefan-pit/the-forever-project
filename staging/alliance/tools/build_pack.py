"""Alliance route plan → route-v2 segment folder, with checks and an XP walk.

    python3 -I staging/alliance/tools/build_pack.py staging/alliance/plans/elwynn-1-12.json
    python3 -I staging/alliance/tools/build_pack.py --all          # every plan, in chain order
    python3 -I staging/alliance/tools/build_pack.py --check PLAN    # checks and XP walk only, no files

A plan is the authored order; the builder fills in names, coordinates, objective indexes, filters, pins and
sources from content/questie-db-alliance. Output goes to staging/alliance/routes/alliance-1-20/<pack>/ in the
layout docs/ROUTE_FILES.md describes. The plan format is documented in staging/alliance/README.md.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import adb  # noqa: E402

BASE = Path(__file__).resolve().parents[1]
PLANS = BASE / "plans"
OUT = BASE / "routes" / "alliance-1-20"
ROUTES = ("balanced", "speedrun")

QDB_SRC = {"url": "https://github.com/Questie/QuestieDB/blob/master/data/Forever/foreverQuestDB.lua",
           "label": "QuestieDB Forever data (GPL-3.0), via content/questie-db-alliance"}


class PlanError(Exception):
    pass


# ---------------------------------------------------------------------------------------------
# geometry helpers
# ---------------------------------------------------------------------------------------------

def nearest(points: list[tuple[int, float, float]], prev: tuple[int, float, float] | None,
            prefer_maps: list[int]) -> tuple[int, float, float] | None:
    if not points:
        return None
    if prev:
        same = [p for p in points if p[0] == prev[0]]
        if same:
            return min(same, key=lambda p: (p[1] - prev[1]) ** 2 + (p[2] - prev[2]) ** 2)
    for m in prefer_maps:
        on = [p for p in points if p[0] == m]
        if on:
            return on[0]
    return points[0]


def cluster(points: list[tuple[int, float, float]], prev, prefer_maps: list[int], r: float = 7.0):
    """Densest group of spawn points (ties → nearest to prev). Returns (map, x, y, radius, n)."""
    if not points:
        return None
    maps = [m for m in ([prev[0]] if prev else []) + prefer_maps if any(p[0] == m for p in points)]
    m = maps[0] if maps else points[0][0]
    pts = [p for p in points if p[0] == m]
    best = None
    for c in pts:
        group = [p for p in pts if (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2 <= r * r]
        dist = 0.0 if not prev or prev[0] != m else math.hypot(c[1] - prev[1], c[2] - prev[2])
        # density first; within ~25% of the best density prefer the closer camp
        key = (len(group), -dist)
        if best is None or len(group) > best[0][0] * 1.25 or (len(group) >= best[0][0] * 0.8 and dist < best[2]):
            best = (key, group, dist)
    group = best[1]
    cx = sum(p[1] for p in group) / len(group)
    cy = sum(p[2] for p in group) / len(group)
    rad = max(2.0, max(math.hypot(p[1] - cx, p[2] - cy) for p in group))
    return (m, round(cx, 1), round(cy, 1), round(min(rad, 12.0), 1), len(group))


def at(m: int, x: float, y: float) -> dict:
    return {"mapId": m, "x": round(x, 1), "y": round(y, 1), "zone": adb.zone_name_for_map(m), "exact": True}


# ---------------------------------------------------------------------------------------------
# plan parsing
# ---------------------------------------------------------------------------------------------

_ROUTE_ALIASES = {"b": ["balanced"], "s": ["speedrun"], "bs": list(ROUTES), "both": list(ROUTES)}


def norm_routes(v) -> list[str]:
    if v is None:
        return list(ROUTES)
    if isinstance(v, str):
        if v not in _ROUTE_ALIASES:
            raise PlanError(f"unknown routes value {v!r} (use b, s or both)")
        return _ROUTE_ALIASES[v]
    return list(v)


def parse_entry(entry) -> dict:
    """String shorthand or object → {'do': str, ...options}."""
    if isinstance(entry, str):
        e = {"do": entry}
    elif isinstance(entry, dict) and "do" in entry:
        e = dict(entry)
    else:
        raise PlanError(f"bad step entry: {entry!r}")
    s = e["do"].strip()
    # trailing route marker:  "A 123 @b"
    m = re.search(r"\s@(b|s|bs)$", s)
    if m:
        e.setdefault("routes", m.group(1))
        s = s[: m.start()].strip()
    e["do"] = s
    return e


_ACT_RE = re.compile(r"^(A|T|C)\s+(\d+)(?:\.(\d+(?:,\d+)*))?$")


def parse_actions(s: str) -> list[tuple]:
    """'T 783; A 7; C 33.1,2' → [('turnin',783,None), ('accept',7,None), ('complete',33,[1,2])]."""
    out = []
    for part in [p.strip() for p in s.split(";") if p.strip()]:
        m = _ACT_RE.match(part)
        if not m:
            return []
        kind = {"A": "accept", "T": "turnin", "C": "complete"}[m.group(1)]
        objs = [int(x) for x in m.group(3).split(",")] if m.group(3) else None
        out.append((kind, int(m.group(2)), objs))
    return out


# ---------------------------------------------------------------------------------------------
# builder
# ---------------------------------------------------------------------------------------------

class Builder:
    def __init__(self, plan: dict, plan_path: Path):
        self.plan = plan
        self.path = plan_path
        self.pack = plan["id"]
        self.maps = plan.get("maps") or []
        self.races = plan.get("races") or list(adb.ALLIANCE_RACES)
        self.prev = None
        self.ids: dict[str, int] = {}
        self.errors: list[str] = []

    # ---- ids / sources ----
    def step_id(self, base: str) -> str:
        sid = f"{self.pack}:{base}"
        if sid in self.ids:
            self.ids[sid] += 1
            sid = f"{sid}-{self.ids[sid]}"
        else:
            self.ids[sid] = 1
        return sid

    def quest_sources(self, qid: int) -> list[dict]:
        q = adb.quest(qid)
        if q.get("forever"):
            return [{"url": f"https://www.wowhead.com/forever/quest={qid}", "label": f"Wowhead Forever quest {qid}"}, QDB_SRC]
        return [{"url": f"https://www.wowhead.com/classic/quest={qid}", "label": f"Wowhead Classic quest {qid}"}, QDB_SRC]

    def npc_sources(self, nid: int) -> list[dict]:
        return [{"url": f"https://www.wowhead.com/classic/npc={nid}", "label": f"Wowhead NPC {nid}"},
                {"url": "https://github.com/Questie/QuestieDB/blob/master/data/Forever/foreverNpcDB.lua",
                 "label": "QuestieDB Forever NPC data (GPL-3.0)"}]

    # ---- locations ----
    def giver_point(self, q: dict, key: str):
        e = q.get(key) or {}
        for kind in ("npc", "object"):
            for eid in e.get(kind) or []:
                p = nearest(adb.spawns_of(kind, eid), self.prev, self.maps)
                if p:
                    return p, kind, eid
        for iid in e.get("item") or []:
            item = adb.db()["items"].get(iid) or {}
            pts = [p for n in item.get("npcDrops") or [] for p in adb.spawns_of("npc", n)]
            pts += [p for o in item.get("objectDrops") or [] for p in adb.spawns_of("object", o)]
            c = cluster(pts, self.prev, self.maps)
            if c:
                return (c[0], c[1], c[2]), "item", iid
            return None, "item", iid
        return None, None, None

    def objective_area(self, qid: int, objs: list[int] | None):
        os_ = adb.objectives(qid)
        chosen = [o for i, o in enumerate(os_, 1) if objs is None or i in objs]
        pts, npc_ids = [], []
        for o in chosen:
            for kind, eid in o["src"]:
                pts += adb.spawns_of(kind, eid)
                if kind == "npc":
                    npc_ids.append(eid)
        return cluster(pts, self.prev, self.maps), npc_ids, chosen

    # ---- filters ----
    def filter_for(self, qids: list[int], e: dict) -> tuple[dict | None, list[str] | None]:
        races = e.get("races")
        classes = e.get("classes")
        for qid in qids:
            q = adb.quest(qid)
            rm = q.get("races") or 0
            if rm and races is None:
                allowed = [r for r in self.races if rm & adb.ALLIANCE_RACES[r]]
                if not allowed:
                    self.errors.append(f"quest {qid} {q.get('name')!r}: no race of this pack ({self.races}) can take it")
                elif len(allowed) < len(self.races):
                    races = allowed
            cm = q.get("classes") or 0
            if cm and classes is None:
                classes = adb.class_names(cm)
        flt = {"any": [[{"race": r}] for r in races]} if races and len(races) < len(self.races) else None
        return flt, classes

    # ---- one step ----
    def build_step(self, raw, seg_routes) -> dict | None:
        e = parse_entry(raw)
        routes = norm_routes(e.get("routes", seg_routes))
        s = e["do"]
        acts = parse_actions(s)
        step: dict = {"tags": {}, "text": [], "actions": [], "conditions": [], "routes": routes}
        tips = []
        pins = []
        sources: list[dict] = []
        qids: list[int] = []
        pos = None
        override = None
        if "at" in e:
            m = e.get("map") or (self.prev[0] if self.prev else self.maps[0])
            override = (m, float(e["at"][0]), float(e["at"][1]))

        if acts:
            phrases = []
            for kind, qid, objs in acts:
                try:
                    q = adb.quest(qid)
                except KeyError as ex:
                    self.errors.append(str(ex))
                    return None
                qids.append(qid)
                name = q.get("name") or f"Quest {qid}"
                if kind in ("accept", "turnin"):
                    p, gkind, gid = self.giver_point(q, "start" if kind == "accept" else "end")
                    if pos is None:
                        pos = p
                    if gkind == "item" and kind == "accept":
                        phrases.append(f"Loot {adb.name_of('item', gid)} and accept {name}")
                    elif gid is not None:
                        who = adb.name_of(gkind, gid)
                        phrases.append(f"{'Accept' if kind == 'accept' else 'Turn in'} {name} "
                                       f"{'from' if kind == 'accept' else 'to'} {who}" if gkind == "npc"
                                       else f"{'Accept' if kind == 'accept' else 'Turn in'} {name} at the {who}")
                    else:
                        phrases.append(f"{'Accept' if kind == 'accept' else 'Turn in'} {name}")
                        if not override:
                            self.errors.append(f"{kind} {qid} {name!r}: no giver location; add \"at\"")
                    step["actions"].append({"type": kind, "questId": qid, "label": name})
                else:
                    area, npc_ids, chosen = self.objective_area(qid, objs)
                    if area and pos is None:
                        pos = (area[0], area[1], area[2])
                    allo = adb.objectives(qid)
                    if not allo:
                        self.errors.append(f"complete {qid} {name!r}: quest has no objectives in the DB")
                    idxs = objs or list(range(1, len(allo) + 1))
                    for i in idxs:
                        if i > len(allo):
                            self.errors.append(f"complete {qid}: objective {i} does not exist ({len(allo)} objectives)")
                        step["actions"].append({"type": "complete", "questId": qid, "objective": i, "label": name})
                    what = ", ".join(f"{o['count']} {o['name']}" if o['count'] > 1 else o['name'] for o in chosen)
                    phrases.append(f"Complete {name}" + (f": {what}" if what else ""))
                    if area and npc_ids and not e.get("noPin"):
                        uniq = list(dict.fromkeys(npc_ids))[:6]
                        pins.append({"kind": "mobArea", "npcIds": uniq, "name": adb.name_of("npc", uniq[0]),
                                     "mapId": area[0], "zone": adb.zone_name_for_map(area[0]),
                                     "center": {"x": area[1], "y": area[2]}, "radius": area[3],
                                     "sources": self.npc_sources(uniq[0]), "verified": not adb.quest(qid).get("forever")})
                    elif not area and not override:
                        self.errors.append(f"complete {qid} {name!r}: no objective spawns; add \"at\"")
                for src in self.quest_sources(qid):
                    if src not in sources:
                        sources.append(src)
            text = e.get("text") or "; ".join(phrases)
            first = acts[0]
            step["id"] = self.step_id(e.get("id") or f"{first[0]}-{first[1]}")
            if any(adb.quest(q).get("forever") for q in qids):
                step["tags"]["label"] = "New in Forever"
        else:
            kw, _, rest = s.partition(" ")
            rest = rest.strip()
            text = e.get("text")
            if kw in ("home", "fp", "fly", "vendor", "npc"):
                nid = int(rest.split()[0])
                p = nearest(adb.spawns_of("npc", nid), self.prev, self.maps)
                pos = p
                who = adb.name_of("npc", nid)
                dest = rest.split(" ", 1)[1] if " " in rest else ""
                default = {"home": f"Set your hearthstone at {who}", "fp": f"Get the flight path from {who}",
                           "fly": f"Fly to {dest}" if dest else f"Take a flight from {who}",
                           "vendor": f"Visit {who}", "npc": f"Talk to {who}"}[kw]
                text = text or default
                atype = {"npc": "vendor"}.get(kw, kw)
                if kw != "npc":
                    step["actions"].append({"type": atype, "label": text})
                sources = self.npc_sources(nid)
                pmap = p[0] if p else self.maps[0]
                pins.append({"kind": "npc", "npcId": nid, "name": who,
                             "at": {"mapId": pmap, "zone": adb.zone_name_for_map(pmap),
                                    "x": round(p[1], 1) if p else 0, "y": round(p[2], 1) if p else 0},
                             **({"service": {"home": "innkeeper", "fp": "flightPath", "fly": "flightPath",
                                             "vendor": "vendor"}[kw]} if kw in ("home", "fp", "fly", "vendor") else {}),
                             "sources": self.npc_sources(nid), "verified": True})
                if not p:
                    self.errors.append(f"{kw} {nid}: NPC has no spawn")
                step["id"] = self.step_id(e.get("id") or f"{kw}-{nid}")
            elif kw == "trainer":
                text = text or "Visit your class trainer"
                step["actions"].append({"type": "trainer", "label": text})
                sources = [QDB_SRC]
                step["id"] = self.step_id(e.get("id") or "trainer")
                if rest:
                    nid = int(rest)
                    pos = nearest(adb.spawns_of("npc", nid), self.prev, self.maps)
            elif kw == "hs":
                text = text or (f"Hearth to {rest}" if rest else "Use your hearthstone")
                step["actions"].append({"type": "hs", "label": text})
                sources = [QDB_SRC]
                step["id"] = self.step_id(e.get("id") or "hs")
            elif kw == "xp":
                parts = rest.split()
                lvl = int(parts[0])
                mob = int(parts[1]) if len(parts) > 1 else None
                extra = int(parts[2]) if len(parts) > 2 else None
                act = {"type": "xp", "level": lvl, "label": text or f"Grind to level {lvl}"}
                if extra:
                    act["extra"] = extra
                if mob:
                    act.update({"mobId": mob, "mobName": adb.name_of("npc", mob), "mobLevel": adb.mob_level(mob)})
                    c = cluster(adb.spawns_of("npc", mob), self.prev, self.maps)
                    if c:
                        pos = (c[0], c[1], c[2])
                        pins.append({"kind": "mobArea", "npcIds": [mob], "name": adb.name_of("npc", mob),
                                     "mapId": c[0], "zone": adb.zone_name_for_map(c[0]),
                                     "center": {"x": c[1], "y": c[2]}, "radius": c[3],
                                     "sources": self.npc_sources(mob), "verified": True})
                    sources = self.npc_sources(mob)
                else:
                    sources = [QDB_SRC]
                text = act["label"]
                step["actions"].append(act)
                step["id"] = self.step_id(e.get("id") or f"grind-{lvl}")
            elif kw == "goto":
                if not override:
                    self.errors.append(f"goto without \"at\": {raw!r}")
                if not text:
                    self.errors.append(f"goto without \"text\": {raw!r}")
                sources = e.get("sources") or [QDB_SRC]
                step["id"] = self.step_id(e.get("id") or f"goto-{len(self.ids)}")
            else:
                raise PlanError(f"{self.path.name}: cannot parse step {raw!r}")
        if override:
            pos = override
        if pos:
            step["actions"].insert(0, {"type": "goto", "at": at(*pos)})
            self.prev = pos
        step["text"] = [{"segments": [{"t": text}]}]
        flt, classes = self.filter_for(qids, e)
        if flt:
            step["filter"] = flt
        if classes:
            step["classes"] = classes
        if e.get("races") and not flt:
            step["filter"] = {"any": [[{"race": r}] for r in e["races"]]}
        step["sources"] = sources or [QDB_SRC]
        step["verified"] = not any(adb.quest(q).get("forever") for q in qids) and not e.get("unverified", False)
        if e.get("optional"):
            step["tags"]["optional"] = True
        if e.get("dungeon"):
            step["dungeon"] = e["dungeon"]
            step["tags"]["dungeonPart"] = e.get("dungeonPart", "run")
        if e.get("dungeonsOff"):
            step["dungeonsOff"] = True
        if e.get("minutes"):
            step["minutes"] = e["minutes"]
        for kind, key in (("general", "tip"), ("speed", "speed"), ("elite", "elite"), ("profession", "prof")):
            vals = e.get(key)
            if not vals:
                continue
            for t in ([vals] if isinstance(vals, str) else vals):
                tip = {"kind": kind, "text": t}
                if kind == "speed":
                    tip["routes"] = ["speedrun"]
                tip["sources"] = e.get("tipSources") or step["sources"]
                tip["verified"] = bool(e.get("tipVerified", False))
                tips.append(tip)
        if tips:
            step["tips"] = tips
        if pins:
            step["pins"] = pins
        # stable key order like the hand-made packs
        order = ["id", "tags", "text", "actions", "conditions", "routes", "dungeon", "dungeonsOff", "classes",
                 "filter", "minutes", "sources", "verified", "tips", "pins"]
        return {k: step[k] for k in order if k in step}

    def build(self) -> tuple[dict, list[tuple[str, dict]]]:
        segs = []
        for seg in self.plan["segments"]:
            steps = []
            for raw in seg["steps"]:
                st = self.build_step(raw, seg.get("routes"))
                if st:
                    steps.append(st)
            segs.append((seg["file"], {"schema": "project-forever/route-segment", "pack": self.pack,
                                       "title": seg["title"], "steps": steps}))
        manifest = {"schema": "project-forever/route-manifest", "version": 2, "id": self.pack,
                    "title": self.plan["title"], "levels": self.plan["levels"]}
        if self.plan.get("next"):
            manifest["next"] = self.plan["next"]
        if self.plan.get("nextByRoute"):
            manifest["nextByRoute"] = self.plan["nextByRoute"]
        manifest["segments"] = [f for f, _ in segs]
        return manifest, segs


# ---------------------------------------------------------------------------------------------
# checks + XP walk
# ---------------------------------------------------------------------------------------------

def step_visible(st: dict, route: str, race: str, cls: str | None, dungeons: bool) -> bool:
    if route not in st.get("routes", ROUTES):
        return False
    if st.get("dungeon") and not dungeons:
        return False
    if st.get("dungeonsOff") and dungeons:
        return False
    flt = st.get("filter")
    if flt:
        ok = False
        for alt in flt["any"]:
            good = True
            for c in alt:
                hit = (c.get("race") is None or c["race"] == race) and (c.get("cls") is None or c["cls"] == cls)
                if c.get("not"):
                    hit = not hit
                good = good and hit
            ok = ok or good
        if not ok:
            return False
    if st.get("classes") and cls not in st["classes"]:
        return False
    return True


def kill_estimate(qid: int, objective: int, plevel: int) -> int:
    os_ = adb.objectives(qid)
    if objective > len(os_):
        return 0
    o = os_[objective - 1]
    npcs = [eid for kind, eid in o["src"] if kind == "npc"]
    if not npcs:
        return 0
    kills = o["count"] if o["kind"] == "kill" else math.ceil(o["count"] * 1.6)
    lvl = adb.mob_level(npcs[0])
    elite = (adb.db()["npcs"].get(npcs[0]) or {}).get("rank") in (1, 2, 3)
    return kills * adb.mob_xp(plevel, lvl, elite)


completed_before: set[int] = set()  # quests whose objectives were done in an earlier pack


def walk(steps: list[dict], route: str, race: str, cls: str | None, enter: tuple[int, int],
         done_before: set[int], dungeons: bool = False, log_before: set[int] | None = None,
         carry: set[int] | None = None):
    """Returns (issues, exit (level, xp), done set, per-step levels, open log)."""
    level, xp = enter
    issues: list[str] = []
    log: set[int] = set(log_before or ())
    completed: set[int] = set(q for q in (log_before or ()) if q in completed_before)
    done = set(done_before)
    levels = {}
    max_log = 0

    def gain(amount: int):
        nonlocal level, xp
        xp += amount
        while level < 60 and xp >= adb.xp_to_next(level):
            xp -= adb.xp_to_next(level)
            level += 1

    for st in steps:
        if not step_visible(st, route, race, cls, dungeons):
            continue
        for a in st["actions"]:
            t = a["type"]
            qid = a.get("questId")
            if t == "accept":
                q = adb.quest(qid)
                if qid in done or qid in log:
                    issues.append(f"{st['id']}: accept {qid} again (already {'done' if qid in done else 'in log'})")
                if (q.get("reqLevel") or 0) > level:
                    issues.append(f"{st['id']}: accept {qid} {q['name']!r} needs level {q['reqLevel']}, you are {level}")
                pre = q.get("pre") or {}
                if pre.get("single") and not (set(pre["single"]) & done):
                    issues.append(f"{st['id']}: accept {qid} {q['name']!r} needs one of {pre['single']} turned in first")
                if pre.get("group") and not set(pre["group"]) <= done:
                    issues.append(f"{st['id']}: accept {qid} {q['name']!r} needs all of {pre['group']} turned in first "
                                  f"(missing {sorted(set(pre['group']) - done)})")
                for ex in q.get("exclusiveTo") or []:
                    if ex in log or ex in done:
                        issues.append(f"{st['id']}: {qid} is exclusive with {ex}")
                log.add(qid)
                max_log = max(max_log, len(log))
            elif t == "complete":
                if qid not in log:
                    issues.append(f"{st['id']}: complete {qid} but it is not in the quest log")
                completed.add(qid)
                gain(kill_estimate(qid, a.get("objective", 1), level))
            elif t == "turnin":
                q = adb.quest(qid)
                if qid not in log:
                    issues.append(f"{st['id']}: turn in {qid} {q.get('name')!r} but it is not in the quest log")
                if adb.objectives(qid) and qid not in completed:
                    issues.append(f"{st['id']}: turn in {qid} {q.get('name')!r} with no complete step before it")
                log.discard(qid)
                done.add(qid)
                gain(adb.quest_xp_for_player(q.get("xp") or 0, q.get("level") or level, level))
            elif t == "xp":
                target = a["level"]
                if level < target:
                    xp_needed = sum(adb.xp_to_next(l) for l in range(level, target)) - xp
                    gain(max(0, xp_needed) + (a.get("extra") or 0))
                else:
                    gain(a.get("extra") or 0)
        levels[st["id"]] = (level, xp)
    if max_log > 20:
        issues.append(f"quest log peaks at {max_log} quests (limit 20)")
    stray = sorted(log - set(carry or ()))
    if stray:
        issues.append(f"left in the log at the end (add to \"carry\" if the next pack turns them in): {stray}")
    for qid in log:
        completed_before.add(qid) if qid in completed else None
    return issues, (level, xp), done, levels, log


# ---------------------------------------------------------------------------------------------
# driver
# ---------------------------------------------------------------------------------------------

def load_plan(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def all_plans() -> dict[str, tuple[Path, dict]]:
    out = {}
    for p in sorted(PLANS.glob("*.json")):
        d = load_plan(p)
        out[d["id"]] = (p, d)
    return out


def context_done(plan: dict, plans: dict, race: str, route: str, cls: str | None):
    """Quests turned in, open log and (level, xp) after the packs listed in plan['after'][race or '*']."""
    after = plan.get("after") or {}
    chain = after.get(race, after.get("*", []))
    done: set[int] = set()
    log: set[int] = set()
    completed_before.clear()
    lvl = (plan.get("enterLevel") or plan["levels"][0], 0)
    missing = [pid for pid in chain if pid not in plans]
    if missing:
        print(f"   note: {race}: chain incomplete (no plan yet for {', '.join(missing)}); walking from enterLevel")
        return done, lvl, log
    first = True
    for pid in chain:
        if pid not in plans:
            continue
        p, d = plans[pid]
        b = Builder(d, p)
        _, segs = b.build()
        steps = [s for _, sd in segs for s in sd["steps"]]
        start = (d.get("enterLevel") or d["levels"][0], 0) if first else lvl
        _, lvl, done, _, log = walk(steps, route, race, cls, start, done, log_before=log,
                                    carry=set(d.get("carry") or ()))
        first = False
    if not chain:
        lvl = (plan.get("enterLevel") or plan["levels"][0], 0)
    return done, lvl, log


def write_pack(manifest: dict, segs) -> Path:
    d = OUT / manifest["id"]
    if d.exists():
        for f in d.glob("*.json"):
            f.unlink()
    d.mkdir(parents=True, exist_ok=True)
    (d / "pack.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    for fname, doc in segs:
        (d / fname).write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    return d


def run(path: Path, plans: dict, write: bool, verbose: bool, classes: list[str]) -> int:
    plan = load_plan(path)
    b = Builder(plan, path)
    manifest, segs = b.build()
    steps = [s for _, sd in segs for s in sd["steps"]]
    problems = list(b.errors)
    report = [f"== {plan['id']}: {len(steps)} steps in {len(segs)} segments"]
    for race in b.races:
        for route in ROUTES:
            for cls in classes:
                done, enter, log0 = context_done(plan, plans, race, route, cls)
                if plan.get("enterLevel") and not (plan.get("after") or {}):
                    enter = (plan["enterLevel"], 0)
                issues, exit_, _, levels, _ = walk(steps, route, race, cls, enter, done, log_before=log0,
                                                   carry=set(plan.get("carry") or ()))
                n = sum(1 for s in steps if step_visible(s, route, race, cls, False))
                pct = exit_[1] / max(1, adb.xp_to_next(exit_[0])) * 100
                report.append(f"   {race:9s} {route:9s} {cls or '-':8s} {n:4d} steps  enter L{enter[0]} -> exit L{exit_[0]} +{pct:.0f}%")
                for i in issues:
                    problems.append(f"[{race}/{route}/{cls or '-'}] {i}")
                if verbose and route == "balanced" and cls == classes[0]:
                    for sid, (lv, x) in levels.items():
                        report.append(f"      {sid:50s} L{lv} {x}")
    print("\n".join(report))
    uniq = list(dict.fromkeys(problems))
    if uniq:
        print(f"   {len(uniq)} problem(s):")
        for p in uniq:
            print("   -", p)
    if write:
        d = write_pack(manifest, segs)
        print("   wrote", d.relative_to(adb.ROOT))
    return 1 if b.errors else 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("plans", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--check", action="store_true", help="checks and XP walk only, write nothing")
    ap.add_argument("--verbose", "-v", action="store_true", help="print the level after every balanced step")
    ap.add_argument("--classes", default="", help="comma list of classes to walk (default: classless walk)")
    args = ap.parse_args(argv)
    plans = all_plans()
    paths = [p for p, _ in plans.values()] if args.all else [Path(p) for p in args.plans]
    classes = [c for c in args.classes.split(",") if c] or [None]
    rc = 0
    for p in paths:
        rc |= run(p, plans, not args.check, args.verbose, classes)
    return rc


if __name__ == "__main__":
    sys.exit(main())
