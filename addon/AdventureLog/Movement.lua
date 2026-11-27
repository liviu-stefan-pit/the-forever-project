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

local function nowT()
    return plainNumber(safe(GetTime))
end

local function after(delay, fn)
    if C_Timer and type(C_Timer.After) == "function" then
        local ok = pcall(C_Timer.After, delay, fn)
        if ok then
            return true
        end
    end
    return false
end

-- Stamp an event now (time + position) so it can be recorded a little later
-- with the time it actually happened.
local function prepare(fields)
    local event = {}
    applyPosition(event)
    for key, value in pairs(fields) do
        if not isSecret(key) and not isSecret(value) then
            event[key] = value
        end
    end
    if type(AdventureLog.stamp) == "function" then
        AdventureLog.stamp(event)
    end
    return event
end

local function itemIdFromLink(link)
    if type(link) ~= "string" or isSecret(link) then
        return nil
    end
    local id = string.match(link, "item:(%d+)")
    if id then
        return tonumber(id)
    end
    return nil
end

-- ---------------------------------------------------------------------------
-- Object use: quest pickups, searched furniture, notes, chests.
-- Sources: a GameObject in the "npc" unit of a quest/gossip/text dialog, a loot
-- window whose source is a GameObject (Loot.lua), and a spell cast whose target
-- is the soft-interact GameObject (PLAYER_SOFT_INTERACT_CHANGED).
-- ---------------------------------------------------------------------------

local softObject = nil
local lastObjectUse = {}
local pendingCasts = {}

local function softObjectFresh()
    if not softObject then
        return nil
    end
    local now = nowT()
    if now and softObject.at and now - softObject.at > 30 then
        return nil
    end
    return softObject
end

function AdventureLog.noteObjectUse(info)
    if type(info) ~= "table" then
        return
    end
    local name = plainString(info.name)
    local objectId = plainNumber(info.objectId)
    local soft = softObjectFresh()
    if soft then
        if objectId == nil and name ~= nil and soft.name == name then
            objectId = soft.id
        elseif name == nil and objectId ~= nil and soft.id == objectId then
            name = soft.name
        end
    end
    if objectId == nil and name == nil then
        return
    end
    local key = tostring(objectId or name)
    local now = nowT()
    local last = lastObjectUse[key]
    if now and last and now - last < 3 then
        return
    end
    lastObjectUse[key] = now or 0
    local fields = { e = "object_use", via = info.via or "unknown" }
    if objectId ~= nil then
        fields.objectId = objectId
    else
        fields.objectIdErr = "no GameObject guid"
    end
    if name ~= nil then
        fields.name = name
    end
    if plainNumber(info.spellId) then
        fields.spellId = info.spellId
    end
    if plainString(info.spellName) then
        fields.spellName = info.spellName
    end
    if type(info.itemIds) == "table" and #info.itemIds > 0 then
        fields.itemIds = info.itemIds
    end
    if plainNumber(info.questId) then
        fields.questId = info.questId
    end
    emit(fields)
    noteActivity()
end

local function onSoftInteract(_, _, newTarget)
    if isSecret(newTarget) or type(newTarget) ~= "string" or newTarget == "" then
        return
    end
    local kind, id = AdventureLog.parseGuid(newTarget)
    if kind ~= "GameObject" or type(id) ~= "number" then
        return
    end
    local name = plainString(safe(UnitName, "softinteract"))
    softObject = { id = id, name = name, at = nowT() }
end

local function castKey(castGUID, spellId)
    if type(castGUID) == "string" and not isSecret(castGUID) then
        return castGUID
    end
    return "spell:" .. tostring(spellId)
end

local function onSpellSent(_, unit, target, castGUID, spellId)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    target = plainString(target)
    spellId = plainNumber(spellId)
    if target == nil or target == "" or spellId == nil then
        return
    end
    pendingCasts[castKey(castGUID, spellId)] = { target = target, spellId = spellId, at = nowT() }
end

local function spellName(spellId)
    if C_Spell and type(C_Spell.GetSpellName) == "function" then
        return plainString(safe(C_Spell.GetSpellName, spellId))
    end
    if type(GetSpellInfo) == "function" then
        return plainString(safe(GetSpellInfo, spellId))
    end
    return nil
end

