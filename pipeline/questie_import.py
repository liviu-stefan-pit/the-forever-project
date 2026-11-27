"""QuestieDB import → committed compact JSON under ``content/questie-db/``.

    python -I pipeline/questie_import.py [--verbose]

Default source is the gitignored QuestieDB checkout (see ``PINS``), not a release zip.
QuestieDB's exporter merges, in order:

  data/Forever baseline (converted Classic/Era rows)
  → src/corrections/Forever/legacy
  → generated delta-base
  → traces
  → authored forever*Fixes.lua

``forever: true`` means the id is absent from ``data/Classic`` at the same commit.
Zone names come from the pinned Questie checkout. No Wowhead download.
Licence: GPL-3.0 (see content/questie-db/LICENSE).
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable, Mapping

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from pipeline.common.paths import PROJECT_ROOT  # noqa: E402

FORMAT_VERSION = 1
OUT_DIR = PROJECT_ROOT / "content" / "questie-db"
# ``--faction alliance`` writes here, so the Horde snapshot the site reads is untouched.
ALLIANCE_OUT_DIR = PROJECT_ROOT / "content" / "questie-db-alliance"
FACTIONS = ("horde", "alliance")
CACHE_DIR = PROJECT_ROOT / "data" / "cache" / "questie"

QDB_COMMIT = "5b857c29e32c1f0a6bc095bde64f6c5c05dd86ff"
QUESTIE_COMMIT = "99bef7a7b721aefb4ba070029ef91d62e9108d61"
DEFAULT_QDB = PROJECT_ROOT / "research" / "external" / "github" / "QuestieDB"
DEFAULT_QUESTIE = PROJECT_ROOT / "research" / "external" / "github" / "Questie"

PINS: dict[str, Any] = {
    "questiedb": {
        "repo": "https://github.com/Questie/QuestieDB",
        "commit": QDB_COMMIT,
        "checkout": "research/external/github/QuestieDB",
        "baseline": "data/Forever",
        "eraIds": "data/Classic",
        "correctionOrder": [
            "src/corrections/Forever/legacy",
            "src/corrections/Forever/generated",
            "src/corrections/Forever/traces",
            "src/corrections/Forever/forever*Fixes.lua",
        ],
    },
    "evidence": {
        "traces": "src/corrections/Forever/traces/foreverQuestTraces.lua",
        "deltaBase": "src/corrections/Forever/generated/foreverBaseQuest.lua",
        "authoredFixes": "src/corrections/Forever/foreverQuestFixes.lua",
    },
    "questie": {
        "repo": "https://github.com/Questie/Questie",
        "commit": QUESTIE_COMMIT,
        "checkout": "research/external/github/Questie",
    },
}

# Same Horde mask QuestieDB publishes for Forever (expansions.lua raceKeys.ALL_HORDE).
_HORDE_RACE_KEYS = {
    "NONE": 0, "HUMAN": 1, "ORC": 2, "DWARF": 4, "NIGHT_ELF": 8, "UNDEAD": 16, "TAUREN": 32,
    "GNOME": 64, "TROLL": 128, "GOBLIN": 256, "SKYBORNE_ALLIANCE": 1 << 32,
    "SKYBORNE_HORDE": 1 << 33, "ALL_HORDE": 178 + (1 << 33), "ALL_ALLIANCE": 77 + (1 << 32),
}
_QUEST_FLAG_BITS = {"DAILY": 4096, "WEEKLY": 32768, "MONTHLY": 65536, "RAID": 64, "EPIC": 32,
                    "PARTY_ACCEPT": 2, "SHARABLE": 8, "STAY_ALIVE": 1, "EXPLORATION": 4, "AUTO_REWARDED": 1024}
_ROW_RE = re.compile(r"^[A-Za-z_]+\[(\d+)\]\s*=")
_CLASSIC_ID_RE = re.compile(r"^\[(\d+)\]\s*=", re.M)

# QuestieDB enum ``byExpansion.Forever.npcFlags`` (src/corrections/enum/expansions.lua).
NPC_FLAGS = {
    1: "gossip", 2: "questGiver", 4: "vendor", 8: "flightMaster", 16: "trainer", 32: "spiritHealer",
    64: "spiritGuide", 128: "innkeeper", 256: "banker", 512: "petitioner", 1024: "tabardDesigner",
    2048: "battlemaster", 4096: "auctioneer", 8192: "stableMaster", 16384: "repair",
    33554432: "barber", 536870912: "transmogrifier",
}


def log(verbose: bool, *msg: Any) -> None:
    if verbose:
        print("[questie-import]", *msg, flush=True)


# ---------------------------------------------------------------------------------------------
# fetch
# ---------------------------------------------------------------------------------------------

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "project-forever-questie-import"})
    with urllib.request.urlopen(req, timeout=300) as r:  # noqa: S310 (pinned https URLs)
        return r.read()


def fetch_verified(url: str, sha256: str | None, dest: Path) -> bytes:
    """Return cached bytes when the hash matches, else download and verify."""
    if dest.is_file():
        data = dest.read_bytes()
        if sha256 is None or sha256_bytes(data) == sha256:
            return data
    data = _download(url)
    if sha256 is not None and sha256_bytes(data) != sha256:
        raise RuntimeError(f"SHA-256 mismatch for {url}: got {sha256_bytes(data)}, pinned {sha256}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return data


def fetch_sources(cache: Path, verbose: bool = False) -> dict[str, Path]:
    """Release-zip downloads are retired. Import the local QuestieDB checkout instead."""
    raise RuntimeError(
        "QuestieDB release zips are no longer the import source. "
        f"Use the checkout at {DEFAULT_QDB} (commit {QDB_COMMIT})."
    )


# ---------------------------------------------------------------------------------------------
# compaction (pure; unit-tested)
# ---------------------------------------------------------------------------------------------

def _clean(d: Mapping[str, Any]) -> dict[str, Any]:
    """Drop None / empty containers / False, keep 0 numbers where meaningful."""
    return {k: v for k, v in d.items() if v is not None and v != [] and v != {} and v is not False}


def flag_names(flags: int | None) -> list[str]:
    f = int(flags or 0)
    return [name for bit, name in sorted(NPC_FLAGS.items()) if f & bit]


def _givers(g: Mapping[str, Any] | None) -> dict[str, list[int]]:
    g = g or {}
    return _clean({"npc": list(g.get("npc") or []), "object": list(g.get("object") or []), "item": list(g.get("item") or [])})


def _ids(lst: Iterable[Any] | None) -> list[int]:
    out = []
    for e in lst or []:
        if isinstance(e, Mapping) and isinstance(e.get("id"), int):
            out.append(e["id"])
        elif isinstance(e, int):
            out.append(e)
    return out


def compact_quest(q: Mapping[str, Any], zones: Mapping[str, Any], base_ids: set[int]) -> dict[str, Any]:
    zone_id = q.get("areaId")
    zos = q.get("zoneOrSort")
    if zone_id is None and isinstance(zos, int) and zos > 0:
        zone_id = zos
    zone = zones.get(str(zone_id)) if zone_id is not None else None
    tag = q.get("tag") or {}
    obj = q.get("objectives") or {}
    objectives = _clean({
        "creatures": [_clean({"id": e.get("id"), "text": e.get("text")}) for e in obj.get("creatures") or []],
        "items": [_clean({"id": e.get("id"), "text": e.get("text")}) for e in obj.get("items") or []],
        "objects": [_clean({"id": e.get("id"), "text": e.get("text")}) for e in obj.get("objects") or []],
        "killCredit": obj.get("killCredit") or [],
        "reputation": obj.get("reputation") or [],
    })
    xp = q.get("xp") or {}
    return _clean({
        "id": q["id"],
        "name": q.get("name"),
        "level": q.get("questLevel"),
        "reqLevel": q.get("requiredLevel"),
        "races": q.get("requiredRaces") or 0,
        "classes": q.get("requiredClasses") or 0,
        "zoneId": zone_id,
        "zone": (zone or {}).get("name"),
        "sort": q.get("sort"),
        "start": _givers(q.get("startedBy")),
        "end": _givers(q.get("finishedBy")),
        "objectives": objectives,
        "objectivesText": q.get("objectivesText") or [],
        "pre": _clean({"single": q.get("preQuestSingle") or [], "group": q.get("preQuestGroup") or []}),
        "next": q.get("nextQuestInChain"),
        "exclusiveTo": q.get("exclusiveTo") or [],
        "breadcrumbFor": q.get("breadcrumbForQuestId"),
        "sourceItem": q.get("sourceItemId"),
        "xp": xp.get("xp"),
        "repeatable": bool(q.get("repeatable")),
        "tag": tag.get("name") if isinstance(tag, Mapping) else None,
        "groupHints": q.get("groupHints") or [],
        "requiredSkill": q.get("requiredSkill"),
        "flags": q.get("questFlagNames") or [],
        "forever": q["id"] not in base_ids,
    })


def compact_npc(n: Mapping[str, Any], base_ids: set[int]) -> dict[str, Any]:
    return _clean({
        "id": n["id"],
        "name": n.get("name"),
        "sub": n.get("subName"),
        "minLevel": n.get("minLevel"),
        "maxLevel": n.get("maxLevel"),
        "rank": n.get("rank"),
        "friendly": n.get("friendlyToFaction"),
        "zoneId": n.get("zoneID"),
        "spawns": n.get("spawns") or {},
        "services": flag_names(n.get("npcFlags")),
        "questStarts": n.get("questStarts") or [],
        "questEnds": n.get("questEnds") or [],
        "forever": n["id"] not in base_ids,
    })


def compact_object(o: Mapping[str, Any], base_ids: set[int]) -> dict[str, Any]:
    return _clean({
        "id": o["id"], "name": o.get("name"), "zoneId": o.get("zoneID"), "spawns": o.get("spawns") or {},
        "questStarts": o.get("questStarts") or [], "questEnds": o.get("questEnds") or [],
        "forever": o["id"] not in base_ids,
    })


def compact_item(i: Mapping[str, Any], base_ids: set[int]) -> dict[str, Any]:
    return _clean({
        "id": i["id"], "name": i.get("name"), "itemLevel": i.get("itemLevel"), "reqLevel": i.get("requiredLevel"),
        "class": i.get("class"), "subClass": i.get("subClass"),
        "npcDrops": i.get("npcDrops") or [], "objectDrops": i.get("objectDrops") or [], "itemDrops": i.get("itemDrops") or [],
        "vendors": i.get("vendors") or [], "startQuest": i.get("startQuest"),
        "relatedQuests": i.get("relatedQuests") or [], "questRewards": i.get("questRewards") or [],
        "forever": i["id"] not in base_ids,
    })


def keep_npc(n: Mapping[str, Any], referenced: set[int], faction: str = "horde") -> bool:
    """Keep every NPC a kept quest references, plus any spawned NPC that is not friendly only to the other faction."""
    if n["id"] in referenced:
        return True
    if not n.get("spawns") or n.get("blacklisted"):
        return False
    return n.get("friendlyToFaction") != ("H" if faction == "alliance" else "A")


def referenced_npcs(quests: Iterable[Mapping[str, Any]], items: Mapping[int, Mapping[str, Any]]) -> set[int]:
    out: set[int] = set()
    for q in quests:
        out.update((q.get("startedBy") or {}).get("npc") or [])
        out.update((q.get("finishedBy") or {}).get("npc") or [])
        obj = q.get("objectives") or {}
        out.update(_ids(obj.get("creatures")))
        for kc in obj.get("killCredit") or []:
            if isinstance(kc, Mapping):
                out.update(i for i in kc.get("ids") or [] if isinstance(i, int))
        for it in _ids(obj.get("items")):
            out.update((items.get(it) or {}).get("npcDrops") or [])
    return out


def fill_zone_from_giver(quests: dict[int, dict[str, Any]], npcs_raw: Mapping[int, Mapping[str, Any]],
                         objects_raw: Mapping[int, Mapping[str, Any]], zones: Mapping[str, Any]) -> int:
    """Quests with no category zone get the zone of their first quest giver (``zoneSource: "giver"``)."""
    n = 0
    for q in quests.values():
        if q.get("zoneId") is not None:
            continue
        for kind, table in (("npc", npcs_raw), ("object", objects_raw)):
            zid = next((table[i].get("zoneID") for i in q.get("start", {}).get(kind, []) if i in table and table[i].get("zoneID")), None)
            if zid:
                q["zoneId"], q["zoneSource"] = zid, "giver"
                if (zones.get(str(zid)) or {}).get("name"):
                    q["zone"] = zones[str(zid)]["name"]
                n += 1
                break
    return n


SEASON_ID_FLOOR = 90000  # Forever's own new quest ids start here; lower "new" ids reuse season-era ids


def evidence_ids(traces: str, delta_base: str, authored: str) -> dict[str, set[int]]:
    """Quest ids with Forever-specific evidence in QuestieDB's Forever correction layers.

    * ``traces``: player trace layer aggregated from Forever clients (QuestieTrace).
    * ``wowheadForever``: generated delta-base rows that cite a ``wowhead.com/forever/quest=`` page.
    * ``authoredFix``: hand-authored Forever fixes (maintainer-added; not counted as strong evidence).
    """
    top = re.compile(r"^ {8}\[(\d+)\] = \{", re.M)
    return {
        "traces": {int(m) for m in top.findall(traces)},
        "wowheadForever": {int(m) for m in re.findall(r"^ {8}\[(\d+)\] = \{ -- .*wowhead\.com/forever/quest=", delta_base, re.M)},
        "authoredFix": {int(m) for m in top.findall(authored)},
    }


def apply_confidence(quests: dict[int, dict[str, Any]], ev: Mapping[str, set[int]]) -> None:
    """``foreverConfidence``: high for ids >= 90000 (Forever's own range) or with traces / Wowhead-Forever
    evidence; low otherwise (season-era ids with no Forever-specific evidence)."""
    for qid, q in quests.items():
        if not q.get("forever"):
            continue
        evidence = [k for k in ("traces", "wowheadForever", "authoredFix") if qid in ev.get(k, set())]
        if evidence:
            q["foreverEvidence"] = evidence
        strong = "traces" in evidence or "wowheadForever" in evidence
        q["foreverConfidence"] = "high" if qid >= SEASON_ID_FLOOR or strong else "low"


def forever_by_zone_confidence(quests: Mapping[int, Mapping[str, Any]]) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = defaultdict(lambda: {"high": 0, "low": 0})
    for q in quests.values():
        if q.get("forever"):
            zone = q.get("zone") or (f"sort:{q['sort']}" if q.get("sort") else "unknown")
            out[zone][q.get("foreverConfidence", "low")] += 1
    return {z: dict(c) for z, c in sorted(out.items(), key=lambda kv: (-(kv[1]["high"] + kv[1]["low"]), kv[0]))}


def forever_by_zone(quests: Mapping[int, Mapping[str, Any]]) -> list[tuple[str, int]]:
    c: Counter = Counter()
    for q in quests.values():
        if q.get("forever"):
            c[q.get("zone") or (f"sort:{q['sort']}" if q.get("sort") else "unknown")] += 1
    return sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))


def dump_lines(obj: Mapping[Any, Any]) -> str:
    """Deterministic compact JSON: one entity per line (small diffs, small files)."""
    keys = sorted(obj, key=lambda k: int(k) if str(k).lstrip("-").isdigit() else str(k))
    body = ",\n".join(f"{json.dumps(str(k))}:{json.dumps(obj[k], ensure_ascii=False, sort_keys=True, separators=(',', ':'))}"
                      for k in keys)
    return "{\n" + body + "\n}\n"


# ---------------------------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------------------------

def lua_exe(root: Path) -> Path:
    rels = ("tools/lua-binary/lua.exe", "tools/lua-binary/linux-x64/lua")
    for rel in (rels if sys.platform == "win32" else rels[::-1]):
        p = root / rel
        if p.is_file():
            return p
    raise FileNotFoundError(f"QuestieDB bundled Lua runtime not found under {root / 'tools' / 'lua-binary'}")


def export_merged(root: Path, verbose: bool = False) -> Path:
    """Run QuestieDB's Forever exporter with authored Static Corrections included."""
    cmd = [str(lua_exe(root)), "tools/export-forever.lua", "--include-authored"]
    log(verbose, "export", cmd)
    subprocess.run(cmd, cwd=root, check=True)
    out = root / "src" / "corrections" / "Forever" / "combined"
    for name in ("foreverQuestDB.lua", "foreverNpcDB.lua", "foreverObjectDB.lua", "foreverItemDB.lua"):
        if not (out / name).is_file():
            raise RuntimeError(f"exporter did not write {out / name}")
    return out


def parse_combined(path: Path) -> dict[int, Any]:
    """``entity[id] = {row}`` lines from ``tools/export-forever.lua`` → ``{id: row}``."""
    from pipeline.common import lua_table

    out: dict[int, Any] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = _ROW_RE.match(line)
        if not m:
            continue
        out[int(m.group(1))] = lua_table.parse(line[m.end():])
    if not out:
        raise RuntimeError(f"no entity rows in {path}")
    return out


def classic_ids(path: Path) -> set[int]:
    """Top-level ids in a ``data/Classic/*DB.lua`` blob. Nested tables are indented."""
    return {int(m) for m in _CLASSIC_ID_RE.findall(path.read_text(encoding="utf-8"))}


def _row_dict(row: Any) -> dict[int, Any]:
    from pipeline.p2.normalize import int_keys

    if isinstance(row, list):
        return {i + 1: v for i, v in enumerate(row) if v is not None}
    if isinstance(row, dict):
        return {int(k): v for k, v in int_keys(row).items() if isinstance(k, int)}
    raise TypeError(f"entity row is {type(row).__name__}")


def load_sort_keys(root: Path) -> dict[int, str]:
    from pipeline.common import lua_table

    text = (root / "src" / "corrections" / "enum" / "quests.lua").read_text(encoding="utf-8")
    raw = lua_table.find_value(text, "constants.sortKeys")
    return {int(v): str(k) for k, v in raw.items()}


def decorate_quest(q: dict[str, Any], sort_keys: Mapping[int, str], xp: Mapping[int, Mapping[str, Any]]) -> None:
    zs = int(q.get("zoneOrSort") or 0)
    if zs > 0:
        q["areaId"] = zs
    elif zs < 0:
        q["sort"] = sort_keys.get(zs, str(zs))
    sf = int(q.get("specialFlags") or 0)
    qf = int(q.get("questFlags") or 0)
    q["repeatable"] = bool(sf & 1)
    flags = sorted(n for n, b in _QUEST_FLAG_BITS.items() if qf & b)
    if flags:
        q["questFlagNames"] = flags
    got = xp.get(int(q["id"]))
    if got:
        q["xp"] = {"level": got["level"], "xp": got["xp"], "src": got["src"]}


def _referenced(quests: Iterable[Mapping[str, Any]], items: Mapping[int, Mapping[str, Any]]) -> tuple[set[int], set[int], set[int]]:
    npcs: set[int] = set()
    objects: set[int] = set()
    item_ids: set[int] = set()
    for q in quests:
        for key in ("startedBy", "finishedBy"):
            g = q.get(key) or {}
            npcs.update(g.get("npc") or [])
            objects.update(g.get("object") or [])
            item_ids.update(g.get("item") or [])
        ob = q.get("objectives") or {}
        npcs.update(_ids(ob.get("creatures")))
        objects.update(_ids(ob.get("objects")))
        item_ids.update(_ids(ob.get("items")))
        for kc in ob.get("killCredit") or []:
            if isinstance(kc, Mapping):
                npcs.update(i for i in (kc.get("ids") or []) if isinstance(i, int))
                if isinstance(kc.get("baseId"), int):
                    npcs.add(kc["baseId"])
        if isinstance(q.get("sourceItemId"), int):
            item_ids.add(q["sourceItemId"])
        item_ids.update(i for i in (q.get("requiredSourceItems") or []) if isinstance(i, int))
    for iid in list(item_ids):
        it = items.get(iid) or {}
        npcs.update(it.get("npcDrops") or [])
        objects.update(it.get("objectDrops") or [])
    return npcs, objects, item_ids


def build_zones(qdb: Path, questie: Path, quests: Mapping[int, Mapping[str, Any]],
                npcs: Mapping[int, Mapping[str, Any]], objects: Mapping[int, Mapping[str, Any]],
                faction: str = "horde") -> dict[str, dict[str, Any]]:
    from pipeline.p2 import support

    support_dir = qdb / "support" / "Forever"
    maps = support.load_zone_maps(support_dir)
    dungeons = support.load_dungeons(support_dir, horde=(faction == "horde"))
    names = support.load_zone_names(questie)
    a2u, sub = maps["areaIdToUiMapId"], maps["subZoneToParentZone"]
    areas: set[int] = set(a2u) | set(sub) | set(sub.values()) | set(names) | set(dungeons)
    for q in quests.values():
        if q.get("areaId"):
            areas.add(int(q["areaId"]))
    for coll in (npcs, objects):
        for e in coll.values():
            if e.get("zoneID"):
                areas.add(int(e["zoneID"]))
            areas.update(int(a) for a in (e.get("spawns") or {}))
    areas.discard(0)
    out: dict[str, dict[str, Any]] = {}
    for a in sorted(areas):
        parent = sub.get(a)
        out[str(a)] = _clean({
            "name": (names.get(a) or {}).get("name") or (dungeons.get(a) or {}).get("name"),
            "uiMapId": a2u.get(a),
            "parent": parent if parent and parent != a else None,
            "continent": (names.get(a) or {}).get("continentKey"),
        })
    return out


def load_source(qdb: Path, questie: Path, verbose: bool = False, faction: str = "horde") -> dict[str, Any]:
    from pipeline.p2.horde import horde_mask, races_ok
    from pipeline.p2.meta import load_meta
    from pipeline.p2.normalize import named_row
    from pipeline.p2 import support

    combined = export_merged(qdb, verbose)
    metas = load_meta(qdb)
    files = {"Quest": "foreverQuestDB.lua", "Npc": "foreverNpcDB.lua", "Object": "foreverObjectDB.lua", "Item": "foreverItemDB.lua"}
    classic_files = {"Quest": "classicQuestDB.lua", "Npc": "classicNpcDB.lua", "Object": "classicObjectDB.lua", "Item": "classicItemDB.lua"}
    named: dict[str, dict[int, dict[str, Any]]] = {}
    base: dict[str, set[int]] = {}
    for entity, fname in files.items():
        log(verbose, "parse", fname)
        rows = parse_combined(combined / fname)
        named[entity] = {}
        for eid, row in rows.items():
            decoded = named_row(metas[entity], _row_dict(row), keep_empty_givers=(entity == "Quest"))
            decoded["id"] = eid
            named[entity][eid] = decoded
        base[entity] = classic_ids(qdb / "data" / "Classic" / classic_files[entity])
    sort_keys = load_sort_keys(qdb)
    xp = support.load_xp(qdb / "support" / "Forever")
    for q in named["Quest"].values():
        decorate_quest(q, sort_keys, xp)
    mask = horde_mask(_HORDE_RACE_KEYS) if faction == "horde" else int(_HORDE_RACE_KEYS["ALL_ALLIANCE"])
    other = "A" if faction == "horde" else "H"
    horde_quests: dict[int, dict[str, Any]] = {}
    npcs = named["Npc"]
    for qid, q in named["Quest"].items():
        if not races_ok(q.get("requiredRaces"), mask) or not q.get("name"):
            continue
        if not q.get("requiredRaces"):
            st = q.get("startedBy") or {}
            starters = st.get("npc") or []
            if starters and not st.get("object") and not st.get("item") and all(
                    npcs.get(n, {}).get("friendlyToFaction") == other for n in starters):
                continue
        horde_quests[qid] = q
    ref_n, ref_o, ref_i = _referenced(horde_quests.values(), named["Item"])
    return {
        "horde_quests": horde_quests,
        "npcs": npcs,
        "objects": {i: o for i, o in named["Object"].items() if i in ref_o},
        "items": {i: it for i, it in named["Item"].items() if i in ref_i},
        "base": base,
        "ref_npcs": ref_n,
        "zones": build_zones(qdb, questie, horde_quests, npcs, named["Object"], faction),
        "evidence": {k: (qdb / rel).read_text(encoding="utf-8") for k, rel in PINS["evidence"].items()},
    }


def run(qdb: Path, questie: Path, out_dir: Path, verbose: bool = False, faction: str = "horde") -> dict[str, Any]:
    src = load_source(qdb, questie, verbose, faction)
    base = src["base"]
    zones_raw = src["zones"]
    hq = src["horde_quests"]
    quests = {int(qid): compact_quest(q, zones_raw, base["Quest"]) for qid, q in hq.items()}
    npcs_by_id = src["npcs"]
    objs_by_id = src["objects"]
    zone_from_giver = fill_zone_from_giver(quests, npcs_by_id, objs_by_id, zones_raw)
    ev = evidence_ids(src["evidence"]["traces"], src["evidence"]["deltaBase"], src["evidence"]["authoredFixes"])
    apply_confidence(quests, ev)
    refs = src["ref_npcs"]
    npcs = {int(n["id"]): compact_npc(n, base["Npc"]) for n in npcs_by_id.values() if keep_npc(n, refs, faction)}
    objects = {int(o["id"]): compact_object(o, base["Object"]) for o in objs_by_id.values()}
    items = {int(i["id"]): compact_item(i, base["Item"]) for i in src["items"].values()}
    zones = zones_raw

    by_zone = forever_by_zone(quests)
    counts = {
        "quests": len(quests), "questsForever": sum(1 for q in quests.values() if q.get("forever")),
        "npcs": len(npcs), "npcsForever": sum(1 for n in npcs.values() if n.get("forever")),
        "objects": len(objects), "objectsForever": sum(1 for o in objects.values() if o.get("forever")),
        "items": len(items), "itemsForever": sum(1 for i in items.values() if i.get("forever")),
        "zones": len(zones),
        "questZoneFromGiver": zone_from_giver,
        "questsForeverHigh": sum(1 for q in quests.values() if q.get("foreverConfidence") == "high"),
        "questsForeverLow": sum(1 for q in quests.values() if q.get("foreverConfidence") == "low"),
    }
    meta = {
        "format": FORMAT_VERSION,
        "pins": PINS,
        "faction": ("Horde (Horde + neutral quests; Alliance-only NPCs dropped unless a kept quest references them)"
                    if faction == "horde" else
                    "Alliance (Alliance + neutral quests; Horde-only NPCs dropped unless a kept quest references them)"),
        "coordinates": "zone % (0-100) keyed by AreaTable zone id, Forever map frames (QuestieDB conversion)",
        "foreverFlag": "true when the id is absent from data/Classic at the same QuestieDB commit",
        "counts": counts,
        "foreverConfidence": ("high: id >= 90000 (Forever's own quest id range) or Forever-specific evidence "
                              "(player traces from Forever clients, or a wowhead.com/forever page cited in the generated "
                              "delta-base); low: id < 90000 (season-era id reused) with no such evidence"),
        "foreverQuestsByZone": dict(by_zone),
        "foreverQuestsByZoneConfidence": forever_by_zone_confidence(quests),
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, data in (("quests", quests), ("npcs", npcs), ("objects", objects), ("items", items), ("zones", zones)):
        (out_dir / f"{name}.json").write_text(dump_lines(data), encoding="utf-8")
    (out_dir / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log(verbose, counts)
    return meta


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--faction", choices=FACTIONS, default="horde")
    ap.add_argument("--out", default=None, help="output folder (default: content/questie-db, or content/questie-db-alliance)")
    ap.add_argument("--questiedb-dir", default=str(DEFAULT_QDB), help="QuestieDB git checkout (source tree)")
    ap.add_argument("--questie-dir", default=str(DEFAULT_QUESTIE), help="Questie addon checkout (zone names)")
    args = ap.parse_args(argv)
    qdb, questie = Path(args.questiedb_dir), Path(args.questie_dir)
    if not (qdb / "data" / "Forever" / "foreverQuestDB.lua").is_file():
        raise SystemExit(f"QuestieDB checkout not found at {qdb} (expected data/Forever/foreverQuestDB.lua)")
    if not (questie / "Localization" / "lookups" / "lookupZones.lua").is_file():
        raise SystemExit(f"Questie checkout not found at {questie}")
    staging = Path(tempfile.mkdtemp(prefix="questie-db-"))
    try:
        meta = run(qdb, questie, staging, args.verbose, args.faction)
        out = Path(args.out or (ALLIANCE_OUT_DIR if args.faction == "alliance" else OUT_DIR))
        out.mkdir(parents=True, exist_ok=True)
        for name in ("quests", "npcs", "objects", "items", "zones", "meta"):
            shutil.move(str(staging / f"{name}.json"), str(out / f"{name}.json"))
    finally:
        shutil.rmtree(staging, ignore_errors=True)
    print("[questie-import]", json.dumps(meta["counts"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
