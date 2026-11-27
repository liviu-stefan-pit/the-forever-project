"""Unconfirmed records: zone quests the logs have not shown yet, taken from QuestieDB.

These records are GPL-3.0 (QuestieDB) and live only under ``content/tpf-db/unconfirmed/``. Every record has
``status: "unconfirmed"`` and ``source`` naming where each field came from. They are never written into the
confirmed files.

Promotion: when a log shows a quest that the previous ``unconfirmed/quests.json`` listed, the quest is built
from the log into the confirmed files (with evidence) and leaves ``unconfirmed/``. ``promote`` reports those ids.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable

__all__ = ["questie_label", "zone_area_ids", "zone_quest_ids", "build_unconfirmed", "promote", "CLASS_BITS", "class_names"]

UNCONFIRMED = "unconfirmed"

CLASS_BITS = {1: "Warrior", 2: "Paladin", 4: "Hunter", 8: "Rogue", 16: "Priest", 32: "Death Knight", 64: "Shaman",
              128: "Mage", 256: "Warlock", 512: "Monk", 1024: "Druid"}

QUEST_FIELDS = ("name", "level", "reqLevel", "races", "classes", "zoneId", "zone", "sort", "start", "end", "objectives",
                "objectivesText", "pre", "next", "exclusiveTo", "breadcrumbFor", "sourceItem", "xp", "repeatable", "tag",
                "requiredSkill", "flags")
NPC_FIELDS = ("name", "sub", "minLevel", "maxLevel", "rank", "friendly", "zoneId", "spawns", "services", "questStarts", "questEnds")
OBJECT_FIELDS = ("name", "zoneId", "spawns", "questStarts", "questEnds")
ITEM_FIELDS = ("name", "itemLevel", "reqLevel", "class", "subClass", "npcDrops", "objectDrops", "itemDrops", "vendors",
               "startQuest", "relatedQuests", "questRewards")


def class_names(mask: int | None) -> list[str]:
    if not mask:
        return []
    return [n for b, n in sorted(CLASS_BITS.items()) if mask & b]


def questie_label(questie_dir: Path) -> str:
    """``"QuestieDB <commit[:8]>"`` from ``meta.json`` pins (the snapshot has no release version)."""
    meta = json.loads((questie_dir / "meta.json").read_text(encoding="utf-8"))
    pin = (meta.get("pins") or {}).get("questiedb") or {}
    if pin.get("version"):
        return f"QuestieDB {pin['version']}"
    return f"QuestieDB {str(pin.get('commit', '?'))[:8]}"


def _load(questie_dir: Path, name: str) -> dict[str, Any]:
    p = questie_dir / name
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}


def zone_area_ids(zones: dict[str, Any], names: Iterable[str]) -> set[str]:
    """AreaTable ids of the named zones and every area under them."""
    want = set(names)
    roots = {k for k, v in zones.items() if v.get("name") in want and v.get("parent") is None}
    out = set(roots)
    changed = True
    while changed:
        changed = False
        for k, v in zones.items():
            if k not in out and str(v.get("parent")) in out:
                out.add(k)
                changed = True
    return out


def zone_quest_ids(qdb: dict[str, dict[str, Any]], areas: set[str]) -> set[int]:
    """Quests whose zone is one of ``areas``, or whose first giver (NPC or object) spawns there."""
    quests, npcs, objects = qdb["quests"], qdb["npcs"], qdb["objects"]

    def spawns_in(e: dict[str, Any] | None) -> bool:
        return any(k in areas for k in ((e or {}).get("spawns") or {}))

    out = set()
    for k, q in quests.items():
        start = q.get("start") or {}
        if str(q.get("zoneId")) in areas \
                or any(spawns_in(npcs.get(str(i))) for i in start.get("npc") or []) \
                or any(spawns_in(objects.get(str(i))) for i in start.get("object") or []):
            out.add(int(k))
    return out


def _record(src: dict[str, Any], fields: tuple[str, ...], label: str, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    rec: dict[str, Any] = {"id": src.get("id"), "status": UNCONFIRMED}
    source: dict[str, str] = {}
    for f in fields:
        if f in src and src[f] not in (None, [], {}, ""):
            rec[f] = src[f]
            source[f] = label
    rec.update(extra or {})
    rec["source"] = source
    return rec


def build_unconfirmed(questie_dir: Path, zone_names: Iterable[str], confirmed: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Unconfirmed files for every QuestieDB quest in ``zone_names`` that ``confirmed`` (the confirmed quests.json,
    npcs.json, objects.json, items.json) does not hold, plus the NPCs, objects and items those quests name."""
    label = questie_label(questie_dir)
    qdb = {n: _load(questie_dir, f"{n}.json") for n in ("quests", "npcs", "objects", "items", "zones")}
    areas = zone_area_ids(qdb["zones"], zone_names)
    ids = sorted(zone_quest_ids(qdb, areas) - {int(k) for k in confirmed.get("quests.json", {})})
    out_q: dict[str, Any] = {}
    need_npc: set[int] = set()
    need_obj: set[int] = set()
    need_item: set[int] = set()
    for qid in ids:
        q = qdb["quests"][str(qid)]
        extra = {}
        cn = class_names(q.get("classes"))
        if cn:
            extra["classNames"] = cn
        out_q[str(qid)] = _record(q, QUEST_FIELDS, label, extra)
        for side in ("start", "end"):
            s = q.get(side) or {}
            need_npc.update(s.get("npc") or [])
            need_obj.update(s.get("object") or [])
            need_item.update(s.get("item") or [])
        o = q.get("objectives") or {}
        need_npc.update(c["id"] for c in o.get("creatures") or [] if "id" in c)
        need_obj.update(c["id"] for c in o.get("objects") or [] if "id" in c)
        need_item.update(c["id"] for c in o.get("items") or [] if "id" in c)
        if q.get("sourceItem"):
            need_item.add(q["sourceItem"])

    def pick(kind: str, need: set[int], fields: tuple[str, ...], conf_file: str) -> dict[str, Any]:
        have = confirmed.get(conf_file, {})
        return {str(i): _record(qdb[kind][str(i)], fields, label) for i in sorted(need)
                if str(i) in qdb[kind] and str(i) not in have}

    return {
        "quests.json": out_q,
        "npcs.json": pick("npcs", need_npc, NPC_FIELDS, "npcs.json"),
        "objects.json": pick("objects", need_obj, OBJECT_FIELDS, "objects.json"),
        "items.json": pick("items", need_item, ITEM_FIELDS, "items.json"),
        "_label": label,
    }


def promote(previous_unconfirmed: dict[str, Any], confirmed_quests: dict[str, Any]) -> list[int]:
    """Quest ids that the previous unconfirmed set listed and the logs now confirm."""
    return sorted(int(k) for k in previous_unconfirmed if k in confirmed_quests)
