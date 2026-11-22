"""Stitch exported world-map tiles into one zone image (Pillow; used by pipeline/map_images.py).

Input: a wow.export output folder containing ``interface/worldmap/<Folder>/<Folder>1..12.png``
(case-insensitive; ``.blp``/``.webp``/``.jpg``/``.tga`` also accepted). Tiles are 4 columns × 3
rows; native tile pixels are kept (256 px tiles crop to 1002 × 668, 512 px tiles to 2004 × 1336).
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

__all__ = ["index_dirs", "find_zone_dir", "tile_files", "stitch", "MAP_W", "MAP_H"]

MAP_W, MAP_H = 1002, 668
COLS, ROWS, TILE = 4, 3, 256
EXTS = (".png", ".blp", ".webp", ".jpg", ".jpeg", ".tga", ".bmp")


@dataclass
class StitchResult:
    out: Path
    tiles: int
    tile_size: int
    missing: list[int]


def index_dirs(root: Path) -> dict[str, list[Path]]:
    idx: dict[str, list[Path]] = {}
    for p in sorted(root.rglob("*")):
        if p.is_dir():
            idx.setdefault(p.name.lower(), []).append(p)
    if root.is_dir():
        idx.setdefault(root.name.lower(), []).insert(0, root)
    return idx


def find_zone_dir(root: Path, candidates: list[str], index: dict[str, list[Path]] | None = None) -> Path | None:
    """First directory under ``root`` named like one of ``candidates`` that holds tiles;
    paths containing ``worldmap`` win. Pass ``index_dirs(root)`` to reuse one directory scan."""
    idx = index if index is not None else index_dirs(root)
    for name in candidates:
        dirs = idx.get(name.lower(), [])
        dirs = sorted(dirs, key=lambda d: (0 if "worldmap" in str(d).lower() else 1, len(str(d)), str(d)))
        for d in dirs:
            if tile_files(d, name):
                return d
    return None


def tile_files(d: Path, prefix: str) -> dict[int, Path]:
    """{n: path} for ``<prefix><n>.<ext>``, n in 1..12 (case-insensitive, PNG preferred)."""
    rx = re.compile(rf"^{re.escape(prefix.lower())}(\d+)$")
    out: dict[int, Path] = {}
    rank: dict[int, int] = {}
    for p in sorted(d.iterdir()):
        if not p.is_file() or p.suffix.lower() not in EXTS:
            continue
        m = rx.match(p.stem.lower())
        if not m:
            continue
        n = int(m.group(1))
        if 1 <= n <= COLS * ROWS:
            r = EXTS.index(p.suffix.lower())
            if n not in out or r < rank[n]:
                out[n], rank[n] = p, r
    return out


def stitch(tiles: dict[int, Path], out: Path, quality: int = 85) -> StitchResult:
    from PIL import Image  # Pillow is allowed for this step only (plan D3)

    if not tiles:
        raise ValueError("no tiles")
    first = Image.open(tiles[min(tiles)])
    ts = max(first.size)
    first.close()
    canvas = Image.new("RGB", (COLS * ts, ROWS * ts), (9, 12, 18))
    missing = []
    for n in range(1, COLS * ROWS + 1):
        p = tiles.get(n)
        if p is None:
            missing.append(n)
            continue
        with Image.open(p) as im:
            im = im.convert("RGBA")
            if im.size != (ts, ts):
                im = im.resize((ts, ts), Image.LANCZOS)
            col, row = (n - 1) % COLS, (n - 1) // COLS
            canvas.paste(im.convert("RGB"), (col * ts, row * ts), im)
    crop_w = round(MAP_W * ts / TILE)
    crop_h = round(MAP_H * ts / TILE)
    img = canvas.crop((0, 0, crop_w, crop_h))
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_name(out.name + ".tmp")
    img.save(tmp, "WEBP", quality=quality, method=6)
    tmp.replace(out)
    return StitchResult(out, len(tiles), ts, missing)
