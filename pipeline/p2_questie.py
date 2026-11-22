"""P2 — QuestieDB extraction (plan.md §4 P2).

    python -I pipeline/p2_questie.py [--verbose] [--skip-corrections]

Decodes every Quest/NPC/Object/Item row of the baked ``QuestieDB_Forever.toc`` into named
fields, merges the Dynamic Corrections for a Horde character (Lua 5.1 harness
``pipeline/lua/run_corrections.lua``), loads the support tables and writes
``data/build/questie/*.json`` plus ``data/reports/p2_questie.md``. Output is deterministic.
File formats are documented in the report and in plan.md §7.
"""
from __future__ import annotations

import argparse
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from pipeline.common.jsonio import write_json  # noqa: E402
from pipeline.common.paths import load_paths  # noqa: E402
from pipeline.p2 import corrections as corr  # noqa: E402
from pipeline.p2 import horde, normalize, support  # noqa: E402
from pipeline.p2.meta import ENTITIES, load_meta  # noqa: E402
from pipeline.p2.normalize import int_keys  # noqa: E402
from pipeline.p2.toc import TocStore  # noqa: E402

FORMAT_VERSION = 1
NPC_FIELDS = ("name", "subName", "minLevel", "maxLevel", "rank", "spawns", "zoneID", "questStarts",
              "questEnds", "factionID", "friendlyToFaction", "npcFlags")
TAG_NAMES = {1: "Elite", 21: "Class", 41: "PvP", 62: "Raid", 81: "Dungeon", 82: "World Event", 83: "Legendary",
             84: "Escort", 85: "Heroic", 88: "Raid (10)", 89: "Raid (25)", 98: "Scenario", 102: "Account",
             294: "Celestial"}
QUEST_FLAG_BITS = {"DAILY": 4096, "WEEKLY": 32768, "MONTHLY": 65536, "RAID": 64, "EPIC": 32,
                   "PARTY_ACCEPT": 2, "SHARABLE": 8, "STAY_ALIVE": 1, "EXPLORATION": 4, "AUTO_REWARDED": 1024}
RANK_NAMES = {1: "elite", 2: "rareelite", 3: "boss", 4: "rare"}


def log(verbose: bool, *msg: Any) -> None:
    if verbose:
        print("[p2]", *msg, flush=True)


# ---------------------------------------------------------------------------------------------
# decoding
# ---------------------------------------------------------------------------------------------

def decode_all(toc: TocStore, metas: dict[str, Any]) -> dict[str, dict[int, dict[int, Any]]]:
    raw: dict[str, dict[int, dict[int, Any]]] = {}
    for entity, meta in metas.items():
        tf = meta.table_fields
        raw[entity] = {eid: toc.raw_row(entity, eid, tf) for eid in toc.ids(entity)}
    return raw


def title_from_enum(name: str) -> str:
    small = {"of", "the", "and"}
    words = name.lower().split("_")
    return " ".join(w if (i and w in small) else w.capitalize() for i, w in enumerate(words))


# ---------------------------------------------------------------------------------------------
# main build
# ---------------------------------------------------------------------------------------------

