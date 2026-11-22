-- AdventureLog probe. Existence and shape checks only. No combat-log registration.
-- Lua 5.1. Each check is { name, ok, detail } with a string detail.
-- writeHeader in AdventureLog.lua copies AdventureLog.probeReport into the session header.

local ran = false

local function isFn(fn)
    return type(fn) == "function"
end

local function secretValue(v)
    if not isFn(issecretvalue) then
        return false
    end
    local ok, secret = pcall(issecretvalue, v)
    if not ok then
        return false
    end
    return secret and true or false
end

local function eventState(name)
    if C_EventUtils == nil or not isFn(C_EventUtils.IsEventValid) then
        return nil
    end
    local ok, valid = pcall(C_EventUtils.IsEventValid, name)
    if not ok then
        return false
    end
    return valid and true or false
end

function AdventureLog.runProbe()
    local report = {}

    local function add(name, ok, detail)
        if type(detail) ~= "string" or detail == "" then
            detail = "shape"
        end
        report[#report + 1] = {
            name = name,
            ok = ok and true or false,
            detail = detail,
        }
    end

    local function check(name, fn)
        local ok, passed, detail = pcall(fn)
        if not ok then
            add(name, false, "shape")
            return
        end
        add(name, passed, detail)
    end

    check("WOW_PROJECT_ID", function()
        if WOW_PROJECT_ID == 18 then
            return true, "function"
        end
        return false, "shape"
    end)

    check("GetBuildInfo", function()
        if not isFn(GetBuildInfo) then
            return false, "missing"
        end
        local ok, version = pcall(GetBuildInfo)
        if not ok then
            return false, "shape"
        end
        if secretValue(version) then
            return false, "secret"
        end
        if type(version) == "string" then
            return true, "function"
        end
        return false, "shape"
    end)

    check("clocks", function()
        if isFn(GetServerTime) and isFn(GetTime) and isFn(time) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("RequestTimePlayed", function()
        if not isFn(RequestTimePlayed) then
            return false, "missing"
        end
        local valid = eventState("TIME_PLAYED_MSG")
        if valid == false then
            return false, "missing"
        end
        return true, "function"
    end)

    check("C_Map", function()
        if C_Map == nil then
            return false, "missing"
        end
        if isFn(C_Map.GetBestMapForUnit) and isFn(C_Map.GetPlayerMapPosition) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("UnitXPMax", function()
        if not isFn(UnitXP) or not isFn(UnitXPMax) then
            return false, "missing"
        end
        local ok, xpMax = pcall(UnitXPMax, "player")
        if not ok then
            return false, "shape"
        end
        if secretValue(xpMax) then
            return false, "secret"
        end
        if type(xpMax) ~= "number" then
            return false, "shape"
        end
        if xpMax == 0 then
            return false, "zero"
        end
        if xpMax > 0 then
            return true, "function"
        end
        return false, "shape"
    end)

    check("C_QuestLog", function()
        if C_QuestLog == nil then
            return false, "missing"
        end
        if isFn(C_QuestLog.GetInfo)
            and isFn(C_QuestLog.GetTitleForQuestID)
            and isFn(C_QuestLog.GetQuestObjectives)
            and isFn(C_QuestLog.GetAllCompletedQuestIDs)
            and isFn(C_QuestLog.RequestLoadQuestByID) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("QUEST_ACCEPTED", function()
        local valid = eventState("QUEST_ACCEPTED")
        if valid == true then
            return true, "function"
        end
        return false, "missing"
    end)

    check("C_SkillInfo.GetSkillLineInfo", function()
        if C_SkillInfo ~= nil and isFn(C_SkillInfo.GetSkillLineInfo) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("C_Item.GetItemInfo", function()
        if C_Item == nil or not isFn(C_Item.GetItemInfo) then
            return false, "missing"
        end
        if not isFn(GetItemInfo) then
            return true, "absent global"
        end
        return true, "function"
    end)

    check("loot", function()
        if isFn(GetLootSourceInfo)
            and isFn(GetNumLootItems)
            and isFn(GetLootSlotLink)
            and isFn(GetLootSlotInfo) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("C_TaxiMap.GetAllTaxiNodes", function()
        if C_TaxiMap ~= nil and isFn(C_TaxiMap.GetAllTaxiNodes) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("UnitOnTaxi", function()
        if isFn(UnitOnTaxi) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("C_DamageMeter.GetCombatSessionFromType", function()
        if C_DamageMeter ~= nil and isFn(C_DamageMeter.GetCombatSessionFromType) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("C_DeathRecap.HasRecapEvents", function()
        if C_DeathRecap ~= nil and isFn(C_DeathRecap.HasRecapEvents) then
            return true, "function"
        end
        return false, "missing"
    end)

    local restricted = false
    check("C_CombatLog.IsCombatLogRestricted", function()
        if C_CombatLog == nil or not isFn(C_CombatLog.IsCombatLogRestricted) then
            return false, "missing"
        end
        local ok, value = pcall(C_CombatLog.IsCombatLogRestricted)
        if not ok then
            return false, "shape"
        end
        if secretValue(value) then
            return false, "secret"
        end
        if value == true then
            restricted = true
            return true, "restricted"
        end
        return true, "function"
    end)

    check("COMBAT_LOG_EVENT_UNFILTERED", function()
        eventState("COMBAT_LOG_EVENT_UNFILTERED")
        if restricted then
            return true, "probe-only restricted"
        end
        return true, "probe-only"
    end)

    check("issecretvalue", function()
        if isFn(issecretvalue) then
            return true, "function"
        end
        return false, "missing"
    end)

    check("ChatFrame_AddMessageEventFilter", function()
        if isFn(ChatFrame_AddMessageEventFilter) then
            return true, "present"
        end
        return true, "missing"
    end)

    check("UnitName", function()
        if not isFn(UnitName) then
            return false, "missing"
        end
        local ok, first, second = pcall(UnitName, "player")
        if not ok then
            return false, "shape"
        end
        if secretValue(first) or secretValue(second) then
            return false, "secret"
        end
        if second ~= nil then
            return true, "two-part"
        end
        return false, "shape"
    end)

    AdventureLog.probeReport = report
    if AdventureLogDB and isFn(AdventureLog.encode) then
        local encodedOk, encoded = pcall(AdventureLog.encode, report)
        if encodedOk then
            AdventureLogDB.probe = encoded
        end
    end

    local okCount = 0
    local failCount = 0
    local i
    for i = 1, #report do
        if report[i].ok then
            okCount = okCount + 1
        else
            failCount = failCount + 1
        end
    end
    local line = "probe: " .. okCount .. " ok, " .. failCount .. " failed"
    if isFn(AdventureLog.msg) then
        AdventureLog.msg(line)
    else
        print(line)
    end

    if isFn(AdventureLog.record) then
        pcall(AdventureLog.record, { e = "probe" })
    end
    if isFn(AdventureLog.writeHeader) then
        pcall(AdventureLog.writeHeader)
    end
end

local function armProbe()
    local function go()
        if ran then
            return
        end
        ran = true
        if isFn(AdventureLog.runProbe) then
            AdventureLog.runProbe()
        end
    end
    if C_Timer ~= nil and isFn(C_Timer.After) then
        C_Timer.After(3, go)
    else
        go()
    end
end

pcall(function()
    AdventureLog.on("PLAYER_ENTERING_WORLD", function()
        armProbe()
    end)
end)
