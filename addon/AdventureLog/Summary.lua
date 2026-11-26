-- Folds stamped events into an in-memory summary and writes it on logout.
-- Lua 5.1. Does not register combat log.

if AdventureLog == nil then
    return
end

local summary = {
    mobs = {},
    quests = {},
    zones = {},
    hotspots = {},
    levels = {},
    totals = {},
}

local lastKillKey = nil
local lastKillT = nil
local lastSampleT = nil
local levelPt = nil
local levelT = nil
local levelIdle = 0
local levelXp = 0

local function num(v)
    if type(v) ~= "number" then
        return nil
    end
    if v ~= v or v == math.huge or v == -math.huge then
        return nil
    end
    return v
end

local function fieldNum(event, key)
    if event[key .. "Secret"] then
        return nil
    end
    return num(event[key])
end

local function fieldString(event, key)
    if event[key .. "Secret"] then
        return nil
    end
    local v = event[key]
    if type(v) ~= "string" then
        return nil
    end
    return v
end

local function clock(event)
    return fieldNum(event, "t") or fieldNum(event, "pt")
end

local function mobRow(npcId)
    local key = "npc:" .. tostring(npcId)
    local row = summary.mobs[key]
    if not row then
        row = { kills = 0, drops = {} }
        summary.mobs[key] = row
    end
    return key, row
end

local function zoneRow(mapId, zoneName)
    local key = "map:" .. tostring(mapId)
    local row = summary.zones[key]
    if not row then
        row = { sec = 0, activeSec = 0, idleSec = 0 }
        summary.zones[key] = row
    end
    if type(zoneName) == "string" then
        row.zone = zoneName
    end
    return row
end

local firstPt = nil

-- playedTotal is lifetime /played at the last event; sessionPlayed and
-- sessionActive cover this session only.
local function notePlayed(event)
    local pt = fieldNum(event, "pt")
    if not pt then
        return
    end
    if firstPt == nil then
        firstPt = pt
    end
    summary.totals.playedTotal = pt
    summary.totals.sessionPlayed = pt - firstPt
end

-- Totals come only from PLAYER_XP_UPDATE deltas, which already include kill,
-- quest and discovery XP. Kill chat lines only attribute XP to a mob.
local function addTotalXp(amount)
    levelXp = levelXp + amount
    summary.totals.xp = (num(summary.totals.xp) or 0) + amount
end

local pendingChat = nil

local function addXp(amount, event)
    local t = fieldNum(event, "t")
    if lastKillKey and t and lastKillT and t == lastKillT then
        local row = summary.mobs[lastKillKey]
        if row then
            row.xp = (num(row.xp) or 0) + amount
            return
        end
    end
    pendingChat = { t = t, mob = fieldString(event, "mob"), amount = amount }
end

local function foldKill(event)
    summary.totals.kills = (num(summary.totals.kills) or 0) + 1
    local npcId = fieldNum(event, "npcId")
    if not npcId then
        lastKillKey = nil
        lastKillT = fieldNum(event, "t")
        return
    end
    local key, row = mobRow(npcId)
    local name = fieldString(event, "name")
    if name then
        row.name = name
    end
    row.kills = row.kills + 1
    local killSec = fieldNum(event, "killSec")
    if killSec then
        row.killTimeSum = (num(row.killTimeSum) or 0) + killSec
        row.killTimeAvg = row.killTimeSum / row.kills
    end
    lastKillKey = key
    lastKillT = fieldNum(event, "t")
    if pendingChat and pendingChat.t == lastKillT and pendingChat.mob == name then
        row.xp = (num(row.xp) or 0) + pendingChat.amount
    end
    pendingChat = nil
end

local function foldLoot(event)
    local slots = event.slots
    if type(slots) ~= "table" then
        return
    end
    local i = 1
    while slots[i] ~= nil do
        local slot = slots[i]
        if type(slot) == "table" and slot.empty ~= true and slot.sourceType ~= "GameObject" then
            local npcId = fieldNum(slot, "npcId")
            local itemId = fieldNum(slot, "itemId")
            if npcId and itemId then
                local _, row = mobRow(npcId)
                local itemKey = "item:" .. tostring(itemId)
                local drop = row.drops[itemKey]
                if not drop then
                    drop = { count = 0 }
                    row.drops[itemKey] = drop
                end
                local count = fieldNum(slot, "count")
                if not count or count < 0 then
                    count = 1
                end
                drop.count = drop.count + count
                local kills = row.kills
                if kills < 1 then
                    kills = 1
                end
                drop.rate = drop.count / kills
            end
        end
        i = i + 1
    end
end

