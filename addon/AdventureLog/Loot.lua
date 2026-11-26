-- Loot, vendor, skills, gathering, idle, and AFK.
-- Lua 5.1. No combat log.

if not AdventureLog then return end

local lastActivity = 0
local idle = false
local idleSince = nil
local afk = false
local afkSince = nil
local afkCovered = {}
local afkAccumulatedUntil = 0

local lootWindow = false
local lootRecorded = false

local merchantMoney = nil
local merchantMoneyErr = nil
local merchantMoneySecret = false

local skillRank = {}
local skillsReady = false
local idleTicker = nil
local idleStop = false
local spellsPending = false

local MAX_SLOTS = 20

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

local function plainNumber(v)
    return type(v) == "number" and not isSecret(v)
end

local function plainString(v)
    return type(v) == "string" and not isSecret(v)
end

local function emit(event)
    local pos = AdventureLog.position()
    if type(pos) == "table" then
        for k, v in pairs(pos) do
            if event[k] == nil then
                event[k] = v
            end
        end
    end
    AdventureLog.record(event)
end

local function nowSeconds()
    local now, err = AdventureLog.safe(GetTime)
    if isSecret(now) then
        return nil, "secret"
    end
    if type(now) ~= "number" then
        return nil, err or "GetTime failed"
    end
    return now
end