local function onSpellDone(_, unit, castGUID, spellId)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    spellId = plainNumber(spellId)
    local key = castKey(castGUID, spellId)
    local cast = pendingCasts[key]
    pendingCasts = {}
    if not cast then
        return
    end
    local soft = softObjectFresh()
    if soft and soft.name ~= nil and soft.name == cast.target then
        AdventureLog.noteObjectUse({ via = "spell", objectId = soft.id, name = cast.target, spellId = spellId, spellName = spellName(spellId) })
        return
    end
    -- No soft-interact object: keep it only when the spell is an opening/search
    -- cast, so spells on mobs are not logged as object uses.
    local sname = spellName(spellId)
    if sname and (string.find(string.lower(sname), "open", 1, true) or string.find(string.lower(sname), "search", 1, true)) then
        AdventureLog.noteObjectUse({ via = "spell", name = cast.target, spellId = spellId, spellName = sname })
    end
end

-- ---------------------------------------------------------------------------
-- Quest dialogs: who you are talking to (item 7) and the rewards on offer (item 8).
-- ---------------------------------------------------------------------------

local interaction = nil
local pendingRewards = {}
local lastChoice = nil

local function dialogQuestId()
    if type(GetQuestID) ~= "function" then
        return nil
    end
    local id = plainNumber(safe(GetQuestID))
    if id == 0 then
        return nil
    end
    return id
end

local function readInteraction(frame, startItemId)
    local who, why = nil, nil
    if type(AdventureLog.unitIdentity) == "function" then
        who, why = AdventureLog.unitIdentity("npc")
    end
    local pos = AdventureLog.position()
    interaction = {
        at = nowT(),
        frame = frame,
        who = who,
        why = why,
        questId = dialogQuestId(),
        startItemId = plainNumber(startItemId),
        pos = type(pos) == "table" and pos or nil,
    }
    if type(who) == "table" and who.kind == "GameObject" then
        local name = who.name
        if name == nil and frame == "text" and type(ItemTextGetItem) == "function" then
            name = plainString(safe(ItemTextGetItem))
        end
        AdventureLog.noteObjectUse({ via = frame, objectId = who.id, name = name, questId = interaction.questId })
    end
    noteActivity()
end

-- GOSSIP_CLOSED can arrive after QUEST_DETAIL has replaced the gossip, so
-- each close only ends its own kind of dialog.
local function closeInteraction(event)
    if not interaction or interaction.closedAt ~= nil then
        return
    end
    local isGossip = interaction.frame == "gossip"
    if (event == "GOSSIP_CLOSED") ~= isGossip then
        return
    end
    interaction.closedAt = nowT()
end

-- Fields describing the NPC/object of the dialog that led to questId, under a
-- prefix ("giver" on accept, "ender" on turn-in), or prefix.."Err".
local function dialogFields(fields, prefix, questId)
    local it = interaction
    local now = nowT()
    local fresh = it ~= nil
    if fresh and now and it.at and now - it.at > 120 then
        fresh = false
    end
    if fresh and now and it.closedAt and now - it.closedAt > 5 then
        fresh = false
    end
    if fresh and it.questId ~= nil and questId ~= nil and it.questId ~= questId then
        fresh = false
    end
    if not fresh then
        fields[prefix .. "Err"] = "no quest dialog"
        return
    end
    fields[prefix .. "Frame"] = it.frame
    if it.startItemId and it.startItemId > 0 then
        fields[prefix .. "ItemId"] = it.startItemId
    end
    local who = it.who
    if type(who) == "table" then
        if who.kind then
            fields[prefix .. "Type"] = who.kind
        end
        if who.kind == "GameObject" then
            fields[prefix .. "ObjectId"] = who.id
        elseif who.id then
            fields[prefix .. "NpcId"] = who.id
        end
        if who.name then
            fields[prefix .. "Name"] = who.name
        elseif who.nameSecret then
            fields[prefix .. "NameSecret"] = true
        end
    else
        fields[prefix .. "Err"] = it.why or "no npc unit"
    end
    local pos = it.pos
    if type(pos) == "table" then
        if plainNumber(pos.map) then
            fields[prefix .. "Map"] = pos.map
        end
        if plainNumber(pos.x) then
            fields[prefix .. "X"] = pos.x
        end
        if plainNumber(pos.y) then
            fields[prefix .. "Y"] = pos.y
        end
    end
end

