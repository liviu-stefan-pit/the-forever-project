# AdventureLog Windows exporter. Windows PowerShell 5.1. Does not run Lua.
#Requires -Version 5.0
[CmdletBinding()]
param(
    [string]$WowRoot,
    [switch]$SkipPurge,
    [switch]$ForceWowRunning,
    # Mock test only. Bat files must not pass this. Skips the WoW process check so purge can run while the game is open.
    [switch]$AllowPurgeForTest
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
$PlannedEventTypes = @(
    'session_start', 'session_end', 'breadcrumb', 'zone', 'taxi_start', 'taxi_end',
    'taxi_nodes', 'bind', 'hearth', 'group',
    'quest_accept', 'quest_progress', 'quest_ready', 'quest_turnin', 'quest_abandon',
    'xp', 'xp_chat', 'level_up', 'fight_start', 'fight_end', 'mob_seen', 'mob_kill',
    'death', 'death_recap', 'release', 'revive',
    'loot', 'loot_chat', 'money_chat', 'vendor', 'skill', 'spells_changed', 'trainer',
    'gather', 'idle_start', 'idle_end', 'afk_start', 'afk_end', 'probe'
)

function Write-Utf8File {
    param([string]$Path, [string]$Content)
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Read-LuaString {
    param([string]$Text, [int]$QuoteIndex)
    if ($QuoteIndex -ge $Text.Length -or $Text[$QuoteIndex] -ne '"') {
        throw "Expected a Lua string at index $QuoteIndex."
    }
    $sb = New-Object System.Text.StringBuilder
    $i = $QuoteIndex + 1
    while ($i -lt $Text.Length) {
        $c = $Text[$i]
        if ($c -eq '\') {
            if (($i + 1) -ge $Text.Length) {
                throw 'Unterminated Lua string escape.'
            }
            $n = $Text[$i + 1]
            if ($n -eq '\') { [void]$sb.Append('\') }
            elseif ($n -eq '"') { [void]$sb.Append('"') }
            elseif ($n -eq 'n') { [void]$sb.Append([char]10) }
            elseif ($n -eq 'r') { [void]$sb.Append([char]13) }
            elseif ($n -eq 't') { [void]$sb.Append([char]9) }
            else {
                [void]$sb.Append('\')
                [void]$sb.Append($n)
            }
            $i += 2
            continue
        }
        if ($c -eq '"') {
            return @{ Unescaped = $sb.ToString(); NextIndex = ($i + 1) }
        }
        [void]$sb.Append($c)
        $i++
    }
    throw 'Unterminated Lua string.'
}

function ConvertFrom-LuaEscapes {
    param([string]$Raw)
    $wrapped = '"' + $Raw + '"'
    $parsed = Read-LuaString -Text $wrapped -QuoteIndex 0
    return $parsed.Unescaped
}

function Get-BraceEnd {
    param([string]$Text, [int]$OpenIndex)
    if ($OpenIndex -ge $Text.Length -or $Text[$OpenIndex] -ne '{') { return -1 }
    $depth = 0
    $i = $OpenIndex
    while ($i -lt $Text.Length) {
        $c = $Text[$i]
        if ($c -eq '"') {
            $skip = Read-LuaString -Text $Text -QuoteIndex $i
            $i = $skip.NextIndex
            continue
        }
        if ($c -eq '{') { $depth++ }
        elseif ($c -eq '}') {
            $depth--
            if ($depth -eq 0) { return $i }
        }
        $i++
    }
    return -1
}

function Find-AssignmentIndex {
    param([string]$Text, [string]$Key)
    $i = 0
    while ($i -lt $Text.Length) {
        if ($Text[$i] -ne '"') { $i++; continue }
        $s = Read-LuaString -Text $Text -QuoteIndex $i
        $i = $s.NextIndex
        if ($s.Unescaped -ne $Key) { continue }
        if ($i -ge $Text.Length -or $Text[$i] -ne ']') { continue }
        $i++
        while ($i -lt $Text.Length -and [char]::IsWhiteSpace($Text[$i])) { $i++ }
        if ($i -ge $Text.Length -or $Text[$i] -ne '=') { continue }
        $i++
        while ($i -lt $Text.Length -and [char]::IsWhiteSpace($Text[$i])) { $i++ }
        return $i
    }
    return -1
}

function Get-CharFields {
    param([string]$Text)
    $fields = @{ name = $null; realm = $null; class = $null; race = $null; faction = $null }
    $idx = Find-AssignmentIndex -Text $Text -Key 'char'
    if ($idx -lt 0 -or $Text[$idx] -ne '{') { return $fields }
    $end = Get-BraceEnd -Text $Text -OpenIndex $idx
    if ($end -lt 0) { throw 'Unbalanced char table.' }
    $block = $Text.Substring($idx, $end - $idx + 1)
    foreach ($name in @('name', 'realm', 'class', 'race', 'faction')) {
        $pattern = '\["' + [regex]::Escape($name) + '"\]\s*=\s*"((?:\\.|[^"\\])*)"'
        $match = [regex]::Match($block, $pattern)
        if ($match.Success) {
            $fields[$name] = ConvertFrom-LuaEscapes -Raw $match.Groups[1].Value
        }
    }
    return $fields
}

function Get-DoubleQuotedStrings {
    param([string]$Text, [int]$OpenIndex)
    $end = Get-BraceEnd -Text $Text -OpenIndex $OpenIndex
    if ($end -lt 0) { throw 'Unbalanced events table.' }
    $list = New-Object System.Collections.Generic.List[string]
    $i = $OpenIndex + 1
    $depth = 1
    while ($i -lt $end) {
        $c = $Text[$i]
        if ($c -eq '"') {
            $s = Read-LuaString -Text $Text -QuoteIndex $i
            if ($depth -eq 1) { $list.Add($s.Unescaped) }
            $i = $s.NextIndex
            continue
        }
        if ($c -eq '{') { $depth++ }
        elseif ($c -eq '}') { $depth-- }
        $i++
    }
    return $list.ToArray()
}

function Parse-SessionTable {
    param([string]$Text)
    $result = @{ id = $null; header = $null; summary = $null; events = @(); eventCount = 0 }
    $end = Get-BraceEnd -Text $Text -OpenIndex 0
    if ($end -lt 0) { throw 'Unbalanced session table.' }
    $i = 1
    $depth = 1
    while ($i -lt $end) {
        $c = $Text[$i]
        if ($c -eq '"') {
            $keyRead = Read-LuaString -Text $Text -QuoteIndex $i
            $i = $keyRead.NextIndex
            if ($depth -eq 1 -and $i -lt $Text.Length -and $Text[$i] -eq ']') {
                $j = $i + 1
                while ($j -lt $Text.Length -and [char]::IsWhiteSpace($Text[$j])) { $j++ }
                if ($j -lt $Text.Length -and $Text[$j] -eq '=') {
                    $j++
                    while ($j -lt $Text.Length -and [char]::IsWhiteSpace($Text[$j])) { $j++ }
                    $key = $keyRead.Unescaped
                    if ($j -lt $Text.Length -and $Text[$j] -eq '"') {
                        $val = Read-LuaString -Text $Text -QuoteIndex $j
                        if ($key -eq 'id') { $result.id = $val.Unescaped }
                        elseif ($key -eq 'header') { $result.header = $val.Unescaped }
                        elseif ($key -eq 'summary') { $result.summary = $val.Unescaped }
                        $i = $val.NextIndex
                        continue
                    }
                    if ($j -lt $Text.Length -and $Text[$j] -eq '{' -and $key -eq 'events') {
                        $eventStrings = @(Get-DoubleQuotedStrings -Text $Text -OpenIndex $j)
                        $result.eventCount = $eventStrings.Count
                        $result.events = $eventStrings
                        $close = Get-BraceEnd -Text $Text -OpenIndex $j
                        $i = $close + 1
                        continue
                    }
                }
            }
            continue
        }
        if ($c -eq '{') { $depth++; $i++; continue }
        if ($c -eq '}') { $depth--; $i++; continue }
        $i++
    }
    return $result
}

function Get-SessionRecords {
    param([string]$Text)
    $idx = Find-AssignmentIndex -Text $Text -Key 'sessions'
    if ($idx -lt 0) { return @() }
    if ($Text[$idx] -ne '{') { throw 'sessions is not a table.' }
    $end = Get-BraceEnd -Text $Text -OpenIndex $idx
    if ($end -lt 0) { throw 'Unbalanced sessions table.' }
    $records = New-Object System.Collections.Generic.List[object]
    $i = $idx + 1
    $depth = 1
    while ($i -lt $end) {
        $c = $Text[$i]
        if ($c -eq '"') {
            $skip = Read-LuaString -Text $Text -QuoteIndex $i
            $i = $skip.NextIndex
            continue
        }
        if ($c -eq '{') {
            if ($depth -eq 1) {
                $sessionEnd = Get-BraceEnd -Text $Text -OpenIndex $i
                if ($sessionEnd -lt 0) { throw 'Unbalanced session table.' }
                $body = $Text.Substring($i, $sessionEnd - $i + 1)
                $records.Add((Parse-SessionTable -Text $body))
                $i = $sessionEnd + 1
                continue
            }
            $depth++
            $i++
            continue
        }
        if ($c -eq '}') { $depth--; $i++; continue }
        $i++
    }
    return $records.ToArray()
}

function ConvertTo-LuaString {
    param([string]$Value)
    if ($null -eq $Value) { $Value = '' }
    $Value = $Value.Replace('\', '\\').Replace('"', '\"').Replace("`r", '\r').Replace("`n", '\n').Replace("`t", '\t')
    return '"' + $Value + '"'
}

function Get-UnixIso {
    param($Ts)
    $seconds = 0.0
    $parsed = [double]::TryParse(
        [string]$Ts,
        [System.Globalization.NumberStyles]::Float,
        [System.Globalization.CultureInfo]::InvariantCulture,
        [ref]$seconds)
    if (-not $parsed) { return $null }
    $epoch = New-Object System.DateTime 1970, 1, 1, 0, 0, 0, ([System.DateTimeKind]::Utc)
    $when = $epoch.AddSeconds($seconds)
    $whole = [math]::Abs($seconds - [math]::Round($seconds)) -lt 0.0005
    if ($whole) { return $when.ToString('yyyy-MM-ddTHH:mm:ss') + 'Z' }
    return $when.ToString('yyyy-MM-ddTHH:mm:ss.fff') + 'Z'
}

function Add-IsoProperty {
    param($Obj)
    if ($Obj -isnot [pscustomobject]) { return }
    $prop = $Obj.PSObject.Properties['ts']
    if ($null -eq $prop -or $null -eq $prop.Value) { return }
    $iso = Get-UnixIso -Ts $prop.Value
    if ($null -eq $iso) { return }
    if ($Obj.PSObject.Properties.Name -contains 'iso') { $Obj.iso = $iso }
    else { $Obj | Add-Member -NotePropertyName 'iso' -NotePropertyValue $iso }
}

function Get-PropertyValue {
    param($Obj, [string]$Name)
    if ($null -eq $Obj) { return $null }
    if ($Obj -is [System.Collections.IDictionary]) {
        if ($Obj.Contains($Name)) { return $Obj[$Name] }
        return $null
    }
    $prop = $Obj.PSObject.Properties[$Name]
    if ($null -eq $prop) { return $null }
    return $prop.Value
}

function Get-StartedValue {
    param($Header)
    if ($null -eq $Header) { return $null }
    foreach ($name in @('started', 'start', 'at')) {
        $value = Get-PropertyValue -Obj $Header -Name $name
        if ($null -ne $value) { return [string]$value }
    }
    $ts = Get-PropertyValue -Obj $Header -Name 'ts'
    if ($null -ne $ts) {
        $iso = Get-UnixIso -Ts $ts
        if ($null -ne $iso) { return $iso }
        return [string]$ts
    }
    return $null
}

function Get-LineCount {
    param([string]$Path)
    $count = 0
    $reader = $null
    try {
        $reader = New-Object System.IO.StreamReader($Path, $Utf8NoBom, $true)
        while ($null -ne $reader.ReadLine()) { $count++ }
    }
    finally {
        if ($null -ne $reader) { $reader.Dispose() }
    }
    return $count
}

function Get-SafeFileName {
    param([string]$Name)
    $invalid = [System.IO.Path]::GetInvalidFileNameChars()
    $chars = New-Object System.Text.StringBuilder
    foreach ($ch in $Name.ToCharArray()) {
        $bad = $false
        foreach ($inv in $invalid) {
            if ($ch -eq $inv) { $bad = $true; break }
        }
        if ($bad) { [void]$chars.Append('_') } else { [void]$chars.Append($ch) }
    }
    $clean = $chars.ToString().Trim().TrimEnd('.')
    if ([string]::IsNullOrWhiteSpace($clean)) { return 'character' }
    return $clean
}

function Test-WowProcessRunning {
    if ($ForceWowRunning) { return $true }
    # Exact name Wow. WowVoiceProxy.exe must not count as the game.
    $procs = @(Get-Process -Name 'Wow' -ErrorAction SilentlyContinue)
    return ($procs.Count -gt 0)
}

function Find-WowRootFrom {
    param([string]$Start)
    $dir = $Start
    if (-not (Test-Path -LiteralPath $dir)) { return $null }
    $dir = (Resolve-Path -LiteralPath $dir).Path
    while ($true) {
        $exe = Join-Path $dir 'Wow.exe'
        if (Test-Path -LiteralPath $exe) { return $dir }
        $parent = Split-Path -Parent $dir
        if ([string]::IsNullOrEmpty($parent) -or $parent -eq $dir) { return $null }
        $dir = $parent
    }
}

function Get-SavedVariableFiles {
    param([string]$Root)
    $account = Join-Path $Root 'WTF\Account'
    if (-not (Test-Path -LiteralPath $account)) { return @() }
    return @(Get-ChildItem -LiteralPath $account -Filter 'AdventureLog.lua' -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Directory.Name -eq 'SavedVariables' })
}

function Write-Readme {
    param([string]$Path, [string[]]$Seen)
    $seenText = '(none in this export)'
    if ($Seen -and $Seen.Count -gt 0) {
        $seenText = (($Seen | Sort-Object -Unique) -join ', ')
    }
    $planned = $PlannedEventTypes -join ', '
    $text = @"
# AdventureLog character export

This folder is a JSON export of one character's AdventureLog SavedVariables. An LLM can read it without the WoW client.

## Files

- ``character.json`` - name, realm, class, race, faction, and ``sessions`` (id, file, eventCount, started). Older sessions already listed here are kept.
- ``sessions/<sessionId>.jsonl`` - one event JSON object per line. An existing file is left in place. If the SavedVariables session has more events than the file, only the new lines are appended. A file with more lines than the SavedVariables session is not truncated.
- ``sessions/<sessionId>.summary.json`` - the session summary object. If the source had no summary, the file is ``{"summaryErr":"missing"}``.
- ``raw/`` - copies of ``AdventureLog.lua`` taken before any purge.

## Event fields

- ``ts`` - unix time in seconds.
- ``iso`` - UTC ISO-8601 time added by this exporter from ``ts`` when ``ts`` is numeric. The game did not write ``iso``.
- ``t`` - seconds since the session started.
- ``pt`` - ``/played`` seconds.
- ``afk`` - idle seconds.
- ``e`` - event type name.
- ``map`` - uiMap id.
- ``x`` / ``y`` - position in the zone, percent from 0 to 100.
- ``questId`` - the same quest id a guide uses.
- ``npcId`` - creature id taken from GUID field 6.
- A field whose name ends in ``Err`` means that API call failed.
- A field whose name ends in ``Secret`` means the client hid the value.
- ``raw`` - the game event name and its arguments exactly as the client sent them, for re-parsing.
- ``notReady`` - recorded while the client was still loading; position and XP may be incomplete.
- ``baseline`` - on ``quest_ready``: the quest was already complete when the session started, so it is not progress made in this session.
- ``death`` then ``release`` (spirit released, now a ghost) then ``revive`` with ``how`` = ``corpse`` (corpse run), ``spiritHealer``, or ``resurrected`` (by another player), and ``timeLost`` seconds since the death.
- ``mob_kill.killSec`` - seconds from first seeing the mob in the fight to its death.
- Summary ``totals``: ``playedTotal`` is lifetime ``/played`` at session end; ``sessionPlayed`` and ``sessionActive`` (minus AFK) cover this session; ``xp`` is the sum of XP gains.

## Event types in this export

$seenText

## Planned event types

$planned
"@
    Write-Utf8File -Path $Path -Content ($text.Trim() + "`r`n")
}

function Copy-RawBackup {
    param([string]$Source, [string]$RawDir)
    if (-not (Test-Path -LiteralPath $RawDir)) {
        New-Item -ItemType Directory -Path $RawDir | Out-Null
    }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $name = "$stamp-AdventureLog.lua"
    $dest = Join-Path $RawDir $name
    $n = 0
    while (Test-Path -LiteralPath $dest) {
        $n++
        $name = "$stamp-$n-AdventureLog.lua"
        $dest = Join-Path $RawDir $name
    }
    Copy-Item -LiteralPath $Source -Destination $dest
    return $dest
}

function Test-ZipContainsJsonl {
    param([string]$ZipPath, [System.IO.FileInfo[]]$JsonlFiles)
    $zip = $null
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
        $entries = @($zip.Entries | ForEach-Object { $_.FullName.Replace('\', '/').TrimStart('/') })
    }
    catch {
        return @{ Ok = $false; Message = ('zip reopen check failed: ' + $_.Exception.Message) }
    }
    finally {
        if ($null -ne $zip) { $zip.Dispose() }
    }
    $missing = New-Object System.Collections.Generic.List[string]
    foreach ($file in @($JsonlFiles)) {
        $rel = 'sessions/' + $file.Name
        $found = $false
        foreach ($entry in $entries) {
            if ([string]::Equals($entry, $rel, [StringComparison]::OrdinalIgnoreCase)) {
                $found = $true
                break
            }
        }
        if (-not $found) { $missing.Add($rel) }
    }
    if ($missing.Count -gt 0) {
        return @{ Ok = $false; Message = ('zip reopen check failed, missing: ' + ($missing -join ', ')) }
    }
    return @{ Ok = $true; Message = '' }
}

function Update-AdventureZip {
    param([string]$AdventureDir, [string]$ZipPath)
    if (Test-Path -LiteralPath $ZipPath) {
        Remove-Item -LiteralPath $ZipPath -Force
    }
    $items = @(Get-ChildItem -LiteralPath $AdventureDir -Force)
    if ($items.Count -eq 0) { throw 'Adventure folder is empty, zip was not created.' }
    Compress-Archive -Path ($items | ForEach-Object { $_.FullName }) -DestinationPath $ZipPath
    $jsonl = @()
    $sessionsDir = Join-Path $AdventureDir 'sessions'
    if (Test-Path -LiteralPath $sessionsDir) {
        $jsonl = @(Get-ChildItem -LiteralPath $sessionsDir -Filter '*.jsonl' -File)
    }
    return Test-ZipContainsJsonl -ZipPath $ZipPath -JsonlFiles $jsonl
}

function Write-PurgedSavedVariables {
    param([string]$Path, $Char, [string]$LastSessionId)
    $at = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ss') + 'Z'
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add('AdventureLogDB = {')
    $lines.Add('  ["schema"] = 1,')
    $lines.Add('  ["char"] = {')
    $pairs = @(
        @{ Key = 'name'; Value = $Char.name },
        @{ Key = 'realm'; Value = $Char.realm },
        @{ Key = 'class'; Value = $Char.class },
        @{ Key = 'race'; Value = $Char.race },
        @{ Key = 'faction'; Value = $Char.faction }
    )
    for ($p = 0; $p -lt $pairs.Count; $p++) {
        $comma = ','
        if ($p -eq ($pairs.Count - 1)) { $comma = '' }
        $lines.Add('    ["' + $pairs[$p].Key + '"] = ' + (ConvertTo-LuaString -Value ([string]$pairs[$p].Value)) + $comma)
    }
    $lines.Add('  },')
    $lines.Add('  ["lastExport"] = { ["at"] = ' + (ConvertTo-LuaString -Value $at) + ', ["sessionId"] = ' + (ConvertTo-LuaString -Value $LastSessionId) + ' },')
    $lines.Add('  ["sessions"] = {')
    $lines.Add('  },')
    $lines.Add('}')
    $lines.Add('')
    Write-Utf8File -Path $Path -Content ($lines -join "`r`n")
}

function Export-CharacterFile {
    param([System.IO.FileInfo]$SourceFile, [string]$Root)
    $sourcePath = $SourceFile.FullName
    $folderName = $SourceFile.Directory.Parent.Name
    $text = [System.IO.File]::ReadAllText($sourcePath)
    if ($text -notmatch 'AdventureLogDB') {
        Write-Host "ERROR: $sourcePath does not contain AdventureLogDB. Purge skipped."
        return 2
    }

    $char = $null
    $sessions = @()
    try {
        $char = Get-CharFields -Text $text
        $sessions = @(Get-SessionRecords -Text $text)
    }
    catch {
        Write-Host ("ERROR: failed to read " + $sourcePath + " - " + $_.Exception.Message + " Purge skipped.")
        return 2
    }

    $display = $char.name
    if ([string]::IsNullOrWhiteSpace($display)) { $display = $folderName }
    $safeName = Get-SafeFileName -Name $display
    $adventureDir = Join-Path (Join-Path $Root 'Adventures') ($safeName + ' - adventure')
    $sessionsDir = Join-Path $adventureDir 'sessions'
    $rawDir = Join-Path $adventureDir 'raw'
    foreach ($dir in @($adventureDir, $sessionsDir, $rawDir)) {
        if (-not (Test-Path -LiteralPath $dir)) {
            New-Item -ItemType Directory -Path $dir | Out-Null
        }
    }

    $rawPath = $null
    try {
        $rawPath = Copy-RawBackup -Source $sourcePath -RawDir $rawDir
    }
    catch {
        Write-Host ("ERROR: raw backup failed for " + $sourcePath + " - " + $_.Exception.Message + " Purge skipped.")
        return 2
    }

    $parsedSessions = New-Object System.Collections.Generic.List[object]
    $seenEvents = New-Object System.Collections.Generic.List[string]
    $parseFailed = $false
    foreach ($session in $sessions) {
        $sessionId = [string]$session.id
        if ([string]::IsNullOrWhiteSpace($sessionId)) {
            Write-Host "ERROR: a session in $sourcePath has no id. Purge skipped."
            $parseFailed = $true
            break
        }
        if ($sessionId -notmatch '^[A-Za-z0-9._-]+$') {
            Write-Host "ERROR: session id '$sessionId' in $sourcePath is not a safe file name. Purge skipped."
            $parseFailed = $true
            break
        }

        $headerObj = $null
        $summaryObj = $null
        $summaryMissing = $false
        $eventLines = New-Object System.Collections.Generic.List[string]
        try {
            if (-not [string]::IsNullOrEmpty($session.header)) {
                $headerObj = $session.header | ConvertFrom-Json
            }
            if ([string]::IsNullOrEmpty($session.summary)) {
                $summaryMissing = $true
            }
            else {
                $summaryObj = $session.summary | ConvertFrom-Json
            }
            $eventStrings = @()
            if ($null -ne $session.events) { $eventStrings = @($session.events) }
            foreach ($eventText in $eventStrings) {
                $eventObj = $eventText | ConvertFrom-Json
                if ($null -eq $eventObj) { throw 'event JSON parsed as null' }
                Add-IsoProperty -Obj $eventObj
                $eventName = Get-PropertyValue -Obj $eventObj -Name 'e'
                if ($null -ne $eventName -and -not [string]::IsNullOrWhiteSpace([string]$eventName)) {
                    $seenEvents.Add([string]$eventName)
                }
                $eventLines.Add((ConvertTo-Json -InputObject $eventObj -Depth 30 -Compress))
            }
        }
        catch {
            Write-Host ("ERROR: session " + $sessionId + " in " + $sourcePath + " did not parse - " + $_.Exception.Message + " Purge skipped.")
            $parseFailed = $true
            break
        }

        $jsonlPath = Join-Path $sessionsDir ($sessionId + '.jsonl')
        if (-not (Test-Path -LiteralPath $jsonlPath)) {
            $payload = ''
            if ($eventLines.Count -gt 0) { $payload = ($eventLines -join "`n") + "`n" }
            Write-Utf8File -Path $jsonlPath -Content $payload
        }
        else {
            $existingLines = Get-LineCount -Path $jsonlPath
            if ($existingLines -lt $eventLines.Count) {
                $extra = New-Object System.Collections.Generic.List[string]
                for ($lineIndex = $existingLines; $lineIndex -lt $eventLines.Count; $lineIndex++) {
                    $extra.Add($eventLines[$lineIndex])
                }
                if ($extra.Count -gt 0) {
                    $tail = ($extra -join "`n") + "`n"
                    [System.IO.File]::AppendAllText($jsonlPath, $tail, $Utf8NoBom)
                }
            }
        }
        $summaryPath = Join-Path $sessionsDir ($sessionId + '.summary.json')
        if ($summaryMissing) {
            Write-Utf8File -Path $summaryPath -Content "{`"summaryErr`":`"missing`"}`r`n"
        }
        elseif ($null -eq $summaryObj) {
            Write-Utf8File -Path $summaryPath -Content "null`r`n"
        }
        else {
            $summaryJson = ConvertTo-Json -InputObject $summaryObj -Depth 30
            Write-Utf8File -Path $summaryPath -Content ($summaryJson + "`r`n")
        }
        $parsedSessions.Add(@{
            id = $sessionId
            file = ('sessions/' + $sessionId + '.jsonl')
            eventCount = [int]$session.eventCount
            started = Get-StartedValue -Header $headerObj
            jsonl = $jsonlPath
        })
    }

    $charJsonPath = Join-Path $adventureDir 'character.json'
    $existing = @()
    if (Test-Path -LiteralPath $charJsonPath) {
        try {
            $oldDoc = Get-Content -LiteralPath $charJsonPath -Raw | ConvertFrom-Json
            if ($null -ne $oldDoc.sessions) { $existing = @($oldDoc.sessions) }
        }
        catch {
            Write-Host ("ERROR: existing character.json could not be read (" + $charJsonPath + ") - " + $_.Exception.Message + " Purge skipped.")
            return 2
        }
    }

    $newById = @{}
    foreach ($row in $parsedSessions) { $newById[$row.id] = $row }
    $merged = New-Object System.Collections.Generic.List[object]
    $seenIds = @{}
    foreach ($old in $existing) {
        if ($null -eq $old) { continue }
        $oldId = [string](Get-PropertyValue -Obj $old -Name 'id')
        if ($newById.ContainsKey($oldId)) {
            $row = $newById[$oldId]
            $merged.Add([ordered]@{ id = $row.id; file = $row.file; eventCount = $row.eventCount; started = $row.started })
        }
        else {
            $merged.Add([ordered]@{
                id = $oldId
                file = Get-PropertyValue -Obj $old -Name 'file'
                eventCount = Get-PropertyValue -Obj $old -Name 'eventCount'
                started = Get-PropertyValue -Obj $old -Name 'started'
            })
        }
        $seenIds[$oldId] = $true
    }
    foreach ($row in $parsedSessions) {
        if ($seenIds.ContainsKey($row.id)) { continue }
        $merged.Add([ordered]@{ id = $row.id; file = $row.file; eventCount = $row.eventCount; started = $row.started })
    }

    $doc = [pscustomobject]@{
        name = $display
        realm = $char.realm
        class = $char.class
        race = $char.race
        faction = $char.faction
        sessions = $merged.ToArray()
    }
    Write-Utf8File -Path $charJsonPath -Content ((ConvertTo-Json -InputObject $doc -Depth 8) + "`r`n")
    Write-Readme -Path (Join-Path $adventureDir 'README.md') -Seen @($seenEvents.ToArray())

    Write-Host ("Exported " + $display + " (" + $parsedSessions.Count + " session(s) read) -> " + $adventureDir)

    if ($parseFailed) { return 2 }

    $failures = New-Object System.Collections.Generic.List[string]
    $srcLen = (Get-Item -LiteralPath $sourcePath).Length
    $rawLen = (Get-Item -LiteralPath $rawPath).Length
    if (-not (Test-Path -LiteralPath $rawPath) -or $srcLen -ne $rawLen) {
        $failures.Add('raw backup missing or length mismatch')
    }
    foreach ($row in $parsedSessions) {
        if (-not (Test-Path -LiteralPath $row.jsonl)) {
            $failures.Add('missing jsonl for session ' + $row.id)
            continue
        }
        $lines = Get-LineCount -Path $row.jsonl
        if ($lines -lt [int]$row.eventCount) {
            $failures.Add(('session {0} jsonl line count {1} != event count {2}' -f $row.id, $lines, $row.eventCount))
        }
    }

    $zipPath = Join-Path (Join-Path $Root 'Adventures') ($safeName + ' - adventure.zip')
    $zipCheck = @{ Ok = $false; Message = 'zip reopen check failed' }
    try {
        $zipCheck = Update-AdventureZip -AdventureDir $adventureDir -ZipPath $zipPath
    }
    catch {
        $zipCheck = @{ Ok = $false; Message = ('zip reopen check failed: ' + $_.Exception.Message) }
    }
    if (-not $zipCheck.Ok) { $failures.Add([string]$zipCheck.Message) }

    if ($failures.Count -gt 0) {
        Write-Host ("PURGE SKIPPED for " + $display + ":")
        foreach ($failure in $failures) { Write-Host ("  " + $failure) }
        return 2
    }

    # -AllowPurgeForTest is for the mock test only. Normal runs still refuse to purge while Wow is running.
    if (-not $AllowPurgeForTest -and (Test-WowProcessRunning)) {
        Write-Host "exported but not purged because WoW is running"
        return 0
    }
    if ($SkipPurge) {
        Write-Host "exported but not purged because -SkipPurge was set"
        return 0
    }

    $lastId = ''
    if ($parsedSessions.Count -gt 0) { $lastId = [string]$parsedSessions[$parsedSessions.Count - 1].id }
    try {
        Write-PurgedSavedVariables -Path $sourcePath -Char $char -LastSessionId $lastId
    }
    catch {
        Write-Host ("ERROR: purge rewrite failed for " + $sourcePath + " - " + $_.Exception.Message)
        return 2
    }
    Write-Host ("Purged " + $sourcePath)
    return 0
}

if ([string]::IsNullOrWhiteSpace($WowRoot)) {
    $WowRoot = Find-WowRootFrom -Start $PSScriptRoot
    if ([string]::IsNullOrWhiteSpace($WowRoot)) {
        Write-Host "ERROR: Wow.exe was not found. Start from Interface\AddOns\AdventureLog or pass -WowRoot pointing at the _forever_ folder (the directory that contains Wow.exe)."
        exit 1
    }
}
else {
    if (-not (Test-Path -LiteralPath $WowRoot)) {
        Write-Host "ERROR: -WowRoot does not exist: $WowRoot"
        exit 1
    }
    $WowRoot = (Resolve-Path -LiteralPath $WowRoot).Path
}

Write-Host "WowRoot: $WowRoot"
$files = @(Get-SavedVariableFiles -Root $WowRoot)
if ($files.Count -eq 0) {
    Write-Host "No AdventureLog.lua SavedVariables found under $(Join-Path $WowRoot 'WTF\Account')."
    exit 0
}

$anyFailure = $false
foreach ($file in $files) {
    try {
        $code = Export-CharacterFile -SourceFile $file -Root $WowRoot
        if ($code -ne 0) { $anyFailure = $true }
    }
    catch {
        Write-Host ("ERROR: " + $file.FullName + " - " + $_.Exception.Message + " Purge skipped.")
        $anyFailure = $true
    }
}

if ($anyFailure) { exit 2 }
exit 0
