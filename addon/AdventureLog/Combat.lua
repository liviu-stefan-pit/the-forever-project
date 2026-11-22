-- AdventureLog combat recorder.
-- Forever combat log is restricted. This file does not register
-- COMBAT_LOG_EVENT or COMBAT_LOG_EVENT_UNFILTERED and does not call
-- CombatLogGetCurrentEventInfo.
--
-- Lua 5.1. Public API used: AdventureLog.on, record, position, safe, paused.

if not AdventureLog then return end

local MAX_TRACKED = 40

local inCombat = false
local fight = nil
local deathAt = nil
local sawGhost = false
local plateTokens = {}

local killed = {}

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

local function safe(fn, ...)
    if type(AdventureLog.safe) == "function" then
        return AdventureLog.safe(fn, ...)
    end
    if type(fn) ~= "function" then
        return nil, "not a function"
    end
    local ok, a, b, c, d = pcall(fn, ...)
    if ok then
        return a, b, c, d
    end
    return nil, a
end

local function noteActivity()
    if type(AdventureLog.noteActivity) == "function" then
        AdventureLog.noteActivity()
    end
end

local function nowSeconds()
    local t = safe(GetTime)
    if type(t) == "number" and not isSecret(t) then
        return t
    end
    return nil, isSecret(t)
end

local function copyPosition(ev)
    if type(AdventureLog.position) ~= "function" then
        return
    end
    local pos = AdventureLog.position()
    if type(pos) ~= "table" then
        return
    end
    for k, v in pairs(pos) do
        if ev[k] == nil and not isSecret(k) and not isSecret(v) then
            ev[k] = v
        end
    end
end

local function emit(ev)
    noteActivity()
    copyPosition(ev)
    if type(AdventureLog.record) == "function" then
        AdventureLog.record(ev)
    end
end

-- Creature / Vehicle / Pet / GameObject: npc or object id is field 6.
-- Returns id (number or nil), unitType (string or nil), guidSecret (bool).
local function parseGuid(guid)
    if isSecret(guid) then
        return nil, nil, true
    end
    if type(guid) ~= "string" then
        return nil, nil, false
    end
    local fields = {}
    local n = 0
    for part in string.gmatch(guid, "[^-]+") do
        n = n + 1
        fields[n] = part
    end
    local unitType = fields[1]
    if unitType ~= "Creature" and unitType ~= "Vehicle" and unitType ~= "Pet" and unitType ~= "GameObject" then
        return nil, unitType, false
    end
    local id = tonumber(fields[6])
    if type(id) ~= "number" then
        return nil, unitType, false
    end
    return id, unitType, false
end

local function newFight()
    return {
        mobs = {},
        order = {},
        count = 0,
    }
end

-- The full GUID only keys the current fight table, which is dropped at fight
-- end; it is never written to an event.
local function trackKey(npcId, unit, guid)
    if type(guid) == "string" then
        return "g:" .. guid
    end
    if type(npcId) == "number" then
        return "n:" .. tostring(npcId) .. ":" .. tostring(unit)
    end
    return "u:" .. tostring(unit)
end

local function readName(unit)
    local name = safe(UnitName, unit)
    if isSecret(name) then
        return nil, true
    end
    if type(name) == "string" and name ~= "" then
        return name, false
    end
    return nil, false
end

local function readLevel(unit)
    local level, err = safe(UnitLevel, unit)
    if isSecret(level) then
        return nil, nil, true
    end
    if type(level) ~= "number" then
        return nil, err or "UnitLevel failed", false
    end
    if level < 0 then
        return nil, "unknown", false
    end
    return level, nil, false
end

local function readClass(unit)
    local class = safe(UnitClassification, unit)
    if isSecret(class) then
        return nil, true
    end
    if type(class) == "string" and class ~= "" then
        return class, false
    end
    return nil, false
end

