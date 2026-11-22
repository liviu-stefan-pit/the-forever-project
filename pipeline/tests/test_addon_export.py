"""Run the GuideWebExport addon under Lua 5.1 with mocked WoW APIs, write its
SavedVariables like the client does, and read them back with the P3 reader.
Skipped when no ``lua`` interpreter is on PATH."""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from pipeline.maps import savedvars  # noqa: E402
from pipeline.maps.savedvars import convert  # noqa: E402

ADDON = _ROOT / "addon" / "GuideWebExport"
LUA = shutil.which("lua") or shutil.which("lua5.1")
LUAC = shutil.which("luac") or shutil.which("luac5.1")

HARNESS = r"""
local addonPath, outPath, mode = ...
local BOUNDS = {
  [1411] = {inst = 1, left = -1962.4999, top = 1808.3333, width = 5287.5, height = 3525, name = "Durotar", mapType = 3, parent = 1414},
  [1454] = {inst = 1, left = -3680.6, top = 2273.88, width = 1402.6, height = 935.42, name = "Orgrimmar", mapType = 3, parent = 1414},
  [1414] = {inst = 1, left = 12799.9, top = 17066.6, width = 36799.81, height = 24533.2, name = "Kalimdor", mapType = 2, parent = 947},
}
function CreateVector2D(x, y) return { x = x, y = y, GetXY = function(self) return self.x, self.y end } end
C_Map = {}
function C_Map.GetMapInfo(id)
  local b = BOUNDS[id]
  if b then return { name = b.name, mapType = b.mapType, parentMapID = b.parent } end
  if id == 999 then error("boom") end
end
-- vector x runs along HBD "top" (world X), vector y along HBD "left" (world Y)
function C_Map.GetWorldPosFromMapPos(id, v)
  local b = BOUNDS[id]
  if not b then return nil end
  return b.inst, CreateVector2D(b.top - v.y * b.height, b.left - v.x * b.width)
end
if mode == "worldsize" then
  function C_Map.GetMapWorldSize(id) local b = BOUNDS[id]; return b.width, b.height end
end
function C_Map.GetBestMapForUnit() return 1411 end
function C_Map.GetPlayerMapPosition() return CreateVector2D(0.4329, 0.6853) end
function C_Map.GetMapGroupID() return nil end
local QUESTS = {
  { title = "The Barrens", isHeader = true, isCollapsed = false, questID = 0 },
  { title = "Cut Tooth", questID = 788, level = 2, isHeader = false },
  { title = "Sting of the Scorpid", questID = 789, level = 3, isHeader = false },
}
C_QuestLog = {
  GetAllCompletedQuestIDs = function() return { 4641, 788 } end,
  GetNumQuestLogEntries = function() return #QUESTS, 2 end,
  GetInfo = function(i) return QUESTS[i] end,
  GetQuestObjectives = function() return { { text = "Boar: 0/1", type = "monster", finished = false, numFulfilled = 0, numRequired = 1 } } end,
  ReadyForTurnIn = function() return false end,
  IsComplete = function() return false end,
  IsFailed = function() return false end,
}
C_SkillInfo = {
  GetNumSkillLines = function() return 1 end,
  GetSkillLineInfo = function()
    return { name = "Mining", skillLineID = 186, isHeader = false, isAbandonable = true, skillRank = 10, skillMaxRank = 75, skillModifier = 0, skillLineCategoryID = 11 }
  end,
  ExpandSkillHeader = function() end,
  CollapseSkillHeader = function() end,
}
C_EventUtils = { IsEventValid = function() return true end }
function GetSubZoneText() return "Valley of Trials" end
function UnitPosition() return -607.35, -4251.46, 0, 1 end
function UnitName()
  if mode == "surname" then return "Throgar", "Stonehand" end
  if mode == "realmsecond" then return "Thrall", "For Ever" end
  return "Thrall"
end
function GetRealmName() return "Forever" end
if mode == "surname" then
  function GetUnitName() return "Throgar Stonehand" end
  function UnitGUID() return "Player-99-AABB" end
  function GetNormalizedRealmName() return "Forever" end
  GuideWebExportDB = {
    characters = {
      ["Throgar-Forever"] = { name = "Throgar", schemaVersion = 2 },
      ["Other-Forever"] = { name = "Other", schemaVersion = 2 },
    },
  }
elseif mode == "realmsecond" then
  -- Second UnitName return is the realm (spaces/case differ). No spaced GetUnitName.
  function GetNormalizedRealmName() return "forever" end
end
function UnitRace() return "Orc", "Orc" end
function UnitClass() return "Warrior", "WARRIOR" end
function UnitLevel() return 12 end
function UnitFactionGroup() return "Horde", "Horde" end
function GetBuildInfo() return "1.60.1", "71037", "Nov 2026", 16001 end
WOW_PROJECT_ID = 99
if mode == "project18" then WOW_PROJECT_ID = 18 end
SlashCmdList = {}
local printed = {}
DEFAULT_CHAT_FRAME = { AddMessage = function(self, t) printed[#printed + 1] = t end }
local frames = {}
function CreateFrame()
  local f = { events = {} }
  function f:RegisterEvent(e) self.events[e] = true end
  function f:UnregisterEvent(e) self.events[e] = nil end
  function f:SetScript(_, fn) self.handler = fn end
  frames[#frames + 1] = f
  return f
end
time = os.time
date = os.date

assert(loadfile(addonPath))("GuideWebExport")
-- Login, then the first quest-log update runs the full export. No C_Timer here.
for _, f in ipairs(frames) do if f.events.PLAYER_ENTERING_WORLD then f.handler(f, "PLAYER_ENTERING_WORLD") end end
for _, f in ipairs(frames) do if f.events.QUEST_LOG_UPDATE then f.handler(f, "QUEST_LOG_UPDATE") end end
if mode == "turnin" then
  for _, f in ipairs(frames) do
    if f.events.QUEST_TURNED_IN then f.handler(f, "QUEST_TURNED_IN", 868) end
  end
end
SlashCmdList.GUIDEWEBEXPORT("")
assert(#printed >= 3, "expected chat output")
local warned = false
for _, line in ipairs(printed) do
  if string.find(line, "built for WoW Forever", 1, true) then warned = true end
end
if WOW_PROJECT_ID == 18 then
  assert(not warned, "Forever client should stay quiet")
else
  assert(warned, "missing Forever project warning")
end

-- write like the client: ["key"] = value, arrays as `value, -- [n]`
local function isArray(t)
  local n = 0
  for _ in pairs(t) do n = n + 1 end
  for i = 1, n do if t[i] == nil then return false end end
  return n > 0
end
local function ser(v, ind)
  local tv = type(v)
  if tv == "table" then
    local out = { "{\n" }
    if isArray(v) then
      for i = 1, #v do out[#out + 1] = ind .. "\t" .. ser(v[i], ind .. "\t") .. ", -- [" .. i .. "]\n" end
    else
      local keys = {}
      for k in pairs(v) do keys[#keys + 1] = k end
      table.sort(keys, function(a, b)
        if type(a) == type(b) then return a < b end
        return type(a) == "number"
      end)
      for _, k in ipairs(keys) do
        local ks = type(k) == "number" and ("[" .. k .. "]") or ("[" .. string.format("%q", k) .. "]")
        out[#out + 1] = ind .. "\t" .. ks .. " = " .. ser(v[k], ind .. "\t") .. ",\n"
      end
    end
    out[#out + 1] = ind .. "}"
    return table.concat(out)
  elseif tv == "string" then return string.format("%q", v)
  elseif tv == "number" then return string.format("%.14g", v)
  else return tostring(v) end
end
local fh = assert(io.open(outPath, "w"))
fh:write("\nGuideWebExportDB = " .. ser(GuideWebExportDB, "") .. "\n")
fh:close()
"""


