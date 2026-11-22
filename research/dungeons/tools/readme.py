import json
from paths import DUNGEONS_JSON, README_MD, QUESTS_JSON
import prereq_audit
d=json.load(open(DUNGEONS_JSON))
L=[]
tq=sum(len(x['quests']) for x in d['dungeons']); v=sum(q['verified'] for x in d['dungeons'] for q in x['quests'])
L+=["# Horde dungeon quests, levels 15-60 (WoW: Forever)","",
"Research for the guide's **dungeons on/off** toggle. The machine-readable data is in [`dungeons.json`](dungeons.json); this page is the readable summary.","",
"## How this was built","",d['dataBasis'],"",
f"- {len(d['dungeons'])} Classic dungeons, {tq} Horde-available quests ({v} verified, {tq-v} unverified).",
f"- {len(d['excludedEndgameQuests'])} level-60 endgame chain quests (Dungeon Set 2, Lord Valthalak, Naxxramas attunement) are listed in `excludedEndgameQuests` only.",
"- Quests are picked automatically: the quest's QuestieDB zone is the dungeon, or its kill/collect objectives are inside the dungeon. Prerequisite quests outside the dungeon are added with `category: prerequisite`. Alliance-only, repeatable and Questie-blacklisted quests are dropped.",
"- `verified: false` means QuestieDB lacks a giver, a turn-in or coordinates for it (often item-started quests or NPCs without a spawn); check `verificationNotes`.",
"- `route.balanced` / `route.speedrun` and the one-line `route.why` are our judgement from the XP value, whether all objectives are inside the dungeon, and how long the prerequisite chain is. Role tips are our own writing.",
"- Coordinates are zone map percentages, the same as in-game `/way`.",
"- Classic steps are emitted in prerequisite order from QuestieDB `pre.single` (any one) / `pre.group` (all required): world lead-ins are accepted and turned in first, then remaining accepts, then the run, then turn-ins, then follow-ups. Forever dungeon quests get a turn-in step when QuestieDB provides a finisher NPC or object (`verified: false`); item-started drops from inside the dungeon are accepted after the run. Accepts are still ordered after their in-pack prerequisites. In-pack prerequisites are included on every route (balanced and speedrun) that a later pack quest needs them on.",
"",
"## WoW: Forever findings","",]
for n in d['wowForever']['notes']: L.append(f"- {n['finding']} ({'official' if n['official'] else 'fan site, unofficial'}: {n['source']})")
L+=["",f"- {d['wowForever']['launch']['finding']} (official: {d['wowForever']['launch']['source']})",f"- {d['wowForever']['classicQuestCaveat']}",f"- {d['wowForever']['questieForeverData']['finding']} ({d['wowForever']['questieForeverData']['source']})","","### New Forever dungeons (all `verified: false`)",""]
nds=d['wowForever']['newDungeons']
fq=[q for nd in nds for q in nd['quests']]
n_id=sum(1 for q in fq if q.get('id'))
n_conf=sum(1 for q in fq if q.get('foreverConfidence'))
L+=[f"The nine new dungeons have stable id slugs (used as `tags.dungeonId` in steps-v2.json): "+", ".join(f"`{nd['id']}`" for nd in nds)+".",
    f"- {len(fq)} Horde quests across the nine dungeons, all with imported QuestieDB v1.1.3 ids; {n_conf} have `foreverConfidence` from that import.",
    "- Level ranges and locations are official (Blizzard). Quest ids, giver and turn-in NPC ids, and Forever-frame coordinates are taken from `content/questie-db` when the name plus level, giver and zone or dungeon agree.",
    "- Every Forever quest stays `verified: false` until it is checked in game. Quests 79953 and 81951 are never used.",
    "",]
def _gv(q):
    gv=q.get('giver') or {}
    if isinstance(gv,list): gv=gv[0] if gv else {}
    return gv or {}
