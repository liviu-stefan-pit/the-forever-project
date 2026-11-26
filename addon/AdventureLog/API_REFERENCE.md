# AdventureLog Forever API contract

Contract for implementers of the WoW Forever addon **AdventureLog**. Signatures below come from the generated Blizzard API docs on `Gethe/wow-ui-source` branch `forever` (`Interface/AddOns/Blizzard_APIDocumentationGenerated`). If a generated file has no signature, this sheet says **UNKNOWN** and does not invent one. Local Forever addons are cited only as calling patterns.

Forever is **Mainline / Midnight API**, not Classic Era. Combat log is **restricted**. Do not use `COMBAT_LOG_EVENT_UNFILTERED` as a data source.

## Client identity

| Item | Value | Source |
| --- | --- | --- |
| Doc build stamp | **1.60.1.71037** | `https://raw.githubusercontent.com/Gethe/wow-ui-source/forever/version.txt` (repo root; there is no `Blizzard_APIDocumentationGenerated/version.txt`) |
| Version / build | 1.60.1 build 71037 | Same stamp + this plan |
| Interface / TOC | 16001 | `GuideWebExport.toc`, `QuestieTrace-Forever.toc`, `Details_Camelot.toc` (`## Interface: 16001`) |
| `WOW_PROJECT_ID` | 18 (`WOW_PROJECT_CAMELOT`) | Not in generated docs. `GuideWebExport.lua` guards `WOW_PROJECT_ID ~= 18`. |
| Engine | Mainline / Midnight `C_*` API | Generated namespaces (`C_QuestLog`, `C_Map`, `C_Container`, `C_SpellBook`, `C_DamageMeter`, …) |
| Not Classic Era | Do not use Classic-only globals as the primary path | `C_QuestLog.GetInfo` returns a table, not `GetQuestLogTitle` |

`GetBuildInfo` (BuildDocumentation.lua, global, no namespace):

```
GetBuildInfo() -> buildVersion: cstring, buildNumber: cstring, buildDate: cstring, interfaceVersion: number, localizedVersion: cstring, buildInfo: string
```

Call: `local version, build, buildDate, toc = safe(GetBuildInfo)` then store `WOW_PROJECT_ID` beside it. Generated docs also return `localizedVersion` and `buildInfo`; ignore extras if unused.

`PlayerDocumentation.lua` exists and is **empty** (no functions, no events). `C_PlayerInfo` is **not** empty; see Functions.

## Calling conventions (copy from GuideWebExport)

Copy these patterns. They are the house style for Forever 1.60.1.

**`safe()` / `pcall` — wrap every game API:**

```lua
local function safe(fn, ...)
    if type(fn) ~= "function" then return nil end
    local ok, a, b, c, d = pcall(fn, ...)
    if ok then return a, b, c, d end
    return nil
end
```

**`C_EventUtils.IsEventValid` before `RegisterEvent`:**

```lua
local function eventAllowed(name)
    if C_EventUtils == nil or type(C_EventUtils.IsEventValid) ~= "function" then
        return true
    end
    local ok, valid = pcall(C_EventUtils.IsEventValid, name)
    if not ok then return false end
    return valid and true or false
end
-- then: if eventAllowed(ev) then frame:RegisterEvent(ev) end
```

**Durability is slot-only** (never pass a unit):

```lua
for slot = 1, 18 do
    local ok, cur, maxv = pcall(GetInventoryItemDurability, slot)
    -- …
end
```

**Two-part `UnitName` on Forever** (second return is surname, not realm; drop it if it matches the realm):

```lua
-- Forever: UnitName returns first name and surname; GetUnitName(unit, true) is "First Surname".
local first, second = safe(UnitName, "player")
local full = safe(GetUnitName, "player", true)
local realm = safe(GetRealmName)
```

**Namespaces used the Mainline way:** `C_QuestLog`, `C_SkillInfo`, `C_Map`, `C_Container`, `C_TaxiMap`, `C_Reputation`, `C_SpellBook`, `C_Timer.After`.

**Timers:** `if C_Timer and C_Timer.After then C_Timer.After(delay, fn) end`. Coalesce bursty events (quest log, bags, gold) with a delayed refresh, not a handler that dumps SavedVariables on every fire.

**Quest log / skills / reputation:** expand collapsed headers, read, then restore. `QUEST_TURNED_IN` can fire before `GetAllCompletedQuestIDs` includes the id — remember session turn-ins.

**Taxi:** only `C_TaxiMap.GetAllTaxiNodes(GetTaxiMapID())` while the taxi map is open (`TAXIMAP_OPENED`). Persist learned nodes across sessions.

**Vector2 map position:** `pos.GetXY` if present, else `pos.x, pos.y`.

## Events table

