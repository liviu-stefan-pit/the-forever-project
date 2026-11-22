-- AdventureLog movement, zone, taxi, bind, group, quest, and xp recorder.
-- Lua 5.1. No libraries. Does not register COMBAT_LOG.
if not AdventureLog then return end

local safe = AdventureLog.safe

local POS_FIELDS = { "map", "x", "y", "zone", "subzone" }

local lastX = nil
local lastY = nil
local lastMap = nil
local lastZoneKey = nil
local lastBind = nil
local onTaxi = false
local taxiStart = nil
local lastGroupSize = nil
local lastXp = nil
local logPending = false
local moveTicker = nil
local moveStop = false

local objSig = {}
local readySeen = {}
local turnedIn = {}

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

local function noteActivity()
    if type(AdventureLog.noteActivity) == "function" then
        safe(AdventureLog.noteActivity)
    end
end

local function applyPosition(event)
    local pos = AdventureLog.position()
    if type(pos) ~= "table" then
        return
    end
    for i = 1, #POS_FIELDS do
        local key = POS_FIELDS[i]
        local value = pos[key]
        if value ~= nil and not isSecret(value) then
            event[key] = value
        end
    end
    for key, value in pairs(pos) do
        if type(key) == "string" and not isSecret(key) and not isSecret(value) then
            local n = string.len(key)
            local err = n >= 3 and string.sub(key, n - 2) == "Err"
            local secret = n >= 6 and string.sub(key, n - 5) == "Secret"
            if err or secret then
                event[key] = value
            end
        end
    end
end

local function emit(fields)
    local event = {}
    applyPosition(event)
    if type(fields) == "table" then
        for key, value in pairs(fields) do
            if not isSecret(key) and not isSecret(value) then
                event[key] = value
            end
        end
    end
    return AdventureLog.record(event)
end

local function plainString(value)
    if type(value) ~= "string" or isSecret(value) then
        return nil
    end
    return value
end

local function plainNumber(value)
    if type(value) ~= "number" or isSecret(value) then
        return nil
    end
    return value
end

local function breadcrumb()
    local pos = AdventureLog.position()
    if type(pos) ~= "table" then
        return
    end
    local x = plainNumber(pos.x)
    local y = plainNumber(pos.y)
    local map = plainNumber(pos.map)
    local moved = false
    if x ~= nil and lastX ~= nil and math.abs(x - lastX) > 0.5 then
        moved = true
    end
    if y ~= nil and lastY ~= nil and math.abs(y - lastY) > 0.5 then
        moved = true
    end
    if x ~= nil and lastX == nil then
        moved = true
    end
    if y ~= nil and lastY == nil then
        moved = true
    end
    if map ~= nil and map ~= lastMap then
        moved = true
    end
    if not moved then
        return
    end
    if x == nil and y == nil and map == nil then
        return
    end
    if x ~= nil then
        lastX = x
    end
    if y ~= nil then
        lastY = y
    end
    if map ~= nil then
        lastMap = map
    end
    emit({ e = "breadcrumb" })
    noteActivity()
end

local function zoneText()
    local pos = AdventureLog.position()
    local zone, subzone = nil, nil
    if type(pos) == "table" then
        zone = plainString(pos.zone)
        subzone = plainString(pos.subzone)
    end
    if zone == nil then
        zone = plainString(safe(GetZoneText))
    end
    if subzone == nil then
        subzone = plainString(safe(GetSubZoneText))
    end
    return zone, subzone
end

local function onZone()
    local zone, subzone = zoneText()
    local key = tostring(zone or "") .. "\0" .. tostring(subzone or "")
    if key == lastZoneKey then
        return
    end
    lastZoneKey = key
    local fields = { e = "zone" }
    if zone ~= nil then
        fields.zone = zone
    end
    if subzone ~= nil then
        fields.subzone = subzone
    end
    emit(fields)
    noteActivity()
end

local function noteTaxi(flying)
    if flying and not onTaxi then
        onTaxi = true
        local now = plainNumber(safe(GetTime))
        taxiStart = now
        local zone = zoneText()
        local fields = { e = "taxi_start" }
        if zone ~= nil then
            fields.fromZone = zone
        end
        emit(fields)
    elseif not flying and onTaxi then
        onTaxi = false
        local zone = zoneText()
        local fields = { e = "taxi_end" }
        if zone ~= nil then
            fields.toZone = zone
        end
        local now = plainNumber(safe(GetTime))
        if now ~= nil and taxiStart ~= nil then
            fields.dur = now - taxiStart
        end
        taxiStart = nil
        emit(fields)
    end
