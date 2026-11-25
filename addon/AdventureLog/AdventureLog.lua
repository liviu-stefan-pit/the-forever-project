-- AdventureLog: session skeleton. Recorders, clocks, summary, and probe are later tasks.
--
-- Lua 5.1, WoW Forever 1.60.1 (Interface 16001). No libraries.
-- Public: AdventureLog.record, encode, on, stamp, paused.

local ADDON_NAME = ...

AdventureLog = _G[ADDON_NAME] or AdventureLog or {}
_G[ADDON_NAME] = AdventureLog

local MAX_EVENTS = 100000

AdventureLog.paused = false
AdventureLog.ready = false
AdventureLog.afkTotal = 0
AdventureLog.sessionStart = nil

local session = nil
local capNotified = false
local frame = CreateFrame("Frame")
local handlers = {}
local registered = {}

local function msg(text)
    local line = "|cff33ff99AdventureLog:|r " .. tostring(text)
    local chat = DEFAULT_CHAT_FRAME
    if chat and chat.AddMessage then
        chat:AddMessage(line)
    else
        print("AdventureLog: " .. tostring(text))
    end
end

-- pcall wrapper. Success returns the call's results.
-- Failure returns nil and the error string. Callers that persist a failed
-- field must write "<field>Err" = reason, never a silent nil/0/{}.
local function safe(fn, ...)
    if type(fn) ~= "function" then
        return nil, "not a function"
    end
    local ok, a, b, c, d = pcall(fn, ...)
    if ok then
        return a, b, c, d
    end
    return nil, a
end

AdventureLog.safe = safe
AdventureLog.msg = msg

local function isSecret(v)
    if type(issecretvalue) ~= "function" then
        return false
    end
    local ok, secret = pcall(issecretvalue, v)
    if not ok then
        return false
    end
    return secret and true or false
end

local function eventAllowed(name)
    if C_EventUtils == nil or type(C_EventUtils.IsEventValid) ~= "function" then
        return true
    end
    local ok, valid = pcall(C_EventUtils.IsEventValid, name)
    if not ok then
        return false
    end
    return valid and true or false
end

