"""Match Forever dungeon quests in dungeons.json to content/questie-db ids.

Run from the repo root or this folder:
  python3 research/dungeons/tools/match_forever.py
"""
from __future__ import annotations

import json
import re
from copy import deepcopy

from paths import (
    DUNGEONS_JSON,
    ITEMS_JSON,
    NPCS_JSON,
    OBJECTS_JSON,
    QUESTS_JSON,
    ZONES_JSON,
)
from forever_new import NEW

FORBIDDEN = {79953, 81951}
QUESTIE_SOURCE = "content/questie-db"
COORD_SOURCE = "content/questie-db (QuestieDB v1.1.3 Forever)"
QUESTIE_NOTE = (
    "Matched to QuestieDB v1.1.3 (content/questie-db) by name, then checked against "
    "level, giver and zone or dungeon. Still verified: false until checked in game."
)

# Confirmed matches for the original 40 fan-listed quests.
# Key is (dungeon name, fan quest name).
MATCHES = {
    ("Ruins of Lordaeron", "Light's Justice"): 92421,
    ("Ruins of Lordaeron", "The New Plague"): 95216,
    ("Ruins of Lordaeron", "The Wrath of Rath'mael"): 92422,
    ("Ruins of Lordaeron", "A Frightened Request"): 92401,
    ("Ruins of Lordaeron", "Unending Torment"): 97288,
    ("Ruins of Lordaeron", "Crest of Lordaeron"): 95204,
    ("City of Dalaran", "Prison Break In"): 544,
    ("City of Dalaran", "Key to the City"): 93680,
    ("City of Dalaran", "Dalaran Patrols"): 545,
    ("City of Dalaran", "Blood in the Streets"): 92434,
    ("City of Dalaran", "Heart of Disruption"): 96984,
    ("City of Dalaran", "Source of Power"): 96988,
    ("City of Dalaran", "The Grave Knight"): 96986,
    ("City of Dalaran", "Opportunistic Education"): 96987,
    ("Excavation Site: Wetlands", "Changing Tastes"): 95697,
    ("Excavation Site: Wetlands", "Open the Maw"): 95682,
    ("Excavation Site: Wetlands", "Elder Knowledge"): 95664,
    ("Excavation Site: Wetlands", "Earthen Echo"): 98823,
    ("The Drowned City", "The Drowned City"): 95775,
    ("The Drowned City", "The Only Good Brinescale..."): 95776,
    ("The Drowned City", "Ancient Gurubashi Idol"): 96774,
    ("The Drowned City", "Shady Saltseers"): 95789,
    ("The Drowned City", "The Saltseer Captain"): 95791,
    ("Krol'dok Stronghold", "A Token of Vengeance"): 94975,
    ("Krol'dok Stronghold", "Eye of Mugg"): 94968,
    ("Krol'dok Stronghold", "Tome of Twilight"): 94972,
    ("Krol'dok Stronghold", "Krol'dok Moulding / Key Ingredients"): 94973,
    ("Alcaz Prison", "The Missing Kor'kron"): 95283,
    ("Alcaz Prison", "The Elite of the Elite"): 95284,
    ("Alcaz Prison", "No Orc Left Behind"): 95309,
    ("Alcaz Prison", "A Little Payback"): 96332,
    ("Alcaz Prison", "Blood Red Bandanas"): 96334,
    ("Blackmaw Hold", "Get to the Roots of It"): 92343,
    ("Blackmaw Hold", "Blackmaw Magic"): 97198,
    ("Blackmaw Hold", "The Twin Bears"): 92066,
    ("Shaper's Terrace", "Crystalline Elements"): 95928,
    ("Shaper's Terrace", "Essence of Seeping Slimes"): 97049,
    ("Shaper's Terrace", "The Dark Crystal"): 95926,
    ("Hall of Thanes", "An Ancient Grudge"): 96395,
}

# Extra notes for specific original matches.
MATCH_NOTES = {
    97288: (
        "This is the first of a five-part chain that shares the name Unending Torment "
        "(ids 97288-97292). Later steps are Undercity follow-ups, not listed separately."
    ),
    544: (
        "The imported record is Classic Era (not forever-new) and has no foreverConfidence. "
        "Name, giver (Magus Wordeen Voidglare), level and Tarren Mill / Hillsbrad zone agree. "
        "In the import, Dalaran Patrols (545) follows this attunement chain toward the Forever dungeon."
    ),
    545: (
        "The imported record is Classic Era (not forever-new) and has no foreverConfidence. "
        "Name, giver (Magus Wordeen Voidglare), level and Tarren Mill / Hillsbrad zone agree. "
        "The import lists next=92434 (Blood in the Streets), the Forever attunement step."
    ),
    96987: (
        "The import has no start or end NPC for this quest; giver name is kept from the fan listing. "
        "Name, level and City of Dalaran dungeon zone agree."
    ),
}

