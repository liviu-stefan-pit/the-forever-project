"""Classic dungeon pack fixes applied to dungeons.json.

Removes miscategorized quests and keeps each shared chain quest in exactly
one home dungeon, chosen from QuestieDB (zone, then next-quest walk).

Run from this folder:
  python3 pack_fixes.py && python3 match_forever.py && python3 steps.py && python3 readme.py
"""
from __future__ import annotations

import json
from collections import defaultdict
from copy import deepcopy

from paths import DUNGEONS_JSON, QUESTS_JSON, NPCS_JSON, OBJECTS_JSON, ITEMS_JSON, ZONES_JSON

# Classic areaId → dungeon id (same mapping as qsel.py).
DUNGEON_ZONE_IDS = {
    2437: "ragefire-chasm",
    718: "wailing-caverns",
    209: "shadowfang-keep",
    719: "blackfathom-deeps",
    491: "razorfen-kraul",
    796: "scarlet-monastery",
    722: "razorfen-downs",
    1337: "uldaman",
    1176: "zulfarrak",
    2100: "maraudon",
    1477: "sunken-temple",
    1584: "blackrock-depths",
    1583: "blackrock-spire",
    2557: "dire-maul",
    2057: "scholomance",
    2017: "stratholme",
}
ALT = {
    236: 209,
    1717: 491,
    2797: 719,
    1316: 722,
    6109: 796,
    978: 1176,
    1517: 1337,
    1417: 1477,
    1585: 1584,
    2277: 2557,
    2577: 2557,
    2279: 2017,
}

# Not dungeon quests. 8588 is an AQ war-effort Heavy Leather turn-in in Orgrimmar;
# it is also absent from the QuestieDB v1.1.3 Forever Horde import.
REMOVE = {
    8588: {
        "name": "The Horde Needs Heavy Leather!",
        "reason": (
            "Removed: miscategorized. This is a level-60 AQ war-effort turn-in to "
            "Skinner Jamani in Orgrimmar, not a dungeon quest. It is not in "
            "content/questie-db/quests.json (the QuestieDB v1.1.3 Forever import). "
            "It had been attached to Uldaman only because Heavy Leather can drop "
            "from a basilisk inside the instance."
        ),
    },
}

# Follow-ups that must sit in the same section as (and after) this prereq.
# 5463 Menethil's Gift is a Stratholme dungeon quest; 5464/5465 are world
# follow-ups and 5466 (The Lich, Ras Frostwhisper) finishes the chain in Scholomance,
# so all three have to come after 5463's turn-in. They live in the Strat section.
FOLLOW_AFTER = {5464: 5463, 5465: 5463, 5466: 5463}

# Shared with the 40-60 leveling route (PR #27). Owner is decided from
# QuestieDB objective locations only: if any objective mob/object/item
# source spawns in a dungeon zone, the dungeon pack keeps the quest;
# otherwise 40-60 owns it and this pack drops accept, turn-in, and
# objective references.
OVERLAP_40_60 = (1424, 1429, 2258, 4145, 4726, 4808, 4809, 5542, 5543, 5544, 6133)


def dungeon_of_zone(zid):
    if zid is None:
        return None
    zid = int(zid)
    if zid in DUNGEON_ZONE_IDS:
        return DUNGEON_ZONE_IDS[zid]
    if zid in ALT:
        return DUNGEON_ZONE_IDS[ALT[zid]]
    return None


def next_ids(q):
    nxt = q.get("next")
    if nxt is None:
        return []
    if isinstance(nxt, list):
        return [int(x) for x in nxt]
    return [int(nxt)]


def walk_next_dungeon(qid, quests, listings):
    """Follow QuestieDB next links until a quest whose zone is one of the listings."""
    seen = set()
    queue = list(next_ids(quests.get(str(qid)) or {}))
    while queue:
        nid = queue.pop(0)
        if nid in seen:
            continue
        seen.add(nid)
        nq = quests.get(str(nid))
        if not nq:
            continue
        dz = dungeon_of_zone(nq.get("zoneId"))
        if dz in listings:
            return dz
        queue.extend(next_ids(nq))
    return None


