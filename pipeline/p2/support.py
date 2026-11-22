"""QuestieDB ``support/Forever/**`` tables and Questie zone names, read with ``lua_table``."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from ..common import lua_table
from .normalize import int_keys, slots

__all__ = ["load_zone_maps", "load_dungeons", "load_zone_names", "load_xp", "parse_xp_traces",
           "load_drop_tables", "drop_rate"]


def _read(p: Path) -> str:
    return Path(p).read_text(encoding="utf-8")


def _int_map(v: Any) -> dict[int, int]:
    return {int(k): int(x) for k, x in int_keys(lua_table.table_to_dict(v)).items()}


def _return_blob(text: str, target: str) -> dict[int, int]:
    return _int_map(lua_table.parse_return_string(lua_table.find_value(text, target)))


def load_zone_maps(support_dir: Path) -> dict[str, dict[int, int]]:
    """Effective maps exactly as Questie's ``ZoneDB.Initialize`` builds them (override wins)."""
    z = Path(support_dir) / "Zones"
    a = _read(z / "areaIdToUiMapId.lua")
    u = _read(z / "uiMapIdToAreaId.lua")
    s = _read(z / "subZoneToParentZone.lua")
    area_to_ui = _return_blob(a, "ZoneDB.private.areaIdToUiMapId")
    area_to_ui.update(_return_blob(a, "ZoneDB.private.areaIdToUiMapIdOverride"))
    ui_to_area = _return_blob(u, "ZoneDB.private.uiMapIdToAreaId")
    ui_to_area.update(_return_blob(u, "ZoneDB.private.uiMapIdToAreaIdOverride"))
    sub_to_parent = _return_blob(s, "ZoneDB.private.subZoneToParentZone")
    sub_to_parent.update(_return_blob(s, "ZoneDB.private.subZoneToParentZoneOverride"))
    return {"areaIdToUiMapId": area_to_ui, "uiMapIdToAreaId": ui_to_area, "subZoneToParentZone": sub_to_parent}


_FACTION_CHOICE = re.compile(r"\(isHorde and (\{[^{}]*\})\) or (\{[^{}]*\})")


def load_dungeons(support_dir: Path, *, horde: bool = True) -> dict[int, dict[str, Any]]:
    """``dungeons.lua`` base table (the Era branch; the WotLK/Cata branches never run on Forever).

    ``(isHorde and {a}) or {b}`` choices are resolved for the requested faction.
    Returns ``{areaId: {name, alternativeAreaIds, parentAreaId, entrances: [[areaId, x, y]]}}``.
    """
    text = _FACTION_CHOICE.sub(r"\1" if horde else r"\2", _read(Path(support_dir) / "Zones" / "dungeons.lua"))
    raw = int_keys(lua_table.find_value(text, "dungeons"))
    out: dict[int, dict[str, Any]] = {}
    for area, entry in raw.items():
        s = slots(entry, 4)
        out[int(area)] = {
            "name": s[0],
            "alternativeAreaIds": [int(x) for x in slots(s[1])],
            "parentAreaId": int(s[2]) if s[2] else None,
            "entrances": [[int(p[0]), p[1], p[2]] for p in (slots(e, 3) for e in slots(s[3])) if p[0]],
        }
    return out


def load_zone_names(questie_dir: Path) -> dict[int, dict[str, Any]]:
    """``l10n.zoneLookup[continentKey][areaId] = name`` from Questie ``lookupZones.lua``.

    Returns ``{areaId: {"name": str, "continentKey": int}}``. Continent keys are Questie's
    lookup groups (0 = Eastern Kingdoms, 1 = Kalimdor, 530/571/… = later continents and
    instance maps); the first group listing an area wins (lowest key).
    """
    text = _read(Path(questie_dir) / "Localization" / "lookups" / "lookupZones.lua")
    lookup = int_keys(lua_table.find_value(text, "l10n.zoneLookup"))
    out: dict[int, dict[str, Any]] = {}
    for cont in sorted(lookup):
        for area, name in int_keys(lua_table.table_to_dict(lookup[cont])).items():
            if isinstance(area, int) and area not in out and isinstance(name, str):
                out[area] = {"name": name, "continentKey": int(cont)}
    return out


