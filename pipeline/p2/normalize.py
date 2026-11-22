"""Turn raw QuestieDB values (CBOR or Lua-harness JSON) into plain, named Python data.

Raw table values are Lua tables, so the same field can arrive as a list (dense) or as a
dict with int keys (holes: ``{3: [[4905, None, 0]]}``); Lua-harness JSON additionally has
string keys (``{"3": …}``). ``slots()`` turns either into a positional list with ``None`` holes.
"""
from __future__ import annotations

from typing import Any, Iterable

__all__ = [
    "text", "deep_text", "int_keys", "slots", "id_list", "givers", "objectives", "spawns",
    "trigger", "extra_objectives", "pair", "pairs", "round2", "named_row",
]


def text(v: Any) -> Any:
    return v.decode("utf-8", "replace") if isinstance(v, bytes) else v


def deep_text(v: Any) -> Any:
    """bytes → str everywhere; dict keys that are digit strings → int."""
    if isinstance(v, bytes):
        return v.decode("utf-8", "replace")
    if isinstance(v, list):
        return [deep_text(x) for x in v]
    if isinstance(v, tuple):
        return [deep_text(x) for x in v]
    if isinstance(v, dict):
        return {int_key(k): deep_text(x) for k, x in v.items()}
    return v


def int_key(k: Any) -> Any:
    k = text(k)
    if isinstance(k, str) and (k.isdigit() or (k.startswith("-") and k[1:].isdigit())):
        return int(k)
    if isinstance(k, float) and k.is_integer():
        return int(k)
    return k


def int_keys(v: Any) -> Any:
    return {int_key(k): x for k, x in v.items()} if isinstance(v, dict) else v


def slots(v: Any, n: int | None = None) -> list[Any]:
    """Lua table → positional list (1-based keys → index 0…), holes = ``None``."""
    if v is None:
        out: list[Any] = []
    elif isinstance(v, list):
        out = list(v)
    elif isinstance(v, dict):
        d = int_keys(v)
        ks = [k for k in d if isinstance(k, int) and k >= 1]
        size = max(ks) if ks else 0
        out = [d.get(i) for i in range(1, size + 1)]
    else:
        out = [v]
    if n is not None:
        out = (out + [None] * n)[:n]
    return out


def _num(v: Any) -> Any:
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v


def id_list(v: Any) -> list[int]:
    """idarray → sorted-unique-preserving list of ints (order kept, zeros/None dropped)."""
    out: list[int] = []
    for x in slots(v):
        x = _num(x)
        if isinstance(x, int) and x != 0 and x not in out:
            out.append(x)
    return out


def givers(v: Any) -> dict[str, list[int]]:
    """questgivers ``{npcIds?, objectIds?, itemIds?}`` → ``{"npc": [...], "object": [...], "item": [...]}``."""
    s = slots(v, 3)
    return {"npc": id_list(s[0]), "object": id_list(s[1]), "item": id_list(s[2])}


def round2(x: Any) -> Any:
    if isinstance(x, (int, float)):
        r = round(float(x), 2)
        return int(r) if r.is_integer() else r
    return x


def spawns(v: Any) -> dict[str, list[list[float]]]:
    """spawnlist ``{areaId: [[x, y, phase?], …]}`` → ``{"areaId": [[x, y] | [x, y, phase], …]}``.

    Coordinates are zone % (0–100) rounded to 2 decimals; ``[-1, -1]`` (inside an instance)
    is kept as is; a non-zero phase is kept as a third element.
    """
    out: dict[str, list[list[float]]] = {}
    if not v:
        return out
    if isinstance(v, list):  # dense keys 1..n encode as an array: index 0 is areaId 1 (Dun Morogh)
        v = {i + 1: rows for i, rows in enumerate(v) if rows is not None}
    for area, rows in int_keys(v).items():
        pts = []
        for row in slots(rows):
            r = slots(row)
            if len(r) < 2 or not isinstance(r[0], (int, float)) or not isinstance(r[1], (int, float)):
                continue
            pt = [round2(r[0]), round2(r[1])]
            if len(r) > 2 and isinstance(r[2], (int, float)) and r[2] and pt != [-1, -1]:
                pt.append(_num(r[2]))
            pts.append(pt)
        if pts:
            out[str(area)] = pts
    return dict(sorted(out.items(), key=lambda kv: int(kv[0])))


def pair(v: Any) -> list[Any] | None:
    s = [_num(x) for x in slots(v, 2)]
    if s[0] in (None, 0) and s[1] in (None, 0):
        return None
    return s


def pairs(v: Any) -> list[list[Any]]:
    return [p for p in (pair(x) for x in slots(v)) if p is not None]


def _entry(row: Any, names: Iterable[str]) -> dict[str, Any]:
    s = slots(row)
    out: dict[str, Any] = {}
    for i, name in enumerate(names):
        x = s[i] if i < len(s) else None
        x = _num(text(x))
        if x is None or x == "" or (name in ("icon",) and x == 0):
            continue
        out[name] = x
    return out


