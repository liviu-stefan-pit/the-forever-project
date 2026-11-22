#!/usr/bin/env python3
"""Backfill missing `goto` actions on route-v2 packs from QuestieDB v1.1.3 Forever spawns.

Reads only content/questie-db (GPL-3.0). For every step with no goto it looks for a point in this order:
  accept  -> quest starter NPC / object spawn (item-started quests: spawns of the NPCs/objects that drop the item)
  turnin  -> quest finisher NPC / object spawn
  collect -> item drop sources (npcDrops / objectDrops spawns) of that item
  mob     -> spawns of the listed npcIds
  complete-> objective creatures / objects / item drop sources, only when the quest has a single objective
Candidate spawns must have real coordinates (QuestieDB uses [-1, -1] for instance spawns) and a zone with a
uiMapId. The step's zone is taken from its neighbours: spawns on the map of the previous goto win, then the
next goto's map, then the quest's own zone. Within that map the spawn nearest the neighbouring goto is used
(ties: first in QuestieDB order). Anything else is left empty and listed in report.json with the reason.
Steps without a quest/NPC action (travel notes, hearthstone, flights, class trainers, dungeon-off notes)
are skipped: QuestieDB has no single location for them. Nothing is invented; re-running is idempotent.

Usage: python3 research/gotos/backfill.py [--check]
"""
import json, math, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "research/tools"))
from route_files import iter_packs, write_pack  # noqa: E402
DB = ROOT / "content/questie-db"
Q = json.loads((DB / "quests.json").read_text())
N = json.loads((DB / "npcs.json").read_text())
O = json.loads((DB / "objects.json").read_text())
I = json.loads((DB / "items.json").read_text())
Z = json.loads((DB / "zones.json").read_text())
SRC = {"url": "https://github.com/Questie/QuestieDB/releases/tag/v1.1.3", "label": "QuestieDB v1.1.3 Forever (content/questie-db)"}
EXCLUDED = {79953, 81951}
NAV = {"zone", "fly", "hs", "trainer", "vendor", "train", "note", "fp", "home"}


def spawns(kind, eid):
    db = N if kind == "npc" else O
    e = db.get(str(eid))
    out = []
    if not e:
        return out
    for zid, pts in (e.get("spawns") or {}).items():
        z = Z.get(str(zid)) or {}
        if not z.get("uiMapId"):
            continue
        for x, y in pts:
            if 0 < x <= 100 and 0 < y <= 100:
                out.append({"mapId": z["uiMapId"], "areaName": z.get("name"), "x": x, "y": y, "kind": kind, "id": eid, "name": e.get("name")})
    return out


def item_spawns(iid):
    it = I.get(str(iid)) or {}
    out = []
    for n in it.get("npcDrops") or []:
        out += spawns("npc", n)
    for o in it.get("objectDrops") or []:
        out += spawns("object", o)
    return out


def ends(q, key):
    e = q.get(key) or {}
    out = []
    for n in e.get("npc") or []:
        out += spawns("npc", n)
    for o in e.get("object") or []:
        out += spawns("object", o)
    return out


def objective_spawns(q):
    ob = q.get("objectives") or {}
    targets = [("npc", c["id"]) for c in ob.get("creatures") or []] + [("object", c["id"]) for c in ob.get("objects") or []] + [("item", c["id"]) for c in ob.get("items") or []]
    if len(targets) != 1:
        return None, ("quest has no objective targets in QuestieDB (escort/event/scripted objective)" if not targets else f"quest has {len(targets)} objectives; step does not say which one")
    k, i = targets[0]
    return (item_spawns(i) if k == "item" else spawns(k, i)), None