| Event | Exists in generated docs? | Payload (name, order) | Secrets / flags | How AdventureLog should call it |
| --- | --- | --- | --- | --- |
| `PLAYER_ENTERING_WORLD` | Yes — SystemDocumentation.lua | `isInitialLogin: bool`, `isReloadingUi: bool` | none listed | Register if valid. Start session, snapshot identity/position, schedule delayed full sample. |
| `PLAYER_LOGOUT` | Yes — SystemDocumentation.lua | none | none listed | Flush SavedVariables snapshot immediately (GuideWebExport does this; do not wait for a timer). |
| `QUEST_ACCEPTED` | Yes — QuestLogDocumentation.lua | `questId: number` **only** | none listed | Record `questId`. Do not assume a second arg. Then sample `C_QuestLog`. |
| `QUEST_TURNED_IN` | Yes — QuestLogDocumentation.lua | `questID: number`, `xpReward: number`, `moneyReward: number` | none listed | Remember `questID` in a session set (completed list may lag). Store xp/money rewards. |
| `QUEST_REMOVED` | Yes — QuestLogDocumentation.lua | `questID: number`, `wasReplayQuest: bool` | none listed | Drop from log / session accepted set. |
| `QUEST_LOG_UPDATE` | Yes — QuestLogDocumentation.lua | none | `UniqueEvent = true` | Re-read log via `C_QuestLog`. Ignore while your own expand/collapse is in progress. Coalesce. |
| `QUEST_LOG_CRITERIA_UPDATE` | Yes — QuestLogDocumentation.lua | `questID`, `specificTreeID`, `description: cstring`, `numFulfilled`, `numRequired` (all required) | none listed | Update that quest’s objectives; do not treat as a full log rebuild unless needed. |
| `QUEST_DATA_LOAD_RESULT` | Yes — QuestLogDocumentation.lua | `questID: number`, `success: bool` | none listed | If `success`, re-read title/objectives for `questID` after `RequestLoadQuestByID`. |
| `PLAYER_XP_UPDATE` | Yes — UnitDocumentation.lua | `unitTarget: UnitTokenVariant` | none listed | Sample `UnitXP` / `UnitXPMax` / `GetXPExhaustion` for `"player"`. |
| `CHAT_MSG_COMBAT_XP_GAIN` | Yes — ChatInfoDocumentation.lua | Standard chat payload: `text`, `playerName`, `languageName`, `channelName`, `playerName2`, `specialFlags`, `zoneChannelID`, `channelIndex`, `channelBaseName`, `languageID`, `lineID`, `guid`, `bnSenderID`, `isMobile`, `isSubtitle`, `hideSenderInLetterbox`, `suppressRaidIcons`, `discordInfo` | Several fields `NeverSecret`; `text` / `playerName` / `guid` are not flagged NeverSecret | Use `text` as a kill/xp breadcrumb. Do not persist player names or player GUIDs. QuestieTrace sanitizes all `CHAT_MSG_*` args. |
| `PLAYER_LEVEL_UP` | Yes — UnitDocumentation.lua | `level`, `healthDelta`, `powerDelta`, `numNewTalents`, `numNewPvpTalentSlots`, `strengthDelta`, `agilityDelta`, `staminaDelta`, `intellectDelta`, `spiritDelta` (all number, required) | none listed | Record `level`. Re-sample XP and skills. |
| `PLAYER_MONEY` | Yes — CurrencyInfoDocumentation.lua | none | none listed | Sample `GetMoney()`. |
| `TIME_PLAYED_MSG` | Yes — SystemDocumentation.lua | `totalTimePlayed: number`, `timePlayedThisLevel: number` | none listed | Fires after `RequestTimePlayed()`. Store both numbers. |
| `PLAYER_REGEN_DISABLED` | Yes — UnitDocumentation.lua | none | none listed | Player entered combat lockdown. Stop secret-sensitive work; do not start CLEU. |
| `PLAYER_REGEN_ENABLED` | Yes — UnitDocumentation.lua | none | none listed | Left combat. Safe to snapshot health/bags/durability that may have been secret. |
| `PLAYER_TARGET_CHANGED` | Yes — UnitDocumentation.lua | none | none listed | Re-read `"target"` with `pcall`. Identity APIs may return secrets for NPCs on restricted maps — test `issecretvalue` before storing names/GUIDs. Persist npcId only (see GUID rules). |
| `NAME_PLATE_UNIT_ADDED` | Yes — NamePlateManagerDocumentation.lua | `unitToken: UnitTokenType` | none listed | Token only. Probe unit APIs; persist npcId from Creature GUIDs, not names, if identity is secret. |
| `NAME_PLATE_UNIT_REMOVED` | Yes — NamePlateManagerDocumentation.lua | `unitToken: UnitTokenType` | none listed | Drop plate tracking for that token. |
| `UNIT_HEALTH` | Yes — UnitDocumentation.lua | `unitTarget: UnitTokenVariant` | `UniqueEvent = true`. `UnitHealth` itself is `SecretReturns = true` | Register as a unit event for `"player"` / `"target"` if needed. Do not compare secret health values. |
| `UNIT_FLAGS` | Yes — UnitDocumentation.lua | `unitTarget: UnitTokenVariant` | none listed | Optional combat/NPC flag changes; do not use instead of CLEU. |
| `PLAYER_DEAD` | Yes — DeathInfoDocumentation.lua | none | none listed | Mark dead. Sample `UnitIsDead` / `UnitIsDeadOrGhost`. |
| `PLAYER_ALIVE` | Yes — DeathInfoDocumentation.lua | none | none listed | Mark alive (release or rez). |
| `PLAYER_UNGHOST` | Yes — DeathInfoDocumentation.lua | none | none listed | Left ghost form. |
| `LOOT_OPENED` | Yes — LootDocumentation.lua | `autoLoot: bool`, `isFromItem: bool` | none listed | Open loot window. Then probe loot slot APIs (see UNKNOWN loot globals). QuestieTrace also listens for `LOOT_READY`. |
| `LOOT_CLOSED` | Yes — LootDocumentation.lua | none | none listed | Close loot sample. |
| `CHAT_MSG_LOOT` | Yes — ChatInfoDocumentation.lua | Same chat payload as `CHAT_MSG_COMBAT_XP_GAIN` | same NeverSecret flags | Parse item links from `text` only. Strip names/GUIDs. |
| `CHAT_MSG_MONEY` | Yes — ChatInfoDocumentation.lua | Same chat payload | same | Confirm copper loot from `text`; still sample `GetMoney()`. |
| `MERCHANT_SHOW` | Yes — MerchantFrameDocumentation.lua | none | none listed | Vendor open. Snapshot bags/money; do not parse CLEU. |
| `MERCHANT_CLOSED` | Yes — MerchantFrameDocumentation.lua | none | none listed | Vendor closed. |
| `SKILL_LINES_CHANGED` | Yes — SkillInfoDocumentation.lua | none | none listed | Re-read `C_SkillInfo` (expand headers, restore). |
| `SPELLS_CHANGED` | Yes — SpellBookDocumentation.lua | none | `UniqueEvent = true` | Re-probe `C_SpellBook.IsSpellKnown` for watched ids. |
| `TRAINER_SHOW` | Yes — TrainerDocumentation.lua | none | none listed | Trainer open; skills/spells may change on close. |
| `UNIT_SPELLCAST_SUCCEEDED` | Yes — UnitDocumentation.lua | `unitTarget: UnitTokenVariant`, `castGUID: WOWGUID`, `spellID: number`, `castBarID: UnitCastBarID?` (`NeverSecret`) | `SecretWhenUnitSpellCastRestricted = true` | Register for `"player"`. Store `spellID` when not secret. Do not treat as a combat log. |
| `PLAYER_FLAGS_CHANGED` | Yes — UnitDocumentation.lua | `unitTarget: UnitTokenVariant` | none listed | AFK/DND/etc. Filter to `"player"` if you care. |
| `ZONE_CHANGED` | Yes — MapDocumentation.lua | none | none listed | Re-sample zone/subzone/map position. |
| `ZONE_CHANGED_NEW_AREA` | Yes — MapDocumentation.lua | none | none listed | Same, plus `C_Map.GetBestMapForUnit("player")`. |
| `TAXIMAP_OPENED` | Yes — TaxiMapDocumentation.lua | `system: number` | none listed | Call `GetTaxiMapID` then `C_TaxiMap.GetAllTaxiNodes(mapId)` and merge learned nodes. |
| `PLAYER_CONTROL_LOST` | Yes — LossOfControlDocumentation.lua | none | none listed | Taxi / CC / vehicle. Pair with `UnitOnTaxi("player")`. |
| `PLAYER_CONTROL_GAINED` | Yes — LossOfControlDocumentation.lua | none | none listed | Control returned. |
| `BAG_UPDATE_DELAYED` | Yes — ContainerDocumentation.lua | none | `UniqueEvent = true` | Scan bags via `C_Container` after the burst. |
| `COMBAT_LOG_EVENT_UNFILTERED` | Yes — CombatLogDocumentation.lua | **No payload listed.** `HasRestrictions = true`, `CallbackEvent = true`, `SynchronousEvent = true` | Restricted. `C_CombatLogSecure.GetCurrentEventInfo` / `C_CombatLogInternal.GetCurrentEventInfo` document **empty returns** | **Probe only.** See Combat log. Do not parse CLEU. Do not call `CombatLogGetCurrentEventInfo`. |