def build(verbose: bool = False, skip_corrections: bool = False, paths: Any = None) -> dict[str, Any]:
    """Decode + correct. ``paths`` (a ``Paths``) overrides ``load_paths()`` (used by questie_import)."""
    P = paths or load_paths()
    t0 = time.perf_counter()
    timings: dict[str, float] = {}
    support_dir = P.questiedb_dir / "support" / "Forever"

    metas = load_meta(P.questiedb_dir)
    toc = TocStore.load(P.questiedb_toc)
    raw = decode_all(toc, metas)
    timings["decode"] = time.perf_counter() - t0
    log(verbose, "decoded", {e: len(r) for e, r in raw.items()}, f"{timings['decode']:.1f}s")

    # ---- dynamic corrections + Questie policy (Lua harness) ----------------------------------
    harness: dict[str, Any] = {}
    corr_status: dict[str, Any] = {"ran": False, "errors": [], "stats": {}}
    if not skip_corrections:
        try:
            harness = corr.run_harness(P.questiedb_dir, P.questie_dir, "Horde")
            corr_status["ran"] = True
            corr_status["errors"] = list(harness.get("errors") or [])
            for entity in ENTITIES:
                corr_status["stats"][entity] = corr.merge_dynamic(raw[entity], harness.get("dynamic", {}).get(entity, {}))
        except Exception as e:  # report and continue with baked rows only
            corr_status["errors"].append(f"harness failed: {e}")
    else:
        corr_status["errors"].append("skipped (--skip-corrections)")
    timings["corrections"] = time.perf_counter() - t0 - timings["decode"]
    log(verbose, "corrections", corr_status)

    enums = harness.get("enums") or {}
    race_keys = {k: int(v) for k, v in (enums.get("raceKeys") or {}).items()}
    if not race_keys:  # fallback: QuestieDB Forever raceKeys (expansions.lua) without Lua
        race_keys = {"NONE": 0, "HUMAN": 1, "ORC": 2, "DWARF": 4, "NIGHT_ELF": 8, "UNDEAD": 16, "TAUREN": 32,
                     "GNOME": 64, "TROLL": 128, "GOBLIN": 256, "SKYBORNE_ALLIANCE": 1 << 32,
                     "SKYBORNE_HORDE": 1 << 33, "ALL_HORDE": 178 + (1 << 33), "ALL_ALLIANCE": 77 + (1 << 32)}
    class_keys = {k: int(v) for k, v in (enums.get("classKeys") or {}).items()} or {
        "WARRIOR": 1, "PALADIN": 2, "HUNTER": 4, "ROGUE": 8, "PRIEST": 16, "SHAMAN": 64, "MAGE": 128,
        "WARLOCK": 256, "DRUID": 1024, "ALL_CLASSES": 1503}
    sort_keys = {int(v): k for k, v in (enums.get("sortKeys") or {}).items()}
    zone_enum = {int(v): k for k, v in sorted((enums.get("zoneIDs") or {}).items(), key=lambda kv: kv[0])}
    profession_sorts = {int(v) for k, v in (enums.get("sortKeys") or {}).items()
                        if k in ("ALCHEMY", "BLACKSMITHING", "COOKING", "ENCHANTING", "ENGINEERING", "FIRST_AID",
                                 "FISHING", "HERBALISM", "LEATHERWORKING", "MINING", "POISONS", "SKINNING",
                                 "TAILORING", "JEWELCRAFTING", "INSCRIPTION", "ARCHAEOLOGY")}
    class_sorts = {int(v) for k, v in (enums.get("sortKeys") or {}).items() if k.rstrip("S") in class_keys or k in class_keys}
    hmask = horde.horde_mask(race_keys)
    all_classes = class_keys.get("ALL_CLASSES", 1503)

    q_policy = harness.get("questie") or {}
    hide_on_map = q_policy.get("hideOnMap") or "HIDE_ON_MAP"
    hidden = int_keys(q_policy.get("hiddenQuests") or {})
    event_quests: dict[int, dict[str, Any]] = {}
    for entry in normalize.slots(q_policy.get("eventQuests")):
        s = normalize.slots(entry, 7)
        if isinstance(s[1], (int, float)):
            event_quests.setdefault(int(s[1]), {"event": s[0], "hide": bool(s[6])})
    aq = {int(k) for k in int_keys(q_policy.get("aqWarEffortQuests") or {})}
    invasion = {int(k) for k in int_keys(q_policy.get("invasionQuests") or {})}
    quest_tags = {int(k): normalize.slots(v, 2) for k, v in int_keys(q_policy.get("questTags") or {}).items()}
    npc_blacklist = {int(k) for k, v in int_keys(q_policy.get("npcBlacklist") or {}).items() if v}
    item_blacklist = {int(k) for k, v in int_keys(q_policy.get("itemBlacklist") or {}).items() if v}

    # ---- named rows ------------------------------------------------------------------------
    named: dict[str, dict[int, dict[str, Any]]] = {}
    for entity, meta in metas.items():
        named[entity] = {}
        for eid in sorted(raw[entity]):
            row = normalize.named_row(meta, raw[entity][eid], keep_empty_givers=(entity == "Quest"))
            row["id"] = eid
            named[entity][eid] = row
    quests, npcs, objects, items = named["Quest"], named["Npc"], named["Object"], named["Item"]

    # ---- support tables ----------------------------------------------------------------------
    zmaps = support.load_zone_maps(support_dir)
    dungeons = support.load_dungeons(support_dir, horde=True)
    zone_names = support.load_zone_names(P.questie_dir)
    xp = support.load_xp(support_dir)
    drops_tables = support.load_drop_tables(support_dir)
    dungeon_alias = {alt: a for a, d in dungeons.items() for alt in d["alternativeAreaIds"]}

    # ---- quest derivations ---------------------------------------------------------------------
    for qid, q in quests.items():
        q["origin"] = horde.origin_of("Quest", qid)
        q["custom"] = q["origin"] != "vanilla"
        if qid in xp:
            q["xp"] = {"level": xp[qid]["level"], "xp": xp[qid]["xp"], "src": xp[qid]["src"]}
        sf = int(q.get("specialFlags", 0))
        qf = int(q.get("questFlags", 0))
        q["repeatable"] = bool(sf & 1)
        if sf & 2:
            q["needsEvent"] = True
        flags = sorted(n for n, b in QUEST_FLAG_BITS.items() if qf & b)
        if flags:
            q["questFlagNames"] = flags
        h = hidden.get(qid)
        if h:
            q["blacklist"] = "hide_on_map" if h == hide_on_map else "hidden"
        if qid in event_quests:
            q["eventOnly"] = True
            q["eventName"] = event_quests[qid]["event"]
        if qid in aq:
            q["aqWarEffort"] = True
        if qid in invasion:
            q["invasion"] = True
        if qid in quest_tags and quest_tags[qid][0]:
            tid = int(quest_tags[qid][0])
            q["tag"] = {"id": tid, "name": TAG_NAMES.get(tid, str(quest_tags[qid][1]))}
        zs = int(q.get("zoneOrSort", 0))
        if zs > 0:
            q["areaId"] = zs
        elif zs < 0:
            q["sort"] = sort_keys.get(zs, str(zs))
        races = int(q.get("requiredRaces", 0))
        if races:
            q["raceNames"] = horde.race_names(races, race_keys)
        classes = int(q.get("requiredClasses", 0))
        if classes and classes & all_classes != all_classes:
            q["classNames"] = horde.class_names(classes, class_keys)
            q["classQuest"] = True
        elif zs in class_sorts:
            q["classQuest"] = True
        if q.get("requiredSkill") or zs in profession_sorts:
            q["professionQuest"] = True
        # group/elite hints for P5 (Blizzard's quest tag API is not available offline)
        hints = []
        if "tag" in q and q["tag"]["id"] in (1, 62, 81, 85, 88, 89, 41):
            hints.append(f"tag:{q['tag']['name']}")
        if qf & QUEST_FLAG_BITS["RAID"]:
            hints.append("flag:RAID")
        if zs > 0 and (zs in dungeons or zs in dungeon_alias):
            hints.append("zone:dungeon")
        for c in q.get("objectives", {}).get("creatures", []):
            rank = npcs.get(c["id"], {}).get("rank", 0)
            if rank in (1, 2, 3):
                hints.append(f"mob:{c['id']}:{RANK_NAMES[rank]}")
        if hints:
            q["groupHints"] = hints

    # ---- Horde filter --------------------------------------------------------------------------
    excluded: Counter[str] = Counter()
    horde_quests: dict[int, dict[str, Any]] = {}
    for qid, q in quests.items():
        reason = horde.horde_filter_reason(q, hmask)
        if reason is None and not q.get("requiredRaces"):
            st = q.get("startedBy") or {}
            starters = st.get("npc", [])
            if starters and not st.get("object") and not st.get("item") and all(
                    npcs.get(n, {}).get("friendlyToFaction") == "A" for n in starters):
                reason = "alliance-starters"
        if reason:
            excluded[reason] += 1
            continue
        horde_quests[qid] = q

    # ---- referenced entities ------------------------------------------------------------------
    ref_npcs: set[int] = set()
    ref_objects: set[int] = set()
    ref_items: set[int] = set()
    for q in horde_quests.values():
        for key in ("startedBy", "finishedBy"):
            g = q.get(key) or {}
            ref_npcs.update(g.get("npc", []))
            ref_objects.update(g.get("object", []))
            ref_items.update(g.get("item", []))
        ob = q.get("objectives", {})
        ref_npcs.update(c["id"] for c in ob.get("creatures", []))
        ref_objects.update(o["id"] for o in ob.get("objects", []))
        ref_items.update(i["id"] for i in ob.get("items", []))
        for kc in ob.get("killCredit", []):
            ref_npcs.update(kc["ids"])
            if kc.get("baseId"):
                ref_npcs.add(kc["baseId"])
        for e in q.get("extraObjectives", []):
            for r in e.get("references", []):
                {"monster": ref_npcs, "object": ref_objects, "item": ref_items}.get(r["kind"], set()).add(r["id"])
        if q.get("sourceItemId"):
            ref_items.add(q["sourceItemId"])
        ref_items.update(q.get("requiredSourceItems", []))
    # item sources: NPC/object drops, and items contained in other items (one level deep)
    for iid in sorted(ref_items):
        it = items.get(iid, {})
        ref_npcs.update(it.get("npcDrops", []))
        ref_objects.update(it.get("objectDrops", []))
    for iid in sorted(ref_items):
        for src in items.get(iid, {}).get("itemDrops", []):
            if src not in ref_items:
                ref_items.add(src)
                ref_npcs.update(items.get(src, {}).get("npcDrops", []))
                ref_objects.update(items.get(src, {}).get("objectDrops", []))

    missing = {"npc": sorted(n for n in ref_npcs if n not in npcs),
               "object": sorted(o for o in ref_objects if o not in objects),
               "item": sorted(i for i in ref_items if i not in items)}

    def slim_npc(n: dict[str, Any]) -> dict[str, Any]:
        out = {k: n[k] for k in NPC_FIELDS if k in n}
        out["id"] = n["id"]
        if n["id"] in npc_blacklist:
            out["blacklisted"] = True
        if horde.is_custom("Npc", n["id"]):
            out["custom"] = True
        return out

    npcs_out = {str(i): slim_npc(n) for i, n in npcs.items()}
    objects_out = {}
    for oid in sorted(o for o in ref_objects if o in objects):
        o = dict(objects[oid])
        o.pop("waypoints", None)
        if horde.is_custom("Object", oid):
            o["custom"] = True
        objects_out[str(oid)] = o
    items_out = {}
    for iid in sorted(i for i in ref_items if i in items):
        it = dict(items[iid])
        if horde.is_custom("Item", iid):
            it["custom"] = True
        if iid in item_blacklist:
            it["questieBlacklisted"] = True
        items_out[str(iid)] = it

    # ---- drops -----------------------------------------------------------------------------
    drops_out: dict[str, list[dict[str, Any]]] = {}
    rate_src: Counter[str] = Counter()
    for iid in sorted(ref_items):
        it = items.get(iid)
        if not it or not it.get("npcDrops"):
            continue
        rows = []
        for npc_id in it["npcDrops"]:
            r = support.drop_rate(drops_tables, iid, npc_id)
            rows.append({"npcId": npc_id, "rate": round(r[0], 4) if r else None, "src": r[1] if r else None})
            rate_src[r[1] if r else "none"] += 1
        rows.sort(key=lambda d: (-(d["rate"] if d["rate"] is not None else -1.0), d["npcId"]))
        drops_out[str(iid)] = rows

    # ---- npc by name ------------------------------------------------------------------------
    by_name: dict[str, list[int]] = defaultdict(list)
    for nid, n in npcs.items():
        if n.get("name"):
            by_name[n["name"].strip().lower()].append(nid)
    by_name_out = {k: sorted(v) for k, v in by_name.items()}

    # ---- zones ------------------------------------------------------------------------------
    a2u, sub2p = zmaps["areaIdToUiMapId"], zmaps["subZoneToParentZone"]
    spawn_areas: Counter[int] = Counter()
    for coll in (npcs.values(), objects.values()):
        for e in coll:
            for a in (e.get("spawns") or {}):
                spawn_areas[int(a)] += 1
    for q in quests.values():
        for e in q.get("extraObjectives", []):
            for a in e.get("spawns", {}):
                spawn_areas[int(a)] += 1
        te = q.get("triggerEnd")
        if te:
            for a in te.get("spawns", {}):
                spawn_areas[int(a)] += 1
    area_ids = set(a2u) | set(sub2p) | set(sub2p.values()) | set(zone_names) | set(dungeons) | set(dungeon_alias) \
        | set(spawn_areas) | {int(q["areaId"]) for q in quests.values() if "areaId" in q} | set(zmaps["uiMapIdToAreaId"].values())
    area_ids.discard(0)

    def parent_of(a: int) -> int | None:
        p = dungeon_alias.get(a) or sub2p.get(a)
        return p if p and p != a else None

    def resolve_map(a: int) -> tuple[int | None, int | None]:
        seen = set()
        cur: int | None = a
        while cur is not None and cur not in seen:
            seen.add(cur)
            m = a2u.get(cur)
            if m:
                return m, (cur if cur != a else None)
            cur = parent_of(cur)
        return None, None

    zones_out: dict[str, dict[str, Any]] = {}
    unmapped: list[int] = []
    for a in sorted(area_ids):
        z: dict[str, Any] = {"areaId": a}
        name = zone_names.get(a, {}).get("name") or (dungeons.get(a) or {}).get("name") \
            or (title_from_enum(zone_enum[a]) if a in zone_enum else None)
        if name:
            z["name"] = name
        if a in zone_names:
            z["continentKey"] = zone_names[a]["continentKey"]
        if a in zone_enum:
            z["enum"] = zone_enum[a]
        if a in a2u and a2u[a]:
            z["uiMapId"] = a2u[a]
        m, via = resolve_map(a)
        if m and "uiMapId" not in z:
            z["uiMapId"] = m
            z["uiMapVia"] = via
        p = parent_of(a)
        if p:
            z["parentAreaId"] = p
        if a in dungeons:
            d = dungeons[a]
            z["dungeon"] = {"parentAreaId": d["parentAreaId"], "entrances": d["entrances"],
                            "alternativeAreaIds": d["alternativeAreaIds"]}
        if a in spawn_areas:
            z["spawnRefs"] = spawn_areas[a]
        if not z.get("uiMapId") and a in spawn_areas:
            unmapped.append(a)
        zones_out[str(a)] = z

    # ---- xp ---------------------------------------------------------------------------------
    xp_out = {str(q): v for q, v in sorted(xp.items())}

    timings["total"] = time.perf_counter() - t0
    return {
        "paths": P, "metas": metas, "raw_counts": {e: len(r) for e, r in raw.items()},
        "quests": quests, "horde_quests": horde_quests, "npcs_out": npcs_out, "objects_out": objects_out,
        "items_out": items_out, "drops_out": drops_out, "by_name": by_name_out, "zones_out": zones_out,
        "xp_out": xp_out, "unmapped": unmapped, "spawn_areas": spawn_areas, "excluded": excluded,
        "missing": missing, "corr_status": corr_status, "hmask": hmask, "race_keys": race_keys,
        "class_keys": class_keys, "rate_src": rate_src, "timings": timings, "event_quests": event_quests,
        "hidden": hidden, "quest_tags": quest_tags, "zone_names": zone_names, "harness": harness,
        "xp": xp,
    }