-- Other files subscribe here. One frame. Handlers receive (event, ...).
function AdventureLog.on(event, handler, unit)
    if type(event) ~= "string" or type(handler) ~= "function" then
        return
    end
    if not eventAllowed(event) then
        return
    end
    if not handlers[event] then
        handlers[event] = {}
    end
    handlers[event][#handlers[event] + 1] = handler
    if registered[event] then
        return
    end
    local ok = false
    if type(unit) == "string" and type(frame.RegisterUnitEvent) == "function" then
        ok = pcall(frame.RegisterUnitEvent, frame, event, unit)
    end
    if not ok then
        ok = pcall(frame.RegisterEvent, frame, event)
    end
    if ok then
        registered[event] = true
    end
end

frame:SetScript("OnEvent", function(_, event, ...)
    local list = handlers[event]
    if not list then
        return
    end
    AdventureLog.currentRaw = { n = select("#", ...) + 1, event, ... }
    for i = 1, #list do
        local ok, err = pcall(list[i], event, ...)
        if not ok and AdventureLog.lastHandlerErr == nil then
            AdventureLog.lastHandlerErr = event .. ": " .. tostring(err)
        end
    end
    AdventureLog.currentRaw = nil
end)

local function escapeString(s)
    local out = {}
    local n = 0
    for i = 1, #s do
        local c = string.sub(s, i, i)
        local b = string.byte(c)
        n = n + 1
        if c == '"' then
            out[n] = '\\"'
        elseif c == "\\" then
            out[n] = "\\\\"
        elseif c == "\n" then
            out[n] = "\\n"
        elseif c == "\r" then
            out[n] = "\\r"
        elseif c == "\t" then
            out[n] = "\\t"
        elseif c == "\b" then
            out[n] = "\\b"
        elseif c == "\f" then
            out[n] = "\\f"
        elseif b < 32 then
            out[n] = string.format("\\u%04x", b)
        else
            out[n] = c
        end
    end
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

local function encodeValue(value, seen)
    if isSecret(value) then
        return "null"
    end
    local kind = type(value)
    if kind == "string" then
        return '"' .. escapeString(value) .. '"'
    end
    if kind == "number" then
        if value ~= value or value == math.huge or value == -math.huge then
            return "null"
        end
        return tostring(value)
    end
    if kind == "boolean" then
        if value then
            return "true"
        end
        return "false"
    end
    if kind ~= "table" then
        return "null"
    end
    if seen[value] then
        return "null"
    end
    seen[value] = true
    local parts = {}
    local n = 0
    if isArray(value) then
        for i = 1, #value do
            n = n + 1
            parts[n] = encodeValue(value[i], seen)
        end
        seen[value] = nil
        return "[" .. table.concat(parts, ",") .. "]"
    end
    for k, v in pairs(value) do
        if type(k) == "string" and not isSecret(k) and not isSecret(v) then
            n = n + 1
            parts[n] = '"' .. escapeString(k) .. '":' .. encodeValue(v, seen)
        end
    end
    seen[value] = nil
    return "{" .. table.concat(parts, ",") .. "}"
end

function AdventureLog.encode(value)
    return encodeValue(value, {})
end

-- Clocks, /played anchor, and readiness. Quest/combat/loot stay in other files.
local playedAnchor = nil
local playedAnchorAt = nil
local expectingPlayed = false
local playedToken = 0
local readyAttempts = 0
local headerStartedAt = nil

local function headerStarted()
    if type(headerStartedAt) == "number" then
        return headerStartedAt
    end
    local n = safe(GetServerTime)
    if type(n) ~= "number" or isSecret(n) then
        n = safe(time)
    end
    if type(n) == "number" and not isSecret(n) then
        headerStartedAt = n
        return n
    end
    return nil
end

local function writeHeader()
    if not session then
        return
    end
    local payload = {
        ready = AdventureLog.ready and true or false,
    }
    if AdventureLog.readyErr ~= nil then
        payload.readyErr = AdventureLog.readyErr
    end
    if playedAnchor ~= nil and not isSecret(playedAnchor) then
        payload.playedAnchor = playedAnchor
    end
    if AdventureLog.playedThisLevel ~= nil and not isSecret(AdventureLog.playedThisLevel) then
        payload.playedThisLevel = AdventureLog.playedThisLevel
    end
    if type(AdventureLog.probeReport) == "table" then
        payload.probe = AdventureLog.probeReport
    end
    local started = headerStarted()
    if type(started) == "number" then
        payload.ts = started
        payload.started = started
    end
    session.header = AdventureLog.encode(payload)
end
AdventureLog.writeHeader = writeHeader

local function clearPlayedWait(token)
    if token == playedToken then
        expectingPlayed = false
    end
end

local function requestPlayed()
    if type(RequestTimePlayed) ~= "function" then
        AdventureLog.playedRequestErr = "not a function"
        return
    end
    playedToken = playedToken + 1
    local token = playedToken
    expectingPlayed = true
    local ok, err = pcall(RequestTimePlayed)
    if not ok then
        expectingPlayed = false
        AdventureLog.playedRequestErr = err
        return
    end
    if C_Timer and type(C_Timer.After) == "function" then
        pcall(C_Timer.After, 5, function()
            clearPlayedWait(token)
        end)
    end
end

local checkReady

local function scheduleReadyRetry()
    if C_Timer and type(C_Timer.After) == "function" then
        local ok = pcall(C_Timer.After, 1, function()
            checkReady()
        end)
        if ok then
            return true
        end
    end
    if C_Timer and type(C_Timer.NewTicker) == "function" then
        local ok = pcall(C_Timer.NewTicker, 1, function(ticker)
            if ticker and type(ticker.Cancel) == "function" then
                pcall(ticker.Cancel, ticker)
            end
            checkReady()
        end, 1)
        if ok then
            return true
        end
    end
    return false
end

checkReady = function()
    if AdventureLog.ready then
        return
    end
    local xp = safe(UnitXPMax, "player")
    local map = nil
    if C_Map and type(C_Map.GetBestMapForUnit) == "function" then
        map = safe(C_Map.GetBestMapForUnit, "player")
    end
    local xpOk = false
    if not isSecret(xp) and type(xp) == "number" and xp > 0 then
        xpOk = true
    end
    -- During loading the map can still be the continent with no zone name.
    local mapOk = false
    local zone = safe(GetZoneText)
    if not isSecret(map) and type(map) == "number" and type(zone) == "string" and zone ~= "" then
        mapOk = true
    end
    if xpOk and mapOk then
        AdventureLog.ready = true
        AdventureLog.readyErr = nil
        writeHeader()
        return
    end
    readyAttempts = readyAttempts + 1
    if readyAttempts > 30 then
        AdventureLog.ready = false
        AdventureLog.readyErr = "timeout"
        writeHeader()
        return
    end
    if not scheduleReadyRetry() then
        AdventureLog.ready = false
        AdventureLog.readyErr = "timer unavailable"
        writeHeader()
    end
end

function AdventureLog.stamp(event)
    if type(event) ~= "table" then
        return event
    end
    if event.ts == nil then
        local ts = nil
        local err = nil
        if type(GetServerTime) == "function" then
            local ok, a = pcall(GetServerTime)
            if ok and type(a) == "number" and not isSecret(a) then
                ts = a
            elseif ok and isSecret(a) then
                event.tsSecret = true
            elseif not ok then
                err = a
            end
        end
        if ts == nil and event.tsSecret ~= true and type(time) == "function" then
            local ok, a = pcall(time)
            if ok and type(a) == "number" and not isSecret(a) then
                ts = a
                event.tsSecret = nil
            elseif ok and isSecret(a) then
                event.tsSecret = true
            elseif not ok and err == nil then
                err = a
            end
        end
        if event.tsSecret ~= true then
            if ts ~= nil then
                event.ts = ts
            else
                event.tsErr = err or "time unavailable"
            end
        end
    end
    if event.t == nil then
        local now, err = safe(GetTime)
        if isSecret(now) then
            event.tSecret = true
        elseif type(now) ~= "number" then
            event.tErr = err or "GetTime failed"
        elseif type(AdventureLog.sessionStart) ~= "number" then
            event.tErr = AdventureLog.sessionStartErr or "session start missing"
        else
            event.t = now - AdventureLog.sessionStart
        end
    end
    if event.pt == nil then
        if playedAnchor == nil or playedAnchorAt == nil or isSecret(playedAnchor) then
            event.ptErr = "played not ready"
        else
            local now, err = safe(GetTime)
            if isSecret(now) then
                event.ptSecret = true
            elseif type(now) ~= "number" then
                event.ptErr = err or "GetTime failed"
            else
                event.pt = playedAnchor + (now - playedAnchorAt)
            end
        end
    end
    if event.afk == nil then
        local total = AdventureLog.afkTotal
        if type(total) ~= "number" then
            total = 0
        end
        event.afk = total
    end
    if not AdventureLog.ready then
        event.notReady = true
    end
    return event
end

local function noteSecret(out, key, value)
    if isSecret(value) then
        out[key .. "Secret"] = true
        return true
    end
    return false
end

function AdventureLog.position()
    local out = {}
    local map, mapErr = nil, "map unavailable"
    if C_Map and type(C_Map.GetBestMapForUnit) == "function" then
        map, mapErr = safe(C_Map.GetBestMapForUnit, "player")
    else
        mapErr = "not a function"
    end
    if noteSecret(out, "map", map) then
        map = nil
    elseif type(map) == "number" then
        out.map = map
    else
        out.mapErr = mapErr or "map unavailable"
        map = nil
    end

    local gotXY = false
    local xErr = nil
    if type(map) == "number" and C_Map and type(C_Map.GetPlayerMapPosition) == "function" then
        local a, b = safe(C_Map.GetPlayerMapPosition, map, "player")
        local vx, vy = nil, nil
        if type(a) == "table" then
            if type(a.GetXY) == "function" then
                local ok, px, py = pcall(a.GetXY, a)
                if ok then
                    vx, vy = px, py
                else
                    xErr = px
                end
            end
            if vx == nil and a.x ~= nil then
                vx, vy = a.x, a.y
            end
        elseif type(a) == "number" then
            vx, vy = a, b
        else
            xErr = b or "position unavailable"
        end
        if not noteSecret(out, "x", vx) and type(vx) == "number" then
            out.x = vx * 100
            gotXY = true
        elseif out.xSecret ~= true then
            out.xErr = xErr or "x unavailable"
        end
        if not noteSecret(out, "y", vy) and type(vy) == "number" then
            out.y = vy * 100
            gotXY = gotXY and true
        elseif out.ySecret ~= true then
            out.yErr = xErr or "y unavailable"
            gotXY = false
        end
    else
        if type(map) ~= "number" then
            xErr = out.mapErr or "map unavailable"
        else
            xErr = "not a function"
        end
        out.xErr = xErr
        out.yErr = xErr
    end

    local zone, zoneErr = safe(GetZoneText)
    if not noteSecret(out, "zone", zone) then
        if type(zone) == "string" then
            out.zone = zone
        else
            out.zoneErr = zoneErr or "GetZoneText failed"
        end
    end
    local sub, subErr = safe(GetSubZoneText)
    if not noteSecret(out, "subzone", sub) then
        if type(sub) == "string" then
            out.subzone = sub
        else
            out.subzoneErr = subErr or "GetSubZoneText failed"
        end
    end

    if not gotXY then
        local wy, wx, wz, inst = safe(UnitPosition, "player")
        local fallbackOk = false
        if type(wy) == "string" and wx == nil then
            out.posErr = wy
        else
            if not noteSecret(out, "worldY", wy) and type(wy) == "number" then
                out.worldY = wy
                fallbackOk = true
            end
            if not noteSecret(out, "worldX", wx) and type(wx) == "number" then
                out.worldX = wx
                fallbackOk = true
            end
            if not noteSecret(out, "worldZ", wz) and type(wz) == "number" then
                out.worldZ = wz
            end
            if not noteSecret(out, "instance", inst) and type(inst) == "number" then
                out.instance = inst
            end
            if fallbackOk then
                out.posFallback = "UnitPosition"
            elseif type(wx) == "string" and out.posErr == nil then
                out.posErr = wx
            end
        end
    end
    return out
end

local function scrubSecrets(t, seen)
    if type(t) ~= "table" then
        return
    end
    if seen[t] then
        return
    end
    seen[t] = true
    local drop = {}
    local marks = {}
    for k, v in pairs(t) do
        if not isSecret(k) then
            if isSecret(v) then
                drop[#drop + 1] = k
                if type(k) == "string" then
                    marks[#marks + 1] = k
                end
            elseif type(v) == "table" then
                scrubSecrets(v, seen)
            end
        end
    end
    for i = 1, #drop do
        t[drop[i]] = nil
    end
    for i = 1, #marks do
        t[marks[i] .. "Secret"] = true
    end
end

local function rawArgs(...)
    local n = select("#", ...)
    if n == 0 then
        return nil
    end
    local raw = {}
    for i = 1, n do
        local v = select(i, ...)
        if isSecret(v) then
            raw[i] = "secret"
        elseif type(v) == "string" or type(v) == "number" or type(v) == "boolean" then
            raw[i] = v
        else
            local ok, text = pcall(tostring, v)
            if ok then
                raw[i] = text
            else
                raw[i] = "secret"
            end
        end
    end
    return raw
end

local function persistCall(dest, field, fn, ...)
    local a, b = safe(fn, ...)
    if a == nil and type(b) == "string" then
        dest[field .. "Err"] = b
        return
    end
    if isSecret(a) then
        dest[field .. "Secret"] = true
        return
    end
    if a ~= nil then
        dest[field] = a
        return
    end
    dest[field .. "Err"] = "empty"
end

local function ensureDB()
    if type(AdventureLogDB) ~= "table" then
        AdventureLogDB = {}
    end
    AdventureLogDB.schema = 1
    if type(AdventureLogDB.sessions) ~= "table" then
        AdventureLogDB.sessions = {}
    end

    local char = {}
    if type(UnitName) ~= "function" then
        char.nameErr = "not a function"
    else
        local ok, first, second = pcall(UnitName, "player")
        if not ok then
            char.nameErr = tostring(first)
        elseif isSecret(first) or (second ~= nil and isSecret(second)) then
            char.nameSecret = true
        else
            local name = nil
            if type(first) == "string" then
                name = first
            end
            if type(second) == "string" and second ~= "" then
                local realmMatch = false
                local function realmEquals(fn)
                    if type(fn) ~= "function" then
                        return false
                    end
                    local rok, realmName = pcall(fn)
                    if rok and type(realmName) == "string" and realmName ~= "" and second == realmName then
                        return true
                    end
                    return false
                end
                if realmEquals(GetRealmName) or realmEquals(GetNormalizedRealmName) then
                    realmMatch = true
                end
                if not realmMatch then
                    if name and name ~= "" then
                        name = name .. " " .. second
                    else
                        name = second
                    end
                end
            end
            if name ~= nil then
                char.name = name
            end
        end
    end

    local realmName, realmErr = safe(GetRealmName)
    if realmName == nil and type(realmErr) == "string" then
        char.realmErr = realmErr
    elseif isSecret(realmName) then
        char.realmSecret = true
    else
        char.realm = type(realmName) == "string" and realmName or ""
    end

    persistCall(char, "class", UnitClass, "player")
    persistCall(char, "race", UnitRace, "player")
    persistCall(char, "faction", UnitFactionGroup, "player")

    AdventureLogDB.char = char
end

local function fourHex()
    local n = nil
    local now = safe(time)
    if type(now) == "number" then
        n = math.floor(now) % 65536
    end
    if n == nil then
        n = math.random(0, 65535)
    end
    if n < 0 then
        n = 0
    end
    return string.format("%04x", n)
end

local function startSession()
    ensureDB()
    local stamp = nil
    local text = safe(date, "%Y%m%d-%H%M")
    if type(text) == "string" then
        stamp = text
    end
    if not stamp then
        stamp = "00000000-0000"
    end
    session = {
        id = stamp .. "-" .. fourHex(),
        header = "{}",
        events = {},
        summary = "{}",
    }
    local sessions = AdventureLogDB.sessions
    sessions[#sessions + 1] = session
    capNotified = false
    readyAttempts = 0
    AdventureLog.ready = false
    AdventureLog.readyErr = nil
    local now, nowErr = safe(GetTime)
    if type(now) == "number" and not isSecret(now) then
        AdventureLog.sessionStart = now
    else
        AdventureLog.sessionStart = nil
        if isSecret(now) then
            AdventureLog.sessionStartErr = "secret"
        else
            AdventureLog.sessionStartErr = nowErr or "GetTime failed"
        end
    end
    requestPlayed()
    local level, levelErr = safe(UnitLevel, "player")
    local started = { e = "session_start" }
    if isSecret(level) then
        started.levelSecret = true
    elseif type(level) == "number" then
        started.level = level
    else
        started.levelErr = levelErr or "UnitLevel failed"
    end
    AdventureLog.record(started)
    checkReady()
end

function AdventureLog.record(event, ...)
    AdventureLog.lastStored = false
    if type(event) ~= "table" then
        return event
    end
    event = AdventureLog.stamp(event) or event
    if type(event) ~= "table" then
        return event
    end
    local raw = rawArgs(...)
    local current = AdventureLog.currentRaw
    if raw == nil and type(current) == "table" then
        raw = rawArgs(unpack(current, 1, current.n))
    end
    scrubSecrets(event, {})
    if raw and event.textOther then
        -- The message is about another player: its raw args carry their name. Keep only the event name.
        raw = { raw[1] }
    end
    if raw then
        event.raw = raw
    end
    if AdventureLog.paused or not session then
        return event
    end
    if #session.events >= MAX_EVENTS then
        if not capNotified then
            capNotified = true
            msg("session holds " .. MAX_EVENTS .. " events; further events are not stored")
        end
        return event
    end
    session.events[#session.events + 1] = AdventureLog.encode(event)
    AdventureLog.lastStored = true
    return event
end

local function printStatus()
    local id = "none"
    local count = 0
    if session then
        id = session.id
        count = #session.events
    end
    local paused = "false"
    if AdventureLog.paused then
        paused = "true"
    end
    msg("session " .. id .. ", events " .. count .. ", paused " .. paused)
end

local function slash(text)
    text = string.lower(text or "")
    text = string.gsub(text, "^%s+", "")
    text = string.gsub(text, "%s+$", "")
    if text == "" or text == "status" then
        printStatus()
    elseif text == "pause" then
        AdventureLog.paused = true
        msg("paused")
    elseif text == "resume" then
        AdventureLog.paused = false
        msg("resumed")
    elseif text == "probe" then
        if AdventureLog.runProbe then
            AdventureLog.runProbe()
        else
            msg("probe not loaded")
        end
        return
    else
        printStatus()
    end
end

SLASH_ADVENTURELOG1 = "/adv"
SlashCmdList = SlashCmdList or {}
SlashCmdList.ADVENTURELOG = slash

if WOW_PROJECT_ID ~= nil and WOW_PROJECT_ID ~= 18 then
    msg("WOW_PROJECT_ID is " .. tostring(WOW_PROJECT_ID) .. " (expected 18)")
end

AdventureLog.on("PLAYER_LOGIN", function()
    ensureDB()
end)

AdventureLog.on("PLAYER_ENTERING_WORLD", function()
    ensureDB()
    if not session then
        startSession()
    end
end)

if not eventAllowed("PLAYER_ENTERING_WORLD") then
    AdventureLog.on("PLAYER_LOGIN", function()
        if not session then
            startSession()
        end
    end)
end

local function playedChatFilter(_, _, text)
    if not expectingPlayed then
        return false
    end
    if type(text) ~= "string" then
        return false
    end
    if string.find(text, "Total time played", 1, true) then
        return true
    end
    local lower = string.lower(text)
    if not string.find(lower, "played", 1, true) then
        return false
    end
    if string.find(text, "%d") then
        return true
    end
    if string.find(lower, "day", 1, true) then
        return true
    end
    return false
end

if type(ChatFrame_AddMessageEventFilter) == "function" then
    local ok = pcall(ChatFrame_AddMessageEventFilter, "CHAT_MSG_SYSTEM", playedChatFilter)
    AdventureLog.playedFilter = ok and true or false
else
    AdventureLog.playedFilter = false
end

AdventureLog.on("TIME_PLAYED_MSG", function(_, totalTimePlayed, timePlayedThisLevel)
    expectingPlayed = false
    playedToken = playedToken + 1
    if isSecret(totalTimePlayed) or isSecret(timePlayedThisLevel) then
        AdventureLog.playedSecret = true
        return
    end
    if type(totalTimePlayed) == "number" then
        playedAnchor = totalTimePlayed
        local now = safe(GetTime)
        if type(now) == "number" and not isSecret(now) then
            playedAnchorAt = now
        end
    end
    if type(timePlayedThisLevel) == "number" then
        AdventureLog.playedThisLevel = timePlayedThisLevel
    end
end)

AdventureLog.on("PLAYER_LEVEL_UP", function()
    requestPlayed()
end)

AdventureLog.on("PLAYER_LOGOUT", function()
    requestPlayed()
    AdventureLog.record({ e = "session_end" })
    writeHeader()
end)