local function foldQuest(event)
    local questId = fieldNum(event, "questId")
    if not questId then
        return
    end
    local key = "q:" .. tostring(questId)
    local row = summary.quests[key]
    if not row then
        row = {}
        summary.quests[key] = row
    end
    local title = fieldString(event, "title")
    if title then
        row.title = title
    end
    local when = clock(event)
    if event.e == "quest_accept" and when then
        row.acceptT = when
    elseif event.e == "quest_ready" and when then
        row.readyT = when
    elseif event.e == "quest_turnin" then
        summary.totals.questsTurnedIn = (num(summary.totals.questsTurnedIn) or 0) + 1
        if when then
            row.turninT = when
            local acceptT = num(row.acceptT)
            if acceptT then
                row.acceptToTurnin = when - acceptT
            end
        end
    elseif event.e == "quest_abandon" and when then
        row.abandonT = when
    end
end

-- Idle and AFK spans can overlap. While either is open, time between position
-- samples is not active. Each idle_end/afk_end carries credited, the seconds it
-- added after removing overlap, so summing credited counts away time once.
local idleOpen = false
local afkOpen = false

local function away()
    return idleOpen or afkOpen
end

local function foldPosition(event)
    local t = fieldNum(event, "t")
    local mapId = fieldNum(event, "map")
    local zoneName = fieldString(event, "zone")
    if t and lastSampleT and not away() then
        local delta = t - lastSampleT
        if delta > 0 and mapId then
            local row = zoneRow(mapId, zoneName)
            row.sec = row.sec + delta
            row.activeSec = row.activeSec + delta
        end
    end
    if t then
        lastSampleT = t
    end
end

local function foldIdle(event)
    local e = event.e
    local mapId = fieldNum(event, "map")
    local zoneName = fieldString(event, "zone")
    local t = fieldNum(event, "t")
    if e == "idle_start" or e == "afk_start" then
        -- Close the active stretch up to the moment you went away.
        if not away() and t and lastSampleT and mapId then
            local delta = t - lastSampleT
            if delta > 0 then
                local row = zoneRow(mapId, zoneName)
                row.sec = row.sec + delta
                row.activeSec = row.activeSec + delta
            end
        end
        if e == "idle_start" then
            idleOpen = true
        else
            afkOpen = true
        end
        if t then
            lastSampleT = t
        end
        return
    end
    local credited = fieldNum(event, "credited")
    if credited == nil then
        credited = fieldNum(event, "dur")
    end
    if credited and credited > 0 then
        summary.totals.awaySec = (num(summary.totals.awaySec) or 0) + credited
        levelIdle = levelIdle + credited
        if mapId then
            local row = zoneRow(mapId, zoneName)
            row.sec = row.sec + credited
            row.idleSec = row.idleSec + credited
        end
    end
    if e == "idle_end" then
        idleOpen = false
    else
        afkOpen = false
    end
    if t and not away() then
        lastSampleT = t
    end
end