def home_dungeon(qid, listings, quests):
    """listings: ordered unique dungeon ids that currently include this quest."""
    listed = list(dict.fromkeys(listings))
    q = quests.get(str(qid)) or {}
    dz = dungeon_of_zone(q.get("zoneId"))
    if dz in listed:
        return dz, f"QuestieDB zone is {q.get('zone')} ({q.get('zoneId')}), which is {dz}."
    walked = walk_next_dungeon(qid, quests, set(listed))
    if walked:
        return walked, (
            f"Turn-in and quest zone are in the world (QuestieDB zone {q.get('zone')}); "
            f"the next dungeon quest in the imported chain is in {walked}."
        )
    return None, None


def _zone_ids_of(entity):
    zids = set()
    if not entity:
        return zids
    if entity.get("zoneId") is not None:
        zids.add(int(entity["zoneId"]))
    spawns = entity.get("spawns") or {}
    if isinstance(spawns, dict):
        for k in spawns:
            try:
                zids.add(int(k))
            except ValueError:
                pass
    return zids


def _zone_label(zid, zones):
    z = zones.get(str(int(zid))) or {}
    name = z.get("name")
    return f"{name} ({zid})" if name else str(zid)


def _item_sources(iid, items, npcs, objects, seen=None):
    seen = seen or set()
    if iid in seen:
        return []
    seen.add(iid)
    it = items.get(str(iid)) or {}
    out = []
    for nid in it.get("npcDrops") or []:
        n = npcs.get(str(nid)) or {}
        out.append(("npc", nid, n.get("name"), _zone_ids_of(n)))
    for oid in it.get("objectDrops") or []:
        o = objects.get(str(oid)) or {}
        out.append(("object", oid, o.get("name"), _zone_ids_of(o)))
    return out


def classify_overlap_quest(qid, quests, npcs, objects, items, zones):
    """Return owner and QuestieDB evidence for one overlapping quest."""
    q = quests.get(str(qid)) or {}
    evidence = []
    dungeon_ids = []
    objs = q.get("objectives") or {}

    def add_ev(kind, eid, name, zids):
        zids = sorted(zids)
        dungs = []
        for z in zids:
            d = dungeon_of_zone(z)
            if d and d not in dungs:
                dungs.append(d)
        ev = {
            "kind": kind,
            "id": eid,
            "name": name,
            "zoneIds": zids,
            "zones": [_zone_label(z, zones) for z in zids],
            "dungeons": dungs,
        }
        evidence.append(ev)
        dungeon_ids.extend(dungs)

    for c in objs.get("creatures") or []:
        nid = c["id"] if isinstance(c, dict) else c
        n = npcs.get(str(nid)) or {}
        add_ev("npc", nid, n.get("name"), _zone_ids_of(n))
    for raw in objs.get("objects") or []:
        oid = raw["id"] if isinstance(raw, dict) else raw
        o = objects.get(str(oid)) or {}
        add_ev("object", oid, o.get("name"), _zone_ids_of(o))
    for raw in objs.get("items") or []:
        iid = raw["id"] if isinstance(raw, dict) else raw
        it = items.get(str(iid)) or {}
        sources = _item_sources(iid, items, npcs, objects)
        if not sources:
            add_ev("item", iid, it.get("name"), set())
        for kind, eid, name, zids in sources:
            add_ev(kind, eid, name, zids)

    unique_d = list(dict.fromkeys(dungeon_ids))
    if unique_d:
        owner = "dungeon"
        slug = unique_d[0] if len(unique_d) == 1 else unique_d
        reason = (
            "Objectives include sources that spawn inside a dungeon zone in "
            "content/questie-db, so the dungeon pack keeps this quest."
        )
    else:
        owner = "40-60"
        slug = None
        if evidence:
            reason = (
                "All QuestieDB objective mobs/objects/items spawn in the open world, "
                "not in a dungeon zone; the 40-60 route owns accept and turn-in."
            )
        else:
            reason = (
                "QuestieDB lists no objective mobs, objects, or items (a world delivery); "
                "the 40-60 route owns accept and turn-in."
            )
    return {
        "id": qid,
        "name": q.get("name"),
        "owner": owner,
        "ownerDungeon": slug if owner == "dungeon" else None,
        "evidence": evidence,
        "reason": reason,
    }


