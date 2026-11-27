"""Tests for pipeline/adventurelog (AdventureLog → tpf-db) and the committed content/tpf-db output."""
from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from pipeline.adventurelog import build as alb
from pipeline.adventurelog.db import CONFIRMED_FILES, UNCONFIRMED_FILES, build_db, read_db, render, write_db
from pipeline.adventurelog.reader import read_saved_variables, read_sources
from pipeline.adventurelog.unconfirmed import class_names, questie_label, zone_quest_ids, zone_area_ids

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content" / "tpf-db"
M = 2521
CHAR = {"name": "Test Char", "realm": "", "class": "Shaman", "race": "Windshaper Skyborne", "faction": "Horde"}


def ev(e: str, t: float, **kw) -> dict:
    base = {"e": e, "t": t, "ts": 1_800_000_000 + int(t), "map": M, "zone": "Zephras Isle", "subzone": "Testvale", "x": 40.0, "y": 50.0}
    base.update(kw)
    return base


def legacy_session() -> list[dict]:
    """Before 1.2.0: no giver ids, no kill flags, loot slots without sourceType."""
    return [
        ev("session_start", 0, level=1),
        ev("quest_accept", 10, questId=900, title="Pelts Wanted", x=40.0, y=50.0),
        ev("quest_progress", 10.1, questId=900, objectives=[{"type": "item", "text": "0/2 Soft Pelt", "numFulfilled": 0, "numRequired": 2, "finished": False}]),
        ev("mob_seen", 20, npcId=500, name="Fluffy Boar", level=2, unitType="Creature", classification="normal", x=41.0, y=51.0),
        ev("mob_kill", 25, npcId=500, name="Fluffy Boar", unitType="Creature", x=41.0, y=51.0,
           raw=["CHAT_MSG_COMBAT_XP_GAIN", "Fluffy Boar dies, you gain 45 experience."]),
        ev("loot", 26, slots=[{"npcId": 500, "itemId": 7001, "name": "Soft Pelt", "count": 1, "quality": 1}]),
        ev("quest_progress", 26.2, questId=900, objectives=[{"type": "item", "text": "1/2 Soft Pelt", "numFulfilled": 1, "numRequired": 2, "finished": False}]),
        ev("mob_seen", 40, npcId=500, name="Fluffy Boar", level=2, unitType="Creature", classification="normal", x=42.0, y=52.0),
        ev("mob_kill", 45, npcId=500, name="Fluffy Boar", unitType="Creature", x=42.0, y=52.0,
           raw=["CHAT_MSG_COMBAT_XP_GAIN", "Fluffy Boar dies, you gain 45 experience."]),
        ev("loot", 46, slots=[{"npcId": 500, "itemId": 4865, "name": "Ruined Pelt", "count": 1, "quality": 0}]),
        ev("mob_seen", 60, npcId=500, name="Fluffy Boar", level=2, unitType="Creature", classification="normal", x=43.0, y=53.0),
        ev("mob_kill", 65, npcId=500, name="Fluffy Boar", unitType="Creature", x=43.0, y=53.0,
           raw=["CHAT_MSG_COMBAT_XP_GAIN", "Fluffy Boar dies, you gain 45 experience."]),
        ev("loot", 66, slots=[{"npcId": 500, "itemId": 7001, "name": "Soft Pelt", "count": 1, "quality": 1}]),
        ev("quest_progress", 66.2, questId=900, objectives=[{"type": "item", "text": "2/2 Soft Pelt", "numFulfilled": 2, "numRequired": 2, "finished": True}]),
        # an object loot window, no sourceType (legacy), id never seen as a creature
        ev("loot", 70, slots=[{"npcId": 600123, "itemId": 7100, "name": "Shiny Rock", "count": 1, "quality": 1}]),
        ev("level_up", 80, level=1, raw=["PLAYER_LEVEL_UP", 2]),
        ev("quest_turnin", 90, questId=900, xpReward=120, moneyReward=25, x=40.0, y=50.0),
        ev("loot_chat", 90.2, itemId=7200, text="You receive item: |cnIQ1:|Hitem:7200::::::::1:1489::11:::::::|h[Boar Gloves]|h|r"),
        ev("quest_accept", 92, questId=901, title="The Big Boar", x=40.0, y=50.0),
        ev("session_end", 100),
    ]


