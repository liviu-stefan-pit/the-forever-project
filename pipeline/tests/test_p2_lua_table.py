"""P2: Lua table-literal reader (pipeline/common/lua_table.py)."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

_ROOT = str(Path(__file__).resolve().parents[2])
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from pipeline.common import lua_table as L  # noqa: E402


class ScalarTest(unittest.TestCase):
    def test_numbers(self) -> None:
        self.assertEqual(L.parse("42"), 42)
        self.assertEqual(L.parse("-7"), -7)
        self.assertEqual(L.parse("0x1F"), 31)
        self.assertAlmostEqual(L.parse("43.29"), 43.29)
        self.assertEqual(L.parse("1e3"), 1000.0)
        self.assertEqual(L.parse("8589934592"), 8589934592)
        self.assertEqual(L.parse("2 + 16 + 32 + 128"), 178)
        self.assertEqual(L.parse("4 * 2 - 1"), 7)

    def test_strings(self) -> None:
        self.assertEqual(L.parse('"Hana\'zua"'), "Hana'zua")
        self.assertEqual(L.parse("'say \\\"hi\\\"\\n'"), 'say "hi"\n')
        self.assertEqual(L.parse('"\\65\\066"'), "AB")
        self.assertEqual(L.parse("[[line1\nline2]]"), "line1\nline2")
        self.assertEqual(L.parse("[==[a]]b]==]"), "a]]b")
        self.assertEqual(L.parse("[[\nfirst newline dropped]]"), "first newline dropped")

    def test_keywords_and_names(self) -> None:
        self.assertIs(L.parse("true"), True)
        self.assertIs(L.parse("false"), False)
        self.assertIsNone(L.parse("nil"))
        self.assertEqual(L.parse("DropKeys.WOWHEAD", {"DropKeys.WOWHEAD": -1}), -1)
        self.assertEqual(L.parse("zoneIDs . DUROTAR", {"zoneIDs.DUROTAR": 14}), 14)
        with self.assertRaises(L.LuaParseError):
            L.parse("Unknown.NAME")
        self.assertIsNone(L.parse("Unknown.NAME", unknown="none"))
        self.assertEqual(L.parse('l10n("Elite")', {"l10n": lambda s: s}), "Elite")


class TableTest(unittest.TestCase):
    def test_sequence_and_keyed(self) -> None:
        self.assertEqual(L.parse("{1, 2, 3,}"), [1, 2, 3])
        self.assertEqual(L.parse("{}"), [])
        self.assertEqual(L.parse("{[1]='a', [2]='b'}"), ["a", "b"])           # keys 1..n → list
        self.assertEqual(L.parse("{[2]='b', [5]='e'}"), {2: "b", 5: "e"})       # sparse → dict
        self.assertEqual(L.parse("{name = 'x'; level = 5}"), {"name": "x", "level": 5})
        self.assertEqual(L.parse("{'a', key = 1}"), {1: "a", "key": 1})
        self.assertEqual(L.parse("{[-1000] = 'SPECIAL', [0] = 'zero'}"), {-1000: "SPECIAL", 0: "zero"})

    def test_holes(self) -> None:
        # questgivers with only item starters: {nil, nil, {123}}
        self.assertEqual(L.parse("{nil, nil, {123}}"), {3: [123]})
        self.assertEqual(L.parse("{'The Stockade', nil, 1519}"), {1: "The Stockade", 3: 1519})
        self.assertEqual(L.parse("{[3] = nil, [4] = 1}"), {4: 1})

    def test_nested_and_comments(self) -> None:
        text = """{
            -- a comment
            [4641] = {1, 40}, -- trailing comment
            --[[ block
               comment ]] [788] = {2, 170},
            --[==[ another ]==]
            [97279] = {2, 170},
        }"""
        self.assertEqual(L.parse(text), {4641: [1, 40], 788: [2, 170], 97279: [2, 170]})
        spawns = L.parse("{[14]={{43.29,68.53},{-1,-1}}}")
        self.assertEqual(spawns, {14: [[43.29, 68.53], [-1, -1]]})

    def test_errors(self) -> None:
        for bad in ("{1, 2", "{[1] 2}", "'unterminated", "{1 2}"):
            with self.assertRaises(L.LuaParseError, msg=bad):
                L.parse(bad)


class FindTest(unittest.TestCase):
    META = """local meta = {
  entity = 'Quest',
  fieldCount = 3,
  keys = {
    -- Localized quest name.
    ['name'] = 1,
    ['startedBy'] = 2,
  },
  names = {
[1]='name', [2]='startedBy', [3]='finishedBy'
  },
  -- names = {'commented out'}
  compilerTypes = { [1]='u8string' },
  types = { [1]='string', [2]='table', [3]='table' },
}"""

    def test_find_value(self) -> None:
        self.assertEqual(L.find_value(self.META, "names"), ["name", "startedBy", "finishedBy"])
        self.assertEqual(L.find_value(self.META, "keys"), {"name": 1, "startedBy": 2})
        self.assertEqual(L.find_value(self.META, "fieldCount"), 3)
        # `types` must not match `compilerTypes`
        self.assertEqual(L.find_value(self.META, "types"), ["string", "table", "table"])
        with self.assertRaises(L.LuaParseError):
            L.find_value(self.META, "missing")

    def test_dotted_target_and_return_string(self) -> None:
        text = ("local QuestXP = QuestieLoader:ImportModule('QuestXP');\n"
                "QuestXP.db = {\n  [2] = {30, 2450}, -- Classic: 30\n}\nQuestXP.db[5] = {20, 390}\n")
        self.assertEqual(L.find_value(text, "QuestXP.db"), {2: [30, 2450]})
        blob = "ZoneDB.private.areaIdToUiMapId = [[return {\n    [14] = 1411, -- Durotar\n    [1637] = 1454,\n}]]"
        inner = L.find_value(blob, "ZoneDB.private.areaIdToUiMapId")
        self.assertIsInstance(inner, str)
        self.assertEqual(L.parse_return_string(inner), {14: 1411, 1637: 1454})

    def test_table_to_dict(self) -> None:
        self.assertEqual(L.table_to_dict(["a", "b"]), {1: "a", 2: "b"})
        self.assertEqual(L.table_to_dict({3: "c"}), {3: "c"})
        self.assertEqual(L.table_to_dict(None), {})


if __name__ == "__main__":
    unittest.main()