def objectives(v: Any) -> dict[str, Any]:
    """objectives (6 positional groups) → named groups (empty groups omitted).

    * creatures / objects / items: ``[{id, text?, icon?}]``
    * reputation: ``{factionId, value}``
    * killCredit: ``[{ids: [...], baseId, text?, icon?}]``
    * spells: ``[{id, text?, itemId?}]``
    """
    g = slots(v, 6)
    out: dict[str, Any] = {}
    for key, idx in (("creatures", 0), ("objects", 1), ("items", 2)):
        rows = [_entry(r, ("id", "text", "icon")) for r in slots(g[idx])]
        rows = [r for r in rows if r.get("id")]
        if rows:
            out[key] = rows
    rep = pair(g[3])
    if rep:
        out["reputation"] = {"factionId": rep[0], "value": rep[1]}
    kc = []
    for r in slots(g[4]):
        s = slots(r)
        e = _entry([None] + s[1:], ("ids", "baseId", "text", "icon"))
        e["ids"] = id_list(s[0] if s else None)
        if e["ids"] or e.get("baseId"):
            kc.append(e)
    if kc:
        out["killCredit"] = kc
    sp = [_entry(r, ("id", "text", "itemId")) for r in slots(g[5])]
    sp = [r for r in sp if r.get("id")]
    if sp:
        out["spells"] = sp
    return out


def trigger(v: Any) -> dict[str, Any] | None:
    s = slots(v, 2)
    t = text(s[0])
    sp = spawns(s[1])
    if not t and not sp:
        return None
    out: dict[str, Any] = {"spawns": sp}
    if t:
        out["text"] = t
    return out


def extra_objectives(v: Any) -> list[dict[str, Any]]:
    """``{{spawnList?, iconType, text?, objectiveIndex, references?}, …}`` → named rows.

    ``references`` is ``[{kind: "monster"|"object"|"item", id}]``.
    """
    out = []
    for row in slots(v):
        s = slots(row, 5)
        e: dict[str, Any] = {"spawns": spawns(s[0])}
        if s[1] is not None:
            e["icon"] = _num(s[1])
        if s[2]:
            e["text"] = text(s[2])
        if s[3] is not None:
            e["index"] = _num(s[3])
        refs = []
        for ref in slots(s[4]):
            r = slots(ref, 2)
            if r[0] and r[1]:
                refs.append({"kind": text(r[0]), "id": _num(r[1])})
        if refs:
            e["references"] = refs
        out.append(e)
    return out


# --- structure-driven conversion -------------------------------------------------------------

def _string_list(v: Any) -> list[str]:
    return [text(x) for x in slots(v) if x not in (None, "", b"")]


def _structured(structure: str | None, value: Any) -> Any:
    if structure == "questgivers":
        return givers(value)
    if structure == "objectives":
        return objectives(value)
    if structure == "idarray":
        return id_list(value)
    if structure == "stringarray":
        return _string_list(value)
    if structure == "spawnlist":
        return spawns(value)
    if structure == "trigger":
        return trigger(value)
    if structure == "extraobjectives":
        return extra_objectives(value)
    if structure == "pair":
        return pair(value)
    if structure in ("pairs", "reputationpairs"):
        return pairs(value)
    if structure == "waypointlist":
        return None  # paths are not needed downstream; dropped to keep output small
    return deep_text(value)


def is_empty(v: Any) -> bool:
    if v is None or v == "" or v == 0:
        return True
    if isinstance(v, (list, dict)):
        if isinstance(v, dict) and set(v) <= {"npc", "object", "item"}:
            return not any(v.values())
        return len(v) == 0
    return False


def named_row(meta: Any, raw: dict[int, Any], *, keep_empty_givers: bool = True) -> dict[str, Any]:
    """Raw ``{fieldIndex: value}`` → ``{fieldName: normalised value}``; default values omitted.

    ``meta`` is a :class:`pipeline.p2.meta.EntityMeta`. Constant placeholder fields
    (``constantValues``, e.g. NPC min/max health) are skipped. Questgivers / objectives are
    never-nil structures in QuestieDB, so they are kept (possibly empty) when
    ``keep_empty_givers``.
    """
    out: dict[str, Any] = {}
    for idx in sorted(int(k) for k in int_keys(raw)):
        if idx in meta.constant_values:
            continue
        name = meta.names.get(idx)
        if name is None:
            continue
        value = int_keys(raw)[idx]
        typ = meta.types.get(idx)
        if typ == "table":
            v = _structured(meta.structures.get(idx), value)
        elif typ == "string":
            v = text(value)
        else:
            v = _num(value)
        if is_empty(v):
            continue
        out[name] = v
    if keep_empty_givers:
        for idx, structure in meta.structures.items():
            if structure in ("questgivers",) and meta.names[idx] not in out:
                out[meta.names[idx]] = {"npc": [], "object": [], "item": []}
    return out
