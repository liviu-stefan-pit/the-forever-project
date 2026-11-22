"""P2: TOC chunk reassembly, scalar-row decoding and value normalisation."""
from __future__ import annotations

import base64
import struct
import sys
import unittest
import zlib
from pathlib import Path
from typing import Any

_ROOT = str(Path(__file__).resolve().parents[2])
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from pipeline.p2 import normalize as N  # noqa: E402
from pipeline.p2.meta import parse_meta  # noqa: E402
from pipeline.p2.toc import TocStore, decode_row, parse_toc_lines, reassemble  # noqa: E402


# --- a tiny CBOR encoder for synthetic fixtures (bytes for text, like QuestieDB) -----------------
def _head(mt: int, n: int) -> bytes:
    if n < 24:
        return bytes([mt << 5 | n])
    for ai, fmt in ((24, ">B"), (25, ">H"), (26, ">I"), (27, ">Q")):
        try:
            return bytes([mt << 5 | ai]) + struct.pack(fmt, n)
        except struct.error:
            continue
    raise ValueError(n)


def enc(v: Any) -> bytes:
    if v is None:
        return b"\xf6"
    if isinstance(v, bool):
        return b"\xf5" if v else b"\xf4"
    if isinstance(v, int):
        return _head(0, v) if v >= 0 else _head(1, -1 - v)
    if isinstance(v, float):
        return b"\xfb" + struct.pack(">d", v)
    if isinstance(v, str):
        v = v.encode()
    if isinstance(v, bytes):
        return _head(2, len(v)) + v
    if isinstance(v, list):
        return _head(4, len(v)) + b"".join(enc(x) for x in v)
    if isinstance(v, dict):
        return _head(5, len(v)) + b"".join(enc(k) + enc(x) for k, x in v.items())
    raise TypeError(type(v))


def b64(v: Any, z: bool = False) -> str:
    raw = enc(v)
    return base64.b64encode(zlib.compress(raw) if z else raw).decode()


META_TEXT = """local meta = {
  entity = 'Quest', metaPrefix = 'Quest-', fieldCount = 10,
  keys = { ['name'] = 1, ['startedBy'] = 2, ['finishedBy'] = 3, ['requiredLevel'] = 4, ['questLevel'] = 5,
           ['requiredRaces'] = 6, ['requiredClasses'] = 7, ['objectivesText'] = 8, ['triggerEnd'] = 9, ['objectives'] = 10 },
  names = { [1]='name', [2]='startedBy', [3]='finishedBy', [4]='requiredLevel', [5]='questLevel', [6]='requiredRaces',
            [7]='requiredClasses', [8]='objectivesText', [9]='triggerEnd', [10]='objectives' },
  types = { [1]='string', [2]='table', [3]='table', [4]='number', [5]='number', [6]='number', [7]='number',
            [8]='table', [9]='table', [10]='table' },
  structures = { [2]='questgivers', [3]='questgivers', [8]='stringarray', [9]='trigger', [10]='objectives' },
}"""


class ChunkTest(unittest.TestCase):
    def test_parse_and_reassemble(self) -> None:
        lines = ["## Interface: 16001", "## X-Flavor: Forever", "## X-Big: ~3~", "## X-Big-1: abc",
                 "## X-Big-2: def", "## X-Big-3: g", "# comment", "src\\file.lua"]
        meta = parse_toc_lines(lines)
        self.assertEqual(meta["X-Flavor"], "Forever")
        self.assertEqual(reassemble(meta, "X-Big"), "abcdefg")
        self.assertEqual(reassemble(meta, "X-Flavor"), "Forever")
        self.assertIsNone(reassemble(meta, "X-None"))
        with self.assertRaises(KeyError):
            reassemble({"X-K": "~2~", "X-K-1": "a"}, "X-K")

    def test_chunked_cbor_value(self) -> None:
        payload = b64({14: [[43.29, 68.53]]})
        half = len(payload) // 2
        meta = {"X-Npc-10176-7": "~2~", "X-Npc-10176-7-1": payload[:half], "X-Npc-10176-7-2": payload[half:]}
        self.assertEqual(TocStore(meta).table_field("Npc", 10176, 7), {14: [[43.29, 68.53]]})


