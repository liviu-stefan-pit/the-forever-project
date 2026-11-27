"""Write tpf-db: confirmed files from the logs, unconfirmed files from QuestieDB, and meta.json.

``build_db`` is pure (returns file name → JSON value); ``write_db`` writes them with the repo's deterministic JSON
writer (sorted keys, ``\\n`` line endings). Quest-keyed files are written one record per line, like
``content/questie-db``, so diffs stay small.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pipeline.common.jsonio import dumps
from pipeline.common.paths import is_inside_wow

from .build import build_confirmed
from .reader import Session
from .unconfirmed import build_unconfirmed, promote

__all__ = ["FORMAT", "CONFIRMED_FILES", "UNCONFIRMED_FILES", "build_db", "write_db", "read_db", "render"]

FORMAT = 1
CONFIRMED_FILES = ("quests.json", "npcs.json", "objects.json", "items.json", "zones.json", "drops.json", "xp.json",
                   "spawns.json", "trainers.json")
UNCONFIRMED_FILES = ("quests.json", "npcs.json", "objects.json", "items.json")
# One record per line for id-keyed files; nested files are indented.
_ID_KEYED = {"quests.json", "npcs.json", "objects.json", "items.json", "zones.json", "trainers.json"}


def read_db(out_dir: Path) -> dict[str, Any]:
    """The current tpf-db on disk (missing files read as empty)."""
    out: dict[str, Any] = {}
    for f in CONFIRMED_FILES + ("meta.json",):
        p = out_dir / f
        out[f] = json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
    for f in UNCONFIRMED_FILES:
        p = out_dir / "unconfirmed" / f
        out[f"unconfirmed/{f}"] = json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
    return out


def build_db(sessions: list[Session], questie_dir: Path, zone_names: list[str], previous: dict[str, Any] | None = None,
             repo_url: str = "") -> dict[str, Any]:
    previous = previous or {}
    conf = build_confirmed(sessions)
    sessions_meta = conf.pop("_sessions")
    observed_by = conf.pop("_observedBy")
    # Zones the logs saw are always in scope for unconfirmed quests, besides the ones asked for.
    names = sorted(set(zone_names) | {z["name"] for z in conf["zones.json"].values() if z.get("name")})
    unc = build_unconfirmed(questie_dir, names, conf)
    label = unc.pop("_label")
    prev_meta = previous.get("meta.json") or {}
    promoted = set(promote(previous.get("unconfirmed/quests.json") or {}, conf["quests.json"]))
    promoted |= {int(i) for i in prev_meta.get("promoted", []) if str(i) in conf["quests.json"]}
    counts = {f: len(conf[f]) for f in ("quests.json", "npcs.json", "objects.json", "items.json", "zones.json", "trainers.json")}
    counts["drops.json"] = {"mobs": len(conf["drops.json"]["mobs"]), "objects": len(conf["drops.json"]["objects"]),
                            "questRows": len(conf["drops.json"]["quests"])}
    counts["xp.json"] = {"quests": len(conf["xp.json"]["quests"]), "mobs": len(conf["xp.json"]["kills"])}
    counts["spawns.json"] = sum(len(v) for z in conf["spawns.json"].values() for v in z.values())
    ucounts = {f: len(unc[f]) for f in UNCONFIRMED_FILES}
    by_class: dict[str, list[int]] = {}
    for k, q in unc["quests.json"].items():
        for c in q.get("classNames") or ["(any class)"]:
            by_class.setdefault(c, []).append(int(k))
    meta = {
        "format": FORMAT,
        "name": "tpf-db",
        "title": "The Forever Project tpf-db",
        "license": {"confirmed": "CC-BY-4.0", "unconfirmed/": "GPL-3.0 (QuestieDB)", "parser": "MIT (pipeline/adventurelog)"},
        "credit": f"Data from The Forever Project tpf-db (CC BY 4.0), {repo_url}".rstrip(", "),
        "generator": "pipeline/adventurelog (py -3 -I pipeline/adventurelog)",
        "zones": names,
        "coordinates": "zone % (0-100) of the player's position when the event fired, keyed by \"map:<uiMapId>\"",
        "evidence": "evidence[] = {session, t[]}: AdventureLog session id and each event's t (seconds since that login)",
        "observedBy": observed_by,
        "sessions": sessions_meta,
        "counts": {"confirmed": counts, "unconfirmed": ucounts},
        "unconfirmedSource": label,
        "unconfirmedByClass": {k: sorted(v) for k, v in sorted(by_class.items())},
        "promoted": sorted(promoted),
    }
    files: dict[str, Any] = {f: conf[f] for f in CONFIRMED_FILES}
    files["meta.json"] = meta
    for f in UNCONFIRMED_FILES:
        files[f"unconfirmed/{f}"] = unc[f]
    return files


def render(name: str, value: Any) -> str:
    """File text for ``name``. Id-keyed objects: one ``"id":{…}`` per line."""
    base = name.rsplit("/", 1)[-1]
    if base in _ID_KEYED and isinstance(value, dict) and value:
        keys = sorted(value, key=lambda k: (0, int(k)) if k.isdigit() else (1, k))
        body = ",\n".join(f"{json.dumps(k, ensure_ascii=False)}:{dumps(value[k], indent=None)}" for k in keys)
        return "{\n" + body + "\n}\n"
    return dumps(value) + "\n"


def write_db(out_dir: Path, files: dict[str, Any]) -> list[Path]:
    out_dir = Path(out_dir)
    if is_inside_wow(out_dir):
        raise PermissionError(f"refusing to write inside the WoW folder: {out_dir}")
    written = []
    for name in sorted(files):
        p = out_dir / name
        p.parent.mkdir(parents=True, exist_ok=True)
        text = render(name, files[name])
        tmp = p.with_name(p.name + ".tmp")
        with open(tmp, "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
        tmp.replace(p)
        written.append(p)
    return written

