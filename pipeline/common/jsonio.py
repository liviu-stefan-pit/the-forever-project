"""Deterministic JSON read/write helpers.

Output is stable across runs: sorted keys, UTF-8 (no ASCII escaping), ``\\n``
line endings, trailing newline, atomic replace. Writing inside the WoW folder
is refused (plan.md §5).
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from .paths import is_inside_wow

__all__ = ["dumps", "write_json", "read_json"]


def dumps(obj: Any, *, indent: int | None = 2) -> str:
    """Serialise deterministically. ``indent=None`` gives compact output."""
    if indent is None:
        return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, indent=indent, allow_nan=False)


def write_json(path: str | os.PathLike[str], obj: Any, *, indent: int | None = 2) -> Path:
    """Write ``obj`` to ``path`` (parent dirs created). Returns the path."""
    p = Path(path)
    if is_inside_wow(p):
        raise PermissionError(f"refusing to write inside the WoW folder: {p}")
    p.parent.mkdir(parents=True, exist_ok=True)
    text = dumps(obj, indent=indent) + "\n"
    tmp = p.with_name(p.name + ".tmp")
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    os.replace(tmp, p)
    return p


def read_json(path: str | os.PathLike[str]) -> Any:
    with open(path, encoding="utf-8") as f:
        return json.load(f)
