"""Forever-new quests for Horde 1-20 from Godfather's PR #5 import (QuestieDB v1.1.3 Forever build,
content/questie-db/, GPL-3.0), kept only when an independent WoW Forever web source names the same quest
(spot-check against SoD-era ids that QuestieDB reuses). Output: catalog/forever_quests_1_20.json.
Usage: python extract_forever.py <questie-db dir> <allowlist.json>
"""
import json, os, sys
D = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'content', 'questie-db')
ALLOW = json.load(open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'catalog', 'forever_web_allowlist.json')))
q = json.load(open(os.path.join(D, 'quests.json'))); n = json.load(open(os.path.join(D, 'npcs.json')))
o = json.load(open(os.path.join(D, 'objects.json'))); it = json.load(open(os.path.join(D, 'items.json')))
zn = json.load(open(os.path.join(D, 'zones.json')))
ZONES = {14, 215, 85, 130, 1637, 1638, 1497, 17}  # Barrens 12-20 included (agreed with Lyra)
SRC = 'https://github.com/liviu-stefan-pit/project-forever/tree/main/content/questie-db'
def spawns(sp, limit=6):
    out = []
    for z, pts in (sp or {}).items():
        z = int(z)
        if not pts or str(z) not in zn or not zn[str(z)].get('uiMapId'): continue
        cx = round(sorted(p[0] for p in pts)[len(pts) // 2], 1); cy = round(sorted(p[1] for p in pts)[len(pts) // 2], 1)
        out.append({'zone': zn[str(z)]['name'], 'mapId': zn[str(z)]['uiMapId'], 'areaId': z, 'center': [cx, cy], 'count': len(pts), 'points': [[round(a, 1), round(b, 1)] for a, b in pts[:limit]]})
    return sorted(out, key=lambda r: -r['count'])
def npc(i):
    r = n.get(str(i)) or {}
    return {'id': i, 'name': r.get('name'), 'level': [r.get('minLevel'), r.get('maxLevel')], 'rank': r.get('rank', 0), 'spawns': spawns(r.get('spawns')), 'source': SRC + '/npcs.json'}
def obj(i):
    r = o.get(str(i)) or {}
    return {'id': i, 'name': r.get('name'), 'spawns': spawns(r.get('spawns')), 'source': SRC + '/objects.json'}
def item(i):
    r = it.get(str(i)) or {}
    def ns(x):
        e = npc(x); s = e['spawns'][0] if e['spawns'] else None
        return {'id': x, 'name': e['name'], **({'zone': s['zone'], 'x': s['center'][0], 'y': s['center'][1], 'zoneMapId': s['mapId'], 'spawnCount': s['count']} if s else {})}
    def os_(x):
        e = obj(x); s = e['spawns'][0] if e['spawns'] else None
        return {'id': x, 'name': e['name'], **({'zone': s['zone'], 'x': s['center'][0], 'y': s['center'][1], 'zoneMapId': s['mapId'], 'spawnCount': s['count'], 'samplePoints': s['points']} if s else {})}
    return {'id': i, 'name': r.get('name'), 'droppedBy': [ns(x) for x in (r.get('npcDrops') or [])[:6]], 'fromObjects': [os_(x) for x in (r.get('objectDrops') or [])[:4]], 'source': SRC + '/items.json'}
RACES = {2: 'Orc', 16: 'Undead', 32: 'Tauren', 128: 'Troll'}
CLASSES = {1: 'Warrior', 2: 'Paladin', 4: 'Hunter', 8: 'Rogue', 16: 'Priest', 64: 'Shaman', 128: 'Mage', 256: 'Warlock', 1024: 'Druid'}
allow = {a['name'].lower(): a for a in ALLOW}
EXCLUDE = {79953, 81951}  # low-confidence Undercity books (PR #5 foreverConfidence: low): excluded everywhere
out, dropped = {}, []
for k, x in q.items():
    if not x.get('forever') or x.get('zoneId') not in ZONES or x.get('level', 99) > 23 or x.get('sort') == 'CAMPING': continue
    if x['id'] in EXCLUDE: continue
    conf = x.get('foreverConfidence'); ev = x.get('foreverEvidence') or []
    if conf == 'low':
        dropped.append((x['id'], x['name'], x.get('zone'), 'foreverConfidence low')); continue
    a = allow.get(x['name'].lower())
    if not a and not (conf == 'high' and 'wowheadForever' in ev):
        dropped.append((x['id'], x['name'], x.get('zone'), 'not in web sources, not high confidence')); continue
    a = a or {'sources': []}
    # Forever reuses Season of Discovery ids (76k-87k): those are kept only when PR #5 rates them high confidence
    if x['id'] < 90000 and conf != 'high':
        dropped.append((x['id'], x['name'], x.get('zone'), 'id < 90000 and not high confidence')); continue
    low = (x.get('races') or 0) & 0xFFFFFFFF
    st, en, ob = x.get('start') or {}, x.get('end') or {}, x.get('objectives') or {}
    out[x['id']] = {'questId': x['id'], 'name': x['name'], 'questLevel': x.get('level'), 'requiredLevel': x.get('reqLevel'),
        'races': [v for b, v in RACES.items() if low & b] if low else 'all',
        'classes': [v for b, v in CLASSES.items() if (x.get('classes') or 0) & b] or 'all',
        'zoneOrSort': x.get('zone'), 'objectivesText': x.get('objectivesText'), 'xp': x.get('xp'), 'tag': x.get('tag'),
        'startedBy': {'npcs': [npc(i) for i in st.get('npc', [])], 'objects': [obj(i) for i in st.get('object', [])], 'items': [item(i) for i in st.get('item', [])]},
        'finishedBy': [npc(i) for i in en.get('npc', [])] + [obj(i) for i in en.get('object', [])],
        'objectives': {'kill': [npc(c['id']) for c in ob.get('creatures', [])], 'object': [obj(c['id']) for c in ob.get('objects', [])], 'item': [item(c['id']) for c in ob.get('items', [])]},
        'preQuestSingle': (x.get('pre') or {}).get('single'), 'preQuestGroup': (x.get('pre') or {}).get('group'), 'nextQuestInChain': x.get('next'), 'exclusiveTo': x.get('exclusiveTo'),
        'forever': True, 'sources': [SRC + '/quests.json'] + a['sources']}
def _scrub(v):
    if isinstance(v, dict): return {k: _scrub(x) for k, x in v.items()}
    if isinstance(v, list): return [_scrub(x) for x in v if not (isinstance(x, int) and x in EXCLUDE)]
    return v
out = _scrub(out)
json.dump({'generatedFrom': 'PR #5 content/questie-db (QuestieDB v1.1.3 Forever), cross-checked by name against WoW Forever web sources',
           'count': len(out), 'quests': dict(sorted(out.items())), 'droppedNotInWebSources': dropped},
          open(os.path.join(os.path.dirname(__file__), '..', 'catalog', 'forever_quests_1_20.json'), 'w'), indent=1)
print('kept', len(out), 'dropped', len(dropped)); [print('  drop', d) for d in dropped]
