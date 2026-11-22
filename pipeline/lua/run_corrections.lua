-- pipeline/lua/run_corrections.lua  (P2 harness, Lua 5.1)
--
-- Evaluates the parts of QuestieDB / Questie that are *code*, not data, for one character
-- (default: a Horde character) and prints the result as JSON on stdout:
--
--   * QuestieDB Dynamic Corrections: legacy `LoadFactionFixes` (Forever/legacy/classic*Fixes.lua)
--     then Forever `LoadDynamic` (Forever/forever*Fixes.lua). Static corrections are already
--     folded into the baked TOC, so only these remain.
--   * QuestieDB enums (raceKeys, classKeys, questFlags, specialFlags, sortKeys, zoneIDs, ...).
--   * Questie policy: quest/NPC/item blacklists, AQ/invasion lists, world-event quest lists,
--     quest tag corrections (Elite/Dungeon/Raid/PvP ...).
--
-- It never writes files. Usage:
--   lua run_corrections.lua <QuestieDB dir> <Questie dir> [Horde|Alliance] [ClassToken]
--
-- Every step runs under pcall; failures are reported in the "errors" array so the Python side
-- can degrade gracefully.

local QDB = assert(arg[1], "usage: run_corrections.lua <QuestieDB dir> <Questie dir> [faction] [class]")
local QUESTIE = assert(arg[2], "missing Questie dir")
local FACTION = arg[3] or "Horde"
local CLASS = arg[4] or "WARRIOR"

