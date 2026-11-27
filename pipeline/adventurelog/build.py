"""AdventureLog sessions → tpf-db confirmed records.

Only facts seen in the log go in. Every record carries ``status: "confirmed"``, ``evidence`` (session id + the
events' ``t``, seconds since that session's login) and ``samples`` (how many events back it).

Output is a dict of file name → JSON value (``quests.json``, ``npcs.json`` …). Lists are sorted, floats rounded,
nothing depends on the run's clock, so the same sessions give byte-identical files.

Kill buckets (``KILL_BUCKETS``): ``solo`` counts towards kill XP and drop rates. ``grouped`` (in a group, or the
kill line had a group bonus), ``groupCredit`` (credit from a group member's fight), ``untracked`` (not tracked in
one of your fights) and ``tapDenied`` (someone else's tag) are counted apart and flagged. Sessions from before
AdventureLog 1.2.0 have no ``via`` / ``tracked`` flags: their kills are ``solo`` unless the group size was above 0
or the kill line had a group bonus.
"""
from __future__ import annotations

import re
from collections import defaultdict
from typing import Any, Iterable

from .reader import Session

__all__ = ["build_confirmed", "KILL_BUCKETS", "zone_key", "is_idle", "session_features"]

KILL_BUCKETS = ("solo", "grouped", "groupCredit", "untracked", "tapDenied")
STATUS = "confirmed"

_KILL_RE = re.compile(r"^(?P<mob>.+?) dies, you gain (?P<xp>\d+) experience\.(?: \(\+(?P<group>\d+) group bonus\))?")
_ITEM_LINK_RE = re.compile(r"\|Hitem:(\d+)[^|]*\|h\[([^\]]+)\]\|h")
_COUNT_RE = re.compile(r"^\s*\d+\s*/\s*\d+\s*")
_SLAIN_RE = re.compile(r"\s+slain\s*$", re.I)


def zone_key(map_id: Any) -> str:
    """Spawn / zone key. The log records the UI map id, not the AreaTable id QuestieDB keys by."""
    return f"map:{int(map_id)}"


def _t(e: dict[str, Any]) -> float:
    try:
        return round(float(e.get("t") or 0.0), 3)
    except (TypeError, ValueError):
        return 0.0


def _pos(x: Any, y: Any) -> list[float] | None:
    try:
        fx, fy = float(x), float(y)
    except (TypeError, ValueError):
        return None
    if not (0 <= fx <= 100 and 0 <= fy <= 100) or (fx == 0 and fy == 0):
        return None
    return [round(fx, 2), round(fy, 2)]


def _int(v: Any) -> int | None:
    try:
        i = int(v)
    except (TypeError, ValueError):
        return None
    return i


def objective_name(text: str | None, kind: str) -> str:
    s = _COUNT_RE.sub("", text or "").strip()
    if kind == "monster":
        s = _SLAIN_RE.sub("", s).strip()
    return s


def is_idle(s: Session) -> bool:
    return not any(e["e"] in ("quest_accept", "quest_turnin", "mob_kill") for e in s.events)


def session_features(s: Session) -> str:
    """``"1.2.0"`` when the session has any field AdventureLog 1.2.0 added, else ``"legacy"``."""
    for e in s.events:
        k = e["e"]
        if (k == "mob_kill" and "via" in e) or (k == "level_up" and "to" in e) or (k == "xp" and "source" in e) \
                or (k == "quest_accept" and ("giverNpcId" in e or "giverErr" in e)) or (k == "quest_turnin" and "enderNpcId" in e):
            return "1.2.0"
    return "legacy"


class Evidence:
    def __init__(self) -> None:
        self.by: dict[str, set[float]] = defaultdict(set)

    def add(self, e: dict[str, Any]) -> None:
        self.by[e["_s"]].add(_t(e))

    def merge(self, other: "Evidence") -> None:
        for s, ts in other.by.items():
            self.by[s] |= ts

    def out(self) -> list[dict[str, Any]]:
        return [{"session": s, "t": sorted(ts)} for s, ts in sorted(self.by.items())]

    @property
    def n(self) -> int:
        return sum(len(v) for v in self.by.values())


class Points:
    """Positions per zone key, deduplicated after rounding."""

    def __init__(self) -> None:
        self.by: dict[str, set[tuple[float, float]]] = defaultdict(set)

    def add(self, map_id: Any, x: Any, y: Any) -> None:
        p = _pos(x, y)
        m = _int(map_id)
        if p is None or m is None:
            return
        self.by[zone_key(m)].add((p[0], p[1]))

    def out(self) -> dict[str, list[list[float]]]:
        return {k: [list(p) for p in sorted(v)] for k, v in sorted(self.by.items()) if v}


def _new_entity() -> dict[str, Any]:
    return {"names": set(), "points": Points(), "ev": Evidence(), "roles": set(), "levels": set(),
            "questStarts": set(), "questEnds": set(), "classification": set(), "trainerTypes": set(),
            "kills": defaultdict(int), "seen": 0, "via": set(), "subzones": set()}


def _sorted_ids(ids: Iterable[int]) -> list[int]:
    return sorted({int(i) for i in ids})


def _pct(a: int, b: int) -> float | None:
    return round(100.0 * a / b, 1) if b else None


