"""Convert research/nova/zones/*.json to route schema v2 packs (contracts/route-v2.schema.json, PR #1).

Output: research/nova/v2/<slug>.json.
Usage: python build_v2.py [path/to/route-v2.schema.json]   (validates when jsonschema is available)
"""
import json, os, sys, math, glob
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
OUT = os.path.join(ROOT, 'v2'); os.makedirs(OUT, exist_ok=True)
# dungeon placeholders: tags.dungeonId and dungeon.instanceId (= areaId) come from research/dungeons/dungeons.json
_DJ = json.load(open(os.path.join(ROOT, '..', 'dungeons', 'dungeons.json')))
_DJ = {d['id']: d for d in (_DJ['dungeons'] if isinstance(_DJ, dict) else _DJ)}
INSTANCES = {k: (did, _DJ[did]['name'], _DJ[did]['areaId'], lv) for k, did, lv in
             [('ragefire_chasm', 'ragefire-chasm', [13, 18]), ('wailing_caverns', 'wailing-caverns', [17, 24])]}
ROLES = ('tank', 'healer', 'dps')

def label_for(url):
    if 'wowhead.com/classic/quest=' in url: return 'Wowhead Classic quest ' + url.rsplit('=', 1)[1]
    if 'wowhead.com/classic/npc=' in url: return 'Wowhead Classic NPC ' + url.rsplit('=', 1)[1]
    if 'wowhead.com/classic/item=' in url: return 'Wowhead Classic item ' + url.rsplit('=', 1)[1]
    if 'QuestieDB' in url: return 'QuestieDB Forever data (GPL-3.0)'
    if 'hardcorehelper' in url: return 'Hardcore Helper WoW Forever zone guide'
    if 'wowfdb' in url: return 'WoW Forever DB zone page'
    if 'hackverso' in url: return 'Hackverso WoW Forever leveling table'
    if 'wowforeverguides' in url: return 'WoW Forever Guides: the Barrens'
    return url.split('/')[2]
def srcs(urls):
    seen, out = set(), []
    for u in urls:
        if u and u not in seen: seen.add(u); out.append({'url': u, 'label': label_for(u)})
    return out

def mp(x, y, mapId, zone): return {'mapId': mapId, 'x': x, 'y': y, 'zone': zone, 'exact': True}

def radius(pts, c):
    if not pts: return 3
    r = max(math.hypot(p[0] - c[0], p[1] - c[1]) for p in pts)
    return round(min(max(r, 1.5), 15), 1)