# ---------------------------------------------------------------------------------------------
# output
# ---------------------------------------------------------------------------------------------

def _qstr(d: dict[int, Any]) -> dict[str, Any]:
    return {str(k): v for k, v in d.items()}


def write_outputs(r: dict[str, Any]) -> dict[str, Path]:
    P = r["paths"]
    out = P.build_dir / "questie"
    files = {
        "quests_all.json": _qstr(r["quests"]),
        "quests.json": _qstr(r["horde_quests"]),
        "npcs.json": r["npcs_out"],
        "objects.json": r["objects_out"],
        "items.json": r["items_out"],
        "npc_by_name.json": r["by_name"],
        "zones.json": r["zones_out"],
        "xp.json": r["xp_out"],
        "drops.json": r["drops_out"],
    }
    written = {}
    for name, obj in files.items():
        written[name] = write_json(out / name, obj, indent=None)
    written["p2_questie.md"] = write_report(r, written)
    return written


def write_report(r: dict[str, Any], written: dict[str, Path]) -> Path:
    P = r["paths"]
    quests, hq = r["quests"], r["horde_quests"]
    cs = r["corr_status"]
    lines: list[str] = []
    w = lines.append
    w("# P2 — QuestieDB extraction report")
    w("")
    w("Generated by `python -I pipeline/p2_questie.py` (deterministic; no timestamps).")
    w("")
    w("## Counts")
    w("")
    w("| entity | decoded | written |")
    w("|---|---|---|")
    w(f"| Quest | {r['raw_counts']['Quest']} | quests_all {len(quests)}, quests (Horde) {len(hq)} |")
    w(f"| Npc | {r['raw_counts']['Npc']} | npcs {len(r['npcs_out'])} (all) |")
    w(f"| Object | {r['raw_counts']['Object']} | objects {len(r['objects_out'])} (referenced by Horde quests) |")
    w(f"| Item | {r['raw_counts']['Item']} | items {len(r['items_out'])} (referenced by Horde quests) |")
    w("")
    w(f"- npc_by_name: {len(r['by_name'])} names; zones: {len(r['zones_out'])} areas; xp: {len(r['xp_out'])} quests; "
      f"drops: {len(r['drops_out'])} items")
    w(f"- drop-rate sources (item×npc pairs): {dict(sorted(r['rate_src'].items()))}")
    w("- file sizes: " + ", ".join(f"{n} {p.stat().st_size / 1024:.0f} KB" for n, p in sorted(written.items())))
    w("")
    w("### Horde filter")
    w("")
    w(f"- Horde race mask = **{r['hmask']}** (`raceKeys.ALL_HORDE`) = ORC 2 + UNDEAD 16 + TAUREN 32 + TROLL 128 "
      f"+ SKYBORNE_HORDE {r['race_keys'].get('SKYBORNE_HORDE')} (bit 33 = Forever race id 96, \"Windshaper Skyborne\"). "
      f"Alliance = {r['race_keys'].get('ALL_ALLIANCE')} (bit 32 = SKYBORNE_ALLIANCE, race 95, \"High Order Skyborne\").")
    w("- kept: `requiredRaces` is 0 or overlaps the Horde mask; not Questie-blacklisted (`true`; `HIDE_ON_MAP` "
      "quests are kept with `blacklist: \"hide_on_map\"`); not a world-event / AQ war-effort / Naxx-invasion quest; "
      "and (race 0 only) not started exclusively by NPCs with `friendlyToFaction == \"A\"` (Questie's own "
      "AvailableQuests rule).")
    w(f"- excluded: {dict(sorted(r['excluded'].items()))}")
    w(f"- Horde set: {len(hq)} quests; class quests kept: {sum(1 for q in hq.values() if q.get('classQuest'))}; "
      f"custom: {sum(1 for q in hq.values() if q['custom'])}; repeatable: {sum(1 for q in hq.values() if q['repeatable'])}; "
      f"with XP: {sum(1 for q in hq.values() if 'xp' in q)}; with groupHints: {sum(1 for q in hq.values() if 'groupHints' in q)}")
    w("")
    w("## Dynamic corrections")
    w("")
    w(f"- harness ran: **{cs['ran']}** (`pipeline/lua/run_corrections.lua`, Lua 5.1, Horde character).")
    w("- legacy `LoadFactionFixes` (Forever/legacy/classic*Fixes.lua) applied first, then Forever `LoadDynamic` "
      "(Forever/forever*Fixes.lua); field replacement, later layer wins (QuestieDB registry EraDynamic < ForeverDynamic). "
      "No `_add`/`_remove` operations are used by these files.")
    for e, s in sorted(cs["stats"].items()):
        w(f"  - {e}: {s['rows']} row corrections, {s['fields']} fields, new ids: {s['new'][:20]}")
    w(f"- harness errors: {cs['errors'] or 'none'}")
    w("- `playerClass` is read by the providers but never used, so the dump is class-independent.")
    w("- Questie policy evaluated in the same harness (Expansions.Current = Era, Questie.IsForever = true): "
      f"{len(r['hidden'])} hidden-quest entries, {len(r['event_quests'])} event quests (Holidays files from "
      f"Questie_Forever.toc), {len(r['quest_tags'])} quest-tag corrections.")
    w("")
    w("## `custom` rule")
    w("")
    origin = Counter(q["origin"] for q in quests.values())
    w(f"- quest origin counts (all): {dict(sorted(origin.items()))}")
    w("- **custom = id outside the vanilla id space** (`pipeline/p2/horde.py` `VANILLA_ID_CEILING`: quest < 10000, "
      "npc < 20000, item < 25000, object < 190000). Evidence: `xpDB-classic.lua` (generated from Blizzard Classic data) "
      "has 3,494 quests, all < 10,000; the DB has no quest in 10,000–59,999; every quest ≥ 60,000 has XP only in "
      "`xpDB-traces.lua` (Forever player traces); NPCs ≥ 20,000 are later-expansion ports (Dalaran 32xxx …) or "
      "Forever (25xxxx–27xxxx); items ≥ 25,000 likewise.")
    w("- quests also carry `origin`: `vanilla` (<10000), `season` (60000–89999: ids from later Classic seasons — "
      "promo, Love is in the Air, SoD — which Wowhead Classic also knows), `forever` (≥ 90000, e.g. 97279). "
      "`custom` is true for both `season` and `forever`.")
    w("- Note for P9: Questie itself links every Forever quest to `https://www.wowhead.com/forever/quest=<id>` "
      "(Questie `Modules/Tracker/LinePool/TrackerMenu.lua`), so a Forever Wowhead section exists.")
    w("")
    w("## Zones / spawns")
    w("")
    w(f"- distinct spawn areaIds: {len(r['spawn_areas'])}; mapped to a uiMapId (directly or via parent/dungeon alias): "
      f"{len(r['spawn_areas']) - len(r['unmapped'])}; **unmapped: {len(r['unmapped'])}**")
    if r["unmapped"]:
        w("")
        w("| areaId | name | spawn refs |")
        w("|---|---|---|")
        for a in r["unmapped"]:
            z = r["zones_out"][str(a)]
            w(f"| {a} | {z.get('name', '?')} | {z.get('spawnRefs', 0)} |")
    w("")
    w("## Missing references (ids referenced by Horde quests but absent from the DB)")
    w("")
    for k, v in r["missing"].items():
        w(f"- {k}: {len(v)} {v[:30]}")
    w("")
    w("## Spot checks")
    w("")
    for qid in (4641, 97279, 788):
        q = quests.get(qid)
        if not q:
            w(f"- {qid}: MISSING")
            continue
        w(f"- {qid} \"{q.get('name')}\": start {q.get('startedBy')}, end {q.get('finishedBy')}, objectives "
          f"{q.get('objectives')}, xp {q.get('xp')}, custom {q['custom']}, horde {qid in hq}")
    for nid in (10176, 3143):
        n = r["npcs_out"].get(str(nid))
        w(f"- npc {nid}: {n.get('name') if n else 'MISSING'} spawns {n.get('spawns') if n else None}")
    w("")
    w("Runtime is printed on stdout (not stored here, to keep the report byte-identical across runs); "
      "a full run takes about 3 s.")
    w("")
    w(FORMATS_DOC)
    path = r["paths"].reports_dir / "p2_questie.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    return path