class RowTest(unittest.TestCase):
    def setUp(self) -> None:
        self.meta = parse_meta(META_TEXT, "Quest")

    def test_meta(self) -> None:
        self.assertEqual(self.meta.names[1], "name")
        self.assertEqual(self.meta.keys["objectives"], 10)
        self.assertEqual(self.meta.table_fields, [2, 3, 8, 9, 10])
        self.assertEqual(self.meta.structures[2], "questgivers")

    def test_decode_row_shapes(self) -> None:
        self.assertEqual(decode_row({1: b"Name", b"p": 6, 4: None}), {1: "Name", "p": 6})
        self.assertEqual(decode_row([b"a", 3]), {1: "a", 2: 3})   # dense row encoded as an array
        self.assertEqual(decode_row(None), {})

    def test_raw_row_presence_bits(self) -> None:
        # p bit (field-1): fields 2, 3, 8 and 10 present; 9 absent even though a value exists
        p = (1 << 1) | (1 << 2) | (1 << 7) | (1 << 9)
        meta = {
            "X-Quest-IDS": b64([97279], z=True),
            "X-Quest-97279-S": b64({1: b"Wayward Weapons", 4: 1, 5: 2, 6: 8589934770, "p": p}),
            "X-Quest-97279-2": b64([[3143]]),
            "X-Quest-97279-3": b64([[3159]]),
            "X-Quest-97279-8": b64([b"Collect 6 Abandoned Training Weapons."]),
            "X-Quest-97279-9": b64([b"ignored", {}]),
            "X-Quest-97279-10": b64({3: [[277653, None, 0]]}),
        }
        toc = TocStore(meta)
        self.assertEqual(toc.ids("Quest"), [97279])
        raw = toc.raw_row("Quest", 97279, self.meta.table_fields)
        self.assertNotIn(9, raw)
        row = N.named_row(self.meta, raw)
        self.assertEqual(row["name"], "Wayward Weapons")
        self.assertEqual(row["requiredRaces"], 8589934770)
        self.assertEqual(row["startedBy"], {"npc": [3143], "object": [], "item": []})
        self.assertEqual(row["finishedBy"]["npc"], [3159])
        self.assertEqual(row["objectives"], {"items": [{"id": 277653}]})
        self.assertEqual(row["objectivesText"], ["Collect 6 Abandoned Training Weapons."])

    def test_named_row_defaults(self) -> None:
        row = N.named_row(self.meta, {1: "X", 4: 0, 7: 0})
        self.assertEqual(row["name"], "X")
        self.assertNotIn("requiredLevel", row)       # zero = default, omitted
        self.assertEqual(row["startedBy"], {"npc": [], "object": [], "item": []})  # never-nil givers


class NormalizeTest(unittest.TestCase):
    def test_slots(self) -> None:
        self.assertEqual(N.slots([1, 2]), [1, 2])
        self.assertEqual(N.slots({3: "c"}), [None, None, "c"])
        self.assertEqual(N.slots({"2": "b"}), [None, "b"])              # Lua-harness JSON keys
        self.assertEqual(N.slots([1], 3), [1, None, None])
        self.assertEqual(N.slots(None), [])

    def test_givers(self) -> None:
        self.assertEqual(N.givers([[10176]]), {"npc": [10176], "object": [], "item": []})
        self.assertEqual(N.givers({3: [5099]}), {"npc": [], "object": [], "item": [5099]})
        self.assertEqual(N.givers({"1": [211022], "2": [409496]}), {"npc": [211022], "object": [409496], "item": []})

    def test_objectives(self) -> None:
        self.assertEqual(N.objectives([[[3098, None, 0]]]), {"creatures": [{"id": 3098}]})
        self.assertEqual(N.objectives({3: [[4905, None, 0]]}), {"items": [{"id": 4905}]})
        ob = N.objectives({4: [76, 3000], 5: [[[1, 2], 99, b"Slay", 0]], 6: [[123, b"Cast", 456]]})
        self.assertEqual(ob["reputation"], {"factionId": 76, "value": 3000})
        self.assertEqual(ob["killCredit"], [{"ids": [1, 2], "baseId": 99, "text": "Slay"}])
        self.assertEqual(ob["spells"], [{"id": 123, "text": "Cast", "itemId": 456}])

    def test_spawns(self) -> None:
        self.assertEqual(N.spawns({14: [[43.2901, 68.5349]]}), {"14": [[43.29, 68.53]]})
        # dense area keys {1: …} arrive as a CBOR array: index 0 is area 1 (Dun Morogh)
        self.assertEqual(N.spawns([[[10.0, 20.0]]]), {"1": [[10, 20]]})
        self.assertEqual(N.spawns({1519: [[-1, -1]], 12: [[1.0, 2.0, 7]]}), {"12": [[1, 2, 7]], "1519": [[-1, -1]]})
        self.assertEqual(N.spawns(None), {})

    def test_trigger_extra(self) -> None:
        self.assertEqual(N.trigger([b"Find the cave", {14: [[1.0, 2.0]]}]),
                         {"text": "Find the cave", "spawns": {"14": [[1, 2]]}})
        ex = N.extra_objectives([[{14: [[5.0, 6.0]]}, 2, b"Use the totem", 1, [[b"object", 777]]]])
        self.assertEqual(ex, [{"spawns": {"14": [[5, 6]]}, "icon": 2, "text": "Use the totem", "index": 1,
                               "references": [{"kind": "object", "id": 777}]}])

    def test_deep_text(self) -> None:
        self.assertEqual(N.deep_text({b"p": [b"x", {"3": b"y"}]}), {"p": ["x", {3: "y"}]})


if __name__ == "__main__":
    unittest.main()