def _tn(q):
    t=q.get('turnIn')
    if isinstance(t,list): t=t[0] if t else None
    if isinstance(t,dict): return t.get('name')
    return t
for nd in nds:
    e=nd.get('entrance'); es=f"{e['zone']} {e['x']}, {e['y']} (reported)" if e else "not published"
    L+=[f"#### {nd['name']} (`{nd['id']}`, levels {nd['levelRange'][0]}-{nd['levelRange'][1]}), {nd['location']}","",f"- Entrance: {es}. Horde access: {nd['hordeAccess']}",""]
    for q in nd['quests']:
        gv=_gv(q)
        loc=f"{gv.get('name')}, {gv.get('zone')}"+(f" {gv['x']}, {gv['y']}" if gv.get('x') is not None else "")
        qid=f" `{q['id']}`" if q.get('id') else " (unmatched)"
        conf=f" [{q['foreverConfidence']}]" if q.get('foreverConfidence') else ""
        L.append(f"- **{q['name']}**{qid}{conf}: {loc}."+(f" {q['objectiveSummary']}" if q['objectiveSummary'] else "")+(f" Needs: {', '.join(q['prerequisitesByName'])}." if q.get('prerequisitesByName') else ""))
    if not nd['quests']:
        L.append("- No Horde quests in the import for this dungeon.")
    for ex in nd.get('excludedQuests') or []:
        qid = ex.get('questId')
        L.append(f"- Excluded: **{ex['name']}**" + (f" `{qid}`" if qid else "") + f". {ex['reason']}")
    L.append("")
L+=["","## Dungeons",""]
for x in d['dungeons']:
    e="; ".join(f"{a['zone']} {a['x']}, {a['y']}" for a in x['entrances'])
    L+=[f"### {x['name']} (levels {x['levelRange'][0]}-{x['levelRange'][1]})","",f"- Entrance: {e}",f"- Pick up quests: {x['pickupHub']}"]
    if x.get('wings'): L.append(f"- Wings: {', '.join(x['wings'])}")
    L+=[f"- Tank: {x['roleTips']['tank']}",f"- Healer: {x['roleTips']['healer']}",f"- DPS: {x['roleTips']['dps']}",f"- Dungeons off: {x['dungeonsOffReplacement']}","",
        "| Quest | Lvl (min) | Type | Giver | Balanced | Speed | Why |","|---|---|---|---|---|---|---|"]
    for q in x['quests']:
        gv=q['giver'][0] if q['giver'] else None
        gs=(f"{gv['name']} ({gv['zone']} {gv['x']}, {gv['y']})" if gv and gv.get('x') is not None else (f"{gv['name']} ({gv['type']})" if gv else "?"))
        cls=(f" [{', '.join(q['classes'])}]" if q['classes'] else "")+(f" ({'/'.join(q['wing'])})" if q.get('wing') else "")
        L.append(f"| [{q['name']}](https://www.wowhead.com/classic/quest={q['id']}) `{q['id']}`{cls}{'' if q['verified'] else ' ⚠'} | {q['questLevel']} ({q['minLevel']}) | {q['category']} | {gs} | {'yes' if q['route']['balanced'] else 'no'} | {'yes' if q['route']['speedrun'] else 'no'} | {q['route']['why']} |")
    L.append("")