local function foldDeath(event)
    summary.totals.deaths = (num(summary.totals.deaths) or 0) + 1
    local x = fieldNum(event, "x")
    local y = fieldNum(event, "y")
    local mapId = fieldNum(event, "map")
    if not x or not y or not mapId then
        return
    end
    local cellX = math.floor(x / 2)
    local cellY = math.floor(y / 2)
    local hotspots = summary.hotspots
    local i = 1
    local found = nil
    while hotspots[i] ~= nil do
        local row = hotspots[i]
        if row.map == mapId and row.cellX == cellX and row.cellY == cellY then
            found = row
            break
        end
        i = i + 1
    end
    if not found then
        found = {
            map = mapId,
            x = x,
            y = y,
            cellX = cellX,
            cellY = cellY,
            deaths = 0,
        }
        hotspots[#hotspots + 1] = found
    end
    found.x = x
    found.y = y
    found.deaths = found.deaths + 1
    found.dangerous = found.deaths >= 2
end

local function foldLevel(event)
    local pt = fieldNum(event, "pt")
    local t = fieldNum(event, "t")
    local sec = nil
    if pt and num(levelPt) then
        sec = pt - levelPt
    elseif t and num(levelT) then
        sec = t - levelT
    end
    -- from is the level you left (1.2.0+). Older events only have level, which
    -- is UnitLevel at the event (also the level you left).
    local level = fieldNum(event, "from") or fieldNum(event, "level")
    if level and sec and sec >= 0 then
        local activeSec = sec - levelIdle
        if activeSec < 0 then
            activeSec = 0
        end
        local row = {
            level = level,
            sec = sec,
            activeSec = activeSec,
            xp = levelXp,
        }
        if sec > 0 then
            row.xpPerHour = levelXp * 3600 / sec
        end
        summary.levels[#summary.levels + 1] = row
    end
    levelPt = pt
    levelT = t
    levelIdle = 0
    levelXp = 0
end

local function fold(event)
    notePlayed(event)
    local e = event.e
    if e == "mob_kill" then
        foldKill(event)
    elseif e == "xp" then
        -- gained also counts the XP that crosses a level; delta goes negative there.
        local amount = fieldNum(event, "gained") or fieldNum(event, "delta")
        if amount and amount > 0 then
            addTotalXp(amount)
        end
    elseif e == "xp_chat" and event.source == "kill" then
        local amount = fieldNum(event, "amount")
        if amount then
            addXp(amount, event)
        end
    elseif e == "loot" then
        foldLoot(event)
    elseif (e == "quest_accept" or e == "quest_ready" or e == "quest_turnin" or e == "quest_abandon") and event.baseline ~= true then
        foldQuest(event)
    elseif e == "breadcrumb" or e == "zone" then
        foldPosition(event)
    elseif e == "idle_start" or e == "idle_end" or e == "afk_start" or e == "afk_end" then
        foldIdle(event)
    elseif e == "death" then
        foldDeath(event)
    elseif e == "level_up" then
        foldLevel(event)
    end
    if levelPt == nil then
        levelPt = fieldNum(event, "pt")
    end
    if levelT == nil then
        levelT = fieldNum(event, "t")
    end
end

local function copyDrop(drop, kills)
    local out = { count = drop.count }
    if kills < 1 then
        kills = 1
    end
    out.rate = drop.count / kills
    return out
end

local function copyMob(row)
    local out = { kills = row.kills }
    if type(row.name) == "string" then
        out.name = row.name
    end
    if num(row.killTimeSum) then
        out.killTimeSum = row.killTimeSum
    end
    if num(row.killTimeAvg) then
        out.killTimeAvg = row.killTimeAvg
    end
    if num(row.xp) then
        out.xp = row.xp
    end
    local drops = {}
    local any = false
    for key, drop in pairs(row.drops) do
        if type(key) == "string" and string.sub(key, -6) ~= "Secret" and type(drop) == "table" then
            drops[key] = copyDrop(drop, row.kills)
            any = true
        end
    end
    if any then
        out.drops = drops
    end
    return out
end

local function copyQuest(row)
    local out = {}
    if type(row.title) == "string" then
        out.title = row.title
    end
    if num(row.acceptT) then
        out.acceptT = row.acceptT
    end
    if num(row.readyT) then
        out.readyT = row.readyT
    end
    if num(row.turninT) then
        out.turninT = row.turninT
    end
    if num(row.abandonT) then
        out.abandonT = row.abandonT
    end
    if num(row.acceptToTurnin) then
        out.acceptToTurnin = row.acceptToTurnin
    end
    return out
end

local function hasAny(t)
    for _ in pairs(t) do
        return true
    end
    return false
end

local function exportSummary()
    local sessionPlayed = num(summary.totals.sessionPlayed)
    local afk = num(AdventureLog.afkTotal)
    if sessionPlayed and afk then
        summary.totals.sessionActive = sessionPlayed - afk
    end
    local out = {}
    if hasAny(summary.mobs) then
        local mobs = {}
        for key, row in pairs(summary.mobs) do
            if type(key) == "string" then
                mobs[key] = copyMob(row)
            end
        end
        out.mobs = mobs
    end
    if hasAny(summary.quests) then
        local quests = {}
        for key, row in pairs(summary.quests) do
            if type(key) == "string" then
                local copied = copyQuest(row)
                if hasAny(copied) then
                    quests[key] = copied
                end
            end
        end
        if hasAny(quests) then
            out.quests = quests
        end
    end
    if hasAny(summary.zones) then
        out.zones = summary.zones
    end
    if summary.hotspots[1] ~= nil then
        out.hotspots = summary.hotspots
    end
    if summary.levels[1] ~= nil then
        out.levels = summary.levels
    end
    local totals = {}
    local totalsAny = false
    local function putTotal(key)
        if string.sub(key, -6) == "Secret" then
            return
        end
        local value = num(summary.totals[key])
        if value then
            totals[key] = value
            totalsAny = true
        end
    end
    putTotal("playedTotal")
    putTotal("sessionPlayed")
    putTotal("sessionActive")
    putTotal("awaySec")
    putTotal("kills")
    putTotal("deaths")
    putTotal("questsTurnedIn")
    putTotal("xp")
    if totalsAny then
        out.totals = totals
    end
    return out
end

function AdventureLog.flushSummary()
    if type(AdventureLogDB) ~= "table" or type(AdventureLogDB.sessions) ~= "table" then
        return
    end
    local sessions = AdventureLogDB.sessions
    local current = sessions[#sessions]
    if type(current) ~= "table" or type(AdventureLog.encode) ~= "function" then
        return
    end
    current.summary = AdventureLog.encode(exportSummary())
end

local orig = AdventureLog.record
function AdventureLog.record(event, ...)
    local stamped = orig(event, ...)
    if type(stamped) == "table" and AdventureLog.lastStored then
        fold(stamped)
    end
    return stamped
end

if type(AdventureLog.on) == "function" then
    AdventureLog.on("PLAYER_LOGOUT", function()
        AdventureLog.flushSummary()
    end)
end