def apply_fixes():
    doc = json.loads(DUNGEONS_JSON.read_text())
    quests = json.loads(QUESTS_JSON.read_text())
    npcs = json.loads(NPCS_JSON.read_text())
    objects = json.loads(OBJECTS_JSON.read_text())
    items = json.loads(ITEMS_JSON.read_text())
    zones = json.loads(ZONES_JSON.read_text())
    report = {"removed": [], "homes": [], "missing_from_import": [], "unresolved": [], "overlap": [], "handed_over": []}

    # --- drop miscategorized / missing-import quests ---
    for x in doc["dungeons"]:
        kept = []
        for q in x["quests"]:
            qid = q.get("id")
            if qid in REMOVE:
                info = REMOVE[qid]
                report["removed"].append(
                    {"id": qid, "name": q.get("name") or info["name"], "wasIn": x["id"], "reason": info["reason"]}
                )
                continue
            kept.append(q)
        x["quests"] = kept
        x["questCount"] = len(kept)

    # --- 40-60 overlap: drop open-world quests, keep any whose objectives are in a dungeon ---
    classified = {
        qid: classify_overlap_quest(qid, quests, npcs, objects, items, zones)
        for qid in OVERLAP_40_60
    }
    report["overlap"] = [classified[qid] for qid in OVERLAP_40_60]
    drop_ids = {qid for qid, rec in classified.items() if rec["owner"] == "40-60"}
    for x in doc["dungeons"]:
        kept = []
        for q in x["quests"]:
            qid = q.get("id")
            if qid in drop_ids:
                rec = classified[qid]
                ev = "; ".join(
                    f"{e['kind']} {e['id']} {e['name'] or '?'} in {', '.join(e['zones']) or 'unknown zone'}"
                    for e in rec["evidence"]
                ) or "no objective mobs/objects/items in QuestieDB"
                report["handed_over"].append({
                    "id": qid,
                    "name": q.get("name") or rec["name"],
                    "wasIn": x["id"],
                    "owner": "40-60",
                    "evidence": rec["evidence"],
                    "reason": (
                        f"Dropped from the dungeon pack; the 40-60 route owns accept and turn-in. {rec['reason']} "
                        f"Evidence: {ev}."
                    ),
                })
                continue
            kept.append(q)
        x["quests"] = kept
        x["questCount"] = len(kept)

    # Scan remaining ids against the Forever import (classic + forever lists).
    import_ids = set(int(k) for k in quests)
    for x in doc["dungeons"]:
        for q in x["quests"]:
            qid = q.get("id")
            if qid is not None and qid not in import_ids:
                report["missing_from_import"].append(
                    {"id": qid, "name": q.get("name"), "dungeon": x["id"], "category": q.get("category")}
                )
    for nd in doc.get("wowForever", {}).get("newDungeons") or []:
        for q in nd.get("quests") or []:
            qid = q.get("id")
            if qid is not None and qid not in import_ids:
                report["missing_from_import"].append(
                    {"id": qid, "name": q.get("name"), "dungeon": nd.get("id"), "category": "forever"}
                )

    # --- one home dungeon for each shared non-endgame quest ---
    locs = defaultdict(list)
    for x in doc["dungeons"]:
        for q in x["quests"]:
            if q.get("category") == "endgame":
                continue
            locs[q["id"]].append(x["id"])

    homes = {}
    for qid, listed in locs.items():
        if len(set(listed)) < 2:
            continue
        home, why = home_dungeon(qid, listed, quests)
        if not home:
            report["unresolved"].append({"id": qid, "listed": listed})
            continue
        qname = (quests.get(str(qid)) or {}).get("name")
        removed_from = [d for d in dict.fromkeys(listed) if d != home]
        homes[qid] = {"id": qid, "name": qname, "home": home, "removedFrom": removed_from, "reason": why}
        report["homes"].append(homes[qid])

    if report["unresolved"]:
        raise SystemExit(f"could not choose a home dungeon for {report['unresolved']}")

    for x in doc["dungeons"]:
        kept = []
        for q in x["quests"]:
            qid = q.get("id")
            if qid in homes and x["id"] != homes[qid]["home"]:
                continue
            kept.append(q)
        x["quests"] = kept
        x["questCount"] = len(kept)

    # Move follow-ups into the section of their anchor prereq (after that quest).
    report["moved"] = []
    # Recs by id; dest is the dungeon that currently holds the anchor (5463).
    recs = {}
    owners = {}
    for x in doc["dungeons"]:
        for q in x["quests"]:
            recs[q["id"]] = q
            owners[q["id"]] = x["id"]
    # Group follow-ups by destination dungeon and insert once, in chain order, after the anchor.
    groups = {}
    for qid, anchor in FOLLOW_AFTER.items():
        if qid not in recs or anchor not in recs:
            continue
        dest_id = owners[anchor]
        groups.setdefault((dest_id, anchor), []).append(qid)
    for (dest_id, anchor), qids in groups.items():
        # Stable chain order: 5464, 5465, 5466 (numeric happens to be the chain).
        qids = sorted(qids)
        dest = next(x for x in doc["dungeons"] if x["id"] == dest_id)
        moving = []
        for qid in qids:
            rec = recs[qid]
            src_id = owners[qid]
            src = next(x for x in doc["dungeons"] if x["id"] == src_id)
            src["quests"] = [q for q in src["quests"] if q["id"] != qid]
            src["questCount"] = len(src["quests"])
            moving.append((qid, rec, src_id))
        # Insert immediately after the anchor, replacing any previous placement.
        idx = next(i for i, q in enumerate(dest["quests"]) if q["id"] == anchor)
        for i, (qid, rec, src_id) in enumerate(moving):
            dest["quests"].insert(idx + 1 + i, rec)
            owners[qid] = dest_id
            report["moved"].append({
                "id": qid,
                "name": rec.get("name"),
                "from": src_id,
                "to": dest_id,
                "after": anchor,
                "reason": (
                    "Moved after Menethil's Gift (5463) in the Stratholme section so the "
                    "Ras Frostwhisper follow-ups are accepted only after 5463 is turned in."
                ),
            })
        dest["questCount"] = len(dest["quests"])

    def merge_by_id(old, new):
        by = {x["id"]: x for x in old or []}
        for x in new or []:
            by[x["id"]] = x
        return list(by.values())

    # Skip no-op moves (already in the destination) from the stored report.
    report["moved"] = [m for m in report["moved"] if m["from"] != m["to"]]
    prev = doc.get("packFixes") or {}
    handed = merge_by_id(prev.get("handedTo40_60"), report["handed_over"])
    handed_ids = {x["id"] for x in handed}
    homes = merge_by_id(prev.get("singleHome"), report["homes"])
    homes = [h for h in homes if h["id"] not in handed_ids]
    moved = merge_by_id(prev.get("movedQuests"), report["moved"])
    moved = [m for m in moved if m["id"] not in handed_ids]
    doc["packFixes"] = {
        "removedQuests": merge_by_id(prev.get("removedQuests"), report["removed"]),
        "singleHome": homes,
        "movedQuests": moved,
        "handedTo40_60": handed,
        "overlapWith40_60": report["overlap"],
        "missingFromImport": report["missing_from_import"],
    }
    report["removed"] = doc["packFixes"]["removedQuests"]
    report["homes"] = doc["packFixes"]["singleHome"]
    report["moved"] = doc["packFixes"]["movedQuests"]
    report["handed_over"] = doc["packFixes"]["handedTo40_60"]
    DUNGEONS_JSON.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    return report


def main():
    report = apply_fixes()
    print("removed:")
    for r in report["removed"]:
        print(f"  {r['id']} {r['name']!r} from {r['wasIn']}")
    print(f"\nsingle-home assignments ({len(report['homes'])}):")
    for r in report["homes"]:
        print(f"  {r['id']} {r['name']!r} -> {r['home']} (dropped from {', '.join(r['removedFrom'])})")
    print("\nmoved:")
    for r in report["moved"]:
        print(f"  {r['id']} {r['name']!r} {r['from']} -> {r['to']} (after {r['after']})")
    print(f"\n40-60 overlap ({len(report['overlap'])}):")
    for r in report["overlap"]:
        ev = "; ".join(
            f"{e['kind']} {e['id']} {e['name'] or '?'} / {', '.join(e['zones']) or 'unknown zone'}"
            for e in r.get("evidence") or []
        ) or "no objective mobs/objects/items"
        owner = f"dungeon {r['ownerDungeon']}" if r["owner"] == "dungeon" else "40-60"
        print(f"  {r['id']} {r['name']!r} -> {owner} | {ev}")
    print("\nmissing from content/questie-db after removals:", report["missing_from_import"] or "none")


if __name__ == "__main__":
    main()