@unittest.skipIf(LUA is None, "no lua interpreter on PATH")
class AddonTest(unittest.TestCase):
    def test_syntax(self) -> None:
        if LUAC:
            r = subprocess.run([LUAC, "-p", str(ADDON / "GuideWebExport.lua")], capture_output=True, text=True)
        else:
            r = subprocess.run([LUA, "-e", f"assert(loadfile([[{ADDON / 'GuideWebExport.lua'}]]))"], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        toc = (ADDON / "GuideWebExport.toc").read_text(encoding="utf-8")
        self.assertIn("## Interface: 16001", toc)
        self.assertIn("## SavedVariables: GuideWebExportDB", toc)

    def _run(self, mode: str) -> savedvars.ExportData:
        with tempfile.TemporaryDirectory() as td:
            h = Path(td) / "harness.lua"
            h.write_text(HARNESS, encoding="utf-8")
            out = Path(td) / "GuideWebExport.lua"
            r = subprocess.run([LUA, str(h), str(ADDON / "GuideWebExport.lua"), str(out), mode],
                               capture_output=True, text=True, timeout=60)
            self.assertEqual(r.returncode, 0, r.stderr + r.stdout)
            return savedvars.read_export(out)

    def _check_bounds(self, ex: savedvars.ExportData, method: str) -> None:
        self.assertEqual(sorted(ex.maps), [1411, 1414, 1454])
        bd = ex.exact_bounds(1411)
        assert bd
        for k, v in {"left": -1962.4999, "top": 1808.3333, "width": 5287.5, "height": 3525}.items():
            self.assertAlmostEqual(bd[k], v, places=6)
        self.assertEqual(ex.maps[1411]["instance"], 1)
        self.assertEqual(ex.maps[1411]["method"], method)
        self.assertEqual(ex.maps[1411]["name"], "Durotar")
        x, y = convert(bd, -4251.46, -607.35)
        self.assertEqual((round(x, 2), round(y, 2)), (43.29, 68.53))
        # the 1/1 corner agrees with left - width / top - height
        c11 = ex.maps[1411]["c11"]
        self.assertAlmostEqual(c11["y"], bd["left"] - bd["width"], places=6)
        self.assertAlmostEqual(c11["x"], bd["top"] - bd["height"], places=6)

    def test_worldsize_path(self) -> None:
        ex = self._run("worldsize")
        self._check_bounds(ex, "worldsize")
        c = ex.characters[ex.last_character or ""]
        self.assertEqual(ex.last_character, "Thrall-Forever")
        self.assertEqual((c["race"], c["class"], c["level"], c["faction"]), ("Orc", "WARRIOR", 12, "Horde"))
        self.assertEqual(c["completed"], [788, 4641])
        self.assertNotIn("probe", c)
        pos = c["position"]
        self.assertEqual(pos["mapId"], 1411)
        self.assertEqual(pos["zone"], "Durotar")
        self.assertAlmostEqual(pos["x"], 0.4329, places=4)
        self.assertAlmostEqual(pos["y"], 0.6853, places=4)
        self.assertTrue(c["positionOk"])
        self.assertTrue(c["questLogOk"])
        self.assertGreaterEqual(len(c["questLog"]), 2)
        self.assertTrue(c["skillsOk"])
        self.assertGreaterEqual(len(c["skills"]), 1)
        self.assertEqual(c["skills"][0]["skillID"], 186)
        self.assertEqual(c["schemaVersion"], 4)
        self.assertEqual(ex.build.get("toc"), 16001)

    def test_bounds_compat_path(self) -> None:
        ex = self._run("bounds")
        self._check_bounds(ex, "compat")
        c = ex.characters["Thrall-Forever"]
        self.assertEqual(c["completed"], [788, 4641])
        self.assertEqual(c["name"], "Thrall")
        self.assertEqual(c["schemaVersion"], 4)
        self.assertNotIn("surname", c)

    def test_forever_turnin_before_list_updates(self) -> None:
        ex = self._run("turnin")
        c = ex.characters["Thrall-Forever"]
        self.assertEqual(c["completed"], [788, 868, 4641])
        self.assertEqual(c["schemaVersion"], 4)

    def test_forever_surname(self) -> None:
        ex = self._run("surname")
        c = ex.characters["Throgar Stonehand-Forever"]
        self.assertEqual(ex.last_character, "Throgar Stonehand-Forever")
        self.assertEqual(c["name"], "Throgar Stonehand")
        self.assertEqual(c["firstName"], "Throgar")
        self.assertEqual(c["surname"], "Stonehand")
        self.assertEqual(c["guid"], "Player-99-AABB")
        self.assertEqual(c["realm"], "Forever")
        self.assertEqual(c["schemaVersion"], 4)
        self.assertNotIn("Throgar-Forever", ex.characters)
        # Only the current character's snapshot is kept (docs/GAME_EXPORT.md).
        self.assertNotIn("Other-Forever", ex.characters)
        self.assertEqual(c["completed"], [788, 4641])

    def test_forever_realm_second_return_is_not_surname(self) -> None:
        ex = self._run("realmsecond")
        self.assertEqual(ex.last_character, "Thrall-Forever")
        c = ex.characters["Thrall-Forever"]
        self.assertEqual(c["name"], "Thrall")
        self.assertEqual(c["firstName"], "Thrall")
        self.assertNotIn("surname", c)
        self.assertNotIn("Thrall For Ever-Forever", ex.characters)

    def test_forever_project_is_quiet(self) -> None:
        ex = self._run("project18")
        c = ex.characters["Thrall-Forever"]
        self.assertEqual(c["schemaVersion"], 4)


if __name__ == "__main__":
    unittest.main()
