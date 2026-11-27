"""Read AdventureLog sessions without modifying the source.

Two inputs are understood:

* the addon's SavedVariables file (``WTF/Account/<acct>/<realm>/<char>/SavedVariables/AdventureLog.lua``):
  ``AdventureLogDB = { sessions = { {id=…, events={"<json>", …}, header="<json>", summary="<json>"}, … },
  char = {…} }``. Each event is a JSON string inside the Lua table.
* the exporter's folder (``Adventures/<Character> - adventure/``): ``character.json`` plus
  ``sessions/<sessionId>.jsonl`` (one event per line). A single ``.jsonl`` file also works; its character is read
  from ``../character.json`` when present.

Files are opened read-only. Nothing here writes.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

from pipeline.common import lua_table

__all__ = ["Session", "read_sources", "read_saved_variables", "read_export_dir", "read_jsonl"]


@dataclass
class Session:
    id: str
    char: dict[str, Any]
    events: list[dict[str, Any]]
    header: dict[str, Any] | None = None
    summary: dict[str, Any] | None = None
    source: str = ""
    # Set by the builder: events carry ``_i`` (index in the session) for stable ordering.
    meta: dict[str, Any] = field(default_factory=dict)


def _loads(raw: Any) -> Any:
    if isinstance(raw, (dict, list)) or raw is None:
        return raw
    try:
        return json.loads(raw)
    except (TypeError, ValueError):
        return None


def _events(raw: Iterable[Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for r in raw:
        e = _loads(r)
        if isinstance(e, dict) and isinstance(e.get("e"), str):
            out.append(e)
    return out


def _char(raw: Any) -> dict[str, Any]:
    c = raw if isinstance(raw, dict) else {}
    return {k: c[k] for k in ("name", "realm", "class", "race", "faction") if c.get(k) not in (None, "")}


def read_saved_variables(path: str | Path) -> list[Session]:
    p = Path(path)
    text = p.read_text(encoding="utf-8", errors="replace")
    db = lua_table.find_value(text, "AdventureLogDB")
    if not isinstance(db, dict):
        return []
    char = _char(db.get("char"))
    raw_sessions = db.get("sessions") or []
    if isinstance(raw_sessions, dict):
        raw_sessions = [raw_sessions[k] for k in sorted(raw_sessions)]
    out: list[Session] = []
    for s in raw_sessions:
        if not isinstance(s, dict) or not s.get("id"):
            continue
        ev = s.get("events") or []
        if isinstance(ev, dict):
            ev = [ev[k] for k in sorted(ev)]
        out.append(Session(id=str(s["id"]), char=dict(char), events=_events(ev), header=_loads(s.get("header")),
                           summary=_loads(s.get("summary")), source=p.name))
    return out


def read_jsonl(path: str | Path, char: dict[str, Any] | None = None) -> Session:
    p = Path(path)
    if char is None:
        cj = p.parent.parent / "character.json"
        char = _char(json.loads(cj.read_text(encoding="utf-8-sig"))) if cj.is_file() else {}
    lines = p.read_text(encoding="utf-8-sig", errors="replace").splitlines()
    return Session(id=p.stem, char=dict(char), events=_events(l for l in lines if l.strip()), source=p.name)


def read_export_dir(path: str | Path) -> list[Session]:
    d = Path(path)
    cj = d / "character.json"
    char = _char(json.loads(cj.read_text(encoding="utf-8-sig"))) if cj.is_file() else {}
    sdir = d / "sessions" if (d / "sessions").is_dir() else d
    return [read_jsonl(f, char) for f in sorted(sdir.glob("*.jsonl"))]


def read_sources(paths: Iterable[str | Path]) -> list[Session]:
    """Every session from every source. The same (character, session id) read twice is kept once: the copy
    with more events wins (the exporter may hold a session the SavedVariables no longer has, and vice versa)."""
    best: dict[tuple[str, str], Session] = {}
    for raw in paths:
        p = Path(raw)
        if p.is_dir():
            sessions = read_export_dir(p)
        elif p.suffix.lower() == ".jsonl":
            sessions = [read_jsonl(p)]
        else:
            sessions = read_saved_variables(p)
        for s in sessions:
            key = (s.char.get("name", ""), s.id)
            if key not in best or len(s.events) > len(best[key].events):
                best[key] = s
    return [best[k] for k in sorted(best, key=lambda k: (k[1], k[0]))]