local errors = {}
local function try(label, fn, ...)
  local ok, res = pcall(fn, ...)
  if not ok then
    errors[#errors + 1] = label .. ": " .. tostring(res)
    return nil
  end
  return res
end

local function path(dir, rel) return dir .. "/" .. rel end

local function run(file, ...)
  local chunk, err = loadfile(file)
  if not chunk then error(err, 0) end
  return chunk(...)
end

------------------------------------------------------------------------------------------
-- WoW API stubs used by the correction files
------------------------------------------------------------------------------------------
_G.UnitFactionGroup = function() return FACTION, FACTION end
_G.UnitClassBase = function() return CLASS, 1 end
_G.UnitClass = function() return CLASS, CLASS, 1 end
_G.UnitRace = function() return "Orc", "Orc", 2 end
_G.tinsert = table.insert
_G.strsplit = function(sep, s)
  local out = {}
  for piece in (s .. sep):gmatch("(.-)" .. sep:gsub("%p", "%%%0")) do out[#out + 1] = piece end
  return unpack(out)
end
_G.C_Seasons = { GetActiveSeason = function() return 0 end }

------------------------------------------------------------------------------------------
-- QuestieDB side: config, meta, enums, compat shim, correction providers
------------------------------------------------------------------------------------------
local ns = {}
local result = { faction = FACTION, class = CLASS, dynamic = {}, enums = {}, questie = {} }

local function loadQuestieDB()
  run(path(QDB, "src/config.lua"), "QuestieDB", ns)
  for _, f in ipairs(ns.config.runtimeFiles.head) do
    if f:find("^src/meta/") then run(path(QDB, f), "QuestieDB", ns) end
  end
  for _, f in ipairs(ns.config.enumFiles) do run(path(QDB, f), "QuestieDB", ns) end
  run(path(QDB, "src/corrections/compat.lua"), "QuestieDB", ns)
end

local CORRECTION_FILES = {
  -- { file, module, functions } in apply order: legacy (Era window) before Forever window.
  { "src/corrections/Forever/legacy/classicQuestFixes.lua", "QuestieQuestFixes", "Quest", "LoadFactionFixes", "legacy" },
  { "src/corrections/Forever/legacy/classicNPCFixes.lua", "QuestieNPCFixes", "Npc", "LoadFactionFixes", "legacy" },
  { "src/corrections/Forever/legacy/classicItemFixes.lua", "QuestieItemFixes", "Item", "LoadFactionFixes", "legacy" },
  { "src/corrections/Forever/legacy/classicObjectFixes.lua", "QuestieObjectFixes", "Object", "LoadFactionFixes", "legacy" },
  { "src/corrections/Forever/foreverQuestFixes.lua", "ForeverQuestFixes", "Quest", "LoadDynamic", "forever" },
  { "src/corrections/Forever/foreverNPCFixes.lua", "ForeverNpcFixes", "Npc", "LoadDynamic", "forever" },
  { "src/corrections/Forever/foreverItemFixes.lua", "ForeverItemFixes", "Item", "LoadDynamic", "forever" },
  { "src/corrections/Forever/foreverObjectFixes.lua", "ForeverObjectFixes", "Object", "LoadDynamic", "forever" },
}

local function runCorrections()
  local compat = ns.CorrectionCompat
  local flavor = ns.config.flavorByName.Forever
  compat.Install(flavor)
  for _, spec in ipairs(CORRECTION_FILES) do
    try("load " .. spec[1], run, path(QDB, spec[1]), "QuestieDB", ns)
  end
  for _, spec in ipairs(CORRECTION_FILES) do
    local module = compat.modules[spec[2]]
    local datatype, fn, layer = spec[3], spec[4], spec[5]
    result.dynamic[datatype] = result.dynamic[datatype] or {}
    if module and type(module[fn]) == "function" then
      local rows = try(spec[1] .. ":" .. fn, compat.Invoke, module[fn], module)
      result.dynamic[datatype][layer] = rows or {}
    else
      errors[#errors + 1] = "missing provider " .. spec[2] .. ":" .. fn
    end
  end
  result.objectiveFirst = compat.objectiveFirst
  local m = compat.modules
  local db = m.QuestieDB
  result.enums = {
    raceKeys = db.raceKeys, classKeys = db.classKeys, questFlags = db.questFlags,
    specialFlags = db.specialFlags, sortKeys = db.sortKeys, npcFlags = db.npcFlags,
    zoneIDs = m.ZoneDB.zoneIDs, raceMaskById = ns.Enum.raceMaskById,
    professionKeys = m.QuestieProfessions.professionKeys,
  }
  compat.Remove()
end

------------------------------------------------------------------------------------------
-- Questie side: blacklists, event quests, quest tag corrections
------------------------------------------------------------------------------------------
local function questieToc()
  local list = {}
  local f = io.open(path(QUESTIE, "Questie_Forever.toc"), "r")
  if not f then return list end
  for line in f:lines() do
    line = line:gsub("\r", "")
    if line:find("^Database\\Corrections\\Holidays\\quests\\") then
      list[#list + 1] = (line:gsub("\\", "/"))
    end
  end
  f:close()
  return list
end

local function loadQuestie()
  local modules = {}
  local function mod(name)
    modules[name] = modules[name] or {}
    return modules[name]
  end
  local Expansions = mod("Expansions")
  Expansions.Era, Expansions.Classic, Expansions.Tbc, Expansions.Wotlk, Expansions.Cata, Expansions.MoP = 1, 1, 2, 3, 4, 5
  Expansions.Current = 1 -- Questie.IsForever forces Era (Modules/Expansions.lua)
  local ContentPhases = mod("ContentPhases")
  ContentPhases.activePhases = { SoM = 5, SoD = 7, Anniversary = 6, MoP = 5, TBC = 4 }
  ContentPhases.IsInvasionActive = {}
  for _, n in ipairs({ "BlacklistSoDQuestsByPhase", "BlacklistTbcQuestsByPhase", "BlacklistAnniversaryQuestsByPhase",
                       "BlacklistSoMQuestsByPhase", "BlacklistMoPQuestsByPhase" }) do
    ContentPhases[n] = function(list) return list end
  end
  mod("QuestieDB").private = {}
  mod("QuestieEvent").eventQuests = {}
  mod("TitanReforgedQuestTags").LoadQuestTagCorrections = function() return {} end
  modules.l10n = setmetatable({}, { __call = function(_, text) return text end })

  local savedLoader = rawget(_G, "QuestieLoader")
  _G.QuestieLoader = {
    ImportModule = function(_, name) return modules[name] or mod(name) end,
    CreateModule = function(_, name) return mod(name) end,
  }
  _G.Questie = setmetatable({ IsForever = true, IsClassic = true, DEBUG_DEVELOP = 1, DEBUG_CRITICAL = 1,
                              DEBUG_SPAM = 1, DEBUG_INFO = 1, Debug = function() end },
                            { __index = function(_, k)
                                if type(k) == "string" and k:find("^Is") then return false end
                                return nil
                              end })

  local base = "Database/Corrections/"
  for _, f in ipairs({ "BlacklistFilter.lua", "QuestieQuestBlacklist.lua", "QuestieNPCBlacklist.lua",
                       "QuestieItemBlacklist.lua", "HardcoreBlacklist.lua", "questTagInfoCorrections.lua" }) do
    try("load " .. f, run, path(QUESTIE, base .. f))
  end
  for _, f in ipairs(questieToc()) do try("load " .. f, run, path(QUESTIE, f)) end

  local q = result.questie
  local filter = modules.BlacklistFilter and modules.BlacklistFilter.filterExpansion or function(t) return t end
  q.hiddenQuests = try("QuestieQuestBlacklist:Load", function() return filter(modules.QuestieQuestBlacklist:Load()) end)
  q.npcBlacklist = try("QuestieNPCBlacklist:Load", function() return filter(modules.QuestieNPCBlacklist:Load()) end)
  q.itemBlacklist = try("QuestieItemBlacklist:Load", function() return filter(modules.QuestieItemBlacklist:Load()) end)
  q.hardcoreBlacklist = try("HardcoreBlacklist:Load", function() return modules.HardcoreBlacklist:Load() end)
  q.aqWarEffortQuests = modules.QuestieQuestBlacklist and modules.QuestieQuestBlacklist.AQWarEffortQuests
  q.invasionQuests = modules.QuestieQuestBlacklist and modules.QuestieQuestBlacklist.InvasionQuests
  q.hideOnMap = modules.QuestieQuestBlacklist and modules.QuestieQuestBlacklist.HIDE_ON_MAP
  q.eventQuests = modules.QuestieEvent.eventQuests
  try("InitializeQuestTagInfoCorrections", function()
    modules.QuestieDB.private.InitializeQuestTagInfoCorrections()
    q.questTags = modules.QuestieDB.private.questTagCorrections
  end)

  _G.QuestieLoader = savedLoader
  _G.Questie = nil
end

------------------------------------------------------------------------------------------
-- JSON encoder (deterministic: object keys sorted)
------------------------------------------------------------------------------------------
local function isArray(t)
  local n = 0
  for k in pairs(t) do
    if type(k) ~= "number" or k < 1 or k % 1 ~= 0 then return false end
    n = n + 1
  end
  for i = 1, n do if t[i] == nil then return false end end
  return true, n
end

local function encodeString(s)
  return '"' .. s:gsub('[%c"\\]', function(c)
    local map = { ['"'] = '\\"', ["\\"] = "\\\\", ["\n"] = "\\n", ["\r"] = "\\r", ["\t"] = "\\t" }
    return map[c] or string.format("\\u%04x", c:byte())
  end) .. '"'
end

local function encodeNumber(x)
  if x ~= x or x == math.huge or x == -math.huge then return "null" end
  if x % 1 == 0 and math.abs(x) < 2 ^ 53 then return string.format("%.0f", x) end
  return string.format("%.17g", x)
end

local encode
encode = function(v, out, seen)
  local tv = type(v)
  if tv == "nil" then out[#out + 1] = "null"
  elseif tv == "boolean" then out[#out + 1] = v and "true" or "false"
  elseif tv == "number" then out[#out + 1] = encodeNumber(v)
  elseif tv == "string" then out[#out + 1] = encodeString(v)
  elseif tv == "table" then
    if seen[v] then error("cycle in table", 0) end
    seen[v] = true
    local arr, n = isArray(v)
    if arr and n > 0 then
      out[#out + 1] = "["
      for i = 1, n do
        if i > 1 then out[#out + 1] = "," end
        encode(v[i], out, seen)
      end
      out[#out + 1] = "]"
    elseif arr then
      out[#out + 1] = "[]"
    else
      local keys = {}
      for k in pairs(v) do
        local ks = type(k) == "number" and encodeNumber(k) or tostring(k)
        keys[#keys + 1] = { ks, k }
      end
      table.sort(keys, function(a, b) return a[1] < b[1] end)
      out[#out + 1] = "{"
      for i, pair in ipairs(keys) do
        if i > 1 then out[#out + 1] = "," end
        out[#out + 1] = encodeString(pair[1])
        out[#out + 1] = ":"
        local child = v[pair[2]]
        if type(child) == "function" then child = nil end
        encode(child, out, seen)
      end
      out[#out + 1] = "}"
    end
    seen[v] = nil
  else
    out[#out + 1] = "null" -- functions/userdata are not data
  end
end

------------------------------------------------------------------------------------------
try("QuestieDB load", loadQuestieDB)
if ns.CorrectionCompat then try("QuestieDB corrections", runCorrections) end
try("Questie policy", loadQuestie)
result.errors = errors

local out = {}
encode(result, out, {})
io.write(table.concat(out))
io.write("\n")