# New Horde dungeon quests clearly tied to these nine dungeons and missing from the original 40.
# Insert after the named existing quest (or at the end if after is None).
ADDED = [
    {"dungeon": "Excavation Site: Wetlands", "id": 95663, "after": "Changing Tastes"},
    {"dungeon": "Krol'dok Stronghold", "id": 94974, "after": "Krol'dok Moulding"},
    {"dungeon": "Alcaz Prison", "id": 95285, "after": "The Elite of the Elite"},
    {"dungeon": "Alcaz Prison", "id": 95454, "after": "No Orc Left Behind"},
    {"dungeon": "Alcaz Prison", "id": 96369, "after": "The Honor of the Kor'kron"},
    {"dungeon": "Alcaz Prison", "id": 95483, "after": "Bad News for Folkar"},
    {"dungeon": "Alcaz Prison", "id": 96335, "after": "Blood Red Bandanas"},
    {"dungeon": "Blackmaw Hold", "id": 92065, "after": "The Twin Bears"},
    {"dungeon": "Blackmaw Hold", "id": 97327, "after": "Blackmaw Reclamation"},
    {"dungeon": "Blackmaw Hold", "id": 99187, "after": "Blackmaw Pouches"},
]

ADD_NOTES = {
    94974: "Split from the original combined fan-guide row 'Krol'dok Moulding / Key Ingredients'.",
}

# Kept out of the Horde research data entirely (not listed as unmatched).
EXCLUDED = [
    {
        "dungeon": "Hall of Thanes",
        "name": "Important Heirlooms",
        "questId": 96403,
        "npcId": 265003,
        "npcName": "Thom Filch",
        "reason": (
            "Excluded from Horde data because it is probably Alliance-only: quest 96403 is not "
            "in the QuestieDB v1.1.3 Horde+neutral import (content/questie-db/quests.json). "
            "NPC 265003 Thom Filch exists in Ironforge and references that quest."
        ),
    },
]
UNMATCHED_NOTES = {}

QUESTIE_FOREVER_DATA = {
    "finding": (
        "QuestieDB v1.1.3 Forever data is imported in content/questie-db/ (Questie/QuestieDB "
        "release v1.1.3, commit 8b8df2d, artifact sha256 98201b11…624d). It includes 1,112 "
        "Forever-new Horde and neutral quests (1,110 high confidence, 2 low: 79953 and 81951, "
        "which are never used here). Forever dungeon quests in this file are matched to those "
        "ids by name, then checked against level, giver and zone or dungeon. Coordinates are "
        "Forever-frame zone map percents from that import. Every Forever quest stays "
        "verified: false until it is checked in game."
    ),
    "source": "https://github.com/Questie/QuestieDB/releases/tag/v1.1.3",
    "official": False,
}