end

local function readOnTaxi()
    if type(UnitOnTaxi) ~= "function" then
        return nil
    end
    local ok, flying = pcall(UnitOnTaxi, "player")
    if not ok or isSecret(flying) then
        return nil
    end
    return flying and true or false
end

local function pollTaxi()
    local flying = readOnTaxi()
    if flying == nil then
        return
    end
    noteTaxi(flying)
end

local function taxiMapId()
    if C_TaxiMap and type(C_TaxiMap.GetTaxiMapID) == "function" then
        return plainNumber(safe(C_TaxiMap.GetTaxiMapID))
    end
    if type(GetTaxiMapID) == "function" then
        return plainNumber(safe(GetTaxiMapID))
    end
    return nil
end

local function nodeReachable(state)
    if isSecret(state) then
        return false
    end
    if state == 0 or state == 1 then
        return true
    end
    if Enum and Enum.FlightPathState then
        if state == Enum.FlightPathState.Current or state == Enum.FlightPathState.Reachable then
            return true
        end
    end
    return false
end

local function onTaxiMap()
    if C_TaxiMap == nil or type(C_TaxiMap.GetAllTaxiNodes) ~= "function" then
        return
    end
    if (C_TaxiMap.GetTaxiMapID == nil) and type(GetTaxiMapID) ~= "function" then
        return
    end
    local mapId = taxiMapId()
    if mapId == nil then
        return
    end
    local nodes = safe(C_TaxiMap.GetAllTaxiNodes, mapId)
    if type(nodes) ~= "table" then
        return
    end
    local names = {}
    local limit = #nodes
    if limit > 200 then
        limit = 200
    end
    for i = 1, limit do
        local node = nodes[i]
        if type(node) == "table" and nodeReachable(node.state) then
            local name = plainString(node.name)
            if name ~= nil and name ~= "" then
                names[#names + 1] = name
            end
        end
    end
    emit({ e = "taxi_nodes", nodes = names })
end

local function pollBind()
    if type(GetBindLocation) ~= "function" then
        return
    end
    local loc = safe(GetBindLocation)
    if isSecret(loc) or type(loc) ~= "string" then
        return
    end
    if loc == lastBind then
        return
    end
    lastBind = loc
    emit({ e = "bind", loc = loc })
end

local function tick()
    if AdventureLog.paused then
        return
    end
    breadcrumb()
    pollTaxi()
    pollBind()
end

local function startTicker()
    if C_Timer and type(C_Timer.NewTicker) == "function" then
        local ok, ticker = pcall(C_Timer.NewTicker, 5, tick)
        if ok then
            moveTicker = ticker
            return
        end
    end
    if C_Timer and type(C_Timer.After) == "function" then
        local function chain()
            if moveStop then
                return
            end
            tick()
            pcall(C_Timer.After, 5, chain)
        end
        pcall(C_Timer.After, 5, chain)
    end
end

local function stopTicker()
    moveStop = true
    if type(moveTicker) == "table" and type(moveTicker.Cancel) == "function" then
        pcall(moveTicker.Cancel, moveTicker)
    end
    moveTicker = nil
end

local function onHearth(_, unit, _, spellId)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    if isSecret(spellId) or spellId ~= 8690 then
        return
    end
    emit({ e = "hearth" })
end

local function groupSize()
    if type(GetNumGroupMembers) == "function" then
        local ok, n = pcall(GetNumGroupMembers)
        if ok and type(n) == "number" and not isSecret(n) then
            return n
        end
    end
    if type(GetNumPartyMembers) == "function" then
        local ok, n = pcall(GetNumPartyMembers)
        if ok and type(n) == "number" and not isSecret(n) then
            return n
        end
    end
    return nil
end

local function onGroup()
    local n = groupSize()
    if n == nil or n == lastGroupSize then
        return
    end
    lastGroupSize = n
    emit({ e = "group", size = n })
end

local function questTitle(questId)
    if C_QuestLog and type(C_QuestLog.GetTitleForQuestID) == "function" then
        local title, err = safe(C_QuestLog.GetTitleForQuestID, questId)
        title = plainString(title)
        if title ~= nil and title ~= "" then
            return title
        end
        if type(err) == "string" then
            return nil, err
        end
    end
    if C_QuestLog and type(C_QuestLog.GetLogIndexForQuestID) == "function" and type(C_QuestLog.GetInfo) == "function" then
        local index = plainNumber(safe(C_QuestLog.GetLogIndexForQuestID, questId))
        if index ~= nil then
            local info, err = safe(C_QuestLog.GetInfo, index)
            if type(info) == "table" then
                local title = plainString(info.title)
                if title ~= nil and title ~= "" then
                    return title
                end
            end
            if type(err) == "string" then
                return nil, err
            end
        end
    end
    return nil, "title unavailable"
end

local function copyObjective(raw)
    if type(raw) ~= "table" then
        return nil
    end
    local row = {}
    local text = plainString(raw.text)
    if text ~= nil then
        row.text = text
    elseif isSecret(raw.text) then
        row.textSecret = true
    end
    local fulfilled = plainNumber(raw.numFulfilled)
    if fulfilled ~= nil then
        row.numFulfilled = fulfilled
    elseif isSecret(raw.numFulfilled) then
        row.numFulfilledSecret = true
    end
    local required = plainNumber(raw.numRequired)
    if required ~= nil then
        row.numRequired = required
    elseif isSecret(raw.numRequired) then
        row.numRequiredSecret = true
    end
    if raw.finished == true or raw.finished == false then
        if not isSecret(raw.finished) then
            row.finished = raw.finished
        end
    end
    local kind = plainString(raw.type)
    if kind ~= nil then
        row.type = kind
    end
    return row
end

local acceptedThisSession = {}
local firstScanDone = false

local function readObjectives(questId)
    if C_QuestLog == nil or type(C_QuestLog.GetQuestObjectives) ~= "function" then
        return nil
    end
    local objs, err = safe(C_QuestLog.GetQuestObjectives, questId)
    if type(objs) ~= "table" then
        return nil, err
    end
    local out = {}
    local parts = {}
    local limit = #objs
    if limit > 20 then
        limit = 20
    end
    for i = 1, limit do
        local row = copyObjective(objs[i])
        if row ~= nil then
            out[#out + 1] = row
            if type(row.numFulfilled) == "number" then
                parts[#parts + 1] = tostring(row.numFulfilled)
            else
                parts[#parts + 1] = "?"
            end
        end
    end
    return out, table.concat(parts, ",")
end

local function considerProgress(questId, objectives, sig, recordInitial)
    if type(questId) ~= "number" or isSecret(questId) then
        return
    end
    if type(objectives) ~= "table" or #objectives == 0 or sig == nil or sig == "" then
        return
    end
    if string.find(sig, "?", 1, true) then
        return
    end
    local prev = objSig[questId]
    if prev == sig then
        return
    end
    if prev == nil and not recordInitial then
        objSig[questId] = sig
        return
    end
    objSig[questId] = sig
    emit({
        e = "quest_progress",
        questId = questId,
        objectives = objectives,
    })
end

local function noteReady(questId)
    if type(questId) ~= "number" or isSecret(questId) then
        return
    end
    if readySeen[questId] then
        return
    end
    if C_QuestLog == nil or type(C_QuestLog.ReadyForTurnIn) ~= "function" then
        return
    end
    local ready = safe(C_QuestLog.ReadyForTurnIn, questId)
    if isSecret(ready) or ready ~= true then
        return
    end
    readySeen[questId] = true
    local fields = { e = "quest_ready", questId = questId }
    -- Quests already complete when the session began are not progress made now.
    if not firstScanDone and not acceptedThisSession[questId] then
        fields.baseline = true
    end
    emit(fields)
end

local function questLogCount()
    return plainNumber(safe(C_QuestLog.GetNumQuestLogEntries))
end

local knownQuests = {}

local function scanQuestLog()
    if C_QuestLog == nil or type(C_QuestLog.GetNumQuestLogEntries) ~= "function" then
        return
    end
    if type(C_QuestLog.GetInfo) ~= "function" then
        return
    end
    -- Never expand or collapse headers here: each call fires QUEST_LOG_UPDATE,
    -- which reschedules this scan. Quests under collapsed headers are still
    -- read by id through knownQuests.
    local seen = {}
    local shown = questLogCount()
    if type(shown) == "number" and shown >= 1 then
        if shown > 100 then
            shown = 100
        end
        for i = 1, shown do
            local info = safe(C_QuestLog.GetInfo, i)
            if type(info) == "table" and info.isHeader ~= true and info.isHidden ~= true then
                local questId = plainNumber(info.questID)
                if questId ~= nil then
                    seen[questId] = true
                    knownQuests[questId] = true
                end
            end
        end
    end
    local hasLogIndex = type(C_QuestLog.GetLogIndexForQuestID) == "function"
    for questId in pairs(knownQuests) do
        local inLog = seen[questId]
        if not inLog and hasLogIndex then
            inLog = plainNumber(safe(C_QuestLog.GetLogIndexForQuestID, questId)) ~= nil
        end
        if inLog then
            local objectives, sig = readObjectives(questId)
            considerProgress(questId, objectives, sig, false)
            noteReady(questId)
        else
            knownQuests[questId] = nil
        end
    end
    firstScanDone = true
end

local function scheduleLog()
    if logPending then
        return
    end
    logPending = true
    local function run()
        logPending = false
        if AdventureLog.paused then
            return
        end
        scanQuestLog()
    end
    if C_Timer and type(C_Timer.After) == "function" then
        local ok = pcall(C_Timer.After, 0.25, run)
        if ok then
            return
        end
    end
    logPending = false
    run()
end

local function onQuestAccepted(_, questId)
    questId = plainNumber(questId)
    if questId == nil then
        return
    end
    knownQuests[questId] = true
    acceptedThisSession[questId] = true
    local fields = { e = "quest_accept", questId = questId }
    local title, err = questTitle(questId)
    if title ~= nil then
        fields.title = title
    else
        fields.titleErr = err or "title unavailable"
    end
    emit(fields)
    noteActivity()
    if C_QuestLog and type(C_QuestLog.RequestLoadQuestByID) == "function" then
        safe(C_QuestLog.RequestLoadQuestByID, questId)
    end
    scheduleLog()
end

local function onCriteria(_, questId, specificTreeID, description, numFulfilled, numRequired)
    questId = plainNumber(questId)
    if questId == nil then
        return
    end
    local fields = { e = "quest_progress", questId = questId }
    local tree = plainNumber(specificTreeID)
    if tree ~= nil then
        fields.specificTreeID = tree
    end
    local desc = plainString(description)
    if desc ~= nil then
        fields.description = desc
    elseif isSecret(description) then
        fields.descriptionSecret = true
    end
    local got = plainNumber(numFulfilled)
    if got ~= nil then
        fields.numFulfilled = got
    elseif isSecret(numFulfilled) then
        fields.numFulfilledSecret = true
    end
    local need = plainNumber(numRequired)
    if need ~= nil then
        fields.numRequired = need
    elseif isSecret(numRequired) then
        fields.numRequiredSecret = true
    end
    emit(fields)
    noteReady(questId)
end

local function onQuestLog()
    scheduleLog()
end

local function onTurnIn(_, questId, xpReward, moneyReward)
    questId = plainNumber(questId)
    if questId == nil then
        return
    end
    turnedIn[questId] = true
    readySeen[questId] = true
    local fields = { e = "quest_turnin", questId = questId }
    local xp = plainNumber(xpReward)
    if xp ~= nil then
        fields.xpReward = xp
    elseif isSecret(xpReward) then
        fields.xpRewardSecret = true
    end
    local money = plainNumber(moneyReward)
    if money ~= nil then
        fields.moneyReward = money
    elseif isSecret(moneyReward) then
        fields.moneyRewardSecret = true
    end
    emit(fields)
end

local function onQuestRemoved(_, questId, wasReplayQuest)
    questId = plainNumber(questId)
    if questId == nil then
        return
    end
    objSig[questId] = nil
    readySeen[questId] = nil
    if turnedIn[questId] then
        turnedIn[questId] = nil
        return
    end
    local fields = { e = "quest_abandon", questId = questId }
    if wasReplayQuest == true or wasReplayQuest == false then
        if not isSecret(wasReplayQuest) then
            fields.wasReplayQuest = wasReplayQuest
        end
    end
    emit(fields)
end

local function onQuestData(_, questId, success)
    questId = plainNumber(questId)
    if questId == nil or success ~= true then
        return
    end
    local objectives, sig = readObjectives(questId)
    if type(objectives) ~= "table" or #objectives == 0 then
        return
    end
    considerProgress(questId, objectives, sig, acceptedThisSession[questId] == true)
    noteReady(questId)
end

local function onXp(_, unit)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    local fields = { e = "xp" }
    local xp, xpErr = safe(UnitXP, "player")
    if isSecret(xp) then
        fields.xpSecret = true
    elseif type(xp) == "number" then
        fields.xp = xp
        if lastXp ~= nil then
            fields.delta = xp - lastXp
        end
        lastXp = xp
    else
        fields.xpErr = xpErr or "UnitXP failed"
    end
    local xpMax, xpMaxErr = safe(UnitXPMax, "player")
    if isSecret(xpMax) then
        fields.xpMaxSecret = true
    elseif type(xpMax) == "number" then
        fields.xpMax = xpMax
    else
        fields.xpMaxErr = xpMaxErr or "UnitXPMax failed"
    end
    local rested, restedErr = safe(GetXPExhaustion)
    if isSecret(rested) then
        fields.restedSecret = true
    elseif type(rested) == "number" then
        fields.rested = rested
    elseif type(restedErr) == "string" then
        fields.restedErr = restedErr
    end
    local restState, restName, restFactor = safe(GetRestState)
    if isSecret(restState) then
        fields.restStateSecret = true
    elseif type(restState) == "number" then
        fields.restState = restState
    end
    if not isSecret(restName) and type(restName) == "string" then
        fields.restName = restName
    end
    if not isSecret(restFactor) and type(restFactor) == "number" then
        fields.restFactor = restFactor
    end
    emit(fields)
    noteActivity()
end

local function onXpChat(_, text)
    local fields = { e = "xp_chat" }
    if isSecret(text) then
        fields.textSecret = true
        emit(fields)
        noteActivity()
        return
    end
    if type(text) ~= "string" then
        return
    end
    fields.text = text
    local mob, amount = string.match(text, "^(.-) dies, you gain (%d+) experience")
    if amount ~= nil then
        fields.source = "kill"
        fields.amount = tonumber(amount)
        if type(mob) == "string" and not isSecret(mob) then
            fields.mob = mob
        end
    end
    emit(fields)
    noteActivity()
end

local function onLevel()
    local fields = { e = "level_up" }
    local level, err = safe(UnitLevel, "player")
    if isSecret(level) then
        fields.levelSecret = true
    elseif type(level) == "number" then
        fields.level = level
    else
        fields.levelErr = err or "UnitLevel failed"
    end
    emit(fields)
    noteActivity()
end

AdventureLog.on("ZONE_CHANGED", onZone)
AdventureLog.on("ZONE_CHANGED_INDOORS", onZone)
AdventureLog.on("ZONE_CHANGED_NEW_AREA", onZone)
AdventureLog.on("TAXIMAP_OPENED", onTaxiMap)
AdventureLog.on("UNIT_SPELLCAST_SUCCEEDED", onHearth, "player")
AdventureLog.on("GROUP_ROSTER_UPDATE", onGroup)
AdventureLog.on("QUEST_ACCEPTED", onQuestAccepted)
AdventureLog.on("QUEST_LOG_CRITERIA_UPDATE", onCriteria)
AdventureLog.on("QUEST_LOG_UPDATE", onQuestLog)
AdventureLog.on("QUEST_TURNED_IN", onTurnIn)
AdventureLog.on("QUEST_REMOVED", onQuestRemoved)
AdventureLog.on("QUEST_DATA_LOAD_RESULT", onQuestData)
AdventureLog.on("PLAYER_XP_UPDATE", onXp, "player")
AdventureLog.on("PLAYER_ENTERING_WORLD", function()
    if lastXp ~= nil then
        return
    end
    local xp = safe(UnitXP, "player")
    if type(xp) == "number" and not isSecret(xp) then
        lastXp = xp
    end
end)
AdventureLog.on("PLAYER_CONTROL_LOST", function()
    local flying = readOnTaxi()
    if flying then
        noteTaxi(true)
    end
end)
AdventureLog.on("PLAYER_CONTROL_GAINED", function()
    local flying = readOnTaxi()
    if flying == false then
        noteTaxi(false)
    end
end)
AdventureLog.on("PLAYER_LOGOUT", function()
    stopTicker()
end)
AdventureLog.on("CHAT_MSG_COMBAT_XP_GAIN", onXpChat)
AdventureLog.on("PLAYER_LEVEL_UP", onLevel)

startTicker()
