"""Zone map images from the user's own game client export (no guide input).

    python -I pipeline/map_images.py --images EXPORT_DIR [--only 1411,1412] [--verbose]
    python -I pipeline/map_images.py --list

Stitches ``interface/worldmap/<Folder>/<Folder>1..12`` tiles (exported with wow.export from your own
install) into ``web/public/maps/<uiMapId>.webp`` for every vanilla zone in ``maps/zones_static.py``.
The images are git-ignored and never committed (Blizzard art). See docs/MAP_IMAGES.md.
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


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--images", help="wow.export output folder")
    ap.add_argument("--only", help="comma-separated uiMap ids")
    ap.add_argument("--list", action="store_true", help="list zones and folder names, then exit")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args(argv)
    ids = [int(x) for x in args.only.split(",")] if args.only else zone_ids()
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