def convert(step, n, slug):
    sv = not step['unverified']
    ssrc = srcs(step['sources'])
    qn = step.get('questName') or ''
    act, actions, pins, text = step['action'], [], [], ''
    npc = step.get('npc')
    if npc and 'x' in npc and npc.get('zoneMapId'):
        actions.append({'type': 'goto', 'at': mp(npc['x'], npc['y'], npc['zoneMapId'], npc['zone'])})
    elif step.get('goto'):
        g = step['goto']; actions.append({'type': 'goto', 'at': mp(g['x'], g['y'], g['zoneMapId'], step['zone'])})
    who = f" from {npc['name']}" if npc and act == 'accept' else (f" to {npc['name']}" if npc and act == 'turnin' else '')
    if act in ('accept', 'turnin'):
        text = f"{'Accept' if act == 'accept' else 'Turn in'} {qn}{who}"
        if step['questId']: actions.append({'type': act, 'questId': step['questId'], 'label': qn})
        else: actions.append({'type': 'other', 'cmd': 'forever-quest', 'args': f'{act}:{qn}'})
    elif act == 'complete':
        text = f"Complete {qn}"
        if step['questId']:
            objs = (step.get('mobs') or []) + (step.get('objectives') or [])
            for i, _ in enumerate(objs or [None]):
                actions.append({'type': 'complete', 'questId': step['questId'], 'objective': i + 1, 'label': qn})
            for m in step.get('mobs') or []:
                if 'x' in m and m.get('zoneMapId'):
                    pins.append({'kind': 'mobArea', 'npcIds': [m['id']], 'name': m['name'], 'mapId': m['zoneMapId'], 'zone': step['zone'],
                                 'center': {'x': m['x'], 'y': m['y']}, 'radius': radius(m.get('samplePoints'), (m['x'], m['y'])),
                                 'sources': srcs([f"https://www.wowhead.com/classic/npc={m['id']}", 'https://github.com/Questie/QuestieDB/blob/master/data/Forever/foreverNpcDB.lua']), 'verified': True})
            for o in step.get('objectives') or []:
                for dsrc in (o.get('droppedBy') or [])[:2]:
                    if 'x' in dsrc and dsrc.get('zoneMapId') == step['zoneMapId']:
                        pins.append({'kind': 'mobArea', 'npcIds': [dsrc['id']], 'name': f"{dsrc['name']} ({o['name']})", 'mapId': dsrc['zoneMapId'], 'zone': dsrc['zone'],
                                     'center': {'x': dsrc['x'], 'y': dsrc['y']}, 'radius': 4,
                                     'sources': srcs([f"https://www.wowhead.com/classic/npc={dsrc['id']}", o.get('source')]), 'verified': True})
                for osrc in (o.get('fromObjects') or [])[:1]:
                    if 'x' in osrc and osrc.get('zoneMapId') == step['zoneMapId']:
                        pins.append({'kind': 'object', 'objectId': osrc['id'], 'name': osrc['name'], 'at': {'mapId': osrc['zoneMapId'], 'zone': osrc['zone'], 'x': osrc['x'], 'y': osrc['y']},
                                     'sources': srcs([f"https://www.wowhead.com/classic/object={osrc['id']}"]), 'verified': True})
                if 'objectId' in o and 'x' in o:
                    pins.append({'kind': 'object', 'objectId': o['objectId'], 'name': o['name'], 'at': {'mapId': o['zoneMapId'], 'zone': step['zone'], 'x': o['x'], 'y': o['y']},
                                 'sources': srcs([f"https://www.wowhead.com/classic/object={o['objectId']}"]), 'verified': True})
            # move first mob/drop/object location into a goto
            if pins and not actions[0]['type'] == 'goto':
                p = pins[0]; c = p.get('center') or {'x': p['at']['x'], 'y': p['at']['y']}
                actions.insert(0, {'type': 'goto', 'at': mp(c['x'], c['y'], p.get('mapId') or p['at']['mapId'], step['zone'])})
        else:
            actions.append({'type': 'other', 'cmd': 'forever-quest', 'args': f'complete:{qn}'})
    elif act == 'fp': text = f"Get the flight path from {npc['name']}" if npc else 'Get the flight path'; actions.append({'type': 'fp', 'label': text})
    elif act == 'sethearth': text = f"Set your hearthstone at {npc['name']}" if npc else 'Set your hearthstone'; actions.append({'type': 'home', 'label': text})
    elif act == 'hearth': text = 'Use your hearthstone'; actions.append({'type': 'hs', 'label': text})
    elif act == 'train': text = 'Visit your class trainer'; actions.append({'type': 'trainer', 'label': text})
    elif act == 'vendor': text = f"Visit {npc['name']}" if npc else 'Visit vendor'; actions.append({'type': 'vendor', 'label': text})
    elif act == 'goto': text = (step['tips'].get('general') or 'Travel').split('.')[0]
    if npc and npc.get('id') and 'x' in npc and act in ('fp', 'sethearth', 'vendor'):
        pins.append({'kind': 'npc', 'npcId': npc['id'], 'name': npc['name'], 'at': {'mapId': npc['zoneMapId'], 'zone': npc['zone'], 'x': npc['x'], 'y': npc['y']},
                     'service': {'fp': 'flightPath', 'sethearth': 'innkeeper', 'vendor': 'vendor'}[act], 'sources': srcs([f"https://www.wowhead.com/classic/npc={npc['id']}"]), 'verified': True})
    tips = []
    t = step['tips']
    routes = ['balanced', 'speedrun'] if step['route'] == 'both' else [step['route']]
    tipv = sv
    if t.get('general'): tips.append({'kind': 'general', 'text': t['general'], 'sources': ssrc, 'verified': tipv})
    if t.get('speed'): tips.append({'kind': 'speed', 'text': t['speed'], 'routes': ['speedrun'], 'sources': ssrc, 'verified': tipv})
    ei = step.get('eliteInfo')
    if ei:
        et = [{'kind': 'elite', 'text': t[r], 'roles': [r], 'sources': ssrc, 'verified': False} for r in ROLES if t.get(r)]
        el = {'name': ei['name'], 'tips': et, 'sources': ssrc, 'verified': False}
        for k2 in ('level', 'groupSize', 'npcId'):
            if ei.get(k2): el[k2] = ei[k2]
        step['elite'] = [el]
    else:
        for r in ROLES:
            if t.get(r): tips.append({'kind': 'general', 'text': t[r], 'roles': [r], 'sources': ssrc, 'verified': tipv})
    for cls, txt in (t.get('class') or {}).items():
        tips.append({'kind': 'general', 'text': txt, 'classes': [cls], 'sources': ssrc, 'verified': tipv})
    for pt in step.get('profTips') or []:
        tips.append({'kind': 'profession', 'text': pt['text'], 'sources': srcs(pt['sources']), 'verified': pt['verified']})
    hooks = []
    for h in step.get('professionHooks') or []:
        prof = h['profession']
        if prof not in ('Alchemy', 'Blacksmithing', 'Enchanting', 'Engineering', 'Herbalism', 'Leatherworking', 'Mining', 'Skinning', 'Tailoring', 'Cooking', 'First Aid', 'Fishing'):
            tips.append({'kind': 'profession', 'text': h['text'], 'sources': srcs(h['sources']), 'verified': False}); continue
        hk = {'profession': prof, 'note': h['text'], 'sources': srcs(h['sources']), 'verified': not h.get('unverifiedParts')}
        if h.get('keepItemId'): hk['itemId'] = h['keepItemId']
        if h.get('keep'): hk['itemName'] = h['keep']
        v = h.get('vendor')
        if v: hk['npc'] = {'id': v['id'], 'name': v['name'], 'zone': v['zone'], 'x': v['x'], 'y': v['y'], 'mapId': v['zoneMapId']}
        hooks.append(hk)
    out = {'id': f'{slug}:{n:03d}', 'n': n, 'tags': {}, 'text': [{'segments': [{'t': text or qn or act}]}], 'actions': actions, 'conditions': [],
           'routes': routes, 'sources': ssrc or srcs(['https://github.com/Questie/QuestieDB/tree/master/data/Forever']), 'verified': sv}
    if step.get('forever'): out['tags']['label'] = 'New in Forever'
    races = step.get('races')
    if races and races != 'all':
        out['filter'] = {'any': [[{'race': r}] for r in races]}
    if step.get('classes') and step['classes'] != 'all': out['classes'] = step['classes']
    if step.get('dungeon'):
        did, nm, iid, lv = INSTANCES[step['dungeon']]; out['dungeon'] = {'name': nm, 'instanceId': iid, 'levels': lv}
        out['tags']['dungeonId'] = did; out['tags']['dungeonIdSource'] = 'research/dungeons/dungeons.json dungeons[].id'
        if step.get('noDungeonAlt'): tips.append({'kind': 'general', 'text': 'Dungeons off: ' + step['noDungeonAlt'], 'dungeons': False, 'sources': ssrc, 'verified': sv})
    if tips: out['tips'] = tips
    if hooks: out['professionHooks'] = hooks
    if pins: out['pins'] = pins
    if step.get('elite'): out['elite'] = step['elite']
    return out