local function questItems(kind, count)
    local list = {}
    if not plainNumber(count) or count < 1 then
        return list
    end
    if count > 10 then
        count = 10
    end
    for i = 1, count do
        local row = { index = i }
        if type(GetQuestItemInfo) == "function" then
            -- Packed pcall: safe() keeps only four returns and itemID is the sixth.
            local packed = { pcall(GetQuestItemInfo, kind, i) }
            local name, num, quality, itemId = nil, nil, nil, nil
            if packed[1] then
                name, num, quality, itemId = packed[2], packed[4], packed[5], packed[7]
            end
            if plainString(name) and name ~= "" then
                row.name = name
            end
            if plainNumber(num) then
                row.count = num
            end
            if plainNumber(quality) then
                row.quality = quality
            end
            if plainNumber(itemId) and itemId > 0 then
                row.itemId = itemId
            end
        end
        if row.itemId == nil and type(GetQuestItemLink) == "function" then
            row.itemId = itemIdFromLink(safe(GetQuestItemLink, kind, i))
        end
        list[#list + 1] = row
    end
    return list
end

local function onQuestComplete()
    readInteraction("complete")
    local questId = interaction and interaction.questId
    local rec = { at = nowT() }
    if type(GetNumQuestChoices) == "function" then
        rec.choices = questItems("choice", plainNumber(safe(GetNumQuestChoices)))
    else
        rec.choicesErr = "not a function"
    end
    if type(GetNumQuestRewards) == "function" then
        rec.items = questItems("reward", plainNumber(safe(GetNumQuestRewards)))
    end
    if type(GetRewardMoney) == "function" then
        rec.money = plainNumber(safe(GetRewardMoney))
    end
    if type(GetRewardXP) == "function" then
        rec.xp = plainNumber(safe(GetRewardXP))
    end
    pendingRewards[questId or 0] = rec
end

local function onGetQuestReward(choice)
    lastChoice = { index = plainNumber(choice), at = nowT(), questId = dialogQuestId() }
end

if type(hooksecurefunc) == "function" and type(GetQuestReward) == "function" then
    pcall(hooksecurefunc, "GetQuestReward", function(choice)
        pcall(onGetQuestReward, choice)
    end)
    AdventureLog.questRewardHook = true
else
    AdventureLog.questRewardHook = false
end

local function rewardFields(fields, questId)
    local rec = pendingRewards[questId] or pendingRewards[0]
    pendingRewards[questId] = nil
    pendingRewards[0] = nil
    local now = nowT()
    if not rec or (now and rec.at and now - rec.at > 300) then
        fields.rewardErr = "no reward dialog"
        return
    end
    local choices = rec.choices
    if type(choices) == "table" then
        if #choices > 0 then
            fields.rewardChoices = choices
        end
    elseif rec.choicesErr then
        fields.rewardChoicesErr = rec.choicesErr
    end
    if type(rec.items) == "table" and #rec.items > 0 then
        fields.rewardItems = rec.items
    end
    if rec.money then
        fields.rewardMoney = rec.money
    end
    if rec.xp then
        fields.rewardXp = rec.xp
    end
    if type(choices) ~= "table" or #choices == 0 then
        return
    end
    local pick = nil
    local c = lastChoice
    lastChoice = nil
    if c and c.index and (c.questId == nil or c.questId == questId) and not (now and c.at and now - c.at > 30) then
        pick = choices[c.index]
    end
    if pick == nil and #choices == 1 then
        pick = choices[1]
    end
    if pick then
        fields.chosenIndex = pick.index
        if pick.itemId then
            fields.chosenItemId = pick.itemId
        end
        if pick.name then
            fields.chosenName = pick.name
        end
    elseif not AdventureLog.questRewardHook then
        fields.chosenErr = "GetQuestReward hook unavailable"
    else
        fields.chosenErr = "choice not seen"
    end
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

-- "0/10   slain" or "0/10  ": the client has not loaded the mob/item name yet.
local function textIncomplete(text)
    if type(text) ~= "string" then
        return false
    end
    local rest = string.gsub(text, "^%s*%d+%s*/%s*%d+", "")
    rest = string.gsub(rest, "^%s+", "")
    rest = string.gsub(rest, "%s+$", "")
    return rest == "" or rest == "slain"
end

local function copyObjective(raw)
    if type(raw) ~= "table" then
        return nil
    end
    local row = {}
    local text = plainString(raw.text)
    if text ~= nil then
        row.text = text
        if textIncomplete(text) then
            row.textIncomplete = true
        end
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
    local incomplete = false
    local limit = #objs
    if limit > 20 then
        limit = 20
    end
    for i = 1, limit do
        local row = copyObjective(objs[i])
        if row ~= nil then
            out[#out + 1] = row
            if row.textIncomplete then
                incomplete = true
            end
            if type(row.numFulfilled) == "number" then
                parts[#parts + 1] = tostring(row.numFulfilled)
            else
                parts[#parts + 1] = "?"
            end
        end
    end
    return out, table.concat(parts, ","), incomplete
end

-- Quests whose last logged objectives had blank names. When the names load,
-- quest_progress is logged again with namesResolved = true even if no count changed.
local namesPending = {}

local function considerProgress(questId, objectives, sig, recordInitial, incomplete)
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
    local resolved = (not incomplete) and namesPending[questId] == true
    if prev == sig and not resolved then
        return
    end
    if prev == nil and not recordInitial then
        objSig[questId] = sig
        if incomplete then
            namesPending[questId] = true
        end
        return
    end
    objSig[questId] = sig
    local fields = {
        e = "quest_progress",
        questId = questId,
        objectives = objectives,
    }
    if incomplete then
        namesPending[questId] = true
        fields.namesPending = true
    elseif resolved then
        namesPending[questId] = nil
        fields.namesResolved = true
    end
    emit(fields)
end

local function recheckNames(questId, tries)
    if not namesPending[questId] then
        return
    end
    if C_QuestLog and type(C_QuestLog.RequestLoadQuestByID) == "function" then
        safe(C_QuestLog.RequestLoadQuestByID, questId)
    end
    local objectives, sig, incomplete = readObjectives(questId)
    considerProgress(questId, objectives, sig, true, incomplete)
    if namesPending[questId] and tries > 1 then
        after(3, function()
            recheckNames(questId, tries - 1)
        end)
    end
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
            local objectives, sig, incomplete = readObjectives(questId)
            considerProgress(questId, objectives, sig, false, incomplete)
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
    dialogFields(fields, "giver", questId)
    emit(fields)
    noteActivity()
    if C_QuestLog and type(C_QuestLog.RequestLoadQuestByID) == "function" then
        safe(C_QuestLog.RequestLoadQuestByID, questId)
    end
    scheduleLog()
    -- Objective names often load after the accept; look again a few times.
    after(1, function()
        local objectives, sig, incomplete = readObjectives(questId)
        considerProgress(questId, objectives, sig, true, incomplete)
        recheckNames(questId, 6)
    end)
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

-- XP attribution state (item 5). Filled by the XP chat line, Combat's kill,
-- the turn-in and the exploration message; read when PLAYER_XP_UPDATE arrives.
local lastXpChat = nil
local lastTurnin = nil
local lastExplore = nil
local pendingXp = nil
local XP_WINDOW = 2
local commitXp

-- Abandons waiting to be confirmed (item 2): item-collection quests are removed
-- from the log just before QUEST_TURNED_IN fires.
local pendingRemoval = {}

local function onTurnIn(_, questId, xpReward, moneyReward)
    questId = plainNumber(questId)
    if questId == nil then
        return
    end
    if pendingRemoval[questId] then
        -- Removed first, turned in now: not an abandon.
        pendingRemoval[questId] = nil
    else
        turnedIn[questId] = true
    end
    readySeen[questId] = true
    lastTurnin = { at = nowT(), questId = questId, xp = plainNumber(xpReward) }
    if pendingXp then
        commitXp()
    end
    local fields = { e = "quest_turnin", questId = questId }
    dialogFields(fields, "ender", questId)
    rewardFields(fields, questId)
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
    namesPending[questId] = nil
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
    fields.raw = { "QUEST_REMOVED", questId }
    local event = prepare(fields)
    local function settle()
        if pendingRemoval[questId] ~= event then
            return
        end
        pendingRemoval[questId] = nil
        if C_QuestLog and type(C_QuestLog.IsQuestFlaggedCompleted) == "function" then
            local done = safe(C_QuestLog.IsQuestFlaggedCompleted, questId)
            if done == true and not isSecret(done) then
                return
            end
        end
        AdventureLog.record(event)
    end
    pendingRemoval[questId] = event
    -- Wait for a QUEST_TURNED_IN that may follow; log the abandon only if none does.
    if not after(1.5, settle) then
        settle()
    end
end

local function onQuestData(_, questId, success)
    questId = plainNumber(questId)
    if questId == nil or success ~= true then
        return
    end
    local objectives, sig, incomplete = readObjectives(questId)
    if type(objectives) ~= "table" or #objectives == 0 then
        return
    end
    considerProgress(questId, objectives, sig, acceptedThisSession[questId] == true, incomplete)
    noteReady(questId)
end

local lastXpMax = nil
local lastRested = nil

local function fresh(rec, now)
    if type(rec) ~= "table" or not rec.at or not now then
        return false
    end
    return now - rec.at <= XP_WINDOW
end

-- source: "kill" (a kill XP line just before), "quest" (a turn-in just before
-- or just after), "explore" (a discovery message), else "other".
local function classifyXp(event, final)
    local now = nowT()
    local gained = event.gained
    local chat = lastXpChat
    if fresh(chat, now) and chat.kind == "kill" then
        if gained ~= nil and chat.amount ~= nil and chat.amount ~= gained then
            event.chatAmount = chat.amount
        end
        event.source = "kill"
        if chat.mob then
            event.mob = chat.mob
        end
        if chat.restedBonus then
            event.restedBonus = chat.restedBonus
        end
        if chat.groupBonus then
            event.groupBonus = chat.groupBonus
        end
        local kill = AdventureLog.lastKill
        if fresh(kill, now) and type(kill.npcId) == "number" and (chat.mob == nil or kill.name == chat.mob) then
            event.npcId = kill.npcId
        end
        lastXpChat = nil
        return true
    end
    if fresh(lastTurnin, now) then
        event.source = "quest"
        event.questId = lastTurnin.questId
        lastTurnin = nil
        return true
    end
    if fresh(lastExplore, now) then
        event.source = "explore"
        if lastExplore.area then
            event.area = lastExplore.area
        end
        lastExplore = nil
        return true
    end
    if final then
        event.source = "other"
        return true
    end
    return false
end

commitXp = function()
    local event = pendingXp
    pendingXp = nil
    if not event then
        return
    end
    classifyXp(event, true)
    AdventureLog.record(event)
end

local function onXp(_, unit)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    if pendingXp then
        commitXp()
    end
    local fields = { e = "xp" }
    local xp, xpErr = safe(UnitXP, "player")
    local xpMax, xpMaxErr = safe(UnitXPMax, "player")
    if isSecret(xp) then
        fields.xpSecret = true
    elseif type(xp) == "number" then
        fields.xp = xp
        if lastXp ~= nil then
            fields.delta = xp - lastXp
            -- delta goes negative across a level; gained adds what was left of
            -- the old level's bar.
            if xp >= lastXp then
                fields.gained = xp - lastXp
            elseif type(lastXpMax) == "number" then
                fields.gained = (lastXpMax - lastXp) + xp
                fields.levelCrossed = true
            end
        end
        lastXp = xp
    else
        fields.xpErr = xpErr or "UnitXP failed"
    end
    if isSecret(xpMax) then
        fields.xpMaxSecret = true
    elseif type(xpMax) == "number" then
        fields.xpMax = xpMax
        lastXpMax = xpMax
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
    -- Rested pool used by this gain (GetXPExhaustion is nil once the pool is empty).
    if not isSecret(rested) and (rested == nil or type(rested) == "number") then
        local now = rested or 0
        if type(lastRested) == "number" and lastRested > now then
            fields.restedUsed = lastRested - now
        end
        lastRested = now
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
    fields.raw = { "PLAYER_XP_UPDATE", "player" }
    local event = prepare(fields)
    noteActivity()
    if classifyXp(event, false) then
        AdventureLog.record(event)
        return
    end
    -- Unknown yet: an item-quest turn-in fires QUEST_TURNED_IN after the XP.
    pendingXp = event
    if not after(1, commitXp) then
        commitXp()
    end
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
    local chat = { at = nowT() }
    if amount ~= nil then
        fields.source = "kill"
        fields.amount = tonumber(amount)
        chat.kind = "kill"
        if type(mob) == "string" and not isSecret(mob) then
            fields.mob = mob
            chat.mob = mob
        end
    else
        local plain = string.match(text, "^You gain (%d+) experience")
        if plain then
            fields.amount = tonumber(plain)
            chat.kind = "plain"
        end
    end
    chat.amount = fields.amount
    local rested = string.match(text, "%(%+(%d+) exp [Rr]ested bonus%)")
    if rested then
        fields.restedBonus = tonumber(rested)
        chat.restedBonus = fields.restedBonus
    end
    local group = string.match(text, "%(%+(%d+) group bonus%)")
    if group then
        fields.groupBonus = tonumber(group)
        chat.groupBonus = fields.groupBonus
    end
    -- The kill line's amount already includes the bonuses (logs: "you gain 47
    -- experience. (+5 group bonus)" is followed by an XP delta of 47).
    lastXpChat = chat
    emit(fields)
    noteActivity()
end

-- Exploration XP arrives as a system message ("Discovered <area>: N experience gained").
local explorePattern = nil
local function onSystemChat(_, text)
    if type(text) ~= "string" or isSecret(text) then
        return
    end
    if explorePattern == nil then
        explorePattern = "^Discovered (.+): (%d+) experience gained"
        local fmt = _G.ERR_ZONE_EXPLORED_XP
        if type(fmt) == "string" and not isSecret(fmt) then
            local p = string.gsub(fmt, "([%(%)%.%+%-%*%?%[%]%^%$])", "%%%1")
            p = string.gsub(p, "%%s", "(.+)", 1)
            p = string.gsub(p, "%%d", "(%%d+)", 1)
            explorePattern = "^" .. p
        end
    end
    local area, amount = string.match(text, explorePattern)
    if not amount then
        return
    end
    lastExplore = { at = nowT(), area = area, amount = tonumber(amount) }
    if pendingXp then
        commitXp()
    end
end

-- PLAYER_LEVEL_UP's first argument is the new level. level is kept as before
-- (UnitLevel at the event, which is still the level you left); from/to are explicit.
local function onLevel(_, newLevel)
    local fields = { e = "level_up" }
    local level, err = safe(UnitLevel, "player")
    if isSecret(level) then
        fields.levelSecret = true
    elseif type(level) == "number" then
        fields.level = level
    else
        fields.levelErr = err or "UnitLevel failed"
    end
    local to = plainNumber(newLevel)
    if to == nil and type(fields.level) == "number" then
        to = fields.level + 1
        fields.toErr = "no level argument"
    end
    if to ~= nil then
        fields.to = to
        fields.from = to - 1
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
    lastXpMax = plainNumber(safe(UnitXPMax, "player"))
    local rested = safe(GetXPExhaustion)
    if rested == nil or plainNumber(rested) then
        lastRested = rested or 0
    end
end)
AdventureLog.on("QUEST_GREETING", function()
    readInteraction("greeting")
end)
AdventureLog.on("QUEST_DETAIL", function(_, questStartItemID)
    readInteraction("detail", questStartItemID)
end)
AdventureLog.on("QUEST_PROGRESS", function()
    readInteraction("progress")
end)
AdventureLog.on("QUEST_COMPLETE", onQuestComplete)
AdventureLog.on("QUEST_FINISHED", closeInteraction)
AdventureLog.on("GOSSIP_SHOW", function()
    readInteraction("gossip")
end)
AdventureLog.on("GOSSIP_CLOSED", closeInteraction)
AdventureLog.on("ITEM_TEXT_BEGIN", function()
    readInteraction("text")
end)
AdventureLog.on("PLAYER_SOFT_INTERACT_CHANGED", onSoftInteract)
AdventureLog.on("UNIT_SPELLCAST_SENT", onSpellSent, "player")
AdventureLog.on("UNIT_SPELLCAST_SUCCEEDED", onSpellDone, "player")
AdventureLog.on("CHAT_MSG_SYSTEM", onSystemChat)
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
    -- Timers do not run after logout: record what is still waiting.
    if pendingXp then
        commitXp()
    end
    for questId, event in pairs(pendingRemoval) do
        pendingRemoval[questId] = nil
        AdventureLog.record(event)
    end
end)
AdventureLog.on("CHAT_MSG_COMBAT_XP_GAIN", onXpChat)
AdventureLog.on("PLAYER_LEVEL_UP", onLevel)

startTicker()
