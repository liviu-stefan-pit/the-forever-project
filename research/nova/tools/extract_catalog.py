"""Build a sourced quest catalog for Horde 1-20 zones from QuestieDB `data/Forever`.

Input: forever.json, made by dump.lua from the four QuestieDB Forever Lua files
(https://github.com/Questie/QuestieDB/tree/master/data/Forever, GPL-3.0 project).
QuestieDB notes the Forever data is a converted Era baseline: IDs and positions are
Classic Era ones with Forever map transforms (Mulgore was rescaled). New Forever
quests are NOT in it.
"""
import json, sys, statistics
src = sys.argv[1]; out = sys.argv[2]
d = json.load(open(src))
def acc(db):
    keys = d[db]['keys']
    def g(row, k):
        i = keys[k] - 1
        return row[i] if i < len(row) else None
    return g
gq, gn, go, gi = acc('quest'), acc('npc'), acc('object'), acc('item')
Q, N, O, I = (d[k]['rows'] for k in ('quest', 'npc', 'object', 'item'))
ZONES = {14: ('Durotar', 1411), 215: ('Mulgore', 1412), 85: ('Tirisfal Glades', 1420),
         17: ('The Barrens', 1413), 130: ('Silverpine Forest', 1421), 1637: ('Orgrimmar', 1454),
         1638: ('Thunder Bluff', 1456), 1497: ('Undercity', 1458), 406: ('Stonetalon Mountains', 1442),
         331: ('Ashenvale', 1440), 215: ('Mulgore', 1412)}
HORDE = 2 | 16 | 32 | 128
RACES = {2: 'Orc', 16: 'Undead', 32: 'Tauren', 128: 'Troll'}
CLASSES = {1: 'Warrior', 2: 'Paladin', 4: 'Hunter', 8: 'Rogue', 16: 'Priest', 64: 'Shaman', 128: 'Mage', 256: 'Warlock', 1024: 'Druid'}

def spawns(sp, limit=None):
    res = []
    if isinstance(sp, list): sp = {i + 1: v for i, v in enumerate(sp) if v}
    for z, pts in (sp or {}).items():
        z = int(z)
        if z not in ZONES or not pts: continue
        pts = [p for p in pts if p and len(p) >= 2 and p[0] is not None and p[0] >= 0]
        if not pts: continue
        cx = round(statistics.median(p[0] for p in pts), 1); cy = round(statistics.median(p[1] for p in pts), 1)
        res.append({'zone': ZONES[z][0], 'mapId': ZONES[z][1], 'areaId': z, 'center': [cx, cy], 'count': len(pts),
                    'points': [[round(p[0], 1), round(p[1], 1)] for p in pts[: (limit or 6)]]})
    res.sort(key=lambda r: -r['count'])
    return res

def npc(nid):
    r = N.get(str(nid))
    if not r: return {'id': nid, 'name': None, 'unverified': True}
    return {'id': nid, 'name': gn(r, 'name'), 'level': [gn(r, 'minLevel'), gn(r, 'maxLevel')],
            'rank': gn(r, 'rank'), 'spawns': spawns(gn(r, 'spawns')),
            'source': f'https://www.wowhead.com/classic/npc={nid}'}

def obj(oid):
    r = O.get(str(oid))
    if not r: return {'id': oid, 'name': None}
    return {'id': oid, 'name': r[0], 'spawns': spawns(go(r, 'spawns')), 'source': f'https://www.wowhead.com/classic/object={oid}'}

def item(iid):
    r = I.get(str(iid))
    if not r: return {'id': iid, 'name': None}
    drops = gi(r, 'npcDrops') or []
    objs = gi(r, 'objectDrops') or []
    def nsp(n):
        rr = N.get(str(n)); sp = spawns(gn(rr, 'spawns'), limit=4) if rr else []
        return {'id': n, 'name': rr[0] if rr else None, **({'zone': sp[0]['zone'], 'x': sp[0]['center'][0], 'y': sp[0]['center'][1], 'zoneMapId': sp[0]['mapId'], 'spawnCount': sp[0]['count']} if sp else {})}
    def osp(o):
        rr = O.get(str(o)); sp = spawns(go(rr, 'spawns'), limit=4) if rr else []
        return {'id': o, 'name': rr[0] if rr else None, **({'zone': sp[0]['zone'], 'x': sp[0]['center'][0], 'y': sp[0]['center'][1], 'zoneMapId': sp[0]['mapId'], 'spawnCount': sp[0]['count'], 'samplePoints': sp[0]['points']} if sp else {})}
    dr = [nsp(n) for n in drops]
    dr = sorted([x for x in dr if 'x' in x], key=lambda x: -x['spawnCount'])[:6] + [x for x in dr if 'x' not in x][:2]
    ob = [osp(o) for o in objs]
    ob = sorted([x for x in ob if 'x' in x], key=lambda x: -x['spawnCount'])[:4]
    return {'id': iid, 'name': r[0], 'droppedBy': dr, 'fromObjects': ob,
            'source': f'https://www.wowhead.com/classic/item={iid}'}