def new_session() -> list[dict]:
    """AdventureLog 1.2.0: giver / ender ids, kill flags, rewards, trainer, object use, group credit."""
    return [
        ev("session_start", 0, level=2),
        ev("quest_progress", 1, questId=901, objectives=[{"type": "monster", "text": "0/1 Big Boar slain", "numFulfilled": 0, "numRequired": 1, "finished": False}]),
        ev("mob_seen", 10, npcId=501, name="Big Boar", level=3, unitType="Creature", classification="elite", x=45.0, y=55.0),
        ev("mob_kill", 12, npcId=501, name="Big Boar", unitType="Creature", via="xp_chat", tracked=True, inFight=True, grouped=False,
           groupSize=0, xpAmount=80, x=45.0, y=55.0),
        ev("quest_progress", 12.3, questId=901, objectives=[{"type": "monster", "text": "1/1 Big Boar slain", "numFulfilled": 1, "numRequired": 1, "finished": True}]),
        # an explore-type "monster" objective that moves when an unrelated mob dies: not credited to that mob
        ev("quest_accept", 12.35, questId=906, title="The Old House", giverNpcId=705, giverName="Scout", giverType="Creature", giverX=45.0, giverY=55.0, giverMap=M),
        ev("quest_progress", 12.4, questId=906, objectives=[{"type": "monster", "text": "0/1 Find the old house", "numFulfilled": 0, "numRequired": 1, "finished": False}]),
        ev("mob_seen", 13, npcId=503, name="Stray Cat", level=3, unitType="Creature", classification="normal", x=45.0, y=55.0),
        ev("mob_kill", 14, npcId=503, name="Stray Cat", unitType="Creature", via="xp_chat", tracked=True, inFight=True, grouped=False,
           groupSize=0, xpAmount=60, x=45.0, y=55.0),
        ev("quest_progress", 14.2, questId=906, objectives=[{"type": "monster", "text": "1/1 Find the old house", "numFulfilled": 1, "numRequired": 1, "finished": True}]),
        ev("quest_turnin", 30, questId=901, xpReward=200, moneyReward=0, rewardMoney=0, enderNpcId=700, enderName="Elder Hoof",
           enderType="Creature", enderX=40.5, enderY=50.5, enderMap=M, rewardXp=200,
           rewardChoices=[{"itemId": 7300, "name": "Hoof Boots", "count": 1, "quality": 2, "index": 1}], chosenItemId=7300),
        ev("quest_accept", 33, questId=902, title="Boar Tusks", giverNpcId=700, giverName="Elder Hoof", giverType="Creature",
           giverX=40.5, giverY=50.5, giverMap=M),
        # group credit kill: kept apart from solo drop rates and kill XP
        ev("mob_kill", 50, npcId=500, name="Fluffy Boar", unitType="Creature", via="xp_chat", tracked=False, inFight=False, grouped=True,
           groupCredit=True, groupSize=2, xpAmount=20, x=44.0, y=54.0),
        ev("trainer", 60, npcId=800, name="Windshaper Sage", trainerType="general", numServices=3, x=39.0, y=49.0),
        ev("trainer_learn", 61, trainerNpcId=800, trainerName="Windshaper Sage", name="Lightning Bolt", subText="Rank 2", cost=100,
           reqLevel=2, skillLine="Elemental Combat", x=39.0, y=49.0),
        ev("object_use", 70, objectId=600200, name="Old Note", via="text", x=46.0, y=56.0),
        ev("session_end", 80),
    ]


def idle_session() -> list[dict]:
    return [ev("session_start", 0, level=2), ev("zone", 1), ev("session_end", 5)]


