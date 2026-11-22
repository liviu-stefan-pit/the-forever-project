import json,sys
from levelsim import *
def simulate(steps, route, start, margin, verbose=False):
    p=Player(start); out=[]; viol=[]; prevz=None; tot=0
    for s in steps:
        if route not in s['route']: continue
        if s['zone']!=prevz:
            out.append((s['zone'], round(p.level,2))); prevz=s['zone']
        if s['type']=='accept' and s.get('questLevel') and s['questLevel']>p.level+margin:
            viol.append((s['id'], s['questLevel'], round(p.level,2)))
        x=step_xp(s,p); tot+=x; p.add(x)
    return out, viol, round(p.level,2)
if __name__=="__main__":
    st=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'out/steps.json'))
    from grind import START, MARGIN
    for r,l,m in (('balanced',START['balanced'],MARGIN['balanced']),('speed',START['speed'],MARGIN['speed'])):
        o,v,e=simulate(st,r,l,m); print(r,'end',e,'violations',len(v)); print('  ',o); print('  first viol',v[:8])
