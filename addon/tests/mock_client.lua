-- Offline harness: runs GuideWebExport.lua against a mocked WoW Forever 1.60.1
-- client (no real game), fires the events it listens to, and prints the
-- resulting GuideWebExportDB in the same layout WoW writes SavedVariables.
--
--   lua5.1 addon/tests/mock_client.lua > contracts/fixtures/GuideWebExport.sample.lua
--
-- The character is a sample Orc Warrior around level 24. Quest and item ids
-- are the same numbers the Forever client uses for those Barrens quests.

local here = (arg and arg[0] or ""):match("^(.*)[/\\]") or "."
local ADDON = here .. "/../GuideWebExport/GuideWebExport.lua"

local NOW = 1795219200 -- fixed clock so the output is reproducible
function time() return NOW end
local realDate = os.date
function date(fmt) return realDate("!" .. (fmt or "%c"), NOW) end

local chat = {}
DEFAULT_CHAT_FRAME = { AddMessage = function(_, text) chat[#chat + 1] = text end }

local P = {
    name = "Zugrok", surname = "Grimfang", realm = "Forever",
    guid = "Player-2-0A1B2C3D",
    race = { "Orc", "Orc" }, class = { "Warrior", "WARRIOR" },
    level = 24, faction = "Horde", xp = 9135, xpMax = 17700, rested = 4200,
    money = 284731,
    zone = "The Barrens", subzone = "The Crossroads",
    map = 1413, x = 0.512, y = 0.294,
    bind = "Razor Hill",
    dead = false,
}

local COMPLETED = {
    4641, 788, 789, 4402, 5441, 6394, 790, 804, 792, 794, 805, 2161,
    823, 784, 825, 786, 791, 815, 817, 818, 830, 831, 812, 808, 826,
    834, 835, 837, 840, 842, 806, 828, 827, 829,
    6365, 6384, 6385, 6386, 844, 845, 903, 881, 869, 3281, 870, 877, 880,
    871, 872, 5041, 867, 875, 848, 853, 850, 851, 852, 899, 893,
}
local completedSet = {}
for _, id in ipairs(COMPLETED) do completedSet[id] = true end

-- header rows + quests. One header starts collapsed so expand/restore is tested.
local QUESTLOG = {
    { header = "The Barrens", collapsed = true },
    { title = "Serena Bloodfeather", level = 20, id = 876,
      objectives = { { text = "Serena's Head: 0/1", type = "item", finished = false, numFulfilled = 0, numRequired = 1 } } },
    { title = "Tribes at War", level = 21, id = 878,
      objectives = {
        { text = "Bristleback Water Seeker slain: 6/6", type = "monster", finished = true, numFulfilled = 6, numRequired = 6 },
        { text = "Bristleback Thornweaver slain: 7/12", type = "monster", finished = false, numFulfilled = 7, numRequired = 12 },
        { text = "Bristleback Geomancer slain: 3/12", type = "monster", finished = false, numFulfilled = 3, numRequired = 12 },
      } },
    { title = "Egg Hunt", level = 22, id = 868, ready = true,
      objectives = { { text = "Silithid Egg: 12/12", type = "item", finished = true, numFulfilled = 12, numRequired = 12 } } },
    { title = "Hidden Debug", level = 1, id = 1, isHidden = true },
}

local SKILLS = {
    { name = "Professions", isHeader = true, isExpanded = true },
    { name = "Mining", skillLineID = 186, skillRank = 112, skillMaxRank = 150, isAbandonable = true, skillLineCategoryID = 11 },
    { name = "Blacksmithing", skillLineID = 164, skillRank = 105, skillMaxRank = 150, isAbandonable = true, skillLineCategoryID = 11 },
    { name = "Secondary Skills", isHeader = true, isExpanded = false },
    { name = "Cooking", skillLineID = 185, skillRank = 87, skillMaxRank = 150, skillLineCategoryID = 9 },
    { name = "First Aid", skillLineID = 129, skillRank = 120, skillMaxRank = 150, skillLineCategoryID = 9 },
    { name = "Riding", skillLineID = 762, skillRank = 75, skillMaxRank = 150, skillLineCategoryID = 9 },
    { name = "Weapon Skills", isHeader = true, isExpanded = true },
    { name = "Two-Handed Maces", skillLineID = 160, skillRank = 112, skillMaxRank = 120, skillLineCategoryID = 6 },
    { name = "Axes", skillLineID = 196, skillRank = 98, skillMaxRank = 120, skillLineCategoryID = 6 },
    { name = "Defense", skillLineID = 95, skillRank = 120, skillMaxRank = 120, skillLineCategoryID = 6 },
    { name = "Languages", isHeader = true, isExpanded = true },
    { name = "Language: Orcish", skillLineID = 109, skillRank = 300, skillMaxRank = 300, skillLineCategoryID = 10 },
}

local GEAR = {
    [5] = { 4922, "Jagged Chain Vest" },
    [6] = { 5328, "Cinched Belt" },
    [7] = { 2694, "Settler's Leggings" },
    [8] = { 4946, "Lightweight Boots" },
    [9] = { 6062, "Heavy Cord Bracers" },
    [10] = { 4914, "Battleworn Leather Gloves" },
    [11] = { 5351, "Bounty Hunter's Ring" },
    [15] = { 5314, "Boar Hunter's Cape" },
    [16] = { 5322, "Demolition Hammer" },
}

local BAGS = {
    [0] = { { id = 6948, count = 1 }, { id = 1179, count = 5 } },
    [1] = { { id = 1179, count = 5 } },
}

local FACTIONS = {
    { name = "Horde", factionID = 67, isHeader = true, isCollapsed = true },
    { name = "Orgrimmar", factionID = 76, reaction = 4, currentStanding = 2100, currentReactionThreshold = 0, nextReactionThreshold = 3000, atWarWith = false },
    { name = "Darkspear Trolls", factionID = 530, reaction = 5, currentStanding = 3200, currentReactionThreshold = 3000, nextReactionThreshold = 9000, atWarWith = false },
}

local TAXI = {
    { nodeID = 22, name = "Crossroads, The Barrens", state = 0, mapID = 1413 },
    { nodeID = 23, name = "Camp Taurajo, The Barrens", state = 1, mapID = 1413 },
    { nodeID = 80, name = "Orgrimmar, Durotar", state = 2, mapID = 1413 },
}

local KNOWN = { [33388] = true, [6653] = true }

function UnitName(unit)
    if unit == "pet" then return "Grunter" end
    return P.name, P.surname
end
function GetUnitName()
    return P.name .. " " .. P.surname
end
function UnitGUID() return P.guid end
function GetRealmName() return P.realm end
function GetNormalizedRealmName() return P.realm end
function UnitRace() return P.race[1], P.race[2] end
function UnitClass() return P.class[1], P.class[2] end
function UnitLevel(unit)
    if unit == "pet" then return 24 end
    return P.level
end
function UnitFactionGroup() return P.faction, P.faction end
function UnitXP() return P.xp end
function UnitXPMax() return P.xpMax end
function GetXPExhaustion() return P.rested end
function GetRestState() return 1, "Rested", 2 end
function GetMoney() return P.money end
function GetBindLocation() return P.bind end
function GetBuildInfo() return "1.60.1", "71037", "Nov 21 2026", 16001 end
function UnitIsDeadOrGhost() return P.dead end
function UnitExists(unit) return unit == "pet" end
function UnitCreatureFamily() return "Boar" end
function GetSubZoneText() return P.subzone end
function GetZoneText() return P.zone end
WOW_PROJECT_ID = 18

local function visibleQuests()
    local out, hidden = {}, false
    for _, q in ipairs(QUESTLOG) do
        if q.header then
            out[#out + 1] = q
            hidden = q.collapsed and true or false
        elseif not hidden then
            out[#out + 1] = q
        end
    end
    return out
end

local function questInfo(q)
    if q.header then
        return {
            title = q.header, isHeader = true, isCollapsed = q.collapsed and true or false,
            isHidden = false, questID = 0, level = 0,
        }
    end
    return {
        title = q.title, level = q.level, questID = q.id,
        isHeader = false, isCollapsed = false, isHidden = q.isHidden and true or false,
    }
end

C_QuestLog = {}
function C_QuestLog.GetNumQuestLogEntries()
    local n, quests = 0, 0
    for _, q in ipairs(visibleQuests()) do
        n = n + 1
        if not q.header then quests = quests + 1 end
    end
    return n, quests
end
function C_QuestLog.GetInfo(i)
    local q = visibleQuests()[i]
    if not q then return nil end
    return questInfo(q)
end
function C_QuestLog.GetQuestObjectives(questID)
    for _, q in ipairs(QUESTLOG) do
        if q.id == questID then return q.objectives or {} end
    end
    return {}
end
function C_QuestLog.GetAllCompletedQuestIDs()
    local ids = {}
    for id in pairs(completedSet) do ids[#ids + 1] = id end
    table.sort(ids)
    return ids
end
function C_QuestLog.ReadyForTurnIn(questID)
    for _, q in ipairs(QUESTLOG) do
        if q.id == questID then return q.ready and true or false end
    end
    return false
end
function C_QuestLog.IsComplete(questID) return C_QuestLog.ReadyForTurnIn(questID) end
function C_QuestLog.IsFailed() return false end

local function visibleSkills()
    local out, hidden = {}, false
    for _, s in ipairs(SKILLS) do
        if s.isHeader then
            out[#out + 1] = s
            hidden = not s.isExpanded
        elseif not hidden then
            out[#out + 1] = s
        end
    end
    return out
end

C_SkillInfo = {}
function C_SkillInfo.GetNumSkillLines() return #visibleSkills() end
function C_SkillInfo.GetSkillLineInfo(i)
    local s = visibleSkills()[i]
    if not s then return nil end
    return s
end
function C_SkillInfo.ExpandSkillHeader(i)
    local s = visibleSkills()[i]
    if s and s.isHeader then s.isExpanded = true end
end
function C_SkillInfo.CollapseSkillHeader(i)
    local s = visibleSkills()[i]
    if s and s.isHeader then s.isExpanded = false end
end

function GetProfessions() return 1, 2, nil, nil, nil, nil end
function GetProfessionInfo(index)
    if index == 1 then return "Mining", 0, 112, 150, 0, 0, 186, 0, nil end
    if index == 2 then return "Blacksmithing", 0, 105, 150, 0, 0, 164, 0, nil end
    return nil
end

local function visibleFactions()
    local out, hidden = {}, false
    for _, f in ipairs(FACTIONS) do
        if f.isHeader then
            out[#out + 1] = f
            hidden = f.isCollapsed and true or false
        elseif not hidden then
            out[#out + 1] = f
        end
    end
    return out
end
C_Reputation = {}
function C_Reputation.GetNumFactions() return #visibleFactions() end
function C_Reputation.GetFactionDataByIndex(i) return visibleFactions()[i] end
function C_Reputation.ExpandFactionHeader(i)
    local f = visibleFactions()[i]
    if f and f.isHeader then f.isCollapsed = false end
end
function C_Reputation.CollapseFactionHeader(i)
    local f = visibleFactions()[i]
    if f and f.isHeader then f.isCollapsed = true end
end

C_Container = {}
function C_Container.GetContainerNumSlots(bag)
    local slots = BAGS[bag]
    return slots and #slots or 0
end
function C_Container.GetContainerItemID(bag, slot)
    local slots = BAGS[bag]
    local item = slots and slots[slot]
    return item and item.id or nil
end
function C_Container.GetContainerItemInfo(bag, slot)
    local slots = BAGS[bag]
    local item = slots and slots[slot]
    if not item then return nil end
    return { itemID = item.id, stackCount = item.count }
end

C_Map = {}
function C_Map.GetBestMapForUnit() return P.map end
function C_Map.GetMapInfo(id)
    if id == P.map then return { name = P.zone, mapType = 3, parentMapID = 1414 } end
    return nil
end
function C_Map.GetPlayerMapPosition()
    return { x = P.x, y = P.y }
end

function GetTaxiMapID() return 1413 end
C_TaxiMap = {}
function C_TaxiMap.GetAllTaxiNodes() return TAXI end

C_SpellBook = {}
function C_SpellBook.IsSpellKnown(id) return KNOWN[id] and true or false end

function GetInventoryItemLink(_, slot)
    local g = GEAR[slot]
    if not g then return nil end
    return string.format("|cffffffff|Hitem:%d::::::::%d:::::::|h[%s]|h|r", g[1], P.level, g[2])
end
function GetInventoryItemID(_, slot) local g = GEAR[slot]; return g and g[1] or nil end
function GetInventoryItemDurability(slot)
    if slot == 16 then return 20, 100 end
    if GEAR[slot] then return 100, 100 end
    return nil
end

C_EventUtils = {}
function C_EventUtils.IsEventValid(name)
    local ok = {
        PLAYER_ENTERING_WORLD = true, QUEST_LOG_UPDATE = true, QUEST_REMOVED = true,
        PLAYER_XP_UPDATE = true, TAXIMAP_OPENED = true, BAG_UPDATE_DELAYED = true,
        SKILL_LINES_CHANGED = true, QUEST_ACCEPTED = true, QUEST_TURNED_IN = true,
        PLAYER_LEVEL_UP = true, PLAYER_MONEY = true, PLAYER_EQUIPMENT_CHANGED = true,
        PLAYER_LOGOUT = true,
    }
    return ok[name] and true or false
end

local timers = {}
C_Timer = { After = function(delay, fn) timers[#timers + 1] = { delay = delay or 0, fn = fn } end }
local function flushTimers()
    local guard = 0
    while #timers > 0 and guard < 20 do
        guard = guard + 1
        table.sort(timers, function(a, b) return a.delay < b.delay end)
        local batch = timers
        timers = {}
        for _, item in ipairs(batch) do item.fn() end
    end
end

local frames = {}
function CreateFrame()
    local f = { events = {} }
    function f:RegisterEvent(e) self.events[e] = true end
    function f:UnregisterEvent(e) self.events[e] = nil end
    function f:SetScript(_, fn) self.onEvent = fn end
    frames[#frames + 1] = f
    return f
end
local function fire(event, ...)
    for _, f in ipairs(frames) do
        if f.events[event] and f.onEvent then f.onEvent(f, event, ...) end
    end
end

function ExpandQuestHeader(i)
    local q = visibleQuests()[i]
    if q and q.header then q.collapsed = false end
    fire("QUEST_LOG_UPDATE")
end
function CollapseQuestHeader(i)
    local q = visibleQuests()[i]
    if q and q.header then q.collapsed = true end
end

SlashCmdList = {}

local chunk = assert(loadfile(ADDON))
chunk("GuideWebExport", {})

fire("PLAYER_ENTERING_WORLD")
fire("QUEST_LOG_UPDATE")
flushTimers()

for _, q in ipairs(QUESTLOG) do
    if q.id == 868 then q.gone = true end
end
-- Drop Egg Hunt from the log the way the client does after turn-in.
local kept = {}
for _, q in ipairs(QUESTLOG) do
    if q.id ~= 868 then kept[#kept + 1] = q end
end
QUESTLOG = kept

fire("QUEST_TURNED_IN", 868, 2250, 0)
P.money = P.money + 4520
fire("PLAYER_MONEY")
flushTimers()
completedSet[868] = true
fire("TAXIMAP_OPENED")
flushTimers()

-- Logout while the client has already dropped the player (seen live: level 1,
-- 0/0 XP, no money, no completed quests). The saved snapshot must survive.
do
    local saved = GuideWebExportDB.characters["Zugrok Grimfang-Forever"]
    local savedAt = GuideWebExportDB.exportedAt
    local real = { level = P.level, xp = P.xp, xpMax = P.xpMax, money = P.money }
    P.level, P.xp, P.xpMax, P.money = 1, 0, 0, 0
    fire("PLAYER_LOGOUT")
    assert(GuideWebExportDB.characters["Zugrok Grimfang-Forever"] == saved, "unready logout replaced the snapshot")
    assert(GuideWebExportDB.exportedAt == savedAt, "unready logout restamped the export")
    -- A lower level for the same character is refused even with XP data.
    P.level, P.xpMax, P.money = 5, 2800, real.money
    fire("PLAYER_LOGOUT")
    assert(GuideWebExportDB.characters["Zugrok Grimfang-Forever"] == saved, "level went down")
    P.level, P.xp, P.xpMax, P.money = real.level, real.xp, real.xpMax, real.money
end
fire("PLAYER_LOGOUT")

assert(SKILLS[4].isExpanded == false, "collapsed skill header was not restored")
assert(QUESTLOG[1].collapsed == true, "collapsed quest header was not restored")
assert(FACTIONS[1].isCollapsed == true, "collapsed faction header was not restored")

local key = "Zugrok Grimfang-Forever"
local c = GuideWebExportDB.characters[key]
assert(c and c.schemaVersion == 4, "no schema 4 character")
assert(c.name == "Zugrok Grimfang" and c.firstName == "Zugrok" and c.surname == "Grimfang", "full name fields")
assert(c.guid == P.guid, "guid")
assert(GuideWebExportDB.characters["Zugrok-Forever"] == nil, "legacy key left behind")
assert(c.money == 284731 + 4520, "PLAYER_MONEY did not refresh gold")
local has868 = false
for _, id in ipairs(c.completed) do if id == 868 then has868 = true end end
assert(has868, "QUEST_TURNED_IN quest missing from completed")
assert(#c.questLog >= 2, "quest log empty")
assert(#c.skills >= 2, "skills empty")
assert(c.questLogOk == true and c.skillsOk == true, "ok flags")
assert(c.probe == nil, "probe should be gone")
local riding, cooking, mining, weapon = false, false, false, false
for _, s in ipairs(c.skills) do
    if s.skillID == 762 and s.kind == "riding" then riding = true end
    if s.skillID == 185 and s.kind == "secondary" then cooking = true end
    if s.skillID == 186 and s.kind == "primary" then mining = true end
    if s.kind == "weapon" then weapon = true end
end
assert(riding and cooking and mining and weapon, "skill kinds")
assert(c.taxi and c.taxi[22] and c.taxi[22].name == "Crossroads, The Barrens", "taxi")
assert(c.taxi[80] == nil, "unreachable taxi node stored")
assert(c.taxiOk == true, "taxiOk")
assert(c.taxi[22].mapId == 1413, "taxi map")
assert(c.bind == "Razor Hill" and c.bindOk == true, "bind")
assert(c.bags and c.bags[1179] == 10, "bag stacks")
assert(c.bagsOk == true, "bagsOk")
assert(c.position and c.position.mapId == 1413 and c.positionOk == true, "position")
assert(c.spells and c.spells.riding == 75 and c.spells.mount == true, "spells")
assert(c.spellsOk == true, "spellsOk")
assert(c.pet and c.pet.family == "Boar" and c.petOk == true, "pet")
assert(c.deadOrGhost == false, "dead")
assert(c.durabilityOk == true and c.durability.lowestSlot == 16, "durability")
assert(#c.reputation == 2 and c.reputationOk == true, "reputation")
assert(#c.professions == 2, "professions")
local ready = false
for _, q in ipairs(c.questLog) do
    if q.id == 868 then error("turned-in quest still in the log") end
    if q.complete == 1 then ready = true end
    if q.objectives and q.objectives[1] then
        assert(q.objectives[1].numRequired ~= nil, "objective shape")
    end
end
-- Egg Hunt left the log before the last refresh; the earlier quests are not ready.
assert(not ready, "unexpected ready quest")
assert(c.questLog[1].id == 876 or c.questLog[2].id == 876, "quest ids")

-- Fresh snapshot keeps only the character just stored. Map bounds stay put.
local mapsBefore = GuideWebExportDB.maps
local savedName, savedSurname = P.name, P.surname
GuideWebExportDB.characters = {
    ["Otherone Grim-Forever"] = { name = "Otherone Grim" },
    ["Second Alt-Forever"] = { name = "Second Alt" },
}
P.name, P.surname = "Third", "Alt"
fire("PLAYER_MONEY")
flushTimers()
local onlyKey = "Third Alt-Forever"
local charCount = 0
for charKey in pairs(GuideWebExportDB.characters) do
    charCount = charCount + 1
    assert(charKey == onlyKey, "unexpected character " .. tostring(charKey))
end
assert(charCount == 1, "snapshot should keep only the new character")
assert(GuideWebExportDB.lastCharacter == onlyKey, "lastCharacter")
assert(GuideWebExportDB.maps == mapsBefore, "map bounds table changed")
P.name, P.surname = savedName, savedSurname
fire("PLAYER_MONEY")
flushTimers()

local function key(k)
    if type(k) == "number" then return "[" .. k .. "]" end
    return string.format("[%q]", k)
end
local function sortedKeys(t)
    local ks = {}
    for k in pairs(t) do ks[#ks + 1] = k end
    table.sort(ks, function(a, b)
        if type(a) == type(b) then return a < b end
        return type(a) == "number"
    end)
    return ks
end
local function emit(v, indent)
    local t = type(v)
    if t == "string" then return string.format("%q", v) end
    if t ~= "table" then return tostring(v) end
    local lines = { "{" }
    local n = #v
    for i = 1, n do
        lines[#lines + 1] = indent .. "\t" .. emit(v[i], indent .. "\t") .. ", -- [" .. i .. "]"
    end
    for _, k in ipairs(sortedKeys(v)) do
        if not (type(k) == "number" and k >= 1 and k <= n and k % 1 == 0) then
            lines[#lines + 1] = indent .. "\t" .. key(k) .. " = " .. emit(v[k], indent .. "\t") .. ","
        end
    end
    lines[#lines + 1] = indent .. "}"
    return table.concat(lines, "\n")
end
io.write("-- Sample SavedVariables written by addon/tests/mock_client.lua (mocked WoW Forever 1.60.1, not a live session).\n")
io.write("-- Orc Warrior, level 24. Schema 4.\n")
io.write("\nGuideWebExportDB = " .. emit(GuideWebExportDB, "") .. "\n")
io.stderr:write(table.concat(chat, "\n") .. "\n")
