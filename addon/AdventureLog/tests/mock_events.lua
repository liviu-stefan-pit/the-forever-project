-- Offline end-to-end harness for AdventureLog.
-- Lua 5.1. Does not run inside WoW.
--
--   lua mock_events.lua

local src = (arg and arg[0]) or "mock_events.lua"
src = src:gsub("/", "\\")
local here = src:match("^(.*)\\") or "."
local ADDON = here .. "\\.."

local results = {}
local failed = 0

local function report(ok, name, detail)
    local line = (ok and "PASS " or "FAIL ") .. name
    if detail and detail ~= "" then
        line = line .. " - " .. tostring(detail)
    end
    results[#results + 1] = line
    print(line)
    if not ok then
        failed = failed + 1
    end
end

local function readAll(path)
    local f = io.open(path, "rb")
    if not f then
        return nil
    end
    local text = f:read("*a")
    f:close()
    return text
end

local function writeAll(path, text)
    local f = io.open(path, "wb")
    if not f then
        error("cannot write " .. path)
    end
    f:write(text)
    f:close()
end

local function shell(cmd)
    local code = os.execute(cmd)
    if type(code) == "number" then
        return code
    end
    if code == true then
        return 0
    end
    return 1
end

-- ---------------------------------------------------------------------------
-- WoW mocks
-- ---------------------------------------------------------------------------

local NOW = os.time()
local clock = 1000

function time()
    return NOW
end

local realDate = os.date
function date(fmt, ...)
    if fmt == nil then
        return realDate("%c", NOW)
    end
    return realDate(fmt, NOW)
end

function GetTime()
    return clock
end

function GetServerTime()
    return NOW
end

local frames = {}

local function newFrame()
    local f = { _events = {}, _scripts = {} }
    function f:RegisterEvent(event)
        self._events[event] = true
    end
    function f:RegisterUnitEvent(event, unit)
        self._events[event] = true
        self._unitEvents = self._unitEvents or {}
        self._unitEvents[event] = unit
    end
    function f:UnregisterEvent(event)
        self._events[event] = nil
    end
    function f:SetScript(name, fn)
        self._scripts[name] = fn
    end
    frames[#frames + 1] = f
    return f
end

function CreateFrame()
    return newFrame()
end

local function fire(event, ...)
    for i = 1, #frames do
        local f = frames[i]
        if f._events[event] and type(f._scripts.OnEvent) == "function" then
            f._scripts.OnEvent(f, event, ...)
        end
    end
end

local queue = {}

local function timerObject()
    local ticker = { cancelled = false }
    function ticker:Cancel()
        self.cancelled = true
    end
    return ticker
end

C_Timer = {}

function C_Timer.After(delay, fn)
    queue[#queue + 1] = {
        t = clock + delay,
        fn = fn,
        done = false,
    }
end

function C_Timer.NewTicker(interval, fn, iterations)
    local ticker = timerObject()
    queue[#queue + 1] = {
        t = clock + interval,
        fn = fn,
        interval = interval,
        iterations = iterations,
        ticker = ticker,
        done = false,
    }
    return ticker
end

local function flush(seconds)
    local limit = clock + (seconds or 6)
    local guard = 0
    while guard < 1000 do
        guard = guard + 1
        local nextT = nil
        for i = 1, #queue do
            local item = queue[i]
            local cancelled = item.ticker and item.ticker.cancelled
            if not item.done and not cancelled and item.t <= limit then
                if not nextT or item.t < nextT then
                    nextT = item.t
                end
            end
        end
        if not nextT then
            break
        end
        clock = nextT
        local due = {}
        for i = 1, #queue do
            local item = queue[i]
            local cancelled = item.ticker and item.ticker.cancelled
            if not item.done and not cancelled and item.t == nextT then
                due[#due + 1] = item
            end
        end
        for i = 1, #due do
            local item = due[i]
            if item.interval then
                item.t = clock + item.interval
            else
                item.done = true
            end
            if item.iterations then
                item.iterations = item.iterations - 1
                if item.iterations <= 0 then
                    item.done = true
                end
            end
            local ok, err = pcall(item.fn, item.ticker)
            if not ok then
                print("timer error: " .. tostring(err))
            end
        end
    end
end

C_EventUtils = {}
function C_EventUtils.IsEventValid()
    return true
end

function issecretvalue()
    return false
end

WOW_PROJECT_ID = 18

function GetBuildInfo()
    return "1.60.1", "71037", "Nov 21 2026", 16001
end

local P = {
    name = "Zugrok",
    surname = "Grimfang",
    level = 5,
    xp = 120,
    xpMax = 400,
    money = 5000,
    zone = "The Barrens",
    subzone = "The Crossroads",
    map = 1413,
    x = 0.5162,
    y = 0.3090,
    dead = false,
    ghost = false,
    health = 80,
    healthMax = 100,
}

local MOB_GUID = "Creature-0-1-2-3-448-99"
local units = {
    target = {
        name = "Plainstrider",
        guid = MOB_GUID,
        level = 7,
        class = "normal",
        player = false,
        dead = false,
        combat = true,
        attack = true,
    },
    nameplate1 = {
        name = "Plainstrider",
        guid = MOB_GUID,
        level = 7,
        class = "normal",
        player = false,
        dead = false,
        combat = true,
        attack = true,
    },
}

local function unitRow(unit)
    return units[unit]
end

function UnitName(unit)
    if unit == "player" then
        return P.name, P.surname
    end
    local row = unitRow(unit)
    if row then
        return row.name
    end
    return nil
end

function GetRealmName()
    return ""
end

function UnitClass()
    return "Warrior", "WARRIOR"
end

function UnitRace()
    return "Orc", "Orc"
end

function UnitFactionGroup()
    return "Horde", "Horde"
end

function UnitLevel(unit)
    local row = unitRow(unit)
    if row then
        return row.level
    end
    return P.level
end

function UnitXP()
    return P.xp
end

function UnitXPMax()
    return P.xpMax
end

function GetMoney()
    return P.money
end

P.rested = nil
function GetXPExhaustion()
    return P.rested
end

function GetRestState()
    return 1, "Normal", 1
end

function GetZoneText()
    return P.zone
end

function GetSubZoneText()
    return P.subzone
end

function UnitPosition()
    return 100, 200, 0, 1
end

-- /played follows the mock clock (which starts at 1000), so a later answer
-- (level up, logout) is a different number from the first one.
local CLOCK0 = 1000
function RequestTimePlayed()
    local elapsed = math.floor(clock - CLOCK0)
    fire("TIME_PLAYED_MSG", 1000 + elapsed, 100 + elapsed)
end

function UnitOnTaxi()
    return false
end

function UnitIsDead(unit)
    if unit == "player" then
        return P.dead
    end
    local row = unitRow(unit)
    return row and row.dead or false
end

function UnitIsGhost(unit)
    if unit == "player" then
        return P.ghost
    end
    return false
end

function UnitHealth(unit)
    if unit == "player" then
        return P.health
    end
    local row = unitRow(unit)
    if row and row.dead then
        return 0
    end
    return 40
end

function UnitHealthMax(unit)
    if unit == "player" then
        return P.healthMax
    end
    return 40
end

function UnitAffectingCombat(unit)
    local row = unitRow(unit)
    if row then
        return row.combat and true or false
    end
    return false
end

function UnitCanAttack(_, unit)
    local row = unitRow(unit)
    if row then
        return row.attack and true or false
    end
    return false
end

function UnitIsPlayer(unit)
    if unit == "player" then
        return true
    end
    local row = unitRow(unit)
    if row then
        return row.player and true or false
    end
    return false
end

function UnitGUID(unit)
    if unit == "player" then
        return "Player-2-0A1B2C3D"
    end
    local row = unitRow(unit)
    if row then
        return row.guid
    end
    return nil
end

function UnitClassification(unit)
    local row = unitRow(unit)
    if row then
        return row.class
    end
    return "normal"
end

C_Map = {}
function C_Map.GetBestMapForUnit()
    return P.map
end

function C_Map.GetPlayerMapPosition()
    local pos = { x = P.x, y = P.y }
    function pos:GetXY()
        return self.x, self.y
    end
    return pos
end

C_QuestLog = {}
function C_QuestLog.GetTitleForQuestID(questId)
    if questId == 876 then
        return "Serena Bloodfeather"
    end
    return nil
end
function C_QuestLog.GetLogIndexForQuestID()
    return nil
end
function C_QuestLog.GetInfo()
    return nil
end
-- questObjectives[id] = { names = false|true, rows = { {name, need, kind} } }
-- While names is false the text comes back blank the way the client sends it
-- before the creature/item name has loaded ("0/10   slain", "0/15  ").
local questObjectives = {}
function C_QuestLog.GetQuestObjectives(questId)
    local q = questObjectives[questId]
    if not q then
        return {}
    end
    local out = {}
    for i, row in ipairs(q.rows) do
        local text
        if q.names then
            text = "0/" .. row.need .. " " .. row.name .. (row.kind == "monster" and " slain" or "")
        else
            text = "0/" .. row.need .. "  " .. (row.kind == "monster" and " slain" or "")
        end
        out[i] = { text = text, type = row.kind, finished = false, numFulfilled = 0, numRequired = row.need }
    end
    return out
end
local flaggedCompleted = {}
function C_QuestLog.IsQuestFlaggedCompleted(questId)
    return flaggedCompleted[questId] == true
end
function C_QuestLog.GetNumQuestLogEntries()
    return 0, 0
end
function C_QuestLog.ReadyForTurnIn()
    return false
end
function C_QuestLog.GetAllCompletedQuestIDs()
    return {}
end
function C_QuestLog.RequestLoadQuestByID()
end
function C_QuestLog.IsComplete()
    return false
end
function C_QuestLog.IsFailed()
    return false
end

C_SkillInfo = {}
function C_SkillInfo.GetNumSkillLines()
    return 0
end
function C_SkillInfo.GetSkillLineInfo()
    return nil
end

C_Item = {}
function C_Item.GetItemInfo(itemId)
    if itemId == 2589 then
        return "Linen Cloth", "item:2589:", 1
    end
    return nil
end

local lootNum = 0
function GetNumLootItems()
    return lootNum
end

function GetLootSlotInfo()
    return "Interface\\Icons\\INV_Fabric_Linen_01", "Linen Cloth", 1, 0, 1
end

function GetLootSlotLink()
    return "item:2589:"
end

local lootSource = MOB_GUID
function GetLootSourceInfo()
    return lootSource, 1
end

C_DamageMeter = {}
function C_DamageMeter.GetCombatSessionFromType()
    return 15
end
function C_DamageMeter.GetSessionDurationSeconds()
    return 3
end

C_DeathRecap = {}
function C_DeathRecap.HasRecapEvents()
    return false
end
function C_DeathRecap.GetRecapMaxHealth()
    return P.healthMax
end

C_CombatLog = {}
function C_CombatLog.IsCombatLogRestricted()
    return true
end

C_TaxiMap = {}
function C_TaxiMap.GetAllTaxiNodes()
    return {}
end
function C_TaxiMap.GetTaxiMapID()
    return P.map
end

function ChatFrame_AddMessageEventFilter()
end

-- 1.2.0 mocks: quest dialogs, rewards, trainer, group, soft interact.
function hooksecurefunc(name, fn)
    local orig = _G[name]
    _G[name] = function(...)
        local out = { orig(...) }
        fn(...)
        return unpack(out)
    end
end

local dialog = { questId = 0, choices = {}, rewards = {}, money = 0, xp = 0 }
function GetQuestID()
    return dialog.questId
end
function GetNumQuestChoices()
    return #dialog.choices
end
function GetNumQuestRewards()
    return #dialog.rewards
end
function GetQuestItemInfo(kind, i)
    local row = (kind == "choice" and dialog.choices or dialog.rewards)[i]
    if not row then
        return nil
    end
    return row.name, 134400, row.count, row.quality, true, row.itemId
end
function GetQuestItemLink(kind, i)
    local row = (kind == "choice" and dialog.choices or dialog.rewards)[i]
    if not row then
        return nil
    end
    return "|Hitem:" .. row.itemId .. "::::|h[" .. row.name .. "]|h"
end
function GetRewardMoney()
    return dialog.money
end
function GetRewardXP()
    return dialog.xp
end
function GetQuestReward()
end

local trainerServices = {
    { name = "Cooking", kind = "available", subText = "Apprentice", cost = 100, skillLine = "Cooking" },
}
C_Trainer = {}
function C_Trainer.GetTrainerType()
    return 2
end
function GetNumTrainerServices()
    return #trainerServices
end
function GetTrainerServiceInfo(i)
    local s = trainerServices[i]
    return s.name, s.kind, 136243, 5, s.subText, ""
end
function GetTrainerServiceCost(i)
    return trainerServices[i].cost, true
end
function GetTrainerServiceSkillLine(i)
    return trainerServices[i].skillLine
end
function BuyTrainerService()
end

local group = { inGroup = false, size = 0 }
function IsInGroup()
    return group.inGroup
end
function GetNumGroupMembers()
    return group.size
end
function UnitIsTapDenied()
    return false
end

P.afk = false
function UnitIsAFK()
    return P.afk
end

DEFAULT_CHAT_FRAME = {
    AddMessage = function() end,
}

SlashCmdList = SlashCmdList or {}

-- ---------------------------------------------------------------------------
-- Load addon
-- ---------------------------------------------------------------------------

local files = {
    "AdventureLog.lua",
    "Movement.lua",
    "Combat.lua",
    "Loot.lua",
    "Summary.lua",
    "Probe.lua",
}

local loadOk = true
local loadErr = nil
for i = 1, #files do
    local path = ADDON .. "\\" .. files[i]
    local chunk, err = loadfile(path)
    if not chunk then
        loadOk = false
        loadErr = tostring(err)
        break
    end
    local ok, runErr = pcall(chunk, "AdventureLog")
    if not ok then
        loadOk = false
        loadErr = files[i] .. ": " .. tostring(runErr)
        break
    end
end
report(loadOk, "load addon", loadErr)
if not loadOk then
    os.exit(1)
end

-- Loot and money messages about other players must not keep their text (it names them).
-- English client strings; the addon builds its patterns from these globals on first use.
LOOT_ITEM_SELF = "You receive loot: %s."
LOOT_ITEM_SELF_MULTIPLE = "You receive loot: %sx%d."
LOOT_ITEM_PUSHED_SELF = "You receive item: %s."
LOOT_ROLL_YOU_WON = "You won: %s"
YOU_LOOT_MONEY = "You loot %s"
LOOT_MONEY_SPLIT = "Your share of the loot is %s."
do
    local link = "|cffffffff|Hitem:4865::::::::5:::::::|h[Ruined Pelt]|h|r"
    local isSelf = AdventureLog.isSelfLootMessage
    local cases = {
        { "You receive loot: " .. link .. ".", true },
        { "You receive loot: " .. link .. "x3.", true },
        { "You won: " .. link, true },
        { "Your share of the loot is 12 Copper.", true },
        { "You loot 5 Copper", true },
        { "Thrall receives loot: " .. link .. ".", false },
        { "Thrall won: " .. link, false },
        { "Need Roll - 87 for " .. link .. " by Thrall", false },
        { "Thrall loots 5 Copper.", false },
    }
    local ok, bad = true, nil
    for _, c in ipairs(cases) do
        if isSelf(c[1]) ~= c[2] then
            ok, bad = false, c[1]
            break
        end
    end
    report(ok, "loot chat keeps only the player's own messages", bad)
end

-- ---------------------------------------------------------------------------
-- Session
-- ---------------------------------------------------------------------------

fire("PLAYER_LOGIN")
fire("PLAYER_ENTERING_WORLD")
flush(6)

fire("QUEST_ACCEPTED", 876)
flush(1)

fire("PLAYER_REGEN_DISABLED")
fire("NAME_PLATE_UNIT_ADDED", "nameplate1")
units.nameplate1.dead = true
units.target.dead = true
fire("UNIT_HEALTH", "nameplate1")

lootNum = 1
fire("LOOT_OPENED", false, false)
fire("PLAYER_REGEN_ENABLED")

P.x = 0.5362
flush(5)
flush(5)
P.x = 0.5162
P.y = 0.3090

clock = clock + 2
fire("PLAYER_DEAD")
clock = clock + 2
fire("PLAYER_ALIVE")
clock = clock + 2
fire("PLAYER_DEAD")

fire("QUEST_TURNED_IN", 876, 250, 100)

P.xp = 250
fire("PLAYER_XP_UPDATE", "player")
fire("CHAT_MSG_LOOT", "You receive loot: |cffffffff|Hitem:4865::::::::5:::::::|h[Ruined Pelt]|h|r.")
fire("CHAT_MSG_LOOT", "Grommash receives loot: |cffffffff|Hitem:4865::::::::5:::::::|h[Ruined Pelt]|h|r.")
flush(1)

-- ---------------------------------------------------------------------------
-- 1.2.0 scenario. Each block feeds one numbered fix; checks come after logout.
-- ---------------------------------------------------------------------------

local function advance(sec)
    clock = clock + sec
end

-- 7 + 6: accept from an NPC; objective names load a few seconds later.
units.npc = { name = "Ilthalaine", guid = "Creature-0-1-2-3-2079-77", player = false }
dialog.questId = 92517
questObjectives[92517] = { names = false, rows = { { name = "Highlands Bandit", need = 10, kind = "monster" } } }
fire("QUEST_DETAIL", 0)
advance(1)
fire("QUEST_ACCEPTED", 92517)
fire("QUEST_FINISHED")
flush(2)
questObjectives[92517].names = true
flush(4)

-- 8: reward dialog with two choices; the player picks the second.
dialog.questId = 92517
dialog.choices = {
    { name = "Bandit Gloves", itemId = 60001, count = 1, quality = 2 },
    { name = "Bandit Staff", itemId = 60002, count = 1, quality = 2 },
}
dialog.rewards = { { name = "Healing Potion", itemId = 929, count = 2, quality = 1 } }
dialog.money = 175
dialog.xp = 480
fire("QUEST_COMPLETE")
advance(2)
GetQuestReward(2)
fire("QUEST_TURNED_IN", 92517, 480, 175)
P.xp = P.xp + 480
fire("PLAYER_XP_UPDATE", "player")
fire("QUEST_FINISHED")
units.npc = nil
dialog.questId = 0
dialog.choices = {}
dialog.rewards = {}
flush(2)

-- 2 + 5: item quest: QUEST_REMOVED and the XP arrive before QUEST_TURNED_IN.
fire("QUEST_REMOVED", 92553, false)
P.xp = P.xp + 410
fire("PLAYER_XP_UPDATE", "player")
advance(0.05)
fire("QUEST_TURNED_IN", 92553, 410, 65)
flaggedCompleted[92553] = true
flush(3)
-- A real abandon.
fire("QUEST_REMOVED", 93000, false)
flush(3)

-- 5 + 11: in-fight kill with rested bonus, then a party member's kill while grouped.
units.target = { name = "Plainstrider", guid = "Creature-0-1-2-3-448-100", level = 7, class = "normal",
    player = false, dead = false, combat = true, attack = true }
P.rested = 200
fire("PLAYER_XP_UPDATE", "player")
flush(2)
fire("PLAYER_REGEN_DISABLED")
advance(9)
fire("CHAT_MSG_COMBAT_XP_GAIN", "Plainstrider dies, you gain 98 experience. (+49 exp Rested bonus)")
P.xp = P.xp + 98
P.rested = 151
fire("PLAYER_XP_UPDATE", "player")
fire("PLAYER_REGEN_ENABLED")
flush(3)
group.inGroup = true
group.size = 2
fire("GROUP_ROSTER_UPDATE")
fire("CHAT_MSG_COMBAT_XP_GAIN", "Highlands Bandit dies, you gain 47 experience. (+5 group bonus)")
P.xp = P.xp + 47
fire("PLAYER_XP_UPDATE", "player")
flush(3)
group.inGroup = false
group.size = 0

-- 5: exploration XP (system message after the XP update).
P.xp = P.xp + 25
fire("PLAYER_XP_UPDATE", "player")
fire("CHAT_MSG_SYSTEM", "Discovered Thendal Grove: 25 experience gained")
flush(2)

-- 10: object pickup by loot, a searched wardrobe by spell, a note by gossip.
fire("LOOT_CLOSED") -- the first scripted loot window was never closed
lootSource = "GameObject-0-1-2-3-617839-5"
lootNum = 1
fire("LOOT_OPENED", true, false)
fire("LOOT_CLOSED")
lootSource = MOB_GUID
lootNum = 0
advance(4)
units.softinteract = { name = "Old Wardrobe", guid = "GameObject-0-1-2-3-500001-9", player = false }
fire("PLAYER_SOFT_INTERACT_CHANGED", "", "GameObject-0-1-2-3-500001-9")
fire("UNIT_SPELLCAST_SENT", "player", "Old Wardrobe", "Cast-1", 6478)
advance(2)
fire("UNIT_SPELLCAST_SUCCEEDED", "player", "Cast-1", 6478)
units.npc = { name = "Torn Note", guid = "GameObject-0-1-2-3-500002-1", player = false }
fire("GOSSIP_SHOW")
fire("GOSSIP_CLOSED")
units.npc = nil
flush(2)

-- 9: profession trainer, one purchase.
units.npc = { name = "Fenn Fairweather", guid = "Creature-0-1-2-3-3399-2", player = false }
fire("TRAINER_SHOW")
BuyTrainerService(1)
P.money = P.money - 100
fire("TRAINER_CLOSED")
units.npc = nil
flush(2)

-- 4: level up.
P.level = 6
P.xp = 10
P.xpMax = 900
fire("PLAYER_LEVEL_UP", 6)

-- 1: go idle, then /afk, then log out while still away.
flush(240)
P.afk = true
fire("PLAYER_FLAGS_CHANGED", "player")
flush(600)
fire("PLAYER_LOGOUT")

local db = AdventureLogDB
local sessionOk = type(db) == "table" and type(db.sessions) == "table" and type(db.sessions[1]) == "table"
report(sessionOk, "session recorded", sessionOk and db.sessions[1].id or "no session")
if not sessionOk then
    os.exit(1)
end

do
    local all = table.concat(db.sessions[1].events, "\n")
    local kept = string.find(all, "You receive loot", 1, true) ~= nil
    local leaked = string.find(all, "Grommash", 1, true) ~= nil
    local marked = string.find(all, "textOther", 1, true) ~= nil
    report(kept and marked and not leaked, "other players' names not stored",
        "kept " .. tostring(kept) .. ", marked " .. tostring(marked) .. ", leaked " .. tostring(leaked))
end

-- ---------------------------------------------------------------------------
-- 1.2.0 checks on decoded events
-- ---------------------------------------------------------------------------

local function decodeJson(s)
    local i = 1
    local value
    local function ws()
        i = string.find(s, "[^ \t\r\n]", i) or (#s + 1)
    end
    local function str()
        i = i + 1
        local out = {}
        while true do
            local c = string.sub(s, i, i)
            if c == '"' then
                i = i + 1
                return table.concat(out)
            elseif c == "\\" then
                local n = string.sub(s, i + 1, i + 1)
                local map = { n = "\n", r = "\r", t = "\t", b = "\b", f = "\f" }
                if n == "u" then
                    out[#out + 1] = string.char(tonumber(string.sub(s, i + 2, i + 5), 16) % 256)
                    i = i + 6
                else
                    out[#out + 1] = map[n] or n
                    i = i + 2
                end
            else
                out[#out + 1] = c
                i = i + 1
            end
        end
    end
    value = function()
        ws()
        local c = string.sub(s, i, i)
        if c == "{" then
            local t = {}
            i = i + 1
            ws()
            if string.sub(s, i, i) == "}" then
                i = i + 1
                return t
            end
            while true do
                ws()
                local k = str()
                ws()
                i = i + 1 -- :
                t[k] = value()
                ws()
                local d = string.sub(s, i, i)
                i = i + 1
                if d == "}" then
                    return t
                end
            end
        elseif c == "[" then
            local t = {}
            i = i + 1
            ws()
            if string.sub(s, i, i) == "]" then
                i = i + 1
                return t
            end
            while true do
                t[#t + 1] = value()
                ws()
                local d = string.sub(s, i, i)
                i = i + 1
                if d == "]" then
                    return t
                end
            end
        elseif c == '"' then
            return str()
        elseif string.sub(s, i, i + 3) == "true" then
            i = i + 4
            return true
        elseif string.sub(s, i, i + 4) == "false" then
            i = i + 5
            return false
        elseif string.sub(s, i, i + 3) == "null" then
            i = i + 4
            return nil
        end
        local num = string.match(s, "^-?[%d%.eE%+%-]+", i)
        i = i + #num
        return tonumber(num)
    end
    return value()
end

local events = {}
for _, line in ipairs(db.sessions[1].events) do
    events[#events + 1] = decodeJson(line)
end

local function find(e, match)
    local out = {}
    for _, ev in ipairs(events) do
        if ev.e == e then
            local ok = true
            for k, v in pairs(match or {}) do
                if ev[k] ~= v then
                    ok = false
                    break
                end
            end
            if ok then
                out[#out + 1] = ev
            end
        end
    end
    return out
end

local function show(ev)
    if not ev then
        return "missing"
    end
    return AdventureLog.encode(ev)
end

-- 1: AFK/idle open at logout is closed and counted; summary active excludes it.
do
    local idleEnd = find("idle_end", { closedBy = "logout" })[1]
    local afkEnd = find("afk_end", { closedBy = "logout" })[1]
    local summary = decodeJson(db.sessions[1].summary)
    local totals = summary.totals or {}
    local away = (idleEnd and idleEnd.credited or 0) + (afkEnd and afkEnd.credited or 0)
    local ok = idleEnd ~= nil and afkEnd ~= nil and away > 600
        and type(totals.sessionActive) == "number" and type(totals.sessionPlayed) == "number"
        and math.abs((totals.sessionPlayed - totals.sessionActive) - away) < 1
        and type(totals.awaySec) == "number" and math.abs(totals.awaySec - away) < 1
    report(ok, "1 idle/AFK open at logout is excluded from sessionActive",
        "away " .. tostring(away) .. ", played " .. tostring(totals.sessionPlayed) .. ", active " .. tostring(totals.sessionActive))
    local zoneOk = false
    for _, row in pairs(summary.zones or {}) do
        if row.idleSec and row.idleSec > 600 and math.abs(row.sec - row.activeSec - row.idleSec) < 0.01 then
            zoneOk = true
        end
    end
    report(zoneOk, "1 zone idleSec holds the away time, activeSec does not", AdventureLog.encode(summary.zones))
    local levelOk = false
    for _, row in ipairs(summary.levels or {}) do
        if row.level == 5 then
            levelOk = true
        end
    end
    report(levelOk, "4 summary level row is the level you left", AdventureLog.encode(summary.levels))
end

-- 2: no abandon for a quest removed just before its turn-in; a real abandon stays.
do
    local fake = find("quest_abandon", { questId = 92553 })
    local real = find("quest_abandon", { questId = 93000 })
    report(#fake == 0 and #real == 1, "2 turn-in after QUEST_REMOVED is not an abandon",
        "false " .. #fake .. ", real " .. #real)
end

-- 3: header playedAnchor is the anchor the event pt values use.
do
    local header = decodeJson(db.sessions[1].header)
    local ok, detail = false, show(header)
    local first = nil
    for _, ev in ipairs(events) do
        if type(ev.pt) == "number" and type(ev.t) == "number" then
            first = ev
            break
        end
    end
    if first and type(header.playedAnchor) == "number" and type(header.playedAnchorT) == "number" then
        local expect = header.playedAnchor + (first.t - header.playedAnchorT)
        ok = math.abs(first.pt - expect) < 0.01 and header.playedAnchorLast ~= nil and header.playedAnchorLast ~= header.playedAnchor
        detail = "anchor " .. header.playedAnchor .. ", first pt " .. first.pt .. ", expected " .. expect .. ", last " .. tostring(header.playedAnchorLast)
    end
    report(ok, "3 header playedAnchor matches event pt", detail)
    local played = find("played")
    report(#played >= 1 and type(played[1].drift) == "number" and math.abs(played[1].drift) < 1,
        "3 later /played answers are logged with drift", show(played[1]))
end

-- 4: level_up has from/to and keeps level.
do
    local ev = find("level_up")[1]
    report(ev ~= nil and ev.from == 5 and ev.to == 6 and ev.level ~= nil, "4 level_up from/to", show(ev))
end

-- 5: xp source attribution.
do
    local kill = find("xp", { source = "kill", npcId = 448 })[1]
    report(kill ~= nil and kill.restedBonus == 49 and kill.restedUsed == 49, "5 kill xp has npcId and rested bonus", show(kill))
    local quest = find("xp", { source = "quest", questId = 92517 })[1]
    report(quest ~= nil, "5 quest xp after turn-in", show(quest))
    local early = find("xp", { source = "quest", questId = 92553 })[1]
    report(early ~= nil and type(early.raw) == "table" and early.raw[1] == "PLAYER_XP_UPDATE",
        "5 quest xp that arrived before the turn-in", show(early))
    local explore = find("xp", { source = "explore" })[1]
    report(explore ~= nil and explore.area == "Thendal Grove", "5 exploration xp", show(explore))
    local group = find("xp", { source = "kill", groupBonus = 5 })[1]
    report(group ~= nil, "5 group-bonus kill xp", show(group))
end

-- 6: blank objective names are logged again once loaded.
do
    local pending = find("quest_progress", { questId = 92517, namesPending = true })[1]
    local resolved = find("quest_progress", { questId = 92517, namesResolved = true })[1]
    local text = resolved and resolved.objectives and resolved.objectives[1] and resolved.objectives[1].text
    report(pending ~= nil and text == "0/10 Highlands Bandit slain", "6 quest_progress re-emitted when names resolve", show(resolved))
end

-- 7: quest giver on accept, ender on turn-in.
do
    local ev = find("quest_accept", { questId = 92517 })[1]
    report(ev ~= nil and ev.giverNpcId == 2079 and ev.giverName == "Ilthalaine" and ev.giverType == "Creature"
        and type(ev.giverX) == "number" and ev.giverFrame == "detail", "7 quest_accept giver", show(ev))
    local early = find("quest_accept", { questId = 876 })[1]
    report(early ~= nil and early.giverErr ~= nil, "7 accept without a dialog says why", show(early))
end

-- 8: rewards on turn-in.
do
    local ev = find("quest_turnin", { questId = 92517 })[1]
    local ok = ev ~= nil and type(ev.rewardChoices) == "table" and #ev.rewardChoices == 2
        and ev.chosenIndex == 2 and ev.chosenItemId == 60002 and ev.chosenName == "Bandit Staff"
        and ev.rewardMoney == 175 and ev.moneyReward == 175 and type(ev.rewardItems) == "table"
        and ev.enderNpcId == 2079
    report(ok, "8 quest_turnin reward choices and chosen item", show(ev))
end

-- 9: trainer purchase.
do
    local learn = find("trainer_learn")[1]
    local close = find("trainer_close")[1]
    local show1 = find("trainer", { npcId = 3399 })[1]
    report(learn ~= nil and learn.name == "Cooking" and learn.cost == 100 and learn.subText == "Apprentice"
        and learn.reagentsErr ~= nil and close ~= nil and close.spent == 100 and close.count == 1
        and show1 ~= nil and show1.trainerType == "tradeskills", "9 trainer learn and cost", show(learn) .. " / " .. show(close))
end

-- 10: object use.
do
    local loot = find("object_use", { via = "loot", objectId = 617839 })[1]
    local spell = find("object_use", { via = "spell", objectId = 500001, name = "Old Wardrobe" })[1]
    local note = find("object_use", { via = "gossip", objectId = 500002, name = "Torn Note" })[1]
    report(loot ~= nil and type(loot.x) == "number", "10 object_use from GameObject loot", show(loot))
    report(spell ~= nil, "10 object_use from a cast on the soft-interact object", show(spell))
    report(note ~= nil, "10 object_use from an object dialog", show(note))
    local slot = nil
    for _, ev in ipairs(find("loot")) do
        if ev.slots and ev.slots[1] and ev.slots[1].sourceType == "GameObject" then
            slot = ev.slots[1]
        end
    end
    report(slot ~= nil and slot.objectId == 617839 and slot.npcId == 617839, "10 loot slot marks a GameObject source", show(slot))
end

-- 11: group credit on kills.
do
    local party = find("mob_kill", { name = "Highlands Bandit" })[1]
    report(party ~= nil and party.grouped == true and party.groupSize == 2 and party.inFight == false
        and party.groupCredit == true and party.groupBonus == 5 and party.via == "xp_chat", "11 party kill flagged as group credit", show(party))
    local own = find("mob_kill", { name = "Plainstrider", via = "xp_chat" })[1]
    report(own ~= nil and own.inFight == true and own.tracked == true and own.groupCredit == nil and own.grouped == false,
        "11 own kill in a fight", show(own))
    local plate = find("mob_kill", { via = "unit_dead" })[1]
    report(plate ~= nil and plate.killSecShort == true and plate.tracked == true, "11 kill seen only as it died is marked killSecShort", show(plate))
end

report(AdventureLog.lastHandlerErr == nil, "no event handler raised an error", tostring(AdventureLog.lastHandlerErr))

local summaryText = db.sessions[1].summary
local dangerous = type(summaryText) == "string" and string.find(summaryText, '"dangerous":true', 1, true)
report(dangerous and true or false, "summary hotspot before export", dangerous and "dangerous true" or tostring(summaryText))

-- ---------------------------------------------------------------------------
-- SavedVariables serializer (WoW ["key"] = form, JSON kept as Lua strings)
-- ---------------------------------------------------------------------------

local function luaQuote(s)
    local out = { '"' }
    for i = 1, #s do
        local c = string.sub(s, i, i)
        if c == "\\" then
            out[#out + 1] = "\\\\"
        elseif c == '"' then
            out[#out + 1] = '\\"'
        elseif c == "\n" then
            out[#out + 1] = "\\n"
        elseif c == "\r" then
            out[#out + 1] = "\\r"
        elseif c == "\t" then
            out[#out + 1] = "\\t"
        else
            out[#out + 1] = c
        end
    end
    out[#out + 1] = '"'
    return table.concat(out)
end

local function isArray(t)
    local count = 0
    local max = 0
    for k in pairs(t) do
        if type(k) ~= "number" or k < 1 or k ~= math.floor(k) then
            return false
        end
        if k > max then
            max = k
        end
        count = count + 1
    end
    if count == 0 then
        return false
    end
    return count == max
end

local function serialize(value, indent)
    local kind = type(value)
    if kind == "string" then
        return luaQuote(value)
    end
    if kind == "number" then
        return string.format("%.14g", value)
    end
    if kind == "boolean" then
        if value then
            return "true"
        end
        return "false"
    end
    if kind ~= "table" then
        return "nil"
    end
    local pad = string.rep("  ", indent)
    local inner = string.rep("  ", indent + 1)
    local lines = {}
    if isArray(value) then
        for i = 1, #value do
            lines[#lines + 1] = inner .. serialize(value[i], indent + 1) .. ","
        end
    else
        local keys = {}
        for k in pairs(value) do
            keys[#keys + 1] = k
        end
        table.sort(keys, function(a, b)
            return tostring(a) < tostring(b)
        end)
        for i = 1, #keys do
            local k = keys[i]
            local key
            if type(k) == "string" then
                key = "[" .. luaQuote(k) .. "]"
            else
                key = "[" .. tostring(k) .. "]"
            end
            lines[#lines + 1] = inner .. key .. " = " .. serialize(value[k], indent + 1) .. ","
        end
    end
    if #lines == 0 then
        return "{}"
    end
    return "{\n" .. table.concat(lines, "\n") .. "\n" .. pad .. "}"
end

local temp = os.getenv("TEMP") or "."
local root = temp .. "\\advlog-test"
local svDir = root .. "\\WTF\\Account\\TEST\\Forever\\Zugrok\\SavedVariables"
local svPath = svDir .. "\\AdventureLog.lua"
local originalPath = root .. "\\AdventureLog.original.lua"
local exportLog = root .. "\\export-1.log"
local exportLog2 = root .. "\\export-2.log"
local exportLog3 = root .. "\\export-3.log"
local exportPs = ADDON .. "\\export.ps1"

shell('powershell -NoProfile -Command "if (Test-Path -LiteralPath \'' .. root .. '\') { Remove-Item -LiteralPath \'' .. root .. '\' -Recurse -Force }; New-Item -ItemType Directory -Force -Path \'' .. svDir .. '\' | Out-Null"')
writeAll(root .. "\\Wow.exe", "")

local svText = "AdventureLogDB = " .. serialize(db, 0) .. "\n"
writeAll(svPath, svText)
writeAll(originalPath, svText)

local quotedKey = string.find(svText, '["sessions"]', 1, true) ~= nil
report(quotedKey, "SV uses quoted keys", quotedKey and "AdventureLogDB" or "missing sessions key")

-- ---------------------------------------------------------------------------
-- Export 1
-- ---------------------------------------------------------------------------

local function runExport(logPath, extra)
    local cmd = 'powershell -NoProfile -ExecutionPolicy Bypass -File "' .. exportPs .. '" -WowRoot "' .. root .. '"'
    if extra then
        cmd = cmd .. " " .. extra
    end
    cmd = cmd .. ' > "' .. logPath .. '" 2>&1'
    return shell(cmd)
end

local code1 = runExport(exportLog, "-AllowPurgeForTest")
local log1 = readAll(exportLog) or ""
report(code1 == 0, "export exit 0", "code " .. tostring(code1) .. " " .. log1)

local function findFiles(patternDir, filter)
    local cmd = 'powershell -NoProfile -Command "Get-ChildItem -LiteralPath \'' .. patternDir .. '\' -Recurse -Filter \'' .. filter .. '\' -File | ForEach-Object { $_.FullName }"'
    local p = io.popen(cmd)
    local list = {}
    if p then
        for line in p:lines() do
            if line ~= "" then
                list[#list + 1] = line
            end
        end
        p:close()
    end
    return list
end

local adventures = root .. "\\Adventures"
local jsonlFiles = findFiles(adventures, "*.jsonl")
local summaryFiles = findFiles(adventures, "*.summary.json")
local zipFiles = findFiles(adventures, "*.zip")
local rawFiles = findFiles(adventures .. "\\Zugrok Grimfang - adventure\\raw", "*.lua")
if #rawFiles == 0 then
    rawFiles = findFiles(adventures, "*-AdventureLog.lua")
end

report(#jsonlFiles == 1, "sessions jsonl exists", "count " .. tostring(#jsonlFiles))
report(#zipFiles >= 1, "zip exists", "count " .. tostring(#zipFiles))
report(#rawFiles >= 1, "raw backup exists", "count " .. tostring(#rawFiles))

local jsonlPath = jsonlFiles[1]
local summaryPath = summaryFiles[1]
local lineCount = 0
if jsonlPath then
    for _ in io.lines(jsonlPath) do
        lineCount = lineCount + 1
    end
end

local checkPs = root .. "\\check-json.ps1"
writeAll(checkPs, [==[
param([string]$Jsonl, [string]$Summary)
$ErrorActionPreference = 'Stop'
$needed = @{
    quest_accept = $false
    fight_start = $false
    mob_kill = $false
    loot = $false
    breadcrumb = $false
    death = $false
    quest_turnin = $false
    xp = $false
    level_up = $false
    session_end = $false
}
$skipMap = @{ session_start = $true; session_end = $true; probe = $true }
$RawJson = ''
function Test-Nulls($obj, $path) {
    if ($null -eq $obj) { return }
    if ($obj -is [System.Array]) {
        $i = 0
        foreach ($item in $obj) {
            Test-Nulls $item ($path + '[' + $i + ']')
            $i++
        }
        return
    }
    if ($obj -isnot [pscustomobject]) { return }
    $names = @($obj.PSObject.Properties.Name)
    foreach ($n in $names) {
        $v = $obj.$n
        if ($null -eq $v) {
            # Windows PowerShell 5.1 ConvertFrom-Json turns {} into $null.
            # Only a literal JSON null counts.
            $literal = $false
            if ($RawJson -match ('"' + [regex]::Escape($n) + '"\s*:\s*null')) { $literal = $true }
            if ($literal) {
                $has = ($names -contains ($n + 'Err')) -or ($names -contains ($n + 'Secret'))
                if (-not $has) { throw ("JSON null without Err or Secret sibling: " + $path + '.' + $n) }
            }
        } else {
            Test-Nulls $v ($path + '.' + $n)
        }
    }
}
$lines = @(Get-Content -LiteralPath $Jsonl)
if ($lines.Count -lt 1) { throw 'jsonl is empty' }
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $script:RawJson = $line
    $obj = $line | ConvertFrom-Json
    if ($null -eq $obj) { throw 'event parsed as null' }
    Test-Nulls $obj '$'
    $e = [string]$obj.e
    if ([string]::IsNullOrWhiteSpace($e)) { throw 'event missing e' }
    $hasTs = $null -ne $obj.PSObject.Properties['ts'] -and $null -ne $obj.ts
    $hasTsErr = $null -ne $obj.PSObject.Properties['tsErr'] -and $null -ne $obj.tsErr
    if (-not $hasTs -and -not $hasTsErr) { throw ("event " + $e + " missing ts") }
    if ($needed.ContainsKey($e)) { $needed[$e] = $true }
    if (-not $skipMap.ContainsKey($e)) {
        $hasMap = $null -ne $obj.PSObject.Properties['map'] -and $null -ne $obj.map
        $hasMapErr = $null -ne $obj.PSObject.Properties['mapErr'] -and $null -ne $obj.mapErr
        if (-not $hasMap -and -not $hasMapErr) { throw ("event " + $e + " missing map") }
    }
}
foreach ($k in @($needed.Keys)) {
    if (-not $needed[$k]) { throw ("missing scripted event " + $k) }
}
$script:RawJson = Get-Content -LiteralPath $Summary -Raw
$sum = $script:RawJson | ConvertFrom-Json
Test-Nulls $sum 'summary'
$hot = @($sum.hotspots)
$okHot = $false
foreach ($h in $hot) {
    if ($h.dangerous -eq $true -and $h.deaths -ge 2) { $okHot = $true }
}
if (-not $okHot) { throw 'summary hotspot missing dangerous true' }
Write-Output 'JSON_OK'
]==])

local jsonCheckLog = root .. "\\json-check.log"
local jsonCode = 1
local jsonLog = ""
if jsonlPath and summaryPath then
    local cmd = 'powershell -NoProfile -ExecutionPolicy Bypass -File "' .. checkPs .. '" -Jsonl "' .. jsonlPath .. '" -Summary "' .. summaryPath .. '" > "' .. jsonCheckLog .. '" 2>&1'
    jsonCode = shell(cmd)
    jsonLog = readAll(jsonCheckLog) or ""
end
report(jsonCode == 0 and string.find(jsonLog, "JSON_OK", 1, true) ~= nil, "jsonl and summary parse", jsonLog)

local purged = readAll(svPath) or ""
local purgedOk = string.find(purged, '["sessions"] = {', 1, true) ~= nil
    and string.find(purged, "quest_accept", 1, true) == nil
    and string.find(purged, "session_start", 1, true) == nil
report(purgedOk, "SV purged sessions empty", purgedOk and "sessions cleared" or purged)

-- ---------------------------------------------------------------------------
-- Export 2: no duplicate jsonl, empty purge keeps the adventure folder
-- ---------------------------------------------------------------------------

local code2 = runExport(exportLog2, nil)
local log2 = readAll(exportLog2) or ""
report(code2 == 0, "second export exit 0", "code " .. tostring(code2) .. " " .. log2)

local lineCount2 = 0
if jsonlPath then
    for _ in io.lines(jsonlPath) do
        lineCount2 = lineCount2 + 1
    end
end
report(jsonlPath ~= nil and lineCount2 == lineCount and lineCount > 0, "jsonl not duplicated", tostring(lineCount) .. " -> " .. tostring(lineCount2))

local folder = adventures .. "\\Zugrok Grimfang - adventure"
local folderStill = readAll(folder .. "\\character.json") ~= nil
report(folderStill, "empty purge keeps adventure folder", folderStill and folder or "missing")

-- ---------------------------------------------------------------------------
-- Export 3: WoW running must not empty the SV
-- ---------------------------------------------------------------------------

writeAll(svPath, svText)
local beforeForce = readAll(svPath)
local code3 = runExport(exportLog3, "-ForceWowRunning")
local log3 = readAll(exportLog3) or ""
local afterForce = readAll(svPath)
report(code3 == 0, "ForceWowRunning exit 0", "code " .. tostring(code3) .. " " .. log3)
report(beforeForce == afterForce and string.find(afterForce or "", "quest_accept", 1, true) ~= nil, "ForceWowRunning does not empty SV", (beforeForce == afterForce) and "unchanged" or "SV changed")

print("")
print((failed == 0) and "ALL PASS" or ("FAILED " .. tostring(failed)))
os.exit(failed == 0 and 0 or 1)
