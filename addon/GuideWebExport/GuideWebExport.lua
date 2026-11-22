-- GuideWebExport: dumps uiMap bounds (computed exactly like HereBeDragons-2.0)
-- and a progress snapshot of the current character into SavedVariables, for
-- the local "Horde Guide Web" app and pipeline (pipeline/maps/savedvars.py).
--
-- Character snapshot (schema 4): full name (Forever first+surname), realm,
-- race/class/level/xp, completed quest ids, the quest log with objective
-- progress, skills, professions, gold (copper), equipped gear, taxi, bags,
-- bind, reputation, spells, durability, pet and position.
--
-- Usage: /gwe  (also runs once automatically after the first quest-log
-- update following login), then /reload or log out so the client writes
-- WTF/.../SavedVariables/GuideWebExport.lua.
-- The character snapshot also refreshes on its own when you turn in a quest,
-- level up, gain skill, gold or change gear, and on logout.
--
-- Lua 5.1, WoW Forever 1.60.1 (Interface 16001). Read-only use of game APIs,
-- every API call wrapped in pcall. No dependencies.

local ADDON_NAME = ...
local MAX_MAP_ID = 2500
-- `version` stays 1: the map/bounds format read by pipeline/maps/savedvars.py is unchanged.
local DB_VERSION = 1
-- Character snapshot schema read by web/src/state/luaExport.ts.
local SCHEMA_VERSION = 4

GuideWebExportDB = GuideWebExportDB or {}

local function msg(text)
    local frame = DEFAULT_CHAT_FRAME
    if frame and frame.AddMessage then
        frame:AddMessage("|cffd4a017GuideWebExport:|r " .. tostring(text))
    else
        print("GuideWebExport: " .. tostring(text))
    end
end

-- pcall wrapper returning up to 4 results, or nothing on error.
local function safe(fn, ...)
    if type(fn) ~= "function" then return nil end
    local ok, a, b, c, d = pcall(fn, ...)
    if ok then return a, b, c, d end
    return nil
end

local function vec(x, y)
    if CreateVector2D then
        local v = safe(CreateVector2D, x, y)
        if v then return v end
    end
    return { x = x, y = y }
end

local function getXY(pos)
    if type(pos) ~= "table" then return nil end
    if pos.GetXY then
        local ok, x, y = pcall(pos.GetXY, pos)
        if ok then return x, y end
    end
    return pos.x, pos.y
end

local function isNum(v)
    return type(v) == "number" and v == v and v ~= math.huge and v ~= -math.huge
end

-- Raw world position of a normalized map position: {instance, vx, vy} or nil.
local function corner(mapID, nx, ny)
    if not (C_Map and C_Map.GetWorldPosFromMapPos) then return nil end
    local instance, pos = safe(C_Map.GetWorldPosFromMapPos, mapID, vec(nx, ny))
    local x, y = getXY(pos)
    if isNum(x) and isNum(y) then
        return { instance = instance, x = x, y = y }
    end
    return nil
end

