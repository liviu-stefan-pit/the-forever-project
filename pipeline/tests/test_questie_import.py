"""Tests for pipeline/questie_import.py and the committed content/questie-db/ output."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from pipeline import questie_import as qi

CONTENT = qi.OUT_DIR


class CompactTest(unittest.TestCase):
    zones = {"14": {"name": "Durotar"}, "363": {"name": "Valley of Trials", "parentAreaId": 14}}

    def test_compact_quest_fields_and_forever_flag(self) -> None:
        q = {"id": 900, "name": "Q", "questLevel": 3, "requiredLevel": 1, "requiredRaces": 0, "areaId": 363,
             "startedBy": {"npc": [1], "object": [], "item": []}, "finishedBy": {"npc": [2], "object": [], "item": []},
             "objectives": {"creatures": [{"id": 5}], "items": [{"id": 7, "text": "x"}]}, "preQuestSingle": [10],
             "nextQuestInChain": 901, "xp": {"xp": 120}, "repeatable": False, "tag": {"id": 1, "name": "Elite"}}
        c = qi.compact_quest(q, self.zones, base_ids={1})
        self.assertEqual(c["zone"], "Valley of Trials")
        self.assertEqual(c["start"], {"npc": [1]})
        self.assertEqual(c["objectives"], {"creatures": [{"id": 5}], "items": [{"id": 7, "text": "x"}]})
        self.assertEqual(c["pre"], {"single": [10]})
        self.assertEqual((c["xp"], c["tag"], c["races"]), (120, "Elite", 0))
        self.assertTrue(c["forever"])
        self.assertNotIn("repeatable", c)
        self.assertFalse(qi.compact_quest(q, self.zones, base_ids={900}).get("forever", False))

    def test_zone_falls_back_to_positive_zone_or_sort(self) -> None:
        c = qi.compact_quest({"id": 1, "zoneOrSort": 14}, self.zones, set())
        self.assertEqual((c["zoneId"], c["zone"]), (14, "Durotar"))
        self.assertNotIn("zoneId", qi.compact_quest({"id": 2, "zoneOrSort": -82}, self.zones, set()))

    def test_fill_zone_from_giver(self) -> None:
        quests = {1: {"id": 1, "start": {"npc": [50]}}, 2: {"id": 2, "zoneId": 14, "start": {"npc": [50]}}}
        n = qi.fill_zone_from_giver(quests, {50: {"zoneID": 363}}, {}, self.zones)
        self.assertEqual(n, 1)
        self.assertEqual(quests[1]["zoneSource"], "giver")
        self.assertEqual(quests[1]["zone"], "Valley of Trials")
        self.assertNotIn("zoneSource", quests[2])

    def test_npc_flags_and_filter(self) -> None:
        self.assertEqual(qi.flag_names(2 + 4 + 16), ["questGiver", "vendor", "trainer"])
        self.assertEqual(qi.flag_names(None), [])
        alliance = {"id": 3, "friendlyToFaction": "A", "spawns": {"12": [[1, 2]]}}
        self.assertFalse(qi.keep_npc(alliance, set()))
        self.assertTrue(qi.keep_npc(alliance, {3}))
        self.assertTrue(qi.keep_npc({"id": 4, "spawns": {"14": [[1, 2]]}}, set()))
        self.assertFalse(qi.keep_npc({"id": 5}, set()))
        c = qi.compact_npc({"id": 4, "name": "N", "npcFlags": 8, "spawns": {"14": [[1.5, 2.5]]}}, {4})
        self.assertEqual(c["services"], ["flightMaster"])
        self.assertNotIn("forever", c)

    def test_referenced_npcs(self) -> None:
        quests = [{"startedBy": {"npc": [1]}, "finishedBy": {"npc": [2]},
                   "objectives": {"creatures": [{"id": 3}], "items": [{"id": 9}], "killCredit": [{"ids": [4]}]}}]
        self.assertEqual(qi.referenced_npcs(quests, {9: {"npcDrops": [5]}}), {1, 2, 3, 4, 5})

    def test_forever_by_zone_and_dump(self) -> None:
        bz = qi.forever_by_zone({1: {"forever": True, "zone": "A"}, 2: {"forever": True, "zone": "A"},
                                 3: {"forever": True, "sort": "CAMPING"}, 4: {"zone": "B"}})
        self.assertEqual(bz, [("A", 2), ("sort:CAMPING", 1)])
        text = qi.dump_lines({10: {"b": 1, "a": 2}, 2: {"x": "é"}})
        self.assertEqual(text, '{\n"2":{"x":"é"},\n"10":{"a":2,"b":1}\n}\n')
        self.assertEqual(json.loads(text), {"2": {"x": "é"}, "10": {"a": 2, "b": 1}})


class ConfidenceTest(unittest.TestCase):
    traces = "    return {\n        [76156] = {\n            [k] = 1,\n        },\n"
    delta = ("        [76160] = { -- X : https://wowhead.com/forever/quest=76160/x\n"
             "        [76161] = { -- Y without a forever page\n")
    authored = "        [79953] = { -- Book\n"

    def test_evidence_ids(self) -> None:
        ev = qi.evidence_ids(self.traces, self.delta, self.authored)
        self.assertEqual(ev, {"traces": {76156}, "wowheadForever": {76160}, "authoredFix": {79953}})

    def test_apply_confidence(self) -> None:
        ev = qi.evidence_ids(self.traces, self.delta, self.authored)
        q = {i: {"id": i, "forever": True, "zone": "Z"} for i in (76156, 76160, 79953, 76999, 90001)}
        q[5] = {"id": 5, "zone": "Z"}
        qi.apply_confidence(q, ev)
        self.assertEqual({i: v.get("foreverConfidence") for i, v in q.items()},
                         {76156: "high", 76160: "high", 79953: "low", 76999: "low", 90001: "high", 5: None})
        self.assertEqual(q[79953]["foreverEvidence"], ["authoredFix"])
        self.assertNotIn("foreverEvidence", q[90001])
        self.assertEqual(qi.forever_by_zone_confidence(q), {"Z": {"high": 3, "low": 2}})


class FetchTest(unittest.TestCase):
    def test_hash_mismatch_raises_and_cache_hit_skips_download(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            dest = Path(td) / "a.zip"
            with mock.patch.object(qi, "_download", return_value=b"evil"):
                with self.assertRaises(RuntimeError):
                    qi.fetch_verified("https://x/a.zip", qi.sha256_bytes(b"good"), dest)
            self.assertFalse(dest.exists())
            dest.write_bytes(b"good")
            with mock.patch.object(qi, "_download", side_effect=AssertionError("no download")):
                self.assertEqual(qi.fetch_verified("https://x/a.zip", qi.sha256_bytes(b"good"), dest), b"good")

    def test_pins_are_full_shas(self) -> None:
        self.assertRegex(qi.PINS["questiedb"]["commit"], r"^[0-9a-f]{40}$")
        self.assertRegex(qi.PINS["questie"]["commit"], r"^[0-9a-f]{40}$")
        self.assertEqual(qi.PINS["questiedb"]["baseline"], "data/Forever")
        self.assertEqual(qi.PINS["questiedb"]["eraIds"], "data/Classic")
        self.assertIn("forever*Fixes.lua", qi.PINS["questiedb"]["correctionOrder"][-1])
        self.assertNotIn("assets", qi.PINS["questiedb"])


@unittest.skipUnless((CONTENT / "meta.json").is_file(), "content/questie-db not generated")
class CommittedContentTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.meta = json.loads((CONTENT / "meta.json").read_text(encoding="utf-8"))
        cls.data = {n: json.loads((CONTENT / f"{n}.json").read_text(encoding="utf-8"))
                    for n in ("quests", "npcs", "objects", "items", "zones")}

    def test_licence_and_readme_present(self) -> None:
        self.assertIn("GNU GENERAL PUBLIC LICENSE", (CONTENT / "LICENSE").read_text(encoding="utf-8"))
        readme = (CONTENT / "README.md").read_text(encoding="utf-8")
        self.assertIn(qi.PINS["questiedb"]["commit"], readme)
        self.assertIn(qi.PINS["questie"]["commit"], readme)

    def test_meta_matches_pins_and_counts(self) -> None:
        self.assertEqual(self.meta["pins"], qi.PINS)
        c = self.meta["counts"]
        for n in ("quests", "npcs", "objects", "items", "zones"):
            self.assertEqual(c[n], len(self.data[n]), n)
        self.assertEqual(c["questsForever"], sum(1 for q in self.data["quests"].values() if q.get("forever")))
        self.assertGreater(c["questsForever"], 0)

    def test_keys_match_ids_and_coords_in_range(self) -> None:
        for name in ("quests", "npcs", "objects", "items"):
            for k, v in self.data[name].items():
                self.assertEqual(int(k), v["id"])
        for name in ("npcs", "objects"):
            for v in self.data[name].values():
                for zone, pts in (v.get("spawns") or {}).items():
                    int(zone)
                    for p in pts:
                        if p[0] == -1 and p[1] == -1:  # QuestieDB instance sentinel
                            continue
                        self.assertTrue(0 <= p[0] <= 100 and 0 <= p[1] <= 100, (name, v["id"], zone, p))

    def test_known_horde_start_quest(self) -> None:
        # Gornek (3143) ends "Your Place In The World" (4641) in the Valley of Trials, Durotar.
        q = self.data["quests"]["4641"]
        self.assertIn(3143, q["end"]["npc"])
        self.assertEqual(q["zone"], "Valley of Trials")
        self.assertIn("3143", self.data["npcs"])
        self.assertIn("14", self.data["npcs"]["3143"]["spawns"])
        self.assertEqual(self.data["zones"]["14"]["name"], "Durotar")

    def test_forever_confidence(self) -> None:
        qs = self.data["quests"].values()
        for q in qs:
            if q.get("forever"):
                self.assertIn(q.get("foreverConfidence"), ("high", "low"), q["id"])
                if q["id"] >= qi.SEASON_ID_FLOOR:
                    self.assertEqual(q["foreverConfidence"], "high")
            else:
                self.assertNotIn("foreverConfidence", q)
        c = self.meta["counts"]
        self.assertEqual(c["questsForeverHigh"] + c["questsForeverLow"], c["questsForever"])
        byz = self.meta["foreverQuestsByZoneConfidence"]
        self.assertEqual(sum(v["low"] for v in byz.values()), c["questsForeverLow"])
        self.assertEqual(self.data["quests"]["76156"]["foreverConfidence"], "high")

    def test_no_alliance_only_quests(self) -> None:
        horde_bits = 2 | 16 | 32 | 128 | (1 << 33)
        for q in self.data["quests"].values():
            races = q.get("races", 0)
            self.assertTrue(races == 0 or races & horde_bits, q["id"])


if __name__ == "__main__":
    unittest.main()
