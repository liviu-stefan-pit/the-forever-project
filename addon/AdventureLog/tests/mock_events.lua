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

function GetXPExhaustion()
    return 0
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

function RequestTimePlayed()
    fire("TIME_PLAYED_MSG", 1000, 100)
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
function C_QuestLog.GetQuestObjectives()
    return {}
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

function GetLootSourceInfo()
    return MOB_GUID, 1
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

P.xp = 400
fire("PLAYER_XP_UPDATE", "player")
P.level = 6
P.xp = 10
P.xpMax = 900
fire("CHAT_MSG_LOOT", "You receive loot: |cffffffff|Hitem:4865::::::::5:::::::|h[Ruined Pelt]|h|r.")
fire("CHAT_MSG_LOOT", "Grommash receives loot: |cffffffff|Hitem:4865::::::::5:::::::|h[Ruined Pelt]|h|r.")
flush(1)
fire("PLAYER_LEVEL_UP", 6)
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
