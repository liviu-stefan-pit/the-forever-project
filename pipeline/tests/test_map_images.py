"""P3 image stitching on synthetic tiles (needs Pillow; skipped without it)."""
from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

_ROOT = str(Path(__file__).resolve().parents[2])
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from pipeline.maps import images, zones_static  # noqa: E402

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None  # type: ignore[assignment]


def _color(n: int) -> tuple[int, int, int]:
    return (n * 20 % 256, 255 - n * 15, (n * 37) % 256)


@unittest.skipIf(Image is None, "Pillow not installed")
class StitchTest(unittest.TestCase):
    def _make(self, root: Path, folder: str, size: int, skip: int | None = None, upper: bool = False) -> Path:
        d = root / "interface" / "worldmap" / folder.lower()
        d.mkdir(parents=True)
        for n in range(1, 13):
            if n == skip:
                continue
            name = f"{folder if upper else folder.lower()}{n}.png"
            Image.new("RGB", (size, size), _color(n)).save(d / name)
        # an overlay texture that must be ignored
        Image.new("RGB", (size, size), (255, 0, 255)).save(d / "razorhill1.png")
        return d

    def _check(self, out: Path) -> None:
        with Image.open(out) as im:
            self.assertEqual(im.size, (images.MAP_W, images.MAP_H))
            self.assertEqual(im.format, "WEBP")
            im = im.convert("RGB")
            for n in (1, 4, 6, 9, 12):
                col, row = (n - 1) % 4, (n - 1) // 4
                x = min(col * 256 + 128, images.MAP_W - 1)
                y = min(row * 256 + 128, images.MAP_H - 1)
                px = im.getpixel((x, y))
                for c, e in zip(px, _color(n)):
                    self.assertLess(abs(c - e), 12, (n, px, _color(n)))

    def test_256_tiles(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self._make(root, "Durotar", 256, upper=True)
            d = images.find_zone_dir(root, zones_static.folder_candidates(1411))
            self.assertIsNotNone(d)
            tiles = images.tile_files(d, "Durotar")  # type: ignore[arg-type]
            self.assertEqual(sorted(tiles), list(range(1, 13)))
            res = images.stitch(tiles, root / "out" / "1411.webp")
            self.assertEqual((res.tiles, res.tile_size, res.missing), (12, 256, []))
            self._check(res.out)

    def test_512_tiles_alias_and_missing(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self._make(root, "Orgrimmar", 512, skip=12)  # later spelling of "Ogrimmar"
            cands = zones_static.folder_candidates(1454)
            self.assertEqual(cands[0], "Ogrimmar")
            d = images.find_zone_dir(root, cands)
            self.assertIsNotNone(d)
            tiles = images.tile_files(d, "Orgrimmar")  # type: ignore[arg-type]
            res = images.stitch(tiles, root / "1454.webp")
            self.assertEqual((res.tile_size, res.missing), (512, [12]))
            with Image.open(res.out) as im:
                self.assertEqual(im.size, (2004, 1336))

    def test_route_folders_known(self) -> None:
        for mid in (1411, 1413, 1424, 1447, 1449, 1454, 1456, 1458):
            self.assertTrue(zones_static.folder_candidates(mid), mid)


if __name__ == "__main__":
    unittest.main()


class MapImagesCliTest(unittest.TestCase):
    def test_zone_ids_skip_continents(self) -> None:
        from pipeline import map_images
        ids = map_images.zone_ids()
        self.assertIn(1411, ids)
        self.assertNotIn(1414, ids)
        self.assertNotIn(1415, ids)
        import contextlib
        import io
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            self.assertEqual(map_images.main(["--list", "--only", "1411"]), 0)
        self.assertEqual(buf.getvalue().split("\t")[0], "1411")


if __name__ == "__main__":
    unittest.main()
