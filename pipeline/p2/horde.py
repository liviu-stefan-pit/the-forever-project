"""Faction masks, the Horde quest filter and the ``custom`` (Forever-only) rule."""
from __future__ import annotations

from typing import Any, Mapping

__all__ = ["horde_mask", "races_ok", "class_names", "race_names", "origin_of", "is_custom",
           "VANILLA_ID_CEILING", "horde_filter_reason"]

# Horde member races per QuestieDB src/corrections/enum/expansions.lua (Forever block):
# classicHorde = ORC + UNDEAD + TAUREN + TROLL, ALL_HORDE = classicHorde + SKYBORNE_HORDE (race 96, bit 33).
_HORDE_RACES = ("ORC", "UNDEAD", "TAUREN", "TROLL", "SKYBORNE_HORDE")


def horde_mask(race_keys: Mapping[str, int]) -> int:
    """Horde race mask from QuestieDB ``raceKeys`` (prefers ``ALL_HORDE``; checks it equals the members)."""
    members = 0
    for r in _HORDE_RACES:
        if r in race_keys:
            members |= int(race_keys[r])
    all_horde = int(race_keys.get("ALL_HORDE", members))
    if members and all_horde != members:
        raise ValueError(f"ALL_HORDE {all_horde} != member races {members}")
    return all_horde


def races_ok(races: int | None, mask: int) -> bool:
    """Questie semantics: 0/None = every race; otherwise any overlap with the faction mask."""
    return not races or (int(races) & mask) != 0


def _bits(value: int, keys: Mapping[str, int], skip: tuple[str, ...]) -> list[str]:
    out = []
    for name, bit in sorted(keys.items(), key=lambda kv: (kv[1], kv[0])):
        if name in skip or bit == 0 or bit & (bit - 1):
            continue  # skip NONE / composite masks
        if value & bit:
            out.append(name)
    return out


def race_names(races: int, race_keys: Mapping[str, int]) -> list[str]:
    return _bits(int(races or 0), race_keys, ("NONE",))


def class_names(classes: int, class_keys: Mapping[str, int]) -> list[str]:
    return _bits(int(classes or 0), class_keys, ("NONE", "ALL_CLASSES"))


# ---- custom rule ------------------------------------------------------------------------------
# Evidence (see data/reports/p2_questie.md):
#  * xpDB-classic.lua is generated from Blizzard Classic Era data: all 3,494 ids are < 10,000;
#  * the baked DB has no quest id in 10,000–59,999; ids ≥ 60,000 come from later Classic seasons
#    (promo 6086x, Love is in the Air 655xx, SoD 76k–89k) or from Forever itself (90k+, e.g.
#    97279 "Wayward Weapons"); every one of them is in xpDB-traces only (Forever player traces);
#  * NPC/item/object ids above the vanilla ranges are later-expansion or Forever content
#    (Dalaran citizens 32xxx, transmog/hidden items 13xxxx, Forever 25xxxx–29xxxx …).
VANILLA_ID_CEILING: dict[str, int] = {
    "Quest": 10000,    # vanilla 1.12 quest ids are < 10,000 (max seen ~9,7xx)
    "Npc": 20000,      # vanilla creatures < ~16,1xx (+ a few Era additions up to ~18,xxx)
    "Item": 25000,     # vanilla items < ~24,3xx; TBC starts at 25,000
    "Object": 190000,  # vanilla game objects < ~18x,xxx
}


def origin_of(entity: str, entity_id: int) -> str:
    """``vanilla`` | ``season`` (later Classic seasons, 60k–89,999 quests) | ``forever``."""
    if entity_id < VANILLA_ID_CEILING[entity]:
        return "vanilla"
    if entity == "Quest" and 60000 <= entity_id < 90000:
        return "season"
    return "forever"


def is_custom(entity: str, entity_id: int) -> bool:
    """Forever-only (no vanilla Wowhead Classic page): anything outside the vanilla id space."""
    return origin_of(entity, entity_id) != "vanilla"


def horde_filter_reason(q: Mapping[str, Any], mask: int) -> str | None:
    """Why a decoded quest is excluded from the Horde set, or ``None`` when it is kept.

    Uses the derived keys added by p2_questie (``blacklist``, ``eventOnly`` …).
    """
    if not races_ok(q.get("requiredRaces"), mask):
        return "race"
    if q.get("blacklist") == "hidden":
        return "blacklisted"
    if q.get("eventOnly"):
        return "event"
    if q.get("aqWarEffort") or q.get("invasion"):
        return "event"
    if not q.get("name"):
        return "no-name"
    return None
