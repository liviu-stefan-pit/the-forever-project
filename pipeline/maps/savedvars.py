"""Read ``WTF/Account/*/SavedVariables/GuideWebExport.lua`` (GuideWebExport addon)."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import lua_table


def convert(bounds: dict[str, float], a: float, b: float) -> tuple[float, float]:
    """World point to zone % with exact map bounds (``a`` against left/width, ``b`` against top/height)."""
    return ((bounds["left"] - a) / bounds["width"] * 100.0, (bounds["top"] - b) / bounds["height"] * 100.0)

__all__ = ["ExportData", "find_saved_variables", "read_export"]


@dataclass
class ExportData:
    path: Path
    exported_at: int | None
    build: dict[str, Any]
    maps: dict[int, dict[str, Any]]                  # uiMapID -> raw entry
    characters: dict[str, dict[str, Any]] = field(default_factory=dict)
    last_character: str | None = None

    def exact_bounds(self, map_id: int) -> dict[str, float] | None:
        e = self.maps.get(map_id) or {}
        try:
            w, h = float(e["width"]), float(e["height"])
            left, top = float(e["left"]), float(e["top"])
        except (KeyError, TypeError, ValueError):
            return None
        if w == 0 or h == 0:
            return None
        return {"left": left, "top": top, "width": w, "height": h}


def find_saved_variables(wow_root: Path, preferred: Path | None = None) -> list[Path]:
    """Existing GuideWebExport.lua files; the preferred one (configured account) first."""
    found: list[Path] = []
    if preferred is not None and preferred.is_file():
        found.append(preferred)
    acct = wow_root / "WTF" / "Account"
    if acct.is_dir():
        for p in sorted(acct.glob("*/SavedVariables/GuideWebExport.lua")):
            if p not in found:
                found.append(p)
    return found


def read_export(path: Path) -> ExportData:
    text = path.read_text(encoding="utf-8", errors="replace")
    vals = lua_table.load_assignments(text)
    db = vals.get("GuideWebExportDB")
    if not isinstance(db, dict):
        raise ValueError(f"{path}: no GuideWebExportDB table")
    maps: dict[int, dict[str, Any]] = {}
    for k, v in lua_table.as_dict(db.get("maps")).items():
        if isinstance(k, int) and isinstance(v, dict):
            maps[k] = v
    chars = {str(k): v for k, v in lua_table.as_dict(db.get("characters")).items() if isinstance(v, dict)}
    build = db.get("build") if isinstance(db.get("build"), dict) else {}
    return ExportData(path, db.get("exportedAt"), build, maps, chars, db.get("lastCharacter"))