### Events added in AdventureLog 1.2.0

Checked against the generated docs and the `forever` FrameXML on 2026-11-26. `/adv probe` reports each one in the session header.

| Event | Exists in generated docs? | Payload | How AdventureLog uses it |
| --- | --- | --- | --- |
| `QUEST_DETAIL` | Not in generated docs; registered by `Blizzard_UIPanels_Game/Mainline/QuestFrame.lua` | `questStartItemID` (QuestFrame reads it) | Remember the dialog's `"npc"` unit and position for the next `QUEST_ACCEPTED`. |
| `QUEST_GREETING`, `QUEST_PROGRESS`, `QUEST_COMPLETE` | Not in generated docs; QuestFrame.lua | none | Same; `QUEST_COMPLETE` also reads the rewards on offer. |
| `QUEST_FINISHED` | Yes — QuestOfferDocumentation.lua | none | Mark the quest dialog closed. |
| `GOSSIP_SHOW`, `GOSSIP_CLOSED` | Yes — GossipInfoDocumentation.lua | none | Dialog source; a GameObject `"npc"` is an `object_use`. |
| `ITEM_TEXT_BEGIN` | Yes — ItemTextDocumentation.lua | none | A readable object (note, plaque) is an `object_use`. |
| `PLAYER_SOFT_INTERACT_CHANGED` | Yes — UnitDocumentation.lua | `oldTarget: WOWGUID`, `newTarget: WOWGUID` (`SecretWhenUnitIdentityRestricted`) | Remember the GameObject you can interact with (id from GUID field 6, name from `UnitName("softinteract")`). |
| `UNIT_SPELLCAST_SENT` | Yes — UnitDocumentation.lua | `unitTarget`, `target: cstring` (`ConditionalSecret`), `castGUID`, `spellID` | Player only. A cast whose target is the soft-interact object becomes `object_use` on `UNIT_SPELLCAST_SUCCEEDED`. |
| `TRAINER_CLOSED` | Yes — TrainerDocumentation.lua | none | Money spent at the trainer. |
| `CHAT_MSG_SYSTEM` | Yes — ChatInfoDocumentation.lua | standard chat payload | Exploration XP line only (`ERR_ZONE_EXPLORED_XP`, English fallback). |

## Functions table

