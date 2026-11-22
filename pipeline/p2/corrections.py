"""Run ``pipeline/lua/run_corrections.lua`` (Lua 5.1) and merge its Dynamic Corrections.

The harness evaluates QuestieDB's remaining Dynamic Corrections for one faction plus Questie's
policy lists (blacklists, event quests, quest tags) and prints JSON. Lua tables arrive as JSON
arrays (keys 1..n) or objects with string keys; ``normalize.int_keys`` restores int keys.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any

from .normalize import int_keys

__all__ = ["HARNESS", "find_lua", "run_harness", "merge_dynamic", "LAYERS"]

HARNESS = Path(__file__).resolve().parents[1] / "lua" / "run_corrections.lua"
LAYERS = ("legacy", "forever")  # apply order: Era-window legacy fixes, then Forever window


def find_lua() -> str | None:
    for name in ("lua5.1", "lua51", "lua"):
        exe = shutil.which(name)
        if exe:
            return exe
    return None


def run_harness(questiedb_dir: Path, questie_dir: Path, faction: str = "Horde",
                lua: str | None = None, timeout: float = 120.0) -> dict[str, Any]:
    """Run the harness; raises ``RuntimeError`` when Lua is missing or the run fails."""
    exe = lua or find_lua()
    if not exe:
        raise RuntimeError("Lua 5.1 interpreter not found on PATH (lua/lua5.1)")
    proc = subprocess.run(
        [exe, str(HARNESS), str(questiedb_dir), str(questie_dir), faction],
        capture_output=True, timeout=timeout, check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"harness exited {proc.returncode}: {proc.stderr.decode('utf-8', 'replace')[:2000]}")
    return json.loads(proc.stdout.decode("utf-8"))


def merge_dynamic(rows: dict[int, dict[int, Any]], dynamic: dict[str, Any]) -> dict[str, Any]:
    """Merge one datatype's correction layers over ``rows`` in place (field replacement).

    ``dynamic`` = ``{"legacy": {id: {field: value}}, "forever": {...}}``. Later layers win per
    field, matching QuestieDB's registry order (EraDynamic < ForeverDynamic). Returns stats.
    """
    stats = {"rows": 0, "fields": 0, "new": []}
    for layer in LAYERS:
        for eid, fields in int_keys(dynamic.get(layer) or {}).items():
            if not isinstance(eid, int):
                continue
            stats["rows"] += 1
            if eid not in rows:
                rows[eid] = {}
                stats["new"].append(eid)
            for fidx, value in int_keys(fields or {}).items():
                if not isinstance(fidx, int):
                    continue
                if not 0 < fidx < 1000:
                    raise ValueError(f"unsupported correction operation key {fidx} for id {eid}")
                rows[eid][fidx] = value
                stats["fields"] += 1
    stats["new"] = sorted(stats["new"])
    return stats
