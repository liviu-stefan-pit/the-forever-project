"""Turn route_spec.py (our hand-written route) into research/nova/zones/*.json.

Every questId is checked against catalog/quests_horde_1_24.json (QuestieDB Forever);
NPC + mob coordinates come from that catalog, never typed by hand. Forever-only quests
(not in QuestieDB yet) carry questId null and unverified: true with the page that names them.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from route_spec import ZONES_SPEC, HOOKS, FOREVER_SRC
HERE = os.path.dirname(os.path.abspath(__file__))
CAT = json.load(open(os.path.join(HERE, '..', 'catalog', 'quests_horde_1_24.json')))['quests']
FCAT = json.load(open(os.path.join(HERE, '..', 'catalog', 'forever_quests_1_20.json')))['quests']
FNAME = {}
for _q in FCAT.values(): FNAME.setdefault(_q['name'].lower(), []).append(_q['questId'])
NPCS = json.load(open(os.path.join(HERE, '..', 'catalog', 'npcs_named.json')))

def pick_spawn(ent, zone_hint):
    sp = ent.get('spawns') or []
    for s in sp:
        if s['zone'] == zone_hint: return s
    return sp[0] if sp else None

def npc_ref(ent, zone_hint):
    s = pick_spawn(ent, zone_hint)
    r = {'id': ent['id'], 'name': ent['name']}
    if s: r.update({'x': s['center'][0], 'y': s['center'][1], 'zone': s['zone'], 'zoneMapId': s['mapId']})
    else: r['unverified'] = True
    return r

def mobs_of(q, zone_hint):
    out = []
    for m in q['objectives']['kill']:
        s = pick_spawn(m, zone_hint)
        out.append({'id': m['id'], 'name': m['name'], 'level': m.get('level'), 'elite': (m.get('rank') or 0) in (1, 2),
                    **({'x': s['center'][0], 'y': s['center'][1], 'zoneMapId': s['mapId'], 'spawnCount': s['count'], 'samplePoints': s['points']} if s else {'unverified': True})})
    return out

def items_of(q, zone_hint):
    out = []
    for it in q['objectives']['item']:
        out.append({'id': it['id'], 'name': it['name'], 'droppedBy': it['droppedBy'], 'fromObjects': it['fromObjects'], 'source': it['source']})
    for o in q['objectives']['object']:
        s = pick_spawn(o, zone_hint)
        out.append({'objectId': o['id'], 'name': o['name'], **({'x': s['center'][0], 'y': s['center'][1], 'zoneMapId': s['mapId'], 'spawnCount': s['count']} if s else {})})
    return out

errors = []
def build_step(zone, i, st):
    route, action, qid = st[0], st[1], st[2]
    kw = st[3] if len(st) > 3 else {}
    step = {'id': f"{zone['slug']}-{i:03d}", 'route': route, 'levelRange': kw.get('lvl', zone['levelRange']), 'zone': zone['zone'],
            'zoneMapId': zone['mapId'], 'action': action, 'questId': None, 'questName': kw.get('name'), 'npc': None, 'mobs': [],
            'objectives': [], 'races': kw.get('races', 'all'), 'classes': kw.get('classes', 'all'),
            'eliteInfo': kw.get('elite'), 'profTips': kw.get('ptips', []), 'tips': {'speed': kw.get('speed'), 'general': kw.get('tip'), 'tank': kw.get('tank'), 'healer': kw.get('healer'), 'dps': kw.get('dps'), 'class': kw.get('cls', {})},
            'dungeon': kw.get('dungeon'), 'noDungeonAlt': kw.get('noDungeonAlt'), 'forever': kw.get('forever', False),
            'professionHooks': [HOOKS[h] for h in kw.get('hooks', [])], 'sources': [], 'unverified': False}
    if qid is None and kw.get('name') and len(FNAME.get(kw['name'].lower(), [])) == 1:
        qid = FNAME[kw['name'].lower()][0]
    if qid is not None:
        q = CAT.get(str(qid))
        if not q and str(qid) in FCAT:
            q = FCAT[str(qid)]; step['forever'] = True
        if not q:
            errors.append(f'{zone["slug"]}#{i}: quest {qid} not in catalog'); step['unverified'] = True
        else:
            if kw.get('name') and kw['name'].lower() != q['name'].lower():
                errors.append(f'{zone["slug"]}#{i}: name mismatch {qid} {kw["name"]!r} vs {q["name"]!r}')
            step['questId'] = qid; step['questName'] = q['name']; step['questLevel'] = q['questLevel']
            step['requiredLevel'] = q['requiredLevel']; step['objectiveText'] = (q['objectivesText'] or [None])[0]
            if q['races'] != 'all' and step['races'] == 'all' and len(q['races']) < 4: step['races'] = q['races']
            if q['classes'] != 'all' and step['classes'] == 'all': step['classes'] = q['classes']
            step['sources'] += q['sources']
            if action == 'accept':
                src = q['startedBy']['npcs'] or q['startedBy']['objects']
                if src: step['npc'] = npc_ref(src[0], zone['zone'])
                elif q['startedBy']['items']: step['startItem'] = q['startedBy']['items'][0]
            elif action == 'turnin':
                if q['finishedBy']: step['npc'] = npc_ref(q['finishedBy'][0], zone['zone'])
            else:
                step['mobs'] = mobs_of(q, zone['zone']); step['objectives'] = items_of(q, zone['zone'])
        if step['forever']: step['unverified'] = True
    else:
        step['unverified'] = kw.get('unverified', True) if action not in ('goto', 'fly', 'hearth', 'train', 'vendor', 'note', 'sethearth') else False
    if 'npcName' in kw and not (step['npc'] and 'x' in step['npc']):
        n = NPCS.get(kw['npcName'])
        if n:
            s = n['spawns'][0] if n['spawns'] else None
            step['npc'] = {'id': n['id'], 'name': kw['npcName'], **({'x': s['center'][0], 'y': s['center'][1], 'zone': s['zone'], 'zoneMapId': s['mapId']} if s else {})}
            step['sources'].append(n['source'])
        else:
            step['npc'] = {'id': None, 'name': kw['npcName'], 'unverified': True}
    if 'npc' in kw:
        step['npc'] = kw['npc']; step['sources'] += kw.get('npcSrc', [])
    if 'at' in kw:
        step['goto'] = {'x': kw['at'][0], 'y': kw['at'][1], 'zoneMapId': zone['mapId']}
    if kw.get('forever'):
        step['sources'] += kw.get('src', FOREVER_SRC.get(zone['zone'], []))
    step['sources'] += kw.get('extraSrc', [])
    if kw.get('also'): step['alsoQuestIds'] = kw['also']
    for k in ('tank', 'healer', 'dps'):
        pass
    step['tips'] = {k: v for k, v in step['tips'].items() if v}
    return step

os.makedirs(os.path.join(HERE, '..', 'zones'), exist_ok=True)
summary = {}
for zone in ZONES_SPEC:
    steps = [build_step(zone, i + 1, st) for i, st in enumerate(zone['steps'])]
    doc = {'slug': zone['slug'], 'zone': zone['zone'], 'zoneMapId': zone['mapId'], 'levelRange': zone['levelRange'],
           'races': zone.get('races', 'all'), 'next': zone.get('next'), 'summary': zone.get('summary'), 'steps': steps}
    json.dump(doc, open(os.path.join(HERE, '..', 'zones', zone['slug'] + '.json'), 'w'), indent=1, ensure_ascii=False)
    summary[zone['slug']] = {r: sum(1 for s in steps if s['route'] in (r, 'both')) for r in ('balanced', 'speedrun')}
    summary[zone['slug']]['unverified'] = sum(1 for s in steps if s['unverified'])
print(json.dumps(summary, indent=1))
if errors:
    print('\n'.join(errors)); sys.exit(1)
