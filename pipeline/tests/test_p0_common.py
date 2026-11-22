"""P0 smoke tests: CBOR reader, paths, deterministic JSON IO."""
from __future__ import annotations

import json
import math
import sys
import tempfile
import unittest
from pathlib import Path

# Make `pipeline.*` importable even when discovery runs without `-t .` (python -I ignores cwd).
_ROOT = str(Path(__file__).resolve().parents[2])
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from pipeline.common import cbor, jsonio, paths  # noqa: E402


class CborTest(unittest.TestCase):
    def test_ints(self) -> None:
        self.assertEqual(cbor.loads(bytes([0x00])), 0)
        self.assertEqual(cbor.loads(bytes([0x17])), 23)
        self.assertEqual(cbor.loads(bytes([0x18, 0x18])), 24)
        self.assertEqual(cbor.loads(bytes([0x19, 0x12, 0x21])), 4641)
        self.assertEqual(cbor.loads(bytes([0x1A, 0x00, 0x01, 0x7B, 0xFF])), 97279)
        self.assertEqual(cbor.loads(bytes.fromhex("1b00000002000000b2")), 8589934770)  # Horde race mask seen in §1.3
        self.assertEqual(cbor.loads(bytes([0x20])), -1)
        self.assertEqual(cbor.loads(bytes([0x38, 0x63])), -100)

    def test_strings(self) -> None:
        self.assertEqual(cbor.loads(b"\x64Test"), "Test")
        self.assertEqual(cbor.loads(b"\x43\x01\x02\x03"), b"\x01\x02\x03")
        self.assertEqual(cbor.loads("\x62".encode() + "é".encode()), "é")

    def test_containers(self) -> None:
        # [1, [2, 3]]
        self.assertEqual(cbor.loads(bytes.fromhex("8201820203")), [1, [2, 3]])
        # {1: "Your Place In The World"[:4], "p": 6}
        self.assertEqual(cbor.loads(bytes.fromhex("a2016459") + b"our" + bytes.fromhex("616906")), {1: "Your", "i": 6})
        # spawns-like: {14: [[43.29, 68.53]]} with float32 coords
        raw = bytes.fromhex("a10e8182fa422d28f6fa42890f5c")
        v = cbor.loads(raw)
        self.assertEqual(list(v), [14])
        x, y = v[14][0]
        self.assertAlmostEqual(x, 43.29, places=4)
        self.assertAlmostEqual(y, 68.53, places=4)

    def test_floats_and_simple(self) -> None:
        self.assertEqual(cbor.loads(bytes.fromhex("f93e00")), 1.5)        # half
        self.assertEqual(cbor.loads(bytes.fromhex("f9c400")), -4.0)       # half
        self.assertTrue(math.isinf(cbor.loads(bytes.fromhex("f97c00"))))  # half inf
        self.assertEqual(cbor.loads(bytes.fromhex("fb3ff199999999999a")), 1.1)  # double
        self.assertIs(cbor.loads(b"\xf4"), False)
        self.assertIs(cbor.loads(b"\xf5"), True)
        self.assertIsNone(cbor.loads(b"\xf6"))

    def test_tag_is_transparent(self) -> None:
        self.assertEqual(cbor.loads(bytes.fromhex("c11a514b67b0")), 1363896240)

    def test_decode_at_and_strict(self) -> None:
        v, end = cbor.decode_at(bytes([0x01, 0x02]), 1)
        self.assertEqual((v, end), (2, 2))
        self.assertEqual(cbor.loads(bytes([0x01, 0x02])), 1)
        with self.assertRaises(cbor.CBORError):
            cbor.loads(bytes([0x01, 0x02]), strict=True)
        with self.assertRaises(cbor.CBORError):
            cbor.loads(bytes([0x19, 0x12]))  # truncated


class PathsTest(unittest.TestCase):
    def test_defaults(self) -> None:
        p = paths.load_paths(Path("does-not-exist.json"))
        self.assertEqual(p.wow_root, Path(paths._DEFAULT_WOW_ROOT))
        self.assertEqual(p.questiedb_toc.name, "QuestieDB_Forever.toc")
        # OS-agnostic: compare against the same Path join paths.py does (no hard-coded separators).
        self.assertEqual(p.gwe_saved_variables.parent.parent.parent.name, "Account")
        self.assertEqual(p.gwe_saved_variables.name, "GuideWebExport.lua")
        # No third-party guide addon inputs exist any more.
        self.assertFalse(any("guide" in k and k != "gwe_saved_variables" for k in paths.PATH_KEYS))
        self.assertEqual(p.build_dir, p.project_root / "data" / "build")
        self.assertEqual(p.web_data_dir, p.project_root / "web" / "public" / "data")
        self.assertEqual(p.web_maps_dir, p.project_root / "web" / "public" / "maps")
        self.assertTrue((p.project_root / "README.md").is_file())

    def test_override_rederives(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            cfg = Path(td) / "config.local.json"
            cfg.write_text(json.dumps({"wow_root": r"D:\WoW", "web_maps_dir": r"E:\maps"}), encoding="utf-8")
            p = paths.load_paths(cfg)
            self.assertEqual(p.wow_root, Path(r"D:\WoW"))
            self.assertEqual(p.questiedb_toc, Path(r"D:\WoW") / "Interface" / "AddOns" / "QuestieDB" / "QuestieDB_Forever.toc")
            self.assertEqual(p.web_maps_dir, Path(r"E:\maps"))
            cfg.write_text(json.dumps({"nope": 1}), encoding="utf-8")
            with self.assertRaises(ValueError):
                paths.load_paths(cfg)

    def test_is_inside_wow(self) -> None:
        self.assertTrue(paths.is_inside_wow(paths.PATHS.questiedb_toc))
        self.assertFalse(paths.is_inside_wow(paths.PATHS.build_dir))


class JsonIoTest(unittest.TestCase):
    def test_deterministic_write(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "a" / "b" / "x.json"
            jsonio.write_json(out, {"b": 1, "a": "Hana'zua é"})
            text = out.read_bytes().decode("utf-8")
            self.assertEqual(text, '{\n  "a": "Hana\'zua é",\n  "b": 1\n}\n')
            self.assertEqual(jsonio.read_json(out), {"a": "Hana'zua é", "b": 1})
            self.assertEqual(jsonio.dumps({"b": [1], "a": 2}, indent=None), '{"a":2,"b":[1]}')

    def test_refuses_wow_folder(self) -> None:
        with self.assertRaises(PermissionError):
            jsonio.write_json(paths.PATHS.wow_root / "nope.json", {})


if __name__ == "__main__":
    unittest.main()