def add_off_steps(steps):
    """After each dungeon placeholder insert its dungeons-off alternative, id '<placeholder id>:off'.
    Existing ids are kept (they were numbered before the insert); only 'n' is renumbered."""
    out = []
    for st in steps:
        out.append(st)
        if st.get('dungeon') and st['tags'].get('dungeonId'):
            nm = st['dungeon']['name']
            off = {'id': st['id'] + ':off', 'n': 0, 'tags': {}, 'text': [{'segments': [{'t': f'Dungeons off: skip {nm}'}]},
                   {'segments': [{'t': 'Stay on the open-world line; the zone quests around this step reach the next level band without the dungeon.'}]}],
                   'actions': [], 'conditions': [], 'routes': list(st['routes']), 'dungeonsOff': True, 'alternativeTo': [st['id']],
                   'minutes': 1, 'sources': st['sources'], 'verified': st['verified']}
            if st.get('filter'): off['filter'] = st['filter']
            if st.get('classes'): off['classes'] = st['classes']
            out.append(off)
    for i, st in enumerate(out): st['n'] = i + 1
    return out

def pack(pid, title, levels, steps, nxt=None):
    doc = {'schema': 'project-forever/route', 'version': 2, 'id': pid, 'title': title, 'levels': levels, 'steps': steps}
    # A single guide slug survives a rebuild. Prose handoff notes are not a `next` link.
    if isinstance(nxt, str) and nxt and ' ' not in nxt and '/' not in nxt:
        doc['next'] = nxt
    return doc

