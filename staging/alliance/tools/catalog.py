"""Per-zone quest catalogs for route authors (Alliance + neutral, from content/questie-db-alliance).

    python3 -I staging/alliance/tools/catalog.py            # every zone in ZONES
    python3 -I staging/alliance/tools/catalog.py "Westfall"  # one zone

Writes staging/alliance/catalogs/<zone>.md: quests (level, required level, race/class limits, giver and
turn-in with coordinates, objectives, chain links, XP, Forever flag) and the zone's service NPCs
(innkeepers, flight masters, trainers, vendors).
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import adb  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "catalogs"

# zone label → (quest zone names, uiMapIds for the services table)
ZONES: dict[str, tuple[list[str], list[int]]] = {
    "Elwynn Forest": (["Northshire Valley", "Northshire Abbey", "Elwynn Forest"], [1429]),
    "Stormwind City": (["Stormwind City", "Deeprun Tram"], [1453]),
    "Dun Morogh": (["Coldridge Valley", "Anvilmar", "Kharanos", "Dun Morogh"], [1426]),
    "Ironforge": (["Ironforge", "The Hall of Thanes"], [1455]),
    "Teldrassil": (["Shadowglen", "Teldrassil", "Rut'theran Village"], [1438]),
    "Darnassus": (["Darnassus"], [1457]),
    "Darkshore": (["Darkshore"], [1439]),
    "Westfall": (["Westfall", "The Deadmines"], [1436]),
    "Loch Modan": (["Loch Modan"], [1432]),
    "Redridge Mountains": (["Redridge Mountains"], [1433]),
    "Zephras Isle": (["Zephras Isle"], [2521]),
    "Wetlands": (["Wetlands"], [1437]),
    "Duskwood": (["Duskwood"], [1431]),
    "Ashenvale": (["Ashenvale"], [1440]),
    "Stonetalon Mountains": (["Stonetalon Mountains"], [1442]),
    "Alterac Mountains": (["Alterac Mountains"], [1416]),
    "Hillsbrad Foothills": (["Hillsbrad Foothills"], [1424]),
    "Misc": (["None", "Moonglade", "The Barrens", "Undercity", "Ruins of Lordaeron", "Durotar"], []),
}


def fmt_at(kind: str, eid: int, prefer: list[int]) -> str:
    pts = adb.spawns_of(kind, eid)
    if not pts:
        return "no spawn"
    pref = [p for p in pts if p[0] in prefer] or pts
    m, x, y = pref[0]
    more = f" (+{len(pref) - 1} spawns)" if len(pref) > 1 else ""
    return f"{adb.zone_name_for_map(m)} {x:.1f},{y:.1f}{more}"


def ends(q: dict, key: str, prefer: list[int]) -> str:
    e = q.get(key) or {}
    parts = []
    for kind in ("npc", "object", "item"):
        for eid in e.get(kind) or []:
            if kind == "item":
                item = adb.db()["items"].get(eid) or {}
                drops = ", ".join(adb.name_of("npc", n) for n in (item.get("npcDrops") or [])[:3])
                parts.append(f"item {adb.name_of('item', eid)} [{eid}] (drops from {drops or '?'})")
            else:
                parts.append(f"{adb.name_of(kind, eid)} [{kind} {eid}] @ {fmt_at(kind, eid, prefer)}")
    return "; ".join(parts) or "?"


def objective_line(qid: int, prefer: list[int]) -> str:
    rows = []
    for i, o in enumerate(adb.objectives(qid), 1):
        srcs = []
        for kind, eid in o["src"][:4]:
            pts = [p for p in adb.spawns_of(kind, eid) if p[0] in prefer] or adb.spawns_of(kind, eid)
            lvl = ""
            if kind == "npc":
                n = adb.db()["npcs"].get(eid) or {}
                lvl = f" L{n.get('minLevel')}-{n.get('maxLevel')}"
            where = ""
            if pts:
                xs = sum(p[1] for p in pts) / len(pts)
                ys = sum(p[2] for p in pts) / len(pts)
                where = f" ~{adb.zone_name_for_map(pts[0][0])} {xs:.0f},{ys:.0f} ({len(pts)} spawns)"
            srcs.append(f"{adb.name_of(kind, eid)} [{kind} {eid}]{lvl}{where}")
        rows.append(f"    {i}. {o['kind']} {o['count']}x {o['name']} <- " + ("; ".join(srcs) or "?"))
    return "\n".join(rows)


def render(label: str) -> str:
    names, maps = ZONES[label]
    quests = [q for q in adb.db()["quests"].values() if q.get("zone") in names]
    quests.sort(key=lambda q: (q.get("level") or 0, q["id"]))
    lines = [f"# {label}: Alliance + neutral quests ({len(quests)})", "",
             "Source: content/questie-db-alliance (QuestieDB Forever export, GPL-3.0). F = new in Forever.",
             "Coordinates are zone %. pre = needs one of these turned in first (pre.single) or all (pre.group).", ""]
    for q in quests:
        qid = q["id"]
        flags = []
        if q.get("forever"):
            flags.append("F")
        if q.get("races") and (q["races"] & adb.ALL_ALLIANCE) != adb.ALL_ALLIANCE:
            flags.append("races=" + "/".join(adb.race_names(q["races"])))
        if q.get("classes"):
            flags.append("class=" + "/".join(adb.class_names(q["classes"])))
        if q.get("sort"):
            flags.append(f"sort={q['sort']}")
        if q.get("tag"):
            flags.append(f"tag={q['tag']}")
        if q.get("repeatable"):
            flags.append("repeatable")
        lines.append(f"## {qid} {q.get('name')}  (L{q.get('level')} req{q.get('reqLevel')}, {q.get('xp', '?')} xp"
                     + (", " + ", ".join(flags) if flags else "") + ")")
        lines.append(f"  - start: {ends(q, 'start', maps)}")
        lines.append(f"  - end:   {ends(q, 'end', maps)}")
        links = []
        pre = q.get("pre") or {}
        if pre.get("single"):
            links.append(f"pre(any)={pre['single']}")
        if pre.get("group"):
            links.append(f"pre(all)={pre['group']}")
        for k in ("next", "breadcrumbFor", "exclusiveTo"):
            if q.get(k):
                links.append(f"{k}={q[k]}")
        if links:
            lines.append("  - " + ", ".join(links))
        for t in q.get("objectivesText") or []:
            lines.append(f"  - text: {t}")
        ol = objective_line(qid, maps)
        if ol:
            lines.append("  - objectives:\n" + ol)
        lines.append("")
    if maps:
        lines += ["# Service NPCs", ""]
        for n in sorted(adb.db()["npcs"].values(), key=lambda n: n["id"]):
            sv = set(n.get("services") or []) - {"questGiver", "gossip"}
            if not sv or n.get("friendly") == "H":
                continue
            pts = [p for p in adb.spawns_of("npc", n["id"]) if p[0] in maps]
            if not pts:
                continue
            _, x, y = pts[0]
            lines.append(f"- {n['name']} <{n.get('sub', '')}> [npc {n['id']}] {x:.1f},{y:.1f}: {', '.join(sorted(sv))}")
    return "\n".join(lines) + "\n"


def main(argv: list[str]) -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for label in (argv or list(ZONES)):
        path = OUT / (label.lower().replace(" ", "-").replace("'", "") + ".md")
        path.write_text(render(label), encoding="utf-8")
        print("wrote", path.relative_to(adb.ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
