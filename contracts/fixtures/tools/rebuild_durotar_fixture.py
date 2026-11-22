"""Rebuild the coordinates and step ids of the Durotar 1-6 test fixture from content/questie-db only.

    python -I contracts/fixtures/tools/rebuild_durotar_fixture.py

The fixture text is our own wording; its quest ids are public. This script replaces every map point with a
QuestieDB spawn (quest giver / turn-in NPC, step target NPC, objective mob/object), renumbers step ids
(`1-6-durotar:NN`), rebuilds section routes and stops from those points, and rewrites the step-id references
in quests.json and insights.json. Idempotent. See docs/PROVENANCE.md.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
FIX = ROOT / "contracts" / "fixtures"
QDB = ROOT / "content" / "questie-db"
ZONE_AREA = {1411: "14", 1454: "1637"}  # uiMapId -> QuestieDB areaId
ZONE_NAME = {1411: "Durotar", 1454: "Orgrimmar"}


def load(p: Path):
    return json.loads(p.read_text(encoding="utf-8"))


def dump(p: Path, v) -> None:
    p.write_text(json.dumps(v, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")


npcs, objects, quests = load(QDB / "npcs.json"), load(QDB / "objects.json"), load(QDB / "quests.json")


def spawn_point(ent: dict | None, map_id: int) -> tuple[float, float] | None:
    """Medoid of the entity's spawns in that zone (a real spawn point, closest to the spawn mean)."""
    pts = [(x, y) for x, y in ((ent or {}).get("spawns") or {}).get(ZONE_AREA[map_id], []) if x >= 0 and y >= 0]
    if not pts:
        return None
    mx, my = sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
    return min(pts, key=lambda p: (p[0] - mx) ** 2 + (p[1] - my) ** 2)


def spread_points(ent: dict | None, map_id: int, n: int) -> list[tuple[float, float]]:
    """n real spawn points spread over the mob's area (farthest-point sampling from the medoid), in angle order."""
    pts = sorted({(x, y) for x, y in ((ent or {}).get("spawns") or {}).get(ZONE_AREA[map_id], []) if x >= 0 and y >= 0})
    start = spawn_point(ent, map_id)
    if not pts or not start:
        return []
    chosen = [start]
    while len(chosen) < min(n, len(pts)):
        chosen.append(max(pts, key=lambda p: min((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 for c in chosen)))
    import math
    cx, cy = sum(p[0] for p in chosen) / len(chosen), sum(p[1] for p in chosen) / len(chosen)
    return sorted(chosen, key=lambda p: math.atan2(p[1] - cy, p[0] - cx))


def anchors(step: dict, prev_fp: list[int]) -> list[tuple[str, int]]:
    out: list[tuple[str, int]] = []
    for a in step["actions"]:
        t = a["type"]
        q = quests.get(str(a.get("questId"))) if a.get("questId") else None
        if t in ("target", "mob", "unitscan"):
            out += [("npc", i) for i in a.get("npcIds", [])]
        elif t == "accept" and q:
            out += [("npc", i) for i in (q.get("start") or {}).get("npc", [])] + [("object", i) for i in (q.get("start") or {}).get("object", [])]
        elif t == "turnin" and q:
            out += [("npc", i) for i in (q.get("end") or {}).get("npc", [])] + [("object", i) for i in (q.get("end") or {}).get("object", [])]
        elif t == "complete" and q:
            ob = q.get("objectives") or {}
            out += [("npc", c["id"]) for c in ob.get("creatures", [])] + [("object", o["id"]) for o in ob.get("objects", [])]
        elif t == "fly":
            out += [("npc", i) for i in prev_fp]
    seen, uniq = set(), []
    for k in out:
        if k not in seen:
            seen.add(k)
            uniq.append(k)
    return uniq


def main() -> int:
    gp = FIX / "guides" / "1-6-durotar.json"
    g = load(gp)
    idmap: dict[str, str] = {}
    prev_fp: list[int] = []
    for i, s in enumerate(g["steps"], 1):
        new_id = f"{g['slug']}:{i:02d}"
        idmap[s["id"]] = new_id
        s["id"] = new_id
        s["n"] = i
        gotos = [a for a in s["actions"] if a["type"] == "goto"]
        if gotos:
            map_id = gotos[0]["at"]["mapId"]
            ents = [(npcs if kind == "npc" else objects).get(str(eid)) for kind, eid in anchors(s, prev_fp)]
            pts: list[tuple[float, float]] = []
            for e in ents:
                p = spawn_point(e, map_id)
                if p and p not in pts:
                    pts.append(p)
            mob_loop = len(gotos) > 1 and all(a.get("hidden") for a in gotos) and any(a["type"] == "mob" for a in s["actions"])
            if mob_loop and ents:
                pts = spread_points(ents[0], map_id, len(gotos))
            keep = gotos[: len(pts)]
            for a, (x, y) in zip(keep, pts):
                a["at"] = {"mapId": map_id, "zone": ZONE_NAME[map_id], "x": round(x, 2), "y": round(y, 2), "exact": True}
            if len(keep) < len(gotos):  # collapsed approach points: the NPC point applies to every class
                for a in keep:
                    a.pop("filter", None)
            drop = {id(a) for a in gotos[len(pts):]}
            s["actions"] = [a for a in s["actions"] if id(a) not in drop]
        for a in s["actions"]:
            if a["type"] == "target" and any(b["type"] == "fp" for b in s["actions"]):
                prev_fp = a.get("npcIds", [])
    for sec in g["sections"]:
        sec["firstStep"], sec["lastStep"] = idmap[sec["firstStep"]], idmap[sec["lastStep"]]
        ids = []
        on = False
        for s in g["steps"]:
            on = on or s["id"] == sec["firstStep"]
            if on:
                ids.append(s["id"])
            if s["id"] == sec["lastStep"]:
                break
        by_id = {s["id"]: s for s in g["steps"]}
        sec["route"] = [{"x": a["at"]["x"], "y": a["at"]["y"]} for sid in ids for a in by_id[sid]["actions"] if a["type"] == "goto" and a["at"]["mapId"] == sec["mapId"]]
        for stop in sec.get("stops", []):
            stop["steps"] = [idmap[x] for x in stop["steps"]]
            pts = [a["at"] for sid in stop["steps"] for a in by_id[sid]["actions"] if a["type"] == "goto" and a["at"]["mapId"] == sec["mapId"]]
            if pts:
                stop["x"] = round(sum(p["x"] for p in pts) / len(pts), 2)
                stop["y"] = round(sum(p["y"] for p in pts) / len(pts), 2)
    dump(gp, g)
    qp = FIX / "quests.json"
    qs = load(qp)
    for q in qs:
        q["inGuides"] = [idmap.get(x, x) for x in q.get("inGuides", [])]
    dump(qp, qs)
    ip = FIX / "insights.json"
    ins = load(ip)
    for issue in ins.get("issues", []):
        if "step" in issue:
            issue["step"] = idmap.get(issue["step"], issue["step"])
    for lst in ins.get("nearMisses", {}).values():
        for nm in lst:
            nm["insertAfterStep"] = idmap.get(nm["insertAfterStep"], nm["insertAfterStep"])
    dump(ip, ins)
    print(f"rebuilt {len(g['steps'])} steps, {sum(len(s['route']) for s in g['sections'])} route points")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