def bits(mask, table):
    return [v for k, v in table.items() if mask and mask & k]

cat = {}
for qid, r in Q.items():
    races = gq(r, 'requiredRaces') or 0
    low = races & 0xFFFFFFFF
    if low and not (low & HORDE): continue
    lvl = gq(r, 'questLevel') or 0
    if lvl > 24 or lvl < 0: continue
    sb = gq(r, 'startedBy') or []; fb = gq(r, 'finishedBy') or []
    starters = [npc(n) for n in (sb[0] if len(sb) > 0 and sb[0] else [])]
    sobj = [obj(o) for o in (sb[1] if len(sb) > 1 and sb[1] else [])]
    sitem = [item(i) for i in (sb[2] if len(sb) > 2 and sb[2] else [])]
    enders = [npc(n) for n in (fb[0] if len(fb) > 0 and fb[0] else [])]
    zones = {s['zone'] for x in starters + enders + sobj for s in x.get('spawns', [])}
    zs = gq(r, 'zoneOrSort')
    if not (zones & {v[0] for v in ZONES.values()}) and zs not in ZONES: continue
    ob = gq(r, 'objectives') or []
    objectives = {'kill': [], 'object': [], 'item': []}
    if len(ob) > 0 and ob[0]:
        for e in ob[0]:
            if e and e[0]: n = npc(e[0]); n['count_text'] = e[1] if len(e) > 1 else None; objectives['kill'].append(n)
    if len(ob) > 1 and ob[1]:
        for e in ob[1]:
            if e and e[0]: objectives['object'].append(obj(e[0]))
    if len(ob) > 2 and ob[2]:
        for e in ob[2]:
            if e and e[0]: objectives['item'].append(item(e[0]))
    cat[int(qid)] = {
        'questId': int(qid), 'name': r[0], 'requiredLevel': gq(r, 'requiredLevel'), 'questLevel': lvl,
        'races': bits(low, RACES) if low else 'all', 'classes': bits(gq(r, 'requiredClasses') or 0, CLASSES) or 'all',
        'zoneOrSort': ZONES.get(zs, (zs,))[0] if isinstance(zs, int) else zs, 'objectivesText': gq(r, 'objectivesText'),
        'startedBy': {'npcs': starters, 'objects': sobj, 'items': sitem}, 'finishedBy': enders,
        'objectives': objectives, 'preQuestSingle': gq(r, 'preQuestSingle'), 'preQuestGroup': gq(r, 'preQuestGroup'),
        'nextQuestInChain': gq(r, 'nextQuestInChain'), 'exclusiveTo': gq(r, 'exclusiveTo'),
        'sources': [f'https://www.wowhead.com/classic/quest={qid}',
                    'https://github.com/Questie/QuestieDB/blob/master/data/Forever/foreverQuestDB.lua'],
    }
json.dump({'generatedFrom': 'QuestieDB data/Forever (converted Era baseline)', 'count': len(cat),
           'quests': dict(sorted(cat.items()))}, open(out, 'w'), indent=1)
print(len(cat))

# Name -> NPC index for service NPCs (flight masters, innkeepers, trainers, vendors) in these zones.
named = {}
for nid, r in N.items():
    sp = spawns(gn(r, 'spawns'), limit=3)
    if not sp: continue
    nm = gn(r, 'name')
    if nm in named and named[nm]['spawns'][0]['count'] >= sp[0]['count']: continue
    named[nm] = {'id': int(nid), 'subName': gn(r, 'subName'), 'spawns': sp, 'source': f'https://www.wowhead.com/classic/npc={nid}'}
import os
json.dump(dict(sorted(named.items())), open(os.path.join(os.path.dirname(out), 'npcs_named.json'), 'w'), indent=0)
print('named npcs', len(named))