def lua_quote(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def saved_variables(sessions: dict[str, list[dict]], char: dict = CHAR) -> str:
    lines = ["", "AdventureLogDB = {", '["sessions"] = {']
    for sid, events in sessions.items():
        lines.append("{")
        lines.append(f'["id"] = {lua_quote(sid)},')
        lines.append('["events"] = {')
        for e in events:
            lines.append(lua_quote(json.dumps(e)) + ",")
        lines.append("},")
        lines.append(f'["header"] = {lua_quote(json.dumps({"ts": 1}))},')
        lines.append("},")
    lines.append("},")
    lines.append('["char"] = {' + "".join(f"[{lua_quote(k)}] = {lua_quote(v)}," for k, v in char.items()) + "},")
    lines.append('["schema"] = 1,')
    lines.append("}")
    return "\n".join(lines) + "\n"


def questie_fixture(d: Path) -> Path:
    q = d / "questie"
    q.mkdir()
    (q / "meta.json").write_text(json.dumps({"pins": {"questiedb": {"commit": "abcdef1234567890"}}}), encoding="utf-8")
    (q / "zones.json").write_text(json.dumps({"16593": {"name": "Zephras Isle", "uiMapId": M}, "16622": {"parent": 16593},
                                              "14": {"name": "Durotar", "uiMapId": 1411}}), encoding="utf-8")
    (q / "quests.json").write_text(json.dumps({
        "900": {"id": 900, "name": "Pelts Wanted", "level": 2, "xp": 999, "zoneId": 16593, "start": {"npc": [700]}},
        "902": {"id": 902, "name": "Boar Tusks", "level": 3, "zoneId": 16622},
        "903": {"id": 903, "name": "The Warrior's Path", "level": 2, "classes": 1, "zoneId": 16593, "start": {"npc": [701]},
                "objectives": {"creatures": [{"id": 502}]}},
        "904": {"id": 904, "name": "A Student of Nature", "level": 2, "classes": 1024, "start": {"npc": [702]}},
        "905": {"id": 905, "name": "Elsewhere", "level": 5, "zoneId": 14},
    }), encoding="utf-8")
    (q / "npcs.json").write_text(json.dumps({
        "700": {"id": 700, "name": "Elder Hoof", "spawns": {"16593": [[40.0, 50.0]]}},
        "701": {"id": 701, "name": "Warrior Trainer", "spawns": {"16593": [[41.0, 51.0]]}},
        "702": {"id": 702, "name": "Druid Trainer", "spawns": {"16622": [[42.0, 52.0]]}},
        "502": {"id": 502, "name": "Practice Dummy"},
    }), encoding="utf-8")
    for f in ("objects.json", "items.json"):
        (q / f).write_text("{}", encoding="utf-8")
    return q


class Fixture(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self._tmp.name)
        self.log = self.dir / "AdventureLog.lua"
        self.log.write_text(saved_variables({"20990101-0001-aaaa": legacy_session(), "20990101-0002-bbbb": idle_session(),
                                             "20990102-0001-cccc": new_session()}), encoding="utf-8")
        self.questie = questie_fixture(self.dir)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def files(self, previous: dict | None = None, logs: list[Path] | None = None) -> dict:
        return build_db(read_sources(logs or [self.log]), self.questie, ["Zephras Isle"], previous=previous, repo_url="https://example.test/repo")


class ReaderTest(Fixture):
    def test_reads_saved_variables_and_never_writes(self) -> None:
        before = hashlib.sha256(self.log.read_bytes()).hexdigest()
        mtime = self.log.stat().st_mtime_ns
        s = read_saved_variables(self.log)
        self.assertEqual([x.id for x in s], ["20990101-0001-aaaa", "20990101-0002-bbbb", "20990102-0001-cccc"])
        self.assertEqual(s[0].char["class"], "Shaman")
        self.assertEqual(s[0].events[1]["questId"], 900)
        write_db(self.dir / "out", self.files())
        self.assertEqual(hashlib.sha256(self.log.read_bytes()).hexdigest(), before)
        self.assertEqual(self.log.stat().st_mtime_ns, mtime)

    def test_jsonl_export_matches_saved_variables_and_dedupes(self) -> None:
        exp = self.dir / "Test Char - adventure"
        (exp / "sessions").mkdir(parents=True)
        (exp / "character.json").write_text(json.dumps(CHAR), encoding="utf-8")
        (exp / "sessions" / "20990101-0001-aaaa.jsonl").write_text("\n".join(json.dumps(e) for e in legacy_session()) + "\n", encoding="utf-8")
        (exp / "sessions" / "20990102-0001-cccc.jsonl").write_text("\n".join(json.dumps(e) for e in new_session()) + "\n", encoding="utf-8")
        both = read_sources([self.log, exp])
        self.assertEqual(len(both), 3)  # same sessions from both sources are kept once
        a = build_db(read_sources([exp]), self.questie, ["Zephras Isle"], repo_url="x")
        b = build_db(read_sources([self.log]), self.questie, ["Zephras Isle"], repo_url="x")
        for f in CONFIRMED_FILES:
            self.assertEqual(render(f, a[f]), render(f, b[f]), f)

    def test_refuses_to_write_inside_the_wow_folder(self) -> None:
        from pipeline.common.paths import WOW_ROOT
        with self.assertRaises(PermissionError):
            write_db(WOW_ROOT / "tpf-db-test", {"meta.json": {}})


class BuildTest(Fixture):
    def test_idle_sessions_are_skipped_and_listed(self) -> None:
        meta = self.files()["meta.json"]
        used = {s["id"]: s["used"] for s in meta["sessions"]}
        self.assertEqual(used, {"20990101-0001-aaaa": True, "20990101-0002-bbbb": False, "20990102-0001-cccc": True})
        feats = {s["id"]: s["features"] for s in meta["sessions"]}
        self.assertEqual(feats["20990101-0001-aaaa"], "legacy")
        self.assertEqual(feats["20990102-0001-cccc"], "1.2.0")

    def test_quest_records(self) -> None:
        q = self.files()["quests.json"]
        self.assertEqual(set(q), {"900", "901", "902", "906"})
        a = q["900"]
        self.assertEqual(a["status"], "confirmed")
        self.assertEqual(a["name"], "Pelts Wanted")
        self.assertEqual(a["xpReceived"], [{"playerLevel": 2, "xp": 120}])
        self.assertEqual(a["money"], [25])
        self.assertEqual(a["objectives"]["items"][0]["id"], 7001)
        self.assertEqual(a["objectives"]["items"][0]["fromNpcs"], [500])
        self.assertEqual(a["rewards"]["items"], [{"count": 1, "id": 7200}])
        self.assertEqual(a["acceptAt"], {"map:2521": [[40.0, 50.0]]})
        self.assertNotIn("level", a)  # the log has no quest level; never filled from QuestieDB
        self.assertGreater(a["samples"], 0)
        self.assertEqual(a["evidence"][0]["session"], "20990101-0001-aaaa")
        b = q["901"]
        self.assertEqual(b["end"], {"npc": [700]})
        self.assertEqual(b["enderAt"], {"map:2521": [[40.5, 50.5]]})
        self.assertEqual(b["objectives"]["creatures"][0]["id"], 501)
        self.assertEqual(b["rewards"]["choices"], [{"count": 1, "id": 7300}])
        self.assertEqual(b["pre"], {"single": [900], "status": "inferred"})
        c = q["902"]
        self.assertEqual(c["start"], {"npc": [700]})
        self.assertEqual(c["pre"], {"single": [901], "status": "inferred"})
        self.assertEqual(q["906"]["objectives"]["creatures"], [{"count": 1, "idUnresolved": True, "index": 1, "text": "Find the old house"}])

    def test_npcs_objects_items_trainers(self) -> None:
        f = self.files()
        n = f["npcs.json"]
        self.assertEqual(n["700"]["roles"], ["questEnder", "questGiver"])
        self.assertEqual(n["700"]["questStarts"], [902])
        self.assertEqual((n["500"]["minLevel"], n["500"]["maxLevel"]), (2, 2))
        self.assertEqual(n["500"]["kills"], {"groupCredit": 1, "solo": 3})
        self.assertEqual(n["800"]["roles"], ["trainer"])
        self.assertEqual(f["trainers.json"]["800"]["taught"][0]["spell"], "Lightning Bolt")
        self.assertEqual(f["trainers.json"]["800"]["taught"][0]["cost"], 100)
        o = f["objects.json"]
        self.assertIn("readable", o["600200"]["roles"])
        self.assertTrue(o["600123"]["sourceGuessed"])
        self.assertEqual(f["items.json"]["7100"]["objectDrops"], [600123])
        self.assertEqual(f["items.json"]["7001"]["npcDrops"], [500])
        self.assertEqual(f["items.json"]["7001"]["questObjectiveOf"], [900])
        self.assertEqual(f["items.json"]["7300"]["questChoices"], [901])
        self.assertEqual(f["zones.json"]["map:2521"]["name"], "Zephras Isle")

    def test_drop_rates_keep_group_credit_apart(self) -> None:
        d = self.files()["drops.json"]
        boar = d["mobs"]["500"]
        self.assertEqual(boar["kills"], {"groupCredit": 1, "solo": 3})
        self.assertEqual(boar["items"]["7001"]["drops"], 2)
        self.assertEqual(boar["items"]["7001"]["dropPct"], 66.7)
        self.assertEqual(boar["items"]["7001"]["sampleSize"], 3)
        self.assertTrue(boar["items"]["7001"]["questItem"])
        row = [r for r in d["quests"] if r["quest"] == 900][0]
        self.assertEqual((row["item"], row["mob"], row["kills"], row["drops"], row["items"], row["dropPct"]), (7001, 500, 3, 2, 2, 66.7))

    def test_kill_xp(self) -> None:
        x = self.files()["xp.json"]
        row = x["kills"]["500"]["rows"][0]
        self.assertEqual((row["mobLevel"], row["playerLevel"], row["xp"], row["samples"]), (2, 1, 45, 3))
        self.assertEqual(x["kills"]["501"]["rows"][0]["xp"], 80)
        self.assertEqual(x["excludedKills"], {"groupCredit": 1})
        self.assertEqual(x["quests"]["901"]["received"][0]["playerLevel"], 2)


class DeterminismTest(Fixture):
    def test_byte_identical_output(self) -> None:
        out1, out2 = self.dir / "o1", self.dir / "o2"
        write_db(out1, self.files())
        # same sessions given in another order and twice: same bytes
        write_db(out2, self.files(logs=[self.log, self.log]))
        names = sorted(p.relative_to(out1).as_posix() for p in out1.rglob("*.json"))
        self.assertEqual(names, sorted(p.relative_to(out2).as_posix() for p in out2.rglob("*.json")))
        for n in names:
            self.assertEqual((out1 / n).read_bytes(), (out2 / n).read_bytes(), n)
        # rebuilding on top of its own output changes nothing
        write_db(out1, self.files(previous=read_db(out1)))
        for n in names:
            self.assertEqual((out1 / n).read_bytes(), (out2 / n).read_bytes(), n)
        self.assertNotIn(b"\r\n", (out1 / "quests.json").read_bytes())


class SplitAndPromotionTest(Fixture):
    def test_confirmed_and_unconfirmed_never_mix(self) -> None:
        f = self.files()
        for name in CONFIRMED_FILES:
            if name in ("quests.json", "npcs.json", "objects.json", "items.json"):
                for rec in f[name].values():
                    self.assertEqual(rec["status"], "confirmed")
                    self.assertTrue(rec["evidence"])
                    self.assertNotIn("source", rec)
        u = f["unconfirmed/quests.json"]
        self.assertEqual(set(u), {"903", "904"})
        for name in UNCONFIRMED_FILES:
            for rec in f[f"unconfirmed/{name}"].values():
                self.assertEqual(rec["status"], "unconfirmed")
                self.assertTrue(all(v == "QuestieDB abcdef12" for v in rec["source"].values()))
        self.assertEqual(u["903"]["classNames"], ["Warrior"])
        self.assertNotIn("900", u)  # observed in the log → confirmed only
        self.assertNotIn("905", u)  # another zone
        # QuestieDB's xp 999 for quest 900 never leaks into the confirmed record
        self.assertNotIn("xp", f["quests.json"]["900"])
        self.assertEqual(f["meta.json"]["unconfirmedByClass"], {"Druid": [904], "Warrior": [903]})
        self.assertIn("701", f["unconfirmed/npcs.json"])
        self.assertNotIn("700", f["unconfirmed/npcs.json"])  # confirmed NPC stays out of unconfirmed/

    def test_druid_quest_found_by_giver_spawn(self) -> None:
        qdb = {n: json.loads((self.questie / f"{n}.json").read_text(encoding="utf-8")) for n in ("quests", "npcs", "objects", "zones")}
        areas = zone_area_ids(qdb["zones"], ["Zephras Isle"])
        self.assertEqual(areas, {"16593", "16622"})
        self.assertEqual(zone_quest_ids(qdb, areas), {900, 902, 903, 904})

    def test_promotion_moves_a_quest_into_confirmed(self) -> None:
        out = self.dir / "db"
        # First run: only the legacy session → 902 has not been seen and is unconfirmed.
        only_legacy = self.dir / "legacy.lua"
        only_legacy.write_text(saved_variables({"20990101-0001-aaaa": legacy_session()}), encoding="utf-8")
        write_db(out, self.files(logs=[only_legacy]))
        first = read_db(out)
        self.assertIn("902", first["unconfirmed/quests.json"])
        self.assertNotIn("902", first["quests.json"])
        self.assertEqual(first["meta.json"]["promoted"], [])
        # A later playtest shows 902: it moves to the confirmed file with evidence.
        write_db(out, self.files(previous=first))
        second = read_db(out)
        self.assertNotIn("902", second["unconfirmed/quests.json"])
        self.assertEqual(second["quests.json"]["902"]["status"], "confirmed")
        self.assertEqual(second["quests.json"]["902"]["evidence"][0]["session"], "20990102-0001-cccc")
        self.assertEqual(second["meta.json"]["promoted"], [902])
        # Rebuilding keeps the promotion record (idempotent).
        write_db(out, self.files(previous=second))
        self.assertEqual(read_db(out)["meta.json"]["promoted"], [902])

    def test_labels(self) -> None:
        self.assertEqual(questie_label(self.questie), "QuestieDB abcdef12")
        self.assertEqual(class_names(64 | 1024), ["Shaman", "Druid"])
        self.assertEqual(alb.objective_name("3/8 Juvenile Vuldren slain", "monster"), "Juvenile Vuldren")
        self.assertEqual(alb.objective_name("0/10  ", "item"), "")


@unittest.skipUnless((CONTENT / "meta.json").is_file(), "content/tpf-db not generated")
class CommittedContentTest(unittest.TestCase):
    def test_committed_files_follow_the_rules(self) -> None:
        meta = json.loads((CONTENT / "meta.json").read_text(encoding="utf-8"))
        self.assertEqual(meta["license"]["confirmed"], "CC-BY-4.0")
        for name in ("quests.json", "npcs.json", "objects.json", "items.json"):
            data = json.loads((CONTENT / name).read_text(encoding="utf-8"))
            for rec in data.values():
                self.assertEqual(rec["status"], "confirmed", name)
                self.assertTrue(rec["evidence"], name)
                self.assertNotIn("source", rec, name)
            u = json.loads((CONTENT / "unconfirmed" / name).read_text(encoding="utf-8"))
            self.assertFalse(set(u) & set(data) if name == "quests.json" else False)
            for rec in u.values():
                self.assertEqual(rec["status"], "unconfirmed")
                self.assertTrue(rec["source"])
        for f in ("LICENSE", "README.md", "unconfirmed/LICENSE", "unconfirmed/README.md"):
            self.assertTrue((CONTENT / f).is_file(), f)
        self.assertIn("Attribution 4.0 International", (CONTENT / "LICENSE").read_text(encoding="utf-8"))
        self.assertIn("GNU GENERAL PUBLIC LICENSE", (CONTENT / "unconfirmed" / "LICENSE").read_text(encoding="utf-8"))
        self.assertIn("Stolen Supplies", (CONTENT / "quests.json").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