-- Union of idle and AFK intervals. afkAccumulatedUntil is the end of the
-- latest covered range; overlapping seconds are added once.
-- Returns the seconds newly added to AdventureLog.afkTotal (0 when the span was
-- already covered by an overlapping idle/AFK span).
local function creditAfk(from, to)
    if not plainNumber(from) or not plainNumber(to) or to <= from then
        return 0
    end
    local add = to - from
    local i = 1
    while i <= #afkCovered do
        local span = afkCovered[i]
        local left = from
        if span[1] > left then
            left = span[1]
        end
        local right = to
        if span[2] < right then
            right = span[2]
        end
        if right > left then
            add = add - (right - left)
        end
        i = i + 1
    end
    if add < 0 then
        add = 0
    end
    if add > 0 then
        local total = AdventureLog.afkTotal
        if type(total) ~= "number" then
            total = 0
        end
        AdventureLog.afkTotal = total + add
    end
    afkCovered[#afkCovered + 1] = { from, to }
    table.sort(afkCovered, function(a, b)
        return a[1] < b[1]
    end)
    local merged = {}
    i = 1
    while i <= #afkCovered do
        local cur = afkCovered[i]
        local last = merged[#merged]
        if last and cur[1] <= last[2] then
            if cur[2] > last[2] then
                last[2] = cur[2]
            end
        else
            merged[#merged + 1] = { cur[1], cur[2] }
        end
        i = i + 1
    end
    afkCovered = merged
    if #afkCovered > 0 then
        afkAccumulatedUntil = afkCovered[#afkCovered][2]
    end
    return add
end

-- idle_end / afk_end carry dur (this span) and credited (seconds this span
-- added to the session's away total, after removing overlap with the other
-- kind). Summing credited gives the away time without double counting.
local function endIdle(now, reason)
    local start = idleSince
    idle = false
    idleSince = nil
    local ev = { e = "idle_end" }
    if plainNumber(start) and plainNumber(now) then
        ev.dur = now - start
        ev.credited = creditAfk(start, now)
    else
        ev.durErr = "idle start missing"
    end
    if reason then
        ev.closedBy = reason
    end
    emit(ev)
end

local function endAfk(now, reason)
    local start = afkSince
    afk = false
    afkSince = nil
    local ev = { e = "afk_end" }
    if plainNumber(start) and plainNumber(now) then
        ev.dur = now - start
        ev.credited = creditAfk(start, now)
    else
        ev.durErr = "afk clock failed"
    end
    if reason then
        ev.closedBy = reason
    end
    emit(ev)
end

function AdventureLog.noteActivity()
    local now = nowSeconds()
    if not now then
        lastActivity = 0
        return
    end
    lastActivity = now
    if not idle then
        return
    end
    endIdle(now)
end

-- Called by AdventureLog.lua on logout before session_end: an idle or AFK span
-- still open when you log out is closed and counted.
function AdventureLog.closeAway(reason)
    local now = nowSeconds()
    if idle then
        endIdle(now, reason)
    end
    if afk then
        endAfk(now, reason)
    end
end

-- True while an idle or AFK span is open.
function AdventureLog.isAway()
    return idle or afk
end

local function checkIdle()
    if idle or AdventureLog.paused then
        return
    end
    local now = nowSeconds()
    if not now then
        return
    end
    if now - lastActivity > 180 then
        idle = true
        idleSince = now
        emit({ e = "idle_start" })
    end
end

local function armIdleTicker()
    local function tick()
        checkIdle()
    end
    if C_Timer and type(C_Timer.NewTicker) == "function" then
        local ok, ticker = pcall(C_Timer.NewTicker, 30, tick)
        if ok then
            idleTicker = ticker
            return
        end
    end
    if not (C_Timer and type(C_Timer.After) == "function") then
        return
    end
    local function again()
        if idleStop then
            return
        end
        tick()
        pcall(C_Timer.After, 30, again)
    end
    pcall(C_Timer.After, 30, again)
end

local function stopIdleTicker()
    idleStop = true
    if type(idleTicker) == "table" and type(idleTicker.Cancel) == "function" then
        pcall(idleTicker.Cancel, idleTicker)
    end
    idleTicker = nil
end

local function guidNpcId(guid)
    if isSecret(guid) then
        return nil, "secret"
    end
    if type(guid) ~= "string" then
        return nil
    end
    local kind = string.match(guid, "^([^%-]+)")
    if kind == "Player" then
        return nil, "player"
    end
    if kind ~= "Creature" and kind ~= "Vehicle" and kind ~= "GameObject" then
        return nil
    end
    local index = 0
    local npcId = nil
    for part in string.gmatch(guid, "[^%-]+") do
        index = index + 1
        if index == 6 then
            npcId = tonumber(part)
        end
    end
    return npcId, nil, kind
end

local function readSlot(slot)
    local entry = { slot = slot }
    if type(GetLootSlotInfo) ~= "function" then
        entry.slotErr = "not a function"
    else
        local packed = { pcall(GetLootSlotInfo, slot) }
        if not packed[1] then
            entry.slotErr = packed[2]
        else
            local name = packed[3]
            local quantity = packed[4]
            local quality = packed[6]
            if isSecret(name) then
                entry.nameSecret = true
            elseif type(name) == "string" and name ~= "" then
                entry.name = name
            end
            if isSecret(quantity) then
                entry.countSecret = true
            elseif type(quantity) == "number" then
                entry.count = quantity
            end
            if isSecret(quality) then
                entry.qualitySecret = true
            elseif type(quality) == "number" then
                entry.quality = quality
            end
        end
    end

    if type(GetLootSlotLink) ~= "function" then
        entry.linkErr = "not a function"
    else
        local packed = { pcall(GetLootSlotLink, slot) }
        if not packed[1] then
            entry.linkErr = packed[2]
        elseif isSecret(packed[2]) then
            entry.linkSecret = true
        elseif type(packed[2]) == "string" then
            local id = string.match(packed[2], "item:(%d+)")
            if id then
                entry.itemId = tonumber(id)
            end
        end
    end

    if entry.itemId and not entry.name and C_Item and type(C_Item.GetItemInfo) == "function" then
        local a, b, c = AdventureLog.safe(C_Item.GetItemInfo, entry.itemId)
        if a == nil and type(b) == "string" and c == nil then
            entry.nameErr = b
        elseif isSecret(a) then
            entry.nameSecret = true
        elseif type(a) == "string" and a ~= "" then
            entry.name = a
            if entry.quality == nil and plainNumber(c) then
                entry.quality = c
            elseif entry.quality == nil and isSecret(c) then
                entry.qualitySecret = true
            end
        end
    end

    local sawSource = false
    local dropNpc = false
    local npcId = nil
    local sourceKind = nil
    if type(GetLootSourceInfo) ~= "function" then
        entry.sourceErr = "not a function"
    else
        local packed = { pcall(GetLootSourceInfo, slot) }
        if not packed[1] then
            entry.sourceErr = packed[2]
        else
            local i = 2
            while i <= #packed do
                local guid = packed[i]
                if isSecret(guid) then
                    entry.sourceSecret = true
                    dropNpc = true
                elseif type(guid) == "string" then
                    sawSource = true
                    local id, why, kind = guidNpcId(guid)
                    if why == "player" or why == "secret" then
                        dropNpc = true
                    elseif type(id) == "number" and npcId == nil then
                        npcId = id
                        sourceKind = kind
                    end
                end
                i = i + 2
            end
        end
    end
    if sawSource and not dropNpc and type(npcId) == "number" then
        -- npcId is kept for old readers; for a GameObject it is the object id.
        entry.npcId = npcId
        if type(sourceKind) == "string" then
            entry.sourceType = sourceKind
        end
        if sourceKind == "GameObject" then
            entry.objectId = npcId
        end
    end
    if not entry.itemId and not entry.name then
        entry.empty = true
        if sawSource and not dropNpc and type(npcId) == "number" then
            entry.npcId = npcId
        end
    end
    return entry
end

local function buildLoot(autoLoot, isFromItem)
    local ev = { e = "loot", slots = {} }
    if isSecret(autoLoot) then
        ev.autoLootSecret = true
    elseif type(autoLoot) == "boolean" then
        ev.autoLoot = autoLoot
    end
    if isSecret(isFromItem) then
        ev.isFromItemSecret = true
    elseif type(isFromItem) == "boolean" then
        ev.isFromItem = isFromItem
    end

    if type(GetNumLootItems) ~= "function" then
        ev.numErr = "not a function"
        return ev, 0
    end
    local ok, num = pcall(GetNumLootItems)
    if not ok then
        ev.numErr = num
        return ev, 0
    end
    if isSecret(num) then
        ev.numSecret = true
        return ev, 0
    end
    if type(num) ~= "number" then
        ev.numErr = "GetNumLootItems failed"
        return ev, 0
    end
    ev.num = num
    local limit = num
    if limit > MAX_SLOTS then
        limit = MAX_SLOTS
        ev.slotsTruncated = true
    end
    if limit < 1 then
        return ev, 0
    end
    local n = 0
    local slot = 1
    while slot <= limit do
        n = n + 1
        ev.slots[n] = readSlot(slot)
        slot = slot + 1
    end
    return ev, n
end

local function publishLoot(fromClose, autoLoot, isFromItem)
    if lootRecorded then
        return
    end
    local ev, n = buildLoot(autoLoot, isFromItem)
    if n < 1 and not fromClose then
        return
    end
    if fromClose and not lootWindow and n < 1 then
        return
    end
    emit(ev)
    lootRecorded = true
    -- Looting a world object (quest pickup, chest, herb node) is an object use.
    if type(AdventureLog.noteObjectUse) == "function" and type(ev.slots) == "table" then
        local objectId, items = nil, {}
        for i = 1, #ev.slots do
            local slot = ev.slots[i]
            if type(slot) == "table" and slot.sourceType == "GameObject" and type(slot.objectId) == "number" then
                objectId = objectId or slot.objectId
                if type(slot.itemId) == "number" then
                    items[#items + 1] = slot.itemId
                end
            end
        end
        if objectId then
            pcall(AdventureLog.noteObjectUse, { via = "loot", objectId = objectId, itemIds = items })
        end
    end
end

local function itemIdFromText(text)
    if type(text) ~= "string" then
        return nil
    end
    local id = string.match(text, "item:(%d+)")
    if id then
        return tonumber(id)
    end
    return nil
end

-- Privacy: loot and money messages about other players name them ("Thrall receives loot: ...").
-- Only messages about the player keep their text. A message counts as the player's own when it
-- matches one of the client's own "self" format strings (so it works in every locale), or, if
-- none of those globals exist, when it starts with "You" / "Your".
local SELF_FORMATS = {
    "LOOT_ITEM_SELF", "LOOT_ITEM_SELF_MULTIPLE",
    "LOOT_ITEM_PUSHED_SELF", "LOOT_ITEM_PUSHED_SELF_MULTIPLE",
    "LOOT_ITEM_CREATED_SELF", "LOOT_ITEM_CREATED_SELF_MULTIPLE",
    "LOOT_ITEM_REFUND", "LOOT_ITEM_REFUND_MULTIPLE",
    "LOOT_ROLL_YOU_WON", "LOOT_ROLL_NEED_SELF", "LOOT_ROLL_GREED_SELF", "LOOT_ROLL_PASSED_SELF",
    "YOU_LOOT_MONEY", "YOU_LOOT_MONEY_GUILD", "LOOT_MONEY_SPLIT", "LOOT_MONEY_SPLIT_GUILD",
    "LOOT_MONEY_REFUND",
}

local selfPatterns = nil

local function formatToPattern(fmt)
    local p = string.gsub(fmt, "([%(%)%.%%%+%-%*%?%[%]%^%$])", "%%%1")
    p = string.gsub(p, "%%%%%d+%%%$[sd]", ".+")
    p = string.gsub(p, "%%%%s", ".+")
    p = string.gsub(p, "%%%%d", "%%d+")
    return "^" .. p .. "$"
end

local function buildSelfPatterns()
    local list = {}
    for _, name in ipairs(SELF_FORMATS) do
        local fmt = _G[name]
        if type(fmt) == "string" and fmt ~= "" and not isSecret(fmt) then
            list[#list + 1] = formatToPattern(fmt)
        end
    end
    return list
end

local function isSelfMessage(text)
    if selfPatterns == nil then
        selfPatterns = buildSelfPatterns()
    end
    if #selfPatterns == 0 then
        return string.find(text, "^You[r ]") ~= nil
    end
    for _, p in ipairs(selfPatterns) do
        if string.find(text, p) then
            return true
        end
    end
    return false
end

AdventureLog.isSelfLootMessage = isSelfMessage

local function chatEvent(kind, text)
    local ev = { e = kind }
    if isSecret(text) then
        ev.textSecret = true
    elseif type(text) ~= "string" then
        ev.textErr = "missing"
    elseif not isSelfMessage(text) then
        -- About someone else: keep that it happened, never their name or the message.
        ev.textOther = true
    else
        ev.text = text
        local itemId = itemIdFromText(text)
        if itemId then
            ev.itemId = itemId
        end
    end
    if kind == "money_chat" then
        local money, err = AdventureLog.safe(GetMoney)
        if isSecret(money) then
            ev.moneySecret = true
        elseif type(money) ~= "number" then
            ev.moneyErr = err or "GetMoney failed"
        else
            ev.money = money
        end
    end
    emit(ev)
end

local function rememberMoney()
    merchantMoney = nil
    merchantMoneyErr = nil
    merchantMoneySecret = false
    local money, err = AdventureLog.safe(GetMoney)
    if isSecret(money) then
        merchantMoneySecret = true
    elseif type(money) ~= "number" then
        merchantMoneyErr = err or "GetMoney failed"
    else
        merchantMoney = money
    end
end

local function closeMerchant()
    local ev = { e = "vendor" }
    local money, err = AdventureLog.safe(GetMoney)
    if merchantMoneySecret or isSecret(money) then
        ev.deltaSecret = true
    elseif type(merchantMoney) ~= "number" or type(money) ~= "number" then
        ev.deltaErr = merchantMoneyErr or err or "GetMoney failed"
    else
        ev.delta = money - merchantMoney
        if ev.delta < 0 then
            ev.spent = -ev.delta
        end
    end
    merchantMoney = nil
    merchantMoneyErr = nil
    merchantMoneySecret = false
    emit(ev)
end

local function skillLineAt(index)
    if not (C_SkillInfo and type(C_SkillInfo.GetSkillLineInfo) == "function") then
        return nil, "not a function"
    end
    local packed = { pcall(C_SkillInfo.GetSkillLineInfo, index) }
    if not packed[1] then
        return nil, packed[2]
    end
    if isSecret(packed[2]) then
        return nil, "secret"
    end
    if type(packed[2]) ~= "table" then
        return nil, "GetSkillLineInfo failed"
    end
    return packed[2]
end

local function onSkills()
    if not (C_SkillInfo and type(C_SkillInfo.GetNumSkillLines) == "function") then
        emit({ e = "skill", numErr = "not a function" })
        return
    end
    local num, err = AdventureLog.safe(C_SkillInfo.GetNumSkillLines)
    if isSecret(num) then
        emit({ e = "skill", numSecret = true })
        return
    end
    if type(num) ~= "number" then
        emit({ e = "skill", numErr = err or "GetNumSkillLines failed" })
        return
    end
    -- Never expand or collapse headers here: each call fires SKILL_LINES_CHANGED,
    -- which re-enters this scan.
    if num > 100 then
        num = 100
    end
    local seen = {}
    local i = 1
    while i <= num do
        local info, lineErr = skillLineAt(i)
        if type(info) ~= "table" then
            if skillsReady then
                emit({ e = "skill", index = i, lineErr = lineErr or "GetSkillLineInfo failed" })
            end
        elseif isSecret(info.isHeader) or info.isHeader then
            -- headers are not ranks
        elseif isSecret(info.skillID) or isSecret(info.rank) then
            if skillsReady then
                emit({ e = "skill", index = i, rankSecret = true })
            end
        elseif type(info.skillID) == "number" and type(info.rank) == "number" then
            seen[info.skillID] = true
            local prev = skillRank[info.skillID]
            if skillsReady and prev ~= info.rank then
                local ev = {
                    e = "skill",
                    skillId = info.skillID,
                    rank = info.rank,
                }
                if type(prev) == "number" then
                    ev.prev = prev
                end
                if isSecret(info.name) then
                    ev.nameSecret = true
                elseif type(info.name) == "string" then
                    ev.name = info.name
                end
                emit(ev)
            end
            skillRank[info.skillID] = info.rank
        elseif skillsReady then
            emit({ e = "skill", index = i, lineErr = "skill line missing id" })
        end
        i = i + 1
    end
    skillsReady = true
    for id in pairs(skillRank) do
        if not seen[id] then
            skillRank[id] = nil
        end
    end
end

local function spellNameOf(spellId)
    if C_Spell and type(C_Spell.GetSpellName) == "function" then
        local name, err = AdventureLog.safe(C_Spell.GetSpellName, spellId)
        return name, err
    end
    if C_Spell and type(C_Spell.GetSpellInfo) == "function" then
        local info, err = AdventureLog.safe(C_Spell.GetSpellInfo, spellId)
        if type(info) == "table" then
            return info.name, nil
        end
        return nil, err
    end
    if type(GetSpellInfo) == "function" then
        local name, err = AdventureLog.safe(GetSpellInfo, spellId)
        return name, err
    end
    return nil, "not a function"
end

local function isGatherName(name)
    local n = string.lower(name)
    if string.find(n, "herb", 1, true) then
        return true
    end
    if string.find(n, "mining", 1, true) then
        return true
    end
    if string.find(n, "pick pocket", 1, true) then
        return true
    end
    if string.find(n, "skinning", 1, true) then
        return true
    end
    return false
end

local function trainerName()
    local player = nil
    if type(UnitIsPlayer) == "function" then
        local flag = AdventureLog.safe(UnitIsPlayer, "npc")
        if isSecret(flag) then
            return nil, "secret"
        end
        if flag == true then
            return nil, "player"
        end
        player = flag
    end
    if player == nil and type(UnitGUID) == "function" then
        local guid = AdventureLog.safe(UnitGUID, "npc")
        if isSecret(guid) then
            return nil, "secret"
        end
        if type(guid) == "string" and string.sub(guid, 1, 7) == "Player-" then
            return nil, "player"
        end
    end
    if type(UnitName) ~= "function" then
        return nil, "not a function"
    end
    local name, err = AdventureLog.safe(UnitName, "npc")
    if isSecret(name) then
        return nil, "secret"
    end
    if type(name) ~= "string" or name == "" then
        return nil, err or "UnitName failed"
    end
    return name
end

AdventureLog.on("LOOT_OPENED", function(_, autoLoot, isFromItem)
    if not lootWindow then
        lootRecorded = false
    end
    lootWindow = true
    publishLoot(false, autoLoot, isFromItem)
end)

AdventureLog.on("LOOT_READY", function()
    lootWindow = true
    publishLoot(false)
end)

AdventureLog.on("LOOT_CLOSED", function()
    publishLoot(true)
    lootWindow = false
    lootRecorded = false
end)

AdventureLog.on("CHAT_MSG_LOOT", function(_, text)
    chatEvent("loot_chat", text)
end)

AdventureLog.on("CHAT_MSG_MONEY", function(_, text)
    chatEvent("money_chat", text)
end)

AdventureLog.on("MERCHANT_SHOW", function()
    rememberMoney()
end)

AdventureLog.on("MERCHANT_CLOSED", function()
    closeMerchant()
end)

local skillsPending = false
AdventureLog.on("SKILL_LINES_CHANGED", function()
    if skillsPending then
        return
    end
    skillsPending = true
    local function fire()
        pcall(onSkills)
        skillsPending = false
    end
    if not (C_Timer and type(C_Timer.After) == "function" and pcall(C_Timer.After, 1, fire)) then
        pcall(fire)
        skillsPending = false
    end
end)

AdventureLog.on("SPELLS_CHANGED", function()
    if spellsPending then
        return
    end
    spellsPending = true
    local function fire()
        spellsPending = false
        emit({ e = "spells_changed" })
    end
    if C_Timer and type(C_Timer.After) == "function" then
        local ok = pcall(C_Timer.After, 0.2, fire)
        if ok then
            return
        end
    end
    spellsPending = false
    fire()
end)

AdventureLog.on("LEARNED_SPELL_IN_TAB", function(_, spellId)
    local ev = { e = "learned_spell" }
    if isSecret(spellId) then
        ev.spellIdSecret = true
    elseif type(spellId) == "number" then
        ev.spellId = spellId
    end
    emit(ev)
end)

-- Trainer purchases. The trainer UI calls BuyTrainerService(index); a post-hook
-- reads that service's name, rank text, cost and (when the client has them)
-- reagents. Forever's trainer UI has no reagent API, so reagentsErr is the usual
-- result. Money actually spent is the GetMoney difference at TRAINER_CLOSED.
local trainerOpen = nil
local TRAINER_TYPES = { [0] = "general", [1] = "talents", [2] = "tradeskills", [3] = "pet" }

local function trainerServiceInfo(index)
    local row = { index = index }
    if type(GetTrainerServiceInfo) ~= "function" then
        row.infoErr = "not a function"
    else
        -- Packed pcall: AdventureLog.safe keeps only four returns.
        local packed = { pcall(GetTrainerServiceInfo, index) }
        if not packed[1] then
            row.infoErr = tostring(packed[2])
        end
        local name, kind, reqLevel, subText, category = packed[2], packed[3], packed[5], packed[6], packed[7]
        if isSecret(name) then
            row.nameSecret = true
        elseif plainString(name) and name ~= "" then
            row.name = name
        else
            row.nameErr = "empty"
        end
        if plainString(kind) then
            row.serviceType = kind
        end
        if plainNumber(reqLevel) then
            row.reqLevel = reqLevel
        end
        if plainString(subText) and subText ~= "" then
            row.subText = subText
        end
        if plainString(category) and category ~= "" then
            row.category = category
        end
    end
    if type(GetTrainerServiceCost) == "function" then
        local cost, isProfession = AdventureLog.safe(GetTrainerServiceCost, index)
        if plainNumber(cost) then
            row.cost = cost
        elseif isSecret(cost) then
            row.costSecret = true
        end
        if type(isProfession) == "boolean" and not isSecret(isProfession) then
            row.isProfession = isProfession
        end
    else
        row.costErr = "not a function"
    end
    if type(GetTrainerServiceSkillLine) == "function" then
        local line = AdventureLog.safe(GetTrainerServiceSkillLine, index)
        if plainString(line) and line ~= "" then
            row.skillLine = line
        end
    end
    if type(GetTrainerServiceNumReagents) == "function" and type(GetTrainerServiceReagentInfo) == "function" then
        local n = AdventureLog.safe(GetTrainerServiceNumReagents, index)
        if plainNumber(n) then
            local reagents = {}
            local limit = n
            if limit > 10 then
                limit = 10
            end
            for r = 1, limit do
                local rName, _, rCount = AdventureLog.safe(GetTrainerServiceReagentInfo, index, r)
                local reagent = {}
                if plainString(rName) then
                    reagent.name = rName
                end
                if plainNumber(rCount) then
                    reagent.count = rCount
                end
                if type(GetTrainerServiceReagentLink) == "function" then
                    reagent.itemId = itemIdFromText(AdventureLog.safe(GetTrainerServiceReagentLink, index, r))
                end
                reagents[#reagents + 1] = reagent
            end
            row.reagents = reagents
        else
            row.reagentsErr = "GetTrainerServiceNumReagents failed"
        end
    else
        row.reagentsErr = "not a function"
    end
    return row
end

local function trainerTypeName()
    if C_Trainer and type(C_Trainer.GetTrainerType) == "function" then
        local kind = AdventureLog.safe(C_Trainer.GetTrainerType)
        if plainNumber(kind) then
            return TRAINER_TYPES[kind] or tostring(kind)
        end
    end
    if type(IsTradeskillTrainer) == "function" then
        local trade = AdventureLog.safe(IsTradeskillTrainer)
        if trade == true then
            return "tradeskills"
        end
    end
    return nil
end

AdventureLog.on("TRAINER_SHOW", function()
    local ev = { e = "trainer" }
    local name, why = trainerName()
    if why == "secret" then
        ev.nameSecret = true
    elseif why == "player" then
        ev.player = true
    elseif type(name) == "string" then
        ev.name = name
    elseif why then
        ev.nameErr = why
    end
    if why ~= "player" and type(AdventureLog.unitIdentity) == "function" then
        local who = AdventureLog.unitIdentity("npc")
        if type(who) == "table" and type(who.id) == "number" then
            ev.npcId = who.id
        end
    end
    local kind = trainerTypeName()
    if kind then
        ev.trainerType = kind
    end
    if type(GetNumTrainerServices) == "function" then
        local n = AdventureLog.safe(GetNumTrainerServices)
        if plainNumber(n) then
            ev.numServices = n
        end
    end
    local money = AdventureLog.safe(GetMoney)
    trainerOpen = { money = plainNumber(money) and money or nil, learned = {}, npcId = ev.npcId, name = ev.name }
    emit(ev)
end)

local function onTrainerBuy(index)
    if not plainNumber(index) then
        return
    end
    local ev = trainerServiceInfo(index)
    ev.e = "trainer_learn"
    if trainerOpen then
        ev.trainerNpcId = trainerOpen.npcId
        ev.trainerName = trainerOpen.name
        trainerOpen.learned[#trainerOpen.learned + 1] = ev.name or ("#" .. tostring(index))
    end
    emit(ev)
end

if type(hooksecurefunc) == "function" and type(BuyTrainerService) == "function" then
    pcall(hooksecurefunc, "BuyTrainerService", function(index)
        pcall(onTrainerBuy, index)
    end)
    AdventureLog.trainerHook = true
else
    AdventureLog.trainerHook = false
end

AdventureLog.on("TRAINER_CLOSED", function()
    if not trainerOpen then
        return
    end
    local ev = { e = "trainer_close", count = #trainerOpen.learned }
    if #trainerOpen.learned > 0 then
        ev.learned = trainerOpen.learned
    end
    local money, err = AdventureLog.safe(GetMoney)
    if plainNumber(money) and plainNumber(trainerOpen.money) then
        ev.spent = trainerOpen.money - money
    else
        ev.spentErr = err or "GetMoney failed"
    end
    if not AdventureLog.trainerHook then
        ev.learnedErr = "BuyTrainerService hook unavailable"
    end
    trainerOpen = nil
    emit(ev)
end)

AdventureLog.on("UNIT_SPELLCAST_SUCCEEDED", function(_, unit, _, spellId)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    AdventureLog.noteActivity()
    if isSecret(spellId) or type(spellId) ~= "number" then
        return
    end
    local name = spellNameOf(spellId)
    if isSecret(name) or type(name) ~= "string" then
        return
    end
    if not isGatherName(name) then
        return
    end
    emit({ e = "gather", spellId = spellId, spellName = name })
end, "player")

AdventureLog.on("PLAYER_FLAGS_CHANGED", function(_, unit)
    if isSecret(unit) or unit ~= "player" then
        return
    end
    if type(UnitIsAFK) ~= "function" then
        return
    end
    local flag, err = AdventureLog.safe(UnitIsAFK, "player")
    if isSecret(flag) then
        return
    end
    if type(flag) ~= "boolean" then
        return
    end
    if flag and not afk then
        afk = true
        afkSince = nowSeconds()
        emit({ e = "afk_start" })
    elseif (not flag) and afk then
        endAfk(nowSeconds())
    end
end)

AdventureLog.on("PLAYER_LOGOUT", function()
    stopIdleTicker()
end)

AdventureLog.noteActivity()
armIdleTicker()