def dungeon_id(name: str) -> str:
    s = (name or "").lower().replace("'", "").replace("’", "").replace("`", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def load_db():
    quests = json.loads(QUESTS_JSON.read_text())
    npcs = json.loads(NPCS_JSON.read_text())
    objects = json.loads(OBJECTS_JSON.read_text())
    items = json.loads(ITEMS_JSON.read_text())
    zones = json.loads(ZONES_JSON.read_text())
    return quests, npcs, objects, items, zones


def zone_name(zones, zid):
    if zid is None:
        return None
    z = zones.get(str(zid)) or {}
    name = z.get("name")
    return name or None


def first_spawn(entity, prefer_zone=None):
    spawns = (entity or {}).get("spawns") or {}
    order = []
    if prefer_zone is not None and str(prefer_zone) in spawns:
        order.append(str(prefer_zone))
    order.extend(k for k in spawns if k not in order)
    for zid in order:
        pts = spawns.get(zid) or []
        if not pts:
            continue
        x, y = pts[0][0], pts[0][1]
        if x is None or y is None or x < 0 or y < 0:
            continue
        return int(zid), round(float(x), 2), round(float(y), 2)
    return None, None, None


def actor(kind, eid, db, zones, prefer_zone=None):
    bucket = {"npc": db["npcs"], "object": db["objects"], "item": db["items"]}[kind]
    ent = bucket.get(str(eid)) or {}
    rec = {"type": kind, "id": int(eid), "name": ent.get("name") or f"{kind} {eid}"}
    if kind == "item":
        rec["zone"] = None
        rec["x"] = None
        rec["y"] = None
        return rec
    zid, x, y = first_spawn(ent, prefer_zone or ent.get("zoneId"))
    if zid is None and ent.get("zoneId"):
        zid = int(ent["zoneId"])
    rec["zoneId"] = zid
    rec["zone"] = zone_name(zones, zid) or ent.get("zone")
    rec["x"] = x
    rec["y"] = y
    if x is not None:
        rec["coordinateSource"] = COORD_SOURCE
    return rec


def first_actor(block, kind_order, db, zones, prefer_zone=None):
    block = block or {}
    for kind in kind_order:
        ids = block.get(kind) or []
        if ids:
            return actor(kind, ids[0], db, zones, prefer_zone)
    return None


def add_source(sources, row):
    sources = list(sources or [])
    if row not in sources:
        sources.append(row)
    return sources


def enrich_from_id(base, qid, db, extra_notes=None, added=False):
    qid = int(qid)
    if qid in FORBIDDEN:
        raise ValueError(f"forbidden quest id {qid}")
    q = db["quests"].get(str(qid))
    if not q:
        raise ValueError(f"quest {qid} missing from content/questie-db")
    out = deepcopy(base) if base else {}
    out["id"] = qid
    out["name"] = q.get("name") or out.get("name")
    out["forever"] = True
    out["verified"] = False
    if q.get("reqLevel") is not None:
        out["minLevel"] = q["reqLevel"]
    if q.get("level") is not None:
        out["questLevel"] = q["level"]
    if q.get("foreverConfidence"):
        out["foreverConfidence"] = q["foreverConfidence"]
    if q.get("foreverEvidence"):
        out["foreverEvidence"] = list(q["foreverEvidence"])
    texts = q.get("objectivesText") or []
    if texts and texts[0]:
        out["objectiveSummary"] = texts[0]
    giver = first_actor(q.get("start"), ("npc", "object", "item"), db, db["zones"], q.get("zoneId"))
    if not giver and q.get("sourceItem"):
        giver = actor("item", q["sourceItem"], db, db["zones"])
    if giver:
        out["giver"] = giver
    elif out.get("giver") is None:
        out["giver"] = None
    turn = first_actor(q.get("end"), ("npc", "object"), db, db["zones"], q.get("zoneId"))
    if turn:
        out["turnIn"] = turn
    # keep existing string turnIn if the import has no end NPC
    out["sources"] = add_source(out.get("sources"), QUESTIE_SOURCE)
    notes = []
    # drop stale fan/classic-only notes and any leftover copies from a previous enrich
    skip_frags = (
        "not in QuestieDB (Classic-era)",
        "Matched to QuestieDB v1.1.3",
        "This id is a Classic Era record",
        "The import has no start",
        "The import has no end",
        "Added from content/questie-db",
        "No confident match in QuestieDB",
        "Split from the original combined",
        "The imported record is Classic Era",
        "The import has no start or end NPC",
    )
    for n in out.get("verificationNotes") or []:
        if n and not any(s in n for s in skip_frags):
            notes.append(n)
    def add_note(n):
        if n and n not in notes:
            notes.append(n)
    add_note(QUESTIE_NOTE)
    if not q.get("forever"):
        add_note(
            "This id is a Classic Era record in the v1.1.3 import (no forever flag or foreverConfidence)."
        )
    add_note(extra_notes)
    if added:
        add_note("Added from content/questie-db; not in the original fan-guide list of 40.")
    if not giver:
        add_note("The import has no start NPC, object or item for this quest; no giver id was invented.")
    if not turn:
        add_note("The import has no end NPC or object for this quest; no turn-in id was invented.")
    out["verificationNotes"] = notes
    if q.get("pre"):
        out["prerequisitesFromImport"] = q["pre"]
    if q.get("next"):
        out["leadsTo"] = q["next"] if isinstance(q["next"], list) else [q["next"]]
    return out


def blank_quest():
    return {
        "id": None,
        "name": None,
        "minLevel": None,
        "questLevel": None,
        "giver": None,
        "objectiveSummary": None,
        "prerequisitesByName": [],
        "turnIn": None,
        "rewardsByName": [],
        "sources": [QUESTIE_SOURCE],
        "verified": False,
        "forever": True,
        "verificationNotes": [],
    }


def enrich_new_dungeons(new_dungeons, db=None):
    if db is None:
        quests, npcs, objects, items, zones = load_db()
        db = {"quests": quests, "npcs": npcs, "objects": objects, "items": items, "zones": zones}

    report = {
        "matched": [],
        "unmatched": [],
        "added": [],
        "slugs": {},
    }
    out = []
    for nd in new_dungeons:
        nd = deepcopy(nd)
        nd["id"] = dungeon_id(nd["name"])
        report["slugs"][nd["name"]] = nd["id"]
        nd["forever"] = True
        quests = []
        for q in nd.get("quests") or []:
            key = (nd["name"], q["name"])
            # Split the combined Krol'dok row: this entry becomes Moulding (94973).
            if q["name"] == "Krol'dok Moulding / Key Ingredients":
                q = deepcopy(q)
                q["name"] = "Krol'dok Moulding"
            qid = MATCHES.get((nd["name"], q.get("name"))) if q["name"] != "Krol'dok Moulding" else 94973
            # original key used the combined name
            if qid is None:
                qid = MATCHES.get((nd["name"], "Krol'dok Moulding / Key Ingredients")) if q["name"] == "Krol'dok Moulding" else None
            if qid:
                extra = MATCH_NOTES.get(qid)
                eq = enrich_from_id(q, qid, db, extra_notes=extra)
                quests.append(eq)
                report["matched"].append((nd["name"], eq["name"], qid, eq.get("foreverConfidence")))
            else:
                uq = deepcopy(q)
                uq["forever"] = True
                uq["verified"] = False
                note = UNMATCHED_NOTES.get((nd["name"], q["name"])) or (
                    "No confident match in QuestieDB v1.1.3 (content/questie-db); fan-guide fields left unchanged."
                )
                notes = list(uq.get("verificationNotes") or [])
                if note not in notes:
                    notes.append(note)
                uq["verificationNotes"] = notes
                quests.append(uq)
                report["unmatched"].append((nd["name"], q["name"]))
        # Insert added quests in the listed order, after the named quest if present.
        for add in ADDED:
            if add["dungeon"] != nd["name"]:
                continue
            already = any(q.get("id") == add["id"] for q in quests)
            if already:
                continue
            nq = enrich_from_id(blank_quest(), add["id"], db, extra_notes=ADD_NOTES.get(add["id"]), added=(add["id"] != 94974))
            after = add.get("after")
            idx = next((i for i, q in enumerate(quests) if q.get("name") == after), None)
            if idx is None:
                quests.append(nq)
            else:
                quests.insert(idx + 1, nq)
            report["added"].append((nd["name"], nq["name"], add["id"], nq.get("foreverConfidence")))
        nd["quests"] = quests
        excluded = [e for e in EXCLUDED if e["dungeon"] == nd["name"]]
        if excluded:
            nd["excludedQuests"] = excluded
        matched_here = sum(1 for q in quests if q.get("id"))
        nd["inQuestieDB"] = matched_here > 0
        excl_note = ""
        if excluded:
            excl_note = " " + " ".join(e["reason"] for e in excluded)
        nd["note"] = (
            f"Forever-only dungeon (id `{nd['id']}`). {matched_here} of {len(quests)} Horde quests "
            "matched to QuestieDB v1.1.3 in content/questie-db. All remain verified: false until "
            "checked in game. Quest 79953 and 81951 are not used."
            + excl_note
        )
        out.append(nd)
    return out, report


def patch_dungeons_json():
    doc = json.loads(DUNGEONS_JSON.read_text())
    wf = doc["wowForever"]
    wf["questieForeverData"] = QUESTIE_FOREVER_DATA
    for note in wf.get("notes") or []:
        if "they are not in QuestieDB, so no quest data yet" in (note.get("finding") or ""):
            note["finding"] = "Nine new five-player dungeons (levels 13-60) exist in WoW: Forever."
    # Always start from the fan-guide list in forever_new.py so re-runs stay idempotent.
    source = [{**n, "forever": True, "quests": [{**q, "forever": True} for q in n["quests"]]} for n in NEW]
    new, report = enrich_new_dungeons(source)
    wf["newDungeons"] = new
    DUNGEONS_JSON.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    return report


def main():
    report = patch_dungeons_json()
    print("slugs:")
    for name, slug in report["slugs"].items():
        print(f"  {slug:24} {name}")
    print(f"\nmatched {len(report['matched'])}:")
    for d, n, i, c in report["matched"]:
        print(f"  {i:5} {c or '-':5} [{d}] {n}")
    print(f"\nadded {len(report['added'])}:")
    for d, n, i, c in report["added"]:
        print(f"  {i:5} {c or '-':5} [{d}] {n}")
    print(f"\nunmatched {len(report['unmatched'])}:")
    for d, n in report["unmatched"]:
        print(f"  [{d}] {n}")


if __name__ == "__main__":
    main()
