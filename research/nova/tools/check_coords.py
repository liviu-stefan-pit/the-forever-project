"""Compare every coordinate in research/nova/v2/*.json with the QuestieDB v1.1.3 Forever release
(content/questie-db, merged from PR #5). Flags any NPC / mob / object / goto coordinate more than 2 map points away
from the nearest Forever spawn of the same entity on the same map. With --fix, rewrites the packs.

Usage: python3 check_coords.py [--db DIR] [--fix]
DIR defaults to content/questie-db on main (QuestieDB v1.1.3 Forever, merged in #5)."""
import json, glob, os, sys, math, re, subprocess, statistics
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
REPO = os.path.abspath(os.path.join(ROOT, '..', '..'))
LIMIT = 2.0
DBSRC = 'https://github.com/liviu-stefan-pit/project-forever/tree/main/content/questie-db'

def load(name, db):
    p = os.path.join(db, name + '.json') if db else None
    if p and os.path.exists(p): return json.load(open(p))
    out = subprocess.run(['git', '-C', REPO, 'show', f'origin/main:content/questie-db/{name}.json'], capture_output=True, check=True).stdout
    return json.loads(out)

args = sys.argv[1:]
db = args[args.index('--db') + 1] if '--db' in args else os.path.join(REPO, 'content', 'questie-db')
FIX = '--fix' in args
Z = load('zones', db); N = load('npcs', db); O = load('objects', db); Q = load('quests', db)
Q = Q.get('quests', Q)

def ui(area):
    z = Z.get(str(area)) or {}
    while z and not z.get('uiMapId') and z.get('parent'): z = Z.get(str(z['parent'])) or {}
    return z.get('uiMapId')

def pts(ent, mapid):
    res = []
    for area, ps in ((ent or {}).get('spawns') or {}).items():
        if ui(area) == mapid: res += [p for p in ps if p and p[0] is not None and p[0] >= 0]
    return res

def nearest(ps, x, y):
    return min(((math.hypot(p[0] - x, p[1] - y), p) for p in ps), default=(None, None))

def area_center(ps, near):
    cl = [p for p in ps if math.hypot(p[0] - near[0], p[1] - near[1]) <= 10] or ps
    return [round(statistics.median(p[0] for p in cl), 1), round(statistics.median(p[1] for p in cl), 1)]

flags, missing, checked = [], [], 0
def check(where, ent, mapid, xy, area=False):
    global checked
    ps = pts(ent, mapid)
    if not ps: missing.append(where); return None
    checked += 1
    if area:  # a mob area centre is the median of the mob's spawns on that map (same rule as extract_catalog.py)
        new = [round(statistics.median(q[0] for q in ps), 1), round(statistics.median(q[1] for q in ps), 1)]
        d = math.hypot(new[0] - xy[0], new[1] - xy[1])
    else:
        d, p = nearest(ps, *xy); new = [round(p[0], 1), round(p[1], 1)]
    if d > LIMIT:
        flags.append((where, xy, new, round(d, 1)))
        return new
    return None

def ent_for(kind, i): return (N if kind == 'npc' else O).get(str(i))

for f in sorted(glob.glob(os.path.join(ROOT, 'v2', '*.json'))):
    pack = json.load(open(f)); slug = os.path.basename(f)[:-5]; changed = False
    for s in pack['steps']:
        gotos = [a for a in s['actions'] if a['type'] == 'goto']
        g = gotos[0]['at'] if gotos else None
        gold = (g['x'], g['y']) if g else None
        gnew = None
        for p in s.get('pins') or []:
            if p['kind'] == 'mobArea':
                c = p['center']; old = (c['x'], c['y']); new = None
                for nid in p['npcIds']:
                    new = check(f"{s['id']} mobArea {p['name']}", ent_for('npc', nid), p['mapId'], old, area=True)
                    break
                if new:
                    c['x'], c['y'] = new; changed = True
                    if gold == old: gnew = new
            elif p['kind'] in ('npc', 'object'):
                i = p.get('npcId') if p['kind'] == 'npc' else p.get('objectId')
                if not isinstance(i, int): continue
                a = p['at']; old = (a['x'], a['y'])
                new = check(f"{s['id']} {p['kind']} {p['name']}", ent_for(p['kind'], i), a['mapId'], old)
                if new:
                    a['x'], a['y'] = new; changed = True
                    if gold == old: gnew = new
        if g and gnew is None:
            ent = None
            for a in s['actions']:
                q = Q.get(str(a.get('questId'))) if a.get('questId') else None
                if q and a['type'] in ('accept', 'turnin'):
                    se = q.get('start' if a['type'] == 'accept' else 'end') or {}
                    if se.get('npc'): ent = ent_for('npc', se['npc'][0])
                    elif se.get('obj'): ent = ent_for('obj', se['obj'][0])
                    elif se.get('object'): ent = ent_for('obj', se['object'][0])
                    break
            if ent is None and not s.get('pins'):
                m = [re.search(r'/npc=(\d+)', x['url']) for x in s.get('sources', [])]
                m = [x for x in m if x]
                if m and any(a['type'] in ('fp', 'trainer', 'vendor', 'home') for a in s['actions']): ent = ent_for('npc', m[0].group(1))
            if ent is not None:
                gnew = check(f"{s['id']} goto ({ent.get('name')})", ent, g['mapId'], gold)
        if g and gnew:
            g['x'], g['y'] = gnew; changed = True
        for h in s.get('professionHooks') or []:
            n = h.get('npc') or {}
            if isinstance(n.get('id'), int) and n.get('x') is not None and n.get('mapId'):
                new = check(f"{s['id']} hook npc {n.get('name')}", ent_for('npc', n['id']), n['mapId'], (n['x'], n['y']))
                if new: n['x'], n['y'] = new; changed = True
    if FIX and changed:
        json.dump(pack, open(f, 'w'), indent=1, ensure_ascii=False)

print(f'checked {checked} coordinates against PR #5 v1.1.3 Forever data; >{LIMIT} pt deltas: {len(flags)}; no Forever spawn on that map: {len(missing)}')
for w, old, new, d in flags: print(f'  {"FIXED" if FIX else "FLAG"} {w}: {old} -> {new} (delta {d})')
if missing: print('  no spawn on map (not checked):', ', '.join(missing[:40]) + (' ...' if len(missing) > 40 else ''))
sys.exit(0 if (FIX or not flags) else 1)