FORMATS_DOC = """## File formats (`data/build/questie/`, pipeline-internal, compact JSON, sorted keys)

All files are JSON objects keyed by the id **as a string**. Field names are QuestieDB meta names
(`src/meta/*Meta.lua`); default values (0, empty, nil) are omitted. Spawns are always
`{"<areaId>": [[x, y], ...]}` with zone-% coordinates rounded to 2 decimals (`[-1, -1]` = inside an
instance; an optional 3rd element is a phase id).

- **quests_all.json / quests.json** (`quests.json` = Horde-filtered subset): `{id, name, questLevel,
  requiredLevel, requiredRaces, requiredClasses, startedBy: {npc:[], object:[], item:[]}, finishedBy: {…},
  objectivesText: [str], objectives: {creatures:[{id,text?}], objects:[{id,text?}], items:[{id,text?}],
  reputation:{factionId,value}, killCredit:[{ids:[],baseId,text?}], spells:[{id,text?,itemId?}]},
  triggerEnd: {text, spawns}, extraObjectives: [{spawns, icon, text, index, references:[{kind,id}]}],
  sourceItemId, preQuestGroup:[], preQuestSingle:[], childQuests:[], inGroupWith:[], exclusiveTo:[],
  zoneOrSort, requiredSkill:[skill,value], requiredMinRep/MaxRep:[faction,value], requiredSourceItems:[],
  nextQuestInChain, questFlags, specialFlags, parentQuest, reputationReward:[[faction,value]],
  breadcrumbForQuestId, breadcrumbs:[], requiredSpell, requiredMaxLevel, availableUntilCompleted,
  availableStartingWith, disabledByQuest}` plus derived keys:
  `custom` (bool), `origin` (vanilla|season|forever), `xp: {level, xp, src}`, `repeatable` (specialFlags&1),
  `needsEvent` (specialFlags&2), `questFlagNames` ([DAILY, WEEKLY, RAID, EPIC, PARTY_ACCEPT, SHARABLE, …]),
  `blacklist` (hidden|hide_on_map), `eventOnly` + `eventName`, `aqWarEffort`, `invasion`,
  `tag: {id, name}` (Questie questTagInfoCorrections: Elite/Dungeon/Raid/PvP/…), `areaId` (zoneOrSort>0) or
  `sort` (QuestieDB sortKeys name for zoneOrSort<0), `raceNames`, `classNames` + `classQuest`,
  `professionQuest`, `groupHints` ([`tag:Elite`, `tag:Dungeon`, `flag:RAID`, `zone:dungeon`,
  `mob:<npcId>:elite|rareelite|boss`]).
- **npcs.json** (all NPCs): `{id, name, subName?, minLevel, maxLevel, rank (1 elite, 2 rare elite, 3 boss, 4 rare),
  spawns, zoneID, questStarts:[], questEnds:[], factionID, friendlyToFaction ("A"|"H"|"AH"), npcFlags,
  blacklisted?, custom?}`. Waypoints are dropped.
- **objects.json / items.json** (only those referenced by Horde quests: givers, objectives, extra-objective
  references, source/required items and the NPC/object/item sources of those items): object
  `{id, name, questStarts, questEnds, spawns, zoneID, factionID, custom?}`; item `{id, name, npcDrops:[],
  objectDrops:[], itemDrops:[], startQuest, questRewards:[], flags, foodType, itemLevel, requiredLevel, class,
  subClass, vendors:[], relatedQuests:[], teachesSpell, custom?, questieBlacklisted?}`.
- **npc_by_name.json**: `{"lowercase name": [npcId, …]}` (ids ascending) over all NPCs.
- **zones.json**: `{"areaId": {areaId, name?, enum?, continentKey? (Questie zoneLookup group: 0 EK, 1 Kalimdor, …),
  uiMapId?, uiMapVia? (areaId whose map was used when the area itself has none), parentAreaId?,
  dungeon?: {parentAreaId, entrances: [[areaId, x, y]], alternativeAreaIds}, spawnRefs?}}`.
- **xp.json**: `{"questId": {level, xp, src: classic|traces}}` — Questie `QuestXP.db` rows: `xp` is the full
  reward at quest `level`; Questie scales it by player level: `mult = clamp(2*(level - playerLevel) + 20, 1, 10)/10`,
  then rounds (≤100 → 5s, ≤500 → 10s, ≤1000 → 25s, else 50s); 0 at max level. Traces load after classic and win.
- **drops.json**: `{"itemId": [{npcId, rate (percent) | null, src: questie|cmangos|wowhead|null}]}` for every
  referenced item with `npcDrops`, sorted by rate desc. Rate lookup = Questie `DropDB.GetItemDroprate`
  (Era corrections > cmangos > wowhead). Object drops are in `items.json.objectDrops`.
"""


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--skip-corrections", action="store_true", help="do not run the Lua harness")
    args = ap.parse_args(argv)
    r = build(verbose=args.verbose, skip_corrections=args.skip_corrections)
    written = write_outputs(r)
    hq = r["horde_quests"]
    print(f"[p2] quests {len(r['quests'])} (Horde {len(hq)}), npcs {len(r['npcs_out'])}, objects "
          f"{len(r['objects_out'])}, items {len(r['items_out'])}, zones {len(r['zones_out'])}, "
          f"unmapped spawn areas {len(r['unmapped'])}, corrections ran={r['corr_status']['ran']} "
          f"in {r['timings']['total']:.1f}s")
    if args.verbose:
        for n, p in sorted(written.items()):
            print(f"[p2]   {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