def candidates(step):
    """Return (list of spawns, reason-if-none, questId)."""
    acts = step["actions"]
    types = [a["type"] for a in acts]
    reasons = []
    qid = next((a.get("questId") for a in acts if a.get("questId")), None)
    if qid in EXCLUDED:
        return [], "excluded quest", qid
    for a in acts:
        t = a["type"]
        q = Q.get(str(a.get("questId"))) if a.get("questId") else None
        if t in ("accept", "turnin"):
            if not q:
                reasons.append(f"quest {a.get('questId')} not in QuestieDB import"); continue
            key = "start" if t == "accept" else "end"
            c = ends(q, key)
            if c:
                return c, None, qid
            se = q.get(key) or {}
            if se.get("item") and not se.get("npc") and not se.get("object"):
                if "dungeon" in step:
                    reasons.append(f"{t} is from an item that drops inside the dungeon (no outdoor map point)"); continue
                c = [x for i in se["item"] for x in item_spawns(i)]
                if c:
                    return c, None, qid
                reasons.append(f"{t} is from an item whose drop source has no coordinates in QuestieDB (instance drop or unlisted source)")
            else:
                ids = [f"{k} {v}" for k in ("npc", "object") for v in se.get(k) or []]
                names = [(N if k == 'npc' else O).get(str(v), {}).get("name", "?") for k in ("npc", "object") for v in se.get(k) or []]
                reasons.append(f"{'starter' if t == 'accept' else 'finisher'} {', '.join(f'{n} ({i})' for n, i in zip(names, ids)) or '(none)'} has no coordinates in QuestieDB (instance or unspawned)")
        elif t == "collect":
            c = item_spawns(a["itemId"])
            if c:
                return c, None, qid
            reasons.append(f"item {a['itemId']} has no NPC/object drop source with coordinates (crafted, vendor or item-contained)")
        elif t == "mob":
            c = [s for n in a.get("npcIds") or [] for s in spawns("npc", n)]
            if c:
                return c, None, qid
            reasons.append("mob has no spawn coordinates")
        elif t == "complete":
            if not q:
                reasons.append(f"quest {a.get('questId')} not in QuestieDB import"); continue
            c, why = objective_spawns(q)
            if c:
                return c, None, qid
            reasons.append(why or "objective has no spawn coordinates")
    if not acts:
        return [], "note step with no actions (no NPC or quest to locate)", qid
    if all(t in NAV for t in types):
        return [], f"navigation step ({'/'.join(types)}) with no QuestieDB location (class/flight/hearth/zone travel)", qid
    return [], "; ".join(dict.fromkeys(reasons)) or f"no locatable action ({'/'.join(types)})", qid


def goto_of(s):
    return next((a["at"] for a in s["actions"] if a["type"] == "goto"), None)


def pick(cands, prev, nxt, qid):
    q = Q.get(str(qid)) or {}
    qmap = (Z.get(str(q.get("zoneId"))) or {}).get("uiMapId")
    for ref in (prev, nxt, {"mapId": qmap} if qmap else None):
        if not ref:
            continue
        inmap = [c for c in cands if c["mapId"] == ref["mapId"]]
        if not inmap:
            continue
        if "x" in ref:
            return min(inmap, key=lambda c: math.hypot(c["x"] - ref["x"], c["y"] - ref["y"]))
        return inmap[0]
    return None


def packs():
    """Joined route packs: single files and segment folders (research/tools/route_files.py)."""
    for path, d in iter_packs(ROOT / "research"):
        yield path, d


def main(check=False):
    report = {"source": SRC, "packs": {}}
    changed = False
    for path, d in packs():
        steps = d["steps"]
        names = {}
        for s in steps:
            g = goto_of(s)
            if g:
                names.setdefault(g["mapId"], g["zone"])
        before = [s["id"] for s in steps if not goto_of(s)]
        filled, left = [], []
        for i, s in enumerate(steps):
            if goto_of(s):
                continue
            prev = next((goto_of(x) for x in reversed(steps[:i]) if goto_of(x)), None)
            nxt = next((goto_of(x) for x in steps[i + 1:] if goto_of(x)), None)
            cands, why, qid = candidates(s)
            c = pick(cands, prev, nxt, qid) if cands else None
            if not c:
                if cands and not why:
                    maps = sorted({names.get(x["mapId"]) or x["areaName"] for x in cands})
                    why = f"QuestieDB spawns only in {', '.join(maps)}; not the step's zone (neighbouring gotos: {prev and prev['zone']} / {nxt and nxt['zone']})"
                left.append({"id": s["id"], "reason": why})
                continue
            at = {"mapId": c["mapId"], "x": c["x"], "y": c["y"], "zone": names.get(c["mapId"]) or c["areaName"], "exact": True}
            s["actions"].insert(0, {"type": "goto", "at": at})
            srcs = s.setdefault("sources", [])
            if not any(x.get("url") == SRC["url"] for x in srcs):
                srcs.append(dict(SRC))
            filled.append({"id": s["id"], "from": f"{c['kind']} {c['id']} {c['name']}", "at": at})
        rel = str(path.relative_to(ROOT))
        report["packs"][d.get("id") or rel] = {"file": rel, "steps": len(steps), "missingBefore": len(before), "filled": len(filled), "missingAfter": len(left), "filledSteps": filled, "unfilled": left}
        if filled:
            changed = True
            if not check:
                write_pack(path, d)
    tot = {k: sum(p[k] for p in report["packs"].values()) for k in ("missingBefore", "filled", "missingAfter")}
    report["total"] = tot
    out = ROOT / "research/gotos/report.json"
    if not check:
        prior = json.loads(out.read_text()) if out.exists() else None
        # keep the first run's before-counts and filled list when re-run (idempotent)
        if prior and tot["filled"] == 0:
            report = prior
        out.write_text(json.dumps(report, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    for k, p in report["packs"].items():
        print(f"{k:24} before {p['missingBefore']:4}  filled {p['filled']:4}  after {p['missingAfter']:4}")
    print("total", report["total"])
    if check and changed:
        print("check: packs would change"); sys.exit(1)


if __name__ == "__main__":
    main(check="--check" in sys.argv)
