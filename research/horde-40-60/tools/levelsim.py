# Simple level model for the 40-60 route (Orion). Documented in README "Level model".
import re
from db import P5Q, Q
# Classic Era XP needed to go from level L to L+1 (WoW Forever has not published a different table).
XPN={1:400,2:900,3:1400,4:2100,5:2800,6:3600,7:4500,8:5400,9:6500,10:7600,11:8800,12:10100,13:11400,14:12900,15:14400,16:16000,17:17700,18:19400,19:21300,20:23200,
21:25200,22:27300,23:29400,24:31700,25:34000,26:36400,27:38900,28:41400,29:44300,30:47400,31:50800,32:54500,33:58600,34:62800,35:67100,36:71600,37:76100,38:80800,39:85700,40:90700,
41:95800,42:101000,43:106300,44:111800,45:117500,46:123200,47:129100,48:135100,49:141200,50:147500,51:153900,52:160400,53:167100,54:173900,55:180800,56:187900,57:195000,58:202300,59:209800}
def quest_xp(qid, plevel):
    q=P5Q.get(str(qid)) or {}
    xp=q.get('xp')
    ql=q.get('level') or (Q.get(qid) or [None]*5)[4] or int(plevel)
    if xp is None: xp=int(ql*75)   # rough fallback when the import has no xp value
    d=int(plevel)-ql
    f=1.0 if d<=5 else {6:0.8,7:0.6,8:0.4,9:0.2}.get(d,0.1)
    return xp*f
def mob_xp(plevel, mlevel=None):
    L=int(plevel); m=mlevel if mlevel is not None else L
    base=L*5+45
    if m>=L: return base*(1+0.05*min(m-L,4))
    gray=5 if L<40 else (L//10+5)   # Classic gray-level window approximation
    if L-m>=gray: return 0
    return base*(1-(L-m)/(gray+5))
INCIDENTAL=4      # mobs killed on the way for every objective step
DROP=1.5          # kills per collected item
def kills_for(step):
    if step.get('type') not in ('kill','collect','complete') or not step.get('questId'): return 0
    txt=" ".join(step.get('objectivesText') or [])
    nums=[int(n) for n in re.findall(r'\b(\d{1,2})\b', txt)]
    n=sum(nums) if nums else 6
    if step.get('type')=='collect' or re.search(r'(?i)\b(bring|collect|gather|retrieve|recover|obtain)\b', txt): n*=DROP
    return min(n,40)+INCIDENTAL
class Player:
    def __init__(self, level): self.L=int(level); self.x=(level-int(level))*XPN[int(level)]
    @property
    def level(self): return 60.0 if self.L>=60 else self.L+self.x/XPN[self.L]
    def add(self, xp):
        while xp>0 and self.L<60:
            need=XPN[self.L]-self.x
            if xp>=need: xp-=need; self.L+=1; self.x=0
            else: self.x+=xp; xp=0
def step_xp(step, p):
    xp=0
    if step.get('type')=='turnin' and step.get('questId'): xp+=quest_xp(step['questId'], p.level)
    k=kills_for(step)
    if k: xp+=k*mob_xp(p.level, step.get('questLevel'))
    if step.get('grindXp'): xp+=step['grindXp']
    return xp
