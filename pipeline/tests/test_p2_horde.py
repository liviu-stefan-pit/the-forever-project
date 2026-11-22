"""P2: Horde mask/filter, custom rule, correction merge, drop rates, XP traces, real-data checks."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

_ROOT = str(Path(__file__).resolve().parents[2])
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from pipeline.common.paths import PATHS  # noqa: E402
from pipeline.p2 import corrections, horde, support  # noqa: E402

RACE_KEYS = {"NONE": 0, "HUMAN": 1, "ORC": 2, "DWARF": 4, "NIGHT_ELF": 8, "UNDEAD": 16, "TAUREN": 32, "GNOME": 64,
             "TROLL": 128, "GOBLIN": 256, "SKYBORNE_ALLIANCE": 4294967296, "ALL_ALLIANCE": 4294967373,
             "SKYBORNE_HORDE": 8589934592, "ALL_HORDE": 8589934770}


class HordeTest(unittest.TestCase):
    def test_mask(self) -> None:
        m = horde.horde_mask(RACE_KEYS)
        self.assertEqual(m, 8589934770)
        self.assertEqual(m, 178 + (1 << 33))
        with self.assertRaises(ValueError):
            horde.horde_mask({**RACE_KEYS, "ALL_HORDE": 178})

    def test_races_ok(self) -> None:
        m = 8589934770
        self.assertTrue(horde.races_ok(0, m))
        self.assertTrue(horde.races_ok(None, m))
        self.assertTrue(horde.races_ok(8589934770, m))
        self.assertTrue(horde.races_ok(32, m))                 # Tauren only
        self.assertTrue(horde.races_ok(1 << 33, m))            # Skyborne Horde only
        self.assertFalse(horde.races_ok(4294967373, m))        # all Alliance
        self.assertFalse(horde.races_ok(1 << 32, m))           # Skyborne Alliance only

    def test_names(self) -> None:
        self.assertEqual(horde.race_names(8589934770, RACE_KEYS), ["ORC", "UNDEAD", "TAUREN", "TROLL", "SKYBORNE_HORDE"])
        ck = {"NONE": 0, "WARRIOR": 1, "SHAMAN": 64, "ALL_CLASSES": 1503}
        self.assertEqual(horde.class_names(65, ck), ["WARRIOR", "SHAMAN"])

    def test_custom(self) -> None:
        self.assertFalse(horde.is_custom("Quest", 4641))
        self.assertTrue(horde.is_custom("Quest", 97279))
        self.assertEqual(horde.origin_of("Quest", 97279), "forever")
        self.assertEqual(horde.origin_of("Quest", 78124), "season")
        self.assertEqual(horde.origin_of("Quest", 9999), "vanilla")
        self.assertFalse(horde.is_custom("Npc", 10176))
        self.assertTrue(horde.is_custom("Npc", 211022))
        self.assertTrue(horde.is_custom("Item", 277653))
        self.assertFalse(horde.is_custom("Item", 4905))

    def test_filter_reason(self) -> None:
        m = 8589934770
        ok = {"name": "Q", "requiredRaces": m}
        self.assertIsNone(horde.horde_filter_reason(ok, m))
        self.assertIsNone(horde.horde_filter_reason({"name": "Q"}, m))
        self.assertIsNone(horde.horde_filter_reason({"name": "Q", "blacklist": "hide_on_map"}, m))
        self.assertEqual(horde.horde_filter_reason({"name": "Q", "requiredRaces": 4294967373}, m), "race")
        self.assertEqual(horde.horde_filter_reason({**ok, "blacklist": "hidden"}, m), "blacklisted")
        self.assertEqual(horde.horde_filter_reason({**ok, "eventOnly": True}, m), "event")
        self.assertEqual(horde.horde_filter_reason({"requiredRaces": m}, m), "no-name")


class MergeTest(unittest.TestCase):
    def test_layers(self) -> None:
        rows = {113: {1: "Insect Part Analysis", 22: 0}, 5: {1: "x"}}
        dyn = {"legacy": {"113": {"22": 32}, "77": {"1": "new"}},
               "forever": {"113": {"22": 33, "2": [[5594]]}}}
        stats = corrections.merge_dynamic(rows, dyn)
        self.assertEqual(rows[113][22], 33)          # forever wins over legacy
        self.assertEqual(rows[113][2], [[5594]])
        self.assertEqual(rows[77], {1: "new"})
        self.assertEqual(stats["new"], [77])
        with self.assertRaises(ValueError):
            corrections.merge_dynamic({}, {"forever": {"1": {"1002": [[1]]}}})  # _add op unsupported


class SupportTest(unittest.TestCase):
    def test_xp_traces(self) -> None:
        text = "QuestXP.db[97279] = {2, 170}\nQuestXP.db[4641] = {1, 40}\n-- QuestXP.db[1] = {1, 1}\n"
        self.assertEqual(support.parse_xp_traces(text), {97279: (2, 170), 4641: (1, 40)})

    def test_drop_rate_precedence(self) -> None:
        t = {"wowhead": {1: {10: 5.0, 11: 6.0}}, "pserver": {1: {10: 7.0}}, "corrections": {1: {11: -1, 12: 80.0}}}
        self.assertEqual(support.drop_rate(t, 1, 10), (7.0, "cmangos"))
        self.assertEqual(support.drop_rate(t, 1, 11), (6.0, "wowhead"))
        self.assertEqual(support.drop_rate(t, 1, 12), (80.0, "questie"))
        self.assertIsNone(support.drop_rate(t, 1, 99))


@unittest.skipUnless(PATHS.questiedb_toc.is_file(), "QuestieDB not installed")
class RealDataTest(unittest.TestCase):
    """End-to-end checks of the plan's 'done when' items against the installed QuestieDB."""

    @classmethod
    def setUpClass(cls) -> None:
        from pipeline import p2_questie
        cls.r = p2_questie.build()

    def test_4641(self) -> None:
        q = self.r["horde_quests"][4641]
        self.assertEqual(q["name"], "Your Place In The World")
        self.assertEqual(q["startedBy"]["npc"], [10176])
        self.assertEqual(q["finishedBy"]["npc"], [3143])
        n = self.r["npcs_out"]["10176"]
        self.assertEqual(n["name"], "Kaltunk")
        self.assertEqual(n["spawns"]["14"], [[43.29, 68.53]])
        self.assertEqual(self.r["npcs_out"]["3143"]["name"], "Gornek")
        self.assertFalse(q["custom"])

    def test_97279(self) -> None:
        q = self.r["horde_quests"][97279]
        self.assertEqual(q["name"], "Wayward Weapons")
        self.assertTrue(q["custom"])
        self.assertEqual(q["objectives"]["items"][0]["id"], 277653)
        item = self.r["items_out"]["277653"]
        self.assertEqual(item["objectDrops"], [673476])
        self.assertIn("673476", self.r["objects_out"])
        self.assertIn("14", self.r["objects_out"]["673476"]["spawns"])

    def test_horde_set_and_zones(self) -> None:
        self.assertGreater(len(self.r["horde_quests"]), 1500)
        self.assertEqual(self.r["hmask"], 8589934770)
        self.assertTrue(self.r["corr_status"]["ran"] or corrections.find_lua() is None)
        zones = self.r["zones_out"]
        for area in self.r["spawn_areas"]:
            self.assertTrue(zones[str(area)].get("uiMapId") or area in self.r["unmapped"], area)
        self.assertEqual(zones["14"]["uiMapId"], 1411)
        self.assertEqual(zones["14"]["name"], "Durotar")

    def test_npc_by_name(self) -> None:
        self.assertEqual(self.r["by_name"]["kaltunk"], [10176])


if __name__ == "__main__":
    unittest.main()