-- Bounds exactly like HereBeDragons-2.0 processMap():
--   center = GetWorldPosFromMapPos(id, 0.5/0.5); top, left = center:GetXY()
--   width, height = C_Map.GetMapWorldSize(id)  or the corner fallback
--   from topleft = GetWorldPosFromMapPos(id, 0/0):
--     width = (topleft.y - center.y) * 2 ; height = (topleft.x - center.x) * 2
--   top = center.x + height / 2 ; left = center.y + width / 2
-- Zone coords then are x = (left - X) / width, y = (top - Y) / height, where
-- (X, Y) is HereBeDragons' world position (the a, b of ".goto id/inst,a,b").
-- No map transforms apply on WoW Forever (HBD's transformData is empty).
local function mapBounds(mapID)
    local c05 = corner(mapID, 0.5, 0.5)
    local c00 = corner(mapID, 0, 0)
    local c11 = corner(mapID, 1, 1)
    local out = { c05 = c05, c00 = c00, c11 = c11 }
    if not c05 then return out end
    out.instance = c05.instance

    local width, height, method
    if C_Map.GetMapWorldSize then
        width, height = safe(C_Map.GetMapWorldSize, mapID)
        method = "worldsize"
    end
    if not (isNum(width) and isNum(height) and width ~= 0 and height ~= 0) then
        width, height, method = nil, nil, nil
        if c00 then
            width = (c00.y - c05.y) * 2
            height = (c00.x - c05.x) * 2
            method = "compat"
        end
    end
    if isNum(width) and isNum(height) and width ~= 0 and height ~= 0 then
        out.width = width
        out.height = height
        out.top = c05.x + height / 2
        out.left = c05.y + width / 2
        out.method = method
    end
    return out
end

local function exportMaps()
    local maps, count, withBounds = {}, 0, 0
    if not (C_Map and C_Map.GetMapInfo) then return maps, 0, 0 end
    for id = 1, MAX_MAP_ID do
        local info = safe(C_Map.GetMapInfo, id)
        if type(info) == "table" and info.name then
            local entry = mapBounds(id)
            entry.name = info.name
            entry.mapType = info.mapType
            entry.parentMapID = info.parentMapID
            if C_Map.GetMapGroupID then
                entry.groupID = safe(C_Map.GetMapGroupID, id)
            end
            maps[id] = entry
            count = count + 1
            if entry.width then withBounds = withBounds + 1 end
        end
    end
    return maps, count, withBounds
end

local function completedQuests()
    local list = {}
    if C_QuestLog and C_QuestLog.GetAllCompletedQuestIDs then
        local ids = safe(C_QuestLog.GetAllCompletedQuestIDs)
        if type(ids) == "table" then
            for _, id in ipairs(ids) do
                if type(id) == "number" then list[#list + 1] = id end
            end
        end
    end
    table.sort(list)
    return list
end

-- Completed quest ids as a set, for de-duplicating ids added by hand.
local function toSet(list)
    local set = {}
    for _, id in ipairs(list) do set[id] = true end
    return set
end

-- Quest ids turned in this session. QUEST_TURNED_IN fires before the
-- completed-quest list includes the quest, so we remember them here.
local turnedIn = {}

local function completedWithSession()
    local list = completedQuests()
    local set = toSet(list)
    for id in pairs(turnedIn) do
        if not set[id] then list[#list + 1] = id end
    end
    table.sort(list)
    return list
end

-- Re-entrancy: expanding the quest log fires QUEST_LOG_UPDATE.
local exportDepth = 0
local fullDone = false

local SECONDARY_SKILL = { [129] = true, [185] = true, [356] = true } -- First Aid, Cooking, Fishing
-- Riding: Apprentice 33388 (75), Journeyman 33391 (150). Skill line 762.
local RIDING_75, RIDING_150 = 33388, 33391
-- Mount spells (kodo / wolf / raptor / skeletal horse). mount is true only when one of these is known.
local MOUNT_SPELLS = {
    18989, 18990, 18991,
    6653, 6654, 23251, 23252,
    8395, 10796, 10799, 10873,
    17462, 17463, 17464, 17465,
}

local taxiSession = { ok = false, nodes = {} }

local function questComplete(questID)
    if not (C_QuestLog and questID) then return nil end
    if C_QuestLog.IsFailed and safe(C_QuestLog.IsFailed, questID) then return -1 end
    if C_QuestLog.ReadyForTurnIn and safe(C_QuestLog.ReadyForTurnIn, questID) then return 1 end
    if C_QuestLog.IsComplete and safe(C_QuestLog.IsComplete, questID) then return 1 end
    return nil
end

local function questObjectives(questID)
    local list = {}
    if not (questID and C_QuestLog and C_QuestLog.GetQuestObjectives) then return list end
    local objs = safe(C_QuestLog.GetQuestObjectives, questID)
    if type(objs) ~= "table" then return list end
    for _, o in ipairs(objs) do
        if type(o) == "table" then
            list[#list + 1] = {
                text = o.text,
                type = o.type,
                finished = o.finished and true or false,
                numFulfilled = o.numFulfilled,
                numRequired = o.numRequired,
            }
        end
    end
    return list
end

local function skillInfoAt(fn, index)
    if type(fn) ~= "function" then return nil end
    local ok, a, b, c, d, e, f, g, h = pcall(fn, index)
    if not ok or a == nil then return nil end
    if type(a) == "table" then return a end
    return {
        name = a, isHeader = b, isExpanded = c,
        skillRank = d, skillTempPoints = e, skillModifier = f, skillMaxRank = g,
        isAbandonable = h,
    }
end

local function skillKind(info, header)
    local id = info.skillLineID or info.skillID
    if id == 762 then return "riding" end
    if type(id) == "number" and SECONDARY_SKILL[id] then return "secondary" end
    local headerName = type(header) == "string" and header or ""
    if headerName:find("Weapon") then return "weapon" end
    if info.isAbandonable then return "primary" end
    if headerName:find("Profession") or headerName == (TRADE_SKILLS or "Professions") then return "primary" end
    if headerName:find("Secondary") or headerName == (SECONDARY_SKILLS or "Secondary Skills") then return "secondary" end
    return "other"
end

local function readSkillWindow()
    local out = {}
    local api = C_SkillInfo
    if not (api and api.GetNumSkillLines and api.GetSkillLineInfo) then
        return out, false
    end
    local okN, n = pcall(api.GetNumSkillLines)
    if not okN or type(n) ~= "number" then return out, false end

    local reopened = {}
    if api.ExpandSkillHeader then
        local guard, i = 0, 1
        while i <= (safe(api.GetNumSkillLines) or 0) and guard < 300 do
            guard = guard + 1
            local info = skillInfoAt(api.GetSkillLineInfo, i)
            if info and info.isHeader and not info.isExpanded then
                reopened[#reopened + 1] = info.name
                pcall(api.ExpandSkillHeader, i)
            end
            i = i + 1
        end
    end

    local header
    n = safe(api.GetNumSkillLines) or n
    for i = 1, n do
        local info = skillInfoAt(api.GetSkillLineInfo, i)
        if info and info.name then
            if info.isHeader then
                header = info.name
            else
                local id = info.skillLineID or info.skillID
                out[#out + 1] = {
                    skillID = id,
                    name = info.name,
                    kind = skillKind(info, header),
                    rank = info.skillRank or info.rank,
                    max = info.skillMaxRank or info.maxRank,
                    modifier = info.skillModifier or info.modifier or 0,
                    temp = info.skillTempPoints or info.temp or 0,
                    categoryID = info.skillLineCategoryID or info.categoryID,
                }
            end
        end
    end

    if api.CollapseSkillHeader and #reopened > 0 then
        for _, want in ipairs(reopened) do
            local m = safe(api.GetNumSkillLines) or 0
            for i = 1, m do
                local info = skillInfoAt(api.GetSkillLineInfo, i)
                if info and info.isHeader and info.isExpanded and info.name == want then
                    pcall(api.CollapseSkillHeader, i)
                    break
                end
            end
        end
    end
    return out, true
end

local function professionsFromApi()
    local list = {}
    if not (GetProfessions and GetProfessionInfo) then return list, false end
    local ok, a, b, c, d, e, f = pcall(GetProfessions)
    if not ok then return list, false end
    local indexes = { a, b, c, d, e, f }
    for i = 1, 6 do
        local index = indexes[i]
        if type(index) == "number" then
            local okInfo, name, _, rank, maxRank, _, _, skillLine, modifier, specIndex =
                pcall(GetProfessionInfo, index)
            if okInfo and name then
                list[#list + 1] = {
                    skillLine = skillLine,
                    name = name,
                    rank = rank,
                    max = maxRank,
                    modifier = modifier or 0,
                    specIndex = specIndex,
                }
            end
        end
    end
    return list, true
end

local function skillsFromProfessions(profs)
    local out = {}
    for i, p in ipairs(profs) do
        local id = p.skillLine
        local kind = "primary"
        if type(id) == "number" and SECONDARY_SKILL[id] then kind = "secondary" end
        if id == 762 then kind = "riding" end
        if i > 2 and kind == "primary" then kind = "other" end
        out[#out + 1] = {
            skillID = id,
            name = p.name,
            kind = kind,
            rank = p.rank,
            max = p.max,
            modifier = p.modifier or 0,
            temp = 0,
            categoryID = nil,
        }
    end
    return out
end

local function questLog()
    local log = {}
    local ql = C_QuestLog
    if not (ql and ql.GetNumQuestLogEntries and ql.GetInfo) then return log, false end
    local okN, n = pcall(ql.GetNumQuestLogEntries)
    if not okN or type(n) ~= "number" then return log, false end

    local collapsed = {}
    if ExpandQuestHeader then
        local guard, i = 0, 1
        while i <= (safe(ql.GetNumQuestLogEntries) or 0) and guard < 500 do
            guard = guard + 1
            local ok, info = pcall(ql.GetInfo, i)
            if not ok then return log, false end
            if type(info) == "table" and info.isHeader and info.isCollapsed then
                collapsed[#collapsed + 1] = info.title
                pcall(ExpandQuestHeader, i)
            end
            i = i + 1
        end
    end

    n = safe(ql.GetNumQuestLogEntries) or n
    for i = 1, n do
        local ok, info = pcall(ql.GetInfo, i)
        if not ok then return log, false end
        if type(info) == "table" and not info.isHeader and not info.isHidden then
            local entry = {
                id = info.questID,
                title = info.title,
                level = info.level,
                objectives = questObjectives(info.questID),
            }
            local flag = questComplete(info.questID)
            if flag ~= nil then entry.complete = flag end
            log[#log + 1] = entry
        end
    end

    if CollapseQuestHeader and #collapsed > 0 then
        for _, title in ipairs(collapsed) do
            local m = safe(ql.GetNumQuestLogEntries) or 0
            for i = 1, m do
                local info = safe(ql.GetInfo, i)
                if type(info) == "table" and info.isHeader and not info.isCollapsed and info.title == title then
                    pcall(CollapseQuestHeader, i)
                    break
                end
            end
        end
    end
    return log, true
end

local function copyTaxi(from, into)
    if type(from) ~= "table" then return end
    for id, node in pairs(from) do
        if into[id] == nil then into[id] = node end
    end
end

local function readTaxiNodes()
    local mapId = GetTaxiMapID and safe(GetTaxiMapID) or nil
    if C_TaxiMap and C_TaxiMap.GetAllTaxiNodes and mapId ~= nil then
        local nodes = safe(C_TaxiMap.GetAllTaxiNodes, mapId)
        if type(nodes) == "table" then
            local out = {}
            for _, node in ipairs(nodes) do
                if type(node) == "table" then
                    local state = node.state
                    if state == nil and node.nodeType then state = node.nodeType end
                    if state == 0 or state == 1 or state == "CURRENT" or state == "REACHABLE" then
                        local id = node.nodeID or node.slotIndex
                        if isNum(id) then
                            out[id] = { name = node.name, mapId = node.mapID or mapId }
                        end
                    end
                end
            end
            return out, true
        end
    end
    if NumTaxiNodes and TaxiNodeName and TaxiNodeGetType then
        local n = safe(NumTaxiNodes) or 0
        local out = {}
        local any = false
        for i = 1, n do
            local name = safe(TaxiNodeName, i)
            local kind = safe(TaxiNodeGetType, i)
            local reachable = kind == 0 or kind == 1 or kind == "CURRENT" or kind == "REACHABLE"
            if reachable and name then
                any = true
                out[i] = { name = name, mapId = mapId }
            end
        end
        if any or type(n) == "number" then return out, true end
    end
    return nil, false
end

local function snapshotTaxi()
    local nodes, ok = readTaxiNodes()
    if not ok or type(nodes) ~= "table" then return end
    taxiSession.ok = true
    for id, node in pairs(nodes) do taxiSession.nodes[id] = node end
end

local function bags()
    local counts = {}
    local api = C_Container
    if not (api and api.GetContainerNumSlots and api.GetContainerItemID) then return counts, false end
    for bag = 0, 4 do
        local ok, n = pcall(api.GetContainerNumSlots, bag)
        if not ok or type(n) ~= "number" then return counts, false end
        for slot = 1, n do
            local okId, id = pcall(api.GetContainerItemID, bag, slot)
            if not okId then return counts, false end
            local count = 1
            if id and api.GetContainerItemInfo then
                local okInfo, info = pcall(api.GetContainerItemInfo, bag, slot)
                if okInfo and type(info) == "table" and isNum(info.stackCount) then
                    count = info.stackCount
                end
            end
            if isNum(id) and id > 0 then
                counts[id] = (counts[id] or 0) + count
            end
        end
    end
    return counts, true
end

local function position()
    local pos = {}
    local mapId
    if C_Map and C_Map.GetBestMapForUnit then
        mapId = safe(C_Map.GetBestMapForUnit, "player")
    end
    pos.mapId = mapId
    if mapId and C_Map.GetMapInfo then
        local info = safe(C_Map.GetMapInfo, mapId)
        if type(info) == "table" then pos.zone = info.name end
    end
    if not pos.zone and GetZoneText then pos.zone = safe(GetZoneText) end
    if GetSubZoneText then pos.subzone = safe(GetSubZoneText) end
    if mapId and C_Map and C_Map.GetPlayerMapPosition then
        local xy = safe(C_Map.GetPlayerMapPosition, mapId, "player")
        pos.x, pos.y = getXY(xy)
    end
    local ok = isNum(pos.mapId) or (isNum(pos.x) and isNum(pos.y)) or type(pos.zone) == "string"
    return pos, ok
end

local function reputation()
    local rows = {}
    local api = C_Reputation
    if not (api and api.GetNumFactions and api.GetFactionDataByIndex) then return rows, false end
    local okN, n = pcall(api.GetNumFactions)
    if not okN or type(n) ~= "number" then return rows, false end
    local collapsed = {}
    local expand = api.ExpandFactionHeader
    local collapse = api.CollapseFactionHeader
    if expand then
        local guard, i = 0, 1
        while i <= (safe(api.GetNumFactions) or 0) and guard < 300 do
            guard = guard + 1
            local ok, data = pcall(api.GetFactionDataByIndex, i)
            if not ok then return rows, false end
            if type(data) == "table" and data.isHeader and data.isCollapsed then
                collapsed[#collapsed + 1] = data.name
                pcall(expand, i)
            end
            i = i + 1
        end
    end
    n = safe(api.GetNumFactions) or n
    for i = 1, n do
        local ok, data = pcall(api.GetFactionDataByIndex, i)
        if not ok then return rows, false end
        if type(data) == "table" and data.name and not data.isHeader then
            rows[#rows + 1] = {
                factionID = data.factionID,
                name = data.name,
                reaction = data.reaction,
                current = data.currentStanding,
                min = data.currentReactionThreshold,
                max = data.nextReactionThreshold,
                isHeader = false,
                atWar = data.atWarWith and true or false,
            }
        end
    end
    if collapse and #collapsed > 0 then
        for _, name in ipairs(collapsed) do
            local m = safe(api.GetNumFactions) or 0
            for i = 1, m do
                local data = safe(api.GetFactionDataByIndex, i)
                if type(data) == "table" and data.isHeader and not data.isCollapsed and data.name == name then
                    pcall(collapse, i)
                    break
                end
            end
        end
    end
    return rows, true
end

local function spellKnown(spellID)
    if C_SpellBook and C_SpellBook.IsSpellKnown then
        local ok, known = pcall(C_SpellBook.IsSpellKnown, spellID)
        if ok then return known and true or false end
    end
    if IsPlayerSpell then
        local ok, known = pcall(IsPlayerSpell, spellID)
        if ok then return known and true or false end
    end
    return nil
end

local function spells()
    local haveApi = (C_SpellBook and C_SpellBook.IsSpellKnown) or IsPlayerSpell
    if not haveApi then return nil, false end
    local known = {}
    local function watch(id)
        local yes = spellKnown(id)
        if yes then known[#known + 1] = id end
        return yes
    end
    local riding = 0
    if watch(RIDING_150) then riding = 150
    elseif watch(RIDING_75) then riding = 75 end
    local mount = false
    for _, id in ipairs(MOUNT_SPELLS) do
        if watch(id) then mount = true end
    end
    table.sort(known)
    return { riding = riding, mount = mount, known = known }, true
end

local function durability()
    if not GetInventoryItemDurability then return nil, false end
    local curSum, maxSum, lowest, lowestSlot = 0, 0, nil, nil
    for slot = 1, 18 do
        local ok, cur, maxv = pcall(GetInventoryItemDurability, slot)
        if not ok then return nil, false end
        if isNum(cur) and isNum(maxv) and maxv > 0 then
            curSum = curSum + cur
            maxSum = maxSum + maxv
            local ratio = cur / maxv
            if lowest == nil or ratio < lowest then
                lowest = ratio
                lowestSlot = slot
            end
        end
    end
    local pct = nil
    if maxSum > 0 then pct = (curSum / maxSum) * 100 end
    return { pct = pct, lowestSlot = lowestSlot }, true
end

local function petInfo()
    if not UnitExists then return nil, false end
    local ok, exists = pcall(UnitExists, "pet")
    if not ok then return nil, false end
    if not exists then return nil, true end
    local _, name = nil, nil
    if UnitName then
        local okN, n = pcall(UnitName, "pet")
        if okN then name = n end
    end
    return {
        family = UnitCreatureFamily and safe(UnitCreatureFamily, "pet") or nil,
        level = UnitLevel and safe(UnitLevel, "pet") or nil,
        name = name,
    }, true
end

local SLOT_NAMES = {
    [1] = "head", [2] = "neck", [3] = "shoulder", [4] = "shirt", [5] = "chest",
    [6] = "waist", [7] = "legs", [8] = "feet", [9] = "wrist", [10] = "hands",
    [11] = "finger1", [12] = "finger2", [13] = "trinket1", [14] = "trinket2",
    [15] = "back", [16] = "mainhand", [17] = "offhand", [18] = "ranged", [19] = "tabard",
}

local function itemIdFromLink(link)
    if type(link) ~= "string" then return nil end
    local id = link:match("item:(%-?%d+)")
    return id and tonumber(id) or nil
end

-- Equipped gear as a list of { slot, slotName, itemId, name } (empty slots omitted).
local function equippedGear()
    local gear = {}
    for slot = 1, 19 do
        local link = GetInventoryItemLink and safe(GetInventoryItemLink, "player", slot)
        local id = itemIdFromLink(link)
        if not id and GetInventoryItemID then
            id = safe(GetInventoryItemID, "player", slot)
        end
        if isNum(id) and id > 0 then
            local name = type(link) == "string" and link:match("|h%[(.-)%]|h") or nil
            gear[#gear + 1] = { slot = slot, slotName = SLOT_NAMES[slot], itemId = id, name = name }
        end
    end
    return gear
end

-- A second UnitName return that matches the realm is not a surname.
local function compactRealm(value)
    if type(value) ~= "string" then return nil end
    local compact = value:lower():gsub("%s+", "")
    if compact == "" then return nil end
    return compact
end

local function matchesRealm(value, realm)
    local a, b = compactRealm(value), compactRealm(realm)
    return a ~= nil and b ~= nil and a == b
end

-- Forever: UnitName returns first name and surname; GetUnitName(unit, true) is
-- "First Surname".
local function playerIdentity()
    local first, second = safe(UnitName, "player")
    local full = safe(GetUnitName, "player", true)
    local guid = safe(UnitGUID, "player")
    local realm = safe(GetRealmName)
    local normalized = safe(GetNormalizedRealmName)
    if type(first) ~= "string" or first == "" then first = nil end
    local surname = nil
    if type(second) == "string" and second ~= ""
        and not matchesRealm(second, realm)
        and not matchesRealm(second, normalized) then
        surname = second
    end
    local fullName
    if type(full) == "string" and full ~= "" and full:find(" ", 1, true) then
        fullName = full
    elseif first and surname then
        fullName = first .. " " .. surname
    else
        fullName = first
    end
    return fullName, first, surname, guid, realm
end

local function exportCharacter()
    local c = {}
    c.schemaVersion = SCHEMA_VERSION
    c.name, c.firstName, c.surname, c.guid, c.realm = playerIdentity()
    c.raceName, c.race = safe(UnitRace, "player")
    c.className, c.class = safe(UnitClass, "player")
    c.level = safe(UnitLevel, "player")
    c.faction = safe(UnitFactionGroup, "player")
    c.xp = safe(UnitXP, "player")
    c.xpMax = safe(UnitXPMax, "player")
    c.xpRested = GetXPExhaustion and safe(GetXPExhaustion) or nil
    if isNum(c.xp) and isNum(c.xpMax) and c.xpMax > 0 then
        c.xpPercent = (c.xp / c.xpMax) * 100
    end
    if GetRestState then c.restState = safe(GetRestState) end
    c.money = GetMoney and safe(GetMoney) or nil
    c.completed = completedWithSession()
    c.completedCount = #c.completed

    local log, questOk = questLog()
    c.questLog = log
    c.questLogOk = questOk and true or false

    local skillRows, skillOk = readSkillWindow()
    local profs, profOk = professionsFromApi()
    c.professions = profs
    if skillOk then
        c.skills = skillRows
        c.skillsOk = true
    elseif profOk then
        c.skills = skillsFromProfessions(profs)
        c.skillsOk = true
    else
        c.skills = skillRows
        c.skillsOk = false
    end
    c.gear = equippedGear()

    local pos, posOk = position()
    c.position = pos
    c.positionOk = posOk and true or false

    if GetBindLocation then
        local place = safe(GetBindLocation)
        if type(place) == "string" then
            c.bind = place
            c.bindOk = true
        else
            c.bindOk = false
        end
    else
        c.bindOk = false
    end

    local bagCounts, bagOk = bags()
    c.bags = bagCounts
    c.bagsOk = bagOk and true or false

    local rep, repOk = reputation()
    c.reputation = rep
    c.reputationOk = repOk and true or false

    local spellSnap, spellOk = spells()
    if spellOk then c.spells = spellSnap end
    c.spellsOk = spellOk and true or false

    local dur, durOk = durability()
    if durOk then c.durability = dur end
    c.durabilityOk = durOk and true or false

    local pet, petOk = petInfo()
    c.pet = pet
    c.petOk = petOk and true or false

    if UnitIsDeadOrGhost then
        c.deadOrGhost = safe(UnitIsDeadOrGhost, "player") and true or false
    end

    c.exportedAt = time()
    return c
end

local function stamp(db)
    db.version = DB_VERSION
    db.schemaVersion = SCHEMA_VERSION
    db.exportedAt = time()
    db.exportedAtText = date("%Y-%m-%d %H:%M:%S")
end

local function storeCharacter(c)
    local db = GuideWebExportDB
    local realm = tostring(c.realm or "?")
    local key = tostring(c.name or "?") .. "-" .. realm
    -- Schema 2 keyed on the first UnitName return only ("Throgar-").
    local legacyKey = tostring(c.firstName or c.name or "?") .. "-" .. realm
    db.characters = db.characters or {}
    if legacyKey ~= key then
        db.characters[legacyKey] = nil
    end
    local old = db.characters[key]
    local taxi = {}
    if type(old) == "table" and type(old.taxi) == "table" then
        for id, node in pairs(old.taxi) do taxi[id] = node end
    end
    for id, node in pairs(taxiSession.nodes) do taxi[id] = node end
    local taxiKnown = taxiSession.ok or (type(old) == "table" and old.taxiOk)
    if taxiKnown then
        c.taxi = taxi
        c.taxiOk = true
    end
    db.characters = { [key] = c }
    db.lastCharacter = key
    return key
end

-- Full export: map bounds + character snapshot (/gwe and the post-login quest log).
local function run(reason)
    exportDepth = exportDepth + 1
    local ok, count, withBounds = pcall(function()
        local db = GuideWebExportDB
        stamp(db)
        local version, build, buildDate, toc = safe(GetBuildInfo)
        db.build = { version = version, build = build, date = buildDate, toc = toc }
        db.projectID = WOW_PROJECT_ID

        local maps, mapCount, bounded = exportMaps()
        db.maps = maps
        db.mapCount = mapCount

        local c = exportCharacter()
        local key = storeCharacter(c)

        msg(string.format("exported %d maps (%d with bounds), %d completed quests, %d skills and %d gear slots for %s (%s).",
            mapCount, bounded, c.completedCount or 0, #c.skills, #c.gear, key, reason or "manual"))
        if reason == "/gwe" then
            msg("Type /reload (or log out) now so WoW writes the SavedVariables file.")
        end
        return mapCount, bounded
    end)
    exportDepth = exportDepth - 1
    if not ok then error(count) end
    fullDone = true
    return count, withBounds
end

-- Light export: character snapshot only (game events). Silent.
local function refresh()
    exportDepth = exportDepth + 1
    local ok, err = pcall(function()
        stamp(GuideWebExportDB)
        storeCharacter(exportCharacter())
    end)
    exportDepth = exportDepth - 1
    if not ok then error(err) end
end

SLASH_GUIDEWEBEXPORT1 = "/gwe"
SLASH_GUIDEWEBEXPORT2 = "/guidewebexport"
SlashCmdList["GUIDEWEBEXPORT"] = function()
    local ok, err = pcall(run, "/gwe")
    if not ok then msg("export failed: " .. tostring(err)) end
end

-- Events that change what the snapshot holds. Bursts (a vendor, a quest
-- update) are coalesced into one refresh.
local EVENTS = {
    "PLAYER_ENTERING_WORLD",
    "QUEST_LOG_UPDATE",
    "QUEST_REMOVED",
    "PLAYER_XP_UPDATE",
    "TAXIMAP_OPENED",
    "BAG_UPDATE_DELAYED",
    "SKILL_LINES_CHANGED",
    "QUEST_ACCEPTED",
    "QUEST_TURNED_IN",
    "PLAYER_LEVEL_UP",
    "PLAYER_MONEY",
    "PLAYER_EQUIPMENT_CHANGED",
    "PLAYER_LOGOUT",
}
local REFRESH_DELAY = 2
local FULL_DELAY = 0.5
local FALLBACK_DELAY = 8

local loggedIn = false
local pending = false
local enteredWorld = false
local sawQuestLog = false
local fullScheduled = false

local function eventAllowed(name)
    if C_EventUtils == nil or type(C_EventUtils.IsEventValid) ~= "function" then
        return true
    end
    local ok, valid = pcall(C_EventUtils.IsEventValid, name)
    if not ok then return false end
    return valid and true or false
end

local function refreshNow()
    pending = false
    local ok, err = pcall(refresh)
    if not ok then msg("refresh failed: " .. tostring(err)) end
end

local function scheduleRefresh()
    if not loggedIn then return end
    if C_Timer and C_Timer.After then
        if pending then return end
        pending = true
        C_Timer.After(REFRESH_DELAY, refreshNow)
    else
        refreshNow()
    end
end

local function runFull(reason)
    local ok, err = pcall(run, reason)
    if not ok then msg("auto export failed: " .. tostring(err)) end
end

local function scheduleFullFromQuestLog()
    if fullDone or not enteredWorld or not sawQuestLog or fullScheduled then return end
    if C_Timer and C_Timer.After then
        fullScheduled = true
        C_Timer.After(FULL_DELAY, function()
            fullScheduled = false
            if not fullDone then runFull("quest log") end
        end)
    else
        runFull("quest log")
    end
end

if WOW_PROJECT_ID ~= nil and WOW_PROJECT_ID ~= 18 then
    msg("This addon is built for WoW Forever.")
end

local frame = CreateFrame("Frame")
for _, ev in ipairs(EVENTS) do
    if eventAllowed(ev) then frame:RegisterEvent(ev) end
end
frame:SetScript("OnEvent", function(_, event, arg1)
    if event == "PLAYER_ENTERING_WORLD" then
        enteredWorld = true
        loggedIn = true
        if C_Timer and C_Timer.After then
            C_Timer.After(FALLBACK_DELAY, function()
                if not fullDone then runFull("fallback timer") end
            end)
        end
        scheduleFullFromQuestLog()
        return
    end
    if event == "QUEST_LOG_UPDATE" then
        if exportDepth > 0 then return end
        sawQuestLog = true
        if not fullDone then
            scheduleFullFromQuestLog()
            return
        end
        scheduleRefresh()
        return
    end
    if event == "TAXIMAP_OPENED" then
        snapshotTaxi()
        if loggedIn then scheduleRefresh() end
        return
    end
    if event == "PLAYER_LOGOUT" then
        if not fullDone then runFull("logout")
        elseif loggedIn then refreshNow() end
        return
    end
    if event == "QUEST_TURNED_IN" and type(arg1) == "number" then
        turnedIn[arg1] = true
    end
    scheduleRefresh()
end)