| Function | Exists in generated docs? | Signature | Returns / struct | Secrets | How AdventureLog should call it |
| --- | --- | --- | --- | --- | --- |
| `GetServerTime` | Yes — SystemTimeDocumentation.lua (global) | `()` | `time: number` | none listed | Wall-clock server unix time for session stamps. `safe(GetServerTime)`. |
| `time` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | Lua 5.1 global. GuideWebExport uses `time()` for `exportedAt`. Prefer `GetServerTime` when present; if you call `time`, wrap in `pcall`. |
| `GetTime` | Yes — SystemTimeDocumentation.lua (global) | `()` | `time: number` | none listed | Client monotonic time for durations. QuestieTrace baselines sessions on `GetTime()`. |
| `RequestTimePlayed` | Yes — PlayerScriptDocumentation.lua (global) | `()` | none | none listed | Call once after login; handle `TIME_PLAYED_MSG`. |
| `C_Timer.After` | Yes — UITimerDocumentation.lua | `(seconds: number, callback: TimerCallback)` | none | `SecretArguments = AllowedWhenUntainted` | `C_Timer.After(delay, fn)` for coalesced refresh. |
| `C_Timer.NewTicker` | Yes — UITimerDocumentation.lua | `(seconds: number, callback: TickerCallback, iterations: number?)` | `cbObject: TickerCallback` | `SecretArguments = AllowedWhenUntainted` | Heartbeat sampler. Keep callbacks cheap; cancel on logout. |
| `C_EventUtils.IsEventValid` | Yes — EventUtilsDocumentation.lua | `(eventName: stringView)` | `valid: bool` | `SecretArguments = AllowedWhenUntainted` | Gate every `RegisterEvent`. |
| `issecretvalue` | Yes — FrameScriptDocumentation.lua (global) | `(value: LuaValueReference)` | `isSecret: bool` | `SecretArguments = AllowedWhenUntainted`; `SecureHooksAllowed = false` | Before storing names, GUIDs, health, threat, casts: `if issecretvalue and issecretvalue(v) then skip`. QuestieTrace does this for GUIDs. |
| `WOW_PROJECT_ID` | **UNKNOWN** in generated docs | UNKNOWN (global number / related `WOW_PROJECT_CAMELOT`) | UNKNOWN | UNKNOWN | Compare to 18. GuideWebExport: `if WOW_PROJECT_ID ~= nil and WOW_PROJECT_ID ~= 18 then …`. |
| `GetBuildInfo` | Yes — BuildDocumentation.lua | `()` | see Client identity | none listed | Store version/build/date/toc. |
| `UnitName` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `unitName: cstring`, `unitServer: cstring` | `SecretWhenUnitNameIdentityRestricted`; `SecretArguments = AllowedWhenTainted` | Forever: treat returns as first + surname. If `second` matches `GetRealmName` / `GetNormalizedRealmName`, it is not a surname. |
| `GetUnitName` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | GuideWebExport: `safe(GetUnitName, "player", true)` → `"First Surname"`. Wrap in `pcall`. |
| `GetRealmName` | Yes — ConnectionDocumentation.lua (global) | `()` | `realmName: cstring` | none listed | `safe(GetRealmName)`. |
| `UnitGUID` | Yes — UnitDocumentation.lua | `(unit: UnitTokenPvPRestrictedForAddOns)` | `result: WOWGUID?` | `SecretWhenUnitIdentityRestricted`; `SecretArguments = AllowedWhenUntainted` | Parse Creature GUIDs; persist npcId only. Discard if secret or player. |
| `UnitRace` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `localizedRaceName`, `englishRaceName`, `raceID` | `SecretWhenUnitIdentityRestricted`; `MayReturnNothing` | `safe(UnitRace, "player")`. |
| `UnitClass` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `className` (`ConditionalSecret`), `classFilename`, `classID` | `SecretWhenUnitIdentityRestricted`; `MayReturnNothing` | `safe(UnitClass, "player")`. |
| `UnitLevel` | Yes — UnitDocumentation.lua | `(name: cstring)` | `result: number` | `SecretArguments = AllowedWhenUntainted` | `safe(UnitLevel, "player")`. |
| `UnitFactionGroup` | Yes — UnitDocumentation.lua | `(unitName: cstring, checkDisplayRace: bool = false)` | `factionGroupTag: cstring`, `localized: cstring` | `SecretArguments = AllowedWhenUntainted` | `safe(UnitFactionGroup, "player")`. |
| `UnitXP` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: number` | `SecretArguments = AllowedWhenUntainted` | `safe(UnitXP, "player")`. |
| `UnitXPMax` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: number` | `SecretArguments = AllowedWhenUntainted` | `safe(UnitXPMax, "player")`. |
| `GetXPExhaustion` | Yes — PlayerScriptDocumentation.lua | `()` | `result: number?` | none listed | Nil when not rested. |
| `GetRestState` | Yes — PlayerScriptDocumentation.lua | `()` | `exhaustionID: number`, `name: cstring`, `factor: number`; `MayReturnNothing` | none listed | `safe(GetRestState)`. |
| `GetMoney` | Yes — PlayerScriptDocumentation.lua | `()` | `result: number` (copper) | none listed | `safe(GetMoney)`. |
| `GetBindLocation` | Yes — PlayerScriptDocumentation.lua | `()` | `result: cstring` | none listed | Hearth location string. |
| `UnitIsDeadOrGhost` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: bool` | `SecretArguments = AllowedWhenUntainted` | `safe(UnitIsDeadOrGhost, "player")`. |
| `UnitIsGhost` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: bool` | `SecretArguments = AllowedWhenUntainted` | Distinguish ghost vs corpse. |
| `UnitIsDead` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: bool` | `SecretArguments = AllowedWhenUntainted` | Corpse, not ghost. |
| `UnitAffectingCombat` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: bool` | `SecretArguments = AllowedWhenUntainted` | Combat flag without CLEU. |
| `UnitThreatSituation` | Yes — UnitDocumentation.lua | `(unit: UnitToken, mobGUID: UnitToken?)` | `result: number?` | `SecretWhenUnitThreatStateRestricted`; `SecretArguments = AllowedWhenUntainted` | Optional; skip if secret. |
| `UnitClassification` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: cstring` | `SecretArguments = AllowedWhenUntainted` | `"normal"` / `"elite"` / etc. for the current target. |
| `UnitHealth` | Yes — UnitDocumentation.lua | `(unit: UnitTokenPvPRestrictedForAddOns, usePredicted: bool = true)` | `result: number` | **`SecretReturns = true`**; `SecretArguments = AllowedWhenUntainted` | Do not branch on the value in combat. Display-only or skip when `issecretvalue`. |
| `UnitHealthMax` | Yes — UnitDocumentation.lua | `(unit: UnitTokenPvPRestrictedForAddOns)` | `result: number` | `SecretWhenUnitHealthMaxRestricted`; `SecretArguments = AllowedWhenUntainted` | Same caution. `C_Secrets.ShouldUnitHealthMaxBeSecret(unit)` exists if you need to know. |
| `UnitOnTaxi` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `result: bool` | `SecretArguments = AllowedWhenUntainted` | Confirm flight after `PLAYER_CONTROL_LOST`. |
| `C_Map.GetBestMapForUnit` | Yes — MapDocumentation.lua | `(unitToken: UnitToken)` | `uiMapID: number?` | `SecretArguments = AllowedWhenUntainted`. Docs: player and party only | `safe(C_Map.GetBestMapForUnit, "player")`. |
| `C_Map.GetPlayerMapPosition` | Yes — MapDocumentation.lua | `(uiMapID: number, unitToken: UnitToken)` | `position: vector2?` (Vector2DMixin) | `SecretArguments = AllowedWhenUntainted`. Player/party only | `local xy = safe(C_Map.GetPlayerMapPosition, mapId, "player")` then `GetXY` / `.x/.y`. |
| `C_Map.GetMapInfo` | Yes — MapDocumentation.lua | `(uiMapID: number)` | `info: UiMapDetails` (`MayReturnNothing`) | `SecretArguments = AllowedWhenUntainted` | `UiMapDetails`: `mapID`, `name`, `mapType`, `parentMapID`, `flags`. |
| `GetZoneText` | Yes — ZoneScriptDocumentation.lua (global) | `()` | `text: cstring` | none listed | Fallback zone name if map info missing. |
| `GetSubZoneText` | Yes — ZoneScriptDocumentation.lua (global) | `()` | `text: cstring` | none listed | Subzone. |
| `UnitPosition` | Yes — UnitDocumentation.lua | `(unit: UnitToken)` | `positionX`, `positionY`, `positionZ`, `mapID` (all number) | `SecretArguments = AllowedWhenUntainted` | Instance/world coords; not uiMap normalized. |
| `C_QuestLog.GetInfo` | Yes — QuestLogDocumentation.lua | `(questLogIndex: luaIndex)` | `info: QuestInfo?` | `SecretArguments = AllowedWhenUntainted` | Walk `1..numShownEntries`. Skip `isHeader` / `isHidden`. See QuestInfo fields below. |
| `C_QuestLog.GetTitleForQuestID` | Yes | `(questID: number)` | `title: cstring?` | `SecretArguments = AllowedWhenUntainted`. Quests only, not headers | After accept / data load. |
| `C_QuestLog.GetTitleForLogIndex` | Yes | `(questLogIndex: luaIndex)` | `title: cstring?` | `SecretArguments = AllowedWhenUntainted`. Valid for anything in the log including headers | Header restore. |
| `C_QuestLog.GetQuestObjectives` | Yes | `(questID: number)` | `objectives: QuestObjectiveInfo[]` (`MayReturnNothing`) | `SecretArguments = AllowedWhenUntainted` | `text`, `type`, `finished`, `numFulfilled`, `numRequired`, `objectiveType?`. |
| `C_QuestLog.GetNumQuestLogEntries` | Yes | `()` | `numShownEntries: number`, `numQuests: number` | none listed | Use `numShownEntries` as the loop bound (GuideWebExport). |
| `C_QuestLog.GetAllCompletedQuestIDs` | Yes | `()` | `quests: number[]` | none listed | Union with session `QUEST_TURNED_IN` ids. |
| `C_QuestLog.IsQuestFlaggedCompleted` | Yes | `(questID: number)` | `isCompleted: bool` | `SecretArguments = AllowedWhenUntainted` | Single-id check. |
| `C_QuestLog.IsComplete` | Yes | `(questID: number)` | `isComplete: bool` | `SecretArguments = AllowedWhenUntainted` | In-log complete flag. |
| `C_QuestLog.IsFailed` | Yes | `(questID: number)` | `isFailed: bool` | `SecretArguments = AllowedWhenUntainted` | Check before ReadyForTurnIn. |
| `C_QuestLog.ReadyForTurnIn` | Yes | `(questID: number)` | `readyForTurnIn: bool?` | `SecretArguments = AllowedWhenUntainted` | GuideWebExport: failed → -1, ready/complete → 1. |
| `C_QuestLog.GetLogIndexForQuestID` | Yes | `(questID: number)` | `questLogIndex: luaIndex?` | `SecretArguments = AllowedWhenUntainted`. Actual quests, not headers | Map event questID → log row. |
| `C_QuestLog.RequestLoadQuestByID` | Yes | `(questID: number)` | none | `SecretArguments = AllowedWhenUntainted` | Then wait for `QUEST_DATA_LOAD_RESULT`. |
| `C_QuestLog.GetRequiredMoney` | Yes | `(questID: number?)` | `requiredMoney: number` | `SecretArguments = AllowedWhenUntainted`. Uses selected quest if id omitted | Optional. |
| `C_QuestLog.GetTrivialRange` | Yes | `()` | `range: number` | none listed | Grey-quest level band. |
| `C_PlayerInfo.GetContentDifficultyQuestForPlayer` | Yes — PlayerInfoDocumentation.lua | `(questID: number)` | `difficulty: RelativeContentDifficulty` | `SecretArguments = AllowedWhenUntainted` | Enum (QuestConstantsDocumentation.lua): `Trivial=0`, `Easy=1`, `Fair=2`, `Difficult=3`, `Impossible=4`. |
| `C_SkillInfo.GetNumSkillLines` | Yes — SkillInfoDocumentation.lua | `()` | `numSkillLines: number` | none listed | After expanding headers. |
| `C_SkillInfo.GetSkillLineInfo` | Yes | `(index: luaIndex)` | `skillLineAttributes: SkillLineAttributes?` | `SecretArguments = AllowedWhenUntainted` | **Table**, not Classic varargs. Fields: `skillID`, `name`, `isHeader`, `isCollapsed`, `rank`, `tempPoints`, `modifier`, `maxRank`, `isAbandonable`, `stepCost`, `rankCost`, `minLevel`, `costType`, `parentSkillLineID`, `skillLineCategoryID`, `description`. GuideWebExport still accepts a table *or* Classic unpacked returns. |
| `C_SpellBook.IsSpellKnown` | Yes — SpellBookDocumentation.lua | `(spellID: number, spellBank: SpellBookSpellBank = Player)` | `isKnown: bool` | `SecretArguments = AllowedWhenUntainted` | `Enum.SpellBookSpellBank.Player = 0`, `Pet = 1`. Default player. |
| `C_Item.GetItemInfo` | Yes — ItemDocumentation.lua | `(itemInfo: ItemInfo)` | `itemName`, `itemLink`, `itemQuality`, `itemLevel`, `itemMinLevel`, `itemType`, `itemSubType`, `itemStackCount`, `itemEquipLoc`, `itemTexture`, `sellPrice`, `classID`, `subclassID`, `bindType`, `expansionID`, `setID?`, `isCraftingReagent`, `itemDescription` (`MayReturnNothing`) | `SecretArguments = AllowedWhenUntainted` | Call `C_Item.GetItemInfo`, not global `GetItemInfo`. |
| `GetLootSlotLink` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | Exists in-game: QuestieTrace comments `GetLootSlotLink(index) -> string itemLink` and `pcall`s it on `LOOT_READY` / `LOOT_CLOSED`. Do not treat that comment as a generated contract. |
| `GetLootSlotInfo` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | QuestieTrace comment only: `lootIcon, lootName, lootQuantity, currencyID, lootQuality, locked, isQuestItem, questID, isActive`. Packed `pcall`. |
| `GetNumLootItems` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | QuestieTrace comment: `-> number numLootItems`. |
| `GetLootSourceInfo` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | QuestieTrace: packed `guid, quantity` repeating; keep only npc/object/item GUIDs; drop player/unrecognized. Persist npcId from Creature GUIDs only. |
| `C_Container.GetContainerNumSlots` | Yes — ContainerDocumentation.lua | `(containerIndex: BagIndex)` | `numSlots: number` | `SecretArguments = AllowedWhenUntainted` | Bags `0..4` like GuideWebExport. |
| `C_Container.GetContainerItemInfo` | Yes | `(containerIndex: BagIndex, slotIndex: luaIndex)` | `containerInfo: ContainerItemInfo` (`MayReturnNothing`) | `SecretArguments = AllowedWhenUntainted` | Struct: `iconFileID`, `stackCount`, `isLocked`, `quality?`, `isReadable`, `hasLoot`, `hyperlink`, `isFiltered`, `hasNoValue`, `itemID`, `isBound`, `itemName`. |
| `C_TaxiMap.GetAllTaxiNodes` | Yes — TaxiMapDocumentation.lua | `(uiMapID: number)` | `taxiNodes: TaxiNodeInfo[]` | `SecretArguments = AllowedWhenUntainted`. “At the current flight master.” | Only while taxi UI is open. `TaxiNodeInfo`: `nodeID`, `position`, `name`, `state` (`FlightPathState`: Current=0, Reachable=1, Unreachable=2), `slotIndex`, `textureKit`, `useSpecialIcon`, `specialIconCostString?`, `isMapLayerTransition`. GuideWebExport keeps state 0/1. |
| `GetTaxiMapID` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | GuideWebExport: `GetTaxiMapID and safe(GetTaxiMapID)` with no args; pass the result into `GetAllTaxiNodes`. |
| `C_DamageMeter` | Yes — DamageMeterDocumentation.lua | See list below | See structs below | Several `SecretWhenInCombat` | Present on Forever. Details Camelot uses this instead of CLEU. AdventureLog may read **after combat** if needed; do not use as a CLEU substitute for kill attribution in-combat (amounts/names can be secret). |
| `C_DeathRecap` | Yes — DeathRecapDocumentation.lua | See list below | `DeathRecapEventInfo` **fields are empty in the generated table** | `SecretArguments = AllowedWhenUntainted` on all four functions | Namespace exists. Event struct fields are **UNKNOWN**. Optional death breadcrumb via `HasRecapEvents` / `GetRecapMaxHealth` only. |
| `C_CombatLog.IsCombatLogRestricted` | Yes — CombatLogDocumentation.lua | `()` | `restricted: bool` | none listed | Probe at login / entering world. Expect true. Still do not subscribe to CLEU for data. |
| `GetInventoryItemDurability` | **UNKNOWN** in generated docs | UNKNOWN | UNKNOWN | UNKNOWN | GuideWebExport: **slot only**, `pcall(GetInventoryItemDurability, slot)` → `cur, maxv` for slots 1–18. Do not pass a unit. |

### Functions added in AdventureLog 1.2.0

The quest-frame and trainer globals are **not** in the generated docs. They are called by the `forever` FrameXML (`QuestFrame.lua`, `QuestInfo.lua`, `Blizzard_TrainerUI.lua`), which is the evidence that they exist on 1.60.1. Every call is guarded and wrapped in `pcall`; when one is missing, the field is written as `<field>Err`.

| Function | Source | Signature as the FrameXML calls it | Use |
| --- | --- | --- | --- |
| `GetQuestID` | QuestFrame.lua | `() -> questID` (0 when none) | Quest of the open dialog. |
| `GetNumQuestChoices`, `GetNumQuestRewards` | QuestFrame.lua, QuestInfo.lua | `() -> number` | Reward rows. |
| `GetQuestItemInfo` | QuestFrame.lua | `(type: "choice"/"reward"/"required", index) -> name, texture, count, quality, isUsable, itemID` | Six returns: read with a packed `pcall` (`safe` keeps four). |
| `GetQuestItemLink` | QuestInfo.lua | `(type, index) -> itemLink` | itemId fallback. |
| `GetRewardMoney`, `GetRewardXP` | QuestInfo.lua | `() -> number` | Reward money / XP shown. |
| `GetQuestReward` | QuestFrame.lua | `(itemChoice)` | Post-hooked with `hooksecurefunc` to learn the chosen index. Never called by the addon. |
| `GetNumTrainerServices` | Blizzard_TrainerUI.lua | `() -> number` | |
| `GetTrainerServiceInfo` | Blizzard_TrainerUI.lua | `(index) -> name, serviceType, texture, reqLevel, subText, category` | Packed `pcall`. |
| `GetTrainerServiceCost` | Blizzard_TrainerUI.lua | `(index) -> moneyCost, isProfession` | |
| `GetTrainerServiceSkillLine` | Blizzard_TrainerUI.lua | `(index) -> skill line name` | |
| `BuyTrainerService` | Blizzard_TrainerUI.lua | `(index)` | Post-hooked; never called by the addon. |
| `C_Trainer.GetTrainerType` | Yes — TrainerDocumentation.lua | `() -> TrainerType` (General=0, TalentsObsolete=1, Tradeskills=2, Pet=3) | `trainer.trainerType`. |
| `GetTrainerServiceNumReagents` / `GetTrainerServiceReagentInfo` | **Not used by the Forever trainer UI** | UNKNOWN | Called only if present; otherwise `reagentsErr = "not a function"`. |
| `hooksecurefunc` | Global | `(name, fn)` | Post-hooks above; does not taint the UI. |
| `GetNumGroupMembers` | **UNKNOWN** in generated docs; already used by the `group` event, which logs sizes on Forever | `() -> number` | `mob_kill.groupSize`. |
| `IsInGroup` | **UNKNOWN** in generated docs | `() -> bool` | `mob_kill.grouped`; if missing, `grouped = groupSize > 1`. |
| `UnitIsTapDenied` | Yes — UnitDocumentation.lua | `(unit) -> bool` | `mob_kill.tapDenied` on nameplate deaths. |
| `C_QuestLog.IsQuestFlaggedCompleted` | Yes — QuestLogDocumentation.lua | `(questID) -> bool` | Second guard against a false `quest_abandon`. |
| `UnitGUID("npc")`, `UnitName("npc")`, `UnitGUID/UnitName("softinteract")` | UnitDocumentation.lua | see above | npc/object id from GUID field 6; Player GUIDs are dropped. |

Still not used: `COMBAT_LOG_EVENT_UNFILTERED` and `C_CombatLog` data. Group credit and object use are inferred from chat, unit and dialog events.

### `C_DamageMeter` functions (generated)

All in DamageMeterDocumentation.lua, namespace `C_DamageMeter`:

| Name | Args | Returns | Secrets |
| --- | --- | --- | --- |
| `GetAvailableCombatSessions` | none | `availableSessions: DamageMeterAvailableCombatSession[]` (`sessionID`, `name`, `durationSeconds?`) | none listed |
| `GetCombatSessionFromID` | `sessionID: number`, `type: DamageMeterType` | `session: DamageMeterCombatSession` | `SecretWhenInCombat`; `SecretArguments = AllowedWhenUntainted` |
| `GetCombatSessionFromType` | `sessionType: DamageMeterSessionType`, `type: DamageMeterType` | `session: DamageMeterCombatSession` | same |
| `GetCombatSessionSourceFromID` | `sessionID`, `type`, `sourceGUID: WOWGUID?`, `sourceCreatureID: number?` | `sessionSource: DamageMeterCombatSessionSource` | same |
| `GetCombatSessionSourceFromType` | `sessionType`, `type`, `sourceGUID?`, `sourceCreatureID?` | `sessionSource` | same |
| `GetSessionDurationSeconds` | `sessionType: DamageMeterSessionType` | `durationSeconds: number?` | `SecretArguments = AllowedWhenUntainted` |
| `IsDamageMeterAvailable` | none | `isAvailable: bool`, `failureReason: string` | none listed |
| `ResetAllCombatSessions` | none | none | none listed |

`DamageMeterSessionType`: Overall=0, Current=1, Expired=2.

`DamageMeterType`: DamageDone=0, Dps=1, HealingDone=2, Hps=3, Absorbs=4, Interrupts=5, Dispels=6, DamageTaken=7, AvoidableDamageTaken=8, Deaths=9, EnemyDamageTaken=10.

`DamageMeterCombatSource` secret flags: `sourceGUID` / `name` `ConditionalSecret`; `classFilename`, `isLocalPlayer`, `deathRecapID`, `classification` `NeverSecret`; `specIconID` `SecretValue`.

Details evidence: `Details_Camelot.toc` loads `core/parser_nocleu.lua`, `parser_nocleu1.lua`, `parser_nocleu_tp.lua`. `parser_nocleu.lua` reads Blizzard damage-meter sessions (`DamageMeter` / `C_DamageMeter`), uses `issecretvalue` on `creatureName`, and does **not** parse CLEU. `C_DamageMeter.ResetAllCombatSessions`, `GetCombatSessionFromType` / `FromID`, `GetSessionDurationSeconds` are called from Details. **AdventureLog should not use CLEU; if it needs combat summaries, this is the Forever path, after combat.**

### `C_DeathRecap` functions (generated)

| Name | Args | Returns |
| --- | --- | --- |
| `GetRecapEvents` | `recapID: number?` | `events: DeathRecapEventInfo[]` — **struct Fields = {} (UNKNOWN)** |
| `GetRecapLink` | `recapID: number?` | `link: string` |
| `GetRecapMaxHealth` | `recapID: number?` | `maxHealth: number` |
| `HasRecapEvents` | `recapID: number?` | `hasEvents: bool` |

No DeathRecap events in that file.

### QuestInfo fields (GetInfo)

`title`, `questLogIndex`, `questID`, `campaignID?`, `level`, `difficultyLevel`, `suggestedGroup`, `frequency?`, `isHeader`, `useMinimalHeader`, `sortAsNormalQuest`, `isCollapsed`, `startEvent`, `isTask`, `isBounty`, `isStory`, `isScaling`, `isOnMap`, `hasLocalPOI`, `isHidden`, `isAutoComplete`, `overridesSortOrder`, `readyForTranslation` (default true), `isInternalOnly`, `isAbandonOnDisable`, `headerSortKey?`, `questClassification`.

Forever log cap constant in the same quest docs pack: `QuestLogConstsMainlineCamelot.MAXIMUM_NUM_QUESTS_LOG_CAN_ACCEPT = 40`.

## Secret values rules

Generated docs + `SecretPredicatesDocumentation.lua` + `SecretPredicateAPIDocumentation.lua` (`C_Secrets`):

1. **`issecretvalue(v)`** is the runtime test. Secret values must not be concatenated, compared, used as table keys, or persisted. QuestieTrace: `issecretvalue` is **not** a privacy policy by itself — still drop player GUIDs/names even when readable.
2. **`C_Secrets.HasSecretRestrictions()`** — if false, APIs tagged as potentially secret will not return secrets on this build. Still write the checks.
3. **Identity** (`UnitName`, `UnitGUID`, …): secret when the unit is not player-controlled and not in party/raid (`SecretWhenUnitIdentityRestricted` / `SecretWhenUnitNameIdentityRestricted`). Compound tokens (`boss1target`) are secret if any link fails. `C_Secrets.ShouldUnitIdentityBeSecret(unit)`.
4. **Health:** `UnitHealth` is `SecretReturns = true`. `UnitHealthMax` uses `SecretWhenUnitHealthMaxRestricted` (not player-controlled).
5. **Threat / casts:** `UnitThreatSituation` and `UNIT_SPELLCAST_SUCCEEDED` can be secret. Casts: secret if the unit is not the player or their pet, unless the spell is flagged never-secret.
6. **`C_DamageMeter` session payloads:** `SecretWhenInCombat` on GetCombatSession*. Source `name` / `sourceGUID` are `ConditionalSecret`. Details only compares amounts after they are not secret (or never compares them).
7. **`SecretArguments = AllowedWhenUntainted`:** pass only untainted arguments (normal addon code is fine; do not feed secret values in).
8. **Chat:** `CHAT_MSG_*` `text` / `playerName` / `guid` are not `NeverSecret`. Sanitize like QuestieTrace (`SanitizeChatMsgArgs`).
9. Helpers: `scrubsecretvalues`, `canaccessvalue`, `hasanysecretvalues` (FrameScriptDocumentation.lua).

## Combat log (do not use)

- `C_CombatLog.IsCombatLogRestricted() -> restricted: bool` — probe this. On Forever it is the reason Details ships `parser_nocleu*`.
- `COMBAT_LOG_EVENT` and `COMBAT_LOG_EVENT_UNFILTERED` are documented with **`HasRestrictions = true`**, **`CallbackEvent = true`**, and **no payload**.
- `C_CombatLogInternal.GetCurrentEventInfo` and `C_CombatLogSecure.GetCurrentEventInfo` list **empty Returns**.
- There is **no** generated `CombatLogGetCurrentEventInfo` in the files read for this sheet.
- **Do not** register CLEU as a kill/cast/damage feed. **Do not** recommend it. Optional: `C_EventUtils.IsEventValid("COMBAT_LOG_EVENT_UNFILTERED")` + `IsCombatLogRestricted` for a one-line diagnostic, then ignore the event.
- Kill/XP: `CHAT_MSG_COMBAT_XP_GAIN`, `PLAYER_XP_UPDATE`, quest events, loot source GUIDs.
- Combat meters: `C_DamageMeter` after combat, never CLEU.

## GUID rules

WoW Forever uses Retail-style hyphenated GUIDs.

**Creature (NPC):** `Creature-0-server-instance-zone-npcId-spawn`

| Field index (1-based split on `-`) | Example piece | Persist? |
| --- | --- | --- |
| 1 | `Creature` | kind only |
| 2 | `0` | no |
| 3 | server | no |
| 4 | instance | no |
| 5 | zone | no |
| 6 | **npcId** | **yes — this is the only Creature field to keep across sessions** |
| 7 | spawn | no (unique per spawn) |

QuestieTrace classification (`Modules/Privacy.lua`): prefix `Player-` → player (never store); `Creature-` / `Pet-` / `Vehicle-` → npc; `GameObject-` → object; `Item-` → item; anything else or secret → nil (discard).

Loot: `GetLootSourceInfo` may return several GUID/quantity pairs. Drop the whole tuple if any GUID is player or unrecognized.

Do not persist full Creature GUIDs, player GUIDs, or names derived from secret identity APIs.

## Unknowns

Generated docs missing or empty (do not invent):

| Item | Notes |
| --- | --- |
| `time()` | Not in generated docs. Used by GuideWebExport. |
| `WOW_PROJECT_ID`, `WOW_PROJECT_CAMELOT` | Not in generated docs. Local + plan: 18. |
| `GetUnitName` | Not in generated docs. Local: `GetUnitName("player", true)`. |
| `GetInventoryItemDurability` | Not in generated docs. Local: `(slot)` only → current, max. |
| `GetTaxiMapID` | Not in generated docs. Local: no-arg, taxi-map uiMapID. |
| `GetLootSlotLink`, `GetLootSlotInfo`, `GetNumLootItems`, `GetLootSourceInfo` | Not in Loot / LootFrame generated function lists. QuestieTrace comments only. |
| `COMBAT_LOG_EVENT_UNFILTERED` payload | No payload in docs. |
| `C_CombatLogInternal/Secure.GetCurrentEventInfo` | Empty return lists. |
| `DeathRecapEventInfo` fields | Empty `Fields = {}`. |
| `PlayerDocumentation.lua` | Empty table. Use `C_PlayerInfo` / `PlayerScriptDocumentation.lua` instead. |
| `version.txt` under `Blizzard_APIDocumentationGenerated/` | 404. Stamp is repo-root `version.txt` = **1.60.1.71037**. |

`C_PlayerInfo` is populated (GetContentDifficultyQuestForPlayer and many retail helpers). `C_SpellBook` is present. `C_DamageMeter` is present. `C_DeathRecap` is present with empty event-info struct.
