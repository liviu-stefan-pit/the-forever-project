"""Alliance quest data (content/questie-db-alliance) plus the XP rules the web sim uses.

Shared by catalog.py and build_pack.py. Read-only.
"""
from __future__ import annotations

import csv
import json
import math
import re
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DB_DIR = ROOT / "content" / "questie-db-alliance"
GAME = ROOT / "content" / "game-data"

ALLIANCE_RACES = {"Human": 1, "Dwarf": 4, "NightElf": 8, "Gnome": 64, "Skyborne": 1 << 32}
CLASS_BITS = {"Warrior": 1, "Paladin": 2, "Hunter": 4, "Rogue": 8, "Priest": 16, "Shaman": 64,
              "Mage": 128, "Warlock": 256, "Druid": 1024}
ALL_ALLIANCE = sum(ALLIANCE_RACES.values())


def _load_lines(path: Path) -> dict[int, dict]:
    out: dict[int, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip().rstrip(",")
        if not line.startswith('"'):
            continue
        k, v = line.split(":", 1)
        out[int(k.strip('"'))] = json.loads(v)
    return out


@lru_cache(maxsize=None)
def db() -> dict[str, dict[int, dict]]:
    return {name: _load_lines(DB_DIR / f"{name}.json") for name in ("quests", "npcs", "objects", "items", "zones")}


def quest(qid: int) -> dict:
    q = db()["quests"].get(qid)
    if q is None:
        raise KeyError(f"quest {qid} is not in content/questie-db-alliance")
    return q


def zone(zid: int | str) -> dict:
    return db()["zones"].get(int(zid), {})


def ui_map(zid: int | str) -> int | None:
    return zone(zid).get("uiMapId")


def zone_name_for_map(map_id: int) -> str:
    """Top-level zone name for a UiMap id (the parent zone, not a subzone)."""
    best = None
    for zid, z in db()["zones"].items():
        if z.get("uiMapId") == map_id and not z.get("parent"):
            if best is None or zid < best[0]:
                best = (zid, z["name"])
    if best:
        return best[1]
    for z in db()["zones"].values():
        if z.get("uiMapId") == map_id:
            return z["name"]
    return f"map {map_id}"


def spawns_of(kind: str, eid: int) -> list[tuple[int, float, float]]:
    """[(uiMapId, x, y)] for an npc / object."""
    e = db()["npcs" if kind == "npc" else "objects"].get(eid) or {}
    out = []
    for zid, pts in (e.get("spawns") or {}).items():
        m = ui_map(zid)
        if m is None:
            continue
        for p in pts:
            if p and len(p) >= 2 and p[0] is not None and p[0] >= 0:
                out.append((m, float(p[0]), float(p[1])))
    return out


def name_of(kind: str, eid: int) -> str:
    table = {"npc": "npcs", "object": "objects", "item": "items"}[kind]
    return (db()[table].get(eid) or {}).get("name") or f"{kind} {eid}"


def race_names(mask: int) -> list[str]:
    if not mask:
        return []
    return [r for r, b in ALLIANCE_RACES.items() if mask & b]


def class_names(mask: int) -> list[str]:
    if not mask:
        return []
    return [c for c, b in CLASS_BITS.items() if mask & b]


# ---- objectives -------------------------------------------------------------------------------

_NUM_WORDS = {"two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
              "ten": 10, "twelve": 12, "fifteen": 15, "twenty": 20}
_COUNT_RE = re.compile(r"\b(\d+|" + "|".join(_NUM_WORDS) + r")\s+(?:(?:pieces?|sets?|helpings?|bundles?|bunches?|"
                       r"handfuls?|crates?|samples?|portions?) of\s+)?([A-Z][A-Za-z' -]*)", re.I)


def objectives(qid: int) -> list[dict]:
    """Ordered like the web build: creatures, items, objects. Each: kind, id, name, count, sources."""
    q = quest(qid)
    o = q.get("objectives") or {}
    text = " ".join(q.get("objectivesText") or [])
    out = []

    matches = [(int(m.group(1)) if m.group(1).isdigit() else _NUM_WORDS[m.group(1).lower()], m.group(2).strip().lower())
               for m in _COUNT_RE.finditer(text)]

    def count_for(name: str) -> int:
        nl = name.lower()
        stem = nl[: max(5, len(nl) - 2)]  # "wolf meat" / "spiked collar" vs plural forms
        for n, phrase in matches:
            if phrase.startswith(stem):
                return n
        for n, phrase in matches:  # looser: last word of the name inside the phrase head
            if nl.split()[-1][:5] in phrase.split(",")[0][: len(nl) + 6]:
                return n
        return 1

    for c in o.get("creatures") or []:
        nm = name_of("npc", c["id"])
        out.append({"kind": "kill", "id": c["id"], "name": nm, "count": count_for(nm),
                    "src": [("npc", c["id"])]})
    for it in o.get("items") or []:
        item = db()["items"].get(it["id"]) or {}
        nm = item.get("name") or f"item {it['id']}"
        src = [("npc", n) for n in (item.get("npcDrops") or [])] + [("object", n) for n in (item.get("objectDrops") or [])]
        out.append({"kind": "item", "id": it["id"], "name": nm, "count": count_for(nm), "src": src})
    for ob in o.get("objects") or []:
        nm = name_of("object", ob["id"])
        out.append({"kind": "object", "id": ob["id"], "name": nm, "count": count_for(nm),
                    "src": [("object", ob["id"])]})
    for kc in o.get("killCredit") or []:
        ids = kc.get("ids") or []
        nm = name_of("npc", kc.get("baseId") or (ids[0] if ids else 0))
        out.append({"kind": "kill", "id": kc.get("baseId") or (ids[0] if ids else 0), "name": nm,
                    "count": count_for(nm), "src": [("npc", i) for i in ids]})
    return out


# ---- XP ---------------------------------------------------------------------------------------

@lru_cache(maxsize=None)
def _xp_to_next() -> dict[int, int]:
    with open(GAME / "LevelExperience.1.60.1.71037.csv", encoding="utf-8") as f:
        return {int(r["Level"]): int(r["Experience"]) for r in csv.DictReader(f)}


def xp_to_next(level: int) -> int:
    return 0 if level >= 60 or level < 1 else _xp_to_next().get(level, 0)


def quest_xp_for_player(base: int, qlevel: int, plevel: int) -> int:
    diff = math.floor(plevel) - qlevel
    if diff <= 5:
        return base
    mult = {6: 0.8, 7: 0.6, 8: 0.4, 9: 0.2}.get(diff, 0.1)
    return round(base * mult)


def zd(level: int) -> int:
    for lim, v in ((60, 17), (55, 16), (50, 15), (45, 14), (40, 13), (30, 12), (20, 11), (16, 9), (12, 8), (10, 7), (8, 6)):
        if level >= lim:
            return v
    return 5


def gray_level(level: int) -> int:
    if level <= 5:
        return 0
    if level <= 39:
        return level - level // 10 - 5
    return level - level // 5 - 1


def mob_xp(clvl: int, mlvl: int, elite: bool = False) -> int:
    if mlvl <= gray_level(clvl):
        return 0
    diff = mlvl - clvl
    if diff >= 0:
        xp = (clvl * 5 + 45) * (1 + 0.05 * min(diff, 4))
    else:
        xp = (mlvl * 5 + 45) * (1 - (clvl - mlvl) / zd(clvl))
    if elite:
        xp *= 2
    return max(0, round(xp))


def mob_level(npc_id: int) -> int:
    n = db()["npcs"].get(npc_id) or {}
    lo, hi = n.get("minLevel") or 1, n.get("maxLevel") or n.get("minLevel") or 1
    return round((lo + hi) / 2)
