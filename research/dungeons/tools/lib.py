import json
def L(fn): return {int(k[1:]):v for k,v in json.load(open(fn)).items()}
def g(e,i):
    if e is None: return None
    if isinstance(e,list): return e[i-1] if i-1<len(e) else None
    return e.get(str(i))
Q=L('my_quest.json');N=L('my_npc.json');O=L('my_object.json');I=L('my_item.json');XP=L('my_xp.json')
def spawns(npc):
    s=g(N.get(npc),7)
    if not s: return {}
    if isinstance(s,list): return {i+1:v for i,v in enumerate(s) if v}
    return {int(k):v for k,v in s.items()}
FN=L('fv_npc.json'); FO=L('fv_object.json')
def _sp(e):
    s=g(e,7)
    if not s: return {}
    if isinstance(s,list): return {i+1:v for i,v in enumerate(s) if v}
    return {int(k):v for k,v in s.items()}
def fspawns(npc): return _sp(FN.get(npc))