local function remember(unit, duringFight)
    if type(unit) ~= "string" then
        return nil
    end
    if not fight then
        return nil
    end
    local guid = safe(UnitGUID, unit)
    local guidSecret = false
    local npcId, unitType = nil, nil
    if isSecret(guid) then
        guidSecret = true
        guid = nil
    else
        npcId, unitType, guidSecret = parseGuid(guid)
        if guidSecret then
            guid = nil
        end
    end
    local key = trackKey(npcId, unit, guid)
    local entry = fight.mobs[key]
    local fresh = false
    if not entry then
        if fight.count >= MAX_TRACKED then
            return nil
        end
        entry = {
            key = key,
            dead = false,
            killed = false,
        }
        local seenAt = nowSeconds()
        entry.firstSeen = seenAt
        fight.mobs[key] = entry
        fight.count = fight.count + 1
        fight.order[#fight.order + 1] = key
        fresh = true
    end
    entry.tokens = entry.tokens or {}
    entry.tokens[unit] = true
    if type(npcId) == "number" then
        entry.npcId = npcId
    end
    if type(unitType) == "string" then
        entry.unitType = unitType
    end
    if guidSecret then
        entry.guidSecret = true
    end

    local name, nameSecret = readName(unit)
    if nameSecret then
        entry.nameSecret = true
    elseif type(name) == "string" then
        entry.name = name
    end
    local level, levelErr, levelSecret = readLevel(unit)
    if levelSecret then
        entry.levelSecret = true
    elseif type(level) == "number" then
        entry.level = level
    elseif levelErr and entry.level == nil then
        entry.levelErr = levelErr
    end
    local class, classSecret = readClass(unit)
    if classSecret then
        entry.classSecret = true
    elseif type(class) == "string" then
        entry.classification = class
    end

    if fresh and duringFight then
        local ev = { e = "mob_seen" }
        if type(entry.npcId) == "number" then
            ev.npcId = entry.npcId
        end
        if type(entry.unitType) == "string" then
            ev.unitType = entry.unitType
        end
        if entry.guidSecret then
            ev.guidSecret = true
        end
        if type(entry.name) == "string" then
            ev.name = entry.name
        elseif entry.nameSecret then
            ev.nameSecret = true
        end
        if type(entry.level) == "number" then
            ev.level = entry.level
        elseif entry.levelSecret then
            ev.levelSecret = true
        elseif entry.levelErr then
            ev.levelErr = entry.levelErr
        end
        if type(entry.classification) == "string" then
            ev.classification = entry.classification
        elseif entry.classSecret then
            ev.classificationSecret = true
        end
        emit(ev)
    end
    return entry
end

local function hostileTarget(unit)
    local player = safe(UnitIsPlayer, unit)
    if player == true or isSecret(player) then
        return false
    end
    local controlled = safe(UnitPlayerControlled, unit)
    if controlled == true and not isSecret(controlled) then
        return false
    end
    local can = safe(UnitCanAttack, "player", unit)
    if can == true and not isSecret(can) then
        return true
    end
    if can == false and not isSecret(can) then
        return false
    end
    local aff = safe(UnitAffectingCombat, unit)
    if aff == true and not isSecret(aff) then
        return true
    end
    return false
end

local function hostilePlate(unit)
    local player = safe(UnitIsPlayer, unit)
    if player == true or isSecret(player) then
        return false
    end
    if type(UnitThreatSituation) == "function" then
        local threat = safe(UnitThreatSituation, "player", unit)
        if type(threat) == "number" and not isSecret(threat) and threat >= 1 then
            return true
        end
    end
    if not inCombat then
        return false
    end
    local aff = safe(UnitAffectingCombat, unit)
    if aff == true and not isSecret(aff) then
        return true
    end
    return false
end

local function markKill(entry)
    if not entry or entry.killed then
        return
    end
    if type(entry.key) == "string" then
        if killed[entry.key] then
            entry.killed = true
            return
        end
        killed[entry.key] = true
    end
    entry.killed = true
    entry.dead = true
    local ev = { e = "mob_kill" }
    if type(entry.npcId) == "number" then
        ev.npcId = entry.npcId
    end
    if type(entry.unitType) == "string" then
        ev.unitType = entry.unitType
    end
    if entry.guidSecret then
        ev.guidSecret = true
    end
    if type(entry.name) == "string" then
        ev.name = entry.name
    elseif entry.nameSecret then
        ev.nameSecret = true
    end
    local t = nowSeconds()
    if type(t) == "number" and type(entry.firstSeen) == "number" then
        ev.killSec = t - entry.firstSeen
    end
    emit(ev)
end

local function checkDeadUnit(unit)
    if not fight or type(unit) ~= "string" then
        return
    end
    local entry = nil
    for i = 1, #fight.order do
        local candidate = fight.mobs[fight.order[i]]
        if candidate and candidate.tokens and candidate.tokens[unit] then
            entry = candidate
            break
        end
    end
    if not entry then
        return
    end
    if entry.dead or entry.killed then
        return
    end
    local dead = safe(UnitIsDead, unit)
    if isSecret(dead) or dead ~= true then
        return
    end
    markKill(entry)
end

-- "<name> dies, you gain N experience." is the only reliable kill signal
-- without the combat log; nameplate death checks miss most kills.
local function onXpChat(_, text)
    if type(text) ~= "string" or isSecret(text) then
        return
    end
    local name = string.match(text, "^(.+) dies, you gain")
    if not name then
        return
    end
    if fight then
        local best = nil
        for i = 1, #fight.order do
            local entry = fight.mobs[fight.order[i]]
            if entry and not entry.killed and entry.name == name then
                if not best or (type(entry.firstSeen) == "number" and type(best.firstSeen) == "number" and entry.firstSeen < best.firstSeen) then
                    best = entry
                end
            end
        end
        if best then
            markKill(best)
            return
        end
    end
    emit({ e = "mob_kill", name = name, killSecErr = "not tracked in a fight" })
end

local function mobSnapshot(entry, withStats)
    local row = {}
    if type(entry.npcId) == "number" then
        row.npcId = entry.npcId
    end
    if type(entry.name) == "string" then
        row.name = entry.name
    end
    if withStats then
        if type(entry.level) == "number" then
            row.level = entry.level
        end
        if type(entry.classification) == "string" then
            row.classification = entry.classification
        end
    end
    if row.npcId == nil and row.name == nil and not withStats then
        return nil
    end
    if withStats and row.npcId == nil and row.name == nil and row.level == nil and row.classification == nil then
        return nil
    end
    return row
end

local function enumNumber(group, field, fallback)
    if Enum and type(Enum[group]) == "table" then
        local value = Enum[group][field]
        if type(value) == "number" and not isSecret(value) then
            return value
        end
    end
    return fallback
end

-- DamageMeterSessionType.Current = 1 and DamageMeterType are documented.
-- DamageMeterCombatSession field names are not, so amounts are not copied
-- off the session table. GetSessionDurationSeconds returns a documented number.
local function attachDamage(ev)
    if C_DamageMeter == nil or type(C_DamageMeter.GetCombatSessionFromType) ~= "function" then
        ev.damageErr = "unavailable"
        return
    end
    local sessionType = enumNumber("DamageMeterSessionType", "Current", 1)
    local damageDone = enumNumber("DamageMeterType", "DamageDone", 0)
    local session, err = safe(C_DamageMeter.GetCombatSessionFromType, sessionType, damageDone)
    if isSecret(session) then
        ev.damageSecret = true
    elseif session == nil and err ~= nil then
        ev.damageErr = err
    elseif type(session) == "number" then
        ev.damageDone = session
    elseif type(session) ~= "table" then
        ev.damageErr = "unavailable"
    end
    if type(C_DamageMeter.GetSessionDurationSeconds) == "function" then
        local dur = safe(C_DamageMeter.GetSessionDurationSeconds, sessionType)
        if isSecret(dur) then
            ev.damageDurSecret = true
        elseif type(dur) == "number" then
            ev.damageDur = dur
        end
    end
    if ev.damageDone == nil and ev.damageSecret ~= true and ev.damageErr == nil and ev.damageDur == nil then
        ev.damageErr = "no documented amounts"
    end
end

local function onFightStart()
    inCombat = true
    killed = {}
    local t, secretTime = nowSeconds()
    fight = newFight()
    fight.start = t
    fight.startSecret = secretTime and true or false
    local xp = safe(UnitXP, "player")
    if isSecret(xp) then
        fight.xpSecret = true
    elseif type(xp) == "number" then
        fight.xp = xp
    else
        fight.xpErr = "UnitXP failed"
    end
    local ev = { e = "fight_start" }
    emit(ev)
    if hostileTarget("target") then
        remember("target", true)
    end
    for unit in pairs(plateTokens) do
        if hostilePlate(unit) then
            remember(unit, true)
        end
    end
end

local function onFightEnd()
    inCombat = false
    if not fight then
        return
    end
    local ev = { e = "fight_end" }
    local t = nowSeconds()
    if type(t) == "number" and type(fight.start) == "number" then
        ev.dur = t - fight.start
    elseif fight.startSecret then
        ev.durSecret = true
    end
    local xp = safe(UnitXP, "player")
    if fight.xpSecret or isSecret(xp) then
        ev.xpGainedSecret = true
    elseif type(fight.xp) == "number" and type(xp) == "number" then
        ev.xpGained = xp - fight.xp
    else
        ev.xpGainedErr = fight.xpErr or "UnitXP failed"
    end
    local hp = safe(UnitHealth, "player")
    local mx = safe(UnitHealthMax, "player")
    if isSecret(hp) or isSecret(mx) then
        ev.healthPctSecret = true
    elseif type(hp) == "number" and type(mx) == "number" and mx > 0 then
        ev.healthPct = (hp / mx) * 100
    else
        ev.healthPctErr = "health unavailable"
    end
    ev.mobCount = fight.count
    local mobs = {}
    for i = 1, #fight.order do
        local row = mobSnapshot(fight.mobs[fight.order[i]], true)
        if row then
            mobs[#mobs + 1] = row
        end
    end
    ev.mobs = mobs
    attachDamage(ev)
    emit(ev)
    fight = nil
end

local function killersNow()
    local list = {}
    if not fight then
        return list
    end
    for i = 1, #fight.order do
        local entry = fight.mobs[fight.order[i]]
        if entry and not entry.dead then
            local row = mobSnapshot(entry, false)
            if row then
                list[#list + 1] = row
            end
        end
    end
    return list
end

local deathPos = nil
local dead = false

local function noteGhost()
    if not dead then
        return
    end
    local ghost = safe(UnitIsGhost, "player")
    if ghost == true and not isSecret(ghost) then
        sawGhost = true
    end
end

local function onDeath()
    -- PLAYER_DEAD can fire twice for one death; count it once.
    if dead then
        return
    end
    dead = true
    noteActivity()
    local t = nowSeconds()
    deathAt = t
    sawGhost = false
    deathPos = nil
    if type(AdventureLog.position) == "function" then
        local pos = AdventureLog.position()
        if type(pos) == "table" and type(pos.map) == "number" and type(pos.x) == "number" and type(pos.y) == "number" then
            deathPos = { map = pos.map, x = pos.x, y = pos.y }
        end
    end
    local ev = { e = "death" }
    local level, levelErr = safe(UnitLevel, "player")
    if isSecret(level) then
        ev.levelSecret = true
    elseif type(level) == "number" then
        ev.level = level
    else
        ev.levelErr = levelErr or "UnitLevel failed"
    end
    if fight and type(t) == "number" and type(fight.start) == "number" then
        ev.fightDur = t - fight.start
    end
    ev.killers = killersNow()
    copyPosition(ev)
    if type(AdventureLog.record) == "function" then
        AdventureLog.record(ev)
    end
    if C_DeathRecap and type(C_DeathRecap.HasRecapEvents) == "function" then
        local has = safe(C_DeathRecap.HasRecapEvents)
        if has == true and not isSecret(has) then
            local recap = { e = "death_recap", hasRecap = true }
            if type(C_DeathRecap.GetRecapMaxHealth) == "function" then
                local maxHealth = safe(C_DeathRecap.GetRecapMaxHealth)
                if isSecret(maxHealth) then
                    recap.maxHealthSecret = true
                elseif type(maxHealth) == "number" then
                    recap.maxHealth = maxHealth
                end
            end
            emit(recap)
        end
    end
end

local function finishRevive(how)
    local ev = { e = "revive", how = how }
    local t = nowSeconds()
    if type(t) == "number" and type(deathAt) == "number" then
        ev.timeLost = t - deathAt
    else
        ev.timeLostErr = "death time unknown"
    end
    emit(ev)
    dead = false
    deathAt = nil
    deathPos = nil
    sawGhost = false
end

-- PLAYER_ALIVE fires when the spirit is released (player becomes a ghost) or
-- when resurrected in place by someone else. It also fires once at login.
local function onAlive()
    if not dead then
        return
    end
    local ghost = safe(UnitIsGhost, "player")
    if ghost == true and not isSecret(ghost) then
        sawGhost = true
        local ev = { e = "release" }
        local t = nowSeconds()
        if type(t) == "number" and type(deathAt) == "number" then
            ev.sinceDeath = t - deathAt
        end
        emit(ev)
        return
    end
    finishRevive("resurrected")
end

-- PLAYER_UNGHOST: back to life after being a ghost. Near the corpse means a
-- corpse run; elsewhere means the spirit healer.
local function onUnghost()
    if not dead then
        return
    end
    local how = "spiritHealerOrCorpse"
    if deathPos and type(AdventureLog.position) == "function" then
        local pos = AdventureLog.position()
        if type(pos) == "table" and type(pos.x) == "number" and type(pos.y) == "number" then
            local dx = pos.x - deathPos.x
            local dy = pos.y - deathPos.y
            if pos.map == deathPos.map and (dx * dx + dy * dy) <= 25 then
                how = "corpse"
            else
                how = "spiritHealer"
            end
        end
    end
    finishRevive(how)
end

AdventureLog.on("PLAYER_REGEN_DISABLED", function()
    onFightStart()
end)

AdventureLog.on("PLAYER_REGEN_ENABLED", function()
    onFightEnd()
end)

AdventureLog.on("PLAYER_TARGET_CHANGED", function()
    noteGhost()
    if hostileTarget("target") then
        remember("target", inCombat)
    end
end)

AdventureLog.on("NAME_PLATE_UNIT_ADDED", function(_, unit)
    noteGhost()
    if type(unit) ~= "string" then
        return
    end
    if hostilePlate(unit) then
        plateTokens[unit] = true
        remember(unit, inCombat)
    end
end)

AdventureLog.on("NAME_PLATE_UNIT_REMOVED", function(_, unit)
    if type(unit) ~= "string" then
        return
    end
    plateTokens[unit] = nil
    checkDeadUnit(unit)
    if not fight then
        return
    end
    for i = 1, #fight.order do
        local entry = fight.mobs[fight.order[i]]
        if entry and entry.tokens then
            entry.tokens[unit] = nil
        end
    end
end)

AdventureLog.on("UNIT_HEALTH", function(_, unit)
    checkDeadUnit(unit)
end)

AdventureLog.on("UNIT_FLAGS", function(_, unit)
    checkDeadUnit(unit)
end)

AdventureLog.on("PLAYER_DEAD", function()
    onDeath()
end)

AdventureLog.on("PLAYER_ALIVE", function()
    onAlive()
end)

AdventureLog.on("PLAYER_UNGHOST", function()
    onUnghost()
end)

AdventureLog.on("CHAT_MSG_COMBAT_XP_GAIN", onXpChat)