# Pack fixes applied by pack_fixes.py
fixes=d.get("packFixes") or {}
removed=fixes.get("removedQuests") or []
homes=fixes.get("singleHome") or []
moved=fixes.get("movedQuests") or []
handed=fixes.get("handedTo40_60") or []
if removed or homes or moved or handed:
    L+=["## Pack fixes","",]
    for r in removed:
        L.append(f"- Removed `{r['id']}` **{r['name']}** from `{r['wasIn']}`. {r['reason']}")
    if homes:
        L.append("- Shared chain quests now have exactly one accept and one turn-in, in the dungeon QuestieDB assigns (quest zone if it is a dungeon; otherwise the next dungeon quest in the imported chain):")
        for r in homes:
            dropped=", ".join(f"`{x}`" for x in r.get("removedFrom") or [])
            L.append(f"  - `{r['id']}` **{r['name']}** stays in `{r['home']}`" + (f", dropped from {dropped}" if dropped else "") + f". {r['reason']}")
    if moved:
        L.append("- Follow-ups were moved so they are accepted only after their in-pack prerequisite is turned in:")
        for r in moved:
            L.append(f"  - `{r['id']}` **{r['name']}** moved from `{r['from']}` to `{r['to']}` after `{r['after']}`. {r['reason']}")
    if handed:
        L.append("- These quests also appear in the 40-60 leveling route. QuestieDB objective mobs, objects, and items are in the open world (not a dungeon zone), so 40-60 owns accept and turn-in and this pack drops them:")
        for r in handed:
            ev="; ".join(
                f"{e['kind']} `{e['id']}` {e.get('name') or '?'} in {', '.join(e.get('zones') or []) or 'unknown zone'}"
                for e in r.get("evidence") or []
            ) or "no objective mobs/objects/items (world delivery)"
            L.append(f"  - `{r['id']}` **{r['name']}** dropped from `{r['wasIn']}` (owner: 40-60). {ev}.")
    L.append("")

# Out-of-pack prerequisites (from the generated steps + QuestieDB pre fields)
outside=(prereq_audit.audit() or {}).get("outside") or []
L.append(prereq_audit.format_outside_markdown(outside).rstrip())
L.append("")

# Forever quests with no finisher NPC/object in the import — no turn-in is invented.
quests_db=json.loads(QUESTS_JSON.read_text())
no_fin=[]
for nd in d.get("wowForever",{}).get("newDungeons") or []:
    for q in nd.get("quests") or []:
        qid=q.get("id")
        db=quests_db.get(str(qid) or "") or {}
        end=db.get("end") or {}
        if end.get("npc") or end.get("object"):
            continue
        no_fin.append((nd.get("id") or nd.get("name"), qid, q.get("name")))
L+=["## Forever quests with no finisher in the import","",
"These Forever dungeon quests have no end NPC or object in `content/questie-db`. The pack does not invent a turn-in for them; they stay accept-only.",""]
if no_fin:
    for dung,qid,name in no_fin:
        L.append(f"- `{qid}` **{name}** (`{dung}`)")
else:
    L.append("None.")
L+=["",]

L+=["## Known gaps","",
"- Quest data is Classic Era (QuestieDB). It has not been checked in the WoW: Forever client; Forever may have changed rewards, XP or availability.",
"- Wowhead spot-checks could not be run in bulk (Wowhead rate-limited our fetches), so `verified` means \"present in QuestieDB\".",
"- NPCs inside instances have no outdoor coordinates (`insideDungeon: true`); objective locations inside the dungeon are given as NPC names, not in-instance map points.",
"- Wing tags are only set for Scarlet Monastery, Blackrock Spire, Dire Maul, Stratholme and Maraudon quests whose objective NPCs match a known boss name.",
"- Route judgements and role tips are team opinion (`verified: false` on tips). Dungeons-off replacements name zones only; the open-world quest steps come from the zone research lanes.",
"- Forever dungeon quests are matched to QuestieDB v1.1.3 in `content/questie-db`. Hall of Thanes “Important Heirlooms” (96403, giver Thom Filch 265003) is excluded from the Horde data because it is probably Alliance-only: 96403 is not in the Horde+neutral import. Alcaz Prison and Blackmaw Hold entrances are still not published. All Forever quests stay `verified: false` until checked in game.",
"","⚠ = unverified (see `verificationNotes` in the JSON).","","## Licence","","See [LICENSE.md](LICENSE.md): the quest data derives from Questie (GPL-3.0)."]
README_MD.write_text("\n".join(L)+"\n")