def build_confirmed(sessions: list[Session]) -> dict[str, Any]:
    """Build every confirmed tpf-db file from ``sessions`` (already de-duplicated, any order)."""
    sessions = sorted(sessions, key=lambda s: (s.id, s.char.get("name", "")))
    used: list[Session] = []
    meta_sessions: list[dict[str, Any]] = []
    for s in sessions:
        idle = is_idle(s)
        levels = [e.get("level") for e in s.events if e["e"] == "session_start" and isinstance(e.get("level"), int)]
        ups = [_int(e.get("to")) or (_int((e.get("raw") or [None, None])[1]) if isinstance(e.get("raw"), list) else None)
               for e in s.events if e["e"] == "level_up"]
        lv = [x for x in levels + ups if isinstance(x, int)]
        meta_sessions.append({
            "id": s.id, "class": s.char.get("class"), "race": s.char.get("race"), "faction": s.char.get("faction"),
            "events": len(s.events), "features": session_features(s), "used": not idle,
            **({"levels": [min(lv), max(lv)]} if lv else {}),
        })
        if not idle:
            for i, e in enumerate(s.events):
                e["_s"] = s.id
                e["_i"] = i
            used.append(s)

    # ---------- pass 0: names and ids across every session ----------
    object_ids: set[int] = set()
    creature_ids: set[int] = set()
    guessed_objects: set[int] = set()
    item_names: dict[int, str] = {}
    item_by_name: dict[str, set[int]] = defaultdict(set)
    mob_by_name: dict[str, set[int]] = defaultdict(set)
    obj_by_name: dict[str, set[int]] = defaultdict(set)
    npc_name_ids: dict[str, set[int]] = defaultdict(set)  # friendly NPC names with known ids (givers, enders, trainers)
    for s in used:
        for e in s.events:
            k = e["e"]
            if k == "object_use" and _int(e.get("objectId")):
                object_ids.add(int(e["objectId"]))
                obj_by_name[e.get("name", "")].add(int(e["objectId"]))
            elif k == "loot":
                for sl in e.get("slots") or []:
                    if sl.get("sourceType") == "GameObject" and _int(sl.get("objectId") or sl.get("npcId")):
                        object_ids.add(int(sl.get("objectId") or sl["npcId"]))
                    iid = _int(sl.get("itemId"))
                    if iid and sl.get("name"):
                        item_names.setdefault(iid, sl["name"])
                        item_by_name[sl["name"]].add(iid)
            elif k == "loot_chat":
                for m in _ITEM_LINK_RE.finditer(e.get("text") or ""):
                    item_names.setdefault(int(m.group(1)), m.group(2))
                    item_by_name[m.group(2)].add(int(m.group(1)))
            elif k in ("mob_kill", "mob_seen") and _int(e.get("npcId")) and e.get("unitType", "Creature") == "Creature":
                mob_by_name[e.get("name", "")].add(int(e["npcId"]))
                creature_ids.add(int(e["npcId"]))
            elif k == "quest_accept" and _int(e.get("giverNpcId")) and e.get("giverName"):
                npc_name_ids[e["giverName"]].add(int(e["giverNpcId"]))
            elif k == "quest_turnin" and _int(e.get("enderNpcId")) and e.get("enderName"):
                npc_name_ids[e["enderName"]].add(int(e["enderNpcId"]))
            elif k == "trainer" and _int(e.get("npcId")) and e.get("name"):
                npc_name_ids[e["name"]].add(int(e["npcId"]))
            elif k == "trainer_learn" and _int(e.get("trainerNpcId")) and e.get("trainerName"):
                npc_name_ids[e["trainerName"]].add(int(e["trainerNpcId"]))

    def slot_source(sl: dict[str, Any]) -> tuple[str, int] | None:
        sid = _int(sl.get("objectId") or sl.get("npcId"))
        if not sid:
            return None
        st = sl.get("sourceType")
        if st == "GameObject":
            return ("object", sid)
        if st is None and (sid in object_ids or sid not in creature_ids):
            # Before 1.2.0 a slot had no sourceType: an id never seen or killed as a creature is an object.
            if sid not in object_ids:
                guessed_objects.add(sid)
            return ("object", sid)
        return ("npc", sid)

    # ---------- accumulators ----------
    npcs: dict[int, dict[str, Any]] = defaultdict(_new_entity)
    objects: dict[int, dict[str, Any]] = defaultdict(_new_entity)
    items: dict[int, dict[str, Any]] = defaultdict(lambda: {"names": set(), "quality": set(), "npcDrops": set(), "objectDrops": set(),
                                                             "skinnedFrom": set(), "questRewards": set(), "questChoices": set(),
                                                             "questObjectiveOf": set(), "ev": Evidence()})
    quests: dict[int, dict[str, Any]] = {}
    kills: list[dict[str, Any]] = []
    windows: list[dict[str, Any]] = []  # loot windows from creatures / objects / skinning
    increments: list[dict[str, Any]] = []
    quest_xp: dict[int, dict[tuple[int, int, int], dict[str, Any]]] = defaultdict(dict)
    explore_xp: dict[tuple[str, int, int], dict[str, Any]] = {}
    trainers: dict[str, dict[str, Any]] = {}
    spawns: dict[str, dict[str, dict[int, dict[str, Any]]]] = defaultdict(lambda: defaultdict(dict))
    subzones: dict[str, set[str]] = defaultdict(set)
    zone_names: dict[str, set[str]] = defaultdict(set)
    accept_order: list[tuple[str, float, int, dict[str, Any]]] = []
    turnin_order: list[tuple[str, float, int, dict[str, Any]]] = []
    observers: set[tuple[str, str, str]] = set()

    def quest(qid: int) -> dict[str, Any]:
        if qid not in quests:
            quests[qid] = {"names": set(), "ev": Evidence(), "accepts": [], "turnins": [], "abandons": 0, "objectives": None,
                           "giverNpc": set(), "giverObject": set(), "giverItem": set(), "enderNpc": set(), "enderObject": set(),
                           "giverAt": Points(), "enderAt": Points(), "acceptAt": Points(), "turninAt": Points(),
                           "rewardChoices": {}, "rewardItems": {}, "chosen": set(), "money": set(), "acceptLevels": set(),
                           "turninLevels": set(), "objIds": defaultdict(lambda: defaultdict(set)), "subzones": set()}
        return quests[qid]

    def add_spawn(map_id: Any, sub: str | None, npc_id: int, name: str, x: Any, y: Any, e: dict[str, Any]) -> None:
        p = _pos(x, y)
        m = _int(map_id)
        if p is None or m is None:
            return
        row = spawns[zone_key(m)][sub or ""].setdefault(npc_id, {"names": set(), "points": set(), "n": 0})
        row["names"].add(name)
        row["points"].add((p[0], p[1]))
        row["n"] += 1

    for s in used:
        observers.add((s.char.get("class") or "?", s.char.get("race") or "?", s.char.get("faction") or "?"))
        evs = s.events
        loots = [e for e in evs if e["e"] == "loot"]
        uses = [e for e in evs if e["e"] == "object_use"]
        fight_ends = [e for e in evs if e["e"] == "fight_end"]
        level = next((e.get("level") for e in evs if e["e"] == "session_start" and isinstance(e.get("level"), int)), None)
        group_size = 0
        active: dict[int, dict[str, Any]] = {}
        last_seen: dict[int, dict[str, Any]] = {}
        rested_state: int | None = None
        last_gather: dict[str, Any] | None = None
        last_kill_by_npc: dict[int, dict[str, Any]] = {}
        session_kills: list[dict[str, Any]] = []
        pending_xp: dict[float, dict[str, Any]] = {}

        for e in evs:
            k = e["e"]
            t = _t(e)
            m, x, y, sub = e.get("map"), e.get("x"), e.get("y"), e.get("subzone")
            if _int(m) and e.get("zone"):
                zone_names[zone_key(m)].add(e["zone"])
            if _int(m) and sub:
                subzones[zone_key(m)].add(sub)

            if k == "session_start" and isinstance(e.get("level"), int):
                level = e["level"]
            elif k == "level_up":
                to = _int(e.get("to"))
                if to is None and isinstance(e.get("raw"), list) and len(e["raw"]) > 1:
                    to = _int(e["raw"][1])
                level = to if to is not None else ((level or 0) + 1)
            elif k == "group":
                group_size = _int(e.get("size")) or 0
            elif k == "xp":
                rs = _int(e.get("restState"))
                if e.get("source") == "explore" and e.get("area") and _int(e.get("gained")):
                    key = (e["area"], level or 0, int(e["gained"]))
                    row = explore_xp.setdefault(key, {"ev": Evidence(), "map": _int(m)})
                    row["ev"].add(e)
                if e.get("restedUsed"):
                    pending_xp[t] = e
                rested_state = rs if rs is not None else rested_state
            elif k == "gather":
                last_gather = e
            elif k == "mob_seen" and _int(e.get("npcId")) and e.get("unitType", "Creature") == "Creature":
                nid = int(e["npcId"])
                last_seen[nid] = e
                n = npcs[nid]
                n["names"].add(e.get("name", ""))
                n["points"].add(m, x, y)
                n["ev"].add(e)
                n["seen"] += 1
                n["roles"].add("mob")
                if _int(e.get("level")):
                    n["levels"].add(int(e["level"]))
                if e.get("classification"):
                    n["classification"].add(e["classification"])
                add_spawn(m, sub, nid, e.get("name", ""), x, y, e)
            elif k == "mob_kill" and _int(e.get("npcId")):
                nid = int(e["npcId"])
                prev = last_kill_by_npc.get(nid)
                if prev is not None and abs(prev["t"] - t) < 0.3:
                    continue  # same death logged twice
                raw_text = e["raw"][1] if isinstance(e.get("raw"), list) and len(e["raw"]) > 1 and isinstance(e["raw"][1], str) else ""
                km = _KILL_RE.match(raw_text)
                amount = _int(e.get("xpAmount"))
                if amount is None and km:
                    amount = int(km.group("xp"))
                gbonus = _int(e.get("groupBonus")) or (int(km.group("group")) if km and km.group("group") else 0)
                if e.get("tapDenied"):
                    bucket = "tapDenied"
                elif e.get("groupCredit"):
                    bucket = "groupCredit"
                elif e.get("tracked") is False:
                    bucket = "untracked"
                elif e.get("grouped") or gbonus or (_int(e.get("groupSize")) or 0) > 0 or ("via" not in e and group_size > 0):
                    bucket = "grouped"
                else:
                    bucket = "solo"
                mlevel = None
                seen = last_seen.get(nid)
                if seen is not None and 0 <= t - _t(seen) <= 120 and _int(seen.get("level")):
                    mlevel = int(seen["level"])
                if mlevel is None:
                    for fe in fight_ends:
                        if 0 <= _t(fe) - t <= 15:
                            lv = [_int(mo.get("level")) for mo in fe.get("mobs") or [] if _int(mo.get("npcId")) == nid]
                            if lv and lv[0]:
                                mlevel = lv[0]
                                break
                rested = bool(rested_state == 1)
                xp_ev = pending_xp.get(t)
                if xp_ev is not None and xp_ev.get("restedUsed"):
                    rested = True
                needing = set()
                for qid, a in active.items():
                    for idx, o in enumerate(a["obj"] or []):
                        if o["type"] in ("item", "monster") and not o.get("finished"):
                            needing.add((qid, idx))
                kr = {"npc": nid, "name": e.get("name", ""), "s": s.id, "t": t, "e": e, "plevel": level, "mlevel": mlevel,
                      "xp": amount, "groupBonus": gbonus, "rested": rested, "bucket": bucket, "needing": needing}
                kills.append(kr)
                session_kills.append(kr)
                last_kill_by_npc[nid] = kr
                n = npcs[nid]
                n["names"].add(e.get("name", ""))
                n["points"].add(m, x, y)
                n["ev"].add(e)
                n["kills"][bucket] += 1
                n["roles"].add("mob")
                if mlevel:
                    n["levels"].add(mlevel)
                add_spawn(m, sub, nid, e.get("name", ""), x, y, e)
            elif k == "loot":
                skinning = last_gather is not None and str(last_gather.get("spellName", "")).startswith("Skinning") \
                    and 0 <= t - _t(last_gather) <= 3
                by_src: dict[tuple[str, int], list[dict[str, Any]]] = defaultdict(list)
                for sl in e.get("slots") or []:
                    src = slot_source(sl)
                    if src:
                        by_src[src].append(sl)
                for (kind, sid), slots in sorted(by_src.items()):
                    kind2 = "skinning" if (skinning and kind == "npc") else kind
                    kill = None
                    if kind == "npc":
                        kr = last_kill_by_npc.get(sid)
                        if kr is not None and 0 <= t - kr["t"] <= 600:
                            kill = kr
                    w = {"kind": kind2, "id": sid, "e": e, "kill": kill, "items": {}}
                    for sl in slots:
                        iid = _int(sl.get("itemId"))
                        if not iid:
                            continue
                        c = _int(sl.get("count")) or 1
                        w["items"][iid] = w["items"].get(iid, 0) + c
                        it = items[iid]
                        it["names"].add(sl.get("name", ""))
                        if sl.get("quality") is not None:
                            it["quality"].add(int(sl["quality"]))
                        it["ev"].add(e)
                        {"npc": it["npcDrops"], "object": it["objectDrops"], "skinning": it["skinnedFrom"]}[kind2].add(sid)
                    windows.append(w)
                    if kind == "object":
                        o = objects[sid]
                        o["names"].update(sl.get("name", "") for sl in slots if sl.get("sourceType") == "GameObject")
                        o["ev"].add(e)
            elif k == "object_use" and _int(e.get("objectId")):
                oid = int(e["objectId"])
                o = objects[oid]
                o["names"].add(e.get("name", ""))
                o["points"].add(m, x, y)
                o["ev"].add(e)
                o["via"].add(e.get("via", ""))
                o["seen"] += 1
                if sub:
                    o["subzones"].add(sub)
            elif k == "trainer" or k == "trainer_learn" or k == "trainer_close":
                if k == "trainer":
                    nid = _int(e.get("npcId"))
                    name = e.get("name") or ""
                    ids = npc_name_ids.get(name, set())
                    id_from = "log" if nid else ("name-match" if len(ids) == 1 else None)
                    if not nid and len(ids) == 1:
                        nid = next(iter(ids))
                    key = str(nid) if nid else f"name:{name}"
                    tr = trainers.setdefault(key, {"npcId": nid, "names": set(), "types": set(), "points": Points(), "ev": Evidence(),
                                                   "taught": {}, "classes": set(), "idFrom": set(), "visits": 0})
                    tr["names"].add(name)
                    if e.get("trainerType"):
                        tr["types"].add(e["trainerType"])
                    tr["points"].add(m, x, y)
                    tr["ev"].add(e)
                    tr["visits"] += 1
                    if id_from:
                        tr["idFrom"].add(id_from)
                    if s.char.get("class"):
                        tr["classes"].add(s.char["class"])
                    if nid:
                        n = npcs[nid]
                        n["names"].add(name)
                        n["points"].add(m, x, y)
                        n["ev"].add(e)
                        n["roles"].add("trainer")
                        if e.get("trainerType"):
                            n["trainerTypes"].add(e["trainerType"])
                elif k == "trainer_learn":
                    nid = _int(e.get("trainerNpcId"))
                    name = e.get("trainerName") or ""
                    key = str(nid) if nid else f"name:{name}"
                    tr = trainers.setdefault(key, {"npcId": nid, "names": {name}, "types": set(), "points": Points(), "ev": Evidence(),
                                                   "taught": {}, "classes": set(), "idFrom": {"log"} if nid else set(), "visits": 0})
                    spell = e.get("name") or ""
                    rank = e.get("subText") or ""
                    row = tr["taught"].setdefault((spell, rank), {"spell": spell, "rank": rank, "ev": Evidence()})
                    for f in ("cost", "reqLevel"):
                        if _int(e.get(f)) is not None:
                            row[f] = int(e[f])
                    if e.get("skillLine"):
                        row["skillLine"] = e["skillLine"]
                    row["ev"].add(e)
                    tr["ev"].add(e)
                    if s.char.get("class"):
                        tr["classes"].add(s.char["class"])
            elif k == "quest_accept" and _int(e.get("questId")):
                qid = int(e["questId"])
                q = quest(qid)
                if e.get("title"):
                    q["names"].add(e["title"])
                q["ev"].add(e)
                q["accepts"].append(e)
                if level is not None:
                    q["acceptLevels"].add(level)
                if sub:
                    q["subzones"].add(sub)
                q["acceptAt"].add(m, x, y)
                gid = _int(e.get("giverNpcId"))
                gtype = e.get("giverType")
                if gid and gtype in (None, "Creature"):
                    q["giverNpc"].add(gid)
                    q["giverAt"].add(e.get("giverMap", m), e.get("giverX"), e.get("giverY"))
                    n = npcs[gid]
                    n["names"].add(e.get("giverName", ""))
                    n["points"].add(e.get("giverMap", m), e.get("giverX"), e.get("giverY"))
                    n["roles"].add("questGiver")
                    n["questStarts"].add(qid)
                    n["ev"].add(e)
                oid = _int(e.get("giverObjectId"))
                if oid:
                    q["giverObject"].add(oid)
                    q["giverAt"].add(e.get("giverMap", m), e.get("giverX"), e.get("giverY"))
                    o = objects[oid]
                    o["names"].add(e.get("giverName", ""))
                    o["points"].add(e.get("giverMap", m), e.get("giverX"), e.get("giverY"))
                    o["roles"].add("questGiver")
                    o["questStarts"].add(qid)
                    o["ev"].add(e)
                iid = _int(e.get("giverItemId"))
                if iid:
                    q["giverItem"].add(iid)
                active[qid] = {"accept": e, "obj": None}
                accept_order.append((s.id, t, e["_i"], e))
            elif k == "quest_progress" and _int(e.get("questId")):
                qid = int(e["questId"])
                objs = e.get("objectives")
                if not isinstance(objs, list):
                    continue
                q = quest(qid)
                q["ev"].add(e)
                a = active.setdefault(qid, {"accept": None, "obj": None})
                prev = a["obj"]
                cur = []
                for idx, o in enumerate(objs):
                    kind = o.get("type") or "?"
                    name = objective_name(o.get("text"), kind)
                    cur.append({"type": kind, "name": name, "have": _int(o.get("numFulfilled")) or 0,
                                "need": _int(o.get("numRequired")) or 0, "finished": bool(o.get("finished")),
                                "incomplete": bool(o.get("textIncomplete")) or not name})
                    if prev is not None and idx < len(prev) and prev[idx]["type"] == kind:
                        delta = cur[-1]["have"] - prev[idx]["have"]
                        if delta > 0:
                            increments.append({"q": qid, "idx": idx, "type": kind, "name": name or prev[idx]["name"], "delta": delta,
                                               "e": e, "t": t, "s": s.id, "loots": loots, "uses": uses, "kills": session_kills})
                # keep names learnt earlier when this update has none
                if prev is not None:
                    for idx, c in enumerate(cur):
                        if c["incomplete"] and idx < len(prev) and prev[idx]["name"]:
                            c["name"] = prev[idx]["name"]
                            c["incomplete"] = False
                a["obj"] = cur
                # latest complete objective list for the record
                if all(not c["incomplete"] for c in cur) or q["objectives"] is None:
                    q["objectives"] = [{"type": c["type"], "name": c["name"], "need": c["need"]} for c in cur]
            elif k == "quest_turnin" and _int(e.get("questId")):
                qid = int(e["questId"])
                q = quest(qid)
                q["ev"].add(e)
                q["turnins"].append(e)
                if level is not None:
                    q["turninLevels"].add(level)
                q["turninAt"].add(m, x, y)
                eid = _int(e.get("enderNpcId"))
                if eid and e.get("enderType") in (None, "Creature"):
                    q["enderNpc"].add(eid)
                    q["enderAt"].add(e.get("enderMap", m), e.get("enderX"), e.get("enderY"))
                    n = npcs[eid]
                    n["names"].add(e.get("enderName", ""))
                    n["points"].add(e.get("enderMap", m), e.get("enderX"), e.get("enderY"))
                    n["roles"].add("questEnder")
                    n["questEnds"].add(qid)
                    n["ev"].add(e)
                eoid = _int(e.get("enderObjectId"))
                if eoid:
                    q["enderObject"].add(eoid)
                    o = objects[eoid]
                    o["names"].add(e.get("enderName", ""))
                    o["roles"].add("questEnder")
                    o["questEnds"].add(qid)
                    o["ev"].add(e)
                xp = _int(e.get("xpReward"))
                money = _int(e.get("moneyReward")) or _int(e.get("rewardMoney")) or 0
                if xp is not None and level is not None:
                    row = quest_xp[qid].setdefault((level, xp, money), {"ev": Evidence()})
                    row["ev"].add(e)
                if money:
                    q["money"].add(money)
                for r in e.get("rewardChoices") or []:
                    iid = _int(r.get("itemId"))
                    if iid:
                        q["rewardChoices"][iid] = _int(r.get("count")) or 1
                        items[iid]["names"].add(r.get("name", ""))
                        items[iid]["questChoices"].add(qid)
                        items[iid]["ev"].add(e)
                        if r.get("quality") is not None:
                            items[iid]["quality"].add(int(r["quality"]))
                for r in e.get("rewardItems") or []:
                    iid = _int(r.get("itemId"))
                    if iid:
                        q["rewardItems"][iid] = _int(r.get("count")) or 1
                        items[iid]["names"].add(r.get("name", ""))
                        items[iid]["questRewards"].add(qid)
                        items[iid]["ev"].add(e)
                        if r.get("quality") is not None:
                            items[iid]["quality"].add(int(r["quality"]))
                if _int(e.get("chosenItemId")):
                    q["chosen"].add(int(e["chosenItemId"]))
                # legacy sessions: "You receive item" lines in the same second are the fixed rewards
                if not e.get("rewardItems") and not e.get("rewardChoices"):
                    for le in evs:
                        if le["e"] == "loot_chat" and abs(_t(le) - t) <= 1.0 and str(le.get("text", "")).startswith("You receive item"):
                            for mm in _ITEM_LINK_RE.finditer(le["text"]):
                                iid = int(mm.group(1))
                                q["rewardItems"][iid] = q["rewardItems"].get(iid) or 1
                                items[iid]["names"].add(mm.group(2))
                                items[iid]["questRewards"].add(qid)
                                items[iid]["ev"].add(le)
                active.pop(qid, None)
                turnin_order.append((s.id, t, e["_i"], e))
            elif k == "quest_abandon" and _int(e.get("questId")):
                qid = int(e["questId"])
                quest(qid)["abandons"] += 1
                active.pop(qid, None)

    # ---------- objective sources (increments) ----------
    def source_of(inc: dict[str, Any]) -> tuple[str, int, int | None, dict[str, Any] | None, str]:
        """(kind, id, itemId, kill, how) for one objective increment."""
        t = inc["t"]
        name = inc["name"]
        if inc["type"] == "item":
            want = item_by_name.get(name, set())
            best = None
            for le in inc["loots"]:
                dt = t - _t(le)
                if -1.0 <= dt <= 3.0:
                    for sl in le.get("slots") or []:
                        iid = _int(sl.get("itemId"))
                        if iid and (iid in want or sl.get("name") == name or (name and sl.get("name") and sl["name"] in name)):
                            src = slot_source(sl)
                            if src and (best is None or abs(dt) < best[0]):
                                best = (abs(dt), src, iid, le)
            if best is not None:
                _, (kind, sid), iid, le = best
                kill = None
                if kind == "npc":
                    for w in windows:
                        if w["e"] is le and w["id"] == sid:
                            kill = w["kill"]
                            break
                return (kind if kind != "npc" else "npc", sid, iid, kill, "loot")
            iid = next(iter(want)) if len(want) == 1 else None
            for ue in reversed(inc["uses"]):
                if 0 <= t - _t(ue) <= 5:
                    return ("object", int(ue["objectId"]), iid, None, "object_use")
            for kr in reversed(inc["kills"]):
                if 0 <= t - kr["t"] <= 10:
                    return ("npc", kr["npc"], iid, kr, "kill-proximity")
            return ("unknown", 0, iid, None, "none")
        if inc["type"] == "monster":
            # A kill credits the objective only when it names that mob: "Find the house" is a monster-type
            # objective too, and a mob killed in the same second is not its credit.
            for kr in reversed(inc["kills"]):
                if -0.5 <= t - kr["t"] <= 3 and (not name or kr["name"] == name):
                    return ("npc", kr["npc"], None, kr, "kill")
            ids = mob_by_name.get(name, set())
            if len(ids) == 1:
                return ("npc", next(iter(ids)), None, None, "name-match")
            return ("unknown", 0, None, None, "none")
        if inc["type"] == "object":
            for ue in reversed(inc["uses"]):
                if -1 <= t - _t(ue) <= 5:
                    return ("object", int(ue["objectId"]), None, None, "object_use")
            return ("unknown", 0, None, None, "none")
        return ("unknown", 0, None, None, "none")

    quest_drop: dict[tuple[int, int, int, int], dict[str, Any]] = {}
    for inc in increments:
        kind, sid, iid, kill, how = source_of(inc)
        q = quests[inc["q"]]
        if kind == "npc":
            q["objIds"][inc["idx"]]["npc"].add(sid)
        elif kind == "object":
            q["objIds"][inc["idx"]]["object"].add(sid)
            objects[sid]["questObjectiveOf"] = objects[sid].get("questObjectiveOf", set()) | {inc["q"]}
            objects[sid]["roles"].add("questObjective")
            objects[sid]["ev"].add(inc["e"])
        if iid:
            q["objIds"][inc["idx"]]["item"].add(iid)
            items[iid]["questObjectiveOf"].add(inc["q"])
            items[iid]["ev"].add(inc["e"])
        if inc["type"] == "item" and kind == "npc" and iid:
            key = (inc["q"], inc["idx"], iid, sid)
            row = quest_drop.setdefault(key, {"drops": 0, "items": 0, "flaggedDrops": 0, "flaggedItems": 0, "ev": Evidence(), "how": set()})
            bucket = kill["bucket"] if kill is not None else "solo"
            if bucket == "solo":
                row["drops"] += 1
                row["items"] += inc["delta"]
            else:
                row["flaggedDrops"] += 1
                row["flaggedItems"] += inc["delta"]
            row["ev"].add(inc["e"])
            row["how"].add(how)

    # objective names → ids for objectives that never moved in the log
    for qid, q in quests.items():
        for idx, o in enumerate(q["objectives"] or []):
            ids = q["objIds"][idx]
            if o["type"] == "monster" and not ids["npc"] and len(mob_by_name.get(o["name"], ())) >= 1:
                ids["npc"].update(mob_by_name[o["name"]])
            if o["type"] == "item" and not ids["item"] and len(item_by_name.get(o["name"], ())) == 1:
                ids["item"].update(item_by_name[o["name"]])
                it = items[next(iter(item_by_name[o["name"]]))]
                it["questObjectiveOf"].add(qid)
                it["ev"].merge(q["ev"])
            if o["type"] == "object" and not ids["object"] and len(obj_by_name.get(o["name"], ())) >= 1:
                ids["object"].update(obj_by_name[o["name"]])

    # ---------- inferred prerequisites ----------
    pre: dict[int, set[int]] = defaultdict(set)
    for (sid, ta, ia, ea) in accept_order:
        qa = int(ea["questId"])
        giver = _int(ea.get("giverNpcId"))
        for (sid2, tt, it, et) in turnin_order:
            if sid2 != sid or not (0 <= ta - tt <= 10) or it > ia:
                continue
            qp = int(et["questId"])
            if qp == qa:
                continue
            ender = _int(et.get("enderNpcId"))
            same = (giver is not None and ender is not None and giver == ender)
            if giver is None or ender is None:
                pa, pt = _pos(ea.get("x"), ea.get("y")), _pos(et.get("x"), et.get("y"))
                same = pa is not None and pt is not None and abs(pa[0] - pt[0]) <= 0.5 and abs(pa[1] - pt[1]) <= 0.5
            if same:
                pre[qa].add(qp)

    # ---------- output: quests ----------
    out_quests: dict[str, Any] = {}
    for qid in sorted(quests):
        q = quests[qid]
        if not q["accepts"] and not q["turnins"]:
            continue
        rec: dict[str, Any] = {"id": qid, "status": STATUS}
        if q["names"]:
            rec["name"] = sorted(q["names"])[0]
        zk = sorted(set(q["acceptAt"].by) | set(q["turninAt"].by))
        if zk:
            rec["zoneKey"] = zk[0]
            rec["mapId"] = int(zk[0].split(":")[1])
            names = sorted(zone_names.get(zk[0], set()))
            if names:
                rec["zone"] = names[0]
        start: dict[str, list[int]] = {}
        if q["giverNpc"]:
            start["npc"] = _sorted_ids(q["giverNpc"])
        if q["giverObject"]:
            start["object"] = _sorted_ids(q["giverObject"])
        if q["giverItem"]:
            start["item"] = _sorted_ids(q["giverItem"])
        if start:
            rec["start"] = start
        end: dict[str, list[int]] = {}
        if q["enderNpc"]:
            end["npc"] = _sorted_ids(q["enderNpc"])
        if q["enderObject"]:
            end["object"] = _sorted_ids(q["enderObject"])
        if end:
            rec["end"] = end
        for f in ("giverAt", "enderAt", "acceptAt", "turninAt"):
            pts = q[f].out()
            if pts:
                rec[f] = pts
        objs: dict[str, list[dict[str, Any]]] = {}
        for idx, o in enumerate(q["objectives"] or []):
            ids = q["objIds"][idx]
            base = {"index": idx + 1, "count": o["need"], "text": o["name"]}
            if o["type"] == "monster":
                for nid in sorted(ids["npc"]) or [None]:
                    objs.setdefault("creatures", []).append({**({"id": nid} if nid else {"idUnresolved": True}), **base})
            elif o["type"] == "item":
                for iid in sorted(ids["item"]) or [None]:
                    row = {**({"id": iid} if iid else {"idUnresolved": True}), **base}
                    if ids["npc"]:
                        row["fromNpcs"] = sorted(ids["npc"])
                    if ids["object"]:
                        row["fromObjects"] = sorted(ids["object"])
                    objs.setdefault("items", []).append(row)
            elif o["type"] == "object":
                for oid in sorted(ids["object"]) or [None]:
                    objs.setdefault("objects", []).append({**({"id": oid} if oid else {"idUnresolved": True}), **base})
            else:
                objs.setdefault("events", []).append({"type": o["type"], **base})
        if objs:
            rec["objectives"] = objs
        xps = sorted({(lv, xp) for (lv, xp, _m) in quest_xp.get(qid, {})})
        if xps:
            rec["xpReceived"] = [{"playerLevel": lv, "xp": xp} for lv, xp in xps]
        if q["money"]:
            rec["money"] = sorted(q["money"])
        rewards: dict[str, Any] = {}
        if q["rewardChoices"]:
            rewards["choices"] = [{"id": i, "count": c} for i, c in sorted(q["rewardChoices"].items())]
        if q["rewardItems"]:
            rewards["items"] = [{"id": i, "count": c} for i, c in sorted(q["rewardItems"].items())]
        if q["chosen"]:
            rewards["chosen"] = sorted(q["chosen"])
        if rewards:
            rec["rewards"] = rewards
        if pre.get(qid):
            rec["pre"] = {"single": sorted(pre[qid]), "status": "inferred"}
        if q["acceptLevels"]:
            rec["acceptedAtLevel"] = sorted(q["acceptLevels"])
        if q["turninLevels"]:
            rec["turnedInAtLevel"] = sorted(q["turninLevels"])
        rec["observed"] = {"accepted": len(q["accepts"]), "turnedIn": len(q["turnins"]), "abandoned": q["abandons"]}
        if q["subzones"]:
            rec["subzones"] = sorted(q["subzones"])
        rec["samples"] = q["ev"].n
        rec["evidence"] = q["ev"].out()
        out_quests[str(qid)] = rec

    # ---------- output: npcs ----------
    out_npcs: dict[str, Any] = {}
    for nid in sorted(npcs):
        n = npcs[nid]
        rec = {"id": nid, "status": STATUS}
        names = sorted(x for x in n["names"] if x)
        if names:
            rec["name"] = names[0]
        if n["levels"]:
            rec["minLevel"], rec["maxLevel"] = min(n["levels"]), max(n["levels"])
        if n["classification"]:
            rec["classification"] = sorted(n["classification"])
        rec["roles"] = sorted(n["roles"])
        if n["trainerTypes"]:
            rec["trainerTypes"] = sorted(n["trainerTypes"])
        if n["questStarts"]:
            rec["questStarts"] = sorted(n["questStarts"])
        if n["questEnds"]:
            rec["questEnds"] = sorted(n["questEnds"])
        kc = {b: n["kills"][b] for b in KILL_BUCKETS if n["kills"].get(b)}
        if kc:
            rec["kills"] = kc
        sp = n["points"].out()
        if sp:
            rec["spawns"] = sp
            rec["zoneKey"] = sorted(sp)[0]
        rec["samples"] = n["ev"].n
        rec["evidence"] = n["ev"].out()
        out_npcs[str(nid)] = rec

    # ---------- output: objects ----------
    out_objects: dict[str, Any] = {}
    for oid in sorted(objects):
        o = objects[oid]
        rec = {"id": oid, "status": STATUS}
        names = sorted(x for x in o["names"] if x)
        if names:
            rec["name"] = names[0]
        roles = set(o["roles"])
        if o["via"]:
            rec["use"] = sorted(v for v in o["via"] if v)
            if "text" in o["via"]:
                roles.add("readable")
        if any(w["kind"] == "object" and w["id"] == oid for w in windows):
            roles.add("lootable")
        if roles:
            rec["roles"] = sorted(roles)
        if oid in guessed_objects:
            rec["sourceGuessed"] = True
        if o["questStarts"]:
            rec["questStarts"] = sorted(o["questStarts"])
        if o["questEnds"]:
            rec["questEnds"] = sorted(o["questEnds"])
        if o.get("questObjectiveOf"):
            rec["questObjectiveOf"] = sorted(o["questObjectiveOf"])
        sp = o["points"].out()
        if sp:
            rec["spawns"] = sp
            rec["zoneKey"] = sorted(sp)[0]
        rec["samples"] = o["ev"].n
        rec["evidence"] = o["ev"].out()
        out_objects[str(oid)] = rec

    # ---------- output: items ----------
    for iid, nm in item_names.items():
        items[iid]["names"].add(nm)
    out_items: dict[str, Any] = {}
    for iid in sorted(items):
        it = items[iid]
        if it["ev"].n == 0 and not it["questObjectiveOf"]:
            continue
        rec = {"id": iid, "status": STATUS}
        names = sorted(x for x in it["names"] if x)
        if names:
            rec["name"] = names[0]
        if it["quality"]:
            rec["quality"] = max(it["quality"])
        for f in ("npcDrops", "objectDrops", "skinnedFrom", "questRewards", "questChoices", "questObjectiveOf"):
            if it[f]:
                rec[f] = sorted(it[f])
        src = [f for f in ("npcDrops", "objectDrops", "skinnedFrom", "questRewards", "questChoices") if it[f]]
        rec["obtainedBy"] = [{"npcDrops": "drop", "objectDrops": "object", "skinnedFrom": "skinning",
                          "questRewards": "questReward", "questChoices": "questChoice"}[f] for f in src]
        rec["samples"] = it["ev"].n
        rec["evidence"] = it["ev"].out()
        out_items[str(iid)] = rec

    # ---------- output: drops ----------
    solo_kills: dict[int, int] = defaultdict(int)
    for kr in kills:
        if kr["bucket"] == "solo":
            solo_kills[kr["npc"]] += 1
    mobs_out: dict[str, Any] = {}
    agg: dict[tuple[str, int], dict[str, Any]] = {}
    for w in windows:
        a = agg.setdefault((w["kind"], w["id"]), {"windows": 0, "flaggedWindows": 0, "items": {}})
        flagged = w["kind"] == "npc" and w["kill"] is not None and w["kill"]["bucket"] != "solo"
        a["flaggedWindows" if flagged else "windows"] += 1
        for iid, c in w["items"].items():
            r = a["items"].setdefault(iid, {"drops": 0, "items": 0, "flaggedDrops": 0, "flaggedItems": 0, "ev": Evidence()})
            if flagged:
                r["flaggedDrops"] += 1
                r["flaggedItems"] += c
            else:
                r["drops"] += 1
                r["items"] += c
            r["ev"].add(w["e"])
    quest_item_ids = {iid for iid, it in items.items() if it["questObjectiveOf"]}

    def item_rows(a: dict[str, Any], denom: int) -> dict[str, Any]:
        rows = {}
        for iid in sorted(a["items"]):
            r = a["items"][iid]
            row = {"name": sorted(x for x in items[iid]["names"] if x)[0] if items[iid]["names"] - {""} else "",
                   "drops": r["drops"], "items": r["items"], "dropPct": _pct(r["drops"], denom), "sampleSize": denom}
            if r["flaggedDrops"]:
                row["flaggedDrops"], row["flaggedItems"] = r["flaggedDrops"], r["flaggedItems"]
            if iid in quest_item_ids:
                row["questItem"] = True
            row["evidence"] = r["ev"].out()
            rows[str(iid)] = row
        return rows

    for nid in sorted({i for (k, i) in agg if k in ("npc", "skinning")} | set(solo_kills)):
        n = npcs.get(nid)
        rec: dict[str, Any] = {"name": sorted(x for x in n["names"] if x)[0] if n and n["names"] - {""} else ""}
        kc = {b: n["kills"][b] for b in KILL_BUCKETS if n and n["kills"].get(b)} if n else {}
        rec["kills"] = kc
        a = agg.get(("npc", nid))
        if a:
            rec["lootWindows"] = a["windows"]
            if a["flaggedWindows"]:
                rec["flaggedLootWindows"] = a["flaggedWindows"]
            rec["items"] = item_rows(a, solo_kills.get(nid, 0))
        sk = agg.get(("skinning", nid))
        if sk:
            rec["skinning"] = {"skinned": sk["windows"] + sk["flaggedWindows"],
                               "items": item_rows({"items": sk["items"]}, sk["windows"] + sk["flaggedWindows"])}
        mobs_out[str(nid)] = rec
    objects_drop: dict[str, Any] = {}
    for (k, oid), a in sorted(agg.items()):
        if k != "object":
            continue
        opened = a["windows"]
        objects_drop[str(oid)] = {"name": out_objects.get(str(oid), {}).get("name", ""), "opened": opened, "items": item_rows(a, opened)}
        if oid in guessed_objects:
            objects_drop[str(oid)]["sourceGuessed"] = True

    quest_rows: list[dict[str, Any]] = []
    for (qid, idx, iid, nid), r in sorted(quest_drop.items()):
        denom = sum(1 for kr in kills if kr["npc"] == nid and kr["bucket"] == "solo" and (qid, idx) in kr["needing"])
        flagged_kills = sum(1 for kr in kills if kr["npc"] == nid and kr["bucket"] != "solo" and (qid, idx) in kr["needing"])
        row = {"quest": qid, "questName": out_quests.get(str(qid), {}).get("name", ""), "objective": idx + 1,
               "item": iid, "itemName": out_items.get(str(iid), {}).get("name", ""), "mob": nid,
               "mobName": out_npcs.get(str(nid), {}).get("name", ""), "kills": denom, "drops": r["drops"], "items": r["items"],
               "dropPct": _pct(r["drops"], denom), "sampleSize": denom, "attributedBy": sorted(r["how"])}
        if flagged_kills or r["flaggedDrops"]:
            row["flagged"] = {"kills": flagged_kills, "drops": r["flaggedDrops"], "items": r["flaggedItems"]}
        row["evidence"] = r["ev"].out()
        quest_rows.append(row)
    out_drops = {"mobs": mobs_out, "objects": objects_drop, "quests": quest_rows,
                 "notes": {"dropPct": "drops / solo kills x 100 (quests: solo kills while that objective was unfinished)",
                           "drops": "loot windows (quests: objective increments) that held the item",
                           "items": "item count", "flagged": "from grouped, group-credit, untracked or tap-denied kills; not in dropPct"}}

    # ---------- output: xp ----------
    xp_q: dict[str, Any] = {}
    for qid in sorted(quest_xp):
        rows = [{"playerLevel": lv, "xp": xp, "money": mo, "samples": r["ev"].n, "evidence": r["ev"].out()}
                for (lv, xp, mo), r in sorted(quest_xp[qid].items())]
        xp_q[str(qid)] = {"name": out_quests.get(str(qid), {}).get("name", ""), "received": rows}
    per_mob: dict[int, dict[tuple[int, int, int], Evidence]] = defaultdict(dict)
    by_level: dict[tuple[int, int], dict[int, int]] = defaultdict(lambda: defaultdict(int))
    flagged_xp: dict[str, int] = defaultdict(int)
    for kr in kills:
        if kr["xp"] is None or kr["xp"] <= 0:
            continue
        if kr["bucket"] != "solo":
            flagged_xp[kr["bucket"]] += 1
            continue
        if kr["rested"]:
            flagged_xp["rested"] += 1
            continue
        if kr["plevel"] is None or kr["mlevel"] is None:
            flagged_xp["levelUnknown"] += 1
            continue
        key = (kr["mlevel"], kr["plevel"], kr["xp"])
        per_mob[kr["npc"]].setdefault(key, Evidence()).add(kr["e"])
        by_level[(kr["mlevel"], kr["plevel"])][kr["xp"]] += 1
    xp_k: dict[str, Any] = {}
    for nid in sorted(per_mob):
        xp_k[str(nid)] = {"name": out_npcs.get(str(nid), {}).get("name", ""),
                          "rows": [{"mobLevel": ml, "playerLevel": pl, "xp": xp, "samples": ev.n, "evidence": ev.out()}
                                   for (ml, pl, xp), ev in sorted(per_mob[nid].items())]}
    xp_lv = [{"mobLevel": ml, "playerLevel": pl, "xp": {str(v): c for v, c in sorted(vals.items())}, "samples": sum(vals.values())}
             for (ml, pl), vals in sorted(by_level.items())]
    xp_ex = [{"area": a, "playerLevel": lv, "xp": xp, "samples": r["ev"].n, "evidence": r["ev"].out(),
              **({"zoneKey": zone_key(r["map"])} if r["map"] else {})}
             for (a, lv, xp), r in sorted(explore_xp.items())]
    out_xp = {"quests": xp_q, "kills": xp_k, "killsByLevel": xp_lv, "explore": xp_ex,
              "excludedKills": dict(sorted(flagged_xp.items())),
              "notes": {"quests": "XP and copper from QUEST_TURNED_IN at the player's level then",
                        "kills": "solo, not rested, kill line XP; grouped / group-credit / untracked / tap-denied / rested kills are in excludedKills"}}

    # ---------- output: spawns ----------
    out_spawns: dict[str, Any] = {}
    for zk in sorted(spawns):
        out_spawns[zk] = {}
        for sub in sorted(spawns[zk]):
            out_spawns[zk][sub or "?"] = {
                str(nid): {"name": sorted(x for x in r["names"] if x)[0] if r["names"] - {""} else "",
                           "points": [list(p) for p in sorted(r["points"])], "samples": r["n"]}
                for nid, r in sorted(spawns[zk][sub].items())}

    # ---------- output: trainers ----------
    out_tr: dict[str, Any] = {}
    for key in sorted(trainers):
        tr = trainers[key]
        rec = {"status": STATUS}
        if tr["npcId"]:
            rec["npcId"] = tr["npcId"]
        rec["name"] = sorted(x for x in tr["names"] if x)[0] if tr["names"] - {""} else ""
        if tr["idFrom"]:
            rec["idFrom"] = sorted(tr["idFrom"])
        if tr["types"]:
            rec["trainerTypes"] = sorted(tr["types"])
        if tr["classes"]:
            rec["seenBy"] = sorted(tr["classes"])
        sp = tr["points"].out()
        if sp:
            rec["spawns"] = sp
        if tr["taught"]:
            rec["taught"] = [{**{k: v for k, v in row.items() if k != "ev"}, "samples": row["ev"].n, "evidence": row["ev"].out()}
                             for _, row in sorted(tr["taught"].items())]
        rec["visits"] = tr["visits"]
        rec["samples"] = tr["ev"].n
        rec["evidence"] = tr["ev"].out()
        out_tr[key] = rec

    # ---------- output: zones ----------
    out_zones: dict[str, Any] = {}
    for zk in sorted(set(zone_names) | set(subzones)):
        rec = {"uiMapId": int(zk.split(":")[1])}
        names = sorted(zone_names.get(zk, set()))
        if names:
            rec["name"] = names[0]
        if subzones.get(zk):
            rec["subzones"] = sorted(subzones[zk])
        out_zones[zk] = rec

    observed_by = [{"class": c, "race": r, "faction": f} for (c, r, f) in sorted(observers)]
    return {
        "quests.json": out_quests,
        "npcs.json": out_npcs,
        "objects.json": out_objects,
        "items.json": out_items,
        "zones.json": out_zones,
        "drops.json": out_drops,
        "xp.json": out_xp,
        "spawns.json": out_spawns,
        "trainers.json": out_tr,
        "_sessions": meta_sessions,
        "_observedBy": observed_by,
    }