_TRACE_LINE = re.compile(r"^QuestXP\.db\[(\d+)\]\s*=\s*\{\s*(-?\d+)\s*,\s*(-?\d+)\s*\}", re.M)


def parse_xp_traces(text: str) -> dict[int, tuple[int, int]]:
    return {int(q): (int(lvl), int(xp)) for q, lvl, xp in _TRACE_LINE.findall(text)}


def load_xp(support_dir: Path) -> dict[int, dict[str, Any]]:
    """Quest XP: ``xpDB-classic`` (``QuestXP.db = {[id] = {level, xp}}``) then ``xpDB-traces``
    (``QuestXP.db[id] = {level, xp}`` statements) which load later in the TOC and win.

    Returns ``{questId: {"level": int, "xp": int, "src": "classic"|"traces"}}``.
    """
    q = Path(support_dir) / "QuestXP"
    classic = int_keys(lua_table.find_value(_read(q / "xpDB-classic.lua"), "QuestXP.db"))
    out: dict[int, dict[str, Any]] = {}
    for qid, v in classic.items():
        s = slots(v, 2)
        out[int(qid)] = {"level": int(s[0] or 0), "xp": int(s[1] or 0), "src": "classic"}
    for qid, (lvl, xp) in parse_xp_traces(_read(q / "xpDB-traces.lua")).items():
        out[qid] = {"level": lvl, "xp": xp, "src": "traces"}
    return out


def load_drop_tables(support_dir: Path) -> dict[str, dict[int, dict[int, float]]]:
    """Drop-rate tables: ``wowhead``, ``pserver`` (cmangos) and Era ``corrections``.

    Correction values ``-1`` / ``-2`` are references to the Wowhead / pserver value
    (``DropDB.correctionKeys``). Forever runs ``Expansions.Current = Era`` so only the Era
    correction block applies.
    """
    d = Path(support_dir) / "DropTables"
    text = _read(d / "classicItemDrops.lua")

    def table(target: str, src: str, names: dict[str, Any] | None = None) -> dict[int, dict[int, float]]:
        raw = lua_table.find_value(src, target, names)
        if isinstance(raw, str):
            raw = lua_table.parse_return_string(raw)
        return {int(i): {int(n): float(r) for n, r in int_keys(lua_table.table_to_dict(m)).items()}
                for i, m in int_keys(lua_table.table_to_dict(raw)).items()}

    corr_text = _read(d / "itemDropCorrections.lua")
    names = {"DropKeys.WOWHEAD": -1, "DropKeys.PSERVER": -2,
             "DropDB.correctionKeys.WOWHEAD": -1, "DropDB.correctionKeys.PSERVER": -2}
    return {
        "wowhead": table("QuestieClassicItemDrops.wowheadData", text),
        "pserver": table("QuestieClassicItemDrops.cmangosData", text),
        "corrections": table("QuestieItemDropCorrections.Era", corr_text, names),
    }


def drop_rate(tables: dict[str, dict[int, dict[int, float]]], item_id: int, npc_id: int) -> tuple[float, str] | None:
    """Port of Questie ``DropDB.GetItemDroprate``: corrections > pserver > wowhead."""
    corr = tables["corrections"].get(item_id, {}).get(npc_id)
    if corr is not None:
        if corr >= 0:
            return corr, "questie"
        if corr == -1 and npc_id in tables["wowhead"].get(item_id, {}):
            return tables["wowhead"][item_id][npc_id], "wowhead"
        if corr == -2 and npc_id in tables["pserver"].get(item_id, {}):
            return tables["pserver"][item_id][npc_id], "cmangos"
    if npc_id in tables["pserver"].get(item_id, {}):
        return tables["pserver"][item_id][npc_id], "cmangos"
    if npc_id in tables["wowhead"].get(item_id, {}):
        return tables["wowhead"][item_id][npc_id], "wowhead"
    return None