SENT = json.load(open(os.path.join(ROOT, '..', 'professions', 'profession_hooks.json')))  # single source: research/professions/

def merge_sentinel(steps, zone, lv):
    used = 0
    for h in SENT:
        if h['zone'] != zone: continue
        lo, hi = (int(x) for x in h['levels'].split('-'))
        if hi < lv[0] or lo > lv[1]: continue
        ph = dict(h['professionHook'])
        npc = ph.get('npc')
        if npc and not isinstance(npc.get('id'), int): ph.pop('npc')
        ids = {h.get('mobId')} | {m.get('mob_id') for m in h.get('otherMobs') or []}
        target = None
        for st in steps:
            pinned = {i for p in st.get('pins', []) for i in p.get('npcIds', [])}
            if pinned & ids: target = st; break
        if target is None:
            for st in steps:
                if st['n'] and st.get('_lv', [0])[0] >= lo: target = st; break
        if target is None: continue
        hk = target.setdefault('professionHooks', [])
        hk[:] = [x for x in hk if not (ph.get('itemId') and x.get('itemId') == ph.get('itemId'))]
        hk.append(ph); used += 1
        if ph.get('itemId'):
            for st in steps:
                if st is target: continue
                if st.get('professionHooks'):
                    st['professionHooks'] = [x for x in st['professionHooks'] if x.get('itemId') != ph['itemId']]
                    if not st['professionHooks']: st.pop('professionHooks')
    return used

packs = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'zones', '*.json'))):
    z = json.load(open(f))
    steps = [convert(s, i + 1, z['slug']) for i, s in enumerate(z['steps'])]
    for st, src in zip(steps, z['steps']): st['_lv'] = src['levelRange']
    print(z['slug'], 'sentinel hooks merged:', merge_sentinel(steps, z['zone'], z['levelRange']))
    for st in steps: st.pop('_lv', None)
    steps = add_off_steps(steps)
    packs[z['slug']] = pack(z['slug'], f"{z['zone']} {z['levelRange'][0]}-{z['levelRange'][1]} (Horde)", z['levelRange'], steps, z.get('next'))
for k, p in packs.items():
    json.dump(p, open(os.path.join(OUT, k + '.json'), 'w'), indent=1, ensure_ascii=False)
# snap coordinates to the QuestieDB v1.1.3 Forever release (PR #5); see check_coords.py
import subprocess
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'check_coords.py'), '--fix'] + (['--db', os.environ['QDB']] if os.environ.get('QDB') else []), check=True)
for k in packs: packs[k] = json.load(open(os.path.join(OUT, k + '.json')))
if len(sys.argv) > 1:
    import jsonschema
    schema = json.load(open(sys.argv[1]))
    v = jsonschema.Draft202012Validator(schema)
    bad = 0
    for k, p in packs.items():
        errs = list(v.iter_errors(p))
        bad += len(errs)
        print(k, len(p['steps']), 'steps', 'OK' if not errs else f'{len(errs)} errors')
        for e in errs[:5]: print('  ', list(e.absolute_path), e.message[:200])
    sys.exit(1 if bad else 0)
