"""Zone map images from the user's own game client export (no guide input).

    python -I pipeline/map_images.py --images EXPORT_DIR [--only 1411,1412] [--verbose]
    python -I pipeline/map_images.py --zones ZONES_DIR [--only 1411,1412] [--verbose]
    python -I pipeline/map_images.py --list

``--images``: stitches ``interface/worldmap/<Folder>/<Folder>1..12`` tiles (exported with wow.export from
your own install) into ``web/public/maps/<uiMapId>.webp`` for every vanilla zone in ``maps/zones_static.py``.
``--zones``: converts already-stitched zone maps named ``Zone_<areaId>_<Name>_<Folder>.png`` (1002 x 668)
into the same ``web/public/maps/<uiMapId>.webp`` files. The area id is looked up in
``content/questie-db/zones.json`` (covers the Forever zones); the folder name is the fallback.
The images are committed (Blizzard art, used under the Fan Content Policy). See docs/MAP_IMAGES.md.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from pipeline.common.paths import load_paths  # noqa: E402
from pipeline.maps import images, zones_static  # noqa: E402


def zone_ids() -> list[int]:
    """Every vanilla zone uiMap with a known world-map folder (continents excluded)."""
    return sorted(m for m in zones_static.WORLDMAP_FOLDER if m not in zones_static.CONTINENT_MAPS)


def folder_index(ids: list[int]) -> dict[str, int]:
    """Lower-case world-map folder name (and aliases) -> uiMap id."""
    out: dict[str, int] = {}
    for mid in ids:
        for c in zones_static.folder_candidates(mid):
            out.setdefault(c.lower(), mid)
    return out


def area_index() -> dict[int, int]:
    """QuestieDB area id -> uiMap id (includes Forever-only zones)."""
    import json

    path = load_paths().project_root / "content" / "questie-db" / "zones.json"
    try:
        rows = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    return {int(k): int(v["uiMapId"]) for k, v in rows.items() if isinstance(v, dict) and v.get("uiMapId")}


def convert_zones(src: Path, ids: list[int] | None, out_dir: Path, verbose: bool = False, quality: int = 85) -> int:
    """Convert stitched ``Zone_<areaId>_<Name>_<Folder>.png`` maps to ``<uiMapId>.webp``."""
    from PIL import Image  # same dependency as images.stitch

    by_area = area_index()
    by_folder = folder_index(zone_ids())
    out_dir.mkdir(parents=True, exist_ok=True)
    made = skipped = 0
    for f in sorted(src.glob("Zone_*.png")):
        parts = f.stem.split("_")
        area = int(parts[1]) if len(parts) > 2 and parts[1].isdigit() else None
        mid = by_area.get(area) if area is not None else None
        if mid is None:
            mid = by_folder.get(parts[-1].lower())
        if mid is not None and ids is not None and mid not in ids:
            continue
        if mid is None:
            skipped += 1
            if verbose:
                print(f"[maps] {f.name}: no uiMap id for this area or folder, skipped")
            continue
        out = out_dir / f"{mid}.webp"
        tmp = out.with_suffix(".tmp.webp")
        with Image.open(f) as img:
            img.convert("RGB").save(tmp, "WEBP", quality=quality, method=6)
        tmp.replace(out)
        made += 1
        if verbose:
            print(f"[maps] {mid} <- {f.name}")
    print(f"[maps] {made} images written to {out_dir}, {skipped} files skipped")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--images", help="wow.export output folder")
    ap.add_argument("--zones", help="folder of stitched Zone_<areaId>_<Name>_<Folder>.png maps")
    ap.add_argument("--only", help="comma-separated uiMap ids")
    ap.add_argument("--list", action="store_true", help="list zones and folder names, then exit")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args(argv)
    ids = [int(x) for x in args.only.split(",")] if args.only else zone_ids()
    if args.zones:
        only = [int(x) for x in args.only.split(",")] if args.only else None
        return convert_zones(Path(args.zones), only, load_paths().web_maps_dir, args.verbose)
    if args.list or not args.images:
        for mid in ids:
            print(f"{mid}\t{', '.join(zones_static.folder_candidates(mid))}")
        if not args.images and not args.list:
            print("[maps] pass --images EXPORT_DIR to stitch images")
        return 0
    out_dir = load_paths().web_maps_dir
    root = Path(args.images)
    index = images.index_dirs(root)
    made = missing = 0
    for mid in ids:
        cands = zones_static.folder_candidates(mid)
        d = images.find_zone_dir(root, cands, index) if cands else None
        tiles = None
        for c in cands if d else []:
            tiles = images.tile_files(d, c)
            if tiles:
                break
        if not tiles:
            missing += 1
            if args.verbose:
                print(f"[maps] {mid}: no tiles for {cands}")
            continue
        res = images.stitch(tiles, out_dir / f"{mid}.webp")
        made += 1
        if args.verbose:
            print(f"[maps] {mid} <- {d} ({res.tiles} tiles{', missing ' + str(res.missing) if res.missing else ''})")
    print(f"[maps] {made} images written to {out_dir}, {missing} zones without tiles")
    return 0


if __name__ == "__main__":
    sys.exit(main())
